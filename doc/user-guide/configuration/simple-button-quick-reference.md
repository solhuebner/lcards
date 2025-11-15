# Simple Button Card - Quick Reference

**Component:** `custom:lcards-simple-button`
**Version:** 1.10.70+
**Schema:** CB-LCARS Nested Schema
**Last Updated:** November 15, 2025

---

## Complete Schema

```yaml
type: custom:lcards-simple-button
entity: <entity_id>           # Optional: Home Assistant entity
label: <string>                # Button text
preset: <preset_name>          # Optional: 'lozenge', 'lozenge-right', etc.
icon: <icon_string>            # Optional: 'mdi:lightbulb', 'si:github', 'entity'

style:
  # Card background colors (state-based)
  card:
    color:
      background:
        active: <color>        # When entity is ON/active
        inactive: <color>      # When entity is OFF/inactive
        unavailable: <color>   # When entity is unavailable/unknown

  # Border configuration
  border:
    width: <css-size>          # e.g. '2px' OR {top, right, bottom, left}
    radius: <css-size>         # e.g. '8px' OR {top_left, top_right, bottom_right, bottom_left}
    color:
      active: <color>
      inactive: <color>
      unavailable: <color>
    # Individual side styling (optional):
    top: {width: <css-size>, color: <color>}
    right: {width: <css-size>, color: <color>}
    bottom: {width: <css-size>, color: <color>}
    left: {width: <css-size>, color: <color>}

  # Text styling
  text:
    default:
      color:
        active: <color>
        inactive: <color>
        unavailable: <color>
      font_size: <css-size>    # e.g. '16px'
      font_weight: <css-value> # e.g. 'bold', '600'
      font_family: <css-value> # e.g. "'LCARS', sans-serif"

# Actions
tap_action:
  action: <action_type>        # 'toggle', 'call-service', 'navigate', 'more-info', 'none'
  service: <service_name>      # For 'call-service'
  target:
    entity_id: <entity_id>

hold_action:
  action: <action_type>

double_tap_action:
  action: <action_type>

# Rules Engine (dynamic styling)
rules:
  - when:
      condition: <javascript|jinja2|token|entity>
      type: <condition_type>
    apply:
      style:
        <nested_schema>        # Same as style: above
```

---

## Color Value Types

### 1. CSS Variables
```yaml
color: 'var(--lcars-orange)'
color: 'var(--lcars-color-text, #FFFFFF)'  # With fallback
```

### 2. Theme Tokens
```yaml
color: 'theme:components.button.base.background.active'
```

### 3. Computed Tokens
```yaml
color: alpha(colors.accent.primary, 0.7)      # Transparency
color: darken(colors.accent.primary, 20%)     # Darker
color: lighten(colors.accent.primary, 20%)    # Lighter
```

### 4. Direct Colors
```yaml
color: '#FF9900'
color: 'rgb(255, 153, 0)'
color: 'orange'
```

---

## Icon Syntax (HA-Style)

**No `type` field needed - just use strings directly:**

```yaml
icon: 'mdi:lightbulb'              # Material Design Icons
icon: 'si:github'                  # Simple Icons
icon: 'entity'                     # Use entity's own icon
```

**With positioning:**
```yaml
icon:
  icon: 'mdi:lightbulb'
  position: left                   # 'left' or 'right' (default: left)
```

---

## Border Flexibility

### Uniform Border
```yaml
border:
  width: 2px
  radius: 8px
  color:
    active: 'black'
```

### Per-Corner Radius
```yaml
border:
  radius:
    top_left: 20px
    top_right: 8px
    bottom_right: 20px
    bottom_left: 8px
```

### Per-Side Width
```yaml
border:
  width:
    top: 3px
    right: 1px
    bottom: 3px
    left: 1px
```

### Individual Side Styling
```yaml
border:
  top:
    width: 3px
    color: 'var(--lcars-orange)'
  bottom:
    width: 1px
    color: 'var(--lcars-gray)'
```

---

## Rules Engine

**Correct Syntax:** Use `when`/`apply` blocks (NOT `conditions` arrays)

### JavaScript Condition
```yaml
rules:
  - when:
      condition: "entity.attributes.brightness > 200"
      type: javascript
    apply:
      style:
        card:
          color:
            background:
              active: 'var(--lcars-yellow)'
```

### Jinja2 Template
```yaml
rules:
  - when:
      condition: "{{ state_attr('light.living_room', 'brightness') > 200 }}"
      type: jinja2
    apply:
      style:
        text:
          default:
            color:
              active: 'red'
```

### Token Syntax
```yaml
rules:
  - when:
      condition: "${entity.attributes.brightness} > 200"
      type: token
    apply:
      style:
        border:
          color:
            active: 'theme:colors.warning'
```

### Entity State
```yaml
rules:
  - when:
      condition: "on"
      type: entity
    apply:
      style:
        card:
          color:
            background:
              active: 'green'
```

