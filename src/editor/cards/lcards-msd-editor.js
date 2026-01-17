/**
 * LCARdS MSD Editor
 *
 * Visual configuration editor for MSD (Master Systems Display) cards.
 * Minimal launcher editor that opens full-screen studio for all configuration.
 *
 * Architecture:
 * - Single "Configuration" tab with studio launcher button
 * - Card metadata summary (SVG source, anchor/control/line counts)
 * - Integration with utility tabs (DataSources, Templates, Rules, YAML, etc.)
 * - Opens lcards-msd-studio-dialog for visual editing
 *
 * @extends {LCARdSBaseEditor}
 */

import { html } from 'lit';
import { lcardsLog } from '../../utils/lcards-logging.js';
import { LCARdSBaseEditor } from '../base/LCARdSBaseEditor.js';
import { fireEvent } from 'custom-card-helpers';
import { configToYaml } from '../utils/yaml-utils.js';

// Import shared form components
import '../components/shared/lcards-message.js';
import '../components/shared/lcards-form-section.js';
import { LCARdSFormFieldHelper as FormField } from '../components/shared/lcards-form-field.js';

// Import MSD Configuration Studio dialog
import '../dialogs/lcards-msd-studio-dialog.js';

export class LCARdSMSDEditor extends LCARdSBaseEditor {

    constructor() {
        super();
        this.cardType = 'msd';
        lcardsLog.debug('[LCARdSMSDEditor] Editor initialized with cardType: msd (1 tab: Configuration Studio launcher)');
    }

    /**
     * Define editor tabs - 1-tab structure + utility tabs
     * MSD Configuration Studio handles all visual editing
     * @returns {Array} Tab definitions
     * @protected
     */
    _getTabDefinitions() {
        return [
            { label: 'Configuration', content: () => this._renderConfigurationTab() },
            ...this._getUtilityTabs()
        ];
    }

    // ============================================================================
    // TAB 1: CONFIGURATION
    // ============================================================================

    /**
     * Configuration Tab - Studio launcher and card metadata
     * @returns {TemplateResult}
     * @private
     */
    _renderConfigurationTab() {
        return html`
            <!-- Studio Launcher Card (Top Priority) -->
            <div class="info-card">
                <div class="info-card-content">
                    <h3>🖼️ MSD Configuration Studio</h3>
                    <p>
                        <strong>Full-screen visual editor</strong> with live preview
                        <br />
                        Build your Master Systems Display visually with instant feedback.
                        Configure backgroups, place controls, connect lines, add animations, and manage routing channels graphically.
                    </p>
                </div>
                <div class="info-card-actions">
                    <ha-button
                        raised
                        @click=${this._openMsdStudio}>
                        <ha-icon icon="mdi:monitor-dashboard" slot="icon"></ha-icon>
                        Open Configuration Studio
                    </ha-button>
                </div>
            </div>

            <!-- Card Identification -->
            <lcards-form-section
                header="Card Identification"
                description="Unique identifier for rules engine targeting"
                icon="mdi:tag"
                ?expanded=${true}
                ?outlined=${true}
                headerLevel="4">

                ${FormField.renderField(this, 'id', {
                    label: 'Card ID',
                    helper: 'Unique identifier for rules engine targeting'
                })}

                ${FormField.renderField(this, 'tags', {
                    label: 'Tags',
                    helper: 'Tags for rules engine categorization'
                })}
            </lcards-form-section>
        `;
    }

    /**
     * Open MSD Configuration Studio dialog
     * @private
     */
    async _openMsdStudio() {
        lcardsLog.debug('[MSDEditor] Opening MSD Configuration Studio');

        const dialog = document.createElement('lcards-msd-studio-dialog');
        dialog.hass = this.hass;

        // Deep clone current config
        dialog.config = JSON.parse(JSON.stringify(this.config || {}));

        // Listen for config changes
        dialog.addEventListener('config-changed', (e) => {
            lcardsLog.debug('[MSDEditor] Studio config changed:', e.detail.config);

            // Replace config entirely (don't merge)
            this.config = e.detail.config;

            // Sync to YAML and notify HA
            this._isUpdatingYaml = true;
            this._yamlValue = configToYaml(this.config);
            requestAnimationFrame(() => {
                this._isUpdatingYaml = false;
            });

            fireEvent(this, 'config-changed', { config: this.config });
            this.requestUpdate();
        });

        // Cleanup on close
        dialog.addEventListener('closed', () => {
            dialog.remove();
        });

        // Append to body and show
        document.body.appendChild(dialog);
    }
}

// Register the custom element
customElements.define('lcards-msd-editor', LCARdSMSDEditor);
