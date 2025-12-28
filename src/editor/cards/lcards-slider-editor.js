/**
 * LCARdS Slider Editor
 *
 * Visual configuration editor for slider cards.
 * Standalone editor extending LCARdSBaseEditor directly.
 *
 * @extends {LCARdSBaseEditor}
 */

import { html } from 'lit';
import { lcardsLog } from '../../utils/lcards-logging.js';
import { LCARdSBaseEditor } from '../base/LCARdSBaseEditor.js';

// Import provenance tab
import '../components/provenance/lcards-provenance-tab.js';

export class LCARdSSliderEditor extends LCARdSBaseEditor {
    constructor() {
        super();
        this.cardType = 'slider';
        lcardsLog.debug('[LCARdSSliderEditor] Standalone editor initialized with cardType: slider');
    }

    /**
     * Get current editor mode
     * Slider supports preset and component modes
     * @returns {'preset'|'component'}
     * @private
     */
    _getMode() {
        if (this.config?.component) return 'component';
        return 'preset';
    }

    /**
     * Define editor tabs
     * @returns {Array} Tab definitions
     * @protected
     */
    _getTabDefinitions() {
        return [
            { label: 'Config', content: () => this._renderConfigTab() },
            { label: 'Style', content: () => this._renderStyleTab() },
            { label: 'Provenance', content: () => this._renderProvenanceTab() },
            { label: 'YAML', content: () => this._renderYamlTab() }
        ];
    }

    /**
     * Config tab - main configuration
     * @private
     */
    _renderConfigTab() {
        const mode = this._getMode();

        return this._renderFromConfig([
            {
                type: 'section',
                title: 'Basic Configuration',
                fields: [
                    { type: 'entity', path: 'entity', label: 'Entity' },
                    {
                        type: 'select',
                        path: 'preset',
                        label: 'Preset',
                        options: this._getPresetOptions(),
                        visible: mode === 'preset'
                    },
                    {
                        type: 'select',
                        path: 'component',
                        label: 'Component',
                        options: this._getComponentOptions(),
                        visible: mode === 'component'
                    }
                ]
            },
            {
                type: 'section',
                title: 'Control Configuration',
                fields: [
                    { type: 'text', path: 'control.mode', label: 'Control Mode', placeholder: 'auto' },
                    { type: 'number', path: 'control.min', label: 'Min Value' },
                    { type: 'number', path: 'control.max', label: 'Max Value' },
                    { type: 'number', path: 'control.step', label: 'Step' }
                ]
            }
        ]);
    }

    /**
     * Style tab - appearance configuration
     * @private
     */
    _renderStyleTab() {
        return this._renderFromConfig([
            {
                type: 'section',
                title: 'Track Style',
                fields: [
                    { type: 'color', path: 'style.track.fill', label: 'Track Fill' },
                    { type: 'color', path: 'style.track.background', label: 'Track Background' },
                    { type: 'number', path: 'style.track.height', label: 'Track Height' }
                ]
            },
            {
                type: 'section',
                title: 'Pill Style',
                fields: [
                    { type: 'number', path: 'style.pills.count', label: 'Pill Count' },
                    { type: 'number', path: 'style.pills.size', label: 'Pill Size' },
                    { type: 'number', path: 'style.pills.gap', label: 'Pill Gap' }
                ]
            },
            {
                type: 'section',
                title: 'Border Style',
                fields: [
                    { type: 'color', path: 'style.pills.border.top.color', label: 'Top Border Color' },
                    { type: 'color', path: 'style.pills.border.bottom.color', label: 'Bottom Border Color' },
                    { type: 'color', path: 'style.pills.border.left.color', label: 'Left Border Color' },
                    { type: 'color', path: 'style.pills.border.right.color', label: 'Right Border Color' }
                ]
            }
        ]);
    }

    /**
     * Provenance tab
     * @private
     */
    _renderProvenanceTab() {
        return html`
            <lcards-provenance-tab
                .editor=${this}
                .config=${this.config}
                .hass=${this.hass}>
            </lcards-provenance-tab>
        `;
    }

    /**
     * Get preset options for dropdown
     * @private
     */
    _getPresetOptions() {
        const stylePresetManager = window.lcards?.core?.stylePresetManager;
        if (!stylePresetManager) return [];

        const presets = stylePresetManager.getAvailablePresets('slider');
        return presets.map(name => ({ value: name, label: name }));
    }

    /**
     * Get component options for dropdown
     * @private
     */
    _getComponentOptions() {
        return [
            { value: 'horizontal', label: 'Horizontal' },
            { value: 'vertical', label: 'Vertical' },
            { value: 'picard-vertical', label: 'Picard Vertical' }
        ];
    }
}

// Register custom element
customElements.define('lcards-slider-editor', LCARdSSliderEditor);

lcardsLog.info('[LCARdSSliderEditor] Standalone editor module loaded');
