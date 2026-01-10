# MSD Configuration Studio - Phase 2 Testing Guide

## Overview

Phase 2 implements the **Base SVG** and **Anchors** tabs in the MSD Configuration Studio, enabling users to:
- Configure base SVG sources, viewBox, and filters
- Create and manage named anchors visually
- Use Place Anchor Mode to click on the preview canvas
- Enable grid overlay and snap-to-grid for precise positioning

## Build Instructions

```bash
cd /home/runner/work/LCARdS/LCARdS
npm run build
```

Expected output: Build succeeds with size warnings (normal)

## Testing Setup

### Option 1: Use Test HTML File (Quickest)
1. Open `test-msd-studio-phase2.html` in a browser
2. Click "Open MSD Studio Dialog" to launch the editor
3. Follow the manual testing checklist

### Option 2: Home Assistant Integration
1. Copy `dist/lcards.js` to Home Assistant `www/community/lcards/`
2. Hard refresh browser (Ctrl+Shift+R)
3. Open any MSD card in edit mode
4. Click "Open MSD Studio" button
5. Follow the test scenarios below

## Test Scenarios

### Scenario 1: Base SVG Configuration

**Goal**: Configure SVG source, viewBox, and filters

**Steps**:
1. Open MSD Studio Dialog
2. Navigate to "Base SVG" tab (should be default)
3. Enter SVG source: `builtin:ncc-1701-a-blue`
4. Verify preview shows Enterprise-A SVG

**Expected Results**:
- ✓ SVG source input updates `config.msd.base_svg.source`
- ✓ Preview renders the builtin template
- ✓ Preview updates after 300ms debounce

**Test ViewBox**:
1. Select "Custom viewBox" radio button
2. Enter values: MinX=0, MinY=0, Width=1920, Height=1080
3. Verify preview adjusts coordinate system

**Expected Results**:
- ✓ ViewBox mode toggle works
- ✓ Custom inputs update `config.msd.view_box` array
- ✓ Preview respects custom viewBox

**Test Filters**:
1. Select filter preset: "Dimmed"
2. Verify preview applies filter
3. Enable "Custom Filters" toggle
4. Adjust Opacity slider to 0.7
5. Adjust Brightness slider to 1.2
6. Verify preview updates in real-time

**Expected Results**:
- ✓ Filter preset selector updates `config.msd.base_svg.filter_preset`
- ✓ Custom filters toggle enables sliders
- ✓ Sliders update `config.msd.base_svg.filters.*`
- ✓ Preview shows visual filter effects

### Scenario 2: Anchor Management (Manual)

**Goal**: Create, edit, and delete anchors manually

**Steps**:
1. Navigate to "Anchors" tab
2. Click "Add Anchor" button
3. Enter anchor name: "warp_core"
4. Enter position: X=960, Y=600
5. Select unit: "vb" (viewBox)
6. Click "Save"

**Expected Results**:
- ✓ Anchor form dialog opens
- ✓ Name validation works (required)
- ✓ Position inputs work
- ✓ Unit selector works
- ✓ "Save" creates anchor in `config.msd.anchors.warp_core`
- ✓ Anchor appears in anchor list
- ✓ Anchor marker appears in preview (cyan crosshair)

**Test Edit**:
1. Click "Edit" button on warp_core anchor
2. Change position: X=1000, Y=650
3. Click "Save"

