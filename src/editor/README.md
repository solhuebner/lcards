# LCARdS Visual Editor

Visual editor components for LCARdS cards, integrated with Home Assistant's native card editor interface.

---

## ⚙️ Editor Development Standards

**CRITICAL**: This section defines the ONLY approved patterns for editor development. Following these standards ensures consistency, maintainability, and proper Home Assistant integration.

### 🚫 Prohibited Patterns

**NEVER use these in LCARdS editors:**

❌ **Custom tab implementations** - Use `ha-tab-group` and `ha-tab-group-tab`
❌ **Plain HTML controls** - Use HA components (`ha-button`, `ha-textfield`, `ha-select`, etc.)
❌ **Custom dialog implementations** - Use `lcards-dialog` wrapper
❌ **Inconsistent spacing** - Use 12px for sections/rows, 8px for gaps
❌ **Direct `this.hass.states` access on render** - Cache entity references
❌ **`customElements.get()` fallback checks** - All HA components are available
❌ **Non-standard button variants** - Use approved variant/appearance combinations
❌ **Custom CSS for standard HA components** - Use component's built-in properties

### ✅ Required Components

#### Tabs (`ha-tab-group`)

**Structure:**
```javascript
import '@ha/components/ha-tab-group';

render() {
    return html`
        <ha-tab-group @wa-tab-show=${this._handleTabChange}>
            <ha-tab-group-tab
                value="config"
                ?active=${this._activeTab === 'config'}
                label="Config"
                icon="mdi:cog">
            </ha-tab-group-tab>
            <ha-tab-group-tab
                value="style"
                ?active=${this._activeTab === 'style'}
                label="Style"
                icon="mdi:palette">
            </ha-tab-group-tab>
        </ha-tab-group>

        <!-- Tab Panels (use ha-tab-panel for proper structure) -->
        ${this._activeTab === 'config' ? html`
            <ha-tab-panel>
                <div class="tab-panel-content">
                    <!-- Content here -->
                </div>
            </ha-tab-panel>
        ` : ''}
        ${this._activeTab === 'style' ? html`
            <ha-tab-panel>
                <div class="tab-panel-content">
                    <!-- Content here -->
                </div>
            </ha-tab-panel>
        ` : ''}
    `;
}

_handleTabChange(event) {
    this._activeTab = event.target.activeTab?.getAttribute('value') || 'config';
    this.requestUpdate();
}
```

**Tab Attributes:**
- `value` - Tab identifier (used in event handler)
- `?active` - Boolean to mark active tab
- `label` - Tab text
- `icon` - Optional MDI icon

**Event Pattern:**
- Event: `@wa-tab-show` (NOT `@active-tab-changed`)
- Handler: `event.target.activeTab?.getAttribute('value')`

**Scrolling:**
- Wrap content in `.tab-panel-content` div (ha-tab-panel has shadow DOM)
- CSS: `overflow-y: auto; max-height: calc(75vh - 120px); padding: 16px;`

#### Dialogs (`lcards-dialog`)

**Structure:**
```javascript
import '../components/common/lcards-dialog.js';

_showDialog() {
    const dialog = this.renderRoot.querySelector('lcards-dialog');
    dialog.open = true;
}

render() {
    return html`
        <lcards-dialog @closed=${this._handleDialogClose}>
            <!-- Use slot for heading (NOT .heading property) -->
            <span slot="heading">Dialog Title</span>

            <!-- Dialog content -->
            <div class="dialog-content">
                <ha-textfield label="Name" .value=${this._name}></ha-textfield>
            </div>

            <!-- Footer buttons -->
            <div slot="footer" class="dialog-footer">
                <ha-button appearance="plain" @click=${this._handleCancel}>
                    Cancel
                </ha-button>
                <ha-button variant="brand" appearance="accent" @click=${this._handleSave}>
                    <ha-icon icon="mdi:content-save" slot="icon"></ha-icon>
                    Save
                </ha-button>
            </div>
        </lcards-dialog>
    `;
}
```

**Dialog Patterns:**
- Use `slot="heading"` (NOT `.heading` property)
- Use `slot="footer"` for button row
- CSS: `gap: 12px` for form fields
- Always handle `@closed` event for cleanup

#### Buttons (`ha-button`)

**Standard Variants:**
```javascript
// Primary/Save actions
html`<ha-button variant="brand" appearance="accent">Save</ha-button>`

// Destructive actions (delete, remove)
html`<ha-button variant="danger">Delete</ha-button>`

// Secondary/Cancel actions
html`<ha-button appearance="plain">Cancel</ha-button>`

// Default actions
html`<ha-button>Do Something</ha-button>`
```

**With Icons:**
```javascript
html`
    <ha-button variant="brand" appearance="accent">
        <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
        Add Item
    </ha-button>
`
```

**Button Sizing:**
- Use `size="small"` for compact UI
- Default size for standard forms

#### Form Controls

**Text Input:**
```javascript
<ha-textfield
    label="Name"
    .value=${this._name}
    @input=${this._handleInput}
    placeholder="Enter name"
    helper-text="Optional help text"
    validationMessage="Error message">
</ha-textfield>
```

**Number Input:**
```javascript
<ha-selector
    .hass=${this.hass}
    .selector=${{ number: { min: 0, max: 100, step: 1, mode: 'box' } }}
    .value=${this._value}
    @value-changed=${this._handleChange}>
</ha-selector>
```

**Select/Dropdown:**
```javascript
<ha-select
    label="Choose Option"
    .value=${this._value}
    @selected=${this._handleSelect}
    @closed=${(e) => e.stopPropagation()}>
    <mwc-list-item value="option1">Option 1</mwc-list-item>
    <mwc-list-item value="option2">Option 2</mwc-list-item>
</ha-select>
```

**Entity Picker:**
```javascript
<ha-entity-picker
    .hass=${this.hass}
    .value=${this._entityId}
    .includeDomains=${['light', 'switch']}
    @value-changed=${this._handleEntityChange}
    allow-custom-entity>
</ha-entity-picker>
```

**Color Picker (LCARdS):**
```javascript
import '../components/form/lcards-color-picker.js';

<lcards-color-picker
    label="Background Color"
    .value=${this._color}
    .hass=${this.hass}
    @value-changed=${this._handleColorChange}>
</lcards-color-picker>
```

### 📐 Spacing Standards

**Section/Row Spacing:**
- Sections: `margin-bottom: 12px`
- Form rows: `margin-bottom: 12px`
- Section gaps: `gap: 12px`

**Gap Spacing:**
- Control gaps: `gap: 8px`
- Button groups: `gap: 8px`
- Grid columns: `gap: 12px`

**CSS Example:**
```css
.form-section {
    margin-bottom: 12px;
}

.form-row {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
}

.button-group {
    display: flex;
    gap: 8px;
    justify-content: flex-end; /* Right-align actions */
}
```

### 🎨 Layout Patterns

#### Form Sections
```javascript
import '../components/form/lcards-form-section.js';

html`
    <lcards-form-section
        header="Section Title"
        description="Optional description"
        icon="mdi:cog"
        ?expanded=${true}
        ?outlined=${true}
        headerLevel="4">

        <!-- Form fields here -->
    </lcards-form-section>
