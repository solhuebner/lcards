# Unified Action System Architecture

**Version:** 3.0
**Date:** November 11, 2025
**Status:** ✅ Production Ready
**Scope:** All LCARdS Cards (MSD + V2/Simple Cards)

---

## Overview

The Unified Action System provides a single, consistent implementation for all user interactions with Home Assistant entities across all LCARdS card types. This architecture eliminates code duplication and ensures identical behavior whether users interact with MSD overlays or Simple/V2 cards.

### Key Principle

**One Handler, All Cards**
All cards delegate to `LCARdSActionHandler.setupActions()` for event handling, action execution, and entity resolution.

---

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    LCARdSActionHandler                       │
│                  (Singleton - Base Layer)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  setupActions(element, options)                             │
│    ├─ Event handling (tap, hold, double-tap, hover, leave) │
│    ├─ TriggerManager integration (animations)              │
│    ├─ Late-binding support (AnimationManager)              │
│    ├─ Shadow DOM aware                                      │
│    └─ Returns cleanup function                             │
│                                                              │
│  _executeAction(actionConfig, hass, element, defaultEntity) │
│    ├─ Entity resolution (3-tier precedence)                │
│    ├─ Action type routing                                   │
│    └─ Error handling                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          ▲           ▲
                          │           │
          ┌───────────────┘           └──────────────────┐
          │                                              │
┌─────────┴──────────┐                    ┌─────────────┴────────────┐
│   SimpleCard       │                    │   MSD ActionHelpers      │
│  (Thin Wrapper)    │                    │  (Cell Filter Wrapper)   │
├────────────────────┤                    ├──────────────────────────┤
│                    │                    │                          │
│ setupActions() {   │                    │ setupActions() {         │
│   this._action     │                    │   // Filter cell events  │
│     Handler        │                    │   isCellWithActions()    │
│     .setupActions( │                    │                          │
│       element,     │                    │   // Delegate rest       │
│       {            │                    │   _actionHandler         │
│         actions,   │                    │     .setupActions(...)   │
│         entity,    │                    │ }                        │
│         ...        │                    │                          │
│       }            │                    │ * Needed for StatusGrid  │
│     );             │                    │ * Can remove when        │
│ }                  │                    │   StatusGrid retired     │
│                    │                    │                          │
└────────────────────┘                    └──────────────────────────┘
```

### Component Responsibilities

#### **LCARdSActionHandler** (Primary Interface)
- **Location:** `src/base/LCARdSActionHandler.js`
- **Type:** Singleton instance
- **Responsibilities:**
  - Event handling for all interaction types
  - Entity resolution with 3-tier precedence
  - Action execution (toggle, more-info, call-service, etc.)
  - Animation trigger integration via TriggerManager
  - Late-binding support for AnimationManager
  - Shadow DOM aware event handling
  - Cleanup management

#### **LCARdSSimpleCard** (Thin Wrapper)
- **Location:** `src/base/LCARdSSimpleCard.js`
- **Type:** Base class for Simple/V2 cards
- **Responsibilities:**
  - Create `_actionHandler` instance in constructor
  - Call `setupActions()` with card context (entity, animations, shadowRoot)
  - Provide `_getAnimationSetup()` hook for subclasses
  - Store cleanup function and call on disconnect
  - **~40 lines** (was 280 lines of duplicate code)

#### **MSD ActionHelpers** (Cell Filter Wrapper)
- **Location:** `src/msd/renderer/ActionHelpers.js`
- **Type:** Static utility module
- **Responsibilities:**
  - Filter events for StatusGrid cells (`data-has-cell-actions="true"`)
  - Delegate to unified handler for actual action handling
  - Use static `_actionHandler` instance
  - **~80 lines** (was 150 lines of duplicate event handling)
  - **Note:** Cell filtering needed only for legacy StatusGrid, can be simplified when retired

---

## Action Flow

### Simple Card Action Flow

```javascript
// 1. User taps button
User clicks element
    ↓
