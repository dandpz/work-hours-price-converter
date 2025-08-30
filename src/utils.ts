import { DEFAULT_USER_SETTINGS } from "./settings";
import { CURRENCIES, type CurrencyCode, type UserSettings } from "./types";

export interface HourlyWage {
  currency: CurrencyCode;
  amount: number;
  formatted: string;
}

export function getCurrencySymbol(currencyCode: CurrencyCode): string {
  return CURRENCIES[currencyCode]?.symbol || "€";
}

export function calculateHourlyWage(settings: UserSettings): HourlyWage | null {
  if (settings.inputType === "monthly") {
    const monthlySalary =
      settings.monthlySalary || DEFAULT_USER_SETTINGS.monthlySalary;
    const dailyHours = settings.dailyHours || DEFAULT_USER_SETTINGS.dailyHours;
    const workingDaysPerWeek =
      settings.workingDaysPerWeek || DEFAULT_USER_SETTINGS.workingDaysPerWeek;
    const totalMonthlyHours = dailyHours * workingDaysPerWeek * 4;
    const hourlyWage = monthlySalary / totalMonthlyHours;
    return {
      currency: settings.currency,
      amount: hourlyWage,
      formatted: `${getCurrencySymbol(settings.currency)}${hourlyWage.toFixed(2)}/hour`,
    };
  } else {
    const hourlyWage = settings.hourlyWage || DEFAULT_USER_SETTINGS.hourlyWage;
    return {
      currency: settings.currency,
      amount: hourlyWage,
      formatted: `${getCurrencySymbol(settings.currency)}${hourlyWage.toFixed(2)}/hour`,
    };
  }
}

export function extractPriceFromText(text: string): number | null {
  const priceText = text.replace(/\s+/g, "").replace(/[^\d.,-]/g, "");

  // Match last separator as decimal only if followed by 1 or 2 digits
  const match = priceText.match(/([.,])(\d{1,2})$/);
  let normalized = priceText;

  if (match) {
    const decimalChar = match[1];
    const decimalIndex = priceText.lastIndexOf(decimalChar);

    // Remove all other dots/commas (thousand separators)
    normalized =
      normalized.slice(0, decimalIndex).replace(/[.,]/g, "") +
      "." +
      normalized.slice(decimalIndex + 1);
  } else {
    // No valid decimal: remove all separators
    normalized = normalized.replace(/[.,]/g, "");
  }

  const parsed = parseFloat(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}
