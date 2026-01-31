"use client";
// @vibe-critical: Core distribution engine for calculating earnings based on target input.
// Now supports manual overrides with priority checking and new Fansly-standard distribution ratios.

import { useState, useEffect, useMemo } from "react";
import type { MonthlyOverride } from "@/types/overrides";
import { 
  getManualOverride, 
  dateToMonthKey,
  getDaysInMonth 
} from "@/lib/storage";
import { 
  DISTRIBUTION_RATIOS, 
  PLATFORM_FEE_MULTIPLIER,
  createMonthlyOverride 
} from "@/types/overrides";

export interface DailyStats {
    date: string;
    tips: number;
    subs: number;
    media: number;
    mediaSets: number;
    total: number;
}

export interface DashboardStats {
    targetAmount: number;
    tips: number;
    subs: number;
    media: number;
    mediaSets: number;
    grossIncome: number;
    netIncome: number;
    dailyData: DailyStats[];
    isManualOverride?: boolean;
    overrideMonthKey?: string;
}

const TARGET_STORAGE_KEY = "vibestats_data";

interface UseDashboardDataOptions {
  /** Month key in "YYYY-MM" format. If not provided, uses current month. */
  monthKey?: string;
  /** Whether to use the targetAmount state for simulation. Defaults to true. */
  useTargetState?: boolean;
  /** Initial target amount for simulation. Only used if useTargetState is false. */
  initialTargetAmount?: number;
}

/**
 * Main hook for dashboard data with manual override support.
 * 
 * @param options - Configuration options for the hook
 * @returns Dashboard stats with override data if available, otherwise simulated data
 */
export function useDashboardData(options: UseDashboardDataOptions = {}) {
    const { 
      monthKey: providedMonthKey, 
      useTargetState = true,
      initialTargetAmount = 12000 
    } = options;
    
    const [targetAmount, setTargetAmount] = useState<number>(initialTargetAmount);

    // Determine the month key to use
    const monthKey = providedMonthKey || dateToMonthKey(new Date());
    const daysInMonth = getDaysInMonth(monthKey);

    // Load target amount from localStorage on mount (only if using target state)
    useEffect(() => {
        if (!useTargetState) return;
        
        const saved = localStorage.getItem(TARGET_STORAGE_KEY);
        if (saved) {
            setTargetAmount(Number(saved));
        }
    }, [useTargetState]);

    // Save target amount to localStorage when it changes (only if using target state)
    useEffect(() => {
        if (!useTargetState) return;
        
        localStorage.setItem(TARGET_STORAGE_KEY, targetAmount.toString());
    }, [targetAmount, useTargetState]);

    const stats = useMemo((): DashboardStats => {
        // Check for manual override first
        const manualOverride = getManualOverride(monthKey);
        
        if (manualOverride) {
            // Use manual override data
            const dailyData = generateManualDailyData(
                monthKey,
                manualOverride,
                daysInMonth
            );
            
            return {
                targetAmount: manualOverride.netIncome,
                tips: manualOverride.categories.tips,
                subs: manualOverride.categories.subscriptions,
                media: manualOverride.categories.media,
                mediaSets: manualOverride.categories.mediaSets,
                grossIncome: manualOverride.grossIncome,
                netIncome: manualOverride.netIncome,
                dailyData,
                isManualOverride: true,
                overrideMonthKey: monthKey,
            };
        }
        
        // No override found, use simulation with new distribution ratios
        return generateSimulationStats(
            targetAmount,
            monthKey,
            daysInMonth
        );
    }, [monthKey, targetAmount, daysInMonth]);

    return {
        ...stats,
        setTargetAmount: useTargetState ? setTargetAmount : (() => {}),
        monthKey,
        hasManualOverride: !!getManualOverride(monthKey),
    };
}

/**
 * Generate simulation stats using the new Fansly-standard distribution ratios.
 */
function generateSimulationStats(
    targetAmount: number,
    monthKey: string,
    daysInMonth: number
): DashboardStats {
    // Net Income = targetAmount
    // Gross Income = Net Income * 1.2 (20% platform fee)
    const netIncome = targetAmount;
    const grossIncome = netIncome * PLATFORM_FEE_MULTIPLIER;

    // New Fansly-standard distribution ratios
    const subscriptionsTotal = netIncome * DISTRIBUTION_RATIOS.SUBSCRIPTIONS; // 13%
    const tipsTotal = netIncome * DISTRIBUTION_RATIOS.TIPS; // 8%
    const mediaTotal = netIncome * DISTRIBUTION_RATIOS.MEDIA; // 58%
    const mediaSetsTotal = netIncome * DISTRIBUTION_RATIOS.MEDIA_SETS; // 21%

    // Generate daily data with bell-curve distribution
    const dailyData = generateSimulationDailyData(
        monthKey,
        daysInMonth,
        {
            subscriptions: subscriptionsTotal,
            tips: tipsTotal,
            media: mediaTotal,
            mediaSets: mediaSetsTotal,
            netIncome,
        }
    );

    return {
        targetAmount,
        tips: tipsTotal,
        subs: subscriptionsTotal,
        media: mediaTotal,
        mediaSets: mediaSetsTotal,
        grossIncome,
        netIncome,
        dailyData,
        isManualOverride: false,
    };
}

