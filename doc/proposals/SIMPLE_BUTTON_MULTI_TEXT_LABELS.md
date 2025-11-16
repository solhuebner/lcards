# Simple Button Multi-Text Labels Design

**Status**: Proposed
**Date**: 2025-11-16
**Version**: 1.0

## Overview

Enhancement to support multiple text labels on simple-button cards with flexible positioning, styling, and preset integration. This replaces the current single-text system with a multi-field approach that maintains backward compatibility.

## Goals

1. **Multiple Labels**: Support unlimited text fields on a single button
2. **Named Keys**: Use IDs for text fields (better than arrays for presets and targeting)
3. **Flexible Positioning**: Named positions, absolute coordinates, and relative percentages
4. **Icon Awareness**: Named positions respect icon area and divider
5. **Preset Integration**: Ship common field IDs (label, name, state) with smart defaults
6. **AnimJS Ready**: Text fields targetable by ID for animations
7. **Custom Shapes**: Future SVG shapes can define their own text slot IDs
8. **Backward Compatible**: Existing `label: "text"` syntax continues to work

## Architecture

### Text Configuration Schema

```yaml
text:
  # Built-in preset fields (always available, optional to use)
  label:
    content: string
    position: string | null
    x: number | null
    y: number | null
    x_percent: number | null
    y_percent: number | null
    padding: number | object
    size: number
    color: string | object
    font_weight: string
    font_family: string
    anchor: string
    baseline: string
    show: boolean
    template: boolean

  name:
    # ... same properties

  state:
    # ... same properties

  # Custom user-defined fields (any ID)
  [customId]:
    # ... same properties
```

### Text Field Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `content` | string | required | Text content or HA template (supports multi-line with YAML pipe, `\n`, or `<br>`) |
| `position` | string | varies | Named position (see below) |
| `x` | number | null | Explicit x coordinate (overrides position) |
| `y` | number | null | Explicit y coordinate (overrides position) |
| `x_percent` | number | null | Relative x position (0-100) |
| `y_percent` | number | null | Relative y position (0-100) |
| `padding` | number\|object | 8 | Distance from edges (simple or directional) |
| `size` | number | 14 | Font size in pixels |
| `color` | string\|object | inherited | Text color or state-based colors |
| `font_weight` | string | 'normal' | Font weight (normal, bold, 100-900) |
| `font_family` | string | 'LCARS' | Font family |
| `anchor` | string | auto | Text anchor: start, middle, end |
| `baseline` | string | auto | Vertical alignment: hanging, central, alphabetic |
| `rotation` | number | 0 | Text rotation in degrees (clockwise, Phase 2) |
| `line_height` | number | 1.2 | Line height multiplier for multi-line text (Phase 2) |
| `show` | boolean | true | Toggle visibility |
| `template` | boolean | true | Enable HA template processing |

### Named Positions

Named positions are relative to the **text area** (excludes icon area and divider):

| Position | Description | Default Anchor | Default Baseline |
|----------|-------------|----------------|------------------|
| `center` | Centered in text area | middle | central |
| `top-left` | Top-left corner with padding | start | hanging |
| `top-right` | Top-right corner with padding | end | hanging |
| `top-center` | Top edge, horizontally centered | middle | hanging |
| `bottom-left` | Bottom-left corner with padding | start | alphabetic |
| `bottom-right` | Bottom-right corner with padding | end | alphabetic |
| `bottom-center` | Bottom edge, horizontally centered | middle | alphabetic |
| `left-center` | Left edge, vertically centered | start | central |
| `right-center` | Right edge, vertically centered | end | central |

**Default Positions for Preset Fields:**
- `label`: `center`
- `name`: `top-left`
- `state`: `bottom-right`

### Padding System

Support both simple and directional padding:

**Simple (number):**
```yaml
text:
  label:
    padding: 8  # All sides
```

**Directional (object):**
```yaml
text:
  name:
    padding:
      top: 12
      right: 8
      bottom: 6
      left: 10
```

**Default**: 8px all sides

### Positioning Priority

Coordinates are resolved in this priority order:

1. **Explicit coordinates** (`x`, `y`) - Absolute positioning, can overlap icon area
2. **Relative percentages** (`x_percent`, `y_percent`) - Relative to text area dimensions
3. **Named position** (`position`) - Predefined locations with padding
4. **Default** (preset fields only) - Built-in defaults (label=center, name=top-left, state=bottom-right)

### Color System

Support both simple and state-based colors:

**Simple (string):**
```yaml
text:
  label:
    color: white
```

