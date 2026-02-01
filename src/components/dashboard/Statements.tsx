"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { EarningsChart } from "./EarningsChart";
import { formatCurrency } from "@/lib/utils";
import { CurrencyDisplay } from "../ui/CurrencyDisplay";
import { FanslyLogo } from "../ui/FanslyLogo";
import { BronzeBadge } from "../ui/BronzeBadge";
import { SilverBadge } from "../ui/SilverBadge";
import type { DailyStats } from "@/hooks/useDashboardData";
import { getDashboardStats } from "@/hooks/useDashboardData";
import {
    getManualOverride,
    dateToMonthKey,
    formatMonthKey,
    getDaysInMonth
} from "@/lib/storage";

interface StatementItem {
    id: string;
    title: string;
    amount: number;
    isTopPerformer?: boolean;
    platform?: string;
    percentile?: string;
    data: DailyStats[];
    subs: number;
    tips: number;
    media: number;
    mediaSets: number;
    isManualOverride?: boolean;
    grossIncome?: number;
    netIncome?: number;
}

interface StatementsProps {
    currentMonthData?: {
        dailyData: DailyStats[];
        subs: number;
        tips: number;
        media: number;
        mediaSets: number;
    };
    targetAmount?: number;
}

// Custom hook for localStorage persistence of expanded months
function useExpandedMonths() {
    const [expandedMonths, setExpandedMonths] = useState<Set<string>>(() => {
        // Load from localStorage on initial render
        if (typeof window === "undefined") return new Set(["last30"]);

        const saved = localStorage.getItem("vibestats_expanded_months");
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as string[];
                return new Set(parsed);
            } catch {
                return new Set(["last30"]);
            }
        }
        return new Set(["last30"]);
    });

    // Save to localStorage whenever expandedMonths changes
    useEffect(() => {
        if (typeof window === "undefined") return;

        const array = Array.from(expandedMonths);
        localStorage.setItem("vibestats_expanded_months", JSON.stringify(array));
    }, [expandedMonths]);

    const toggleMonth = (monthId: string) => {
        setExpandedMonths(prev => {
            const next = new Set(prev);
            if (next.has(monthId)) {
                next.delete(monthId);
            } else {
                next.add(monthId);
            }
            return next;
        });
    };

    const isMonthExpanded = (monthId: string) => expandedMonths.has(monthId);

    return {
        expandedMonths,
        toggleMonth,
        isMonthExpanded,
    };
}

/**
 * Convert statement ID to month key.
 * - "last30" → current month
 * - "jan2026" → "2026-01"
 * - "dec2025" → "2025-12"
 */
function statementIdToMonthKey(id: string): string {
    if (id === "last30") {
        return dateToMonthKey(new Date());
    }

    // Parse month names like "jan2026", "dec2025"
    const monthNames: Record<string, number> = {
        jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
        jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
    };

    const match = id.match(/^([a-z]{3})(\d{4})$/i);
    if (match) {
        const [, monthStr, yearStr] = match;
        const month = monthNames[monthStr.toLowerCase()];
        const year = parseInt(yearStr, 10);
        if (month && year) {
            return `${year}-${String(month).padStart(2, '0')}`;
        }
    }

    // Fallback: assume current month
    return dateToMonthKey(new Date());
}

/**
 * Get title for a month key.
 */
function getMonthTitle(monthKey: string, id: string): string {
    if (id === "last30") {
        return "Last 30 Days";
    }
    return formatMonthKey(monthKey);
}

