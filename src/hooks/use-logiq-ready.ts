import { useEffect, useState } from "react";

/**
 * Result of `useLogiqReady` — describes whether the chatbot can safely
 * read `window.LOGIQ` and why we consider it "ready".
 */
export interface LogiqReadyState {
  /** True once LOGIQ has been hydrated OR the timeout elapsed. */
  ready: boolean;
  /** True when CGL terms have been accepted (current `cglHash`). */
  cglAccepted: boolean;
  /** True when the cookie consent banner has been answered (accepted). */
  cookiesAccepted: boolean;
  /**
   * True when `window.LOGIQ.vehicleDataVersion` exactly matches the most
   * recently published version observed by this hook. Becomes `false` if
   * an external script tampers with the snapshot or if the next refresh
   * yields a different hash and we haven't yet observed it.
   *
   * Consumers MUST gate any reads of `vehicleList` / pricing on this flag.
   */
  vehicleDataFresh: boolean;
  /** Last `vehicleDataVersion` confirmed by this hook (null until first observation). */
  vehicleDataVersion: string | null;
  /** Why we became ready: hydration event, polled state, or fallback timeout. */
  reason: "pending" | "hydrated" | "polled" | "timeout";
}

const DEFAULT_TIMEOUT_MS = 4000;
const POLL_INTERVAL_MS = 200;

/**
 * Readiness gate for any consumer that depends on a fully-hydrated
 * `window.LOGIQ`. Resolves when **either**:
 *
 *   1. `logiq:consentHydrated` fires (preferred — first paint), OR
 *   2. A poll detects `termsVersion.accepted === true` AND
 *      `userConsent.cookies === true` (covers late acceptance), OR
 *   3. `timeoutMs` elapses (fail-open so the widget never gets stuck).
 *
 * Even when the user hasn't accepted CGL/cookies, we still resolve after the
 * timeout — the chatbot can then decide what to do with that information
 * (e.g. show a notice instead of staying invisible).
 *
 * Vehicle-data freshness is tracked separately via `vehicleDataFresh`:
 * the chatbot should refuse to quote prices or claim availability while
 * that flag is `false`, even if `ready` is `true`.
 */
export function useLogiqReady(timeoutMs: number = DEFAULT_TIMEOUT_MS): LogiqReadyState {
  const [state, setState] = useState<LogiqReadyState>({
    ready: false,
    cglAccepted: false,
    cookiesAccepted: false,
    vehicleDataFresh: false,
    vehicleDataVersion: null,
    reason: "pending",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let resolved = false;
    // Last vehicleDataVersion we **trust** — set whenever we receive a
    // `logiq:vehicleDataRefreshed` event or when we observe the live
    // version on first read. Re-validated on every poll & event tick.
    let trustedVersion: string | null = null;

    const readSnapshot = () => {
      const logiq = (window as any).LOGIQ;
      const liveVersion: string | null = logiq?.vehicleDataVersion ?? null;
      // Promote the live version on first observation so the hook doesn't
      // permanently report `vehicleDataFresh: false` on a cold start.
      if (trustedVersion === null && liveVersion !== null) {
        trustedVersion = liveVersion;
      }
      return {
        cglAccepted: !!logiq?.termsVersion?.accepted,
        cookiesAccepted: !!logiq?.userConsent?.cookies,
        vehicleDataVersion: liveVersion,
        vehicleDataFresh:
          liveVersion !== null && liveVersion === trustedVersion,
      };
    };

    const resolve = (reason: LogiqReadyState["reason"]) => {
      if (resolved) return;
      resolved = true;
      const snap = readSnapshot();
      setState({ ready: true, reason, ...snap });
    };

    const refreshLive = () => {
      const snap = readSnapshot();
      setState((prev) => ({ ...prev, ...snap }));
    };

    // 1) Hydration event — preferred signal.
    const onHydrated = () => resolve("hydrated");
    document.addEventListener("logiq:consentHydrated", onHydrated);

    // Vehicle data refresh — always re-anchor the trusted version so a
    // legitimate refresh (focus, deploy, manual call) keeps `fresh: true`.
    const onVehicleRefreshed = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { vehicleDataVersion?: string }
        | undefined;
      if (detail?.vehicleDataVersion) {
        trustedVersion = detail.vehicleDataVersion;
      }
      refreshLive();
    };
    document.addEventListener("logiq:vehicleDataRefreshed", onVehicleRefreshed);

    // Tamper detected → snapshot was restored, but the chatbot should
    // re-validate before trusting any vehicle data again.
    const onTamper = () => {
      // Force re-read; if the live version still matches our trusted one,
      // freshness stays true. Otherwise it'll flip false until next refresh.
      refreshLive();
    };
    document.addEventListener("logiq:tamperDetected", onTamper);

    // 2) Defensive poll for late consent + freshness drift detection.
    const pollId = window.setInterval(() => {
      refreshLive();
      const snap = readSnapshot();
      if (snap.cglAccepted && snap.cookiesAccepted) resolve("polled");
    }, POLL_INTERVAL_MS);

    // 3) Hard timeout — never block the widget indefinitely.
    const timeoutId = window.setTimeout(() => resolve("timeout"), timeoutMs);

    // Initial read in case hydration already happened before mount.
    refreshLive();
    const initial = readSnapshot();
    if (initial.cglAccepted && initial.cookiesAccepted) resolve("polled");

    return () => {
      document.removeEventListener("logiq:consentHydrated", onHydrated);
      document.removeEventListener("logiq:vehicleDataRefreshed", onVehicleRefreshed);
      document.removeEventListener("logiq:tamperDetected", onTamper);
      window.clearInterval(pollId);
      window.clearTimeout(timeoutId);
    };
  }, [timeoutMs]);

  return state;
}
