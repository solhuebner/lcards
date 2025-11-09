# Unified Button Configuration Schema

## Overview

This document defines the **unified button schema** that works for both:
- **V2 Button Cards** (`custom:lcards-v2-button`)
- **MSD Button Overlays** (type: `button`)

## Schema Structure

### Core Properties

```yaml
# Required
type: custom:lcards-v2-button  # For V2 cards
# OR
type: button                   # For MSD overlays

# Entity (optional)
entity: light.bedroom          # Home Assistant entity

# Basic Content
text: "Button Text"            # Primary text (legacy: top-level)
label: "Label Text"            # Label text (new: recommended)
value: "Value Text"            # Value text (new: recommended)
icon: mdi:lightbulb           # Material Design Icon

# Actions
tap_action:
  action: toggle               # toggle, call-service, navigate, url, more-info
  service: light.turn_on       # For call-service
  service_data:
    entity_id: light.bedroom
hold_action:                   # Long press action
double_tap_action:            # Double tap action

# Advanced Content (Multiple Texts)
texts:                        # Array of text elements
  - text: "Label"
    position: top-left        # Position within button
    textType: label           # label, value, detail
    fontSize: 14

# Rule Integration
overlay_id: my_button         # Makes targetable by rules
tags: [lighting, bedroom]    # Tag-based rule targeting
```

### Style Properties

All styling is nested under the `style` object:

```yaml
style:
  # ============================================================================
  # LCARS PRESETS (ButtonRenderer Integration)
  # ============================================================================
  lcars_button_preset: lozenge      # lozenge, bullet, picard-filled, etc.
  lcars_text_preset: standard       # Text styling preset

  # ============================================================================
  # BUTTON CONTENT CONTROL
  # ============================================================================
  show_labels: true                 # Show/hide label text
  show_values: true                 # Show/hide value text
  label_position: center-top        # center-top, center-bottom, left, right, center
  value_position: center-bottom

  # ============================================================================
  # LCARS BRACKET STYLING
  # ============================================================================
  bracket_style: true               # Enable LCARS-style brackets
  bracket_color: "#ff9966"          # Bracket color
  bracket_width: 3                  # Bracket line thickness (0-10)
  bracket_gap: 5                    # Gap between bracket and button
  bracket_extension: 10             # How far brackets extend beyond button
  bracket_opacity: 1.0              # Bracket transparency (0-1)

  # ============================================================================
  # COLORS & APPEARANCE
  # ============================================================================
  color: "#ffffff"                  # Text color
  background_color: "#ff9966"       # Button background

  # State-responsive colors
  color:
    default: "#ffffff"
    active: "#000000"
    inactive: "#666666"
    unavailable: "#999999"

  # ============================================================================
  # BORDERS
  # ============================================================================
  border:
    color: "#ff9966"
    width: 2
    radius: 8
    style: solid
    # Individual sides
    top:
      color: "#ff6600"
      width: 3
    left:
      color: "#ffcc99"
      width: 1

  # ============================================================================
  # TEXT STYLING
  # ============================================================================
  text:
    label:
      font_size: 14
      font_weight: bold
      color: "#ffffff"
      text_align: center
    value:
      font_size: 12
      color: "#cccccc"
      text_align: center
    # Multiple text elements
    texts:
      - content: "Custom Text"
        font_size: 16
        color: "#ff9966"

  # ============================================================================
  # LAYOUT & SPACING
  # ============================================================================
  padding:
    top: 8
    right: 16
    bottom: 8
    left: 16

  # ============================================================================
  # EFFECTS & ANIMATION
  # ============================================================================
  opacity: 1.0
  rotation: 0                       # Degrees
```

## Backward Compatibility

The V2 Button Card will support **both** formats:

### Legacy Format (Flat)
```yaml
type: custom:lcards-v2-button
entity: light.bedroom
text: "Bedroom Light"
lcars_button_preset: lozenge      # Top-level preset
icon: mdi:lightbulb
```

### New Format (Nested)
```yaml
type: custom:lcards-v2-button
entity: light.bedroom
label: "Bedroom Light"
style:
  lcars_button_preset: lozenge    # Nested under style
  bracket_style: true
  bracket_color: "#ff9966"
icon: mdi:lightbulb
```

## Migration Path

1. **Existing V2 configs** continue to work unchanged
2. **New features** require the nested `style` format
3. **MSD overlays** use the nested format exclusively
4. **Mixed usage** is supported (legacy + some nested properties)

## Feature Mapping

| Feature | Legacy V2 | New Unified | MSD Overlay |
|---------|-----------|-------------|-------------|
| Button Preset | `lcars_button_preset` | `style.lcars_button_preset` | `style.lcars_button_preset` |
| Text Color | `color` | `style.color` | `style.color` |
| Background | `background_color` | `style.background_color` | `style.background_color` |
| Brackets | ❌ Not available | `style.bracket_*` | `style.bracket_*` |
| Multiple Texts | `texts` array | `style.text.texts` | `label`, `value` + `style.text.texts` |
| State Colors | ❌ Limited | `style.color: {default, active}` | `style.color: {default, active}` |

This unified approach gives you **the best of both worlds**: backward compatibility with existing V2 buttons while unlocking the full power of the MSD ButtonRenderer system! 🚀