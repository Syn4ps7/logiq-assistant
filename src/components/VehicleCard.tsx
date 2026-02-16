import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Ruler, Users, Fuel, ArrowRight } from "lucide-react";
import { dispatchLogiqEvent } from "@/lib/logiq";
import { useTranslation } from "react-i18next";
import type { Vehicle } from "@/data/vehicles";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const [showInterior, setShowInterior] = useState(false);
  const { t } = useTranslation();

  const handleClick = () => {
    dispatchLogiqEvent("logiq:vehicleClick", { vehicleId: vehicle.id });
  };

  return (
    <div
      className="group bg-card rounded-xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:border-primary/30"
      data-vehicle-id={vehicle.id}
      data-daily-price={vehicle.priceDay}
      data-volume="13m3"
      data-height={vehicle.specs.height}
      onClick={handleClick}
      role="article"
      aria-label={`${vehicle.name} — CHF ${vehicle.priceDay}/jour`}
    >
      {/* Image section with premium overlay */}
      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
        <img
          src={showInterior ? vehicle.images.interior : vehicle.images.exterior}
          alt={showInterior ? `${vehicle.name} — volume de chargement` : `${vehicle.name} — vue extérieure`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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

        {/* Availability badge */}
        {vehicle.availability && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-gentle" />
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
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <spec.icon className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{spec.label}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {vehicle.features.slice(0, 3).map((feature) => (
            <span key={feature} className="text-xs bg-primary/5 text-primary border border-primary/10 px-2.5 py-1 rounded-full font-medium">
              {feature}
            </span>
          ))}
          {vehicle.features.length > 3 && (
            <span className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground font-medium">
              +{vehicle.features.length - 3}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-2">
          <Link to={`/reservation?vehicle=${vehicle.id}`} className="flex-1">
            <Button variant="petrol" className="w-full group/btn" size="sm">
              {t("vehicleCard.book")}
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
          </Link>
          <Link to="/vehicles">
            <Button variant="outline" size="sm">{t("vehicleCard.details")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
