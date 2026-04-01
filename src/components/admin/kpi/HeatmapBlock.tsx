import { useMemo } from "react";
import { Grid3X3 } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { KpiReservation, parseDate, RED, ORANGE, GREEN } from "./types";
import { vehicles } from "@/data/vehicles";

interface Props {
  reservations: KpiReservation[];
}

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function HeatmapBlock({ reservations }: Props) {
  const activeVehicles = vehicles.filter((v) => v.availability);
  const vehicleCount = activeVehicles.length || 1;

  const heatmap = useMemo(() => {
    const today = new Date();
    // Look at current week + next week (14 days)
    const dayData: { name: string; date: string; count: number; pct: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      // Align to current week's Monday
      const dayOfWeek = today.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      d.setDate(today.getDate() + mondayOffset + i);

      const dateStr = d.toLocaleDateString("fr-CH", { day: "2-digit", month: "2-digit" });
      let count = 0;

      reservations.forEach((r) => {
        if (r.status === "canceled") return;
        const s = parseDate(r.start_date);
        const e = parseDate(r.end_date);
        if (!s || !e) return;
        if (d >= s && d <= e) count++;
      });

      const pct = Math.round((count / vehicleCount) * 100);
      dayData.push({ name: DAY_NAMES[i], date: dateStr, count, pct });
    }

    return dayData;
  }, [reservations, vehicleCount]);

  const getColor = (pct: number) => {
    if (pct >= 100) return RED;
    if (pct >= 70) return ORANGE;
    return GREEN;
  };

  const getBg = (pct: number) => {
    if (pct >= 100) return "bg-red-100 dark:bg-red-900/40";
    if (pct >= 70) return "bg-orange-100 dark:bg-orange-900/40";
    return "bg-green-100 dark:bg-green-900/40";
  };

  return (
    <KpiCard index={7}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Grid3X3 className="h-4 w-4 text-primary" />
        Heatmap semaine en cours
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {heatmap.map((day) => (
          <div
            key={day.name}
            className={`rounded-lg p-2 text-center transition-all ${getBg(day.pct)}`}
          >
            <div className="text-[10px] font-bold text-muted-foreground">{day.name}</div>
            <div className="text-[9px] text-muted-foreground">{day.date}</div>
            <div className="text-lg font-bold mt-0.5" style={{ color: getColor(day.pct) }}>
              {day.pct}%
            </div>
            <div className="text-[9px] text-muted-foreground">{day.count}/{vehicleCount}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: GREEN }} /> &lt;70%</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: ORANGE }} /> 70-99%</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: RED }} /> 100%</span>
      </div>
    </KpiCard>
  );
}
