# Simple Button Card - Official Schema Definition (v1.14.16)

**Date:** November 16, 2025
**Purpose:** Single source of truth for schema - update tokens, presets, code, and docs from this
**Status:** 🎯 DEFINITIVE - All implementations must match this

---

## Complete YAML Schema

```yaml
type: custom:lcards-simple-button

# Core properties
entity: <entity-id>              # Optional - if omitted, always uses 'active' state
label: <string>                  # Legacy: Button label text (use 'text:' for new syntax)
text:                            # NEW: Multi-text label system
  <field-id>:                    # Arbitrary field ID (e.g., 'label', 'title', 'status')
    content: <string>            # Text content to display
    position: <position-name>    # Named position or explicit coordinates
    x: <number>                  # Explicit x coordinate (overrides position)
    y: <number>                  # Explicit y coordinate (overrides position)
    x_percent: <number>          # Percentage x position (0-100)
    y_percent: <number>          # Percentage y position (0-100)
    padding: <number|object>     # Uniform or {top, right, bottom, left}
    size: <number>               # Font size in pixels (default: 14)
    color: <color|object>        # Color string or {active, inactive, unavailable}
    font_weight: <css-value>     # Font weight (default: bold)
    font_family: <css-value>     # Font family
    anchor: start | middle | end # Text anchor (default: from position)
    baseline: hanging | central | alphabetic  # Baseline (default: from position)
    show: <boolean>              # Show/hide field (default: true)
    template: <boolean>          # Enable template processing (default: true)
preset: <preset-name>            # Optional - style preset to apply first

# Icon (HA-style)
icon: <icon-string>              # Simple: 'mdi:lightbulb', 'si:github', 'entity', null
# OR advanced:
icon:
  icon: <icon-string>            # 'mdi:lightbulb', 'si:github', 'entity'
  position: left | right         # Default: left
  size: <number>                 # Pixels (default: 24)
  color: <color>                 # CSS color (default: inherit)

# Style (CB-LCARS schema)
style:
  # Card colors
  card:
    color:
      # Border/outline colors (per state)
      default: <color>
      active: <color>
      inactive: <color>
      unavailable: <color>

      # Background fill colors (per state)
      background:
        default: <color>
        active: <color>
        inactive: <color>
        unavailable: <color>

  # Border configuration (grouped)
  border:
    # Width - uniform or per-side
    width: <css-size>            # Uniform width (default: 2px)
    # OR per-side:
    width:
      top: <css-size>
      right: <css-size>
      bottom: <css-size>
      left: <css-size>

    # Radius - uniform or per-corner
    radius: <css-size>           # Uniform radius
    # OR per-corner:
    radius:
      top_left: <css-size>
      top_right: <css-size>
      bottom_right: <css-size>
      bottom_left: <css-size>

    # Border colors (per state)
    color:
      default: <color>
      active: <color>
      inactive: <color>
      unavailable: <color>

    # Individual side styling (advanced)
    top:
      width: <css-size>
      color: <color>
    right:
      width: <css-size>
      color: <color>
    bottom:
      width: <css-size>
      color: <color>
    left:
      width: <css-size>
      color: <color>  # Text defaults (for current label, future texts array inherits these)
  text:
    default:
      # Text colors (per state)
      color:
        default: <color>
        active: <color>
        inactive: <color>
        unavailable: <color>

      # Typography
      font_size: <css-size>      # Default: 14px
      font_weight: <css-value>   # Default: bold
      font_family: <css-font-stack>  # Default: 'LCARS', 'Antonio', sans-serif

  # Visual effects
  opacity: <number>              # 0-1 (applied to entire button)

# Actions
tap_action:
  action: toggle | call-service | navigate | more-info | none
  service: <service-name>        # For call-service
  service_data: <object>         # For call-service
  navigation_path: <path>        # For navigate

hold_action:
  action: <same as tap_action>
  # ... same fields

double_tap_action:
  action: <same as tap_action>
  # ... same fields

# Rules Engine (correct syntax)
rules:
  - when:
      # Option 1: JavaScript/Jinja2/Token condition
      condition: <expression>

      # Option 2: Entity condition
      entity: <entity-id>
      state: <value>
      above: <number>
      below: <number>

      # Option 3: Logical operators
      all:
        - condition: <expression>
        - entity: <entity-id>
          state: <value>
      any:
        - condition: <expression>
        - entity: <entity-id>
          state: <value>

    apply:
      style:
        <same structure as style above>
```

