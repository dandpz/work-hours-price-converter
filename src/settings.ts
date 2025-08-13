import { CURRENCIES } from './types';

// Default working hours configuration
export const DEFAULT_WORKING_HOURS = {
  DAILY_HOURS: 8,
  DAYS_PER_WEEK: 5,
  HOURS_PER_MONTH: 160 // 8 hours/day × 5 days/week × 4 weeks
} as const;

// Default salary and wage values
export const DEFAULT_INCOME = {
  MONTHLY_SALARY: 800,
  HOURLY_WAGE: 5
} as const;

// Default target websites for the extension
export const DEFAULT_TARGET_WEBSITES = [
  '*://*.amazon.com/*',
  '*://*.amazon.co.uk/*',
  '*://*.amazon.de/*',
  '*://*.amazon.fr/*',
  '*://*.amazon.it/*',
  '*://*.amazon.es/*',
  '*://*.amazon.ca/*',
  '*://*.amazon.com.au/*',
  '*://*.amazon.co.jp/*',
  '*://*.ebay.com/*',
  '*://*.ebay.co.uk/*'
] as const;

// Default user settings object
export const DEFAULT_USER_SETTINGS = {
  monthlySalary: DEFAULT_INCOME.MONTHLY_SALARY,
  hourlyWage: DEFAULT_INCOME.HOURLY_WAGE,
  dailyHours: DEFAULT_WORKING_HOURS.DAILY_HOURS,
  workingDaysPerWeek: DEFAULT_WORKING_HOURS.DAYS_PER_WEEK,
  currency: CURRENCIES.EUR.code,
  inputType: 'monthly' as const,
  enabled: true,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  USER_SETTINGS: 'userSettings'
} as const;

// Extension configuration
// Note: These values should match the manifest.json file
export const EXTENSION_CONFIG = {
  NAME: 'Work Hours Price Converter',
  VERSION: '1.0.0',
  DESCRIPTION: 'Convert product prices into the work hours required based on your hourly wage.',
  AUTHOR: 'Your Name'
} as const;
