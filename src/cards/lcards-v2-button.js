/**
 * LCARdS V2 Button Card
 *
 * Lightweight button card that leverages the singleton architecture.
 * Demonstrates the V2 card pattern with:
 * - Direct singleton integration
 * - Rule-responsive styling
 * - Theme-aware appearance
 * - Simple configuration schema
 *
 * Example configuration:
 * ```yaml
 * type: custom:lcards-v2-button
 * entity: light.bedroom
 * text: "Bedroom Light"
 * icon: mdi:lightbulb
 * tap_action:
 *   action: toggle
 * overlay_id: bedroom_button  # Makes it targetable by rules
 * tags: [lighting, bedroom]   # Tag-based rule targeting
 * ```
 */

import { html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { LCARdSV2Card } from '../base/LCARdSV2Card.js';
import { ButtonRenderer } from '../msd/renderer/core/ButtonRenderer.js';
import { OverlayUtils } from '../msd/renderer/OverlayUtils.js';
import { lcardsLog } from '../utils/lcards-logging.js';

export class LCARdSV2ButtonCard extends LCARdSV2Card {

    static get properties() {
        return {
            ...super.properties,

            // Button-specific state
            _buttonState: { type: String, state: true },
            _buttonStyle: { type: Object, state: true },
            _isPressed: { type: Boolean, state: true },

            // Template processing results
            _processedText: { type: String, state: true },
            _processedLabel: { type: String, state: true },
            _processedValue: { type: String, state: true },
            _processedState: { type: String, state: true },

            // SVG rendering state
            _svgDimensions: { type: Object, state: true },
            _pendingActionInfo: { type: Object, state: true }
        };
    }

    static get styles() {
        return [
            super.styles,
            css`
                /* SVG Button Styles */
                .v2-button-svg {
                    display: block;
                    width: 100%;
                    height: auto;
                    cursor: pointer;
                    user-select: none;
                }

                .v2-button-svg:hover {
                    opacity: 0.95;
                }

                .v2-button-svg:active {
                    opacity: 0.85;
                }

                /* Fallback CSS Button Styles (used when ButtonRenderer fails) */
                .v2-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    user-select: none;
                    transition: all 0.2s ease;
                    min-height: 48px;

                    /* Default LCARdS styling */
                    background: var(--lcars-button-background, var(--primary-color));
                    color: var(--lcars-button-text, var(--text-primary-color));
                    border: 2px solid var(--lcars-button-border, var(--primary-color));
                    font-family: var(--lcars-font-family, 'Roboto', sans-serif);
                    font-size: var(--lcars-button-font-size, 14px);
                    font-weight: var(--lcars-button-font-weight, 500);
                }

                .v2-button:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }

                .v2-button:active,
                .v2-button.pressed {
                    transform: translateY(0);
                    opacity: 0.8;
                }

                .v2-button.state-on {
                    background: var(--lcars-button-on-background, var(--accent-color));
                    border-color: var(--lcars-button-on-border, var(--accent-color));
                }

                .v2-button.state-off {
                    background: var(--lcars-button-off-background, var(--disabled-color));
                    border-color: var(--lcars-button-off-border, var(--disabled-color));
                }

                .v2-button.state-unavailable {
                    background: var(--lcars-button-unavailable-background, #666);
                    border-color: var(--lcars-button-unavailable-border, #666);
                    cursor: not-allowed;
                    opacity: 0.5;
                }

                .button-icon {
                    margin-right: 8px;
                    font-size: 18px;
                }

                .button-text {
                    flex: 1;
                    text-align: center;
                }

                .button-state {
                    margin-left: 8px;
                    font-size: 12px;
                    opacity: 0.8;
                }

                /* Rule-based styling overrides */
                .v2-button[data-rule-applied="true"] {
                    position: relative;
                }

                /* Loading state */
                .v2-card-loading {
                    padding: 20px;
                    text-align: center;
                    color: var(--secondary-text-color);
                    font-size: 14px;
                }
            `
        ];
    }

    constructor() {
        super();

        // Button-specific state
        this._buttonState = 'unknown';
        this._buttonStyle = {};
        this._isPressed = false;
        this._actionsSetup = false;
        this._stateObj = null;

        // Template processing results
        this._processedText = null;
        this._processedLabel = null;
        this._processedValue = null;
        this._processedState = null;

        // Action handler cleanup and state
        this._actionCleanup = null;
        this._actionSetupInProgress = false;
        this._actionSetupRetried = false;

        // SVG rendering setup
        this._svgDimensions = { width: 200, height: 60 }; // Default button size
        this._pendingActionInfo = null;
        // Note: Using static ButtonRenderer.render() - no instance needed
    }

    /**
     * Load button preset from StylePresetManager
     * Supports both legacy flat format and new nested format
     * @private
     */
    async _loadButtonPreset() {
        // Check for preset in both legacy (flat) and new (nested) locations
        const presetName = this.config?.lcars_button_preset || this.config?.style?.lcars_button_preset;

        if (!presetName) {
            return {};
        }

        if (!this.systemsManager) {
            lcardsLog.debug(`[LCARdSV2ButtonCard] SystemsManager not ready for preset loading (${this._cardId})`);
            return {};
        }

        try {
            const preset = this.systemsManager.getStylePreset('button', presetName);
            if (preset && Object.keys(preset).length > 0) {
                lcardsLog.debug(`[LCARdSV2ButtonCard] ✅ Loaded preset '${presetName}':`, preset);
                return preset;
            } else {
                lcardsLog.debug(`[LCARdSV2ButtonCard] Preset '${presetName}' returned empty or null`);
            }
        } catch (error) {
            lcardsLog.warn(`[LCARdSV2ButtonCard] ⚠️ Failed to load preset '${presetName}':`, error);
        }

        return {};
    }

    /**
     * Build texts array for ButtonRenderer from unified configuration
     * Supports both legacy format and new nested format
     * @param {Object} config - Unified configuration object
     * @private
     */
    _buildTextsArray(config = this.config) {
        const texts = [];

        // Handle unified format: label and value fields (MSD compatibility)
        if (config.label) {
            texts.push({
                text: this._processedLabel || config.label,
                position: config.style?.label_position || 'center',
                textType: 'label'
            });
        }

        if (config.value) {
            texts.push({
                text: this._processedValue || config.value,
                position: config.style?.value_position || 'bottom-right',
                textType: 'value',
                fontSize: 12
            });
        }

        // Legacy text field support (backward compatibility)
        if (config.text && !config.label) {
            texts.push({
                text: this._processedText || config.text,
                position: 'center',
                textType: 'label'
            });
        }

        // Entity name fallback
        if (!config.text && !config.label && config.entity && this.hass?.states[config.entity]) {
            const entity = this.hass.states[config.entity];
            texts.push({
                text: entity.attributes.friendly_name || 'Button',
                position: 'center',
                textType: 'label'
            });
        }

        // State display (backward compatibility)
        if (config.show_state !== false && this._processedState && !config.value) {
            texts.push({
                text: this._processedState,
                position: 'bottom-right',
                textType: 'value',
                fontSize: 12,
                opacity: 0.8
            });
        }

        // Advanced multiple texts (from style.text.texts array)
        if (config.style?.text?.texts && Array.isArray(config.style.text.texts)) {
            texts.push(...config.style.text.texts);
        }

        // Legacy texts array support
        if (config.texts && Array.isArray(config.texts)) {
            texts.push(...config.texts);
        }

        // Icon as text element (if present)
        if (config.icon) {
            texts.unshift({ // Add at beginning for proper z-order
                text: config.icon, // Just the icon name, ButtonRenderer should handle it
                position: config.icon_position || 'left',
                textType: 'icon',
                fontSize: 18
            });
        }

        return texts;
    }

    /**
     * Build MSD-compatible button config (like ButtonOverlay)
     * @private
     */
    _buildMSDButtonConfig() {
        const unifiedConfig = this._parseUnifiedConfig();

        // Create buttonConfig exactly like MSD ButtonOverlay does
        // Use processed templates when available
        return {
            id: this._cardId || 'v2-button',
            label: this._processedLabel || unifiedConfig.label,
            content: this._processedValue || unifiedConfig.value,
            texts: this._buildTextsArray(unifiedConfig),
            tap_action: unifiedConfig.tap_action,
            hold_action: unifiedConfig.hold_action,
            double_tap_action: unifiedConfig.double_tap_action,
            // Store raw content for updates (like MSD)
            _raw: unifiedConfig,
            _originalContent: unifiedConfig.label || unifiedConfig.value
        };
    }

    /**
     * Resolve MSD-compatible button style (like ButtonOverlay)
     * @private
     */
    _resolveMSDButtonStyle() {
        const unifiedConfig = this._parseUnifiedConfig();

        // Use the same pattern as ButtonOverlay._resolveButtonOverlayStyles()
        const style = unifiedConfig.style || {};

        // Get preset if specified (like MSD does)
        let buttonStyle = { ...style };

        const presetName = style.lcars_button_preset || unifiedConfig.lcars_button_preset;
        lcardsLog.debug(`[LCARdSV2ButtonCard] Looking for preset: '${presetName}', systemsManager available: ${!!this.systemsManager}`);

        if (presetName && this.systemsManager) {
            try {
                const preset = this.systemsManager.getStylePreset('button', presetName);
                lcardsLog.debug(`[LCARdSV2ButtonCard] Got preset result:`, preset);

                if (preset && Object.keys(preset).length > 0) {
                    // Merge preset with style (preset has lower priority)
                    buttonStyle = { ...preset, ...style };
                    lcardsLog.debug(`[LCARdSV2ButtonCard] ✅ Applied MSD preset '${presetName}':`, preset);
                } else {
                    lcardsLog.warn(`[LCARdSV2ButtonCard] Preset '${presetName}' returned empty or null`);
                }
            } catch (error) {
                lcardsLog.warn(`[LCARdSV2ButtonCard] Failed to get MSD preset '${presetName}':`, error);
            }
        } else if (presetName && !this.systemsManager) {
            lcardsLog.warn(`[LCARdSV2ButtonCard] Preset '${presetName}' requested but systemsManager not available`);
        }

        // Add rule-based styling (from patches/rules - medium priority)
        const ruleStyle = this._buttonStyle || {};
        buttonStyle = { ...buttonStyle, ...ruleStyle };

        // Add state-based styling
        const stateStyle = this._getStateBasedStyle();
        buttonStyle = { ...buttonStyle, ...stateStyle };

        // Convert V2-style properties to ButtonRenderer format (for backwards compatibility)
        const convertedStyle = this._convertV2StyleToButtonRenderer(buttonStyle);

        lcardsLog.debug(`[LCARdSV2ButtonCard] Style resolution steps:`, {
            originalStyle: style,
            presetName: presetName,
            withRules: {...buttonStyle, ...ruleStyle},
            withState: {...buttonStyle, ...ruleStyle, ...stateStyle},
            converted: convertedStyle
        });

        return convertedStyle;
    }    /**
     * Parse config to support both legacy flat and new nested formats
     * @private
     */
    _parseUnifiedConfig() {
        const config = this.config;

        // Start with base config
        const unified = { ...config };

        // Handle legacy flat properties by moving them into style object
        if (!unified.style) {
            unified.style = {};
        }

        // Migrate legacy preset (flat -> nested)
        if (config.lcars_button_preset && !unified.style.lcars_button_preset) {
            unified.style.lcars_button_preset = config.lcars_button_preset;
        }

        // Migrate legacy text preset
        if (config.lcars_text_preset && !unified.style.lcars_text_preset) {
            unified.style.lcars_text_preset = config.lcars_text_preset;
        }

        // Migrate legacy colors
        if (config.color && !unified.style.color) {
            unified.style.color = config.color;
        }
        if (config.background_color && !unified.style.background_color) {
            unified.style.background_color = config.background_color;
        }

        // Migrate legacy bracket properties
        if (config.lcars_brackets && !unified.style.bracket_style) {
            unified.style.bracket_style = config.lcars_brackets;
        }

        // Handle text vs label/value (legacy compatibility)
        if (config.text && !unified.label && !unified.value) {
            unified.label = config.text;
        }

        // If no label is set but we have an entity, use the entity's friendly name
        if (!unified.label && !config.text && config.entity && this.hass?.states[config.entity]) {
            const entity = this.hass.states[config.entity];
            unified.label = entity.attributes.friendly_name || config.entity;
        }

        // Add show_state support
        if (config.show_state && this._stateObj) {
            unified.value = unified.value || this._stateObj.state;
        }

        lcardsLog.debug(`[LCARdSV2ButtonCard] Parsed unified config:`, {
            original: config,
            unified: unified
        });

        return unified;
    }



    /**
     * Convert V2-style properties to ButtonRenderer format
     * @private
     */
    _convertV2StyleToButtonRenderer(style) {
        const converted = { ...style };

        // Map common CSS properties to ButtonRenderer equivalents
        if (style.backgroundColor) converted.color = style.backgroundColor;
        if (style.borderColor) converted.border_color = style.borderColor;
        if (style.borderRadius) converted.border_radius = parseInt(style.borderRadius);
        if (style.color) converted.label_color = style.color;

        // Handle advanced features
        if (this.config.effects) {
            converted.gradient_enabled = this.config.effects.gradient;
            converted.glow_enabled = this.config.effects.glow;
            converted.pattern_enabled = this.config.effects.pattern;
        }

        // Handle individual borders (NEW feature)
        if (this.config.border) {
            const border = this.config.border;
            if (border.top) converted.border_top_width = border.top.width;
            if (border.right) converted.border_right_width = border.right.width;
            if (border.bottom) converted.border_bottom_width = border.bottom.width;
            if (border.left) converted.border_left_width = border.left.width;
        }

        return converted;
    }

    /**
     * Get state-based styling
     * @private
     */
    _getStateBasedStyle() {
        const stateStyle = {};

        // Apply state-specific colors
        switch (this._buttonState) {
            case 'on':
                stateStyle.color = 'var(--lcars-button-on-background, var(--accent-color))';
                stateStyle.border_color = 'var(--lcars-button-on-border, var(--accent-color))';
                break;
            case 'off':
                stateStyle.color = 'var(--lcars-button-off-background, var(--disabled-color))';
                stateStyle.border_color = 'var(--lcars-button-off-border, var(--disabled-color))';
                break;
            case 'unavailable':
                stateStyle.color = 'var(--lcars-button-unavailable-background, #666)';
                stateStyle.border_color = 'var(--lcars-button-unavailable-border, #666)';
                stateStyle.opacity = 0.5;
                break;
        }

        return stateStyle;
    }

    /**
     * Set button configuration with validation
     */
    setConfig(config) {
        // Basic validation
        if (!config) {
            throw new Error('V2 Button Card: Configuration required');
        }

        if (!config.entity && !config.text) {
            throw new Error('V2 Button Card: Either entity or text is required');
        }

        // Call parent setConfig
        super.setConfig(config);

        // Register this button as an overlay target for rules
        if (config.overlay_id) {
            setTimeout(() => {
                this._registerOverlayTarget(config.overlay_id, this);
            }, 0);
        }

        // Register tags for rule targeting
        if (config.tags && Array.isArray(config.tags)) {
            config.tags.forEach(tag => {
                this.setAttribute(`data-tag-${tag}`, 'true');
            });
        }
    }

    /**
     * Called when element is connected to DOM
     */
    connectedCallback() {
        super.connectedCallback();
        // Set up actions after element is fully connected
        if (this.config && this.systemsManager) {
            requestAnimationFrame(() => {
                this._setupActionListeners();
            });
        }
    }

    /**
     * Called after first render - fallback for action setup
     */
    firstUpdated() {
        super.firstUpdated();
        // Fallback: ensure actions are set up if not already done
        if (!this._actionsSetup && this.config && this.systemsManager) {
            requestAnimationFrame(() => {
                this._setupActionListeners();
            });
        }
    }

    /**
     * Set up unified action listeners on the SVG button element
     * Now works with ButtonRenderer SVG output
     */
    async _setupActionListeners() {
        // Prevent duplicate setups
        if (this._actionsSetup || this._actionSetupInProgress) {
            return;
        }

        this._actionSetupInProgress = true;
        lcardsLog.debug(`[LCARdSV2ButtonCard] Setting up SVG action listeners (${this._cardId})`);

        // Clean up previous listeners
        if (this._actionCleanup) {
            this._actionCleanup();
            this._actionCleanup = null;
        }

        // Wait for SVG to be fully rendered
        await this.updateComplete;

        const svgElement = this.shadowRoot?.querySelector('.v2-button-svg');
        const buttonGroup = svgElement?.querySelector('[data-button-id]');

        if (!buttonGroup || !this.config) {
            this._actionSetupInProgress = false;
            lcardsLog.warn(`[LCARdSV2ButtonCard] ❌ SVG action setup failed - missing requirements (${this._cardId})`);

            // Only retry once more after a longer delay
            if (!this._actionSetupRetried) {
                this._actionSetupRetried = true;
                setTimeout(() => {
                    this._actionSetupInProgress = false;
                    this._setupActionListeners();
                }, 500);
            }
            return;
        }

        // Prepare action configurations
        const actions = {
            tap_action: this.config.tap_action || { action: 'toggle' },
            hold_action: this.config.hold_action || null,
            double_tap_action: this.config.double_tap_action || null
        };

        // Filter out null actions
        Object.keys(actions).forEach(key => {
            if (!actions[key]) {
                delete actions[key];
            }
        });

        // Use universal base class action setup with SVG element
        this._actionCleanup = this.setupActions(buttonGroup, actions);
        this._actionsSetup = true;
        this._actionSetupInProgress = false;

        lcardsLog.debug(`[LCARdSV2ButtonCard] ✅ SVG Action listeners set up: ${Object.keys(actions).join(', ')} (${this._cardId})`);
    }

    /**
     * Cleanup action listeners on disconnect
     */
    disconnectedCallback() {
        if (this._actionCleanup) {
            this._actionCleanup();
            this._actionCleanup = null;
        }
        super.disconnectedCallback();
    }

    /**
     * Apply overlay patch from rules engine
     */
    _applyOverlayPatch(patch) {
        super._applyOverlayPatch(patch);

        // Check if this patch targets our button
        const overlayId = this.config?.overlay_id;
        if (!overlayId || patch.selector !== overlayId) {
            // Check tag-based targeting
            if (!this._matchesTagSelector(patch.selector)) {
                return;
            }
        }

        lcardsLog.debug(`[LCARdSV2ButtonCard] Applying patch to button (${this._cardId}):`, patch);

        // Apply style patches
        if (patch.style) {
            this._buttonStyle = { ...this._buttonStyle, ...patch.style };
            this.setAttribute('data-rule-applied', 'true');
            this.requestUpdate();
        }

        // Apply content patches
        if (patch.content) {
            // Button cards can have dynamic text content
            this._dynamicContent = patch.content;
            this.requestUpdate();
        }
    }

    /**
     * Check if button matches tag-based selector
     */
    _matchesTagSelector(selector) {
        // Handle tag selectors like "*[tag~='emergency']"
        if (selector.includes('[tag~=')) {
            const tagMatch = selector.match(/\[tag~=['"]([^'"]+)['"]\]/);
            if (tagMatch) {
                const targetTag = tagMatch[1];
                return this.hasAttribute(`data-tag-${targetTag}`);
            }
        }
        return false;
    }

    /**
     * Handle button tap using unified action handler
     */
    _handleTap(event) {
        event.stopPropagation();

        if (!this.config.entity || !this.hass) {
            return;
        }

        // Get tap action (default to toggle)
        const tapAction = this.config.tap_action || { action: 'toggle' };

        lcardsLog.debug(`[LCARdSV2ButtonCard] Executing tap action via unified handler:`, {
            entity: this.config.entity,
            action: tapAction.action
        });

        // Use unified action handler
        this._executeAction(event.currentTarget, tapAction, 'tap');

        this.requestUpdate();
    }

    /**
     * Execute action using the unified action handler
     * @param {HTMLElement} element - Source element
     * @param {Object} actionConfig - Action configuration
     * @param {string} actionType - Action type (tap, hold, double_tap)
     */
    async _executeAction(element, actionConfig, actionType = 'tap') {
        if (!this.systemsManager?.actionHandler) {
            lcardsLog.warn(`[LCARdSV2ButtonCard] Action handler not available - falling back to basic toggle`);
            // Fallback for basic toggle if action handler isn't ready
            if (actionConfig.action === 'toggle' && this.hass && this.config.entity) {
                this.hass.callService('homeassistant', 'toggle', { entity_id: this.config.entity });
            }
            return;
        }

        try {
            await this.systemsManager.executeAction(element, actionConfig, actionType);
        } catch (error) {
            lcardsLog.error(`[LCARdSV2ButtonCard] Action execution failed:`, error);
        }
    }

    /**
     * Execute tap action
     */
    _executeTapAction(tapAction) {
        if (!this.hass || !this.config.entity) {
            return;
        }

        switch (tapAction.action) {
            case 'toggle':
                this.hass.callService('homeassistant', 'toggle', {
                    entity_id: this.config.entity
                });
                break;

            case 'turn_on':
                this.hass.callService('homeassistant', 'turn_on', {
                    entity_id: this.config.entity
                });
                break;

            case 'turn_off':
                this.hass.callService('homeassistant', 'turn_off', {
                    entity_id: this.config.entity
                });
                break;

            case 'call-service':
                if (tapAction.service) {
                    const [domain, service] = tapAction.service.split('.');
                    this.hass.callService(domain, service, tapAction.service_data || {});
                }
                break;

            default:
                lcardsLog.warn(`[LCARdSV2ButtonCard] Unknown tap action: ${tapAction.action}`);
        }
    }

    /**
     * Update button state based on entity and handle async preset loading
     */
    updated(changedProperties) {
        super.updated(changedProperties);

        if (changedProperties.has('hass') && this.hass && this.config?.entity) {
            const entity = this.hass.states[this.config.entity];
            const newState = entity ? entity.state : 'unavailable';

            // Update state object for template processing
            this._stateObj = entity;

            if (this._buttonState !== newState) {
                this._buttonState = newState;
                // State change will trigger natural re-render via property
            }

            // Process templates when entity state changes
            this._processTemplates();
        }

        if (changedProperties.has('config') && this.config) {
            // Process templates when config changes
            this._processTemplates();

            // Load preset asynchronously when config changes (no forced re-render)
            this._loadAndApplyPresetAsync();
        }

        if (changedProperties.has('systemsManager') && this.systemsManager) {
            // Load preset when systems manager becomes available
            this._loadAndApplyPresetAsync();
        }

        // Only retry action setup if we haven't succeeded and have the prerequisites
        if (!this._actionsSetup && !this._actionSetupInProgress && this.config && this.systemsManager) {
            // Use a single delayed retry instead of immediate
            requestAnimationFrame(() => {
                this._setupActionListeners();
            });
        }
    }

    /**
     * Load preset asynchronously and trigger re-render
     * @private
     */
    async _loadAndApplyPresetAsync() {
        if (!this.config?.lcars_button_preset || this._presetLoaded) {
            return;
        }

        try {
            const preset = await this._loadButtonPreset();
            if (preset && Object.keys(preset).length > 0) {
                // Merge preset into button style (lower priority than rules/explicit)
                this._buttonStyle = { ...preset, ...this._buttonStyle };
                this._presetLoaded = true;
                // Natural re-render via property change
                this.requestUpdate();
                lcardsLog.debug(`[LCARdSV2ButtonCard] ✅ Applied preset '${this.config.lcars_button_preset}' (${this._cardId})`);
            }
        } catch (error) {
            lcardsLog.warn(`[LCARdSV2ButtonCard] ⚠️ Preset loading failed (${this._cardId}):`, error);
        }
    }

    /**
     * Process templates for dynamic content
     * Supports both legacy and unified config formats
     * @private
     */
    async _processTemplates() {
        if (!this._initialized || !this.systemsManager) {
            return;
        }

        try {
            let templatesProcessed = false;

            // Process text template (legacy)
            if (this.config.text && typeof this.config.text === 'string') {
                this._processedText = await this.processTemplate(this.config.text);
                templatesProcessed = true;
            }

            // Process label template (unified)
            if (this.config.label && typeof this.config.label === 'string') {
                this._processedLabel = await this.processTemplate(this.config.label);
                templatesProcessed = true;
            }

            // Process value template (unified)
            if (this.config.value && typeof this.config.value === 'string') {
                this._processedValue = await this.processTemplate(this.config.value);
                templatesProcessed = true;
            }

            // Process state display template (legacy)
            if (this.config.state_display && typeof this.config.state_display === 'string') {
                this._processedState = await this.processTemplate(this.config.state_display);
                templatesProcessed = true;
            }

            // Process show_state (when enabled, get entity state)
            if (this.config.show_state && this._stateObj) {
                this._processedState = this._stateObj.state;
                templatesProcessed = true;
            }

            // Request re-render if templates were processed
            if (templatesProcessed) {
                this.requestUpdate();
            }

        } catch (error) {
            lcardsLog.error(`[LCARdSV2ButtonCard] Template processing failed (${this._cardId}):`, error);
        }
    }

    /**
     * Get state-specific style overrides
     * @private
     */
    _getStateStyleOverrides() {
        const overrides = {};

        // Apply rule-based styling from _buttonStyle
        Object.entries(this._buttonStyle).forEach(([key, value]) => {
            if (key === 'border') {
                if (value.color) overrides.borderColor = value.color;
                if (value.width) overrides.borderWidth = `${value.width}px`;
            } else if (key === 'label_color' || key === 'color') {
                overrides.color = value;
            } else if (key === 'background' || key === 'background_color') {
                overrides.backgroundColor = value;
            } else {
                // Convert camelCase to kebab-case
                const cssKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                overrides[cssKey] = value;
            }
        });

        return overrides;
    }

    /**
     * Render fallback button when ButtonRenderer fails
     * @private
     */
    _renderFallbackButton() {
        lcardsLog.warn(`[LCARdSV2ButtonCard] Using CSS fallback rendering (${this._cardId})`);

        const entity = this.hass?.states[this.config.entity];
        const displayText = this._processedText || this.config.text || entity?.attributes.friendly_name || 'Button';
        const displayState = this._processedState || entity?.state || 'unknown';

        const buttonClasses = [
            'v2-button',
            `state-${this._buttonState}`,
            this._isPressed ? 'pressed' : ''
        ].filter(Boolean).join(' ');

        return html`
            <div class="v2-card-container">
                <div class="${buttonClasses}">
                    ${this.config.icon ? html`
                        <ha-icon class="button-icon" .icon="${this.config.icon}"></ha-icon>
                    ` : ''}
                    <span class="button-text">${displayText}</span>
                    ${this.config.show_state !== false ? html`
                        <span class="button-state">${displayState}</span>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render loading state
     * @private
     */
    _renderLoadingState() {
        return html`
            <div class="v2-card-container">
                <div class="v2-card-loading">
                    Initializing V2 Button...
                </div>
            </div>
        `;
    }

    /**
     * Render the button using ButtonRenderer (SVG-based)
     */
    render() {
        if (!this.config) {
            return super.render();
        }

        if (!this._initialized) {
            return this._renderLoadingState();
        }

        // Calculate dimensions from config or use defaults
        const size = this.config.size || this._svgDimensions;
        const position = { x: 0, y: 0 }; // Relative to SVG coordinate system

        try {
            // Ensure global managers are available for MSD rendering
            if (!this._ensureGlobalManagersForMSD()) {
                lcardsLog.warn(`[LCARdSV2ButtonCard] SystemsManager not available, using fallback (${this._cardId})`);
                return this._renderFallbackButton();
            }

            // Use MSD ButtonOverlay pattern: static render method
            // This matches exactly how MSD ButtonOverlay works

            // Build simple buttonConfig (like MSD ButtonOverlay)
            const buttonConfig = this._buildMSDButtonConfig();

            // Resolve style (like MSD ButtonOverlay)
            const buttonStyle = this._resolveMSDButtonStyle();

            // Use static ButtonRenderer.render() (exactly like MSD)
            const result = ButtonRenderer.render(
                buttonConfig,
                buttonStyle,
                size,
                position,
                {
                    cellId: this._cardId,
                    gridContext: false,
                    cardInstance: this
                }
            );

            // Process actions using MSD ActionHelpers (like ButtonOverlay does)
            // Note: ActionHelpers.processOverlayActions() is called by ButtonRenderer internally
            // when actions are present in config, so no additional action processing needed here

            return html`
                <div class="v2-card-container">
                    <svg
                        class="v2-button-svg"
                        width="${size.width}"
                        height="${size.height}"
                        viewBox="0 0 ${size.width} ${size.height}"
                        style="display: block; width: 100%; height: auto; max-width: ${size.width}px;"
                    >
                        ${unsafeHTML(result.markup)}
                    </svg>
                </div>
            `;

        } catch (error) {
            lcardsLog.error(`[LCARdSV2ButtonCard] ButtonRenderer failed (${this._cardId}):`, error);
            return this._renderFallbackButton();
        }
    }

    /**
     * Ensure global managers are available for static ButtonRenderer.render()
     * @private
     */
    _ensureGlobalManagersForMSD() {
        if (!this.systemsManager) return false;

        const core = this.systemsManager.getCore();
        if (!core) return false;

        // Ensure ThemeManager is exposed at expected window location for MSD renderers
        if (typeof window !== 'undefined') {
            if (!window.lcards) {
                window.lcards = {};
            }
            if (!window.lcards.theme) {
                window.lcards.theme = core.getThemeManager();
                lcardsLog.debug(`[LCARdSV2ButtonCard] ✅ ThemeManager exposed at window.lcards.theme (${this._cardId})`);
            }
        }

        return true;
    }

    /**
     * Legacy method redirected to MSD pattern
     * @private
     */
    _resolveButtonRendererStyleSync() {
        return this._resolveMSDButtonStyle();
    }

    /**
     * Get card size
     */
    getCardSize() {
        return 1; // Small button card
    }

    /**
     * Editor configuration schema
     */
    static getConfigElement() {
        // Return editor element when implemented
        return document.createElement('div');
    }

    /**
     * Stub configuration for card picker
     */
    static getStubConfig() {
        return {
            type: 'custom:lcards-v2-button',
            entity: 'light.example',
            text: 'Example Button',
            icon: 'mdi:lightbulb',
            lcars_button_preset: 'lozenge', // NEW: Showcase preset support
            overlay_id: 'example_button',
            tags: ['example']
        };
    }
}

// Register the card
customElements.define('lcards-v2-button', LCARdSV2ButtonCard);

// Register with card picker
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'lcards-v2-button',
    name: 'LCARdS V2 Button',
    description: 'Lightweight button card with singleton architecture support',
    preview: true
});

lcardsLog.debug('[LCARdSV2ButtonCard] V2 Button Card registered');