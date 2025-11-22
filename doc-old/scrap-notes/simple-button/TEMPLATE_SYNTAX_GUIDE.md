# Template Syntax Guide for Multi-Text Fields

## Overview

LCARdS supports two types of template syntax in multi-text fields:

1. **Token Templates** `{...}` - Local, fast resolution using context variables
2. **Jinja2 Templates** `{{...}}` - Server-side rendering via Home Assistant

## Token Templates (Recommended for Simple Cases)

Use **single braces** `{...}` to reference context variables that are evaluated locally in the browser.

### Syntax
```yaml
text:
  fieldname:
    content: "{variable.property}"
```

### Available Context Variables
- `{entity.state}` - Current entity state
- `{entity.attributes.xxx}` - Any entity attribute
- `{config.xxx}` - Card configuration values
- `{variables.xxx}` - Custom variables from config

### Examples
```yaml
text:
  # Simple state display
  state:
    content: "{entity.state}"
    position: right

  # Entity attribute
  brightness:
    content: "{entity.attributes.brightness}"
    position: bottom

  # Custom variable
  custom:
    content: "{variables.my_value}"
    position: top
```

### Advantages
- ✅ **Fast** - No server round-trip
- ✅ **Simple** - Direct property access
- ✅ **Auto-updates** - Tracked automatically
- ✅ **Works offline** - No HA connection needed

### Limitations
- ❌ No filters or transformations
- ❌ No HA helper functions
- ❌ Can't access other entities

## Jinja2 Templates (For Complex Logic)

Use **double braces** `{{...}}` with HA functions for server-side rendering.

### Syntax
```yaml
text:
  fieldname:
    content: "{{ha_function('args') | filter}}"
```

### Common HA Functions
- `{{states('entity_id')}}` - Get any entity state
- `{{state_attr('entity_id', 'attr')}}` - Get any entity attribute
- `{{now()}}` - Current time
- `{{is_state('entity_id', 'value')}}` - Check state
- `{{has_value('entity_id')}}` - Check if entity has value

### Common Filters
- `| int` - Convert to integer
- `| float` - Convert to float
- `| round(2)` - Round to decimals
- `| default('N/A')` - Default value if missing
- `| upper` - Convert to uppercase
- `| lower` - Convert to lowercase

### Examples
```yaml
text:
  # Get state of a different entity
  other_state:
    content: "{{states('sensor.temperature')}}"
    position: right

  # Use filters
  formatted_brightness:
    content: "{{state_attr('light.bathroom_strip', 'brightness') | int | default('N/A')}}"
    position: bottom

  # Conditional logic
  status:
    content: "{% if is_state('light.bedroom', 'on') %}ON{% else %}OFF{% endif %}"
    position: top

  # Time-based
  current_time:
    content: "{{now().strftime('%H:%M')}}"
    position: center
```

### Advantages
- ✅ **Powerful** - Full Jinja2 features
- ✅ **Filters** - Transform and format data
- ✅ **Cross-entity** - Access any entity
- ✅ **HA functions** - Use all HA helpers

### Limitations
- ❌ Slower - Requires server round-trip
- ❌ HA connection required
- ❌ More complex syntax

## Which Should I Use?

### Use Token Templates `{...}` When:
- Displaying the card's own entity state
- Accessing entity attributes
- Simple property display
- Maximum performance needed

### Use Jinja2 Templates `{{...}}` When:
- Need to access other entities
- Need filters or transformations
- Need conditional logic
- Need HA helper functions

## Template Processing Order

Templates are processed in this order:

1. **JavaScript** `[[[code]]]` - Executed locally (rare)
2. **Tokens** `{entity.state}` - Context variable replacement (fast)
3. **Datasources** `{datasource:entity_id}` - MSD data access (if using MSD)
4. **Jinja2** `{{states('entity')}}` - Server-side HA rendering (powerful)

## Common Patterns

### Pattern 1: Show Entity State (Simple)
```yaml
text:
  state:
    content: "{entity.state}"  # Use token template
```

### Pattern 2: Show Formatted Attribute
```yaml
text:
  brightness:
    content: "{{state_attr('light.bedroom', 'brightness') | int}}%"  # Use Jinja2 for formatting
```

### Pattern 3: Mixed Templates
```yaml
text:
  # Local context
  entity_name:
    content: "{entity.attributes.friendly_name}"
    position: left

  # Server-side with filter
  formatted_state:
    content: "{{states('sensor.temperature') | round(1)}}°C"
    position: right
```

### Pattern 4: Conditional Display
```yaml
text:
  status:
    content: "{% if is_state('light.bedroom', 'on') %}Lit{% else %}Dark{% endif %}"
    position: center
```

## Common Mistakes

### ❌ Wrong: Using `{{entity.state}}`
```yaml
text:
  state:
    content: "{{entity.state}}"  # Won't work - HA doesn't know 'entity'
```

### ✅ Correct: Use token syntax
```yaml
text:
  state:
    content: "{entity.state}"  # Works - local context variable
```

### ❌ Wrong: Token syntax for HA functions
```yaml
text:
  temp:
    content: "{states('sensor.temperature')}"  # Won't work - needs Jinja2
```

### ✅ Correct: Use Jinja2 for HA functions
```yaml
text:
  temp:
    content: "{{states('sensor.temperature')}}"  # Works - HA function
```

## Disabling Template Processing

You can disable template processing for a field:

```yaml
text:
  raw_text:
    content: "This {{text}} won't be processed"
    template: false  # Disable all template processing
```

## Performance Tips

1. **Prefer token templates** for simple cases - they're faster
2. **Minimize Jinja2 usage** - each requires a server call
3. **Use static text** when possible - no processing needed
4. **Cache complex calculations** in helper entities rather than in templates

## Debugging

Enable trace logging to see template processing:

```yaml
# In your card config
debug:
  level: trace
```

Look for these log messages:
- `[UnifiedTemplateEvaluator] Evaluating content` - Shows what's being processed
- `[UnifiedTemplateEvaluator] Phase X: Evaluating Y templates` - Shows processing phases
- `[UnifiedTemplateEvaluator] Evaluation complete` - Shows final result

## Summary

| Feature | Token `{...}` | Jinja2 `{{...}}` |
|---------|---------------|------------------|
| Speed | Fast (local) | Slower (server) |
| Context Variables | ✅ Yes | ❌ No |
| HA Functions | ❌ No | ✅ Yes |
| Filters | ❌ No | ✅ Yes |
| Cross-entity | ❌ No | ✅ Yes |
| Offline | ✅ Yes | ❌ No |

**Rule of Thumb:** Use single braces `{...}` for your card's entity, double braces `{{...}}` for everything else.