`
```

#### Two-Column Grid
```javascript
import '../components/form/lcards-grid-layout.js';

html`
    <lcards-grid-layout>
        <ha-textfield label="Left"></ha-textfield>
        <ha-textfield label="Right"></ha-textfield>
    </lcards-grid-layout>
`
```

#### Right-Aligned Actions
```javascript
html`
    <div class="form-row">
        <ha-textfield label="Name"></ha-textfield>
        <div class="actions" style="display: flex; gap: 8px; justify-content: flex-end;">
            <ha-button variant="danger">
                <ha-icon icon="mdi:delete" slot="icon"></ha-icon>
                Remove
            </ha-button>
        </div>
    </div>
`
```

### 🔍 Validation Patterns

#### Required Field Validation
```javascript
_handleSave() {
    if (!this._name || this._name.trim() === '') {
        this._showError('Name is required');
        return;
    }
    // Proceed with save
}
```

#### Custom Validation
```javascript
_isValidCustomName() {
    return this._name && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(this._name);
}

html`
    <ha-textfield
        .value=${this._name}
        ?invalid=${!this._isValidCustomName()}
        validationMessage="Must start with letter/underscore">
    </ha-textfield>
`
```

### 🎯 Event Handling Patterns

#### Value Changed Events
```javascript
_handleChange(event) {
    const value = event.detail.value;
    this._updateConfig({ myField: value });
}
```

#### Select Events
```javascript
_handleSelect(event) {
    const value = event.target.value;
    this._updateConfig({ myField: value });
    event.stopPropagation(); // Prevent event bubbling
}
```

#### Dialog Close Events
```javascript
@closed=${(e) => {
    this._resetDialogState();
    this.requestUpdate();
}}
```

### 📝 Common Anti-Patterns to Avoid

#### ❌ DON'T: Custom tab CSS
```javascript
// WRONG - Custom tab styling
.content-tab {
    padding: 8px 16px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
}
.content-tab.active {
    border-bottom-color: var(--primary-color);
}
```

#### ✅ DO: Use ha-tab-group
```javascript
// CORRECT - Native HA tabs
<ha-tab-group @wa-tab-show=${this._handleTabChange}>
    <ha-tab-group-tab value="config" ?active=${this._activeTab === 'config'}>
    </ha-tab-group-tab>
</ha-tab-group>
```

#### ❌ DON'T: Plain HTML buttons
```javascript
// WRONG - Plain HTML button
<button class="custom-add-button" @click=${this._handleAdd}>Add</button>
```

#### ✅ DO: Use ha-button
```javascript
// CORRECT - HA button with icon
<ha-button variant="brand" appearance="accent" @click=${this._handleAdd}>
    <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
    Add
</ha-button>
```

#### ❌ DON'T: Inconsistent spacing
```javascript
// WRONG - Mixed spacing values
.section { margin-bottom: 16px; }
.row { margin-bottom: 20px; }
.group { gap: 24px; }
```

#### ✅ DO: Standard spacing
```javascript
// CORRECT - Consistent spacing
.section { margin-bottom: 12px; }
.row { margin-bottom: 12px; }
.group { gap: 12px; }
```

### 🧪 Testing Checklist

Before submitting editor code:

- [ ] All tabs use `ha-tab-group` with proper event handling
- [ ] All dialogs use `lcards-dialog` with slot-based headers
- [ ] All buttons use `ha-button` with correct variants
- [ ] All form controls use HA components (`ha-textfield`, `ha-select`, etc.)
- [ ] Spacing follows standards (12px sections, 8px gaps)
- [ ] Destructive actions right-aligned with `variant="danger"`
- [ ] Icons in buttons use `slot="icon"`
- [ ] Dialog close events handled properly
- [ ] No `customElements.get()` fallback checks
- [ ] Build succeeds without errors
- [ ] Editor renders correctly in Home Assistant
- [ ] Config changes persist correctly

### 📚 Reference Implementations

**Good Examples to Follow:**
- `lcards-button-editor.js` - Complete 8-tab editor with all patterns
- `lcards-datasource-dialog.js` - Dialog with proper header slot
- `lcards-multi-text-editor.js` - Complex form with ha-button conversion
- `lcards-template-sandbox.js` - Tabs with scrollable content

**Components to Use:**
- `lcards-form-section.js` - Collapsible sections
- `lcards-form-field.js` - Schema-driven fields
- `lcards-grid-layout.js` - Responsive two-column layout
- `lcards-color-picker.js` - Unified color picker with CSS vars
- `lcards-dialog.js` - Standard dialog wrapper

---

## Quick Start

### Creating a New Card Editor

1. **Register Schema in Card Class** (`cards/lcards-mycard.js`):
```javascript
import { LCARdSCard } from '../base/LCARdSCard.js';

// Import editor component for getConfigElement()
import '../editor/cards/lcards-mycard-editor.js';

export class LCARdSMyCard extends LCARdSCard {
    static CARD_TYPE = 'mycard';

    static getStubConfig() {
        return {
            type: 'custom:lcards-mycard',
            entity: 'light.example'
        };
    }

    static getConfigElement() {
        // Static import - editor bundled with card
        return document.createElement('lcards-mycard-editor');
    }
}

// Register schema with CoreConfigManager singleton
if (window.lcardsCore?.configManager) {
    window.lcardsCore.configManager.registerCardSchema('mycard', {
        type: 'object',
        properties: {
            entity: { type: 'string', description: 'Entity ID' },
            preset: { type: 'string', enum: ['lozenge', 'bullet'] }
        },
        required: ['type', 'entity']
    });
}
```

2. **Create Editor** (`editor/cards/lcards-mycard-editor.js`):
```javascript
import { LCARdSBaseEditor } from '../base/LCARdSBaseEditor.js';

export class LCARdSMyCardEditor extends LCARdSBaseEditor {
    constructor() {
        super();
        this.cardType = 'mycard'; // Set card type for schema lookup
    }

    _getTabDefinitions() {
        return [
            { label: 'Config', content: () => this._renderConfigTab() },
            { label: 'YAML', content: () => this._renderYamlTab() }
        ];
    }

    // Note: _getSchema() is NOT overridden
    // Base class queries singleton using this.cardType

    _renderConfigTab() { /* ... */ }
    _renderYamlTab() { /* ... */ }
}

customElements.define('lcards-mycard-editor', LCARdSMyCardEditor);
```

## Directory Structure

