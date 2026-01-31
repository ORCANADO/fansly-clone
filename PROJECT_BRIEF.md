# Project Title: Fansly Earnings Clone (Simulation Mode)

## 🎯 Vision
A pixel-perfect clone of the Fansly "Earnings/Statistics" dashboard. This is a personal management tool for financial simulation. The "Magic Moment" is a Target Input field: the user enters a dollar amount (e.g., $10,000) for the current month, and the system mathematically distributes that total across Subscriptions, Tips, and Media Sales to match the target exactly.

## 🎨 Visual Identity (Fansly Dark Mode)
- **Backgrounds:** Primary: `#111215` | Cards: `#16212e` | Borders: `#2a3948`
- **Accent Blue:** `#1da1f2` (Buttons and Active Tabs)
- **Chart Line Colors:**
  - Tips: `#a855f7` (Purple)
  - Subscriptions: `#22c55e` (Green)
  - Media: `#e2e8f0` (White/Light Gray)
  - Media Sets: `#3b82f6` (Blue)

## 🛠 Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts (AreaChart with custom dot indicators)
- **State:** React `useState` + `localStorage` (to keep historical months fixed)

## 🧠 The Accommodation Engine Logic
When the user updates the `monthlyTarget`:
1. **Total Breakdown:** - Subscriptions = 60% of Target
   - Media = 25% of Target
   - Tips = 15% of Target
2. **Daily Distribution:** The `monthlyTarget` must be spread across 30 days. Use a "Gaussian curve" (higher in the middle/end) so the chart looks realistic, but the `SUM` of all daily points must equal the `monthlyTarget` exactly.
3. **Fixed History:** Data for "Dec 2025" and previous months must be stored in `localStorage`. Once a month is "locked," it does not change when the current month target is updated.

## 📂 Component Structure
### 1. `SimulationHeader.tsx`
- Contains the "Monthly Target Distribution" input field.
- A "Simulate" button that triggers the recalculation.
- Displays the "Last 30 Days" total and "Top X.XX%" badge.

### 2. `EarningsChart.tsx`
- Multi-line Recharts `AreaChart`.
- Implements the 4 colored lines (Tips, Subs, Media, Media Sets).
- High-fidelity tooltips matching the "Jan 2, 2026" style in reference image #1.

### 3. `TrackingLinksTable.tsx`
- Replicates the "Tracking Links" rows from the screenshot.
- Metrics: Hits, Subs, Ratio, Revenue.
- Includes the "Managed" tag and the "Copy/Edit/Delete" icons.

### 4. `StatementsList.tsx`
- Collapsible rows for previous months.
- "Last 30 Days", "Jan 2026", "Dec 2025".

## 📋 Data Schema (TypeScript)
interface DailyStats {
  date: string;
  tips: number;
  subscriptions: number;
  media: number;
  mediaSets: number;
  total: number;
}

interface MonthlyData {
  monthYear: string; // e.g., "Jan 2026"
  target: number;
  days: DailyStats[];
  isLocked: boolean;
}

## 🤖 AI Build Instructions
- **Constraint:** Use 'use client' for the main layout.
- **Precision:** Ensure the chart grid lines are dashed and faint.
- **Persistence:** On first load, check `localStorage`. If empty, initialize with the values seen in the user's provided Dec 2025 screenshot ($3,556.47).