# MSD Control Overlay Fix - Testing Guide

## Overview

This guide provides instructions for testing the fixes for MSD Control Overlay SVG container timing and entity validation issues.

## Fixes Implemented

### Fix 1: SVG Container Timing (Critical)
**Problem:** Control overlays tried to render before Lit's async render completed, causing "No SVG element found" errors.

**Solution:** Added `await this.updateComplete` in `_onFirstUpdated()` before initializing the MSD pipeline.

**Location:** `src/cards/lcards-msd.js`, lines 218-223

### Fix 2: Entity Validation Skip (Minor)
**Problem:** Validation service incorrectly flagged entities in nested card configurations as missing.

**Solution:** Skip entity validation for paths containing `.card.`, `.card_config.`, or `.cardConfig.`.

**Location:** `src/core/validation-service/index.js`, lines 629-635

## Build Instructions

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Verify build succeeded:
   - Check for `dist/lcards.js` file
   - Build should complete with only bundle size warnings (expected)

## Manual Testing in Home Assistant

### Setup

1. Copy the built file to Home Assistant:
   ```bash
   cp dist/lcards.js /path/to/homeassistant/www/community/lcards/
   ```

2. Clear browser cache or hard refresh (Ctrl+Shift+R)

3. Add the test configuration to a Lovelace dashboard

### Test Configuration

Use the configuration in `test-control-overlay-fix.yaml`:

```yaml
type: custom:lcards-msd-card
id: bridge
msd:
  base_svg: 
    source: builtin:ncc-1701-a-blue
  view_box: [0, 0, 1920, 1200]
  
  anchors:
    warp_core: [960, 600]
    bridge: [960, 300]
  
  overlays:
    - type: control
      id: warp_core_button
      card:
        type: custom:lcards-button
        entity: light.floor_lamp
        preset: lozenge
        text: 
          label: 
            content: "WARP CORE"
      anchor: warp_core
      size: [200, 60]
    
    - type: control
      id: shields_button
      card:
        type: button
        entity: light.tv
        name: "Shields"
      anchor: bridge
      size: [150, 80]
    
    - type: line
      id: power_conduit
      anchor: bridge
      attach_to: warp_core_button
      attach_side: top
      style: 
        stroke: var(--lcars-orange)
        stroke_width: 3
```

**Note:** Replace `light.floor_lamp` and `light.tv` with actual entities from your Home Assistant instance.

### Expected Results

#### Before the Fix

Browser console would show:
```
❌ LCARdS|warn  [MSD Controls] No SVG element found for controls container
❌ LCARdS|error [MsdControlsRenderer] No SVG container available; abort render
⚠️  LCARdS|warn  Entity "light.floor_lamp" not found in Home Assistant
⚠️  LCARdS|warn  Entity "light.tv" not found in Home Assistant
```

Controls would not render on the MSD.

#### After the Fix

Browser console should show:
```
✅ LCARdS|debug [LCARdSMSDCard] Waiting for Lit render to complete...
✅ LCARdS|debug [LCARdSMSDCard] Lit render complete
✅ LCARdS|debug [MSD Controls] Created SVG controls container group
✅ LCARdS|debug [MSD Controls] Control positioned in SVG coordinates: warp_core_button
✅ LCARdS|debug [MSD Controls] Control positioned in SVG coordinates: shields_button
✅ LCARdS|debug [MsdControlsRenderer] renderControls completed successfully
```

No false entity validation warnings (assuming entities exist).

### Visual Verification

1. **Control Buttons Render:** Two control buttons should appear on the MSD display
   - "WARP CORE" button at position [960, 600]
   - "Shields" button at position [960, 300]

2. **Line Attachment Works:** A line should connect from the bridge anchor to the warp_core_button
   - Line should be orange (`var(--lcars-orange)`)
   - Line should attach to the top of the warp_core_button

3. **Interactive Controls:** Buttons should be functional
   - Clicking buttons should trigger entity actions
   - Buttons should update when entity states change

### Debug Mode Testing

To see detailed logging, enable debug mode in the config:

```yaml
msd:
  debug:
    enabled: true
    console:
      verbose: true
```

Then check the browser console for:
- `[LCARdSMSDCard] Waiting for Lit render to complete...`
- `[LCARdSMSDCard] Lit render complete`
- No "No SVG element found" errors
- No "No SVG container available" errors

### Console Commands

You can also check the MSD state in the browser console:

```javascript
// Get the MSD card element (in elements inspector, select the card first)
const msdCard = $0;

// Check if pipeline is initialized
console.log('Pipeline initialized:', !!msdCard._msdPipeline);

// Check if SVG container exists
const svg = msdCard.renderRoot.querySelector('svg');
console.log('SVG found:', !!svg);

// Check for controls container
const controlsGroup = svg?.querySelector('#msd-controls-container');
console.log('Controls container found:', !!controlsGroup);

// Check control elements
const controls = msdCard._msdPipeline?.controlsRenderer?.controlElements;
console.log('Number of controls:', controls?.size || 0);
```

## Automated Verification

Run the verification script to check code changes:

```bash
node test/verify-control-overlay-fix.mjs
```

This script validates:
- `await this.updateComplete` is present before pipeline init
- Entity validation skip logic is implemented
- Proper comments and logging are in place

## Troubleshooting

### Controls Still Not Rendering

1. Check browser console for errors
2. Verify entities exist in Home Assistant
3. Clear browser cache completely
4. Check that `dist/lcards.js` was copied correctly
5. Try with `source: none` in base_svg config (simpler test)

### Entity Warnings Still Appearing

1. Check the exact path in the warning message
2. Verify path includes `.card.` or similar
3. Enable trace logging: `window.lcards.setGlobalLogLevel('trace')`
4. Look for "Skipping entity validation for nested card property" messages

### SVG Not Found

1. Check that `_renderSvgContainer()` is being called
2. Verify `this._msdInitialized` is true before rendering
3. Check render method returns SVG container template
4. Enable verbose logging to see render lifecycle

## Success Criteria

✅ No "No SVG element found" errors
✅ No "No SVG container available" errors  
✅ No false entity validation warnings for card.entity fields
✅ Control overlays render correctly on MSD
✅ Control buttons are interactive
✅ Line attachments work properly
✅ Build completes without errors

## Additional Notes

- These are minimal, surgical fixes to address specific timing and validation issues
- No breaking changes to existing functionality
- No config changes required for existing cards
- Performance impact is negligible (one async wait per card initialization)

## Files Changed

- `src/cards/lcards-msd.js` - Added updateComplete await
- `src/core/validation-service/index.js` - Skip nested card entity validation
- `test-control-overlay-fix.yaml` - Test configuration
- `test/verify-control-overlay-fix.mjs` - Automated verification script
- `CONTROL_OVERLAY_FIX_TESTING_GUIDE.md` - This document

## References

- Lit documentation: https://lit.dev/docs/components/lifecycle/#updatecomplete
- LCARdS architecture: `doc/README.md`
- MSD documentation: `doc/architecture/subsystems/`
