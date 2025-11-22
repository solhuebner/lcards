# Multi-Text Template Processing Fix

## Issue Summary

The simple button card was not processing templates in the multi-text feature. The system was using legacy template processing that only handled:
- `label`/`text` (top-level)
- `content`/`value` (top-level)
- `texts` array (old syntax)

But the new multi-text system uses `text` as an **object** with named field IDs:
```yaml
text:
  state:
    content: "{entity.state}"  # ← This template was NOT being processed
    position: right
```

## Root Cause

1. **`_resolveTextConfiguration()`** extracted raw `content` from config
2. **No template processing** happened on multi-text fields
3. **`_processStandardTexts()`** only processed legacy fields
4. **No entity tracking** for multi-text template dependencies

## Template Syntax Guide

### Local Context Variables (Single Braces)
Use **single braces** `{...}` for context variables that are resolved locally:

```yaml
text:
  state:
    content: "{entity.state}"                    # ✅ Local resolution - entity from context
  brightness:
    content: "{entity.attributes.brightness}"    # ✅ Local resolution - entity attributes
```

**When to use:** Fast, synchronous resolution of context variables passed to the card.

### Server-Side Jinja2 (Double Braces)
Use **double braces** `{{...}}` for Home Assistant Jinja2 functions that require server-side rendering:

```yaml
text:
  other_entity:
    content: "{{states('sensor.temperature')}}"              # ✅ HA function - server-side
  with_filter:
    content: "{{states('sensor.humidity') | float | round}}" # ✅ HA function with filters
  time:
    content: "{{now().hour}}"                                # ✅ HA time function
```

**When to use:** When you need HA's built-in functions like `states()`, `state_attr()`, `now()`, or filters.

## Changes Made

### 1. Base Class (`LCARdSSimpleCard.js`)

#### Modified `_processStandardTexts()`
- **Removed** all legacy field processing (label, content, texts array)
- Now a no-op base implementation
- Subclasses must implement their own template processing via `_processCustomTemplates()`

```javascript
async _processStandardTexts() {
    // No-op: Legacy fields no longer supported
    lcardsLog.trace(`[LCARdSSimpleCard] _processStandardTexts called (no-op)`);
}
```

#### Modified `_updateTrackedEntities()`
- **Removed** legacy template tracking
- Base implementation only tracks primary entity
- Subclasses must override to add their specific template sources

```javascript
_updateTrackedEntities() {
    const trackedEntities = new Set();
    if (this.config.entity) {
        trackedEntities.add(this.config.entity);
    }
    this._trackedEntities = Array.from(trackedEntities);
}
```

### 2. Simple Button Card (`lcards-simple-button.js`)

#### Added `_processCustomTemplates()`
New method that processes multi-text field templates:

```javascript
async _processCustomTemplates() {
    let hasChanges = false;

    if (this.config.text && typeof this.config.text === 'object') {
        for (const [fieldId, fieldConfig] of Object.entries(this.config.text)) {
            // Skip 'default' configuration
            if (fieldId === 'default' || !fieldConfig) continue;

            // Process template if enabled (default true)
            const shouldTemplate = fieldConfig.template !== false;
            if (shouldTemplate && fieldConfig.content) {
                const processedContent = await this.processTemplate(fieldConfig.content);

                if (this.config.text[fieldId].content !== processedContent) {
                    this.config.text[fieldId].content = processedContent;
                    hasChanges = true;
                }
            }
        }
    }

    if (hasChanges) {
        this._updateTrackedEntities();
        if (typeof this._onTemplatesChanged === 'function') {
            this._onTemplatesChanged();
        }
    }
}
```

