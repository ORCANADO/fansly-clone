"use client";

import { useState, useEffect, useMemo } from "react";
import { Calculator, DollarSign, Grid3X3, Copy, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { 
  type MonthlyOverride,
  type DailyCategoryBreakdown,
  PLATFORM_FEE_MULTIPLIER,
  calculateCategoryTotals,
  calculateDailyValues,
  distributeMonthlyTotalEvenly
} from "@/types/overrides";
import { formatMonthKey, getDaysInMonth } from "@/lib/storage";

interface EditOverrideDialogProps {
  monthKey: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (monthKey: string, data: MonthlyOverride) => void;
  initialData?: MonthlyOverride;
}

type CategoryKey = keyof DailyCategoryBreakdown;

interface DailyCategoryInputs {
  [day: string]: {
    media: string;
    tips: string;
    subscriptions: string;
    mediaSets: string;
  };
}

export function EditOverrideDialog({
  monthKey,
  isOpen,
  onClose,
  onSave,
  initialData,
}: EditOverrideDialogProps) {
  const daysInMonth = getDaysInMonth(monthKey);
  
  const [dailyCategoryInputs, setDailyCategoryInputs] = useState<DailyCategoryInputs>({});
  const [note, setNote] = useState<string>(initialData?.note || "");

  // Calculate derived values
  const dailyCategoryValues = useMemo(() => {
    const result: Record<string, DailyCategoryBreakdown> = {};
    for (const [day, inputs] of Object.entries(dailyCategoryInputs)) {
      result[day] = {
        media: parseFloat(inputs.media) || 0,
        tips: parseFloat(inputs.tips) || 0,
        subscriptions: parseFloat(inputs.subscriptions) || 0,
        mediaSets: parseFloat(inputs.mediaSets) || 0,
      };
    }
    return result;
  }, [dailyCategoryInputs]);

  const dailyValues = useMemo(() => calculateDailyValues(dailyCategoryValues), [dailyCategoryValues]);
  const monthlyTotal = useMemo(() => Object.values(dailyValues).reduce((sum, val) => sum + val, 0), [dailyValues]);
  const grossIncome = monthlyTotal * PLATFORM_FEE_MULTIPLIER;
  const categoryTotals = useMemo(() => calculateCategoryTotals(dailyCategoryValues), [dailyCategoryValues]);

  // Initialize form
  useEffect(() => {
    if (isOpen) {
      const inputs: DailyCategoryInputs = {};
      
      if (initialData?.dailyCategoryValues && Object.keys(initialData.dailyCategoryValues).length > 0) {
        // Use existing dailyCategoryValues
        for (let day = 1; day <= daysInMonth; day++) {
          const dayKey = day.toString();
          const breakdown = initialData.dailyCategoryValues[dayKey] || { media: 0, tips: 0, subscriptions: 0, mediaSets: 0 };
          inputs[dayKey] = {
            media: breakdown.media.toString(),
            tips: breakdown.tips.toString(),
            subscriptions: breakdown.subscriptions.toString(),
            mediaSets: breakdown.mediaSets.toString(),
          };
        }
      } else if (initialData?.dailyValues) {
        // Legacy data: convert using percentages
        const mediaPercent = initialData.categoryPercentages?.media ?? 0.58;
        const mediaSetsPercent = initialData.categoryPercentages?.mediaSets ?? 0.21;
        const tipsPercent = initialData.categoryPercentages?.tips ?? 0.08;
        const subscriptionsPercent = initialData.categoryPercentages?.subscriptions ?? 0.13;
        
        for (let day = 1; day <= daysInMonth; day++) {
          const dayKey = day.toString();
          const dayTotal = initialData.dailyValues[dayKey] || 0;
          inputs[dayKey] = {
            media: (dayTotal * mediaPercent).toString(),
            tips: (dayTotal * tipsPercent).toString(),
            subscriptions: (dayTotal * subscriptionsPercent).toString(),
            mediaSets: (dayTotal * mediaSetsPercent).toString(),
          };
        }
      } else {
        // New override
        for (let day = 1; day <= daysInMonth; day++) {
          const dayKey = day.toString();
          inputs[dayKey] = { media: "0", tips: "0", subscriptions: "0", mediaSets: "0" };
        }
      }
      
      setDailyCategoryInputs(inputs);
      setNote(initialData?.note || "");
    }
  }, [isOpen, initialData, daysInMonth]);

  const handleCategoryValueChange = (day: string, category: CategoryKey, value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    
    setDailyCategoryInputs(prev => ({
      ...prev,
      [day]: { ...prev[day], [category]: cleaned }
    }));
  };

  const handleSave = () => {
    const hasPositiveValue = Object.values(dailyCategoryValues).some(b => 
      b.media > 0 || b.tips > 0 || b.subscriptions > 0 || b.mediaSets > 0
    );
    if (!hasPositiveValue) {
      alert("Please enter at least one value greater than 0");
      return;
    }

    const overrideData: MonthlyOverride = {
      dailyCategoryValues,
      dailyValues,
      netIncome: monthlyTotal,
      grossIncome,
      categories: categoryTotals,
      isManual: true,
      lastUpdated: new Date().toISOString(),
      note: note.trim() || undefined,
    };

    onSave(monthKey, overrideData);
  };

  const handleClearAll = () => {
    const newInputs: DailyCategoryInputs = {};
    for (let day = 1; day <= daysInMonth; day++) {
      newInputs[day.toString()] = { media: "0", tips: "0", subscriptions: "0", mediaSets: "0" };
    }
    setDailyCategoryInputs(newInputs);
  };

  const handleDistributeEvenly = () => {
    if (monthlyTotal <= 0) {
      alert("Please enter a monthly total first");
      return;
    }
    
    const distributed = distributeMonthlyTotalEvenly(monthlyTotal, daysInMonth);
    const newInputs: DailyCategoryInputs = {};
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = day.toString();
      const breakdown = distributed[dayKey];
      newInputs[dayKey] = {
        media: breakdown.media.toFixed(2),
        tips: breakdown.tips.toFixed(2),
        subscriptions: breakdown.subscriptions.toFixed(2),
        mediaSets: breakdown.mediaSets.toFixed(2),
      };
    }
    
    setDailyCategoryInputs(newInputs);
  };

  const handleCopyDay = (sourceDay: number) => {
    const sourceKey = sourceDay.toString();
    const sourceInputs = dailyCategoryInputs[sourceKey];
    if (!sourceInputs) return;
    
    const newInputs = { ...dailyCategoryInputs };
    for (let day = 1; day <= daysInMonth; day++) {
      if (day !== sourceDay) {
        newInputs[day.toString()] = { ...sourceInputs };
      }
    }
    setDailyCategoryInputs(newInputs);
  };

  // Render day inputs
  const dayInputs = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dayKey = day.toString();
    const inputs = dailyCategoryInputs[dayKey] || { media: "0", tips: "0", subscriptions: "0", mediaSets: "0" };
    const dayTotal = dailyValues[dayKey] || 0;
    
    dayInputs.push(
      <div key={day} className="space-y-2 p-3 border rounded-lg bg-card">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Day {day}</label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleCopyDay(day)}
              className="p-1 hover:bg-accent rounded"
              title="Copy to all days"
            >
              <Copy className="w-3 h-3" />
            </button>
            <div className="text-xs font-mono text-muted-foreground">
              {formatCurrency(dayTotal)}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {(['media', 'tips', 'subscriptions', 'mediaSets'] as CategoryKey[]).map(category => (
            <div key={category} className="space-y-1">
              <label className="text-xs text-muted-foreground capitalize">{category}</label>
              <div className="relative">
                <DollarSign className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-muted-foreground" />
                <input
                  type="text"
                  value={inputs[category]}
                  onChange={(e) => handleCategoryValueChange(dayKey, category, e.target.value)}
                  className="w-full pl-6 pr-1.5 py-1 text-xs font-mono border border-input rounded bg-background"
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            {initialData ? "Edit Manual Override" : "Add Manual Override"}
          </DialogTitle>
          <DialogDescription>
            {formatMonthKey(monthKey)} • Edit all 4 category values for each day
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="dense-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Monthly Total</div>
              <div className="text-2xl font-bold font-mono text-green-600 mt-2">
                {formatCurrency(monthlyTotal)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {Object.values(dailyValues).filter(v => v > 0).length} days with values
              </div>
            </div>

            <div className="dense-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Gross Income</div>
              <div className="text-xl font-bold font-mono mt-2">
                {formatCurrency(grossIncome)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatCurrency(monthlyTotal)} × 1.2
              </div>
            </div>

            <div className="dense-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Category Totals</div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-sm">
                  <div className="text-muted-foreground">Media</div>
                  <div className="font-mono">{formatCurrency(categoryTotals.media)}</div>
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">Tips</div>
                  <div className="font-mono">{formatCurrency(categoryTotals.tips)}</div>
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">Subs</div>
                  <div className="font-mono">{formatCurrency(categoryTotals.subscriptions)}</div>
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">Media Sets</div>
                  <div className="font-mono">{formatCurrency(categoryTotals.mediaSets)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-base font-medium flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Daily Category Breakdown
                </label>
                <div className="text-sm text-muted-foreground">
                  Edit all 4 category values for each day ({daysInMonth} days in month)
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
                <Button variant="outline" size="sm" onClick={handleDistributeEvenly}>
                  Distribute Evenly
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {dayInputs}
              </div>
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-3">
            <label htmlFor="note" className="text-sm font-medium">Note (Optional)</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this month's data..."
              className="w-full min-h-[80px] p-3 border border-input rounded-md bg-background"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={monthlyTotal <= 0} className="gap-2">
            <Calculator className="w-4 h-4" />
            Save Manual Override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
