import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { parse, format, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/**
 * Parse date string from DailyStats (e.g., "Jan 1, 2026") to Date object
 */
export function parseChartDate(dateStr: string): Date {
  // Try parsing with date-fns
  const parsed = parse(dateStr, "MMM d, yyyy", new Date());
  if (isValid(parsed)) {
    return parsed;
  }

  // Fallback to native parsing
  return new Date(dateStr);
}

/**
 * Format date for display in chart buttons (e.g., "Jan 1, 2026")
 */
export function formatChartDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

/**
 * Format date for display in date picker (e.g., "Jan 1, 2026")
 */
export function formatFullDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

/**
 * Check if a date is within a range (inclusive)
 */
export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  const time = date.getTime();
  return time >= startDate.getTime() && time <= endDate.getTime();
}
