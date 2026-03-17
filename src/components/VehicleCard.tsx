import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Ruler, Users, Fuel, ArrowRight, X, Check, Gauge, Cog } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { dispatchLogiqEvent } from "@/lib/logiq";
import { useTranslation } from "react-i18next";
import type { Vehicle } from "@/data/vehicles";
import { vehicleOptions } from "@/data/vehicles";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const [showInterior, setShowInterior] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { t } = useTranslation();

  const handleClick = () => {
    dispatchLogiqEvent("logiq:vehicleClick", { vehicleId: vehicle.id });
  };

  const isComingSoon = vehicle.comingSoon === true;

  if (isComingSoon) {
    return (
      <div
        className="group bg-card rounded-xl border border-border overflow-hidden relative"
        data-vehicle-id={vehicle.id}
        role="article"
        aria-label={`${vehicle.name} — bientôt disponible`}
      >
        {/* Image section — blurred */}
        <div className="relative aspect-[16/10] bg-secondary overflow-hidden">
          <img
            src={vehicle.images.exterior}
            alt={`${vehicle.name} — bientôt disponible`}
            className="w-full h-full object-cover blur-sm scale-105 brightness-75"
            loading="lazy"
            decoding="async"
          />
          {/* Coming soon overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/30 backdrop-blur-[2px]">
            <span className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide shadow-lg">
              Bientôt disponible
            </span>
          </div>
        </div>

        {/* Content — muted */}
        <div className="p-6 opacity-60">
          <div className="mb-4">
            <h3 className="font-bold text-lg">{vehicle.name}</h3>
            <p className="text-sm text-muted-foreground italic mt-1">{vehicle.tagline}</p>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { icon: Package, label: vehicle.specs.volume },
              { icon: Ruler, label: `H: ${vehicle.specs.height}` },
              { icon: Users, label: `${vehicle.specs.seats} ${t("vehicleCard.seats")}` },
              { icon: Fuel, label: vehicle.specs.transmission },
            ].map((spec, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary rounded-lg px-3 py-2">
                <spec.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{spec.label}</span>
              </div>
            ))}
          </div>

          {/* Disabled CTA */}
          <Button variant="outline" className="w-full" size="sm" disabled>
            Bientôt disponible
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-yellow transition-all duration-300 overflow-hidden"
      data-vehicle-id={vehicle.id}
      data-daily-price={vehicle.priceDay}
      data-volume="13m3"
      data-height={vehicle.specs.height}
      onClick={handleClick}
      role="article"
      aria-label={`${vehicle.name} — CHF ${vehicle.priceDay}/jour`}
    >
      {/* Image section */}
      <div className="relative aspect-[16/10] bg-secondary overflow-hidden">
        <img
          src={showInterior ? vehicle.images.interior : vehicle.images.exterior}
          alt={showInterior ? `${vehicle.name} — volume de chargement` : `${vehicle.name} — vue extérieure`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Image toggle */}
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); setShowInterior(false); }}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all backdrop-blur-sm ${
              !showInterior
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-background/70 text-foreground hover:bg-background/90"
            }`}
          >
            {t("vehicleCard.exterior")}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowInterior(true); }}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all backdrop-blur-sm ${
              showInterior
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-background/70 text-foreground hover:bg-background/90"
            }`}
          >
            {t("vehicleCard.interior")}
          </button>
        </div>

        {/* Availability badge — yellow */}
        {vehicle.availability && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse-gentle" />
            {t("vehicleCard.from")} {vehicle.priceDay} {t("vehicleCard.perDay")}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{vehicle.name}</h3>
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: Package, label: vehicle.specs.volume },
            { icon: Ruler, label: `H: ${vehicle.specs.height}` },
            { icon: Users, label: `${vehicle.specs.seats} ${t("vehicleCard.seats")}` },
            { icon: Fuel, label: vehicle.specs.transmission },
          ].map((spec, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary rounded-lg px-3 py-2">
              <spec.icon className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{spec.label}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {(showAllFeatures ? vehicle.features : vehicle.features.slice(0, 3)).map((feature) => (
            <span key={feature} className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full font-medium">
              {feature}
            </span>
          ))}
          {vehicle.features.length > 3 && !showAllFeatures && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowAllFeatures(true); }}
              className="text-xs bg-secondary px-2.5 py-1 rounded-full text-muted-foreground font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            >
              +{vehicle.features.length - 3}
            </button>
          )}
          {showAllFeatures && vehicle.features.length > 3 && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowAllFeatures(false); }}
              className="text-xs bg-secondary px-2.5 py-1 rounded-full text-muted-foreground font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            >
              {t("vehicleCard.showLess", "Moins")}
            </button>
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-2">
          <Link to={`/reservation?vehicle=${vehicle.id}`} className="flex-1">
            <Button variant="default" className="w-full group/btn" size="sm">
              {t("vehicleCard.book")}
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setShowDetails(true); }}>
            {t("vehicleCard.details")}
          </Button>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle>{vehicle.name}</DialogTitle>
            <DialogDescription>{t("vehicleCard.detailsDescription", "Caractéristiques et options disponibles")}</DialogDescription>
          </DialogHeader>

          <div className="rounded-lg overflow-hidden aspect-[16/10] bg-secondary">
            <img src={vehicle.images.exterior} alt={vehicle.name} className="w-full h-full object-cover" />
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">{t("vehicleCard.specifications", "Caractéristiques")}</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Package, label: `Volume: ${vehicle.specs.volume}` },
                { icon: Ruler, label: `Hauteur: ${vehicle.specs.height}` },
                { icon: Ruler, label: `Longueur: ${vehicle.specs.length}` },
                { icon: Gauge, label: `Charge: ${vehicle.specs.payload}` },
                { icon: Users, label: `${vehicle.specs.seats} ${t("vehicleCard.seats")}` },
                { icon: Cog, label: vehicle.specs.transmission },
                { icon: Fuel, label: vehicle.specs.fuel },
              ].map((spec, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary rounded-lg px-3 py-2">
                  <spec.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{spec.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">{t("vehicleCard.equipment", "Équipements")}</h4>
            <div className="flex flex-wrap gap-1.5">
              {vehicle.features.map((feature) => (
                <span key={feature} className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">{t("vehicleCard.availableOptions", "Options disponibles")}</h4>
            <div className="space-y-2">
              {vehicleOptions.map((option) => (
                <div key={option.id} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{option.name}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  <span className="text-sm font-bold text-primary whitespace-nowrap ml-2">{option.price} CHF</span>
                </div>
              ))}
            </div>
          </div>

          <Link to={`/reservation?vehicle=${vehicle.id}`} className="w-full">
            <Button variant="default" className="w-full" size="default">
              {t("vehicleCard.book")}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </DialogContent>
      </Dialog>
    </div>
  );
}
