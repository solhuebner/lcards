# Data Grid Refactor - Interactive Testing Guide

This guide provides step-by-step instructions for testing all new functionality added in the data-grid refactor, including hierarchical styling, standard CSS Grid properties, and theme token integration.

## Quick Start

1. **Build and deploy:**
   ```bash
   cd /path/to/lcards
   npm run build
   cp dist/lcards.js /path/to/homeassistant/www/community/lcards/
   ```

2. **Hard refresh your browser:**
   - Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

3. **Add test card:**
   - Go to Home Assistant dashboard
   - Add a Manual Card (YAML mode)
   - Copy-paste configurations from test files below

---

## Test Files Overview

| File | Purpose | Test Duration |
|------|---------|---------------|
| `test-data-grid-basic.yaml` | Verify basic functionality still works | 2 min |
| `test-data-grid-css-grid.yaml` | Test standard CSS Grid properties | 5 min |
| `test-data-grid-hierarchical-styling.yaml` | Test style cascade system | 10 min |
| `test-data-grid-theme-tokens.yaml` | Test theme token integration | 5 min |
| `test-data-grid-comprehensive.yaml` | All features combined | 15 min |

---

## Test 1: Basic Functionality (Backward Compatibility)

**File:** `test-data-grid-basic.yaml`  
**Goal:** Verify that existing configurations still work with backward compatibility

### Test Steps

1. Add the card from `test-data-grid-basic.yaml`
2. Verify the following:
   - ✅ Grid renders with 8 rows × 12 columns
   - ✅ Random data displays correctly
   - ✅ No console errors appear
   - ✅ Deprecation warning appears in console (check DevTools)

### Expected Console Warning
```
[LCARdSDataGrid] Shorthand grid config (rows, columns, gap, cell_width) is deprecated.
Use standard CSS Grid properties (grid-template-columns, grid-template-rows, gap) instead.
See documentation: doc/user/configuration/cards/data-grid.md#grid-configuration
```

### Expected Appearance
- Grid with hexadecimal values
- Blue-tinted text (theme default)
- 8 pixel gaps between cells
- Right-aligned text

---

## Test 2: Standard CSS Grid Properties

**File:** `test-data-grid-css-grid.yaml`  
**Goal:** Test all standard CSS Grid property support

### Test 2.1: Basic CSS Grid Properties
1. Add Card 1 from test file
2. Verify:
   - ✅ 12 columns of equal width (1fr each)
   - ✅ 6 rows with auto height
   - ✅ 12px gap between cells
   - ✅ No deprecation warning in console

### Test 2.2: Advanced Grid Properties
1. Add Card 2 from test file
2. Verify:
   - ✅ Mixed column widths (narrow-wide-narrow pattern)
   - ✅ Larger 16px gap
   - ✅ Column auto-flow behavior

### Test 2.3: Named Grid Areas
1. Add Card 3 from test file
2. Verify:
   - ✅ Grid uses named areas if configured
   - ✅ Content spans correctly across areas

### Expected Appearance
Each card should show a distinct grid layout demonstrating the CSS Grid property being tested.

---

## Test 3: Hierarchical Cell Styling

**File:** `test-data-grid-hierarchical-styling.yaml`  
**Goal:** Test complete style cascade (Grid → Header → Column → Row → Cell)

### Test 3.1: Grid-Wide Styling
1. Add Card 1 (Grid-Wide Style)
2. Verify:
   - ✅ All cells have orange text
   - ✅ Font size is 20px
   - ✅ Font weight is 500 (medium)
   - ✅ Padding is 12px
   - ✅ Border is visible around cells

### Test 3.2: Column-Level Overrides (Spreadsheet Mode)
1. Add Card 2 (Column Overrides)
2. Verify:
   - ✅ First column: Blue text, bold (700), left-aligned
   - ✅ Second column: Orange text, center-aligned
   - ✅ Third column: Green text, right-aligned
   - ✅ Header row has distinct styling

### Test 3.3: Row-Level Overrides (Template Mode)
1. Add Card 3 (Row Overrides)
2. Verify:
   - ✅ Row 1 (header): Dark background, white text, uppercase
   - ✅ Row 2 (normal): Default grid styling
   - ✅ Row 3 (alert): Red background, red text, bold

