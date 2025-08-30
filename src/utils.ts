import { DEFAULT_USER_SETTINGS } from "./settings";
import { CURRENCIES, type CurrencyCode, type UserSettings } from "./types";

export interface HourlyWage {
  currency: CurrencyCode;
  amount: number;
  formatted: string;
}

export function getCurrencySymbol(currencyCode: CurrencyCode): string {
  return CURRENCIES[currencyCode].symbol || "€";
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
  let priceText = text;
  // Remove currency symbols and non-breaking spaces
  priceText = priceText.replace(/\s+/g, "").replace(/[^\d.,-]/g, "");

  // Try parsing with known locales
  const locales = [
    "en-US",
    "en-GB",
    "de-DE",
    "fr-FR",
    "it-IT",
    "es-ES",
    "en-CA",
    "en-AU",
    "ja-JP",
    "es-MX",
    "pt-BR",
    "tr-TR",
    "nl-NL",
    "sv-SE",
    "pl-PL",
    "en-SG",
    "ar-AE",
    "ar-SA",
    "ar-EG",
    "en-IN",
  ];

  for (const locale of locales) {
    const formatter = new Intl.NumberFormat(locale);
    const currentFormat = formatter.format(1234.56); // formats according to locale

    // Build regex dynamically from locale format
    const decimalSeparator = currentFormat.includes(",") ? "," : ".";
    const thousandSeparator = decimalSeparator === "." ? "," : ".";

    // Normalize string
    let normalized = priceText;

    // Remove thousand separators
    const regexThousand = new RegExp(
      `\\${thousandSeparator}(?=\\d{3}(\\${thousandSeparator}|${decimalSeparator}|$))`,
      "g",
    );
    normalized = normalized.replace(regexThousand, "");

    // Replace decimal separator with "."
    if (decimalSeparator !== ".") {
      const regexDecimal = new RegExp(`\\${decimalSeparator}`, "g");
      // only replace the last occurrence
      const lastIndex = normalized.lastIndexOf(decimalSeparator);
      if (lastIndex !== -1) {
        normalized =
          normalized.substring(0, lastIndex).replace(regexDecimal, "") +
          "." +
          normalized.substring(lastIndex + 1);
      }
    }

    const parsed = parseFloat(normalized);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return null;
}
