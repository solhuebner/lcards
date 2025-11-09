/**
 * V2 Card Systems Manager
 *
 * Lightweight systems coordinator for V2 cards that provides:
 * - Access to singleton systems (themes, rules, animations, datasources)
 * - Template processing capabilities
 * - Style resolution
 * - DataSource subscription management
 * - Rule-based upda/**
 * V2CardSystemsManager
 *
 * This is a mini version of the full MSD SystemsManager, focused on
 * the essential capabilities needed by lightweight V2 cards.
 */

import { lcardsLog } from '../utils/lcards-logging.js';
import { LightweightTemplateProcessor } from './LightweightTemplateProcessor.js';
import { V2StyleResolver } from './V2StyleResolver.js';
import { ActionHelpers } from '../msd/renderer/ActionHelpers.js';

export class V2CardSystemsManager {
    constructor(cardInstance) {
        this.card = cardInstance;
        this.cardId = cardInstance._cardId;

        // Singleton system references (shared across all V2 cards)
        this.rulesEngine = null;
        this.themeManager = null;
        this.animationManager = null;
        this.dataSourceManager = null;
        this.validationService = null;
        this.actionHandler = null;

        // V2-specific local systems
        this.templateProcessor = null;
        this.styleResolver = null;

        // State tracking
        this.initialized = false;
        this.dataSourceSubscriptions = new Map(); // dsId -> subscription
        this.ruleCallbacks = new Set();

        lcardsLog.debug(`[V2CardSystemsManager] Created for card ${this.cardId}`);
    }

    // ==========================================
    // UNIFIED API ACCESS METHODS
    // ==========================================

    /**
     * Get core singletons via unified API
     * Provides backward compatibility with direct access fallback
     * @returns {Object} Core singleton manager object
     */
    getCore() {
        // Prefer unified API access
        if (window.lcards?.core) {
            return window.lcards.core;
        }

        // Fallback for legacy/debugging
        if (window.lcards?.debug?.singletons) {
            return window.lcards.debug.singletons;
        }

        // Last resort - this shouldn't happen in production
        lcardsLog.warn('[V2CardSystemsManager] No unified API access available, falling back to import');
        return null;
    }

    /**
     * Get runtime API instance
     * @returns {Object|null} MSD Runtime API instance
     */
    getRuntimeAPI() {
        if (window.lcards?.msd) {
            return window.lcards.msd;
        }
        return null;
    }

    /**
     * Get debug API instance
     * @returns {Object|null} MSD Debug API instance
     */
    getDebugAPI() {
        if (window.lcards?.debug?.msd) {
            return window.lcards.debug.msd;
        }
        return null;
    }

    /**
     * Initialize the systems manager
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.initialized) {
            lcardsLog.debug(`[V2CardSystemsManager] Already initialized (${this.cardId})`);
            return;
        }

        try {
            // Use unified API to access core singletons
            const core = this.getCore();
            if (!core || !core.rulesManager) {
                throw new Error('Core singletons not ready - systems not available');
            }

            // Connect to singleton systems via unified API
            this.rulesEngine = core.rulesManager;
            this.animationManager = core.animationManager;
            this.dataSourceManager = core.dataSourceManager;
            this.validationService = core.validationService;
            this.actionHandler = core.actionHandler;

            // Get theme-related managers (may be null if core still initializing)
            this.themeManager = core.getThemeManager();
            this.stylePresetManager = core.getStylePresetManager();

            lcardsLog.debug(`[V2CardSystemsManager] Singleton connections established (${this.cardId})`);

            // Initialize local systems
            this.templateProcessor = new LightweightTemplateProcessor(this);
            this.styleResolver = new V2StyleResolver(this);

            await this.templateProcessor.initialize();
            await this.styleResolver.initialize();

            this.initialized = true;

            lcardsLog.info(`[V2CardSystemsManager] ✅ Initialization complete (${this.cardId})`);

        } catch (error) {
            lcardsLog.error(`[V2CardSystemsManager] ❌ Initialization failed (${this.cardId}):`, error);
            throw error;
        }
    }

    /**
     * Process a template with the given context
     * @param {string|Function} template - Template to process
     * @param {Object} context - Template context
     * @returns {Promise<any>} Processed result
     */
    async processTemplate(template, context = {}) {
        if (!this.templateProcessor) {
            lcardsLog.warn(`[V2CardSystemsManager] Template processor not ready (${this.cardId})`);
            return template;
        }

        return this.templateProcessor.process(template, context);
    }

