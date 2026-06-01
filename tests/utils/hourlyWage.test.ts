import type { UserSettings } from "../../src/types";
import { calculateHourlyWage } from "../../src/utils";

describe("calculateHourlyWage", () => {
    test("calculates hourly wage from monthly salary", () => {
        const settings: UserSettings = {
            inputType: "monthly" as const,
            monthlySalary: 3000,
            dailyHours: 8,
            workingDaysPerWeek: 5,
            currency: "EUR" as const,
            enabled: true,
        };
        const result = calculateHourlyWage(settings);
        expect(result).not.toBeNull();
        expect(result?.amount).toBeCloseTo(17.31); // 3000 / ((8*5*52)/12)
        expect(result?.formatted).toBe("€17.31/hour");
    });

    test("calculates hourly wage from monthly salary without monthly salary value", () => {
        const settings: UserSettings = {
            inputType: "monthly" as const,
            dailyHours: 8,
            workingDaysPerWeek: 5,
            currency: "EUR" as const,
            enabled: true,
        };
        const result = calculateHourlyWage(settings);
        expect(result).not.toBeNull();
        // Default monthlySalary = 800; 800 / ((8*5*52)/12) ≈ 4.62
        expect(result?.amount).toBeCloseTo(4.62);
        expect(result?.formatted).toBe("€4.62/hour");
    });

    test("calculates hourly wage from hourly rate", () => {
        const settings: UserSettings = {
            inputType: "hourly" as const,
            hourlyWage: 20,
            currency: "USD" as const,
            enabled: true,
        };
        const result = calculateHourlyWage(settings);
        expect(result).not.toBeNull();
        expect(result?.amount).toBe(20);
        expect(result?.formatted).toBe("$20.00/hour");
    });

    test("calculates hourly wage with hourly rate settings, but missing hourlyWage value", () => {
        const settings: UserSettings = {
            inputType: "hourly" as const,
            currency: "USD" as const,
            enabled: true,
        };
        const result = calculateHourlyWage(settings);
        expect(result).not.toBeNull();
        // Default hourlyWage = 5
        expect(result?.amount).toBe(5);
        expect(result?.formatted).toBe("$5.00/hour");
    });

    test("uses default values when some settings are missing", () => {
        const settings: UserSettings = {
            inputType: "monthly" as const,
            monthlySalary: 4000,
            currency: "GBP" as const,
            enabled: true,
        };
        const result = calculateHourlyWage(settings);
        expect(result).not.toBeNull();
        // Default dailyHours = 8, workingDaysPerWeek = 5; 4000 / ((8*5*52)/12) ≈ 23.08
        expect(result?.amount).toBeCloseTo(23.08);
        expect(result?.formatted).toBe("£23.08/hour");
    });
});