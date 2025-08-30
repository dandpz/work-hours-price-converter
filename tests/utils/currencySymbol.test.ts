import { getCurrencySymbol } from "../../src/utils";

describe("getCurrencySymbol", () => {
    test("returns correct symbol for EUR", () => {
        expect(getCurrencySymbol("EUR")).toBe("€");
    });

    test("returns correct symbol for USD", () => {
        expect(getCurrencySymbol("USD")).toBe("$");
    });

    test("returns correct symbol for GBP", () => {
        expect(getCurrencySymbol("GBP")).toBe("£");
    });

    test("returns default symbol for unknown currency", () => {
        expect(getCurrencySymbol("XYZ" as any)).toBe("€");
    });
});
