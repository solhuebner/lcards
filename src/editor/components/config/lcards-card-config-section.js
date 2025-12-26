/**
 * Card Configuration Section Component
 *
 * Reusable component for basic card configuration (entity, ID, tags, etc.)
 */

import { LitElement, html, css } from 'lit';

export class LCARdSCardConfigSection extends LitElement {

    static get properties() {
        return {
            hass: { type: Object },
            config: { type: Object },
            schema: { type: Object }
        };
    }

    constructor() {
        super();
        this.config = {};
        this.schema = {};
    }

    static get styles() {
        return css`
            :host {
                display: block;
            }

            .config-section {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .form-row {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .form-row-group {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
            }

            label {
                font-weight: 500;
                color: var(--primary-text-color, #212121);
                font-size: 14px;
            }

            .helper-text {
                font-size: 12px;
                color: var(--secondary-text-color, #727272);
                margin-top: 4px;
                line-height: 1.4;
            }

            .section-header {
                font-size: 16px;
                font-weight: 500;
                margin-top: 16px;
                margin-bottom: 8px;
                color: var(--primary-text-color, #212121);
                border-bottom: 1px solid var(--divider-color, #e0e0e0);
                padding-bottom: 8px;
            }

            input[type="text"],
            input[type="number"],
            select {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid var(--divider-color, #e0e0e0);
                border-radius: 4px;
                font-size: 14px;
                font-family: inherit;
                background: var(--card-background-color, #fff);
                color: var(--primary-text-color, #212121);
            }

            input:focus,
            select:focus {
                outline: none;
                border-color: var(--primary-color, #03a9f4);
            }

            @media (max-width: 768px) {
                .form-row-group {
                    grid-template-columns: 1fr;
                }
            }
        `;
    }

    render() {
        return html`
            <div class="config-section">

                <!-- Entity Picker -->
                <div class="form-row">
                    <label>Entity</label>
                    <ha-entity-picker
                        .hass=${this.hass}
                        .value=${this.config.entity}
                        @value-changed=${this._entityChanged}>
                    </ha-entity-picker>
                    ${this._getSchemaDescription('entity')}
                </div>

                <!-- Card ID -->
                <div class="form-row">
                    <label>Card ID (optional)</label>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{ text: {} }}
                        .value=${this.config.id || ''}
                        @value-changed=${(e) => this._valueChanged('id', e.detail.value)}
                        placeholder="auto-generated">
                    </ha-selector>
                    ${this._getSchemaDescription('id')}
                </div>

                <!-- Tags -->
                <div class="form-row">
                    <label>Tags (comma-separated)</label>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{ text: {} }}
                        .value=${(this.config.tags || []).join(', ')}
                        @value-changed=${(e) => this._tagsChanged(e)}
                        placeholder="sensor, temperature, critical">
                    </ha-selector>
                    ${this._getSchemaDescription('tags')}
                </div>

                <!-- Preset Selector (if applicable) -->
                ${this.schema?.properties?.preset ? html`
                    <div class="form-row">
                        <label>Preset</label>
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{
                                select: {
                                    mode: 'dropdown',
                                    options: (this.schema.properties.preset.enum || []).map(p => ({
                                        value: p,
                                        label: this._formatPresetLabel(p)
                                    }))
                                }
                            }}
                            .value=${this.config.preset}
                            @value-changed=${(e) => this._valueChanged('preset', e.detail.value)}>
                        </ha-selector>
                        ${this._getSchemaDescription('preset')}
                    </div>
                ` : ''}

                <!-- Grid Layout -->
                <div class="section-header">Layout</div>
                <div class="form-row-group">
                    <div class="form-row">
                        <label>Grid Columns</label>
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{
                                number: {
                                    min: 1,
                                    max: 12,
                                    mode: 'box'
                                }
                            }}
                            .value=${this.config.grid_columns || 4}
                            @value-changed=${(e) => this._valueChanged('grid_columns', parseInt(e.detail.value))}>
                        </ha-selector>
                        <div class="helper-text">Number of columns to span (1-12)</div>
                    </div>
                    <div class="form-row">
                        <label>Grid Rows</label>
                        <ha-selector
                            .hass=${this.hass}
                            .selector=${{
                                number: {
                                    min: 1,
                                    max: 12,
                                    mode: 'box'
                                }
                            }}
                            .value=${this.config.grid_rows || 1}
                            @value-changed=${(e) => this._valueChanged('grid_rows', parseInt(e.detail.value))}>
                        </ha-selector>
                        <div class="helper-text">Number of rows to span (1-12)</div>
                    </div>
                </div>

            </div>
        `;
    }

    /**
     * Handle entity selection change (ha-entity-picker)
     * @param {CustomEvent} ev - value-changed event
     * @private
     */
    _entityChanged(ev) {
        this._fireConfigChanged({ entity: ev.detail.value });
    }

    /**
     * Handle tags input change
     * @param {CustomEvent} ev - value-changed event from ha-selector
     * @private
     */
    _tagsChanged(ev) {
        const value = ev.detail.value || '';
        const tags = value
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);
        this._fireConfigChanged({ tags });
    }

    /**
     * Handle generic value change
     * @param {string} key - Config key
     * @param {*} value - New value
     * @private
     */
    _valueChanged(key, value) {
        this._fireConfigChanged({ [key]: value });
    }

    /**
     * Fire config-changed event
     * @param {Object} updates - Partial config updates
     * @private
     */
    _fireConfigChanged(updates) {
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config: updates },
            bubbles: true,
            composed: true
        }));
    }

    /**
     * Get schema description for a property
     * @param {string} prop - Property name
     * @returns {TemplateResult|string}
     * @private
     */
    _getSchemaDescription(prop) {
        const desc = this.schema?.properties?.[prop]?.description;
        return desc ? html`<div class="helper-text">${desc}</div>` : '';
    }

    /**
     * Format preset label for display
     * @param {string} preset - Preset ID
     * @returns {string}
     * @private
     */
    _formatPresetLabel(preset) {
        return preset
            .split(/[-_]/)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    }
}

customElements.define('lcards-card-config-section', LCARdSCardConfigSection);