export function Statements({ currentMonthData, targetAmount = 12000 }: StatementsProps) {
    const { expandedMonths, toggleMonth, isMonthExpanded } = useExpandedMonths();

    // Base amounts for historical months (at default targetAmount of 12000)
    // These are used as fallback when no override exists
    const baseAmounts = {
        last30: 20943.73,
        feb2026: 652.37,
        jan2026: 20638.37,
        dec2025: 3556.47,
    };

    // Statement IDs to display
    const statementIds = ["last30", "feb2026", "jan2026", "dec2025"];

    // Generate statement items using useMemo for performance
    const statementItems = useMemo((): StatementItem[] => {
        return statementIds.map(id => {
            const monthKey = statementIdToMonthKey(id);
            const isCurrentMonth = id === "last30";

            // Check if we have current month data from props
            if (isCurrentMonth && currentMonthData) {
                const amount = currentMonthData.subs + currentMonthData.tips + currentMonthData.media + currentMonthData.mediaSets;
                const grossIncome = amount * 1.25; // 20% platform fee

                return {
                    id,
                    title: getMonthTitle(monthKey, id),
                    amount,
                    isTopPerformer: id === "last30" || id === "dec2025",
                    platform: "fansly",
                    percentile: id === "last30" ? "Top 0.63%" : id === "dec2025" ? "Top 4.60%" : undefined,
                    data: currentMonthData.dailyData,
                    subs: currentMonthData.subs,
                    tips: currentMonthData.tips,
                    media: currentMonthData.media,
                    mediaSets: currentMonthData.mediaSets,
                    grossIncome,
                    netIncome: amount,
                };
            }

            // For historical months or when no current month data is provided
            // Check for manual override first
            const manualOverride = getManualOverride(monthKey);

            if (manualOverride) {
                // Use manual override data
                const stats = getDashboardStats(monthKey, manualOverride.netIncome);

                return {
                    id,
                    title: getMonthTitle(monthKey, id),
                    amount: manualOverride.netIncome,
                    isTopPerformer: id === "dec2025" || id === "jan2026",
                    platform: "fansly",
                    percentile: id === "dec2025" ? "Top 4.60%" : id === "jan2026" ? "Top 1.82%" : undefined,
                    data: stats.dailyData,
                    subs: stats.subs,
                    tips: stats.tips,
                    media: stats.media,
                    mediaSets: stats.mediaSets,
                    isManualOverride: true,
                    grossIncome: manualOverride.grossIncome,
                    netIncome: manualOverride.netIncome,
                };
            }

            // No override, use simulation with scaling
            const baseAmount = baseAmounts[id as keyof typeof baseAmounts] || 12000;
            const scaledAmount = baseAmount * (targetAmount / 12000);
            const stats = getDashboardStats(monthKey, scaledAmount);

            return {
                id,
                title: getMonthTitle(monthKey, id),
                amount: scaledAmount,
                isTopPerformer: id === "dec2025" || id === "jan2026",
                platform: (id === "dec2025" || id === "jan2026") ? "fansly" : undefined,
                percentile: id === "dec2025" ? "Top 4.60%" : id === "jan2026" ? "Top 1.82%" : undefined,
                data: stats.dailyData,
                subs: stats.subs,
                tips: stats.tips,
                media: stats.media,
                mediaSets: stats.mediaSets,
                isManualOverride: false,
                grossIncome: scaledAmount * 1.25,
                netIncome: scaledAmount,
            };
        });
    }, [currentMonthData, targetAmount]);

    return (
        <div className="mb-10">
            <div className="p-1 pb-3">
                <h3 className="text-[17px] font-bold text-[#D6DCE8] tracking-tight">Statements</h3>
            </div>

            <div className="space-y-2.5">
                {statementItems.map((item) => {
                    const isExpanded = isMonthExpanded(item.id);
                    return (
                        <div key={item.id} className="bg-[#111215] border border-[#26292D] rounded-[10px] overflow-hidden transition-all duration-200 shadow-sm">
                            {/* Header */}
                            <div
                                className="flex justify-between items-start py-4 px-4 cursor-pointer transition-colors group"
                                onClick={() => toggleMonth(item.id)}
                            >
                                <div className="flex flex-col">
                                    <span className={`font-bold text-[15px] tracking-tight ${isExpanded ? "text-[#2599F7]" : "text-[#D6DCE8] group-hover:text-[#2599F7] active:text-[#2599F7]"}`}>{item.title}</span>
                                    {item.isTopPerformer && (
                                        <div className="flex items-center gap-2 mt-1.5">
                                            {/* Authenticated Badge Icons */}
                                            {item.id === "dec2025" ? (
                                                <BronzeBadge className="w-6 h-6" />
                                            ) : (item.id === "last30" || item.id === "jan2026") ? (
                                                <SilverBadge className="w-6 h-6" />
                                            ) : (
                                                <div className="flex items-center justify-center w-6 h-6 bg-yellow-500/10 rounded-full border border-yellow-500/30">
                                                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 text-[17px]">
                                                <div className="flex items-center gap-1">
                                                    <FanslyLogo className="h-[20px] mb-0.5" />
                                                    <span className="font-bold text-white tracking-tight">fansly</span>
                                                </div>
                                                <span className="text-[#D5DBE7] font-normal text-[15px]">{item.percentile}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-[-2px]">
                                    <span className="font-medium text-[16.15px] tracking-tight">
                                        <CurrencyDisplay value={item.amount} />
                                    </span>
                                    <svg
                                        className={`w-5 h-5 text-[#D6DCE8] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="px-2">
                                    <div className="bg-[#16161a] rounded-[10px] pt-1 px-4 pb-4">
                                        <div className="mb-4">
                                            <EarningsChart data={item.data} />
                                        </div>
                                        <div className="flex flex-row items-baseline gap-6 text-[13.65px] text-[#627294] px-1 font-normal mt-5 mb-1">
                                            <div className="flex items-baseline gap-0.5">
                                                <span>Gross Income:</span>
                                                <CurrencyDisplay
                                                    value={item.grossIncome || item.amount * 1.25}
                                                    className="font-medium text-[#D6DCE8] text-[14.3px]"
                                                    iconSize={15}
                                                />
                                            </div>
                                            <div className="flex items-baseline gap-0.5">
                                                <span>Net Income:</span>
                                                <CurrencyDisplay
                                                    value={item.netIncome || item.amount}
                                                    className="font-medium text-[#D6DCE8] text-[14.3px]"
                                                    iconSize={15}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
