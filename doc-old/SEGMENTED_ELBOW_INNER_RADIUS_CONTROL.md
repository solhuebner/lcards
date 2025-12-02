# Segmented Elbow - Inner Radius Control

**Date:** 2025-12-01
**Feature:** Explicit inner segment radius control
**Status:** ✅ Complete - Ready for Testing

---

## Problem

When using explicit segment sizing, users couldn't control the inner segment's outer radius independently. It was always calculated from either:

1. **Auto-concentric mode:** `inner_outer_radius = (outer_inner_radius) - gap`
2. **Derived from width:** `inner_outer_radius = inner_horizontal / 2`

This made it difficult to fine-tune designs where the auto-calculated radius didn't match the desired aesthetic.

### Your Specific Issue

With this config:
```yaml
radius:
  outer: 85
segments:
  gap: 4
  outer:
    horizontal: 30
  inner:
    horizontal: 60    # Width of 60px
```

**Auto-calculation produced:**
```
Outer segment:
  outer_radius = 85px
  inner_radius = 85 / 2 = 42.5px

Inner segment (auto-concentric):
  outer_radius = 42.5 - 4 = 38.5px
  inner_radius = 38.5 / 2 = 19.25px
```

**But you wanted more control over that inner 38.5px radius.**

---

## Solution

Added `segments.inner.radius` to explicitly set the inner segment's outer radius:

```yaml
segments:
  inner:
    horizontal: 60
    vertical: 60
    radius: 35        # NEW: Explicit control
```

---

## Configuration Options

### Option 1: Auto-Concentric (Default)
```yaml
elbow:
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
    # No inner.radius = auto-concentric calculation
```

**Result:**
- Inner outer radius = (85/2) - 4 = 38.5px (automatic)
- Perfectly concentric curves
- Harmonious, predictable geometry

---

### Option 2: Explicit Inner Radius
```yaml
elbow:
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
      radius: 30      # Explicit override
```

**Result:**
- Inner outer radius = 30px (as specified)
- Breaks concentricity (30px vs auto 38.5px)
- Allows custom design freedom

---

### Option 3: Outer Segment Radius Override
```yaml
elbow:
  radius:
    outer: 100        # Global default
  segments:
    gap: 4
    outer:
      horizontal: 40
      vertical: 40
      radius: 60      # Override for outer segment
    inner:
      horizontal: 80
      vertical: 80
      radius: 25      # Override for inner segment
```

**Result:**
- Both segments use explicit radii
- Complete control over all radii
- Maximum flexibility

---

## When to Use Each Mode

### Use Auto-Concentric (Default) When:
- ✅ You want harmonious, parallel curves
- ✅ Design should follow LCARS-style geometry
- ✅ Visual consistency is priority
- ✅ You're unsure what radius to use

### Use Explicit Inner Radius When:
- ✅ Auto-calculation doesn't match your design vision
- ✅ Need tighter or looser inner curve
- ✅ Matching specific design mockup
- ✅ Fine-tuning for visual preference
- ✅ Creating unique, non-concentric effects

---

## How It Works Internally

### Config Parsing
```javascript
inner: elbowConfig.segments?.inner ? {
    horizontal: this._parseUnit(segments.inner.horizontal),
    vertical: this._parseUnit(segments.inner.vertical),
    radius: elbowConfig.segments.inner.radius ?   // NEW
        this._parseUnit(elbowConfig.segments.inner.radius) : undefined
} : null
```

### Geometry Calculation
```javascript
// Check if explicit inner radius provided
if (segments.inner?.radius !== undefined) {
    innerSegmentOuterRadius = segments.inner.radius;
    useExplicitInnerRadius = true;
}

// Later, when calculating radii
if (!useExplicitInnerRadius && !innerSegmentOuterRadius) {
    // Auto-concentric mode
    innerSegmentOuterRadius = Math.max(0, outerSegmentInnerRadius - gap);
}

// Always apply LCARS formula for inner's inner radius
innerSegmentInnerRadius = innerSegmentOuterRadius / 2;
```

---

## Examples

