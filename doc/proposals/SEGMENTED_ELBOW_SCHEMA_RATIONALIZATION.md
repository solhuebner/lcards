# Segmented Elbow Schema Rationalization

## The Confusion

We have **two types of "inner/outer"** which creates ambiguity:

1. **Segment naming:** "outer segment" (thin frame) vs "inner segment" (thick content area)
2. **Radius naming:** Each segment has an "outer radius" (convex curve) and "inner radius" (concave curve)

This creates confusing parameter names like:
- `segments.inner.radius` = Inner segment's outer radius (😵)
- `outer.innerRadius` (internal) = Outer segment's inner radius (😵😵)

---

## Current Schema Reality

### What Your Config Actually Does

```yaml
elbow:
  radius:
    outer: 85          # → Outer segment's outer radius
  segments:
    outer:
      horizontal: 30   # → Outer segment bar thickness
      radius: ???      # → Outer segment's outer radius (overrides radius.outer)
    inner:
      horizontal: 60   # → Inner segment bar thickness
      radius: 55       # → Inner segment's outer radius (🎯 THIS)
```

### Internal Calculation

```javascript
// Outer segment (thin frame):
outerSegmentOuterRadius = 85     // From radius.outer
outerSegmentInnerRadius = 42.5   // Auto: 85 / 2 (LCARS formula)

// Inner segment (thick content):
innerSegmentOuterRadius = 55     // From segments.inner.radius
innerSegmentInnerRadius = 27.5   // Auto: 55 / 2 (LCARS formula)
```

### Visual Reality

Your SVG shows exactly this:

```xml
<!-- Outer segment -->
<path d="... A 85 85 ... A 42.5 42.5 ..." />
         ↑ outer    ↑ inner

<!-- Inner segment -->
<path d="... A 55 55 ... A 27.5 27.5 ..." />
         ↑ outer    ↑ inner
```

**Four radii total:**
1. Outer segment outer radius: **85px** (from `radius.outer`)
2. Outer segment inner radius: **42.5px** (auto-calculated)
3. Inner segment outer radius: **55px** (from `segments.inner.radius`)
4. Inner segment inner radius: **27.5px** (auto-calculated)

---

## Proposed Schema Improvements

### Option 1: Rename Parameters (Clearer but Breaking)

```yaml
elbow:
  segments:
    # Outer segment (the frame)
    frame:
      thickness: 30              # Bar width
      corner_radius: 85          # Outer curve radius

    # Inner segment (the content area)
    content:
      thickness: 60              # Bar width
      corner_radius: 55          # Outer curve radius

    gap: 4
```

**Pro:** Much clearer terminology
**Con:** Breaking change, requires migration

---

### Option 2: Better Documentation (Non-breaking)

Keep current schema but add clarity through naming:

```yaml
elbow:
  radius:
    outer: 85                    # Outer segment's corner radius

  segments:
    gap: 4

    outer:                       # Outer segment = thin frame
      horizontal: 30
      vertical: 30
      corner_radius: 85          # Override outer segment corner

    inner:                       # Inner segment = thick content
      horizontal: 60
      vertical: 60
      corner_radius: 55          # Inner segment corner radius
```

**Changes:**
- `segments.outer.radius` → `segments.outer.corner_radius`
- `segments.inner.radius` → `segments.inner.corner_radius`

**Pro:** Clearer, maintains some compatibility
**Con:** Still has "outer.inner" terminology issue

---

### Option 3: Explicit Naming (Most Clear, Breaking)

```yaml
elbow:
  segments:
    gap: 4

    # Segment 1: The outer frame (thin)
    outer_segment:
      bar_thickness: 30
      corner_radius: 85

    # Segment 2: The inner content area (thick)
    inner_segment:
      bar_thickness: 60
      corner_radius: 55
```

**Pro:** No ambiguity whatsoever
**Con:** Most breaking, verbose

---

## My Recommendation: Hybrid Approach

**Keep backwards compatibility** but add aliases with clearer names:

```yaml
elbow:
  segments:
    gap: 4

    outer:
      horizontal: 30             # Keep existing
      # NEW ALIASES (optional, clearer):
      thickness: 30              # = horizontal (if same for both)
      curve: 85                  # = outer segment's corner radius

    inner:
      horizontal: 60             # Keep existing
      # NEW ALIASES (optional, clearer):
      thickness: 60              # = horizontal (if same for both)
      curve: 55                  # = inner segment's corner radius
```

**Implementation:**
```javascript
// Parse with fallbacks
outer: {
    horizontal: config.outer.horizontal ?? config.outer.thickness,
    vertical: config.outer.vertical ?? config.outer.thickness,
    radius: config.outer.curve ?? config.outer.radius
}
```

