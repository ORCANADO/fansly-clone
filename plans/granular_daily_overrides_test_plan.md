# Granular Daily Overrides Test Plan

## Overview
This test plan validates the implementation of granular daily inputs for the Manual Override system. The system has been refactored from a single monthly total to support daily breakdown inputs while maintaining backward compatibility.

## Test Objectives
1. Verify backward compatibility with existing overrides
2. Validate daily input UI functionality
3. Test real-time calculations and summation
4. Confirm category percentage customization works correctly
5. Ensure data migration from legacy format works properly
6. Validate CSV import/export functionality

## Test Environment
- **Application**: Dashboard VS Code
- **Browser**: Chrome/Edge/Firefox (latest)
- **Test Data**: Existing manual overrides (if any), new test overrides

## Test Cases

### 1. Backward Compatibility Tests
#### TC-1.1: Legacy Override Migration
- **Precondition**: Existing manual override with only `netIncome` property (no `dailyValues`)
- **Steps**:
  1. Load the application
  2. Navigate to Settings → Manual Overrides
  3. Open edit dialog for a month with legacy override
- **Expected Results**:
  - Override loads successfully
  - Daily values grid shows evenly distributed values (monthly total ÷ days in month)
  - Monthly total matches original netIncome
  - Category percentages preserved or defaulted

#### TC-1.2: Mixed Data Migration
- **Precondition**: Storage contains both legacy and new format overrides
- **Steps**:
  1. Clear localStorage
  2. Programmatically add one legacy override and one new format override
  3. Load application
- **Expected Results**:
  - Both overrides load without errors
  - Legacy override migrated to new format
  - New format override remains unchanged

### 2. Daily Input UI Tests
#### TC-2.1: Daily Input Grid Rendering
- **Steps**:
  1. Open EditOverrideDialog for any month
  2. Observe daily inputs grid
- **Expected Results**:
  - Grid displays 28-31 days depending on month
  - Inputs are arranged in responsive columns (2-5 columns based on screen width)
  - Each input has day label (1, 2, 3...)
  - Inputs accept decimal values

#### TC-2.2: Real-time Summation
- **Steps**:
  1. Enter values in multiple daily inputs
  2. Observe monthly total display
- **Expected Results**:
  - Monthly total updates in real-time as values are entered
  - Total matches sum of all daily values
  - Formatting shows currency with 2 decimal places

#### TC-2.3: Quick Actions
- **Steps**:
  1. Enter some values in daily inputs
  2. Click "Clear All" button
  3. Enter a monthly total and click "Distribute Evenly"
- **Expected Results**:
  - "Clear All" sets all daily inputs to 0
  - "Distribute Evenly" divides monthly total evenly across all days
  - Distribution accounts for decimal precision

#### TC-2.4: Input Validation
- **Steps**:
  1. Enter negative values
  2. Enter non-numeric values
  3. Enter very large numbers
- **Expected Results**:
  - Negative values allowed (for adjustments)
  - Non-numeric inputs rejected or converted to 0
  - Large numbers handled without overflow

### 3. Category Percentage Customization Tests
#### TC-3.1: Default Distribution
- **Steps**:
  1. Open EditOverrideDialog
  2. Don't modify category percentages
  3. Enter daily values
  4. Save override
- **Expected Results**:
  - Default distribution (58/21/8/13) applied
  - Category breakdown shown in preview
  - Saved override includes default percentages

#### TC-3.2: Custom Percentage Adjustment
- **Steps**:
  1. Open EditOverrideDialog
  2. Adjust category sliders to custom values (e.g., 54/26/13/7)
  3. Enter daily values
  4. Save override
- **Expected Results**:
  - Custom percentages applied to daily values
  - Total percentages sum to 100%
  - Saved override includes custom `categoryPercentages`

#### TC-3.3: Percentage Validation
- **Steps**:
  1. Set percentages that don't sum to 100%
  2. Try to save
- **Expected Results**:
  - System auto-adjusts to sum to 100% OR
  - Shows validation error preventing save

### 4. Data Generation Tests
#### TC-4.1: Daily Data Generation
- **Steps**:
  1. Create override with varied daily values
  2. Save override
  3. View dashboard for that month
