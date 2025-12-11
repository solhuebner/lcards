/**
 * LCARdS Button Editor
 *
 * Visual editor for LCARdS Button card. Demonstrates schema-driven form components.
 */

import { html } from 'lit';
import { LCARdSBaseEditor } from '../base/LCARdSBaseEditor.js';
import '../components/common/lcards-card-config-section.js';
import '../components/common/lcards-action-editor.js';
import '../components/common/lcards-message.js';
import '../components/common/lcards-divider.js';
import '../components/yaml/lcards-monaco-yaml-editor.js';
// Import new form components
import '../components/form/lcards-form-field.js';
import '../components/form/lcards-form-section.js';
import '../components/form/lcards-grid-layout.js';

export class LCARdSButtonEditor extends LCARdSBaseEditor {

    constructor() {
        super();
        this.cardType = 'button'; // Set card type for schema lookup
    }

    /**
     * Get tab definitions for Button editor
     * @returns {Array<Object>} Tab configuration
     * @override
     */
    _getTabDefinitions() {
        return [
            {
                label: 'Configuration',
                content: () => this._renderCardConfigTab()
            },
            {
                label: 'Text & Icon',
                content: () => this._renderTextIconTab()
            },
            {
                label: 'Actions',
                content: () => this._renderActionsTab()
            },
            {
                label: 'Advanced (YAML)',
                content: () => this._renderYamlTab()
            }
        ];
    }

    /**
     * Render Card Configuration tab (using new components)
     * @returns {TemplateResult}
     * @private
     */
    _renderCardConfigTab() {
        return html`
            <!-- Info Message -->
            <lcards-message
                type="info"
                message="Configure the basic settings for your LCARS button card. Select an entity to control or leave blank for a static button.">
            </lcards-message>

            <!-- Basic Configuration Section -->
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
                    label="Entity">
                </lcards-form-field>

                <lcards-form-field
                    .editor=${this}
                    path="id"
                    label="Card ID"
                    helper="Optional custom ID for targeting with rules">
                </lcards-form-field>

                <lcards-form-field
                    .editor=${this}
                    path="preset"
                    label="Preset Style">
                </lcards-form-field>
            </lcards-form-section>

            <!-- Layout Section -->
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
                        label="Grid Columns">
                    </lcards-form-field>

                    <lcards-form-field
                        .editor=${this}
                        path="grid_rows"
                        label="Grid Rows">
                    </lcards-form-field>
                </lcards-grid-layout>
            </lcards-form-section>
        `;
    }

    /**
     * Render Text & Icon tab (using new components)
     * @returns {TemplateResult}
     * @private
     */
    _renderTextIconTab() {
        return html`
            <!-- Text Configuration -->
            <lcards-form-section
                header="Text Content"
                description="Configure button text labels"
                icon="mdi:format-textbox"
                ?expanded=${true}
                ?outlined=${true}
                headerLevel="4">

                ${this._renderTextConfig()}
            </lcards-form-section>

            <!-- Icon Configuration -->
            <lcards-form-section
                header="Icon"
                description="Configure button icon"
                icon="mdi:alpha-i-circle-outline"
                ?expanded=${false}
                ?outlined=${true}
                headerLevel="4">

                ${this._renderIconConfig()}
            </lcards-form-section>
        `;
    }

    /**
     * Render text configuration
     * @returns {TemplateResult}
     * @private
     */
    _renderTextConfig() {
        const textConfig = this.config.text || {};
        const fieldNames = Object.keys(textConfig);

        // For now, just show the primary text field (name)
        // Future enhancement: allow adding/removing fields
        const nameField = textConfig.name || { content: '' };

        return html`
            <div class="form-row">
                <label>Primary Text Content</label>
                <input
                    type="text"
                    .value=${nameField.content || ''}
                    @input=${(e) => this._updateTextField('name', 'content', e.target.value)}
                    placeholder="Enter button text (supports {{entity.state}})">
                <div class="helper-text">
                    Supports templates like {{entity.state}}, {{entity.attributes.brightness}}
                </div>
            </div>

            ${nameField.position !== undefined ? html`
                <div class="form-row">
                    <label>Text Position</label>
                    <select
                        .value=${nameField.position || 'center'}
                        @change=${(e) => this._updateTextField('name', 'position', e.target.value)}>
                        <option value="top-left">Top Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                        <option value="left-center">Left Center</option>
                        <option value="center">Center</option>
                        <option value="right-center">Right Center</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                    </select>
                </div>
            ` : ''}
        `;
    }

    /**
     * Update text field property
     * @param {string} fieldName - Field name (e.g., 'name')
     * @param {string} property - Property name (e.g., 'content')
     * @param {*} value - New value
     * @private
     */
    _updateTextField(fieldName, property, value) {
        const text = { ...this.config.text };
        text[fieldName] = {
            ...(text[fieldName] || {}),
            [property]: value
        };
        this._updateConfig({ text });
    }

    /**
     * Render icon configuration
     * @returns {TemplateResult}
     * @private
     */
    _renderIconConfig() {
        // Note: icon can be either a string or an object with { icon, position, etc }
        // For simplicity in the editor, we'll handle the simple string case
        // TODO: Add support for complex icon object configuration

        return html`
            <lcards-form-field
                .editor=${this}
                path="icon"
                label="Icon"
                helper="Use 'entity' for entity's icon, or specify an MDI icon like 'mdi:lightbulb'">
            </lcards-form-field>

            <lcards-form-field
                .editor=${this}
                path="icon_area"
                label="Icon Area"
                helper="Where the icon's reserved space is located">
            </lcards-form-field>
        `;
    }

    /**
     * Update icon property
     * @param {string} property - Property name
     * @param {*} value - New value
     * @private
     */
    _updateIcon(property, value) {
        const currentIcon = this.config.icon || {};

        if (typeof currentIcon === 'string') {
            // If currently a simple string, convert to object
            this._updateConfig({
                icon: { icon: value }
            });
        } else {
            // If already an object, update the property
            this._updateConfig({
                icon: {
                    ...currentIcon,
                    [property]: value
                }
            });
        }
    }

    /**
     * Render Actions tab (using new form components)
     * @returns {TemplateResult}
     * @private
     */
    _renderActionsTab() {
        return html`
            <lcards-form-section
                header="Tap Action"
                description="Action to perform when the button is tapped"
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
                description="Action to perform when the button is double-tapped (optional)"
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
                description="Action to perform when the button is held (optional)"
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

    /**
     * Render YAML editor tab
     * @returns {TemplateResult}
     * @private
     */
    _renderYamlTab() {
        return html`
            <div class="section">
                <div class="section-description">
                    Advanced YAML editor with validation. Changes made here will be reflected in the visual tabs.
                </div>
                <lcards-monaco-yaml-editor
                    .value=${this._yamlValue}
                    .schema=${this._getSchema()}
                    .errors=${this._validationErrors}
                    @value-changed=${this._handleYamlChange}>
                </lcards-monaco-yaml-editor>
            </div>
        `;
    }
}

customElements.define('lcards-button-editor', LCARdSButtonEditor);
