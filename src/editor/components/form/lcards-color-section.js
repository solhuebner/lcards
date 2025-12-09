/**
 * LCARdS Color Section
 *
 * Specialized section component for organizing state-based color configurations.
 * Provides a convenient interface for configuring colors for different states
 * (default, active, hover, disabled, etc.).
 *
 * @example
 * <lcards-color-section
 *   .editor=${this}
 *   basePath="style.color"
 *   header="Button Colors"
 *   .states=${['default', 'active', 'hover', 'disabled']}>
 * </lcards-color-section>
 */

import { LitElement, html, css } from 'lit';
import './lcards-form-section.js';
import './lcards-form-field.js';

export class LCARdSColorSection extends LitElement {

    static get properties() {
        return {
            editor: { type: Object },         // Parent editor reference
            basePath: { type: String },       // Base config path (e.g., 'style.color')
            header: { type: String },         // Section header
            description: { type: String },    // Section description
            states: { type: Array },          // Array of state names (e.g., ['default', 'active'])
            expanded: { type: Boolean }       // Expanded state
        };
    }

    constructor() {
        super();
        this.editor = null;
        this.basePath = '';
        this.header = 'Colors';
        this.description = '';
        this.states = ['default', 'active', 'hover', 'disabled'];
        this.expanded = false;
    }

    static get styles() {
        return css`
            :host {
                display: block;
            }
        `;
    }

    render() {
        if (!this.editor || !this.basePath) {
            return html`
                <ha-alert alert-type="error">
                    Color section requires 'editor' and 'basePath' properties
                </ha-alert>
            `;
        }

        return html`
            <lcards-form-section
                header="${this.header}"
                description="${this.description}"
                ?expanded=${this.expanded}
                outlined>
                ${this.states.map(state => this._renderColorField(state))}
            </lcards-form-section>
        `;
    }

    /**
     * Render a color field for a specific state
     * @param {string} state - State name (e.g., 'default', 'active')
     * @returns {TemplateResult}
     * @private
     */
    _renderColorField(state) {
        const path = `${this.basePath}.${state}`;
        const label = this._formatStateLabel(state);

        return html`
            <lcards-form-field
                .editor=${this.editor}
                path="${path}"
                label="${label}">
            </lcards-form-field>
        `;
    }

    /**
     * Format state name as readable label
     * @param {string} state - State name
     * @returns {string} Formatted label
     * @private
     */
    _formatStateLabel(state) {
        return state
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}

customElements.define('lcards-color-section', LCARdSColorSection);
