export interface KpiReservation {
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

export function parseDate(d: string | null): Date | null {
  if (!d) return null;
  const p = new Date(d);
  return isNaN(p.getTime()) ? null : p;
}

export function reservedDates(r: KpiReservation): Date[] {
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

export function isInMonth(d: Date, year: number, month: number) {
  return d.getFullYear() === year && d.getMonth() === month;
}

export const RED = "hsl(0, 72%, 51%)";
export const ORANGE = "hsl(33, 100%, 50%)";
export const GREEN = "hsl(142, 71%, 45%)";
export const CHART_B2B = "hsl(221, 83%, 53%)";
export const CHART_B2C = "hsl(47, 96%, 53%)";