```
editor/
├── base/                    # Base classes and shared styles
│   ├── LCARdSBaseEditor.js  # Enhanced with path-based config access + helper methods
│   └── editor-styles.js     # Shared CSS
├── cards/                   # Card-specific editors
│   └── lcards-button-editor.js  # Reference implementation
├── components/              # Reusable editor components
│   ├── common/             # Common UI components
│   ├── dashboard/          # Dashboard components
│   │   └── lcards-rules-dashboard.js  # Read-only rules viewer
│   ├── datasources/        # Datasource editor components
│   │   ├── lcards-datasource-editor-tab.js  # Main datasource tab
│   │   └── ...             # Related datasource components
│   ├── form/               # Schema-driven form components
│   │   ├── lcards-form-field.js         # Smart auto-rendering field
│   │   ├── lcards-form-section.js       # Collapsible sections
│   │   ├── lcards-grid-layout.js        # Two-column responsive layout
│   │   ├── lcards-color-selector.js     # LCARS palette + custom colors
│   │   ├── lcards-color-section.js      # State-based color groups (enhanced)
│   │   ├── lcards-color-picker.js       # NEW: Unified color picker with CSS vars
│   │   ├── lcards-object-editor.js      # NEW: Generic object property editor
│   │   ├── lcards-entity-field.js       # Entity picker wrapper
│   │   ├── lcards-multi-text-editor.js  # Multi-text field manager
│   │   ├── lcards-icon-editor.js        # Icon config (simple/advanced)
│   │   ├── lcards-border-editor.js      # Border config with preview
│   │   ├── lcards-segment-list-editor.js # SVG segment manager
│   │   └── lcards-multi-action-editor.js # Unified action editor
│   ├── templates/          # NEW: Template and token browser components
│   │   ├── lcards-template-evaluation-tab.js  # Template discovery & evaluation
│   │   └── lcards-theme-token-browser-tab.js  # Theme token browser
│   └── yaml/               # YAML editor
└── utils/                  # Utility functions
    └── yaml-utils.js       # YAML conversion (uses js-yaml)

utils/                      # Shared utilities (not editor-specific)
└── schema-helpers.js       # Schema navigation and formatting

Note: Schemas are NOT stored in editor directory.
Cards register schemas with CoreConfigManager singleton.
Validation is performed by CoreValidationService singleton.
```

## Key Components

### Base Editor
- **LCARdSBaseEditor** - Abstract base class with path-based config access
  - `_getConfigValue(path)` - Get value by dot-notation path
  - `_setConfigValue(path, value)` - Set value with automatic deep merge
  - `_getSchemaForPath(path)` - Get schema for specific path
  - `_evaluateCondition(condition)` - Evaluate visibility/disabled conditions
  - **NEW Helper Methods:**
    - `_renderTextPadding(basePath)` - 2x2 padding grid editor
    - `_renderFontConfig(basePath)` - Font size/weight/family section
    - `_renderTextAlignment(basePath)` - Position/rotation/justify/align section
    - `_renderTextColors(basePath, states)` - State-based color section
    - `_renderTextFieldSection(fieldName, expanded)` - Complete text field editor
    - `_renderIconSection()` - Complete icon configuration section

### Form Components
- **lcards-form-field** - Smart field that auto-renders based on schema
  - Supports: entity, color, action formats
  - Handles: boolean, number, string, enum, array types
  - Auto-generates labels from schema or path
- **lcards-form-section** - Collapsible section with ha-expansion-panel
- **lcards-grid-layout** - Responsive two-column layout (stacks on mobile)
- **lcards-color-selector** - Color picker with LCARS palette presets
- **lcards-color-section** - Specialized for state-based colors (enhanced with color-picker)
- **lcards-entity-field** - Entity picker with domain filtering

### Enhanced Form Components
- **lcards-color-picker** (NEW v1.18.0) - Unified color picker
  - Dynamically scans CSS variables (--lcards-*, --picard-*, --lcars-*, --cblcars-*)
  - Dropdown with variables + special options (transparent, Match Light Colour)
  - Custom color text input for manual hex/rgb/var() entry
  - Live preview with computed color + luminance-based text contrast
  - Cached variable scanning for performance
- **lcards-object-editor** (NEW v1.18.0) - Generic object property editor
  - Auto-generated mode: properties array + controlType
  - Slotted mode: manual controls for mixed types
  - Responsive grid layout (1-4 columns)
  - Auto-generates labels from property names (snake_case → Title Case)
  - Supports number, text, boolean, select control types
  - Ideal for padding, margin, font configs, etc.
- **lcards-multi-text-editor** - Manage multiple text fields with per-field styling
  - Add/edit/remove text fields dynamically
  - Per-field positioning, fonts, colors
  - State-based color support
  - Template toggle per field
  - Visibility toggle
- **lcards-icon-editor** - Icon configuration with simple/advanced modes
  - Simple mode: icon string + basic controls
  - Advanced mode: full styling (position, size, rotation, background)
  - State-based icon colors
  - Background configuration (color, radius, padding)
- **lcards-border-editor** - Border configuration with visual preview
  - Unified/per-side width toggle
  - Unified/per-corner radius toggle
  - State-based border colors
  - Live SVG preview
- **lcards-segment-list-editor** - SVG segment management
  - Add/remove/edit segments
  - Per-segment entity and actions
  - Compact summary view with expand for details
- **lcards-multi-action-editor** - Unified action configuration
  - Tap, hold, and double-tap actions in one view
  - Uses existing lcards-action-editor for each type
  - Collapsible sections per action type

### Dashboard Components
- **lcards-rules-dashboard** - Read-only rules viewer (NEW v1.18.0)
  - Displays all rules from `window.lcards.core.rulesManager`
  - Highlights rules targeting the current card
  - Sortable table with rule ID, type, enabled status, target, conditions, and actions
  - Stats header showing total rules, targeting rules, and enabled rules
  - Help section with YAML examples
  - **Read-only**: No ability to add/edit/delete rules (edit in YAML instead)
  - Usage: Add `_renderRulesTab()` to card editor tabs

### Legacy Components
- **LCARdSCardConfigSection** - Common card properties (entity, ID, tags, layout)
- **LCARdSActionEditor** - Action configuration (tap, hold, double-tap)
- **LCARdSMonacoYamlEditor** - YAML editor with validation

## Features

✅ **Tab-based UI** - Organize editor into logical sections
✅ **YAML synchronization** - Visual tabs ↔ YAML tab bidirectional sync
✅ **Schema validation** - Uses CoreValidationService singleton for production-grade validation
✅ **Singleton pattern** - Schemas queried from CoreConfigManager
✅ **HA integration** - Uses Home Assistant's standard components
✅ **Graceful fallbacks** - Works without HA-specific components
✅ **Schema-driven forms** - Smart components that auto-render based on schema
✅ **Path-based access** - Dot-notation for nested config values
✅ **Responsive layout** - Two-column grids that stack on mobile
✅ **Collapsible sections** - Organize complex forms efficiently

## Architecture Patterns

- **Schema Registration**: Cards register schemas with `configManager.registerCardSchema()`
- **Schema Query**: Editors query via `configManager.getCardSchema(cardType)`
- **Validation**: Uses `validationService.validate()` for comprehensive validation
- **Static Imports**: Editor imported statically in card file (webpack compatibility)
- **Deep Merge**: Uses `core/config-manager/merge-helpers.js` (no duplication)
- **Path-based Access**: Use dot-notation paths for nested config access

## Using the New Form Components

### Schema-Driven Form Field

The `lcards-form-field` component automatically renders the appropriate control based on schema:

