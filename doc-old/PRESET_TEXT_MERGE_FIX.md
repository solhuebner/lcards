# Fix: Preset Text Fields Not Merging with User Config

## Issue

Text field definitions from presets (like `base.text.name` with `content: "{entity.attributes.friendly_name}"`) were **not being merged** with user config. When users set `text.name.show: true` without providing `content`, the field appeared empty because the preset's `content` value was ignored.

### Example That Didn't Work

**Preset (base):**
```javascript
text: {
  name: {
    position: 'bottom-right',
    content: "{entity.attributes.friendly_name}",  // ✅ Defined in preset
    show: true
  }
}
```

**User Config:**
```yaml
preset: lozenge  # Extends base
text:
  name:
    show: true  # ❌ Only overrides show, but loses content!
```

**Expected:** Name field shows friendly name from preset
**Actual:** Name field is empty (no content)

## Root Cause

The `_resolveTextConfiguration()` method only iterated over fields in the **user's config**:

```javascript
// Old code - only processed user config fields
for (const [fieldId, fieldConfig] of Object.entries(textConfig)) {
    // ... resolve field
}
```

This meant:
1. ❌ Preset text fields not in user config were **completely ignored**
2. ❌ Preset field properties (like `content`) were **not used as fallbacks**
3. ❌ User could only override by specifying ALL properties

## Fix

Updated `_resolveTextConfiguration()` to:
1. **Collect all field IDs** from both config AND preset
2. **Merge each field** with priority: config > preset > defaults
3. **Use preset values as fallbacks** for any missing properties

### Key Changes

#### 1. Collect All Field IDs

```javascript
// Get preset text fields from resolved button style
const presetTextFields = this._buttonStyle?.text || {};

// Collect all field IDs from both config and preset
const allFieldIds = new Set([
    ...Object.keys(textConfig),       // User's text fields
    ...Object.keys(presetTextFields)  // Preset's text fields
]);
```

#### 2. Merge Config + Preset for Each Field

```javascript
for (const fieldId of allFieldIds) {
    const fieldConfig = textConfig[fieldId] || {};        // User config (may be partial)
    const presetFieldConfig = presetTextFields[fieldId] || {}; // Preset config (complete)

    // Merge with priority: config > preset > defaults
    resolvedFields[fieldId] = {
        content: fieldConfig.content || presetFieldConfig.content || '',
        position: fieldConfig.position || presetFieldConfig.position || presetDefault.position,
        show: fieldConfig.show !== undefined ? fieldConfig.show :
              (presetFieldConfig.show !== undefined ? presetFieldConfig.show : true),
        // ... other properties
    };
}
```

## Resolution Priority (Updated)

For **each text field property**, the priority is now:

1. **User's config field-specific value** (`config.text.name.content`)
2. **Preset's field-specific value** (`preset.text.name.content`) ← **NOW INCLUDED!**
3. **User's text.default value** (`config.text.default.content`)
4. **Preset's text.default value** (`preset.text.default.content`)
5. **Theme default** (via tokens)
6. **Hardcoded fallback**

## Now Works

### Example 1: Partial Override (Most Common)

**Preset:**
```javascript
text: {
  name: {
    content: "{entity.attributes.friendly_name}",
    position: 'bottom-right',
    show: true
  }
}
```

**User Config:**
```yaml
preset: lozenge
text:
  name:
    show: true          # ✅ Override show
    # content inherited from preset!
    # position inherited from preset!
```

**Result:** Shows friendly name at bottom-right ✅

### Example 2: Mix Config + Preset Fields

**Preset:**
```javascript
text: {
  name: {
    content: "{entity.attributes.friendly_name}",
    position: 'bottom-right',
    show: true
  },
  state: {
    content: "{entity.state}",
    position: 'top-right',
    show: false
  }
}
```

**User Config:**
```yaml
preset: lozenge
text:
  name:
    show: true      # ✅ Uses preset's content + position
  custom:           # ✅ New field not in preset
    content: "Hello"
    position: center
```

