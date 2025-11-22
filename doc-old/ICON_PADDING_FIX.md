# Fix: Icon Directional Padding Not Working

## Issue

Icon directional padding (e.g., `icon.padding.left`) was **not being extracted** from the configuration, even though the code had support for using `padding_left`, `padding_right`, etc. in the rendering logic.

### Example That Didn't Work

```yaml
icon:
  position: center
  padding:
    left: 10     # ❌ Was ignored!
    right: 5
```

**Expected:** Icon shifted by padding values
**Actual:** Icon used default positioning with no padding

## Root Cause

The icon configuration resolution code only extracted a **single padding value**:

```javascript
// Old code - only checked for number
let iconPadding = 8;
if (this.config.icon?.padding !== undefined) {
    iconPadding = this.config.icon.padding;  // ❌ Only works if padding is a number!
}
```

But never extracted directional values from `icon.padding.left`, `icon.padding.right`, etc., even though the rendering methods (`_generateIconMarkupTopBottom`, `_generateIconMarkupLeftRight`) **expected** these values as `iconConfig.padding_left`, etc.

## Fix

Added extraction logic for directional padding from the nested object:

### 1. Extract Directional Padding Values

```javascript
// Resolve directional icon padding (for area-based positioning)
// Priority: config > preset > 0 (default)
let iconPaddingLeft = 0;
let iconPaddingRight = 0;
let iconPaddingTop = 0;
let iconPaddingBottom = 0;

// Extract from config first
if (typeof this.config.icon === 'object' && this.config.icon?.padding) {
    const configPadding = this.config.icon.padding;
    if (typeof configPadding === 'object') {
        iconPaddingLeft = configPadding.left ?? 0;
        iconPaddingRight = configPadding.right ?? 0;
        iconPaddingTop = configPadding.top ?? 0;
        iconPaddingBottom = configPadding.bottom ?? 0;
    }
}
// Fall back to preset if not in config
else if (resolvedStyle.icon?.padding && typeof resolvedStyle.icon.padding === 'object') {
    iconPaddingLeft = resolvedStyle.icon.padding.left ?? 0;
    iconPaddingRight = resolvedStyle.icon.padding.right ?? 0;
    iconPaddingTop = resolvedStyle.icon.padding.top ?? 0;
    iconPaddingBottom = resolvedStyle.icon.padding.bottom ?? 0;
}
```

### 2. Add to _processedIcon Object

```javascript
this._processedIcon = {
    // ... other properties
    padding: iconPadding,              // For centered/named positions
    padding_left: iconPaddingLeft,     // ✅ Now extracted!
    padding_right: iconPaddingRight,   // ✅ Now extracted!
    padding_top: iconPaddingTop,       // ✅ Now extracted!
    padding_bottom: iconPaddingBottom, // ✅ Now extracted!
    // ... other properties
};
```

## Two Padding Formats Supported

### Format 1: Simple Padding (Number)

For centered icons or when you want equal padding on all sides:

```yaml
icon:
  position: center
  padding: 10  # Same padding on all sides
```

### Format 2: Directional Padding (Object)

For area-based positioning (left/right/top/bottom) where you need different padding per side:

```yaml
icon:
  position: center
  padding:
    left: 10
    right: 5
    top: 8
    bottom: 12
```

## Now Works

### Example 1: Left Area with Left Padding

```yaml
type: custom:lcards-simple-button
entity: light.bathroom_strip
preset: lozenge
show_icon: true
icon:
  position: center
  padding:
    left: 10    # ✅ Icon shifts 10px to the right
```

### Example 2: Multiple Directional Padding

```yaml
icon:
  position: left-center  # Icon in left area, vertically centered
  padding:
    left: 15      # ✅ Extra space from left edge
    right: 5      # ✅ Extra space before text
    top: 2        # ✅ Slight vertical adjustment up
    bottom: 0     # ✅ No bottom padding
```

### Example 3: Top Area with Vertical Padding

```yaml
icon:
  area: top
  position: center
  padding:
    top: 10       # ✅ Extra space from top edge
    bottom: 8     # ✅ Extra space before text area
```

## When to Use Each Format

| Format | Best For | Example Use Case |
|--------|----------|------------------|
| **Simple** (`padding: 10`) | Centered icons, equal spacing | Icon badge in center of button |
| **Directional** (`padding.left: 10`) | Area-based positioning | Icon in left area needing offset |

## Technical Details

### How It Works

1. **Configuration Phase**: Extract both simple and directional padding
2. **Storage Phase**: Store all values in `_processedIcon`
3. **Rendering Phase**: Use appropriate padding based on icon position
   - **Named positions** (center, left-center, etc.): Use `padding_left`, `padding_right`, etc.
   - **Explicit coordinates**: Padding may not apply (depends on rendering method)

### Rendering Methods That Use Directional Padding

- **`_generateIconMarkupLeftRight()`**: Uses `padding_left`, `padding_right`, `padding_top`, `padding_bottom`
- **`_generateIconMarkupTopBottom()`**: Uses `padding_left`, `padding_right`, `padding_top`, `padding_bottom`
- **`_generateAreaBasedIconMarkup()`**: Routes to above methods based on area

### Resolution Priority

For both simple and directional padding:
1. **User config** (`config.icon.padding`)
2. **Preset/style** (`resolvedStyle.icon.padding`)
3. **Default** (0 for directional, 8 for simple)

## Backward Compatibility

✅ **Existing configs still work!** If you were using:

```yaml
icon:
  padding: 8  # Simple number format
```

This still works exactly as before. The fix only **adds** support for directional padding.

## Files Changed

1. `/home/jweyermars/code/lcards/src/cards/lcards-simple-button.js`
   - Modified icon padding resolution (lines ~552-596)
   - Added directional padding extraction
   - Added directional padding to `_processedIcon` object (lines ~857-862)

## Testing

To verify the fix works:

1. ✅ Simple padding still works: `padding: 10`
2. ✅ Directional padding now works: `padding: { left: 10, right: 5 }`
3. ✅ Presets can provide directional padding defaults
4. ✅ Config overrides preset padding values
5. ✅ Icon position responds to padding adjustments

## Example Test Config

```yaml
type: custom:lcards-simple-button
entity: light.bathroom_strip
preset: lozenge
show_icon: true
grid_options:
  rows: 1
icon_area_size: 60
icon:
  position: center
  padding:
    left: 10     # ✅ Now works!
text:
  default:
    text_transform: uppercase
  name:
    position: bottom-right
    content: "{entity.attributes.friendly_name}"
    show: true
    padding:
      right: 22
```

Icon should now be offset 10px to the right from its default centered position! 🎉
