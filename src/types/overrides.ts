/**
 * Manual Override Types for VibeStats Dashboard
 *
 * @vibe-critical: Defines the data structure for manual overrides that take
 * precedence over simulated data. Manual overrides are stored in localStorage
 * under the key 'vibestats_manual_overrides'.
 */

/**
 * Daily category breakdown for per-day editing.
 * Allows editing all 4 category values for each day individually.
 */
export interface DailyCategoryBreakdown {
  /** Media sales for this day */
  media: number;
  
  /** Tips for this day */
  tips: number;
  
  /** Subscriptions for this day */
  subscriptions: number;
  
  /** Media sets for this day */
  mediaSets: number;
}

export interface MonthlyOverride {
  /**
   * Daily category breakdown. Key is day number as string (e.g., "1", "15", "30").
   * This is the primary storage for per-day category editing.
   */
  dailyCategoryValues: Record<string, DailyCategoryBreakdown>;
  
  /**
   * Daily earnings totals (calculated from dailyCategoryValues, kept for backward compatibility).
   * @deprecated Use dailyCategoryValues instead
   */
  dailyValues?: Record<string, number>;
  
  /** Net income for the month (calculated from sum of all daily category values) */
  netIncome: number;
  
  /** Gross income (netIncome * 1.2 to account for 20% platform fee) */
  grossIncome: number;
  
  /**
   * Category breakdown (calculated from sum of dailyCategoryValues across all days).
   * These are derived fields, not stored percentages.
   */
  categories: {
    /** Media sales: sum of media across all days */
    media: number;
    
    /** Media sets: sum of mediaSets across all days */
    mediaSets: number;
    
    /** Tips: sum of tips across all days */
    tips: number;
    
    /** Subscriptions: sum of subscriptions across all days */
    subscriptions: number;
  };
  
  /**
   * Optional custom category percentages (deprecated with per-day editing).
   * Kept for backward compatibility during migration.
   * @deprecated Use dailyCategoryValues for precise category control
   */
  categoryPercentages?: {
    /** Media percentage (e.g., 0.54 for 54%) */
    media: number;
    
    /** Media sets percentage */
    mediaSets: number;
    
    /** Tips percentage */
    tips: number;
    
    /** Subscriptions percentage */
    subscriptions: number;
  };
  
  /** Flag indicating this is a manual override (always true for overrides) */
  isManual: boolean;
  
  /** ISO timestamp of when this override was last updated */
  lastUpdated: string;
  
  /** Optional user note about this month's data */
  note?: string;
}

/**
 * Storage structure for manual overrides.
 * Keys are month strings in "YYYY-MM" format (e.g., "2024-12").
 */
export type ManualOverridesStorage = Record<string, MonthlyOverride>;

/**
 * Default distribution ratios for the Fansly-standard split.
 * These replace the old 65/25/10 distribution.
 */
export const DISTRIBUTION_RATIOS = {
  MEDIA: 0.58,      // 58%
  MEDIA_SETS: 0.21, // 21%
  TIPS: 0.08,       // 8%
  SUBSCRIPTIONS: 0.13, // 13%
  TOTAL: 1.0,       // 100%
} as const;

/**
 * Platform fee multiplier (20% fee means gross = net * 1.2)
 */
export const PLATFORM_FEE_MULTIPLIER = 1.2;

/**
 * Helper function to create a new MonthlyOverride with calculated values.
 * @param netIncome - The net income for the month
 * @param note - Optional note about this month
 * @returns A complete MonthlyOverride object with calculated gross and categories
 */
export function createMonthlyOverride(
  netIncome: number,
  note?: string
): MonthlyOverride {
  const grossIncome = netIncome * PLATFORM_FEE_MULTIPLIER;
  
  return {
    dailyCategoryValues: {}, // Empty daily category values - will be populated by UI
    dailyValues: {}, // Empty for backward compatibility
    netIncome,
    grossIncome,
    categories: {
      media: netIncome * DISTRIBUTION_RATIOS.MEDIA,
      mediaSets: netIncome * DISTRIBUTION_RATIOS.MEDIA_SETS,
      tips: netIncome * DISTRIBUTION_RATIOS.TIPS,
      subscriptions: netIncome * DISTRIBUTION_RATIOS.SUBSCRIPTIONS,
    },
    isManual: true,
    lastUpdated: new Date().toISOString(),
    note,
  };
}

/**
 * Helper function to create a new MonthlyOverride with daily category values.
 * @param dailyCategoryValues - Daily category breakdown (key: day number as string, value: DailyCategoryBreakdown)
 * @param note - Optional note about this month
 * @returns A complete MonthlyOverride object with calculated values
 */
