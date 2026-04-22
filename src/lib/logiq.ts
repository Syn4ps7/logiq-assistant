import { vehicles, ratePlans, vehicleOptions, EXTRA_KM_RATE, type Vehicle, type RatePlan, type VehicleOption } from "@/data/vehicles";
import { CGL_HASH } from "@/data/cgl-content";
import { FLEX_PRO_DAILY_HT, FLEX_PRO_KM_PER_DAY, EXTRA_KM_RATE_PRO_HT } from "@/lib/pricing";

/** Default snapshot — Flex Pro is inactive on initial load. */
const DEFAULT_FLEX_PRO_SNAPSHOT: FlexProSnapshot = {
  active: false,
  rateType: null,
  planName: null,
  startDate: null,
  endDate: null,
  startTime: null,
  endTime: null,
  days: null,
  dailyRateHT: FLEX_PRO_DAILY_HT,
  kmIncludedPerDay: FLEX_PRO_KM_PER_DAY,
  totalIncludedKm: null,
  estimatedKm: 0,
  extraKm: null,
  extraKmRateHT: EXTRA_KM_RATE_PRO_HT,
  priceEstimateTTC: null,
  vehicleId: null,
};

// Types for window.LOGIQ
export interface BookingDraft {
  start: string | null;
  end: string | null;
  vehicleId: string | null;
  options: string[];
  estKm: number;
  priceEstimate: number | null;
}

export interface UserConsent {
  cookies: boolean;
  geoTracking: boolean;
}

export interface TermsVersion {
  cglHash: string;
  cglUrl: string;
  accepted: boolean;
  acceptedAt: string | null;
}

/**
 * Chatbot-friendly snapshot of the active Flex Pro reservation.
 * All values are plain primitives so the chatbot can read them
 * without parsing the DOM or React state.
 */
export interface FlexProSnapshot {
  /** True when the user is currently in the B2B Flex daily flow. */
  active: boolean;
  /** Stable rate identifier — "flex-pro" when active, null otherwise. */
  rateType: "flex-pro" | null;
  /** Human-readable plan name. */
  planName: string | null;
  /** ISO date string (YYYY-MM-DD) or null. */
  startDate: string | null;
  /** ISO date string (YYYY-MM-DD) or null. */
  endDate: string | null;
  /** Local time string (HH:mm) or null. */
  startTime: string | null;
  /** Local time string (HH:mm) or null. */
  endTime: string | null;
  /** Number of billable days, null until both dates are set. */
  days: number | null;
  /** Daily HT rate in CHF (constant for Flex Pro). */
  dailyRateHT: number;
  /** Daily mileage quota included in the rate. */
  kmIncludedPerDay: number;
  /** Total km included for the whole rental, null until days known. */
  totalIncludedKm: number | null;
  /** Customer's mileage estimate. */
  estimatedKm: number;
  /** Extra km above the included quota (≥ 0), null until days known. */
  extraKm: number | null;
  /** Per-extra-km rate in CHF HT. */
  extraKmRateHT: number;
  /** Total price estimate in CHF TTC, null until computable. */
  priceEstimateTTC: number | null;
  /** Selected vehicle id, null if none picked yet. */
  vehicleId: string | null;
}

