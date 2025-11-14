/**
 * LCARdS Simple Card Foundation
 *
 * Minimal base class for simple, single-purpose cards that leverage
 * singleton architecture without MSD complexity.
 *
 * Philosophy:
 * - Card controls everything explicitly
 * - No auto-subscriptions or magic behavior
 * - Helpers available when needed
 * - Clear, predictable lifecycle
 *
 * Use Cases:
 * - Simple buttons with actions
 * - Status displays
 * - Labels with templates
 * - Single-entity cards
 *
 * NOT for:
 * - Multi-overlay displays (use LCARdSMSDCard)
 * - Complex routing/navigation
 * - Multi-entity grids
 */

import { html, css } from 'lit';
import { lcardsLog } from '../utils/lcards-logging.js';
import { LCARdSNativeCard } from './LCARdSNativeCard.js';
import { LCARdSActionHandler } from './LCARdSActionHandler.js';
import { UnifiedTemplateEvaluator } from '../core/templates/UnifiedTemplateEvaluator.js';
import { TemplateParser } from '../core/templates/TemplateParser.js';

/**
 * Base class for simple LCARdS cards
 *
 * Extends LCARdSNativeCard to inherit all HA integration,
 * adds singleton access and helper methods.
 */
export class LCARdSSimpleCard extends LCARdSNativeCard {

    static get properties() {
        return {
            ...super.properties,

            // Simple card state
            _entity: { type: Object, state: true },
            _singletons: { type: Object, state: true },
            _initialized: { type: Boolean, state: true }
        };
    }

    static get styles() {
        return [
            super.styles,
            css`
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                }

                .simple-card-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }

                .simple-card-error {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100px;
                    padding: 16px;
                    background: var(--error-background-color, rgba(244, 67, 54, 0.1));
                    border: 1px solid var(--error-color, #f44336);
                    border-radius: 4px;
                    color: var(--error-color, #f44336);
                    font-size: 14px;
                }

                .simple-card-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100px;
                    color: var(--primary-text-color);
                    font-size: 14px;
                    opacity: 0.7;
                }
            `
        ];
    }

    constructor() {
        super();

        // Simple card state
        this._entity = null;
        this._singletons = null;
        this._initialized = false;

        // Action handler (unified utility)
        this._actionHandler = new LCARdSActionHandler();

        // Template processing state
        this._templateUpdateScheduled = false;
        this._processedTexts = {
            label: '',
            content: '',
            texts: []
        };

        // Entity tracking for Jinja2 template updates
        this._trackedEntities = [];

        // Config provenance tracking (from CoreConfigManager)
        this._provenance = null;

        // ✨ NEW: Rules integration state
        this._overlayId = null;           // Unique overlay ID for this card
        this._overlayTags = [];           // Tags for rule targeting
        this._rulesCallbackIndex = null;  // Callback index from RulesEngine
        this._lastRulePatches = null;     // Cache of last applied patches

        lcardsLog.debug(`[LCARdSSimpleCard] Constructor called for ${this._getDisplayId()}`);
    }

    /**
     * Get display ID for logging - uses custom ID if provided, otherwise GUID
     * @returns {string} Display ID
     * @private
     */
    _getDisplayId() {
        return this.config?.id || this._cardGuid;
    }

