# Manual Override System - Technical Specification

## Executive Summary
Refactor the VibeStats dashboard to support manual data overrides with a priority system. Manual entries take 100% precedence over simulated data, enabling precise historical record-keeping while maintaining the "live vibe" of the dashboard.

## Core Requirements

### 1. Data Priority System
- **Primary Source**: `vibestats_manual_overrides` localStorage
- **Fallback**: Live simulation (bell-curve variance)
- **Rule**: Manual overrides take 100% precedence

### 2. Distribution Ratios (New System Truth)
- **Media**: 58% of net income
- **Media Sets**: 21% of net income  
- **Tips**: 8% of net income
- **Subscriptions**: 13% of net income
- **Total**: 100% (replaces old 65/25/10 split)

### 3. Daily Data Generation Patterns
- **Manual Overrides**: Linear distribution + 15% random daily noise
- **Live Simulation**: Existing bell-curve variance (updated to new ratios)
- **Constraint**: Monthly totals must match input exactly

### 4. Architecture Changes

#### 4.1 TypeScript Interfaces
```typescript
// src/types/overrides.ts
export interface MonthlyOverride {
  netIncome: number;
  grossIncome: number; // netIncome * 1.2 (20% platform fee)
  categories: {
    media: number;        // netIncome * 0.58
    mediaSets: number;    // netIncome * 0.21
    tips: number;         // netIncome * 0.08
    subscriptions: number; // netIncome * 0.13
  };
  isManual: boolean; // Always true for overrides
  lastUpdated: string; // ISO timestamp
  note?: string; // Optional user note
}

export type ManualOverridesStorage = Record<string, MonthlyOverride>; // key: "2024-12"
```

#### 4.2 Storage Utilities
```typescript
// src/lib/storage.ts
const MANUAL_OVERRIDES_KEY = 'vibestats_manual_overrides';
const DEFAULT_OVERRIDES: ManualOverridesStorage = {};

export const storage = {
  getAll(): ManualOverridesStorage,
  get(monthKey: string): MonthlyOverride | null,
  save(monthKey: string, data: MonthlyOverride): void,
  delete(monthKey: string): void,
  has(monthKey: string): boolean,
  clear(): void
};
```

#### 4.3 Refactored Hook Signature
```typescript
// src/hooks/useDashboardData.ts
export function useDashboardData(monthKey?: string) {
  // monthKey format: "2024-12" or "current" for current month
  // Returns: DashboardStats with override data if exists
}

// New helper function for any month
export function useMonthlyData(monthKey: string) {
  // Dedicated hook for specific months
}
```

#### 4.4 Data Generation Algorithms
```typescript
// Manual override daily data generator
function generateManualDailyData(
  monthKey: string,
  override: MonthlyOverride,
  daysInMonth: number
): DailyStats[] {
  // 1. Calculate daily base for each category
  // 2. Apply ±15% random noise per day
  // 3. Normalize to ensure exact monthly totals
  // 4. Return DailyStats array
}

// Updated simulation generator (new ratios)
function generateSimulationDailyData(
  targetAmount: number,
  daysInMonth: number
): DailyStats[] {
  // Uses new 58/21/8/13 distribution
  // Maintains bell-curve variance
}
```

### 5. UI Components

#### 5.1 Management Dashboard (`ManualOverridesManager.tsx`)
- **Location**: Hidden in Settings (ghost UI)
- **Layout**: High-density table of months
- **Features**:
  - Month selector (YYYY-MM format)
  - Net income input field
  - Category breakdown (auto-calculated, editable)
  - Real-time preview
  - Save/Cancel/Delete actions
  - Search/filter by month

#### 5.2 Edit Dialog (`ManualOverrideDialog.tsx`)
- **Trigger**: "Edit" button in manager
- **Content**: Form with all override fields
- **Validation**: Ensure Gross = Net * 1.2
- **Live Preview**: Chart showing daily distribution

#### 5.3 Settings Integration
- **Current**: SettingsModal has target configuration
- **New**: Add "Manual Overrides" tab/section
- **Access**: Via Settings button in sidebar

### 6. Integration Points

