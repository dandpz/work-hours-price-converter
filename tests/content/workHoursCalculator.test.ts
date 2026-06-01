import type { UserSettings } from "../../src/types";
import { calculateWorkHours } from "../../src/content/workHoursCalculator";

const hourlySettings: UserSettings = {
  inputType: "hourly",
  hourlyWage: 20,
  dailyHours: 8,
  workingDaysPerWeek: 5,
  currency: "EUR",
  enabled: true,
};

const monthlySettings: UserSettings = {
  inputType: "monthly",
  monthlySalary: 3200,
  dailyHours: 8,
  workingDaysPerWeek: 5,
  currency: "EUR",
  enabled: true,
};

describe("calculateWorkHours", () => {
  describe("with hourly wage", () => {
    test("returns null for zero price", () => {
      expect(calculateWorkHours(0, hourlySettings)).toBeNull();
    });

    test("returns null for negative price", () => {
      expect(calculateWorkHours(-10, hourlySettings)).toBeNull();
    });

    test("formats sub-hour result as minutes", () => {
      // 10 / 20 = 0.5h = 30m
      const result = calculateWorkHours(10, hourlySettings);
      expect(result).not.toBeNull();
      expect(result?.formatted).toBe("30m");
    });

    test("formats result under one day as hours", () => {
      // 100 / 20 = 5h
      const result = calculateWorkHours(100, hourlySettings);
      expect(result).not.toBeNull();
      expect(result?.hours).toBeCloseTo(5);
      expect(result?.formatted).toBe("5.0h");
    });

    test("formats full-day result without remainder", () => {
      // 160 / 20 = 8h = 1 full day
      const result = calculateWorkHours(160, hourlySettings);
      expect(result).not.toBeNull();
      expect(result?.formatted).toBe("1d");
    });

    test("formats multi-day result with hour remainder", () => {
      // 180 / 20 = 9h → 1d 1.0h
      const result = calculateWorkHours(180, hourlySettings);
      expect(result).not.toBeNull();
      expect(result?.formatted).toBe("1d 1.0h");
    });

    test("formats multi-day result", () => {
      // 1000 / 20 = 50h → 6d 2.0h (8h/day)
      const result = calculateWorkHours(1000, hourlySettings);
      expect(result).not.toBeNull();
      expect(result?.formatted).toBe("6d 2.0h");
    });

    test("rounds sub-minute to nearest minute", () => {
      // 1 / 20 = 0.05h = 3m
      const result = calculateWorkHours(1, hourlySettings);
      expect(result?.formatted).toBe("3m");
    });
  });

  describe("with monthly salary", () => {
    test("calculates hours from derived hourly wage", () => {
      // 3200 / (8*5*4) = 20/h → 100 / 20 = 5h
      const result = calculateWorkHours(100, monthlySettings);
      expect(result).not.toBeNull();
      expect(result?.hours).toBeCloseTo(5, 1);
      expect(result?.formatted).toBe("5.0h");
    });

    test("returns correct hours value", () => {
      const result = calculateWorkHours(0.01, monthlySettings);
      expect(result).not.toBeNull();
      expect(result?.hours).toBeGreaterThan(0);
    });
  });
});
