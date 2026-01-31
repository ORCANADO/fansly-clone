# Per-Day Category Editing Design Document

## Overview
Enhance the Manual Override system to allow editing all 4 category values (media, tips, subscriptions, media sets) for each day individually, instead of just a daily total that gets distributed by percentages.

## Current State Analysis

### Current Data Structure
```typescript
interface MonthlyOverride {
  dailyValues: Record<string, number>; // day -> total amount
  netIncome: number; // sum of dailyValues
  grossIncome: number; // netIncome * 1.2
  categories: {
    media: number;     // 58% of netIncome (default)
    mediaSets: number; // 21% of netIncome (default)
    tips: number;      // 8% of netIncome (default)
    subscriptions: number; // 13% of netIncome (default)
  };
  categoryPercentages?: { // optional custom percentages
    media: number;
    mediaSets: number;
    tips: number;
    subscriptions: number;
  };
  // ... other fields
}
```

### Current Flow
1. User enters daily totals in `dailyValues`
2. System applies percentages (default or custom) to calculate category totals
3. Monthly `categories` are calculated as percentages of total `netIncome`

## Proposed New Data Structure

### Core Changes
```typescript
interface DailyCategoryBreakdown {
  media: number;
  tips: number;
  subscriptions: number;
  mediaSets: number;
}

interface MonthlyOverride {
  // REPLACE: dailyValues with dailyCategoryValues
  dailyCategoryValues: Record<string, DailyCategoryBreakdown>;
  
  // DERIVED FIELDS (calculated, not stored)
  dailyValues?: Record<string, number>; // Optional, calculated as sum of categories per day
  netIncome: number; // Sum of all daily category values
  grossIncome: number; // netIncome * 1.2
  
  // DERIVED FIELDS (calculated, not stored)
  categories: {
    media: number;     // Sum of media across all days
    mediaSets: number; // Sum of mediaSets across all days
    tips: number;      // Sum of tips across all days
    subscriptions: number; // Sum of subscriptions across all days
  };
  
  // OBSOLETE: categoryPercentages (redundant with direct editing)
  // Keep for backward compatibility during migration
  categoryPercentages?: {
    media: number;
    mediaSets: number;
    tips: number;
    subscriptions: number;
  };
  
  // ... other existing fields
}
```

### Migration Strategy

#### Phase 1: Data Migration
1. **Legacy overrides** (no dailyValues): Already handled by existing migration
2. **Current overrides** (with dailyValues): 
   - For each day in `dailyValues`, create `dailyCategoryBreakdown` by applying percentages
   - Use `categoryPercentages` if available, otherwise use default (58/21/8/13)
   - Store as `dailyCategoryValues`
   - Remove `dailyValues` from storage (or keep as derived field)

#### Phase 2: UI Updates
1. EditOverrideDialog: Show 4 inputs per day instead of 1
2. Update all calculations to use `dailyCategoryValues`
3. Remove percentage sliders (or keep as "apply to all" feature)

#### Phase 3: Cleanup
1. Remove `categoryPercentages` from interface (optional, keep for compatibility)
2. Update all helper functions to work with new structure

## Detailed Implementation Plan

### 1. TypeScript Interface Updates (`src/types/overrides.ts`)
- Add `DailyCategoryBreakdown` interface
- Update `MonthlyOverride` interface:
  - Replace `dailyValues: Record<string, number>` with `dailyCategoryValues: Record<string, DailyCategoryBreakdown>`
  - Keep `dailyValues` as optional/calculated property
  - Mark `categoryPercentages` as deprecated
- Update helper functions:
  - `createMonthlyOverrideWithDailyValues()` → `createMonthlyOverrideWithDailyCategoryValues()`
  - `getMonthlyTotal()`: Calculate from `dailyCategoryValues`
  - `validateOverrideRatios()`: Update or deprecate (ratios no longer enforced)
  - `adjustCategoriesProportionally()`: Update or deprecate

### 2. Storage Logic Updates (`src/lib/storage.ts`)
- Update `migrateLegacyOverridesIfNeeded()` to handle migration to `dailyCategoryValues`
- Add new migration function: `migrateDailyValuesToCategoryValues()`
- Update `getAllManualOverrides()` to apply migration
- Update CSV import/export to handle new structure

