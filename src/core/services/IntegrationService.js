/**
 * @fileoverview IntegrationService — Backend integration probe
 *
 * Probes the LCARdS HA integration at boot to determine whether the
 * Python backend is installed and active. All other services that want
 * to use backend APIs check `window.lcards.core.integrationService.available`
 * before making WS calls.
 *
 * Degraded mode (integration not installed):
 *   - this.available === false
 *   - Services fall back to localStorage or no-op behaviour
 *
 * @module core/services/IntegrationService
 */

import { lcardsLog } from '../../utils/lcards-logging.js';
import { BaseService } from '../BaseService.js';

export class IntegrationService extends BaseService {

    constructor() {
        super();

        /** @type {boolean} True if the LCARdS HA integration responded to lcards/info */
        this.available = false;

        /** @type {string|null} Version reported by the integration, or null */
        this.version = null;

        /** @private — ensures we only probe once */
        this._probed = false;
    }

    /**
     * Called by _updateHass on every HASS update.
     * Probes lcards/info once — on the first update where hass.connection exists.
     *
     * @param {Object} hass - Home Assistant instance
     */
    updateHass(hass) {
        if (this._probed || !hass?.connection) return;
        this._probed = true;
        // Fire-and-forget — errors are caught inside initialize()
        this.initialize(hass);
    }

    /**
     * Probe the backend integration.
     *
     * Sends lcards/info via the HA WebSocket connection. On success sets
     * this.available = true and this.version. On any error (integration not
     * installed, WS not ready, timeout) sets this.available = false silently.
     *
     * Safe to call multiple times — subsequent calls re-probe and update state.
     *
     * @param {Object} hass - Home Assistant instance
     * @returns {Promise<void>}
     */
    async initialize(hass) {
        if (!hass?.connection) {
            lcardsLog.warn('[IntegrationService] No HASS connection available — skipping probe');
            return;
        }

        try {
            const result = await hass.connection.sendMessagePromise({
                type: 'lcards/info',
            });

            this.available = result?.available === true;
            this.version = result?.version ?? null;

            lcardsLog.info(
                `[IntegrationService] Backend available v${this.version}`
            );
        } catch {
            this.available = false;
            this.version = null;
            lcardsLog.info(
                '[IntegrationService] Backend not found — degraded mode (integration not installed)'
            );
        }
    }

}
