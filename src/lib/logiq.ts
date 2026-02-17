import { vehicles, ratePlans, vehicleOptions, EXTRA_KM_RATE, type Vehicle, type RatePlan, type VehicleOption } from "@/data/vehicles";
import { CGL_HASH } from "@/data/cgl-content";

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

export interface LogiqGlobal {
  vehicleList: { id: string; name: string; priceDay: number; specs: Vehicle["specs"]; availability: boolean }[];
  ratePlans: RatePlan[];
  vehicleOptions: VehicleOption[];
  extraKmRate: number;
  bookingDraft: BookingDraft;
  userConsent: UserConsent;
  termsVersion: TermsVersion;
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