---

## Color Value Types

Colors can be any of:
- **CSS Variables:** `var(--lcars-orange)`, `var(--ha-card-background)`
- **Theme Tokens:** `theme:components.button.base.background.active`
- **Computed Tokens:** `alpha(colors.accent.primary, 0.7)`, `darken(colors.ui.error, 20)`
- **Direct CSS:** `'#FF9900'`, `'rgb(255, 153, 0)'`, `'orange'`

---

## State-Based Properties

These properties support state-specific values (active/inactive/unavailable):
- `card.color.{state}` - Border/outline color
- `card.color.background.{state}` - Fill color
- `border.color.{state}` - Border stroke color
- `text.default.color.{state}` - Text color

**State Resolution:**
1. Check `{property}.{currentState}` (e.g., `background.active`)
2. Fall back to `{property}.default` if not found
3. Fall back to theme token default
4. Fall back to hardcoded default

---

## Backward Compatibility

### Flat Keys (Deprecated but Supported)

These flat keys still work for backward compatibility:
- `background_color` → Read as `card.color.background.active`
- `text_color` → Read as `text.default.color.active`
- `border_color` → Read as `border.color.active`
- `border_width` → Read as `border.width`
- `border_radius` → Read as `border.radius`
- `font_size` → Read as `text.default.font_size`
- `font_weight` → Read as `text.default.font_weight`
- `font_family` → Read as `text.default.font_family`

**Recommendation:** Use nested schema for new configs. Flat keys will be removed in v2.0.

---

## Border Flexibility

### Per-Side Width

Control width of each border side independently:

```yaml
style:
  border:
    width:
      top: 3px
      right: 1px
      bottom: 3px
      left: 1px
```

### Per-Corner Radius

Control radius of each corner independently:

```yaml
style:
  border:
    radius:
      top_left: 20px
      top_right: 8px
      bottom_right: 20px
      bottom_left: 8px
```

### Individual Side Styling

Complete control over each side (width + color):

```yaml
style:
  border:
    top:
      width: 3px
      color: 'var(--lcars-orange)'
    right:
      width: 1px
      color: 'var(--lcars-gray)'
    bottom:
      width: 3px
      color: 'var(--lcars-orange)'
    left:
      width: 1px
      color: 'var(--lcars-gray)'
```

### Mixed Configurations

You can mix uniform and per-side settings:

```yaml
style:
  border:
    width: 2px               # Default for all sides
    width:
      top: 3px              # Override just top
    radius:
      top_left: 20px
      top_right: 8px
      bottom_right: 20px
      bottom_left: 8px
    color:
      active: 'black'        # Applies to all sides
```

---

## Rules Engine Syntax

### Correct Syntax (from rules-engine-template-syntax.md)

**JavaScript Expression:**
```yaml
rules:
  - when:
      condition: "entity.state === 'on'"
    apply:
      style:
        card:
          color:
            background:
              active: 'var(--lcars-yellow)'
```

**Jinja2 Template:**
```yaml
rules:
  - when:
      condition: "{{ states('sensor.temperature') | float > 25 }}"
    apply:
      style:
        text:
          default:
            color:
              active: 'red'
```

**Entity Condition:**
```yaml
rules:
  - when:
      entity: sensor.temperature
      above: 25
    apply:
      style:
        card:
          color:
            background:
              active: 'var(--lcars-ui-red)'
```

**Logical Operators:**
```yaml
rules:
  - when:
      all:
        - entity: light.desk
          state: 'on'
        - condition: "{{ now().hour >= 18 }}"
    apply:
      style:
        card:
          color:
            background:
              active: 'var(--lcars-purple)'
```

### WRONG Syntax (Do Not Use)

