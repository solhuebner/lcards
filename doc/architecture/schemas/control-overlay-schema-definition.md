# Control Overlay - Official Schema Definition

**Date:** January 11, 2026
**Purpose:** Single source of truth for control overlay configuration
**Status:** 🎯 DEFINITIVE - All implementations must match this
**Version:** 1.22+

**Architecture:** Embeds Home Assistant cards (including LCARdS cards) within MSD displays at specified positions

---

## ⚠️ Schema Registration (v1.22+)

**Pattern**: Control overlay schema is part of core rendering infrastructure (not card-specific)

```javascript
// Control overlay schema registered by ValidationService:
ValidationService.registerSchema('controlOverlay', controlOverlaySchema);
```

**Schema Location:** `src/core/validation-service/schemas/controlOverlay.js`
**Used by:** MSD card rendering pipeline for control overlay validation

---

## ⚠️ Breaking Changes (v1.22+)

**Removed Fields:**
- ❌ `card_config` - Legacy field, use `card` instead
- ❌ `cardConfig` - Legacy camelCase field, use `card` instead

**Removed Overlay Types:**
The following legacy overlay types have been removed. Use control overlays with LCARdS cards instead:
- ❌ `text` → Use `control` + `custom:lcards-button`
- ❌ `button` → Use `control` + `custom:lcards-button`
- ❌ `status_grid` → Use multiple `control` + `custom:lcards-button`
- ❌ `apexchart` → Use `control` + `custom:lcards-chart`

**Required Pattern (v1.22+):**
Control overlays MUST use the nested card pattern:
```yaml
- type: control           # ✅ REQUIRED
  id: unique_id
  card:                   # ✅ REQUIRED: Nested card definition
    type: custom:lcards-button
    entity: light.kitchen
  position: [100, 50]     # ✅ REQUIRED: position OR anchor
  size: [200, 80]         # ✅ REQUIRED: [width, height]
```

---

## Overview

Control overlays embed Home Assistant cards within MSD displays, supporting:
- **Any Home Assistant card type** (including LCARdS cards, built-in cards, HACS cards)
- **Absolute positioning** via pixel coordinates or anchor references
- **Fixed sizing** with explicit width/height
- **Z-index layering** for overlay stacking
- **Visibility control** for dynamic show/hide
- **Nested card pattern** enforcing clear structure and validation

**Important:** Control overlays are the ONLY way to embed cards in MSD displays (v1.22+). Legacy flat patterns have been removed.

---

## Minimal Example

Basic control overlay embedding an LCARdS button:

```yaml
type: custom:lcards-msd-card

msd:
  base_svg:
    source: builtin:ncc-1701-a-blue

  anchors:
    button_area: [100, 50]

  overlays:
    # Control overlay with anchor positioning
    - id: power_button
      type: control
      position: button_area    # Uses anchor
      size: [200, 80]
      card:
        type: custom:lcards-button
        entity: switch.main_power
        name: Main Power
```

---

## Complete YAML Schema

