# MSD Configuration Studio - Phase 2 Visual Summary

## 🎨 Implementation Overview

Phase 2 adds **Base SVG** and **Anchors** configuration tabs to the MSD Configuration Studio, enabling visual configuration of MSD displays.

```
┌─────────────────────────────────────────────────────────────────┐
│                   MSD Configuration Studio                       │
├─────────────────────────────────────────────────────────────────┤
│  Mode Toolbar: [View] [Place Anchor] [Place Control] ...       │
├─────────────────────┬───────────────────────────────────────────┤
│  Configuration (60%) │ Live Preview (40%)                       │
│  ┌─────────────────┐ │  ┌─────────────────────────────────┐    │
│  │ Tabs:           │ │  │                                  │    │
│  │ • Base SVG      │ │  │   [Enterprise-A SVG]             │    │
│  │ • Anchors       │ │  │                                  │    │
│  │ • Controls      │ │  │   + anchor markers (cyan)        │    │
│  │ • Lines         │ │  │   + grid overlay (white)         │    │
│  │ • Channels      │ │  │   + bounding boxes (orange)      │    │
│  │ • Debug         │ │  │                                  │    │
│  └─────────────────┘ │  └─────────────────────────────────┘    │
│                      │  [Preview updates on config change]     │
│  [Tab Content]       │                                          │
│                      │                                          │
└─────────────────────┴───────────────────────────────────────────┘
│  [Reset] [Cancel] [Save]                                        │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Base SVG Tab

### Layout

```
┌────────────────────────────────────────────────────────────┐
│  Base SVG Tab                                              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ▼ SVG Source                                             │
│     Configure the base SVG template for your MSD display  │
│     ┌────────────────────────────────────────────────┐   │
│     │ SVG Source:                                     │   │
│     │ [builtin:ncc-1701-a-blue                      ] │   │
│     │ Enter builtin template or custom path          │   │
│     └────────────────────────────────────────────────┘   │
│     ╔════════════════════════════════════════════════╗   │
│     ║ ℹ️  Builtin Templates:                         ║   │
│     ║ • builtin:ncc-1701-a (Enterprise-A)           ║   │
│     ║ • builtin:ncc-1701-a-blue (Enterprise-A Blue) ║   │
│     ║ • builtin:ncc-1701-d (Enterprise-D)           ║   │
│     ║                                                ║   │
│     ║ Custom SVG:                                    ║   │
│     ║ • /local/my-ship.svg (from www/ folder)       ║   │
│     ║ • /hacsfiles/lcards/ships/custom.svg          ║   │
│     ╚════════════════════════════════════════════════╝   │
│                                                            │
│  ▼ ViewBox                                                │
│     Configure the coordinate system for your MSD display  │
│     ○ Auto-detect from SVG  ● Custom viewBox             │
│     ┌───────────┬───────────┬───────────┬───────────┐   │
│     │ Min X: 0  │ Min Y: 0  │Width:1920 │Height:1080│   │
│     └───────────┴───────────┴───────────┴───────────┘   │
│     ╔════════════════════════════════════════════════╗   │
│     ║ ℹ️  ViewBox defines coordinate system          ║   │
│     ║ Auto: Extract from SVG (recommended)          ║   │
│     ║ Custom: Define [minX, minY, width, height]   ║   │
│     ╚════════════════════════════════════════════════╝   │
│                                                            │
│  ▼ Filters                                                │
│     Apply visual filters to the base SVG                  │
│     Filter Preset: [Dimmed            ▼]                 │
│     ☑ Enable Custom Filters                              │
│     ┌────────────────────────────────────────────────┐   │
│     │ Opacity:    [========●===]  0.7                │   │
│     │ Blur (px):  [2px]                              │   │
│     │ Brightness: [=========●==]  1.2                │   │
│     │ Contrast:   [========●===]  1.0                │   │
│     │ Grayscale:  [●===========]  0.0                │   │
│     └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### Key Features

1. **SVG Source Input**: Text field with builtin template examples
2. **ViewBox Configuration**: Auto-detect or custom [minX, minY, width, height]
3. **Filter Presets**: Dropdown with preset options (dimmed, subtle, backdrop, etc.)
4. **Custom Filters**: Toggle-enabled sliders for fine control
5. **Real-time Preview**: Updates after 300ms debounce

### Config Output

