/**
 * Action Editor Component
 *
 * Provides a UI for configuring tap, double-tap, and hold actions
 * using Home Assistant's standard ui-action selector.
 */

import { LitElement, html, css } from 'lit';

export class LCARdSActionEditor extends LitElement {

    static get properties() {
        return {
            hass: { type: Object },
            action: { type: Object },
            label: { type: String }
        };
    }

    constructor() {
        super();
        this.action = { action: 'none' };
        this.label = 'Action';
    }

    static get styles() {
        return css`
            :host {
                display: block;
            }

            .action-editor {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            label {
                font-weight: 500;
                color: var(--primary-text-color, #212121);
                font-size: 14px;
            }
        `;
    }

    render() {
        return html`
            <div class="action-editor">
                ${this.label ? html`<label>${this.label}</label>` : ''}
                <ha-selector
                    .hass=${this.hass}
                    .selector=${{ ui_action: {} }}
                    .value=${this.action}
                    @value-changed=${this._actionChanged}>
                </ha-selector>
            </div>
        `;
    }

    /**
     * Handle action change from ha-selector
     * @param {CustomEvent} ev - value-changed event
     * @private
     */
    _actionChanged(ev) {
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: { value: ev.detail.value },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('lcards-action-editor', LCARdSActionEditor);
