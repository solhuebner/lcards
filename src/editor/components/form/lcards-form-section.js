/**
 * LCARdS Form Section
 *
 * Collapsible section component for organizing form fields into logical groups.
 * Uses Home Assistant's ha-expansion-panel component.
 *
 * @example
 * <lcards-form-section
 *   header="Color Settings"
 *   description="Configure colors for different button states"
 *   ?expanded=${true}>
 *   <lcards-form-field path="style.color.default" label="Default Color"></lcards-form-field>
 *   <lcards-form-field path="style.color.active" label="Active Color"></lcards-form-field>
 * </lcards-form-section>
 */

import { LitElement, html, css } from 'lit';

export class LCARdSFormSection extends LitElement {

    static get properties() {
        return {
            header: { type: String },         // Section header text
            description: { type: String },    // Optional description
            expanded: { type: Boolean },      // Expanded state
            outlined: { type: Boolean },      // Show border
            leftChevron: { type: Boolean }    // Chevron position
        };
    }

    constructor() {
        super();
        this.header = '';
        this.description = '';
        this.expanded = false;
        this.outlined = false;
        this.leftChevron = false;
    }

    static get styles() {
        return css`
            :host {
                display: block;
                margin-bottom: 16px;
            }

            ha-expansion-panel {
                border-radius: var(--ha-card-border-radius, 12px);
            }

            ha-expansion-panel[outlined] {
                border: 2px solid var(--divider-color, #e0e0e0);
            }

            .section-content {
                padding: 16px;
            }

            .section-description {
                font-size: 14px;
                color: var(--secondary-text-color, #727272);
                margin-bottom: 16px;
                line-height: 1.5;
            }

            ::slotted(*) {
                display: block;
            }
        `;
    }

    render() {
        // Check if ha-expansion-panel is available
        const hasExpansionPanel = customElements.get('ha-expansion-panel');

        if (!hasExpansionPanel) {
            return this._renderFallback();
        }

        return html`
            <ha-expansion-panel
                .header=${this.header}
                ?expanded=${this.expanded}
                ?outlined=${this.outlined}
                ?leftChevron=${this.leftChevron}
                @expanded-changed=${this._handleExpandedChange}>
                <div class="section-content">
                    ${this.description ? html`
                        <div class="section-description">${this.description}</div>
                    ` : ''}
                    <slot></slot>
                </div>
            </ha-expansion-panel>
        `;
    }

    /**
     * Render fallback when ha-expansion-panel is not available
     * @private
     */
    _renderFallback() {
        return html`
            <div class="section-fallback">
                <div style="
                    font-weight: 500;
                    font-size: 16px;
                    margin-bottom: 8px;
                    padding: 12px;
                    background: var(--secondary-background-color, #f5f5f5);
                    border-radius: 4px;
                    cursor: pointer;
                " @click=${this._toggleExpanded}>
                    ${this.expanded ? '▼' : '▶'} ${this.header}
                </div>
                ${this.expanded ? html`
                    <div style="padding: 16px;">
                        ${this.description ? html`
                            <div class="section-description">${this.description}</div>
                        ` : ''}
                        <slot></slot>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Handle expansion state change
     * @param {CustomEvent} ev - expanded-changed event
     * @private
     */
    _handleExpandedChange(ev) {
        this.expanded = ev.detail.expanded;
        this.dispatchEvent(new CustomEvent('expanded-changed', {
            detail: { expanded: this.expanded },
            bubbles: true,
            composed: true
        }));
    }

    /**
     * Toggle expanded state (for fallback)
     * @private
     */
    _toggleExpanded() {
        this.expanded = !this.expanded;
        this.dispatchEvent(new CustomEvent('expanded-changed', {
            detail: { expanded: this.expanded },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('lcards-form-section', LCARdSFormSection);