```yaml
# ==============================================================================
# CONTROL OVERLAY CONFIGURATION
# ==============================================================================

- type: control
  # Required: Overlay type identifier
  # Value: Must be "control"

  id: <overlay-id>
    # Required: Unique overlay identifier
    # Format: String (alphanumeric, underscores, hyphens)
    # Example: id: status_display

  # ==========================================================================
  # NESTED CARD DEFINITION
  # ==========================================================================

  card:
    # Required: Nested card definition
    # Must contain at minimum a "type" property
    # Can contain any valid card configuration for the specified type

    type: <card-type>
      # Required: Card type identifier
      # Values:
      #   - custom:lcards-button - LCARdS button card
      #   - custom:lcards-chart - LCARdS chart card
      #   - custom:lcards-slider - LCARdS slider card
      #   - custom:lcards-label - LCARdS label card
      #   - custom:lcards-msd - Nested MSD card
      #   - button - Built-in HA button card
      #   - light - Built-in HA light card
      #   - sensor - Built-in HA sensor card
      #   - ... any other HA/HACS card type
      # Example:
      #   type: custom:lcards-button

    # Card-specific properties
    # (Varies by card type - see individual card documentation)
    entity: <entity_id>
      # Optional: Entity ID (if card supports/requires it)
      # Example: entity: light.kitchen

    name: <string>
      # Optional: Display name (if card supports it)
      # Example: name: Kitchen Light

    # ... additional card-specific properties

  # ==========================================================================
  # POSITIONING
  # ==========================================================================

  position: [x, y] | <anchor-id>
    # Required: Position of the control overlay (top-left corner)
    # Format:
    #   - [x, y] - Absolute pixel coordinates
    #   - anchor_id - Reference to named anchor
    # Examples:
    #   position: [100, 50]           # Absolute positioning
    #   position: status_area         # Anchor reference
    #   position: ["25%", "10%"]      # Percentage positioning

  anchor: <anchor-id>
    # Alternative: Anchor reference (same as position with anchor ID)
    # Prefer using position for consistency
    # Example: anchor: button_area

  # ==========================================================================
  # SIZING
  # ==========================================================================

  size: [width, height]
    # Required: Size of the control overlay
    # Format: [width, height] in pixels
    # Min: width >= 0, height >= 0
    # Examples:
    #   size: [200, 80]        # 200px wide, 80px tall
    #   size: [300, 150]       # 300px wide, 150px tall

  # ==========================================================================
  # LAYERING
  # ==========================================================================

  z_index: <number>
    # Optional: Layering order for overlay stacking
    # Default: 0
    # Higher values render on top of lower values
    # Typical range: 0-100
    # Examples:
    #   z_index: 0       # Base layer
    #   z_index: 10      # Above base, below high-priority
    #   z_index: 50      # High-priority layer
    #   z_index: 100     # Always on top

  # ==========================================================================
  # VISIBILITY
  # ==========================================================================

  visible: <boolean>
    # Optional: Show or hide the control overlay
    # Default: true
    # Can be controlled via rules for dynamic visibility
    # Examples:
    #   visible: true    # Show (default)
    #   visible: false   # Hide
```

---

## Property Reference

### type

**Purpose**: Identifies the overlay as a control overlay

**Required**: YES

**Value**: Must be the string `"control"`

**Example**:
```yaml
- type: control
```

**Error Handling**:
- Missing `type` → Validation error
- Wrong type value → Routed to wrong overlay handler

---

### id

**Purpose**: Unique identifier for the overlay (used for rules, references, debugging)

**Required**: YES

**Format**: String (alphanumeric, underscores, hyphens recommended)

**Uniqueness**: Must be unique within the MSD card's overlay array

**Examples**:
```yaml
id: power_button
id: status_display
id: cpu_temp_chart
```

**Usage**:
- Target overlay in rules: `overlay_id: power_button`
- Debug logging and inspection
- Overlay-to-overlay relationships (future)

---

### card

**Purpose**: Nested card definition for the embedded Home Assistant card

**Required**: YES

**Structure**: Object containing card configuration

**Minimum Requirements**:
- MUST contain a `type` property (string)
- MAY contain any additional properties required by the card type

**Examples**:

**LCARdS Button Card**:
```yaml
card:
  type: custom:lcards-button
  entity: light.kitchen
  name: Kitchen Light
  style:
    background: var(--lcars-orange)
```

**Built-in HA Light Card**:
```yaml
card:
  type: light
  entity: light.living_room
  name: Living Room
```

**LCARdS Chart Card**:
```yaml
card:
  type: custom:lcards-chart
  entity: sensor.cpu_temp
  name: CPU Temperature
  span: 1h
  chart_type: line
```

**Nested MSD Card**:
```yaml
card:
  type: custom:lcards-msd
  msd:
    base_svg:
      source: builtin:small-panel
    overlays:
      - id: nested_line
        type: line
        anchor: a1
        attach_to: a2
```

**Error Handling**:
- Missing `card` → Validation error: "Control overlay requires a 'card' property"
- `card` not an object → Validation error: "Control overlay 'card' must be an object"
- Missing `card.type` → Validation error: "Card definition is missing required 'type' property"
- `card.type` not a string → Validation error: "Card 'type' must be a string"

**Deprecated Patterns**:
- ❌ `card_config` → Use `card` instead
- ❌ `cardConfig` → Use `card` instead

