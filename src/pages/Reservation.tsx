import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { vehicles, vehicleOptions } from "@/data/vehicles";
import { updateBookingDraft, dispatchLogiqEvent } from "@/lib/logiq";
import { Check, ChevronRight } from "lucide-react";

const steps = ["Dates & lieu", "Véhicule", "Options & confirmation"];

const Reservation = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(searchParams.get("vehicle") || "");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [estKm, setEstKm] = useState(150);

  useEffect(() => {
    dispatchLogiqEvent("logiq:openReservation", {
      prefillVehicleId: searchParams.get("vehicle") || undefined,
    });
  }, [searchParams]);

  useEffect(() => {
    updateBookingDraft({
      start: startDate || null,
      end: endDate || null,
      vehicleId: selectedVehicle || null,
      options: selectedOptions,
      estKm,
    });
  }, [startDate, endDate, selectedVehicle, selectedOptions, estKm]);

  const calculatePrice = () => {
    if (!startDate || !endDate || !selectedVehicle) return null;
    const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
    const vehicle = vehicles.find((v) => v.id === selectedVehicle);
    if (!vehicle) return null;

    let rate = vehicle.priceDay;
    if (days >= 14) rate *= 0.8;
    else if (days >= 7) rate *= 0.85;
    else if (days >= 3) rate *= 0.9;

    const optionsCost = selectedOptions.reduce((sum, optId) => {
      const opt = vehicleOptions.find((o) => o.id === optId);
      return sum + (opt ? opt.priceDay : 0);
    }, 0);

    const extraKm = Math.max(0, estKm - 150 * days) * 0.45;
    const total = Math.round(days * (rate + optionsCost) + extraKm);

    return { days, rate: Math.round(rate), optionsCost, extraKm: Math.round(extraKm), total };
  };

  const price = calculatePrice();

  useEffect(() => {
    if (price) {
      updateBookingDraft({ priceEstimate: price.total });
      dispatchLogiqEvent("logiq:priceCalculated", { priceBreakdown: price });
    }
  }, [price?.total]);

  return (
    <main className="py-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Réservation</h1>
        <p className="text-muted-foreground mb-8">Réservez votre véhicule en 3 étapes simples.</p>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-muted text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <div
          id="logiq-reservation-widget"
          data-env="staging"
          className="bg-card rounded-lg border p-6"
        >
          {/* Step 0: Dates */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Choisissez vos dates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date de début</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    aria-label="Date de début de location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    aria-label="Date de fin de location"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Km estimés (total)</label>
                <input
                  type="number"
                  value={estKm}
                  onChange={(e) => setEstKm(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  min={0}
                  aria-label="Kilomètres estimés"
                />
              </div>
              <Button variant="petrol" onClick={() => setStep(1)} disabled={!startDate || !endDate}>
                Continuer <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Step 1: Vehicle */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Choisissez votre véhicule</h2>
              <div className="space-y-3">
                {vehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicle(v.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedVehicle === v.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                    data-vehicle-id={v.id}
                    data-daily-price={v.priceDay}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{v.name}</div>
                        <div className="text-sm text-muted-foreground">{v.specs.volume} · {v.specs.payload} · {v.specs.transmission}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary">{v.priceDay} CHF</span>
                        <span className="text-xs text-muted-foreground">/jour</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)}>Retour</Button>
                <Button variant="petrol" onClick={() => setStep(2)} disabled={!selectedVehicle}>
                  Continuer <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Options & Summary */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">Options</h2>
                <div className="space-y-2">
                  {vehicleOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedOptions.includes(opt.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(opt.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedOptions([...selectedOptions, opt.id]);
                          else setSelectedOptions(selectedOptions.filter((o) => o !== opt.id));
                        }}
                        className="accent-primary"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{opt.name}</div>
                        <div className="text-xs text-muted-foreground">{opt.description}</div>
                      </div>
                      <span className="text-sm font-semibold text-primary">{opt.priceDay} CHF/j</span>
                    </label>
                  ))}
                </div>
              </div>

              {price && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Estimation du prix</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Véhicule ({price.days} jours × {price.rate} CHF)</span>
                      <span>{price.days * price.rate} CHF</span>
                    </div>
                    {price.optionsCost > 0 && (
                      <div className="flex justify-between">
                        <span>Options ({price.days} jours × {price.optionsCost} CHF)</span>
                        <span>{price.days * price.optionsCost} CHF</span>
                      </div>
                    )}
                    {price.extraKm > 0 && (
                      <div className="flex justify-between">
                        <span>Km supplémentaires</span>
                        <span>{price.extraKm} CHF</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base pt-2 border-t">
                      <span>Total estimé (TVA incl.)</span>
                      <span className="text-primary">{price.total} CHF</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
                <Button variant="hero" disabled>
                  Confirmer la réservation
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                La confirmation de réservation nécessite un backend. Intégration en cours.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Reservation;
