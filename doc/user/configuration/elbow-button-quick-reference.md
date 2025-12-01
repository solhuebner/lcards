# Elbow Button Card - Quick Reference

**Component:** `custom:lcards-elbow-button`
**Extends:** `custom:lcards-simple-button`
**Purpose:** Classic LCARS elbow/corner designs with curved borders

---

## Overview

The Elbow Button Card creates the iconic LCARS interface aesthetic with L-shaped designs featuring:
- Configurable elbow positions (header/footer, left/right)
- LCARS arc formula-based geometry for authentic curves
- Uniform-width curved lines (like borders/overlays)
- Full Simple Button functionality (actions, rules, animations, templates)

---

## Complete Schema

```yaml
type: custom:lcards-elbow-button
entity: <entity_id>           # Optional: Home Assistant entity

# Elbow Configuration
elbow:
  type: header-left | header-right | footer-left | footer-right  # Elbow position

  # Border/Bar Dimensions
  border:
    horizontal: <number>      # Width of vertical sidebar (pixels)
    vertical: <number>        # Height of horizontal bar (pixels)
    gap: <number>             # Gap between bars (default: 4, typically unused)

  # Arc Radii
  radius:
    outer: <number> | 'auto'  # Outer corner radius
                              # 'auto' = horizontal / 2 (tangent at midpoint)
    inner: <number>           # Inner corner radius (optional)
                              # If omitted: calculated via LCARS formula (outer / 2)
    inner_factor: <number>    # Legacy mode: inner = outer / factor
                              # Only used if 'inner' is not specified

  # Elbow-specific styling
  colors:
    background: <color>       # Override button background color for elbow

# All Simple Button features available
preset: <preset_name>         # Optional: Style preset
icon: <icon_config>           # Icon configuration (see Simple Button)
text:                         # Multi-text labels (auto-adjusted for elbow)
  <field-id>:
    content: <string>
    position: <position-name>
    # ... (all Simple Button text options)

# Actions (inherited from Simple Button)
tap_action: <action>
hold_action: <action>
double_tap_action: <action>

# Animations (inherited from Simple Button)
animations: <animation_config>

# Rules (inherited from Simple Button)
rules: <rules_config>

# Layout
grid_options:
  rows: <number>              # Grid rows for HA layout
  columns: <number>           # Grid columns for HA layout
```

---

## Elbow Types

### Header Elbows (Top)

**`header-left`** - Elbow in top-left corner
- Vertical bar on left edge
- Horizontal bar along top edge
- Curved corner connecting them

**`header-right`** - Elbow in top-right corner
- Vertical bar on right edge
- Horizontal bar along top edge
- Curved corner connecting them

### Footer Elbows (Bottom)

**`footer-left`** - Elbow in bottom-left corner
- Vertical bar on left edge
- Horizontal bar along bottom edge
- Curved corner connecting them

**`footer-right`** - Elbow in bottom-right corner
- Vertical bar on right edge
- Horizontal bar along bottom edge
- Curved corner connecting them

---

## LCARS Arc Formula

The elbow uses authentic LCARS geometry:

```
Auto Outer Radius:
  outer = horizontal / 2
  (Arc reaches flat edge at midpoint)

LCARS Inner Radius:
  inner = outer / 2
  (Semicircle arc relationship)

Uniform Line Width:
  lineWidth = outer - inner
```

### Example Calculations

For `horizontal: 150px`:
```yaml
radius:
  outer: 'auto'      # = 150 / 2 = 75px
  # inner calculated: 75 / 2 = 37.5px
  # line width: 75 - 37.5 = 37.5px
```

For uniform 30px line width:
```yaml
border:
  horizontal: 30
  vertical: 30
radius:
  outer: 100
  inner: 70          # 100 - 30 = 70
  # Result: 30px uniform thickness throughout
```

---

## Basic Examples

### Simple Header Elbow

```yaml
type: custom:lcards-elbow-button
entity: light.living_room
elbow:
  type: header-left
  border:
    horizontal: 90
    vertical: 20
text:
  name:
    content: Engineering
tap_action:
  action: toggle
```

### Large Sweeping Arc (Uniform Line)

```yaml
type: custom:lcards-elbow-button
entity: light.bedroom
elbow:
  type: footer-left
  border:
    horizontal: 30    # Line thickness
    vertical: 30      # Line thickness
  radius:
    outer: 120        # Large arc
    inner: 90         # 120 - 30 = 30px uniform line
text:
  name:
    content: Operations
    color: white
    position: bottom-left
tap_action:
  action: toggle
grid_options:
  rows: 4             # Tall card for large arc
```

### Footer Elbow with State Colors

```yaml
type: custom:lcards-elbow-button
entity: climate.hvac
elbow:
  type: footer-right
  border:
    horizontal: 90
    vertical: 20
  radius:
    outer: 'auto'
text:
  name:
    content: Climate Control
  state:
    content: '{{entity.state}}'
    position: bottom-right
    color:
      heat: var(--lcars-orange)
      cool: var(--lcars-blue)
      'off': var(--lcars-gray)
tap_action:
  action: more-info
```

---

## Text Auto-Adjustment

Text fields are automatically adjusted to avoid overlapping the elbow:

### Header-Left Example
```yaml
elbow:
  type: header-left
  border:
    horizontal: 90    # Sidebar width
    vertical: 20      # Top bar height
text:
  name:
    content: Engineering
    # Auto-adjusted:
    # - align: left (matches elbow side)
    # - padding_left: 110 (90 + 20)
    # - padding_top: 30 (20 + 10)
```

