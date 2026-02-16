import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Ruler, Users, Fuel } from "lucide-react";
import { dispatchLogiqEvent } from "@/lib/logiq";
import type { Vehicle } from "@/data/vehicles";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const [showInterior, setShowInterior] = useState(false);

  const handleClick = () => {
    dispatchLogiqEvent("logiq:vehicleClick", { vehicleId: vehicle.id });
  };

  return (
    <div
      className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      data-vehicle-id={vehicle.id}
      data-daily-price={vehicle.priceDay}
      data-volume="13m3"
      data-height={vehicle.specs.height}
      onClick={handleClick}
      role="article"
      aria-label={`${vehicle.name} — CHF ${vehicle.priceDay}/jour`}
    >
      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
        <img
          src={showInterior ? vehicle.images.interior : vehicle.images.exterior}
          alt={showInterior ? `${vehicle.name} — volume de chargement` : `${vehicle.name} — vue extérieure`}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setShowInterior(false); }}
            className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
              !showInterior ? "bg-primary text-primary-foreground" : "bg-background/80 text-foreground hover:bg-background"
            }`}
          >
            Extérieur
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowInterior(true); }}
            className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
              showInterior ? "bg-primary text-primary-foreground" : "bg-background/80 text-foreground hover:bg-background"
            }`}
          >
            Intérieur
          </button>
        </div>
      </div>
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-semibold text-lg">{vehicle.name}</h3>
          <p className="text-sm text-muted-foreground">Dès {vehicle.priceDay} CHF/jour</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" />
            <span>{vehicle.specs.volume}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5" />
            <span>H: {vehicle.specs.height}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{vehicle.specs.seats} places</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="h-3.5 w-3.5" />
            <span>{vehicle.specs.transmission}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {vehicle.features.slice(0, 3).map((feature) => (
            <span key={feature} className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
              {feature}
            </span>
          ))}
          {vehicle.features.length > 3 && (
            <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
              +{vehicle.features.length - 3}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Link to={`/reservation?vehicle=${vehicle.id}`} className="flex-1">
            <Button variant="petrol" className="w-full" size="sm">Réserver</Button>
          </Link>
          <Link to="/vehicles">
            <Button variant="outline" size="sm">Détails</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
