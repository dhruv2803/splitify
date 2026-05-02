import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.45,
  JPY: 151.62,
  CAD: 1.35,
  AUD: 1.52,
};

export function convertCurrency(amount: number, from: string, to: string) {
  const fromRate = EXCHANGE_RATES[from] || 1;
  const toRate = EXCHANGE_RATES[to] || 1;
  
  // Convert to USD first (base), then to target
  const inUsd = amount / fromRate;
  return inUsd * toRate;
}

export function formatCurrency(amount: number, currency: string = 'INR') {
  // Normalize -0 and extremely small floating point values to 0
  const normalizedAmount = Math.abs(amount) < 0.005 ? 0 : amount;
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(normalizedAmount);
  } catch (e) {
    // Fallback if invalid currency
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  }
}
