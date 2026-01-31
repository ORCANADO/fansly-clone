# Dark/Light Mode Implementation Plan

## Overview
Implement complete dark/light mode functionality using next-themes and Tailwind v4 with proper theme provider wrapper, CSS configuration, and UI integration.

## Current State Analysis
- ✅ `next-themes` already installed (v0.4.6)
- ✅ `ThemeProvider` already in `src/app/layout.tsx` with `attribute="class"`
- ✅ `ProfileDropdown.tsx` already has theme switching logic with `useTheme` hook
- ✅ Theme toggle already changes icon between Sun and Moon
- ❌ Missing separate `theme-provider.tsx` component
- ❌ Missing Tailwind v4 `@variant dark` configuration in globals.css
- ❌ Layout.tsx uses direct ThemeProvider instead of wrapper

## Architecture Diagram

```mermaid
graph TD
    A[ThemeProvider Wrapper] --> B[HTML data-theme attribute]
    B --> C[Tailwind v4 @variant dark]
    C --> D[CSS Variables]
    D --> E[UI Components]
    
    F[ProfileDropdown] --> G[useTheme hook]
    G --> H[setTheme function]
    H --> I[Toggle between light/dark]
    I --> J[Icon: Sun/Moon sync]
    
    B --> K[Dark Mode: data-theme="dark"]
    B --> L[Light Mode: data-theme="light"]
    
    K --> M[CSS: @variant dark applies]
    L --> N[CSS: Default theme applies]
    
    subgraph "Theme System"
        A
        B
        C
        D
    end
    
    subgraph "UI Integration"
        E
        F
        G
        H
        I
        J
    end
```

## Implementation Steps

### 1. Create Theme Provider Component
**File:** `src/components/theme-provider.tsx`
- Standard Radix/Next-Themes wrapper pattern
- Accepts `children`, `attribute`, `defaultTheme`, `enableSystem`, `storageKey` props
- Uses `next-themes` ThemeProvider internally
- Handles hydration mismatch with `suppressHydrationWarning`

### 2. Update Tailwind v4 CSS Configuration
**File:** `src/app/globals.css`
- Add `@variant dark` directive for Tailwind v4
- Correct syntax: `@variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))`
- Ensure CSS variables are defined for both themes
- Update existing theme colors to support light mode variants

### 3. Update Layout to Use Wrapper
**File:** `src/app/layout.tsx`
- Import new `ThemeProvider` from `@/components/theme-provider`
- Replace direct `next-themes` ThemeProvider with wrapper
- Maintain same props: `attribute="class"`, `defaultTheme="dark"`, etc.

### 4. Verify ProfileDropdown Integration
**File:** `src/components/layout/ProfileDropdown.tsx`
- Confirm `useTheme` import from `next-themes`
- Verify `theme` state and `setTheme` function work
- Check icon switching logic: Sun for dark mode, Moon for light mode
- Test toggle functionality

### 5. Test Theme Switching
- Manual testing of dark/light mode toggle
- Verify localStorage persistence (`vibestats-theme`)
- Check icon synchronization
- Validate CSS variable application

## Technical Details

### Theme Provider Implementation
```typescript
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ 
  children, 
  ...props 
}: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

### Tailwind v4 Dark Variant Syntax
```css
@variant dark (&:where([data-theme="dark"], [data-theme="dark"] *)) {
  /* Dark mode styles will be applied here */
}
```

### Light Mode CSS Variables
Define light mode variants that maintain visual hierarchy and contrast:

**Background & Text:**
- `--color-background`: `#f8fafc` (Light slate background)
- `--color-foreground`: `#0f172a` (Dark slate text)

**Cards & Surfaces:**
- `--color-card`: `#ffffff` (White cards)
- `--color-card-foreground`: `#0f172a` (Dark text on cards)
- `--color-popover`: `#ffffff` (White popovers)
- `--color-popover-foreground`: `#0f172a` (Dark text on popovers)

**Interactive Elements:**
- `--color-primary`: `#1da1f2` (Same blue for consistency)
- `--color-primary-foreground`: `#ffffff` (White text on primary)
- `--color-secondary`: `#f1f5f9` (Light slate for secondary elements)
- `--color-secondary-foreground`: `#475569` (Medium slate text)
- `--color-muted`: `#f1f5f9` (Light slate for muted backgrounds)
- `--color-muted-foreground`: `#64748b` (Medium slate for muted text)
- `--color-accent`: `#1da1f2` (Same blue accent)
- `--color-accent-foreground`: `#ffffff` (White text on accent)

**Borders & Inputs:**
- `--color-border`: `#e2e8f0` (Light gray borders)
- `--color-input`: `#ffffff` (White inputs with dark borders)
- `--color-ring`: `#1da1f2` (Blue focus ring)

**Chart Colors** (remain the same for consistency):
- `--color-stats-tips`: `#a855f7` (Purple)
- `--color-stats-subs`: `#22c55e` (Green)
- `--color-stats-media`: `#0f172a` (Dark for light mode)
- `--color-stats-referral`: `#3b82f6` (Blue)

## Files to Update
1. `src/components/theme-provider.tsx` - New component
2. `src/app/globals.css` - CSS updates
3. `src/app/layout.tsx` - Provider integration
4. `PROJECT_STRUCTURE.md` - Update component map
5. `project_log.md` - Log implementation

## Success Criteria
- Theme provider wrapper exists and is used in layout
- Tailwind v4 dark variant correctly configured
- Clicking "Light Mode/Dark Mode" in ProfileDropdown toggles theme
- Icon changes between Sun (dark mode) and Moon (light mode)
- Theme preference persists in localStorage
- No visual regressions in existing UI
- Both dark and light modes render correctly

## Dependencies
- `next-themes` (already installed v0.4.6)
- Tailwind CSS v4 (already configured)
- React 19 (already installed)

## Testing Checklist
- [ ] Toggle theme from ProfileDropdown
- [ ] Verify icon changes (Sun ↔ Moon)
- [ ] Check localStorage for theme preference
- [ ] Refresh page maintains theme
- [ ] CSS variables apply correctly
- [ ] No hydration errors
- [ ] Mobile/desktop responsiveness
- [ ] All UI components adapt to theme