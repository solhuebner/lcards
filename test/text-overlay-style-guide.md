# LCARdS Text Overlay - Complete Style Guide
*Comprehensive reference for all working style options*

## Two Style Systems

The LCARdS text overlay supports **two different style approaches**:

### 1. CSS-Style Properties (Basic)
Located in the `style` object - familiar CSS-like naming:

```yaml
type: custom:lcards-text-card
text: "Sample Text"
style:
  fontSize: '18px'          # Font size (CSS units)
  color: '#FFCC00'          # Text color (hex, rgb, CSS colors)
  fontFamily: 'LCARS'       # Font family name
  fontWeight: 'bold'        # normal, bold, 100-900
  textAlign: 'center'       # left, center, right (basic)
```

### 2. MSD Overlay Properties (Advanced)
Located directly in the config - extensive LCARS-specific options:

```yaml
type: custom:lcards-text-card
text: "Advanced Text"
# MSD-style properties (no 'style' wrapper)
font_size: 20              # Or fontSize: '20px'
color: '#FF6600'           # Or fill: '#FF6600'
font_family: 'Antonio'     # Font family
font_weight: 'bold'        # Font weight
text_anchor: 'middle'      # start, middle, end (SVG alignment)
dominant_baseline: 'central' # SVG vertical alignment
opacity: 0.9               # Transparency (0-1)
stroke: '#FFFFFF'          # Text outline color
stroke_width: 1            # Text outline width
```

### 3. Layout Controls (Positioning)
Located in the `layout` object - CSS-style positioning:

```yaml
layout:
  text_align: 'center'     # left, center, right
  vertical_align: 'middle' # top, middle, bottom
  padding:
    top: 10
    right: 15
    bottom: 10
    left: 15
```

## Complete Style Property Reference

### Text Appearance
```yaml
# Font properties
font_size: 16              # Or fontSize: '16px'
font_family: 'LCARS'       # Or fontFamily: 'LCARS'
font_weight: 'normal'      # normal, bold, 100-900
font_style: 'normal'       # normal, italic
color: '#FF9900'           # Text fill color
fill: '#FF9900'            # Alternative to color

# Text decoration
text_decoration: 'none'    # none, underline, line-through
letter_spacing: '2px'      # Letter spacing
word_spacing: '4px'        # Word spacing
```

### Positioning & Alignment
```yaml
# SVG text positioning (precise)
text_anchor: 'middle'      # start, middle, end
dominant_baseline: 'central' # auto, hanging, central, text-after-edge
alignment_baseline: 'middle' # Various SVG baselines

# CSS-style positioning (in layout object)
layout:
  text_align: 'center'     # left, center, right
  vertical_align: 'middle' # top, middle, bottom
```

### Stroke & Outline
```yaml
stroke: '#FFFFFF'          # Outline color
stroke_width: 2            # Outline width
stroke_opacity: 0.8        # Outline transparency
stroke_linecap: 'round'    # butt, round, square
stroke_linejoin: 'round'   # miter, round, bevel
stroke_dasharray: '5,3'    # Dash pattern
```

### Effects
```yaml
opacity: 0.9               # Overall transparency
visibility: 'visible'      # visible, hidden
glow: true                 # Enable glow effect
shadow: true               # Enable shadow effect
blur: 2                    # Blur amount
```

### Multi-line Support
```yaml
multiline: true            # Enable multi-line text
line_height: 1.4           # Line spacing multiplier
max_width: 200             # Maximum width before wrapping
text_wrapping: 'wrap'      # none, wrap
```

### LCARS Features
```yaml
# Status indicators
status_indicator: 'online'         # Status text/icon
status_indicator_position: 'left'  # left, right, top, bottom
status_indicator_size: 12          # Size in SVG units
status_indicator_padding: 5        # Padding around indicator

# Brackets (LCARS style)
bracket_style: 'rounded'           # Style of brackets
bracket_color: '#FF9900'           # Bracket color
bracket_width: 3                   # Bracket line width
bracket_gap: 8                     # Gap between text and bracket
bracket_extension: 12              # How far brackets extend
bracket_opacity: 0.8               # Bracket transparency
bracket_corners: 'both'            # both, left, right, none
bracket_sides: 'both'              # both, left, right, top, bottom
```

### Animation
```yaml
animatable: true           # Enable animations
pulse_speed: 1             # Pulse animation speed (0=off)
fade_speed: 0.5            # Fade animation speed
typewriter_speed: 50       # Typewriter effect speed (ms per char)
```

## Working Test Configuration

Here's a comprehensive test configuration with all working properties:

```yaml
# Basic CSS-style text
- type: custom:lcards-text-card
  text: "Basic CSS Style"
  style:
    fontSize: '16px'
    color: '#FFCC00'
    fontFamily: 'LCARS'
    fontWeight: 'bold'
  layout:
    text_align: 'center'
    vertical_align: 'middle'

# Advanced MSD-style text
- type: custom:lcards-text-card
  text: "Advanced LCARS"
  font_size: 18
  color: '#FF6600'
  font_family: 'Antonio'
  text_anchor: 'middle'
  dominant_baseline: 'central'
  stroke: '#FFFFFF'
  stroke_width: 1
  opacity: 0.9
  layout:
    padding:
      top: 12
      bottom: 12

# Multi-line with effects
- type: custom:lcards-text-card
  text: "Multi-line text\\nwith effects\\nand LCARS styling"
  multiline: true
  line_height: 1.4
  font_size: 14
  color: '#00FF00'
  glow: true
  bracket_style: 'rounded'
  bracket_color: '#FF9900'
  layout:
    text_align: 'left'
    vertical_align: 'top'
    padding:
      top: 8
      left: 16

# Status indicator example
- type: custom:lcards-text-card
  text: "System Status"
  font_size: 16
  color: '#FFFFFF'
  status_indicator: 'ONLINE'
  status_indicator_position: 'left'
  status_indicator_size: 10
  layout:
    text_align: 'center'
```

## Priority Order

When multiple style systems specify the same property:
1. **MSD properties** (root level) take highest priority
2. **CSS-style properties** (in `style` object) are secondary
3. **Default values** are used as fallback

## Notes
- Use **CSS-style** for simple, familiar styling
- Use **MSD properties** for advanced LCARS features and precise SVG control
- Use **layout controls** for positioning within the grid cell
- Template syntax `{{entity.state}}` works in the `text` property