    /**
     * Resolve styles using theme tokens and state overrides
     * @param {Object} baseStyle - Base style object
     * @param {Array<string>} themeTokens - Array of theme token paths
     * @param {Object} stateOverrides - State-based style overrides
     * @returns {Object} Resolved style object
     */
    resolveStyle(baseStyle = {}, themeTokens = [], stateOverrides = {}) {
        if (!this.styleResolver) {
            lcardsLog.warn(`[V2CardSystemsManager] Style resolver not ready (${this.cardId})`);
            return { ...baseStyle, ...stateOverrides };
        }

        return this.styleResolver.resolveStyle(baseStyle, themeTokens, stateOverrides);
    }

    /**
     * Get theme token by path
     * @param {string} tokenPath - Dot-notation path to token
     * @param {any} fallback - Fallback value if token not found
     * @returns {any} Token value or fallback
     */
    getThemeToken(tokenPath, fallback = null) {
        // Lazy-load ThemeManager if not available yet
        if (!this.themeManager) {
            const core = this.getCore();
            if (core) {
                this.themeManager = core.getThemeManager();
            }
        }

        if (!this.themeManager) {
            // Only warn once per card instance to avoid spam
            if (!this._themeManagerWarnShown) {
                lcardsLog.debug(`[V2CardSystemsManager] Theme manager not ready yet, using fallback (${this.cardId})`);
                this._themeManagerWarnShown = true;
            }
            return fallback;
        }

        try {
            return this.themeManager.getToken(tokenPath, fallback);
        } catch (error) {
            lcardsLog.warn(`[V2CardSystemsManager] Theme token fetch failed (${this.cardId}):`, error);
            return fallback;
        }
    }

    /**
     * Get active theme information
     * @returns {Object|null} Active theme info
     */
    getActiveTheme() {
        if (!this.themeManager) {
            return null;
        }

        try {
            return this.themeManager.getActiveTheme();
        } catch (error) {
            lcardsLog.warn(`[V2CardSystemsManager] Active theme fetch failed (${this.cardId}):`, error);
            return null;
        }
    }

    /**
     * Get style preset from StylePresetManager
     * @param {string} overlayType - Type of overlay (e.g., 'button', 'status_grid')
     * @param {string} presetName - Name of the preset (e.g., 'lozenge', 'picard-filled')
     * @returns {Object|null} Preset configuration or null if not found
     */
    getStylePreset(overlayType, presetName) {
        // Lazy-load managers if not available yet
        if (!this.stylePresetManager) {
            const core = this.getCore();
            if (core) {
                this.stylePresetManager = core.getStylePresetManager();
            }
        }

        if (!this.themeManager) {
            const core = this.getCore();
            if (core) {
                this.themeManager = core.getThemeManager();
            }
        }

        if (!this.stylePresetManager) {
            // Only warn once per card instance to avoid spam
            if (!this._stylePresetWarnShown) {
                lcardsLog.debug(`[V2CardSystemsManager] StylePreset manager not ready yet (${this.cardId})`);
                this._stylePresetWarnShown = true;
            }
            return null;
        }

        try {
            return this.stylePresetManager.getPreset(overlayType, presetName, this.themeManager);
        } catch (error) {
            lcardsLog.warn(`[V2CardSystemsManager] StylePreset fetch failed (${this.cardId}):`, error);
            return null;
        }
    }

