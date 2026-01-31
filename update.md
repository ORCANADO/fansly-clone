# PROJECT OVERVIEW: VibeStats Data Management Evolution
**Identity**: Senior Data Engineer / Vibe Architect
**Goal**: Transition from a random-variance simulation to a manual-entry management system with a conditional override engine.

## 1. TECH STACK & ARCHITECTURE
- **Core**: Next.js 14+, Tailwind v4, Shadcn/UI.
- **State/Persistence**: `localStorage` (Key: `vibestats_manual_overrides`).
- **Data Pattern**: JSON-serialized object where keys are month strings (`"2024-01"`) and values are the manual data structures.
- **Logic Engine**: Refactor `useDashboardData.ts` to implement an "Override Priority" check.
- **Data Portability**: CSV export/import functionality for backup and migration.

## 2. DATA SCHEMA (The Override Object)
```typescript
interface MonthlyOverride {
  netIncome: number;
  grossIncome: number; // netIncome * 1.2
  categories: {
    media: number;        // net * 0.58 (default)
    mediaSets: number;    // net * 0.21 (default)
    tips: number;         // net * 0.08 (default)
    subscriptions: number; // net * 0.13 (default)
  };
  isManual: boolean; // Flag to stop simulation for this month
}
```

## 3. NEW COMPONENTS IMPLEMENTED

### 3.1 ManagementDashboard (`src/components/dashboard/ManagementDashboard.tsx`)
- **Purpose**: Central interface for managing manual overrides across months
- **Features**:
  - Shadcn/UI Table listing all months with manual overrides
  - Edit button opens EditOverrideDialog for each month
  - Delete button to remove manual overrides
  - Add Manual Override button for creating new entries
  - Data Portability section with CSV export/import

### 3.2 EditOverrideDialog (`src/components/dashboard/EditOverrideDialog.tsx`)
- **Purpose**: Modal dialog for editing manual overrides with real-time calculations
- **Features**:
  - Net Income input field with auto-calculation of Gross Income (+20%)
  - Real-time calculation of four sub-categories (Media 58%, Media Sets 21%, Tips 8%, Subscriptions 13%)
  - Manual override sliders for each sub-category percentage
  - Visual feedback showing calculated amounts
  - Save button updates localStorage and triggers dashboard re-sync

### 3.3 Data Portability Functions (`src/lib/storage.ts`)
- **Export Functions**:
  - `exportManualOverridesToCSV()`: Converts manual overrides to CSV format
  - `downloadManualOverridesCSV()`: Triggers CSV file download
- **Import Functions**:
  - `importManualOverridesFromCSV()`: Parses CSV string and validates data
  - `importManualOverridesFromFile()`: Handles file upload and processing
- **Features**:
  - CSV header validation
  - Data type checking and error handling
  - Success/error feedback messages

## 4. INTEGRATION POINTS

### 4.1 Settings Modal Integration
- **Location**: Accessible via ProfileDropdown → Settings button
- **Components**:
  - `SettingsModal.tsx`: Modal container
  - `SettingsView.tsx`: Tabbed interface with "Target Configuration" and "Manual Overrides" tabs
  - `ManagementDashboard.tsx`: Integrated into Manual Overrides tab

### 4.2 Dashboard Data Flow
- **Priority System**: Manual overrides take precedence over simulated data
- **Sync Trigger**: Changes to manual overrides automatically trigger dashboard re-sync
- **Persistence**: All changes saved to `vibestats_manual_overrides` in localStorage

## 5. USER WORKFLOW

### 5.1 Accessing Management Dashboard
1. Click Settings button in ProfileDropdown (top-right corner)
2. Navigate to "Manual Overrides" tab in Settings modal
3. View and manage all monthly overrides in the ManagementDashboard

### 5.2 Editing Monthly Overrides
1. Click "Edit" button for any month in the table
2. Enter Net Income in the dialog
3. Observe real-time calculations for Gross Income and sub-categories
4. Adjust percentage sliders if manual override is needed
5. Click "Save" to update localStorage and refresh dashboard

### 5.3 Data Portability Operations
1. **Export CSV**: Click "Download CSV" button in Data Portability section
2. **Import CSV**: 
   - Click "Choose File" button
   - Select CSV file with manual override data
   - View import results (success/error messages)
   - Imported data automatically updates localStorage and dashboard

## 6. TECHNICAL IMPLEMENTATION NOTES

### 6.1 Real-time Calculations
- Gross Income = Net Income × 1.2
- Default percentages: Media (58%), Media Sets (21%), Tips (8%), Subscriptions (13%)
- Manual override percentages can be adjusted via sliders (0-100% range)
- All calculations update in real-time as user types or adjusts sliders

### 6.2 State Management
- `useSettings` hook manages Settings modal open/close state
- `useDashboardData` hook handles data fetching with override priority
- LocalStorage persistence ensures data survives browser refresh

### 6.3 Error Handling
- CSV import validates file format and data types
- Invalid data shows descriptive error messages
- Fallback to default values when parsing fails
- Graceful degradation for missing localStorage support

## 7. CSV FORMAT SPECIFICATION
```
month,netIncome,grossIncome,media,mediaSets,tips,subscriptions,isManual
2024-01,10000,12000,5800,2100,800,1300,true
2024-02,15000,18000,8700,3150,1200,1950,true
```

## 8. FUTURE ENHANCEMENTS
- Cloud sync integration (Firebase, Supabase)
- Advanced filtering and search in ManagementDashboard
- Bulk edit operations for multiple months
- Data validation rules and constraints
- Export to additional formats (JSON, Excel)