---

## Complete Examples

### Example 1: Basic Entity Button
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

tap_action:
  action: toggle
```

### Example 2: Lozenge with Per-Side Borders
```yaml
type: custom:lcards-simple-button
preset: lozenge
label: "Engineering"
icon: 'mdi:wrench'

style:
  border:
    top:
      width: 3px
      color: 'var(--lcars-yellow)'
    bottom:
      width: 1px
      color: 'var(--lcars-gray)'
```

### Example 3: Brightness-Aware Button
```yaml
type: custom:lcards-simple-button
entity: light.bedroom
label: "Bedroom"
icon: 'entity'

style:
  card:
    color:
      background:
        active: 'var(--lcars-blue)'
        inactive: 'var(--lcars-gray)'
  
  text:
    default:
      color:
        active: 'white'
        inactive: 'var(--lcars-color-text-disabled)'
      font_size: 16px
      font_weight: bold

rules:
  - when:
      condition: "entity.attributes.brightness > 200"
      type: javascript
    apply:
      style:
        card:
          color:
            background:
              active: 'var(--lcars-yellow)'
        text:
          default:
            color:
              active: 'black'
```

### Example 4: Service Call Button
```yaml
type: custom:lcards-simple-button
label: "All Lights Off"
icon: 'mdi:lightbulb-off'

style:
  card:
    color:
      background:
        active: 'var(--lcars-ui-red)'
  text:
    default:
      color:
        active: 'white'
      font_size: 18px
      font_weight: bold

tap_action:
  action: call-service
  service: light.turn_off
  target:
    area_id: all
```

---

## Presets

Built-in style presets extend `button.base` theme:

- **`lozenge`** - Fully rounded (50% radius all corners)
- **`lozenge-right`** - Lozenge with icon on right

**Usage:**
```yaml
type: custom:lcards-simple-button
preset: lozenge
label: "Rounded"
```

**Override preset styles:**
```yaml
type: custom:lcards-simple-button
preset: lozenge
label: "Custom Lozenge"
style:
  border:
    color:
      active: 'var(--lcars-yellow)'
```

---

## State Resolution

Entity states map to button states:

| Entity State | Button State | Description |
|--------------|--------------|-------------|
| `on`, `open`, `locked`, `home`, `playing`, `active` | `active` | Entity is "on" |
| `off`, `closed`, `unlocked`, `away`, `paused`, `idle` | `inactive` | Entity is "off" |
| `unavailable`, `unknown` | `unavailable` | Entity not available |

**Auto-opacity:**
- `active`: 1.0 (100%)
- `inactive`: 0.7 (70%)
- `unavailable`: 0.5 (50%)

---

## Theme Token Reference

### Background Colors
```
components.button.base.background.active
components.button.base.background.inactive
components.button.base.background.unavailable
```

### Text Colors
```
components.button.base.text.default.color.active
components.button.base.text.default.color.inactive
components.button.base.text.default.color.unavailable
```

### Border Properties
```
components.button.base.border.width
components.button.base.border.radius
components.button.base.border.color.active
components.button.base.border.color.inactive
components.button.base.border.color.unavailable
```

### Font Properties
```
components.button.base.text.default.font_size
components.button.base.text.default.font_weight
components.button.base.text.default.font_family
```

---

## Migration Notes

**Old flat schema is NO LONGER SUPPORTED:**
- ❌ `background_color` → ✅ `card.color.background.{state}`
- ❌ `text_color` → ✅ `text.default.color.{state}`
- ❌ `border_width` → ✅ `border.width`
- ❌ `border_radius` → ✅ `border.radius`
- ❌ `border_color` → ✅ `border.color.{state}`
- ❌ `font_size` → ✅ `text.default.font_size`

**Rules Engine:**
- ❌ `conditions:` array → ✅ `when:` / `apply:` blocks

**Icons:**
- ❌ `icon: {type: 'mdi', icon: 'lightbulb'}` → ✅ `icon: 'mdi:lightbulb'`

---

## Troubleshooting

### Button not showing colors
- Check entity state is resolving correctly
- Verify color values are valid CSS
- Use browser DevTools to inspect SVG element
- Check theme tokens are defined

### Rules not applying
- Verify `when`/`apply` syntax (not `conditions`)
- Check condition type matches expression
- Use browser console for JavaScript errors
- Test condition expression in HA template tool

### Icons not displaying
- Ensure icon syntax is `'mdi:icon'` format
- Check icon exists in Material Design Icons
- Verify Simple Icons with `'si:icon'` format
- For custom icons, use `icon_path` property

---

**For complete implementation details, see:**
- `SIMPLE_BUTTON_SCHEMA_DEFINITION.md` - Full schema specification
- `doc/user-guide/testing/simple-button-testing.md` - Testing guide
- `doc/architecture/rules-engine-template-syntax.md` - Rules Engine reference
