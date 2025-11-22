# Fix: Preset Text Templates Not Being Processed

## Issue

After fixing preset text field merging, templates from preset fields (like `content: "{entity.attributes.friendly_name}"`) were being treated as **literal text** instead of being evaluated as templates.

### Example That Didn't Work

**Preset (base):**
```javascript
text: {
  name: {
    content: "{entity.attributes.friendly_name}",  // Template string
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
    show: true  # Inherits content from preset
```

**Expected:** Shows evaluated friendly name (e.g., "Living Room Light")
**Actual:** Shows literal text `"{entity.attributes.friendly_name}"` ❌

## Root Cause

The `_processCustomTemplates()` method only processed templates from fields in **`this.config.text`**:

```javascript
// Old code - only processed user's text fields
for (const [fieldId, fieldConfig] of Object.entries(this.config.text)) {
    const processedContent = await this.processTemplate(fieldConfig.content);
    this.config.text[fieldId].content = processedContent;
}
```

Since preset text fields weren't in `this.config.text`, their templates were never processed!

### The Timeline

1. ✅ **Preset merge fix**: Preset text fields now merge with user config
2. ❌ **But**: Templates only processed on `this.config.text` fields
3. ❌ **Result**: Preset templates never evaluated, shown as literal strings

## Fix

Updated `_processCustomTemplates()` to **copy preset text fields into `this.config.text`** before processing templates:

### Key Changes

```javascript
async _processCustomTemplates() {
    // Ensure this.config.text exists
    if (!this.config.text) {
        this.config.text = {};
    }

    // First, merge in preset text fields that aren't in config
    const presetTextFields = this._buttonStyle?.text || {};
    for (const [fieldId, presetFieldConfig] of Object.entries(presetTextFields)) {
        if (fieldId === 'default') continue;

        // If field doesn't exist in config, add it from preset
        if (!this.config.text[fieldId]) {
            this.config.text[fieldId] = { ...presetFieldConfig };  // ← Copy preset field
        }
    }

    // Now process templates on ALL fields (config + preset)
    for (const [fieldId, fieldConfig] of Object.entries(this.config.text)) {
        if (fieldConfig.content && fieldConfig.template !== false) {
            const processedContent = await this.processTemplate(fieldConfig.content);
            this.config.text[fieldId].content = processedContent;  // ← Evaluate template
        }
    }
}
```

## How It Works

### 1. Copy Preset Fields

Before template processing, copy any preset text fields that aren't already in the user's config:

```javascript
// Preset has: text.name.content = "{entity.attributes.friendly_name}"
// User config has: text.name.show = true (no content)

// After copy:
this.config.text.name = {
    content: "{entity.attributes.friendly_name}",  // From preset
    position: "bottom-right",                      // From preset
    show: true                                     // From user config
}
```

### 2. Process All Templates

Now when we iterate `this.config.text`, we process **both** user and preset templates:

```javascript
// Processes user's templates
this.config.text.custom.content = await this.processTemplate("My Label");

// Processes preset's templates (now in this.config.text)
this.config.text.name.content = await this.processTemplate("{entity.attributes.friendly_name}");
// Result: "Living Room Light" ✅
```

### 3. Render Resolved Content

When `_resolveTextConfiguration()` runs, it merges config + preset fields, and now both have **processed** templates:

```javascript
resolvedFields.name = {
    content: "Living Room Light",  // ✅ Already processed!
    position: "bottom-right",
    show: true
}
```

## Template Processing Order

1. **`_resolveButtonStyleSync()`** - Merges preset → produces `_buttonStyle` with preset text fields
2. **`_processCustomTemplates()`** - Copies preset fields to config, processes ALL templates
3. **`_resolveTextConfiguration()`** - Merges config + preset (both now have processed templates)
4. **`_generateSimpleButtonSVG()`** - Renders with resolved, processed content

## Now Works

### Example 1: Preset Template

**Preset:**
```javascript
text: {
  name: {
    content: "{entity.attributes.friendly_name}",
    show: true
  }
}
```

**User Config:**
```yaml
preset: lozenge
text:
  name:
    show: true
```

**Result:** Shows "Living Room Light" (evaluated) ✅

### Example 2: Mixed Templates

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
text:
  name:
    show: true          # ✅ Shows evaluated friendly name
  state:
    show: true          # ✅ Shows evaluated state
  custom:
    content: "Label"    # ✅ Shows "Label" (no template)
```

**Result:**
- `name`: "Living Room Light" (preset template evaluated)
- `state`: "on" (preset template evaluated)
- `custom`: "Label" (static text)

### Example 3: Override Preset Template

**Preset:**
```javascript
text: {
  name: { content: "{entity.attributes.friendly_name}" }
}
```

**User Config:**
```yaml
preset: lozenge
text:
  name:
    content: "Custom: {entity.state}"  # Override preset template
```

**Result:** Shows "Custom: on" (user's template overrides preset) ✅

## Template Control

You can disable template processing per field:

```yaml
text:
  name:
    content: "{not_a_template}"
    template: false  # ← Don't process as template
```

This applies to **both** user and preset fields.

## Technical Details

### Why Copy Instead of Direct Processing?

We **copy** preset fields to `this.config.text` rather than processing them separately because:

1. **Single source of truth**: All text fields in one place (`this.config.text`)
2. **Consistent behavior**: User and preset fields processed the same way
3. **Change tracking**: Modifications tracked via config changes
4. **Entity tracking**: `_updateTrackedEntities()` works on `this.config.text`

### Deep Copy for Safety

```javascript
this.config.text[fieldId] = { ...presetFieldConfig };
```

We use spread operator to avoid modifying the preset itself (presets are shared across instances).

### When Templates Are Processed

Templates are processed:
- **On initial load** (via `_processTemplates()` lifecycle)
- **On entity state change** (via auto-update tracking)
- **On config change** (via `_processTemplates()` re-run)

## Files Changed

1. `/home/jweyermars/code/lcards/src/cards/lcards-simple-button.js`
   - Modified `_processCustomTemplates()` method (lines ~910-945)
   - Added preset field copying before template processing
   - Now processes templates for both config and preset fields

## Verification

To verify the fix works:

1. ✅ Preset templates evaluated: `"{entity.state}"` → `"on"`
2. ✅ User templates evaluated: `"{entity.attributes.friendly_name}"` → `"Living Room Light"`
3. ✅ Mixed templates work: Some from preset, some from config
4. ✅ Static text still works: `"My Label"` → `"My Label"`
5. ✅ Template override: User template replaces preset template

## Complete Example

```yaml
type: custom:lcards-simple-button
entity: light.living_room
preset: lozenge  # Has base.text.name/state with templates
show_icon: true
text:
  name:
    show: true    # ✅ Uses preset's "{entity.attributes.friendly_name}" → "Living Room Light"
  state:
    show: true    # ✅ Uses preset's "{entity.state}" → "on"
  custom:
    content: "Brightness: {entity.attributes.brightness}%"
    position: center
    show: true    # ✅ User's template → "Brightness: 75%"
```

All templates are now properly evaluated! 🎉

## Related Fixes

This fix builds on:
- **Preset text merge fix**: Fields from preset now merge with config
- **Text.default fix**: Default properties properly inherited
- **Multi-text template processing**: Base template system working

Together, these fixes enable a complete preset + config + template workflow.
