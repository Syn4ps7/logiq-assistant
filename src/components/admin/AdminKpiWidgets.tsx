import { useMemo } from "react";
import { vehicles } from "@/data/vehicles";
import { Progress } from "@/components/ui/progress";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, CalendarDays, Gauge, DollarSign, PieChart as PieIcon } from "lucide-react";

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

/* ── helpers ── */
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();
const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

function parseDate(d: string | null): Date | null {
  if (!d) return null;
  const p = new Date(d);
  return isNaN(p.getTime()) ? null : p;
}

/** Return array of dates a reservation covers */
function reservedDates(r: Reservation): Date[] {
  const s = parseDate(r.start_date);
  const e = parseDate(r.end_date);
  if (!s || !e) return [];
  const dates: Date[] = [];
  const cur = new Date(s);
  while (cur <= e) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function isCurrentMonth(d: Date) {
  return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
}

/* ── Color constants ── */
const RED = "hsl(0, 72%, 51%)";
const ORANGE = "hsl(33, 100%, 50%)";
const GREEN = "hsl(142, 71%, 45%)";
const CHART_B2B = "hsl(221, 83%, 53%)";
const CHART_B2C = "hsl(47, 96%, 53%)";

export function AdminKpiWidgets({ reservations }: Props) {
  const activeVehicles = vehicles.filter((v) => v.availability);
  const vehicleCount = activeVehicles.length || 1;

  /* ── 1. Breakeven per vehicle (current month) ── */
  const breakevenData = useMemo(() => {
    const map: Record<string, { name: string; days: number }> = {};
    activeVehicles.forEach((v) => { map[v.id] = { name: v.name, days: 0 }; });

    reservations.forEach((r) => {
      if (!map[r.vehicle_id]) return;
      if (r.status === "canceled") return;
      const dates = reservedDates(r);
      const monthDays = dates.filter(isCurrentMonth).length;
      map[r.vehicle_id].days += monthDays;
    });

    return Object.entries(map).map(([id, v]) => ({
      id,
      name: v.name,
      days: v.days,
      color: v.days < 9 ? RED : v.days < 15 ? ORANGE : GREEN,
      pct: Math.min(100, Math.round((v.days / daysInMonth) * 100)),
    }));
  }, [reservations, activeVehicles]);

  /* ── 2. Pipeline J+14 ── */
  const pipelineData = useMemo(() => {
    const today = new Date(currentYear, currentMonth, now.getDate());
    const days: { label: string; count: number }[] = [];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dayStr = d.toLocaleDateString("fr-CH", { day: "2-digit", month: "2-digit" });
      let count = 0;

      reservations.forEach((r) => {
        if (r.status === "canceled") return;
        const s = parseDate(r.start_date);
        const e = parseDate(r.end_date);
        if (!s || !e) return;
        if (d >= s && d <= e) count++;
      });

      days.push({ label: dayStr, count });
    }

    const totalSlots = vehicleCount * 14;
    const bookedSlots = days.reduce((s, d) => s + d.count, 0);
    const pct = Math.round((bookedSlots / totalSlots) * 100);

    return { days, pct, bookedSlots, totalSlots };
  }, [reservations, vehicleCount]);

  /* ── 3. RevPAR ── */
  const revpar = useMemo(() => {
    const monthCA = reservations
      .filter((r) => r.status !== "canceled")
      .reduce((sum, r) => {
        const dates = reservedDates(r);
        const monthDays = dates.filter(isCurrentMonth).length;
        if (monthDays === 0) return sum;
        // proportional CA
        const totalDays = dates.length || 1;
        return sum + (r.total_chf * monthDays) / totalDays;
      }, 0);

    const value = monthCA / vehicleCount;
    const target = 2475;
    const diff = value - target;
    const diffPct = target > 0 ? Math.round((diff / target) * 100) : 0;
    return { value, target, diff, diffPct, monthCA };
  }, [reservations, vehicleCount]);

  /* ── 4. Mix B2B vs B2C ── */
  const mixData = useMemo(() => {
    let caB2B = 0;
    let caB2C = 0;
    reservations.forEach((r) => {
      if (r.status === "canceled") return;
      const dates = reservedDates(r);
      const monthDays = dates.filter(isCurrentMonth).length;
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
  }, [reservations]);

  const monthName = now.toLocaleDateString("fr-CH", { month: "long", year: "numeric" });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* ── Widget 1: Breakeven ── */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Gauge className="h-4 w-4 text-primary" />
          Jauge de Survie — {monthName}
        </div>
        <p className="text-xs text-muted-foreground">Jours loués par véhicule ce mois (objectif BP : 15j)</p>
        <div className="space-y-3">
          {breakevenData.map((v) => (
            <div key={v.id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium truncate max-w-[60%]">{v.name}</span>
                <span className="font-bold" style={{ color: v.color }}>
                  {v.days}j / {daysInMonth}j
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${v.pct}%`, backgroundColor: v.color }}
                />
                {/* Breakeven marker at 9 days */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-foreground/30"
                  style={{ left: `${(9 / daysInMonth) * 100}%` }}
                />
                {/* Target marker at 15 days */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-foreground/30"
                  style={{ left: `${(15 / daysInMonth) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>🔴 0-8j</span>
                <span>🟠 9-14j</span>
                <span>🟢 15j+</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Widget 2: Pipeline J+14 ── */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CalendarDays className="h-4 w-4 text-primary" />
          Pipeline d'Occupation J+14
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{pipelineData.pct}%</span>
          <span className="text-xs text-muted-foreground">
            {pipelineData.bookedSlots} / {pipelineData.totalSlots} créneaux
          </span>
        </div>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pipelineData.days} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={1} />
              <YAxis hide domain={[0, vehicleCount]} />
              <Tooltip
                formatter={(v: number) => [`${v} véhicule(s)`, "Réservés"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar
                dataKey="count"
                radius={[3, 3, 0, 0]}
                fill="hsl(var(--primary))"
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">Véhicules réservés par jour sur les 14 prochains jours</p>
      </div>

      {/* ── Widget 3: RevPAR ── */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <DollarSign className="h-4 w-4 text-primary" />
          RevPAR — {monthName}
        </div>
        <p className="text-xs text-muted-foreground">Revenu par véhicule disponible</p>
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
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (revpar.value / revpar.target) * 100)}%`,
                backgroundColor: revpar.value >= revpar.target ? GREEN : revpar.value >= revpar.target * 0.6 ? ORANGE : RED,
              }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">CA mois : {revpar.monthCA.toFixed(0)} CHF — {vehicleCount} véhicule{vehicleCount > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* ── Widget 4: Mix B2B vs B2C ── */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <PieIcon className="h-4 w-4 text-primary" />
          Mix B2B / B2C — {monthName}
        </div>
        <div className="flex items-center gap-4">
          <div className="h-28 w-28 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mixData.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
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
              Cible stratégique : 60% B2B / 40% B2C
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
