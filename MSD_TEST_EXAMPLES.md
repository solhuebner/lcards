# MSD Anchor Processing - Quick Test Examples

## Quick Start Testing

Copy these YAML configs into Home Assistant Lovelace to test the refactored anchor processing.

---

## Test 1: Builtin SVG with SVG Anchors

**What it tests:** SVG anchor extraction, line overlay rendering

```yaml
type: custom:lcards-msd-card
msd:
  base_svg:
    source: builtin:ncc-1701-a
  overlays:
    # Line using SVG anchors (extracted from builtin SVG)
    - id: test_line_1
      type: line
      anchor: cpu_core
      attach_to: memory_core
      style:
        stroke: "#00ffff"
        stroke-width: 2

    # Label at SVG anchor
    - id: test_label_1
      type: label
      anchor: cpu_core
      text: "CPU Core"
      style:
        color: "#ff9900"
        font-size: 14
```

**Expected:**
- ✅ Blue line between CPU and memory cores
- ✅ Orange label at CPU core
- ✅ Console: "svgAnchorCount: X" (where X > 0)

---

## Test 2: base_svg: "none" with Explicit ViewBox

**What it tests:** No SVG mode, explicit viewBox, user-defined anchors

```yaml
type: custom:lcards-msd-card
msd:
  base_svg:
    source: none
  view_box: [0, 0, 800, 600]
  anchors:
    center: [400, 300]
    top_left: [50, 50]
    bottom_right: [750, 550]
  overlays:
    # Line from corner to corner
    - id: diagonal_line
      type: line
      anchor: top_left
      attach_to: bottom_right
      style:
        stroke: "#00ffff"
        stroke-width: 3

    # Label at center
    - id: center_label
      type: label
      anchor: center
      text: "Center Point"
      style:
        color: "#ff9900"
        font-size: 16
        text-anchor: middle
```

**Expected:**
- ✅ Empty SVG (no background)
- ✅ Diagonal cyan line
- ✅ Orange label at center
- ✅ Console: "base_svg: none - using explicit viewBox"

---

## Test 3: Percentage Coordinates

**What it tests:** Percentage anchor resolution

```yaml
type: custom:lcards-msd-card
msd:
  base_svg:
    source: builtin:ncc-1701-a
  anchors:
    # Percentage coordinates (relative to viewBox)
    quarter: ["25%", "25%"]
    center: ["50%", "50%"]
    three_quarter: ["75%", "75%"]
  overlays:
    # Line from 25% to 75% diagonal
    - id: percent_line
      type: line
      anchor: quarter
      attach_to: three_quarter
      style:
        stroke: "#ff6600"
        stroke-width: 2

    # Labels at percentage points
    - id: label_25
      type: label
      anchor: quarter
      text: "25%"
      style:
        color: "#00ffff"
        font-size: 12

    - id: label_50
      type: label
      anchor: center
      text: "50%"
      style:
        color: "#00ffff"
        font-size: 12

    - id: label_75
      type: label
      anchor: three_quarter
      text: "75%"
      style:
        color: "#00ffff"
        font-size: 12
```

**Expected:**
- ✅ Orange diagonal line from 25% to 75%
- ✅ Three cyan labels at percentage positions
- ✅ Console: "Resolved X: 25% → [calculated]"

---

## Test 4: User Anchors Override SVG Anchors

**What it tests:** User anchor priority over SVG anchors

```yaml
type: custom:lcards-msd-card
msd:
  base_svg:
    source: builtin:ncc-1701-a
  anchors:
    # Override existing SVG anchor with custom position
    cpu_core: [500, 500]
  overlays:
    # Line to overridden anchor
    - id: override_line
      type: line
      anchor: cpu_core  # User-defined position
      attach_to: memory_core  # SVG anchor
      style:
        stroke: "#ff0000"
        stroke-width: 3

    # Label at overridden position
    - id: override_label
      type: label
      anchor: cpu_core
      text: "Overridden"
      style:
        color: "#ff0000"
        font-size: 14
```

**Expected:**
- ✅ Red line from overridden position to SVG anchor
- ✅ Red label at [500, 500] (not original SVG position)
- ✅ Console: "userAnchorCount: 1" (override counted as user)

---

## Test 5: Mixed SVG + User + Percentage Anchors

**What it tests:** All anchor types working together