// 2. Browser event
Browser fires 'click' event
    ↓
// 3. Event handler (set up by setupActions)
LCARdSActionHandler internal handler
    ↓
// 4. Entity resolution
_executeAction(actionConfig, hass, element, card.config.entity)
    ├─ Check actionConfig.entity (explicit)
    ├─ Check defaultEntity parameter (card's entity)
    └─ Check element.dataset.entity (fallback)
    ↓
// 5. Action routing
switch (actionConfig.action) {
  case 'toggle': _handleToggle(entity, hass)
  case 'more-info': _handleMoreInfo(entity, hass)
  case 'call-service': _handleCallService(actionConfig, hass)
  case 'navigate': _handleNavigate(actionConfig, hass)
  case 'url': _handleUrl(actionConfig)
}
    ↓
// 6. Home Assistant call
hass.callService('homeassistant', 'toggle', { entity_id: 'light.bedroom' })
```

### MSD Action Flow

```javascript
// 1. User taps overlay button
User clicks element in MSD overlay
    ↓
// 2. Capture phase filter (ActionHelpers)
Cell filter checks data-has-cell-actions="true"
    ├─ If cell: Stop propagation (prevent overlay click)
    └─ If not cell: Continue
    ↓
// 3. Delegate to unified handler
LCARdSActionHandler.setupActions() (same as Simple Card)
    ↓
// 4-6. Same as Simple Card flow above
```

---

## API Reference

### Primary API: `setupActions(element, options)`

**Description:** Sets up all action handlers on an element with animation integration and entity context.

**Parameters:**
```javascript
{
  element: HTMLElement,           // Target element for actions
  options: {
    actions: {                    // Action configurations
      tap_action: ActionConfig,
      hold_action: ActionConfig,
      double_tap_action: ActionConfig
    },
    animations: Object,           // Animation configurations
    entity: string,               // Default entity for actions (e.g., 'light.bedroom')
    shadowRoot: ShadowRoot,       // For shadow DOM event handling
    getAnimationSetup: Function   // Callback for animation setup (optional)
  }
}
```

**Returns:** `Function` - Cleanup function to remove all event listeners

**Example (Simple Card):**
```javascript
// In LCARdSSimpleCard
setupActions(element, actions) {
  return this._actionHandler.setupActions(element, {
    actions,
    animations: this.config.animations || {},
    entity: this.config.entity,           // Card's entity passed here
    shadowRoot: this.shadowRoot,
    getAnimationSetup: () => this._getAnimationSetup?.(element)
  });
}
```

**Example (MSD):**
```javascript
// In ActionHelpers
export function setupActions(element, overlayConfig, overlay) {
  // Cell filtering for StatusGrid
  const handleCellCapture = (e) => {
    if (isCellWithActions(e.target)) {
      e.stopPropagation();
    }
  };

  // Delegate to unified handler
  const cleanup = _actionHandler.setupActions(element, {
    actions: overlayConfig.actions,
    animations: overlayConfig.animations || {},
    entity: overlayConfig.entity,         // Overlay's entity
    shadowRoot: overlay.shadowRoot
  });

  // Return combined cleanup
  return () => {
    element.removeEventListener('pointerdown', handleCellCapture, true);
    cleanup();
  };
}
```

### Legacy API: `handleAction()` (Preserved)

**Note:** This API is still available for backwards compatibility but new code should use `setupActions()`.

```javascript
LCARdSActionHandler.handleAction(element, hass, actionConfig, actionName)
```

---

## Action Types

### Core Actions

| Action | Description | Required Fields | Example |
|--------|-------------|-----------------|---------|
| `toggle` | Toggle entity state | entity | `{ action: 'toggle' }` |
| `more-info` | Show entity more-info dialog | entity | `{ action: 'more-info' }` |
| `call-service` | Call Home Assistant service | service, service_data | `{ action: 'call-service', service: 'light.turn_on', service_data: { brightness: 255 } }` |
| `navigate` | Navigate to dashboard view | navigation_path | `{ action: 'navigate', navigation_path: '/lovelace/lights' }` |
| `url` | Open URL in new tab | url_path | `{ action: 'url', url_path: 'https://example.com' }` |
| `none` | No action | - | `{ action: 'none' }` |

### Trigger Types

| Trigger | Description | Timing | Platforms |
|---------|-------------|--------|-----------|
| `tap_action` | Single tap/click | Immediate | All |
| `hold_action` | Press and hold | 500ms threshold | All |
| `double_tap_action` | Double tap/click | 300ms window | All |
| `on_hover` | Mouse enter | Immediate | Desktop only (media query) |
| `on_leave` | Mouse leave | Immediate | Desktop only (media query) |

**Note:** `on_hover` and `on_leave` are animation triggers only, not action triggers.

---

## Entity Resolution

The system uses a 3-tier precedence for entity resolution:

### Precedence Order

```javascript
// 1. Explicit entity in action config (highest priority)
{
  action: 'toggle',
  entity: 'light.living_room'  // ← Uses this
}

// 2. Card's default entity (passed via options)
setupActions(element, {
  actions: { tap_action: { action: 'toggle' } },  // No entity specified
  entity: 'light.bedroom'  // ← Uses this
})

// 3. Element data attribute (fallback)
<div data-entity="light.kitchen">  // ← Uses this if no others available
```

### Implementation

```javascript
_executeAction(actionConfig, hass, element, defaultEntity = null) {
  // Entity resolution with 3-tier precedence
  const entity = actionConfig.entity       // 1. Explicit in config
    || defaultEntity                       // 2. Card default
    || element?.dataset?.entity;           // 3. Element data attribute

  // Route to appropriate handler
  switch (actionConfig.action) {
    case 'toggle':
      this._handleToggle(entity, hass);
      break;
    // ... other action types
  }
}
```

### Examples

**Scenario 1: Card entity auto-used**
```yaml
type: custom:lcards-simple-button
entity: light.bedroom          # Card's entity
tap_action:
  action: toggle               # Uses light.bedroom
```

**Scenario 2: Explicit entity overrides**
```yaml
type: custom:lcards-simple-button
entity: light.bedroom          # Card's entity
tap_action:
  action: toggle
  entity: light.living_room    # Uses light.living_room (explicit)
```

**Scenario 3: No entity available**
```yaml
type: custom:lcards-simple-button
# No entity configured
tap_action:
  action: toggle               # Warning logged, action may fail
```

---

## Animation Integration

### TriggerManager Integration

The action handler integrates with the TriggerManager for animation triggers:

```javascript
setupActions(element, options) {
  const { actions, animations, getAnimationSetup } = options;

  // Set up animation triggers via TriggerManager
  if (animations && Object.keys(animations).length > 0) {
    TriggerManager.setupTriggers(element, animations, getAnimationSetup);
  }

  // Set up action handlers (tap, hold, double-tap)
  // ...
}
```

### Late-Binding Pattern

The system supports late-binding for AnimationManager to avoid initialization order issues:

```javascript
const getAnimationSetup = () => this._getAnimationSetup?.(element);

// Later, when animation is triggered
TriggerManager.trigger('hover', element, () => {
  const setup = getAnimationSetup();  // Resolved at trigger time
  // Execute animation
});
```

This pattern ensures AnimationManager is fully initialized before animations execute, even if `setupActions()` is called early in the card lifecycle.

---

## Configuration Examples

### Simple Button with Actions

```yaml
type: custom:lcards-simple-button
entity: light.bedroom
text: "Bedroom Light"

# Single tap: toggle
tap_action:
  action: toggle

# Hold: turn on at full brightness
hold_action:
  action: call-service
  service: light.turn_on
  service_data:
    brightness: 255
    color_name: white

# Double-tap: show more info
double_tap_action:
  action: more-info
```

### MSD Overlay with Actions

```yaml
type: custom:lcards-msd
overlays:
  - type: button
    entity: climate.bedroom
    tap_action:
      action: call-service
      service: climate.set_temperature
      service_data:
        temperature: 22
    hold_action:
      action: more-info
```

### Service Call with Target

```yaml
tap_action:
  action: call-service
  service: scene.turn_on
  target:
    entity_id: scene.movie_night
```

### Navigation Action

```yaml
tap_action:
  action: navigate
  navigation_path: /lovelace/lighting
  navigation_replace: false  # Optional: use history.replace instead of push
```

---

## Code Walkthrough

### SimpleCard Implementation

**File:** `src/base/LCARdSSimpleCard.js`

```javascript
import { LCARdSActionHandler } from './LCARdSActionHandler.js';

export class LCARdSSimpleCard extends LCARdSNativeCard {

  constructor() {
    super();
    // Create handler instance
    this._actionHandler = new LCARdSActionHandler();
  }

  /**
   * Setup actions on an element
   * @param {HTMLElement} element - Target element
   * @param {Object} actions - Action configurations
   * @returns {Function} Cleanup function
   */
  setupActions(element, actions) {
    if (!element || !actions) return () => {};

    // Delegate to unified handler with card context
    return this._actionHandler.setupActions(element, {
      actions,
      animations: this.config.animations || {},
      entity: this.config.entity,              // Pass card's entity
      shadowRoot: this.shadowRoot,
      getAnimationSetup: () => this._getAnimationSetup?.(element)
    });
  }

  /**
   * Hook for subclasses to provide animation setup
   * @param {HTMLElement} element - Target element
   * @returns {Object} Animation setup object
   */
  _getAnimationSetup(element) {
    // Subclasses can override to provide custom animation context
    return null;
  }

  disconnectedCallback() {
    // Cleanup actions
    if (this._actionCleanup) {
      this._actionCleanup();
      this._actionCleanup = null;
    }
    super.disconnectedCallback();
  }
}
```

**Total Lines:** ~40 lines (was 280 lines with manual event handling)

### MSD ActionHelpers Implementation

**File:** `src/msd/renderer/ActionHelpers.js`

```javascript
import { LCARdSActionHandler } from '../../base/LCARdSActionHandler.js';

// Singleton instance for MSD
const _actionHandler = new LCARdSActionHandler();

/**
 * Check if element is a StatusGrid cell with actions
 */
function isCellWithActions(element) {
  return element?.dataset?.hasCellActions === 'true';
}

/**
 * Setup actions on MSD overlay element
 * @param {HTMLElement} element - Overlay element
 * @param {Object} overlayConfig - Overlay configuration
 * @param {Object} overlay - Overlay instance
 * @returns {Function} Cleanup function
 */
export function setupActions(element, overlayConfig, overlay) {
  if (!element || !overlayConfig?.actions) {
    return () => {};
  }

  // Capture-phase filter for StatusGrid cells
  // Prevents cell events from reaching overlay handlers
  const handleCellCapture = (e) => {
    if (isCellWithActions(e.target)) {
      e.stopPropagation();
    }
  };

  element.addEventListener('pointerdown', handleCellCapture, true);
  element.addEventListener('pointerup', handleCellCapture, true);
  element.addEventListener('pointerleave', handleCellCapture, true);

  // Delegate to unified handler
  const cleanup = _actionHandler.setupActions(element, {
    actions: overlayConfig.actions,
    animations: overlayConfig.animations || {},
    entity: overlayConfig.entity,
    shadowRoot: overlay.shadowRoot
  });

  // Combined cleanup
  return () => {
    element.removeEventListener('pointerdown', handleCellCapture, true);
    element.removeEventListener('pointerup', handleCellCapture, true);
    element.removeEventListener('pointerleave', handleCellCapture, true);
    cleanup();
  };
}
```

**Total Lines:** ~80 lines (was 150 lines with manual timers, double-tap detection, etc.)

**Note:** Cell filtering is only needed for legacy StatusGrid multi-button support. When StatusGrid is retired, this can be simplified to pure delegation.

### LCARdSActionHandler Core

**File:** `src/base/LCARdSActionHandler.js`

**Key Methods:**

```javascript
export class LCARdSActionHandler {

  /**
   * Setup all action handlers on an element
   * @param {HTMLElement} element - Target element
   * @param {Object} options - Configuration options
   * @returns {Function} Cleanup function
   */
  setupActions(element, options = {}) {
    const {
      actions = {},
      animations = {},
      entity = null,
      shadowRoot = null,
      getAnimationSetup = null
    } = options;

    // Animation triggers (hover/leave)
    if (animations && Object.keys(animations).length > 0) {
      TriggerManager.setupTriggers(element, animations, getAnimationSetup);
    }

    // Event handlers array for cleanup
    const handlers = [];

    // Tap action
    if (actions.tap_action) {
      const handler = (e) => {
        if (this._shouldIgnoreEvent(e)) return;
        this._executeAction(actions.tap_action, this._hass, element, entity);
      };
      element.addEventListener('click', handler);
      handlers.push({ event: 'click', handler });
    }

    // Hold action (500ms threshold)
    if (actions.hold_action) {
      let holdTimer = null;
      let holdExecuted = false;

      const startHold = (e) => {
        if (this._shouldIgnoreEvent(e)) return;
        holdExecuted = false;
        holdTimer = setTimeout(() => {
          holdExecuted = true;
          this._executeAction(actions.hold_action, this._hass, element, entity);
        }, 500);
      };

      const cancelHold = () => {
        if (holdTimer) {
          clearTimeout(holdTimer);
          holdTimer = null;
        }
      };

      element.addEventListener('pointerdown', startHold);
      element.addEventListener('pointerup', cancelHold);
      element.addEventListener('pointerleave', cancelHold);
      handlers.push(
        { event: 'pointerdown', handler: startHold },
        { event: 'pointerup', handler: cancelHold },
        { event: 'pointerleave', handler: cancelHold }
      );
    }

    // Double-tap action (300ms window)
    if (actions.double_tap_action) {
      let lastTap = 0;

      const handler = (e) => {
        if (this._shouldIgnoreEvent(e)) return;
        const now = Date.now();
        if (now - lastTap < 300) {
          e.preventDefault();
          this._executeAction(actions.double_tap_action, this._hass, element, entity);
          lastTap = 0;
        } else {
          lastTap = now;
        }
      };

      element.addEventListener('click', handler);
      handlers.push({ event: 'click', handler });
    }

    // Return cleanup function
    return () => {
      handlers.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    };
  }

  /**
   * Execute an action with entity resolution
   * @param {Object} actionConfig - Action configuration
   * @param {Object} hass - Home Assistant object
   * @param {HTMLElement} element - Target element
   * @param {string} defaultEntity - Default entity if not in config
   */
  _executeAction(actionConfig, hass, element, defaultEntity = null) {
    if (!actionConfig || actionConfig.action === 'none') return;

    // Entity resolution: 3-tier precedence
    const entity = actionConfig.entity       // 1. Explicit
      || defaultEntity                       // 2. Card default
      || element?.dataset?.entity;           // 3. Element data

    // Route to handler
    switch (actionConfig.action) {
      case 'toggle':
        this._handleToggle(entity, hass);
        break;
      case 'more-info':
        this._handleMoreInfo(entity, hass);
        break;
      case 'call-service':
        this._handleCallService(actionConfig, hass);
        break;
      case 'navigate':
        this._handleNavigate(actionConfig, hass);
        break;
      case 'url':
        this._handleUrl(actionConfig);
        break;
      default:
        lcardsLog.warn(`Unknown action type: ${actionConfig.action}`);
    }
  }

  // Action handlers...
  _handleToggle(entity, hass) { /* ... */ }
  _handleMoreInfo(entity, hass) { /* ... */ }
  _handleCallService(actionConfig, hass) { /* ... */ }
  _handleNavigate(actionConfig, hass) { /* ... */ }
  _handleUrl(actionConfig) { /* ... */ }
}
```

**Total Lines:** ~600 lines (includes both new `setupActions()` API and legacy `handleAction()` API)

---

## Migration from Legacy API

### Old Pattern (ActionHelpers as Primary Interface)

**Before:** Cards called ActionHelpers which enriched entities then delegated to LCARdSActionHandler

```javascript
// OLD - Don't use
import { ActionHelpers } from '../msd/renderer/ActionHelpers.js';

// Manual event setup
element.addEventListener('click', () => {
  const actionConfig = { action: 'toggle' };
  ActionHelpers.executeAction(actionConfig, this, 'tap', element);
});
```

### New Pattern (Direct Delegation)

**Now:** Cards delegate directly to LCARdSActionHandler with entity context

```javascript
// NEW - Use this
import { LCARdSActionHandler } from './LCARdSActionHandler.js';

constructor() {
  this._actionHandler = new LCARdSActionHandler();
}

// One call sets up all actions
this._actionCleanup = this._actionHandler.setupActions(element, {
  actions: {
    tap_action: { action: 'toggle' },
    hold_action: { action: 'more-info' }
  },
  entity: this.config.entity,
  shadowRoot: this.shadowRoot
});
```

### Benefits of New Pattern

1. **Single Call:** One `setupActions()` call vs. manual event handlers for each action type
2. **Automatic Cleanup:** Returns cleanup function, no manual removeEventListener needed
3. **Animation Integration:** Handles TriggerManager setup automatically
4. **Entity Context:** Entity passed once via options, not per-action
5. **Consistent Behavior:** Same implementation everywhere (SimpleCard, MSD, future cards)
6. **Less Code:** ~470 lines eliminated across SimpleCard and MSD

---

## Performance Characteristics

### Event Handling

- **Tap Action:** Single click listener, immediate execution
- **Hold Action:** Pointer listeners + 500ms timer, cancelled on release
- **Double-Tap:** Click listener + timestamp tracking, 300ms window
- **Hover/Leave:** Media query check (desktop only), TriggerManager delegation

### Memory Management

- **Cleanup Required:** All event listeners must be removed on disconnect
- **Pattern:** Store cleanup function, call in `disconnectedCallback()`
- **Lifecycle:** Created on element render, destroyed on element remove

### Shadow DOM Handling

- **Shadow Root Awareness:** Event listeners respect shadow boundaries
- **Event Propagation:** Proper handling of composed events
- **Cell Filtering:** MSD uses capture phase for StatusGrid isolation

---

## Debugging

### Enable Action Logging

```javascript
// In browser console
window.lcards.logging.setLevel('debug');

// Action execution will now log:
// LCARdS|debug [ActionHandler] Executing toggle for light.bedroom
// LCARdS|debug [ActionHandler] Service called: homeassistant.toggle
```

### Check Action Setup

```javascript
// Verify actions are set up
getEventListeners($0)  // In browser console with element selected

// Should show:
// click: [handler, handler]  (if tap + double-tap)
// pointerdown: [handler]     (if hold)
// pointerup: [handler]       (if hold)
```

### Common Issues

**Actions Not Firing:**
- Check action config format: `{ action: 'toggle' }` not just `'toggle'`
- Verify entity exists: Check `hass.states[entity_id]`
- Check event listeners: `getEventListeners($0)`

**Entity Not Resolving:**
- Enable debug logging to see entity resolution path
- Check 3-tier precedence: config → options → dataset
- Verify entity passed to `setupActions()` options

**Hold Action Not Working:**
- Check pointer events not blocked by CSS
- Verify 500ms hold duration (user may release too early)
- Check browser console for event cancellation

---

## Best Practices

### 1. Always Use setupActions()

✅ **Correct:**
```javascript
this._actionCleanup = this._actionHandler.setupActions(element, {
  actions: this.config,
  entity: this.config.entity
});
```

❌ **Incorrect:**
```javascript
element.addEventListener('click', () => {
  this.hass.callService('homeassistant', 'toggle', {...});
});
```

### 2. Always Cleanup

✅ **Correct:**
```javascript
disconnectedCallback() {
  if (this._actionCleanup) {
    this._actionCleanup();
    this._actionCleanup = null;
  }
  super.disconnectedCallback();
}
```

### 3. Pass Entity Context

✅ **Correct:**
```javascript
setupActions(element, {
  actions,
  entity: this.config.entity  // Pass card's entity
})
```

❌ **Incorrect:**
```javascript
setupActions(element, { actions })  // No entity context
```

### 4. Handle Missing Configs Gracefully

✅ **Correct:**
```javascript
const actions = {
  tap_action: this.config.tap_action || { action: 'toggle' },
  hold_action: this.config.hold_action || null
};

// Filter nulls before passing
Object.keys(actions).forEach(key => {
  if (!actions[key]) delete actions[key];
});
```

---

## Implementation Checklist

When implementing actions in a new card type:

- [ ] Import `LCARdSActionHandler` from `src/base/LCARdSActionHandler.js`
- [ ] Create `_actionHandler` instance in constructor
- [ ] Call `setupActions()` with all required options (actions, entity, shadowRoot)
- [ ] Store returned cleanup function
- [ ] Call cleanup function in `disconnectedCallback()`
- [ ] Pass `getAnimationSetup` callback if card has animations
- [ ] Handle missing action configurations gracefully
- [ ] Test all action types (tap, hold, double-tap)
- [ ] Verify entity resolution works correctly
- [ ] Check cleanup prevents memory leaks

---

## Future Improvements

### When StatusGrid is Retired

MSD ActionHelpers can be simplified to pure delegation:

```javascript
// Future: No cell filtering needed
export function setupActions(element, overlayConfig, overlay) {
  return _actionHandler.setupActions(element, {
    actions: overlayConfig.actions,
    animations: overlayConfig.animations || {},
    entity: overlayConfig.entity,
    shadowRoot: overlay.shadowRoot
  });
}
```

This will reduce MSD wrapper to ~20 lines (simple pass-through).

### Potential Enhancements

- **Gesture Support:** Swipe, pinch, rotate actions
- **Conditional Actions:** Execute action based on state
- **Action Sequences:** Chain multiple actions
- **Haptic Feedback:** Vibration on mobile devices
- **Visual Feedback:** Ripple effects, highlights

---

## Conclusion

The Unified Action System represents a significant architectural improvement:

### Key Achievements

- **Single Source of Truth:** One handler implementation for all cards
- **Code Reduction:** ~470 lines of duplicate code eliminated
- **Consistency:** Identical behavior across MSD and Simple/V2 cards
- **Maintainability:** Changes in one place benefit all cards
- **Performance:** Bundle size reduced (MSD: 549 KB → 544 KB)
- **Simplicity:** Card implementations reduced to thin wrappers

### Architecture Benefits

- **Separation of Concerns:** Cards focus on rendering, handler manages interactions
- **Testability:** Single implementation easier to test comprehensively
- **Extensibility:** New action types added once, available everywhere
- **Reliability:** Proven patterns (TriggerManager, late-binding, entity resolution)

For implementation details, see:
- [Simple Card Foundation](simple-card-foundation.md) - SimpleCard usage patterns
- [Animation System](ANIMATION_SYSTEM_ARCHITECTURE.md) - TriggerManager integration
- [MSD Flow](MSD%20Flow%20-%20Part%201.md) - MSD overlay rendering

---

**Document History:**
- v3.0 (Nov 11, 2025) - Complete rewrite for unified setupActions() architecture
- v2.0 (Nov 8, 2025) - ActionHelpers as primary interface [archived]
- v1.0 (2024) - Initial MSD action system