**Expected Results**:
- ✓ Form opens with existing values
- ✓ Name field is disabled (can't rename)
- ✓ Position updates in config
- ✓ Preview marker moves to new position

**Test Delete**:
1. Click "Delete" button on warp_core anchor
2. Confirm deletion
3. Verify anchor removed

**Expected Results**:
- ✓ Confirmation dialog appears
- ✓ Anchor removed from `config.msd.anchors`
- ✓ Anchor removed from list
- ✓ Marker removed from preview

**Test Duplicate Name Validation**:
1. Create anchor: "bridge" at [960, 200]
2. Try to create another anchor named "bridge"
3. Verify validation error

**Expected Results**:
- ✓ Error message: "Anchor name 'bridge' already exists"
- ✓ Anchor not created

### Scenario 3: Place Anchor Mode (Visual)

**Goal**: Click on preview canvas to place anchors

**Steps**:
1. Navigate to "Anchors" tab
2. Click "Place on Canvas" button
3. Verify mode toolbar shows "Place Anchor" as active
4. Click anywhere on the preview canvas
5. Verify anchor form opens with pre-filled coordinates

**Expected Results**:
- ✓ "Place on Canvas" button enters Place Anchor Mode
- ✓ Mode toolbar highlights "Place Anchor"
- ✓ Click on preview opens anchor form
- ✓ Form shows auto-generated name (anchor_1, anchor_2, etc.)
- ✓ Position fields pre-filled from click coordinates
- ✓ Coordinates converted to viewBox space
- ✓ Mode exits after form opens

**Test Multiple Placements**:
1. Click "Place on Canvas" again
2. Click different location
3. Verify new anchor has unique name (anchor_2)

**Expected Results**:
- ✓ Each placement auto-generates unique name
- ✓ Each click converts coordinates correctly

### Scenario 4: Coordinate Helpers

**Goal**: Use grid overlay and snap-to-grid for precision

**Steps**:
1. Navigate to "Anchors" tab
2. Expand "Coordinate Helpers" section
3. Enable "Show Grid Overlay" toggle
4. Verify grid appears in preview

**Expected Results**:
- ✓ Grid renders as white lines with labels
- ✓ Grid spacing matches selector value (default: 50)
- ✓ Grid is behind other elements (z-index)

**Test Grid Spacing**:
1. Change "Grid Spacing" to 100px
2. Verify grid updates with wider spacing
3. Try 20px, 50px spacing
4. Verify grid adjusts correctly

**Expected Results**:
- ✓ Grid spacing selector works
- ✓ Grid re-renders with new spacing
- ✓ Labels update to show correct coordinates

**Test Snap-to-Grid**:
1. Enable "Snap to Grid" toggle
2. Set grid spacing to 50px
3. Click "Place on Canvas"
4. Click near coordinates [127, 233]
5. Verify form shows snapped coordinates [150, 250]

**Expected Results**:
- ✓ Snap-to-grid checkbox toggles feature
- ✓ Click coordinates snap to nearest grid point
- ✓ Snapped coordinates are multiples of grid spacing

### Scenario 5: Live Preview Integration

**Goal**: Verify preview updates and shows debug features

**Steps**:
1. Configure base SVG: `builtin:ncc-1701-a`
2. Create anchor: "test" at [500, 300]
3. Enable grid overlay
4. Verify preview shows:
   - Base SVG
   - Anchor marker (cyan crosshair with label)
   - Grid overlay

**Expected Results**:
- ✓ Preview renders MSD card
- ✓ Anchor markers visible with names and coordinates
- ✓ Grid overlay visible when enabled
- ✓ Preview updates with 300ms debounce on config changes
- ✓ Manual refresh button works

**Test Empty State**:
1. Clear base SVG source
2. Verify preview shows "No base SVG configured" message

**Expected Results**:
- ✓ Empty state message appears
- ✓ Helper text: "Configure a base SVG in the 'Base SVG' tab"

### Scenario 6: Config Persistence

**Goal**: Verify all changes save to config correctly

**Steps**:
1. Configure base SVG with filters
2. Create 2-3 anchors
3. Enable grid (should NOT save to config)
4. Click "Save" button
5. Close dialog
6. Re-open dialog
7. Verify all settings restored

**Expected Results**:
- ✓ Base SVG source persisted
- ✓ ViewBox persisted (if custom)
- ✓ Filters persisted
- ✓ All anchors persisted
- ✓ Grid setting NOT persisted (editor-only)
- ✓ Settings correctly restored on re-open

**Test Reset**:
1. Make changes to base SVG and anchors
2. Click "Reset" button
3. Verify config reverts to initial state

**Expected Results**:
- ✓ Reset button restores original config
- ✓ Preview updates to show original state

**Test Cancel**:
1. Make changes
2. Click "Cancel" button
3. Verify dialog closes without saving

**Expected Results**:
- ✓ Dialog closes
- ✓ Changes not saved

## Integration Tests

### Test with Phase 1 Features

**Goal**: Ensure Phase 2 doesn't break Phase 1 functionality

**Steps**:
1. Open MSD Studio with existing config containing controls and lines
2. Navigate through all tabs
3. Verify:
   - Controls tab shows placeholder (Phase 3)
   - Lines tab shows placeholder (Phase 4)
   - Channels tab shows placeholder (Phase 5)
   - Debug tab shows placeholder (Phase 6)

**Expected Results**:
- ✓ No console errors
- ✓ All Phase 1 features work (dialog opens, tabs switch, preview works)
- ✓ Mode toolbar shows all modes
- ✓ Placeholder tabs show correct phase information

## Known Issues & Limitations

### Current Limitations
1. **Highlight Anchor**: Button exists but highlight animation not yet implemented
2. **Grid Persistence**: Grid is editor-only, not saved to card config (by design)
3. **Unit Conversion**: All units currently stored as viewBox coordinates

### Workarounds
- For highlight functionality, use the preview panel's built-in anchor markers

## Debugging

### Enable Debug Logging
```javascript
// In browser console
window.lcards.setGlobalLogLevel('debug')
```

### Check Config
```javascript
// In browser console after opening studio
const studio = document.querySelector('lcards-msd-studio-dialog');
console.log('Working Config:', studio._workingConfig);
console.log('Debug Settings:', studio._getDebugSettings());
```

### Check Preview
```javascript
// Check preview component
const preview = document.querySelector('lcards-msd-live-preview');
console.log('Preview Config:', preview._getPreviewConfig());
```

## Success Criteria

Phase 2 is complete when:

- [x] Base SVG tab fully functional
- [x] Anchors tab fully functional
- [x] Place Anchor Mode works correctly
- [x] Coordinate helpers (grid, snap) work
- [x] Live preview shows base SVG, anchors, and grid
- [x] All config changes save correctly
- [x] No breaking changes to Phase 1
- [x] Build succeeds without errors
- [x] Manual testing guide complete

## Next Steps

After Phase 2 verification:
- **Phase 3**: Controls tab with card picker and editor integration
- **Phase 4**: Lines tab with click-to-connect workflow
- **Phase 5**: Channels tab with visual channel drawing
- **Phase 6**: Debug tab with full debug controls

## Report Issues

If you encounter issues during testing:
1. Check browser console for errors
2. Enable debug logging (see Debugging section)
3. Verify build artifacts are up-to-date
4. Document steps to reproduce
5. Include config state and error messages