```yaml
msd:
  base_svg:
    source: "builtin:ncc-1701-a-blue"
    filter_preset: "dimmed"
    filters:
      opacity: 0.7
      blur: "2px"
      brightness: 1.2
      contrast: 1.0
      grayscale: 0.0
  view_box: [0, 0, 1920, 1080]  # Only when custom mode
```

## 🎯 Anchors Tab

### Layout

```
┌────────────────────────────────────────────────────────────┐
│  Anchors Tab                                               │
├────────────────────────────────────────────────────────────┤
│  [+ Add Anchor] [Place on Canvas]                         │
│                                                            │
│  ▼ Coordinate Helpers                                     │
│     Visual aids for precise anchor placement              │
│     ☑ Show Grid Overlay                                   │
│     Grid Spacing: [50px ▼]                                │
│     ☑ Snap to Grid                                        │
│                                                            │
│  ▼ Anchors                                                │
│     Named reference points for positioning overlays       │
│     ┌────────────────────────────────────────────────┐   │
│     │ 📍 warp_core                    [Edit][💡][🗑️] │   │
│     │    Position: [960, 600]                        │   │
│     └────────────────────────────────────────────────┘   │
│     ┌────────────────────────────────────────────────┐   │
│     │ 📍 bridge                       [Edit][💡][🗑️] │   │
│     │    Position: [960, 200]                        │   │
│     └────────────────────────────────────────────────┘   │
│     ┌────────────────────────────────────────────────┐   │
│     │ 📍 engineering                  [Edit][💡][🗑️] │   │
│     │    Position: [500, 800]                        │   │
│     └────────────────────────────────────────────────┘   │
│                                                            │
│     (Empty state when no anchors)                         │
│     ┌────────────────────────────────────────────────┐   │
│     │             🗺️ (large icon)                     │   │
│     │  No anchors defined. Click "Add Anchor" or     │   │
│     │  "Place on Canvas" to create one.              │   │
│     └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### Anchor Form Dialog

```
┌───────────────────────────────────────────┐
│  Add Anchor / Edit Anchor: warp_core      │
├───────────────────────────────────────────┤
│  Anchor Name: [warp_core               ]  │
│  (Unique identifier for this anchor)      │
│                                           │
│  ┌────────────┬────────────┬──────────┐  │
│  │ X Position │ Y Position │   Unit   │  │
│  │   [960]    │   [600]    │ [vb ▼]  │  │
│  └────────────┴────────────┴──────────┘  │
│                                           │
│  ╔════════════════════════════════════╗  │
│  ║ ℹ️  Units:                          ║  │
│  ║ • vb: ViewBox coordinates (default)║  │
│  ║ • px: Pixel coordinates            ║  │
│  ║ • %: Percentage of viewBox dims    ║  │
│  ╚════════════════════════════════════╝  │
│                                           │
│           [Cancel]  [Save]                │
└───────────────────────────────────────────┘
```

### Key Features

1. **Add Anchor**: Opens form dialog with empty fields
2. **Place on Canvas**: Activates click-to-place mode
3. **Anchor List**: Cards showing name, position, and action buttons
4. **Edit Button**: Opens form with existing values (name disabled)
5. **Highlight Button**: Animates anchor in preview (visual feedback)
6. **Delete Button**: Removes anchor with confirmation
7. **Coordinate Helpers**: Grid overlay and snap-to-grid

### Config Output

```yaml
msd:
  anchors:
    warp_core: [960, 600]
    bridge: [960, 200]
    engineering: [500, 800]
    sickbay: [1400, 800]
```

## 🎮 Place Anchor Mode

### Workflow

```
1. User clicks "Place on Canvas" button
   ↓
2. Mode toolbar highlights "Place Anchor"
   ┌─────────────────────────────────────────┐
   │ [View] [●Place Anchor] [Place Control]  │
   └─────────────────────────────────────────┘
   ↓
3. User clicks on preview canvas
   ↓
4. Click position converted to viewBox coordinates
   • Get SVG bounding rect
   • Calculate scale factors
   • Transform click to viewBox space
   • Apply snap-to-grid if enabled
   ↓
5. Anchor form dialog opens with:
   • Auto-generated name (anchor_1, anchor_2, ...)
   • Pre-filled position from click
   • Unit defaulted to 'vb'
   ↓
6. User edits name/position if needed, clicks Save
   ↓
7. Anchor added to config.msd.anchors
   ↓
8. Mode exits to "View"
   ↓