**Benefits:**
- ✅ Backwards compatible (old configs work)
- ✅ Clearer new parameter names
- ✅ `curve` is unambiguous (vs `radius`)
- ✅ `thickness` clearer than `horizontal/vertical`
- ✅ Gradual migration path

---

## Documentation Clarity

### Current Terminology Issues

**Problem terms:**
- "inner radius" - inner of what? segment or curve?
- "outer radius" - outer of what?
- `segments.inner.radius` - which radius?

### Proposed Documentation

Always specify **both levels**:

❌ **Bad:** "Set the inner radius"
✅ **Good:** "Set the inner segment's corner radius"

❌ **Bad:** "The outer radius defaults to..."
✅ **Good:** "The outer segment's outer curve defaults to..."

**Vocabulary:**
- **Segment:** outer (frame) or inner (content)
- **Curve:** the corner radius of that segment
- **Bar:** the straight edges (thickness = horizontal/vertical)

---

## Quick Reference Table

| Parameter | Controls | Default |
|-----------|----------|---------|
| `radius.outer` | Outer segment corner curve | `horizontal / 2` |
| `segments.outer.horizontal` | Outer segment bar thickness | From `border.horizontal` |
| `segments.outer.radius` | Outer segment corner curve | Uses `radius.outer` |
| `segments.inner.horizontal` | Inner segment bar thickness | Auto-calculated |
| `segments.inner.radius` | Inner segment corner curve | Concentric: `(outer_inner - gap)` |

**The Four Radii (internal):**

```
Segment    | Edge  | Internal Variable          | User Control
-----------|-------|----------------------------|------------------
Outer      | Outer | outerSegmentOuterRadius   | radius.outer or segments.outer.radius
Outer      | Inner | outerSegmentInnerRadius   | Auto: outerRadius / 2
Inner      | Outer | innerSegmentOuterRadius   | segments.inner.radius or Auto
Inner      | Inner | innerSegmentInnerRadius   | Auto: innerOuterRadius / 2
```

---

## Example with Clear Annotations

```yaml
elbow:
  type: header-left
  style: segmented

  # Global corner radius (for outer segment)
  radius:
    outer: 85                    # Outer segment's corner radius

  segments:
    gap: 4                       # Space between segments

    # Outer segment = thin frame around edge
    outer:
      horizontal: 30             # Frame bar thickness
      vertical: 30
      # Optional: override corner radius for this segment
      # radius: 85               # (same as radius.outer above)

    # Inner segment = thick content area inside frame
    inner:
      horizontal: 60             # Content bar thickness
      vertical: 60
      # Optional: override auto-concentric calculation
      radius: 55                 # Inner segment's corner radius
                                 # (Default would be 38.5px = (85/2) - 4)
```

**Result:**
```
Outer segment (frame):
  - Bar thickness: 30px
  - Corner radius: 85px → inner curve: 42.5px (auto)

Inner segment (content):
  - Bar thickness: 60px
  - Corner radius: 55px → inner curve: 27.5px (auto)
  - Positioned at offset (34, 34) from outer segment
```

---

## Implementation Plan

### Phase 1: Documentation (Immediate)
1. ✅ Update all docs to use "segment" + "corner/curve" language
2. ✅ Create visual diagrams showing four radii
3. ✅ Add "Quick Reference" with annotated examples

### Phase 2: Aliases (Next Release)
1. Add `curve` as alias for `radius` in segments
2. Add `thickness` as alias for `horizontal` (when same as vertical)
3. Maintain full backwards compatibility

### Phase 3: Deprecation (Future)
1. Mark old parameter names as deprecated (with warnings)
2. Update all examples to use new names
3. Keep old names working for 2-3 releases

### Phase 4: Migration (Far Future)
1. Remove deprecated names (major version bump)
2. Only new clean schema remains

---

## Summary

**The Root Issue:**
- "inner/outer" used for BOTH segment names AND radius names
- Creates terms like "inner segment's outer radius" 😵

**Immediate Fix:**
- Document clearly: "segment's corner curve" terminology
- Add visual diagrams showing all four radii
- Create annotated examples

**Future Fix:**
- Add aliases: `curve` (vs `radius`), `thickness` (vs `horizontal`)
- Gradual migration to clearer names
- Maintain backwards compatibility

**Your Specific Case:**
```yaml
segments.inner.radius: 55    # Inner segment's corner radius (outer curve of inner segment)
```

Is this clearer? Should we:
1. Just improve documentation (non-breaking)
2. Add aliases now (backwards compatible)
3. Plan full schema rename (breaking, future)