```javascript
import '../components/form/lcards-form-field.js';

_renderConfigTab() {
    return html`
        <!-- Auto-renders entity picker based on schema format -->
        <lcards-form-field
            .editor=${this}
            path="entity"
            label="Entity">
        </lcards-form-field>

        <!-- Auto-renders dropdown for enum types -->
        <lcards-form-field
            .editor=${this}
            path="preset"
            label="Style Preset">
        </lcards-form-field>

        <!-- Auto-renders number input with min/max from schema -->
        <lcards-form-field
            .editor=${this}
            path="grid_columns">
        </lcards-form-field>
    `;
}
```

### Collapsible Sections

```javascript
import '../components/form/lcards-form-section.js';

_renderConfigTab() {
    return html`
        <lcards-form-section
            header="Basic Configuration"
            description="Core card settings"
            ?expanded=${true}>

            <lcards-form-field .editor=${this} path="entity"></lcards-form-field>
            <lcards-form-field .editor=${this} path="id"></lcards-form-field>
        </lcards-form-section>

        <lcards-form-section
            header="Advanced"
            ?expanded=${false}
            outlined>

            <lcards-form-field .editor=${this} path="update_interval"></lcards-form-field>
        </lcards-form-section>
    `;
}
```

### Two-Column Layout

```javascript
import '../components/form/lcards-grid-layout.js';

_renderConfigTab() {
    return html`
        <lcards-form-section header="Layout">
            <lcards-grid-layout>
                <lcards-form-field .editor=${this} path="grid_columns"></lcards-form-field>
                <lcards-form-field .editor=${this} path="grid_rows"></lcards-form-field>
            </lcards-grid-layout>
        </lcards-form-section>
    `;
}
```

### Using Path-Based Config Access

```javascript
// Get nested config value
const borderColor = this._getConfigValue('style.color.border.default');

// Set nested config value (auto-merges)
this._setConfigValue('style.color.border.default', '#ff9900');

// Get schema for specific path
const schema = this._getSchemaForPath('style.color.border.default');
```

### Enhanced Components Usage

#### Multi-Text Editor
```javascript
import '../components/form/lcards-multi-text-editor.js';

_renderTextTab() {
    return html`
        <lcards-multi-text-editor
            .editor=${this}
            .textConfig=${this.config.text || {}}
            .presetFields=${['name', 'label', 'state']}
            .hass=${this.hass}
            @value-changed=${(e) => this._setConfigValue('text', e.detail.value)}>
        </lcards-multi-text-editor>
    `;
}
```

#### Icon Editor
```javascript
import '../components/form/lcards-icon-editor.js';

_renderIconTab() {
    return html`
        <lcards-icon-editor
            .editor=${this}
            path="icon"
            label="Icon Configuration"
            .hass=${this.hass}
            @value-changed=${(e) => this._setConfigValue('icon', e.detail.value)}>
        </lcards-icon-editor>
    `;
}
```

#### Border Editor
```javascript
import '../components/form/lcards-border-editor.js';

_renderBorderTab() {
    return html`
        <lcards-border-editor
            .editor=${this}
            path="style.border"
            label="Border Configuration"
            ?showPreview=${true}
            @value-changed=${(e) => this._setConfigValue('style.border', e.detail.value)}>
        </lcards-border-editor>
    `;
}
```

#### Segment List Editor
```javascript
import '../components/form/lcards-segment-list-editor.js';

_renderSegmentsTab() {
    return html`
        <lcards-segment-list-editor
            .editor=${this}
            .segments=${this.config.svg?.segments || []}
            .hass=${this.hass}
            ?expanded=${true}
            @value-changed=${this._handleSegmentsChange}>
        </lcards-segment-list-editor>
    `;
}

_handleSegmentsChange(event) {
    const segments = event.detail.value;
    this._updateConfig({
        svg: {
            ...(this.config.svg || {}),
            segments
        }
    });
}
```

#### Multi-Action Editor
```javascript
import '../components/form/lcards-multi-action-editor.js';

_renderActionsTab() {
    return html`
        <lcards-multi-action-editor
            .hass=${this.hass}
            .actions=${{
                tap_action: this.config.tap_action || { action: 'toggle' },
                hold_action: this.config.hold_action || { action: 'more-info' },
                double_tap_action: this.config.double_tap_action || { action: 'none' }
            }}
            @value-changed=${this._handleActionsChange}>
        </lcards-multi-action-editor>
    `;
}

_handleActionsChange(event) {
    const actions = event.detail.value;
    this._updateConfig({
        tap_action: actions.tap_action,
        hold_action: actions.hold_action,
        double_tap_action: actions.double_tap_action
    });
}
```

#### Rules Dashboard
```javascript
import '../components/dashboard/lcards-rules-dashboard.js';

_renderRulesTab() {
    return html`
        <lcards-rules-dashboard
            .editor=${this}
            .cardId=${this.config.id || this.config.cardId || ''}
            .hass=${this.hass}>
        </lcards-rules-dashboard>
    `;
}

// Add to tab definitions
_getTabDefinitions() {
    return [
        { label: 'Config', content: () => this._renderConfigTab() },
        { label: 'Actions', content: () => this._renderActionsTab() },
        { label: 'Rules', content: () => this._renderRulesTab() },  // NEW
        { label: 'YAML', content: () => this._renderYamlTab() }
    ];
}
```

**Note**: The Rules Dashboard is read-only. It displays rules from `window.lcards.core.rulesManager` but does not allow editing. Users must edit rules in YAML configuration.

### Complete Example

See `src/editor/cards/lcards-button-editor.js` for a complete reference implementation using all new components.

### Using New Components (v1.18.0)

#### Unified Color Picker

```javascript
import '../components/form/lcards-color-picker.js';

_renderColorTab() {
    return html`
        <!-- Unified color picker with CSS variable scanning -->
        <lcards-color-picker
            .hass=${this.hass}
            .value=${this._getConfigValue('style.color.background')}
            .variablePrefixes=${['--lcards-', '--picard-']}
            ?showPreview=${true}
            @value-changed=${(e) => this._setConfigValue('style.color.background', e.detail.value)}>
        </lcards-color-picker>
    `;
}
```

#### Object Editor for Padding

```javascript
import '../components/form/lcards-object-editor.js';

_renderPaddingSection() {
    return html`
        <!-- Auto-generated 2x2 padding grid -->
        <lcards-object-editor
            .editor=${this}
            path="style.padding"
            .properties=${['top', 'right', 'bottom', 'left']}
            controlType="number"
            .controlConfig=${{ min: 0, max: 100, mode: 'box' }}
            columns="2">
        </lcards-object-editor>
    `;
}
```

#### Using Base Editor Helper Methods

```javascript
// In your card editor extending LCARdSBaseEditor

_renderTextTab() {
    return html`
        <!-- Complete text field with padding, font, alignment, colors -->
        ${this._renderTextFieldSection('name', true)}
        ${this._renderTextFieldSection('label', false)}
        ${this._renderTextFieldSection('state', false)}
    `;
}

_renderIconTab() {
    return html`
        <!-- Complete icon section -->
        ${this._renderIconSection()}
    `;
}
```

#### Enhanced Color Section

```javascript
import '../components/form/lcards-color-section.js';

_renderColorsTab() {
    return html`
        <!-- State-based colors with enhanced picker -->
        <lcards-color-section
            .editor=${this}
            basePath="style.color.background"
            header="Background Colors"
            .states=${['default', 'active', 'inactive', 'unavailable']}
            ?useColorPicker=${true}
            ?showPreview=${true}
            ?expanded=${true}>
        </lcards-color-section>
    `;
}
```

