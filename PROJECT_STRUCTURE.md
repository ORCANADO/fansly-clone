# Project Structure Map

## Directory Tree (Depth: 3)
.
├── PROJECT_BRIEF.md
├── components.json
├── context_gateway.md
├── logs
│   └── archive
├── next-env.d.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── src
│   ├── app
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── dashboard
│   │   │   ├── EarningsChart.tsx
│   │   │   ├── EditOverrideDialog.tsx
│   │   │   ├── ManagementDashboard.tsx
│   │   │   ├── SettingsModal.tsx
│   │   │   ├── SettingsView.tsx
│   │   │   ├── StatCards.tsx
│   │   │   ├── Statements.tsx
│   │   │   └── TrackingLinks.tsx
│   │   ├── layout
│   │   │   ├── ProfileDropdown.tsx
│   │   │   └── TopNav.tsx
│   │   ├── providers
│   │   │   └── SettingsProvider.tsx
│   │   ├── theme-provider.tsx
│   │   └── ui
│   │       ├── button.tsx
│   │       ├── CurrencyDisplay.tsx
│   │       ├── date-time-picker.tsx
│   │       ├── dialog.tsx
│   │       └── dropdown-menu.tsx
│   ├── hooks
│   │   ├── useDashboardData.ts
│   │   └── useSettings.ts
│   ├── lib
│   │   ├── storage.ts
│   │   └── utils.ts
│   └── types
│       └── overrides.ts
├── tailwind.config.ts
└── tsconfig.json

## Dev4Dev Logic Summaries
- **src/hooks/useDashboardData.ts**: // @vibe-critical Core distribution engine with manual override support. Checks `vibestats_manual_overrides` first, then generates daily stats using Fansly-standard distribution (58/21/8/13 split). Now supports per-day category editing with `dailyCategoryValues` structure. Manual overrides use exact category values per day; simulation uses bell-curve variance. Handles persistence via `localStorage`.
- **src/app/page.tsx**: // @vibe-critical Main orchestrator. Implements high-density Fansly UI layout with TrackingLinks cards at top and accordion Statements cards below. Connects `useDashboardData` to interactive components.
- **src/types/overrides.ts**: // @vibe-critical Type definitions for manual override system. Defines `MonthlyOverride` interface with `dailyCategoryValues` for per-day category editing (Media, Tips, Subscriptions, Media Sets). Includes Fansly-standard distribution ratios (58/21/8/13) and helper functions for category calculations.
- **src/lib/storage.ts**: // @vibe-critical Storage utilities for manual overrides. Manages `vibestats_manual_overrides` localStorage key with type-safe operations. Version 3.0 adds `dailyCategoryValues` support with automatic migration from legacy `dailyValues`. Handles CSV import/export with new structure.
- **src/components/dashboard/ManagementDashboard.tsx**: // @vibe-critical Management UI for manual overrides. Provides Shadcn/UI Table listing months with overrides, edit/delete actions, and Add Manual Override functionality.
- **src/components/dashboard/EditOverrideDialog.tsx**: // @vibe-critical Dialog for editing manual overrides with per-day category editing. Each day displays 4 input fields (Media, Tips, Subscriptions, Media Sets) with real-time calculations. Features "Copy to all days", "Clear All", and "Distribute Evenly" actions. Shows daily totals and category sums.
- **src/components/dashboard/SettingsView.tsx**: // @vibe-critical Enhanced settings panel with tab navigation (Target Configuration / Manual Overrides). Integrates ManagementDashboard and uses Fansly-standard distribution.
- **src/components/dashboard/SettingsModal.tsx**: // @vibe-critical Modal wrapper for SettingsView, providing access to configuration and manual override management.
- **src/components/providers/SettingsProvider.tsx**: // @vibe-critical Centralized settings context provider. Manages global state for `isSettingsOpen` and `isSettingsModalOpen` with localStorage persistence.
- **src/components/ui/date-time-picker.tsx**: // @vibe-critical Pixel-perfect Fansly Date/Time Picker component for global date filtering. Features calendar view with month navigation, time selection with HH:MM inputs and 12H/24H toggle, quick select pills (-24h, -12h, -1h, +1h, +12h, +24h), "Select Current Time and Date" button, and "Dismiss"/"Confirm" actions. Uses `date-fns` for date manipulation and follows Fansly dark theme (#16212e background, #1da1f2 accent).