---

### position

**Purpose**: Specifies the position of the control overlay's top-left corner

**Required**: YES (either `position` OR `anchor`, but `position` is preferred)

**Format**: Array `[x, y]` or anchor ID string

**Coordinate Types**:
1. **Absolute pixels**: `[100, 50]` = 100px from left, 50px from top
2. **Percentage strings**: `["25%", "10%"]` = 25% of viewBox width, 10% of viewBox height
3. **Anchor reference**: `button_area` = Use anchor named "button_area"

**Examples**:
```yaml
# Absolute positioning
position: [100, 50]

# Percentage positioning
position: ["50%", "25%"]

# Anchor reference
position: status_area

# Mixed (absolute x, percentage y)
position: [200, "30%"]
```

**Error Handling**:
- Missing both `position` and `anchor` → Validation error: "Control overlay requires either 'position' or 'anchor' property"
- Invalid format → Validation error: "Position must be an array of [x, y] coordinates"
- Non-existent anchor → Runtime warning: "Anchor 'anchor_name' not found"

---

### anchor

**Purpose**: Alternative way to specify anchor-based positioning (prefer using `position` with anchor ID for consistency)

**Required**: NO (use `position` instead)

**Format**: String (anchor ID)

**Example**:
```yaml
anchor: button_area
```

**Note**: Using `position: button_area` is equivalent and preferred for consistency with line overlays.

---

### size

**Purpose**: Specifies the width and height of the control overlay

**Required**: YES

**Format**: Array `[width, height]` in pixels

**Constraints**:
- Width must be >= 0
- Height must be >= 0

**Examples**:
```yaml
# Standard button size
size: [200, 80]

# Wide status bar
size: [600, 40]

# Square icon
size: [50, 50]

# Large chart
size: [400, 300]
```

**Error Handling**:
- Missing `size` → Validation error: "Control overlay requires 'size' property"
- Invalid format → Validation error: "Size must be an array of [width, height] dimensions"
- Negative values → Validation error: "Size dimensions must be >= 0"

**Behavior**:
- Embedded card is constrained to this size
- Card may scale or clip content based on its own implementation
- Use card-specific sizing options (e.g., `style` properties) for finer control

---

### z_index

**Purpose**: Controls overlay stacking order (which overlays appear on top of others)

**Required**: NO

**Format**: Number (integer recommended)

**Default**: 0

**Behavior**:
- Higher values render on top of lower values
- Overlays with same z_index use document order (later = on top)
- Affects both control and line overlays in the same MSD card

**Examples**:
```yaml
# Base layer (default)
z_index: 0

# Above base, below high-priority
z_index: 10

# High-priority overlay
z_index: 50

# Always on top
z_index: 100
```

**Common Patterns**:
```yaml
# Background status display
- id: status_bg
  type: control
  z_index: 0
  card: { ... }

# Line connections
- id: line1
  type: line
  z_index: 5
  # ...

# Interactive buttons on top
- id: power_button
  type: control
  z_index: 10
  card: { ... }
```

---

### visible

**Purpose**: Show or hide the control overlay

**Required**: NO

**Format**: Boolean (`true` or `false`)

**Default**: `true`

**Examples**:
```yaml
# Visible (default)
visible: true

# Hidden
visible: false
```

**Use Cases**:
1. **Static hiding**: Hide overlay in specific MSD configurations
2. **Rule-based visibility**: Use rules to show/hide based on conditions:
   ```yaml
   rules:
     - id: show_when_on
       conditions:
         - entity: light.kitchen
           state: 'on'
       apply_to:
         overlay_ids: [kitchen_status]
       changes:
         visible: true
   ```

3. **Animation sequences**: Show/hide in response to events

**Behavior**:
- `visible: false` → Overlay not rendered (no DOM element, no interaction)
- `visible: true` → Overlay rendered normally

---

## Complete Examples

### Example 1: Simple Button Control

```yaml
type: custom:lcards-msd-card

msd:
  base_svg:
    source: builtin:ncc-1701-a-blue
    filter_preset: dimmed

  overlays:
    - id: main_power_button
      type: control
      position: [100, 50]
      size: [200, 80]
      z_index: 10
      card:
        type: custom:lcards-button
        entity: switch.main_power
        name: Main Power
        style:
          background: var(--lcars-orange)
```

