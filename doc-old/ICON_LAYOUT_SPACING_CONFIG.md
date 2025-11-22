# Icon Layout Spacing Configuration

## Overview
The `icon.layout_spacing` property allows customization of the spacing around the icon area when auto-calculating icon area size. This replaces the previously hardcoded 8px value with a configurable parameter that supports theme tokens.

## Problem
Previously, the layout spacing used in icon area size calculations was hardcoded at 8px in three locations:
- `_generateIconMarkupTopBottom()` - for top/bottom icon areas
- `_generateIconMarkupLeftRight()` - for left/right icon areas
- `_getTextAreaBounds()` - for text area calculation

Users could not customize this spacing to match different layout styles or use theme tokens for consistency.

## Solution
Added `icon.layout_spacing` property with full configuration priority chain:
1. `config.icon.layout_spacing` - User override in card config
2. `preset.icon.layout_spacing` - Preset/style default
3. Theme token: `components.button.base.icon.layout_spacing`
4. Hardcoded fallback: `8`

## Formula
Icon area auto-calculation (when `icon.area_size` is not explicitly set):
```
areaSize = iconSize + (layoutSpacing × 2) + dividerWidth
```

Where:
- `iconSize` - Visual icon size (config/preset/theme, default 24)
- `layoutSpacing` - Spacing around icon (config/preset/theme, **now configurable**, default 8)
- `dividerWidth` - Divider line width (config/preset/theme, default 6)

## Configuration Examples

### User Config Override
```yaml
type: custom:lcards-simple-button
icon:
  entity: light.bedroom
  layout_spacing: 12  # Larger spacing around icon area
```

### Theme Token Default
```yaml
# In theme configuration
components:
  button:
    base:
      icon:
        layout_spacing: 10  # Theme-wide default
```

### Preset Style
```yaml
# In preset definition
styles:
  my-style:
    icon:
      layout_spacing: 6  # Compact layout style
```

## Technical Details

### Resolution Chain
The layout spacing is resolved in `_resolveIconConfiguration()` with the same priority pattern as other icon properties (size, spacing, etc.):

```javascript
let layoutSpacing;
if (typeof this.config.icon === 'object' && this.config.icon?.layout_spacing !== undefined) {
    layoutSpacing = this.config.icon.layout_spacing;
} else if (resolvedStyle.icon?.layout_spacing !== undefined) {
    layoutSpacing = resolvedStyle.icon.layout_spacing;
} else if (iconTokens.layout_spacing !== undefined) {
    layoutSpacing = iconTokens.layout_spacing;
} else {
    layoutSpacing = 8; // hardcoded fallback
}
```

### Storage
The resolved value is stored in `this._processedIcon.layoutSpacing` and accessed in all icon area calculation methods.

### Usage Locations
1. **_generateIconMarkupTopBottom()** - Line ~1450
   - Calculates `iconAreaHeight` for top/bottom icon areas

2. **_generateIconMarkupLeftRight()** - Line ~1650
   - Calculates `iconAreaWidth` for left/right icon areas

3. **_getTextAreaBounds()** - Line ~2250
   - Calculates icon area size to determine text area bounds

All three locations now use:
```javascript
const layoutSpacing = iconConfig.layoutSpacing || 8;
```

## Difference from icon.spacing
- **`icon.spacing`** - Space around the icon itself, affects icon SIZE clamping and padding
  - Used in: `maxIconWidth = availableWidth - (spacing * 2)`
  - Controls visual breathing room around the icon

- **`icon.layout_spacing`** - Space around the icon AREA, affects area SIZE calculation
  - Used in: `areaSize = iconSize + (layoutSpacing * 2) + dividerWidth`
  - Controls layout geometry and text area positioning

Both can be configured independently for fine-grained control.

## Implementation Notes
- Added in version 1.14.48 (after multi-text template processing fixes)
- Follows same resolution pattern as `icon.size`, `icon.spacing`, etc.
- Backward compatible - defaults to 8px if not specified
- Supports numeric values only (no CSS units like "8px")
- Applied consistently across all icon area calculations

## Related Configuration
- `icon.size` - Visual icon size (default: 24)
- `icon.spacing` - Space around icon for clamping (default: 8)
- `icon.area_size` - Explicit area size override (bypasses auto-calculation)
- `icon.divider.width` - Divider line width (default: 6)
