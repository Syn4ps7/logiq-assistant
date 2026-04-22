import { describe, it, expect } from "vitest";
import {
  computeFlexProDays,
  computeFlexProBreakdown,
  FLEX_PRO_DAILY_HT,
  FLEX_PRO_KM_PER_DAY,
  EXTRA_KM_RATE_PRO_HT,
  TVA_RATE,
} from "./pricing";

describe("computeFlexProDays", () => {
  it("returns 1 for a same-day rental", () => {
    expect(computeFlexProDays("2025-04-15", "2025-04-15")).toBe(1);
  });

  it("returns 1 for an overnight rental (next-day return)", () => {
    expect(computeFlexProDays("2025-04-15", "2025-04-16")).toBe(1);
  });

  it("returns the exact day count for a multi-day rental", () => {
    expect(computeFlexProDays("2025-04-15", "2025-04-20")).toBe(5);
  });

  it("returns 7 for a one-week rental", () => {
    expect(computeFlexProDays("2025-04-15", "2025-04-22")).toBe(7);
  });

  it("falls back to 1 when end is before start (defensive)", () => {
    expect(computeFlexProDays("2025-04-20", "2025-04-15")).toBe(1);
  });

  it("returns 0 when either date is missing", () => {
    expect(computeFlexProDays("", "2025-04-15")).toBe(0);
    expect(computeFlexProDays("2025-04-15", "")).toBe(0);
    expect(computeFlexProDays("", "")).toBe(0);
  });

  it("returns 0 for invalid date strings", () => {
    expect(computeFlexProDays("not-a-date", "2025-04-15")).toBe(0);
    expect(computeFlexProDays("2025-04-15", "not-a-date")).toBe(0);
  });

  describe("timezone & DST safety", () => {
    // These cases historically broke implementations that used `new Date(str)`
    // with locale parsing — they would yield 0.96 or 1.04 days and round to 0 or 2.

    it("counts exactly 1 day across the European spring-forward DST (2025-03-30)", () => {
      // Europe/Zurich loses 1h at 02:00 → 03:00. UTC parsing must ignore that.
      expect(computeFlexProDays("2025-03-30", "2025-03-31")).toBe(1);
    });

    it("counts exactly 1 day across the European fall-back DST (2025-10-26)", () => {
      // Europe/Zurich gains 1h at 03:00 → 02:00.
      expect(computeFlexProDays("2025-10-26", "2025-10-27")).toBe(1);
    });

    it("counts exactly 7 days across a DST boundary", () => {
      expect(computeFlexProDays("2025-03-28", "2025-04-04")).toBe(7);
    });

    it("counts exactly 1 day across the year boundary", () => {
      expect(computeFlexProDays("2025-12-31", "2026-01-01")).toBe(1);
    });

    it("counts exactly 1 day across a leap-year February boundary", () => {
      expect(computeFlexProDays("2024-02-28", "2024-02-29")).toBe(1);
      expect(computeFlexProDays("2024-02-29", "2024-03-01")).toBe(1);
    });
  });
});

