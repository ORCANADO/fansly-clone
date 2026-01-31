# Granular Daily Overrides Refactor Plan

## Overview
Refactor the Manual Override system to support granular daily inputs instead of a single monthly total. This enables precise day-by-day earnings tracking while maintaining backward compatibility with existing overrides.

## Current State Analysis

### Existing Architecture
1. **MonthlyOverride Interface** (`src/types/overrides.ts`):
   - Single `netIncome` value for the month
   - Calculated `grossIncome` (net × 1.2)
   - Category breakdown with fixed percentages (58/21/8/13)
   - Daily data generated with linear distribution + 15% noise

2. **EditOverrideDialog** (`src/components/dashboard/EditOverrideDialog.tsx`):
   - Single "Net Income" input field
   - Category percentage customization
   - Real-time preview of distribution

3. **Data Generation** (`src/hooks/useDashboardData.ts`):
   - `generateManualDailyData()` creates daily stats from monthly total
   - Linear distribution with noise
   - Normalization to ensure monthly totals match

## Requirements Clarification

Based on user feedback:
1. **Backward Compatibility**: Keep old data and split monthly total evenly across days
2. **Missing Daily Values**: Show 0 for days with no value
3. **Decimal Support**: Allow decimals but optional
4. **Global Percentage Customization**: Keep percentage customization that applies to each day's total

## Proposed Architecture Changes

### 1. Updated TypeScript Interfaces

```typescript
// Updated MonthlyOverride interface
export interface MonthlyOverride {
  // Remove: amount: number (replaced by dailyValues)
  // Add daily breakdown
  dailyValues: Record<string, number>; // key: "1", "15", "30" (day numbers as strings)
  
  // Keep existing fields
  netIncome: number; // Calculated from sum of dailyValues
  grossIncome: number; // Calculated from netIncome × 1.2
  categories: {
    media: number;
    mediaSets: number;
    tips: number;
    subscriptions: number;
  };
  
  // Add percentage customization
  categoryPercentages?: {
    media: number; // e.g., 0.54 (54%)
    mediaSets: number;
    tips: number;
    subscriptions: number;
  };
  
  // Keep existing
  isManual: boolean;
  lastUpdated: string;
  note?: string;
}

// Helper getter for total sum
export function getMonthlyTotal(override: MonthlyOverride): number {
  return Object.values(override.dailyValues).reduce((sum, val) => sum + val, 0);
}
```

### 2. Data Migration Strategy

When loading existing overrides:
```typescript
function migrateLegacyOverride(legacy: LegacyMonthlyOverride): MonthlyOverride {
  const daysInMonth = getDaysInMonth(monthKey);
  const dailyValues: Record<string, number> = {};
  
  // Split evenly across days
  const dailyAmount = legacy.netIncome / daysInMonth;
  for (let day = 1; day <= daysInMonth; day++) {
    dailyValues[day.toString()] = dailyAmount;
  }
  
  return {
    ...legacy,
    dailyValues,
    // Keep existing category percentages if custom, otherwise use defaults
    categoryPercentages: legacy.hasCustomPercentages ? 
      calculatePercentagesFromCategories(legacy.categories, legacy.netIncome) : 
      undefined
  };
}
```

### 3. UI Redesign - EditOverrideDialog

**New Layout Structure:**
1. **Top Section**: "Total Monthly Earnings" display (real-time sum of daily inputs)
2. **Middle Section**: "Daily Breakdown" with ScrollArea (max height 300px)
   - Grid layout (2-3 columns depending on screen size)
   - Input for each day of the selected month
   - Labels: "Day 1", "Day 2", etc.
   - Real-time validation and formatting
3. **Bottom Section**: Category percentage customization (optional)
   - Toggle for custom percentages
   - Sliders for each category (total must equal 100%)
   - Real-time preview of category splits

**Real-time Calculations:**
- As user types daily values, update total display
- Apply category percentages to total for preview
- Show gross income calculation (total × 1.2)