    /**
     * Get available presets for an overlay type
     * @param {string} overlayType - Type of overlay
     * @returns {Array} Array of preset names
     */
    getAvailablePresets(overlayType) {
        // Lazy-load StylePresetManager if not available yet
        if (!this.stylePresetManager) {
            const core = this.getCore();
            if (core) {
                this.stylePresetManager = core.getStylePresetManager();
            }
        }

        if (!this.stylePresetManager) {
            return [];
        }

        try {
            return this.stylePresetManager.getAvailablePresets(overlayType);
        } catch (error) {
            lcardsLog.warn(`[V2CardSystemsManager] Available presets fetch failed (${this.cardId}):`, error);
            return [];
        }
    }

    /**
     * Check if a style preset exists
     * @param {string} overlayType - Type of overlay
     * @param {string} presetName - Name of the preset
     * @returns {boolean} True if preset exists
     */
    hasStylePreset(overlayType, presetName) {
        if (!this.stylePresetManager) {
            return false;
        }

        return this.stylePresetManager.hasPreset(overlayType, presetName);
    }

    /**
     * Subscribe to a data source
     * @param {Object} dsConfig - DataSource configuration
     * @param {Function} callback - Update callback
     * @returns {Promise<string>} Subscription ID
     */
    async subscribeToDataSource(dsConfig, callback) {
        if (!this.dataSourceManager) {
            throw new Error('DataSource manager not available');
        }

        try {
            const subscriptionId = await this.dataSourceManager.subscribe(dsConfig, callback);
            this.dataSourceSubscriptions.set(subscriptionId, { dsConfig, callback });

            lcardsLog.debug(`[V2CardSystemsManager] DataSource subscribed (${this.cardId}):`, subscriptionId);
            return subscriptionId;

        } catch (error) {
            lcardsLog.error(`[V2CardSystemsManager] DataSource subscription failed (${this.cardId}):`, error);
            throw error;
        }
    }

    /**
     * Unsubscribe from a data source
     * @param {string} subscriptionId - Subscription ID to cancel
     */
    async unsubscribeFromDataSource(subscriptionId) {
        if (!this.dataSourceManager) {
            return;
        }

        try {
            await this.dataSourceManager.unsubscribe(subscriptionId);
            this.dataSourceSubscriptions.delete(subscriptionId);

            lcardsLog.debug(`[V2CardSystemsManager] DataSource unsubscribed (${this.cardId}):`, subscriptionId);

        } catch (error) {
            lcardsLog.warn(`[V2CardSystemsManager] DataSource unsubscription failed (${this.cardId}):`, error);
        }
    }

    /**
     * Register for rule-based updates
     * @param {Function} callback - Rule update callback
     * @returns {Function} Unregister function
     */
    registerForRuleUpdates(callback) {
        if (!this.rulesEngine) {
            lcardsLog.warn(`[V2CardSystemsManager] Rules engine not available (${this.cardId})`);
            return () => {}; // No-op unregister function
        }

        try {
            this.ruleCallbacks.add(callback);
            const unregister = this.rulesEngine.registerCallback(this.cardId, callback);

            lcardsLog.debug(`[V2CardSystemsManager] Rule callback registered (${this.cardId})`);

            // Return enhanced unregister that cleans up local tracking
            return () => {
                unregister();
                this.ruleCallbacks.delete(callback);
            };

        } catch (error) {
            lcardsLog.error(`[V2CardSystemsManager] Rule callback registration failed (${this.cardId}):`, error);
            return () => {}; // No-op unregister function
        }
    }

    /**
     * Trigger animation on the card
     * @param {string} animationType - Type of animation
     * @param {Object} config - Animation configuration
     * @returns {Promise<void>}
     */
    async triggerAnimation(animationType, config = {}) {
        if (!this.animationManager) {
            lcardsLog.warn(`[V2CardSystemsManager] Animation manager not available (${this.cardId})`);
            return;
        }

        try {
            await this.animationManager.triggerAnimation(this.card, animationType, config);
            lcardsLog.debug(`[V2CardSystemsManager] Animation triggered (${this.cardId}):`, animationType);

        } catch (error) {
            lcardsLog.error(`[V2CardSystemsManager] Animation failed (${this.cardId}):`, error);
        }
    }

