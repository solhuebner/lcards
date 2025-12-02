# Segmented Elbow Schema Improvements - Migration Guide

**Version:** 1.24.17
**Status:** ✅ Backwards Compatible
**Breaking Changes:** None

---

## What Changed

Added **clearer parameter aliases** while maintaining full backwards compatibility.

### New Parameter Names (Aliases)

| Old Name | New Alias 1 | New Alias 2 | Clarity |
|----------|-------------|-------------|---------|
| `segments.outer.radius` | `segments.outer.curve` | `segments.outer.corner_radius` | ✅ Much clearer |
| `segments.inner.radius` | `segments.inner.curve` | `segments.inner.corner_radius` | ✅ Much clearer |
| `segments.outer.horizontal`<br>`segments.outer.vertical` (when same) | `segments.outer.thickness` | - | ✅ Simpler |
| `segments.inner.horizontal`<br>`segments.inner.vertical` (when same) | `segments.inner.thickness` | - | ✅ Simpler |

---

## Why This Helps

### Problem: Ambiguous Terminology

The old schema had **confusing "inner/outer" overload**:

```yaml
segments:
  inner:           # Inner SEGMENT
    radius: 55     # But which radius? Inner or outer curve?
                   # Answer: outer curve of inner segment 😵
```

### Solution: Clearer Names

```yaml
segments:
  inner:                # Inner segment (the content area)
    curve: 55           # The corner curve! ✅ Obvious!
    # OR
    corner_radius: 55   # Even more explicit! ✅
```

---

## Migration Options

### Option 1: Keep Old Syntax (Still Works!)

```yaml
elbow:
  segments:
    outer:
      horizontal: 30
      vertical: 30
      radius: 85
    inner:
      horizontal: 60
      vertical: 60
      radius: 55
```

✅ **No changes needed** - all existing configs work

---

### Option 2: Migrate to "curve"

```yaml
elbow:
  segments:
    outer:
      horizontal: 30
      vertical: 30
      curve: 85        # Clearer!
    inner:
      horizontal: 60
      vertical: 60
      curve: 55        # Clearer!
```

✅ **Recommended** - clearest while staying concise

---

### Option 3: Migrate to "corner_radius"

```yaml
elbow:
  segments:
    outer:
      horizontal: 30
      vertical: 30
      corner_radius: 85    # Most explicit!
    inner:
      horizontal: 60
      vertical: 60
      corner_radius: 55    # Most explicit!
```

✅ **Most verbose but clearest** for complex configs

---

### Option 4: Use "thickness" shorthand

When `horizontal` and `vertical` are the same:

```yaml
elbow:
  segments:
    outer:
      thickness: 30     # Instead of horizontal: 30, vertical: 30
      curve: 85
    inner:
      thickness: 60     # Instead of horizontal: 60, vertical: 60
      curve: 55
```

✅ **Cleanest syntax** for common use cases

---

## Recommended Syntax by Use Case

### Simple Elbow (Auto Sizing)
```yaml
elbow:
  type: header-left
  style: segmented
  radius:
    outer: 85
  segments:
    gap: 4
```
**Clearest:** Just use defaults, minimal config

---

### Custom Segment Sizes (Equal bars)
```yaml
elbow:
  segments:
    gap: 4
    outer:
      thickness: 30     # ← Use thickness shorthand
      curve: 85         # ← Use curve
    inner:
      thickness: 60
      curve: 55
```
**Clearest:** `thickness` + `curve` terminology

---

### Custom Segment Sizes (Unequal bars)
```yaml
elbow:
  segments:
    gap: 4
    outer:
      horizontal: 30
      vertical: 20      # Different!
      curve: 85
    inner:
      horizontal: 60
      vertical: 80      # Different!
      curve: 55
```
**Clearest:** Keep `horizontal`/`vertical`, use `curve`

---