**State-based (object):**
```yaml
text:
  state:
    color:
      active: cyan
      inactive: gray
      unavailable: red
```

### Icon Area Awareness

Named positions and relative percentages respect the icon area:

```
┌─────────────────────────────────────┐
│  Text Area          │  Icon Area    │
│                     │  ┌─────────┐  │
│  top-left    top-right  │  Icon   │  │
│                     │  └─────────┘  │
│      center         │   Divider     │
│                     │               │
│  bottom-left bottom-right          │
└─────────────────────────────────────┘
```

**Text Area Calculation:**
```javascript
const textAreaWidth = iconPosition === 'right'
  ? (buttonWidth - iconAreaWidth - dividerWidth)
  : (iconPosition === 'left'
      ? (buttonWidth - iconAreaWidth - dividerWidth)
      : buttonWidth);
```

Explicit `x`/`y` coordinates can place text anywhere, including icon area.

## Examples

### Basic Usage (Backward Compatible)

**Old syntax (still works):**
```yaml
label: "Climate Control"
```

**New syntax (equivalent):**
```yaml
text:
  label:
    content: "Climate Control"
```

### Standard LCARS Button

```yaml
text:
  label:
    content: "{{ friendly_name }}"
    size: 16
    font_weight: bold
  name:
    content: "{{ area_name }}"
    size: 12
  state:
    content: "{{ state }}"
    size: 10
    color:
      active: cyan
      inactive: gray
      unavailable: red
```

### Custom Positioning

```yaml
text:
  label:
    content: "Main Label"
    position: center

  temperature:
    content: "{{ states('sensor.temp') }}°C"
    position: top-right
    size: 12
    color: orange
    padding:
      top: 6
      right: 10

  status_indicator:
    content: "●"
    x: 10
    y: 10
    size: 20
    color:
      active: green
      inactive: yellow
      unavailable: red
```

### Relative Percentage Positioning

```yaml
text:
  top_label:
    content: "Top 25%"
    x_percent: 50
    y_percent: 25
    anchor: middle
    baseline: central

  bottom_label:
    content: "Bottom 75%"
    x_percent: 50
    y_percent: 75
    anchor: middle
    baseline: central
```

### Directional Padding

```yaml
text:
  name:
    content: "Living Room"
    position: top-left
    padding:
      top: 12
      left: 10
      right: 8
      bottom: 6
```

### Custom Fields with IDs

```yaml
text:
  header:
    content: "SECTION HEADER"
    position: top-center
    size: 10
    font_weight: bold

  value_primary:
    content: "{{ states('sensor.value') }}"
    position: center
    size: 18
    color: cyan

  value_secondary:
    content: "Secondary: {{ states('sensor.other') }}"
    position: bottom-center
    size: 11
    color: gray
```

## Preset Integration

Presets can define text field positions and styles:

```yaml
# In preset definition (lcars-standard-button)
preset:
  text:
    label:
      position: center
      size: 16
      font_weight: bold
      padding: 8
    name:
      position: top-left
      size: 12
      padding:
        top: 6
        left: 10
    state:
      position: bottom-right
      size: 10
      padding:
        bottom: 6
        right: 10
      color:
        active: cyan
        inactive: gray
        unavailable: red

# User only overrides content
text:
  label:
    content: "Climate"
  name:
    content: "Living Room"
  state:
    content: "{{ state }} | {{ state_attr('climate.living_room', 'temperature') }}°C"
```

## Custom SVG Shapes (Future)

Custom shapes can define their own text slot IDs:

```yaml
# Shape definition (future)
shape: starfleet-badge
shapes:
  starfleet-badge:
    path: "M 50 0 L 100 50..."
    text_slots:
      rank:
        position: top-center
        default_size: 10
      name:
        position: center
        default_size: 14
      division:
        x: 50
        y: 80
        default_size: 8

# User config references shape's slots
text:
  rank:
    content: "Captain"
  name:
    content: "Picard"
  division:
    content: "Command"
```

## AnimJS Integration

Text fields are targetable by ID for animations:

```yaml
text:
  temperature:
    content: "{{ states('sensor.temp') }}°C"
    position: top-right

animations:
  - target: "#text-temperature"  # SVG element ID
    property: fill
    from: white
    to: red
    duration: 1000
```

**SVG Structure:**
```svg
<text id="text-temperature" class="button-text" ...>
  25°C
</text>
```

## Implementation Plan

### Phase 1: Basic Multi-Text (MVP)
**Goal**: Multiple text fields with named positioning

