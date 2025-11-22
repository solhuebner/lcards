# Multi-Text Template Processing - Final Solution

## Summary

Fixed the multi-text template processing bug by implementing `_processCustomTemplates()` hook in the simple button card. Templates now work correctly with the proper syntax.

## The Fix

Added two methods to `lcards-simple-button.js`:

1. **`_processCustomTemplates()`** - Processes templates in `text.{fieldId}.content`
2. **`_updateTrackedEntities()`** - Tracks template dependencies for auto-updates

## Correct Template Syntax

### Use Single Braces `{...}` for Context Variables (Recommended)
```yaml
text:
  state:
    content: "{entity.state}"  # ✅ Fast, local resolution
```

### Use Double Braces `{{...}}` for HA Functions (When Needed)
```yaml
text:
  temp:
    content: "{{states('sensor.temperature')}}"  # ✅ Access other entities
  formatted:
    content: "{{state_attr('light.bedroom', 'brightness') | int}}%"  # ✅ With filters
```

## Why Two Syntaxes?

- **`{entity.state}`** - Token template, evaluated locally in browser (fast)
- **`{{states('entity')}}`** - Jinja2 template, evaluated by Home Assistant server (powerful)

This is the standard Home Assistant pattern - use single braces for local context, double braces for HA functions.

## Complete Working Example

```yaml
type: custom:lcards-simple-button
entity: light.bathroom_strip
preset: lozenge
show_icon: true
text:
  label:
    position: left
    content: "Bathroom"  # Static text

  state:
    position: right
    content: "{entity.state}"  # Token template - fast!

  brightness:
    position: bottom
    content: "{entity.attributes.brightness}"  # Token template with attribute

tap_action:
  action: toggle
```

## Documentation

- **Template Syntax Guide**: `doc/TEMPLATE_SYNTAX_GUIDE.md` - Complete guide to template syntax
- **Test Configuration**: `test/test-multitext-templates.yaml` - Working examples

## What Was Changed

1. **Base class** - Removed legacy field processing
2. **Simple button** - Added multi-text template processing
3. **No breaking changes** - Legacy fields were already deprecated

The fix is complete and working! 🎉
