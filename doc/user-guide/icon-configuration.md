# Icon Configuration Guide - LCARdS Simple Button Card

**Version:** 1.12.07+
**Last Updated:** 2025-11-16

## Overview

The LCARdS Simple Button Card supports comprehensive icon configuration with state-based colors, flexible sizing, and customizable interior divider borders.

## Configuration Schema

```yaml
type: custom:lcards-simple-button
entity: light.example
icon:
  # Icon source (required)
  icon: mdi:lightbulb | entity | si:simpleicons-name

  # Visual appearance
  size: 24                    # Visual icon size in pixels (default: 24)
  area_width: 54              # Horizontal space allocated (optional, auto-calculated if not set)
  position: left | right      # Icon position (default: left, or from preset)

  # Colors (state-based or static)
  color: white                # Static color
  # OR
  color:                      # State-based colors
    active: "#00FF00"         # Color when entity is on/active
    inactive: "#808080"       # Color when entity is off/inactive
    unavailable: "#FF0000"    # Color when entity is unavailable
    default: white            # Fallback color

  # Interior divider border (between icon and text)
  interior:
    width: 6                  # Border width in pixels (default: 6)
    color: black              # Border color (default: black)

  # Padding (advanced)
  padding_left: 0
  padding_right: 0
  padding_top: 0
  padding_bottom: 0

# Icon-only mode (no text, centered icon)
icon_only: true | false       # Default: false

# Preset (affects default position)
preset: lozenge | lozenge-right | pill | pill-right
```

## Property Details

### `icon` (required)
- **Type:** String
- **Options:**
  - `mdi:icon-name` - Material Design Icons
  - `si:simpleicons-name` - Simple Icons
  - `entity` - Use the entity's own icon
- **Example:** `icon: mdi:lightbulb`

### `size` (visual icon size)
- **Type:** Number (pixels)
- **Default:** 24 (from theme tokens)
- **Behavior:**
  - Controls the visual size of the icon SVG
  - Icon is **clamped to button height** (minus spacing) to prevent overflow
  - For 60px tall button: max visible size ≈ 44px (60 - 16 spacing)
- **Example:** `size: 32` renders icon at 32px (if height allows)

### `area_width` (horizontal space allocation)
- **Type:** Number (pixels)
- **Default:** Auto-calculated as `size + spacing*2 + interior.width`
- **Behavior:**
  - Controls how much horizontal space the icon section takes
  - Affects text positioning (text starts after icon area)
  - Icon is centered within this area
- **Example:**
  - `size: 24, area_width: 60` → Small icon in wide space
  - `size: 40, area_width: 80` → Large icon in matching space

**Auto-Calculation Example:**
```yaml
icon:
  size: 24          # Visual icon size
  # area_width not specified, so:
  # area_width = 24 + (8*2 spacing) + 6 interior = 46px
```

### `position`
- **Type:** String
- **Options:** `left | right`
- **Default:** `left` (or from preset)
- **Priority:** config > preset > 'left'
- **Example:** `position: right` puts icon on right side

### `color` (static)
- **Type:** String (CSS color)
- **Example:** `color: white` or `color: "#FF9900"`

### `color` (state-based)
- **Type:** Object with state keys
- **Properties:**
  - `active`: Color when entity is on/active
  - `inactive`: Color when entity is off/inactive
  - `unavailable`: Color when entity is unavailable
  - `default`: Fallback color
- **Fallback Chain:** current_state → default → active → text_color → hardcoded white
- **Example:**
```yaml
icon:
  color:
    active: "#00FF00"       # Green when on
    inactive: "#808080"     # Gray when off
    unavailable: "#FF0000"  # Red when unavailable
```

### `interior.width`
- **Type:** Number (pixels)
- **Default:** 6 (from theme tokens)
- **Behavior:**
  - Controls width of vertical divider line between icon and text
  - Set to `0` to hide divider completely
  - **Fixed in v1.12.07:** No longer overlaps button border
- **Example:** `width: 12` creates thick divider

### `interior.color`
- **Type:** String (CSS color)
- **Default:** 'black' (from theme tokens)
- **Example:** `color: orange` or `color: var(--lcars-blue)`

### `icon_only`
- **Type:** Boolean
- **Default:** false
- **Behavior:**
  - Hides text completely
  - Centers icon in button
  - No interior divider border
  - Useful for compact icon-only buttons
- **Example:** `icon_only: true`

## Priority Chains

All icon properties follow a consistent priority chain:

```
config > preset > theme_token > hardcoded_default
```

**Example:** For icon color:
1. Check `config.icon.color` (highest priority)
2. Check `preset.icon.color` (from preset definition)
3. Check `theme.tokens.components.button.base.icon.color`
4. Check button text color
5. Use hardcoded fallback `var(--lcars-color-text, #FFFFFF)`

## Common Use Cases

### 1. Basic Icon with Default Settings
```yaml
type: custom:lcards-simple-button
entity: light.living_room
label: Living Room
icon:
  icon: mdi:lightbulb
preset: lozenge
```

### 2. Custom Icon Size and Position
```yaml
icon:
  icon: mdi:fan
  size: 32
  position: right
```

### 3. State-Based Icon Colors
```yaml
icon:
  icon: mdi:lightbulb
  color:
    active: yellow
    inactive: gray
    unavailable: red
```

