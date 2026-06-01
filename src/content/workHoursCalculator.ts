import { DEFAULT_USER_SETTINGS } from "../settings";
import type { UserSettings } from "../types";
import { calculateHourlyWage } from "../utils";

export interface WorkHoursResult {
  hours: number;
  formatted: string;
}

export function calculateWorkHours(
  price: number,
  settings: UserSettings,
): WorkHoursResult | null {
  if (price <= 0) return null;

  const wage = calculateHourlyWage(settings);
  if (!wage || wage.amount <= 0) return null;

  const hours = price / wage.amount;
  return { hours, formatted: formatWorkHours(hours, settings) };
}

function formatWorkHours(hours: number, settings: UserSettings): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  const dailyHours = settings.dailyHours ?? DEFAULT_USER_SETTINGS.dailyHours;
  if (hours < dailyHours) {
    return `${hours.toFixed(1)}h`;
  }
  const days = Math.floor(hours / dailyHours);
  const remaining = hours % dailyHours;
  return remaining > 0 ? `${days}d ${remaining.toFixed(1)}h` : `${days}d`;
}
