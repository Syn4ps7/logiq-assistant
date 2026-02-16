import { cglArticles, CGL_VERSION } from "@/data/cgl-content";

const CGL = () => {
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

        <div className="mt-12 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
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
