/**
 * Pure pricing helpers — no React, no DOM, no time/locale assumptions.
 * Designed to be unit-tested in isolation.
 */

export const TVA_RATE = 0.081;
export const FLEX_PRO_DAILY_HT = 155;
export const FLEX_PRO_KM_PER_DAY = 100;
export const EXTRA_KM_RATE_PRO_HT = 0.65;

const MS_PER_DAY = 86_400_000;

/**
 * Compute the number of billable days for the Flex Pro plan.
 *
 * Rules:
 * - Same-day rental (start === end) → 1 day (minimum billing unit).
 * - Cross-day rental → ceil(diffMs / 1 day), so even a 25h rental counts as 2 days.
 * - Inputs are interpreted as **calendar dates** (YYYY-MM-DD) in UTC, so DST
 *   transitions and the user's timezone offset never shift the day count.
 * - Returns at least 1 (we never bill 0 days, even if endDate < startDate).
 */
export function computeFlexProDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;

  // Force UTC midnight so a "2025-03-30" → "2025-03-31" span is exactly 1 day,
  // independent of the host timezone (avoids the classic 23h/25h DST trap).
  const startUtc = Date.parse(`${startDate}T00:00:00Z`);
  const endUtc = Date.parse(`${endDate}T00:00:00Z`);
  if (Number.isNaN(startUtc) || Number.isNaN(endUtc)) return 0;

  const diffMs = endUtc - startUtc;
  if (diffMs <= 0) return 1; // same day or end-before-start → minimum 1 day
  return Math.max(1, Math.ceil(diffMs / MS_PER_DAY));
}

export interface FlexProBreakdown {
  days: number;
  includedKm: number;
  extraKm: number;
  /** Extra km cost in CHF TTC (rounded to 0.01). */
  extraKmCostTTC: number;
  /** Base total in CHF TTC (rounded to 0.01). */
  baseTotalTTC: number;
  /** Grand total (base + extra km + options) in CHF TTC (rounded to 0.01). */
  totalTTC: number;
}

/**
 * Compute the full Flex Pro breakdown.
 *
 * - `estKm` is the customer's estimated kilometers for the whole rental.
 * - `optionsCostTTC` is the already-summed cost of options in CHF TTC.
 * - All prices are returned TTC (the UI re-derives HT for display).
 */
export function computeFlexProBreakdown(
  startDate: string,
  endDate: string,
  estKm: number,
  optionsCostTTC = 0,
): FlexProBreakdown | null {
  const days = computeFlexProDays(startDate, endDate);
  if (days === 0) return null;

  const includedKm = FLEX_PRO_KM_PER_DAY * days;
  const baseTotalTTC =
    Math.round(days * FLEX_PRO_DAILY_HT * (1 + TVA_RATE) * 100) / 100;

  const extraKm = Math.max(0, Math.round(estKm) - includedKm);
  const extraKmCostTTC =
    Math.round(extraKm * EXTRA_KM_RATE_PRO_HT * (1 + TVA_RATE) * 100) / 100;

  const totalTTC =
    Math.round((baseTotalTTC + optionsCostTTC + extraKmCostTTC) * 100) / 100;

  return { days, includedKm, extraKm, extraKmCostTTC, baseTotalTTC, totalTTC };
}