- [x] Design documentation
- [ ] Parse text object with arbitrary field IDs
- [ ] Support named positions (9 positions)
- [ ] Simple padding (number only)
- [ ] Basic styling (size, color, font_weight, font_family)
- [ ] Icon area awareness for named positions
- [ ] State-based colors
- [ ] Backward compatibility for `label: "text"`
- [ ] Default positions for preset fields (label, name, state)

**Deliverable**: Users can define multiple text fields with named positions

### Phase 2: Advanced Positioning & Multi-line (Fast-Follow)
**Goal**: Full positioning control and multi-line text support

**Positioning:**
- [ ] Directional padding (object with top/right/bottom/left)
- [ ] Explicit coordinates (x, y)
- [ ] Relative percentages (x_percent, y_percent)
- [ ] Custom anchor points (start, middle, end)
- [ ] Custom baseline (hanging, central, alphabetic)

**Multi-line Text:**
- [ ] Support YAML pipe `|` syntax for multi-line content
- [ ] Support `\n` escape sequences
- [ ] Support `<br>` HTML breaks
- [ ] Generate SVG `<tspan>` elements for line breaks
- [ ] Line height control
- [ ] Vertical spacing between lines

**Text Rotation:**
- [ ] Add `rotation` property (degrees, clockwise)
- [ ] Transform origin at text anchor point
- [ ] Works with all positioning modes

**Deliverable**: Power users have full control over text placement, multi-line support, and rotation

### Phase 3: Integration & Polish
**Goal**: Preset and animation support

- [ ] Preset system integration
- [ ] AnimJS targeting by ID
- [ ] Text field visibility toggle (show property)
- [ ] Template processing toggle (template property)
- [ ] Documentation and examples

**Deliverable**: Complete feature with preset support

### Phase 4: Future Enhancements
- [ ] Custom SVG shape text slots
- [ ] Text effects (shadow, stroke, outline)
- [ ] Text overflow handling (ellipsis, wrap, clip)
- [ ] Curved text along path
- [ ] Text animation presets

## Technical Implementation Notes

### Text Processing Flow

```
1. Parse Config
   ├─ Check for legacy `label` property
   ├─ Parse `text` object
   └─ Merge with preset defaults

2. Process Each Field
   ├─ Resolve content (template or static)
   ├─ Determine position (priority: x/y > percent > named > default)
   ├─ Calculate coordinates
   ├─ Apply padding
   └─ Resolve styling (color, size, font)

3. Render SVG
   ├─ Generate <text> elements
   ├─ Apply ID (text-{fieldId})
   ├─ Set position (x, y)
   ├─ Apply styling attributes
   └─ Escape XML content
```

### Position Calculation

```javascript
function calculateTextPosition(field, textAreaBounds, iconAreaBounds, padding) {
  // Priority 1: Explicit coordinates
  if (field.x !== null && field.y !== null) {
    return { x: field.x, y: field.y };
  }

  // Priority 2: Relative percentages
  if (field.x_percent !== null && field.y_percent !== null) {
    const x = textAreaBounds.left + (textAreaBounds.width * field.x_percent / 100);
    const y = (textAreaBounds.height * field.y_percent / 100);
    return { x, y };
  }

  // Priority 3: Named position
  if (field.position) {
    return calculateNamedPosition(field.position, textAreaBounds, padding);
  }

  // Priority 4: Default (preset fields only)
  return getDefaultPosition(field.id, textAreaBounds);
}
```

### Text Area Bounds

```javascript
function getTextAreaBounds(buttonWidth, buttonHeight, iconConfig) {
  if (!iconConfig?.show) {
    return {
      left: 0,
      width: buttonWidth,
      height: buttonHeight
    };
  }

  const iconAreaWidth = iconConfig.area_width || 100;
  const dividerWidth = iconConfig.divider?.width || 6;

  if (iconConfig.position === 'left') {
    return {
      left: iconAreaWidth + dividerWidth,
      width: buttonWidth - iconAreaWidth - dividerWidth,
      height: buttonHeight
    };
  } else if (iconConfig.position === 'right') {
    return {
      left: 0,
      width: buttonWidth - iconAreaWidth - dividerWidth,
      height: buttonHeight
    };
  }

  // Center icon (future)
  return { left: 0, width: buttonWidth, height: buttonHeight };
}
```

### Backward Compatibility

```javascript
function parseTextConfig(config) {
  // Legacy: label property at root
  if (typeof config.label === 'string') {
    return {
      label: {
        content: config.label,
        position: 'center',
        // ... other defaults
      }
    };
  }

  // New: text object
  if (config.text) {
    return config.text;
  }

  return {};
}
```

## Testing Strategy

### Test Cases