❌ **Incorrect:**
```yaml
rules:
  - conditions:  # WRONG - should be 'when'
      - entity: light.desk
        state: 'on'
    style_patch:  # WRONG - should be 'apply'
      background_color: 'red'  # WRONG - use nested schema
```

✅ **Correct:**
```yaml
rules:
  - when:
      entity: light.desk
      state: 'on'
    apply:
      style:
        card:
          color:
            background:
              active: 'red'
```

---

## Icon Syntax

### HA-Style (Recommended)

**Simple Icons:**
```yaml
icon: 'mdi:lightbulb'    # Material Design Icons
icon: 'si:github'        # Simple Icons
icon: 'entity'           # Use entity's icon attribute
icon: null               # No icon
```

**Advanced (with options):**
```yaml
icon:
  icon: 'mdi:lightbulb'
  position: left         # or 'right'
  size: 24              # pixels
  color: 'black'        # CSS color
```

### Old Syntax (Deprecated but Supported)

❌ **Deprecated:**
```yaml
icon:
  type: mdi            # Don't specify type separately
  icon: lightbulb
```

✅ **Use instead:**
```yaml
icon: 'mdi:lightbulb'
```

---

## Theme Token Paths

Theme tokens should use this structure:

```javascript
components: {
  button: {
    base: {
      // Background colors
      background: {
        active: 'var(--lcars-orange)',
        inactive: 'alpha(colors.accent.primary, 0.7)',
        unavailable: 'var(--lcars-ui-gray)'
      },

      // Border configuration
      border: {
        width: '2px',
        radius: '8px',
        color: {
          active: 'black',
          inactive: 'var(--lcars-gray)',
          unavailable: 'var(--lcars-ui-gray)'
        }
        // Per-side/corner also supported:
        // width: { top: '2px', right: '2px', bottom: '2px', left: '2px' }
        // radius: { top_left: '20px', top_right: '8px', ... }
        // top: { width: '3px', color: 'red' }
      },

      // Text defaults
      text: {
        default: {
          color: {
            active: 'black',
            inactive: 'var(--lcars-color-text-disabled)',
            unavailable: 'var(--lcars-ui-red)'
          },
          font_size: '14px',
          font_weight: 'bold',
          font_family: "'LCARS', 'Antonio', sans-serif"
        }
      }
    }
  }
}
```

**Usage in config:**
```yaml
style:
  card:
    color:
      background:
        active: theme:components.button.base.background.active
  border:
    radius: theme:components.button.base.border.radius
  text:
    default:
      color:
        active: theme:components.button.base.text.default.color.active
```

---

## Preset Structure

Presets should follow the same schema:

```javascript
button: {
  lozenge: {
    border: {
      radius: {
        top_left: '50%',
        top_right: '8px',
        bottom_right: '50%',
        bottom_left: '8px'
      }
    }
  }
}
```

---

## Multi-Text Label System (Phase 1)

**Status:** ✅ IMPLEMENTED (v1.14.16)

The multi-text label system allows multiple text fields with flexible positioning.

### Named Positions

Nine pre-defined positions with automatic anchor/baseline:

- **Corners:** `top-left`, `top-right`, `bottom-left`, `bottom-right`
- **Edges:** `top-center`, `bottom-center`, `left-center`, `right-center`
- **Center:** `center`

### Basic Syntax

```yaml
# Legacy (still supported)
label: "Button Text"

# New multi-text syntax
text:
  label:
    content: "Button Text"
    position: center
```

### Multiple Fields

```yaml
text:
  title:
    content: "Room Control"
    position: top-center
    size: 16
    font_weight: bold

  subtitle:
    content: "Living Room"
    position: center
    size: 14

  status:
    content: "Active"
    position: bottom-center
    size: 12
    color: "#66FF66"
```

### Custom Padding

```yaml
text:
  label:
    content: "Padded Text"
    position: top-left
    padding: 20  # Uniform padding

  custom:
    content: "Custom Padding"
    position: top-right
    padding:
      top: 25
      left: 30
      bottom: 10
      right: 15
```

### State-Based Colors

```yaml
text:
  label:
    content: "State Colors"
    position: center
    color:
      active: "#66FF66"       # When entity is ON
      inactive: "#FF6666"     # When entity is OFF
      unavailable: "#666666"  # When unavailable
```