**Result:**
- `name`: Shows friendly name at bottom-right
- `state`: Hidden (not in user config, but preset has show: false)
- `custom`: Shows "Hello" at center

### Example 3: Full Override

**User Config:**
```yaml
preset: lozenge
text:
  name:
    content: "Custom Label"  # ✅ Overrides preset's content
    position: center         # ✅ Overrides preset's position
    show: true
```

**Result:** Shows "Custom Label" at center (fully overridden)

### Example 4: Preset-Only Fields

**Preset:**
```javascript
text: {
  name: { content: "{entity.attributes.friendly_name}", show: true },
  state: { content: "{entity.state}", show: false }
}
```

**User Config:**
```yaml
preset: lozenge
# No text config at all!
```

**Result:**
- `name`: Shows friendly name (from preset) ✅
- `state`: Hidden (from preset) ✅

## Merge Order Example

Given this setup:

**Base Preset:**
```javascript
text: {
  default: { font_size: 14, text_transform: 'none' },
  name: { content: "{entity.attributes.friendly_name}", position: 'bottom-right' }
}
```

**Lozenge Preset:**
```javascript
extends: 'button.base'
// Inherits base.text through preset extension
```

**User Config:**
```yaml
preset: lozenge
text:
  default:
    text_transform: uppercase
  name:
    show: true
```

**Resolved `name` Field:**
- `content`: `"{entity.attributes.friendly_name}"` (from base preset) ✅
- `position`: `'bottom-right'` (from base preset) ✅
- `show`: `true` (from user config) ✅
- `text_transform`: `'uppercase'` (from user text.default) ✅
- `font_size`: `14` (from base preset text.default) ✅

## Technical Details

### How Preset Extension Works

1. **StylePresetManager** resolves preset inheritance (e.g., `lozenge extends base`)
2. **`_resolveButtonStyleSync()`** deep merges preset → produces `this._buttonStyle`
3. **`_resolveTextConfiguration()`** merges text fields from `this._buttonStyle.text` + `config.text`

### Field Processing

For each unique field ID across config + preset:
- Skip `default` (it's metadata, not a renderable field)
- Merge config field + preset field using priority chain
- Apply `text.default` as fallbacks
- Store in `resolvedFields` for rendering

### Show Property Semantics

Special handling for `show`:
- If user sets `show: false`, field is hidden (explicit override)
- If user sets `show: true`, field is shown (explicit override)
- If user omits `show`, check preset's `show` value
- If preset omits `show`, default to `true`

## Backward Compatibility

✅ **All existing configs still work!**

- **Full field definitions** (content + position + show): Work as before
- **Preset-only fields**: Now properly inherited
- **Partial overrides**: Now properly merge with preset values

## Files Changed

1. `/home/jweyermars/code/lcards/src/cards/lcards-simple-button.js`
   - Modified `_resolveTextConfiguration()` method (lines ~2037-2095)
   - Changed from iterating `config.text` only to iterating union of `config.text` + `preset.text`
   - Added preset field value as fallback in resolution chain
   - Updated all property resolutions to check both config and preset

## Verification

To verify the fix works:

1. ✅ Config with `text.name.show: true` (no content) → uses preset's content
2. ✅ Config with `text.name.content: "..."` → overrides preset's content
3. ✅ Preset-only fields (not in config) → properly rendered
4. ✅ Config-only fields (not in preset) → work as before
5. ✅ text.default values → apply to all fields as expected

## Example Test Config

```yaml
type: custom:lcards-simple-button
entity: light.tv
preset: lozenge    # Has base.text.name with content + position
show_icon: true
grid_options:
  rows: 1
text:
  name:
    show: true     # ✅ Now uses preset's content!
  state:
    show: true     # ✅ Now uses preset's content!
```

Fields should now display the entity's friendly name and state using the templates defined in the base preset! 🎉
