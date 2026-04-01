import { useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { KpiCard } from "./KpiCard";
import { KpiReservation, reservedDates, isInMonth, RED, ORANGE, GREEN, CHART_B2B, CHART_B2C } from "./types";
import { vehicles } from "@/data/vehicles";

interface Props {
  reservations: KpiReservation[];
  selectedYear: number;
  selectedMonth: number;
}

export function BusinessBlock({ reservations, selectedYear, selectedMonth }: Props) {
  const activeVehicles = vehicles.filter((v) => v.availability);
  const vehicleCount = activeVehicles.length || 1;
  const matchMonth = (d: Date) => isInMonth(d, selectedYear, selectedMonth);

  const revpar = useMemo(() => {
    const monthCA = reservations
      .filter((r) => r.status !== "canceled")
      .reduce((sum, r) => {
        const dates = reservedDates(r);
        const monthDays = dates.filter(matchMonth).length;
        if (monthDays === 0) return sum;
        const totalDays = dates.length || 1;
        return sum + (r.total_chf * monthDays) / totalDays;
      }, 0);

    const value = monthCA / vehicleCount;
    const target = 2475;
    const diff = value - target;
    const diffPct = target > 0 ? Math.round((diff / target) * 100) : 0;
    return { value, target, diff, diffPct, monthCA };
  }, [reservations, vehicleCount, selectedYear, selectedMonth]);

  const mixData = useMemo(() => {
    let caB2B = 0;
    let caB2C = 0;
    reservations.forEach((r) => {
      if (r.status === "canceled") return;
      const dates = reservedDates(r);
      const monthDays = dates.filter(matchMonth).length;
      if (monthDays === 0) return;
      const totalDays = dates.length || 1;
      const proportional = (r.total_chf * monthDays) / totalDays;
      if (r.source === "b2b") caB2B += proportional;
      else caB2C += proportional;
    });
    const total = caB2B + caB2C || 1;
    return {
      data: [
        { name: "B2B", value: Math.round(caB2B), pct: Math.round((caB2B / total) * 100) },
        { name: "B2C", value: Math.round(caB2C), pct: Math.round((caB2C / total) * 100) },
      ],
      total: Math.round(caB2B + caB2C),
    };
  }, [reservations, selectedYear, selectedMonth]);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        Business
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RevPAR */}
        <KpiCard index={5}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <DollarSign className="h-4 w-4 text-primary" />
            RevPAR
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{revpar.value.toFixed(0)}</span>
            <span className="text-sm text-muted-foreground">CHF / véhicule</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Objectif BP : {revpar.target.toLocaleString("fr-CH")} CHF</span>
              <span
                className="font-semibold flex items-center gap-0.5"
                style={{ color: revpar.diff >= 0 ? GREEN : RED }}
              >
                {revpar.diff >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {revpar.diffPct >= 0 ? "+" : ""}{revpar.diffPct}%
              </span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.min(100, (revpar.value / revpar.target) * 100)}%`,
                  backgroundColor: revpar.value >= revpar.target ? GREEN : revpar.value >= revpar.target * 0.6 ? ORANGE : RED,
                }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">CA mois : {revpar.monthCA.toFixed(0)} CHF — {vehicleCount} véhicule{vehicleCount > 1 ? "s" : ""}</p>
          </div>
        </KpiCard>

        {/* Mix B2B / B2C */}
        <KpiCard index={6}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <PieIcon className="h-4 w-4 text-primary" />
            Mix B2B / B2C
          </div>
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mixData.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={42}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    animationDuration={900}
                  >
                    <Cell fill={CHART_B2B} />
                    <Cell fill={CHART_B2C} />
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} CHF`, ""]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-sm flex-1">
              {mixData.data.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: i === 0 ? CHART_B2B : CHART_B2C }} />
                    <span className="font-medium">{d.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{d.pct}%</span>
                    <span className="text-xs text-muted-foreground ml-1">({d.value} CHF)</span>
                  </div>
                </div>
              ))}
              <div className="pt-1 border-t text-xs text-muted-foreground">
                Cible : 60% B2B / 40% B2C
              </div>
            </div>
          </div>
        </KpiCard>
      </div>
    </div>
  );
}
