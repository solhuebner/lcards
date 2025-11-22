# SVG Border Inset Fix

## Overview
Fixed SVG border rendering to replicate CSS border behavior by insetting border paths by `strokeWidth/2`. This ensures the full stroke is visible within the viewBox, matching how CSS borders are drawn "inside" the box.

## Problem
Previously, SVG border paths were drawn at the exact edges (0, width, height), causing the stroke to extend beyond the viewBox:
- Top border at Y=0: stroke extends from Y=-2 to Y=2 (with 4px width)
- Bottom border at Y=height: stroke extends beyond viewBox, getting clipped by 2px
- Left/Right borders: similar clipping issues

This didn't match CSS border behavior where borders are drawn fully inside the element's bounds.

## Root Cause
SVG strokes are **centered** on the path:
- A 4px stroke at Y=0 extends from Y=-2 to Y=2
- Half the stroke (2px) extends outside the viewBox and gets clipped
- The viewBox was expanded to accommodate this, but it still didn't match CSS behavior

## Solution
Inset all border paths by `strokeWidth/2`:

### Straight Borders
```javascript
// Top border: Y = strokeWidth/2 (not Y = 0)
const inset = topWidth / 2;
path d="M ${startX} ${inset} L ${endX} ${inset}"

// Bottom border: Y = height - strokeWidth/2
const inset = bottomWidth / 2;
path d="M ${startX} ${h - inset} L ${endX} ${h - inset}"

// Left border: X = strokeWidth/2
const inset = leftWidth / 2;
path d="M ${inset} ${startY} L ${inset} ${endY}"

// Right border: X = width - strokeWidth/2
const inset = rightWidth / 2;
path d="M ${w - inset} ${startY} L ${w - inset} ${endY}"
```

### Corner Arcs
Reduced arc radius and adjusted center positions to match inset borders:
```javascript
const inset = cornerWidth / 2;
const arcRadius = Math.max(originalRadius - inset, inset);

// Top-left: center at (inset, inset), reduced radius
path d="M ${inset} ${arcRadius + inset} A ${arcRadius} ${arcRadius} 0 0 1 ${arcRadius + inset} ${inset}"

// Similar adjustments for all four corners
```

### ViewBox Simplification
Removed viewBox expansion since borders no longer extend outside:
```javascript
// Before: viewBox expanded for stroke overhang
const viewBoxX = -strokeOverhang;
const viewBoxWidth = width + (strokeOverhang * 2);

// After: natural dimensions (no expansion needed)
const viewBoxX = 0;
const viewBoxWidth = width;
```

## Mathematical Verification

### Example: 229×55.984375 button with 4px border

**Before (clipping issue):**
```svg
<svg viewBox="-2 0 233 55.984375">
  <path d="M 0 0 L 229 0" stroke-width="4"/>          <!-- Top: -2 to 2 -->
  <path d="M 0 55.984375 L 229 55.984375" stroke-width="4"/>  <!-- Bottom: 53.984 to 57.984 (clipped!) -->
</svg>
```

**After (fully visible):**
```svg
<svg viewBox="0 0 229 55.984375">
  <path d="M 0 2 L 229 2" stroke-width="4"/>          <!-- Top: 0 to 4 ✅ -->
  <path d="M 0 53.984375 L 229 53.984375" stroke-width="4"/>  <!-- Bottom: 51.984 to 55.984 ✅ -->
</svg>
```

All 4px of each border is now visible within the natural button dimensions.

## Lozenge Border Radius Handling

The corner arc radius is reduced by the inset to maintain tangency with straight borders:

```javascript
// Original radius: 28px (from CSS)
// Border width: 4px
// Inset: 2px
// Arc radius: 28 - 2 = 26px

// Arc is drawn at (inset, inset) with reduced radius
// Ensures smooth join with inset straight borders
```

The `Math.max(originalRadius - inset, inset)` ensures the arc radius never goes below the inset value, preventing negative or zero radii for small corners.

## Benefits

1. **CSS Compatibility**: Borders now behave identically to CSS borders (drawn inside the box)
2. **No Clipping**: Full stroke width is visible, no partial borders
3. **Simpler ViewBox**: No complex expansion calculations needed
4. **Pixel-Perfect**: Exact same visual result as legacy CSS-based cards
5. **All Border Widths**: Works correctly for any stroke width (2px, 4px, 6px, etc.)

## Edge Cases Handled

1. **Variable Border Widths**: Each side can have different widths, inset calculated per-side
2. **Corner Joins**: Square linecaps ensure seamless joins between straight and arc segments
3. **Small Corners**: `Math.max()` prevents negative arc radii when radius < inset
4. **Icon/Text Positioning**: Unaffected since they use internal button coordinates
5. **Border Alignment**: Left/right borders start/end at inset positions of top/bottom borders
6. **Icon Divider**: Divider height/length adjusted to match border inset positions

## Corner Join Fix

The left and right borders needed to terminate at the inset positions of the top and bottom borders for perfect corner alignment:

### Before (misaligned corners):
```javascript
// Right border: starts at Y=0, should start at Y=topWidth/2
const startY = topRight > 0 ? topRight : 0;
const endY = bottomRight > 0 ? h - bottomRight : h;
```

### After (aligned corners):
```javascript
// Right border: starts at top border's inset position
const topBorderInset = topWidth > 0 ? topWidth / 2 : 0;
const bottomBorderInset = bottomWidth > 0 ? bottomWidth / 2 : 0;
const startY = topRight > 0 ? topRight : topBorderInset;
const endY = bottomRight > 0 ? h - bottomRight : h - bottomBorderInset;
```

This ensures the square linecaps of perpendicular borders meet perfectly at the corner.

## Icon Divider Adjustment

Icon dividers (vertical lines separating icon area from text area) needed to align with the inset borders:

### Left/Right Icon Areas (vertical divider):
```javascript
// Divider height matches border inset
const strokeInset = strokeWidth / 2;
dividerY = strokeInset;  // Start at top border inset
dividerHeight = buttonHeight - (strokeInset * 2);  // End at bottom border inset
```

### Top/Bottom Icon Areas (horizontal divider):
```javascript
// Divider length matches border inset
const strokeInset = strokeWidth / 2;
dividerX = strokeInset;  // Start at left border inset
dividerLength = buttonWidth - (strokeInset * 2);  // End at right border inset
```

This prevents dividers from overlapping with the inset borders.

## Testing

Verified with multiple scenarios:
- Square buttons (picard style) - straight borders only
- Lozenge buttons - full rounded corners
- Bullet buttons - partial rounded corners
- Various border widths (2px, 4px, 6px)
- Variable per-side border widths

All render correctly with full stroke visibility and proper corner joins.

## Implementation Files

- `src/cards/lcards-simple-button.js`:
  - `_renderIndividualBorderPaths()` - Lines ~2910-2975: Inset straight borders
  - `_renderCornerArcs()` - Lines ~3020-3085: Inset arc centers and reduce radii
  - `render()` - Lines ~1865-1875: Simplified viewBox (no expansion)

## Version
Implemented in v1.14.48+ (after icon layout_spacing configuration)