    /**
     * Set card configuration with CoreConfigManager processing
     * @param {Object} config - Raw card configuration
     * @override
     */
    async setConfig(config) {
        if (!config) {
            throw new Error('Invalid configuration');
        }

        const core = window.lcardsCore || window.lcards?.core;

        // Wait for CoreConfigManager to be ready (critical system)
        if (core && !core.configManager?.initialized) {
            lcardsLog.debug(`[LCARdSSimpleCard] Waiting for CoreConfigManager to initialize...`);

            // Wait for core initialization to complete
            await core.initialize(this.hass);

            if (!core.configManager?.initialized) {
                lcardsLog.warn(`[LCARdSSimpleCard] CoreConfigManager still not available after waiting - using raw config`);
                super.setConfig(config);
                return;
            }
        }

        // Check if CoreConfigManager is available and initialized
        if (core?.configManager?.initialized) {
            try {
                // Determine card type from config or use class-level property
                const cardType = this.constructor.CARD_TYPE || config.type || 'simple-card';

                lcardsLog.debug(`[LCARdSSimpleCard] Processing config with CoreConfigManager`, {
                    cardType,
                    hasPreset: !!config.preset,
                    rawConfig: config
                });

                // Process config through CoreConfigManager (four-layer merge)
                const result = await core.configManager.processConfig(
                    config,
                    cardType,
                    { hass: this.hass }
                );

                // Log any errors or warnings
                if (result.errors?.length > 0) {
                    lcardsLog.error(`[LCARdSSimpleCard] Config validation errors:`, result.errors);
                }
                if (result.warnings?.length > 0) {
                    lcardsLog.warn(`[LCARdSSimpleCard] Config validation warnings:`, result.warnings);
                }

                // Store provenance for debugging
                this._provenance = result.provenance;

                // Use merged config (whether valid or not - let parent handle errors)
                const processedConfig = result.mergedConfig || config;

                lcardsLog.debug(`[LCARdSSimpleCard] Config processed`, {
                    valid: result.valid,
                    hasProvenance: !!result.provenance,
                    mergeOrder: result.provenance?.merge_order
                });

                // Call parent with processed config
                super.setConfig(processedConfig);

            } catch (error) {
                lcardsLog.error(`[LCARdSSimpleCard] CoreConfigManager processing failed:`, error);
                // Fallback: Use raw config
                super.setConfig(config);
            }
        } else {
            // Fallback: CoreConfigManager not available (no core singleton)
            lcardsLog.warn(`[LCARdSSimpleCard] No core singleton available - using raw config`);
            super.setConfig(config);
        }
    }

    /**
     * Called when config is set
     * @protected
     */
    _onConfigSet(config) {
        super._onConfigSet(config);

        // Store entity reference if present
        if (config.entity && this.hass) {
            this._entity = this.hass.states[config.entity];
        }

        // Load rules from config into RulesEngine
        if (config.rules && Array.isArray(config.rules) && config.rules.length > 0) {
            this._loadRulesFromConfig(config.rules);
        }

        lcardsLog.debug(`[LCARdSSimpleCard] Config set for ${this._getDisplayId()}`, {
            entity: config.entity,
            hasEntity: !!this._entity,
            rulesCount: config.rules?.length || 0,
            hasAnimations: !!config.animations,
            animationsCount: config.animations?.length || 0,
            hasTapAction: !!config.tap_action,
            hasHoldAction: !!config.hold_action,
            finalConfig: config  // Log the entire final config for debugging
        });

        // Process templates whenever config changes (async to support Jinja2)
        if (this._initialized) {
            // Already initialized - schedule template update
            this._scheduleTemplateUpdate();
        } else {
            // First config set before firstUpdated - process templates
            this._processTemplates();
        }
    }

    /**
     * Called when HASS changes
     * @protected
     */
    _onHassChanged(newHass, oldHass) {
        super._onHassChanged(newHass, oldHass);

        // Update entity reference
        if (this.config.entity) {
            this._entity = newHass.states[this.config.entity];
        }

        // IMPORTANT: Feed HASS back to singleton system for cross-card coordination
        if (window.lcards?.core) {
            window.lcards.core.ingestHass(newHass);
        }

        // Check if any tracked entities changed (for Jinja2 template updates)
        if (this._trackedEntities && this._trackedEntities.length > 0) {
            const hasChanges = this._trackedEntities.some(entityId => {
                const oldState = oldHass?.states?.[entityId];
                const newState = newHass?.states?.[entityId];
                return oldState !== newState;
            });

            if (hasChanges) {
                // Re-process templates when tracked entities change
                this._scheduleTemplateUpdate();
            }
        }

        // Call card-specific HASS handler
        if (typeof this._handleHassUpdate === 'function') {
            this._handleHassUpdate(newHass, oldHass);
        }
    }

    /**
     * Called when connected to DOM
     * @protected
     */
    _onConnected() {
        super._onConnected();

        // Initialize singleton access
        this._initializeSingletons();

        lcardsLog.debug(`[LCARdSSimpleCard] Connected: ${this._getDisplayId()}`);
    }

    /**
     * Called on first update
     * @protected
     */
    _onFirstUpdated(changedProperties) {
        super._onFirstUpdated(changedProperties);

        // Mark as initialized
        this._initialized = true;

        // Register callback with RulesEngine for entity change notifications
        this._registerRulesCallback();

        // Call card-specific initialization
        if (typeof this._handleFirstUpdate === 'function') {
            this._handleFirstUpdate(changedProperties);
        }

        lcardsLog.debug(`[LCARdSSimpleCard] First updated: ${this._getDisplayId()}`);
    }

