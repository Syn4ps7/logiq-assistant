import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/VehicleCard";
import { vehicles } from "@/data/vehicles";
import { Shield, Clock, MapPin, Headphones, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-van.jpg";
import heroVideo from "@/assets/hero-video.mp4";

const Index = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Shield, titleKey: "reassurance.insurance", descKey: "reassurance.insuranceDesc" },
    { icon: Clock, titleKey: "reassurance.booking", descKey: "reassurance.bookingDesc" },
    { icon: MapPin, titleKey: "reassurance.area", descKey: "reassurance.areaDesc" },
    { icon: Headphones, titleKey: "reassurance.support", descKey: "reassurance.supportDesc" },
  ];

  return (
    <main>
      {/* Hero with video */}
      <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden" aria-label="Présentation">
        {/* Video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={heroImage}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 gradient-hero" />

        {/* Subtle animated grain overlay for premium feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

        <div className="relative container py-20 lg:py-28">
          <div className="max-w-xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-gentle" />
              Swiss Riviera · 24/7
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-4">
              {t("hero.title1")}<br />
              <span className="text-accent">{t("hero.title2")}</span> {t("hero.title3")}
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 leading-relaxed max-w-md">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/reservation">
                <Button variant="hero" size="lg" className="shadow-xl shadow-accent/20">
                  {t("hero.cta")}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link to="/rates">
                <Button variant="hero-outline" size="lg">{t("hero.ctaRates")}</Button>
              </Link>
            </div>
          </div>
        </div>
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
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
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
