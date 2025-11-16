# Icon Configuration Quick Reference

## ✅ Valid Config (Complete Example)

```yaml
type: custom:lcards-simple-button
entity: light.example
label: Example
icon:
  icon: mdi:lightbulb           # ✅ Icon name (required)
  size: 32                      # ✅ Visual icon size (px)
  area_width: 70                # ✅ Horizontal space (px, optional)
  position: right               # ✅ left | right
  color:                        # ✅ State-based colors
    active: "#00FF00"
    inactive: "#808080"
    unavailable: "#FF0000"
  interior:                     # ✅ Divider border
    width: 8                    # ✅ Border width (px)
    color: blue                 # ✅ Border color
icon_only: false                # ✅ Icon-only mode
preset: lozenge-right           # ✅ Preset
```

## 📋 All Icon Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `icon` | String | - | **Required.** Icon name: `mdi:name`, `si:name`, or `entity` |
| `size` | Number | 24 | Visual icon size in pixels |
| `area_width` | Number | Auto | Horizontal space allocated (auto = size + spacing + border) |
| `position` | String | left | `left` or `right` (or from preset) |
| `color` | String/Object | - | Static color or state-based `{active, inactive, unavailable}` |
| `interior.width` | Number | 6 | Interior divider border width (px) |
| `interior.color` | String | black | Interior divider border color |
| `padding_left` | Number | 0 | Left padding inside icon area |
| `padding_right` | Number | 0 | Right padding inside icon area |
| `padding_top` | Number | 0 | Top padding inside icon area |
| `padding_bottom` | Number | 0 | Bottom padding inside icon area |

## 🎨 Color Options

### Static Color
```yaml
icon:
  color: white
```

### State-Based Color
```yaml
icon:
  color:
    active: "#00FF00"       # On/active state
    inactive: "#808080"     # Off/inactive state
    unavailable: "#FF0000"  # Unavailable state
    default: white          # Fallback
```

## 📏 Size vs Area Width

| Setting | Result |
|---------|--------|
| `size: 24` | Small icon (24px), auto area (46px) |
| `size: 24, area_width: 70` | Small icon (24px), wide area (70px) |
| `size: 40` | Large icon (40px), auto area (70px) |
| `size: 40, area_width: 50` | Large icon (40px), compact area (50px) |

**Formula:** `auto_area = size + (spacing × 2) + interior.width`
**Default spacing:** 8px
**Default interior width:** 6px

## 🎯 Common Patterns

### Basic Icon
```yaml
icon:
  icon: mdi:lightbulb
```

### Icon with Custom Size
```yaml
icon:
  icon: mdi:fan
  size: 32
```

### State-Based Colors
```yaml
icon:
  icon: mdi:lightbulb
  color:
    active: yellow
    inactive: gray
```

### Custom Divider
```yaml
icon:
  icon: mdi:door
  interior:
    width: 10
    color: blue
```

### No Divider
```yaml
icon:
  icon: mdi:speaker
  interior:
    width: 0
```

### Icon-Only Mode
```yaml
icon:
  icon: mdi:power
  size: 36
icon_only: true
```

### Precise Layout
```yaml
icon:
  icon: mdi:speaker
  size: 28              # Icon visual size
  area_width: 80        # Wide horizontal space
  interior:
    width: 8
    color: purple
```

## 🔄 Priority Chain

All properties follow this priority:

```
1. config.icon.*          (highest priority)
2. preset.icon.*
3. theme.tokens.*.icon.*
4. hardcoded default      (lowest priority)
```

## ⚠️ Important Notes

1. **Icon Size Clamping**: Visual icon size is clamped to button height
   - 60px button → max ~44px icon (60 - 16 spacing)
   - Prevents icon overflow

2. **Interior Border**: Fixed in v1.12.07
   - No longer overlaps button border
   - Automatically respects button stroke

3. **State-Based Colors**: Fixed in v1.12.06
   - Colors now update dynamically with entity state
   - Use object format for state-based colors

4. **Area Width**: New in v1.12.07
   - Separate from visual icon size
   - Controls horizontal space and text positioning

## 🚫 NOT Supported in Config

These properties are theme-only:
- `spacing` (use `area_width` instead to control layout)
- `interior.enabled` (just set `width: 0` to hide)
- `interior.side` (automatically determined from position)

## 📚 Full Documentation

See `/doc/user-guide/icon-configuration.md` for complete details.

## 🧪 Test Cases

See `/test/test-icon-enhancements-v1.12.07.yaml` for 15 test examples.