1. **Backward Compatibility**
   - [ ] `label: "text"` renders centered text
   - [ ] No text config shows no text

2. **Named Positions**
   - [ ] All 9 named positions render correctly
   - [ ] Padding applied correctly to each position
   - [ ] Text respects icon area boundaries

3. **Positioning Priority**
   - [ ] Explicit x/y overrides position
   - [ ] x_percent/y_percent overrides position
   - [ ] Named position works as fallback
   - [ ] Defaults apply to preset fields

4. **Styling**
   - [ ] Size, color, font_weight, font_family applied
   - [ ] State-based colors switch correctly
   - [ ] Anchor and baseline work correctly

5. **Multi-Text**
   - [ ] Multiple fields render without overlap
   - [ ] Each field maintains independent styling
   - [ ] IDs are unique and targetable

6. **Directional Padding**
   - [ ] Object padding applies per-edge
   - [ ] Falls back to simple padding
   - [ ] Works with all positions

7. **Icon Integration**
   - [ ] Text area excludes icon area (left icon)
   - [ ] Text area excludes icon area (right icon)
   - [ ] Explicit coordinates can overlap icon
   - [ ] No icon = full button width for text

## Migration Guide

### From Single Label

**Before:**
```yaml
type: custom:lcards-simple-button
entity: light.living_room
label: "Living Room Light"
```

**After (same result):**
```yaml
type: custom:lcards-simple-button
entity: light.living_room
label: "Living Room Light"  # Still works!

# OR explicitly:
text:
  label:
    content: "Living Room Light"
```

### From CB-LCARS (legacy)

**Before (CB-LCARS):**
```yaml
type: custom:button-card
entity: light.living_room
label: "Light"
name: "Living Room"
state:
  - value: "on"
    color: cyan
```

**After (LCARdS):**
```yaml
type: custom:lcards-simple-button
entity: light.living_room
text:
  label:
    content: "Light"
  name:
    content: "Living Room"
  state:
    content: "{{ state }}"
    color:
      active: cyan
      inactive: gray
```

## Design Decisions

### Multi-line Text
**Decision**: Support multi-line text using YAML pipe `|` syntax, `\n` escape sequences, and `<br>` HTML breaks.

**Rationale**:
- Important for label/text cards (future)
- YAML pipe syntax is cleanest for multi-line
- `\n` and `<br>` provide inline alternatives
- Will use SVG `<tspan>` elements for line breaks

**Implementation**: Phase 2 (fast-follow after basic multi-text)

**Example:**
```yaml
text:
  description:
    content: |
      Line 1
      Line 2
      Line 3
    position: center
```

### Text Rotation
**Decision**: Add rotation support as fast-follow feature after Phase 1.

**Rationale**:
- Important for LCARS aesthetic (vertical text, angled labels)
- Enhances visual design flexibility
- Common request for advanced layouts

**Implementation**: Phase 2 (fast-follow)

**Proposed API:**
```yaml
text:
  vertical_label:
    content: "DECK 5"
    x: 10
    y: 50
    rotation: -90  # Degrees, clockwise
```

### Text Effects
**Decision**: Lower priority, revisit after core features complete.

**Rationale**:
- Shadow, stroke, outline are nice-to-have
- Can be partially achieved with CSS/SVG styling
- Not critical for initial release

**Implementation**: Phase 4 (future enhancements)

### Performance
**Decision**: No hard limit on text field count.

**Rationale**:
- Let users determine their own performance needs
- SVG text elements are lightweight
- Can optimize if performance issues arise
- Power users may need many fields for complex displays

**Note**: Will monitor and add optional warnings if field count exceeds reasonable threshold (e.g., >50 fields)

## References

- [CB-LCARS Legacy System](../../cb-archive/)
- [MSD Text Overlay System](../../src/msd/overlays/TextOverlay.js)
- [SVG Text Element Spec](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text)
- [Style Property Standardization](../architecture/implementation-details/STYLE_PROPERTY_STANDARDIZATION.md)

## Changelog

- **2025-11-16**: Initial design document created
  - Named keys approach (vs arrays)
  - 9 named positions
  - Directional padding
  - State-based colors
  - Icon area awareness
  - AnimJS targeting
  - Phase 1-4 implementation plan
- **2025-11-16**: Design decisions finalized
  - Multi-line text support (YAML pipe `|`, `\n`, `<br>`) - Phase 2
  - Text rotation support (`rotation` property) - Phase 2 fast-follow
  - Text effects deprioritized to Phase 4
  - No performance limit on field count
  - Updated Phase 2 to include multi-line and rotation
