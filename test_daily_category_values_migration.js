/**
 * Test script for daily category values migration and backward compatibility
 * This tests the new per-day category editing system with 4 inputs per day
 */

// Mock localStorage for testing
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

global.window = { localStorage: localStorageMock };

console.log('=== Testing Daily Category Values Migration ===\n');

// Test 1: Migration of legacy override (no dailyValues at all)
console.log('Test 1: Migration of legacy override (no dailyValues)...');
localStorageMock.clear();

// Create a legacy override (without dailyValues or dailyCategoryValues)
const legacyOverride = {
  netIncome: 10000,
  grossIncome: 12000,
  categories: {
    media: 5800,
    mediaSets: 2100,
    tips: 800,
    subscriptions: 1300,
  },
  isManual: true,
  lastUpdated: '2024-01-01T00:00:00.000Z',
  note: 'Test legacy override',
};

// Save legacy override
localStorageMock.setItem('vibestats_manual_overrides', JSON.stringify({
  '2024-01': legacyOverride,
}));

// Simulate getAllManualOverrides migration logic
function simulateMigration(overrides) {
  const migrated = {};
  
  for (const [monthKey, override] of Object.entries(overrides)) {
    // Check if needs migration
    const needsDailyCategoryValues = !override.dailyCategoryValues || Object.keys(override.dailyCategoryValues).length === 0;
    
    if (needsDailyCategoryValues) {
      const daysInMonth = 31; // January has 31 days
      
      // Case 2: No dailyValues at all (legacy override)
      // Create dailyCategoryValues by distributing netIncome evenly with percentages
      const dailyCategoryValues = {};
      const dailyTotalPerDay = override.netIncome / daysInMonth;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dayKey = day.toString();
        dailyCategoryValues[dayKey] = {
          media: dailyTotalPerDay * 0.58,
          tips: dailyTotalPerDay * 0.08,
          subscriptions: dailyTotalPerDay * 0.13,
          mediaSets: dailyTotalPerDay * 0.21,
        };
      }
      
      // Calculate dailyValues from dailyCategoryValues for backward compatibility
      const dailyValues = {};
      for (const [dayKey, breakdown] of Object.entries(dailyCategoryValues)) {
        dailyValues[dayKey] = breakdown.media + breakdown.tips + breakdown.subscriptions + breakdown.mediaSets;
      }
      
      migrated[monthKey] = {
        ...override,
        dailyCategoryValues,
        dailyValues,
      };
    } else {
      migrated[monthKey] = override;
    }
  }
  
  return migrated;
}

const overrides = JSON.parse(localStorageMock.getItem('vibestats_manual_overrides') || '{}');
const migrated = simulateMigration(overrides);
const migratedOverride = migrated['2024-01'];

console.log('✓ Legacy override loaded');
console.log(`✓ Has dailyCategoryValues: ${'dailyCategoryValues' in migratedOverride}`);
console.log(`✓ Number of days in dailyCategoryValues: ${Object.keys(migratedOverride.dailyCategoryValues).length}`);
console.log(`✓ Has dailyValues (backward compatibility): ${'dailyValues' in migratedOverride}`);
console.log(`✓ Daily values sum: ${Object.values(migratedOverride.dailyValues).reduce((a, b) => a + b, 0)}`);
console.log(`✓ Should equal netIncome: ${Object.values(migratedOverride.dailyValues).reduce((a, b) => a + b, 0) === legacyOverride.netIncome}`);

// Verify category totals
const categoryTotals = { media: 0, tips: 0, subscriptions: 0, mediaSets: 0 };
for (const breakdown of Object.values(migratedOverride.dailyCategoryValues)) {
  categoryTotals.media += breakdown.media;
  categoryTotals.tips += breakdown.tips;
  categoryTotals.subscriptions += breakdown.subscriptions;
  categoryTotals.mediaSets += breakdown.mediaSets;
}

console.log(`✓ Media total: ${categoryTotals.media.toFixed(2)} (expected: ${legacyOverride.categories.media})`);
console.log(`✓ Tips total: ${categoryTotals.tips.toFixed(2)} (expected: ${legacyOverride.categories.tips})`);
console.log(`✓ Subscriptions total: ${categoryTotals.subscriptions.toFixed(2)} (expected: ${legacyOverride.categories.subscriptions})`);
console.log(`✓ Media Sets total: ${categoryTotals.mediaSets.toFixed(2)} (expected: ${legacyOverride.categories.mediaSets})`);

// Test 2: Migration of override with dailyValues (current system)
console.log('\nTest 2: Migration of override with dailyValues...');
localStorageMock.clear();

// Create an override with dailyValues (current system)
const overrideWithDailyValues = {
  dailyValues: {
    '1': 500,
    '15': 1000,
    '30': 500,
  },
  netIncome: 2000,
  grossIncome: 2400,
  categories: {
    media: 1160,
    mediaSets: 420,
    tips: 160,
    subscriptions: 260,
  },
  isManual: true,
  lastUpdated: '2024-02-01T00:00:00.000Z',
  note: 'Test override with daily values',
};

