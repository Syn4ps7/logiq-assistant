import { vehicles, vehicleOptions, ratePlans, EXTRA_KM_RATE } from "@/data/vehicles";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Star, Package } from "lucide-react";
import { useTranslation } from "react-i18next";

const Rates = () => {
  const { t } = useTranslation();

  return (
    <main className="py-12">
      <div className="container">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">{t("rates.title")}</h1>
          <p className="text-muted-foreground max-w-2xl">
            {t("rates.subtitle", { rate: EXTRA_KM_RATE.toFixed(2) })}
          </p>
        </div>

        <section id="rates" className="mb-12" aria-label="Formules tarifaires">
          <h2 className="text-xl font-semibold mb-6">{t("rates.plans")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ratePlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 bg-card rounded-lg border-2 transition-shadow hover:shadow-md ${
                  plan.popular ? "border-accent shadow-md" : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star className="h-3 w-3" /> {t("rates.popular")}
                  </div>
                )}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-primary">{plan.priceDisplay}</span>
                  </div>
                </div>
                {plan.id === "pack-48h" && (
                  <ul className="space-y-1.5 mb-4 bg-primary/5 rounded-md p-3">
                    {(t("rates.packBullets", { returnObjects: true }) as string[]).map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm font-medium">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <ul className="space-y-2 mb-4">
                  {(t(`rates.planFeatures.${plan.id}`, { returnObjects: true }) as string[]).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.id === "pack-48h" && (
                  <p className="text-xs text-muted-foreground italic mb-4">
                    {t("rates.packAntiCompare")}
                  </p>
                )}
                <Link to="/reservation" className="block">
                  <Button variant="petrol" className="w-full">{t("nav.book")}</Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12" aria-label="Véhicules disponibles">
          <h2 className="text-xl font-semibold mb-4">{t("rates.availableVehicles")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehicles.map((v) => (
              <div key={v.id} className="p-4 bg-card rounded-lg border">
                <h3 className="font-medium mb-1">{v.name}</h3>
                <p className="text-sm text-muted-foreground">{v.specs.volume} · {v.specs.payload} · {v.specs.transmission}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12" aria-label="Options">
          <h2 className="text-xl font-semibold mb-4">{t("rates.options")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicleOptions.map((opt) => (
              <div
                key={opt.id}
                className={`p-4 bg-card rounded-lg border ${opt.id === "serenite" ? "border-accent border-2 relative" : ""}`}
              >
                {opt.id === "serenite" && (
                  <span className="absolute -top-2.5 right-3 bg-accent text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                    {t("rates.recommended")}
                  </span>
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{opt.name}</h3>
                  <span className="text-sm font-semibold text-primary whitespace-nowrap">{opt.price} {t("rates.perRental")}</span>
                </div>
                <p className="text-sm text-muted-foreground">{opt.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12" aria-label="Km supplémentaires">
          <h2 className="text-xl font-semibold mb-4">{t("rates.extraKm")}</h2>
          <div className="bg-card rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">
              {t("rates.extraKmDesc")} <strong className="text-foreground">{EXTRA_KM_RATE.toFixed(2)} {t("rates.extraKmRate")}</strong>{t("rates.extraKmAuto")}
            </p>
          </div>
        </section>

        <section aria-label="Inclus dans le tarif">
          <h2 className="text-xl font-semibold mb-4">{t("rates.included")}</h2>
          <div className="bg-card rounded-lg border p-6">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(t("rates.includedItems", { returnObjects: true }) as string[]).map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Rates;
