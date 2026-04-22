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

// Custom event types
export type LogiqEventType =
  | "logiq:vehicleClick"
  | "logiq:openReservation"
  | "logiq:priceCalculated"
  | "logiq:bookingCompleted"
  | "logiq:cglAccepted";

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
