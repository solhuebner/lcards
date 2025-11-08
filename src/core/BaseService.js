/**
 * @fileoverview BaseService - Base class for all LCARdS singleton services
 *
 * Provides standardized lifecycle methods that all singleton services should implement.
 * Services that don't need HASS data can inherit the no-op implementations.
 * Services that do need HASS data should override these methods.
 *
 * @module core/BaseService
 */

import { lcardsLog } from '../utils/lcards-logging.js';

/**
 * Base class for all LCARdS singleton services
 *
 * Provides standardized lifecycle methods:
 * - updateHass(hass) - Called when HASS instance is updated
 * - ingestHass(hass) - Alternative API for HASS updates
 *
 * Services that need HASS data should override these methods.
 * Services that don't need HASS data inherit safe no-op implementations.
 */
export class BaseService {
    constructor() {
        // Base service initialization
        this._serviceName = this.constructor.name;
    }

    /**
     * Update with new HASS instance
     *
     * Override in services that need HASS data (DataSourceManager, RulesEngine, etc.)
     * Default implementation is a safe no-op for services that don't need HASS.
     *
     * @param {Object} hass - Home Assistant instance
     */
    updateHass(hass) {
        // Default: no-op for services that don't need HASS updates
        // Services like ThemeManager, AnimationManager (if not entity-driven) can use this default
        lcardsLog.debug(`[${this._serviceName}] updateHass() - no-op (service doesn't need HASS data)`);
    }

    /**
     * Ingest HASS data (alternative API)
     *
     * Some services may use this method name instead of updateHass.
     * Override in services that need HASS data and use this API pattern.
     * Default implementation forwards to updateHass for consistency.
     *
     * @param {Object} hass - Home Assistant instance
     */
    ingestHass(hass) {
        // Default: forward to updateHass for API consistency
        this.updateHass(hass);
    }

    /**
     * Get service information for debugging
     *
     * @returns {Object} Service debug info
     */
    getServiceInfo() {
        return {
            serviceName: this._serviceName,
            hasUpdateHass: typeof this.updateHass === 'function',
            hasIngestHass: typeof this.ingestHass === 'function',
            needsHass: this.updateHass !== BaseService.prototype.updateHass ||
                      this.ingestHass !== BaseService.prototype.ingestHass
        };
    }
}

// Make globally accessible for debugging
if (typeof window !== 'undefined') {
    window.BaseService = BaseService;
}