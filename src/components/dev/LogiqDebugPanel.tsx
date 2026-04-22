import { useEffect, useState, useMemo } from "react";
import type { LogiqGlobal } from "@/lib/logiq";

/**
 * Developer-only floating panel that mirrors the live `window.LOGIQ` snapshot.
 *
 * Visibility rules (all must be true):
 *   - `import.meta.env.DEV` is true (Vite dev server), OR
 *   - URL contains `?debugLogiq=1` (works in any environment for QA), AND
 *   - Not hidden by the user via the close button (persisted in sessionStorage).
 *
 * The panel listens for every `logiq:*` event and also polls every 500 ms so it
 * reflects passive updates (e.g. consent hydration on first paint).
 */
export function LogiqDebugPanel() {
  const enabled = useMemo(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    const forced = params.get("debugLogiq") === "1";
    const dismissed = sessionStorage.getItem("logiq:debug:dismissed") === "1";
    return (import.meta.env.DEV || forced) && !dismissed;
  }, []);

  const [snapshot, setSnapshot] = useState<LogiqGlobal | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState<"all" | "consent" | "terms" | "booking" | "flexPro">("all");
  const [tamperedAt, setTamperedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const read = () => setSnapshot(((window as any).LOGIQ ?? null) as LogiqGlobal | null);
    read();

    const events = [
      "logiq:vehicleClick",
      "logiq:openReservation",
      "logiq:priceCalculated",
      "logiq:bookingCompleted",
      "logiq:cglAccepted",
    ];
    events.forEach((e) => document.addEventListener(e, read));
    const onTamper = (e: Event) => {
      setTamperedAt(((e as CustomEvent).detail?.restoredAt as string) ?? new Date().toISOString());
      read();
    };
    document.addEventListener("logiq:tamperDetected", onTamper);

    const id = window.setInterval(read, 500);
    return () => {
      events.forEach((e) => document.removeEventListener(e, read));
      document.removeEventListener("logiq:tamperDetected", onTamper);
      window.clearInterval(id);
    };
  }, [enabled]);

  if (!enabled) return null;

  const dismiss = () => {
    sessionStorage.setItem("logiq:debug:dismissed", "1");
    // Force unmount via a state flip; simplest is reload-of-component:
    setSnapshot(null);
    // Hide root by re-running the enabled check next mount.
    // Simpler: hide via inline state.
    (document.getElementById("logiq-debug-root") as HTMLElement | null)?.remove();
  };

  const view = (() => {
    if (!snapshot) return null;
    switch (tab) {
      case "consent":
        return snapshot.userConsent;
      case "terms":
        return snapshot.termsVersion;
      case "booking":
        return snapshot.bookingDraft;
      case "flexPro":
        return snapshot.flexPro;
      default:
        return {
          userConsent: snapshot.userConsent,
          termsVersion: snapshot.termsVersion,
          bookingDraft: snapshot.bookingDraft,
          flexPro: snapshot.flexPro,
          extraKmRate: snapshot.extraKmRate,
          vehicleListCount: snapshot.vehicleList?.length ?? 0,
        };
    }
  })();

  const consentReady = !!snapshot?.userConsent;
  const cglAccepted = !!snapshot?.termsVersion?.accepted;

  return (
    <div
      id="logiq-debug-root"
      className="fixed bottom-3 left-3 z-[9999] font-mono text-[11px] leading-tight"
      style={{ maxWidth: "min(420px, calc(100vw - 24px))" }}
    >
      <div className="rounded-md border border-border bg-background/95 backdrop-blur shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border">
          <span className="inline-block h-2 w-2 rounded-full bg-[#FFD400]" aria-hidden />
          <span className="font-semibold text-foreground">LOGIQ debug</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] ${
              snapshot ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700"
            }`}
          >
            {snapshot ? "live" : "init…"}
          </span>
          {tamperedAt && (
            <span
              className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/15 text-red-700"
              title={`Tamper detected at ${tamperedAt}`}
            >
              tamper!
            </span>
          )}
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="px-1.5 py-0.5 rounded hover:bg-muted text-muted-foreground"
              aria-label={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? "▸" : "▾"}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="px-1.5 py-0.5 rounded hover:bg-muted text-muted-foreground"
              aria-label="Hide debug panel"
              title="Hide for this session"
            >
              ✕
            </button>
          </div>
        </div>

        {!collapsed && (
          <>
            {/* Quick first-paint indicators */}
            <div className="flex flex-wrap gap-1 px-2 py-1.5 border-b border-border">
              <Indicator label="consent" ok={consentReady} />
              <Indicator
                label="cookies"
                ok={!!snapshot?.userConsent?.cookies}
                neutralIfFalse
              />
              <Indicator label="cgl" ok={cglAccepted} neutralIfFalse />
              <Indicator
                label="vehicles"
                ok={(snapshot?.vehicleList?.length ?? 0) > 0}
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-2 py-1.5 border-b border-border overflow-x-auto">
              {(["all", "consent", "terms", "booking", "flexPro"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${
                    tab === t
                      ? "bg-foreground text-background"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* JSON view */}
            <pre
              className="m-0 px-2 py-2 overflow-auto text-foreground"
              style={{ maxHeight: "40vh" }}
            >
{JSON.stringify(view, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
}

function Indicator({
  label,
  ok,
  neutralIfFalse,
}: {
  label: string;
  ok: boolean;
  neutralIfFalse?: boolean;
}) {
  const cls = ok
    ? "bg-emerald-500/15 text-emerald-700"
    : neutralIfFalse
      ? "bg-muted text-muted-foreground"
      : "bg-red-500/15 text-red-700";
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] ${cls}`}>
      {ok ? "✓" : "·"} {label}
    </span>
  );
}
