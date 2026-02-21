# Button Card

`custom:lcards-button`

The Button card covers everything from simple labels and toggle buttons to complex interactive components like D-pads and multi-segment SVG controls.

---

## Modes

The card operates in one of three modes, selected by which top-level key is present:

| Mode | Key | Use for |
|------|-----|---------|
| **Preset** | `preset` | Standard LCARS buttons — lozenge, bullet, capped, etc. |
| **Component** | `component` | Interactive multi-segment controls (D-pad, alert shape) |
| **Custom SVG** | `svg` | Your own SVG with interactive segments |

---

## Quick Start

```yaml
# Simple toggle button
type: custom:lcards-button
entity: light.kitchen
preset: lozenge
text:
  name:
    content: Kitchen
tap_action:
  action: toggle
```

```yaml
# D-pad remote control
type: custom:lcards-button
component: dpad
dpad:
  segments:
    up:
      tap_action:
        action: call-service
        service: media_player.volume_up
        service_data:
          entity_id: media_player.tv
    down:
      tap_action:
        action: call-service
        service: media_player.volume_down
        service_data:
          entity_id: media_player.tv
```

---

## Top-Level Options

| Option | Type | Description |
|--------|------|-------------|
| `type` | string | `custom:lcards-button` (required) |
| `entity` | string | Entity to monitor and control |
| `id` | string | Custom card ID for rule targeting |
| `tags` | list | Tags for rule targeting (e.g. `[nav, lights]`) |
| `preset` | string | Button shape preset (preset mode) |
| `component` | string | Component type: `dpad` or `alert` (component mode) |
| `svg` | object | Custom SVG config (svg mode) |
| `text` | object | Text field definitions |
| `icon` | string | MDI icon (e.g. `mdi:lightbulb`) |
| `icon_area` | string | Icon position: `left`, `right`, `top`, `bottom`, `none` |
| `icon_area_size` | number | Icon area width/height in px (default: 60) |
| `icon_style` | object | Advanced icon styling |
| `divider` | object | Divider between icon area and main area |
| `style` | object | Visual styles (background, border, text) |
| `tap_action` | object | Tap action |
| `hold_action` | object | Hold action |
| `double_tap_action` | object | Double-tap action |
| `animations` | list | Card animations |
| `background_animation` | list | Canvas background animations |
| `filters` | list | CSS/SVG filters |
| `data_sources` | object | DataSource definitions |
| `control.attribute` | string | Entity attribute to control (default: state) |

---

## Preset Mode

### Available Presets

Common presets include: `lozenge`, `bullet`, `capped`, `outline`, `pill`, `text`, and more. Available presets depend on installed packs. Browse them in the card editor.

```yaml
type: custom:lcards-button
preset: bullet
entity: switch.fan
text:
  name:
    content: Fan
  value:
    content: "{entity.state}"
    position: bottom-right
```

---

## Text Fields

Multiple text labels can be placed anywhere on the card.

```yaml
text:
  # Field names are arbitrary — use any key
  name:
    content: "Temperature"
    position: top-left
    font_size: 14
    color:
      default: "#aaaaaa"
      active: "#FF9900"
  value:
    content: "{entity.state}°C"
    position: center
    font_size: 28
    font_weight: bold
```

### Text Field Options

| Option | Type | Description |
|--------|------|-------------|
| `content` | string | Text content — supports all [template types](../../core/templates/README.md) |
| `position` | string | `top-left`, `top-center`, `top-right`, `center-left`, `center`, `center-right`, `bottom-left`, `bottom-center`, `bottom-right` |
| `font_size` | number/string | Size in px or CSS value |
| `font_weight` | string | CSS font-weight |
| `font_family` | string | CSS font-family |
| `color` | color/object | Color or state-based color map |
| `show` | boolean | Toggle visibility |
| `rotation` | number | Rotation in degrees |
| `x`, `y` | number | Absolute position (px) |
| `x_percent`, `y_percent` | number | Position as percentage |

---

## Style

```yaml
style:
  card:
    color:
      background:
        default: "#1a1a2e"
        active: "#2a1a0e"
  border:
    color:
      default: "#444"
      active: "#FF9900"
    width: 2
    radius: 12          # Or per-corner: { top_left: 20, top_right: 4, ... }
  text:
    default:
      color: "#cccccc"
      font_size: 14
```

Colors accept: hex values, `rgb()`, `rgba()`, `var(--css-variable)`, `{theme:token.path}`, or a state map with `default`/`active`/`inactive`/`unavailable` keys.

---

## Actions

```yaml
tap_action:
  action: toggle          # toggle, call-service, navigate, more-info, url, none

hold_action:
  action: more-info

double_tap_action:
  action: call-service
  service: light.turn_on
  service_data:
    brightness: 255
    color_name: blue
```

---

## Component Mode: D-pad

```yaml
type: custom:lcards-button
component: dpad
dpad:
  segments:
    default:                        # Shared config for all segments
      style:
        fill:
          default: "#1a2a3a"
          active: "#FF9900"
    center:
      entity: media_player.tv
      tap_action:
        action: call-service
        service: media_player.media_play_pause
    up:
      tap_action:
        action: call-service
        service: media_player.volume_up
```

D-pad segments: `center`, `up`, `down`, `left`, `right`, `up-left`, `up-right`, `down-left`, `down-right`

---

## Component Mode: Alert

The alert component displays a Starfleet alert symbol with animated bar elements.

```yaml
type: custom:lcards-button
component: alert
preset: default          # default, red, yellow, blue, green, grey, black

# State-driven preset switching
entity: sensor.threat_level
ranges:
  - preset: red
    above: 80
  - preset: yellow
    above: 50
  - preset: default
    above: 0
```

---

## Custom SVG Mode

```yaml
type: custom:lcards-button
svg:
  content: |
    <svg viewBox="0 0 200 100">
      <rect id="btn-a" x="10" y="10" width="80" height="80" fill="#FF9900" rx="8"/>
      <rect id="btn-b" x="110" y="10" width="80" height="80" fill="#99CCFF" rx="8"/>
    </svg>
  segments:
    default:
      style:
        fill:
          active: "#FFCC00"
    btn-a:
      entity: light.zone_a
      tap_action:
        action: toggle
    btn-b:
      entity: light.zone_b
      tap_action:
        action: toggle
```

SVG elements with `id` attributes become interactive segments.

---

## Background Animations

See [Background Animations](../../core/effects/background-animations.md) for full docs.

```yaml
background_animation:
  - preset: grid
    config:
      line_spacing: 40
      color: "rgba(255, 153, 0, 0.3)"
```

---

## Examples

### Status label with template

```yaml
type: custom:lcards-button
entity: sensor.cpu_usage
preset: lozenge
text:
  label:
    content: CPU
    position: top-left
    font_size: 11
  value:
    content: "[[[return parseFloat(entity.state).toFixed(1) + '%']]]"
    position: center
    font_size: 24
style:
  border:
    color:
      default: "#444"
      active: "#FF4444"
```

### Navigation button

```yaml
type: custom:lcards-button
preset: capped
text:
  name:
    content: Lights
tap_action:
  action: navigate
  navigation_path: /lovelace/lights
```

---

## Related

- [Templates](../../core/templates/README.md)
- [Themes](../../core/themes/README.md)
- [Rules Engine](../../core/rules/README.md)
- [Animations](../../core/animations.md)
- [Background Animations](../../core/effects/background-animations.md)
- [Elbow card](../elbow/README.md)