- **Expected Results**:
  - Daily chart shows exact daily values (no noise)
  - Category breakdown matches percentages applied to each day
  - Gross income calculated correctly (netIncome × 1.25)

#### TC-4.2: Mixed Zero and Non-zero Days
- **Steps**:
  1. Create override with some days = 0, others with values
  2. Save and view dashboard
- **Expected Results**:
  - Zero days show no earnings in chart
  - Category distribution only applied to non-zero days
  - Monthly total excludes zero days

### 5. Storage Operations Tests
#### TC-5.1: Save and Load
- **Steps**:
  1. Create new override with daily values
  2. Save override
  3. Refresh page
  4. Load same override
- **Expected Results**:
  - All daily values preserved
  - Category percentages preserved
  - Monthly total matches original

#### TC-5.2: CSV Import
- **Steps**:
  1. Prepare CSV with monthly total
  2. Import via CSV import feature
  3. Check created override
- **Expected Results**:
  - Override created with dailyValues evenly distributed
  - Monthly total matches CSV value
  - Default category percentages applied

#### TC-5.3: CSV Export
- **Steps**:
  1. Create override with daily values
  2. Export to CSV
  3. Examine exported file
- **Expected Results**:
  - CSV includes monthly total (sum of daily values)
  - Format compatible with re-import

### 6. Integration Tests
#### TC-6.1: Statements Component Integration
- **Steps**:
  1. Create manual override for a month
  2. Navigate to Statements view
  3. Expand that month
- **Expected Results**:
  - Statement shows correct netIncome from override
  - Gross income calculated correctly
  - Chart shows daily values from override

#### TC-6.2: Management Dashboard Integration
- **Steps**:
  1. Create multiple overrides
  2. View ManagementDashboard
- **Expected Results**:
  - All overrides listed correctly
  - Monthly totals displayed
  - Edit functionality works for each override

### 7. Edge Cases
#### TC-7.1: Leap Year February
- **Steps**:
  1. Create override for February 2024 (leap year)
  2. Enter daily values
- **Expected Results**:
  - 29 days displayed in grid
  - Calculations work correctly

#### TC-7.2: Decimal Precision
- **Steps**:
  1. Enter values with many decimal places (e.g., 123.456789)
  2. Save and reload
- **Expected Results**:
  - Values rounded to 2 decimal places for display
  - Internal calculations maintain precision

#### TC-7.3: Large Number of Overrides
- **Steps**:
  1. Create overrides for 12 consecutive months
  2. Load application
- **Expected Results**:
  - All overrides load without performance issues
  - Migration handles all legacy data efficiently

## Test Data Preparation

### Sample Test Overrides
1. **Legacy Override**: `{ netIncome: 10000, grossIncome: 12500, categories: {...}, note: "Legacy" }`
2. **New Format Override**: With daily values for each day
3. **Mixed Values Override**: Some days = 0, others with varying amounts
4. **Custom Percentage Override**: With non-default category distribution

### CSV Test Files
1. `test_import.csv` with columns: `month,netIncome`
2. Multiple rows with different monthly totals

## Test Execution

### Manual Testing Steps
1. **Setup**: Clear browser localStorage or use incognito mode
2. **Migration Test**: Add legacy override via browser console, then load app
3. **UI Testing**: Navigate through all dialog interactions
4. **Data Validation**: Verify calculations match expected results
5. **Integration**: Test across all dashboard components

### Automated Test Script
The existing `test_granular_overrides.js` script covers:
- Migration logic verification
- Data generation correctness
- Helper function validation

## Success Criteria
- All test cases pass
- No TypeScript compilation errors
- No console errors in browser
- UI responsive and user-friendly
- Backward compatibility maintained
- Performance acceptable (< 2s load time with 12 overrides)

## Risk Assessment
- **Low Risk**: Daily input UI changes
- **Medium Risk**: Data migration logic
- **High Risk**: Backward compatibility breaking existing overrides

## Rollback Plan
If critical issues found:
1. Revert to previous implementation
2. Restore from backup if data corrupted
3. Clear localStorage to trigger fresh migration

## Sign-off
- [ ] Development team verification
- [ ] QA team testing completion
- [ ] Product owner acceptance
- [ ] Documentation updated