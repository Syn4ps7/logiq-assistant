import { vehicles, vehicleOptions, ratePlans, EXTRA_KM_RATE } from "@/data/vehicles";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

const Rates = () => {
  return (
    <main className="py-12">
      <div className="container">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Tarifs</h1>
          <p className="text-muted-foreground max-w-2xl">
            Tarifs transparents, TVA 8.1% incluse. Km supplémentaires : {EXTRA_KM_RATE.toFixed(2)} CHF/km.
          </p>
        </div>

        {/* Rate plans */}
        <section id="rates" className="mb-12" aria-label="Formules tarifaires">
          <h2 className="text-xl font-semibold mb-6">Nos formules</h2>
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
                    <Star className="h-3 w-3" /> Populaire
                  </div>
                )}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-primary">{plan.priceDisplay}</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/reservation" className="block">
                  <Button variant="petrol" className="w-full">Réserver</Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Vehicles */}
        <section className="mb-12" aria-label="Véhicules disponibles">
          <h2 className="text-xl font-semibold mb-4">Véhicules disponibles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehicles.map((v) => (
              <div key={v.id} className="p-4 bg-card rounded-lg border">
                <h3 className="font-medium mb-1">{v.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {v.specs.volume} · {v.specs.payload} · {v.specs.transmission}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Options */}
        <section className="mb-12" aria-label="Options">
          <h2 className="text-xl font-semibold mb-4">Options</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicleOptions.map((opt) => (
              <div
                key={opt.id}
                className={`p-4 bg-card rounded-lg border ${
                  opt.id === "serenite" ? "border-accent border-2 relative" : ""
                }`}
              >
                {opt.id === "serenite" && (
                  <span className="absolute -top-2.5 right-3 bg-accent text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                    Recommandé
                  </span>
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{opt.name}</h3>
                  <span className="text-sm font-semibold text-primary whitespace-nowrap">
                    {opt.price} CHF / location
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{opt.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Extra km */}
        <section className="mb-12" aria-label="Km supplémentaires">
          <h2 className="text-xl font-semibold mb-4">Kilomètres supplémentaires</h2>
          <div className="bg-card rounded-lg border p-6">
            <p className="text-sm text-muted-foreground">
              Chaque formule inclut un quota kilométrique (100 km/jour en Semaine et Week‑End, 200 km pour le Pack 48h).
              Au-delà, chaque kilomètre supplémentaire est facturé <strong className="text-foreground">{EXTRA_KM_RATE.toFixed(2)} CHF/km</strong>, calculé automatiquement au retour du véhicule.
            </p>
          </div>
        </section>

        {/* Included */}
        <section aria-label="Inclus dans le tarif">
          <h2 className="text-xl font-semibold mb-4">Inclus dans chaque location</h2>
          <div className="bg-card rounded-lg border p-6">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Assurance RC standard",
                "Assistance routière 24/7",
                "État des lieux numérique",
                "TVA 8.1% incluse",
              ].map((item) => (
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
