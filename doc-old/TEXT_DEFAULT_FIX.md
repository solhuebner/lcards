# Fix: `text.default` Properties Not Being Applied

## Issue

User configuration for `text.default` properties (like `text_transform`) were being **ignored**. Only theme defaults were being used.

### Example That Didn't Work

```yaml
text:
  default:
    text_transform: uppercase  # ❌ This was ignored!
  name:
    content: "{entity.attributes.friendly_name}"
```

**Expected:** Text in uppercase
**Actual:** Text in original case

## Root Cause

In `_resolveTextConfiguration()`, the code was checking theme defaults (`this._buttonStyle?.text?.default`) but **never checking** the user's `config.text.default`.

### Before (Broken)

```javascript
text_transform: fieldConfig.text_transform ||
                this._buttonStyle?.text?.default?.text_transform ||
                'none'
```

This resolution order was:
1. Field-specific value
2. ~~User's `text.default`~~ ❌ **MISSING!**
3. Theme default
4. Hardcoded fallback

## Fix

Added extraction of user defaults and updated all property resolutions:

```javascript
// Extract user-defined defaults from text.default
const userDefaults = textConfig.default || {};

// Then in field resolution:
text_transform: fieldConfig.text_transform ||
                userDefaults.text_transform ||          // ✅ Now checked!
                this._buttonStyle?.text?.default?.text_transform ||
                'none'
```

### After (Fixed)

New resolution order:
1. Field-specific value
2. **User's `text.default`** ✅
3. Theme default
4. Hardcoded fallback

## Properties Fixed

All these properties now properly inherit from `text.default`:

- ✅ `text_transform` - Text case transformation
- ✅ `font_size` - Font size
- ✅ `font_weight` - Font weight
- ✅ `font_family` - Font family
- ✅ `color` - Text color
- ✅ `position` - Default position (in preset defaults)

## Now Works

### Example 1: Global Text Transform

```yaml
text:
  default:
    text_transform: uppercase  # ✅ Now applies to all fields!

  name:
    content: "{entity.attributes.friendly_name}"
    # Will display in UPPERCASE

  state:
    content: "{entity.state}"
    text_transform: none  # Override: keep original case
```

### Example 2: Global Font Settings

```yaml
text:
  default:
    font_size: 16
    font_weight: bold
    text_transform: capitalize

  label:
    content: "bedroom light"  # 16px, bold, "Bedroom Light"

  state:
    content: "{entity.state}"  # 16px, bold, "On" or "Off"
    font_size: 12  # Override: 12px, bold, "On" or "Off"
```

### Example 3: Mixed Overrides

```yaml
text:
  default:
    text_transform: uppercase
    font_size: 14

  title:
    content: "status"  # "STATUS" (14px)
    font_size: 18  # "STATUS" (18px)

  subtitle:
    content: "online"  # "ONLINE" (14px)
    text_transform: capitalize  # "Online" (14px)
```

## Testing

Test configuration that now works correctly:

```yaml
type: custom:lcards-simple-button
entity: light.bathroom_strip
preset: lozenge
show_icon: true
text:
  default:
    text_transform: uppercase  # ✅ Applied to all fields

  name:
    position: bottom-right
    content: "{entity.attributes.friendly_name}"  # ✅ Now uppercase!
    padding:
      right: 22
```

## Implementation Details

### Code Changes

The fix extracts user defaults once at the start:

```javascript
_resolveTextConfiguration() {
    const config = this.config || {};
    const textConfig = config.text || {};
    const resolvedFields = {};

    // Extract user-defined defaults from text.default
    const userDefaults = textConfig.default || {};  // ← NEW

    // ... rest of method
}
```

Then uses them in the resolution chain for every property:

```javascript
resolvedFields[fieldId] = {
    // ... other properties
    font_size: fieldConfig.font_size ||
               fieldConfig.size ||
               userDefaults.font_size ||              // ← NEW
               this._buttonStyle?.text?.default?.font_size ||
               14,

    text_transform: fieldConfig.text_transform ||
                    userDefaults.text_transform ||     // ← NEW
                    this._buttonStyle?.text?.default?.text_transform ||
                    'none',
    // ... other properties
};
```

## Files Changed

1. `/home/jweyermars/code/lcards/src/cards/lcards-simple-button.js`
   - Modified `_resolveTextConfiguration()` method
   - Added `userDefaults` extraction
   - Updated all property resolution chains

## Related Documentation

- **`doc/TEXT_DEFAULT_CONFIG.md`** - Complete guide to `text.default`
- **`test/test-text-default.yaml`** - Working example

## Verification

To verify the fix works, check that:

1. ✅ `text.default.text_transform: uppercase` makes all fields uppercase
2. ✅ Individual fields can override with their own `text_transform`
3. ✅ All typography properties inherit from `text.default`
4. ✅ Field-specific values always take precedence

Build successful! The `text.default` configuration now works as intended. 🎉
