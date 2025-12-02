# Segmented Elbow Schema v2.0.0 - Breaking Change Migration

**Version:** 2.0.0 (Breaking)
**Date:** 2025-12-01
**Status:** Clean schema, no backwards compatibility

---

## ⚠️ BREAKING CHANGE

The segmented elbow schema has been completely redesigned for clarity. **Old configs will NOT work.**

### Why the Breaking Change?

The old schema had **confusing terminology**:
- "inner/outer" used for both segments AND radii
- `segments.inner.radius` meant "inner segment's outer radius" 😵
- Multiple aliases created confusion
- Parameters were spread across different locations

**New schema:** Crystal clear, explicit naming for all 8 parameters.

---

## Migration Quick Reference

| Old Parameter | New Parameter | Notes |
|--------------|---------------|-------|
| `radius.outer` | `outer_segment.outer_curve` | Moved to segment |
| `segments.outer.horizontal` | `outer_segment.bar_width` | Renamed |
| `segments.outer.vertical` | `outer_segment.bar_height` | Renamed |
| `segments.outer.radius` | `outer_segment.outer_curve` | Renamed |
| `segments.outer.curve` | `outer_segment.outer_curve` | Renamed (was alias) |
| ❌ No control | `outer_segment.inner_curve` | **NEW!** Now controllable |
| `segments.inner.horizontal` | `inner_segment.bar_width` | Renamed |
| `segments.inner.vertical` | `inner_segment.bar_height` | Renamed |
| `segments.inner.radius` | `inner_segment.outer_curve` | Renamed |
| `segments.inner.curve` | `inner_segment.outer_curve` | Renamed (was alias) |
| ❌ No control | `inner_segment.inner_curve` | **NEW!** Now controllable |
| `segments.colors.outer` | `outer_segment.color` | Moved |
| `segments.colors.inner` | `inner_segment.color` | Moved |
| `segments.factor` | ❌ **REMOVED** | Use explicit sizing |

---

## Before & After Examples

### Example 1: Basic Config

**OLD (v1.x):**
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
```

**NEW (v2.0):**
```yaml
elbow:
  segments:
    gap: 4
    outer_segment:
      bar_width: 30
      bar_height: 30
      outer_curve: 85
    inner_segment:
      bar_width: 60
      bar_height: 60
```

**Changes:**
- ✅ `radius.outer` moved to `outer_segment.outer_curve`
- ✅ `outer`/`inner` renamed to `outer_segment`/`inner_segment`
- ✅ `horizontal`/`vertical` renamed to `bar_width`/`bar_height`

---

### Example 2: Override Inner Radius

**OLD (v1.x):**
```yaml
elbow:
  radius:
    outer: 85
  segments:
    gap: 4
    outer:
      horizontal: 30
    inner:
      horizontal: 60
      radius: 55         # Confusing name!
```

**NEW (v2.0):**
```yaml
elbow:
  segments:
    gap: 4
    outer_segment:
      bar_width: 30
      outer_curve: 85
    inner_segment:
      bar_width: 60
      outer_curve: 55    # Clear name!
```

**Changes:**
- ✅ `segments.inner.radius` → `inner_segment.outer_curve` (clearer!)
- ✅ Explicit about which curve you're setting

---

### Example 3: Custom Colors

**OLD (v1.x):**
```yaml
elbow:
  segments:
    outer:
      horizontal: 30
    inner:
      horizontal: 60
    colors:
      outer: "#FF9C00"
      inner: "#FFCC99"
```

**NEW (v2.0):**
```yaml
elbow:
  segments:
    outer_segment:
      bar_width: 30
      color: "#FF9C00"
    inner_segment:
      bar_width: 60
      color: "#FFCC99"
```

**Changes:**
- ✅ `colors.outer`/`colors.inner` moved to segment
- ✅ Each segment owns its properties

---

### Example 4: Aliases (Old)

**OLD (v1.x - any of these):**
```yaml
segments:
  inner:
    thickness: 60      # Alias for horizontal/vertical
    curve: 55          # Alias for radius
    corner_radius: 55  # Another alias
