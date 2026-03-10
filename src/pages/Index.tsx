import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Check, CalendarCheck, Smartphone, Truck, ShieldCheck, ClipboardCheck, Headphones, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroFleet from "@/assets/hero-fleet.webp";
import AboutSection from "@/components/about/AboutSection";

const Index = () => {
  const { t } = useTranslation();

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.6, 0]);

  const reassuranceItems = [
    t("hero.reassurance1"),
    t("hero.reassurance2"),
    t("hero.reassurance3"),
  ];

  const howItWorksSteps = [
    { icon: CalendarCheck, titleKey: "howItWorks.step1Title", descKey: "howItWorks.step1Desc" },
    { icon: Smartphone, titleKey: "howItWorks.step2Title", descKey: "howItWorks.step2Desc" },
    { icon: Truck, titleKey: "howItWorks.step3Title", descKey: "howItWorks.step3Desc" },
  ];

  const whyLogiqItems = t("whyLogiq.items", { returnObjects: true }) as string[];

  const trustItems = [
    { icon: ShieldCheck, text: (t("trust.items", { returnObjects: true }) as string[])[0] },
    { icon: ClipboardCheck, text: (t("trust.items", { returnObjects: true }) as string[])[1] },
    { icon: Headphones, text: (t("trust.items", { returnObjects: true }) as string[])[2] },
    { icon: RotateCcw, text: (t("trust.items", { returnObjects: true }) as string[])[3] },
  ];

  return (
    <main>
      {/* Hero – dark industrial */}
      <section ref={heroRef} className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden bg-background" aria-label="Présentation">
        <motion.img
          src={heroFleet}
          alt="LogIQ Transport — flotte utilitaires premium"
          style={{ y: imgY, scale: imgScale }}
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
          decoding="async"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-background/40" />
        <div className="absolute inset-0 gradient-hero" />

        <motion.div style={{ opacity: heroOpacity }} className="relative container py-20 lg:py-32">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/10 border border-foreground/30 text-foreground text-xs font-semibold mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Riviera Vaudoise · 24/7
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.15] lg:leading-[1.25] mb-2"
            >
              {t("hero.title1")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-base sm:text-lg lg:text-xl text-muted-foreground italic mb-5 max-w-xl"
            >
              {t("hero.subtitle")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="flex flex-wrap gap-x-5 gap-y-1.5 mb-8"
            >
              {[t("hero.highlight1"), t("hero.highlight2"), t("hero.highlight3")].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-sm sm:text-base text-foreground font-medium">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {item}
                </span>
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
              className="flex flex-wrap gap-3 mb-6"
            >
              <Link to="/reservation">
                <Button variant="hero" size="lg" className="shadow-yellow">
                  {t("hero.cta")}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link to="/rates">
                <Button variant="hero-outline" size="lg">{t("hero.ctaRates")}</Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-2 sm:gap-4"
            >
              {reassuranceItems.map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="py-16 lg:py-20 bg-card border-t border-border scroll-mt-20" aria-label="Comment ça marche">
        <div className="container max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl font-extrabold text-center mb-12"
          >
            {t("howItWorks.title")}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, i) => (
              <motion.div
                key={step.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="text-center"
              >
                <div className="relative mx-auto mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-yellow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-1.5">{t(step.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(step.descKey)}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-10"
          >
            <Link to="/reservation">
              <Button variant="hero" size="lg" className="shadow-yellow">
                {t("howItWorks.cta")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <AboutSection />

      {/* Pourquoi LogIQ */}
      <section className="py-16 bg-card border-t border-border" aria-label="Pourquoi LogIQ">
        <div className="container max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl font-extrabold mb-8"
          >
            {t("whyLogiq.title")}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left">
            {whyLogiqItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Confiance */}
      <section className="py-16 border-t border-border" aria-label="Confiance">
        <div className="container max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl font-extrabold text-center mb-10"
          >
            {t("trust.title")}
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {trustItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-card"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground leading-tight">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 gradient-industrial border-t border-border" aria-label="Appel à l'action">
        <div className="container text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4 text-white">{t("cta.title")}</h2>
          <p className="text-lg text-white/70 mb-8">{t("cta.subtitle")}</p>
          <div className="flex justify-center gap-3">
            <Link to="/reservation">
              <Button variant="hero" size="lg" className="shadow-yellow">{t("cta.book")}</Button>
            </Link>
            <Link to="/contact">
              <Button variant="hero-outline" size="lg" className="border-white text-white hover:bg-white hover:text-background">{t("cta.contact")}</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
