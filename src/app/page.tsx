"use client";
// @vibe-critical: Main dashboard orchestrator; integrates distribution logic with UI components.

import { useDashboardData } from "@/hooks/useDashboardData";
import { useSettings } from "@/hooks/useSettings";
import { TrackingLinks } from "@/components/dashboard/TrackingLinks";
import { Statements } from "@/components/dashboard/Statements";
import { SettingsModal } from "@/components/dashboard/SettingsModal";
import { TopNav } from "@/components/layout/TopNav";
import { WalletIcon } from "@/components/ui/WalletIcon";
import { StatisticsIcon } from "@/components/ui/StatisticsIcon";

export default function DashboardPage() {
    const { targetAmount, setTargetAmount, dailyData, tips, subs, media, mediaSets } = useDashboardData();
    const { isSettingsModalOpen, setIsSettingsModalOpen } = useSettings();

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <TopNav />

            <main className="max-w-5xl mx-auto px-4 pt-4">
                {/* Breadcrumb / Back */}
                <div className="flex items-center gap-3 pb-[6px] mb-6 border-b border-white/[0.08]">
                    <div className="p-1.5 hover:bg-white/5 rounded-full cursor-pointer transition-colors">
                        <svg className="w-5 h-5 text-[#D6DCE8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                    <h1 className="text-[19px] font-bold text-[#D6DCE8] tracking-tight -mt-[3px]">Earnings/Statistics</h1>
                </div>

                {/* Tabs */}
                <div className="flex items-center mb-[9px] px-2">
                    <div className="flex items-center border-b border-white/[0.08]">
                        <div className="px-4 pt-0 pb-[10px] text-[#637395] cursor-pointer hover:text-white transition-colors text-[11.5px] font-bold flex items-center gap-1">
                            <div className="w-[15.3px] h-[15.3px]">
                                <WalletIcon />
                            </div>
                            Wallet
                        </div>
                        <div className="px-4 pt-0 pb-[10px] text-[#2599F7] border-b-2 border-[#2599F7] font-bold cursor-pointer text-[11.5px] flex items-center gap-1 relative -mb-[1px]">
                            <div className="w-[15.3px] h-[15.3px]">
                                <StatisticsIcon />
                            </div>
                            Statistics
                        </div>
                    </div>
                </div>

                {/* Earnings/Statistics View */}
                <>
                    {/* Tracking Links - Now at the top */}
                    <div className="mb-4">
                        <TrackingLinks />
                    </div>

                    {/* Statements with Accordion Charts */}
                    <Statements
                        currentMonthData={{
                            dailyData,
                            subs,
                            tips,
                            media,
                            mediaSets,
                        }}
                        targetAmount={targetAmount}
                    />
                </>

                {/* Settings Modal */}
                <SettingsModal
                    targetAmount={targetAmount}
                    onTargetChange={setTargetAmount}
                    isOpen={isSettingsModalOpen}
                    onOpenChange={setIsSettingsModalOpen}
                />
            </main>
        </div>
    );
}
