export interface UserSettings {
  monthlySalary?: number;
  hourlyWage?: number;
  dailyHours?: number; // Number of hours worked per day
  workingDaysPerWeek?: number; // Number of working days per week
  currency: CurrencyCode;
  inputType: 'monthly' | 'hourly';
  enabled: boolean;
}

export interface PriceElement {
  element: HTMLElement;
  price: number;
  originalText: string;
}

export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
  JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', code: 'CAD' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', code: 'AUD' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', code: 'CHF' },
  SEK: { symbol: 'kr', name: 'Swedish Krona', code: 'SEK' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', code: 'NOK' },
  DKK: { symbol: 'kr', name: 'Danish Krone', code: 'DKK' },
  PLN: { symbol: 'zł', name: 'Polish Złoty', code: 'PLN' },
  CZK: { symbol: 'Kč', name: 'Czech Koruna', code: 'CZK' },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint', code: 'HUF' },
  RUB: { symbol: '₽', name: 'Russian Ruble', code: 'RUB' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', code: 'BRL' },
  MXN: { symbol: '$', name: 'Mexican Peso', code: 'MXN' },
  INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
  KRW: { symbol: '₩', name: 'South Korean Won', code: 'KRW' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', code: 'CNY' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', code: 'SGD' },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', code: 'NZD' }
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;