### Example 1: Fine-Tune from Auto
**Start with auto:**
```yaml
radius:
  outer: 85
segments:
  outer: { horizontal: 30, vertical: 30 }
  inner: { horizontal: 60, vertical: 60 }
# Auto gives inner radius: 38.5px
```

**Try different inner radii:**
```yaml
# Tighter curve
inner: { horizontal: 60, vertical: 60, radius: 30 }

# Looser curve
inner: { horizontal: 60, vertical: 60, radius: 45 }

# Very tight
inner: { horizontal: 60, vertical: 60, radius: 20 }
```

---

### Example 2: Match Specific Design
**Design spec says:**
- Outer segment: 100px outer radius, 30px thick
- Inner segment: 35px outer radius, 80px horizontal bar

```yaml
elbow:
  radius:
    outer: 100
  segments:
    gap: 4
    outer:
      horizontal: 30
      vertical: 30
    inner:
      horizontal: 80
      vertical: 80
      radius: 35      # Exactly as designed
```

---

### Example 3: Non-Concentric Design
**Create asymmetric curves:**
```yaml
elbow:
  radius:
    outer: 120       # Large sweeping outer
  segments:
    gap: 6
    outer:
      horizontal: 25
      vertical: 25
    inner:
      horizontal: 100
      vertical: 100
      radius: 20     # Tight inner (non-concentric)
```

**Effect:** Thin sweeping outer frame with tight inner corner - unique aesthetic

---

## Visual Guide

### Auto-Concentric (Default)
```
Outer radius: 85px
  ╭──────────────────────╮
  │ Outer seg (42.5 inner)│
  │  ╭──────────────╮     │
  │  │ 4px gap      │     │
  │  │ ╭────────────┴─╮   │
  │  │ │ Inner (38.5)  │  │  ← Auto: 42.5 - 4 = 38.5
  │  │ │              │  │
  │  │ ╰──────────────╯  │
  │  ╰──────────────────╯ │
  ╰──────────────────────╯
```

### Explicit Inner Radius
```
Outer radius: 85px
  ╭──────────────────────╮
  │ Outer seg (42.5 inner)│
  │  ╭──────────────╮     │
  │  │ 4px+ gap     │     │
  │  │ ╭────────╮   │     │
  │  │ │ Inner │   │     │  ← Explicit: 30px (tighter)
  │  │ │ (30px)│   │     │
  │  │ ╰────────╯   │     │
  │  ╰──────────────────╯ │
  ╰──────────────────────╯
```

---

## Testing Your Design

### Recommended Workflow:

1. **Start with auto-concentric:**
```yaml
# Omit segments.inner.radius
```
See how it looks. This gives you the baseline.

2. **Note the auto-calculated radius:**
Check browser console for debug log:
```
inner: { outerRadius: 38.5, ... }
```

3. **Adjust up or down:**
```yaml
inner:
  radius: 35    # Try 5-10px different
```

4. **Find your preference:**
Try 2-3 values and pick what looks best to your eye.

---

## Summary

✅ **Added:** `segments.outer.radius` and `segments.inner.radius`
✅ **Default:** Auto-concentric calculation (backward compatible)
✅ **Override:** Explicit radius for fine control
✅ **Flexibility:** Mix auto and explicit as needed

**Key Point:** You now have complete control over all four radii in a segmented elbow:
1. Outer segment outer radius (`radius.outer` or `segments.outer.radius`)
2. Outer segment inner radius (auto: outer/2, LCARS formula)
3. Inner segment outer radius (`segments.inner.radius` or auto-concentric)
4. Inner segment inner radius (auto: inner_outer/2, LCARS formula)

**Recommendation:** Start with auto-concentric, then fine-tune with `segments.inner.radius` if needed.

---

## Related Files

- **Implementation:** `/home/jweyermars/code/lcards/src/cards/lcards-elbow-button.js`
- **Documentation:** `/home/jweyermars/code/lcards/doc/user/configuration/elbow-button-quick-reference.md`
- **Test Config:** `/home/jweyermars/code/lcards/test-segmented-inner-radius.yaml`
