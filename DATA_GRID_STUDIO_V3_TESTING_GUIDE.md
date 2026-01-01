# Data Grid Configuration Studio V3 - Testing Guide

## Critical Fixes Implemented

This V3 redesign addresses the **fundamental architectural flaw** where the preview card didn't update when configuration changed.

### Root Cause (FIXED)
- **OLD**: Preview rendered as Lit child element → didn't detect deep config mutations
- **NEW**: Manual card instantiation with `createRef()` → 100% reliable updates

## Testing Checklist

### 1. Preview Update Tests (CRITICAL)

**Test Scenario 1: Data Mode Changes**
1. Open Data Grid Configuration Studio
2. Go to Data tab → Mode & Source sub-tab
3. Change data_mode from "Random" to "Template"
4. **VERIFY**: Preview updates immediately showing empty grid (no template rows)
5. Change to "DataSource"
6. **VERIFY**: Preview updates immediately

**Test Scenario 2: Grid Layout Changes**
1. Go to Data tab → Grid Layout sub-tab
2. Change "Grid Template Columns" to `repeat(8, 1fr)`
3. **VERIFY**: Preview updates immediately showing 8 columns
4. Change "Gap" to `16px`
5. **VERIFY**: Preview updates immediately with larger spacing
6. Toggle "Expert Grid Mode" on
7. Change "Justify Items" to "center"
8. **VERIFY**: Preview updates immediately

**Test Scenario 3: Appearance Changes**
1. Go to Appearance tab → Typography sub-tab
2. Change "Font Size" to `24`
3. **VERIFY**: Preview updates immediately with larger text
4. Go to Colors sub-tab
5. Change "Text Color" to red
6. **VERIFY**: Preview updates immediately with red text
7. Go to Borders sub-tab
8. Set "Border Width" to `2`
9. **VERIFY**: Preview updates immediately with borders

**Test Scenario 4: Animation Changes**
1. Go to Animation tab → Cascade sub-tab
2. Change "Animation Type" to "cascade"
3. **VERIFY**: Preview starts cascade animation immediately
4. Change "Start Color" to blue
5. **VERIFY**: Preview cascade animation uses new color
6. Go to Change Detection sub-tab
7. Toggle "Highlight Changes" on
8. **VERIFY**: Config updates (no visual change expected in static preview)

**Test Scenario 5: Rapid Changes**
1. Go to Appearance → Typography
2. Rapidly change Font Size: 14 → 18 → 24 → 16
3. **VERIFY**: Preview updates for each change without lag or missing updates
4. Go to Data → Grid Layout
5. Rapidly change Gap: 4px → 8px → 12px → 8px
6. **VERIFY**: Preview updates for each change

### 2. Tab Navigation Tests

**Test Scenario 6: Main Tab Navigation**
1. Click each main tab: Data → Appearance → Animation → Advanced
2. **VERIFY**: Tab content changes correctly
3. **VERIFY**: Preview remains visible and doesn't reset
4. **VERIFY**: Active tab has proper visual indicator

**Test Scenario 7: Sub-Tab Navigation**
1. Go to Data tab
2. Click through: Mode & Source → Grid Layout → Data Configuration
3. **VERIFY**: Sub-tab content changes
4. **VERIFY**: No console errors about event bubbling
5. Go to Appearance tab
6. Click through all 4 sub-tabs
7. **VERIFY**: Content switches correctly
8. Go to Animation tab
9. Click through 2 sub-tabs
10. **VERIFY**: Content switches correctly
11. Go to Advanced tab
12. Click through 3 sub-tabs
13. **VERIFY**: Content switches correctly

**Test Scenario 8: Nested Tab Event Propagation**
1. Open browser console (F12)
2. Go to Data tab
3. Click sub-tabs rapidly
4. **VERIFY**: No errors about "Cannot read property of undefined"
5. **VERIFY**: Main tab doesn't switch when clicking sub-tabs
6. **VERIFY**: Only one sub-tab is active at a time

### 3. Save/Cancel Tests

**Test Scenario 9: Save Changes**
1. Make multiple changes across different tabs
   - Change data_mode to "random"
   - Set format to "hex"
   - Change font size to 20
   - Set text color to blue
2. Click "Save Configuration"
3. **VERIFY**: Dialog closes
4. **VERIFY**: Main editor shows updated config
5. Re-open studio
6. **VERIFY**: All changes persisted

**Test Scenario 10: Cancel Changes**
1. Make multiple changes
2. Click "Cancel"
3. **VERIFY**: Dialog closes
4. **VERIFY**: Main editor shows original config (changes discarded)

### 4. Validation Tests

**Test Scenario 11: DataSource Validation**
1. Set data_mode to "datasource"
2. Set layout to "timeline"
3. Leave "Data Source" empty
4. Click "Save Configuration"
5. **VERIFY**: Validation error displays: "Timeline layout requires a data source"
6. **VERIFY**: Dialog stays open
7. Fill in "Data Source"
8. Click "Save Configuration"
9. **VERIFY**: Saves successfully

**Test Scenario 12: Template Validation**
1. Set data_mode to "template"
2. Ensure no rows configured
3. Click "Save Configuration"
4. **VERIFY**: Validation error displays: "Template mode requires at least one row"

### 5. Expert Mode Tests

