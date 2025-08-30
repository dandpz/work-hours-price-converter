import { extractPriceFromText } from "../../src/utils";

describe("extractPriceFromText", () => {
  test("parses European decimal with comma", () => {
    expect(extractPriceFromText("71,79 €")).toBeCloseTo(71.79);
  });

  test("parses European thousand + decimal", () => {
    expect(extractPriceFromText("1.299,99 €")).toBeCloseTo(1299.99);
  });

  test("parses US format with comma thousand and dot decimal", () => {
    expect(extractPriceFromText("$1,299.99")).toBeCloseTo(1299.99);
  });

  test("parses integer with US comma thousand separator", () => {
    expect(extractPriceFromText("$1,299")).toBe(1299);
  });

  test("parses integer with EU dot thousand separator", () => {
    expect(extractPriceFromText("1.299 €")).toBe(1299);
  });

  test("ignores spaces and currency symbols", () => {
    expect(extractPriceFromText("   €   999,50 ")).toBeCloseTo(999.5);
  });

  test("returns null for invalid input", () => {
    expect(extractPriceFromText("Not a price")).toBeNull();
    expect(extractPriceFromText("")).toBeNull();
  });

    test("handles negative prices", () => {
    expect(extractPriceFromText("-1.299,99 €")).toBeCloseTo(-1299.99);
    expect(extractPriceFromText("-$1,299.99")).toBeCloseTo(-1299.99);
  });

  test("handles prices without decimal part", () => {
    expect(extractPriceFromText("€1299")).toBe(1299);
    expect(extractPriceFromText("$1,299")).toBe(1299);
  });

  test("handles prices with only decimal part", () => {
    expect(extractPriceFromText("€0,99")).toBeCloseTo(0.99);
    expect(extractPriceFromText("$0.99")).toBeCloseTo(0.99);
  });

  test("handles prices with multiple dots/commas", () => {
    expect(extractPriceFromText("1.234.567,89 €")).toBeCloseTo(1234567.89);
    expect(extractPriceFromText("$1,234,567.89")).toBeCloseTo(1234567.89);
  });

  test("returns null for empty or whitespace-only strings", () => {
    expect(extractPriceFromText("   ")).toBeNull();
    expect(extractPriceFromText("")).toBeNull();
  });

  test("handles prices with no thousand separators", () => {
    expect(extractPriceFromText("1299,99 €")).toBeCloseTo(1299.99);
    expect(extractPriceFromText("$1299.99")).toBeCloseTo(1299.99);
  });
});