    /**
     * Get entity state from SystemsManager
     * @param {string} entityId - Entity ID to fetch
     * @returns {Object|null} Entity state or null
     */
    getEntityState(entityId) {
        const core = this.getCore();
        if (!core || !core.systemsManager) {
            return null;
        }

        try {
            return core.systemsManager.getEntityState(entityId);
        } catch (error) {
            lcardsLog.warn(`[V2CardSystemsManager] Entity state fetch failed (${this.cardId}):`, error);
            return null;
        }
    }

    /**
     * Subscribe to entity updates
     * @param {string} entityId - Entity ID to watch
     * @param {Function} callback - Update callback
     * @returns {Function} Unsubscribe function
     */
    subscribeToEntity(entityId, callback) {
        const core = this.getCore();
        if (!core || !core.systemsManager) {
            lcardsLog.warn(`[V2CardSystemsManager] SystemsManager not available for entity subscription (${this.cardId})`);
            return () => {}; // No-op unsubscribe function
        }

        try {
            return core.systemsManager.subscribeToEntity(entityId, callback);
        } catch (error) {
            lcardsLog.error(`[V2CardSystemsManager] Entity subscription failed (${this.cardId}):`, error);
            return () => {}; // No-op unsubscribe function
        }
    }

    // ================================
    // ACTION HANDLING
    // ================================

    /**
     * Execute an action using the unified action handler
     * @param {Object} element - Source element
     * @param {Object} actionConfig - Action configuration
     * @param {string} actionType - Action type (tap, hold, double_tap)
     * @returns {Promise<void>}
     */
    async executeAction(element, actionConfig, actionType = 'tap') {
        try {
            // Ensure action config includes entity if not already present
            const enrichedActionConfig = { ...actionConfig };
            if (!enrichedActionConfig.entity && this.card.config?.entity) {
                enrichedActionConfig.entity = this.card.config.entity;
            }

            lcardsLog.debug(`[V2CardSystemsManager] Executing ${actionType} action via ActionHelpers (${this.cardId}):`, enrichedActionConfig);

            // Use MSD's proven action system - same as overlays
            ActionHelpers.executeAction(enrichedActionConfig, this.card, actionType, element);
        } catch (error) {
            lcardsLog.error(`[V2CardSystemsManager] Action execution failed (${this.cardId}):`, error);
        }
    }

