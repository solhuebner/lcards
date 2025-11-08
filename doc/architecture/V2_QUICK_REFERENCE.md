# V2 Cards Quick Reference

**For Developers:** Fast lookup guide for V2 card development

---

## 🚀 Quick Start

### **Basic V2 Card Template**

```javascript
import { html, css } from 'lit';
import { LCARdSV2Card } from '../base/LCARdSV2Card.js';
import { lcardsLog } from '../utils/lcards-logging.js';

export class MyV2Card extends LCARdSV2Card {
  static get properties() {
    return {
      ...super.properties,
      _myState: { type: String, state: true }
    };
  }

  constructor() {
    super();
    this._myState = 'idle';
    this._actionCleanup = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.config) {
      requestAnimationFrame(() => this._setupActions());
    }
  }

  _setupActions() {
    const element = this.shadowRoot?.querySelector('.my-card');
    const actions = {
      tap_action: this.config.tap_action || { action: 'toggle' }
    };
    this._actionCleanup = this.setupActions(element, actions);
  }

  disconnectedCallback() {
    if (this._actionCleanup) this._actionCleanup();
    super.disconnectedCallback();
  }

  render() {
    if (!this._initialized) {
      return html`<div class="loading">Loading...</div>`;
    }
    return html`
      <div class="v2-card-container">
        <div class="my-card">Content</div>
      </div>
    `;
  }
}

customElements.define('my-v2-card', MyV2Card);
```

---

## 🎯 Actions Quick Reference

### **Action Setup (Always Use This Pattern)**

```javascript
_setupActions() {
  const actions = {
    tap_action: this.config.tap_action || { action: 'toggle' },
    hold_action: this.config.hold_action,
    double_tap_action: this.config.double_tap_action
  };

  // Filter nulls
  Object.keys(actions).forEach(key => {
    if (!actions[key]) delete actions[key];
  });

  const element = this.shadowRoot?.querySelector('.interactive-element');
  this._actionCleanup = this.setupActions(element, actions);
}
```

### **Action Types**

| Action | Config | Description |
|--------|--------|-------------|
| `toggle` | `{ action: 'toggle' }` | Toggle entity state |
| `turn_on` | `{ action: 'turn_on' }` | Turn entity on |
| `turn_off` | `{ action: 'turn_off' }` | Turn entity off |
| `call-service` | `{ action: 'call-service', service: 'light.turn_on' }` | Call HA service |
| `more-info` | `{ action: 'more-info' }` | Show entity dialog |
| `navigate` | `{ action: 'navigate', navigation_path: '/lovelace/lights' }` | Navigate |
| `url` | `{ action: 'url', url_path: 'https://example.com' }` | Open URL |

---

## 📝 Templates Quick Reference

### **Template Processing**

```javascript
// Async template processing (recommended)
async _processTemplates() {
  if (this.config.text?.includes('{{')) {
    this._processedText = await this.processTemplate(this.config.text);
    this.requestUpdate();
  }
}

// Usage in render
render() {
  const text = this._processedText || this.config.text || 'Default';
  return html`<span>${text}</span>`;
}
```

### **Common Template Patterns**

```javascript
// Entity state
"{{ states.light.bedroom.state }}"

// Entity attribute
"{{ state_attr('light.bedroom', 'brightness') }}"

// Conditional
"{{ 'On' if is_state('light.bedroom', 'on') else 'Off' }}"

// Time
"{{ now().strftime('%H:%M') }}"

// With fallback
"{{ states.light.bedroom.state | default('unknown') }}"
```

---

## 🎨 Styles Quick Reference

### **Style Resolution**

```javascript
render() {
  const baseStyle = { padding: '16px' };
  const themeTokens = ['components.button.backgroundColor'];
  const overrides = { color: 'red' };

  const style = this.resolveStyle(baseStyle, themeTokens, overrides);

  return html`
    <div style="${this._styleToString(style)}">Content</div>
  `;
}
```

### **CSS Custom Properties (Alternative)**

```javascript
static get styles() {
  return css`
    .my-card {
      background: var(--lcars-card-background, var(--primary-color));
      color: var(--lcars-card-text, var(--text-primary-color));
    }
  `;
}
```

---

## 🐛 Debug Quick Reference

### **Enable Debug Logging**

```javascript
// Console commands
window.lcards.logging.setLevel('debug');  // Show debug info
window.lcards.logging.setLevel('trace');  // Show everything
```

### **Check Card State**

```javascript
// Select card element in devtools, then:
$0._initialized;        // Should be true
$0.systemsManager;      // Should be object
$0.config;             // Should have config
$0._actionsSetup;      // Should be true (if actions configured)
```

### **Check Action Listeners**

```javascript
// With card element selected:
getEventListeners($0);  // Should show click, pointerdown, etc.
```

### **Common Issues**

| Issue | Check | Solution |
|-------|-------|----------|
| Actions not working | `$0._actionsSetup` | Ensure `_setupActions()` is called |
| Card not initializing | `$0._initialized` | Check singleton loading |
| Templates not processing | `await $0.processTemplate("{{...}}")` | Check template syntax |
| Styles not applying | `$0.resolveStyle({}, [], {})` | Check style resolution |

---

## 📚 Configuration Examples

### **Basic Button**

```yaml
type: custom:lcards-v2-button
entity: light.bedroom
text: "Bedroom Light"
icon: mdi:lightbulb
tap_action:
  action: toggle
```

### **Advanced Button**

```yaml
type: custom:lcards-v2-button
entity: light.bedroom
text: "{{ state_attr('light.bedroom', 'friendly_name') }}"
icon: mdi:lightbulb
tap_action:
  action: toggle
hold_action:
  action: call-service
  service: light.turn_on
  service_data:
    brightness: 255
double_tap_action:
  action: more-info
overlay_id: bedroom_light
tags: [lighting, bedroom]
```

### **Service Call Actions**

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
```

---

## 🔧 Lifecycle Checklist

### **Required Methods (Implement These)**

- [ ] `constructor()` - Call `super()`, initialize properties
- [ ] `connectedCallback()` - Call `super.connectedCallback()` first, setup actions
- [ ] `disconnectedCallback()` - Cleanup actions, call `super.disconnectedCallback()` last
- [ ] `render()` - Check `this._initialized`, render content

### **Optional Methods (Implement If Needed)**

- [ ] `setConfig(config)` - Validate config, call `super.setConfig(config)`
- [ ] `firstUpdated()` - Post-render setup, call `super.firstUpdated()` first
- [ ] `updated(changedProperties)` - React to property changes

### **Common Patterns**

```javascript
// ✅ Always do this
constructor() {
  super();  // Required
  this._actionCleanup = null;
}

connectedCallback() {
  super.connectedCallback();  // Always first
  // Your code here
}

disconnectedCallback() {
  // Your cleanup here
  super.disconnectedCallback();  // Always last
}

render() {
  if (!this._initialized) {
    return html`<div class="loading">Loading...</div>`;
  }
  // Normal render
}
```

---

## 📖 Full Documentation

- **[V2 Cards Architecture](V2_CARDS_ARCHITECTURE.md)** - Complete architecture guide
- **[Unified Action System](UNIFIED_ACTION_SYSTEM.md)** - Action system details
- **[V2 Cards API](../api/V2_CARDS_API.md)** - Complete API reference
- **[lcards-v2-button.js](../../src/cards/lcards-v2-button.js)** - Reference implementation