#### 6.1 Statements Component
```typescript
// Current: generateMockData() with scaling
// New: Check for overrides first
function getMonthData(monthId: string, targetAmount: number) {
  const monthKey = convertToMonthKey(monthId); // "jan2026" → "2026-01"
  const override = storage.get(monthKey);
  
  if (override) {
    return generateManualDailyData(monthKey, override, getDaysInMonth(monthKey));
  }
  
  // Fallback to simulation with new ratios
  return generateSimulationDailyData(targetAmount, getDaysInMonth(monthKey));
}
```

#### 6.2 EarningsChart Component
- **No changes required**: Already accepts DailyStats[]
- **Benefit**: Works seamlessly with manual or simulated data

#### 6.3 StatCards Component
- **Update**: Use override categories when available
- **Fallback**: Use simulated categories

### 7. Vibe Engineering Patterns

#### 7.1 Performance Optimization
```typescript
// Use useMemo for expensive calculations
const dailyData = useMemo(() => {
  if (override) {
    return generateManualDailyData(monthKey, override, daysInMonth);
  }
  return generateSimulationDailyData(targetAmount, daysInMonth);
}, [override, monthKey, targetAmount, daysInMonth]);
```

#### 7.2 Deterministic Context
- Manual data is source of truth
- Simulation provides fallback (never empty UI)
- All calculations are deterministic and reproducible

#### 7.3 Math Integrity
- Gross = Net + 20% (unless explicitly overridden)
- Category ratios adjust proportionally when user edits one
- Daily noise doesn't affect monthly totals

### 8. Implementation Sequence

#### Phase 1: Core Infrastructure (Backward Compatible)
1. Create `src/types/overrides.ts`
2. Create `src/lib/storage.ts`
3. Update `useDashboardData.ts` to accept monthKey parameter
4. Implement override checking logic
5. Update distribution ratios in simulation

#### Phase 2: Data Generation
1. Implement `generateManualDailyData()` function
2. Test daily data integrity (sums match totals)
3. Verify noise pattern looks organic

#### Phase 3: UI Components
1. Create `ManualOverridesManager.tsx`
2. Create `ManualOverrideDialog.tsx`
3. Integrate into SettingsModal as new tab
4. Add navigation from sidebar Settings button

#### Phase 4: Integration
1. Update Statements component to use override system
2. Update StatCards to show override data
3. Test all existing functionality

#### Phase 5: Polish & Documentation
1. Update PROJECT_STRUCTURE.md
2. Update project_log.md
3. Add inline documentation
4. Test edge cases

### 9. Testing Strategy

#### 9.1 Unit Tests
- Storage utilities (save/load/delete)
- Data generation algorithms
- Ratio calculations

#### 9.2 Integration Tests
- Override priority system
- Daily data integrity
- UI component interactions

#### 9.3 User Acceptance Tests
- Manual override creation/edit/delete
- Chart displays with manual data
- Settings integration
- Backward compatibility

### 10. Success Metrics
- ✅ Manual overrides persist across page reloads
- ✅ Override data takes precedence over simulation
- ✅ Daily charts show organic patterns (not flat lines)
- ✅ Monthly totals match input exactly
- ✅ All existing functionality preserved
- ✅ Performance: No UI lag during typing
- ✅ UX: Management dashboard accessible but hidden

### 11. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Data loss during migration | No migration needed (new feature) |
| Breaking existing charts | Maintain DailyStats interface |
| Performance issues | Use useMemo optimizations |
| Complex state management | Centralize in storage utilities |
| User confusion about hidden UI | Clear documentation in Settings |

### 12. Timeline & Dependencies
- **Dependencies**: None (self-contained feature)
- **Complexity**: Medium (requires careful refactoring)
- **Testing**: Comprehensive due to data integrity requirements

---

## Approval Checklist
- [ ] Technical approach aligns with Vibe Architect directives
- [ ] All requirements addressed (priority, ratios, patterns)
- [ ] Implementation sequence is logical
- [ ] Risk mitigation strategies are adequate
- [ ] Success metrics are measurable

**Next Step**: Switch to Code mode for implementation.