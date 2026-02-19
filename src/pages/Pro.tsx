import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Building2, ChevronRight, Fuel, CreditCard, MapPin, IdCard, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const TVA_RATE = 0.081;

/** Round to nearest 0.05 CHF (Swiss rounding) */
const roundCHF = (v: number) => Math.round(v / 0.05) * 0.05;

/** Format a number to 2 decimals with Swiss thousands separator */
const fmt = (v: number) => {
  const rounded = roundCHF(v);
  // Use apostrophe as thousands separator
  return rounded.toLocaleString("fr-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/** Compute HT from TTC */
const ht = (ttcVal: number) => roundCHF(ttcVal / (1 + TVA_RATE));

/** Inline price display: HT primary (computed from TTC), TTC secondary */
const PriceHT = ({ ttcVal, suffix = "" }: { ttcVal: number; suffix?: string }) => (
  <div>
    <span className="font-semibold">{fmt(ht(ttcVal))} CHF HT{suffix}</span>
    <br />
    <span className="text-xs text-muted-foreground">{fmt(ttcVal)} CHF TTC</span>
  </div>
);

const Pro = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const { error } = await supabase.from("pro_leads").insert({
      company_name: (formData.get("company_name") as string).trim(),
      contact_name: (formData.get("contact_name") as string).trim(),
      phone: (formData.get("phone") as string).trim(),
      email: (formData.get("email") as string).trim(),
      city: (formData.get("city") as string)?.trim() || null,
      estimated_volume: (formData.get("estimated_volume") as string)?.trim() || null,
      need: (formData.get("need") as string).trim(),
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Erreur", description: "Une erreur est survenue. Veuillez réessayer.", variant: "destructive" });
      return;
    }

    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "lead_pro_submit");
    }
    setSubmitted(true);
  };

  const scrollToForm = () => {
    document.getElementById("pro-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16 lg:py-20">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-xs font-medium mb-6">
              <Building2 className="h-3.5 w-3.5" />
              {t("pro.badge")}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              {t("pro.title")}
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl leading-relaxed">
              {t("pro.subtitle")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="hero" size="lg" onClick={scrollToForm}>
                {t("pro.ctaOpen")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
              <Button variant="hero-outline" size="lg" onClick={scrollToForm}>
                {t("pro.ctaQuote")}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pro Flex */}
      <section className="py-16" aria-label="Pro Flex">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-2">{t("pro.flexTitle")}</h2>
          <p className="text-muted-foreground mb-6">{t("pro.flexConditions")}</p>

          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">{t("pro.tableFormula")}</TableHead>
                  <TableHead className="font-semibold text-right">{t("pro.tablePrice")}</TableHead>
                  <TableHead className="font-semibold text-right">{t("pro.tableKm")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{t("pro.flexWeekday")}</TableCell>
                  <TableCell className="text-right">
                    <PriceHT ttcVal={149} suffix={` / ${t("pro.day")}`} />
                  </TableCell>
                  <TableCell className="text-right">200 km/{t("pro.day")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t("pro.flexWeekend")}</TableCell>
                  <TableCell className="text-right">
                    <PriceHT ttcVal={179} suffix={` / ${t("pro.day")}`} />
                  </TableCell>
                  <TableCell className="text-right">200 km/{t("pro.day")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t("pro.flexPack")}</TableCell>
                  <TableCell className="text-right">
                    <PriceHT ttcVal={360} />
                  </TableCell>
                  <TableCell className="text-right">400 km</TableCell>
                </TableRow>
                <TableRow className="bg-muted/30">
                  <TableCell className="font-medium">{t("pro.extraKm")}</TableCell>
                  <TableCell className="text-right" colSpan={2}>
                    <PriceHT ttcVal={0.60} suffix="/km" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* Carnets Pro */}
      <section className="py-16 bg-card" aria-label="Carnets Pro">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-2">{t("pro.carnetsTitle")}</h2>
          <p className="text-muted-foreground mb-6">{t("pro.carnetsConditions")}</p>

          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">{t("pro.tableCarnet")}</TableHead>
                  <TableHead className="font-semibold text-right">{t("pro.tableTotal")}</TableHead>
                  <TableHead className="font-semibold text-right">{t("pro.tableUnit")}</TableHead>
                  <TableHead className="font-semibold text-right">{t("pro.tableKm")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{t("pro.carnet10")}</TableCell>
                  <TableCell className="text-right">
                    <PriceHT ttcVal={1290} />
                  </TableCell>
                  <TableCell className="text-right">
                    <PriceHT ttcVal={129} suffix={`/${t("pro.day")}`} />
                  </TableCell>
                  <TableCell className="text-right">200 km/{t("pro.day")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t("pro.carnet20")}</TableCell>
                  <TableCell className="text-right">
                    <PriceHT ttcVal={2440} />
                  </TableCell>
                  <TableCell className="text-right">
                    <PriceHT ttcVal={122} suffix={`/${t("pro.day")}`} />
                  </TableCell>
                  <TableCell className="text-right">200 km/{t("pro.day")}</TableCell>
                </TableRow>
                <TableRow className="bg-accent/5">
                  <TableCell className="font-medium">{t("pro.carnet40")}</TableCell>
                  <TableCell className="text-right">
                    <PriceHT ttcVal={4600} />
                  </TableCell>
                  <TableCell className="text-right">
                    <PriceHT ttcVal={115} suffix={`/${t("pro.day")}`} />
                  </TableCell>
                  <TableCell className="text-right">200 km/{t("pro.day")}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* Paiement / Facturation */}
      <section className="py-16" aria-label="Paiement">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">{t("pro.paymentTitle")}</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-background">
              <CreditCard className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">{t("pro.paymentImmediate")}</p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-background">
              <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">{t("pro.paymentInvoice")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mini FAQ */}
      <section className="py-16 bg-card" aria-label="Règles clés">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">{t("pro.rulesTitle")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: IdCard, text: t("pro.ruleDriver") },
              { icon: MapPin, text: t("pro.ruleTerritory") },
              { icon: Fuel, text: t("pro.ruleFuel") },
              { icon: ShieldCheck, text: t("pro.ruleDeposit") },
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg border bg-background">
                <rule.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">{rule.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link to="/cgl" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              {t("pro.cglLink")} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="pro-form" className="py-16" aria-label="Formulaire Pro">
        <div className="container max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">{t("pro.formTitle")}</h2>
          <p className="text-muted-foreground mb-8">{t("pro.formSubtitle")}</p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-4"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <p className="font-semibold text-primary text-lg">{t("pro.formThanks")}</p>
              <p className="text-sm text-muted-foreground">{t("pro.formThanksDesc")}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("pro.fieldCompany")}</label>
                  <input name="company_name" required type="text" maxLength={100} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("pro.fieldName")}</label>
                  <input name="contact_name" required type="text" maxLength={100} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("pro.fieldPhone")}</label>
                  <input name="phone" required type="tel" maxLength={20} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("pro.fieldEmail")}</label>
                  <input name="email" required type="email" maxLength={255} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("pro.fieldCity")}</label>
                  <input name="city" type="text" maxLength={100} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("pro.fieldVolume")}</label>
                  <input name="estimated_volume" type="text" maxLength={100} placeholder={t("pro.fieldVolumePlaceholder")} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("pro.fieldNeed")}</label>
                <textarea name="need" required rows={3} maxLength={1000} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none" />
              </div>
              <Button variant="petrol" type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
                {submitting ? "Envoi…" : t("pro.ctaOpen")}
                {!submitting && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">{t("pro.bottomCtaTitle")}</h2>
          <p className="text-lg opacity-80 mb-8">{t("pro.bottomCtaSubtitle")}</p>
          <div className="flex justify-center gap-3">
            <Button variant="hero" size="lg" onClick={scrollToForm}>
              {t("pro.ctaOpen")}
            </Button>
            <Link to="/contact">
              <Button variant="hero-outline" size="lg">{t("pro.ctaContact")}</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Pro;