### Example 2: Multi-Card Layout with Anchors

```yaml
type: custom:lcards-msd-card

msd:
  base_svg:
    source: builtin:defiant-blue

  anchors:
    cpu_display: [100, 100]
    memory_display: [100, 200]
    network_display: [100, 300]
    chart_area: [350, 100]

  overlays:
    # Status buttons using anchors
    - id: cpu_status
      type: control
      position: cpu_display
      size: [200, 60]
      card:
        type: custom:lcards-button
        entity: sensor.cpu_usage
        name: CPU Usage

    - id: memory_status
      type: control
      position: memory_display
      size: [200, 60]
      card:
        type: custom:lcards-button
        entity: sensor.memory_usage
        name: Memory Usage

    - id: network_status
      type: control
      position: network_display
      size: [200, 60]
      card:
        type: custom:lcards-button
        entity: sensor.network_usage
        name: Network Usage

    # Large chart overlay
    - id: performance_chart
      type: control
      position: chart_area
      size: [400, 280]
      z_index: 5
      card:
        type: custom:lcards-chart
        entity: sensor.cpu_usage
        name: System Performance
        span: 1h
        chart_type: line
```

### Example 3: Layered Overlays with Z-Index

```yaml
type: custom:lcards-msd-card

msd:
  base_svg:
    source: builtin:ncc-1701-a-blue

  overlays:
    # Background status display (z_index: 0)
    - id: system_status_bg
      type: control
      position: [50, 50]
      size: [300, 200]
      z_index: 0
      card:
        type: custom:lcards-label
        text: System Status
        style:
          background: 'rgba(0, 0, 0, 0.3)'

    # Line connections (z_index: 5)
    - id: data_line
      type: line
      anchor: [100, 150]
      attach_to: [300, 150]
      z_index: 5
      style:
        color: var(--lcars-blue)
        width: 2

    # Interactive button on top (z_index: 10)
    - id: power_button
      type: control
      position: [150, 120]
      size: [150, 60]
      z_index: 10
      card:
        type: custom:lcards-button
        entity: switch.main_power
        name: Power
```

### Example 4: Conditional Visibility with Rules

```yaml
type: custom:lcards-msd-card

msd:
  base_svg:
    source: builtin:ncc-1701-a-blue

  overlays:
    # Alert display (shown when alert is active)
    - id: alert_display
      type: control
      position: [50, 50]
      size: [250, 100]
      z_index: 100
      visible: false    # Hidden by default
      card:
        type: custom:lcards-button
        entity: binary_sensor.system_alert
        name: SYSTEM ALERT
        style:
          background: var(--lcars-alert-red)

    # Status button (always visible)
    - id: status_button
      type: control
      position: [50, 200]
      size: [250, 80]
      card:
        type: custom:lcards-button
        entity: sensor.system_status
        name: System Status

rules:
  # Show alert when binary_sensor is on
  - id: show_alert_when_on
    conditions:
      - entity: binary_sensor.system_alert
        state: 'on'
    apply_to:
      overlay_ids: [alert_display]
    changes:
      visible: true
```

### Example 5: Nested MSD Card

```yaml
type: custom:lcards-msd-card

msd:
  base_svg:
    source: builtin:ncc-1701-a-blue

  overlays:
    # Main control button
    - id: main_button
      type: control
      position: [50, 50]
      size: [200, 80]
      card:
        type: custom:lcards-button
        entity: switch.main_system
        name: Main System

    # Nested MSD display
    - id: subsystem_display
      type: control
      position: [300, 50]
      size: [400, 300]
      z_index: 5
      card:
        type: custom:lcards-msd
        msd:
          base_svg:
            source: builtin:small-panel
            filter_preset: subtle
          anchors:
            sub1: [50, 50]
            sub2: [350, 50]
          overlays:
            - id: subsystem_line
              type: line
              anchor: sub1
              attach_to: sub2
              style:
                color: var(--lcars-orange)
                width: 2
```

### Example 6: Mixed Card Types

