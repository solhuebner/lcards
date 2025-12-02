# Segmented Elbow - Explicit Radius & Sizing Clarification

**Date:** 2025-12-01
**Issue:** Confusion about how `radius.outer` and `segments.inner.horizontal` interact
**Status:** ✅ Clarified and Fixed

---

## The Confusion

When using explicit segment sizing with `radius.outer`, users expect:
```yaml
radius:
  outer: 120           # I want a large 120px radius arc
segments:
  outer:
    horizontal: 30     # With a narrow 30px outer band
  inner:
    horizontal: 60     # And a 60px inner band
```

**User's Mental Model:**
"The radius should control the arc curvature, and the horizontal values control the bar widths."

**Previous Behavior:**
- `radius.outer` was ignored
- Outer radius calculated as `horizontal / 2 = 30 / 2 = 15px` ❌
- Result: tiny arc instead of large sweeping curve

---

## The Fix

Now `radius.outer` is respected even with explicit segment sizing:

```javascript
// Check if explicit outer radius is provided
if (radius && radius.outer !== undefined && radius.outer !== 'auto') {
    outerSegmentOuterRadius = radius.outer;
    useExplicitRadius = true;
}

// When using explicit sizing
if (segments.outer) {
    outerHorizontal = segments.outer.horizontal;
    // Use explicit radius if provided, otherwise derive from horizontal
    if (!useExplicitRadius) {
        outerSegmentOuterRadius = outerHorizontal / 2;
    }
}
```

---

## How It Works Now

### Configuration Breakdown

```yaml
elbow:
  type: header-left
  style: segmented
  radius:
    outer: 120                    # Controls arc curvature
  segments:
    gap: 4
    outer:
      horizontal: 30              # Controls horizontal bar width
      vertical: 30                # Controls vertical bar height
    inner:
      horizontal: 60              # Controls inner horizontal bar width
      vertical: 60                # Controls inner vertical bar height
```

### What Each Parameter Does

**`radius.outer: 120`**
- Sets the outer segment's outer corner radius to 120px
- Creates a large, sweeping arc
- This is the **curvature** of the corner

**`segments.outer.horizontal: 30`**
- Sets the width of the **horizontal bar** (top edge)
- This is how far the flat top bar extends from the corner
- Does NOT affect the arc radius

**`segments.outer.vertical: 30`**
- Sets the height of the **vertical bar** (side edge)
- This is how thick the side bar is
- Does NOT affect the arc radius

**`segments.inner.horizontal: 60`** & **`segments.inner.vertical: 60`**
- Same as outer, but for the inner segment
- Controls bar widths, not arc curvature
- Inner arc radius is calculated to maintain concentricity

---

## Geometry Calculation

### Step 1: Outer Segment
```
Given:
  radius.outer = 120px
  segments.outer.horizontal = 30px
  segments.outer.vertical = 30px

Outer segment geometry:
  Outer radius = 120px (from config)
  Inner radius = 120 / 2 = 60px (LCARS formula)
  Horizontal bar = 30px (from config)
  Vertical bar = 30px (from config)
```

### Step 2: Inner Segment (Concentric)
```
Given:
  gap = 4px
  segments.inner.horizontal = 60px
  segments.inner.vertical = 60px

Inner segment geometry:
  Outer radius = 60 - 4 = 56px (concentric: outer inner - gap)
  Inner radius = 56 / 2 = 28px (LCARS formula)
  Horizontal bar = 60px (from config)
  Vertical bar = 60px (from config)
```

### Visual Result
```
     ┌──────────────────────────────────────┐
     │ Outer segment                        │
     │ - Outer radius: 120px (large arc)    │
     │ - Inner radius: 60px                 │
     │ - Bar width: 30px                    │
     │   ┌──────────────────┐               │
     │   │ 4px gap          │               │
     │   │  ┌───────────────┴───────┐       │
     │   │  │ Inner segment         │       │
     │   │  │ - Outer radius: 56px  │       │
     │   │  │ - Inner radius: 28px  │       │
     │   │  │ - Bar width: 60px     │       │
     │   │  └───────────────────────┘       │
     │   └──────────────────────────────────┘
     └──────────────────────────────────────┘
```

---

## The Key Distinction

### Radius vs Bar Width

**Radius (curvature):**
- Controls how **round** the corner is
- Large radius = gentle, sweeping curve
- Small radius = tight corner
- Set with `radius.outer`

**Bar Width (thickness):**
- Controls how **thick** the bars are
- Measured from the straight edge to the inner curve
- Set with `segments.outer.horizontal` and `vertical`

**They are independent!**
You can have:
- Large radius (120px) + narrow bar (30px) = sweeping thin line ✅
- Small radius (30px) + wide bar (90px) = tight thick corner ✅
- Any combination you want

---

## Common Patterns

### Pattern 1: Large Sweeping Border
```yaml
radius:
  outer: 150          # Large gentle curve
segments:
  outer:
    horizontal: 25    # Thin border
    vertical: 25
  inner:
    horizontal: 100   # Wide inner area
    vertical: 100
```
**Effect:** Thin border frame with gentle curves around wide content area

---

### Pattern 2: Tight Corners with Thick Bars
```yaml
radius:
  outer: 40           # Tight corner
segments:
  outer:
    horizontal: 80    # Thick bars
    vertical: 80
  inner:
    horizontal: 40    # Narrower inner
    vertical: 40
```
**Effect:** Bold, chunky design with sharp corners

---

### Pattern 3: Concentric Matching Curves
```yaml
radius:
  outer: 90           # Medium curve
segments:
  gap: 4
  factor: 4           # Let it calculate automatically
```
**Effect:** Properly sized bars that match the radius naturally

---

## Without Explicit Radius (Default)

If you don't specify `radius.outer`:

```yaml
segments:
  outer:
    horizontal: 30
    vertical: 30
```

**Calculation:**
```
Outer radius = horizontal / 2 = 30 / 2 = 15px
```

This creates a **tight** corner because the radius matches the bar width. For narrow bars (30px), this often looks too tight. That's why explicit radius helps!

---

## Recommendation

**For narrow outer bands (border/frame effects):**
Always set an explicit `radius.outer` that's larger than `horizontal / 2`:

```yaml
radius:
  outer: 100          # Much larger than horizontal
segments:
  outer:
    horizontal: 30    # Narrow band
    vertical: 30
  inner:
    horizontal: 120   # Wide inner
    vertical: 120
```

**For automatic sizing:**
Omit explicit segments and use factor-based:

```yaml
radius:
  outer: 90           # Or 'auto'
segments:
  factor: 4           # Calculates appropriate bar widths
```

---

## Testing Your Configuration

Your example:
```yaml
radius:
  outer: 120
segments:
  gap: 4
  outer:
    horizontal: 30
    vertical: 30
  inner:
    horizontal: 60
    vertical: 60
```

**Should produce:**
- Outer segment: 120px outer radius, 60px inner radius, 30px bars
- Inner segment: 56px outer radius, 28px inner radius, 60px bars
- 4px gap between them
- Large sweeping curve (120px radius)
- Thin outer frame (30px wide)
- Moderate inner segment (60px wide)

---

## Summary

✅ **Fixed:** `radius.outer` now works with explicit segment sizing
✅ **Clarified:** Radius controls curvature, horizontal/vertical control bar thickness
✅ **Documented:** Clear examples showing the relationship
✅ **Recommendation:** Use explicit radius with narrow outer bands for best results

**Key Takeaway:** Radius and bar width are independent. Set radius for the curve shape you want, set horizontal/vertical for the bar thickness you want.