#### Template Evaluation Tab (v1.19.0)
```javascript
import '../components/templates/lcards-template-evaluation-tab.js';

_renderTemplatesTab() {
    return html`
        <!-- Template discovery and evaluation -->
        <lcards-template-evaluation-tab
            .editor=${this}
            .config=${this.config}
            .hass=${this.hass}>
        </lcards-template-evaluation-tab>
    `;
}

// Add to tab definitions
_getTabDefinitions() {
    return [
        { label: 'Config', content: () => this._renderConfigTab() },
        { label: 'Templates', content: () => this._renderTemplatesTab() },  // NEW
        { label: 'YAML', content: () => this._renderYamlTab() }
    ];
}
```

**Features:**
- Scans entire config for templates (JavaScript, Tokens, Theme, Datasource, Jinja2)
- Shows live evaluation results with error handling
- Provides syntax reference panel
- Filter by template type
- Copy results to clipboard

#### Theme Token Browser (v1.19.0)
```javascript
import '../components/templates/lcards-theme-token-browser-tab.js';

_renderThemeTokensTab() {
    return html`
        <!-- Theme token browser and usage tracker -->
        <lcards-theme-token-browser-tab
            .editor=${this}
            .config=${this.config}
            .hass=${this.hass}>
        </lcards-theme-token-browser-tab>
    `;
}

// Add to tab definitions
_getTabDefinitions() {
    return [
        { label: 'Config', content: () => this._renderConfigTab() },
        { label: 'Theme Tokens', content: () => this._renderThemeTokensTab() },  // NEW
        { label: 'YAML', content: () => this._renderYamlTab() }
    ];
}
```

**Features:**
- Browse all tokens from active theme
- Search and filter by category (colors, typography, spacing, etc.)
- Type-aware previews (color swatches, font samples)
- Track token usage in current config
- Copy with proper LCARdS syntax: `{theme:token.path}`

**Token Syntax Reference:**
- **Theme tokens**: `{theme:colors.accent.primary}` (single braces)
- **Datasource tokens**: `{datasource:sensor.temp}` or `{ds:sensor.temp}`
- **Simple tokens**: `{entity.state}`, `{config.entity}`
- **JavaScript**: `[[[return entity.state]]]`
- **Jinja2**: `{{states('sensor.temp')}}` (double braces)

See [Template & Token Documentation](../../doc/TEMPLATE_EVALUATION_THEME_BROWSER.md) for detailed usage.

## Documentation

See [Visual Editor Architecture](../../doc/architecture/visual-editor-architecture.md) for detailed documentation.

## Test Examples

See `doc/user/examples/button-visual-editor-test.yaml` for comprehensive test configurations demonstrating all features.

---

## Issue #82: Editor-Wide Consistency & Style Pass

### Overview
Comprehensive polish and consistency pass across all editor components to standardize tabs, dialogs, headers, and form elements to LCARdS standard. This is the final UX/QA pass for editor launch.

### Implementation Strategy

#### Phase 1: Tab Standardization ✅ (COMPLETED)
**Goal**: Replace all custom tab implementations with HA native `<ha-tab-group>` components.

**Completed Components**:
- ✅ **LCARdSBaseEditor** - Main editor tabs (Config, Advanced, Data Sources, Rules, Templates, Theme Browser, Provenance, YAML)
  - Converted from custom `.tab` buttons to `<ha-tab-group>`
  - Affects ALL card editors automatically (Button + future editors)
  - Removed ~60 lines of custom tab CSS

- ✅ **Theme Browser Dialog** - Two tab groups converted:
  - Main tabs: LCARdS Tokens, LCARS CSS, All CSS, Alert Lab
  - Alert Mode Lab visualization tabs: Live Preview, HSL Wheel, Full Comparison
  - Removed ~90 lines of custom `.view-tab` and `.viz-tab` CSS

- ✅ **Provenance Dialog** - Config Tree, Theme Tokens, Statistics
  - Supports icons and count badges in tabs
  - Removed ~55 lines of custom `.view-tab` CSS

- ✅ **DataSource Editor** - Card Sources, Global Sources
  - Refactored to use `<ha-tab-panel>` structure
  - Removed ~40 lines of custom `.tab` CSS

**HA Native Tab Pattern**:
```javascript
// Event: @wa-tab-show (WebAwesome event)
// Structure: tabs AND panels must be children of ha-tab-group
<ha-tab-group @wa-tab-show=${this._handleTabChange}>
  <ha-tab-group-tab value="0" ?active=${this._selectedTab === 0}>
    Label
  </ha-tab-group-tab>
  <ha-tab-panel value="0" ?hidden=${this._selectedTab !== 0}>
    Content
  </ha-tab-panel>
</ha-tab-group>

_handleTabChange(event) {
  // CRITICAL: Use getAttribute('value'), NOT .value property
  const value = event.target.activeTab.getAttribute('value');
  this._selectedTab = parseInt(value, 10);
  this.requestUpdate(); // Must manually trigger re-render
}
```

**Key Discoveries**:
- Must use `getAttribute('value')` not `.value` property (WebComponents pattern)
- Panels must be children of `<ha-tab-group>`, not siblings
- No automatic panel switching - must manually manage `hidden` attribute
- Event is `@wa-tab-show`, not other variants

**CSS Cleanup**:
- Removed ~200+ lines of custom tab styles (`.tab`, `.view-tab`, `.viz-tab`)
- Retained `.tabs-container` for scrollbar styling only (not tab buttons)
- No orphaned styles remaining in `editor-styles.js`

---

#### Phase 2: Dialog & Button Standardization 🔜 (NEXT)
**Goal**: Standardize all dialog headers/footers and migrate buttons to `ha-button`.

##### ⚠️ DECISION: Keep `ha-dialog` for ALL dialogs

**DISCOVERY**: After extensive testing, `ha-wa-dialog` doesn't work reliably in our context:

1. **Imperative Pattern**: Does NOT work - dialog stays inert, never opens
2. **Declarative Pattern**: Renders inline within component shadow DOM instead of as modal overlay

**Root Cause**: Unknown - may be related to:
- Shadow DOM nesting (card editor → tabs → dialog)
- Z-index stacking context issues: https://github.com/home-assistant/frontend/issues/27715
- Component lifecycle timing

**Decision**: **Keep `ha-dialog` for ALL 8 dialogs** - proven, reliable pattern that works imperatively AND declaratively.

**Focus Instead On**:
- ✅ Standardize button usage (`ha-button` with proper variants)
- ✅ Standardize dialog headers (consistent structure across all dialogs)
- ✅ Standardize button placement (primaryAction/secondaryAction slots)
- ✅ Clean up CSS and spacing

---

##### Dialog Standardization Checklist

**All 8 dialogs** (keep `ha-dialog`, standardize buttons/headers):

**Affected Components**:
- [ ] **Theme Browser** (`lcards-theme-token-browser-tab.js`) - Large dialog with tabs
  - Buttons: ✅ Uses `ha-button` in primaryAction slot
  - Action: Update to `variant="brand" appearance="accent"`