### Preset Fields

Three fields have default positions:
- `label`: defaults to `center`
- `name`: defaults to `top-left`
- `state`: defaults to `bottom-right`

```yaml
text:
  label:
    content: "Main Label"
    # Uses default center position

  name:
    content: "Device Name"
    # Uses default top-left position

  state:
    content: "ON"
    # Uses default bottom-right position
```

### Icon Area Awareness

Text automatically accounts for icon space:

```yaml
icon:
  show: true
  icon: mdi:lightbulb
  position: left
  area_width: 80  # Optional, auto-calculated if omitted

text:
  label:
    content: "With Icon"
    position: center  # Centers in remaining space (excludes icon area)
```

---

## Future: Multi-Text Support (Phase 2)

Phase 2 will add:
- Multi-line text wrapping
- Text rotation
- Template support in content
- Advanced positioning (explicit x/y coordinates)
- Percentage-based positioning

When implemented, it will continue to inherit from `text.default`:

```yaml
# Future Phase 2 syntax (not yet implemented)
text:
  dynamic:
    content: "{entity.state}"
    position: top-left
    rotation: 45
    wrap: true
    max_width: 150
```

---

## Implementation Checklist

To implement this schema:

### 1. Theme Tokens
- [ ] Update `lcarsClassicTokens.js`
- [ ] Change `components.button.base` structure
- [ ] Use `border.{width|radius|color.state}`
- [ ] Use `text.default.{color.state|font_*}`

### 2. Presets
- [ ] Update button presets (e.g., `lozenge`)
- [ ] Use `border.radius` instead of flat `border_radius`
- [ ] Use nested schema throughout

### 3. Button Code
- [ ] Update `_resolveButtonStyleSync()` to write to nested paths
- [ ] Update `_generateSimpleButtonSVG()` to read from nested paths
- [ ] Add backward compatibility fallbacks for flat keys
- [ ] Update `_resolveBorderConfiguration()` to read from `border.radius`

### 4. Documentation
- [ ] Update `simple-button-card.md` with this schema
- [ ] Fix rules syntax examples
- [ ] Fix icon syntax examples
- [ ] Add comprehensive YAML example at bottom

### 5. Testing
- [ ] Update all test configs in `simple-button-testing.md`
- [ ] Test backward compatibility with flat keys
- [ ] Verify rules engine integration
- [ ] Verify computed tokens work in nested paths

---

## Migration Guide

### For Users

**Migrating from flat to nested:**

```yaml
# OLD (flat schema)
style:
  background_color: 'var(--lcars-orange)'
  text_color: 'black'
  border_color: 'black'
  border_width: 2px
  border_radius: 12px
  font_size: 16px

# NEW (nested schema)
style:
  card:
    color:
      background:
        active: 'var(--lcars-orange)'
  border:
    width: 2px
    radius: 12px
    color:
      active: 'black'
  text:
    default:
      color:
        active: 'black'
      font_size: 16px
```

**Note:** Old syntax still works! No breaking changes.

---

## Complete Example

```yaml
type: custom:lcards-simple-button
entity: light.living_room
label: "Living Room"
icon: 'mdi:lightbulb'

style:
  card:
    color:
      background:
        active: 'var(--lcars-orange)'
        inactive: alpha(colors.accent.primary, 0.5)
        unavailable: 'var(--lcars-ui-gray)'

  border:
    width: 2px
    radius:
      top_left: 20px
      top_right: 8px
      bottom_right: 20px
      bottom_left: 8px
    color:
      active: 'black'
      inactive: 'var(--lcars-gray)'

  text:
    default:
      color:
        active: 'black'
        inactive: 'var(--lcars-color-text-disabled)'
      font_size: 16px
      font_weight: bold

tap_action:
  action: toggle

rules:
  - when:
      condition: "entity.attributes.brightness > 200"
    apply:
      style:
        card:
          color:
            background:
              active: 'var(--lcars-yellow)'
```

---

**Status:** 🎯 DEFINITIVE SCHEMA - Use this to update all implementations
**Version:** 1.10.69+
**Date:** November 15, 2025
