# JavaScript Rules Quick Start Guide

## Overview

LCARdS rules support JavaScript conditions using the same syntax as **custom-button-card**: wrap your code in `[[[ ]]]`.

**Simple approach:** Access entities directly via `states['entity.id'].state` - just like custom-button-card!

## Basic Syntax

```yaml
rules:
  - id: my_rule
    when:
      any:
        - condition: '[[[return states["light.tv"].state === "on"]]]'
    apply:
      overlays:
        my_overlay:
          style:
            color: var(--lcars-red)
```

## Available Context

Inside JavaScript conditions, you have access to:

- **`states`**: Object with all entity states (like `hass.states`)
  - Access: `states['light.tv'].state`
  - Access attributes: `states['light.tv'].attributes.brightness`

- **`hass`**: Full Home Assistant object
  - Access: `hass.states['sensor.temp']`
  - User info: `hass.user`

- **`entity`**: Current entity (if specified in rule)
  - Access: `entity.state`
  - Access: `entity.attributes`

## Examples

### Check Entity State

```yaml
# Single entity check
condition: '[[[return states["light.bedroom"].state === "on"]]]'

# Multiple conditions
condition: |
  [[[
    return states["light.bedroom"].state === "on"
        && states["sensor.temp"].state > 20;
  ]]]
```

### Check Attributes

```yaml
# Check brightness
condition: '[[[return states["light.tv"].attributes.brightness > 128]]]'

# Check battery level
condition: '[[[return states["sensor.phone_battery"].state < 20]]]'
```

### Complex Logic

```yaml
condition: |
  [[[
    const light = states["light.bedroom"];
    const temp = parseFloat(states["sensor.temp"].state);

    return light.state === "on" && temp > 18 && temp < 25;
  ]]]
```

## Multi-line Format (Recommended)

Use the pipe `|` for multi-line JavaScript:

```yaml
rules:
  - id: complex_rule
    when:
      any:
        - condition: |
            [[[
              // Comments work!
              const light = states["light.bedroom"];
              const isOn = light.state === "on";
              const brightness = light.attributes.brightness || 0;

              return isOn && brightness > 100;
            ]]]
```

## Common Patterns

### Time-based Conditions

```yaml
condition: |
  [[[
    const now = new Date();
    const hour = now.getHours();
    return hour >= 6 && hour < 22;  // Daytime
  ]]]
```

### Multiple Entity Check

```yaml
condition: |
  [[[
    const lights = ["light.living_room", "light.kitchen", "light.bedroom"];
    return lights.some(id => states[id].state === "on");
  ]]]
```

### Numeric Comparisons

```yaml
condition: |
  [[[
    const temp = parseFloat(states["sensor.temperature"].state);
    const humidity = parseFloat(states["sensor.humidity"].state);

    return temp > 20 && humidity < 60;
  ]]]
```

## Troubleshooting

### Error: "Unexpected token"

**Problem:** JavaScript syntax error

**Solution:** Check your code for typos, missing quotes, or semicolons

```yaml
# ❌ Wrong
condition: '[[[return states[light.tv].state === "on"]]]'

# ✅ Correct
condition: '[[[return states["light.tv"].state === "on"]]]'
```

### Error: "Cannot read property 'state'"

**Problem:** Entity doesn't exist or isn't available yet

**Solution:** Add null checks

```yaml
condition: |
  [[[
    const light = states["light.tv"];
    return light && light.state === "on";
  ]]]
```

### Rule Not Matching

**Problem:** Condition not evaluating correctly

**Solution:** Always use `return` statement

```yaml
# ✅ Correct - explicit return
condition: '[[[return states["light.tv"].state === "on"]]]'

# ✅ Also works - expression automatically gets return
condition: '[[[states["light.tv"].state === "on"]]]'
```

## JavaScript vs Standard Entity Conditions

| Standard | JavaScript |
|----------|-----------|
| `entity: light.tv`<br/>`state: "on"` | `condition: '[[[return states["light.tv"].state === "on"]]]'` |
| `entity: sensor.temp`<br/>`above: 20` | `condition: '[[[return parseFloat(states["sensor.temp"].state) > 20]]]'` |
| Multiple conditions<br/>with `all:` or `any:` | Single condition with `&&` or `||` logic |

## Why Use JavaScript?

- **Complex logic**: Multiple conditions with `&&`, `||`, `!`
- **Calculations**: Math operations, string manipulation
- **Flexibility**: Access any entity, any attribute, any time
- **Power**: Full JavaScript language features

## Best Practices

1. **Use double quotes** for entity IDs: `states["light.tv"]`
2. **Parse numeric states**: `parseFloat(states["sensor.temp"].state)`
3. **Add null checks** for reliability: `states["entity.id"] && ...`
4. **Use multi-line** for complex logic (easier to read)
5. **Always return boolean**: Return `true` or `false`

## Complete Working Example

```yaml
type: custom:lcards-msd-card
card:
  # ... your card config ...
  rules:
    - id: bedroom_light_on_grid_style
      when:
        any:
          - condition: |
              [[[
                return states["light.tv"].state === "on";
              ]]]
      apply:
        overlays:
          title_overlay:
            style:
              color: var(--lcars-red)

    - id: bedroom_light_off_grid_style
      when:
        any:
          - condition: |
              [[[
                return states["light.tv"].state === "off";
              ]]]
      apply:
        overlays:
          title_overlay:
            style:
              color: var(--lcars-blue)
```

## Next Steps

- See `doc/examples/rules-template-conditions-example.yaml` for more examples
- Standard entity conditions still work and are simpler for basic cases
- Jinja2 templates (`{{ }}`) are also supported for Home Assistant template syntax