    /**
     * Setup action listeners on an element using the unified action handler
     * @param {HTMLElement} element - Target element
     * @param {Object} actions - Action configurations (tap_action, hold_action, etc.)
     * @param {string} entityId - Entity ID for action context
     * @returns {Function} Cleanup function
     */
    setupActionListeners(element, actions, entityId) {
        lcardsLog.debug(`[V2CardSystemsManager] Setting up action listeners using ActionHelpers (${this.cardId})`);
        lcardsLog.trace(`[V2CardSystemsManager] Element: ${element?.tagName}, Actions: ${Object.keys(actions).join(', ')}, Entity: ${entityId}`);



        try {
            // Always use manual setup with ActionHelpers (proven MSD approach)
            lcardsLog.debug(`[V2CardSystemsManager] Using ActionHelpers-based setup (${this.cardId})`);
            const cleanupFunctions = [];

                if (actions.tap_action) {
                    lcardsLog.trace(`[V2CardSystemsManager] Adding click listener for tap_action (${this.cardId})`);
                    const tapHandler = (event) => {
                        // Enrich action config with entity if not present
                        const enrichedAction = { ...actions.tap_action };
                        if (!enrichedAction.entity && this.card.config?.entity) {
                            enrichedAction.entity = this.card.config.entity;
                        }

                        // Use MSD's proven action system - same as MSD overlays
                        ActionHelpers.executeAction(enrichedAction, this.card, 'tap', element);
                    };
                    element.addEventListener('click', tapHandler);
                    cleanupFunctions.push(() => element.removeEventListener('click', tapHandler));
                    lcardsLog.debug(`[V2CardSystemsManager] ✅ Click listener added (${this.cardId})`);
                }

                if (actions.double_tap_action) {
                    const doubleTapHandler = () => {
                        // Enrich action config with entity if not present
                        const enrichedAction = { ...actions.double_tap_action };
                        if (!enrichedAction.entity && this.card.config?.entity) {
                            enrichedAction.entity = this.card.config.entity;
                        }

                        ActionHelpers.executeAction(enrichedAction, this.card, 'double_tap', element);
                    };
                    element.addEventListener('dblclick', doubleTapHandler);
                    cleanupFunctions.push(() => element.removeEventListener('dblclick', doubleTapHandler));
                }

                if (actions.hold_action) {
                    let holdTimer;
                    const holdStart = () => {
                        holdTimer = setTimeout(() => {
                            // Enrich action config with entity if not present
                            const enrichedAction = { ...actions.hold_action };
                            if (!enrichedAction.entity && this.card.config?.entity) {
                                enrichedAction.entity = this.card.config.entity;
                            }

                            ActionHelpers.executeAction(enrichedAction, this.card, 'hold', element);
                        }, 500);
                    };
                    const holdEnd = () => {
                        if (holdTimer) {
                            clearTimeout(holdTimer);
                            holdTimer = null;
                        }
                    };

                    element.addEventListener('pointerdown', holdStart);
                    element.addEventListener('pointerup', holdEnd);
                    element.addEventListener('pointercancel', holdEnd);

                    cleanupFunctions.push(() => {
                        element.removeEventListener('pointerdown', holdStart);
                        element.removeEventListener('pointerup', holdEnd);
                        element.removeEventListener('pointercancel', holdEnd);
                        if (holdTimer) clearTimeout(holdTimer);
                    });
                }

            lcardsLog.debug(`[V2CardSystemsManager] ✅ Action listeners setup complete - ${cleanupFunctions.length} handlers added (${this.cardId})`);
            return () => {
                lcardsLog.trace(`[V2CardSystemsManager] Cleaning up ${cleanupFunctions.length} action listeners (${this.cardId})`);
                cleanupFunctions.forEach(cleanup => cleanup());
            };
        } catch (error) {
            lcardsLog.error(`[V2CardSystemsManager] Action listener setup failed (${this.cardId}):`, error);
            return () => {}; // No-op cleanup
        }
    }

    /**
     * Get debug information
     * @returns {Object} Debug info
     */
    getDebugInfo() {
        return {
            cardId: this.cardId,
            initialized: this.initialized,

            // Singleton connections
            singletonConnections: {
                rulesEngine: !!this.rulesEngine,
                themeManager: !!this.themeManager,
                animationManager: !!this.animationManager,
                dataSourceManager: !!this.dataSourceManager,
                validationService: !!this.validationService,
                actionHandler: !!this.actionHandler
            },

            // Local systems
            localSystems: {
                templateProcessor: !!this.templateProcessor,
                styleResolver: !!this.styleResolver
            },

            // Subscriptions
            subscriptions: {
                dataSourceCount: this.dataSourceSubscriptions.size,
                ruleCallbackCount: this.ruleCallbacks.size
            },

            // Active theme
            activeTheme: this.getActiveTheme()?.id || 'none'
        };
    }

