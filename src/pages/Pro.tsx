import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Building2, ChevronRight, Fuel, CreditCard, MapPin, IdCard, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const Pro = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Track conversion event
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
                  <TableCell className="text-right">149 CHF / {t("pro.day")}</TableCell>
                  <TableCell className="text-right">200 km/{t("pro.day")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t("pro.flexWeekend")}</TableCell>
                  <TableCell className="text-right">179 CHF / {t("pro.day")}</TableCell>
                  <TableCell className="text-right">200 km/{t("pro.day")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t("pro.flexPack")}</TableCell>
                  <TableCell className="text-right">360 CHF</TableCell>
                  <TableCell className="text-right">400 km</TableCell>
                </TableRow>
                <TableRow className="bg-muted/30">
                  <TableCell className="font-medium">{t("pro.extraKm")}</TableCell>
                  <TableCell className="text-right" colSpan={2}>0.60 CHF/km</TableCell>
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
                  <TableCell className="text-right">1'290 CHF</TableCell>
                  <TableCell className="text-right">129 CHF/{t("pro.day")}</TableCell>
                  <TableCell className="text-right">200 km/{t("pro.day")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t("pro.carnet20")}</TableCell>
                  <TableCell className="text-right">2'440 CHF</TableCell>
                  <TableCell className="text-right">122 CHF/{t("pro.day")}</TableCell>
                  <TableCell className="text-right">200 km/{t("pro.day")}</TableCell>
                </TableRow>
                <TableRow className="bg-accent/5">
                  <TableCell className="font-medium">{t("pro.carnet40")}</TableCell>
                  <TableCell className="text-right font-semibold">4'600 CHF</TableCell>
                  <TableCell className="text-right font-semibold">115 CHF/{t("pro.day")}</TableCell>
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
            <div className="p-8 bg-primary/5 rounded-xl border border-primary/20 text-center">
              <p className="font-semibold text-primary text-lg">{t("pro.formThanks")}</p>
              <p className="text-sm text-muted-foreground mt-2">{t("pro.formThanksDesc")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("pro.fieldCompany")}</label>
                  <input required type="text" maxLength={100} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("pro.fieldName")}</label>
                  <input required type="text" maxLength={100} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("pro.fieldPhone")}</label>
                  <input required type="tel" maxLength={20} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("pro.fieldEmail")}</label>
                  <input required type="email" maxLength={255} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("pro.fieldCity")}</label>
                  <input type="text" maxLength={100} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("pro.fieldVolume")}</label>
                  <input type="text" maxLength={100} placeholder={t("pro.fieldVolumePlaceholder")} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("pro.fieldNeed")}</label>
                <textarea required rows={3} maxLength={1000} className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none" />
              </div>
              <Button variant="petrol" type="submit" size="lg" className="w-full sm:w-auto">
                {t("pro.ctaOpen")}
                <ChevronRight className="h-4 w-4 ml-1" />
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
