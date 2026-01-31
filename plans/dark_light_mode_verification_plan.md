# Dark/Light Mode Button Functionality Plan

## Current State Analysis

### ✅ Already Implemented
1. **`'use client'` directive** - Present at top of `ProfileDropdown.tsx`
2. **`useTheme` import** - Correctly imported from `next-themes`
3. **Theme switching logic** - `toggleTheme()` function calls `setTheme(theme === "dark" ? "light" : "dark")`
4. **Dynamic label & icon** - Based on current theme:
   - Dark mode: Shows "Light Mode" with Sun icon
   - Light mode: Shows "Dark Mode" with Moon icon
5. **Hydration safety** - Uses `mounted` state to prevent mismatches
6. **Theme persistence** - Configured with `storageKey="vibestats-theme"` in `layout.tsx`

### 🔍 Potential Issues to Verify
1. **Icon/label sync** - Ensure visual feedback matches actual theme state
2. **Click handler** - Verify `onClick` properly triggers theme change
3. **Persistence** - Test theme persists across page reloads
4. **UI feedback** - Check for immediate visual updates after toggle

## Implementation Verification Plan

### 1. Code Review Checklist
- [ ] `useTheme` hook properly destructured: `const { theme, setTheme } = useTheme()`
- [ ] `toggleTheme` function correctly toggles between "dark" and "light"
- [ ] Menu item `id: 25` has correct `onClick: toggleTheme`
- [ ] Label logic: `theme === "dark" ? "Light Mode" : "Dark Mode"`
- [ ] Icon logic: `theme === "dark" ? <Sun /> : <Moon />`
- [ ] Hydration guard: `!mounted` check for initial render

### 2. Testing Procedure
```typescript
// Manual test steps:
1. Open application in browser
2. Click profile avatar to open dropdown
3. Locate theme switcher item (last in System group)
4. Verify current label/icon matches system theme
5. Click theme switcher
6. Observe:
   - Immediate theme change in UI
   - Dropdown remains open (or closes smoothly)
   - Label/icon updates to show opposite action
7. Close and reopen dropdown
8. Verify label/icon reflects new theme
9. Refresh page
10. Verify theme persists
```

### 3. Expected Behavior Matrix
| Current Theme | Button Label | Button Icon | Click Action | New Theme |
|---------------|--------------|-------------|--------------|-----------|
| dark          | Light Mode   | Sun         | setTheme("light") | light |
| light         | Dark Mode    | Moon        | setTheme("dark")  | dark  |
| undefined (hydration) | Theme | Sun | No-op (mounted check) | N/A |

### 4. Edge Cases to Handle
1. **Initial load**: Should show placeholder until `mounted` is true
2. **System preference**: Currently `enableSystem={false}`, so only dark/light
3. **LocalStorage corruption**: Should fall back to `defaultTheme="dark"`
4. **Multiple clicks**: Should toggle consistently without race conditions

## Improvement Opportunities

### 1. Enhanced Visual Feedback
```typescript
// Current implementation is good, but could add:
// - Animation on icon change
// - Toast notification for theme change
// - Accessibility attributes
```

### 2. Code Refinements
```typescript
// Option: Extract theme logic to custom hook
const useThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");
  const label = !mounted ? "Theme" : (theme === "dark" ? "Light Mode" : "Dark Mode");
  const icon = !mounted ? <Sun /> : (theme === "dark" ? <Sun /> : <Moon />);
  
  return { toggle, label, icon, mounted, theme };
};
```

### 3. Accessibility Improvements
```typescript
// Add ARIA attributes
aria-label={label}
aria-pressed={theme === "dark"} // or similar
```

## Files to Verify/Modify

### Primary File
- `src/components/layout/ProfileDropdown.tsx` - Core implementation

### Supporting Files
- `src/components/theme-provider.tsx` - Theme provider wrapper
- `src/app/layout.tsx` - ThemeProvider configuration
- `src/app/globals.css` - Theme CSS variables

### Documentation
- `PROJECT_STRUCTURE.md` - Update if changes made
- `project_log.md` - Log verification/fixes

## Success Criteria

### Functional Requirements
1. ✅ Clicking theme switcher toggles between dark/light modes
2. ✅ UI updates immediately after toggle
3. ✅ Label and icon reflect current theme state
4. ✅ Theme preference persists across page reloads
5. ✅ No hydration errors in console

### Non-Functional Requirements
1. ✅ Smooth transitions (if implemented)
2. ✅ Accessible to keyboard/screen readers
3. ✅ Consistent with design system
4. ✅ No performance degradation

## Rollback Plan
If issues are found:
1. Revert to current working state
2. Add console logging for debugging
3. Test individual components
4. Incrementally reapply fixes

## Next Steps
1. Execute verification tests
2. Document any issues found
3. Implement fixes if needed
4. Update documentation
5. Request user confirmation