### Footer-Right Example
```yaml
elbow:
  type: footer-right
  border:
    horizontal: 90
    vertical: 20
text:
  status:
    content: Online
    # Auto-adjusted:
    # - align: right (matches elbow side)
    # - padding_right: 110 (90 + 20)
    # - padding_bottom: 30 (20 + 10)
```

You can override these auto-adjustments with explicit values.

---

## Advanced Configuration

### Multiple Text Fields

```yaml
type: custom:lcards-elbow-button
entity: sensor.temperature
elbow:
  type: header-left
  border:
    horizontal: 90
    vertical: 20
text:
  title:
    content: Main Engineering
    position: top-left
    font_size: 18
    font_weight: bold
  value:
    content: '{{entity.state}}°C'
    position: center
    font_size: 24
    color:
      default: var(--lcars-blue)
  status:
    content: Normal
    position: bottom-right
    font_size: 12
tap_action:
  action: more-info
```

### With Icon

```yaml
type: custom:lcards-elbow-button
entity: light.bridge
elbow:
  type: footer-left
  border:
    horizontal: 90
    vertical: 20
icon:
  icon: mdi:lightbulb
  position: center-left
  size: 32
  color:
    active: var(--lcars-orange)
    inactive: var(--lcars-gray)
text:
  name:
    content: Bridge Lighting
tap_action:
  action: toggle
```

### Custom Radii (Non-LCARS)

```yaml
type: custom:lcards-elbow-button
entity: switch.warp_core
elbow:
  type: header-right
  border:
    horizontal: 100
    vertical: 25
  radius:
    outer: 80         # Custom outer radius
    inner: 50         # Custom inner radius (not LCARS formula)
text:
  name:
    content: Warp Core
tap_action:
  action: toggle
```

### State-Based Background Color

```yaml
type: custom:lcards-elbow-button
entity: binary_sensor.security
elbow:
  type: footer-right
  border:
    horizontal: 90
    vertical: 20
  colors:
    background: |
      {% if is_state('binary_sensor.security', 'on') %}
        var(--lcars-red)
      {% else %}
        var(--lcars-green)
      {% endif %}
text:
  name:
    content: Security Status
tap_action:
  action: more-info
```

---

## Design Guidelines

### Uniform Line Width

For consistent visual weight (like CSS borders):
```yaml
# 30px uniform line
border:
  horizontal: 30
  vertical: 30
radius:
  outer: 100
  inner: 70    # 100 - 30 = 30
```

### Classic LCARS Proportions

Use auto radius with LCARS formula:
```yaml
elbow:
  border:
    horizontal: 90
    vertical: 20
  radius:
    outer: 'auto'  # 90 / 2 = 45px
    # inner: 45 / 2 = 22.5px (auto-calculated)
```

### Large Sweeping Arcs

For dramatic curved lines:
```yaml
border:
  horizontal: 30    # Thin line
  vertical: 30
radius:
  outer: 150        # Large arc
  inner: 120        # Maintains 30px line
grid_options:
  rows: 6           # Tall card needed
```

---

## Integration with Simple Button

The Elbow Button inherits **all features** from Simple Button:

- ✅ **Actions** - tap, hold, double-tap
- ✅ **Rules** - conditional styling based on state
- ✅ **Animations** - segment animations, transitions
- ✅ **Templates** - Jinja2 in text content
- ✅ **Icons** - Full icon configuration
- ✅ **Text** - Multi-field text system
- ✅ **State colors** - Active/inactive/unavailable
- ✅ **Presets** - Style preset system

See [Simple Button Quick Reference](simple-button-quick-reference.md) for details.

---

## Common Use Cases

### Dashboard Headers

```yaml
type: custom:lcards-elbow-button
elbow:
  type: header-left
  border:
    horizontal: 90
    vertical: 20
text:
  name:
    content: Main Engineering
    font_size: 20
tap_action:
  action: none
```

### Decorative Corners

```yaml
type: custom:lcards-elbow-button
elbow:
  type: footer-right
  border:
    horizontal: 50
    vertical: 50
  radius:
    outer: 100
    inner: 50
tap_action:
  action: none
grid_options:
  rows: 3
```

### Interactive Controls

```yaml
type: custom:lcards-elbow-button
entity: cover.bay_door
elbow:
  type: header-right
  border:
    horizontal: 90
    vertical: 20
icon:
  icon: mdi:garage
  size: 32
text:
  name:
    content: Bay Door
  state:
    content: '{{entity.state}}'
tap_action:
  action: toggle
hold_action:
  action: more-info
```

---

## Troubleshooting

### Arc doesn't look smooth
- Ensure `outer` and `inner` radii maintain proper relationship
- For uniform lines: `inner = outer - lineWidth`
- Check that card dimensions allow full arc to render

### Text overlaps elbow
- Text is auto-adjusted, but may need explicit positioning
- Use `position` for relative placement
- Use `x`, `y` or `x_percent`, `y_percent` for absolute control

### Actions don't work
- Ensure entity is configured (if using entity-based actions)
- Check tap_action configuration
- Verify button is not disabled by rules

### Elbow appears clipped
- Increase card height with `grid_options.rows`
- Check that `outer` radius fits within card dimensions
- Maximum outer radius is clamped to card dimensions

---

## Performance Notes

- Elbow rendering is optimized (single SVG path)
- No performance difference from Simple Button
- Large radii may require larger cards but don't impact render performance
- Text auto-adjustment happens once at config processing

---

## Related Documentation

- [Simple Button Quick Reference](simple-button-quick-reference.md) - Parent card features
- [Animation Presets](../reference/animation-presets.md) - Animation configuration
- [Component Presets](../reference/component-presets.md) - Preset system

---

**Version:** LCARdS 1.24+
**Last Updated:** December 2025