```yaml
type: custom:lcards-msd-card

msd:
  base_svg:
    source: builtin:defiant-blue

  overlays:
    # LCARdS button
    - id: lcards_button
      type: control
      position: [50, 50]
      size: [200, 80]
      card:
        type: custom:lcards-button
        entity: light.kitchen
        name: Kitchen Light

    # Built-in HA light card
    - id: ha_light
      type: control
      position: [50, 150]
      size: [200, 120]
      card:
        type: light
        entity: light.living_room

    # LCARdS chart
    - id: lcards_chart
      type: control
      position: [300, 50]
      size: [350, 200]
      card:
        type: custom:lcards-chart
        entity: sensor.cpu_temp
        name: CPU Temperature
        span: 1h

    # Built-in sensor card
    - id: ha_sensor
      type: control
      position: [300, 270]
      size: [200, 80]
      card:
        type: sensor
        entity: sensor.outside_temp
        name: Outside Temperature
```

---

## Migration from Legacy Patterns

### Removed: Flat/Direct Card Pattern

**Before (v1.21 and earlier)**:
```yaml
overlays:
  # ❌ REMOVED: Flat pattern (no nested card)
  - id: button1
    type: button            # Wrong: type should be "control"
    entity: light.kitchen
    position: [100, 50]
    size: [200, 80]
```

**After (v1.22+)**:
```yaml
overlays:
  # ✅ CORRECT: Nested card pattern
  - id: button1
    type: control           # Correct: type is "control"
    position: [100, 50]
    size: [200, 80]
    card:                   # Nested card definition
      type: custom:lcards-button
      entity: light.kitchen
```

### Removed: Legacy Field Names

**Before**:
```yaml
overlays:
  - id: button1
    type: control
    position: [100, 50]
    size: [200, 80]
    card_config:            # ❌ REMOVED: Legacy field
      type: button
      entity: light.kitchen
```

**After**:
```yaml
overlays:
  - id: button1
    type: control
    position: [100, 50]
    size: [200, 80]
    card:                   # ✅ CORRECT: Use "card"
      type: custom:lcards-button
      entity: light.kitchen
```

### Removed: text, button, status_grid Overlay Types

**Before**:
```yaml
overlays:
  # ❌ REMOVED: text overlay type
  - id: label1
    type: text
    text: "System Status"
    position: [100, 50]

  # ❌ REMOVED: button overlay type
  - id: btn1
    type: button
    entity: light.kitchen
    position: [100, 120]

  # ❌ REMOVED: status_grid overlay type
  - id: grid1
    type: status_grid
    entities: [...]
    position: [100, 200]
```

**After**:
```yaml
overlays:
  # ✅ CORRECT: Use control + lcards-button for text
  - id: label1
    type: control
    position: [100, 50]
    size: [200, 40]
    card:
      type: custom:lcards-button
      name: "System Status"

  # ✅ CORRECT: Use control + lcards-button
  - id: btn1
    type: control
    position: [100, 120]
    size: [200, 80]
    card:
      type: custom:lcards-button
      entity: light.kitchen

  # ✅ CORRECT: Use multiple control + lcards-button
  - id: grid_item_1
    type: control
    position: [100, 200]
    size: [150, 60]
    card:
      type: custom:lcards-button
      entity: sensor.cpu

  - id: grid_item_2
    type: control
    position: [260, 200]
    size: [150, 60]
    card:
      type: custom:lcards-button
      entity: sensor.memory
```

---

## Integration with Core Systems

### RulesEngine

Control overlays can be targeted by rules for dynamic styling and visibility:

```yaml
rules:
  # Change visibility based on entity state
  - id: show_on_alert
    conditions:
      - entity: binary_sensor.alert
        state: 'on'
    apply_to:
      overlay_ids: [alert_display]
    changes:
      visible: true

  # Change z_index based on conditions (future)
  - id: bring_to_front
    conditions:
      - entity: input_boolean.priority_mode
        state: 'on'
    apply_to:
      overlay_ids: [priority_button]
    changes:
      z_index: 100
```

### DataSourceManager