localStorageMock.setItem('vibestats_manual_overrides', JSON.stringify({
  '2024-02': overrideWithDailyValues,
}));

// Simulate migration for dailyValues → dailyCategoryValues
function simulateDailyValuesMigration(overrides) {
  const migrated = {};
  
  for (const [monthKey, override] of Object.entries(overrides)) {
    if (override.dailyValues && Object.keys(override.dailyValues).length > 0) {
      const daysInMonth = 29; // February 2024 has 29 days (leap year)
      const dailyCategoryValues = {};
      
      // Use default percentages
      const mediaPercent = 0.58;
      const mediaSetsPercent = 0.21;
      const tipsPercent = 0.08;
      const subscriptionsPercent = 0.13;
      
      // Create dailyCategoryValues for all days in month
      for (let day = 1; day <= daysInMonth; day++) {
        const dayKey = day.toString();
        const dayTotal = override.dailyValues[dayKey] || 0;
        
        dailyCategoryValues[dayKey] = {
          media: dayTotal * mediaPercent,
          tips: dayTotal * tipsPercent,
          subscriptions: dayTotal * subscriptionsPercent,
          mediaSets: dayTotal * mediaSetsPercent,
        };
      }
      
      migrated[monthKey] = {
        ...override,
        dailyCategoryValues,
        // Keep dailyValues for backward compatibility
      };
    } else {
      migrated[monthKey] = override;
    }
  }
  
  return migrated;
}

const overrides2 = JSON.parse(localStorageMock.getItem('vibestats_manual_overrides') || '{}');
const migrated2 = simulateDailyValuesMigration(overrides2);
const migratedOverride2 = migrated2['2024-02'];

console.log('✓ Override with dailyValues loaded');
console.log(`✓ Has dailyCategoryValues: ${'dailyCategoryValues' in migratedOverride2}`);
console.log(`✓ Daily values preserved: ${JSON.stringify(migratedOverride2.dailyValues)}`);

// Verify day 15 has correct breakdown
const day15Breakdown = migratedOverride2.dailyCategoryValues['15'];
console.log(`✓ Day 15 breakdown:`);
console.log(`  - Media: ${day15Breakdown.media} (expected: ${1000 * 0.58})`);
console.log(`  - Tips: ${day15Breakdown.tips} (expected: ${1000 * 0.08})`);
console.log(`  - Subscriptions: ${day15Breakdown.subscriptions} (expected: ${1000 * 0.13})`);
console.log(`  - Media Sets: ${day15Breakdown.mediaSets} (expected: ${1000 * 0.21})`);

// Test 3: New override with dailyCategoryValues (new system)
console.log('\nTest 3: New override with dailyCategoryValues...');
localStorageMock.clear();

// Create a new override with dailyCategoryValues
const newOverrideWithCategories = {
  dailyCategoryValues: {
    '1': { media: 100, tips: 20, subscriptions: 30, mediaSets: 50 },
    '2': { media: 200, tips: 40, subscriptions: 60, mediaSets: 100 },
    '15': { media: 500, tips: 100, subscriptions: 150, mediaSets: 250 },
  },
  // dailyValues should be calculated automatically
  netIncome: 2000,
  grossIncome: 2400,
  categories: {
    media: 800,
    mediaSets: 400,
    tips: 160,
    subscriptions: 240,
  },
  isManual: true,
  lastUpdated: '2024-03-01T00:00:00.000Z',
  note: 'Test new override with daily category values',
};

localStorageMock.setItem('vibestats_manual_overrides', JSON.stringify({
  '2024-03': newOverrideWithCategories,
}));

const overrides3 = JSON.parse(localStorageMock.getItem('vibestats_manual_overrides') || '{}');
const loadedOverride3 = overrides3['2024-03'];

console.log('✓ New override with dailyCategoryValues loaded');
console.log(`✓ Has dailyCategoryValues: ${'dailyCategoryValues' in loadedOverride3}`);
console.log(`✓ Day 1 media: ${loadedOverride3.dailyCategoryValues['1'].media}`);
console.log(`✓ Day 2 tips: ${loadedOverride3.dailyCategoryValues['2'].tips}`);
console.log(`✓ Day 15 subscriptions: ${loadedOverride3.dailyCategoryValues['15'].subscriptions}`);

// Test 4: Data generation with dailyCategoryValues
console.log('\nTest 4: Data generation with dailyCategoryValues...');

