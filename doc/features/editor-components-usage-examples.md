# Editor Components Usage Examples

Quick reference guide for using the enhanced editor components.

---

## Table of Contents

1. [Form Sections](#form-sections)
2. [Form Fields](#form-fields)
3. [Grid Layouts](#grid-layouts)
4. [Messages](#messages)
5. [Dividers](#dividers)
6. [Complete Examples](#complete-examples)

---

## Form Sections

### Basic Section

```javascript
<lcards-form-section
    header="Card Settings"
    ?expanded=${true}>
    <!-- fields here -->
</lcards-form-section>
```

### Section with Icon

```javascript
<lcards-form-section
    header="Card Settings"
    icon="mdi:cog"
    ?expanded=${true}
    ?outlined=${true}>
    <!-- fields here -->
</lcards-form-section>
```

### Advanced Section (All Features)

```javascript
<lcards-form-section
    header="Advanced Settings"
    description="Configure advanced card features"
    icon="mdi:wrench-cog-outline"
    secondary="[Expert]"
    headerLevel="4"
    ?expanded=${false}
    ?outlined=${true}
    ?noCollapse=${false}>
    <!-- fields here -->
</lcards-form-section>
```

### Non-Collapsible Section

```javascript
<lcards-form-section
    header="Required Settings"
    icon="mdi:alert-circle"
    ?noCollapse=${true}
    ?outlined=${true}>
    <!-- Always visible fields -->
</lcards-form-section>
```

---

## Form Fields

### Text Input

```javascript
<lcards-form-field
    .editor=${this}
    path="name"
    label="Card Name"
    helper="Display name for this card">
</lcards-form-field>
```

### Entity Picker

```javascript
<lcards-form-field
    .editor=${this}
    path="entity"
    label="Entity"
    helper="Select an entity to control">
</lcards-form-field>
```

### Number Input

```javascript
<lcards-form-field
    .editor=${this}
    path="grid_columns"
    label="Grid Columns"
    helper="Number of columns (1-12)">
</lcards-form-field>
```

### Boolean Toggle

```javascript
<lcards-form-field
    .editor=${this}
    path="show_icon"
    label="Show Icon"
    helper="Display entity icon">
</lcards-form-field>
```

### Select Dropdown

```javascript
<lcards-form-field
    .editor=${this}
    path="preset"
    label="Preset Style"
    helper="Choose a preset color scheme">
</lcards-form-field>
```

### Icon Picker

```javascript
<lcards-form-field
    .editor=${this}
    path="icon"
    label="Custom Icon"
    helper="Override entity icon">
</lcards-form-field>
```

### Required Field

```javascript
<lcards-form-field
    .editor=${this}
    path="entity"
    label="Entity"
    ?required=${true}
    helper="Entity is required for this card">
</lcards-form-field>
```

### Disabled Field

```javascript
<lcards-form-field
    .editor=${this}
    path="readonly_value"
    label="Read Only"
    ?disabled=${true}
    helper="This value cannot be changed">
</lcards-form-field>
```

---

## Grid Layouts

### Two-Column Grid

```javascript
<lcards-grid-layout>
    <lcards-form-field
        .editor=${this}
        path="grid_columns"
        label="Columns">
    </lcards-form-field>

    <lcards-form-field
        .editor=${this}
        path="grid_rows"
        label="Rows">
    </lcards-form-field>
</lcards-grid-layout>
```

### Custom Gap

```javascript
<lcards-grid-layout gap="16px">
    <!-- fields -->
</lcards-grid-layout>
```

### Three-Column Grid

```javascript
<lcards-grid-layout columns="3" gap="8px">
    <lcards-form-field .editor=${this} path="value1" label="Value 1"></lcards-form-field>
    <lcards-form-field .editor=${this} path="value2" label="Value 2"></lcards-form-field>
    <lcards-form-field .editor=${this} path="value3" label="Value 3"></lcards-form-field>
</lcards-grid-layout>
```

---

## Messages

### Info Message

```javascript
<lcards-message
    type="info"
    message="This is helpful information for the user.">
</lcards-message>
```

### Warning Message

```javascript
<lcards-message
    type="warning"
    title="Configuration Warning"
    message="This setting may affect card performance.">
</lcards-message>
```

### Error Message

```javascript
<lcards-message
    type="error"
    title="Configuration Error"
    message="Entity is required to use this feature.">
</lcards-message>
```

### Success Message

```javascript
<lcards-message
    type="success"
    message="Configuration saved successfully!">
</lcards-message>
```

### Message with Custom Content

```javascript
<lcards-message type="info" title="Advanced Usage">
    <p>You can include custom HTML content here.</p>
    <ul>
        <li>Bullet points</li>
        <li>Links</li>
        <li>Formatting</li>
    </ul>
</lcards-message>
```

---

## Dividers

### Basic Divider

```javascript
<lcards-divider></lcards-divider>
```

### Between Sections

```javascript
<lcards-form-section header="Section 1">
    <!-- content -->
</lcards-form-section>

<lcards-divider></lcards-divider>

<lcards-form-section header="Section 2">
    <!-- content -->
</lcards-form-section>
```

---

## Complete Examples

### Complete Tab with All Features

```javascript
_renderConfigTab() {
    return html`
        <!-- Info message at top -->
        <lcards-message
            type="info"
            message="Configure the basic settings for your card.">
        </lcards-message>

        <!-- Basic configuration section -->
        <lcards-form-section
            header="Basic Configuration"
            description="Core card settings"
            icon="mdi:cog"
            ?expanded=${true}
            ?outlined=${true}
            headerLevel="4">

            <lcards-form-field
                .editor=${this}
                path="entity"
                label="Entity"
                ?required=${true}
                helper="Select an entity to control">
            </lcards-form-field>

            <lcards-form-field
                .editor=${this}
                path="name"
                label="Card Name"
                helper="Optional display name">
            </lcards-form-field>
        </lcards-form-section>

        <!-- Divider -->
        <lcards-divider></lcards-divider>

        <!-- Layout section with grid -->
        <lcards-form-section
            header="Layout"
            description="Grid positioning and sizing"
            icon="mdi:grid"
            ?expanded=${false}
            ?outlined=${true}
            headerLevel="4">

            <lcards-grid-layout>
                <lcards-form-field
                    .editor=${this}
                    path="grid_columns"
                    label="Columns">
                </lcards-form-field>

                <lcards-form-field
                    .editor=${this}
                    path="grid_rows"
                    label="Rows">
                </lcards-form-field>
            </lcards-grid-layout>

            <lcards-grid-layout>
                <lcards-form-field
                    .editor=${this}
                    path="grid_column_start"
                    label="Column Start">
                </lcards-form-field>

                <lcards-form-field
                    .editor=${this}
                    path="grid_row_start"
                    label="Row Start">
                </lcards-form-field>
            </lcards-grid-layout>
        </lcards-form-section>

        <!-- Advanced settings (expert users) -->
        <lcards-form-section
            header="Advanced Settings"
            description="Expert configuration options"
            icon="mdi:wrench-cog-outline"
            secondary="[Expert]"
            ?expanded=${false}
            ?outlined=${true}
            headerLevel="4">

            <lcards-message
                type="warning"
                title="Expert Settings"
                message="Changing these settings may affect card behavior.">
            </lcards-message>

            <lcards-form-field
                .editor=${this}
                path="custom_css"
                label="Custom CSS"
                helper="Advanced styling overrides">
            </lcards-form-field>
        </lcards-form-section>
    `;
}
```

### Actions Tab Example

```javascript
_renderActionsTab() {
    return html`
        <lcards-message
            type="info"
            message="Configure actions for tap, double-tap, and hold gestures.">
        </lcards-message>

        <lcards-form-section
            header="Tap Action"
            icon="mdi:gesture-tap"
            ?expanded=${true}
            ?outlined=${true}
            headerLevel="4">

            <lcards-action-editor
                .hass=${this.hass}
                .action=${this.config.tap_action || { action: 'toggle' }}
                @value-changed=${(e) => this._setConfigValue('tap_action', e.detail.value)}>
            </lcards-action-editor>
        </lcards-form-section>

        <lcards-form-section
            header="Double Tap Action"
            icon="mdi:gesture-double-tap"
            ?expanded=${false}
            ?outlined=${true}
            headerLevel="4">

            <lcards-action-editor
                .hass=${this.hass}
                .action=${this.config.double_tap_action || { action: 'none' }}
                @value-changed=${(e) => this._setConfigValue('double_tap_action', e.detail.value)}>
            </lcards-action-editor>
        </lcards-form-section>

        <lcards-form-section
            header="Hold Action"
            icon="mdi:gesture-tap-hold"
            ?expanded=${false}
            ?outlined=${true}
            headerLevel="4">

            <lcards-action-editor
                .hass=${this.hass}
                .action=${this.config.hold_action || { action: 'more-info' }}
                @value-changed=${(e) => this._setConfigValue('hold_action', e.detail.value)}>
            </lcards-action-editor>
        </lcards-form-section>
    `;
}
```

### Conditional Sections Example

```javascript
_renderConditionalTab() {
    const hasEntity = !!this.config.entity;

    return html`
        ${!hasEntity ? html`
            <lcards-message
                type="warning"
                title="Entity Required"
                message="Please select an entity in the Configuration tab to enable these options.">
            </lcards-message>
        ` : ''}

        ${hasEntity ? html`
            <lcards-form-section
                header="Entity Options"
                icon="mdi:devices"
                ?expanded=${true}
                ?outlined=${true}>

                <lcards-form-field
                    .editor=${this}
                    path="show_state"
                    label="Show State">
                </lcards-form-field>

                <lcards-form-field
                    .editor=${this}
                    path="show_name"
                    label="Show Name">
                </lcards-form-field>
            </lcards-form-section>
        ` : ''}
    `;
}
```

---

## Icon Reference

Common MDI icons for editor sections:

| Section Type | Recommended Icon |
|--------------|------------------|
| Configuration | `mdi:cog` |
| Layout | `mdi:grid` |
| Text | `mdi:format-textbox` |
| Icon | `mdi:alpha-i-circle-outline` |
| Colors | `mdi:palette` |
| Actions | `mdi:gesture-tap` |
| Advanced | `mdi:wrench-cog-outline` |
| Entity | `mdi:devices` |
| Style | `mdi:brush` |
| Animation | `mdi:animation-outline` |
| Border | `mdi:border-style` |
| Corner | `mdi:rounded-corner` |
| Size | `mdi:resize` |

Browse more at: https://pictogrammers.com/library/mdi/

---

## Tips & Best Practices

### 1. Progressive Disclosure
Expand important sections by default, collapse advanced sections:

```javascript
<lcards-form-section ?expanded=${true}>  <!-- Important -->
<lcards-form-section ?expanded=${false}> <!-- Advanced -->
```

### 2. Use Descriptions
Help users understand what each section does:

```javascript
<lcards-form-section
    header="Layout"
    description="Control how the card fits in the dashboard grid">
```

### 3. Helper Text
Provide context for each field:

```javascript
<lcards-form-field
    path="entity"
    label="Entity"
    helper="Select an entity to control">
```

### 4. Required Fields
Mark critical fields:

```javascript
<lcards-form-field
    path="entity"
    ?required=${true}>
```

### 5. Visual Hierarchy
Use icons consistently:

```javascript
<lcards-form-section icon="mdi:cog">     <!-- Basic settings -->
<lcards-form-section icon="mdi:wrench-cog-outline"> <!-- Advanced -->
```

### 6. Warning Messages
Warn users before risky changes:

```javascript
<lcards-message
    type="warning"
    message="Changing this may break existing configurations.">
</lcards-message>
```

### 7. Grid Layouts
Group related fields:

```javascript
<lcards-grid-layout>
    <lcards-form-field path="width" label="Width">
    <lcards-form-field path="height" label="Height">
</lcards-grid-layout>
```

---

## Troubleshooting

### Section Not Collapsing
Ensure `noCollapse` is not set to `true`:

```javascript
<lcards-form-section ?noCollapse=${false}>
```

### Icons Not Showing
Verify MDI icon name is correct:

```javascript
icon="mdi:cog"  // ✅ Correct
icon="cog"      // ❌ Wrong
```

### Fields Not Updating
Ensure editor reference is passed:

```javascript
<lcards-form-field .editor=${this} path="...">
```

### Grid Not Responsive
Check CSS media query works at 768px breakpoint.

---

**Last Updated:** 2025-12-09
**For:** LCARdS v1.10.02
