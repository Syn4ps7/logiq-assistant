import { useMemo } from "react";
import { AlertTriangle, Activity, Ban, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "./KpiCard";
import { KpiReservation, reservedDates, RED, ORANGE, GREEN } from "./types";
import { vehicles } from "@/data/vehicles";

interface Props {
  reservations: KpiReservation[];
}

export function TensionBlock({ reservations }: Props) {
  const activeVehicles = vehicles.filter((v) => v.availability);
  const vehicleCount = activeVehicles.length || 1;

  const data = useMemo(() => {
    const today = new Date();
    const days7: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days7.push(d);
    }

    let saturatedDays = 0;
    let totalBookedSlots = 0;
    const totalSlots = vehicleCount * 7;

    days7.forEach((day) => {
      let count = 0;
      reservations.forEach((r) => {
        if (r.status === "canceled") return;
        const dates = reservedDates(r);
        if (dates.some((d) => d.toDateString() === day.toDateString())) count++;
      });
      totalBookedSlots += count;
      if (count >= vehicleCount) saturatedDays++;
    });

    const saturationPct = Math.round((totalBookedSlots / totalSlots) * 100);

    // Estimate refused (saturated slots beyond capacity)
    let refusedEstimate = 0;
    days7.forEach((day) => {
      let count = 0;
      reservations.forEach((r) => {
        if (r.status === "canceled") return;
        const dates = reservedDates(r);
        if (dates.some((d) => d.toDateString() === day.toDateString())) count++;
      });
      if (count >= vehicleCount) refusedEstimate++;
    });

    // Average daily price
    const nonCanceled = reservations.filter((r) => r.status !== "canceled" && r.days > 0);
    const avgPrice = nonCanceled.length > 0
      ? nonCanceled.reduce((s, r) => s + r.total_chf / r.days, 0) / nonCanceled.length
      : 129;
    const caPerdu = Math.round(refusedEstimate * avgPrice);

    // Decision
    let decision: { label: string; color: string; bg: string };
    if (saturationPct > 85 || (refusedEstimate / 7) > 0.1) {
      decision = { label: "AJOUTER 1 VÉHICULE", color: "text-red-700 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700" };
    } else if (saturationPct >= 70) {
      decision = { label: "SURVEILLER", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700" };
    } else {
      decision = { label: "STABLE", color: "text-green-700 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700" };
    }

    return { saturationPct, saturatedDays, refusedEstimate, caPerdu, decision };
  }, [reservations, vehicleCount]);

  const satColor = data.saturationPct > 85 ? RED : data.saturationPct >= 70 ? ORANGE : GREEN;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Tension — 7 derniers jours
      </h3>

      {/* Decision badge - prominent */}
      <div className="flex justify-center">
        <Badge variant="outline" className={`text-base font-bold px-5 py-2 ${data.decision.bg} ${data.decision.color}`}>
          <Zap className="h-4 w-4 mr-2" />
          {data.decision.label}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <KpiCard index={0} className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            Saturation
          </div>
          <div className="text-3xl font-bold" style={{ color: satColor }}>
            {data.saturationPct}%
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, data.saturationPct)}%`, backgroundColor: satColor }} />
          </div>
        </KpiCard>

        <KpiCard index={1} className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            Jours saturés
          </div>
          <div className="text-3xl font-bold" style={{ color: data.saturatedDays > 0 ? RED : GREEN }}>
            {data.saturatedDays}
          </div>
          <p className="text-[10px] text-muted-foreground">sur 7 jours</p>
        </KpiCard>

        <KpiCard index={2} className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Ban className="h-3.5 w-3.5" />
            CA perdu estimé
          </div>
          <div className="text-3xl font-bold" style={{ color: data.caPerdu > 0 ? RED : GREEN }}>
            {data.caPerdu}
          </div>
          <p className="text-[10px] text-muted-foreground">CHF ({data.refusedEstimate} refus)</p>
        </KpiCard>
      </div>
    </div>
  );
}