describe("computeFlexProBreakdown", () => {
  // Constants used in expected values:
  //   daily HT = 155.00
  //   daily TTC = 155 * 1.081 = 167.555
  //   extra km HT = 0.65 → TTC = 0.70265 → round to 2 dec when computing line total

  describe("same-day rental (1 day)", () => {
    const result = computeFlexProBreakdown("2025-04-15", "2025-04-15", 50);

    it("bills exactly 1 day", () => {
      expect(result?.days).toBe(1);
    });

    it("includes 100 km for 1 day", () => {
      expect(result?.includedKm).toBe(FLEX_PRO_KM_PER_DAY);
    });

    it("charges 0 extra km when usage is below the included quota", () => {
      expect(result?.extraKm).toBe(0);
      expect(result?.extraKmCostTTC).toBe(0);
    });

    it("returns base total = 1 × 155 × 1.081 = 167.56 CHF TTC (rounded)", () => {
      // 155 * 1.081 = 167.555 → round to 167.56
      expect(result?.baseTotalTTC).toBeCloseTo(167.56, 2);
    });

    it("returns total = base when no options and no extra km", () => {
      expect(result?.totalTTC).toBeCloseTo(167.56, 2);
    });
  });

  describe("cross-day rental (3 days)", () => {
    const result = computeFlexProBreakdown("2025-04-15", "2025-04-18", 250);

    it("bills 3 days", () => {
      expect(result?.days).toBe(3);
    });

    it("includes 300 km for 3 days", () => {
      expect(result?.includedKm).toBe(300);
    });

    it("charges 0 extra km when usage (250) is below the included quota (300)", () => {
      expect(result?.extraKm).toBe(0);
      expect(result?.extraKmCostTTC).toBe(0);
    });

    it("returns base total = 3 × 167.555 = 502.665 → 502.67 CHF TTC", () => {
      // Math.round(3 * 155 * 1.081 * 100) / 100 = Math.round(50266.5) / 100 = 502.67
      expect(result?.baseTotalTTC).toBeCloseTo(502.67, 2);
    });
  });

  describe("cross-day rental with extra km", () => {
    // 5 days, 700 km estimated → 700 - 500 = 200 extra km
    const result = computeFlexProBreakdown("2025-04-15", "2025-04-20", 700);

    it("bills 5 days and includes 500 km", () => {
      expect(result?.days).toBe(5);
      expect(result?.includedKm).toBe(500);
    });

    it("charges exactly 200 extra km", () => {
      expect(result?.extraKm).toBe(200);
    });

    it("computes extra km cost = 200 × 0.65 × 1.081 = 140.53 CHF TTC", () => {
      // 200 * 0.65 * 1.081 = 140.53 exactly
      expect(result?.extraKmCostTTC).toBeCloseTo(140.53, 2);
    });

    it("computes total = base + extra km", () => {
      // base = round(5 * 155 * 1.081 * 100) / 100 = round(83777.5) / 100 = 837.78
      // total = 837.78 + 140.53 = 978.31
      expect(result?.baseTotalTTC).toBeCloseTo(837.78, 2);
      expect(result?.totalTTC).toBeCloseTo(978.31, 2);
    });
  });

  describe("with options", () => {
    it("adds options cost to the total", () => {
      const result = computeFlexProBreakdown("2025-04-15", "2025-04-15", 50, 25.5);
      expect(result?.totalTTC).toBeCloseTo(167.56 + 25.5, 2);
    });
  });

  describe("DST edge case", () => {
    // Spring forward in Europe/Zurich (2025-03-30 02:00 → 03:00).
    // A naive implementation using local Date parsing would compute
    // 23h / 24h = 0.958 days → ceil = 1 day. Our UTC-based one also returns 1.
    // This test pins the contract: the day count must NEVER drift across DST.

    it("bills exactly 1 day across spring-forward, base = 167.56 CHF TTC", () => {
      const result = computeFlexProBreakdown("2025-03-30", "2025-03-31", 50);
      expect(result?.days).toBe(1);
      expect(result?.baseTotalTTC).toBeCloseTo(167.56, 2);
    });

    it("bills exactly 7 days across spring-forward week, base = 7 × 167.555 → 1172.89", () => {
      const result = computeFlexProBreakdown("2025-03-28", "2025-04-04", 0);
      // Math.round(7 * 155 * 1.081 * 100) / 100 = Math.round(117288.5) / 100 = 1172.89
      expect(result?.days).toBe(7);
      expect(result?.baseTotalTTC).toBeCloseTo(1172.89, 2);
    });
  });

  describe("invalid input", () => {
    it("returns null when dates are missing", () => {
      expect(computeFlexProBreakdown("", "", 100)).toBeNull();
      expect(computeFlexProBreakdown("2025-04-15", "", 100)).toBeNull();
    });

    it("returns null for invalid date strings", () => {
      expect(computeFlexProBreakdown("foo", "bar", 100)).toBeNull();
    });
  });

  describe("constants exposure (regression guards)", () => {
    it("exposes the published Flex Pro daily rate", () => {
      expect(FLEX_PRO_DAILY_HT).toBe(155);
    });

    it("exposes the published 100 km/day quota", () => {
      expect(FLEX_PRO_KM_PER_DAY).toBe(100);
    });

    it("exposes the published Pro extra-km rate", () => {
      expect(EXTRA_KM_RATE_PRO_HT).toBe(0.65);
    });

    it("exposes the Swiss VAT rate", () => {
      expect(TVA_RATE).toBe(0.081);
    });
  });
});
