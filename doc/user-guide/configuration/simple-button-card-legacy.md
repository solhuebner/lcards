# Simple Button Card - Complete Configuration Guide

**Component:** `custom:lcards-simple-button`
**Version:** 1.10.69+
**Type:** SVG-based Button Card
**Schema:** CB-LCARS Compatible

---

## Table of Contents

1. [Overview](#overview)
2. [Basic Configuration](#basic-configuration)
3. [Entity Integration](#entity-integration)
4. [Style Configuration](#style-configuration)
5. [Color Schema (CB-LCARS)](#color-schema-cb-lcars)
6. [Computed Tokens](#computed-tokens)
7. [Theme Tokens](#theme-tokens)
8. [Icons](#icons)
9. [Border & Radius](#border--radius)
10. [Typography](#typography)
11. [Presets](#presets)
12. [Actions](#actions)
13. [Rules Engine Integration](#rules-engine-integration)
14. [Examples](#examples)
15. [Testing Checklist](#testing-checklist)

---

## Overview

The Simple Button Card is a highly flexible, SVG-based button component that:

- ✅ Renders as pure SVG (no DOM elements)
- ✅ Supports Home Assistant entity binding
- ✅ Uses CB-LCARS nested schema for colors
- ✅ Processes computed tokens (`alpha()`, `darken()`, `lighten()`)
- ✅ Resolves CSS variables and theme tokens
- ✅ State-aware styling (active/inactive/unavailable)
- ✅ Integrates with Rules Engine for dynamic behavior
- ✅ Supports per-corner border radius
- ✅ Icon support (left/right positioning)

---

## Basic Configuration

### Minimal Example

```yaml
type: custom:lcards-simple-button
label: "Press Me"
```

### With Entity

```yaml
type: custom:lcards-simple-button
entity: light.living_room
label: "Living Room"
```

### Common Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | string | **required** | Must be `custom:lcards-simple-button` |
| `label` | string | `'Button'` | Text displayed on button |
| `entity` | string | `null` | Home Assistant entity ID |
| `preset` | string | `null` | Style preset name (see [Presets](#presets)) |
| `style` | object | `{}` | Style overrides (see [Style Configuration](#style-configuration)) |
| `icon` | object | `null` | Icon configuration (see [Icons](#icons)) |
| `tap_action` | object | `{action: 'toggle'}` | Action on tap |
| `hold_action` | object | `{action: 'more-info'}` | Action on long press |
| `double_tap_action` | object | `null` | Action on double tap |

---

## Entity Integration

### Entity States

The card automatically detects three entity states:

1. **Active** - Entity is `on`, `true`, `open`, `unlocked`, `home`, etc.
2. **Inactive** - Entity is `off`, `false`, `closed`, `locked`, `away`, etc.
3. **Unavailable** - Entity is `unavailable`, `unknown`, or doesn't exist

### State-Based Styling

Colors automatically change based on entity state:

```yaml
type: custom:lcards-simple-button
entity: light.living_room
label: "Living Room"
style:
  card:
    color:
      background:
        active: 'var(--lcars-orange)'      # Light ON
        inactive: 'var(--lcars-gray)'       # Light OFF
        unavailable: 'var(--lcars-ui-red)'  # Light unavailable
```

### Without Entity

If no entity is specified, button always uses `active` state:

```yaml
type: custom:lcards-simple-button
label: "Static Button"
style:
  card:
    color:
      background:
        active: 'var(--lcars-blue)'  # Always uses 'active'
```

---

## Style Configuration

### CB-LCARS Schema

The Simple Button Card uses the **CB-LCARS nested schema** for maximum flexibility and compatibility with legacy configs.

**Schema Structure:**

```yaml
style:
  card:
    color:
      # Border/outline colors (per state)
      default: <color>
      active: <color>
      inactive: <color>
      unavailable: <color>

      background:
        # Fill colors (per state)
        default: <color>
        active: <color>
        inactive: <color>
        unavailable: <color>

      border:
        # Border-specific colors (per state)
        default: <color>
        active: <color>
        inactive: <color>
        unavailable: <color>

  text:
    label:
      color:
        # Text colors (per state)
        default: <color>
        active: <color>
        inactive: <color>
        unavailable: <color>

  # Border configuration
  border_width: <css-size>
  border_radius: <css-size | object>

  # Typography
  font_size: <css-size>
  font_weight: <css-value>
  font_family: <css-font-stack>

  # Visual effects
  opacity: <number>
```

### Backward Compatibility (Flat Schema)

Legacy flat keys are still supported for backward compatibility:

```yaml
style:
  background_color: 'var(--lcars-orange)'  # Deprecated but works
  text_color: 'black'                      # Deprecated but works
  border_color: 'var(--lcars-gray)'        # Deprecated but works
```

**Recommendation:** Use nested CB-LCARS schema for new configurations.

---

## Color Schema (CB-LCARS)

### Background Colors

**Path:** `style.card.color.background.{state}`

```yaml
style:
  card:
    color:
      background:
        default: null                       # Used if state-specific not found
        active: 'var(--lcars-orange)'       # Entity ON
        inactive: 'var(--lcars-gray)'       # Entity OFF
        unavailable: 'var(--lcars-ui-red)'  # Entity unavailable
```

### Border Colors

**Path:** `style.card.color.border.{state}`

```yaml
style:
  card:
    color:
      border:
        active: 'black'
        inactive: 'var(--lcars-color-border-dim)'
```

### Text Colors

**Path:** `style.text.label.color.{state}`

```yaml
style:
  text:
    label:
      color:
        active: 'black'
        inactive: 'var(--lcars-color-text-disabled)'
        unavailable: 'var(--lcars-ui-red)'
```

### Color Resolution Priority

1. State-specific value (`active`, `inactive`, `unavailable`)
2. `default` value (if specified)
3. Theme token default
4. Hardcoded fallback

**Example:**

```yaml
style:
  card:
    color:
      background:
        default: 'var(--lcars-blue)'  # Used for all states unless overridden
        inactive: 'var(--lcars-gray)' # Only used when entity is OFF
```

---

## Computed Tokens

### What Are Computed Tokens?

Computed tokens are **color functions** that generate CSS `color-mix()` expressions at runtime.

### Supported Functions

#### `alpha(color, opacity)`

Apply transparency to a color.

```yaml
style:
  card:
    color:
      background:
        inactive: alpha(colors.accent.primary, 0.7)
```

**Resolves to:**
```css
color-mix(in srgb, var(--lcars-orange) 70%, transparent)
```

**Parameters:**
- `color` - Color reference (e.g., `colors.accent.primary`, `var(--my-color)`)
- `opacity` - Number between 0-1 (e.g., `0.7` = 70% opaque)

---

#### `darken(color, amount)`

Darken a color by mixing with black.

```yaml
style:
  card:
    color:
      background:
        active: darken(colors.accent.primary, 20)
```

**Resolves to:**
```css
color-mix(in srgb, var(--lcars-orange), black 20%)
```

**Parameters:**
- `color` - Color reference
- `amount` - Percentage to darken (0-100)

---

#### `lighten(color, amount)`

Lighten a color by mixing with white.

```yaml
style:
  card:
    color:
      background:
        active: lighten(colors.accent.primary, 20)
```

**Resolves to:**
```css
color-mix(in srgb, var(--lcars-orange), white 20%)
```

**Parameters:**
- `color` - Color reference
- `amount` - Percentage to lighten (0-100)

---

### Computed Token Examples

```yaml
type: custom:lcards-simple-button
entity: light.bedroom
label: "Bedroom"
style:
  card:
    color:
      background:
        active: 'var(--lcars-orange)'                    # Direct CSS var
        inactive: alpha(colors.accent.primary, 0.5)      # 50% transparent
        unavailable: darken(colors.ui.error, 30)         # Darkened red
```

---

## Theme Tokens

### What Are Theme Tokens?

Theme tokens reference values from the active LCARdS theme using `theme:` prefix.

### Syntax

```yaml
theme:path.to.token
```

### Example

```yaml
style:
  card:
    color:
      background:
        active: theme:components.button.base.background.active
        inactive: theme:components.button.base.background.inactive
  text:
    label:
      color:
        active: theme:components.button.base.text.active
```

### Common Theme Token Paths

| Path | Description |
|------|-------------|
| `theme:components.button.base.background.active` | Button background when active |
| `theme:components.button.base.background.inactive` | Button background when inactive |
| `theme:components.button.base.text.active` | Button text when active |
| `theme:components.button.base.text.inactive` | Button text when inactive |
| `theme:colors.accent.primary` | Primary accent color |
| `theme:colors.ui.success` | Success state color |
| `theme:colors.ui.error` | Error state color |

### Nested Resolution

Theme tokens can resolve to other tokens or computed tokens:

```javascript
// In theme definition:
components: {
  button: {
    base: {
      background: {
        inactive: 'alpha(colors.accent.primary, 0.7)'  // Computed token!
      }
    }
  }
}
```

When you use:
```yaml
theme:components.button.base.background.inactive
```

It resolves:
1. `theme:...` → `'alpha(colors.accent.primary, 0.7)'`
2. `alpha(...)` → `'color-mix(in srgb, var(--lcars-orange) 70%, transparent)'`

---

## Icons

### Icon Configuration

**Path:** `icon`

```yaml
icon:
  icon: <icon-name>       # Icon identifier (mdi:lightbulb, si:github, etc.)
  type: <icon-type>       # 'mdi', 'si', 'entity'
  position: <position>    # 'left' or 'right'
  color: <color>          # Icon color (CSS color)
  size: <size>            # Icon size in pixels (number)
```

### Icon Types

| Type | Description | Example |
|------|-------------|---------|
| `mdi` | Material Design Icons | `mdi:lightbulb` |
| `si` | Simple Icons | `si:github` |
| `entity` | Use entity's icon | (uses entity's icon attribute) |

### Examples

#### Material Design Icon (Left)

```yaml
type: custom:lcards-simple-button
entity: light.living_room
label: "Living Room"
icon:
  type: mdi
  icon: lightbulb
  position: left
  color: 'var(--lcars-color-text)'
  size: 24
```

#### Simple Icon (Right)

```yaml
type: custom:lcards-simple-button
label: "GitHub"
icon:
  type: si
  icon: github
  position: right
  color: black
  size: 20
```

#### Entity Icon

```yaml
type: custom:lcards-simple-button
entity: switch.coffee_maker
label: "Coffee"
icon:
  type: entity
  position: left
  size: 24
```

### Icon with State Colors

Icons don't automatically change color by state - use Rules Engine for dynamic icon colors:

```yaml
type: custom:lcards-simple-button
entity: light.living_room
label: "Living Room"
icon:
  type: mdi
  icon: lightbulb
  position: left
  size: 24
rules:
  - conditions:
      - entity: light.living_room
        state: 'on'
    style_patch:
      icon:
        color: 'var(--lcars-yellow)'
  - conditions:
      - entity: light.living_room
        state: 'off'
    style_patch:
      icon:
        color: 'var(--lcars-gray)'
```

---

## Border & Radius

### Border Width

**Path:** `style.border_width`

```yaml
style:
  border_width: 2px
```

### Border Radius

#### Uniform Radius

**Path:** `style.border_radius`

```yaml
style:
  border_radius: 8px
```

#### Per-Corner Radius

**Path:** `style.border_radius.{corner}`

```yaml
style:
  border_radius:
    top_left: 20px
    top_right: 8px
    bottom_right: 20px
    bottom_left: 8px
```

#### Mixed Notation

```yaml
style:
  border_radius: 8px  # Default for all corners
  border_radius:
    top_left: 20px    # Override just one corner
```

### CSS Variables for Radius

```yaml
style:
  border_radius: var(--ha-card-border-radius, 12px)
```

### Preset Radius (Lozenge)

```yaml
type: custom:lcards-simple-button
preset: lozenge  # Uses tall lozenge radius
label: "Lozenge Button"
```

---

## Typography

### Font Size

**Path:** `style.font_size`

```yaml
style:
  font_size: 16px
```

### Font Weight

**Path:** `style.font_weight`

```yaml
style:
  font_weight: bold  # normal, bold, 100-900
```

### Font Family

**Path:** `style.font_family`

```yaml
style:
  font_family: "'LCARS', 'Antonio', sans-serif"
```

### Complete Typography Example

```yaml
type: custom:lcards-simple-button
label: "Custom Typography"
style:
  font_size: 18px
  font_weight: 600
  font_family: "'Roboto', sans-serif"
  text:
    label:
      color:
        active: 'var(--lcars-color-text)'
```

---

## Presets

Presets are pre-configured style templates you can apply and then override.

### Available Presets

| Preset | Description |
|--------|-------------|
| `lozenge` | Tall lozenge shape (large corner radius) |
| *(more to be added)* | |

### Using Presets

```yaml
type: custom:lcards-simple-button
preset: lozenge
label: "Lozenge Button"
```

### Overriding Preset Styles

Presets are applied first, then your config overrides:

```yaml
type: custom:lcards-simple-button
preset: lozenge
label: "Custom Lozenge"
style:
  card:
    color:
      background:
        active: 'var(--lcars-blue)'  # Override preset color
```

**Resolution Order:**
1. Preset styles (lowest priority)
2. Config styles (override preset)
3. Theme defaults (if not set in preset/config)
4. Rules patches (highest priority)

---

## Actions

### Tap Action

**Path:** `tap_action`

```yaml
tap_action:
  action: toggle  # toggle, call-service, navigate, more-info, none
```

#### Action Types

**Toggle Entity:**
```yaml
tap_action:
  action: toggle
```

**Call Service:**
```yaml
tap_action:
  action: call-service
  service: light.turn_on
  service_data:
    entity_id: light.living_room
    brightness: 255
```

**Navigate:**
```yaml
tap_action:
  action: navigate
  navigation_path: /lovelace/lights
```

**More Info:**
```yaml
tap_action:
  action: more-info
```

**No Action:**
```yaml
tap_action:
  action: none
```

### Hold Action

**Path:** `hold_action`

Same options as `tap_action`:

```yaml
hold_action:
  action: more-info
```

### Double Tap Action

**Path:** `double_tap_action`

Same options as `tap_action`:

```yaml
double_tap_action:
  action: call-service
  service: light.turn_off
  service_data:
    entity_id: light.living_room
```

---

## Rules Engine Integration

### Dynamic Styling with Rules

Use the Rules Engine to change styles based on entity states or conditions.

```yaml
type: custom:lcards-simple-button
entity: light.living_room
label: "Living Room"
rules:
  - conditions:
      - entity: light.living_room
        state: 'on'
        attribute: brightness
        above: 200
    style_patch:
      card:
        color:
          background:
            active: 'var(--lcars-yellow)'  # Bright light = yellow

  - conditions:
      - entity: light.living_room
        state: 'on'
        attribute: brightness
        below: 100
    style_patch:
      card:
        color:
          background:
            active: 'var(--lcars-orange)'  # Dim light = orange
```

### Rules Priority

Rules have **highest priority** and override all other styles:

1. Preset styles (lowest)
2. Config styles
3. Theme defaults
4. **Rules patches (highest)**

See: [Rules Engine Documentation](./rules.md)

---

## Examples

### Example 1: Basic Light Control

```yaml
type: custom:lcards-simple-button
entity: light.living_room
label: "Living Room"
style:
  card:
    color:
      background:
        active: 'var(--lcars-orange)'
        inactive: 'var(--lcars-gray)'
  border_radius: 12px
tap_action:
  action: toggle
```

---

### Example 2: Computed Tokens

```yaml
type: custom:lcards-simple-button
entity: switch.coffee_maker
label: "Coffee Maker"
style:
  card:
    color:
      background:
        active: 'var(--lcars-orange)'
        inactive: alpha(colors.accent.primary, 0.5)  # 50% transparent when off
        unavailable: darken(colors.ui.error, 20)     # Dark red when unavailable
  text:
    label:
      color:
        active: black
        inactive: 'var(--lcars-color-text-disabled)'
```

---

### Example 3: Theme Tokens

```yaml
type: custom:lcards-simple-button
entity: light.bedroom
label: "Bedroom"
style:
  card:
    color:
      background:
        active: theme:components.button.base.background.active
        inactive: theme:components.button.base.background.inactive
  text:
    label:
      color:
        active: theme:components.button.base.text.active
        inactive: theme:components.button.base.text.inactive
```

---

### Example 4: With Icon

```yaml
type: custom:lcards-simple-button
entity: light.kitchen
label: "Kitchen"
icon:
  type: mdi
  icon: lightbulb
  position: left
  color: 'var(--lcars-color-text)'
  size: 24
style:
  card:
    color:
      background:
        active: 'var(--lcars-yellow)'
        inactive: 'var(--lcars-gray)'
  border_radius: 8px
```

---

### Example 5: Per-Corner Radius

```yaml
type: custom:lcards-simple-button
label: "Custom Shape"
style:
  card:
    color:
      background:
        active: 'var(--lcars-blue)'
  border_radius:
    top_left: 20px
    top_right: 4px
    bottom_right: 20px
    bottom_left: 4px
```

---

### Example 6: Lozenge Preset

```yaml
type: custom:lcards-simple-button
preset: lozenge
entity: climate.living_room
label: "Climate"
style:
  card:
    color:
      background:
        active: 'var(--lcars-blue)'
        inactive: 'var(--lcars-gray)'
```

---

### Example 7: CSS Variables

```yaml
type: custom:lcards-simple-button
entity: light.office
label: "Office"
style:
  card:
    color:
      background:
        active: var(--ha-card-background)
        inactive: var(--primary-background-color)
  border_radius: var(--ha-card-border-radius, 12px)
  font_size: var(--paper-font-body1_-_font-size)
```

---

### Example 8: Rules Engine Integration

```yaml
type: custom:lcards-simple-button
entity: sensor.temperature
label: "Temperature"
style:
  card:
    color:
      background:
        default: 'var(--lcars-blue)'
  text:
    label:
      color:
        default: white
rules:
  - conditions:
      - entity: sensor.temperature
        above: 75
    style_patch:
      card:
        color:
          background:
            default: 'var(--lcars-ui-red)'  # Hot!

  - conditions:
      - entity: sensor.temperature
        below: 60
    style_patch:
      card:
        color:
          background:
            default: 'var(--lcars-ui-blue)'  # Cold!
```

---

### Example 9: Multi-State Color Control

```yaml
type: custom:lcards-simple-button
entity: binary_sensor.motion_living_room
label: "Motion"
style:
  card:
    color:
      background:
        active: 'var(--lcars-ui-red)'        # Motion detected
        inactive: 'var(--lcars-gray)'        # No motion
        unavailable: 'var(--lcars-ui-gray)'  # Sensor offline
  text:
    label:
      color:
        active: white
        inactive: 'var(--lcars-color-text-disabled)'
        unavailable: 'var(--lcars-ui-red)'
  border_radius: 16px
```

---

### Example 10: Complex Service Call

```yaml
type: custom:lcards-simple-button
label: "Movie Mode"
icon:
  type: mdi
  icon: movie
  position: left
  size: 24
style:
  card:
    color:
      background:
        active: 'var(--lcars-purple)'
  border_radius: 12px
tap_action:
  action: call-service
  service: script.movie_mode
hold_action:
  action: call-service
  service: script.lights_on
double_tap_action:
  action: navigate
  navigation_path: /lovelace/media
```

---

## Testing Checklist

Use this checklist to verify all configuration options work correctly:

### Basic Rendering
- [ ] Card renders without entity
- [ ] Card renders with entity
- [ ] Label displays correctly
- [ ] Default colors apply

### Entity States
- [ ] Active state (entity ON) shows correct color
- [ ] Inactive state (entity OFF) shows correct color
- [ ] Unavailable state shows correct color
- [ ] State changes update colors **without refresh**

### Color Configuration
- [ ] Nested schema: `card.color.background.active` works
- [ ] Nested schema: `card.color.background.inactive` works
- [ ] Nested schema: `card.color.background.unavailable` works
- [ ] Nested schema: `text.label.color.{state}` works
- [ ] Flat schema: `background_color` works (backward compat)
- [ ] Flat schema: `text_color` works (backward compat)

### Computed Tokens
- [ ] `alpha(colors.accent.primary, 0.7)` resolves to `color-mix()`
- [ ] `darken(colors.accent.primary, 20)` resolves correctly
- [ ] `lighten(colors.accent.primary, 20)` resolves correctly
- [ ] Computed tokens work in nested schema
- [ ] Computed tokens work in theme tokens

### Theme Tokens
- [ ] `theme:components.button.base.background.active` resolves
- [ ] `theme:...` resolves recursively (token → computed token → CSS)
- [ ] Theme tokens work in nested schema

### CSS Variables
- [ ] `var(--ha-card-background)` passes through unchanged
- [ ] `var(--lcars-orange)` resolves correctly
- [ ] CSS variables work with fallbacks: `var(--x, fallback)`
- [ ] CSS variables work in border_radius

### Border & Radius
- [ ] `border_width: 2px` applies correctly
- [ ] `border_radius: 12px` applies to all corners
- [ ] Per-corner radius: `border_radius.top_left` works
- [ ] Per-corner radius: All 4 corners independently
- [ ] CSS variable radius: `var(--ha-card-border-radius)` works

### Typography
- [ ] `font_size: 16px` applies
- [ ] `font_weight: bold` applies
- [ ] `font_family: "..."` applies

### Icons
- [ ] Material Design icon (`mdi:lightbulb`) renders
- [ ] Simple Icon (`si:github`) renders
- [ ] Entity icon renders
- [ ] Icon position: `left` works
- [ ] Icon position: `right` works
- [ ] Icon color applies
- [ ] Icon size applies

### Actions
- [ ] `tap_action: toggle` toggles entity
- [ ] `tap_action: call-service` calls service
- [ ] `tap_action: navigate` navigates
- [ ] `tap_action: more-info` shows more info
- [ ] `hold_action` triggers on long press
- [ ] `double_tap_action` triggers on double tap

### Presets
- [ ] `preset: lozenge` applies lozenge style
- [ ] Preset styles can be overridden by config
- [ ] Preset + computed tokens work together

### Rules Engine
- [ ] Rules apply style patches
- [ ] Rules override config styles
- [ ] Rules work with nested schema
- [ ] Rules trigger on entity state changes
- [ ] Rules work with computed tokens

### Performance
- [ ] State changes don't cause refresh flicker
- [ ] Multiple buttons render efficiently
- [ ] No console errors on load
- [ ] No console errors on state change

### Edge Cases
- [ ] Button works without entity
- [ ] Button works with invalid entity
- [ ] Button handles missing style properties gracefully
- [ ] Button handles malformed computed tokens gracefully
- [ ] Button handles circular theme token references

---

## Troubleshooting

### Colors Don't Change on State Change

**Problem:** Button stays same color when entity toggles.

**Solutions:**
1. Check entity state is actually changing in Developer Tools
2. Verify color paths use correct schema:
   ```yaml
   # CORRECT:
   style:
     card:
       color:
         background:
           active: 'orange'

   # WRONG (won't be state-aware):
   style:
     background_color: 'orange'
   ```
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

---

### Computed Tokens Render as Text

**Problem:** See `alpha(colors.accent.primary, 0.7)` in DOM instead of `color-mix()`.

**Solutions:**
1. Update to v1.10.69 or later
2. Verify ThemeManager is initialized
3. Check for typos in computed token syntax

---

### CSS Variables Don't Work

**Problem:** `var(--ha-card-background)` doesn't resolve.

**Solutions:**
1. Verify variable exists in theme
2. Check variable spelling
3. Use fallback: `var(--ha-card-background, #fff)`

---

### Icons Don't Appear

**Problem:** Icon not visible on button.

**Solutions:**
1. Verify icon type matches icon name (`mdi:` prefix for Material Design)
2. Check icon exists: [Material Design Icons](https://pictogrammers.com/library/mdi/)
3. Try increasing `size` property
4. Check `color` isn't same as `background`

---

### Border Radius Not Applying

**Problem:** Corners stay square.

**Solutions:**
1. Use correct path: `style.border_radius` (not `style.card.border_radius`)
2. For per-corner: Use `top_left`, `top_right`, `bottom_right`, `bottom_left`
3. Check CSS units included: `12px` not `12`

---

## Schema Reference

### Complete Schema Tree

```yaml
type: custom:lcards-simple-button
entity: <entity-id>
label: <string>
preset: <preset-name>

# Styling (CB-LCARS schema)
style:
  # Card colors
  card:
    color:
      default: <color>
      active: <color>
      inactive: <color>
      unavailable: <color>
      background:
        default: <color>
        active: <color>
        inactive: <color>
        unavailable: <color>
      border:
        default: <color>
        active: <color>
        inactive: <color>
        unavailable: <color>

  # Text colors
  text:
    label:
      color:
        default: <color>
        active: <color>
        inactive: <color>
        unavailable: <color>

  # Border
  border_width: <css-size>
  border_radius: <css-size | object>
    # OR per-corner:
    top_left: <css-size>
    top_right: <css-size>
    bottom_right: <css-size>
    bottom_left: <css-size>

  # Typography
  font_size: <css-size>
  font_weight: <css-value>
  font_family: <css-font-stack>

  # Effects
  opacity: <number>

# Icon
icon:
  type: mdi | si | entity
  icon: <icon-name>
  position: left | right
  color: <color>
  size: <number>

# Actions
tap_action:
  action: toggle | call-service | navigate | more-info | none
  service: <service-name>          # for call-service
  service_data: <object>           # for call-service
  navigation_path: <path>          # for navigate

hold_action:
  action: <same as tap_action>
  # ...

double_tap_action:
  action: <same as tap_action>
  # ...

# Rules Engine
rules:
  - conditions:
      - entity: <entity-id>
        state: <value>
        attribute: <attr-name>
        above: <number>
        below: <number>
    style_patch:
      <same structure as style>
```

---

## Version History

| Version | Changes |
|---------|---------|
| 1.10.69 | CB-LCARS schema alignment, computed token resolution |
| 1.10.67 | Deep merge utility, recursive theme token resolution |
| 1.10.66 | Reactive updates, button color fixes |
| 1.10.63 | Per-corner radius support |

---

## Related Documentation

- [Rules Engine](./rules.md)
- [Theme Tokens](../advanced/theme-tokens.md)
- [CB-LCARS Compatibility](../../architecture/cb-lcars-schema.md)
- [Color Utilities](../advanced/color-utils.md)

---

**Last Updated:** v1.10.69
**Status:** ✅ Production Ready