- [ ] **Provenance** (`lcards-provenance-tab.js`) - Medium dialog with tabs
  - Buttons: ✅ Uses `ha-button` in primaryAction slot
  - Action: Update to `variant="brand" appearance="accent"`
  - Header: Custom `.dialog-header` with tabs + count badges (already HA native)
  - Special: Icons and badges in tabs work correctly

- [ ] **Template Sandbox** (`lcards-template-sandbox.js`) - Split-pane dialog
  - Size: Very large (~95vw width preferred)
  - Heading: "🧪 Template Sandbox"
  - Structure: Split-pane (editor left, results right)
  - Buttons: Single "Close" in primaryAction slot
  - Header: None (uses heading slot only)
  - Special: No tabs, split layout with Monaco editor

- [ ] **DataSource Browser** (`lcards-datasource-browser.js`) - Tree/detail dialog
  - Size: Large (~85vw width preferred)
  - Heading: "DataSource Browser"
  - Structure: Split-pane (tree left, detail right)
  - Buttons: Single "Close" in primaryAction slot
  - Header: Custom `.dialog-header` with title only
  - Special: Tree navigation + detail panel

- [ ] **DataSource Dialog** (`lcards-datasource-dialog.js`) - Form dialog ✅ USES lcards-dialog
  - Size: Medium (~600px width)
  - Heading: Dynamic "Add Datasource" / "Edit Datasource: {name}"
  - Structure: Form with validation
  - Buttons: "Cancel" (secondaryAction, plain/neutral) + "Create/Save" (primaryAction, brand/accent) ✅ ALREADY CORRECT
  - Header: None (form starts immediately)
  - Special: Real-time entity validation, disabled fields in edit mode
  - **Note**: Uses `<lcards-dialog>` wrapper (needs update after wrapper conversion)

- [ ] **Transformation Dialog** (`lcards-transformation-dialog.js`) - Form dialog ✅ USES lcards-dialog
  - Size: Medium (~600px width)
  - Heading: Dynamic "Add Transformation" / "Edit: {key}"
  - Structure: Form with type selector + dynamic config
  - Buttons: "Cancel" (secondaryAction, plain) + "Create/Save" (primaryAction, brand/accent) ✅ ALREADY CORRECT
  - Header: None (form starts immediately)
  - Special: YAML editor mode option
  - **Note**: Uses `<lcards-dialog>` wrapper (needs update after wrapper conversion)

- [ ] **Aggregation Dialog** (`lcards-aggregation-dialog.js`) - Form dialog ✅ USES lcards-dialog
  - Size: Medium (~600px width)
  - Heading: Dynamic "Add Aggregation" / "Edit: {key}"
  - Structure: Form with type selector + dynamic config
  - Buttons: "Cancel" (secondaryAction, plain) + "Create/Save" (primaryAction, brand/accent) ✅ ALREADY CORRECT
  - Header: None (form starts immediately)
  - Special: YAML editor mode option
  - **Note**: Uses `<lcards-dialog>` wrapper (needs update after wrapper conversion)

- [ ] **Rules Dashboard Detail** (`lcards-rules-dashboard.js`) - Preview dialog
  - Size: Medium (~700px width)
  - Heading: "Rule Details"
  - Structure: Simple detail rows (label/value pairs)
  - Buttons: Single "Close" in primaryAction slot
  - Header: None (detail rows start immediately)
  - Special: Read-only rule preview, no editing

- [x] **lcards-dialog wrapper** (`shared/lcards-dialog.js`) - **PRIORITY: Update first**
  - Current: Wraps `ha-dialog`, filters 'closed' events from children (ha-select)
  - Target: Must wrap `ha-wa-dialog` instead
  - Critical: Used by DataSource/Transformation/Aggregation dialogs
  - Impact: 3 dialogs depend on this wrapper working correctly

**Migration Pattern**:
```javascript
// Old ha-dialog pattern
<ha-dialog
  open
  @closed=${this._closeDialog}
  .heading=${'Dialog Title'}>
  <div class="dialog-content">
    <!-- Content -->
  </div>
  <ha-button
    slot="primaryAction"
    @click=${this._closeDialog}
    dialogAction="close">
    Close
  </ha-button>
</ha-dialog>

// New ha-wa-dialog pattern
<ha-wa-dialog
  open
  @closed=${this._closeDialog}>
  <span slot="heading">
    <ha-icon icon="mdi:information"></ha-icon>
    Dialog Title
  </span>

  <div class="dialog-content">
    <!-- Content -->
  </div>

  <ha-dialog-footer slot="footer">
    <ha-button
      appearance="plain"
      variant="neutral"
      @click=${this._cancel}>
      Cancel
    </ha-button>
    <ha-button
      variant="brand"
      @click=${this._save}>
      Save
    </ha-button>
  </ha-dialog-footer>
</ha-wa-dialog>
```

**CSS Sizing Options**:
```css
/* Option 1: CSS variable (preferred for responsive) */
ha-wa-dialog {
  --width: 90vw;
  --max-width: 1200px;
}

/* Option 2: Direct property (explicit control) */
<ha-wa-dialog width="800px">
```

---

##### Header Standardization