**Test Scenario 13: Expert Grid Mode**
1. Go to Data tab → Grid Layout sub-tab
2. Toggle "Expert Grid Mode" off (default)
3. **VERIFY**: Only basic properties visible (columns, rows, gap)
4. Toggle "Expert Grid Mode" on
5. **VERIFY**: Advanced section appears with 10+ additional CSS Grid properties
6. Change "Grid Auto Flow" to "column"
7. **VERIFY**: Preview updates immediately
8. Change "Justify Content" to "center"
9. **VERIFY**: Preview updates immediately

### 6. Conditional UI Tests

**Test Scenario 14: Header Style Tab (Conditional)**
1. Set data_mode to "random"
2. Go to Appearance tab
3. **VERIFY**: Only 3 sub-tabs visible (Typography, Colors, Borders)
4. **VERIFY**: No "Header Style" sub-tab
5. Set data_mode to "datasource"
6. Set layout to "timeline"
7. **VERIFY**: Still only 3 sub-tabs
8. Set layout to "spreadsheet"
9. **VERIFY**: 4th sub-tab "Header Style" appears
10. Click "Header Style" sub-tab
11. **VERIFY**: Header styling options visible (9 properties)

### 7. Integration Tests

**Test Scenario 15: Round-Trip Config**
1. Create a complex config with all tabs:
   ```yaml
   type: custom:lcards-data-grid
   data_mode: datasource
   layout: spreadsheet
   grid:
     grid-template-columns: repeat(10, 1fr)
     grid-template-rows: repeat(6, auto)
     gap: 12px
   style:
     font_size: 16
     font_family: Antonio
     color: '#FF9900'
     background: 'rgba(0, 0, 0, 0.2)'
     border_width: 1
     border_color: '#996633'
   header_style:
     font_size: 18
     font_weight: 700
     color: '#FFCC99'
     background: '#663300'
   animation:
     type: cascade
     pattern: niagara
     colors:
       start: '#FF9900'
       text: '#FFCC99'
       end: '#996633'
     highlight_changes: true
     change_preset: pulse
   id: my-data-grid
   tags: [monitoring, metrics]
   ```
2. Open Configuration Studio
3. **VERIFY**: All values load correctly in all tabs
4. Make a small change (e.g., font size 16 → 18)
5. Save
6. **VERIFY**: Only changed value updated in YAML
7. **VERIFY**: Preview reflected change

### 8. Performance Tests

**Test Scenario 16: Large Grid Preview**
1. Set grid-template-columns to `repeat(20, 1fr)`
2. Set grid-template-rows to `repeat(15, auto)`
3. Enable cascade animation
4. **VERIFY**: Preview renders without lag
5. Change colors multiple times rapidly
6. **VERIFY**: Preview updates smoothly
7. Monitor browser console for performance warnings

## Known Limitations (By Design)

1. **Template Row Editing**: Not available in Studio V3 - redirects to main editor
2. **Spreadsheet Configuration**: Not available in Studio V3 - redirects to main editor
3. **Custom Animation Timing**: Fallback to YAML tab (complex array editing)

## Success Criteria

✅ Preview updates **100% reliably** on every config change  
✅ Tab navigation works with proper event handling (no bubbling issues)  
✅ Sub-tabs render and navigate correctly in all 4 main tabs  
✅ All schema properties exposed (60+ properties)  
✅ Single config update method (zero dual paths)  
✅ Validation feedback displays correctly  
✅ Theme Browser-level UX consistency  

## Reporting Issues

If you find issues during testing, please report:
1. Exact steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser console errors (if any)
5. Screenshot/video of issue
6. Browser version and HA version

## Technical Details

### Preview Pattern Implementation
```javascript
// Manual card instantiation - NOT Lit child rendering
_updatePreviewCard() {
  // Remove existing card
  while (this._previewRef.value.firstChild) {
    this._previewRef.value.firstChild.remove();
  }
  
  // Create new card instance
  const card = document.createElement('lcards-data-grid');
  card.hass = this.hass;
  
  // Deep clone config to prevent mutations
  const clonedConfig = JSON.parse(JSON.stringify(this._workingConfig));
  card.setConfig(clonedConfig);
  
  // Insert into container
  this._previewRef.value.appendChild(card);
}

// Triggered automatically by Lit when _workingConfig changes
updated(changedProperties) {
  if (changedProperties.has('_workingConfig')) {
    this._updatePreviewCard();
  }
}
```

### Tab Event Handler Pattern
```javascript
_handleMainTabChange(event) {
  event.stopPropagation(); // CRITICAL: Prevent bubbling
  
  const tab = event.target.activeTab?.getAttribute('value');
  if (tab && tab !== this._activeTab) {
    this._activeTab = tab;
  }
}

_handleDataSubTabChange(event) {
  event.stopPropagation(); // CRITICAL for nested tabs
  
  const tab = event.target.activeTab?.getAttribute('value');
  if (tab && tab !== this._dataSubTab) {
    this._dataSubTab = tab;
  }
}
```

### Config Update Pattern
```javascript
_updateConfig(path, value) {
  // Deep clone entire config
  const newConfig = JSON.parse(JSON.stringify(this._workingConfig));
  
  // Navigate path and set value
  const keys = path.split('.');
  const lastKey = keys.pop();
  let target = newConfig;
  
  for (const key of keys) {
    if (!target[key]) target[key] = {};
    target = target[key];
  }
  
  target[lastKey] = value;
  
  // Atomic assignment - triggers Lit reactivity
  this._workingConfig = newConfig;
}
```

This pattern ensures:
- ✅ Lit detects the change (new object reference)
- ✅ `updated()` lifecycle hook fires
- ✅ Preview card re-renders automatically
- ✅ 100% reliable updates