**Key features:**
- Iterates through `text.{fieldId}` fields
- Skips `text.default` (it's configuration, not a field)
- Processes templates via `this.processTemplate()`
- Respects `template: false` flag to disable template processing
- Only triggers updates if content actually changed
- Modifies config in-place (safe since it's already merged)

#### Added `_updateTrackedEntities()` Override
Tracks dependencies from multi-text templates:

```javascript
_updateTrackedEntities() {
    super._updateTrackedEntities();  // Get primary entity

    const trackedEntities = new Set(this._trackedEntities || []);

    // Extract dependencies from multi-text fields
    if (this.config.text && typeof this.config.text === 'object') {
        for (const [fieldId, fieldConfig] of Object.entries(this.config.text)) {
            if (fieldId === 'default' || !fieldConfig?.content) continue;

            const template = fieldConfig.content;
            if (typeof template === 'string') {
                const deps = TemplateParser.extractDependencies(template);
                deps.forEach(entityId => trackedEntities.add(entityId));
            }
        }
    }

    this._trackedEntities = Array.from(trackedEntities);
}
```

**Key features:**
- Calls parent to get primary entity tracking
- Extracts entity IDs from templates using `TemplateParser`
- Adds all discovered entities to tracked set
- Enables auto-updates when tracked entities change

## Template Processing Flow

The unified template evaluator processes templates in phases:

1. **JavaScript** `[[[code]]]` - Synchronous local execution
2. **Tokens** `{entity.state}` - Synchronous context variable resolution
3. **Datasources** `{datasource:sensor.temp}` - Synchronous MSD datasource lookup
4. **Jinja2** `{{states('entity')}}` - Asynchronous server-side rendering via HA

### Example: Local Resolution
```yaml
content: "{entity.state}"
```
1. Template detected as token (single braces)
2. Resolved locally: `entity.state` → `"on"` or `"off"`
3. Fast, synchronous resolution ✅

### Example: Server-Side Resolution
```yaml
content: "{{states('sensor.temperature') | round(1)}}°C"
```
1. Template detected as Jinja2 (double braces + `states()` function)
2. Sent to Home Assistant for rendering
3. HA returns: `"22.5°C"`
4. Async resolution with full HA features ✅

## Configuration Examples

### Recommended: Local Context Variables
```yaml
type: custom:lcards-simple-button
entity: light.bathroom_strip
preset: lozenge
show_icon: true
text:
  state:
    content: "{entity.state}"           # ✅ Fast local resolution
    position: right
  name:
    content: "{entity.attributes.friendly_name}"  # ✅ Entity attributes
    position: left
```

### Server-Side HA Functions
```yaml
type: custom:lcards-simple-button
entity: sensor.temperature
text:
  temp:
    content: "{{states('sensor.temperature') | float | round(1)}}°C"  # ✅ HA function + filter
    position: center
  time:
    content: "{{now().strftime('%H:%M')}}"  # ✅ HA time function
    position: top
```

### Mixed Templates
```yaml
text:
  status:
    content: "{entity.state}"                          # Token - local
  other:
    content: "{{states('sensor.other') | round}}"      # Jinja2 - server-side
  javascript:
    content: "[[[return entity.state.toUpperCase()]]]" # JavaScript - local
```

## Auto-Update Behavior

Templates track dependencies for automatic updates:

```yaml
text:
  state:
    content: "{entity.state}"                          # Tracks: entity
  other:
    content: "{{states('sensor.temperature')}}"        # Tracks: sensor.temperature
```

**Result:** Card automatically updates when any tracked entity changes.

## About DataSourceManager Warning

You may see this warning in the console:
```
[LCARdSSimpleCard] DataSourceManager not available after timeout
```

**This is harmless** for simple entity templates. It only appears because the template evaluator checks for datasource syntax like `{datasource:...}` or `{sensor.temp}`. Your simple templates don't use datasources, so the warning can be ignored.

## Testing

Test configuration at: `test/test-multitext-templates.yaml`

```yaml
type: custom:lcards-simple-button
entity: light.bathroom_strip
preset: lozenge
show_icon: true
text:
  state:
    position: right
    content: "{entity.state}"           # Local resolution
  label:
    position: left
    content: "Bathroom"                 # Static text
  brightness:
    position: bottom-right
    content: "{entity.attributes.brightness | default('N/A')}"  # With filter
```

## Breaking Changes

**None for users of the multi-text feature.**

Legacy fields were already deprecated and should not be in use.

## Migration Guide

### From Legacy Syntax
```yaml
# Old (Legacy - no longer supported)
label: "My Button"
content: "{{entity.state}}"

# New (Multi-Text)
text:
  label:
    content: "My Button"
    position: left
  state:
    content: "{entity.state}"      # Note: single braces for context variables
    position: right
```

### Choosing Between {…} and {{…}}

**Use `{entity.xxx}`** (single braces) when:
- ✅ Accessing the card's entity context
- ✅ Want fast, synchronous resolution
- ✅ Don't need HA-specific functions

**Use `{{states('entity')}}`** (double braces) when:
- ✅ Need to access other entities not in context
- ✅ Want to use HA functions: `states()`, `now()`, `is_state()`, etc.
- ✅ Need Jinja2 filters or control structures
- ✅ Don't mind async/server-side rendering

## Changes Made

### 1. Base Class (`LCARdSSimpleCard.js`)

#### Modified `_processStandardTexts()`
- **Removed** all legacy field processing (label, content, texts array)
- Now a no-op base implementation
- Subclasses must implement their own template processing via `_processCustomTemplates()`

```javascript
async _processStandardTexts() {
    // No-op: Legacy fields no longer supported
    lcardsLog.trace(`[LCARdSSimpleCard] _processStandardTexts called (no-op)`);
}
```

#### Modified `_updateTrackedEntities()`
- **Removed** legacy template tracking
- Base implementation only tracks primary entity
- Subclasses must override to add their specific template sources

```javascript
_updateTrackedEntities() {
    const trackedEntities = new Set();
    if (this.config.entity) {
        trackedEntities.add(this.config.entity);
    }
    this._trackedEntities = Array.from(trackedEntities);
}
```

### 2. Simple Button Card (`lcards-simple-button.js`)

#### Added `_processCustomTemplates()`
New method that processes multi-text field templates:

```javascript
async _processCustomTemplates() {
    let hasChanges = false;

    if (this.config.text && typeof this.config.text === 'object') {
        for (const [fieldId, fieldConfig] of Object.entries(this.config.text)) {
            // Skip 'default' configuration
            if (fieldId === 'default' || !fieldConfig) continue;

            // Process template if enabled (default true)
            const shouldTemplate = fieldConfig.template !== false;
            if (shouldTemplate && fieldConfig.content) {
                const processedContent = await this.processTemplate(fieldConfig.content);

                if (this.config.text[fieldId].content !== processedContent) {
                    this.config.text[fieldId].content = processedContent;
                    hasChanges = true;
                }
            }
        }
    }

    if (hasChanges) {
        this._updateTrackedEntities();
        if (typeof this._onTemplatesChanged === 'function') {
            this._onTemplatesChanged();
        }
    }
}
```

**Key features:**
- Iterates through `text.{fieldId}` fields
- Skips `text.default` (it's configuration, not a field)
- Processes templates via `this.processTemplate()`
- Respects `template: false` flag to disable template processing
- Only triggers updates if content actually changed
- Modifies config in-place (safe since it's already merged)

#### Added `_updateTrackedEntities()` Override
Tracks dependencies from multi-text templates:

```javascript
_updateTrackedEntities() {
    super._updateTrackedEntities();  // Get primary entity

    const trackedEntities = new Set(this._trackedEntities || []);

    // Extract dependencies from multi-text fields
    if (this.config.text && typeof this.config.text === 'object') {
        for (const [fieldId, fieldConfig] of Object.entries(this.config.text)) {
            if (fieldId === 'default' || !fieldConfig?.content) continue;

            const template = fieldConfig.content;
            if (typeof template === 'string') {
                const deps = TemplateParser.extractDependencies(template);
                deps.forEach(entityId => trackedEntities.add(entityId));
            }
        }
    }

    this._trackedEntities = Array.from(trackedEntities);
}
```

**Key features:**
- Calls parent to get primary entity tracking
- Extracts entity IDs from templates using `TemplateParser`
- Adds all discovered entities to tracked set
- Enables auto-updates when tracked entities change

### 3. Template Detector (`TemplateDetector.js`)

#### Fixed `hasJinja2Templates()` Method
Changed from pattern matching to simple marker detection:

```javascript
static hasJinja2Templates(content) {
    if (!content || typeof content !== 'string') {
        return false;
    }

    // Check for Jinja2 expressions {{...}} OR control structures {%...%} OR comments {#...#}
    const hasExpressions = content.includes(this.MARKERS.JINJA2_START);
    const hasControlStructures = content.includes('{%');
    const hasComments = content.includes('{#');

    // If we have any Jinja2 markers, it's a Jinja2 template
    // This allows context variables like {{entity.state}} to work
    return hasExpressions || hasControlStructures || hasComments;
}
```

**Key changes:**
- **Removed** restrictive pattern matching
- **Now accepts** ANY `{{...}}` as valid Jinja2
- Supports context variables like `{{entity.state}}`
- Supports HA functions like `{{states('entity')}}`
- Supports filters like `{{value | round}}`
- Supports control structures like `{% if %}`

## Template Processing Flow

### Before (Broken)
1. Config loaded with `text.state.content: "{{entity.state}}"`
2. `hasJinja2Templates()` checks for specific patterns
3. `{{entity.state}}` doesn't match any pattern → returns false
4. Template not processed, raw string rendered ❌

### After (Fixed)
1. Config loaded with `text.state.content: "{{entity.state}}"`
2. `hasJinja2Templates()` finds `{{` marker → returns true ✅
3. `_processCustomTemplates()` called by base class
4. Template evaluated via HA: `"{{entity.state}}"` → `"on"` or `"off"`
5. Processed value stored back in config
6. `_resolveTextConfiguration()` extracts processed value
7. Actual state value rendered ✅

## Configuration Support

### Supported
```yaml
text:
  state:
    content: "{{entity.state}}"      # ✅ Context variable
    position: right
    template: true                    # ✅ Explicit enable (default)

  label:
    content: "Bathroom Light"         # ✅ Static text (no template)
    position: left

  brightness:
    content: "{{entity.attributes.brightness | default('N/A')}}"  # ✅ Complex template with filter
    position: bottom

  function_call:
    content: "{{states('sensor.temperature')}}"  # ✅ HA function call
    position: top
```

### Not Supported (Legacy)
```yaml
label: "My Button"           # ❌ No longer supported
content: "{{entity.state}}"  # ❌ No longer supported
texts:                       # ❌ No longer supported
  - text: "Field 1"
  - text: "Field 2"
```

## Auto-Update Behavior

Templates now properly track dependencies:

```yaml
text:
  state:
    content: "{{entity.state}}"
  brightness:
    content: "{{entity.attributes.brightness}}"
```

**Result:** Card automatically updates when:
- `entity` state changes
- `entity.attributes.brightness` changes

## About DataSourceManager Warning

You may see this warning in the console:
```
[LCARdSSimpleCard] DataSourceManager not available after timeout
```

**This is harmless** for simple entity templates. It only indicates that:
- The DataSourceManager (used for MSD features) isn't available yet
- Your template doesn't use datasources, so it doesn't matter
- The template will still be processed correctly via Jinja2

The warning will disappear once DataSourceManager initializes, or you can ignore it for simple button cards.

## Testing

Test configuration created at: `test/test-multitext-templates.yaml`

```yaml
type: custom:lcards-simple-button
entity: light.bathroom_strip
preset: lozenge
show_icon: true
text:
  state:
    position: right
    content: "{{entity.state}}"
  label:
    position: left
    content: "Bathroom"
  brightness:
    position: bottom-right
    content: "{{entity.attributes.brightness | default('N/A')}}"
```

## Breaking Changes

**None for users of the multi-text feature.**

Legacy fields were already deprecated and should not be in use. If any configs still use `label`, `content`, or `texts` array, they will need to migrate to the multi-text `text` object format.

## Migration Example

### Old (Legacy)
```yaml
label: "My Button"
content: "{{entity.state}}"
```

### New (Multi-Text)
```yaml
text:
  label:
    content: "My Button"
    position: left
  state:
    content: "{{entity.state}}"
    position: right
```
