import { DEFAULT_USER_SETTINGS } from "./settings";
import { CURRENCIES, CurrencyCode, UserSettings } from "./types";

export interface HourlyWage {
    currency: CurrencyCode;
    amount: number;
    formatted: string;
}

export function getCurrencySymbol(currencyCode: CurrencyCode): string {
    return CURRENCIES[currencyCode].symbol || '€';
}

export function calculateHourlyWage(settings: UserSettings): HourlyWage | void {
    if (settings.inputType === 'monthly') {
        const monthlySalary = settings.monthlySalary || DEFAULT_USER_SETTINGS.monthlySalary!;
        const dailyHours = settings.dailyHours || DEFAULT_USER_SETTINGS.dailyHours!;
        const workingDaysPerWeek = settings.workingDaysPerWeek || DEFAULT_USER_SETTINGS.workingDaysPerWeek!;
        const totalMonthlyHours = dailyHours * workingDaysPerWeek * 4;
        const hourlyWage = monthlySalary / totalMonthlyHours;
        return {
            currency: settings.currency,
            amount: hourlyWage,
            formatted: `${getCurrencySymbol(settings.currency)}${hourlyWage.toFixed(2)}/hour`
        };
    }
    return;
}