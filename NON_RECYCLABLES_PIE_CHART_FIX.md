# Non-Recyclables Added Back to Pie Chart

## Issue
The pie chart was only showing recyclable materials and filtering out non-recyclable data.

## Fix Applied
Re-added non-recyclable data to both Dashboard.tsx and SCADADashboard.tsx pie charts:

### Changes Made:
1. **Updated chart title**: "Recyclable Materials Breakdown" → "Category Breakdown"
2. **Added Non-Recyclables category**: Added back to `groupedData` object
3. **Included non-recyclable processing**: Added `nonRecyclableCategories` array and processing logic
4. **Added red color**: `'Non-Recyclables': '#F44336'` for visual distinction

### Data Processing:
```typescript
const groupedData = {
  'Plastics': 0,
  'Metals': 0,
  'Paper': 0,
  'Glass': 0,
  'Non-Recyclables': 0  // ← Added back
};

// Now processes all categories including non-recyclable
Object.entries(displayData.categoryTotals).forEach(([category, weight]) => {
  // ... existing logic for recyclables ...
  } else if (nonRecyclableCategories.includes(category)) {
    groupedData['Non-Recyclables'] += weightNum;  // ← Added back
  }
});
```

## Result
The pie chart now displays ALL entries including:
- ✅ Plastics (PET, HDPE, LDPE, PP, PS)
- ✅ Metals (Tin, Aluminum, Copper)  
- ✅ Paper (Cardboard)
- ✅ Glass
- ✅ **Non-Recyclables** (restored)

All waste entries are now properly represented on the pie chart with complete category breakdown.