import { initMsdPipeline as initMsdPipelineCore } from './pipeline/PipelineCore.js';
import { processMsdConfig } from './pipeline/ConfigProcessor.js';
import { buildCardModel } from './model/CardModel.js';
import { MsdInstanceManager } from './pipeline/MsdInstanceManager.js';
import { mergePacks } from '../core/packs/mergePacks.js';

import "./hud/MsdHudUtilities.js";

// Main exports
export { initMsdPipelineCore as initMsdPipeline, processMsdConfig };

/**
 * MSD Production Namespace & Debug Interface Setup
 * 
 * ARCHITECTURE CHANGE (v1.17.0+):
 * - Production APIs: window.lcards.cards.msd.*
 * - Debug tools: window.lcards.debug.msd.*
 * 
 * This matches the core architecture pattern where production
 * systems live under window.lcards.core.* and MSD is a card
 * system under window.lcards.cards.*
 */
(function attachMsdNamespaces() {
  if (typeof window === 'undefined') return;

  // ============================================================================
  // PRODUCTION NAMESPACE: window.lcards.cards.msd.*
  // ============================================================================
  
  window.lcards = window.lcards || {};
  window.lcards.cards = window.lcards.cards || {};
  window.lcards.cards.msd = window.lcards.cards.msd || {};

  // Multi-instance registry (Map of card instances by GUID)
  const instanceRegistry = new Map();

  // Production API methods
  Object.assign(window.lcards.cards.msd, {
    /**
     * Register a new MSD card instance
     * @param {string} guid - Card instance GUID
     * @param {Object} cardInstance - Card element reference
     * @param {Object} pipelineInstance - Pipeline API reference
     */
    registerInstance(guid, cardInstance, pipelineInstance) {
      if (!guid) {
        console.warn('[MSD] Cannot register instance without GUID');
        return;
      }

      instanceRegistry.set(guid, {
        guid,
        cardInstance,
        pipelineInstance,
        registeredAt: new Date().toISOString()
      });

      console.log(`[MSD] ✅ Registered instance: ${guid}`);
      console.log(`[MSD] Total instances: ${instanceRegistry.size}`);
    },

    /**
     * Unregister an MSD card instance
     * @param {string} guid - Card instance GUID
     */
    unregisterInstance(guid) {
      const removed = instanceRegistry.delete(guid);
      if (removed) {
        console.log(`[MSD] 🗑️ Unregistered instance: ${guid}`);
        console.log(`[MSD] Remaining instances: ${instanceRegistry.size}`);
      }
    },

    /**
     * Get instance data by GUID
     * @param {string} guid - Card instance GUID
     * @returns {Object|null} Instance data
     */
    getInstance(guid) {
      return instanceRegistry.get(guid) || null;
    },

    /**
     * List all registered instances
     * @returns {Array} Array of instance data
     */
    listInstances() {
      const instances = Array.from(instanceRegistry.values());
      console.group(`📊 MSD Instances (${instances.length})`);
      instances.forEach(inst => {
        console.log(`${inst.guid}:`, {
          hasCard: !!inst.cardInstance,
          hasPipeline: !!inst.pipelineInstance,
          registeredAt: inst.registeredAt
        });
      });
      console.groupEnd();
      return instances;
    },

    /**
     * Get instance registry (read-only access)
     * @returns {Map} Instance registry
     */
    getInstanceRegistry() {
      return instanceRegistry;
    }
  });

  console.log('[MSD index.js] ✅ Production namespace initialized: window.lcards.cards.msd');

  // ============================================================================
  // DEBUG NAMESPACE: window.lcards.debug.msd.*
  // ============================================================================
  
  window.lcards.debug = window.lcards.debug || {};
  window.lcards.debug.msd = window.lcards.debug.msd || {};

  // CRITICAL: Attach MsdInstanceManager FIRST
  window.lcards.debug.msd.MsdInstanceManager = MsdInstanceManager;

  console.log('[MSD index.js] ✅ MsdInstanceManager attached to window.lcards.debug.msd');

  // Debug tools and helpers
  Object.assign(window.lcards.debug.msd, {
    // Core functions (reference imported functions with clear names)
    mergePacks,
    buildCardModel,
    initMsdPipeline: initMsdPipelineCore,  // Reference to core function

    // Legacy single-instance reference (for backward compatibility)
    pipelineInstance: null,

    // Initialize MSD pipeline (wrapper with debug logging)
    async initMsdPipelineWithLogging(mergedConfig, svgContent, mount, hass, cardGuid) {
      try {
        const pipelineApi = await initMsdPipelineCore(mergedConfig, svgContent, mount, hass, cardGuid);

        // Set the authoritative pipelineInstance property (legacy compatibility)
        this.pipelineInstance = pipelineApi;

        return pipelineApi;
      } catch (error) {
        console.error('[MSD Debug] Pipeline initialization failed:', error);
        throw error;
      }
    },

    // ============================================================================
    // PROVENANCE DEBUG HELPERS
    // ============================================================================

    /**
     * Get theme provenance information
     */
    getThemeProvenance() {
      const config = this.pipelineInstance?.config;
      if (!config) {
        console.warn('[MSD Debug] No pipeline instance available');
        return null;
      }

      const provenance = config.__provenance?.theme;
      if (!provenance) {
        console.warn('[MSD Debug] No theme provenance available');
        return null;
      }

      console.group('🎨 Theme Provenance');
      console.log('Active Theme:', provenance.active_theme);
      console.log('Requested Theme:', provenance.requested_theme || '(none - using default)');
      console.log('Default Theme:', provenance.default_theme);
      console.log('Source Pack:', provenance.source_pack);
      console.log('Fallback Used:', provenance.fallback_used);
      console.log('Available Themes:', provenance.themes_available);
      console.log('Theme Pack Loaded:', provenance.theme_pack_loaded);
      console.groupEnd();

      return provenance;
    },

    /**
     * Get pack loading information
     */
    getPackInfo() {
      const config = this.pipelineInstance?.config;
      if (!config) {
        console.warn('[MSD Debug] No pipeline instance available');
        return null;
      }

      const packInfo = config.__provenance?.packs;
      if (!packInfo) {
        console.warn('[MSD Debug] No pack provenance available');
        return null;
      }

      console.group('📦 Pack Information');
      console.log('Builtin Packs:', packInfo.builtin);
      console.log('External Packs:', packInfo.external);
      if (packInfo.failed && packInfo.failed.length > 0) {
        console.warn('Failed Packs:', packInfo.failed);
      }
      console.groupEnd();

      return packInfo;
    },

    /**
     * Get style resolution provenance for an overlay
     */
    getStyleProvenance(overlayId) {
      const config = this.pipelineInstance?.config;
      if (!config) {
        console.warn('[MSD Debug] No pipeline instance available');
        return null;
      }

      const styleRes = config.__provenance?.style_resolution?.[overlayId];
      if (!styleRes) {
        console.warn(`[MSD Debug] No style provenance for overlay: ${overlayId}`);
        console.log('Available overlays:', Object.keys(config.__provenance?.style_resolution || {}));
        return null;
      }

      console.group(`🎨 Style Provenance: ${overlayId}`);
      console.log('Component Type:', styleRes.componentType);
      console.log('Theme Defaults Used:', styleRes.theme_defaults);
      console.log('Preset Applied:', styleRes.preset_applied || '(none)');
      console.log('Preset Properties:', styleRes.preset_properties || []);
      console.log('User Overrides:', styleRes.user_overrides || []);
      console.log('Token Resolutions:', styleRes.token_resolutions || {});
      console.groupEnd();

      return styleRes;
    },

    /**
     * Get renderer information for an overlay
     */
    getRendererInfo(overlayId) {
      const config = this.pipelineInstance?.config;
      if (!config) {
        console.warn('[MSD Debug] No pipeline instance available');
        return null;
      }

      const rendererInfo = config.__provenance?.renderers?.[overlayId];
      if (!rendererInfo) {
        console.warn(`[MSD Debug] No renderer info for overlay: ${overlayId}`);
        console.log('Available overlays:', Object.keys(config.__provenance?.renderers || {}));
        return null;
      }

      console.group(`🔧 Renderer Info: ${overlayId}`);
      console.log('Renderer:', rendererInfo.renderer);
      console.log('Extends BaseRenderer:', rendererInfo.extends_base);
      console.log('ThemeManager Resolved:', rendererInfo.theme_manager_resolved);
      console.log('Defaults Used:', rendererInfo.defaults_used);
      console.groupEnd();

      return rendererInfo;
    },

    /**
     * Get complete provenance for an overlay
     */
    getOverlayProvenance(overlayId) {
      const config = this.pipelineInstance?.config;
      if (!config) {
        console.warn('[MSD Debug] No pipeline instance available');
        return null;
      }

      console.group(`📊 Complete Provenance: ${overlayId}`);

      // Overlay definition provenance
      const overlayProv = config.__provenance?.overlays?.[overlayId];
      if (overlayProv) {
        console.log('Origin Pack:', overlayProv.origin_pack);
        console.log('Overridden:', overlayProv.overridden);
        if (overlayProv.overridden) {
          console.log('Override Layer:', overlayProv.override_layer);
        }
      }

      // Style provenance
      const styleProv = config.__provenance?.style_resolution?.[overlayId];
      if (styleProv) {
        console.log('Style Resolution:', styleProv);
      }

      // Renderer provenance
      const rendererProv = config.__provenance?.renderers?.[overlayId];
      if (rendererProv) {
        console.log('Renderer Info:', rendererProv);
      }

      console.groupEnd();

      return {
        overlay: overlayProv,
        style: styleProv,
        renderer: rendererProv
      };
    },

    /**
     * List all tracked overlays with provenance
     */
    listTrackedOverlays() {
      const config = this.pipelineInstance?.config;
      if (!config) {
        console.warn('[MSD Debug] No pipeline instance available');
        return null;
      }

      const overlayIds = Object.keys(config.__provenance?.overlays || {});

      console.group(`📋 Tracked Overlays (${overlayIds.length})`);
      overlayIds.forEach(id => {
        const prov = config.__provenance.overlays[id];
        console.log(`${id}:`, {
          pack: prov.origin_pack,
          overridden: prov.overridden,
          hasStyle: !!config.__provenance.style_resolution?.[id],
          hasRenderer: !!config.__provenance.renderers?.[id]
        });
      });
      console.groupEnd();

      return overlayIds;
    },

    // ============================================================================
    // MULTI-INSTANCE DEBUG HELPERS (delegate to production namespace)
    // ============================================================================

    registerInstance(...args) {
      return window.lcards.cards.msd.registerInstance(...args);
    },

    unregisterInstance(...args) {
      return window.lcards.cards.msd.unregisterInstance(...args);
    },

    getInstance(...args) {
      return window.lcards.cards.msd.getInstance(...args);
    },

    listInstances(...args) {
      return window.lcards.cards.msd.listInstances(...args);
    },

    // Legacy instance map access (read-only)
    get instances() {
      return window.lcards.cards.msd.getInstanceRegistry();
    }
  });

  // ============================================================================
  // BACKWARD COMPATIBILITY PROPERTIES
  // ============================================================================

  // DataSourceManager property with getter (uses last registered instance)
  Object.defineProperty(window.lcards.debug.msd, 'dataSourceManager', {
    get() {
      // Try to get from pipelineInstance (legacy single-instance reference)
      if (window.lcards.debug.msd.pipelineInstance?.dataSourceManager) {
        return window.lcards.debug.msd.pipelineInstance.dataSourceManager;
      }
      if (window.lcards.debug.msd.pipelineInstance?.systemsManager?.dataSourceManager) {
        return window.lcards.debug.msd.pipelineInstance.systemsManager.dataSourceManager;
      }
      
      // Fallback: Get from any registered instance
      const instances = Array.from(window.lcards.cards.msd.getInstanceRegistry().values());
      if (instances.length > 0) {
        return instances[0].pipelineInstance?.systemsManager?.dataSourceManager;
      }
      
      return null;
    },
    configurable: true
  });

  // cardInstance property (uses last set value or first registered instance)
  Object.defineProperty(window.lcards.debug.msd, 'cardInstance', {
    get() {
      // If explicitly set, use that
      if (window.lcards.debug.msd._explicitCardInstance) {
        return window.lcards.debug.msd._explicitCardInstance;
      }
      
      // Otherwise, return first registered instance
      const instances = Array.from(window.lcards.cards.msd.getInstanceRegistry().values());
      if (instances.length > 0) {
        return instances[0].cardInstance;
      }
      
      return null;
    },
    set(value) {
      window.lcards.debug.msd._explicitCardInstance = value;
    },
    configurable: true
  });

  console.log('[MSD index.js] ✅ Debug namespace initialized with backward compatibility');

  // ============================================================================
  // GLOBAL DEBUG HELPERS
  // ============================================================================

  if (!window.__msdStatus) {
    window.__msdStatus = () => {
      const instances = window.lcards.cards.msd.listInstances();
      const status = {
        'Multi-Instance Mode': 'Enabled',
        'Active Instances': instances.length,
        'Production API': 'window.lcards.cards.msd',
        'Debug API': 'window.lcards.debug.msd',
        'Timestamp': new Date().toISOString()
      };

      console.table(status);
      console.log('💡 Production API: window.lcards.cards.msd.listInstances()');
      console.log('💡 Debug tools: window.lcards.debug.msd.getThemeProvenance()');
      console.log('💡 Inspect cards: Use browser DevTools Elements tab');
      return status;
    };
  }

  console.log('[MSD index.js] ✅ Global debug helpers initialized');
})();
