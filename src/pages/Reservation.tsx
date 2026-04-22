import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { vehicles, vehicleOptions, ratePlans, EXTRA_KM_RATE } from "@/data/vehicles";
import { updateBookingDraft, dispatchLogiqEvent } from "@/lib/logiq";
import { Check, ChevronRight, Info, Truck, Loader2, CalendarDays, Car, Package, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSeo } from "@/hooks/use-seo";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";

const TVA_RATE = 0.081;
const roundCHF = (v: number) => Math.round(v / 0.05) * 0.05;
const fmtCHF = (v: number) => roundCHF(v).toLocaleString("fr-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type RatePlanId = "week" | "weekend" | "pack-48h" | "flex-pro";

const FLEX_PRO_DAILY_HT = 155;
const FLEX_PRO_KM_PER_DAY = 100;
type WeekendPack = "standard" | "confort" | "premium";
type ProTab = "daily" | "carnet";
type CarnetId = "carnet-10" | "carnet-20" | "carnet-40";

const WEEKEND_PACKS: Record<WeekendPack, { price: number; label: string }> = {
  standard: { price: 319, label: "Week-end Standard" },
  confort: { price: 399, label: "Pack Déménagement 48h" },
  premium: { price: 449, label: "Pack Déménagement Premium 48h" },
};

const CARNETS: { id: CarnetId; days: number; totalHT: number; totalTTC: number; perDayHT: number; perDayTTC: number; kmPerDay: number }[] = [
  { id: "carnet-10", days: 10, totalHT: 1193.35, totalTTC: 1290, perDayHT: 119.35, perDayTTC: 129, kmPerDay: 200 },
  { id: "carnet-20", days: 20, totalHT: 2257.15, totalTTC: 2440, perDayHT: 112.85, perDayTTC: 122, kmPerDay: 200 },
  { id: "carnet-40", days: 40, totalHT: 4255.30, totalTTC: 4600, perDayHT: 106.40, perDayTTC: 115, kmPerDay: 200 },
];

const EXTRA_KM_RATE_PRO_HT = 0.65;

const Reservation = () => {
  const { t } = useTranslation();
  useSeo("seo.reservationTitle", "seo.reservationDesc");
  const steps = t("reservation.steps", { returnObjects: true }) as string[];
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<RatePlanId | "">("");
  const [proTab, setProTab] = useState<ProTab>("daily");
  const [selectedCarnet, setSelectedCarnet] = useState<CarnetId | "">("");
  const [weekendPack, setWeekendPack] = useState<WeekendPack | "">("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("07:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("20:00");
  const [selectedVehicle, setSelectedVehicle] = useState(searchParams.get("vehicle") || "");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [estKm, setEstKm] = useState(200);

  // Delivery fields (Premium only)
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNpa, setDeliveryNpa] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // Contact fields for email
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoValid, setPromoValid] = useState<null | { id: string; discount_percent: number }>(null);
  const [promoError, setPromoError] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const isProCheckout = searchParams.get("source") === "pro" || isProUser;

  // Pre-fill from query params (from Rates page links)
  useEffect(() => {
    const pack = searchParams.get("pack") as WeekendPack | null;
    const plan = searchParams.get("plan") as RatePlanId | null;
    if (pack && pack in WEEKEND_PACKS) {
      setSelectedPlan("pack-48h");
      setWeekendPack(pack);
    } else if (plan === "flex-pro") {
      setSelectedPlan("flex-pro");
      setProTab("daily");
    } else if (plan && ["week", "weekend", "pack-48h"].includes(plan)) {
      setSelectedPlan(plan);
    }
  }, [searchParams]);

  // Pre-fill contact info from pro profile if logged in
  useEffect(() => {
    const fillFromProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("contact_name, email, phone, company_name, account_type")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (profile) {
        if (profile.account_type === "pro") setIsProUser(true);
        if (profile.contact_name && !contactName) setContactName(profile.contact_name);
        if (profile.email && !contactEmail) setContactEmail(profile.email);
        if (profile.phone && !contactPhone) setContactPhone(profile.phone);
      }
    };
    fillFromProfile();
  }, []);

  useEffect(() => {
    dispatchLogiqEvent("logiq:openReservation", {
      prefillVehicleId: searchParams.get("vehicle") || undefined,
    });
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
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
  const isPackWithSub = isPack && weekendPack !== "";
  const isPremium = weekendPack === "premium";

  const price = useMemo(() => {
    if (!selectedVehicle) return null;

    // Carnet flow
    if (proTab === "carnet" && selectedCarnet) {
      const carnet = CARNETS.find((c) => c.id === selectedCarnet);
      if (!carnet) return null;
      const days = carnet.days;
      const baseTotal = carnet.totalTTC;
      const includedKm = carnet.kmPerDay * days;

      const optionsCost = selectedOptions.reduce((sum, optId) => {
        const opt = vehicleOptions.find((o) => o.id === optId);
        return sum + (opt ? opt.price : 0);
      }, 0);

      const extraKm = Math.max(0, estKm - includedKm);
      const extraKmCost = Math.round(extraKm * 0.70 * 100) / 100;
      const total = Math.round((baseTotal + optionsCost + extraKmCost) * 100) / 100;

      return { days, baseTotal, includedKm, optionsCost, extraKm, extraKmCost, total, planName: `Carnet ${days} jours`, isCarnet: true, carnetHT: carnet.totalHT, perDayHT: carnet.perDayHT };
    }

    // Weekend pack flow
    if (isPackWithSub && weekendPack) {
      const pack = WEEKEND_PACKS[weekendPack];
      const baseTotal = pack.price;
      const includedKm = 200;
      const days = 2;

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
  }, [selectedPlan, weekendPack, startDate, endDate, selectedVehicle, selectedOptions, estKm, isPackWithSub, proTab, selectedCarnet]);

  useEffect(() => {
    if (price) {
      updateBookingDraft({ priceEstimate: price.total });
      dispatchLogiqEvent("logiq:priceCalculated", { priceBreakdown: price });
    }
  }, [price?.total]);

  const premiumDeliveryValid = !isPremium || (deliveryAddress && deliveryNpa && deliveryCity && deliveryPhone);

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !contactEmail.trim()) {
      setPromoError("Veuillez entrer votre email et un code promo.");
      return;
    }
    setPromoChecking(true);
    setPromoError("");
    setPromoValid(null);

    // Check code exists and is active
    const { data: codeData } = await supabase
      .from("promo_codes")
      .select("id, discount_percent, expires_at")
      .eq("code", promoCode.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (!codeData) {
      setPromoError("Code promo invalide ou expiré.");
      setPromoChecking(false);
      return;
    }

    // Check expiration
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      setPromoError("Ce code promo a expiré.");
      setPromoChecking(false);
      return;
    }

    // Check if already used by this email
    const { data: usageData } = await supabase
      .from("promo_usage")
      .select("id")
      .eq("promo_code_id", codeData.id)
      .eq("customer_email", contactEmail.trim().toLowerCase())
      .maybeSingle();

    if (usageData) {
      setPromoError("Ce code a déjà été utilisé avec cette adresse email.");
      setPromoChecking(false);
      return;
    }

    setPromoValid({ id: codeData.id, discount_percent: Number(codeData.discount_percent) });
    setPromoChecking(false);
  };

  const discountedTotal = promoValid && price
    ? roundCHF(price.total * (1 - promoValid.discount_percent / 100))
    : null;
  const discountAmount = promoValid && price
    ? roundCHF(price.total - (discountedTotal || price.total))
    : 0;

  const canProceedStep0 = (proTab === "carnet" && selectedCarnet) || isPackWithSub || (selectedPlan && (selectedPlan === "week" || selectedPlan === "weekend") && startDate && endDate);

  const canConfirm = premiumDeliveryValid && contactName && contactEmail && contactPhone;

  // Handle Stripe success/cancel from redirect
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const ref = searchParams.get("ref");
    if (success === "true" && ref) {
      // Mark reservation as paid
      supabase.from("reservations").update({ status: "paid" }).eq("reference", ref).then(() => {
        setConfirmed(true);
      });
    }
    if (canceled === "true") {
      toast.error(t("reservation.paymentCanceled", "Paiement annulé. Vous pouvez réessayer."));
    }
  }, [searchParams, t]);

  const handleConfirm = async () => {
    if (!price || !canConfirm) return;
    setIsSending(true);
    const vehicle = vehicles.find((v) => v.id === selectedVehicle);
    const optionNames = selectedOptions
      .map((id) => vehicleOptions.find((o) => o.id === id)?.name)
      .filter(Boolean)
      .join(", ");
    const reference = Date.now().toString(36).toUpperCase();

    const finalTotal = discountedTotal ?? price.total;

    try {
      // Save to database
      await supabase.from("reservations").insert({
        reference,
        source: isProCheckout ? "b2b" : "b2c",
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        plan: selectedCarnet || selectedPlan,
        pack: weekendPack || null,
        vehicle_name: vehicle?.name || "",
        vehicle_id: selectedVehicle,
        start_date: startDate || null,
        start_time: startDate ? startTime : null,
        end_date: endDate || null,
        end_time: endDate ? endTime : null,
        days: price.days,
        options: optionNames || null,
        est_km: estKm,
        total_chf: finalTotal,
        promo_code: promoValid ? promoCode.trim().toUpperCase() : null,
        discount_percent: promoValid ? promoValid.discount_percent : 0,
        discount_amount: discountAmount || 0,
        delivery_address: deliveryAddress || null,
        delivery_npa: deliveryNpa || null,
        delivery_city: deliveryCity || null,
        delivery_phone: deliveryPhone || null,
        delivery_instructions: deliveryInstructions || null,
      });

      // Record promo usage
      if (promoValid) {
        await supabase.from("promo_usage").insert({
          promo_code_id: promoValid.id,
          customer_email: contactEmail.trim().toLowerCase(),
          reservation_reference: reference,
          discount_amount: discountAmount || 0,
        });
      }

      // Send email notification (non-blocking)
      const trackingUrl = `${window.location.origin}/suivi?ref=${reference}`;
      emailjs.send(
        "service_g37dgi8",
        "template_51gqxra",
        {
          reference,
          prenom: contactName,
          email_client: contactEmail,
          date_debut: startDate || "Pack 48h",
          heure_debut: startDate ? startTime : "",
          date_fin: endDate || "Pack 48h",
          heure_fin: endDate ? endTime : "",
          duree: price.days,
          vehicule: vehicle?.name || "",
          options: optionNames || "Aucune",
          tarif: finalTotal.toFixed(2) + " CHF",
          lien_suivi: trackingUrl,
        },
        "txxckOr0_mZu2OaXQ"
      ).catch((err) => console.error("EmailJS error:", err));

      // Redirect to Stripe Checkout
      const description = `${price.planName} — ${vehicle?.name || ""} — ${price.days}j${promoValid ? ` (promo -${promoValid.discount_percent}%)` : ""}`;
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          reference,
          customerEmail: contactEmail,
          customerName: contactName,
          description,
          amountCHF: finalTotal,
        },
      });

      if (error || !data?.url) {
        throw new Error(error?.message || "Impossible de créer la session de paiement");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Reservation error:", err);
      toast.error(t("reservation.emailError"));
      setIsSending(false);
    }
  };


  return (
    <main className="py-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">{t("reservation.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("reservation.subtitle")}</p>

        {confirmed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 text-center space-y-4"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{t("reservation.successTitle")}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">{t("reservation.successDesc")}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.href = "/"}>
              {t("notFound.backHome")}
            </Button>
          </motion.div>
        ) : (
        <>
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

        <div id="logiq-reservation-widget" data-env="staging" className="bg-card rounded-lg border p-6 space-y-6">

          {/* ── Récapitulatif visuel ── */}
          {step > 0 && (
            <div className="bg-muted/40 rounded-lg p-4 border border-border">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Votre sélection</h3>
              <div className="flex flex-wrap gap-3">
                {/* Plan sélectionné */}
                {selectedPlan && (
                  <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-border">
                    <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Formule</p>
                      <p className="text-sm font-semibold">
                        {isPackWithSub && weekendPack
                          ? WEEKEND_PACKS[weekendPack].label
                          : ratePlans.find((p) => p.id === selectedPlan)?.name || selectedPlan}
                      </p>
                    </div>
                  </div>
                )}

                {/* Dates (si pas pack) */}
                {!isPack && startDate && endDate && (
                  <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-border">
                    <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Dates</p>
                      <p className="text-sm font-semibold">{new Date(startDate).toLocaleDateString("fr-CH")} à {startTime} → {new Date(endDate).toLocaleDateString("fr-CH")} à {endTime}</p>
                    </div>
                  </div>
                )}

                {/* Véhicule */}
                {selectedVehicle && step >= 2 && (
                  <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-border">
                    <Car className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Véhicule</p>
                      <p className="text-sm font-semibold">{vehicles.find((v) => v.id === selectedVehicle)?.name}</p>
                    </div>
                  </div>
                )}

                {/* Km estimés */}
                <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-border">
                  <Package className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Km estimés</p>
                    <p className="text-sm font-semibold">{estKm} km</p>
                  </div>
                </div>

                {/* Prix estimé */}
                {price && (
                  <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2 border border-primary/20 ml-auto">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Estimation</p>
                      <p className="text-sm font-bold text-primary">
                        {isProCheckout ? `${fmtCHF(price.total / (1 + TVA_RATE))} CHF HT` : `${price.total.toFixed(2)} CHF`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Step 0 */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">{t("reservation.choosePlan")}</h2>

              {/* Pro tabs */}
              {isProCheckout && (
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={() => { setProTab("daily"); setSelectedCarnet(""); }}
                    className={`flex-1 px-4 py-2.5 text-sm font-semibold transition-colors ${
                      proTab === "daily" ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    Journalier / Week-end
                  </button>
                  <button
                    onClick={() => { setProTab("carnet"); setSelectedPlan(""); setWeekendPack(""); }}
                    className={`flex-1 px-4 py-2.5 text-sm font-semibold transition-colors ${
                      proTab === "carnet" ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    Carnet de jours
                  </button>
                </div>
              )}

              {/* Daily / Weekend plans (default tab or B2C) */}
              {(proTab === "daily" || !isProCheckout) && (
                <>
                  <div className="space-y-3">
                    {ratePlans.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => { setSelectedPlan(plan.id as RatePlanId); if (plan.id !== "pack-48h") setWeekendPack(""); }}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                          selectedPlan === plan.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-sm text-muted-foreground">{plan.subtitle}</div>
                          </div>
                          <span className="text-lg font-bold text-primary">
                            {isProCheckout
                              ? `${fmtCHF(plan.priceValue / (1 + TVA_RATE))} CHF HT${plan.isFlat ? "" : " / jour"}`
                              : plan.priceDisplay}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Pack 48h sub-selection */}
                  {selectedPlan === "pack-48h" && (
                    <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                      <h3 className="font-medium text-sm">Choisissez votre Pack 48h :</h3>
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
                            <span className="text-sm font-bold text-primary">
                              {isProCheckout
                                ? `${fmtCHF(pack.price / (1 + TVA_RATE))} CHF HT`
                                : `${pack.price} CHF (TTC)`}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedPlan && !isPack && (
                    <div className="space-y-4">
                      <h3 className="font-medium">{t("reservation.rentalDates")}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium mb-1">{t("reservation.startDate")}</label>
                          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                          <div>
                            <label className="block text-sm font-medium mb-1">{t("reservation.startTime", "Heure de début")}</label>
                            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium mb-1">{t("reservation.endDate")}</label>
                          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                          <div>
                            <label className="block text-sm font-medium mb-1">{t("reservation.endTime", "Heure de fin")}</label>
                            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Carnet tab (pro only) */}
              {isProCheckout && proTab === "carnet" && (
                <div className="space-y-3">
                  {CARNETS.map((carnet) => (
                    <button
                      key={carnet.id}
                      onClick={() => setSelectedCarnet(carnet.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                        selectedCarnet === carnet.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Carnet {carnet.days} jours</div>
                          <div className="text-sm text-muted-foreground">{carnet.kmPerDay} km/jour inclus</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{fmtCHF(carnet.totalHT)} CHF HT</div>
                          <div className="text-xs text-muted-foreground">{fmtCHF(carnet.perDayHT)} CHF HT/jour</div>
                        </div>
                      </div>
                    </button>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Km supplémentaires : {EXTRA_KM_RATE_PRO_HT.toFixed(2)} CHF HT/km (0,70 CHF TTC)
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">{t("reservation.estKm")}</label>
                <input type="number" value={estKm} onChange={(e) => setEstKm(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" min={0} />
                <p className="text-xs text-muted-foreground mt-1">
                  {isPack ? t("reservation.kmIncludedPack") : proTab === "carnet" && selectedCarnet ? `${CARNETS.find(c => c.id === selectedCarnet)?.kmPerDay || 200} km/jour inclus` : t("reservation.kmIncludedDay")}
                  {" · "}{isProCheckout && proTab === "carnet" ? `${EXTRA_KM_RATE_PRO_HT.toFixed(2)} CHF HT/km` : `${EXTRA_KM_RATE.toFixed(2)} ${t("reservation.extraKmRate")}`}
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
                        {isPackWithSub
                          ? price.planName
                          : isPack
                            ? t("reservation.packFlat")
                            : `${price.planName} (${price.days} ${price.days > 1 ? t("reservation.days") : t("reservation.day")})`}
                      </span>
                      <span>{isProCheckout ? `${fmtCHF(price.baseTotal / (1 + TVA_RATE))} CHF HT` : `${price.baseTotal} CHF`}</span>
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
                            <span>{isProCheckout ? `${fmtCHF(opt.price / (1 + TVA_RATE))} CHF HT` : `${opt.price} CHF`}</span>
                          </div>
                        );
                      })}
                    <div className="flex justify-between text-muted-foreground">
                      <span>{t("reservation.kmIncluded")}</span>
                      <span>{price.includedKm} km</span>
                    </div>
                    {price.extraKm > 0 && (
                      <div className="flex justify-between">
                        <span>{t("reservation.extraKmLabel")} ({price.extraKm} km × {isProCheckout ? `${EXTRA_KM_RATE_PRO_HT.toFixed(2)} CHF HT` : `${EXTRA_KM_RATE.toFixed(2)} CHF`})</span>
                        <span>{isProCheckout ? `${fmtCHF(price.extraKmCost / (1 + TVA_RATE))} CHF HT` : `${price.extraKmCost.toFixed(2)} CHF`}</span>
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
                      <>
                        {promoValid && discountedTotal !== null && (
                          <>
                            <div className="flex justify-between pt-2 border-t">
                              <span>Sous-total</span>
                              <span>{price.total.toFixed(2)} CHF</span>
                            </div>
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                              <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" /> Code {promoCode.toUpperCase()} (-{promoValid.discount_percent}%)</span>
                              <span>-{(discountAmount || 0).toFixed(2)} CHF</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between font-bold text-base pt-2 border-t">
                          <span>{t("reservation.totalEstimate")}</span>
                          <span className="text-primary">{(discountedTotal ?? price.total).toFixed(2)} CHF</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Contact info */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3 border">
                <h3 className="font-semibold">{t("reservation.contactInfo")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">{t("reservation.contactName")} *</label>
                    <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t("reservation.contactEmail")} *</label>
                    <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t("reservation.contactPhoneLabel")} *</label>
                    <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" required />
                  </div>
                </div>
              </div>

              {/* Promo code */}
              {!isProCheckout && (
                <div className="bg-muted/30 rounded-lg p-4 space-y-3 border">
                  <h3 className="font-semibold flex items-center gap-2"><Tag className="h-4 w-4 text-primary" /> Code promo</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoValid(null); setPromoError(""); }}
                      placeholder="Entrez votre code"
                      className="flex-1 px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none uppercase"
                    />
                    <Button variant="outline" size="sm" onClick={handleApplyPromo} disabled={promoChecking || !promoCode.trim() || !contactEmail.trim()}>
                      {promoChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Appliquer"}
                    </Button>
                  </div>
                  {!contactEmail.trim() && promoCode.trim() && (
                    <p className="text-xs text-muted-foreground">Veuillez d'abord renseigner votre email ci-dessus.</p>
                  )}
                  {promoError && <p className="text-xs text-destructive">{promoError}</p>}
                  {promoValid && <p className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Code appliqué : -{promoValid.discount_percent}% de réduction</p>}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>{t("reservation.back")}</Button>
                <Button variant="hero" onClick={handleConfirm} disabled={!canConfirm || isSending}>
                  {isSending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  {isSending ? t("reservation.redirecting", "Redirection vers le paiement…") : t("reservation.payNow", "Payer et confirmer")}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t("reservation.microlegal")}</p>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </main>
  );
};

export default Reservation;
