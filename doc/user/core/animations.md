# Card Animations

LCARdS cards support anime.js-powered animations triggered by user interactions or entity state changes. Each card can have multiple animations with different triggers.

---

## Basic Structure

Animations are defined in a card's `animations` array:

```yaml
animations:
  - trigger: on_tap
    preset: pulse
  - trigger: on_entity_change
    preset: glow
    entity: binary_sensor.motion
    to_state: "on"
    color: "{theme:palette.alert-red}"
```

---

## Triggers

| Trigger | When it fires |
|---------|--------------|
| `on_tap` | Card is tapped or clicked |
| `on_hold` | Long-press on the card |
| `on_hover` | Mouse enters the card |
| `on_leave` | Mouse leaves the card |
| `on_load` | Card is rendered on page load |
| `on_entity_change` | A watched entity changes state |

---

## Animation Options

| Option | Type | Description |
|--------|------|-------------|
| `trigger` | string | When to run (required) |
| `preset` | string | Animation preset name (required) |
| `duration` | number | Duration in ms (default: 500) |
| `delay` | number | Delay before starting (ms) |
| `loop` | boolean | Loop continuously |
| `alternate` | boolean | Reverse direction on each loop |
| `ease` | string / object | Easing function |
| `color` | string | Color for glow/flash effects |
| `scale` | number | Scale factor |
| `max_scale` | number | Peak scale during animation |
| `entity` | string | Entity to watch (for `on_entity_change`) |
| `from_state` | string | Only fire when transitioning FROM this state |
| `to_state` | string | Only fire when transitioning TO this state |
| `check_on_load` | boolean | Check state on load and fire if it matches |

---

## Animation Presets

Built-in presets available in all cards:

| Preset | Effect |
|--------|--------|
| `pulse` | Scale up and back, soft |
| `flash` | Opacity flicker |
| `bounce` | Elastic bounce |
| `shake` | Side-to-side shake |
| `glow` | Color glow / shadow bloom |
| `spin` | Rotation |

Additional presets may be available from installed packs. Browse them in the [Config Panel](../config-panel.md) Pack Explorer.

---

## Easing Functions

Common easing options:

```yaml
ease: "inOutQuad"           # String shorthand
ease: "outElastic"          # Elastic bounce out
ease: "linear"              # Constant speed
ease:                       # Spring physics
  type: spring
  params:
    stiffness: 150
    damping: 20
```

---

## Examples

### Tap feedback

```yaml
animations:
  - trigger: on_tap
    preset: pulse
    duration: 300
    max_scale: 1.05
```

### Glow when entity turns on

```yaml
animations:
  - trigger: on_entity_change
    preset: glow
    entity: light.kitchen
    to_state: "on"
    color: "#FF9900"
    duration: 800
    check_on_load: true
```

### Looping alert pulse

```yaml
animations:
  - trigger: on_load
    preset: pulse
    loop: true
    alternate: true
    duration: 1200
    ease: "inOutSine"
```

---

## Alert Mode Animations

Alert mode (`red`, `yellow`) activates coordinated animations across all registered cards automatically — no per-card configuration needed. See [Config Panel](../config-panel.md) for alert mode controls.

---

## Related

- [Background Animations](effects/background-animations.md)
- [Rules Engine](rules/README.md)
