# LCARdS V2 Cards Architecture

**Version:** 2.0 (Unified Action System)
**Date:** November 8, 2025
**Status:** ✅ Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [Core Components](#core-components)
4. [Unified Action System](#unified-action-system)
5. [Development Guide](#development-guide)
6. [Best Practices](#best-practices)
7. [Migration from V1](#migration-from-v1)

---

## Overview

The LCARdS V2 Cards system represents a complete architectural evolution from the original V1 card system. V2 cards are **lightweight, singleton-aware components** that leverage the global LCARdS singleton architecture for maximum efficiency and consistency.

### **Key Architectural Benefits:**

✅ **Singleton Integration** - Direct access to global systems (themes, validation, templates)
✅ **Unified Actions** - Same proven action system used by MSD overlays
✅ **Lightweight Design** - Minimal overhead, fast initialization
✅ **Rule Engine Support** - Dynamic styling and behavior via global rules
✅ **Template Processing** - Built-in template engine integration
✅ **Memory Efficient** - Shared systems reduce per-card overhead

---

## Architecture Principles

### 1. **Singleton-First Design**

V2 cards are built around the singleton architecture. Instead of each card managing its own systems, they access shared global instances:

```javascript
// V1 (Old) - Each card had its own systems
class V1Card {
  constructor() {
    this.templateEngine = new TemplateEngine();
    this.styleResolver = new StyleResolver();
    this.actionHandler = new ActionHandler();
  }
}

// V2 (New) - Cards use shared singletons
class V2Card extends LCARdSV2Card {
  constructor() {
    super();
    // Systems are automatically available via this.systemsManager
    // Templates via this.processTemplate()
    // Actions via this.setupActions()
  }
}
```

### 2. **Unified Action System**

All V2 cards use the same action system as MSD overlays, providing consistent behavior:

```javascript
// Universal action setup works the same everywhere
this._actionCleanup = this.setupActions(element, {
  tap_action: { action: 'toggle' },
  hold_action: { action: 'more-info' },
  double_tap_action: { action: 'call-service', service: 'light.toggle' }
});
```

### 3. **Declarative Configuration**

V2 cards use simple, declarative YAML configurations:

```yaml
type: custom:lcards-v2-button
entity: light.bedroom
text: "Bedroom Light"
icon: mdi:lightbulb
tap_action:
  action: toggle
overlay_id: bedroom_button  # Makes it targetable by rules
tags: [lighting, bedroom]   # Tag-based rule targeting
```

---

## Core Components

### **LCARdSV2Card (Base Class)**

The foundation class that all V2 cards inherit from.

**Key Features:**
- Automatic singleton initialization
- Built-in template processing
- Universal action setup
- Style resolution integration
- Rule engine support
- Memory management

**Usage:**
```javascript
import { LCARdSV2Card } from '../base/LCARdSV2Card.js';

export class MyV2Card extends LCARdSV2Card {
  // Inherits all singleton integration automatically
}
```

### **V2CardSystemsManager**

Lightweight systems coordinator for V2 cards. Provides access to:

- Template processing
- Style resolution
- Theme token access
- Action handling (via unified system)

**API:**
```javascript
// Available via this.systemsManager in V2 cards
this.systemsManager.processTemplate(template, entity);
this.systemsManager.resolveStyle(baseStyle, tokens, overrides);
this.systemsManager.getThemeToken('components.button.backgroundColor');
```

### **Unified Action Helpers**

V2 cards use the same `ActionHelpers` system as MSD overlays:

```javascript
// In base class (LCARdSV2Card.js)
setupActions(element, actions) {
  // Uses MSD's proven ActionHelpers.executeAction()
  ActionHelpers.executeAction(enrichedAction, this, actionType, element);
}
```

---

## Unified Action System

### **Architecture Overview**

The unified action system ensures consistent behavior across all LCARdS components:

```
V2 Cards ─┐
          ├─→ ActionHelpers.executeAction() ─→ LCARdSActionHandler.handleAction() ─→ Home Assistant
MSD Overlays ─┘
```

### **Action Flow**

1. **V2 Card Action Setup:**
   ```javascript
   // In card implementation
   _setupActionListeners() {
     const actions = {
       tap_action: this.config.tap_action || { action: 'toggle' },
       hold_action: this.config.hold_action,
       double_tap_action: this.config.double_tap_action
     };

     this._actionCleanup = this.setupActions(buttonElement, actions);
   }
   ```

2. **Base Class Processing:**
   ```javascript
   // In LCARdSV2Card.setupActions()
   const tapHandler = (event) => {
     const enrichedAction = enrichAction(actions.tap_action);
     ActionHelpers.executeAction(enrichedAction, this, 'tap', element);
   };
   ```

3. **Entity Enrichment:**
   ```javascript
   // Automatic entity enrichment
   const enrichAction = (actionConfig) => {
     const enriched = { ...actionConfig };
     if (!enriched.entity && this.config?.entity) {
       enriched.entity = this.config.entity;
     }
     return enriched;
   };
   ```

### **Supported Actions**

All standard Home Assistant actions are supported:

- `toggle` - Toggle entity state
- `turn_on` - Turn entity on
- `turn_off` - Turn entity off
- `call-service` - Call any Home Assistant service
- `more-info` - Show entity more-info dialog
- `navigate` - Navigate to different view
- `url` - Open URL
- `fire-dom-event` - Fire custom DOM events

### **Action Configuration**

```yaml
# Basic toggle
tap_action:
  action: toggle

# Service call with data
hold_action:
  action: call-service
  service: light.turn_on
  service_data:
    brightness: 255
    color_name: red

# Navigation
double_tap_action:
  action: navigate
  navigation_path: /lovelace/lighting
```

---

## Development Guide

### **Creating a New V2 Card**

1. **Create the card class:**
   ```javascript
   import { html, css } from 'lit';
   import { LCARdSV2Card } from '../base/LCARdSV2Card.js';
   import { lcardsLog } from '../utils/lcards-logging.js';

   export class MyV2Card extends LCARdSV2Card {
     static get properties() {
       return {
         ...super.properties,
         // Add card-specific properties
         _myState: { type: String, state: true }
       };
     }

     static get styles() {
       return [
         super.styles,
         css`
           /* Card-specific styles */
           .my-card {
             padding: 16px;
             /* Use CSS custom properties for theming */
             background: var(--lcars-card-background);
             color: var(--lcars-card-text);
           }
         `
       ];
     }

     constructor() {
       super();
       this._myState = 'idle';
       this._actionCleanup = null;
     }

     connectedCallback() {
       super.connectedCallback();
       // Set up actions after DOM connection
       if (this.config) {
         requestAnimationFrame(() => {
           this._setupActionListeners();
         });
       }
     }

     _setupActionListeners() {
       const element = this.shadowRoot?.querySelector('.my-card');
       if (!element || !this.config) return;

       const actions = {
         tap_action: this.config.tap_action || { action: 'toggle' }
       };

       // Use universal action setup
       this._actionCleanup = this.setupActions(element, actions);
     }

     disconnectedCallback() {
       if (this._actionCleanup) {
         this._actionCleanup();
       }
       super.disconnectedCallback();
     }

     render() {
       if (!this._initialized) {
         return html`<div class="v2-card-loading">Loading...</div>`;
       }

       return html`
         <div class="v2-card-container">
           <div class="my-card">
             <!-- Card content -->
           </div>
         </div>
       `;
     }
   }

   customElements.define('my-v2-card', MyV2Card);
   ```

2. **Register with Home Assistant:**
   ```javascript
   window.customCards = window.customCards || [];
   window.customCards.push({
     type: 'my-v2-card',
     name: 'My V2 Card',
     description: 'Description of my card'
   });
   ```

### **Template Processing**

V2 cards have built-in template processing:

```javascript
async _processTemplates() {
  if (this.config.text && typeof this.config.text === 'string') {
    this._processedText = await this.processTemplate(this.config.text);
  }
  this.requestUpdate();
}
```

Templates support:
- Entity states: `{{ states.light.bedroom.state }}`
- Entity attributes: `{{ state_attr('light.bedroom', 'brightness') }}`
- Time-based: `{{ now().strftime('%H:%M') }}`
- Conditional: `{{ 'On' if is_state('light.bedroom', 'on') else 'Off' }}`

### **Style Resolution**

V2 cards can use the unified style system:

```javascript
render() {
  const baseStyle = { padding: '16px' };
  const themeTokens = [
    'components.card.backgroundColor',
    'components.card.textColor'
  ];
  const overrides = this._getStyleOverrides();

  const resolvedStyle = this.resolveStyle(baseStyle, themeTokens, overrides);

  return html`
    <div class="my-card" style="${this._styleToString(resolvedStyle)}">
      <!-- Content -->
    </div>
  `;
}
```

---

## Best Practices

### **1. Action Setup**

✅ **Do:**
```javascript
// Use base class universal action setup
this._actionCleanup = this.setupActions(element, actions);

// Always clean up on disconnect
disconnectedCallback() {
  if (this._actionCleanup) {
    this._actionCleanup();
  }
  super.disconnectedCallback();
}
```

❌ **Don't:**
```javascript
// Don't create your own action handlers
element.addEventListener('click', () => {
  // Custom action logic
});
```

### **2. Logging**

✅ **Use appropriate log levels:**
```javascript
lcardsLog.debug('Setup operations');  // Development details
lcardsLog.info('Important events');   // Key lifecycle events
lcardsLog.warn('Recoverable issues'); // Problems that can be handled
lcardsLog.error('Critical failures'); // Must be investigated
```

❌ **Avoid console.log:**
```javascript
console.log('Debug info'); // Don't use raw console
```

### **3. Initialization**

✅ **Wait for initialization:**
```javascript
render() {
  if (!this._initialized) {
    return html`<div class="loading">Initializing...</div>`;
  }
  // Normal render
}
```

### **4. Memory Management**

✅ **Clean up resources:**
```javascript
disconnectedCallback() {
  // Clean up actions
  if (this._actionCleanup) {
    this._actionCleanup();
  }
  // Clean up observers
  if (this._resizeObserver) {
    this._resizeObserver.disconnect();
  }
  super.disconnectedCallback();
}
```

---

## Migration from V1

### **Key Differences**

| Aspect | V1 Cards | V2 Cards |
|--------|----------|----------|
| **Base Class** | Custom base or none | `LCARdSV2Card` |
| **Systems Access** | Manual initialization | Automatic via singletons |
| **Actions** | Custom implementations | Unified `ActionHelpers` system |
| **Templates** | Manual processing | Built-in `processTemplate()` |
| **Styles** | Manual CSS | Theme token integration |
| **Rules** | No support | Automatic rule engine support |

### **Migration Steps**

1. **Change base class:**
   ```javascript
   // Old
   export class MyCard extends LitElement {

   // New
   export class MyCard extends LCARdSV2Card {
   ```

2. **Update action handling:**
   ```javascript
   // Old - custom action handlers
   _handleClick() {
     if (this.config.tap_action?.action === 'toggle') {
       this.hass.callService('homeassistant', 'toggle', {
         entity_id: this.config.entity
       });
     }
   }

   // New - unified action system
   _setupActionListeners() {
     const actions = {
       tap_action: this.config.tap_action || { action: 'toggle' }
     };
     this._actionCleanup = this.setupActions(element, actions);
   }
   ```

3. **Use singleton systems:**
   ```javascript
   // Old - manual template processing
   processMyTemplate(template) {
     // Custom template logic
   }

   // New - built-in processing
   async processMyTemplate(template) {
     return await this.processTemplate(template);
   }
   ```

---

## Conclusion

The V2 Cards architecture provides a robust, efficient foundation for building lightweight Home Assistant cards that seamlessly integrate with the LCARdS ecosystem. The unified action system ensures consistent behavior across all components while maintaining simplicity for developers.

Key benefits:
- **Consistent UX** - Same actions work the same everywhere
- **Reduced Code** - Shared systems eliminate duplication
- **Better Performance** - Singleton architecture reduces overhead
- **Easy Maintenance** - Single place to fix bugs affects all cards
- **Future-Proof** - Built on proven MSD architecture patterns

For questions or contributions, see the [Development Guide](../api/README.md) and [API Reference](../api/API_REFERENCE.md).