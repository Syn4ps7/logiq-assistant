import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Truck, Package, Ruler, Users, Fuel } from "lucide-react";
import { dispatchLogiqEvent } from "@/lib/logiq";
import type { Vehicle } from "@/data/vehicles";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const handleClick = () => {
    dispatchLogiqEvent("logiq:vehicleClick", { vehicleId: vehicle.id });
  };

  return (
    <div
      className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      data-vehicle-id={vehicle.id}
      data-daily-price={vehicle.priceDay}
      data-volume={vehicle.specs.volume}
      data-height={vehicle.specs.height}
      onClick={handleClick}
      role="article"
      aria-label={`${vehicle.name} — CHF ${vehicle.priceDay}/jour`}
    >
      <div className="aspect-[16/10] bg-muted flex items-center justify-center">
        <Truck className="h-16 w-16 text-muted-foreground/30" />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">{vehicle.name}</h3>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">{vehicle.priceDay}</span>
            <span className="text-sm text-muted-foreground"> CHF/jour</span>
          </div>
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
