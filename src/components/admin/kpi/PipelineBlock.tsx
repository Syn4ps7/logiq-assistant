import { useMemo } from "react";
import { CalendarDays, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "./KpiCard";
import { KpiReservation, parseDate, RED, ORANGE } from "./types";
import { vehicles } from "@/data/vehicles";

interface Props {
  reservations: KpiReservation[];
}

const DAYS_LABEL = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function PipelineBlock({ reservations }: Props) {
  const activeVehicles = vehicles.filter((v) => v.availability);
  const vehicleCount = activeVehicles.length || 1;

  const data = useMemo(() => {
    const today = new Date();
    const days: { label: string; dayName: string; count: number; date: Date }[] = [];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dayStr = d.toLocaleDateString("fr-CH", { day: "2-digit", month: "2-digit" });
      const dayName = DAYS_LABEL[d.getDay()];
      let count = 0;

      reservations.forEach((r) => {
        if (r.status === "canceled") return;
        const s = parseDate(r.start_date);
        const e = parseDate(r.end_date);
        if (!s || !e) return;
        if (d >= s && d <= e) count++;
      });

      days.push({ label: `${dayName} ${dayStr}`, dayName, count, date: d });
    }

    const totalSlots = vehicleCount * 14;
    const bookedSlots = days.reduce((s, d) => s + d.count, 0);
    const pct = Math.round((bookedSlots / totalSlots) * 100);

    // Peak detection
    const peaks = days.filter((d) => d.count >= vehicleCount);
    const nearPeaks = days.filter((d) => d.count >= vehicleCount - 1 && d.count < vehicleCount);

    // Suggestions
    const suggestions: string[] = [];
    if (peaks.length > 0) {
      const peakNames = peaks.map((p) => p.dayName + " " + p.label.split(" ").pop()).join(", ");
      suggestions.push(`${peaks.length} jour${peaks.length > 1 ? "s" : ""} saturé${peaks.length > 1 ? "s" : ""} : ${peakNames}`);
    }
    if (peaks.length >= 3) {
      suggestions.push("Forte demande détectée — envisager 1 véhicule supplémentaire");
    } else if (nearPeaks.length >= 2) {
      suggestions.push("Demande en hausse — surveiller les prochaines réservations");
    }

    return { days, pct, bookedSlots, totalSlots, peaks, suggestions };
  }, [reservations, vehicleCount]);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
        <CalendarDays className="h-4 w-4" />
        Pipeline J+14
      </h3>

      <KpiCard index={4}>
        <div className="flex items-baseline gap-2 justify-between">
          <div>
            <span className="text-3xl font-bold">{data.pct}%</span>
            <span className="text-xs text-muted-foreground ml-2">
              {data.bookedSlots} / {data.totalSlots} créneaux
            </span>
          </div>
          {data.peaks.length > 0 && (
            <Badge variant="outline" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700 text-xs gap-1">
              <AlertCircle className="h-3 w-3" />
              {data.peaks.length} pic{data.peaks.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.days} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 8 }} interval={1} angle={-30} textAnchor="end" height={40} />
              <YAxis hide domain={[0, vehicleCount + 1]} />
              <Tooltip
                formatter={(v: number) => [`${v} / ${vehicleCount} véhicule(s)`, "Réservés"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <ReferenceLine y={vehicleCount} stroke={RED} strokeDasharray="3 3" label={{ value: "Max", fontSize: 9, fill: RED }} />
              <Bar
                dataKey="count"
                radius={[3, 3, 0, 0]}
                maxBarSize={24}
                animationDuration={800}
                animationEasing="ease-out"
                fill="hsl(var(--primary))"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {data.suggestions.length > 0 && (
          <div className="space-y-1 pt-1 border-t">
            {data.suggestions.map((s, i) => (
              <p key={i} className="text-xs flex items-start gap-1.5" style={{ color: i === 0 ? RED : ORANGE }}>
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                {s}
              </p>
            ))}
          </div>
        )}
      </KpiCard>
    </div>
  );
}
