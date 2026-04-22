import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useSeo } from "@/hooks/use-seo";
import { useState } from "react";
import { Building2, ChevronRight, Fuel, CreditCard, MapPin, IdCard, ShieldCheck, LogIn, Check, Sparkles, Smartphone, Clock, TrendingDown, FileText } from "lucide-react";
import { motion } from "framer-motion";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/** Format a number to 2 decimals with Swiss thousands separator */
const fmt = (v: number) =>
  v.toLocaleString("fr-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Inline price display: HT primary, TTC secondary */
const PriceHT = ({ ht, ttc, suffix = "" }: { ht: number; ttc: number; suffix?: string }) => (
  <div>
    <span className="font-semibold">{fmt(ht)} CHF HT{suffix}</span>
    <br />
    <span className="text-xs text-muted-foreground">{fmt(ttc)} CHF TTC</span>
  </div>
);

const Pro = () => {
  const { t } = useTranslation();
  useSeo("seo.proTitle", "seo.proDesc");
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
              <Link to="/pro-login">
                <Button variant="hero-outline" size="lg" className="gap-1.5">
                  <LogIn className="h-4 w-4" /> Connexion
                </Button>
              </Link>
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
                    <PriceHT ht={128.60} ttc={139.00} suffix={` / ${t("pro.day")}`} />
                  </TableCell>
                  <TableCell className="text-right">200 km/{t("pro.day")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t("pro.flexWeekend")}</TableCell>
                  <TableCell className="text-right">
                    <PriceHT ht={156.35} ttc={169.00} suffix={` / ${t("pro.day")}`} />
                  </TableCell>
                  <TableCell className="text-right">200 km/{t("pro.day")}</TableCell>
                </TableRow>
                <TableRow className="bg-muted/30">
                  <TableCell className="font-medium">{t("pro.extraKm")}</TableCell>
                  <TableCell className="text-right" colSpan={2}>
                    <PriceHT ht={0.55} ttc={0.59} suffix="/km" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* Carnets Pro - Pricing Table */}
      <section className="py-16 bg-card" aria-labelledby="carnets-heading">
        <div className="container max-w-6xl">
          <header className="text-center max-w-2xl mx-auto mb-12">
            <h2 id="carnets-heading" className="text-3xl font-bold mb-3">
              Carnets de jours prépayés
            </h2>
            <p className="text-foreground/70">
              Choisissez la formule adaptée à vos besoins. Plus votre carnet est grand, plus le tarif journalier est avantageux.
            </p>
          </header>

          {/* Sales arguments */}
          <ul
            role="list"
            aria-label="Avantages des carnets prépayés"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12 list-none p-0"
          >
            {[
              { icon: Smartphone, text: "100% Autonome via Fleetee" },
              { icon: Clock, text: "Aucune attente au guichet" },
              { icon: TrendingDown, text: "Économie jusqu'à 27%" },
              { icon: FileText, text: "Facturation simplifiée" },
            ].map((arg, i) => (
              <li key={i} className="flex items-center gap-2 p-3 rounded-lg border bg-background">
                <arg.icon className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                <span className="text-xs font-medium text-foreground">{arg.text}</span>
              </li>
            ))}
          </ul>

          {/* 3-column pricing */}
          <div
            role="list"
            aria-label="Comparatif des carnets de jours prépayés"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
          >
            {/* DISCOVERY */}
            <article
              role="listitem"
              aria-labelledby="plan-discovery-title"
              className="flex flex-col rounded-2xl border bg-background p-6 lg:p-8"
            >
              <header className="mb-6">
                <h3
                  id="plan-discovery-title"
                  className="text-lg font-bold text-foreground mb-1"
                >
                  Carnet Discovery
                </h3>
                <p className="text-sm text-foreground/70 mb-4">10 jours · Validité 12 mois</p>
                <p className="flex items-baseline gap-1.5" aria-label="Prix : 1450 francs suisses hors taxes">
                  <span className="text-4xl font-bold text-foreground" aria-hidden="true">1’450</span>
                  <span className="text-sm font-semibold text-foreground/70" aria-hidden="true">CHF HT</span>
                </p>
                <p className="text-sm text-foreground/70 mt-1">
                  <span className="sr-only">Soit </span>145.- / jour
                </p>
              </header>
              <ul className="space-y-3 mb-8 flex-1" aria-label="Inclus dans le carnet Discovery">
                {[
                  "Accès 24/7 via Smartphone (Fleetee)",
                  "100 km inclus / jour",
                  "Kit de base (4 sangles + couvertures)",
                  "Support client prioritaire",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link
                  to="/contact?subject=carnet-discovery"
                  aria-label="Commander le carnet Discovery 10 jours"
                >
                  Commander mon carnet
                </Link>
              </Button>
            </article>

            {/* BUSINESS */}
            <article
              role="listitem"
              aria-labelledby="plan-business-title"
              className="flex flex-col rounded-2xl border bg-background p-6 lg:p-8 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            >
              <header className="mb-6">
                <h3
                  id="plan-business-title"
                  className="text-lg font-bold text-foreground mb-1"
                >
                  Carnet Business
                </h3>
                <p className="text-sm text-foreground/70 mb-4">20 jours · Validité 18 mois</p>
                <p className="flex items-baseline gap-1.5" aria-label="Prix : 2600 francs suisses hors taxes">
                  <span className="text-4xl font-bold text-foreground" aria-hidden="true">2’600</span>
                  <span className="text-sm font-semibold text-foreground/70" aria-hidden="true">CHF HT</span>
                </p>
                <p className="text-sm text-foreground/70 mt-1">
                  <span className="sr-only">Soit </span>130.- / jour
                </p>
              </header>
              <ul className="space-y-3 mb-8 flex-1" aria-label="Inclus dans le carnet Business">
                {[
                  "Inclus Pack Discovery",
                  "Diable de manutention inclus",
                  "Priorité de réservation (garanti sous 24h)",
                  "Facturation mensuelle détaillée",
                  "Tolérance nettoyage (usage pro)",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link
                  to="/contact?subject=carnet-business"
                  aria-label="Commander le carnet Business 20 jours"
                >
                  Commander mon carnet
                </Link>
              </Button>
            </article>

            {/* PREMIUM - HIGHLIGHTED */}
            <article
              role="listitem"
              aria-labelledby="plan-premium-title"
              aria-describedby="plan-premium-badge"
              className="relative flex flex-col rounded-2xl border-2 border-primary bg-background p-6 lg:p-8 shadow-lg md:scale-105 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span
                  id="plan-premium-badge"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider"
                >
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  Meilleur prix
                </span>
              </div>
              <header className="mb-6">
                <h3
                  id="plan-premium-title"
                  className="text-lg font-bold text-foreground mb-1"
                >
                  Carnet Premium
                </h3>
                <p className="text-sm text-foreground/70 mb-4">40 jours · Validité 18 mois</p>
                <p className="flex items-baseline gap-1.5" aria-label="Prix : 4800 francs suisses hors taxes">
                  <span className="text-4xl font-bold text-foreground" aria-hidden="true">4’800</span>
                  <span className="text-sm font-semibold text-foreground/70" aria-hidden="true">CHF HT</span>
                </p>
                <p className="text-sm text-foreground/70 mt-1">
                  <span className="sr-only">Soit </span>120.- / jour
                </p>
              </header>
              <ul className="space-y-3 mb-8 flex-1" aria-label="Inclus dans le carnet Premium">
                {[
                  "Inclus Pack Business",
                  "Assurance Sérénité incluse (franchise réduite)",
                  "Kit complet : Diable + Chariot + Protections",
                  "Ligne VIP WhatsApp",
                  "Pool kilométrique flexible (4’000 km à répartir)",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="default" size="lg" className="w-full">
                <Link
                  to="/contact?subject=carnet-premium"
                  aria-label="Commander le carnet Premium 40 jours, notre meilleur prix"
                >
                  Commander mon carnet
                </Link>
              </Button>
            </article>
          </div>

          <p className="text-xs text-foreground/70 text-center mt-8" role="note">
            Tous les prix sont affichés hors taxes (TVA 8.1% en sus).
          </p>
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
