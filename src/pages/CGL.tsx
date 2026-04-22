import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cglArticles, CGL_VERSION, CGL_HASH } from "@/data/cgl-content";
import { useSeo } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { acceptCGL } from "@/lib/logiq";
import { toast } from "sonner";

const STORAGE_KEY = "logiq.cgl.accepted";

interface StoredAcceptance {
  cglHash: string;
  acceptedAt: string;
}

const CGL = () => {
  useSeo("seo.cglTitle", "seo.cglDesc");

  const [acceptance, setAcceptance] = useState<StoredAcceptance | null>(null);

  // Hydrate the local acceptance status from previous visits.
  // Stored acceptances are only valid if the CGL hash still matches —
  // any text change invalidates the prior consent (Swiss nLPD / CGL Art. 14).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredAcceptance;
      if (parsed?.cglHash === CGL_HASH && parsed.acceptedAt) {
        setAcceptance(parsed);
      } else {
        // Stale acceptance against an outdated CGL version — drop it.
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleAccept = () => {
    // 1. Update the global LOGIQ snapshot AND dispatch logiq:cglAccepted
    //    with { cglHash, timestamp } — the chatbot/analytics layer subscribes
    //    to this event to gate any data-collection feature behind explicit consent.
    acceptCGL();

    // 2. Persist locally so the badge survives reloads (until the CGL hash changes).
    const acceptedAt = new Date().toISOString();
    const record: StoredAcceptance = { cglHash: CGL_HASH, acceptedAt };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // localStorage may be disabled — non-blocking, the event still fired.
    }
    setAcceptance(record);
    toast.success("Conditions générales acceptées", {
      description: `Version ${CGL_VERSION} — votre acceptation a été enregistrée.`,
    });
  };

  return (
    <main className="py-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Conditions Générales de Location</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Version en vigueur depuis le {CGL_VERSION} — LogIQ Transport Sàrl, Vevey
        </p>

        <div className="space-y-10">
          {cglArticles.map((article) => (
            <article key={article.id} id={article.id} className="scroll-mt-24">
              <h2 className="text-xl font-bold mb-3 text-primary">{article.title}</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">{article.content}</p>

              {article.subsections && (
                <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                  {article.subsections.map((sub) => (
                    <div key={sub.id} id={sub.id} className="scroll-mt-24">
                      <h3 className="font-semibold mb-1">{sub.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{sub.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Acceptance block — dispatches logiq:cglAccepted */}
        <section
          aria-labelledby="cgl-accept-heading"
          className="mt-12 p-6 bg-muted rounded-lg border border-border"
        >
          <h2 id="cgl-accept-heading" className="text-lg font-semibold mb-2">
            Accepter les conditions générales
          </h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            En cliquant sur « J'accepte », vous reconnaissez avoir lu et accepté
            l'intégralité des conditions générales de location version {CGL_VERSION}.
            Votre acceptation est horodatée et conservée localement.
          </p>

          {acceptance ? (
            <div
              role="status"
              className="flex items-start gap-3 p-3 bg-background rounded border border-primary/30"
            >
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-medium text-foreground">CGL acceptées</p>
                <p className="text-muted-foreground">
                  Le {new Date(acceptance.acceptedAt).toLocaleString("fr-CH", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  Version : {acceptance.cglHash.slice(0, 12)}…
                </p>
              </div>
            </div>
          ) : (
            <Button onClick={handleAccept} size="lg" className="w-full sm:w-auto">
              J'accepte les CGL version {CGL_VERSION}
            </Button>
          )}
        </section>

        <div className="mt-8 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <p>
            Les présentes conditions sont applicables à compter du {CGL_VERSION}.
            Pour toute question, contactez-nous à{" "}
            <a href="mailto:info@logiq-transport.ch" className="text-primary underline">info@logiq-transport.ch</a>.
          </p>
        </div>
      </div>
    </main>
  );
};

export default CGL;
