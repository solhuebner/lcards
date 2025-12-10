/**
 * LCARdS Form Field
 *
 * Smart form field component that auto-renders appropriate control based on
 * schema property definition. Supports all standard JSON Schema types plus
 * LCARdS-specific formats (entity, color, action).
 *
 * @example
 * <lcards-form-field
 *   .editor=${this}
 *   path="style.color.border"
 *   label="Border Color"
 *   helper="Color for the button border">
 * </lcards-form-field>
 */

import { LitElement, html, css } from 'lit';
import {
    getEffectiveLabel,
    getEffectiveHelper,
    hasFormat,
    isType,
    hasEnum,
    getEnumOptions
} from '../../../utils/schema-helpers.js';

export class LCARdSFormField extends LitElement {

    static get properties() {
        return {
            path: { type: String },           // Config path (e.g., 'style.color.border')
            editor: { type: Object },         // Parent editor reference
            label: { type: String },          // Optional label override
            helper: { type: String },         // Optional helper text override
            required: { type: Boolean },      // Required field
            disabled: { type: Boolean }       // Disabled state
        };
    }

    constructor() {
        super();
        this.path = '';
        this.editor = null;
        this.label = '';
        this.helper = '';
        this.required = false;
        this.disabled = false;
    }

    static get styles() {
        return css`
            :host {
                display: block;
            }

            .form-field {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 16px;
            }

            label {
                font-weight: 500;
                color: var(--primary-text-color, #212121);
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            label .required {
                color: var(--error-color, #f44336);
            }

            .helper-text {
                font-size: 12px;
                color: var(--secondary-text-color, #727272);
                line-height: 1.4;
            }

            ha-selector,
            ha-entity-picker,
            ha-textfield {
                width: 100%;
            }
        `;
    }

    /**
     * Get schema for this field's path
     * @returns {Object|null}
     * @private
     */
    get _schema() {
        if (!this.editor || !this.path) return null;
        return this.editor._getSchemaForPath(this.path);
    }

    /**
     * Get current value for this field
     * @returns {*}
     * @private
     */
    get _value() {
        if (!this.editor || !this.path) return undefined;
        return this.editor._getConfigValue(this.path);
    }

    /**
     * Get effective label (prop override or schema title or formatted path)
     * @returns {string}
     * @private
     */
    get _effectiveLabel() {
        return getEffectiveLabel(this._schema, this.path, this.label);
    }

    /**
     * Get effective helper text
     * @returns {string}
     * @private
     */
    get _effectiveHelper() {
        return getEffectiveHelper(this._schema, this.helper);
    }

