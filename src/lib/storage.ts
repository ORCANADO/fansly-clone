/**
 * Storage utilities for VibeStats manual overrides.
 * 
 * @vibe-critical: Manages localStorage operations for the manual override system.
 * Provides type-safe access to the 'vibestats_manual_overrides' key.
 */

import type { MonthlyOverride, ManualOverridesStorage, DailyCategoryBreakdown } from "@/types/overrides";
import {
  distributeMonthlyTotalEvenly,
  createEmptyDailyCategoryValues,
  calculateDailyValues,
  calculateCategoryTotals,
  createMonthlyOverrideWithDailyCategoryValues
} from "@/types/overrides";

const MANUAL_OVERRIDES_KEY = 'vibestats_manual_overrides';
const STORAGE_VERSION_KEY = 'vibestats_manual_overrides_version';
const CURRENT_VERSION = '3.0'; // Version 3.0 adds dailyCategoryValues support
const DEFAULT_OVERRIDES: ManualOverridesStorage = {};

// Legacy interface for backward compatibility
interface LegacyMonthlyOverride {
  netIncome: number;
  grossIncome: number;
  categories: {
    media: number;
    mediaSets: number;
    tips: number;
    subscriptions: number;
  };
  isManual: boolean;
  lastUpdated: string;
  note?: string;
  categoryPercentages?: {
    media: number;
    mediaSets: number;
    tips: number;
    subscriptions: number;
  };
}

/**
 * Get all manual overrides from localStorage.
 * @returns The complete manual overrides storage object
 */
export function getAllManualOverrides(): ManualOverridesStorage {
  if (typeof window === 'undefined') {
    return DEFAULT_OVERRIDES;
  }

  try {
    const stored = localStorage.getItem(MANUAL_OVERRIDES_KEY);
    if (!stored) {
      return DEFAULT_OVERRIDES;
    }

    const parsed = JSON.parse(stored) as ManualOverridesStorage;

    // Validate the parsed data has the expected structure
    if (typeof parsed !== 'object' || parsed === null) {
      console.warn('Invalid manual overrides data in localStorage, returning defaults');
      return DEFAULT_OVERRIDES;
    }

    // Check if migration is needed
    const migrated = migrateLegacyOverridesIfNeeded(parsed);

    // If migration happened, save the migrated data
    if (migrated !== parsed) {
      localStorage.setItem(MANUAL_OVERRIDES_KEY, JSON.stringify(migrated));
    }

    return migrated;
  } catch (error) {
    console.error('Error reading manual overrides from localStorage:', error);
    return DEFAULT_OVERRIDES;
  }
}

/**
 * Migrate legacy overrides that don't have dailyCategoryValues.
 * Handles two migration paths:
 * 1. Legacy overrides (no dailyValues) → dailyCategoryValues with even distribution
 * 2. Current overrides (with dailyValues) → dailyCategoryValues by applying percentages
 */
function migrateLegacyOverridesIfNeeded(
  overrides: ManualOverridesStorage
): ManualOverridesStorage {
  let needsMigration = false;
  const migrated: ManualOverridesStorage = {};

  for (const [monthKey, override] of Object.entries(overrides)) {
    // Check if this override needs migration to dailyCategoryValues
    const needsDailyCategoryValues = !override.dailyCategoryValues || Object.keys(override.dailyCategoryValues).length === 0;

    if (needsDailyCategoryValues) {
      needsMigration = true;
      const daysInMonth = getDaysInMonth(monthKey);

      // Case 1: Has dailyValues but no dailyCategoryValues
      if (override.dailyValues && Object.keys(override.dailyValues).length > 0) {
        // Convert dailyValues to dailyCategoryValues by applying percentages
        const dailyCategoryValues: Record<string, DailyCategoryBreakdown> = {};

        // Use custom percentages if available, otherwise use defaults
        const mediaPercent = override.categoryPercentages?.media ?? 0.58;
        const mediaSetsPercent = override.categoryPercentages?.mediaSets ?? 0.21;
        const tipsPercent = override.categoryPercentages?.tips ?? 0.08;
        const subscriptionsPercent = override.categoryPercentages?.subscriptions ?? 0.13;

        // Create dailyCategoryValues for all days in month
        for (let day = 1; day <= daysInMonth; day++) {
          const dayKey = day.toString();
          const dayTotal = override.dailyValues[dayKey] || 0;

          dailyCategoryValues[dayKey] = {
            media: dayTotal * mediaPercent,
            tips: dayTotal * tipsPercent,
            subscriptions: dayTotal * subscriptionsPercent,
            mediaSets: dayTotal * mediaSetsPercent,
          };
        }

        migrated[monthKey] = {
          ...override,
          dailyCategoryValues,
          // Keep dailyValues for backward compatibility
        };
      }
      // Case 2: No dailyValues at all (legacy override)
      else {
        // Create dailyCategoryValues by distributing netIncome evenly with percentages
        const dailyCategoryValues = distributeMonthlyTotalEvenly(
          override.netIncome,
          daysInMonth,
          override.categoryPercentages
        );

        // Calculate dailyValues from dailyCategoryValues for backward compatibility
        const dailyValues = calculateDailyValues(dailyCategoryValues);

        migrated[monthKey] = {
          ...override,
          dailyCategoryValues,
          dailyValues,
        };
      }
    } else {
      // Already has dailyCategoryValues, keep as is
      migrated[monthKey] = override;
    }
  }

  return needsMigration ? migrated : overrides;
}