export interface LogiqGlobal {
  vehicleList: { id: string; name: string; priceDay: number; specs: Vehicle["specs"]; availability: boolean }[];
  ratePlans: RatePlan[];
  vehicleOptions: VehicleOption[];
  extraKmRate: number;
  bookingDraft: BookingDraft;
  userConsent: UserConsent;
  termsVersion: TermsVersion;
  /** Live snapshot of the Flex Pro reservation flow (B2B daily). */
  flexPro: FlexProSnapshot;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event payload schema (single source of truth)
// ─────────────────────────────────────────────────────────────────────────────
//
// Every dispatchLogiqEvent() call is statically typed against this map and
// validated at runtime by `dispatchLogiqEvent`. Flex-pro events MUST always
// carry { plan, pack, isFlexPro } so external listeners (chatbot, analytics)
// can branch on a stable, normalized shape — no field is allowed to be
// silently omitted.

/** Identifier of the active rate plan, or null when none is selected. */
export type LogiqPlan = "week" | "weekend" | "pack-48h" | "flex-pro" | null;
/** Optional B2C weekend pack tier. */
export type LogiqPack = "standard" | "confort" | "premium" | null;
/** Optional B2B carnet identifier. */
export type LogiqCarnet = "carnet-10" | "carnet-20" | "carnet-40" | null;
/** Origin of the visit: "pro" comes from the Espace Pro CTAs, "direct" otherwise. */
export type LogiqSource = "direct" | "pro";

/** Discriminator block embedded in *every* reservation-flow event. */
export interface LogiqPlanContext {
  plan: LogiqPlan;
  pack: LogiqPack;
  carnet: LogiqCarnet;
  /** True iff `plan === "flex-pro"`. Always present (never undefined). */
  isFlexPro: boolean;
  source: LogiqSource;
}

export interface LogiqOpenReservationPayload extends LogiqPlanContext {
  prefillVehicleId: string | null;
  /** Date inputs are ISO YYYY-MM-DD; null until set. */
  startDate: string | null;
  endDate: string | null;
}

export interface LogiqVehicleClickPayload extends LogiqPlanContext {
  vehicleId: string;
  vehicleName: string;
}

export interface LogiqPriceBreakdown {
  days: number;
  baseTotal: number;
  includedKm: number;
  optionsCost: number;
  extraKm: number;
  extraKmCost: number;
  total: number;
  planName: string;
  /** Carnet flow only — present when the plan is a B2B Carnet. */
  isCarnet?: boolean;
  carnetHT?: number;
  perDayHT?: number;
}

export interface LogiqPriceCalculatedPayload extends LogiqPlanContext {
  priceBreakdown: LogiqPriceBreakdown;
}

export interface LogiqBookingCompletedPayload extends LogiqPlanContext {
  bookingRef: string;
  amount: number | null;
  currency: "CHF";
  /** ISO datetime (date or `${date}T${time}`); null when missing in DB. */
  start: string | null;
  end: string | null;
  vehicleId: string | null;
  confirmedAt: string;
}

export interface LogiqCglAcceptedPayload {
  cglHash: string;
  /** ISO timestamp of acceptance. */
  timestamp: string;
  /** Always true — emitted only on positive consent. */
  accepted: true;
}

/** Map event names → payload shape. Add new events here, NOT inline. */
export interface LogiqEventMap {
  "logiq:openReservation": LogiqOpenReservationPayload;
  "logiq:vehicleClick": LogiqVehicleClickPayload;
  "logiq:priceCalculated": LogiqPriceCalculatedPayload;
  "logiq:bookingCompleted": LogiqBookingCompletedPayload;
  "logiq:cglAccepted": LogiqCglAcceptedPayload;
}

export type LogiqEventType = keyof LogiqEventMap;

// ─────────────────────────────────────────────────────────────────────────────
// Runtime validation
// ─────────────────────────────────────────────────────────────────────────────
//
// Static types prevent most issues, but runtime checks catch:
//   • payloads built from untyped sources (URL params, DB rows)
//   • drift if a future caller does `dispatchLogiqEvent(... as any)`
//   • the specific class of bug we want to prevent: a flex-pro flow event
//     missing one of { plan, pack, isFlexPro } or with an inconsistent flag.

const PLAN_VALUES = ["week", "weekend", "pack-48h", "flex-pro"] as const;
const PACK_VALUES = ["standard", "confort", "premium"] as const;
const CARNET_VALUES = ["carnet-10", "carnet-20", "carnet-40"] as const;
const SOURCE_VALUES = ["direct", "pro"] as const;

/** Events that carry a LogiqPlanContext block. */
const PLAN_CONTEXT_EVENTS: ReadonlySet<LogiqEventType> = new Set([
  "logiq:openReservation",
  "logiq:vehicleClick",
  "logiq:priceCalculated",
  "logiq:bookingCompleted",
]);

function validatePlanContext(type: LogiqEventType, p: any): string[] {
  const errors: string[] = [];
  const has = (k: string) => Object.prototype.hasOwnProperty.call(p, k);

  // 1. Required fields must be *present* (null is allowed for plan/pack/carnet,
  //    but the key itself must exist — that's the whole point of a schema).
  for (const key of ["plan", "pack", "carnet", "isFlexPro", "source"] as const) {
    if (!has(key)) errors.push(`missing key "${key}"`);
  }

  // 2. Enum membership (when non-null).
  if (p.plan !== null && p.plan !== undefined && !PLAN_VALUES.includes(p.plan)) {
    errors.push(`plan="${p.plan}" not in [${PLAN_VALUES.join("|")}]`);
  }
  if (p.pack !== null && p.pack !== undefined && !PACK_VALUES.includes(p.pack)) {
    errors.push(`pack="${p.pack}" not in [${PACK_VALUES.join("|")}]`);
  }
  if (p.carnet !== null && p.carnet !== undefined && !CARNET_VALUES.includes(p.carnet)) {
    errors.push(`carnet="${p.carnet}" not in [${CARNET_VALUES.join("|")}]`);
  }
  if (p.source !== undefined && !SOURCE_VALUES.includes(p.source)) {
    errors.push(`source="${p.source}" not in [${SOURCE_VALUES.join("|")}]`);
  }

  // 3. Critical invariant: isFlexPro must mirror plan === "flex-pro" exactly.
  if (typeof p.isFlexPro !== "boolean") {
    errors.push(`isFlexPro must be boolean (got ${typeof p.isFlexPro})`);
  } else if (p.isFlexPro !== (p.plan === "flex-pro")) {
    errors.push(
      `isFlexPro=${p.isFlexPro} contradicts plan="${p.plan}" — they must agree`,
    );
  }

  // 4. Flex-pro can never co-exist with a B2C pack or a Carnet.
  if (p.plan === "flex-pro") {
    if (p.pack !== null) errors.push(`flex-pro must have pack=null (got "${p.pack}")`);
    if (p.carnet !== null) errors.push(`flex-pro must have carnet=null (got "${p.carnet}")`);
  }

  return errors;
}

function validatePayload(type: LogiqEventType, payload: any): string[] {
  if (!payload || typeof payload !== "object") {
    return [`payload must be an object, got ${typeof payload}`];
  }
  if (PLAN_CONTEXT_EVENTS.has(type)) {
    return validatePlanContext(type, payload);
  }
  if (type === "logiq:cglAccepted") {
    const errors: string[] = [];
    if (typeof payload.cglHash !== "string" || !payload.cglHash) {
      errors.push("cglHash must be a non-empty string");
    }
    if (typeof payload.timestamp !== "string" || !payload.timestamp) {
      errors.push("timestamp must be a non-empty ISO string");
    }
    if (payload.accepted !== true) {
      errors.push(`accepted must be true (got ${payload.accepted})`);
    }
    return errors;
  }
  return [];
}

// Initialize window.LOGIQ
export function initLogiq(): void {
  const logiq: LogiqGlobal = {
    vehicleList: vehicles.map((v) => ({
      id: v.id,
      name: v.name,
      priceDay: v.priceDay,
      specs: v.specs,
      availability: v.availability,
    })),
    ratePlans,
    vehicleOptions,
    extraKmRate: EXTRA_KM_RATE,
    bookingDraft: {
      start: null,
      end: null,
      vehicleId: null,
      options: [],
      estKm: 0,
      priceEstimate: null,
    },
    userConsent: {
      cookies: false,
      geoTracking: false,
    },
    termsVersion: {
      cglHash: CGL_HASH,
      cglUrl: "/cgl",
      accepted: false,
      acceptedAt: null,
    },
    flexPro: { ...DEFAULT_FLEX_PRO_SNAPSHOT },
  };

  // Freeze to make read-only from external access
  (window as any).LOGIQ = Object.freeze({ ...logiq });
}

// Update a specific property in LOGIQ (internal use)
export function updateLogiq(updates: Partial<LogiqGlobal>): void {
  const current = (window as any).LOGIQ || {};
  (window as any).LOGIQ = Object.freeze({ ...current, ...updates });
}

/**
 * Dispatch a typed LogIQ event with runtime validation.
 *
 * - Static type-check: `payload` must match `LogiqEventMap[T]`.
 * - Runtime check: every reservation-flow event must include a complete
 *   `LogiqPlanContext` block, and `isFlexPro` must agree with `plan`.
 *
 * On invalid payloads the event is **not** dispatched (fail-closed) and an
 * error is logged so the bug surfaces during development. This prevents
 * downstream listeners (chatbot, analytics) from ever seeing a half-formed
 * flex-pro event.
 */
export function dispatchLogiqEvent<T extends LogiqEventType>(
  type: T,
  payload: LogiqEventMap[T],
): void {
  const errors = validatePayload(type, payload);
  if (errors.length > 0) {
    console.error(
      `[LogIQ] Refusing to dispatch "${type}" — invalid payload:\n  • ${errors.join("\n  • ")}`,
      { payload },
    );
    return;
  }
  const event = new CustomEvent(type, {
    detail: payload,
    bubbles: true,
    cancelable: false,
  });
  document.dispatchEvent(event);
}

// Update booking draft
export function updateBookingDraft(draft: Partial<BookingDraft>): void {
  const current = (window as any).LOGIQ?.bookingDraft || {};
  updateLogiq({ bookingDraft: { ...current, ...draft } });
}

// Update consent
export function updateUserConsent(consent: Partial<UserConsent>): void {
  const current = (window as any).LOGIQ?.userConsent || {};
  updateLogiq({ userConsent: { ...current, ...consent } });
}

/**
 * Update the Flex Pro snapshot exposed on `window.LOGIQ.flexPro`.
 * Called by the reservation flow on every relevant state change so
 * the chatbot can read live values without parsing the UI.
 *
 * Pass `{ active: false }` to reset the snapshot to defaults.
 */
export function updateFlexProSnapshot(snapshot: Partial<FlexProSnapshot>): void {
  const current: FlexProSnapshot =
    (window as any).LOGIQ?.flexPro || { ...DEFAULT_FLEX_PRO_SNAPSHOT };

  // Explicit reset path — collapse back to defaults instead of merging stale fields.
  if (snapshot.active === false) {
    updateLogiq({ flexPro: { ...DEFAULT_FLEX_PRO_SNAPSHOT } });
    return;
  }

  updateLogiq({ flexPro: { ...current, ...snapshot } });
}

// Accept CGL
export function acceptCGL(): void {
  const now = new Date().toISOString();
  updateLogiq({
    termsVersion: {
      cglHash: CGL_HASH,
      cglUrl: "/cgl",
      accepted: true,
      acceptedAt: now,
    },
  });
  dispatchLogiqEvent("logiq:cglAccepted", {
    cglHash: CGL_HASH,
    timestamp: now,
  });
}
