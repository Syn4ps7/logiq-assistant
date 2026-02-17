import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { vehicles, vehicleOptions, ratePlans, EXTRA_KM_RATE } from "@/data/vehicles";
import { updateBookingDraft, dispatchLogiqEvent } from "@/lib/logiq";
import { Check, ChevronRight, Info, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";

const TVA_RATE = 0.081;
const roundCHF = (v: number) => Math.round(v / 0.05) * 0.05;
const fmtCHF = (v: number) => roundCHF(v).toLocaleString("fr-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type RatePlanId = "week" | "weekend" | "pack-48h";
type WeekendPack = "standard" | "confort" | "premium";

const WEEKEND_PACKS: Record<WeekendPack, { price: number; label: string }> = {
  standard: { price: 280, label: "Week-end Standard" },
  confort: { price: 340, label: "Week-end Confort" },
  premium: { price: 380, label: "Week-end+ Premium (Livré)" },
};

const Reservation = () => {
  const { t } = useTranslation();
  const steps = t("reservation.steps", { returnObjects: true }) as string[];
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<RatePlanId | "">("");
  const [weekendPack, setWeekendPack] = useState<WeekendPack | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(searchParams.get("vehicle") || "");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [estKm, setEstKm] = useState(200);

  // Delivery fields (Premium only)
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNpa, setDeliveryNpa] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const isProCheckout = searchParams.get("source") === "pro";

  // Pre-fill from query params (from Rates page links)
  useEffect(() => {
    const pack = searchParams.get("pack") as WeekendPack | null;
    if (pack && pack in WEEKEND_PACKS) {
      setSelectedPlan("weekend");
      setWeekendPack(pack);
    }
  }, [searchParams]);

  useEffect(() => {
    dispatchLogiqEvent("logiq:openReservation", {
      prefillVehicleId: searchParams.get("vehicle") || undefined,
    });
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    updateBookingDraft({
      start: startDate || null,
      end: endDate || null,
      vehicleId: selectedVehicle || null,
      options: selectedOptions,
      estKm,
    });
  }, [startDate, endDate, selectedVehicle, selectedOptions, estKm]);

  const isPack = selectedPlan === "pack-48h";
  const isWeekendPack = selectedPlan === "weekend" && weekendPack !== "";
  const isPremium = weekendPack === "premium";

  const price = useMemo(() => {
    if (!selectedVehicle) return null;

    // Weekend pack flow
    if (isWeekendPack && weekendPack) {
      const pack = WEEKEND_PACKS[weekendPack];
      const baseTotal = pack.price;
      const includedKm = 200;
      const days = 2;

      // For confort & premium, sérénité is already included — don't charge
      const filteredOptions = selectedOptions.filter((optId) => {
        if ((weekendPack === "confort" || weekendPack === "premium") && optId === "serenite") return false;
        if (weekendPack === "premium" && (optId === "diable" || optId === "sangles-couverture")) return false;
        return true;
      });

      const optionsCost = filteredOptions.reduce((sum, optId) => {
        const opt = vehicleOptions.find((o) => o.id === optId);
        return sum + (opt ? opt.price : 0);
      }, 0);

      const extraKm = Math.max(0, estKm - includedKm);
      const extraKmCost = Math.round(extraKm * EXTRA_KM_RATE * 100) / 100;
      const total = Math.round((baseTotal + optionsCost + extraKmCost) * 100) / 100;

      return { days, baseTotal, includedKm, optionsCost, extraKm, extraKmCost, total, planName: pack.label };
    }

    // Standard flow
    const plan = ratePlans.find((p) => p.id === selectedPlan);
    if (!plan) return null;

    let days = 1;
    let baseTotal: number;
    let includedKm: number;

    if (plan.isFlat) {
      baseTotal = plan.priceValue;
      includedKm = plan.totalIncludedKm || 200;
      days = 2;
    } else {
      if (!startDate || !endDate) return null;
      days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
      baseTotal = days * plan.priceValue;
      includedKm = plan.includedKmPerDay * days;
    }

    const optionsCost = selectedOptions.reduce((sum, optId) => {
      const opt = vehicleOptions.find((o) => o.id === optId);
      return sum + (opt ? opt.price : 0);
    }, 0);

    const extraKm = Math.max(0, estKm - includedKm);
    const extraKmCost = Math.round(extraKm * EXTRA_KM_RATE * 100) / 100;
    const total = Math.round((baseTotal + optionsCost + extraKmCost) * 100) / 100;

    return { days, baseTotal, includedKm, optionsCost, extraKm, extraKmCost, total, planName: plan.name };
  }, [selectedPlan, weekendPack, startDate, endDate, selectedVehicle, selectedOptions, estKm, isWeekendPack]);

  useEffect(() => {
    if (price) {
      updateBookingDraft({ priceEstimate: price.total });
      dispatchLogiqEvent("logiq:priceCalculated", { priceBreakdown: price });
    }
  }, [price?.total]);

  const canProceedStep0 = isWeekendPack || (selectedPlan && (isPack || (startDate && endDate)));

  const premiumDeliveryValid = !isPremium || (deliveryAddress && deliveryNpa && deliveryCity && deliveryPhone);

  return (
    <main className="py-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">{t("reservation.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("reservation.subtitle")}</p>

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

        <div id="logiq-reservation-widget" data-env="staging" className="bg-card rounded-lg border p-6">
          {/* Step 0 */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">{t("reservation.choosePlan")}</h2>
              <div className="space-y-3">
                {ratePlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => { setSelectedPlan(plan.id as RatePlanId); if (plan.id !== "weekend") setWeekendPack(""); }}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedPlan === plan.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-muted-foreground">{plan.subtitle}</div>
                      </div>
                      <span className="text-lg font-bold text-primary">{plan.priceDisplay}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Weekend pack selection */}
              {selectedPlan === "weekend" && (
                <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                  <h3 className="font-medium text-sm">Choisissez votre Pack Week-end+ :</h3>
                  {(Object.entries(WEEKEND_PACKS) as [WeekendPack, { price: number; label: string }][]).map(([key, pack]) => (
                    <button
                      key={key}
                      onClick={() => setWeekendPack(key)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        weekendPack === key ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {key === "premium" && <Truck className="h-4 w-4 text-primary" />}
                          <span className="font-medium text-sm">{pack.label}</span>
                        </div>
                        <span className="text-sm font-bold text-primary">{pack.price} CHF (TTC)</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedPlan && !isPack && !isWeekendPack && (
                <div className="space-y-4">
                  <h3 className="font-medium">{t("reservation.rentalDates")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t("reservation.startDate")}</label>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t("reservation.endDate")}</label>
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">{t("reservation.estKm")}</label>
                <input type="number" value={estKm} onChange={(e) => setEstKm(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" min={0} />
                <p className="text-xs text-muted-foreground mt-1">
                  {isPack || isWeekendPack ? t("reservation.kmIncludedPack") : t("reservation.kmIncludedDay")}
                  {" · "}{EXTRA_KM_RATE.toFixed(2)} {t("reservation.extraKmRate")}
                </p>
              </div>

              <Button variant="petrol" onClick={() => setStep(1)} disabled={!canProceedStep0}>
                {t("reservation.continue")} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{t("reservation.chooseVehicle")}</h2>
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
                    data-volume={v.specs.volume}
                    data-height={v.specs.height}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{v.name}</div>
                        <div className="text-sm text-muted-foreground">{v.specs.volume} · {v.specs.payload} · {v.specs.transmission}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)}>{t("reservation.back")}</Button>
                <Button variant="petrol" onClick={() => setStep(2)} disabled={!selectedVehicle}>
                  {t("reservation.continue")} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">{t("reservation.options")}</h2>
                <div className="space-y-2">
                  {vehicleOptions.map((opt) => {
                    // Hide options already included in pack
                    const isIncludedInPack =
                      (weekendPack === "confort" || weekendPack === "premium") && opt.id === "serenite" ||
                      weekendPack === "premium" && (opt.id === "diable" || opt.id === "sangles-couverture");

                    if (isIncludedInPack) {
                      return (
                        <div key={opt.id} className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
                          <Check className="h-4 w-4 text-primary shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{opt.name} <span className="text-xs text-primary font-semibold">— Inclus dans votre pack</span></div>
                            <div className="text-xs text-muted-foreground">{opt.description}</div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedOptions.includes(opt.id) ? "border-primary bg-primary/5" : opt.id === "serenite" ? "border-accent/50 hover:border-accent" : "border-border hover:border-primary/30"
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
                          <div className="font-medium text-sm flex items-center gap-1.5">
                            {opt.name}
                            {opt.id === "serenite" && (
                              <span className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded font-semibold">{t("reservation.sereniteRecommended")}</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{opt.description}</div>
                          {opt.id === "serenite" && (
                            <div className="text-xs text-muted-foreground mt-0.5 flex items-start gap-1">
                              <Info className="h-3 w-3 mt-0.5 shrink-0" />
                              <span>{t("reservation.sereniteInfo")}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-primary whitespace-nowrap">
                          {opt.price} {t("rates.perRental")}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Premium Livré — Delivery fields */}
              {isPremium && (
                <div className="bg-muted/30 rounded-lg p-4 space-y-4 border border-primary/20">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    {t("reservation.deliveryTitle")}
                  </h3>
                  <p className="text-xs text-muted-foreground">{t("reservation.deliverySlot")}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1">{t("reservation.deliveryAddress")} *</label>
                      <input type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t("reservation.deliveryNpa")} *</label>
                      <input type="text" value={deliveryNpa} onChange={(e) => setDeliveryNpa(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t("reservation.deliveryCity")} *</label>
                      <input type="text" value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t("reservation.deliveryPhone")} *</label>
                      <input type="tel" value={deliveryPhone} onChange={(e) => setDeliveryPhone(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t("reservation.deliveryInstructions")}</label>
                      <input type="text" value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {price && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{t("reservation.priceEstimate")}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>
                        {isWeekendPack
                          ? price.planName
                          : isPack
                            ? t("reservation.packFlat")
                            : `${price.planName} (${price.days} ${price.days > 1 ? t("reservation.days") : t("reservation.day")})`}
                      </span>
                      <span>{price.baseTotal} CHF</span>
                    </div>
                    {selectedOptions
                      .filter((optId) => {
                        if ((weekendPack === "confort" || weekendPack === "premium") && optId === "serenite") return false;
                        if (weekendPack === "premium" && (optId === "diable" || optId === "sangles-couverture")) return false;
                        return true;
                      })
                      .map((optId) => {
                        const opt = vehicleOptions.find((o) => o.id === optId);
                        if (!opt) return null;
                        return (
                          <div key={optId} className="flex justify-between">
                            <span>{opt.name} ({t("reservation.perRental")})</span>
                            <span>{opt.price} CHF</span>
                          </div>
                        );
                      })}
                    <div className="flex justify-between text-muted-foreground">
                      <span>{t("reservation.kmIncluded")}</span>
                      <span>{price.includedKm} km</span>
                    </div>
                    {price.extraKm > 0 && (
                      <div className="flex justify-between">
                        <span>{t("reservation.extraKmLabel")} ({price.extraKm} km × {EXTRA_KM_RATE.toFixed(2)} CHF)</span>
                        <span>{price.extraKmCost.toFixed(2)} CHF</span>
                      </div>
                    )}
                    {isPremium && deliveryAddress && (
                      <div className="flex justify-between text-muted-foreground pt-1 border-t border-dashed">
                        <span>{t("reservation.deliveryAddressLabel")}</span>
                        <span className="text-right text-xs max-w-[200px]">{deliveryAddress}, {deliveryNpa} {deliveryCity}</span>
                      </div>
                    )}
                    {isProCheckout ? (
                      <>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-medium">Sous-total HT</span>
                          <span>{fmtCHF(price.total / (1 + TVA_RATE))} CHF</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>TVA (8.1 %)</span>
                          <span>{fmtCHF(price.total - price.total / (1 + TVA_RATE))} CHF</span>
                        </div>
                        <div className="flex justify-between font-bold text-base pt-1 border-t">
                          <span>Total TTC</span>
                          <span className="text-primary">{fmtCHF(price.total)} CHF</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between font-bold text-base pt-2 border-t">
                        <span>{t("reservation.totalEstimate")}</span>
                        <span className="text-primary">{price.total.toFixed(2)} CHF</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>{t("reservation.back")}</Button>
                <Button variant="hero" disabled={!premiumDeliveryValid}>{t("reservation.confirm")}</Button>
              </div>
              <p className="text-xs text-muted-foreground">{t("reservation.microlegal")}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Reservation;
