# Segmented Elbow v2.0.0 - Complete Schema Redesign

**Version:** 2.0.0
**Date:** 2025-12-01
**Type:** 💥 BREAKING CHANGE

---

## Summary

Complete redesign of the segmented elbow schema for maximum clarity and explicitness. All parameters now have clear, unambiguous names. **This is a breaking change - old configs will not work.**

---

## 💥 Breaking Changes

### 1. Renamed All Segment Parameters

**Old:**
- `segments.outer` → `segments.outer_segment`
- `segments.inner` → `segments.inner_segment`

**Reason:** "outer"/"inner" alone was ambiguous

---

### 2. Renamed Bar Dimensions

**Old:**
- `horizontal` → `bar_width`
- `vertical` → `bar_height`

**Reason:** Clear which dimension controls which bar

---

### 3. Renamed Radius Parameters

**Old:**
- `radius` / `curve` / `corner_radius` (multiple aliases)

**New:**
- `outer_curve` (single clear name)
- `inner_curve` (now controllable!)

**Reason:** Explicit about which curve edge

---

### 4. Moved Global Radius

**Old:**
```yaml
radius:
  outer: 85
segments:
  outer:
    horizontal: 30
```

**New:**
```yaml
segments:
  outer_segment:
    bar_width: 30
    outer_curve: 85
```

**Reason:** Keep all segment properties together

---

### 5. Moved Segment Colors

**Old:**
```yaml
segments:
  colors:
    outer: "#FF9C00"
    inner: "#FFCC99"
```

**New:**
```yaml
segments:
  outer_segment:
    color: "#FF9C00"
  inner_segment:
    color: "#FFCC99"
```

**Reason:** Each segment owns its properties

---

### 6. Removed Factor-Based Sizing

**Old:**
```yaml
segments:
  factor: 4
```

**New:**
Use explicit `bar_width` for each segment

**Reason:** Factor calculation was opaque and confusing

---

### 7. Removed All Aliases

**Old:**
- `thickness` (alias for horizontal when same as vertical)
- `curve` (alias for radius)
- `corner_radius` (alias for radius)

**New:**
Single name per parameter: `bar_width`, `bar_height`, `outer_curve`, `inner_curve`

**Reason:** One clear way to do things

---

## ✨ New Features

### 1. Control Inner Curves

**Previously:** Inner curves auto-calculated (LCARS formula), no override possible

**Now:**
```yaml
outer_segment:
  outer_curve: 85
  inner_curve: 30       # 🆕 Override LCARS default (42.5)
```

Each segment exposes both `outer_curve` and `inner_curve`.

---

### 2. Complete Parameter Visibility

All 8 parameters are now explicit and controllable:

```yaml
segments:
  outer_segment:
    bar_width: 30       # 1. Sidebar thickness
    bar_height: 30      # 2. Top bar thickness
    outer_curve: 85     # 3. Outside corner
    inner_curve: 42.5   # 4. Inside corner

  inner_segment:
    bar_width: 60       # 5. Sidebar thickness
    bar_height: 60      # 6. Top bar thickness
    outer_curve: 55     # 7. Outside corner
    inner_curve: 27.5   # 8. Inside corner
```

---

## 🔄 Migration Guide

### Before (v1.x)
```yaml
elbow:
  type: header-left
  style: segmented
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
    colors:
      outer: "#FF9C00"
      inner: "#FFCC99"
```

### After (v2.0)
```yaml
elbow:
  type: header-left
  style: segmented
  segments:
    gap: 4
    outer_segment:
      bar_width: 30
      bar_height: 30
      outer_curve: 85
      color: "#FF9C00"
    inner_segment:
      bar_width: 60
      bar_height: 60
      outer_curve: 55
      color: "#FFCC99"
```

---

## 📚 Documentation

### New Files
- `/doc/proposals/SEGMENTED_ELBOW_FINAL_SCHEMA.md` - Complete schema spec
- `/doc-old/SEGMENTED_ELBOW_SCHEMA_V2_MIGRATION.md` - Migration guide
- `/test-new-clean-schema.yaml` - Working examples

### Updated Files
- `/doc/user/configuration/segmented-elbow-anatomy.md` - Visual guide

---

## 🐛 Bug Fixes

### Fixed Inner Path Dimensions

**Issue:** Inner segment path extended to full SVG width instead of being constrained

**Fix:** Reduce inner segment canvas by offset:
```javascript
const innerWidth = width - offset.x;
const innerHeight = height - offset.y;
```

**Result:** Inner segment correctly positioned and sized

---

## 💡 Design Rationale

### Why Break Compatibility?

The old schema had **fundamental clarity issues**:

1. **"inner/outer" overload** - Used for both segment names AND curve names
2. **Multiple aliases** - 3+ ways to specify the same thing
3. **Scattered properties** - Radius at top level, colors in separate object
4. **Hidden parameters** - Inner curves couldn't be controlled
5. **Confusing naming** - `segments.inner.radius` = "inner segment's outer radius"

### New Schema Benefits

1. **Explicit** - Every parameter clearly named
2. **Self-documenting** - Names describe what they control
3. **Predictable** - Sensible defaults, full control when needed
4. **Single source** - All segment properties in one place
5. **Complete** - All 8 parameters accessible

---

## 📊 Parameter Quick Reference

### Each Segment Has 4 Parameters

| Parameter | Controls | Default |
|-----------|----------|---------|
| `bar_width` | Horizontal bar thickness | **Required** |
| `bar_height` | Vertical bar thickness | `bar_width` |
| `outer_curve` | Outside corner radius | `bar_width / 2` (outer)<br>Concentric (inner) |
| `inner_curve` | Inside corner radius | `outer_curve / 2` |

### Visual Mapping

```
        ╭─────────────────  ← outer_segment.outer_curve
        │╭────────────────  ← outer_segment.inner_curve
  gap   ││
        ││    ╭──────────  ← inner_segment.outer_curve
        ││    │╭─────────  ← inner_segment.inner_curve
        ││    ││
        └┴────┴┴─────────
         bar   bar
         width width
```

---

## ⚠️ Upgrade Instructions

### Step 1: Update LCARdS
```bash
# Update to v2.0.0
```

### Step 2: Migrate Configs

**Option A:** Manual migration (see examples above)

**Option B:** Automated script (see migration guide)

### Step 3: Test

Load configs in Home Assistant and verify:
- Segments render correctly
- Colors applied properly
- Curves positioned as expected

### Step 4: Adjust

Fine-tune `outer_curve` values if needed. Concentricity may differ slightly from old auto-calculations.

---

## 🎯 Common Patterns

### Pattern 1: Minimal (Default Everything)
```yaml
segments:
  outer_segment:
    bar_width: 30
    outer_curve: 85
  inner_segment:
    bar_width: 60
```

### Pattern 2: Break Concentricity
```yaml
segments:
  outer_segment:
    bar_width: 30
    outer_curve: 85
  inner_segment:
    bar_width: 60
    outer_curve: 55      # Not concentric!
```

### Pattern 3: Full Control
```yaml
segments:
  gap: 6
  outer_segment:
    bar_width: 25
    bar_height: 35
    outer_curve: 60
    inner_curve: 30
  inner_segment:
    bar_width: 80
    bar_height: 70
    outer_curve: 45
    inner_curve: 20
```

---

## 🔗 Related Issues

- Original confusion: "segments.inner.radius is what? the inner elbow's outer radius?"
- Path dimension bug: Inner segment extended beyond bounds
- Alias proliferation: Too many ways to say the same thing

All resolved in v2.0.0.

---

## 📝 Implementation Details

### Files Modified
- `/src/cards/lcards-elbow-button.js`
  - `_validateElbowConfig()` - New schema parsing
  - `_calculateSegmentedGeometry()` - Simplified logic
  - `_generateSegmentedElbowSVG()` - Fixed inner dimensions

### Lines Changed
- ~150 lines in config parser
- ~100 lines in geometry calculator
- Removed ~80 lines of alias/legacy code

### Code Simplification
- **Before:** Complex nested conditionals for multiple modes
- **After:** Straightforward default application

---

## ✅ Testing

### Test Files
- `/test-new-clean-schema.yaml` - 4 examples covering all patterns
- All examples build successfully

### Validation
- ✅ Build succeeds (webpack 5.97.0)
- ✅ Required parameters validated
- ✅ Defaults applied correctly
- ✅ Colors propagate properly
- ✅ Inner dimensions fixed

---

## 📦 Version Info

- **Previous:** 1.24.18
- **Current:** 2.0.0
- **Breaking Change:** Yes (major version bump)
- **Migration Required:** Yes

---

## 🎉 Summary

**What Changed:**
- Complete schema redesign for clarity
- All parameters explicitly named
- Inner curves now controllable
- Fixed inner path dimension bug

**What's Better:**
- Crystal clear parameter names
- No more confusion about which "inner/outer"
- Full control over all 8 parameters
- Self-documenting configuration

**Migration:**
- See `/doc-old/SEGMENTED_ELBOW_SCHEMA_V2_MIGRATION.md`
- Examples in `/test-new-clean-schema.yaml`
- Schema spec in `/doc/proposals/SEGMENTED_ELBOW_FINAL_SCHEMA.md`

**Bottom Line:**
Old configs won't work, but new configs are **much clearer** and **more powerful**! 🖖
