/**
 * PackManager - Central Pack Registration System
 *
 * Manages loading and registration of builtin and external packs.
 * Packs contain only: style_presets, animations, rules, and themes.
 *
 * Obsolete fields (overlays, anchors, routing, palettes, profiles) are
 * deprecated and will be ignored with a warning.
 *
 * @module core/PackManager
 */

import { loadBuiltinPacks } from './packs/loadBuiltinPacks.js';
import { lcardsLog } from '../utils/lcards-logging.js';

/**
 * PackManager - Centralized pack loading and registration
 *
 * Coordinates pack loading and registers pack contents to appropriate
 * core singleton managers (StylePresetManager, AnimationRegistry, etc.)
 */
export class PackManager {
  constructor(core) {
    this.core = core;
    this.loadedPacks = new Map();
  }

  /**
   * Load and register builtin packs
   * @param {Array<string>} packIds - Pack IDs to load (default: all core packs)
   */
  async loadBuiltinPacks(packIds = ['core', 'lcards_buttons', 'lcards_sliders', 'lcars_fx', 'builtin_themes']) {
    lcardsLog.debug('[PackManager] Loading builtin packs:', packIds);

    const packs = loadBuiltinPacks(packIds);

    for (const pack of packs) {
      if (!pack) continue;
      this.registerPack(pack);
    }

    lcardsLog.info('[PackManager] Loaded builtin packs:', packIds);
  }

  /**
   * Register pack contents to core managers
   * @param {Object} pack - Pack object with style_presets, animations, rules, themes
   */
  registerPack(pack) {
    if (!pack || !pack.id) {
      lcardsLog.warn('[PackManager] Invalid pack object - missing id');
      return;
    }

    lcardsLog.debug(`[PackManager] Registering pack: ${pack.id}`);

    // Check for deprecated fields and warn
    const deprecatedFields = ['overlays', 'anchors', 'routing', 'palettes', 'profiles'];
    const foundDeprecated = deprecatedFields.filter(field => pack[field]);

    if (foundDeprecated.length > 0) {
      lcardsLog.warn(
        `[PackManager] Pack '${pack.id}' contains deprecated fields: ${foundDeprecated.join(', ')}. ` +
        `These fields are ignored and unsupported. ` +
        `Move custom styles to 'style_presets' and colors to 'themes'.`
      );
    }

    // Register style presets to StylePresetManager
    if (pack.style_presets) {
      this._registerStylePresets(pack);
    }

    // Note: Themes and animations are handled during manager initialization,
    // not via PackManager. Rules are added directly to RulesEngine.
    // This is intentional to avoid duplication with existing initialization.

    // Register rules to RulesEngine (if any)
    if (pack.rules && Array.isArray(pack.rules)) {
      this._registerRules(pack);
    }

    // Store pack reference
    this.loadedPacks.set(pack.id, {
      id: pack.id,
      version: pack.version,
      description: pack.description,
      registeredAt: Date.now()
    });

    lcardsLog.debug(`[PackManager] ✅ Pack registered: ${pack.id}`);
  }

  /**
   * Register style presets from pack
   * @private
   */
  _registerStylePresets(pack) {
    if (!this.core.stylePresetManager) {
      lcardsLog.warn(`[PackManager] StylePresetManager not available for pack: ${pack.id}`);
      return;
    }

    let presetCount = 0;
    Object.entries(pack.style_presets).forEach(([type, presets]) => {
      Object.entries(presets).forEach(([name, preset]) => {
        this.core.stylePresetManager.registerPreset(type, name, preset);
        presetCount++;
      });
    });

    lcardsLog.debug(`[PackManager] Registered ${presetCount} style presets from pack: ${pack.id}`);
  }



  /**
   * Register rules from pack
   * Add rules directly to RulesEngine.rules array
   * @private
   */
  _registerRules(pack) {
    if (!this.core.rulesManager) {
      lcardsLog.warn(`[PackManager] RulesManager not available for pack: ${pack.id}`);
      return;
    }

    let ruleCount = 0;
    pack.rules.forEach(rule => {
      if (rule.id) {
        // Add rule directly to the rules array
        this.core.rulesManager.rules.push(rule);
        // Update the index
        this.core.rulesManager.rulesById.set(rule.id, rule);
        ruleCount++;
      }
    });

    if (ruleCount > 0) {
      // Rebuild dependency index and mark rules dirty
      this.core.rulesManager.buildDependencyIndex();
      this.core.rulesManager.markAllDirty();
      lcardsLog.debug(`[PackManager] Registered ${ruleCount} rules from pack: ${pack.id}`);
    }
  }



  /**
   * Get loaded pack by ID
   * @param {string} packId - Pack ID
   * @returns {Object|undefined} Pack metadata
   */
  getPack(packId) {
    return this.loadedPacks.get(packId);
  }

  /**
   * Get all loaded pack IDs
   * @returns {Array<string>} Array of pack IDs
   */
  getLoadedPackIds() {
    return Array.from(this.loadedPacks.keys());
  }

  /**
   * Get debug information
   * @returns {Object} Debug info
   */
  getDebugInfo() {
    return {
      loadedPacks: Array.from(this.loadedPacks.values()),
      packCount: this.loadedPacks.size
    };
  }
}