```yaml
type: custom:lcards-msd-card
msd:
  base_svg:
    source: builtin:ncc-1701-a
  anchors:
    # User absolute anchor
    custom_point: [600, 400]
    # User percentage anchor
    center: ["50%", "50%"]
  overlays:
    # Line from SVG anchor to user absolute anchor
    - id: mixed_line_1
      type: line
      anchor: cpu_core  # SVG anchor
      attach_to: custom_point  # User absolute
      style:
        stroke: "#00ffff"
        stroke-width: 2

    # Line from user absolute to user percentage
    - id: mixed_line_2
      type: line
      anchor: custom_point  # User absolute
      attach_to: center  # User percentage
      style:
        stroke: "#ff9900"
        stroke-width: 2

    # Labels
    - id: label_svg
      type: label
      anchor: cpu_core
      text: "SVG"
      style:
        color: "#00ffff"
        font-size: 12

    - id: label_user
      type: label
      anchor: custom_point
      text: "User"
      style:
        color: "#ff9900"
        font-size: 12

    - id: label_percent
      type: label
      anchor: center
      text: "50%"
      style:
        color: "#ff6600"
        font-size: 12
```

**Expected:**
- ✅ Cyan line (SVG → user absolute)
- ✅ Orange line (user absolute → user percentage)
- ✅ Three labels at different anchor types
- ✅ Console: Mix of SVG/user/percentage anchors

---

## Test 6: External SVG

**What it tests:** Loading external SVG from /local/

**Prerequisites:**
1. Upload an SVG file to Home Assistant: `/config/www/test-msd.svg`
2. Add anchors as `<circle>` elements with IDs in the SVG

```yaml
type: custom:lcards-msd-card
msd:
  base_svg:
    source: /local/test-msd.svg
  overlays:
    - id: test_label
      type: label
      anchor: anchor_from_svg  # Replace with actual anchor ID from your SVG
      text: "External SVG"
      style:
        color: "#00ffff"
        font-size: 14
```

**Expected:**
- ✅ External SVG loads and displays
- ✅ Anchors extracted from SVG
- ✅ Console: "SVG loaded: test-msd"

---

## Console Log Verification

After loading any test config, open browser DevTools Console (F12) and look for:

### Success Pattern
```
[LCARdSMSDCard] 🚀 Initializing MSD pipeline
[LCARdSMSDCard] Passing config to pipeline: { hasSvgContent: true, ... }
[AnchorProcessor] Processing anchors: { hasSvgContent: true, userAnchorCount: X, ... }
[AnchorProcessor] Anchors processed: { svgAnchorCount: X, userAnchorCount: Y, totalCount: Z }
[ConfigProcessor] SVG metadata extracted: { viewBox: [...], anchorCount: Z }
[PipelineCore] Config processed: { hasViewBox: true, anchorCount: Z, ... }
[LCARdSMSDCard] ✅ MSD pipeline initialized successfully
```

### Error Pattern (Should NOT see)
```
❌ [LCARdSMSDCard] Failed to process anchors
❌ [ConfigProcessor] SVG metadata extraction failed
❌ [PipelineCore] Pipeline initialization failed
```

---

## Provenance Browser Verification

1. Click on MSD card to edit
2. Open card editor
3. Navigate to "Provenance" tab (if available)
4. Look for anchor entries with origins:
   - `source: "svg_extraction"` for SVG anchors
   - `source: "user_config"` for user-defined anchors
   - `source: "pack_defaults"` for pack anchors

---

## Performance Check

### Before Testing
1. Open browser DevTools
2. Go to Performance tab
3. Start recording

### Run Test
1. Refresh Home Assistant
2. Wait for MSD card to render
3. Stop performance recording

### Check Metrics
- **Initialization time:** Should be < 500ms
- **No duplicate anchor extraction:** Only one "Processing anchors" log
- **No race condition delays:** Linear initialization flow

---

## Troubleshooting

### Issue: "SVG not loaded yet"
**Fix:** Wait a moment and refresh. AssetManager loading async.

### Issue: "Overlay X references missing anchor 'Y'"
**Possible causes:**
1. Typo in anchor name
2. SVG doesn't have that anchor
3. Anchor not defined in config

### Issue: Line not rendering
**Check:**
1. Both anchors exist
2. Anchor coordinates are valid
3. Line style has stroke color
4. Overlays are in correct order

### Issue: Percentage anchors at wrong position
**Check:**
1. ViewBox is correct
2. Percentage format: "50%" (string with %)
3. Console shows "Resolved X: 50% → [value]"

---

## Success Criteria

✅ All test configs render correctly
✅ Console logs show successful initialization
✅ No error messages
✅ Provenance browser shows anchor origins
✅ Performance is good (< 500ms initialization)
✅ MSD editor preview works

---

**Ready to Test!** 🚀

Copy any test config above into your Lovelace dashboard and verify it works correctly.
