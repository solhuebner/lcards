# Unified Action System Documentation

**Version:** 2.0 (MSD + V2 Cards)
**Date:** November 8, 2025
**Status:** ✅ Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Action Flow](#action-flow)
4. [Supported Actions](#supported-actions)
5. [Configuration Examples](#configuration-examples)
6. [Entity Enrichment](#entity-enrichment)
7. [Error Handling](#error-handling)
8. [Debugging](#debugging)

---

## Overview

The LCARdS Unified Action System provides consistent action handling across all components - both MSD overlays and V2 cards. This ensures users have the same experience regardless of which component they're interacting with.

### **Key Features:**

✅ **Universal Interface** - Same action system used by MSD overlays and V2 cards
✅ **Entity Enrichment** - Automatic entity binding for toggle actions
✅ **Error Resilience** - Graceful fallbacks for missing configurations
✅ **Memory Safe** - Proper cleanup prevents memory leaks
✅ **Home Assistant Native** - Full integration with HA's action system

---

## Architecture

### **Component Hierarchy**

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interaction                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
    ┌────▼────┐              ┌─────▼─────┐
    │MSD      │              │V2 Cards   │
    │Overlays │              │           │
    └────┬────┘              └─────┬─────┘
         │                         │
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │   ActionHelpers         │
         │   (Primary Interface)   │
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │  LCARdSActionHandler    │
         │  (Execution Engine)     │
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │    Home Assistant       │
         │    (hass.callService)   │
         └─────────────────────────┘
```

### **System Components**

1. **ActionHelpers** - Primary interface used by both MSD and V2 cards
2. **LCARdSActionHandler** - Execution engine that handles the actual Home Assistant calls
3. **Entity Enrichment** - Automatic entity binding for incomplete action configs
4. **Cleanup Management** - Memory leak prevention

---

## Action Flow

### **V2 Cards Action Flow**

```javascript
// 1. Card Setup (in V2 card)
_setupActionListeners() {
  const actions = {
    tap_action: this.config.tap_action || { action: 'toggle' },
    hold_action: this.config.hold_action,
    double_tap_action: this.config.double_tap_action
  };

  // 2. Use base class universal setup
  this._actionCleanup = this.setupActions(element, actions);
}

// 3. Base class processing (LCARdSV2Card)
setupActions(element, actions) {
  const tapHandler = (event) => {
    const enrichedAction = enrichAction(actions.tap_action);
    // 4. Delegate to ActionHelpers
    ActionHelpers.executeAction(enrichedAction, this, 'tap', element);
  };
  element.addEventListener('click', tapHandler);
}

// 5. ActionHelpers processing
ActionHelpers.executeAction(actionConfig, card, actionType, element) {
  // Entity enrichment and validation
  // 6. Delegate to execution engine
  LCARdSActionHandler.handleAction(element, card.hass, actionConfig, actionType);
}

// 7. Execution engine calls Home Assistant
LCARdSActionHandler.handleAction(element, hass, actionConfig, actionName) {
  // Calls hass.callService(), hass.navigate(), etc.
}
```

### **MSD Overlays Action Flow**

```javascript
// MSD overlays follow the same flow from step 4 onwards
// They call ActionHelpers.executeAction() directly
ActionHelpers.executeAction(actionConfig, overlay, actionType, element);
```

---

## Supported Actions

### **Core Actions**

| Action | Description | Example |
|--------|-------------|---------|
| `toggle` | Toggle entity state | `{ action: 'toggle' }` |
| `turn_on` | Turn entity on | `{ action: 'turn_on' }` |
| `turn_off` | Turn entity off | `{ action: 'turn_off' }` |
| `call-service` | Call any HA service | `{ action: 'call-service', service: 'light.turn_on' }` |
| `more-info` | Show entity dialog | `{ action: 'more-info' }` |
| `navigate` | Navigate to view | `{ action: 'navigate', navigation_path: '/lovelace/lights' }` |
| `url` | Open URL | `{ action: 'url', url_path: 'https://example.com' }` |
| `fire-dom-event` | Fire DOM event | `{ action: 'fire-dom-event', event_type: 'my-event' }` |

### **Action Parameters**

#### **call-service**
```yaml
action: call-service
service: light.turn_on
service_data:
  brightness: 255
  color_name: red
target:
  entity_id: light.bedroom
```

#### **navigate**
```yaml
action: navigate
navigation_path: /lovelace/lighting
navigation_replace: false  # Optional
```

#### **url**
```yaml
action: url
url_path: https://home-assistant.io
```

#### **fire-dom-event**
```yaml
action: fire-dom-event
event_type: show-more-info
event_data:
  entity_id: light.bedroom
```

---

## Configuration Examples

### **Basic Button Actions**

```yaml
type: custom:lcards-v2-button
entity: light.bedroom
text: "Bedroom Light"

# Simple toggle (default)
tap_action:
  action: toggle

# Turn on with brightness
hold_action:
  action: call-service
  service: light.turn_on
  service_data:
    brightness: 255

# Show more info
double_tap_action:
  action: more-info
```

### **Advanced Service Calls**

```yaml
# Climate control
tap_action:
  action: call-service
  service: climate.set_temperature
  target:
    entity_id: climate.bedroom
  service_data:
    temperature: 22

# Scene activation
hold_action:
  action: call-service
  service: scene.turn_on
  target:
    entity_id: scene.movie_night

# Script with data
double_tap_action:
  action: call-service
  service: script.notify_phone
  service_data:
    message: "Button pressed!"
    title: "LCARdS Alert"
```

### **Navigation Actions**

```yaml
# Navigate to dashboard
tap_action:
  action: navigate
  navigation_path: /lovelace/lighting

# Navigate with replacement (no back button)
hold_action:
  action: navigate
  navigation_path: /lovelace/security
  navigation_replace: true
```

### **Conditional Actions**

```yaml
# Use templates in actions (if supported)
tap_action:
  action: call-service
  service: >-
    {% if is_state('light.bedroom', 'on') %}
      light.turn_off
    {% else %}
      light.turn_on
    {% endif %}
  target:
    entity_id: light.bedroom
```

---

## Entity Enrichment

The action system automatically enriches action configurations with entity information when missing:

### **How It Works**

```javascript
// If action config is missing entity...
const actionConfig = { action: 'toggle' };  // No entity specified

// And card has an entity...
const cardConfig = { entity: 'light.bedroom' };

// System automatically enriches:
const enrichedAction = {
  action: 'toggle',
  entity: 'light.bedroom'  // ← Automatically added
};
```

### **Enrichment Rules**

1. **Entity Missing + Card Has Entity** → Entity is added automatically
2. **Entity Present** → No modification (explicit takes precedence)
3. **No Entity Available** → Action may fail (depends on action type)

### **Example Scenarios**

```yaml
# Card configuration
entity: light.bedroom

# Action with auto-enrichment
tap_action:
  action: toggle  # ← Will target light.bedroom automatically

# Action with explicit entity (no enrichment)
hold_action:
  action: toggle
  entity: light.living_room  # ← Uses explicit entity

# Service call with target (no enrichment needed)
double_tap_action:
  action: call-service
  service: homeassistant.restart  # ← No entity needed
```

---

## Error Handling

The action system includes comprehensive error handling:

### **Fallback Mechanisms**

1. **Missing Action Handler**
   ```javascript
   // If ActionHelpers isn't available, V2 cards fall back to basic toggle
   if (!this.systemsManager?.actionHandler) {
     lcardsLog.warn('Action handler not available - falling back to basic toggle');
     if (actionConfig.action === 'toggle' && this.hass && this.config.entity) {
       this.hass.callService('homeassistant', 'toggle', {
         entity_id: this.config.entity
       });
     }
     return;
   }
   ```

2. **Invalid Service Calls**
   ```javascript
   // ActionHandler validates service format
   if (!service || !service.includes('.')) {
     lcardsLog.error('Invalid service format:', service);
     return;
   }
   ```

3. **Missing Entities**
   ```javascript
   // System warns about missing entities for entity-dependent actions
   if (['toggle', 'turn_on', 'turn_off'].includes(action) && !entity) {
     lcardsLog.warn('Entity required for action but not provided');
   }
   ```

### **Error Logging**

All action errors are logged appropriately:

```javascript
lcardsLog.debug('Action executed successfully');  // Success
lcardsLog.warn('Action fallback used');          // Recoverable issue
lcardsLog.error('Action execution failed');      // Critical failure
```

---

## Debugging

### **Action Debug Information**

Enable action debugging by checking console logs:

```javascript
// In browser console
window.lcards.debug.msd.actions.list();  // List all action handlers

// Check action system status
window.lcards.core.status();  // Core systems status
```

### **Common Debug Scenarios**

1. **Actions Not Working**
   - Check if element has event listeners: `getEventListeners($0)`
   - Verify action configuration format
   - Check entity exists in Home Assistant

2. **Action Handler Not Ready**
   ```
   LCARdS|warn [V2Card] Action handler not available - falling back
   ```
   - Check if singletons are initialized
   - Verify timing of action setup (use `requestAnimationFrame`)

3. **Entity Enrichment Issues**
   ```
   LCARdS|debug [ActionHelpers] Entity enrichment: light.bedroom → toggle
   ```
   - Check if card has `entity` configured
   - Verify entity exists in `this.hass.states`

### **Action Flow Tracing**

Enable detailed action tracing:

```javascript
// Set log level to trace for detailed action flow
window.lcards.logging.setLevel('trace');

// Actions will now show detailed execution steps:
// LCARdS|trace [V2Card] Setting up tap action for light.bedroom
// LCARdS|trace [ActionHelpers] Enriching action: toggle → light.bedroom
// LCARdS|trace [ActionHandler] Executing toggle for light.bedroom
```

---

## Best Practices

### **1. Always Use Base Class Actions**

✅ **Correct:**
```javascript
// Use universal base class method
this._actionCleanup = this.setupActions(element, actions);
```

❌ **Incorrect:**
```javascript
// Don't implement custom action handling
element.addEventListener('click', () => {
  this.hass.callService('homeassistant', 'toggle', {...});
});
```

### **2. Proper Cleanup**

✅ **Always clean up:**
```javascript
disconnectedCallback() {
  if (this._actionCleanup) {
    this._actionCleanup();
    this._actionCleanup = null;
  }
  super.disconnectedCallback();
}
```

### **3. Entity Configuration**

✅ **Provide entity for toggle actions:**
```yaml
entity: light.bedroom  # Enables automatic entity enrichment
tap_action:
  action: toggle  # Will use light.bedroom automatically
```

### **4. Error Resilience**

✅ **Handle missing configurations gracefully:**
```javascript
const actions = {
  tap_action: this.config.tap_action || { action: 'toggle' },
  hold_action: this.config.hold_action || null,  // null = no action
  double_tap_action: this.config.double_tap_action || null
};

// Filter out null actions
Object.keys(actions).forEach(key => {
  if (!actions[key]) {
    delete actions[key];
  }
});
```

---

## Conclusion

The Unified Action System provides a robust, consistent foundation for all user interactions in LCARdS. By using the same proven system across MSD overlays and V2 cards, users get a consistent experience while developers benefit from simplified implementation and maintenance.

Key advantages:
- **Consistency** - Same actions work the same everywhere
- **Reliability** - Proven system used by MSD overlays
- **Simplicity** - One method call sets up all actions
- **Flexibility** - Supports all Home Assistant action types
- **Safety** - Automatic cleanup prevents memory leaks

For implementation examples, see the [V2 Cards Architecture Guide](V2_CARDS_ARCHITECTURE.md) and existing card implementations in `/src/cards/`.