# Segmented Elbow v2.0.0 - What You Need to Know

## The New Clean Schema (v2.0.0)

### Your Config - Before vs After

**BEFORE (v1.x - CONFUSING):**
```yaml
elbow:
  radius:
    outer: 85              # Why is this here?
  segments:
    gap: 4
    outer:                 # Outer what?
      horizontal: 30       # Horizontal what?
      vertical: 30
    inner:                 # Inner what?
      horizontal: 60
      vertical: 60
      radius: 55           # Which radius??? 😵
```

**AFTER (v2.0.0 - CRYSTAL CLEAR):**
```yaml
elbow:
  segments:
    gap: 4
    outer_segment:         # The outer frame
      bar_width: 30        # Sidebar thickness
      bar_height: 30       # Top bar thickness
      outer_curve: 85      # Outside corner
      # inner_curve: 42.5 (auto)
    inner_segment:         # The inner content area
      bar_width: 60        # Sidebar thickness
      bar_height: 60       # Top bar thickness
      outer_curve: 55      # Outside corner ✅
      # inner_curve: 27.5 (auto)
```

---

## What Each Parameter Controls

```yaml
segments:
  gap: 4                   # Space between the two segments

  outer_segment:           # The thin frame around the edge
    bar_width: 30          # ① Width of the vertical sidebar
    bar_height: 30         # ② Height of the horizontal top bar
    outer_curve: 85        # ③ Radius of the outside corner (big curve)
    inner_curve: 42.5      # ④ Radius of the inside corner (auto: 85/2)
    color: "#FF9C00"       # Optional color

  inner_segment:           # The thick content area inside
    bar_width: 60          # ⑤ Width of the vertical sidebar
    bar_height: 60         # ⑥ Height of the horizontal top bar
    outer_curve: 55        # ⑦ Radius of the outside corner (your setting!)
    inner_curve: 27.5      # ⑧ Radius of the inside corner (auto: 55/2)
    color: "#FFCC99"       # Optional color
```

**8 parameters total** - you control them all!

---

## Visual Guide

```
         ╭──────────────────────  ← ③ outer_segment.outer_curve (85px)
         │╭─────────────────────  ← ④ outer_segment.inner_curve (42.5px, auto)
         ││
  gap    ││
  (4px)  ││     ╭──────────────  ← ⑦ inner_segment.outer_curve (55px)
         ││     │╭─────────────  ← ⑧ inner_segment.inner_curve (27.5px, auto)
         ││     ││
         ││     ││
         └┴─────┴┴────────────
          ①②    ⑤⑥
          30px  60px
          bar_width
```

**The four curves:**
- ③ & ④: Outer segment edges (frame)
- ⑦ & ⑧: Inner segment edges (content)

**The four widths:**
- ①: Outer vertical bar (30px)
- ②: Outer horizontal bar (30px)
- ⑤: Inner vertical bar (60px)
- ⑥: Inner horizontal bar (60px)

---

## Common Use Cases

### Use Case 1: "I just want it to work" (Minimal Config)

```yaml
segments:
  outer_segment:
    bar_width: 30
    outer_curve: 85
  inner_segment:
    bar_width: 60
```

**What happens:**
- Bar heights default to widths (30 & 60)
- Inner segment curve auto-calculated (concentric: 38.5px)
- Inner curves auto-calculated (LCARS formula: /2)

---

### Use Case 2: "I want to fine-tune the inner corner"

```yaml
segments:
  outer_segment:
    bar_width: 30
    outer_curve: 85
  inner_segment:
    bar_width: 60
    outer_curve: 55      # Override the auto 38.5px
```

**Why you'd do this:**
- Auto-concentric (38.5px) might look too tight
- Your design spec says 55px
- You want a looser inner curve

---

### Use Case 3: "I want complete control"

```yaml
segments:
  gap: 6
  outer_segment:
    bar_width: 25
    bar_height: 35       # Different from width!
    outer_curve: 60
    inner_curve: 30      # Override LCARS default (30 instead of 30)
    color: "#FF9C00"
  inner_segment:
    bar_width: 80
    bar_height: 70       # Different from width!
    outer_curve: 45
    inner_curve: 20      # Override LCARS default (20 instead of 22.5)
    color: "#FFCC99"
```

**When you'd do this:**
- Matching a specific design mockup
- Asymmetric bars (tall horizontal, thin vertical)
- Non-standard curve ratios