    /**
     * Register callback with RulesEngine to be notified when rules need re-evaluation
     * This allows the card to update when entity states change
     * @private
     */
    _registerRulesCallback() {
        const rulesEngine = window.lcards?.core?.rulesManager;
        if (!rulesEngine) {
            lcardsLog.warn('[LCARdSSimpleCard] Cannot register rules callback - RulesEngine not available');
            return;
        }

        // Register callback to re-render when rules change
        this._rulesCallbackIndex = rulesEngine.setReEvaluationCallback(async () => {
            lcardsLog.debug(`[LCARdSSimpleCard] Rules re-evaluation triggered for ${this._getDisplayId()}`);

            // Trigger a re-render to apply updated rule styles
            this.requestUpdate();
        });

        lcardsLog.debug(`[LCARdSSimpleCard] Registered rules callback for ${this._getDisplayId()} (index: ${this._rulesCallbackIndex})`);
    }

    /**
     * Cleanup when card is removed from DOM
     */
    disconnectedCallback() {
        super.disconnectedCallback();

        // Unregister rules callback
        if (this._rulesCallbackIndex !== undefined) {
            const rulesEngine = window.lcards?.core?.rulesManager;
            if (rulesEngine) {
                rulesEngine.removeReEvaluationCallback(this._rulesCallbackIndex);
                lcardsLog.debug(`[LCARdSSimpleCard] Unregistered rules callback for ${this._getDisplayId()}`);
            }
        }
    }

    /**
     * Initialize singleton system access
     * @private
     */
    _initializeSingletons() {
        try {
            // Get core singletons via unified API
            const core = window.lcards?.core;

            if (!core) {
                lcardsLog.warn(`[LCARdSSimpleCard] Core singletons not available`);
                return;
            }

            const animationManager = core.getAnimationManager();
            lcardsLog.debug(`[LCARdSSimpleCard] AnimationManager singleton check for ${this._cardGuid}`, {
                hasGetMethod: typeof core.getAnimationManager === 'function',
                managerResult: !!animationManager,
                managerType: animationManager?.constructor?.name,
                coreAnimMgr: !!core.animationManager,
                directAccess: !!core.animationManager
            });

            this._singletons = {
                systemsManager: core.systemsManager,
                themeManager: core.getThemeManager(),
                rulesEngine: core.rulesManager,
                animationManager: animationManager,
                dataSourceManager: core.dataSourceManager,
                validationService: core.validationService,
                actionHandler: core.actionHandler,
                stylePresetManager: core.getStylePresetManager()
            };

            // Register this card with CoreSystemsManager for entity tracking
            if (this._singletons.systemsManager && this._cardGuid) {
                this._cardContext = this._singletons.systemsManager.registerCard(
                    this._cardGuid,
                    this,
                    this.config
                );
                lcardsLog.debug(`[LCARdSSimpleCard] Registered with CoreSystemsManager: ${this._cardGuid}`);
            }

            lcardsLog.debug(`[LCARdSSimpleCard] Singletons initialized for ${this._cardGuid}`, {
                hasSystemsManager: !!this._singletons.systemsManager,
                hasTheme: !!this._singletons.themeManager,
                hasRules: !!this._singletons.rulesEngine,
                hasAnimations: !!this._singletons.animationManager,
                hasDataSources: !!this._singletons.dataSourceManager
            });

        } catch (error) {
            lcardsLog.error(`[LCARdSSimpleCard] Singleton initialization failed:`, error);
        }
    }

    // ============================================================================
    // RULES INTEGRATION - Dynamic styling via RulesEngine
    // ============================================================================

