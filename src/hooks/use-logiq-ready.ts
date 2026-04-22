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
 */
export function useLogiqReady(timeoutMs: number = DEFAULT_TIMEOUT_MS): LogiqReadyState {
  const [state, setState] = useState<LogiqReadyState>({
    ready: false,
    cglAccepted: false,
    cookiesAccepted: false,
    reason: "pending",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let resolved = false;
    const readSnapshot = () => {
      const logiq = (window as any).LOGIQ;
      return {
        cglAccepted: !!logiq?.termsVersion?.accepted,
        cookiesAccepted: !!logiq?.userConsent?.cookies,
      };
    };

    const resolve = (reason: LogiqReadyState["reason"]) => {
      if (resolved) return;
      resolved = true;
      const snap = readSnapshot();
      setState({ ready: true, reason, ...snap });
    };

    // Always reflect current consent state, even before resolving.
    const refreshLive = () => {
      const snap = readSnapshot();
      setState((prev) =>
        prev.ready
          ? { ...prev, ...snap }
          : { ...prev, ...snap },
      );
    };

    // 1) Hydration event — preferred signal.
    const onHydrated = () => resolve("hydrated");
    document.addEventListener("logiq:consentHydrated", onHydrated);

    // 2) Defensive poll for late consent (cookies/CGL accepted post-hydration).
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
      window.clearInterval(pollId);
      window.clearTimeout(timeoutId);
    };
  }, [timeoutMs]);

  return state;
}