export function createMonthlyOverrideWithDailyCategoryValues(
  dailyCategoryValues: Record<string, DailyCategoryBreakdown>,
  note?: string
): MonthlyOverride {
  // Calculate net income from sum of all daily category values
  let netIncome = 0;
  const categorySums = {
    media: 0,
    mediaSets: 0,
    tips: 0,
    subscriptions: 0,
  };
  
  // Calculate daily values and category sums
  const dailyValues: Record<string, number> = {};
  
  for (const [day, breakdown] of Object.entries(dailyCategoryValues)) {
    const dayTotal = breakdown.media + breakdown.tips + breakdown.subscriptions + breakdown.mediaSets;
    dailyValues[day] = dayTotal;
    netIncome += dayTotal;
    
    categorySums.media += breakdown.media;
    categorySums.mediaSets += breakdown.mediaSets;
    categorySums.tips += breakdown.tips;
    categorySums.subscriptions += breakdown.subscriptions;
  }
  
  const grossIncome = netIncome * PLATFORM_FEE_MULTIPLIER;
  
  return {
    dailyCategoryValues,
    dailyValues, // For backward compatibility
    netIncome,
    grossIncome,
    categories: {
      media: categorySums.media,
      mediaSets: categorySums.mediaSets,
      tips: categorySums.tips,
      subscriptions: categorySums.subscriptions,
    },
    isManual: true,
    lastUpdated: new Date().toISOString(),
    note,
  };
}

/**
 * Helper function to create a new MonthlyOverride with daily values (legacy function).
 * @param dailyValues - Daily earnings breakdown (key: day number as string, value: amount)
 * @param note - Optional note about this month
 * @param categoryPercentages - Optional custom category percentages
 * @returns A complete MonthlyOverride object with calculated values
 * @deprecated Use createMonthlyOverrideWithDailyCategoryValues instead
 */
export function createMonthlyOverrideWithDailyValues(
  dailyValues: Record<string, number>,
  note?: string,
  categoryPercentages?: {
    media: number;
    mediaSets: number;
    tips: number;
    subscriptions: number;
  }
): MonthlyOverride {
  // Calculate net income from sum of daily values
  const netIncome = Object.values(dailyValues).reduce((sum, val) => sum + val, 0);
  const grossIncome = netIncome * PLATFORM_FEE_MULTIPLIER;
  
  // Use custom percentages if provided, otherwise use defaults
  const mediaPercent = categoryPercentages?.media ?? DISTRIBUTION_RATIOS.MEDIA;
  const mediaSetsPercent = categoryPercentages?.mediaSets ?? DISTRIBUTION_RATIOS.MEDIA_SETS;
  const tipsPercent = categoryPercentages?.tips ?? DISTRIBUTION_RATIOS.TIPS;
  const subscriptionsPercent = categoryPercentages?.subscriptions ?? DISTRIBUTION_RATIOS.SUBSCRIPTIONS;
  
  // Create dailyCategoryValues by applying percentages to each day
  const dailyCategoryValues: Record<string, DailyCategoryBreakdown> = {};
  
  for (const [day, dayTotal] of Object.entries(dailyValues)) {
    dailyCategoryValues[day] = {
      media: dayTotal * mediaPercent,
      tips: dayTotal * tipsPercent,
      subscriptions: dayTotal * subscriptionsPercent,
      mediaSets: dayTotal * mediaSetsPercent,
    };
  }
  
  return {
    dailyCategoryValues,
    dailyValues, // Keep for backward compatibility
    netIncome,
    grossIncome,
    categories: {
      media: netIncome * mediaPercent,
      mediaSets: netIncome * mediaSetsPercent,
      tips: netIncome * tipsPercent,
      subscriptions: netIncome * subscriptionsPercent,
    },
    categoryPercentages: categoryPercentages,
    isManual: true,
    lastUpdated: new Date().toISOString(),
    note,
  };
}

/**
 * Helper function to calculate monthly total from daily values.
 * @param override - The monthly override
 * @returns Total net income for the month
 */
export function getMonthlyTotal(override: MonthlyOverride): number {
  // Prefer dailyCategoryValues if available, otherwise use dailyValues
  if (Object.keys(override.dailyCategoryValues).length > 0) {
    let total = 0;
    for (const breakdown of Object.values(override.dailyCategoryValues)) {
      total += breakdown.media + breakdown.tips + breakdown.subscriptions + breakdown.mediaSets;
    }
    return total;
  }
  
  // Fallback to dailyValues for backward compatibility
  return Object.values(override.dailyValues || {}).reduce((sum, val) => sum + val, 0);
}

/**
 * Helper function to validate if a MonthlyOverride has correct ratios.
 * @param override - The override to validate
 * @returns True if the override's categories match the expected distribution (default or custom)
 * @deprecated With per-day category editing, ratios are not enforced
 */
export function validateOverrideRatios(override: MonthlyOverride): boolean {
  // With per-day category editing, any ratio is valid
  // This function is kept for backward compatibility but always returns true
  return true;
}

/**
 * Helper function to calculate category totals from dailyCategoryValues.
 * @param dailyCategoryValues - Daily category breakdown
 * @returns Object with category sums
 */