---

## Migration Cheat Sheet

| Old Name | New Name | Example |
|----------|----------|---------|
| `radius.outer` | `outer_segment.outer_curve` | `85` |
| `segments.outer` | `segments.outer_segment` | - |
| `segments.inner` | `segments.inner_segment` | - |
| `outer.horizontal` | `outer_segment.bar_width` | `30` |
| `outer.vertical` | `outer_segment.bar_height` | `30` |
| `inner.horizontal` | `inner_segment.bar_width` | `60` |
| `inner.vertical` | `inner_segment.bar_height` | `60` |
| `inner.radius` | `inner_segment.outer_curve` | `55` |
| `inner.curve` | `inner_segment.outer_curve` | `55` |
| `colors.outer` | `outer_segment.color` | `"#FF9C00"` |
| `colors.inner` | `inner_segment.color` | `"#FFCC99"` |

---

## What You Can't Control (And Why)

### Inner Curves (Default Behavior)

Both segments have an **inner curve** that defaults to `outer_curve / 2` (LCARS formula).

**Why auto-calculate?**
- LCARS aesthetic requires this ratio
- Maintains authentic proportions
- You can override if needed

**Example:**
```yaml
outer_segment:
  outer_curve: 85
  inner_curve: 42.5 (auto: 85/2)
  # Or override:
  inner_curve: 30       # Custom value
```

---

## Frequently Asked Questions

### Q: "Which curve is which?"

**A:** Think **outside vs inside**:
- `outer_curve` = The **outside edge** of that segment (convex curve)
- `inner_curve` = The **inside edge** of that segment (concave curve)

### Q: "What's the difference between outer_segment and inner_segment?"

**A:**
- `outer_segment` = The **thin frame** around the edge
- `inner_segment` = The **thick content area** inside the frame

### Q: "Why is my inner_segment.outer_curve 38.5px when I didn't set it?"

**A:** Auto-concentric calculation:
```
outer_segment.inner_curve = 42.5 (from 85/2)
Gap = 4
inner_segment.outer_curve = 42.5 - 4 = 38.5 (auto)
```

To override: Set `inner_segment.outer_curve: 55` explicitly.

### Q: "Can I make equal-width segments?"

**A:** Yes! Set the same `bar_width`:
```yaml
outer_segment:
  bar_width: 40
inner_segment:
  bar_width: 40
```

### Q: "What if I want different horizontal/vertical bar widths?"

**A:** Use both `bar_width` and `bar_height`:
```yaml
outer_segment:
  bar_width: 20        # Thin sidebar
  bar_height: 40       # Thick top bar
```

---

## Testing Your Config

### Step 1: Start Minimal

```yaml
segments:
  outer_segment: { bar_width: 30, outer_curve: 85 }
  inner_segment: { bar_width: 60 }
```

Load in HA, see how it looks.

### Step 2: Adjust Inner Curve (If Needed)

```yaml
inner_segment:
  bar_width: 60
  outer_curve: 55      # Try different values: 45, 50, 55, 60
```

### Step 3: Fine-Tune Colors/Dimensions

```yaml
outer_segment:
  bar_width: 30
  outer_curve: 85
  color: "#FF9C00"
inner_segment:
  bar_width: 60
  outer_curve: 55
  color: "#FFCC99"
```

---

## Files to Reference

1. **Schema spec:** `/doc/proposals/SEGMENTED_ELBOW_FINAL_SCHEMA.md`
2. **Migration guide:** `/doc-old/SEGMENTED_ELBOW_SCHEMA_V2_MIGRATION.md`
3. **Working examples:** `/test-new-clean-schema.yaml`
4. **Visual anatomy:** `/doc/user/configuration/segmented-elbow-anatomy.md`
5. **Changelog:** `/doc-old/CHANGELOG_v2.0.0_SEGMENTED_ELBOW.md`

---

## Summary

✅ **8 parameters total** (4 per segment)
✅ **Clear names** (`bar_width`, `bar_height`, `outer_curve`, `inner_curve`)
✅ **Sensible defaults** (square bars, LCARS curves, concentricity)
✅ **Full control** when needed
✅ **No more confusion** about "which inner/outer"

**Example for your case:**
```yaml
segments:
  gap: 4
  outer_segment:
    bar_width: 30
    outer_curve: 85
  inner_segment:
    bar_width: 60
    outer_curve: 55    # You control this!
```

That's it! 🖖
