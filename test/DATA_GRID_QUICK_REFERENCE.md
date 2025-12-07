# DATA GRID REFACTOR - QUICK TEST REFERENCE

## Quick Copy-Paste Tests

### 1. Basic Backward Compatibility Test (30 seconds)
```yaml
type: custom:lcards-data-grid
data_mode: random
format: hex
grid:
  rows: 8
  columns: 12
  gap: 8
```
**Expected:** Grid renders, deprecation warning in console

---

### 2. CSS Grid Property Test (30 seconds)
```yaml
type: custom:lcards-data-grid
data_mode: random
format: mixed
grid:
  grid-template-columns: repeat(12, 1fr)
  gap: 12px
style:
  color: colors.grid.cellText
```
**Expected:** Grid renders, NO deprecation warning

---

### 3. Hierarchical Styling Test (1 minute)
```yaml
type: custom:lcards-data-grid
data_mode: template
grid:
  grid-template-columns: 1fr 1fr 1fr
  gap: 8px
style:
  color: colors.grid.cellText
rows:
  - values: ['Cell 1', 'Cell 2', 'Cell 3']
    cellStyles:
      - color: colors.lcars.blue
        font_weight: 700
      - color: colors.lcars.orange
        font_weight: 700
      - color: colors.lcars.red
        font_weight: 700
```
**Expected:** Three cells with different colors

---

### 4. Theme Token Test (30 seconds)
```yaml
type: custom:lcards-data-grid
data_mode: random
format: hex
grid:
  grid-template-columns: repeat(10, 1fr)
  gap: 8px
style:
  color: colors.grid.cellText
  background: alpha(colors.lcars.blue, 0.1)
```
**Expected:** Blue tinted background on cells

---

### 5. Full Integration Test (2 minutes)
```yaml
type: custom:lcards-data-grid
data_mode: template
grid:
  grid-template-columns: 140px 1fr 80px
  gap: 10px
style:
  font_size: 16
  color: colors.grid.cellText
  padding: 8px
rows:
  - values: ['System', 'Status', 'Power']
    style:
      background: colors.grid.headerBackground
      color: colors.grid.headerText
      font_weight: 700
  - values: ['Computer', 'ONLINE', '100W']
    cellStyles:
      - color: colors.lcars.blue
        font_weight: 600
      - color: colors.grid.success
        font_weight: 600
      - color: colors.lcars.orange
animation:
  type: cascade
  pattern: fast
  colors:
    start: colors.grid.cascadeStart
    text: colors.grid.cascadeMid
    end: colors.grid.cascadeEnd
```
**Expected:** Styled table with headers, colors, and cascade animation

---

## Console Checks

### Check for Deprecation Warning
1. Open DevTools (F12)
2. Go to Console tab
3. Look for: `[LCARdSDataGrid] Shorthand grid config...`

### Check for Errors
Look for any red error messages in console - there should be NONE

### Check Performance
1. Open DevTools Performance tab
2. Record while adding card
3. Look for render times < 100ms for standard grids

---

## Visual Validation

### ✅ Correct Appearance
- Grid cells aligned properly
- Colors match theme
- Text readable
- Gaps consistent
- Animations smooth

### ❌ Issues to Report
- Misaligned cells
- Wrong colors
- Missing text
- Console errors
- Poor performance

---

## File Reference

| Test File | Focus Area | Time |
|-----------|------------|------|
| `test-data-grid-basic.yaml` | Backward compatibility | 2 min |
| `test-data-grid-css-grid.yaml` | CSS Grid properties | 5 min |
| `test-data-grid-hierarchical-styling.yaml` | Style cascade | 10 min |
| `test-data-grid-theme-tokens.yaml` | Theme integration | 5 min |
| `test-data-grid-comprehensive.yaml` | Full integration | 15 min |

**Total Testing Time:** ~40 minutes for complete coverage

---

## Need Help?

See `DATA_GRID_REFACTOR_TESTING_GUIDE.md` for detailed instructions.
