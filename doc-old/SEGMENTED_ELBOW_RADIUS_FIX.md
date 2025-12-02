# Segmented Elbow Radius Fix

**Date:** 2025-12-01
**Issue:** Inner segment radius not concentric with outer segment
**Status:** ✅ Fixed

---

## Problem

The original implementation calculated each segment's radii independently based on their bar widths:

```javascript
// ❌ OLD (INCORRECT) - Independent calculations
const outerHorizontal = ((total - gap) * (factor - 1)) / factor;
const outerRadius = outerHorizontal / 2;

const innerHorizontal = (total - gap) / factor;
const innerRadius = innerHorizontal / 2;  // NOT concentric!
```

**Example with horizontal=180, gap=4, factor=4:**
```
Outer segment:
  horizontal = 176 * 3/4 = 132px
  outer_radius = 66px
  inner_radius = 33px

Inner segment:
  horizontal = 176 / 4 = 44px
  outer_radius = 22px  ❌ Does NOT match outer's inner (33px)
  inner_radius = 11px

Gap between curves: Inconsistent (33 - 22 = 11px, not 4px)
```

This resulted in non-concentric curves where the inner segment's outer arc didn't follow the outer segment's inner arc at a consistent distance.

---

## Solution

The inner segment's outer radius must equal the outer segment's inner radius minus the gap:

```javascript
// ✅ NEW (CORRECT) - Concentric calculation
const outerSegmentOuterRadius = outerHorizontal / 2;
const outerSegmentInnerRadius = outerSegmentOuterRadius / 2; // LCARS

const innerSegmentOuterRadius = outerSegmentInnerRadius - gap; // KEY FIX
const innerSegmentInnerRadius = innerSegmentOuterRadius / 2; // LCARS

const innerHorizontal = innerSegmentOuterRadius * 2; // Derived from radius
```

**Example with horizontal=180, gap=4, factor=4:**
```
Outer segment:
  horizontal = 176 * 3/4 = 132px
  outer_radius = 66px
  inner_radius = 33px (LCARS: 66/2)

Inner segment:
  outer_radius = 33 - 4 = 29px  ✅ Matches outer's inner minus gap
  inner_radius = 14.5px (LCARS: 29/2)
  horizontal = 29 * 2 = 58px (derived from radius)

Gap between curves: Consistent 4px throughout
```

---

## Visual Comparison

### Before (Non-Concentric)
```
     ┌─────────────────────────────┐
     │ Outer segment (66px radius) │
     │   ┌──────────────┐          │
     │   │ 33px inner   │          │
     │   └──────────────┘          │
     │        11px gap              │  ❌ Gap too large
     │   ┌───────┐                 │
     │   │ 22px  │ Inner segment   │
     │   └───────┘ (not aligned)   │
     └─────────────────────────────┘
```

### After (Concentric)
```
     ┌─────────────────────────────┐
     │ Outer segment (66px radius) │
     │   ┌──────────────┐          │
     │   │ 33px inner   │          │
     │   └──────────────┘          │
     │        4px gap               │  ✅ Consistent gap
     │   ┌──────────┐              │
     │   │ 29px     │ Inner segment│
     │   │(aligned!)│              │
     │   └──────────┘              │
     └─────────────────────────────┘
```

---

## Code Changes

**File:** `/home/jweyermars/code/lcards/src/cards/lcards-elbow-button.js`
**Method:** `_calculateSegmentedGeometry(config)`
**Lines:** ~345-370

### Key Change
```javascript
// Calculate inner segment's outer radius based on outer segment's inner radius
const innerSegmentOuterRadius = outerSegmentInnerRadius - gap;

// Derive horizontal width from the constrained radius
const innerHorizontal = innerSegmentOuterRadius * 2;
```

This ensures the inner segment's outer curve follows the outer segment's inner curve at exactly the specified gap distance.

---

## Mathematical Principle

For concentric circles with consistent gap:

```
Given:
  R_outer_outer = outer segment's outer radius
  R_outer_inner = outer segment's inner radius
  gap = desired spacing

For concentricity:
  R_inner_outer = R_outer_inner - gap  ✅

Not:
  R_inner_outer = independent calculation  ❌
```

The LCARS formula (inner = outer / 2) is still applied, but only **after** establishing the concentric relationship.

---

## Build Status

✅ **Fixed and rebuilt successfully**

```bash
npm run build
# webpack 5.97.0 compiled with 3 warnings in 8144 ms
```

---

## Testing Notes

When testing in Home Assistant, verify:
1. **Visual concentricity**: Inner curve follows outer curve smoothly
2. **Consistent gap**: Space between segments is uniform throughout the arc
3. **No overlap**: Segments maintain separation even at the tightest curve points
4. **All positions**: Header-left/right, footer-left/right all show proper concentricity

Expected appearance: Two smooth, parallel L-shaped curves with perfectly consistent spacing between them - the classic Picard-era LCARS aesthetic.

---

## Related Documentation

- **Implementation Summary:** `/doc-old/SEGMENTED_ELBOW_IMPLEMENTATION.md`
- **User Guide:** `/doc/user/configuration/elbow-button-quick-reference.md`
- **Test Config:** `/test-segmented-elbow.yaml`
