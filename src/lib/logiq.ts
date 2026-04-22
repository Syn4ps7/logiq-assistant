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
  /**
   * Stable hash of the vehicle/rate fixtures currently exposed.
   * Lets the chatbot detect bundle-level changes (e.g. after a deploy)
   * without diffing the full lists. Bumps whenever any of
   * `vehicles`, `ratePlans`, `vehicleOptions`, or `extraKmRate` change.
   */
  vehicleDataVersion: string;
  /** ISO timestamp of the last `refreshVehicleData()` run. */
  vehicleDataRefreshedAt: string;
  bookingDraft: BookingDraft;
  userConsent: UserConsent;
  termsVersion: TermsVersion;
  /** Live snapshot of the Flex Pro reservation flow (B2B daily). */
  flexPro: FlexProSnapshot;
}

// Custom event types
export type LogiqEventType =
  | "logiq:vehicleClick"
  | "logiq:openReservation"
  | "logiq:priceCalculated"
  | "logiq:bookingCompleted"
  | "logiq:cglAccepted"
  | "logiq:tamperDetected"
  | "logiq:vehicleDataRefreshed";

/** Payload of `logiq:vehicleDataRefreshed` — fires whenever vehicle/rate
 *  data is (re)published to `window.LOGIQ`. */
export interface VehicleDataRefreshedPayload {
  vehicleDataVersion: string;
  previousVersion: string | null;
  changed: boolean;
  refreshedAt: string;
  trigger: "init" | "focus" | "visibility" | "manual" | "event";
  vehicleCount: number;
  availableCount: number;
}

/**
 * Build a stable, order-insensitive hash of the current vehicle/rate
 * fixtures. Used to power `vehicleDataVersion` so the chatbot can detect
 * bundle-level changes without diffing entire arrays.
 */
function buildVehicleDataVersion(): string {
  const payload = {
    v: vehicles.map((v) => ({
      id: v.id,
      name: v.name,
      priceDay: v.priceDay,
      avail: v.availability,
      // Only spec fields the chatbot exposes — keeps the hash stable across
      // visual-only edits (taglines, image paths, features, etc.).
      specs: v.specs,
    })),
    r: ratePlans,
    o: vehicleOptions,
    k: EXTRA_KM_RATE,
  };
  // Cheap, deterministic 32-bit FNV-1a — no crypto dependency, plenty
  // strong enough to detect any meaningful change.
  const json = JSON.stringify(payload);
  let h = 0x811c9dc5;
  for (let i = 0; i < json.length; i++) {
    h ^= json.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `v1-${(h >>> 0).toString(16)}`;
}

function buildVehicleListSnapshot(): LogiqGlobal["vehicleList"] {
  return vehicles.map((v) => ({
    id: v.id,
    name: v.name,
    priceDay: v.priceDay,
    specs: v.specs,
    availability: v.availability,
  }));
}

// ============================================================================
// Read-only enforcement
// ============================================================================
//
// The chatbot — and any third-party script — must only ever observe a fully
// committed snapshot of LOGIQ. To guarantee this we:
//   1. Deep-freeze every snapshot before publishing it on `window.LOGIQ`.
//   2. Track the last published snapshot in a module-private reference.
//   3. Re-validate on every read path (`updateLogiq`) that the live
//      `window.LOGIQ` is still that exact frozen reference. If something
//      reassigned or mutated it from outside, we restore the canonical
//      snapshot and emit `logiq:tamperDetected` so the chatbot can react.
//   4. Internal writers MUST go through `updateLogiq` — no module touches
//      `(window as any).LOGIQ = ...` directly.

let canonicalSnapshot: Readonly<LogiqGlobal> | null = null;
let tamperWatcherStarted = false;

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  // Freeze children first so freezing the parent locks a fully-immutable graph.
  for (const key of Object.keys(value as object)) {
    deepFreeze((value as Record<string, unknown>)[key]);
  }
  return Object.freeze(value);
}

function publishSnapshot(next: LogiqGlobal): void {
  const frozen = deepFreeze({ ...next }) as Readonly<LogiqGlobal>;
  canonicalSnapshot = frozen;
  (window as any).LOGIQ = frozen;
}

/**
 * Verify that `window.LOGIQ` still points at the canonical frozen snapshot.
 * If anything reassigned or replaced it, restore the canonical reference and
 * dispatch `logiq:tamperDetected` so observers (chatbot, analytics) know the
 * external view was briefly inconsistent.
 */
export function assertLogiqIntegrity(): boolean {
  if (typeof window === "undefined" || !canonicalSnapshot) return true;
  const live = (window as any).LOGIQ;
  if (live === canonicalSnapshot) return true;

  // Restore canonical snapshot atomically.
  (window as any).LOGIQ = canonicalSnapshot;

  try {
    document.dispatchEvent(
      new CustomEvent("logiq:tamperDetected", {
        detail: { restoredAt: new Date().toISOString() },
        bubbles: true,
        cancelable: false,
      }),
    );
  } catch {
    /* no-op: dispatch errors must never break the app */
  }
  return false;
}

function startTamperWatcher(): void {
  if (tamperWatcherStarted || typeof window === "undefined") return;
  tamperWatcherStarted = true;
  // Lightweight heartbeat — verifies integrity ~4×/s without measurable cost.
  // Catches any external `window.LOGIQ = {...}` reassignment between writes.
  window.setInterval(assertLogiqIntegrity, 250);
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

  publishSnapshot(logiq);
  startTamperWatcher();
}

/**
 * Atomically replace `window.LOGIQ` with a new fully-frozen snapshot.
 * This is the **only** sanctioned write path — direct assignment to
 * `window.LOGIQ` from anywhere else will be reverted by the tamper watcher.
 */
export function updateLogiq(updates: Partial<LogiqGlobal>): void {
  // Always read from the canonical snapshot (not `window.LOGIQ`) so a
  // concurrent external mutation can never bleed into the next snapshot.
  const base: LogiqGlobal =
    canonicalSnapshot ?? ((window as any).LOGIQ as LogiqGlobal) ?? ({} as LogiqGlobal);

  // Detect & repair tampering before committing the next state.
  assertLogiqIntegrity();

  publishSnapshot({ ...base, ...updates });
}

// Dispatch custom event
export function dispatchLogiqEvent(type: LogiqEventType, payload: Record<string, any>): void {
  const event = new CustomEvent(type, {
    detail: payload,
    bubbles: true,
    cancelable: false,
  });
  document.dispatchEvent(event);
}

// Update booking draft
export function updateBookingDraft(draft: Partial<BookingDraft>): void {
  const current = canonicalSnapshot?.bookingDraft ?? (window as any).LOGIQ?.bookingDraft ?? {};
  updateLogiq({ bookingDraft: { ...current, ...draft } });
}

// Update consent
export function updateUserConsent(consent: Partial<UserConsent>): void {
  const current = canonicalSnapshot?.userConsent ?? (window as any).LOGIQ?.userConsent ?? {};
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
    canonicalSnapshot?.flexPro ??
    (window as any).LOGIQ?.flexPro ??
    { ...DEFAULT_FLEX_PRO_SNAPSHOT };

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
