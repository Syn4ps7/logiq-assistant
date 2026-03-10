import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/VehicleCard";
import { vehicles } from "@/data/vehicles";
import { Key, MapPin, Zap, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroFleet from "@/assets/hero-fleet.png";

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

  const whyFeatures = [
    { icon: Key, titleKey: "why.digital", descKey: "why.digitalDesc" },
    { icon: MapPin, titleKey: "why.geolocated", descKey: "why.geolocatedDesc" },
    { icon: Zap, titleKey: "why.fast", descKey: "why.fastDesc" },
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
        />
        {/* Light overlay for readability */}
        <div className="absolute inset-0 bg-background/40" />
        <div className="absolute inset-0 gradient-hero" />

        <motion.div style={{ opacity: heroOpacity }} className="relative container py-20 lg:py-32">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/10 border border-foreground/30 text-foreground text-xs font-semibold mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Riviera Vaudoise · 24/7
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] mb-5"
            >
              {t("hero.title1")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl"
            >
              {t("hero.subtitle")}
            </motion.p>
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
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xs sm:text-sm text-muted-foreground tracking-wide"
            >
              {t("hero.reassuranceLine")}
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* Why LogIQ */}
      <section className="py-16 bg-card border-t border-border" aria-label="Pourquoi LogIQ">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {whyFeatures.map((f, i) => (
              <motion.div
                key={f.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-6 rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-yellow transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold mb-1.5">{t(f.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(f.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* À propos */}
      <section className="py-16 lg:py-24" aria-label="À propos de LogIQ Transport">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">{t("about.title")}</h2>
            <p className="text-lg font-semibold text-primary mb-6">{t("about.hook")}</p>
          </motion.div>

          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
              <p>{t("about.p1")}</p>
              <p className="mt-3">{t("about.p2")}</p>
              <p className="mt-3 font-semibold text-foreground">{t("about.p3")}</p>
              <p className="mt-3">{t("about.p4")}</p>
              <p className="mt-3">{t("about.p5")}</p>
            </motion.div>

            {/* Solution */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }} className="pt-6 border-t border-border">
              <h3 className="text-xl font-bold text-foreground mb-3">{t("about.solutionTitle")}</h3>
              <p>{t("about.solution1")}</p>
              <p className="mt-3">{t("about.solution2")}</p>
              <p className="mt-3">{t("about.solution3")}</p>
              <p className="mt-3 font-semibold text-foreground">{t("about.solution4")}</p>
              <p className="mt-3">{t("about.solution5")}</p>
              <ul className="mt-3 space-y-2">
                {(t("about.solutionList", { returnObjects: true }) as string[]).map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">{t("about.solution6")}</p>
            </motion.div>

            {/* Hubs */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="pt-6 border-t border-border">
              <h3 className="text-xl font-bold text-foreground mb-3">{t("about.hubTitle")}</h3>
              <p>{t("about.hub1")}</p>
              <p className="mt-3">{t("about.hub2")}</p>
              <ul className="mt-3 space-y-2">
                {(t("about.hubList", { returnObjects: true }) as string[]).map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">{t("about.hub3")}</p>
              <p className="mt-3 font-semibold text-foreground">{t("about.hub4")}</p>
            </motion.div>

            {/* Philosophie */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 }} className="pt-6 border-t border-border">
              <h3 className="text-xl font-bold text-foreground mb-3">{t("about.philoTitle")}</h3>
              <p className="mb-4">{t("about.philoIntro")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(t("about.philoItems", { returnObjects: true }) as { title: string; desc: string }[]).map((item, i) => (
                  <div key={i} className="p-5 rounded-xl border border-border bg-card">
                    <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                    <p className="text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mission */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="pt-6 border-t border-border">
              <h3 className="text-xl font-bold text-foreground mb-3">{t("about.missionTitle")}</h3>
              <p>{t("about.mission1")}</p>
              <p className="mt-3 text-lg font-semibold text-foreground">{t("about.mission2")}</p>
              <p className="mt-3">{t("about.mission3")}</p>
              <p className="mt-3 italic text-foreground">{t("about.mission4")}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-industrial border-t border-border" aria-label="Appel à l'action">
        <div className="container text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4 text-white">{t("cta.title")}</h2>
          <p className="text-lg text-white/70 mb-8">{t("cta.subtitle")}</p>
          <div className="flex justify-center gap-3">
            <Link to="/reservation">
              <Button variant="hero" size="lg">{t("cta.book")}</Button>
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
