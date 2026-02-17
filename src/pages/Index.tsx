import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/VehicleCard";
import { vehicles } from "@/data/vehicles";
import { Shield, Clock, MapPin, Headphones, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import heroImage from "@/assets/hero-van.jpg";
import heroVideo from "@/assets/hero-video.mp4";

const Index = () => {
  const { t } = useTranslation();

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.6, 0]);

  const features = [
    { icon: Shield, titleKey: "reassurance.insurance", descKey: "reassurance.insuranceDesc" },
    { icon: Clock, titleKey: "reassurance.booking", descKey: "reassurance.bookingDesc" },
    { icon: MapPin, titleKey: "reassurance.area", descKey: "reassurance.areaDesc" },
    { icon: Headphones, titleKey: "reassurance.support", descKey: "reassurance.supportDesc" },
  ];

  return (
    <main>
      {/* Hero with video */}
      <section ref={heroRef} className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden" aria-label="Présentation">
        {/* Video background with parallax */}
        <motion.video
          autoPlay
          loop
          muted
          playsInline
          poster={heroImage}
          style={{ y: videoY, scale: videoScale }}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </motion.video>
        <div className="absolute inset-0 gradient-hero" />
        {/* Extra mobile overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/30 sm:bg-transparent" />

        {/* Subtle animated grain overlay for premium feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

        <motion.div style={{ opacity: heroOpacity }} className="relative container py-20 lg:py-32">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground text-xs font-medium mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Swiss Riviera · 24/7
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-[1.15] mb-5"
            >
              {t("hero.title1")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="text-base sm:text-lg lg:text-xl text-primary-foreground/80 mb-8 leading-relaxed max-w-xl"
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
                <Button variant="hero" size="lg" className="shadow-xl shadow-accent/20">
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
              className="text-xs sm:text-sm text-primary-foreground/60 tracking-wide"
            >
              {t("hero.reassuranceLine")}
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* Reassurance bar */}
      <section className="py-16 bg-card" aria-label="Nos avantages">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.titleKey} className="group p-6 rounded-xl border bg-background hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1.5">{t(f.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicles preview */}
      <section className="py-16" aria-label="Nos véhicules">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t("fleet.title")}</h2>
              <p className="text-muted-foreground">{t("fleet.subtitle")}</p>
            </div>
            <Link to="/vehicles" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              {t("fleet.viewAll")} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
              >
                <VehicleCard vehicle={v} />
              </motion.div>
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link to="/vehicles">
              <Button variant="outline">{t("fleet.viewAllMobile")}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground" aria-label="Appel à l'action">
        <div className="container text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-lg opacity-80 mb-8">{t("cta.subtitle")}</p>
          <div className="flex justify-center gap-3">
            <Link to="/reservation">
              <Button variant="hero" size="lg">{t("cta.book")}</Button>
            </Link>
            <Link to="/contact">
              <Button variant="hero-outline" size="lg">{t("cta.contact")}</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