/**
 * Generate daily data for manual overrides using daily category values.
 * Uses the exact category values for each day instead of applying percentages.
 */
function generateManualDailyData(
    monthKey: string,
    override: MonthlyOverride,
    daysInMonth: number
): DailyStats[] {
    const { dailyCategoryValues, dailyValues } = override;
    const dailyData: DailyStats[] = [];
    
    const [year, month] = monthKey.split('-').map(Number);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayKey = day.toString();
        
        // Get category breakdown for this day
        let dayBreakdown;
        if (dailyCategoryValues && dailyCategoryValues[dayKey]) {
            // Use dailyCategoryValues if available
            dayBreakdown = dailyCategoryValues[dayKey];
        } else if (dailyValues && dailyValues[dayKey] !== undefined) {
            // Fallback: legacy data - use dailyValues with default percentages
            const dayTotal = dailyValues[dayKey] || 0;
            dayBreakdown = {
                media: dayTotal * DISTRIBUTION_RATIOS.MEDIA,
                tips: dayTotal * DISTRIBUTION_RATIOS.TIPS,
                subscriptions: dayTotal * DISTRIBUTION_RATIOS.SUBSCRIPTIONS,
                mediaSets: dayTotal * DISTRIBUTION_RATIOS.MEDIA_SETS,
            };
        } else {
            // No data for this day
            dayBreakdown = {
                media: 0,
                tips: 0,
                subscriptions: 0,
                mediaSets: 0,
            };
        }
        
        const date = new Date(year, month - 1, day);
        const dateStr = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
        
        const dayTotal = dayBreakdown.media + dayBreakdown.tips + dayBreakdown.subscriptions + dayBreakdown.mediaSets;
        
        dailyData.push({
            date: dateStr,
            subs: dayBreakdown.subscriptions,
            tips: dayBreakdown.tips,
            media: dayBreakdown.media,
            mediaSets: dayBreakdown.mediaSets,
            total: dayTotal,
        });
    }
    
    return dailyData;
}

/**
 * Generate daily data for simulation with bell-curve distribution.
 */
function generateSimulationDailyData(
    monthKey: string,
    daysInMonth: number,
    totals: {
        subscriptions: number;
        tips: number;
        media: number;
        mediaSets: number;
        netIncome: number;
    }
): DailyStats[] {
    const dailyData: DailyStats[] = [];
    const [year, month] = monthKey.split('-').map(Number);
    
    // Helper to generate bell-curve-ish random distribution
    const distribution: number[] = [];
    let sum = 0;
    
    for (let i = 0; i < daysInMonth; i++) {
        const val = Math.random() * 0.5 + Math.sin((i / daysInMonth) * Math.PI) * 0.5;
        distribution.push(val);
        sum += val;
    }
    
    // Generate daily data
    for (let i = 1; i <= daysInMonth; i++) {
        const multiplier = distribution[i - 1] / sum;
        const date = new Date(year, month - 1, i);
        const dateStr = date.toLocaleDateString("en-US", { 
            month: "short", 
            day: "numeric", 
            year: "numeric" 
        });
        
        dailyData.push({
            date: dateStr,
            subs: totals.subscriptions * multiplier,
            tips: totals.tips * multiplier,
            media: totals.media * multiplier,
            mediaSets: totals.mediaSets * multiplier,
            total: totals.netIncome * multiplier,
        });
    }
    
    return dailyData;
}

/**
 * Normalize an array of values to match a specific total.
 */
function normalizeArrayToTotal(values: number[], targetTotal: number): void {
    const currentTotal = values.reduce((sum, val) => sum + val, 0);
    const scaleFactor = targetTotal / currentTotal;
    
    for (let i = 0; i < values.length; i++) {
        values[i] *= scaleFactor;
    }
}

/**
 * Helper hook for getting data for a specific month.
 * This is useful for components that need data for multiple months.
 */
export function useMonthlyData(monthKey: string, targetAmount?: number) {
    const options: UseDashboardDataOptions = {
        monthKey,
        useTargetState: targetAmount === undefined,
        initialTargetAmount: targetAmount || 12000,
    };
    
    return useDashboardData(options);
}

/**
 * Helper function to get dashboard stats without React hooks.
 * Useful for server-side rendering or non-React contexts.
 */
export function getDashboardStats(
    monthKey: string,
    targetAmount: number
): DashboardStats {
    const daysInMonth = getDaysInMonth(monthKey);
    const manualOverride = getManualOverride(monthKey);
    
    if (manualOverride) {
        const dailyData = generateManualDailyData(
            monthKey,
            manualOverride,
            daysInMonth
        );
        
        return {
            targetAmount: manualOverride.netIncome,
            tips: manualOverride.categories.tips,
            subs: manualOverride.categories.subscriptions,
            media: manualOverride.categories.media,
            mediaSets: manualOverride.categories.mediaSets,
            grossIncome: manualOverride.grossIncome,
            netIncome: manualOverride.netIncome,
            dailyData,
            isManualOverride: true,
            overrideMonthKey: monthKey,
        };
    }
    
    return generateSimulationStats(targetAmount, monthKey, daysInMonth);
}
