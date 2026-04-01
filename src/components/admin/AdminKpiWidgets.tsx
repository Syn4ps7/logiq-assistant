import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TensionBlock } from "./kpi/TensionBlock";
import { CapacityBlock } from "./kpi/CapacityBlock";
import { PipelineBlock } from "./kpi/PipelineBlock";
import { BusinessBlock } from "./kpi/BusinessBlock";
import { HeatmapBlock } from "./kpi/HeatmapBlock";
import { KpiReservation } from "./kpi/types";

interface Reservation {
  id: string;
  vehicle_id: string;
  vehicle_name: string;
  source: string;
  status: string;
  days: number;
  total_chf: number;
  start_date: string | null;
  end_date: string | null;
}

interface Props {
  reservations: Reservation[];
}

export function AdminKpiWidgets({ reservations }: Props) {
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);

  const selectedYear = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    return d.getFullYear();
  }, [monthOffset]);

  const selectedMonth = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    return d.getMonth();
  }, [monthOffset]);

  const isCurrentMonth = monthOffset === 0;
  const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString("fr-CH", { month: "long", year: "numeric" });

  const kpiReservations: KpiReservation[] = reservations;

  return (
    <div className="space-y-6 mb-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Cockpit — {monthName}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMonthOffset((o) => o - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={isCurrentMonth ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs px-3"
            onClick={() => setMonthOffset(0)}
          >
            Ce mois
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={isCurrentMonth}
            onClick={() => setMonthOffset((o) => Math.min(0, o + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 1. TENSION */}
      <TensionBlock reservations={kpiReservations} />

      {/* 2. CAPACITÉ */}
      <CapacityBlock reservations={kpiReservations} selectedYear={selectedYear} selectedMonth={selectedMonth} />

      {/* 3. HEATMAP */}
      {isCurrentMonth && <HeatmapBlock reservations={kpiReservations} />}

      {/* 4. PIPELINE */}
      {isCurrentMonth && <PipelineBlock reservations={kpiReservations} />}

      {/* 5. BUSINESS */}
      <BusinessBlock reservations={kpiReservations} selectedYear={selectedYear} selectedMonth={selectedMonth} />
    </div>
  );
}