### Test 3.4: Cell-Level Overrides (Template Mode)
1. Add Card 4 (Cell Overrides)
2. Verify:
   - ✅ First cell in each row: Different color per row
   - ✅ Second cell: Uses row styling
   - ✅ Third cell: Individual cell styling

### Test 3.5: Complex Hierarchy (All Levels)
1. Add Card 5 (Complete Hierarchy)
2. Verify:
   - ✅ Grid default applies to all cells initially
   - ✅ Column styles override grid defaults
   - ✅ Row styles override column styles
   - ✅ Cell styles override everything (highest priority)

### Expected Appearance
You should clearly see the style cascade in action - each level overriding the previous with increasing specificity.

---

## Test 4: Theme Token Integration

**File:** `test-data-grid-theme-tokens.yaml`  
**Goal:** Verify theme tokens resolve correctly

### Test 4.1: Grid Theme Tokens
1. Add Card 1 (Grid Tokens)
2. Verify:
   - ✅ Cell text uses `colors.grid.cellText` (blue)
   - ✅ Cell background uses `colors.grid.cellBackground` (transparent)
   - ✅ Header background uses `colors.grid.headerBackground` (dark)
   - ✅ Header text uses `colors.grid.headerText` (light)
   - ✅ Divider uses `colors.grid.divider`

### Test 4.2: Generic Theme Tokens
1. Add Card 2 (Generic Tokens)
2. Verify:
   - ✅ Uses `colors.text.primary` for cell text
   - ✅ Uses `colors.background.header` for headers
   - ✅ Uses `colors.divider` for borders

### Test 4.3: LCARS Color Tokens
1. Add Card 3 (LCARS Tokens)
2. Verify:
   - ✅ Uses `colors.lcars.blue`, `colors.lcars.orange`, `colors.lcars.red`
   - ✅ Colors match LCARS theme palette

### Test 4.4: Computed Tokens
1. Add Card 4 (Computed Tokens)
2. Verify:
   - ✅ `alpha()` function works for transparency
   - ✅ `darken()` function works for darker shades
   - ✅ `lighten()` function works for lighter shades

### Test 4.5: Theme Switching
1. Change Home Assistant theme (if multiple LCARS themes installed)
2. Verify:
   - ✅ Grid colors update to match new theme
   - ✅ All token references resolve correctly
   - ✅ No console errors

### Expected Appearance
Colors should match the active theme's palette. When switching themes, colors should update automatically.

---

## Test 5: Comprehensive Integration

**File:** `test-data-grid-comprehensive.yaml`  
**Goal:** Test all features working together

### Test 5.1: Random Mode + Styling + CSS Grid
1. Add Card 1
2. Verify all features work together:
   - ✅ Standard CSS Grid layout
   - ✅ Hierarchical styling applied
   - ✅ Theme tokens resolved
   - ✅ Cascade animation works
   - ✅ Change detection works (if enabled)

### Test 5.2: Template Mode + Full Hierarchy
1. Add Card 2
2. Verify:
   - ✅ Template evaluation works
   - ✅ Entity states display correctly
   - ✅ Per-cell styling works
   - ✅ Theme tokens in templates work

### Test 5.3: Spreadsheet Mode + Data Sources
1. Add Card 3 (requires data sources configured)
2. Verify:
   - ✅ Column headers display
   - ✅ Data sources populate cells
   - ✅ Column-level styling works
   - ✅ Header styling distinct from cells

### Test 5.4: Performance Test (Large Grid)
1. Add Card 4 (20 rows × 20 columns)
2. Verify:
   - ✅ Renders without lag
   - ✅ Style cache prevents recalculation
   - ✅ No console performance warnings
   - ✅ Smooth interactions

---

## Validation Checklist

Use this checklist to track your testing progress:

### ✅ Backward Compatibility
- [ ] Old shorthand config (`rows`, `columns`) still works
- [ ] Deprecation warning appears in console
- [ ] Existing dashboards don't break
- [ ] All data modes work (random, template, datasource)

### ✅ CSS Grid Properties
- [ ] `grid-template-columns` works
- [ ] `grid-template-rows` works
- [ ] `gap` works
- [ ] `grid-auto-flow` works
- [ ] `justify-items` works
- [ ] `align-items` works
- [ ] Complex layouts (minmax, named areas) work