/**
 * Get a specific manual override for a month.
 * @param monthKey - Month in "YYYY-MM" format (e.g., "2024-12")
 * @returns The monthly override or null if not found
 */
export function getManualOverride(monthKey: string): MonthlyOverride | null {
  const overrides = getAllManualOverrides();
  return overrides[monthKey] || null;
}

/**
 * Check if a manual override exists for a month.
 * @param monthKey - Month in "YYYY-MM" format
 * @returns True if an override exists for this month
 */
export function hasManualOverride(monthKey: string): boolean {
  const overrides = getAllManualOverrides();
  return monthKey in overrides;
}

/**
 * Save or update a manual override for a month.
 * @param monthKey - Month in "YYYY-MM" format
 * @param override - The monthly override data to save
 */
export function saveManualOverride(monthKey: string, override: MonthlyOverride): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const overrides = getAllManualOverrides();
    const updatedOverrides = {
      ...overrides,
      [monthKey]: {
        ...override,
        lastUpdated: new Date().toISOString(),
      },
    };

    localStorage.setItem(MANUAL_OVERRIDES_KEY, JSON.stringify(updatedOverrides));
  } catch (error) {
    console.error('Error saving manual override to localStorage:', error);
  }
}

/**
 * Delete a manual override for a month.
 * @param monthKey - Month in "YYYY-MM" format
 */
export function deleteManualOverride(monthKey: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const overrides = getAllManualOverrides();
    const { [monthKey]: _, ...remainingOverrides } = overrides;

    localStorage.setItem(MANUAL_OVERRIDES_KEY, JSON.stringify(remainingOverrides));
  } catch (error) {
    console.error('Error deleting manual override from localStorage:', error);
  }
}

/**
 * Clear all manual overrides from localStorage.
 */
export function clearAllManualOverrides(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(MANUAL_OVERRIDES_KEY);
  } catch (error) {
    console.error('Error clearing manual overrides from localStorage:', error);
  }
}

/**
 * Get a list of all months that have manual overrides.
 * @returns Array of month keys in "YYYY-MM" format
 */
export function getMonthsWithOverrides(): string[] {
  const overrides = getAllManualOverrides();
  return Object.keys(overrides).sort().reverse(); // Most recent first
}

/**
 * Get the count of manual overrides.
 * @returns Number of months with manual overrides
 */
export function getManualOverrideCount(): number {
  const overrides = getAllManualOverrides();
  return Object.keys(overrides).length;
}

/**
 * Helper function to convert a date to a month key.
 * @param date - Date object or string
 * @returns Month key in "YYYY-MM" format
 */
export function dateToMonthKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Helper function to get the current month key.
 * @returns Current month in "YYYY-MM" format
 */
export function getCurrentMonthKey(): string {
  return dateToMonthKey(new Date());
}

/**
 * Helper function to parse a month key into a display format.
 * @param monthKey - Month in "YYYY-MM" format
 * @returns Display string like "Jan 2024"
 */
export function formatMonthKey(monthKey: string): string {
  try {
    const [year, month] = monthKey.split('-').map(Number);
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return monthKey;
  }
}

/**
 * Helper function to get the number of days in a month.
 * @param monthKey - Month in "YYYY-MM" format
 * @returns Number of days in the month
 */
export function getDaysInMonth(monthKey: string): number {
  try {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  } catch {
    // Default to 30 days if parsing fails
    return 30;
  }
}

/**
 * Helper function to validate if a string is a valid month key.
 * @param monthKey - String to validate
 * @returns True if the string matches "YYYY-MM" format
 */
export function isValidMonthKey(monthKey: string): boolean {
  const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!regex.test(monthKey)) {
    return false;
  }

  const [year, month] = monthKey.split('-').map(Number);
  return year >= 2000 && year <= 2100 && month >= 1 && month <= 12;
}

/**
 * Export all manual overrides to a CSV file.
 * @returns CSV string with all manual overrides data
 */
