import { useMemo } from "react";
import { Gauge } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { KpiReservation, reservedDates, isInMonth, RED, ORANGE, GREEN } from "./types";
import { vehicles } from "@/data/vehicles";

interface Props {
  reservations: KpiReservation[];
  selectedYear: number;
  selectedMonth: number;
}

export function CapacityBlock({ reservations, selectedYear, selectedMonth }: Props) {
  const activeVehicles = vehicles.filter((v) => v.availability);
  const vehicleCount = activeVehicles.length || 1;
  const workingDays = 25;
  const capacityTotal = vehicleCount * workingDays;

  const matchMonth = (d: Date) => isInMonth(d, selectedYear, selectedMonth);

  const data = useMemo(() => {
    let daysSold = 0;
    reservations.forEach((r) => {
      if (r.status === "canceled") return;
      const dates = reservedDates(r);
      daysSold += dates.filter(matchMonth).length;
    });

    const remaining = Math.max(0, capacityTotal - daysSold);
    const occupancyPct = Math.round((daysSold / capacityTotal) * 100);

    return { daysSold, remaining, occupancyPct };
  }, [reservations, selectedYear, selectedMonth, capacityTotal]);

  const barColor = data.occupancyPct > 85 ? GREEN : data.occupancyPct >= 50 ? ORANGE : RED;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
        <Gauge className="h-4 w-4" />
        Capacité mensuelle
      </h3>

      <KpiCard index={3}>
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-bold">{data.occupancyPct}%</span>
            <span className="text-sm text-muted-foreground ml-2">d'occupation</span>
          </div>
          <div className="text-right text-sm">
            <span className="font-bold">{data.daysSold}</span>
            <span className="text-muted-foreground"> / {capacityTotal} jours</span>
          </div>
        </div>

        <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, data.occupancyPct)}%`, backgroundColor: barColor }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{data.daysSold} vendus</span>
          <span>{data.remaining} restants</span>
          <span>{vehicleCount} véhicule{vehicleCount > 1 ? "s" : ""} × {workingDays}j</span>
        </div>
      </KpiCard>
    </div>
  );
}