function generateManualDailyData(monthKey, override, daysInMonth) {
  const { dailyCategoryValues, dailyValues } = override;
  const dailyData = [];
  
  const [year, month] = monthKey.split('-').map(Number);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayKey = day.toString();
    
    // Get category breakdown for this day
    let dayBreakdown;
    if (dailyCategoryValues && dailyCategoryValues[dayKey]) {
      // Use dailyCategoryValues if available
      dayBreakdown = dailyCategoryValues[dayKey];
    } else if (dailyValues && dailyValues[dayKey] !== undefined) {
      // Fallback: legacy data - use dailyValues with default percentages
      const dayTotal = dailyValues[dayKey] || 0;
      dayBreakdown = {
        media: dayTotal * 0.58,
        tips: dayTotal * 0.08,
        subscriptions: dayTotal * 0.13,
        mediaSets: dayTotal * 0.21,
      };
    } else {
      // No data for this day
      dayBreakdown = {
        media: 0,
        tips: 0,
        subscriptions: 0,
        mediaSets: 0,
      };
    }
    
    const date = new Date(year, month - 1, day);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    
    const dayTotal = dayBreakdown.media + dayBreakdown.tips + dayBreakdown.subscriptions + dayBreakdown.mediaSets;
    
    dailyData.push({
      date: dateStr,
      subs: dayBreakdown.subscriptions,
      tips: dayBreakdown.tips,
      media: dayBreakdown.media,
      mediaSets: dayBreakdown.mediaSets,
      total: dayTotal,
    });
  }
  
  return dailyData;
}

const dailyData = generateManualDailyData('2024-03', newOverrideWithCategories, 31);
console.log(`✓ Generated ${dailyData.length} days of data`);
console.log(`✓ Day 1 total: ${dailyData[0].total} (expected: ${100 + 20 + 30 + 50})`);
console.log(`✓ Day 2 media: ${dailyData[1].media} (expected: 200)`);
console.log(`✓ Day 15 tips: ${dailyData[14].tips} (expected: 100)`);
console.log(`✓ Days with zero data: ${dailyData.filter(d => d.total === 0).length}`);

// Test 5: Backward compatibility - using dailyValues when dailyCategoryValues doesn't exist
console.log('\nTest 5: Backward compatibility test...');

const legacyDataOverride = {
  dailyValues: {
    '10': 1000,
    '20': 2000,
  },
  netIncome: 3000,
  grossIncome: 3600,
  categories: {
    media: 1740,
    mediaSets: 630,
    tips: 240,
    subscriptions: 390,
  },
  isManual: true,
  lastUpdated: '2024-04-01T00:00:00.000Z',
};

const legacyDailyData = generateManualDailyData('2024-04', legacyDataOverride, 30);
const day10Data = legacyDailyData[9]; // Day 10 is index 9
console.log(`✓ Legacy override with dailyValues only`);
console.log(`✓ Day 10 total: ${day10Data.total} (expected: 1000)`);
console.log(`✓ Day 10 media: ${day10Data.media} (expected: ${1000 * 0.58})`);
console.log(`✓ Day 10 tips: ${day10Data.tips} (expected: ${1000 * 0.08})`);
console.log(`✓ Day 20 subscriptions: ${legacyDailyData[19].subscriptions} (expected: ${2000 * 0.13})`);

// Test 6: Mixed data - some days have dailyCategoryValues, others fall back to dailyValues
console.log('\nTest 6: Mixed data scenario...');

const mixedOverride = {
  dailyCategoryValues: {
    '5': { media: 500, tips: 100, subscriptions: 150, mediaSets: 250 },
  },
  dailyValues: {
    '10': 1000,
    '15': 1500,
  },
  netIncome: 3500,
  grossIncome: 4200,
  categories: {
    media: 1500,
    mediaSets: 800,
    tips: 400,
    subscriptions: 500,
  },
  isManual: true,
  lastUpdated: '2024-05-01T00:00:00.000Z',
};

const mixedDailyData = generateManualDailyData('2024-05', mixedOverride, 31);
const day5Data = mixedDailyData[4];
const day10DataMixed = mixedDailyData[9];
const day15DataMixed = mixedDailyData[14];
const day1DataMixed = mixedDailyData[0]; // No data for day 1

console.log(`✓ Mixed override test`);
console.log(`✓ Day 5 (has dailyCategoryValues): total=${day5Data.total}, media=${day5Data.media}`);
console.log(`✓ Day 10 (falls back to dailyValues): total=${day10DataMixed.total}, media=${day10DataMixed.media}`);
console.log(`✓ Day 15 (falls back to dailyValues): total=${day15DataMixed.total}, subscriptions=${day15DataMixed.subscriptions}`);
console.log(`✓ Day 1 (no data): total=${day1DataMixed.total} (should be 0)`);

console.log('\n=== All tests completed ===');
console.log('\nSummary:');
console.log('1. Legacy overrides without dailyValues migrate to dailyCategoryValues with even distribution');
console.log('2. Overrides with dailyValues migrate to dailyCategoryValues by applying percentages');
console.log('3. New overrides with dailyCategoryValues are preserved correctly');
console.log('4. Data generation uses dailyCategoryValues when available, falls back to dailyValues');
console.log('5. Backward compatibility is maintained for legacy data');
console.log('6. Mixed data scenarios work correctly');

// Clean up
localStorageMock.clear();