export function exportManualOverridesToCSV(): string {
  const overrides = getAllManualOverrides();

  // CSV headers for daily data
  const headers = [
    'Date',
    'Net Income',
    'Gross Income',
    'Media',
    'Media Sets',
    'Tips',
    'Subscriptions',
    'Note',
    'Last Updated',
    'Is Manual'
  ];

  const allRows: string[] = [];

  // Iterate over each month's override
  Object.entries(overrides).forEach(([monthKey, override]) => {
    const dailyData = override.dailyCategoryValues || {};
    const [year, month] = monthKey.split('-').map(Number);

    // Sort days numerically
    const dayKeys = Object.keys(dailyData).sort((a, b) => Number(a) - Number(b));

    dayKeys.forEach(dayStr => {
      const breakdown = dailyData[dayStr];
      if (!breakdown) return;

      const day = Number(dayStr);
      // Construct date string YYYY-MM-DD
      // Note: month is 1-based in monthKey.
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const dailyNet = breakdown.media + breakdown.mediaSets + breakdown.tips + breakdown.subscriptions;
      const dailyGross = dailyNet * 1.2; // 20% fee assumption holds for daily too

      const row = [
        dateStr,
        dailyNet.toFixed(2),
        dailyGross.toFixed(2),
        breakdown.media.toFixed(2),
        breakdown.mediaSets.toFixed(2),
        breakdown.tips.toFixed(2),
        breakdown.subscriptions.toFixed(2),
        override.note || '', // Monthly note applies to all days, or empty? User might prefer empty to avoid repetition, but let's keep it contextually.
        override.lastUpdated,
        override.isManual ? 'TRUE' : 'FALSE'
      ].map(field => `"${field}"`).join(',');

      allRows.push(row);
    });
  });

  // Sort all rows by date descending (most recent first) ? Or ascending?
  // User didn't specify, but usually chronological or reverse chronological.
  // Original `getMonthsWithOverrides` did reverse sort. Let's do reverse chronological (newest date first).
  allRows.sort((a, b) => {
    const dateA = a.split(',')[0].replace(/"/g, '');
    const dateB = b.split(',')[0].replace(/"/g, '');
    return dateB.localeCompare(dateA);
  });

  return [headers.join(','), ...allRows].join('\n');
}

/**
 * Download manual overrides as a CSV file.
 */
export function downloadManualOverridesCSV(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const csvContent = exportManualOverridesToCSV();
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `vibestats_manual_overrides_${timestamp}.csv`;

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import manual overrides from a CSV file.
 * @param csvText - CSV text content
 * @returns Object with success count and error messages
 */
export function importManualOverridesFromCSV(csvText: string): {
  success: number;
  errors: string[];
  total: number;
} {
  const errors: string[] = [];
  let successCount = 0;

  try {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      errors.push('CSV file is empty or has no data rows');
      return { success: 0, errors, total: 0 };
    }

    // Normalize headers: remove quotes and trim
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

    // Check for new daily format
    const isDailyFormat = headers.includes('Date');

    // Validate headers
    const expectedHeaders = isDailyFormat ? [
      'Date',
      'Net Income',
      'Gross Income',
      'Media',
      'Media Sets',
      'Tips',
      'Subscriptions',
      'Note',
      'Last Updated',
      'Is Manual'
    ] : [
      'Month',
      'Net Income',
      'Gross Income',
      'Media',
      'Media Sets',
      'Tips',
      'Subscriptions',
      'Note',
      'Last Updated',
      'Is Manual'
    ];

    if (!expectedHeaders.every(h => headers.includes(h))) {
      errors.push(`CSV headers don't match expected format. Found: ${headers.join(', ')}`);
      return { success: 0, errors, total: 0 };
    }

    if (isDailyFormat) {
      // Process daily format: group by month first
      const monthlyData: Record<string, {
        dailyCategoryValues: Record<string, DailyCategoryBreakdown>;
        note?: string;
        lastUpdated: string;
        isManual: boolean;
      }> = {};

      for (let i = 1; i < lines.length; i++) {
        try {
          const row = lines[i];
          const values = row.split(',').map(v => v.replace(/^"|"$/g, '').trim());

          if (values.length < headers.length) {
            continue; // Skip malformed rows
          }

          const dateStr = values[headers.indexOf('Date')]; // "YYYY-MM-DD"
          if (!dateStr || dateStr.length < 10) continue;

          const monthKey = dateStr.slice(0, 7); // "YYYY-MM"
          const day = parseInt(dateStr.slice(8, 10), 10).toString(); // "DD" -> "D" or "DD"

          if (!isValidMonthKey(monthKey)) {
            continue;
          }

          const media = parseFloat(values[headers.indexOf('Media')]);
          const mediaSets = parseFloat(values[headers.indexOf('Media Sets')]);
          const tips = parseFloat(values[headers.indexOf('Tips')]);
          const subscriptions = parseFloat(values[headers.indexOf('Subscriptions')]);
          // Optional fields
          const note = headers.includes('Note') ? (values[headers.indexOf('Note')] || undefined) : undefined;
          const lastUpdated = headers.includes('Last Updated') ? (values[headers.indexOf('Last Updated')] || new Date().toISOString()) : new Date().toISOString();
          const isManual = headers.includes('Is Manual') ? (values[headers.indexOf('Is Manual')]?.toUpperCase() === 'TRUE') : true;

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              dailyCategoryValues: {},
              note,
              lastUpdated,
              isManual
            };
          }

          // Use the latest note/updated timestamp encountered for the month
          if (note) monthlyData[monthKey].note = note;
          if (lastUpdated > monthlyData[monthKey].lastUpdated) monthlyData[monthKey].lastUpdated = lastUpdated;

          monthlyData[monthKey].dailyCategoryValues[day] = {
            media: isNaN(media) ? 0 : media,
            mediaSets: isNaN(mediaSets) ? 0 : mediaSets,
            tips: isNaN(tips) ? 0 : tips,
            subscriptions: isNaN(subscriptions) ? 0 : subscriptions
          };

        } catch (e) {
          // Skip row error
        }
      }

      // Save aggregated monthly overrides
      for (const [monthKey, data] of Object.entries(monthlyData)) {
        try {
          const override = createMonthlyOverrideWithDailyCategoryValues(
            data.dailyCategoryValues,
            data.note
          );
          // Preserve metadata
          override.lastUpdated = data.lastUpdated;
          override.isManual = data.isManual;

          saveManualOverride(monthKey, override);
          successCount++;
        } catch (saveError) {
          errors.push(`Failed to save data for ${monthKey}`);
        }
      }

      return {
        success: successCount,
        errors,
        total: Object.keys(monthlyData).length
      };

    } else {
      // Process legacy monthly format (existing logic)
      for (let i = 1; i < lines.length; i++) {
        try {
          const row = lines[i];
          const values = row.split(',').map(v => v.replace(/^"|"$/g, '').trim());

          if (values.length < headers.length) {
            errors.push(`Row ${i}: Not enough columns`);
            continue;
          }

          const monthKey = values[headers.indexOf('Month')];
          if (!isValidMonthKey(monthKey)) {
            errors.push(`Row ${i}: Invalid month format "${monthKey}"`);
            continue;
          }

          const netIncome = parseFloat(values[headers.indexOf('Net Income')]);
          const grossIncome = parseFloat(values[headers.indexOf('Gross Income')]);
          const note = values[headers.indexOf('Note')] || undefined;
          const lastUpdated = values[headers.indexOf('Last Updated')] || new Date().toISOString();
          const isManual = values[headers.indexOf('Is Manual')]?.toUpperCase() === 'TRUE';

          // Create daily category values by splitting netIncome evenly
          const daysInMonth = getDaysInMonth(monthKey);
          const dailyCategoryValues = distributeMonthlyTotalEvenly(
            netIncome,
            daysInMonth,
            {
              media: 0.58,
              mediaSets: 0.21,
              tips: 0.08,
              subscriptions: 0.13,
            }
          );

          // Calculate daily values and totals
          const dailyValues = calculateDailyValues(dailyCategoryValues);
          const categories = calculateCategoryTotals(dailyCategoryValues);

          const override: MonthlyOverride = {
            dailyCategoryValues,
            dailyValues,
            netIncome,
            grossIncome: isNaN(grossIncome) ? netIncome * 1.2 : grossIncome,
            categories,
            isManual: isManual !== false,
            lastUpdated,
            note: note || undefined,
          };

          saveManualOverride(monthKey, override);
          successCount++;

        } catch (rowError) {
          errors.push(`Row ${i}: Error processing row - ${rowError instanceof Error ? rowError.message : String(rowError)}`);
        }
      }

      return {
        success: successCount,
        errors,
        total: lines.length - 1
      };
    }

  } catch (error) {
    errors.push(`Failed to parse CSV file: ${error instanceof Error ? error.message : String(error)}`);
    return { success: 0, errors, total: 0 };
  }
}

/**
 * Import manual overrides from a File object (for file input).
 * @param file - File object from input element
 * @returns Promise with import results
 */
export async function importManualOverridesFromFile(file: File): Promise<{
  success: number;
  errors: string[];
  total: number;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const result = importManualOverridesFromCSV(csvText);
        resolve(result);
      } catch (error) {
        resolve({
          success: 0,
          errors: [`Failed to read file: ${error instanceof Error ? error.message : String(error)}`],
          total: 0
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: 0,
        errors: ['Failed to read file'],
        total: 0
      });
    };

    reader.readAsText(file);
  });
}