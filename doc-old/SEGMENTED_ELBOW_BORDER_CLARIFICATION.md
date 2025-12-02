# Segmented Elbow - border vs segments Clarification

## Quick Answer

**For segmented style:** `border` is **NOT used** and **NOT needed**.

```yaml
# ❌ WRONG - border is ignored for segmented style
elbow:
  style: segmented
  border:
    horizontal: 200      # NOT USED!
    vertical: 30         # NOT USED!
  segments:
    outer_segment:
      bar_width: 30      # THIS is what matters

# ✅ CORRECT - no border needed
elbow:
  style: segmented
  segments:
    outer_segment:
      bar_width: 30      # Bar dimensions come from here
      bar_height: 30
    inner_segment:
      bar_width: 60
      bar_height: 60
```

---

## Why is border Ignored?

### Simple Style (border IS used)

For **simple style**, `border` defines the elbow dimensions:

```yaml
elbow:
  type: header-left
  style: simple         # Simple style
  border:
    horizontal: 90      # ✅ USED - defines sidebar width
    vertical: 20        # ✅ USED - defines top bar height
```

The elbow bars are drawn at these dimensions.

---

### Segmented Style (border is NOT used)

For **segmented style**, each segment has its own dimensions:

```yaml
elbow:
  type: header-left
  style: segmented      # Segmented style
  segments:
    outer_segment:
      bar_width: 30     # ✅ USED - outer segment sidebar
      bar_height: 30    # ✅ USED - outer segment top bar
    inner_segment:
      bar_width: 60     # ✅ USED - inner segment sidebar
      bar_height: 60    # ✅ USED - inner segment top bar
```

Each segment controls its own bar dimensions independently.

---

## Where Do SVG Dimensions Come From?

The **total SVG canvas size** comes from the **parent card's size configuration**, not from `border`.

```yaml
type: custom:lcards-elbow-button
entity: light.example

# Canvas size determined by:
# - grid_options (rows/columns)
# - Or parent card layout
# - NOT from elbow.border

elbow:
  style: segmented
  segments:
    # These define BAR THICKNESS, not canvas size
    outer_segment:
      bar_width: 30
    inner_segment:
      bar_width: 60

grid_options:
  rows: 3              # This affects canvas size
  columns: 2
```

---

## Code Evidence

### Simple Elbow Uses border

```javascript
// From _calculateSimpleElbowGeometry()
return {
    position,
    side,
    horizontal: border.horizontal,  // ✅ Uses border
    vertical: border.vertical,      // ✅ Uses border
    outerRadius,
    innerRadius
};
```

### Segmented Elbow Does NOT Use border

```javascript
// From _calculateSegmentedGeometry()
const { gap, outer_segment, inner_segment } = segments;

// Uses segment bar dimensions, NOT border
const outerHorizontal = outer_segment.bar_width;     // ✅ From segment
const outerVertical = outer_segment.bar_height;      // ✅ From segment
const innerHorizontal = inner_segment.bar_width;     // ✅ From segment
const innerVertical = inner_segment.bar_height;      // ✅ From segment

// border is never referenced!
```

---

## Practical Impact

### What Happens if You Include border?

**Nothing!** It's silently ignored.

```yaml
elbow:
  style: segmented
  border:
    horizontal: 999    # Ignored
    vertical: 999      # Ignored
  segments:
    outer_segment:
      bar_width: 30    # This is what's used
```

Result: Bars are 30px thick (not 999px).

---

### Should You Remove It?

**Yes, for clarity.** While harmless, it's confusing:

```yaml
# ❌ Misleading - looks like it does something
elbow:
  style: segmented
  border:
    horizontal: 200
  segments:
    outer_segment:
      bar_width: 30

# ✅ Clear - shows what actually matters
elbow:
  style: segmented
  segments:
    outer_segment:
      bar_width: 30
```

---

## Summary Table

| Parameter | Simple Style | Segmented Style |
|-----------|--------------|-----------------|
| `border.horizontal` | ✅ Used (defines sidebar) | ❌ Ignored |
| `border.vertical` | ✅ Used (defines top bar) | ❌ Ignored |
| `segments.outer_segment.bar_width` | N/A | ✅ Used |
| `segments.outer_segment.bar_height` | N/A | ✅ Used |
| `segments.inner_segment.bar_width` | N/A | ✅ Used |
| `segments.inner_segment.bar_height` | N/A | ✅ Used |

---

## Updated Schema (Correct)

```yaml
type: custom:lcards-elbow-button
entity: <entity_id>

elbow:
  type: header-left | header-right | footer-left | footer-right

  # Simple style - uses border
  style: simple
  border:
    horizontal: <number>   # ✅ Used for simple style
    vertical: <number>     # ✅ Used for simple style

  # OR

  # Segmented style - does NOT use border
  style: segmented
  segments:
    gap: <number>
    outer_segment:
      bar_width: <number>  # ✅ Used for segmented style
      bar_height: <number>
      outer_curve: <number>
      inner_curve: <number>
    inner_segment:
      bar_width: <number>  # ✅ Used for segmented style
      bar_height: <number>
      outer_curve: <number>
      inner_curve: <number>
```

---

## Migration Note

If you have old configs with `border` in segmented style:

```yaml
# OLD (v1.x or test configs with border)
elbow:
  style: segmented
  border:                # This was never used!
    horizontal: 200
    vertical: 30
  segments:
    outer_segment:
      bar_width: 30
```

**Remove it:**

```yaml
# NEW (v2.0.0 - cleaner)
elbow:
  style: segmented
  segments:
    outer_segment:
      bar_width: 30
```

No functional change, just clearer configuration.

---

## Final Answer

**Question:** "Does elbow.border actually do anything for segmented style?"

**Answer:** **No.** For segmented style, `border` is completely ignored. Only the segment `bar_width` and `bar_height` parameters matter. The `border` parameter is only used for **simple style** elbows.
