# Segmented Elbow Implementation Summary

**Date:** 2025-01-XX
**Feature:** Picard-Style Double Elbow (Segmented Elbow)
**Status:** ✅ Complete - Ready for Testing

---

## Overview

Implemented segmented elbow style for `lcards-elbow-button` card, adding Picard-era TNG aesthetic with dual concentric elbow paths separated by a gap.

---

## Implementation Details

### Core Changes

**File:** `/home/jweyermars/code/lcards/src/cards/lcards-elbow-button.js`

1. **Configuration Validation** (Line ~207)
   - Added `style` property: `'simple'` (default) or `'segmented'`
   - Added `segments` object with properties:
     - `gap`: Gap between outer/inner segments (pixels, default: 4)
     - `factor`: Sizing ratio factor (default: 4)
     - `colors.outer`: Outer segment color (optional)
     - `colors.inner`: Inner segment color (optional)

2. **Geometry Calculation** (Line ~305)
   - New method: `_calculateSegmentedGeometry(horizontal, vertical, gap, factor)`
   - Uses legacy CB-LCARS formula:
     ```javascript
     const total = horizontal - gap;
     const outerWidth = total * (factor - 1) / factor;
     const innerWidth = total / factor;
     ```
   - Example with `horizontal: 180, gap: 4, factor: 4`:
     - `total = 176`
     - `outerWidth = 176 * 3/4 = 132px`
     - `innerWidth = 176 / 4 = 44px`
     - Ratio: 3:1

3. **SVG Rendering** (Line ~717)
   - Updated `_generateSimpleButtonSVG()` to route to segmented rendering when `style === 'segmented'`
   - New method: `_generateSegmentedElbowSVG()` (Line ~796)
     - Generates two concentric elbow paths
     - Calculates offset for inner segment based on elbow type
     - Applies custom colors if specified
   - New helper: `_generateSegmentPath(elbowType, geom, color)`
     - Routes to appropriate path generator (header/footer, left/right)
     - Applies fill color

4. **Documentation Updates**
   - Updated file header JSDoc with segmented style example
   - Added segment configuration schema with:
     - `gap`, `factor`, and `colors` properties
     - Usage examples showing typical configurations

### User Documentation

**File:** `/home/jweyermars/code/lcards/doc/user/configuration/elbow-button-quick-reference.md`

1. **Schema Update**
   - Added `style` property to main schema
   - Added complete `segments` configuration section

2. **New Section: "Elbow Styles"**
   - Explains simple vs segmented styles
   - Shows segment calculation formulas
   - Documents common factor values (3, 4, 5)
   - Explains ratio relationships

3. **New Examples**
   - Basic segmented header
   - Segmented with custom colors
   - Wide segmented footer
   - All positions comparison
   - Simple vs segmented side-by-side

### Test Configuration

**File:** `/home/jweyermars/code/lcards/test-segmented-elbow.yaml`

Comprehensive test suite covering:
1. Basic segmented header-left
2. Custom colors (outer/inner)
3. Wide design with factor 5
4. Factor 3 (2:1 ratio) variation
5. Simple vs segmented comparison
6. All four positions with segmented style

---

## Configuration Format

### Simple Elbow (Existing)
```yaml
elbow:
  type: header-left
  style: simple          # Optional: default
  border:
    horizontal: 90
    vertical: 20
  radius:
    outer: 'auto'
```

### Segmented Elbow (New)
```yaml
elbow:
  type: header-left
  style: segmented       # Enables double elbow
  border:
    horizontal: 180      # Total width for both segments + gap
    vertical: 20
  segments:
    gap: 4               # Gap between segments
    factor: 4            # 3:1 ratio (outer:inner)
    colors:
      outer: '#FF9C00'   # Optional
      inner: '#FFCC99'   # Optional
```

---

## Segment Sizing Formula

Given configuration:
- `horizontal = 180` (total width for outer segment)
- `gap = 4` (space between segments)
- `factor = 4` (sizing ratio)

**Concentric Calculations:**
```
Outer Segment:
  horizontal = (180 - 4) * 3/4 = 132px
  outer_radius = 132 / 2 = 66px
  inner_radius = 66 / 2 = 33px (LCARS formula)

Inner Segment (concentric with outer):
  outer_radius = 33 - 4 = 29px (matches outer's inner radius - gap)
  inner_radius = 29 / 2 = 14.5px (LCARS formula)
  horizontal = 29 * 2 = 58px (derived from radius)

Result: Perfectly concentric curves with consistent gap
```