    render() {
        if (!this.editor || !this.path) {
            return html`
                <div class="form-field">
                    <ha-alert alert-type="error">
                        Form field requires 'editor' and 'path' properties
                    </ha-alert>
                </div>
            `;
        }

        const schema = this._schema;
        if (!schema) {
            return html`
                <div class="form-field">
                    <ha-alert alert-type="warning">
                        No schema found for path: ${this.path}
                    </ha-alert>
                </div>
            `;
        }

        return html`
            <div class="form-field">
                <label>
                    ${this._effectiveLabel}
                    ${this.required ? html`<span class="required">*</span>` : ''}
                </label>
                
                ${this._renderControl(schema)}
                
                ${this._effectiveHelper ? html`
                    <div class="helper-text">${this._effectiveHelper}</div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render appropriate control based on schema
     * @param {Object} schema - Property schema
     * @returns {TemplateResult}
     * @private
     */
    _renderControl(schema) {
        // Check for LCARdS-specific formats first
        if (hasFormat(schema, 'entity')) {
            return this._renderEntityPicker();
        }

        if (hasFormat(schema, 'color')) {
            return this._renderColorSelector();
        }

        if (hasFormat(schema, 'action')) {
            return this._renderActionEditor();
        }

        // Standard JSON Schema types
        if (hasEnum(schema)) {
            return this._renderSelect(schema);
        }

        if (isType(schema, 'boolean')) {
            return this._renderBoolean();
        }

        if (isType(schema, 'number') || isType(schema, 'integer')) {
            return this._renderNumber(schema);
        }

        if (isType(schema, 'array')) {
            return this._renderArray(schema);
        }

        if (isType(schema, 'object')) {
            return html`
                <ha-alert alert-type="info">
                    Object type - use nested form sections
                </ha-alert>
            `;
        }

        // Default to text field
        return this._renderText();
    }

    /**
     * Render entity picker
     * @returns {TemplateResult}
     * @private
     */
    _renderEntityPicker() {
        return html`
            <ha-entity-picker
                .hass=${this.editor.hass}
                .value=${this._value}
                .disabled=${this.disabled}
                @value-changed=${this._handleValueChange}>
            </ha-entity-picker>
        `;
    }

    /**
     * Render color selector (custom component)
     * @returns {TemplateResult}
     * @private
     */
    _renderColorSelector() {
        // TODO: Implement lcards-color-selector component
        // For now, use a text input as fallback
        return html`
            <ha-selector
                .hass=${this.editor.hass}
                .selector=${{ text: {} }}
                .value=${this._value || ''}
                .disabled=${this.disabled}
                @value-changed=${this._handleValueChange}>
            </ha-selector>
        `;
    }

    /**
     * Render action editor
     * @returns {TemplateResult}
     * @private
     */
    _renderActionEditor() {
        return html`
            <lcards-action-editor
                .hass=${this.editor.hass}
                .action=${this._value || { action: 'none' }}
                @value-changed=${this._handleValueChange}>
            </lcards-action-editor>
        `;
    }

    /**
     * Render select dropdown
     * @param {Object} schema - Property schema
     * @returns {TemplateResult}
     * @private
     */
    _renderSelect(schema) {
        const options = getEnumOptions(schema);

        return html`
            <ha-selector
                .hass=${this.editor.hass}
                .selector=${{
                    select: {
                        mode: 'dropdown',
                        options
                    }
                }}
                .value=${this._value}
                .disabled=${this.disabled}
                @value-changed=${this._handleValueChange}>
            </ha-selector>
        `;
    }

    /**
     * Render boolean switch
     * @returns {TemplateResult}
     * @private
     */
    _renderBoolean() {
        return html`
            <ha-selector
                .hass=${this.editor.hass}
                .selector=${{ boolean: {} }}
                .value=${this._value ?? false}
                .disabled=${this.disabled}
                @value-changed=${this._handleValueChange}>
            </ha-selector>
        `;
    }

    /**
     * Render number input
     * @param {Object} schema - Property schema
     * @returns {TemplateResult}
     * @private
     */
    _renderNumber(schema) {
        return html`
            <ha-selector
                .hass=${this.editor.hass}
                .selector=${{
                    number: {
                        min: schema.minimum,
                        max: schema.maximum,
                        step: schema.type === 'integer' ? 1 : (schema.multipleOf || 0.1),
                        mode: 'box'
                    }
                }}
                .value=${this._value}
                .disabled=${this.disabled}
                @value-changed=${this._handleValueChange}>
            </ha-selector>
        `;
    }

    /**
     * Render array input (comma-separated for simple arrays)
     * @param {Object} schema - Property schema
     * @returns {TemplateResult}
     * @private
     */
    _renderArray(schema) {
        // For simple string arrays, use comma-separated input
        if (schema.items?.type === 'string') {
            const arrayValue = this._value || [];
            const stringValue = Array.isArray(arrayValue) ? arrayValue.join(', ') : '';

            return html`
                <ha-selector
                    .hass=${this.editor.hass}
                    .selector=${{ text: {} }}
                    .value=${stringValue}
                    .disabled=${this.disabled}
                    @input=${this._handleArrayInput}
                    placeholder="comma, separated, values">
                </ha-selector>
            `;
        }

        // Complex arrays need custom editor
        return html`
            <ha-alert alert-type="info">
                Complex array - use specialized editor component
            </ha-alert>
        `;
    }

    /**
     * Render text input
     * @returns {TemplateResult}
     * @private
     */
    _renderText() {
        return html`
            <ha-selector
                .hass=${this.editor.hass}
                .selector=${{ text: {} }}
                .value=${this._value || ''}
                .disabled=${this.disabled}
                @value-changed=${this._handleValueChange}>
            </ha-selector>
        `;
    }

    /**
     * Handle value change from control
     * @param {CustomEvent} ev - value-changed event
     * @private
     */
    _handleValueChange(ev) {
        ev.stopPropagation();
        
        if (!this.editor || !this.path) return;

        const newValue = ev.detail.value;
        this.editor._setConfigValue(this.path, newValue);
    }

    /**
     * Handle array input (comma-separated)
     * @param {Event} ev - input event
     * @private
     */
    _handleArrayInput(ev) {
        const value = ev.target.value;
        const array = value
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);

        this.editor._setConfigValue(this.path, array);
    }
}

customElements.define('lcards-form-field', LCARdSFormField);