9. Preview updates showing new anchor marker
```

### Coordinate Transformation

```javascript
// Click event on preview panel
click (clientX, clientY)
  ↓
// Get SVG bounding box
svgRect = svg.getBoundingClientRect()
clickX = clientX - svgRect.left
clickY = clientY - svgRect.top
  ↓
// Get viewBox dimensions
viewBox = [minX, minY, width, height]
  ↓
// Calculate scale factors
scaleX = width / svgRect.width
scaleY = height / svgRect.height
  ↓
// Transform to viewBox coordinates
x = minX + (clickX * scaleX)
y = minY + (clickY * scaleY)
  ↓
// Apply snap-to-grid (if enabled)
if (snapToGrid) {
  x = round(x / gridSpacing) * gridSpacing
  y = round(y / gridSpacing) * gridSpacing
}
  ↓
// Use in anchor form
position = [x, y]
```

## 🔍 Debug Visualization (Grid Overlay)

### Grid Rendering

```
┌─────────────────────────────────────────────────────┐
│  Preview Panel with Grid Overlay                    │
│                                                      │
│    0   50  100 150 200 250 300 350 400             │
│    │   │   │   │   │   │   │   │   │              │
│  0 ┼───┼───┼───┼───┼───┼───┼───┼───┼─             │
│    │   │   │   │   │   │   │   │   │              │
│ 50 ┼───┼───●───┼───┼───┼───┼───┼───┼─  ← anchor   │
│    │   │   │   │   │   │   │   │   │              │
│100 ┼───┼───┼───┼───┼───┼───┼───┼───┼─             │
│    │   │   │   │   │   │   │   │   │              │
│150 ┼───┼───┼───┼───┼───●───┼───┼───┼─  ← anchor   │
│    │   │   │   │   │   │   │   │   │              │
│200 ┼───┼───┼───┼───┼───┼───┼───┼───┼─             │
│                                                      │
│  [Enterprise-A SVG rendered behind grid]            │
│  [Anchor markers (cyan crosshairs) on top]          │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Grid Features

- **Vertical Lines**: Spaced at configured interval (10/20/50/100px)
- **Horizontal Lines**: Same spacing
- **Coordinate Labels**: Show at every 2x spacing (e.g., 0, 100, 200)
- **Visual Style**: White/translucent, behind other elements
- **Z-index**: Grid at bottom, anchors on top

### MsdDebugRenderer Integration

```javascript
// In MsdDebugRenderer.render()
if (debugSettings.grid) {
  this.renderCoordinateGrid(viewBox, {
    spacing: debugSettings.gridSpacing || 50,
    color: 'rgba(255, 255, 255, 0.2)',
    strokeWidth: 0.5,
    showLabels: true
  });
}
```

## 🔄 Live Preview Integration

### Preview Update Flow

```
Config Change
  ↓
_setNestedValue(path, value)
  ↓
_schedulePreviewUpdate()
  ↓
[300ms debounce timer]
  ↓
requestUpdate()
  ↓
lcards-msd-live-preview re-renders
  ↓
_getPreviewConfig() merges debugSettings
  ↓
<lcards-msd> renders with merged config
  ↓
MsdDebugRenderer.render() shows:
  • Base SVG (from base_svg.source)
  • Anchor markers (from anchors)
  • Grid overlay (from debugSettings.grid)
  • Bounding boxes (from debugSettings.bounding_boxes)
```

### Debug Settings Merge

```javascript
// Studio dialog
_getDebugSettings() {
  return {
    ...this._debugSettings,      // Persistent settings (anchors, routing, etc.)
    grid: this._showGrid,         // Editor-only setting
    gridSpacing: this._gridSpacing // Editor-only setting
  };
}

// Live preview
_getPreviewConfig() {
  const config = { ...this.config };
  config.msd.debug = {
    ...config.msd.debug,
    ...this.debugSettings  // Merged from studio
  };
  return config;
}
```

## 📊 State Management

### Studio Dialog State

```javascript
// Persistent state (saved to config)
_workingConfig: {
  msd: {
    base_svg: {
      source: "builtin:ncc-1701-a-blue",
      filter_preset: "dimmed",
      filters: { opacity: 0.7, ... }
    },
    view_box: [0, 0, 1920, 1080],
    anchors: {
      warp_core: [960, 600],
      bridge: [960, 200]
    }
  }
}

// Editor-only state (not saved)
_viewBoxMode: 'auto' | 'custom'
_customFiltersEnabled: boolean
_showAnchorForm: boolean
_editingAnchorName: string | null
_anchorFormName: string
_anchorFormPosition: [number, number]
_anchorFormUnit: 'vb' | 'px' | '%'
_showGrid: boolean
_gridSpacing: number
_snapToGrid: boolean
```

