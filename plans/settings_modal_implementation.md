# Settings Modal Implementation Plan

## Overview
Convert the existing full-page SettingsView into a modal/popup triggered from the ProfileDropdown, using Shadcn/UI Dialog component for high-fidelity modal experience.

## Current State Analysis

### Existing Components:
1. **`SettingsView.tsx`** - Full-page settings view with:
   - Monthly Target Distribution input
   - Simulate button
   - Distribution preview (65/25/10 split)
   - Quick presets ($5K, $10K, $15K, etc.)
   - Reset to Default functionality

2. **`useSettings.ts`** - Hook managing:
   - `isSettingsOpen` boolean state
   - localStorage persistence
   - Custom event dispatch for settings toggle

3. **`page.tsx`** - Conditionally renders:
   - SettingsView when `isSettingsOpen === true`
   - Dashboard (TrackingLinks, SimulationHeader, Statements) when `isSettingsOpen === false`

4. **`ProfileDropdown.tsx`** - Triggers:
   - `setIsSettingsOpen(true)` on Settings menu item click

## Implementation Strategy

### Phase 1: Setup & Component Creation
1. **Install Shadcn/UI Dialog Component**
   ```bash
   npx shadcn@latest add dialog
   ```
   - Adds Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription

2. **Create `SettingsModal.tsx`**
   - Location: `src/components/dashboard/SettingsModal.tsx`
   - Use Dialog component as wrapper
   - Extract core functionality from SettingsView:
     * Target input field
     * Simulate button
     * Distribution preview
     * Quick presets
     * Reset functionality
   - Maintain existing styling from reference image #3
   - Props: `targetAmount`, `onTargetChange`, `isOpen`, `onOpenChange`

### Phase 2: State Management Updates
1. **Update `useSettings.ts`**
   - Add `isSettingsModalOpen` state alongside existing `isSettingsOpen`
   - Or repurpose `isSettingsOpen` for modal (breaking change)
   - Better: Keep `isSettingsOpen` for backward compatibility during transition

2. **Update `ProfileDropdown.tsx`**
   - Change Settings menu item to trigger modal open
   - Use `setIsSettingsModalOpen(true)` or similar

### Phase 3: Integration & Cleanup
1. **Update `page.tsx`**
   - Remove conditional rendering of SettingsView
   - Always show dashboard components
   - Add SettingsModal component at root level
   - Pass `targetAmount` and `setTargetAmount` from `useDashboardData`

2. **Remove/Deprecate `SettingsView.tsx`**
   - Keep file temporarily for reference
   - Eventually remove or convert to modal-only version

3. **Ensure Real-time Updates**
   - Verify `useDashboardData` hook already provides real-time updates
   - Modal changes should trigger immediate chart updates via existing hook system

## Technical Details

### SettingsModal Component Structure
```typescript
interface SettingsModalProps {
  targetAmount: number;
  onTargetChange: (amount: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({
  targetAmount,
  onTargetChange,
  isOpen,
  onOpenChange
}: SettingsModalProps) {
  // State for local input value
  const [localTarget, setLocalTarget] = useState(targetAmount.toString());
  
  // Distribution calculations
  const targetNum = parseFloat(localTarget) || 0;
  const subscriptions = targetNum * 0.65;
  const tips = targetNum * 0.25;
  const media = targetNum * 0.07;
  const mediaSets = targetNum * 0.03;
  
  const handleSimulate = () => {
    const num = parseFloat(localTarget);
    if (!isNaN(num) && num > 0) {
      onTargetChange(num);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Monthly Target Distribution</DialogTitle>
          <DialogDescription>
            Adjust the target amount to simulate earnings distribution
          </DialogDescription>
        </DialogHeader>
        
        {/* Content extracted from SettingsView */}
        <div className="space-y-6">
          {/* Target Input Section */}
          <div className="dense-card p-5">
            {/* ... existing SettingsView content ... */}
          </div>
          
          {/* Distribution Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ... distribution bars ... */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### useSettings Hook Updates
```typescript
interface Settings {
  isSettingsOpen: boolean;
  isSettingsModalOpen: boolean; // New
}

const defaultSettings: Settings = {
  isSettingsOpen: false,
  isSettingsModalOpen: false,
};

// Add new setter
const setIsSettingsModalOpen = (isOpen: boolean) => {
  setSettings(prev => ({ ...prev, isSettingsModalOpen: isOpen }));
};
```

### ProfileDropdown Update
```typescript
// Current:
const handleSettingsClick = () => {
  setIsSettingsOpen(true);
};

// New:
const handleSettingsClick = () => {
  setIsSettingsModalOpen(true); // Open modal instead
};
```

## Success Criteria

1. **Modal Functionality**
   - Clicking Settings in ProfileDropdown opens modal
   - Modal contains all SettingsView functionality
   - Modal can be closed via X button or clicking outside
   - Styling matches reference image #3

2. **Real-time Updates**
   - Changing target in modal updates charts immediately
   - No page refresh required
   - Distribution preview updates in real-time

3. **Backward Compatibility**
   - Existing `isSettingsOpen` state maintained for any other uses
   - No breaking changes to other components

4. **Performance**
   - Modal opens/closes smoothly
   - No unnecessary re-renders
   - State persists correctly

## Files to Create/Modify

### New Files:
1. `src/components/dashboard/SettingsModal.tsx`

### Modified Files:
1. `src/hooks/useSettings.ts` - Add modal state
2. `src/components/layout/ProfileDropdown.tsx` - Update click handler
3. `src/app/page.tsx` - Remove SettingsView, add SettingsModal
4. `PROJECT_STRUCTURE.md` - Update component map
5. `project_log.md` - Log implementation

### Optional:
1. `src/components/dashboard/SettingsView.tsx` - Deprecate or modify

## Testing Checklist
- [ ] Modal opens when clicking Settings in ProfileDropdown
- [ ] Modal contains target input and Simulate button
- [ ] Changing target updates distribution preview
- [ ] Clicking Simulate updates charts without page refresh
- [ ] Modal can be closed via X and outside click
- [ ] Quick presets work correctly
- [ ] Reset to Default works
- [ ] Styling matches design (reference image #3)
- [ ] Build succeeds without errors
- [ ] No console errors or warnings