### 4. Data Processing Logic

**In `useDashboardData.ts`:**
```typescript
function generateGranularDailyData(
  monthKey: string,
  override: MonthlyOverride,
  daysInMonth: number
): DailyStats[] {
  const dailyData: DailyStats[] = [];
  const [year, month] = monthKey.split('-').map(Number);
  
  // Get category percentages (custom or default)
  const percentages = override.categoryPercentages || {
    media: DISTRIBUTION_RATIOS.MEDIA,
    mediaSets: DISTRIBUTION_RATIOS.MEDIA_SETS,
    tips: DISTRIBUTION_RATIOS.TIPS,
    subscriptions: DISTRIBUTION_RATIOS.SUBSCRIPTIONS,
  };
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayKey = day.toString();
    const dayTotal = override.dailyValues[dayKey] || 0;
    
    // Apply percentages to this day's total
    const dailyStats: DailyStats = {
      date: new Date(year, month - 1, day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      media: dayTotal * percentages.media,
      mediaSets: dayTotal * percentages.mediaSets,
      tips: dayTotal * percentages.tips,
      subs: dayTotal * percentages.subscriptions,
      total: dayTotal
    };
    
    dailyData.push(dailyStats);
  }
  
  return dailyData;
}
```

### 5. Storage Migration

**In `src/lib/storage.ts`:**
- Add migration function in `getAllManualOverrides()`
- Detect legacy format and migrate on read
- Save migrated data back to localStorage
- Add version tracking to prevent repeated migrations

## Implementation Steps

### Phase 1: Type Definitions & Migration (2-3 hours)
1. Update `MonthlyOverride` interface in `src/types/overrides.ts`
2. Add migration utilities and helper functions
3. Update storage logic to handle migration

### Phase 2: UI Refactor (3-4 hours)
1. Redesign `EditOverrideDialog.tsx` with daily inputs grid
2. Implement real-time summation and validation
3. Preserve category percentage customization
4. Add ScrollArea for daily inputs

### Phase 3: Data Processing (2-3 hours)
1. Update `generateManualDailyData()` in `useDashboardData.ts`
2. Implement granular daily processing logic
3. Ensure backward compatibility with migrated data

### Phase 4: Testing & Validation (2 hours)
1. Test migration of existing overrides
2. Verify daily calculations are correct
3. Test UI responsiveness and usability
4. Validate real-time updates work correctly

## Technical Considerations

### Performance
- Use `useMemo` for expensive calculations (daily sums, category splits)
- Implement debouncing for real-time updates
- Virtual scrolling for months with many days (optional)

### Validation
- Daily values must be numbers (allow decimals)
- Negative values should be prevented
- Category percentages must sum to 100% (with tolerance)

### UX Design
- Clear visual hierarchy: Total → Daily Inputs → Category Customization
- Responsive grid layout (2-3 columns)
- Keyboard navigation between inputs
- Bulk operations (fill all days with same value, clear all)

## Success Criteria

1. **Backward Compatibility**: Existing overrides work without data loss
2. **Granular Control**: Users can input values for individual days
3. **Real-time Feedback**: Total updates as user types daily values
4. **Category Customization**: Percentage customization still works
5. **Performance**: No UI lag during typing
6. **Data Integrity**: Monthly totals match sum of daily values
7. **Visual Consistency**: UI matches existing design patterns

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Data loss during migration | Test migration thoroughly, keep backup of original data |
| Performance issues with many inputs | Use virtualization for large months, optimize calculations |
| Complex state management | Centralize logic in custom hooks, use React patterns |
| User confusion with new UI | Clear labels, tooltips, and progressive disclosure |

## Next Steps

1. Review and approve this plan
2. Switch to Code mode for implementation
3. Implement in phases with testing after each phase
4. Update documentation and project log

---
*Last Updated: 2026-01-29*
*Author: Roo (Architect Mode)*