    /**
     * Load rules from card config into the global RulesEngine
     * Follows MSD pattern: add rules to shared engine
     *
     * @param {Array} rules - Array of rule objects from card config
     * @private
     */
    _loadRulesFromConfig(rules) {
        if (!this._singletons?.rulesEngine) {
            lcardsLog.warn('[LCARdSSimpleCard] RulesEngine not available, cannot load rules from config');
            return;
        }

        if (!Array.isArray(rules) || rules.length === 0) {
            return;
        }

        try {
            const rulesEngine = this._singletons.rulesEngine;
            let addedCount = 0;

            // Add each rule to the shared engine (skip duplicates by ID)
            rules.forEach(rule => {
                // Ensure rule has an ID
                if (!rule.id) {
                    lcardsLog.warn('[LCARdSSimpleCard] Rule missing ID, skipping:', rule);
                    return;
                }

                // Skip if rule already exists in engine
                if (rulesEngine.rulesById.has(rule.id)) {
                    lcardsLog.debug(`[LCARdSSimpleCard] Rule ${rule.id} already exists in engine, skipping`);
                    return;
                }

                // Add rule to engine
                rulesEngine.rules.push(rule);
                addedCount++;
            });

            if (addedCount > 0) {
                // Rebuild indexes and compile new rules
                rulesEngine.buildRulesIndex();
                rulesEngine.buildDependencyIndex();
                rulesEngine._compileRules();
                rulesEngine.markAllDirty(); // Mark all rules dirty for initial evaluation

                lcardsLog.info(`[LCARdSSimpleCard] ✅ Loaded ${addedCount} rules from config. Total rules in engine: ${rulesEngine.rules.length}`);
            }

        } catch (error) {
            lcardsLog.error('[LCARdSSimpleCard] Failed to load rules from config:', error);
        }
    }

    /**
     * Register this card's overlay with the RulesEngine for dynamic styling
     * Subclasses should call this in firstUpdated() with their overlay configuration
     *
     * @param {string} overlayId - Unique identifier for this overlay (e.g., 'main_button')
     * @param {Array<string>} tags - Tags for rule targeting (e.g., ['status', 'button'])
     * @protected
     */
    _registerOverlayForRules(overlayId, tags = []) {
        if (!this._singletons?.rulesEngine || !this._singletons?.systemsManager) {
            lcardsLog.debug('[LCARdSSimpleCard] Rules or SystemsManager not available, skipping overlay registration');
            return;
        }

        // Create fully qualified overlay ID (cardId_overlayId)
        // If user provided config.id, use it for better readability, otherwise use generated GUID
        const cardId = this.config.id || this._cardGuid;
        this._overlayId = `${cardId}_${overlayId}`;
        this._overlayTags = Array.isArray(tags) ? tags : [tags];

        // Register overlay with CoreSystemsManager
        this._singletons.systemsManager.registerOverlay(this._overlayId, {
            id: this._overlayId,
            tags: this._overlayTags,
            sourceCardId: this._cardGuid
        });

        // Register callback with RulesEngine (follows MSD pattern)
        this._rulesCallbackIndex = this._singletons.rulesEngine.setReEvaluationCallback(async () => {
            // Evaluate rules to get patches
            const ruleResults = await this._singletons.rulesEngine.evaluateDirty({ getEntity: null });

            // Apply patches to this card's overlay
            this._applyRulePatches(ruleResults.overlayPatches);
        });

        lcardsLog.debug(`[LCARdSSimpleCard] Registered overlay for rules: ${this._overlayId}`, {
            tags: this._overlayTags,
            callbackIndex: this._rulesCallbackIndex
        });
    }

    /**
     * Unregister overlay from rules system during cleanup
     * @protected
     */
    _unregisterOverlayFromRules() {
        if (!this._overlayId) return;

        // Remove callback from RulesEngine
        if (this._rulesCallbackIndex !== null && this._singletons?.rulesEngine) {
            this._singletons.rulesEngine.removeReEvaluationCallback(this._rulesCallbackIndex);
            this._rulesCallbackIndex = null;
        }

        // Unregister overlay from SystemsManager
        if (this._singletons?.systemsManager) {
            this._singletons.systemsManager.unregisterOverlay(this._overlayId);
        }

        lcardsLog.debug(`[LCARdSSimpleCard] Unregistered overlay from rules: ${this._overlayId}`);

        this._overlayId = null;
        this._overlayTags = [];
        this._lastRulePatches = null;
    }

    /**
     * Apply rule patches to this card's overlay
     * Filters patches for this card's overlay and triggers efficient update
     *
     * @param {Array} overlayPatches - Array of overlay patches from RulesEngine
     * @private
     */
    _applyRulePatches(overlayPatches) {
        if (!overlayPatches || !this._overlayId) return;

        // Find patches for this card's overlay
        const myPatches = overlayPatches.filter(patch => patch.id === this._overlayId);

        if (myPatches.length === 0) {
            // No patches for this overlay - clear cached patches if any existed
            if (this._lastRulePatches !== null) {
                this._lastRulePatches = null;
                this.requestUpdate(); // Clear previous rule styles
            }
            return;
        }

        // Merge all patches for this overlay (later patches override)
        const mergedPatch = myPatches.reduce((acc, patch) => ({
            ...acc,
            ...patch,
            style: {
                ...(acc.style || {}),
                ...(patch.style || {})
            }
        }), {});

        // Cache patches for style resolution
        this._lastRulePatches = mergedPatch;

        // Trigger efficient update using Lit's change detection
        this.requestUpdate();

        lcardsLog.debug(`[LCARdSSimpleCard] Applied rule patches to ${this._overlayId}`, {
            patchCount: myPatches.length,
            style: mergedPatch.style
        });
    }