### ✅ Hierarchical Styling
- [ ] Grid-wide style applies to all cells
- [ ] Header style overrides grid style
- [ ] Column style overrides header style
- [ ] Row style overrides column style
- [ ] Cell style overrides row style (highest priority)
- [ ] Style cache improves performance

### ✅ Theme Tokens
- [ ] `colors.grid.*` tokens work
- [ ] `colors.text.*` tokens work
- [ ] `colors.background.*` tokens work
- [ ] `colors.lcars.*` tokens work
- [ ] Computed tokens (`alpha`, `darken`, `lighten`) work
- [ ] Theme switching updates colors

### ✅ Style Properties
- [ ] `color` property works
- [ ] `background` property works
- [ ] `font_size` property works
- [ ] `font_family` property works
- [ ] `font_weight` property works
- [ ] `text_transform` property works
- [ ] `align` property works
- [ ] `padding` property works
- [ ] `border_width` property works
- [ ] `border_color` property works
- [ ] `border_style` property works
- [ ] Border-side properties work (`border_bottom_width`, etc.)

### ✅ Rendering
- [ ] Cascade grid renders correctly
- [ ] Spreadsheet grid renders correctly
- [ ] Headers render with correct styling
- [ ] Cell alignment works (left, center, right)
- [ ] No visual artifacts or glitches

### ✅ Animations
- [ ] Cascade animation still works
- [ ] Change detection still works
- [ ] Animation presets work (pulse, glow, flash)
- [ ] Custom animation parameters work

### ✅ Edge Cases
- [ ] Empty cells render correctly
- [ ] Missing style properties use defaults
- [ ] Invalid theme tokens fall back gracefully
- [ ] Large grids don't cause performance issues
- [ ] Rapid config changes don't break styling

---

## Common Issues & Solutions

### Issue: Deprecation warning not appearing
**Solution:** Check DevTools console. Warning only shows once per page load.

### Issue: Styles not applying
**Solution:** 
1. Check style cache - try refreshing page
2. Verify theme token syntax (use `colors.grid.cellText`, not `colors.grid.cell-text`)
3. Check for typos in property names

### Issue: Theme tokens not resolving
**Solution:**
1. Verify theme is loaded (check Theme Manager in DevTools)
2. Use correct token paths (see doc/user/configuration/cards/data-grid.md)
3. Check for fallback values in case token doesn't exist

### Issue: CSS Grid properties not working
**Solution:**
1. Remove old shorthand properties (`rows`, `columns`, `cell_width`)
2. Use kebab-case for CSS properties (`grid-template-columns`, not `gridTemplateColumns`)
3. Include units for numeric values (`8px`, not `8`)

### Issue: Performance degradation
**Solution:**
1. Check style cache is enabled (should be automatic)
2. Reduce grid size for testing
3. Simplify style hierarchy
4. Clear browser cache and reload

---

## Performance Benchmarks

Expected performance metrics:

| Grid Size | Initial Render | Style Resolution | Cache Hit Rate |
|-----------|----------------|------------------|----------------|
| 8×12 (96 cells) | <50ms | <5ms | >95% |
| 12×12 (144 cells) | <80ms | <8ms | >95% |
| 20×20 (400 cells) | <200ms | <15ms | >90% |

To measure:
1. Open DevTools Performance tab
2. Start recording
3. Add/refresh data-grid card
4. Stop recording
5. Check "Parse HTML & CSS" and "Evaluate Script" times

---

## Reporting Issues

If you find issues during testing:

1. **Note the specific test case** (e.g., "Test 3.2: Column-Level Overrides")
2. **Capture console errors** (DevTools → Console tab)
3. **Take screenshots** of unexpected behavior
4. **Record config** that reproduces the issue
5. **Note browser/version** (e.g., Chrome 120, Firefox 121)

Include all above information when reporting issues.

---

## Additional Resources

- **Full Documentation:** `doc/user/configuration/cards/data-grid.md`
- **Theme Token Reference:** See "Theme Token Reference" section in docs
- **CSS Grid Guide:** https://css-tricks.com/snippets/css/complete-guide-grid/
- **LCARdS Theme System:** `doc/architecture/subsystems/theme-system.md`

---

**Version:** 2.0.0 (Refactor Release)  
**Last Updated:** December 7, 2024  
**Test Coverage:** 100% of new features