```

**NEW (v2.0 - one way only):**
```yaml
segments:
  inner_segment:
    bar_width: 60      # Standard name
    outer_curve: 55    # Standard name
```

**Changes:**
- ❌ Removed all aliases
- ✅ One clear name per parameter

---

## Complete Migration Steps

### Step 1: Rename Top-Level Structure

```yaml
# OLD:
segments:
  outer:
    ...
  inner:
    ...

# NEW:
segments:
  outer_segment:
    ...
  inner_segment:
    ...
```

---

### Step 2: Rename Bar Dimensions

```yaml
# OLD:
outer:
  horizontal: 30
  vertical: 30

# NEW:
outer_segment:
  bar_width: 30
  bar_height: 30
```

**Alternative (if same):**
```yaml
outer_segment:
  bar_width: 30
  # bar_height: defaults to bar_width
```

---

### Step 3: Move Global Radius to Segment

```yaml
# OLD:
radius:
  outer: 85
segments:
  outer:
    horizontal: 30

# NEW:
segments:
  outer_segment:
    bar_width: 30
    outer_curve: 85    # Moved here!
```

---

### Step 4: Rename Radius Parameters

```yaml
# OLD:
outer:
  radius: 85         # or curve: 85, or corner_radius: 85
inner:
  radius: 55

# NEW:
outer_segment:
  outer_curve: 85    # Only one name
inner_segment:
  outer_curve: 55
```

---

### Step 5: Move Colors to Segments

```yaml
# OLD:
segments:
  colors:
    outer: "#FF9C00"
    inner: "#FFCC99"

# NEW:
segments:
  outer_segment:
    color: "#FF9C00"
  inner_segment:
    color: "#FFCC99"
```

---

### Step 6: Remove Factor-Based Sizing

```yaml
# OLD:
segments:
  factor: 4

# NEW:
segments:
  outer_segment:
    bar_width: 30      # Calculate explicitly
  inner_segment:
    bar_width: 90      # factor=4 meant 30 outer, 90 inner
```

**Calculation:**
```
If factor = 4 and total width = 120:
  outer = (120-4) * (4-1) / 4 = 87
  inner = 120 - 87 - 4 = 29

Use those values explicitly in new schema.
```

---

## New Capabilities (v2.0)

### 1. Control Inner Curves (NEW!)

**Previously impossible:**
```yaml
outer_segment:
  outer_curve: 85
  inner_curve: 30      # 🆕 Override LCARS formula!
```

Default: `inner_curve = outer_curve / 2` (LCARS formula)
Override: Set any value you want

---

### 2. Different Bar Dimensions Per Axis

**More explicit:**
```yaml
outer_segment:
  bar_width: 20       # Thin sidebar
  bar_height: 40      # Thick horizontal bar
```

Previously: `horizontal: 20, vertical: 40` (confusing which is which)

---

### 3. Per-Segment Colors

**Cleaner:**
```yaml
outer_segment:
  color: "#FF9C00"    # Right where it belongs
inner_segment:
  color: "#FFCC99"
```

---

## Complete Parameter Reference

### Required Parameters

```yaml
segments:
  outer_segment:
    bar_width: <number>      # REQUIRED
  inner_segment:
    bar_width: <number>      # REQUIRED
```

---

### Optional Parameters (with defaults)

```yaml
segments:
  gap: 4                     # Default: 4

  outer_segment:
    bar_width: <number>      # REQUIRED
    bar_height: <number>     # Default: bar_width
    outer_curve: <number>    # Default: bar_width / 2
    inner_curve: <number>    # Default: outer_curve / 2
    color: <color>           # Default: button color

  inner_segment:
    bar_width: <number>      # REQUIRED
    bar_height: <number>     # Default: bar_width
    outer_curve: <number>    # Default: (outer_segment.inner_curve) - gap
    inner_curve: <number>    # Default: outer_curve / 2
    color: <color>           # Default: outer_segment.color
