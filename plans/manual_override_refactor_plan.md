# Manual Override System Refactor Plan

## Overview
Refactor `src/hooks/useDashboardData.ts` to implement a manual override system with priority checking. Create a new `vibestats_manual_overrides` localStorage key and update the dashboard to use manual data as the source of truth when available.

## Architecture

### Data Flow
1. **Request Phase**: When data for a month is requested
2. **Override Check**: Check `vibestats_manual_overrides[monthKey]`
3. **Priority Resolution**: 
   - If override exists → Use manual data
   - If no override → Use live simulation
4. **Daily Data Generation**: 
   - Manual: Linear distribution + 10-15% noise
   - Simulation: Existing bell-curve variance

### Storage Schema
```typescript
// Key: vibestats_manual_overrides
type ManualOverridesStorage = Record<string, MonthlyOverride>;

interface MonthlyOverride {
  netIncome: number;
  grossIncome: number; // netIncome * 1.2 (20% fee)
  categories: {
    media: number;        // net * 0.58
    mediaSets: number;    // net * 0.21
    tips: number;         // net * 0.08
    subscriptions: number; // net * 0.13
  };
  isManual: boolean; // Always true for overrides
  lastUpdated: string; // ISO timestamp
}

// Extended from existing DailyStats interface
interface DailyStats {
  date: string;
  tips: number;
  subs: number;
  media: number;
  mediaSets: number;
  total: number;
}
```

## Implementation Steps

### 1. TypeScript Interfaces (`src/types/overrides.ts`)
- Create new type definitions
- Export interfaces for use across components

### 2. LocalStorage Utilities (`src/lib/storage.ts`)
```typescript
const MANUAL_OVERRIDES_KEY = 'vibestats_manual_overrides';

export function getManualOverrides(): ManualOverridesStorage;
export function saveManualOverride(monthKey: string, data: MonthlyOverride): void;
export function deleteManualOverride(monthKey: string): void;
export function hasManualOverride(monthKey: string): boolean;
```

### 3. Refactor `useDashboardData.ts`
- Add month parameter to hook (default: current month)
- Implement override checking logic
- Create `generateDailyDataFromOverride()` function
- Maintain backward compatibility for current month

### 4. Daily Data Generation Algorithms
**Manual Override Algorithm**:
```typescript
function generateManualDailyData(
  monthKey: string, 
  override: MonthlyOverride,
  daysInMonth: number
): DailyStats[]
```
- Linear base: `dailyBase = categoryTotal / daysInMonth`
- Add noise: `± (dailyBase * random(0.1, 0.15))`
- Ensure sum matches category total exactly

**Simulation Algorithm**: Keep existing bell-curve logic

### 5. Management Dashboard UI
**Component**: `ManualOverridesManager.tsx`
- List of months with override status
- "Edit" button opens dialog
- Dialog with form fields for netIncome and category adjustments
- Real-time preview of distribution

**Integration**: Add to SettingsModal as new tab/section

### 6. Statements Component Update
- Modify `generateMockData()` to check for overrides
- Use override data when available instead of scaling
- Update scaling logic to respect manual entries

### 7. Vibe Engineering Patterns
- Use `useMemo` for override calculations (performance)
- Maintain Gross = Net + 20% rule
- Deterministic context: Manual overrides take 100% precedence
- Fallback pattern: Simulation provides data when no override exists

## Files to Modify/Create

### New Files:
1. `src/types/overrides.ts` - Type definitions
2. `src/lib/storage.ts` - Storage utilities
3. `src/components/dashboard/ManualOverridesManager.tsx` - UI component
4. `src/components/dashboard/ManualOverrideDialog.tsx` - Edit dialog

### Modified Files:
1. `src/hooks/useDashboardData.ts` - Core refactor
2. `src/components/dashboard/Statements.tsx` - Override integration
3. `src/components/dashboard/SettingsModal.tsx` - Add manager component
4. `src/components/dashboard/SettingsView.tsx` - Add manager component
5. `PROJECT_STRUCTURE.md` - Update dev4dev notes
6. `project_log.md` - Log significant changes

## Testing Strategy
1. **LocalStorage Persistence**: Verify overrides save/load correctly
2. **Priority System**: Manual overrides should override simulation
3. **Daily Data Integrity**: Sum of daily values = monthly totals
4. **Backward Compatibility**: Existing charts should not break
5. **Performance**: `useMemo` should prevent UI lag during typing

## Success Criteria
- ✅ Manual overrides stored in `vibestats_manual_overrides`
- ✅ `useDashboardData` checks overrides first
- ✅ DailyStats return type remains consistent
- ✅ EarningsChart works with manual data
- ✅ Management Dashboard UI functional
- ✅ All existing functionality preserved

## Risk Mitigation
- **Data Migration**: No migration needed (new feature)
- **Type Safety**: TypeScript interfaces ensure consistency
- **Fallback**: Simulation provides data when no override exists
- **Performance**: `useMemo` optimizations prevent UI lag