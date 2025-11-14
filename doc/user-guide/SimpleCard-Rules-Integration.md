# SimpleCard Rules Integration Guide

**Version:** v1.9.46+
**Status:** Production Ready
**Last Updated:** 2024

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [API Reference](#api-reference)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Migration Guide](#migration-guide)

---

## Overview

### What is SimpleCard Rules Integration?

SimpleCard Rules Integration allows **RulesEngine** to dynamically style SimpleCard overlays (buttons, lozenges, etc.) based on entity states, conditions, and priorities. This enables:

- **Dynamic Styling**: Change button colors, opacity, and other CSS properties based on entity states
- **Cross-Card Targeting**: Target groups of cards with tags (e.g., all buttons, all lozenges)
- **Priority Control**: Higher priority rules override lower priority ones
- **Stop Semantics**: Prevent lower priority rules from applying with `stop_after`
- **Efficiency**: Rules only evaluate when referenced entities change

### Key Features

✅ **Tag-Based Targeting**: Target all buttons with `tag:button`, all lozenges with `tag:lozenge`
✅ **Direct ID Targeting**: Target specific card instances with `cardGuid_overlayId`
✅ **Entity Conditions**: JavaScript templates `[[[...]]]` and Jinja2 `{{ ... }}`
✅ **Rule Priority**: Higher priority rules override lower priority ones
✅ **Stop Semantics**: `stop_after: true` prevents lower priority rules
✅ **Efficient Callbacks**: Only evaluates when entities change
✅ **MSD Compatible**: Works alongside MSD rules without conflicts

---

## Quick Start

### Rules Placement

Rules for SimpleCards are defined **directly in the card config** using the `rules` key. They are automatically loaded into the global RulesEngine when the card initializes.

```yaml
type: custom:lcards-simple-button
# ... card config ...
rules:  # Define rules here
  - id: my_rule
    when: # ...
    apply: # ...
```

### Basic Example: Change Button Color

```yaml
type: custom:lcards-simple-button
id: bedroom_light  # User-friendly ID for rule targeting
entity: light.bedroom
label: "Bedroom Light"
preset: lozenge
tap_action:
  action: toggle
rules:  # Rules defined in card config
  - id: bedroom_light_on
    when:
      any:
        - entity: light.bedroom
          state: "on"
    apply:
      overlays:
        bedroom_light_button:  # Predictable overlay ID: {id}_button
          style:
            color: "#00ff00"  # Green when on
            opacity: 1
```

**Result**: When `light.bedroom` turns on, the button turns green.

**Note**: Rules are defined directly in the card config and automatically loaded into the global RulesEngine.

### Tag-Based Example: Alert All Buttons

```yaml
rules:
  - id: temperature_alert
    when:
      any:
        - entity: sensor.temperature
          state:
            above: 25
    apply:
      overlays:
        tag:button:  # ALL buttons with 'button' tag
          style:
            color: "#ff0000"  # Red alert
            opacity: 0.9
```

**Result**: When temperature exceeds 25°C, ALL buttons in your dashboard turn red.

---

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        RulesEngine                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ - Evaluate rules when entities change                  │ │
│  │ - Resolve overlay selectors (tags, IDs, patterns)      │ │
│  │ - Invoke callbacks with style patches                  │ │
│  │ - Efficiency check: skip if no dirty rules            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   CoreSystemsManager                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Overlay Registry (_overlayRegistry Map)                │ │
│  │ - registerOverlay(id, tags)                            │ │
│  │ - getAllTargetableOverlays() → [overlays]             │ │
│  │ - getOverlaysByTag(tag) → [overlays]                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    LCARdSSimpleCard                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Base Class Infrastructure:                             │ │
│  │ - _registerOverlayForRules(id, tags)                  │ │
│  │ - _getMergedStyleWithRules(style) → mergedStyle       │ │
│  │ - _applyRulePatches(patches) → requestUpdate()        │ │
│  │ - _unregisterOverlayFromRules()                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              LCARdSSimpleButtonCard (Example)               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Concrete Implementation:                               │ │
│  │ - Register overlay on first update                     │ │
│  │ - Merge rule styles in _resolveButtonStyleSync()      │ │
│  │ - Tags: ['button', preset, 'entity-based']            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Entity Change** → `RulesEngine.ingestHass(hass)`
2. **Mark Dirty** → `markAllDirty()` sets dirty flags on rules
3. **Efficiency Check** → If `dirtyRules.size > 0`, invoke callbacks
4. **Evaluate** → Each callback evaluates its relevant rules
5. **Generate Patches** → Rules create overlay style patches
6. **Apply Patches** → `_applyRulePatches()` merges patches and triggers Lit update
7. **Render** → Lit re-renders only changed properties

### Style Merge Order (Priority)

```
Config Style
    ↓
Preset Style  (overrides Config)
    ↓
Theme Style   (overrides Preset)
    ↓
State Style   (overrides Theme)
    ↓
RULES STYLE   (HIGHEST PRIORITY - overrides everything)
```

**Key Point**: Rules have the **highest priority** in the style cascade. This ensures dynamic styling based on state always wins.

---

## API Reference

### Base Class Methods (LCARdSSimpleCard)

#### `_registerOverlayForRules(overlayId, tags)`

Register an overlay with the RulesEngine for dynamic styling.

**Parameters:**
- `overlayId` (String): Local overlay ID (e.g., `'button'`, `'lozenge'`)
- `tags` (Array<String>): Tags for group targeting (e.g., `['button', 'lozenge']`)

**Returns:** `void`

**Example:**
```javascript
// In LCARdSSimpleButtonCard
_handleFirstUpdate() {
  const overlayId = 'button';
  const tags = ['button', this._preset, 'entity-based'];
  this._registerOverlayForRules(overlayId, tags);
}
```

**Behavior:**
1. Generates global overlay ID: `${this._cardGuid}_${overlayId}`
2. Registers with CoreSystemsManager overlay registry
3. Creates RulesEngine callback for this overlay
4. Logs registration to console (debug mode)

---

#### `_getMergedStyleWithRules(configStyle)`

Merge config style with rule-generated patches.

**Parameters:**
- `configStyle` (Object): Base style from config/preset/theme/state

**Returns:** `Object` - Merged style with rule patches applied

**Example:**
```javascript
_resolveButtonStyleSync() {
  let resolvedStyle = { ...configStyle, ...presetStyle, ...themeStyle };

  // Apply rules (highest priority)
  resolvedStyle = this._getMergedStyleWithRules(resolvedStyle);

  return resolvedStyle;
}
```

**Behavior:**
1. Checks if `_lastRulePatches` exists (from callback)
2. Merges patches with config style (patches win)
3. Returns merged style object
4. Does NOT trigger updates (caller handles that)

---

#### `_applyRulePatches(overlayPatches)`

Apply rule patches and trigger Lit update.

**Parameters:**
- `overlayPatches` (Object): Overlay ID → style patches map

**Returns:** `void`

**Example:**
```javascript
// Called by RulesEngine callback
_applyRulePatches(overlayPatches) {
  const myOverlayId = `${this._cardGuid}_button`;
  const patches = overlayPatches[myOverlayId];

  if (patches) {
    this._lastRulePatches = patches;
    this.requestUpdate();  // Efficient Lit update
  }
}
```

**Behavior:**
1. Extracts patches for this card's overlay
2. Stores in `_lastRulePatches` state property
3. Calls `this.requestUpdate()` (Lit handles diffing)
4. Logs patch application (debug mode)

---

#### `_unregisterOverlayFromRules()`

Unregister overlay from RulesEngine on disconnect.

**Returns:** `void`

**Example:**
```javascript
_onDisconnected() {
  this._unregisterOverlayFromRules();
  super._onDisconnected();
}
```

**Behavior:**
1. Unregisters callback from RulesEngine
2. Removes overlay from CoreSystemsManager registry
3. Clears `_rulesCallbackIndex` state
4. Prevents memory leaks

---

### Overlay Selectors

#### Tag Selector: `tag:tagName`

Targets all overlays with the specified tag.

**Example:**
```yaml
overlays:
  tag:button:  # All overlays with 'button' tag
    style:
      color: "#ff0000"
```

**Use Cases:**
- Alert all buttons
- Highlight all lozenges
- Style all entity-based overlays

---

#### Direct ID Selector: `cardGuid_overlayId`

Targets a specific overlay instance using a predictable ID.

**Best Practice - Use Custom ID:**
```yaml
type: custom:lcards-simple-button
id: bedroom_light  # Custom ID for easy targeting
entity: light.bedroom

rules:
  - id: light_on
    apply:
      overlays:
        bedroom_light_button:  # Format: {id}_button
          style:
            color: "#00ff00"
```

**Finding Auto-Generated GUID (if no custom ID):**
1. Open browser console (F12)
2. Look for: `[LCARdSSimpleCard] Registered overlay for rules: lcards-XXXXX_button`
3. Use `lcards-XXXXX_button` in your rule

**Recommendation:** Always use `id` config parameter for predictable, readable overlay IDs.

---

#### Pattern Selector: `pattern:regex`

Targets overlays matching a regex pattern.

**Example:**
```yaml
overlays:
  pattern:.*bedroom.*:  # All overlays with 'bedroom' in ID
    style:
      color: "#0066ff"
```

**Use Cases:**
- Target all cards in a room
- Group cards by naming convention
- Dynamic room-based styling

---

#### All Selector: `all`

Targets ALL registered overlays.

**Example:**
```yaml
overlays:
  all:  # Every overlay in the system
    style:
      opacity: 0.5
```

**Warning:** Use sparingly - affects ALL overlays including MSD!

---

## Usage Examples

### Example 1: Light On/Off

```yaml
type: custom:lcards-simple-button
id: living_room_light  # Custom ID for easy targeting
entity: light.living_room
label: "Living Room"
preset: lozenge

rules:
  - id: light_on
    when:
      any:
        - entity: light.living_room
          state: "on"
    apply:
      overlays:
        living_room_light_button:  # Target this specific button
          style:
            color: "#ffaa00"  # Orange when on
            opacity: 1
```

---

### Example 2: Temperature Alert

```yaml
rules:
  - id: temp_high
    priority: 100
    when:
      any:
        - entity: sensor.temperature
          state:
            above: 25
    apply:
      overlays:
        tag:button:  # ALL buttons
          style:
            color: "#ff0000"  # Red alert
            opacity: 0.9
```

---

### Example 3: Climate Mode

```yaml
type: custom:lcards-simple-button
id: bedroom_climate
entity: climate.bedroom
label: "Climate"

rules:
  - id: heating
    when:
      any:
        - condition: '[[[return states["climate.bedroom"].state === "heat"]]]'
    apply:
      overlays:
        bedroom_climate_button:  # Target this specific button
          style:
            color: "#ff6600"  # Orange heating

  - id: cooling
    when:
      any:
        - condition: '[[[return states["climate.bedroom"].state === "cool"]]]'
    apply:
      overlays:
        bedroom_climate_button:
          style:
            color: "#0066ff"  # Blue cooling
```

---

### Example 4: Priority Override

```yaml
rules:
  # Low priority
  - id: default_style
    priority: 10
    when:
      any:
        - entity: switch.test
          state: "on"
    apply:
      overlays:
        tag:button:
          style:
            color: "#00ff00"  # Green default

  # High priority - WINS
  - id: critical_override
    priority: 100
    when:
      any:
        - entity: binary_sensor.alert
          state: "on"
    apply:
      overlays:
        tag:button:
          style:
            color: "#ff0000"  # Red critical (overrides green)
```

---

### Example 5: Stop Semantics

```yaml
rules:
  - id: critical_alert
    priority: 100
    stop_after: true  # Prevents lower priority rules
    when:
      any:
        - entity: binary_sensor.critical
          state: "on"
    apply:
      overlays:
        tag:button:
          style:
            color: "#ff0000"

  # This rule WON'T apply due to stop_after above
  - id: normal_style
    priority: 50
    when:
      any:
        - entity: binary_sensor.critical
          state: "on"
    apply:
      overlays:
        tag:button:
          style:
            color: "#00ff00"  # Won't show
```

---

## Best Practices

### ✅ DO

1. **Use Tags for Group Targeting**
   ```yaml
   # Good - targets all buttons
   overlays:
     tag:button:
       style:
         color: "#ff0000"
   ```

2. **Use Priority for Overrides**
   ```yaml
   # Critical alerts should have high priority
   - id: critical
     priority: 100
     stop_after: true
   ```

3. **Log Registration for Debugging**
   ```javascript
   // Check console for:
   // "[LCARdSSimpleCard] Registered overlay for rules: lcards-abc123_button"
   ```

4. **Test Efficiency Check**
   ```yaml
   # Create buttons with NO rules
   # Check console for:
   # "[RulesEngine] No dirty rules, skipping callback invocation"
   ```

5. **Use `requestUpdate()` for Efficiency**
   ```javascript
   // Lit's diffing algorithm only updates changed DOM
   this.requestUpdate();
   ```

---

### ❌ DON'T

1. **Don't Use `all` Selector Unless Necessary**
   ```yaml
   # Bad - affects EVERYTHING including MSD
   overlays:
     all:
       style:
         opacity: 0.5
   ```

2. **Don't Forget to Unregister**
   ```javascript
   // Bad - memory leak
   _onDisconnected() {
     // Missing: this._unregisterOverlayFromRules();
     super._onDisconnected();
   }
   ```

3. **Don't Call `evaluateDirty()` in Efficiency Check**
   ```javascript
   // Bad - consumes dirty flags before callbacks run
   if (this.evaluateDirty().hasChanges) {
     callbacks.forEach(cb => cb());
   }

   // Good - just check size
   if (this.dirtyRules.size > 0) {
     callbacks.forEach(cb => cb());
   }
   ```

4. **Don't Manually Trigger Updates**
   ```javascript
   // Bad - forces full re-render
   this.performUpdate();

   // Good - Lit's efficient diffing
   this.requestUpdate();
   ```

---

## Troubleshooting

### Issue: Rules Not Applying

**Symptoms:**
- Button doesn't change color
- Console shows no errors

**Diagnosis:**
1. Check console for registration:
   ```
   [LCARdSSimpleCard] Registered overlay for rules: lcards-abc123_button
   ```
2. Verify rule targets correct overlay ID or tag
3. Check entity ID in `when` condition

**Solution:**
```yaml
# Verify overlay selector matches registration
rules:
  - id: test
    when:
      any:
        - entity: light.bedroom  # Correct entity ID?
          state: "on"
    apply:
      overlays:
        tag:button:  # Matches registration tag?
          style:
            color: "#ff0000"
```

---

### Issue: MSD Rules Stopped Working

**Symptoms:**
- MSD rules don't evaluate
- Console shows `patchCount: 0`

**Root Cause:**
Efficiency check calls `evaluateDirty()` which clears dirty flags before callbacks run.

**Solution:**
```javascript
// src/core/rules/RulesEngine.js
ingestHass(hass) {
  this.markAllDirty();

  // CORRECT - just check size
  if (this.dirtyRules.size > 0) {
    this._invokeCallbacks();
  }

  // WRONG - evaluates and clears flags
  // const results = await this.evaluateDirty();
  // if (results.hasChanges) this._invokeCallbacks();
}
```

---

### Issue: Performance Degradation

**Symptoms:**
- Dashboard sluggish
- Lots of console logging

**Diagnosis:**
1. Check for efficiency check logs:
   ```
   [RulesEngine] No dirty rules, skipping callback invocation
   ```
2. Verify callbacks only run when entities change
3. Check for excessive rule evaluations

**Solution:**
1. **Limit Rules**: Only create rules for overlays that need dynamic styling
2. **Use Tags Wisely**: Avoid `all` selector
3. **Test Efficiency**: Create buttons with no rules, verify callbacks skip

---

### Issue: Wrong Style Applied

**Symptoms:**
- Button shows unexpected color
- Multiple rules conflict

**Root Cause:**
Priority or stop semantics misconfigured.

**Solution:**
```yaml
rules:
  # Higher priority wins
  - id: critical
    priority: 100  # Ensure high enough
    stop_after: true  # Prevent lower priority rules
    when:
      any:
        - entity: binary_sensor.alert
          state: "on"
    apply:
      overlays:
        tag:button:
          style:
            color: "#ff0000"  # This should win
```

---

## Migration Guide

### Migrating SimpleCard Subclasses

If you have custom SimpleCard subclasses, follow these steps to add rules support:

#### Step 1: Register Overlay

```javascript
_handleFirstUpdate() {
  // Determine overlay ID and tags
  const overlayId = 'my-overlay';
  const tags = ['my-card-type', this._preset];

  // Register with rules engine
  this._registerOverlayForRules(overlayId, tags);

  super._handleFirstUpdate();
}
```

#### Step 2: Merge Styles

```javascript
_resolveMyCardStyle() {
  // Build base style
  let style = {
    ...this._configStyle,
    ...this._presetStyle,
    ...this._themeStyle,
    ...this._stateStyle
  };

  // Apply rules (highest priority)
  style = this._getMergedStyleWithRules(style);

  return style;
}
```

#### Step 3: Cleanup

```javascript
_onDisconnected() {
  this._unregisterOverlayFromRules();
  super._onDisconnected();
}
```

---

### Example: Migrating LCARdSSimpleLozengeCard

**Before (No Rules):**
```javascript
class LCARdSSimpleLozengeCard extends LCARdSSimpleCard {
  _resolveLozengeStyle() {
    return {
      ...this._configStyle,
      ...this._presetStyle
    };
  }
}
```

**After (With Rules):**
```javascript
class LCARdSSimpleLozengeCard extends LCARdSSimpleCard {
  _handleFirstUpdate() {
    // Register overlay
    const tags = ['lozenge', this._preset, 'entity-based'];
    this._registerOverlayForRules('lozenge', tags);

    super._handleFirstUpdate();
  }

  _resolveLozengeStyle() {
    let style = {
      ...this._configStyle,
      ...this._presetStyle
    };

    // Merge rules
    style = this._getMergedStyleWithRules(style);

    return style;
  }

  _onDisconnected() {
    this._unregisterOverlayFromRules();
    super._onDisconnected();
  }
}
```

---

## Advanced Topics

### Custom Overlay Tags

You can create custom tags for specialized targeting:

```javascript
_handleFirstUpdate() {
  const tags = [
    'button',
    this._preset,
    'entity-based',
    `room-${this._config.room}`,  // Custom room tag
    `floor-${this._config.floor}`  // Custom floor tag
  ];

  this._registerOverlayForRules('button', tags);
}
```

Then target by custom tags:

```yaml
rules:
  - id: bedroom_alert
    when:
      any:
        - entity: sensor.bedroom_motion
          state: "on"
    apply:
      overlays:
        tag:room-bedroom:  # All cards in bedroom
          style:
            color: "#ff6600"
```

---

### Dynamic Tag Updates

**Warning:** Tags are set at registration and **cannot be changed**. If you need dynamic tags, unregister and re-register:

```javascript
_updateTags(newTags) {
  // Unregister old
  this._unregisterOverlayFromRules();

  // Re-register with new tags
  this._registerOverlayForRules(this._overlayId, newTags);
}
```

**Performance Note:** Re-registration is expensive. Prefer static tags.

---

## Appendix

### Style Properties

Rules can modify any CSS property supported by the overlay:

```yaml
style:
  color: "#ff0000"
  opacity: 0.9
  background: "rgba(255,0,0,0.2)"
  border: "2px solid #ff0000"
  transform: "scale(1.1)"
  filter: "brightness(1.2)"
  # ... any CSS property
```

---

### Condition Types Reference

#### Entity Condition
```yaml
when:
  any:
    - entity: light.bedroom
      state: "on"
```

#### Entity with Attribute
```yaml
when:
  any:
    - entity: light.bedroom
      state:
        attribute: brightness
        above: 200
```

#### JavaScript Template
```yaml
when:
  any:
    - condition: '[[[return states["light.bedroom"].state === "on"]]]'
```

#### Jinja2 Template
```yaml
when:
  any:
    - condition: "{{ states('light.bedroom') == 'on' }}"
```

---

### Console Logging Reference

**Registration:**
```
[LCARdSSimpleCard] Registered overlay for rules: lcards-abc123_button with tags: button,lozenge,entity-based
```

**Efficiency Check (Skip):**
```
[RulesEngine] No dirty rules, skipping callback invocation
```

**Efficiency Check (Invoke):**
```
[RulesEngine] Dirty rules detected, invoking callbacks
```

**Patch Application:**
```
[LCARdSSimpleCard] Applying rule patches to overlay: button
```

---

## Summary

SimpleCard Rules Integration enables dynamic, state-driven styling of SimpleCard overlays through the RulesEngine. Key features:

✅ Tag-based and direct ID targeting
✅ Entity conditions (JS + Jinja2)
✅ Priority control and stop semantics
✅ Efficient evaluation (only when entities change)
✅ MSD compatible

**Next Steps:**
1. Review test file: `test/test-simple-button-rules.html`
2. Copy YAML examples: `test/test-simple-button-rules-config.yaml`
3. Deploy to your HA instance
4. Check browser console for registration logs
5. Test with your entities

**Questions?** Check troubleshooting section or review implementation proposal.

---

**Document Version:** 1.0
**LCARdS Version:** v1.9.46+
**Author:** LCARdS Development Team
**Last Updated:** 2024
