# Entity Change Animation Triggers

## Overview

The `on_entity_change` trigger provides declarative entity state monitoring for animations defined directly in a card overlay's `animations` array. It is designed for common reactive animations on a single overlay without needing a separate rule definition.

There are two distinct behaviours:

| Behaviour | Fields | Auto-stops loop? |
|---|---|---|
| **Fire-and-forget** | `to_state`, `from_state` | No |
| **Lifecycle (while)** | `while` + `loop: true` | Yes |

For multi-entity conditions, cross-overlay coordination, or template-based logic use [rule-based animations](rule-based-animations.md) instead.

---

## Basic Usage

```yaml
animations:
  - trigger: on_entity_change
    entity: light.bedroom
    preset: pulse
    duration: 500
```

Whenever `light.bedroom` changes state the animation plays once.

---

## Fire-and-Forget Gates: `from_state` and `to_state`

`from_state` and `to_state` filter which state **transition** triggers the animation. They do **not** stop a looping animation — once started it runs until completion (or loops indefinitely).

```yaml
animations:
  # Plays once when light turns on — loop: true makes it loop indefinitely
  - trigger: on_entity_change
    entity: light.kitchen
    to_state: 'on'
    preset: glow
    loop: true       # ⚠️ will NOT stop when light turns off — use 'while' for that

  # Plays once on the off→on transition only
  - trigger: on_entity_change
    entity: binary_sensor.door
    from_state: 'off'
    to_state: 'on'
    preset: alert_pulse
    duration: 300
```

> **Important:** `to_state` / `from_state` are fire gates. They control when an animation *starts* but will not stop it. For a looping animation that should stop when the condition clears, use `while` below.

---

## Attribute: Reading Entity Attributes Instead of State

Use `attribute` to compare against an entity attribute rather than the raw state string. Applies uniformly to `from_state`, `to_state`, and `while`.

```yaml
- trigger: on_entity_change
  entity: light.kitchen
  attribute: brightness_pct    # computed 0-100 percentage (brightness / 2.55)
  while:
    above: 50
  preset: glow
  loop: true
  check_on_load: true
```

**Special virtual attribute: `brightness_pct`**

Lights expose raw brightness as a 0–255 number. `brightness_pct` computes `Math.round(brightness / 2.55)` automatically, giving a clean 0–100 percentage without manual conversion.

```yaml
  attribute: brightness_pct   # ✅ 0-100
  attribute: brightness       # ⚠️ 0-255 raw
```

---

## Lifecycle Conditions: `while`

The `while` block makes a looping animation **state-aware**: it plays while the condition is true and stops automatically when it becomes false. Requires `loop: true`.

```yaml
- trigger: on_entity_change
  entity: light.kitchen
  preset: pulse
  loop: true
  while:
    state: 'on'            # plays while light is on, stops when it turns off
  check_on_load: true      # also start immediately if already in matching state
```

### `while` condition keys (use exactly one)

| Key | Type | Meaning |
|---|---|---|
| `state` | string | value equals this string |
| `not_state` | string | value does NOT equal this string |
| `above` | number | numeric value is strictly greater than threshold |
| `below` | number | numeric value is strictly less than threshold |

### Combined fire gate + while

`to_state` can narrow when the animation *starts*, while `while` controls when it *stops*:

```yaml
- trigger: on_entity_change
  entity: light.kitchen
  to_state: 'on'     # only start on the off→on transition (not mid-state on load)
  while:
    state: 'on'      # stop automatically when state is no longer 'on'
  preset: pulse
  loop: true
```

With `check_on_load: true` and no `to_state`, the animation starts immediately on card load if the condition is already met:

```yaml
- trigger: on_entity_change
  entity: light.kitchen
  while:
    state: 'on'
  preset: pulse
  loop: true
  check_on_load: true   # starts immediately if light is already on when page loads
```

### Attribute + while example

```yaml
- trigger: on_entity_change
  entity: climate.living_room
  attribute: current_temperature
  while:
    above: 24
  preset: alert_pulse
  loop: true
  check_on_load: true
```

---

## `check_on_load`

By default, `on_entity_change` only reacts to *changes*. Setting `check_on_load: true` also evaluates the current state when the card first renders:

- **With `while`:** starts the looping animation immediately if the condition is already met.
- **With `to_state` (no `while`):** plays once if the entity is already in `to_state`.
- `from_state` is never checked on load (there is no previous state).

---

## Multiple Animations per Overlay

```yaml
animations:
  - trigger: on_entity_change
    entity: light.bedroom
    to_state: 'on'
    preset: fade_in
    duration: 300

  - trigger: on_entity_change
    entity: light.bedroom
    to_state: 'off'
    preset: fade_out
    duration: 300
```

---

## Feature Comparison: `on_entity_change` vs Rule-Based

| Feature | `on_entity_change` | Rule-Based (`apply.animations`) |
|---|---|---|
| **Scope** | Single overlay | Multi-overlay, cross-card |
| **Targeting** | Implicit (overlay itself) | Explicit (tag, ID, type, pattern) |
| **Conditions** | State, attribute, simple numeric | Full RulesEngine: templates, all/any, datasource |
| **Auto-stop looping** | Yes — with `while` | Yes — on rule unmatch |
| **Setup** | Simple — inline in overlay config | Requires a rule definition |
| **map_range params** | ✅ Supported | ✅ Supported |

---

## When to Use Each

**Use `on_entity_change` when:**

- Monitoring a single entity on a single overlay
- Condition is a simple state string, attribute equality, or numeric threshold
- Don't want to write a separate rule — inline config is enough

**Use rule-based animations when:**

- Need multi-entity conditions (`all`, `any` logic)
- Same animation targets multiple overlays (by tag, type, or pattern)
- Need template expressions or time-based conditions
- Condition logic is complex enough to belong in a rules section

---

## See Also

- [Animation System Overview](./)
- [Rule-Based Animations](rule-based-animations.md)
- [Animation Manager](../subsystems/animation-manager.md)