Embedded cards use DataSourceManager if configured:
```yaml
- id: chart_overlay
  type: control
  position: [100, 100]
  size: [400, 300]
  card:
    type: custom:lcards-chart
    entity: sensor.cpu_temp
    data_source: cpu_temp_history  # References DataSource
```

### ThemeManager

Embedded cards inherit the active theme:
```yaml
- id: themed_button
  type: control
  position: [100, 50]
  size: [200, 80]
  card:
    type: custom:lcards-button
    entity: light.kitchen
    style:
      background: var(--lcars-orange)  # Theme token
```

---

## Validation

**Schema Location**: `src/core/validation-service/schemas/controlOverlay.js`

**Validation Features**:
- **Required fields**: `type`, `card`, `card.type`, `position` OR `anchor`, `size`
- **Type checking**: `card` must be object, `card.type` must be string
- **Pattern enforcement**: Rejects flat/direct patterns, enforces nested card structure
- **Legacy detection**: Rejects `card_config`/`cardConfig` with helpful migration messages
- **Position validation**: Ensures position OR anchor is provided
- **Size validation**: Ensures size is provided with non-negative dimensions

**Error Messages**:

**Missing card**:
```
Error: Control overlay requires a "card" property
Suggestion: Add a "card" property with nested card definition:
  card:
    type: custom:lcards-button
    entity: light.example
```

**Missing card.type**:
```
Error: Card definition is missing required "type" property
Suggestion: Add a "type" property to your card definition:
  card:
    type: custom:lcards-button
    entity: light.example
```

**Flat pattern detected**:
```
Error: Flat/direct card pattern not supported. Found type "button" where "control" expected.
Suggestion: Use the nested card pattern:
  - type: control
    id: my_control
    card:
      type: button
      entity: your.entity
    position: [x, y]
    size: [width, height]
```

**Legacy field detected**:
```
Error: Legacy field "card_config" is no longer supported
Suggestion: Replace "card_config" with "card":
  card:
    type: custom:lcards-button
    entity: light.example
```

---

## Performance Considerations

**Rendering**:
- Control overlays create full Home Assistant card instances
- Each embedded card has its own rendering lifecycle
- Z-index layering may affect rendering order but not performance

**Memory**:
- Each control overlay maintains embedded card state
- Avoid excessive nested MSD cards (recursion depth)
- Use `visible: false` to prevent rendering of unused overlays

**Best Practices**:
- Limit control overlays to 10-20 per MSD card for optimal performance
- Use line overlays for visual connections (much lighter than cards)
- Consider card complexity (charts are heavier than buttons)
- Use z_index thoughtfully (excessive layering can affect rendering)

---

## Debugging

**Enable Debug Mode**:
```yaml
msd:
  debug:
    enabled: true
    show_anchors: true
```

**Console Access**:
```javascript
// Get MSD card instance
const card = document.querySelector('lcards-msd-card');

// Access control overlays
const overlays = card._msdPipeline.overlays.filter(o => o.type === 'control');

// Inspect specific overlay
const powerButton = overlays.find(o => o.id === 'power_button');
console.log(powerButton);

// Check embedded card instance
console.log(powerButton.cardElement);
```

**Common Issues**:

1. **Card not rendering**:
   - Check `card.type` is valid card type
   - Verify `size` is large enough for card content
   - Ensure `visible: true` (default)
   - Check z_index isn't hidden behind other overlays

2. **Position incorrect**:
   - Verify viewBox coordinates match base SVG
   - Check anchor exists (if using anchor positioning)
   - Confirm position is `[x, y]` array format

3. **Card cut off**:
   - Increase `size` dimensions
   - Check card's internal sizing configuration
   - Verify position isn't off-canvas

---

## Related Documentation

- **[MSD Card Schema](./msd-schema-definition.md)** - MSD card configuration
- **[Line Overlay Schema](./line-overlay-schema-definition.md)** - Line overlay configuration
- **[LCARdS Button Card](../cards/button-card.md)** - Button card documentation
- **[LCARdS Chart Card](../cards/chart-card.md)** - Chart card documentation

---

*Last Updated: January 11, 2026*
*Schema Version: 1.22+*
*Programmatic Schema: `src/core/validation-service/schemas/controlOverlay.js`*