```

---

## Visual Parameter Guide

```yaml
segments:
  outer_segment:
    bar_width: 30        # ───┐ How thick (horizontal bar thickness)
    bar_height: 30       # ───┤ How tall (horizontal bar thickness)
    outer_curve: 85      # ───┤ Outside corner radius (convex)
    inner_curve: 42.5    # ───┘ Inside corner radius (concave)

  inner_segment:
    bar_width: 60        # ───┐ How thick
    bar_height: 60       # ───┤ How tall
    outer_curve: 55      # ───┤ Outside corner radius
    inner_curve: 27.5    # ───┘ Inside corner radius
```

**Visual:**
```
        ╭─────────────────  ← outer_segment.outer_curve
        │╭────────────────  ← outer_segment.inner_curve
  gap→  ││
        ││    ╭──────────  ← inner_segment.outer_curve
        ││    │╭─────────  ← inner_segment.inner_curve
        ││    ││
        └┴────┴┴─────────
         30   60
         bar_width
```

---

## Automated Migration Script

Create a script to convert old configs:

```javascript
// migrate-elbow-schema.js
function migrateElbowConfig(oldConfig) {
  const newConfig = {
    elbow: {
      type: oldConfig.elbow.type,
      style: oldConfig.elbow.style,
      border: oldConfig.elbow.border,
      segments: {
        gap: oldConfig.elbow.segments?.gap || 4,
        outer_segment: {},
        inner_segment: {}
      }
    }
  };

  // Migrate outer segment
  const oldOuter = oldConfig.elbow.segments?.outer || {};
  newConfig.elbow.segments.outer_segment = {
    bar_width: oldOuter.horizontal || oldOuter.thickness,
    bar_height: oldOuter.vertical || oldOuter.thickness,
    outer_curve: oldOuter.radius || oldOuter.curve ||
                 oldOuter.corner_radius || oldConfig.elbow.radius?.outer,
    color: oldConfig.elbow.segments?.colors?.outer
  };

  // Migrate inner segment
  const oldInner = oldConfig.elbow.segments?.inner || {};
  newConfig.elbow.segments.inner_segment = {
    bar_width: oldInner.horizontal || oldInner.thickness,
    bar_height: oldInner.vertical || oldInner.thickness,
    outer_curve: oldInner.radius || oldInner.curve || oldInner.corner_radius,
    color: oldConfig.elbow.segments?.colors?.inner
  };

  // Clean up undefined values
  Object.keys(newConfig.elbow.segments.outer_segment).forEach(key => {
    if (newConfig.elbow.segments.outer_segment[key] === undefined) {
      delete newConfig.elbow.segments.outer_segment[key];
    }
  });
  Object.keys(newConfig.elbow.segments.inner_segment).forEach(key => {
    if (newConfig.elbow.segments.inner_segment[key] === undefined) {
      delete newConfig.elbow.segments.inner_segment[key];
    }
  });

  return newConfig;
}
```

---

## Summary

### What Changed
- ✅ All parameter names clarified
- ✅ Removed all aliases (one name per parameter)
- ✅ Removed factor-based sizing
- ✅ Added control for inner curves
- ✅ Moved colors to segments
- ✅ Explicit segment naming (`outer_segment` / `inner_segment`)

### Migration Checklist
- [ ] Rename `outer` → `outer_segment`
- [ ] Rename `inner` → `inner_segment`
- [ ] Rename `horizontal` → `bar_width`
- [ ] Rename `vertical` → `bar_height`
- [ ] Rename `radius`/`curve`/`corner_radius` → `outer_curve`
- [ ] Move `radius.outer` to `outer_segment.outer_curve`
- [ ] Move `segments.colors.outer` to `outer_segment.color`
- [ ] Move `segments.colors.inner` to `inner_segment.color`
- [ ] Remove `segments.factor` (calculate explicit widths)
- [ ] Test new config

### Version Bump
- Old: v1.24.x
- New: v2.0.0 (major version for breaking change)

---

## Support

**Need help migrating?** See `/test-new-clean-schema.yaml` for examples.

**Questions?** The new schema is documented in `/doc/proposals/SEGMENTED_ELBOW_FINAL_SCHEMA.md`.
