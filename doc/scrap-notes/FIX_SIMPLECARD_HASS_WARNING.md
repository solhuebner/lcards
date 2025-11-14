# Fix: SimpleCardTemplateEvaluator Warning - v1.9.30

## Problem

After implementing the datasource access fix (v1.9.28), dozens of warnings appeared in the logs:

```
[SimpleCardTemplateEvaluator] Created without hass in context
```

## Root Cause

**False Positive Warning** - The warning was firing in legitimate scenarios where `hass` was not needed.

### Where Warnings Came From

The warnings appeared when **MSD** processed datasource templates synchronously:

```javascript
// MSDContentResolver.js line 329
const evaluator = new UnifiedTemplateEvaluator({
  hass: null,        // ← Intentionally null for sync-only evaluation
  context: {},
  dataSourceManager
});
```

MSD uses `evaluateSync()` to process only datasources (JavaScript, tokens, datasources) - **not Jinja2**. Jinja2 is the only template type that requires `hass` (for server-side evaluation via Home Assistant's WebSocket API).

### Why The Warning Was Wrong

`SimpleCardTemplateEvaluator` was warning on construction:

```javascript
constructor(context) {
  if (!context.hass) {
    lcardsLog.warn('[SimpleCardTemplateEvaluator] Created without hass in context'); // ← False alarm!
  }
}
```

But `hass` is only needed when **evaluating Jinja2 templates**. The `HATemplateEvaluator` already throws a proper error when Jinja2 evaluation is attempted without hass:

```javascript
// HATemplateEvaluator.js
async _renderTemplate(template) {
  if (!this.context.hass || !this.context.hass.connection) {
    throw new Error('Home Assistant connection not available'); // ← Real error when needed
  }
  // ... render via HA API
}
```

So the constructor warning was:
- **Too early** - Warning before we know if Jinja2 will be used
- **Too noisy** - Firing in legitimate sync-only scenarios
- **Redundant** - Real error already exists when hass is actually needed

## Solution

**Removed the constructor warning** from `SimpleCardTemplateEvaluator`.

The proper error handling already exists:
1. If someone uses Jinja2 without hass → `HATemplateEvaluator` throws error
2. If someone uses datasources without hass → Works fine (hass not needed)
3. If someone uses tokens/JavaScript without hass → Works fine (hass not needed)

```javascript
constructor(context) {
  super(context);

  // Note: hass is optional - only required for Jinja2 templates
  // For JavaScript/Token/Datasource templates, hass is not needed
  // Warning removed as it creates noise when MSD evaluates datasources synchronously

  // Create HATemplateEvaluator for Jinja2 support
  this._haEvaluator = new HATemplateEvaluator(context);
}
```

## Benefits

- ✅ Eliminates dozens of false-positive warnings
- ✅ Allows legitimate sync-only template evaluation (MSD datasources)
- ✅ Preserves real error when Jinja2 is used without hass
- ✅ Cleaner logs for debugging

## Files Changed

- `src/core/templates/SimpleCardTemplateEvaluator.js`
  - Removed `!context.hass` warning from constructor
  - Added explanatory comment about optional hass
  - Version: 1.9.30

## Testing

Reload the dashboard and check trace.log - the `[SimpleCardTemplateEvaluator] Created without hass in context` warnings should be completely gone.

If someone tries to use Jinja2 without hass, they'll get the proper error:
```
Error: Home Assistant connection not available
```