All dialog headers should use consistent structure (from Issue #82):

```html
<div class="dialog-header">
  <div class="header-left">
    <h2>Section Title</h2>
    <span class="helper-text">Description or count</span>
  </div>
  <div class="header-actions">
    <ha-button size="small" variant="text">Action</ha-button>
  </div>
</div>
```

**Standard CSS** (add to components):
```css
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 2px solid var(--divider-color);
  margin-bottom: 16px;
}

.header-left h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0 0 4px 0;
}

.header-left .helper-text {
  font-size: 13px;
  color: var(--secondary-text-color);
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
```

---

##### Button Standardization with ha-button

**✅ Recommendation: Migrate all buttons to `ha-button`**

HA's `ha-button` provides comprehensive functionality with proper semantic variants:

**API Overview** (from HA docs):
- **Sizes**: `small`, `medium` (default), `large`
- **Appearance**: `accent` (default), `filled`, `plain`
- **Variants**: `brand`, `danger`, `neutral`, `warning`, `success`
- **States**: `disabled`, `loading` (with spinner)
- **Icons**: Supports icon slots

**Current State**:
```javascript
// Mixed button usage found:
- ha-button: Already used in ~60% of dialogs ✅
- mwc-button: Used in ~40% (DataSource Editor, Browser, Segment Editor, etc.) ❌
```

**Migration Pattern**:
```javascript
// ❌ OLD: mwc-button (Material Web Components)
<mwc-button raised @click=${handler}>
  <ha-icon icon="mdi:plus"></ha-icon>
  Add Item
</mwc-button>

// ✅ NEW: ha-button with proper appearance/variants
<ha-button @click=${handler}>
  <ha-icon slot="icon" icon="mdi:plus"></ha-icon>
  Add Item
</ha-button>

// Appearance options (visual style)
<ha-button appearance="accent">Accent Button</ha-button>   // Default, prominent style
<ha-button appearance="filled">Filled Button</ha-button>   // Solid background
<ha-button appearance="plain">Plain Button</ha-button>     // Minimal style

// Variant options (semantic meaning)
<ha-button variant="brand">Brand Action</ha-button>        // Primary brand color
<ha-button variant="danger">Delete</ha-button>             // ⚠️ Destructive actions (red)
<ha-button variant="neutral">Cancel</ha-button>            // Neutral/secondary actions
<ha-button variant="warning">Warning</ha-button>           // Warning actions (yellow)
<ha-button variant="success">Confirm</ha-button>           // Success actions (green)

// Combined appearance + variant
<ha-button appearance="filled" variant="danger">Delete Item</ha-button>  // Solid red delete
<ha-button appearance="plain" variant="neutral">Cancel</ha-button>       // Subtle cancel

// Button sizes
<ha-button size="small">Small</ha-button>
<ha-button size="medium">Medium</ha-button>                // Default
<ha-button size="large">Large</ha-button>

// Button states
<ha-button ?disabled=${condition}>Disabled</ha-button>
<ha-button ?loading=${isLoading}>Loading...</ha-button>    // Shows spinner
```

**Semantic Usage Guidelines**:
```javascript
// ✅ DO: Use variant="danger" for destructive actions
<ha-button variant="danger" @click=${this._deleteItem}>
  <ha-icon slot="icon" icon="mdi:delete"></ha-icon>
  Delete
</ha-button>

// ✅ DO: Use variant="neutral" for cancel/secondary
<ha-button variant="neutral" @click=${this._cancel}>Cancel</ha-button>

// ✅ DO: Use variant="success" for confirmation/save
<ha-button variant="success" @click=${this._save}>Save</ha-button>

// ✅ DO: Use variant="warning" for cautionary actions
<ha-button variant="warning" @click=${this._reset}>Reset to Defaults</ha-button>

// ✅ DO: Use variant="brand" for primary actions
<ha-button variant="brand" @click=${this._create}>Create New</ha-button>
```

**Components Using mwc-button** (need conversion):
- [ ] **DataSource Editor Tab** (`lcards-datasource-editor-tab.js`) - Launch button
- [ ] **DataSource Browser** (`lcards-datasource-browser.js`) - Action buttons
- [ ] **Segment Editor** (`lcards-unified-segment-editor.js`) - Add/remove buttons
- [ ] **Aggregation List Editor** (`lcards-aggregation-list-editor.js`) - Add button

**Standard Button Patterns**:
```javascript
// Dialog footer buttons (right-aligned, primary last)
<ha-dialog-footer slot="footer">
  <ha-button appearance="plain" variant="neutral" @click=${cancel}>
    Cancel
  </ha-button>
  <ha-button appearance="plain" variant="warning" @click=${reset}>
    Reset
  </ha-button>
  <ha-button variant="brand" @click=${save}>
    Save
  </ha-button>
</ha-dialog-footer>

// Destructive dialog footer (delete confirmation)
<ha-dialog-footer slot="footer">
  <ha-button appearance="plain" variant="neutral" @click=${cancel}>
    Cancel
  </ha-button>
  <ha-button variant="danger" @click=${deleteItem}>
    Delete
  </ha-button>
</ha-dialog-footer>

// Launch/action buttons in headers
<div class="header-actions">
  <ha-button size="small" appearance="plain" @click=${handler}>
    <ha-icon slot="icon" icon="mdi:refresh"></ha-icon>
    Refresh
  </ha-button>
</div>

// Inline action buttons (edit/modify)
<ha-button size="small" appearance="plain" @click=${handler}>
  <ha-icon slot="icon" icon="mdi:pencil"></ha-icon>
  Edit
</ha-button>

// Inline destructive buttons (delete)
<ha-button size="small" appearance="plain" variant="danger" @click=${deleteHandler}>
  <ha-icon slot="icon" icon="mdi:delete"></ha-icon>
  Delete
</ha-button>

// Loading state for async operations
<ha-button ?loading=${this._isSaving} variant="success" @click=${this._save}>
  Save Changes
</ha-button>
```

**CSS Customization** (if needed):
```css
ha-button {
  --mdc-theme-primary: var(--primary-color);
  --ha-button-border-radius: 8px;
}

/* Size-specific styling */
ha-button[size="small"] {
  --ha-button-height: 32px;
}
```

---

**Requirements** (from Issue #82):
```css
.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 2px solid var(--divider-color);
}

.header-left h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin-bottom: 4px;
}

.header-left .helper-text {
  font-size: 13px;
  color: var(--secondary-text-color);
}

.header-actions {
  display: flex;
  gap: 8px;
}
```

**Components to Audit**:
- [ ] Theme Browser dialog header
- [ ] Provenance dialog header
- [ ] DataSource Editor header
- [ ] Template Sandbox header
- [ ] Rules Dashboard header
- [ ] All future card editor headers

**Action Buttons**:
- Use `<mwc-button>` for primary/launch actions (not plain buttons)
- Consistent icon usage with `<ha-icon>`

---

#### Phase 3: Launch Card Standardization ✅
**Goal**: All tab launch cards use LCARdS dark card style.

**Status**: COMPLETE - All components compliant.

**Standard Launch Card** (from Issue #82):
```css
.info-card {
  background: var(--primary-background-color);
  border: 1px solid var(--divider-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-card h3 {
  margin: 0 0 12px 0;
  color: var(--primary-text-color);
  font-size: 18px;
  font-weight: 500;
}

.info-card p {
  margin: 8px 0;
  color: var(--secondary-text-color);
  line-height: 1.5;
}

.info-card code {
  background: var(--secondary-background-color);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
}

.open-*-button {
  margin-top: 16px;
}
```

**Components Using Launch Cards**:
- [x] Theme Browser - Uses `.info-card` with compliant styling
- [x] Provenance - Uses `.info-card` with compliant styling
- [x] Template Evaluation - Uses plain `.header-row` (no launch card needed)
- [x] DataSource Editor - No launch card (uses inline action buttons)
- [x] Rules Dashboard - No launch card (direct table display)

**Findings**:
- Only Theme Browser and Provenance tabs use launch cards (`.info-card`)
- Both already use correct dark card styling with proper backgrounds
- Other tabs don't need launch cards - they use direct UI elements
- No action needed

---

#### Phase 4: HA Control Standardization ✅ AUDIT COMPLETE
**Goal**: Replace plain HTML controls with HA components.

**Status**: Audit complete - 33 plain HTML controls identified across 10 files.

**Control Priority**:
1. `lcards-*` custom components (if available)
2. `ha-selector` (entity, boolean, text, number, etc.)
3. `ha-textfield`, `ha-switch`, `ha-select`
4. Standard HTML only if nothing else fits

**Audit Results**:

| File | Plain Controls | Type | Notes |
|------|----------------|------|-------|
| `lcards-datasource-dialog.js` | 3 | 1 select, 2 inputs | Update interval dropdown, entity_id, history_size |
| `lcards-template-sandbox.js` | 5 | 2 selects, 3 inputs | Example dropdowns, mock entity state inputs |
| `lcards-theme-token-browser-tab.js` | 2 | 1 select, 1 input | Category filter, search input |
| `lcards-entity-field.js` | 1 | 1 input | Entity ID text input |
| `lcards-color-selector.js` | 1 | 1 input | Custom color hex input |
| `lcards-padding-editor.js` | 1 | 1 input | Numeric padding value |
| `lcards-action-editor.js` | 3 | 1 select, 2 inputs | Action type dropdown, service/navigation inputs |
| `lcards-card-config-section.js` | 7 | 2 selects, 5 inputs | ID, tags, preset, layout dropdowns + text inputs |

**Total**: 33 plain HTML controls requiring conversion

**Conversion Plan**:
- **Phase 4a**: DataSource Dialog (3 controls) - High visibility
- **Phase 4b**: Template Sandbox (5 controls) - High visibility
- **Phase 4c**: Remaining files (25 controls) - Lower priority

**Benefits**:
- Consistent styling with HA theme
- Better accessibility (ARIA labels, keyboard nav)
- Automatic theme color integration
- Validation states and error handling

---

### Next Steps

**Completed Phases**:
- [x] Phase 1: Tab standardization - All components use ha-tab-group
- [x] Phase 2a-d: Dialog & button standardization - All dialogs use ha-dialog, all buttons use ha-button
- [x] Phase 3: Launch card standardization - Theme Browser & Provenance already compliant

**Remaining Work**:
- [ ] Phase 4a: Convert DataSource Dialog controls (3 controls)
- [ ] Phase 4b: Convert Template Sandbox controls (5 controls)
- [ ] Phase 4c: Convert remaining editor controls (25 controls)
- [ ] Phase 5: Spacing consistency audit
- [ ] Phase 6: Code quality audit

---

#### Phase 5: Layout & Spacing Consistency 🔜
**Goal**: Consistent spacing/margins throughout editor.

**Current Values** (from `editor-styles.js`):
- Section margin: `12px`
- Form row margin: `12px`
- Form row group gap: `12px`
- Helper text margin: `4px`
- Button group gap: `8px`
- Expansion panel margin: `10px`

**Tasks**:
- [ ] Audit all components for inconsistent spacing
- [ ] Define/expand CSS vars as needed
- [ ] Always use `<lcards-form-section>` for grouped content

---

#### Phase 6: Code Quality 🔜
**Goal**: Ensure LCARdS coding standards.

**Requirements**:
- [ ] No `document.*` or global selectors (only `this.renderRoot`)
- [ ] Full JSDoc for public methods/props
- [ ] Consistent error handling
- [ ] Proper provenance tracking

---

### Testing Checklist

After each phase:
- [ ] Visual inspection of all editors
- [ ] Test in light/dark themes
- [ ] Verify no console errors
- [ ] Test responsive behavior (mobile/tablet)
- [ ] Verify keyboard navigation works
- [ ] Test with screen readers (accessibility)

### Files Modified (Phase 1 Complete)

**Core Files**:
- `src/editor/base/LCARdSBaseEditor.js` - Tab conversion, affects all editors
- `src/editor/base/editor-styles.js` - No changes needed (no orphaned styles)

**Component Files**:
- `src/editor/components/theme-browser/lcards-theme-token-browser-tab.js` - Dual tab conversion
- `src/editor/components/provenance/lcards-provenance-tab.js` - Dialog tabs
- `src/editor/components/datasources/lcards-datasource-editor-tab.js` - Panel structure

**Test Files**:
- `test/ha-tab-group-test.html` - Standalone test (deprecated, kept for reference)
- `test/ha-tab-group-prototype.js` - Lit component test (minimal use)
- `test/HA_TAB_TESTING_INSTRUCTIONS.md` - Testing documentation

### Acceptance Criteria

**Phase 1 (Tabs)**: ✅ COMPLETE (v1.21.0 - Issue #82)
- [x] All tabs use HA native `<ha-tab-group>` components
- [x] Custom tab CSS removed (~200+ lines)
- [x] Consistent event handling pattern (`@wa-tab-show`, `event.target.activeTab.getAttribute('value')`)
- [x] Icons and badges work in tabs
- [x] No regressions to behavior or theming

**Phase 2-6**: ✅ COMPLETE (v1.21.0 - Issue #82)
- [x] All dialogs use `lcards-dialog` with slot-based headers
- [x] All buttons use `ha-button` with proper variants
- [x] All launch cards use consistent dark style
- [x] Proper HA controls used throughout (zero plain HTML controls)
- [x] Consistent spacing/layout across all components (12px sections, 8px gaps)
- [x] Code quality standards met (zero fallback checks, document.* validated)
- [x] **~800+ lines of legacy code eliminated**
- [x] **35+ files standardized**
- [x] **2 obsolete files deleted**

**📋 See [Editor Development Standards](#️-editor-development-standards) for complete reference guide**

### Related Documentation

- [Editor Development Standards](#️-editor-development-standards) (comprehensive patterns guide)
- [HA Tab Testing Instructions](../../../test/HA_TAB_TESTING_INSTRUCTIONS.md)
- [Issue #82 on GitHub](https://github.com/snootched/LCARdS/issues/82)

## Status

### Phase 1: Enhanced Visual Editor ✅ (v1.17.0)
- ✅ Horizontal tab scrolling with fade indicators
- ✅ Multi-text field editor
- ✅ Icon editor (simple/advanced modes)
- ✅ Border editor with preview
- ✅ Segment list editor
- ✅ Multi-action editor
- ✅ 8-tab button editor structure
- ✅ State-based color support (existing component)

### Phase 1.5: Advanced Color & Object Editing ✅ (v1.18.0)
- ✅ Unified color picker with CSS variable scanning
- ✅ Generic object editor for padding/margins/fonts
- ✅ Enhanced color section with color picker integration
- ✅ Base editor helper methods for common patterns
- ✅ Button schema with 45 font families
- ✅ Complete alignment enums (justify, align, position)
- ✅ Match Light Colour support (CSS variable export)
- ✅ Rules Dashboard (read-only display of all rules in system)

### Phase 1.6: Template & Token Browser ✅ (v1.19.0)
- ✅ Template Evaluation Tab - Discover and debug all templates
- ✅ Theme Token Browser - Browse and use theme tokens
- ✅ Support for all template types (JavaScript, Tokens, Jinja2)
- ✅ Live template evaluation with error handling
- ✅ Token usage tracking across config
- ✅ Syntax reference and copy functionality
- ✅ Type-aware token previews (colors, fonts, spacing)

### Phase 2: Advanced Features (Future)
- 🔜 Animation editor with visual timeline
- 🔜 SVG background editor
- 🔜 Component/shape selector
- 🔜 Live preview panel
- 🔜 Enhanced oneOf handling with auto-toggle
- Enhanced base editor with path-based config access
- Smart form field component with auto-rendering
- Collapsible section components
- Responsive grid layouts
- Color selector with LCARS palette
- Entity picker wrapper
- Button card editor as reference implementation

### Phase 3: DataSource Builder 🔜 (Future)
- Visual datasource configuration
- Transform picker
- Preview

### Phase 4: Rules Engine Builder 🔜 (Future)
- Visual rule builder
- Condition tree
- Rule tester

### Phase 4: Enhanced Features 🔜 (Future)
- Full Monaco editor with IntelliSense
- Live card preview
- Theme preview
