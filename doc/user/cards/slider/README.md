# Slider Card

`custom:lcards-slider`

Interactive sliders and read-only gauges for entities like lights, covers, fans, climate, and sensors. Two visual styles: pill-segmented bars and ruler gauges.

---

## Quick Start

```yaml
# Light brightness slider
type: custom:lcards-slider
entity: light.bedroom
preset: pills-basic
control:
  attribute: brightness
```

```yaml
# Temperature gauge (read-only)
type: custom:lcards-slider
entity: sensor.temperature
preset: gauge-basic
style:
  track:
    display:
      min: -10
      max: 40
      unit: "°C"
```

---

## Top-Level Options

| Option | Type | Description |
|--------|------|-------------|
| `type` | string | `custom:lcards-slider` (required) |
| `entity` | string | Entity to display and/or control |
| `preset` | string | Visual style preset |
| `component` | string | Advanced SVG component name |
| `orientation` | string | `horizontal` or `vertical` (default: `horizontal`) |
| `id` | string | Card ID for rule targeting |
| `tags` | list | Tags for rule targeting |
| `control` | object | Control behavior |
| `text` | object | Text label definitions |
| `style` | object | Visual style overrides |
| `actions` | object | Named action handlers |
| `animations` | list | Card animations |
| `data_sources` | object | DataSource definitions |

---

## Presets

| Preset | Description |
|--------|-------------|
| `pills-basic` | Segmented pill bar — standard interactive slider |
| `gauge-basic` | Ruler with tick marks — typically display-only |

Additional presets and components may be available from packs.

---

## Control Options

```yaml
control:
  attribute: brightness    # Entity attribute to control (default varies by domain)
  min: 0                   # Minimum value
  max: 100                 # Maximum value
  step: 1                  # Value increment
  locked: false            # Force read-only (auto-determined by entity domain)
  invert_value: false      # Flip min↔max mapping
```

### Automatic Domains

The slider automatically determines interactivity and attribute by entity domain:

| Domain | Interactive | Default attribute |
|--------|-------------|-------------------|
| `light` | Yes | `brightness` |
| `cover` | Yes | `position` |
| `fan` | Yes | `percentage` |
| `climate` | Yes | `temperature` |
| `input_number` | Yes | state |
| `number` | Yes | state |
| `sensor` | No (read-only) | state |

Set `control.locked: true` to force read-only for any domain.

---

## Style Options

### Track

```yaml
style:
  track:
    type: pills            # pills or gauge
    height: 40             # Track height in px
    margin: 8              # Space around track in px
    display:
      min: 0               # Visual scale minimum (default: control.min)
      max: 100             # Visual scale maximum (default: control.max)
      unit: "%"            # Display unit label
    segments:              # Pills-specific
      count: 20            # Number of pill segments
      gap: 3               # Gap between pills in px
      radius: 4            # Pill corner radius
    color:
      inactive: "#333"     # Color of inactive (unfilled) segments
      active: "#FF9900"    # Color of active (filled) segments
      progress: "#FF9900"  # Progress indicator color
```

### Gauge

```yaml
style:
  gauge:
    scale:
      tick_marks:
        major:
          interval: 20     # Major tick every 20 units
          color: "#aaa"
          height: 12
        minor:
          interval: 5
          color: "#555"
          height: 6
      labels:
        show: true
        color: "#888"
        font_size: 10
    indicator:
      color: "#FF9900"
      width: 3
```

---

## Text Labels

Full text system from button card:

```yaml
text:
  label:
    content: Brightness
    position: top-left
    font_size: 11
  value:
    content: "[[[return Math.round(entity.attributes.brightness / 255 * 100) + '%']]]"
    position: top-right
    font_size: 11
```

---

## Borders and Card Background

```yaml
style:
  card:
    color:
      background: "#111"
  border:
    color:
      default: "#444"
      active: "#FF9900"
    width: 2
    radius: 8
```

---

## Examples

### Vertical cover position slider

```yaml
type: custom:lcards-slider
entity: cover.blinds_bedroom
preset: pills-basic
orientation: vertical
control:
  attribute: position
  min: 0
  max: 100
text:
  label:
    content: Blinds
    position: top-center
```

### Fan speed with inverted display

Some fans report 0–100 where 100 is the physical bottom — use `invert_value` to flip:

```yaml
type: custom:lcards-slider
entity: fan.ceiling
preset: pills-basic
control:
  attribute: percentage
  invert_value: true
```

### Climate temperature gauge

```yaml
type: custom:lcards-slider
entity: sensor.outdoor_temperature
preset: gauge-basic
control:
  locked: true
style:
  track:
    display:
      min: -20
      max: 45
      unit: "°C"
```

---

## Related

- [Button card](../button/README.md)
- [Templates](../../core/templates/README.md)
- [DataSources](../../core/datasources/README.md)
- [Animations](../../core/animations.md)