    /**
     * Clean up resources and subscriptions
     */
    async destroy() {
        lcardsLog.debug(`[V2CardSystemsManager] Destroying (${this.cardId})`);

        try {
            // Clean up data source subscriptions
            for (const [subscriptionId] of this.dataSourceSubscriptions) {
                await this.unsubscribeFromDataSource(subscriptionId);
            }
            this.dataSourceSubscriptions.clear();

            // Clean up rule callbacks
            this.ruleCallbacks.clear();

            // Destroy local systems
            if (this.templateProcessor) {
                await this.templateProcessor.destroy();
                this.templateProcessor = null;
            }

            if (this.styleResolver) {
                await this.styleResolver.destroy();
                this.styleResolver = null;
            }

            // Clear singleton references
            this.rulesEngine = null;
            this.themeManager = null;
            this.animationManager = null;
            this.dataSourceManager = null;
            this.validationService = null;

            this.initialized = false;

            lcardsLog.debug(`[V2CardSystemsManager] ✅ Destroyed (${this.cardId})`);

        } catch (error) {
            lcardsLog.error(`[V2CardSystemsManager] ❌ Destruction failed (${this.cardId}):`, error);
        }
    }

    // ==========================================
    // UNIFIED API CONVENIENCE METHODS
    // ==========================================

    /**
     * Get MSD Runtime API instance (convenience method)
     * @returns {Object|null} Runtime API or null if not available
     *
     * @example
     * const msd = this.systemsManager.getMsdAPI();
     * if (msd) {
     *   const instance = msd.getInstance();
     * }
     */
    getMsdAPI() {
        return this.getRuntimeAPI();
    }

    /**
     * Get debug information using unified API
     * @returns {Object} Combined debug info from core and debug APIs
     *
     * @example
     * const debug = this.systemsManager.getDebugInfo();
     * console.log('Core:', debug.core);
     * console.log('MSD:', debug.msd);
     */
    getDebugInfo() {
        const debugInfo = {
            card: this.cardId,
            initialized: this.initialized,
            subscriptions: this.dataSourceSubscriptions.size,
            ruleCallbacks: this.ruleCallbacks.size,
            core: null,
            msd: null,
            api: {
                coreAvailable: !!this.getCore(),
                runtimeAvailable: !!this.getRuntimeAPI(),
                debugAvailable: !!this.getDebugAPI()
            }
        };

        // Get core debug info via unified API
        const debugAPI = this.getDebugAPI();
        if (debugAPI && typeof debugAPI.core === 'function') {
            try {
                debugInfo.core = debugAPI.core();
            } catch (error) {
                debugInfo.core = { error: error.message };
            }
        }

        // Get MSD debug info if available
        const runtimeAPI = this.getRuntimeAPI();
        if (runtimeAPI) {
            try {
                const instance = runtimeAPI.getInstance();
                debugInfo.msd = instance ? 'Available' : 'Not available';
            } catch (error) {
                debugInfo.msd = { error: error.message };
            }
        }

        return debugInfo;
    }

    /**
     * Test unified API connectivity
     * @returns {Object} API connectivity test results
     *
     * @example
     * const test = this.systemsManager.testAPIConnectivity();
     * console.log('API Status:', test);
     */
    testAPIConnectivity() {
        return {
            timestamp: new Date().toISOString(),
            cardId: this.cardId,
            apis: {
                core: {
                    available: !!this.getCore(),
                    initialized: this.getCore()?._coreInitialized || false,
                    managers: this.getCore() ? Object.keys(this.getCore()).filter(k => !k.startsWith('_')).length : 0
                },
                runtime: {
                    available: !!this.getRuntimeAPI(),
                    hasInstance: !!this.getRuntimeAPI()?.getInstance?.(),
                    methods: this.getRuntimeAPI() ? Object.keys(this.getRuntimeAPI()).length : 0
                },
                debug: {
                    available: !!this.getDebugAPI(),
                    hasCore: !!this.getDebugAPI()?.core,
                    hasSingletons: !!window.lcards?.debug?.singletons,
                    methods: this.getDebugAPI() ? Object.keys(this.getDebugAPI()).length : 0
                }
            },
            fallbacks: {
                directCore: !!window.lcards?.core,
                debugSingletons: !!window.lcards?.debug?.singletons
            }
        };
    }
}