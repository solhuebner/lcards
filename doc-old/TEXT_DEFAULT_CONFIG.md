# Multi-Text `text.default` Configuration

## Overview

The `text.default` section in the multi-text configuration provides **default values** for all text fields. It is not rendered as a text field itself, but its properties are used as fallbacks.

## Supported in `text.default`

The following properties can be set in `text.default` and will be inherited by text fields that don't specify their own values:

### Typography
- **`font_size`** - Default font size (e.g., `14`, `16px`)
- **`font_weight`** - Default font weight (e.g., `'normal'`, `'bold'`, `700`)
- **`font_family`** - Default font family (e.g., `"'LCARS', sans-serif"`)
- **`text_transform`** - Default text transformation (see below) ✅

### Layout
- **`position`** - Default position for text fields (e.g., `'center'`, `'left'`, `'right'`)

### Styling
- **`color`** - Default text color (can be stateful: `color.active`, `color.inactive`, etc.)

## Text Transform Property

The `text_transform` property controls how text content is displayed:

### Values
- **`'none'`** - Display text as-is (default)
- **`'uppercase'`** - Convert to UPPERCASE
- **`'lowercase'`** - Convert to lowercase
- **`'capitalize'`** - Capitalize First Letter Of Each Word

### Example: Global Text Transform

```yaml
type: custom:lcards-simple-button
entity: light.bedroom
preset: lozenge
text:
  default:
    text_transform: uppercase  # All fields will be UPPERCASE by default
    font_size: 14
    font_weight: bold

  label:
    content: "bedroom light"  # Will display as "BEDROOM LIGHT"
    position: left

  state:
    content: "{entity.state}"  # Will display as "ON" or "OFF" (already uppercase, but consistent)
    position: right
    text_transform: none  # Override: keep original case
```

### Example: Mixed Transform

```yaml
text:
  default:
    text_transform: none  # Default: no transformation

  title:
    content: "smart home"
    text_transform: capitalize  # Display as "Smart Home"
    position: top

  label:
    content: "bedroom light"
    text_transform: uppercase  # Display as "BEDROOM LIGHT"
    position: left

  state:
    content: "{entity.state}"  # Uses default (none)
    position: right
```

## How Defaults Work

The resolution order for any property is:

1. **Field-specific value** - If the field defines the property
2. **`text.default` value** - If defined in defaults
3. **Theme default** - From `this._buttonStyle.text.default.*`
4. **Hardcoded fallback** - Built-in default value

### Example Resolution

```yaml
text:
  default:
    font_size: 16        # Default for all fields
    text_transform: uppercase

  label:
    content: "test"
    font_size: 20       # Overrides default (uses 20)
    # text_transform not specified, inherits 'uppercase' from default

  state:
    content: "{entity.state}"
    text_transform: none  # Overrides default (uses 'none')
    # font_size not specified, inherits 16 from default
```

**Result:**
- `label`: 20px, uppercase → "TEST"
- `state`: 16px, none → "on" (or whatever the actual state is)

## Complete Property List

Properties that can be set in `text.default`:

```yaml
text:
  default:
    # Typography
    font_size: 14
    font_weight: normal
    font_family: "'LCARS', 'Antonio', sans-serif"
    text_transform: none

    # Layout
    position: center  # Default position for fields without explicit position

    # Styling
    color:
      active: "#FF9900"
      inactive: "#CC6600"
      unavailable: "#666666"
      default: "#FF9900"
```

## Text Transform Implementation

The transformation is applied in `_processTextFields()`:

```javascript
// Apply text transformation
if (field.text_transform) {
    switch (field.text_transform) {
        case 'uppercase':
            content = content.toUpperCase();
            break;
        case 'lowercase':
            content = content.toLowerCase();
            break;
        case 'capitalize':
            content = content.replace(/\b\w/g, c => c.toUpperCase());
            break;
        // 'none' or any other value: leave as-is
    }
}
```

**Note:** Transformation happens **after** template processing, so templates are evaluated first, then the result is transformed.

## Common Use Cases

### 1. All Caps (LCARS Style)
```yaml
text:
  default:
    text_transform: uppercase  # Everything UPPERCASE by default
```

### 2. Title Case Headers
```yaml
text:
  default:
    text_transform: none  # Normal by default

  header:
    content: "system status"
    text_transform: capitalize  # "System Status"
```

### 3. Lowercase Labels
```yaml
text:
  default:
    text_transform: lowercase  # Everything lowercase by default

  label:
    content: "Living Room"  # Will show as "living room"
```

## Tips

1. **Use `default` for consistency** - Set common properties once instead of repeating
2. **Override when needed** - Individual fields can override any default
3. **Remember template order** - Templates evaluate first, then transformations apply
4. **Theme integration** - Defaults can pull from theme: `this._buttonStyle.text.default.*`

## Related

- **Template Syntax Guide** - `doc/TEMPLATE_SYNTAX_GUIDE.md`
- **Multi-Text Processing Fix** - `doc/MULTITEXT_TEMPLATE_FIX.md`
