# Null Safety Fix for Simple Button Card

## Issue

The simple button card would crash when rendering without an entity, causing two errors:

### Error 1: Missing TemplateParser Import
```
Uncaught ReferenceError: TemplateParser is not defined
    at _updateTrackedEntities (lcards-simple-button.js:934)
```

**Cause:** `TemplateParser` was used in `_updateTrackedEntities()` but never imported.

### Error 2: Null Icon Configuration
```
TypeError: Cannot read properties of null (reading 'area')
    at _generateAreaBasedIconMarkup (lcards-simple-button.js:1251)
```

**Cause:** Code assumed `iconConfig` would always exist when icon generation methods were called.

## Root Cause

The button card was not properly handling the case where:
1. No entity is configured
2. `this._processedIcon` is `null`
3. Icon generation methods were called with null config

## Fixes Applied

### 1. Added Missing Import

```javascript
import { TemplateParser } from '../core/templates/TemplateParser.js';
```

This was needed for `_updateTrackedEntities()` to extract template dependencies.

### 2. Added Null Check in `_generateAreaBasedIconMarkup()`

```javascript
_generateAreaBasedIconMarkup(iconConfig, buttonWidth, buttonHeight) {
    // Handle null/undefined iconConfig
    if (!iconConfig) {
        return { markup: '', widthUsed: 0 };
    }

    const iconArea = iconConfig.area || 'left';
    // ... rest of method
}
```

Returns empty markup if no icon config provided.

### 3. Added Null Check in SVG Generation

```javascript
let iconData = { markup: '', widthUsed: 0 };  // Default to empty icon
if (this._processedIcon) {
    if (!usesIconArea || hasExplicitCoords) {
        iconData = this._generateFlexibleIconMarkup(this._processedIcon, width, height);
    } else {
        iconData = this._generateAreaBasedIconMarkup(this._processedIcon, width, height);
    }
}
```

Changed from:
- `let iconData;` (undefined, would crash)

To:
- `let iconData = { markup: '', widthUsed: 0 };` (safe default)
- Only call icon methods if `this._processedIcon` exists

### 4. Fixed Icon Area Check

```javascript
const usesIconArea = this._processedIcon && iconArea !== 'none';
```

Changed from:
- `const usesIconArea = iconArea !== 'none';` (would be `true` even with null icon)

To:
- `const usesIconArea = this._processedIcon && iconArea !== 'none';` (properly checks icon exists)

## Test Cases

### Without Entity (Now Works)
```yaml
type: custom:lcards-simple-button
preset: lozenge
show_icon: false
text:
  label:
    content: "Static Button"
    position: center
```

**Result:** ✅ Renders safely with no errors

### With Entity (Still Works)
```yaml
type: custom:lcards-simple-button
entity: light.bathroom_strip
preset: lozenge
show_icon: true
text:
  state:
    content: "{entity.state}"
    position: right
```

**Result:** ✅ Renders with icon and state

## Defensive Programming Pattern

All methods that accept optional configuration should:

1. **Check for null early**
   ```javascript
   if (!config) return defaultValue;
   ```

2. **Use optional chaining**
   ```javascript
   const value = config?.property || default;
   ```

3. **Provide safe defaults**
   ```javascript
   let result = { markup: '', widthUsed: 0 };  // Not undefined
   ```

4. **Check existence before calling methods**
   ```javascript
   if (this._processedIcon) {
       iconData = this._generateIcon(this._processedIcon);
   }
   ```

## Files Changed

1. `/home/jweyermars/code/lcards/src/cards/lcards-simple-button.js`
   - Added `TemplateParser` import
   - Added null check in `_generateAreaBasedIconMarkup()`
   - Added null check in `_generateSimpleButtonSVG()`
   - Fixed `usesIconArea` calculation

## Files Created

1. `/home/jweyermars/code/lcards/test/test-button-no-entity.yaml` - Test config without entity

## Prevention

To prevent similar issues:

1. **Always import what you use** - Check for undefined references
2. **Assume configs can be null** - Add checks at method entry
3. **Test edge cases** - Try configurations without expected properties
4. **Use TypeScript or JSDoc** - Document which parameters are optional
5. **Initialize with safe defaults** - Never leave variables undefined

## Related Issues

This fix complements the multi-text template processing fix by ensuring:
- Buttons work without entities
- Template tracking doesn't crash on missing imports
- Icon rendering is optional, not required