    /**
     * Get final merged style object combining config styles with rule patches
     * Subclasses should call this when computing final styles for rendering
     *
     * @param {Object} configStyle - Style from config
     * @returns {Object} Merged style object (config + rules)
     * @protected
     */
    _getMergedStyleWithRules(configStyle = {}) {
        if (!this._lastRulePatches || !this._lastRulePatches.style) {
            return configStyle;
        }

        // Merge config style with rule patches (rules override)
        return {
            ...configStyle,
            ...this._lastRulePatches.style
        };
    }

    // ============================================================================
    // HELPER METHODS - Available to subclasses
    // ============================================================================

    /**
     * Process a template string with current context
     *
     * Supports button-card syntax:
     * - JavaScript: [[[return entity.state === 'on' ? 'Active' : 'Inactive']]]
     * - Tokens: {{entity.attributes.friendly_name}}
     *
     * @param {string} template - Template string to process
     * @returns {string} Processed result
     */
    /**
     * Process template content with support for JavaScript, tokens, and Jinja2
     *
     * @param {string} template - Template string to process
     * @returns {Promise<string>} Processed template
     * @protected
     */
    async processTemplate(template) {
        if (!template || typeof template !== 'string') {
            return template;
        }

        try {
            // Create evaluation context
            const context = {
                entity: this._entity,
                config: this.config,
                hass: this.hass,
                variables: this.config?.variables || {},
                theme: this._singletons?.themeManager?.getCurrentTheme?.()
            };

            // Get dataSourceManager from global singleton (if available)
            const dataSourceManager = window.lcards?.debug?.msd?.pipelineInstance?.systemsManager?.dataSourceManager;

            // Check if template has datasource references but manager not available yet
            const hasDatasources = template.includes('{datasource:') || /\{[a-z_]+\.[a-z_]+/.test(template);
            if (hasDatasources && !dataSourceManager) {
                // Schedule a retry when DataSourceManager becomes available
                this._scheduleDatasourceRetry();

                lcardsLog.debug('[LCARdSSimpleCard] Datasource template detected but DataSourceManager not ready, will retry', {
                    cardGuid: this._cardGuid,
                    template: template.substring(0, 50)
                });
            }

            // Use UnifiedTemplateEvaluator for consistent template processing
            // This enables datasource access: {datasource:sensor.temp}
            const evaluator = new UnifiedTemplateEvaluator({
                hass: this.hass,
                context: context,
                dataSourceManager: dataSourceManager
            });

            // Use async evaluation to support all template types (JavaScript, Tokens, Datasources, Jinja2)
            const result = await evaluator.evaluateAsync(template);
            return result;

        } catch (error) {
            lcardsLog.error(`[LCARdSSimpleCard] Template processing failed:`, error);
            return template;
        }
    }

    /**
     * Schedule a retry of template processing when DataSourceManager becomes available
     * @private
     */
    _scheduleDatasourceRetry() {
        // Only schedule once
        if (this._datasourceRetryScheduled) {
            return;
        }
        this._datasourceRetryScheduled = true;

        // Poll for DataSourceManager availability
        const checkInterval = setInterval(() => {
            const dataSourceManager = window.lcards?.debug?.msd?.pipelineInstance?.systemsManager?.dataSourceManager;

            if (dataSourceManager) {
                clearInterval(checkInterval);
                this._datasourceRetryScheduled = false;

                lcardsLog.info('[LCARdSSimpleCard] DataSourceManager now available, re-processing templates', {
                    cardGuid: this._cardGuid
                });

                // Trigger template re-processing
                this._scheduleTemplateUpdate();
            }
        }, 100); // Check every 100ms

        // Give up after 10 seconds
        setTimeout(() => {
            if (this._datasourceRetryScheduled) {
                clearInterval(checkInterval);
                this._datasourceRetryScheduled = false;
                lcardsLog.warn('[LCARdSSimpleCard] DataSourceManager not available after timeout', {
                    cardGuid: this._cardGuid
                });
            }
        }, 10000);
    }    /**
     * Schedule template processing to avoid Lit update cycles
     * @protected
     */
    _scheduleTemplateUpdate() {
        if (this._templateUpdateScheduled) return;

        this._templateUpdateScheduled = true;
        requestAnimationFrame(async () => {
            this._templateUpdateScheduled = false;

            // Process templates (async for Jinja2 support)
            await this._processTemplates();

            // Re-render only if we're not in an update cycle
            if (!this.hasUpdated || this.updateComplete === Promise.resolve()) {
                this.requestUpdate();
            } else {
                // Wait for current update to complete
                this.updateComplete.then(() => {
                    this.requestUpdate();
                });
            }
        });
    }

    /**
     * Process templates (async to support Jinja2)
     * Subclasses should override to define their text processing
     * @protected
     */
    async _processTemplates() {
        // Default implementation processes standard text fields
        await this._processStandardTexts();

        // Call subclass-specific template processing hook
        if (typeof this._processCustomTemplates === 'function') {
            await this._processCustomTemplates();
        }
    }

    /**
     * Process standard text fields (label, content, texts array)
     * @protected
     */
    async _processStandardTexts() {
        // Process label template (with aliases)
        const rawLabel = this.config.label || this.config.text || '';
        const newLabel = await this.processTemplate(rawLabel);

        // Process content template (with aliases)
        const rawContent = this.config.content || this.config.value || '';
        const newContent = await this.processTemplate(rawContent);        // Process texts array
        const newTexts = [];
        if (this.config.texts && Array.isArray(this.config.texts)) {
            for (const textConfig of this.config.texts) {
                if (textConfig && typeof textConfig === 'object') {
                    const processedText = {
                        ...textConfig,
                        text: await this.processTemplate(textConfig.text || textConfig.content || '')
                    };
                    newTexts.push(processedText);
                }
            }
        }

        // Only update if values actually changed to avoid unnecessary re-renders
        const labelChanged = this._processedTexts.label !== newLabel;
        const contentChanged = this._processedTexts.content !== newContent;
        const textsChanged = JSON.stringify(this._processedTexts.texts) !== JSON.stringify(newTexts);

        if (labelChanged || contentChanged || textsChanged) {
            this._processedTexts.label = newLabel;
            this._processedTexts.content = newContent;
            this._processedTexts.texts = newTexts;

            // Extract and track entities from Jinja2 templates for auto-updates
            this._updateTrackedEntities();

            lcardsLog.debug(`[LCARdSSimpleCard] Templates processed for ${this._cardGuid}:`, {
                label: this._processedTexts.label,
                content: this._processedTexts.content,
                textsCount: this._processedTexts.texts.length,
                changed: { labelChanged, contentChanged, textsChanged }
            });

            // Call subclass hook for style resolution after template changes
            if (typeof this._onTemplatesChanged === 'function') {
                this._onTemplatesChanged();
            }
        }
    }

    /**
     * Extract and track entities from Jinja2 templates
     * @private
     */
    _updateTrackedEntities() {
        const trackedEntities = new Set();

        // Add primary entity
        if (this.config.entity) {
            trackedEntities.add(this.config.entity);
        }

        // Extract entities from templates
        const templates = [
            this.config.label,
            this.config.text,
            this.config.content,
            this.config.value
        ].filter(Boolean);

        // Add texts array templates
        if (this.config.texts && Array.isArray(this.config.texts)) {
            this.config.texts.forEach(textConfig => {
                if (textConfig) {
                    templates.push(textConfig.text || textConfig.content);
                }
            });
        }

        // Parse dependencies from all templates
        templates.forEach(template => {
            if (template && typeof template === 'string') {
                const deps = TemplateParser.extractDependencies(template);
                deps.forEach(entityId => trackedEntities.add(entityId));
            }
        });

        this._trackedEntities = Array.from(trackedEntities);

        lcardsLog.trace(`[LCARdSSimpleCard] Tracking ${this._trackedEntities.length} entities for ${this._cardGuid}:`, this._trackedEntities);
    }

    /**
     * Resolve dot-notation token path
     * @private
     */
    _resolveTokenPath(path, context) {
        const parts = path.split('.');
        let current = context;

        for (const part of parts) {
            if (current === null || current === undefined) {
                return null;
            }
            current = current[part];
        }

        return current;
    }

    /**
     * Get theme token value
     *
     * @param {string} tokenPath - Dot-notation path (e.g., 'colors.accent.primary')
     * @param {*} fallback - Fallback value if token not found
     * @returns {*} Token value or fallback
     */
    getThemeToken(tokenPath, fallback = null) {
        if (!this._singletons?.themeManager) {
            return fallback;
        }

        try {
            return this._singletons.themeManager.getToken(tokenPath, fallback);
        } catch (error) {
            lcardsLog.warn(`[LCARdSSimpleCard] Theme token fetch failed:`, error);
            return fallback;
        }
    }

    /**
     * Get style preset configuration
     *
     * @param {string} overlayType - Type of overlay (e.g., 'button', 'text')
     * @param {string} presetName - Name of the preset (e.g., 'lozenge', 'picard')
     * @returns {Object|null} Preset configuration or null
     */
    getStylePreset(overlayType, presetName) {
        if (!this._singletons?.stylePresetManager) {
            return null;
        }

        try {
            return this._singletons.stylePresetManager.getPreset(
                overlayType,
                presetName,
                this._singletons.themeManager
            );
        } catch (error) {
            lcardsLog.warn(`[LCARdSSimpleCard] Preset fetch failed:`, error);
            return null;
        }
    }

    /**
     * Resolve styles with theme tokens and state overrides
     *
     * @param {Object} baseStyle - Base style object
     * @param {Array<string>} themeTokens - Array of theme token paths to apply
     * @param {Object} stateOverrides - State-based style overrides
     * @returns {Object} Resolved style object
     */
    resolveStyle(baseStyle = {}, themeTokens = [], stateOverrides = {}) {
        let resolved = { ...baseStyle };

        // Apply theme tokens
        themeTokens.forEach(tokenPath => {
            const value = this.getThemeToken(tokenPath);
            if (value !== null && value !== undefined) {
                // Extract property name from path (last segment)
                const property = tokenPath.split('.').pop();
                resolved[property] = value;
            }
        });

        // Apply state overrides (highest priority)
        resolved = { ...resolved, ...stateOverrides };

        return resolved;
    }

    /**
     * Get entity state
     *
     * Uses CoreSystemsManager for cached entity access when available,
     * falls back to direct HASS access for backwards compatibility.
     *
     * @param {string} entityId - Entity ID (optional, defaults to card's entity)
     * @returns {Object|null} Entity state or null
     */
    getEntityState(entityId = null) {
        const id = entityId || this.config.entity;
        if (!id) {
            return null;
        }

        // Use CoreSystemsManager for cached access (preferred)
        if (this._singletons?.systemsManager) {
            return this._singletons.systemsManager.getEntityState(id);
        }

        // Fallback to direct HASS access (backwards compatibility)
        if (this.hass) {
            return this.hass.states[id] || null;
        }

        return null;
    }

    /**
     * Subscribe to entity state changes
     *
     * Uses CoreSystemsManager's subscription system for efficient change notifications.
     * Automatically tracks subscriptions for cleanup on card destroy.
     *
     * @param {string} entityId - Entity to monitor
     * @param {Function} callback - Called on change: callback(entityId, newState, oldState)
     * @returns {Function} Unsubscribe function
     *
     * @example
     * // Subscribe to temperature sensor
     * const unsubscribe = this.subscribeToEntity('sensor.temperature', (id, newState, oldState) => {
     *   console.log('Temperature changed from', oldState.state, 'to', newState.state);
     *   this.requestUpdate();
     * });
     *
     * // Later, unsubscribe
     * unsubscribe();
     */
    subscribeToEntity(entityId, callback) {
        if (!entityId || typeof callback !== 'function') {
            lcardsLog.warn('[LCARdSSimpleCard] Invalid entityId or callback for subscription');
            return () => {}; // No-op unsubscribe
        }

        if (!this._singletons?.systemsManager) {
            lcardsLog.warn('[LCARdSSimpleCard] CoreSystemsManager not available for subscription');
            return () => {}; // No-op unsubscribe
        }

        // Initialize subscription tracking if needed
        if (!this._entitySubscriptions) {
            this._entitySubscriptions = new Set();
        }

        // Subscribe via CoreSystemsManager
        const unsubscribe = this._singletons.systemsManager.subscribeToEntity(
            entityId,
            callback
        );

        // Track subscription for automatic cleanup
        this._entitySubscriptions.add(unsubscribe);

        lcardsLog.debug(`[LCARdSSimpleCard] Subscribed to entity: ${entityId} (card: ${this._cardGuid})`);

        // Return unsubscribe function
        return () => {
            this._entitySubscriptions.delete(unsubscribe);
            unsubscribe();
        };
    }

    /**
     * Call Home Assistant service
     *
     * @param {string} domain - Service domain (e.g., 'light')
     * @param {string} service - Service name (e.g., 'turn_on')
     * @param {Object} data - Service data
     * @returns {Promise<void>}
     */
    async callService(domain, service, data = {}) {
        if (!this.hass) {
            lcardsLog.warn(`[LCARdSSimpleCard] Cannot call service - no HASS instance`);
            return;
        }

        try {
            await this.hass.callService(domain, service, data);
            lcardsLog.debug(`[LCARdSSimpleCard] Called service ${domain}.${service}`, data);
        } catch (error) {
            lcardsLog.error(`[LCARdSSimpleCard] Service call failed:`, error);
        }
    }

    // ============================================================================
    // ACTION SYSTEM - Unified action handler
    // ============================================================================

    /**
     * Setup action handlers on element with full animation support
     *
     * Delegates to unified LCARdSActionHandler for consistent behavior
     * across all card types.
     *
     * @param {HTMLElement} element - Target element (must be in shadow DOM)
     * @param {Object} actions - Action configurations (tap_action, hold_action, double_tap_action)
     * @param {Object} options - Additional options
     * @param {Object} options.animationManager - AnimationManager instance for triggering animations
     * @param {string} options.elementId - Element ID for animation targeting
     * @returns {Function} Cleanup function
     */
    setupActions(element, actions = {}, options = {}) {
        if (!element) {
            return () => {};
        }

        // Prepare options for unified action handler
        const actionOptions = {
            ...options,
            animations: this.config.animations,
            getAnimationSetup: () => this._getAnimationSetup(),
            shadowRoot: this.shadowRoot,
            entity: this.config.entity // Pass card's entity as default for actions
        };

        // Delegate to unified action handler
        return this._actionHandler.setupActions(
            element,
            actions,
            this.hass,
            actionOptions
        );
    }

    /**
     * Hook for subclasses to provide animation-specific setup
     * @returns {Object} Animation setup configuration
     * @protected
     */
    _getAnimationSetup() {
        // Default implementation - subclasses should override
        return {
            overlayId: `simple-card-${this._cardGuid}`,
            elementSelector: '[data-overlay-id]'
        };
    }

    // ============================================================================
    // RENDER - Subclasses MUST implement _renderCard()
    // ============================================================================

    /**
     * Render the card content
     * @protected
     */
    _renderCard() {
        if (!this._initialized) {
            return html`
                <div class="simple-card-container">
                    <div class="simple-card-loading">
                        Initializing...
                    </div>
                </div>
            `;
        }

        // Subclasses must implement this
        return html`
            <div class="simple-card-container">
                <div class="simple-card-error">
                    Subclass must implement _renderCard()
                </div>
            </div>
        `;
    }

    // ============================================================================
    // LIFECYCLE HOOKS
    // ============================================================================

    /**
     * Called when disconnected from DOM
     * @protected
     */
    /**
     * Lifecycle hook - card disconnected from DOM
     * @protected
     */
    _onDisconnected() {
        // Cleanup rules integration
        this._unregisterOverlayFromRules();

        // Cleanup entity subscriptions
        if (this._entitySubscriptions) {
            this._entitySubscriptions.forEach(unsubscribe => {
                try {
                    unsubscribe();
                } catch (error) {
                    lcardsLog.error('[LCARdSSimpleCard] Error unsubscribing from entity:', error);
                }
            });
            this._entitySubscriptions.clear();
            lcardsLog.debug(`[LCARdSSimpleCard] Cleaned up entity subscriptions for ${this._cardGuid}`);
        }

        // Unregister from CoreSystemsManager
        if (this._singletons?.systemsManager && this._cardGuid) {
            try {
                this._singletons.systemsManager.unregisterCard(this._cardGuid);
                lcardsLog.debug(`[LCARdSSimpleCard] Unregistered from CoreSystemsManager: ${this._cardGuid}`);
            } catch (error) {
                lcardsLog.error('[LCARdSSimpleCard] Error unregistering from CoreSystemsManager:', error);
            }
        }

        // Action handler cleanup is handled by setupActions() cleanup function

        super._onDisconnected();
    }
}