### Fine-Tuning (Breaking Concentricity)
```yaml
elbow:
  radius:
    outer: 85
  segments:
    outer:
      thickness: 30
    inner:
      thickness: 60
      corner_radius: 55  # ← Most explicit for overrides
```
**Clearest:** Use `corner_radius` when overriding defaults

---

## Parameter Priority (Fallback Chain)

When multiple names are present, this order is used:

### For Thickness
1. `horizontal` (if set)
2. `thickness` (if horizontal not set)
3. Default calculation

### For Corner Radius
1. `radius` (if set - backwards compat)
2. `curve` (if radius not set)
3. `corner_radius` (if neither radius nor curve set)
4. Default calculation

**Example:**
```yaml
segments:
  inner:
    thickness: 60      # Used for both horizontal/vertical
    curve: 55          # Used for radius
    corner_radius: 60  # IGNORED (curve takes priority)
    radius: 70         # IGNORED (curve takes priority)
```

Result: `horizontal: 60, vertical: 60, radius: 55`

---

## Documentation Updates

All documentation now uses the clearer syntax:

### Updated Guides
- ✅ `/doc/user/configuration/segmented-elbow-simple-guide.md`
- ✅ `/doc/user/configuration/segmented-elbow-anatomy.md`
- ✅ `/doc/user/configuration/elbow-button-quick-reference.md`

### Examples Updated
All examples now show:
```yaml
# RECOMMENDED SYNTAX
segments:
  outer:
    thickness: 30
    curve: 85
  inner:
    thickness: 60
    curve: 55
```

---

## Terminology Glossary

### Old Terms → New Terms

| Old | New | What It Means |
|-----|-----|---------------|
| "radius" | "curve" or "corner_radius" | The corner curve radius |
| "inner radius" | "inner segment's corner" | Outer curve of inner segment |
| "outer radius" | "outer segment's corner" | Outer curve of outer segment |
| "horizontal/vertical" | "thickness" (when same) | Bar thickness |

### Speaking About Elbows

❌ **Confusing:** "Set the inner radius to 55"
✅ **Clear:** "Set the inner segment's corner curve to 55"

❌ **Confusing:** "The outer segment's inner radius"
✅ **Clear:** "The outer segment's concave curve" (auto-calculated)

---

## Visual Quick Reference

```yaml
elbow:
  segments:
    # Outer segment = thin frame
    outer:
      thickness: 30        # How thick the bars are
      curve: 85            # How round the corner is

    # Inner segment = thick content
    inner:
      thickness: 60        # How thick the bars are
      curve: 55            # How round the corner is
```

**Result:**
```
      ╭─────  ← 85px curve (outer segment)
      │╭────  ← Auto-calculated (42.5px)
 4px →││
      │  ╭──  ← 55px curve (inner segment)
      │  │╭─  ← Auto-calculated (27.5px)
      │  ││
      └──┴┴──
      30px 60px (thickness)
```

---

## FAQ

### Q: Do I need to update my configs?
**A:** No! Old syntax still works. Update at your convenience.

### Q: Which new name should I use?
**A:**
- **curve** - Good for most cases, short and clear
- **corner_radius** - Best for complex configs, most explicit
- **thickness** - When horizontal = vertical, simplest

### Q: Can I mix old and new syntax?
**A:** Yes! They're all aliases. `radius: 85` and `curve: 85` are identical.

### Q: Will the old names be removed?
**A:** Not planned. They'll stay for backwards compatibility.

### Q: What if I specify both `radius` and `curve`?
**A:** `radius` takes priority (backwards compat). Don't mix them.

---

## Summary

✅ **Added:** Clearer parameter aliases (`curve`, `corner_radius`, `thickness`)
✅ **Backwards Compatible:** All old configs work unchanged
✅ **Recommended:** Use `curve` and `thickness` for new configs
✅ **Documentation:** Updated with clearer examples
✅ **Migration:** Optional, migrate at your own pace

**Bottom line:** Your existing configs work, but new clearer names are available when you want them!