## 🎯 User Workflows

### Workflow 1: New MSD Card from Scratch

```
1. Create new MSD card
2. Open MSD Studio
3. Base SVG Tab:
   • Enter source: builtin:ncc-1701-a
   • Select filter preset: dimmed
   • Preview shows filtered Enterprise-A
4. Anchors Tab:
   • Enable "Show Grid Overlay"
   • Set grid spacing: 50px
   • Enable "Snap to Grid"
   • Click "Place on Canvas"
   • Click on preview at key locations:
     - Bridge (top center)
     - Engineering (bottom left)
     - Sick Bay (bottom right)
     - Warp Core (center)
   • Each click creates snapped anchor
5. Save → Config ready for Phase 3 (Controls)
```

### Workflow 2: Edit Existing MSD Card

```
1. Open existing MSD card in editor
2. Click "Open MSD Studio"
3. Base SVG Tab:
   • Source already populated
   • Adjust filters if needed
4. Anchors Tab:
   • Existing anchors displayed
   • Edit position of "warp_core"
   • Add new anchor "transporter"
   • Delete unused anchor "cargo_bay"
5. Save → Updated config
```

### Workflow 3: Precise Anchor Positioning

```
1. Anchors Tab
2. Enable coordinate helpers:
   • Show Grid Overlay: ON
   • Grid Spacing: 20px
   • Snap to Grid: ON
3. Click "Place on Canvas"
4. Click near desired location
   • Coordinates snap to 20px grid
5. Fine-tune in anchor form if needed
6. Save anchor
```

## 📈 Performance Considerations

### Debouncing

- **Preview Updates**: 300ms debounce prevents excessive re-renders
- **Filter Sliders**: Native debouncing from ha-selector

### Grid Rendering

- **Efficient SVG**: Grid uses native SVG lines (hardware accelerated)
- **Label Filtering**: Only show labels at 2x spacing to reduce clutter
- **Z-index Management**: Grid at bottom to avoid blocking interactions

### Memory

- **Deep Cloning**: `_workingConfig` is deep cloned to prevent reference issues
- **Cleanup**: Dialog removes event listeners on disconnect

## 🐛 Debugging Tips

### Enable Verbose Logging

```javascript
window.lcards.setGlobalLogLevel('debug');
```

### Inspect Studio State

```javascript
const studio = document.querySelector('lcards-msd-studio-dialog');
console.log('Working Config:', studio._workingConfig);
console.log('Debug Settings:', studio._getDebugSettings());
console.log('Show Grid:', studio._showGrid);
console.log('Grid Spacing:', studio._gridSpacing);
```

### Check Grid Rendering

```javascript
// Find debug layer
const svg = document.querySelector('lcards-msd svg');
const debugLayer = svg.querySelector('#msd-debug-layer');
const grid = debugLayer.querySelector('.msd-debug-grid');
console.log('Grid:', grid);
console.log('Grid children:', grid.children.length);
```

### Test Coordinate Conversion

```javascript
// Simulate click at SVG position
const svg = document.querySelector('lcards-msd svg');
const rect = svg.getBoundingClientRect();
const event = {
  clientX: rect.left + 100,
  clientY: rect.top + 50
};
const coords = studio._getPreviewCoordinates(event);
console.log('Converted coordinates:', coords);
```

## ✅ Completion Checklist

Phase 2 is complete and ready for user testing:

- [x] Base SVG tab: source, viewBox, filters
- [x] Anchors tab: CRUD operations
- [x] Place Anchor Mode: click-to-place
- [x] Coordinate helpers: grid overlay, snap-to-grid
- [x] Live preview: real-time updates
- [x] Debug visualization: grid rendering
- [x] Config persistence: save/load/reset
- [x] No breaking changes to Phase 1
- [x] Build succeeds
- [x] Documentation complete

## 🚀 Next Phase Preview

**Phase 3: Controls Tab**
- Card picker with filter/search
- Control overlay editor
- Visual positioning on preview
- Card configuration UI
- Integration with Home Assistant card types

---

*Last Updated: December 2025 | Phase 2 Implementation*