## Context Breadcrumbs
- [2026-01-24] Initialized VibeStats dashboard with high-fidelity Fansly clone UI.
- [2026-01-24] Migrated to Tailwind v4 syntax to resolve build errors.
- [2026-01-24] Rearranged dashboard layout: TrackingLinksTable now first section in Statistics tab, followed by SimulationHeader and accordion Statements with expandable charts.
- [2026-01-24] Enhanced Statements component with multi-open accordion behavior and localStorage persistence for expanded months.
- [2026-01-24] Added Shadcn/UI integration with DropdownMenu component for profile navigation.
- [2026-01-24] Implemented active functionality for ProfileDropdown: Theme switcher using next-themes, Settings view toggle, and localStorage persistence.
- [2026-01-24] Enhanced dark/light mode system with proper Tailwind v4 `@variant dark` configuration and theme-provider wrapper.
- [2026-01-25] Implemented manual override system with `vibestats_manual_overrides` localStorage key. Manual entries take 100% precedence over simulation. Updated distribution to Fansly-standard 58/21/8/13 split.
- [2026-01-25] Created ManagementDashboard component with Shadcn/UI Table for managing manual overrides.
- [2026-01-25] Created EditOverrideDialog component with real-time calculations for Gross Income (+20%) and sub-category percentages.
- [2026-01-25] Enhanced SettingsView with tab navigation (Target Configuration / Manual Overrides) and integrated ManagementDashboard.
- [2026-01-25] Updated SettingsModal to use enhanced SettingsView component.
- [2026-01-25] Fixed Management Dashboard accessibility: Introduced `SettingsProvider` to centralize settings state and resolve isolated state issues in `useSettings` hook.
- [2026-01-25] Major UI Refactor: Migrated unified blocks to individual separated cards (pills) for Tracking Links and Statements. Updated TopNav logo, header icons, and wallet styling for pixel-perfect Fansly fidelity.
- [2026-01-25] Authentic Layout Polish: Removed SimulationHeader block and "Manual Entry" labels. Implemented high-fidelity gold ribbon badges for top performers. Centered the profile dropdown header with larger avatar and online status. Updated global theme to deep dark (#090a0b).
- [2026-01-26] Dashboard UI Fidelity Refinement: Completed comprehensive aesthetic polish including money counter restructuring (#D6DCE8, 14px), profile picture size adjustment (36px), and online status dot styling (#77CE78).
- [2026-01-26] Header & Navigation Polish: Added subtle header dividers, refined back arrow (thickness/color), and shifted title position. Refactored dashboard tabs to restrict border width to match tab content. Updated accent colors for "Wallet" (#637395) and active "Statistics" (#2599F7) tabs.
- [2026-01-28] Per-Day Category Editing: Implemented granular daily category editing with 4 inputs per day (Media, Tips, Subscriptions, Media Sets). Added `dailyCategoryValues` data structure to `MonthlyOverride` interface. Updated storage to version 3.0 with automatic migration from legacy `dailyValues`. Rebuilt EditOverrideDialog with responsive 4-column grid layout, "Copy to all days", "Clear All", and "Distribute Evenly" features. Maintained backward compatibility with legacy data.
- [2026-01-29] Pixel-Perfect Fansly Date/Time Picker: Created `DateTimePicker` component for global date filtering. Features calendar view with month navigation, time selection with HH:MM inputs and 12H/24H toggle, quick select pills (-24h, -12h, -1h, +1h, +12h, +24h), "Select Current Time and Date" button, and "Dismiss"/"Confirm" actions. Integrated into EarningsChart header for date range filtering with quick presets (month, 30D, 90D, 1Y). Uses `date-fns` for date manipulation and follows Fansly dark theme (#16212e background, #1da1f2 accent).
- **High Dependency**: `src/lib/utils.ts` (See Also: Used globally for currency formatting and tailwind class merging. Now includes date parsing utilities: `parseChartDate`, `formatChartDate`, `formatFullDate`, `isDateInRange`).
- **High Dependency**: `src/app/globals.css` (See Also: Contains the Tailwind v4 `@theme` definition and variable overrides with proper dark variant configuration).
- **High Dependency**: `src/components/dashboard/EarningsChart.tsx` (See Also: Tightly coupled to `DailyStats` interface from the critical hook. Now includes DateTimePicker integration for date range filtering and summary stats for filtered data).
- **New Component**: `src/components/layout/ProfileDropdown.tsx` (See Also: High-density dark mode profile menu with 25 items, using Shadcn/UI DropdownMenu primitives with active theme switching and settings navigation).
- **New Component**: `src/components/theme-provider.tsx` (See Also: Standard Radix/Next-Themes wrapper for consistent theme management across the application).
- **New Component**: `src/components/dashboard/SettingsView.tsx` (See Also: Comprehensive settings panel with tab navigation for target configuration and manual override management).
- **New Component**: `src/components/dashboard/ManagementDashboard.tsx` (See Also: Management UI for manual overrides with Shadcn/UI Table, edit/delete actions, and Add Manual Override functionality).
- **New Component**: `src/components/dashboard/EditOverrideDialog.tsx` (See Also: Dialog for editing manual overrides with real-time calculations and percentage sliders).
- **New Component**: `src/components/ui/button.tsx` (See Also: Shadcn/UI Button component with variants (default, destructive, outline, secondary, ghost, link) and sizes).
- **New Component**: `src/components/ui/date-time-picker.tsx` (See Also: Pixel-perfect Fansly Date/Time Picker component for global date filtering with calendar view, time selection, and quick select pills).
- **New Component**: `src/components/ui/dialog.tsx` (See Also: Shadcn/UI Dialog component with portal, overlay, content, header, footer, title, and description).
- **New Hook**: `src/hooks/useSettings.ts` (See Also: Manages global settings state. Now refactored to use `SettingsProvider` for cross-component state synchronization).
- **New Provider**: `src/components/providers/SettingsProvider.tsx` (See Also: Centralizes settings state and handles persistence for global accessibility).
- **Enhanced Component**: `src/components/dashboard/Statements.tsx` (See Also: Now supports multi-open accordion with localStorage persistence for expanded months and manual override integration).
- **Enhanced Component**: `src/components/dashboard/EarningsChart.tsx` (See Also: Added Fansly‑style axis refinements, data dots, and top‑right filter controls (Combine/Date Range) with secondary button styling. Now includes DateTimePicker integration for date range filtering and summary stats for filtered data).
- **Enhanced Component**: `src/components/dashboard/SettingsModal.tsx` (See Also: Updated to use enhanced SettingsView component with tab navigation and manual override management).
- **New Type Definitions**: `src/types/overrides.ts` (See Also: Defines `MonthlyOverride` interface and Fansly-standard distribution ratios).
- **New Storage Utilities**: `src/lib/storage.ts` (See Also: Manages `vibestats_manual_overrides` localStorage operations).