**Key Principle:**
The inner segment's outer radius equals the outer segment's inner radius minus the gap. This ensures true concentricity with uniform spacing.

Common factor values:
- **factor: 3** → 2:1 ratio (outer = 2 × inner)
- **factor: 4** → 3:1 ratio (outer = 3 × inner) - **most common**
- **factor: 5** → 4:1 ratio (outer = 4 × inner)

---

## Positioning Logic

The inner segment is offset from the outer segment by the gap amount:

### Header-Left
```
Outer: positioned at (0, 0)
Inner: offset by (gap, gap)
```

### Header-Right
```
Outer: positioned at (width - outerHorizontal, 0)
Inner: offset by (-gap, gap)
```

### Footer-Left
```
Outer: positioned at (0, height - outerVertical)
Inner: offset by (gap, -gap)
```

### Footer-Right
```
Outer: positioned at (width - outerHorizontal, height - outerVertical)
Inner: offset by (-gap, -gap)
```

---

## Build Status

✅ **Build successful** - No errors or breaking warnings

```
npm run build
> webpack --mode production
asset lcards.js 1.58 MiB [emitted] [minimized] [big]
webpack 5.97.0 compiled with 3 warnings in 7952 ms
```

Warnings are existing size-related performance suggestions, not related to this feature.

---

## Testing Checklist

To verify in Home Assistant:

1. **Basic Rendering**
   - [ ] Segmented header-left displays two concentric paths
   - [ ] Gap between segments is visible and correct
   - [ ] Both segments render with proper geometry

2. **All Positions**
   - [ ] Header-left segmented
   - [ ] Header-right segmented
   - [ ] Footer-left segmented
   - [ ] Footer-right segmented

3. **Factor Variations**
   - [ ] Factor 3 (2:1 ratio) renders correctly
   - [ ] Factor 4 (3:1 ratio) renders correctly
   - [ ] Factor 5 (4:1 ratio) renders correctly

4. **Custom Colors**
   - [ ] Outer segment uses custom color when specified
   - [ ] Inner segment uses custom color when specified
   - [ ] Falls back to main color when colors omitted

5. **Interaction**
   - [ ] Tap actions work on both segments
   - [ ] Hover effects apply correctly
   - [ ] Hold actions trigger properly

6. **Text Positioning**
   - [ ] Text auto-adjusts for segmented elbows
   - [ ] No text overlap with segments
   - [ ] Multi-text fields work correctly

---

## Architecture Notes

### Clean SVG Approach

Unlike the legacy CB-LCARS implementation (which used nested cards), this implementation renders both segments in a single SVG, providing:

- **Better Performance**: Single DOM element instead of nested cards
- **Cleaner Code**: Unified rendering logic
- **Easier Maintenance**: Single configuration object
- **Consistent Styling**: Both segments inherit from same button context

### Extensibility

The segmented implementation maintains compatibility with all SimpleButton features:
- Actions (tap, hold, double-tap)
- Animations
- Rules
- Templates
- Presets
- Icon integration
- Multi-text fields

---

## Next Steps

1. **Deploy to Home Assistant**
   - Copy `lcards.js` to `/config/www/lcards/`
   - Reload frontend resources

2. **Test Configuration**
   - Create dashboard with `test-segmented-elbow.yaml`
   - Verify all test cases
   - Check browser console for errors

3. **Visual Verification**
   - Confirm gap spacing is accurate
   - Verify segment proportions match factor
   - Test color customization
   - Compare with legacy CB-LCARS Picard headers

4. **Update Changelog**
   - Add feature announcement
   - Document breaking changes (none expected)
   - Include migration guide from CB-LCARS

---

## Related Files

- **Implementation**: `/home/jweyermars/code/lcards/src/cards/lcards-elbow-button.js`
- **Documentation**: `/home/jweyermars/code/lcards/doc/user/configuration/elbow-button-quick-reference.md`
- **Test Config**: `/home/jweyermars/code/lcards/test-segmented-elbow.yaml`
- **Legacy Reference**: `/home/jweyermars/code/lcards/cb-archive/lcards/lcards-header-picard.yaml`
- **Build Output**: `/home/jweyermars/code/lcards/lcards.js`

---

## Summary

The segmented elbow feature is **fully implemented and built**. The code follows the established LCARdS architecture, maintains backward compatibility, and provides a clean, performant alternative to the legacy nested-card approach. Ready for testing in Home Assistant.

**Key Achievement**: Single-SVG dual-path rendering with configurable gap, sizing factor, and independent color control for outer/inner segments.