### 4. Custom Interior Divider
```yaml
icon:
  icon: mdi:door
  interior:
    width: 10
    color: blue
```

### 5. Precise Layout Control
```yaml
icon:
  icon: mdi:speaker
  size: 28              # Icon visual size
  area_width: 70        # Wide horizontal space
  interior:
    width: 8
    color: purple
```

### 6. Icon-Only Compact Button
```yaml
type: custom:lcards-simple-button
entity: switch.fan
icon:
  icon: mdi:fan
  size: 36
  color:
    active: green
    inactive: gray
icon_only: true
```

### 7. No Interior Divider
```yaml
icon:
  icon: mdi:lightbulb
  interior:
    width: 0  # Hide divider completely
```

### 8. Use Entity's Own Icon
```yaml
icon:
  icon: entity  # Uses entity's icon from Home Assistant
  size: 24
```

## Size Behavior Deep Dive

### Visual Icon Size (`size`)
- **What it does:** Sets the pixel dimensions of the icon SVG
- **Constraint:** Clamped to button height minus spacing
- **Formula:** `actualIconSize = min(size, buttonHeight - spacing*2)`
- **Example (60px button):**
  - `size: 24` → renders at 24px ✅
  - `size: 40` → renders at 40px ✅
  - `size: 60` → renders at 44px (clamped) ⚠️

### Icon Area Width (`area_width`)
- **What it does:** Sets horizontal space allocated for icon section
- **Impact:** Affects where text starts
- **Auto-calculation:** `size + spacing*2 + interior.width`
- **Example:**
  - `size: 24, area_width: 60` → Small icon (24px) in wide space (60px)
  - `size: 40, area_width: 50` → Large icon in smaller space (might be tight)

**Why Separate?**
- Allows small icons with wide spacing for visual balance
- Allows large icons with compact areas for dense layouts
- Gives precise control over text positioning

## Interior Border Behavior

### Positioning (Fixed in v1.12.07)
- **Old behavior:** Border drew from Y=0 to full height, overlapping button border
- **New behavior:** Border respects button stroke, starts at Y=strokeWidth
- **Result:** Clean continuous button border without breaks

### Width Examples
```yaml
# Subtle divider
interior:
  width: 2
  color: rgba(255,255,255,0.3)

# Standard divider (default)
interior:
  width: 6
  color: black

# Prominent divider
interior:
  width: 12
  color: orange

# No divider
interior:
  width: 0
```

## Theme Token Integration

Default values come from theme tokens:
```javascript
// lcarsClassicTokens.js
icon: {
  size: 24,
  spacing: 8,
  color: {
    default: 'black',
    active: 'white',
    inactive: 'black',
    unavailable: 'black'
  },
  interior: {
    enabled: true,
    width: 6,
    color: 'black',
    side: 'auto'
  }
}
```

You can override any of these per-button in your config.

## Rules Engine Integration

Icon properties can be changed dynamically via rules:

```yaml
type: custom:lcards-simple-button
entity: light.dynamic
icon:
  icon: mdi:lightbulb
  interior:
    width: 6
    color: black
rules:
  - conditions:
      - condition: state
        entity: light.dynamic
        state: "on"
    icon:
      interior:
        color: yellow  # Divider turns yellow when on
      color: "#FFFF00"
```

## Migration Notes

### From v1.12.06 and Earlier

**Icon Size Behavior Changed:**
- **Old:** `size` controlled icon area width (confusing)
- **New:** `size` controls visual icon size (intuitive)
- **New:** `area_width` controls horizontal space (explicit)
- **Migration:** If you set `size` to control spacing, use `area_width` instead

**Interior Border Fixed:**
- No config changes needed
- Border now respects button stroke automatically
- Clean borders without overlaps

**New Features Available:**
- `icon.area_width` for precise layout control
- `icon.interior.width` and `icon.interior.color` in config (not just theme)

## Troubleshooting

### Icon Not Appearing
- Check `show_icon: true` is set (or icon is defined with entity)
- Verify icon name is correct (`mdi:` prefix for Material Design Icons)
- Check entity exists and is available

### Icon Too Small/Large
- Remember: `size` is clamped to button height
- For 60px button: max visual size ≈ 44px
- Use `area_width` to control spacing, not visual size

### Interior Border Overlapping
- Update to v1.12.07+ (border overlap fix)
- Border now automatically avoids button stroke

### Colors Not Changing with State
- Update to v1.12.06+ (state-based color fix)
- Ensure you're using object format for state-based colors
- Check entity state is actually changing

## Examples Repository

See `/test/test-icon-enhancements-v1.12.07.yaml` for 15 comprehensive test cases covering:
- Interior border customization
- Size vs area width control
- State-based colors
- Border overlap validation
- Icon-only mode
- Rules engine integration
- Entity icons
- Extreme edge cases

## Version History

- **v1.12.07** (2025-11-16): Added `area_width`, `interior` config support, fixed border overlap
- **v1.12.06** (2025-11-15): Fixed state-based color resolution
- **v1.12.04** (2025-11-15): Fixed object serialization in DOM
- **v1.12.03** (2025-11-15): Fixed position not respecting presets
- **v1.12.02** (2025-11-15): Initial icon enhancement with state-based colors, icon-only mode
