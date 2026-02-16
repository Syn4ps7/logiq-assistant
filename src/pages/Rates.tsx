import { vehicles, vehicleOptions } from "@/data/vehicles";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const Rates = () => {
  return (
    <main className="py-12">
      <div className="container">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Tarifs</h1>
          <p className="text-muted-foreground max-w-2xl">
            Tarifs transparents, TVA 8.1% incluse. 150 km/jour inclus. Tarifs dégressifs dès 3 jours.
          </p>
        </div>

        {/* Vehicle pricing */}
        <section id="rates" className="mb-12" aria-label="Tarifs véhicules">
          <h2 className="text-xl font-semibold mb-4">Tarifs journaliers</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-card rounded-lg border" role="table">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 text-sm font-semibold">Véhicule</th>
                  <th className="text-right p-4 text-sm font-semibold">1-2 jours</th>
                  <th className="text-right p-4 text-sm font-semibold">3-6 jours (-10%)</th>
                  <th className="text-right p-4 text-sm font-semibold">7-13 jours (-15%)</th>
                  <th className="text-right p-4 text-sm font-semibold">14+ jours (-20%)</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium">{v.name}</div>
                      <div className="text-xs text-muted-foreground">{v.specs.volume} · {v.specs.payload}</div>
                    </td>
                    <td className="text-right p-4 font-semibold">{v.priceDay} CHF</td>
                    <td className="text-right p-4">{Math.round(v.priceDay * 0.9)} CHF</td>
                    <td className="text-right p-4">{Math.round(v.priceDay * 0.85)} CHF</td>
                    <td className="text-right p-4">{Math.round(v.priceDay * 0.8)} CHF</td>
                    <td className="p-4">
                      <Link to={`/reservation?vehicle=${v.id}`}>
                        <Button variant="petrol" size="sm">Réserver</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Options */}
        <section className="mb-12" aria-label="Options">
          <h2 className="text-xl font-semibold mb-4">Options</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicleOptions.map((opt) => (
              <div key={opt.id} className="p-4 bg-card rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{opt.name}</h3>
                  <span className="text-sm font-semibold text-primary">{opt.priceDay} CHF/j</span>
                </div>
                <p className="text-sm text-muted-foreground">{opt.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Included */}
        <section aria-label="Inclus dans le tarif">
          <h2 className="text-xl font-semibold mb-4">Inclus dans chaque location</h2>
          <div className="bg-card rounded-lg border p-6">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "150 km/jour inclus",
                "Assurance RC et casco complète",
                "Assistance routière 24/7",
                "Plein de carburant au départ",
                "État des lieux contradictoire",
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