export function calculateCategoryTotals(
  dailyCategoryValues: Record<string, DailyCategoryBreakdown>
): MonthlyOverride['categories'] {
  const totals = {
    media: 0,
    mediaSets: 0,
    tips: 0,
    subscriptions: 0,
  };
  
  for (const breakdown of Object.values(dailyCategoryValues)) {
    totals.media += breakdown.media;
    totals.mediaSets += breakdown.mediaSets;
    totals.tips += breakdown.tips;
    totals.subscriptions += breakdown.subscriptions;
  }
  
  return totals;
}

/**
 * Helper function to calculate daily values from dailyCategoryValues.
 * @param dailyCategoryValues - Daily category breakdown
 * @returns Record of day -> total (sum of categories for that day)
 */
export function calculateDailyValues(
  dailyCategoryValues: Record<string, DailyCategoryBreakdown>
): Record<string, number> {
  const dailyValues: Record<string, number> = {};
  
  for (const [day, breakdown] of Object.entries(dailyCategoryValues)) {
    dailyValues[day] = breakdown.media + breakdown.tips + breakdown.subscriptions + breakdown.mediaSets;
  }
  
  return dailyValues;
}

/**
 * Helper function to adjust categories proportionally when one is manually edited.
 * @param override - The original override
 * @param updatedCategory - The category that was updated
 * @param newValue - The new value for that category
 * @returns A new override with adjusted categories maintaining the net income total
 * @deprecated With per-day category editing, use direct editing instead
 */
export function adjustCategoriesProportionally(
  override: MonthlyOverride,
  updatedCategory: keyof MonthlyOverride['categories'],
  newValue: number
): MonthlyOverride {
  const { categories, netIncome, dailyCategoryValues } = override;
  
  // Calculate the total of the other categories
  const otherCategories = Object.keys(categories).filter(
    key => key !== updatedCategory
  ) as Array<keyof MonthlyOverride['categories']>;
  
  const otherCategoriesTotal = otherCategories.reduce(
    (sum, key) => sum + categories[key],
    0
  );
  
  // Calculate scaling factor for other categories
  const remainingNetIncome = netIncome - newValue;
  const scaleFactor = remainingNetIncome / otherCategoriesTotal;
  
  // Create new categories object
  const newCategories = { ...categories };
  newCategories[updatedCategory] = newValue;
  
  otherCategories.forEach(key => {
    newCategories[key] = categories[key] * scaleFactor;
  });
  
  // Recalculate net income to ensure it matches (should be close due to scaling)
  const calculatedNetIncome = Object.values(newCategories).reduce(
    (sum, value) => sum + value,
    0
  );
  
  return {
    ...override,
    dailyCategoryValues, // Preserve daily category values
    netIncome: calculatedNetIncome,
    grossIncome: calculatedNetIncome * PLATFORM_FEE_MULTIPLIER,
    categories: newCategories,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Helper function to create empty daily category values for all days in a month.
 * @param daysInMonth - Number of days in the month
 * @returns Record with empty (0) values for all days
 */
export function createEmptyDailyCategoryValues(
  daysInMonth: number
): Record<string, DailyCategoryBreakdown> {
  const dailyCategoryValues: Record<string, DailyCategoryBreakdown> = {};
  
  for (let day = 1; day <= daysInMonth; day++) {
    dailyCategoryValues[day.toString()] = {
      media: 0,
      tips: 0,
      subscriptions: 0,
      mediaSets: 0,
    };
  }
  
  return dailyCategoryValues;
}

/**
 * Helper function to distribute a monthly total evenly across days with default percentages.
 * @param monthlyTotal - Total net income for the month
 * @param daysInMonth - Number of days in the month
 * @param categoryPercentages - Optional custom percentages (default: 58/21/8/13)
 * @returns Daily category values with even distribution
 */
export function distributeMonthlyTotalEvenly(
  monthlyTotal: number,
  daysInMonth: number,
  categoryPercentages?: {
    media: number;
    mediaSets: number;
    tips: number;
    subscriptions: number;
  }
): Record<string, DailyCategoryBreakdown> {
  const dailyCategoryValues: Record<string, DailyCategoryBreakdown> = {};
  
  // Use custom percentages if provided, otherwise use defaults
  const mediaPercent = categoryPercentages?.media ?? DISTRIBUTION_RATIOS.MEDIA;
  const mediaSetsPercent = categoryPercentages?.mediaSets ?? DISTRIBUTION_RATIOS.MEDIA_SETS;
  const tipsPercent = categoryPercentages?.tips ?? DISTRIBUTION_RATIOS.TIPS;
  const subscriptionsPercent = categoryPercentages?.subscriptions ?? DISTRIBUTION_RATIOS.SUBSCRIPTIONS;
  
  const dailyTotal = monthlyTotal / daysInMonth;
  
  for (let day = 1; day <= daysInMonth; day++) {
    dailyCategoryValues[day.toString()] = {
      media: dailyTotal * mediaPercent,
      tips: dailyTotal * tipsPercent,
      subscriptions: dailyTotal * subscriptionsPercent,
      mediaSets: dailyTotal * mediaSetsPercent,
    };
  }
  
  return dailyCategoryValues;
}