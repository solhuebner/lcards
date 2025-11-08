# LCARdS V2 Cards API Reference

**Version:** 2.0 (Unified Action System)
**Date:** November 8, 2025
**Status:** ✅ Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Base Class API](#base-class-api)
3. [Systems Manager API](#systems-manager-api)
4. [Action System API](#action-system-api)
5. [Template Processing API](#template-processing-api)
6. [Style Resolution API](#style-resolution-api)
7. [Debug API](#debug-api)

---

## Overview

The V2 Cards API provides a comprehensive interface for building lightweight, singleton-aware Home Assistant cards. All V2 cards inherit from `LCARdSV2Card` which provides automatic integration with the LCARdS singleton architecture.

### **Core Principles:**

- **Singleton Integration** - Automatic access to global systems
- **Unified Actions** - Same action system as MSD overlays
- **Template Processing** - Built-in template engine integration
- **Style Resolution** - Theme token and override support
- **Memory Management** - Automatic cleanup and resource management

---

## Base Class API

### **LCARdSV2Card**

The foundation class that all V2 cards inherit from.

#### **Constructor**

```javascript
constructor() {
  super();
  // Base class handles singleton initialization automatically
}
```

#### **Lifecycle Methods**

##### **`setConfig(config)`**

Sets the card configuration with automatic validation and singleton setup.

```javascript
setConfig(config) {
  // Custom validation
  if (!config.entity && !config.text) {
    throw new Error('Either entity or text is required');
  }

  // Call parent setConfig for singleton initialization
  super.setConfig(config);
}
```

**Parameters:**
- `config` - Card configuration object

**Throws:**
- `Error` - If configuration validation fails

##### **`connectedCallback()`**

Called when element is connected to DOM. Override for card-specific setup.

```javascript
connectedCallback() {
  super.connectedCallback();  // Always call parent first

  // Card-specific setup
  if (this.config) {
    requestAnimationFrame(() => {
      this._setupActionListeners();
    });
  }
}
```

##### **`disconnectedCallback()`**

Called when element is removed from DOM. Override for cleanup.

```javascript
disconnectedCallback() {
  // Clean up card-specific resources
  if (this._actionCleanup) {
    this._actionCleanup();
  }

  super.disconnectedCallback();  // Always call parent last
}
```

##### **`firstUpdated()`**

Called after first render. Override for post-render setup.

```javascript
firstUpdated() {
  super.firstUpdated();

  // Fallback setup if connectedCallback didn't work
  if (!this._initialized) {
    this._setupCard();
  }
}
```

#### **Configuration Properties**

##### **`config`** (readonly)

The current card configuration object.

```javascript
// Access configuration
const entity = this.config.entity;
const tapAction = this.config.tap_action;
```

##### **`hass`** (readonly)

The Home Assistant object with states and services.

```javascript
// Access entity state
const entity = this.hass.states[this.config.entity];
const state = entity?.state;

// Call service
this.hass.callService('light', 'turn_on', { entity_id: this.config.entity });
```

#### **Singleton Access Properties**

##### **`systemsManager`** (readonly)

Access to the V2 card systems manager.

```javascript
// Template processing
const processed = await this.systemsManager.processTemplate(template, entity);

// Style resolution
const style = this.systemsManager.resolveStyle(baseStyle, tokens, overrides);
```

##### **`_initialized`** (readonly)

Boolean indicating if singleton systems are ready.

```javascript
render() {
  if (!this._initialized) {
    return html`<div class="loading">Initializing...</div>`;
  }
  // Normal render
}
```

#### **Core Methods**

##### **`setupActions(element, actions)`**

Universal action setup method for consistent behavior.

```javascript
setupActions(element, actions) {
  // Returns cleanup function
  return cleanupFunction;
}
```

**Parameters:**
- `element` - DOM element to attach actions to
- `actions` - Object with action configurations

**Returns:**
- `Function` - Cleanup function to remove all listeners

**Example:**
```javascript
_setupActionListeners() {
  const element = this.shadowRoot.querySelector('.my-card');
  const actions = {
    tap_action: this.config.tap_action || { action: 'toggle' },
    hold_action: this.config.hold_action,
    double_tap_action: this.config.double_tap_action
  };

  this._actionCleanup = this.setupActions(element, actions);
}
```

##### **`processTemplate(template, entityId)`**

Process Home Assistant template strings.

```javascript
async processTemplate(template, entityId = null) {
  // Returns processed template result
}
```

**Parameters:**
- `template` - Template string to process
- `entityId` - Optional entity ID for template context

**Returns:**
- `Promise<string>` - Processed template result

**Example:**
```javascript
async _processTemplates() {
  if (this.config.text) {
    this._processedText = await this.processTemplate(this.config.text);
  }
  this.requestUpdate();
}
```

##### **`resolveStyle(baseStyle, themeTokens, overrides)`**

Resolve styles using theme tokens and overrides.

```javascript
resolveStyle(baseStyle, themeTokens, overrides) {
  // Returns resolved style object
}
```

**Parameters:**
- `baseStyle` - Base style object
- `themeTokens` - Array of theme token paths
- `overrides` - Style override object

**Returns:**
- `Object` - Resolved style object

**Example:**
```javascript
render() {
  const baseStyle = { padding: '16px' };
  const tokens = ['components.button.backgroundColor'];
  const overrides = { color: 'red' };

  const style = this.resolveStyle(baseStyle, tokens, overrides);

  return html`
    <div style="${this._styleToString(style)}">Content</div>
  `;
}
```

#### **Utility Methods**

##### **`_styleToString(styleObject)`**

Convert style object to CSS string.

```javascript
_styleToString(styleObject) {
  return Object.entries(styleObject)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}
```

##### **`_registerOverlayTarget(overlayId, element)`**

Register element as target for rule engine.

```javascript
setConfig(config) {
  super.setConfig(config);

  if (config.overlay_id) {
    this._registerOverlayTarget(config.overlay_id, this);
  }
}
```

---

## Systems Manager API

### **V2CardSystemsManager**

Lightweight systems coordinator accessible via `this.systemsManager`.

#### **Template Methods**

##### **`processTemplate(template, entityId, fallback)`**

Process template with error handling.

```javascript
async processTemplate(template, entityId = null, fallback = template) {
  try {
    return await this._templateProcessor.processTemplate(template, entityId);
  } catch (error) {
    lcardsLog.warn('Template processing failed, using fallback');
    return fallback;
  }
}
```

#### **Style Methods**

##### **`resolveStyle(baseStyle, themeTokens, overrides)`**

Resolve styles through the V2 style resolver.

```javascript
resolveStyle(baseStyle = {}, themeTokens = [], overrides = {}) {
  return this._styleResolver.resolveStyle(baseStyle, themeTokens, overrides);
}
```

##### **`getThemeToken(tokenPath)`**

Get individual theme token value.

```javascript
getThemeToken(tokenPath) {
  return this._themeManager.getToken(tokenPath);
}
```

**Example:**
```javascript
const bgColor = this.systemsManager.getThemeToken('components.button.backgroundColor');
```

#### **Action Methods**

##### **`setupActionListeners(element, actions, entityId)`** (Legacy)

Legacy action setup method. **Use `this.setupActions()` instead.**

```javascript
// ❌ Legacy (still works but deprecated)
this.systemsManager.setupActionListeners(element, actions, entityId);

// ✅ Preferred
this.setupActions(element, actions);
```

---

## Action System API

### **Action Configuration Object**

Standard action configuration format used throughout the system.

```javascript
const actionConfig = {
  action: 'toggle',           // Action type (required)
  entity: 'light.bedroom',    // Target entity (optional, auto-enriched)
  service: 'light.turn_on',   // For call-service actions
  service_data: { ... },      // Service data payload
  target: { ... },            // Service target specification
  navigation_path: '...',     // For navigate actions
  url_path: 'https://...',    // For url actions
  confirmation: true          // Show confirmation dialog
};
```

### **Action Types**

#### **Entity Actions**

Actions that operate on Home Assistant entities:

```javascript
// Toggle entity state
{ action: 'toggle' }

// Turn entity on
{ action: 'turn_on' }

// Turn entity off
{ action: 'turn_off' }

// Show entity more-info dialog
{ action: 'more-info' }
```

#### **Service Actions**

Call any Home Assistant service:

```javascript
{
  action: 'call-service',
  service: 'light.turn_on',
  target: {
    entity_id: 'light.bedroom'
  },
  service_data: {
    brightness: 255,
    color_name: 'red'
  }
}
```

#### **Navigation Actions**

Navigate within Home Assistant:

```javascript
{
  action: 'navigate',
  navigation_path: '/lovelace/lighting',
  navigation_replace: false  // Optional
}
```

#### **External Actions**

Open external URLs:

```javascript
{
  action: 'url',
  url_path: 'https://home-assistant.io'
}
```

#### **DOM Events**

Fire custom DOM events:

```javascript
{
  action: 'fire-dom-event',
  event_type: 'my-custom-event',
  event_data: {
    key: 'value'
  }
}
```

### **Entity Enrichment**

Actions are automatically enriched with entity information when missing:

```javascript
// Card config
{ entity: 'light.bedroom' }

// Action config (missing entity)
{ action: 'toggle' }

// Automatically enriched to:
{
  action: 'toggle',
  entity: 'light.bedroom'  // ← Added automatically
}
```

---

## Template Processing API

### **Template Syntax**

V2 cards support full Home Assistant template syntax:

#### **Entity States**
```javascript
// Current state
"{{ states.light.bedroom.state }}"

// State with fallback
"{{ states.light.bedroom.state | default('unknown') }}"
```

#### **Entity Attributes**
```javascript
// Attribute value
"{{ state_attr('light.bedroom', 'brightness') }}"

// Formatted attribute
"{{ state_attr('climate.bedroom', 'temperature') }}°C"
```

#### **Conditional Logic**
```javascript
// Simple conditional
"{{ 'On' if is_state('light.bedroom', 'on') else 'Off' }}"

// Complex conditional
"{{ 'Bright' if state_attr('light.bedroom', 'brightness') > 128 else 'Dim' }}"
```

#### **Time and Date**
```javascript
// Current time
"{{ now().strftime('%H:%M') }}"

// Relative time
"{{ relative_time(states.light.bedroom.last_changed) }} ago"
```

### **Template Processing Methods**

#### **Synchronous Processing** (Simple)
```javascript
// For simple, non-template strings
render() {
  const displayText = this.config.text || 'Default Text';
  return html`<span>${displayText}</span>`;
}
```

#### **Asynchronous Processing** (Templates)
```javascript
// For template strings
async _processTemplates() {
  if (this.config.text && this.config.text.includes('{{')) {
    this._processedText = await this.processTemplate(this.config.text);
    this.requestUpdate();
  }
}

render() {
  const displayText = this._processedText || this.config.text || 'Default';
  return html`<span>${displayText}</span>`;
}
```

#### **Error Handling**
```javascript
async _processTemplates() {
  try {
    this._processedText = await this.processTemplate(this.config.text);
  } catch (error) {
    lcardsLog.error('Template processing failed:', error);
    this._processedText = this.config.text; // Fallback to original
  }
  this.requestUpdate();
}
```

---

## Style Resolution API

### **Theme Token System**

V2 cards can access theme tokens for consistent styling:

#### **Token Paths**
```javascript
// Component tokens
'components.button.backgroundColor'
'components.button.textColor'
'components.button.borderColor'
'components.card.backgroundColor'

// Global tokens
'colors.primary'
'colors.accent'
'typography.fontFamily'
'spacing.medium'
```

#### **Resolution Priority**
1. **Overrides** - Explicit style overrides (highest priority)
2. **Theme Tokens** - Theme-specific values
3. **Base Style** - Default card styles (lowest priority)

### **Style Resolution Examples**

#### **Basic Resolution**
```javascript
render() {
  const resolvedStyle = this.resolveStyle(
    { padding: '16px' },                    // Base style
    ['components.button.backgroundColor'],   // Theme tokens
    { color: 'red' }                        // Overrides
  );

  return html`
    <div style="${this._styleToString(resolvedStyle)}">
      Content
    </div>
  `;
}
```

#### **Dynamic Overrides**
```javascript
_getStyleOverrides() {
  const overrides = {};

  // Apply rule-based styling
  if (this._buttonStyle.background_color) {
    overrides.backgroundColor = this._buttonStyle.background_color;
  }

  // Apply state-based styling
  if (this._isPressed) {
    overrides.transform = 'translateY(2px)';
  }

  return overrides;
}

render() {
  const style = this.resolveStyle(
    this._getBaseStyle(),
    this._getThemeTokens(),
    this._getStyleOverrides()
  );

  return html`<div style="${this._styleToString(style)}">...</div>`;
}
```

#### **CSS Custom Properties**
```javascript
// V2 cards can also use CSS custom properties for dynamic styling
static get styles() {
  return css`
    .my-card {
      background: var(--lcars-card-background, var(--primary-color));
      color: var(--lcards-card-text, var(--text-primary-color));
      border: 2px solid var(--lcards-card-border, var(--primary-color));
    }
  `;
}
```

---

## Debug API

### **V2 Card Debug Interface**

Access V2 card debug information through the console:

```javascript
// Access V2 debug namespace (when available)
window.lcards.debug.v2.cards.list();        // List all V2 cards
window.lcards.debug.v2.systems.status();    // Systems status
window.lcards.debug.v2.actions.trace();     // Action tracing
```

### **Development Debugging**

#### **Enable Debug Logging**
```javascript
// Set log level for detailed V2 debugging
window.lcards.logging.setLevel('debug');

// Or trace level for maximum detail
window.lcards.logging.setLevel('trace');
```

#### **Card State Inspection**
```javascript
// In card implementation, expose debug info
getDebugInfo() {
  return {
    cardId: this._cardId,
    initialized: this._initialized,
    config: this.config,
    systemsManager: !!this.systemsManager,
    actionsSetup: this._actionsSetup
  };
}

// Access via console
$0.getDebugInfo();  // On selected card element
```

#### **Action Debug Tracing**
```javascript
// Enable action tracing
window.lcards.logging.setLevel('trace');

// Actions will show detailed flow:
// LCARdS|trace [V2Card] Setting up tap action
// LCARdS|trace [ActionHelpers] Entity enrichment: toggle → light.bedroom
// LCARdS|trace [ActionHandler] Executing toggle for light.bedroom
```

### **Common Debug Scenarios**

#### **Card Not Initializing**
```javascript
// Check singleton systems
window.lcards.core.status();

// Check card state
$0._initialized;        // Should be true
$0.systemsManager;      // Should be object
$0.config;             // Should have config
```

#### **Actions Not Working**
```javascript
// Check action listeners
getEventListeners($0);  // Should show click, pointerdown listeners

// Check action config
$0.config.tap_action;   // Should have action config
$0._actionsSetup;       // Should be true
```

#### **Templates Not Processing**
```javascript
// Check template processor
$0.systemsManager._templateProcessor;  // Should be object

// Test template processing
await $0.processTemplate("{{ states.light.bedroom.state }}");
```

#### **Styles Not Resolving**
```javascript
// Check style resolver
$0.systemsManager._styleResolver;  // Should be object

// Test style resolution
$0.resolveStyle({ color: 'red' }, ['components.button.backgroundColor'], {});
```

---

## Best Practices

### **1. Always Call Parent Methods**

```javascript
✅ // Correct
connectedCallback() {
  super.connectedCallback();  // Always call parent first
  // Your code here
}

disconnectedCallback() {
  // Your cleanup here
  super.disconnectedCallback();  // Always call parent last
}
```

### **2. Use Async Template Processing**

```javascript
✅ // Correct - async template processing
async _processTemplates() {
  if (this.config.text?.includes('{{')) {
    this._processedText = await this.processTemplate(this.config.text);
    this.requestUpdate();
  }
}

❌ // Incorrect - synchronous template processing
_processTemplates() {
  // Templates are async - this won't work properly
  this._processedText = this.processTemplate(this.config.text);
}
```

### **3. Proper Action Cleanup**

```javascript
✅ // Correct - clean up actions
disconnectedCallback() {
  if (this._actionCleanup) {
    this._actionCleanup();
    this._actionCleanup = null;
  }
  super.disconnectedCallback();
}

❌ // Incorrect - memory leak
disconnectedCallback() {
  super.disconnectedCallback();
  // Actions not cleaned up - will leak memory
}
```

### **4. Wait for Initialization**

```javascript
✅ // Correct - wait for initialization
render() {
  if (!this._initialized) {
    return html`<div class="loading">Initializing...</div>`;
  }
  // Normal render
}

❌ // Incorrect - render without checking initialization
render() {
  // May fail if systems not ready
  const style = this.resolveStyle(...);
}
```

---

## Conclusion

The V2 Cards API provides a powerful, unified interface for building Home Assistant cards that seamlessly integrate with the LCARdS ecosystem. By leveraging the singleton architecture, V2 cards achieve better performance, consistency, and maintainability compared to traditional card implementations.

For complete examples, see:
- [V2 Cards Architecture Guide](V2_CARDS_ARCHITECTURE.md)
- [Unified Action System Documentation](UNIFIED_ACTION_SYSTEM.md)
- Sample implementations in `/src/cards/`