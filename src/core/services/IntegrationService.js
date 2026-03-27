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

        /**
         * Number of keys currently in backend storage, or null if unavailable.
         * Populated after the first successful lcards/info probe.
         * @type {number|null}
         */
        this.storageKeyCount = null;

        /**
         * Snapshot of configured options from the integration's config entry, or null.
         * Keys: show_panel, sidebar_title, sidebar_icon, log_level
         * @type {Object|null}
         */
        this.options = null;

        /** @private — cached HASS reference updated on every updateHass() call */
        this._hass = null;

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
        this._hass = hass;
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
            this.storageKeyCount = result?.storage_key_count ?? null;
            this.options = result?.options ?? null;

            lcardsLog.info(
                `[IntegrationService] Backend available v${this.version} (${this.storageKeyCount ?? '?'} storage keys)`
            );
        } catch {
            this.available = false;
            this.version = null;
            this.storageKeyCount = null;
            this.options = null;
            lcardsLog.info(
                '[IntegrationService] Backend not found — degraded mode (integration not installed)'
            );
        }
    }

    // -----------------------------------------------------------------------
    // Backend Storage Convenience API
    // -----------------------------------------------------------------------

    /**
     * Read a value from the LCARdS backend persistent storage.
     *
     * Returns the stored value (any JSON type), or `undefined` if the key does
     * not exist, the integration is unavailable, or the call fails.
     *
     * @param {string} key - Storage key to read
     * @returns {Promise<any>} Stored value, or undefined on miss / error
     */
    async readStorage(key) {
        if (!this.available || !this._hass?.connection) return undefined;
        try {
            const result = await this._hass.connection.sendMessagePromise({
                type: 'lcards/storage/get',
                key,
            });
            return result?.value;
        } catch (err) {
            lcardsLog.warn(`[IntegrationService] readStorage("${key}") failed:`, err);
            return undefined;
        }
    }

    /**
     * Write one or more key/value pairs to the LCARdS backend persistent storage.
     *
     * Performs a shallow merge — existing keys not present in `updates` are
     * preserved.  Pass `{ myKey: null }` to effectively clear a key (the key
     * will remain in storage with a null value; use deleteStorage() to fully
     * remove it).
     *
     * @param {Object} updates - Plain object of key → value pairs to merge
     * @returns {Promise<boolean>} `true` on success, `false` on error / unavailable
     */
    async writeStorage(updates) {
        if (!this.available || !this._hass?.connection) return false;
        try {
            await this._hass.connection.sendMessagePromise({
                type: 'lcards/storage/set',
                data: updates,
            });
            return true;
        } catch (err) {
            lcardsLog.warn('[IntegrationService] writeStorage() failed:', err);
            return false;
        }
    }

    /**
     * Delete a single key from the LCARdS backend persistent storage.
     *
     * @param {string} key - Storage key to remove
     * @returns {Promise<boolean>} `true` on success, `false` on error / unavailable
     */
    async deleteStorage(key) {
        if (!this.available || !this._hass?.connection) return false;
        try {
            await this._hass.connection.sendMessagePromise({
                type: 'lcards/storage/delete',
                key,
            });
            return true;
        } catch (err) {
            lcardsLog.warn(`[IntegrationService] deleteStorage("${key}") failed:`, err);
            return false;
        }
    }

    /**
     * Wipe the entire LCARdS backend persistent storage.
     *
     * This is irreversible. All stored keys are removed and the store is saved
     * to disk in the empty state. Services should invalidate their in-memory
     * caches after calling this.
     *
     * @returns {Promise<boolean>} `true` on success, `false` on error / unavailable
     */
    async resetStorage() {
        if (!this.available || !this._hass?.connection) return false;
        try {
            await this._hass.connection.sendMessagePromise({
                type: 'lcards/storage/reset',
            });
            return true;
        } catch (err) {
            lcardsLog.warn('[IntegrationService] resetStorage() failed:', err);
            return false;
        }
    }

}