### 3. EditOverrideDialog Redesign (`src/components/dashboard/EditOverrideDialog.tsx`)
**UI Layout Options:**
- **Option A**: Matrix table with days as rows, categories as columns (31 rows × 4 columns = 124 cells)
- **Option B**: Tabbed view by day (31 tabs, each with 4 inputs)
- **Option C**: Expandable accordion per day (31 accordions, each with 4 inputs)
- **Option D**: Grid of day cards, each card shows 4 inputs

**Recommended: Option D (Grid of day cards)**
- Similar to current daily grid but each day card has 4 inputs
- Maintains visual consistency with current design
- Scales well on mobile (stack vertically)
- Clear visual grouping by day

**New Features Needed:**
- "Apply percentages to all days" button (uses sliders to distribute existing totals)
- "Clear all" for specific category across all days
- "Distribute evenly" for specific category across days
- Daily total display (sum of 4 categories for that day)
- Monthly totals per category

### 4. Data Generation Updates (`src/hooks/useDashboardData.ts`)
- Update `generateManualDailyData()` to use `dailyCategoryValues` directly
- Each day's data comes from the 4 category values
- No need to apply percentages (already in the data)

### 5. Backward Compatibility
**Migration Path:**
```
Legacy (no dailyValues) 
  → Current (dailyValues + percentages) 
  → New (dailyCategoryValues)
```

**Migration Functions:**
1. `migrateLegacyToDailyValues()`: Already exists
2. `migrateDailyValuesToCategoryValues(override)`: New function
   - Input: Override with `dailyValues` and optional `categoryPercentages`
   - Output: Override with `dailyCategoryValues` (calculated by applying percentages)

**Storage Version:**
- Current: '2.0' (added dailyValues)
- New: '3.0' (added dailyCategoryValues, deprecated dailyValues)

## UI/UX Considerations

### Input Density Challenge
31 days × 4 categories = 124 inputs
- Need compact input design
- Consider using smaller input components
- Add "quick edit" features:
  - Copy day's values to other days
  - Apply pattern (e.g., weekends higher/lower)
  - Import from template

### Visual Hierarchy
```
Day 1
├── Media: [___]
├── Tips: [___]
├── Subscriptions: [___]
└── Media Sets: [___]
Day Total: $X.XX
```

### Responsive Design
- Desktop: 4-6 day cards per row, each with 4 inputs
- Tablet: 2-3 day cards per row
- Mobile: 1 day card per row (stacked)

## Technical Challenges

### 1. Performance with 124 Inputs
- Use React memoization for input components
- Debounce save operations
- Virtual scrolling for months with many days?

### 2. State Management
- Current: 31 values in state
- New: 124 values in state
- Need efficient state structure: `Record<string, DailyCategoryBreakdown>`

### 3. Validation
- Ensure category values are non-negative
- Daily total = sum of 4 categories
- Monthly totals calculated correctly

### 4. Export/Import
- CSV format needs to handle 4 values per day
- Consider new CSV structure or JSON export

## Alternative Approaches

### Approach 1: Hybrid Model (Recommended)
- Keep `dailyValues` for quick total entry
- Add "expand" button per day to show category breakdown
- Best of both worlds: simple for most users, detailed for power users

### Approach 2: Two Modes
- "Simple mode": Enter daily totals, apply percentages
- "Advanced mode": Enter all 4 categories per day
- Toggle between modes

### Approach 3: Progressive Disclosure
- Show daily totals by default
- Click "edit categories" to show 4 inputs for that day
- Less overwhelming UI

## Recommendation

**Implement Approach 1 (Hybrid Model):**
1. Keep current daily grid for quick entry
2. Add "edit categories" button on each day card
3. When clicked, expand to show 4 category inputs for that day
4. Save both `dailyValues` (sum) and `dailyCategoryValues` (breakdown)

This provides:
- Backward compatibility
- Simple UI for most use cases
- Detailed control when needed
- Gradual migration path

## Implementation Priority

1. **Phase 1**: Update data structures and migration (backward compatible)
2. **Phase 2**: Add category editing UI (optional feature)
3. **Phase 3**: Deprecate old percentage system (if desired)

## Success Metrics
- All existing overrides migrate successfully
- UI remains usable with 124 inputs
- Performance acceptable (no lag when editing)
- Users can edit categories per day as requested