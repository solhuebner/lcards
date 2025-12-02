# Segmented Elbow Inner Path Dimension Fix

**Date:** 2025-12-01
**Issue:** Inner segment path extended to full SVG dimensions instead of constrained area
**Status:** ✅ Fixed

---

## The Problem

When rendering segmented elbows, the inner segment was being generated with incorrect canvas dimensions:

```javascript
// BEFORE (incorrect):
const innerPath = this._generateSegmentPath(
    width,    // Full SVG width (e.g., 466px)
    height,   // Full SVG height (e.g., 183px)
    inner.horizontal,
    inner.vertical,
    inner.outerRadius,
    inner.innerRadius,
    position, side
);
```

**Result:** Inner segment path extended to full canvas dimensions, even though it was offset and should only occupy a smaller area.

### Example SVG Output (Broken)

```xml
<!-- Outer segment: correct -->
<path d="M 85 0 L 466 0 L 466 30 L 72.5 30 A 42.5 42.5 0 0 0 30 72.5 ..." />

<!-- Inner segment: WRONG! Goes to x=466 -->
<g transform="translate(34, 34)">
    <path d="M 55 0 L 466 0 L 466 60 ..." />
    <!--              ^^^ Should be (466-34)=432, not 466! -->
</g>
```

**Visual issue:**
- Inner segment path extended beyond where it should end
- Created overlapping/incorrect geometry
- Translation offset (34, 34) was correct, but path dimensions were wrong

---

## Why This Happened

The path generator creates paths that span from (0,0) to (width, height). When we translate the inner segment by offset (x, y), we're moving its origin, but the path still thinks it has the full canvas available.

**Analogy:**
```
Imagine drawing on a piece of paper:
1. Outer segment uses full paper (0,0) to (width, height)
2. Inner segment is OFFSET by (34, 34)
3. But we gave inner segment path instructions to draw to (width, height)
4. This extends it beyond the available space!

Correct approach:
1. Outer segment: (0,0) to (width, height)
2. Inner segment: (0,0) to (width-34, height-34) THEN offset by (34, 34)
```

---

## The Fix

Reduce the inner segment's canvas dimensions by the offset amount:

```javascript
// AFTER (correct):
const innerWidth = width - offset.x;
const innerHeight = height - offset.y;
const innerPath = this._generateSegmentPath(
    innerWidth,   // Reduced width
    innerHeight,  // Reduced height
    inner.horizontal,
    inner.vertical,
    inner.outerRadius,
    inner.innerRadius,
    position, side
);
```

### Example SVG Output (Fixed)

```xml
<!-- Outer segment: unchanged -->
<path d="M 85 0 L 466 0 L 466 30 L 72.5 30 A 42.5 42.5 0 0 0 30 72.5 ..." />

<!-- Inner segment: CORRECT! Goes to x=432 (466-34) -->
<g transform="translate(34, 34)">
    <path d="M 55 0 L 432 0 L 432 60 ..." />
    <!--              ^^^ Correctly constrained! -->
</g>
```

---

## Example Calculation

**User's config:**
```yaml
elbow:
  type: header-left
  style: segmented
  border:
    horizontal: 180
  radius:
    outer: 85
  segments:
    gap: 4
    outer:
      horizontal: 30
      vertical: 30
    inner:
      horizontal: 60
      vertical: 60
      radius: 55
```

**SVG dimensions:** 466px wide (from border + content)

**Before fix:**
```
Outer segment:
  - Canvas: (0, 0) to (466, 183)
  - Path: M 85 0 L 466 0 ... ✅ Correct

Inner segment:
  - Offset: (34, 34)
  - Canvas: (0, 0) to (466, 183) ❌ WRONG
  - Path: M 55 0 L 466 0 ... ❌ Extends too far!
```

**After fix:**
```
Outer segment:
  - Canvas: (0, 0) to (466, 183)
  - Path: M 85 0 L 466 0 ... ✅ Correct

Inner segment:
  - Offset: (34, 34)
  - Canvas: (0, 0) to (432, 149) ✅ Reduced by offset
  - Path: M 55 0 L 432 0 ... ✅ Correctly constrained!
```

**Visual result:**
- Inner segment path stays within its allocated area
- No overlap or extension beyond inner segment bounds
- Proper geometric relationship between segments

---

## Code Changes

**File:** `/home/jweyermars/code/lcards/src/cards/lcards-elbow-button.js`

**Function:** `_generateSegmentedElbowSVG()`

**Change:**
```diff
  // Generate inner segment path (smaller elbow)
+ // Reduce dimensions by the offset since inner is positioned inside outer
+ const innerWidth = width - offset.x;
+ const innerHeight = height - offset.y;
  const innerPath = this._generateSegmentPath(
-     width, height,
+     innerWidth, innerHeight,
      inner.horizontal, inner.vertical,
      inner.outerRadius, inner.innerRadius,
      position, side
  );
```

---

## Testing

**Test files created:**
- `/test-inner-dimensions-fix.yaml` - Verifies correct path dimensions
- `/test-user-config-fixed.yaml` - User's original config (should now work)
- `/test-segment-debug.yaml` - Debug geometry calculations

**Verification steps:**
1. Load test config in Home Assistant
2. Inspect SVG in browser dev tools
3. Check inner segment path coordinates
4. Verify path does NOT extend to full SVG width
5. Confirm visual appearance is correct

**Expected inner path (header-left, offset 34,34, reduced canvas 432x149):**
```xml
<path d="M 55 0 L 432 0 L 432 60 L 87.5 60 A 27.5 27.5 0 0 0 60 87.5 L 60 149 L 0 149 L 0 55 A 55 55 0 0 1 55 0 Z" />
```

Key values:
- Starts at `M 55 0` (radius position) ✅
- Horizontal extent: `L 432 0` (reduced width) ✅
- Vertical extent: `L 60 149` (reduced height) ✅
- Arc radii: `A 55 55` (explicit from config) ✅

---

## Impact

**Before:** Inner segments appeared incorrectly sized and positioned
**After:** Inner segments correctly constrained to their allocated area

**Affected configurations:**
- All segmented elbows with explicit sizing
- Any config using `segments.outer` and `segments.inner`
- Especially visible when inner radius is explicitly set

**Backward compatibility:** ✅ No breaking changes
- Fix corrects rendering to match intended behavior
- Configs that "worked" may look slightly different (but more correct)
- No config syntax changes required

---

## Related Issues

This fix addresses the user's observation:
> "the schema is also getting confusing"

**Related fixes:**
1. ✅ Inner segment dimensions (this fix)
2. ✅ Documentation clarity (segmented-elbow-simple-guide.md)
3. ✅ Explicit radius support (segments.inner.radius)

**Next steps:**
- Test in Home Assistant with various configs
- Verify all four elbow positions work correctly
- Check edge cases (very small/large radii, minimal gaps)

---

## Summary

✅ **Fixed:** Inner segment path now uses correct canvas dimensions
✅ **Formula:** `innerCanvas = (width - offset.x, height - offset.y)`
✅ **Result:** Proper geometric constraint and positioning
✅ **Build:** Successful (webpack 5.97.0)
✅ **Version:** 1.24.16

**Key insight:** When using SVG transforms, child elements need dimensions relative to their transformed coordinate space, not the parent canvas.
