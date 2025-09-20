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
        expect(result?.amount).toBeCloseTo(18.75); // use the default values
        expect(result?.formatted).toBe("€18.75/hour");
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
        // Default monthlySalary = 3000
        expect(result?.amount).toBeCloseTo(5);
        expect(result?.formatted).toBe("€5.00/hour");
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
        // Default dailyHours = 8, workingDaysPerWeek = 5
        expect(result?.amount).toBeCloseTo(25);
        expect(result?.formatted).toBe("£25.00/hour");
    });
});