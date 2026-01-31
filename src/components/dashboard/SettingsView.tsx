"use client";

import { useState } from "react";
import { DollarSign, RefreshCw, Settings, Database } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ManagementDashboard } from "./ManagementDashboard";
import { DISTRIBUTION_RATIOS } from "@/types/overrides";

interface SettingsViewProps {
  targetAmount: number;
  onTargetChange: (amount: number) => void;
}

export function SettingsView({ targetAmount, onTargetChange }: SettingsViewProps) {
  const [localTarget, setLocalTarget] = useState(targetAmount.toString());
  const [activeTab, setActiveTab] = useState<"target" | "overrides">("target");

  const handleSimulate = () => {
    const num = parseFloat(localTarget);
    if (!isNaN(num) && num > 0) {
      onTargetChange(num);
    }
  };

  const handleReset = () => {
    setLocalTarget("12000");
    onTargetChange(12000);
  };

  // Calculate distribution based on target using Fansly-standard distribution
  const targetNum = parseFloat(localTarget) || 0;
  const media = targetNum * DISTRIBUTION_RATIOS.MEDIA;
  const mediaSets = targetNum * DISTRIBUTION_RATIOS.MEDIA_SETS;
  const tips = targetNum * DISTRIBUTION_RATIOS.TIPS;
  const subscriptions = targetNum * DISTRIBUTION_RATIOS.SUBSCRIPTIONS;

  const handleDataChange = () => {
    // This will trigger a re-fetch of dashboard data
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="dense-card p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">Settings & Configuration</h1>
            <p className="text-sm text-gray-400">
              Configure your monthly targets and manage manual data overrides
            </p>
          </div>

          <button
            onClick={handleReset}
            className="mt-4 sm:mt-0 px-4 py-2 bg-secondary text-gray-300 rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Target
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("target")}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
              activeTab === "target"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <Settings className="w-4 h-4" />
            Target Configuration
          </button>
          <button
            onClick={() => setActiveTab("overrides")}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
              activeTab === "overrides"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <Database className="w-4 h-4" />
            Manual Overrides
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "target" ? (
        <div className="space-y-6">
          {/* Main Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Target Input Card */}
            <div className="lg:col-span-2 dense-card p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Target Configuration</h3>
                  <p className="text-sm text-gray-400">Set your desired monthly earnings goal</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Monthly Target Amount ($)</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <input
                      type="number"
                      value={localTarget}
                      onChange={(e) => setLocalTarget(e.target.value)}
                      className="flex-1 bg-background border border-border rounded-md px-4 py-3 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="0"
                      step="100"
                      placeholder="Enter target amount"
                    />
                    <button
                      onClick={handleSimulate}
                      className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-semibold text-lg whitespace-nowrap"
                    >
                      Simulate
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      Current: <span className="text-white font-mono">{formatCurrency(targetAmount)}</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      Default: <span className="text-white font-mono">$12,000.00</span>
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-gray-400 mb-3">Quick Presets</p>
                  <div className="flex flex-wrap gap-2">
                    {[5000, 10000, 15000, 20000, 25000, 50000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setLocalTarget(amount.toString());
                          onTargetChange(amount);
                        }}
                        className="px-3 py-1.5 bg-secondary text-gray-300 rounded-md hover:bg-secondary/80 transition-colors text-sm"
                      >
                        ${amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Distribution Preview */}
            <div className="dense-card p-5">
              <h3 className="font-semibold text-white mb-4">Distribution Preview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Media</span>
                    <span className="text-white font-mono">{formatCurrency(media)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${DISTRIBUTION_RATIOS.MEDIA * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{DISTRIBUTION_RATIOS.MEDIA * 100}% of target</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Media Sets</span>
                    <span className="text-white font-mono">{formatCurrency(mediaSets)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${DISTRIBUTION_RATIOS.MEDIA_SETS * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{DISTRIBUTION_RATIOS.MEDIA_SETS * 100}% of target</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Tips</span>
                    <span className="text-white font-mono">{formatCurrency(tips)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${DISTRIBUTION_RATIOS.TIPS * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{DISTRIBUTION_RATIOS.TIPS * 100}% of target</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Subscriptions</span>
                    <span className="text-white font-mono">{formatCurrency(subscriptions)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${DISTRIBUTION_RATIOS.SUBSCRIPTIONS * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{DISTRIBUTION_RATIOS.SUBSCRIPTIONS * 100}% of target</p>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total</span>
                    <span className="text-white font-mono text-lg">{formatCurrency(targetNum)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Based on the Fansly-standard distribution: Media {DISTRIBUTION_RATIOS.MEDIA * 100}%,
                    Media Sets {DISTRIBUTION_RATIOS.MEDIA_SETS * 100}%,
                    Tips {DISTRIBUTION_RATIOS.TIPS * 100}%,
                    Subscriptions {DISTRIBUTION_RATIOS.SUBSCRIPTIONS * 100}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="dense-card p-4">
            <p className="text-sm text-gray-400">
              <span className="text-white font-medium">Note:</span> The simulation will automatically recalculate daily distributions using a bell-curve pattern.
              All changes are saved to your browser's local storage and persist between sessions.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <ManagementDashboard onDataChange={handleDataChange} />
        </div>
      )}
    </div>
  );
}