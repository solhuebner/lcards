import { lcarsClassicTokens } from '../themes/tokens/lcarsClassicTokens.js';
import { lcarsDs9Tokens } from '../themes/tokens/lcarsDs9Tokens.js';
import { lcarsVoyagerTokens } from '../themes/tokens/lcarsVoyagerTokens.js';
import { lcarsHighContrastTokens } from '../themes/tokens/lcarsHighContrastTokens.js';
import * as componentsRegistry from './components/index.js';
import { BUTTON_PRESETS } from './style-presets/buttons/index.js';
import { SLIDER_PRESETS } from './style-presets/sliders/index.js';

/**
 * Core Builtin Pack
 *
 * Contains system defaults and foundational definitions.
 * Loaded first, available to all cards and components.
 */
// Core builtin pack - Contains all system defaults
const CORE_PACK = {
  id: 'core',
  version: '1.14.18',
  animations: [],
  timelines: [],
  rules: []
};

/**
 * LCARS FX Pack
 *
 * Sample builtin animations and effects pack.
 * Provides common animation presets like pulse_soft.
 */
// New sample builtin pack (Phase A) – expand later with real defaults.
const LCARS_FX_PACK = {
  id: 'lcars_fx',
  version: '1.14.18',
  animations: [
    {
      id: 'pulse_soft',
      preset: 'pulse',
      params: { duration: 1800, loop: true, alternate: true, max_scale: 1.07 }
    }
  ],
  timelines: [],
  rules: []
};

// LCARdS Button Styles Pack (Phase 2) - Complete button presets for status grids
/**
 * LCARdS Button Styles Pack (v1.14.18+)
 *
 * Complete button presets for LCARdS cards and status grids.
 * All presets use nested CB-LCARS schema structure.
 *
 * Schema: doc/architecture/button-schema-definition.md
 * Theme Tokens: src/core/themes/tokens/lcarsClassicTokens.js
 */
const LCARDS_BUTTONS_PACK = {
  id: 'lcards_buttons',
  version: '1.14.18',
  description: 'LCARdS button styles - v1.14.18 nested schema',
  animations: [],
  timelines: [],
  rules: [],
  // STYLE PRESETS: Named style bundles that can be applied to any overlay type
  style_presets: {
    // Button presets imported from style-presets/buttons
    button: BUTTON_PRESETS
  },

  // COMPONENT PRESETS: Removed - components are now registered via unified components registry
  component_presets: {
    // Legacy component_presets structure removed - all components now use unified format
  }
};

/**
 * LCARdS Slider Styles Pack (v1.22.0+)
 *
 * Complete slider presets for LCARdS cards.
 * Provides pills (segmented) and gauge (ruler) visual styles.
 *
 * Architecture:
 * - Separate visual style (pills/gauge) from interactivity (control.locked)
 * - Pills: Segmented bar style for interactive sliders
 * - Gauge: Ruler with tick marks for displays and controls
 */
const LCARDS_SLIDERS_PACK = {
  id: 'lcards_sliders',
  version: '1.22.0',
  description: 'LCARdS slider presets - pills and gauge styles',
  animations: [],
  timelines: [],
  rules: [],

  style_presets: {
    // Slider presets imported from style-presets/sliders
    slider: SLIDER_PRESETS
  }
};

// ✅ ADD: Builtin pack with themes (this is what was missing!)
const BUILTIN_THEMES_PACK = {
  id: 'builtin_themes',
  version: '1.0.0',

  // Token-based themes
  themes: {
    'lcars-classic': {
      id: 'lcars-classic',
      name: 'LCARS Classic',
      description: 'Classic TNG-era LCARS styling',
      tokens: lcarsClassicTokens
      // cssFile: 'apexcharts-lcars-classic.css' // TODO: Create ApexCharts CSS overrides
    },

    'lcars-ds9': {
      id: 'lcars-ds9',
      name: 'LCARS DS9',
      description: 'Deep Space Nine LCARS variant',
      tokens: lcarsDs9Tokens
      // cssFile: 'apexcharts-lcars-ds9.css' // TODO: Create ApexCharts CSS overrides
    },

    'lcars-voyager': {
      id: 'lcars-voyager',
      name: 'LCARS Voyager',
      description: 'Voyager LCARS styling',
      tokens: lcarsVoyagerTokens
      // cssFile: 'apexcharts-lcars-voyager.css' // TODO: Create ApexCharts CSS overrides
    },

    'lcars-high-contrast': {
      id: 'lcars-high-contrast',
      name: 'LCARS High Contrast',
      description: 'Accessibility-focused high contrast theme',
      tokens: lcarsHighContrastTokens
      // cssFile: 'apexcharts-lcars-high-contrast.css' // TODO: Create ApexCharts CSS overrides
    }
  },

  // Default theme
  defaultTheme: 'lcars-classic',

  /**
   * Chart Animation Presets
   *
   * Pre-configured animation profiles for ApexCharts.
   * Uses native ApexCharts animation system (no Anime.js integration yet).
   */
  chartAnimationPresets: {
    /**
     * LCARS Standard - Smooth and professional
     * Use: Default for most charts
     */
    lcars_standard: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350
      }
    },

    /**
     * LCARS Dramatic - Cinematic entrance
     * Use: Important reveals, status changes, alerts
     */
    lcars_dramatic: {
      enabled: true,
      easing: 'easeout',
      speed: 1200,
      animateGradually: {
        enabled: true,
        delay: 200
      },
      dynamicAnimation: {
        enabled: true,
        speed: 500
      }
    },

    /**
     * LCARS Minimal - Quick and responsive
     * Use: Secondary displays, less critical data
     */
    lcars_minimal: {
      enabled: true,
      easing: 'easein',
      speed: 400,
      animateGradually: {
        enabled: false
      },
      dynamicAnimation: {
        enabled: true,
        speed: 200
      }
    },

    /**
     * LCARS Realtime - Optimized for high-frequency updates
     * Use: Live sensor feeds, network traffic, system monitors
     */
    lcars_realtime: {
      enabled: false,  // No entrance animation
      easing: 'linear',
      speed: 0,
      animateGradually: {
        enabled: false
      },
      dynamicAnimation: {
        enabled: true,
        speed: 100  // Very fast data updates
      }
    },

    /**
     * LCARS Alert - Attention-grabbing
     * Use: Critical alerts, warnings, emergency displays
     */
    lcars_alert: {
      enabled: true,
      easing: 'easeout',
      speed: 600,
      animateGradually: {
        enabled: true,
        delay: 100
      },
      dynamicAnimation: {
        enabled: true,
        speed: 250
      }
    },

    /**
     * None - Disable all animations
     * Use: Performance-critical situations, accessibility needs
     */
    none: {
      enabled: false,
      easing: 'linear',
      speed: 0,
      animateGradually: {
        enabled: false
      },
      dynamicAnimation: {
        enabled: false
      }
    }
  },
};

const BUILTIN_REGISTRY = {
  core: CORE_PACK,
  lcars_fx: LCARS_FX_PACK,
  lcards_buttons: LCARDS_BUTTONS_PACK,
  lcards_sliders: LCARDS_SLIDERS_PACK,  // ✅ ADD: Register sliders pack
  builtin_themes: BUILTIN_THEMES_PACK  // ✅ ADD: Register the themes pack
};

// Remove getBuiltinPack() function entirely - it's not needed anymore
// All packs are now in BUILTIN_REGISTRY

export function loadBuiltinPacks(requested = ['core', 'lcards_buttons', 'lcards_sliders']) {
  // ✅ CRITICAL FIX: Always load builtin_themes pack for theme system
  const packsToLoad = [...new Set([...requested, 'builtin_themes'])];

  return packsToLoad.map(id => BUILTIN_REGISTRY[id]).filter(Boolean);
}

// Make loadBuiltinPacks globally accessible for preset loading
if (typeof window !== 'undefined') {
  window.loadBuiltinPacksModule = { loadBuiltinPacks };
}

/**
 * Shape and Component Registries
 *
 * Shapes and components are imported above and made available
 * through their respective index.js files:
 *
 * - shapesRegistry: Static SVG shapes with labeled segments
 * - componentsRegistry: Component presets with theme token integration
 *
 * Access via:
 * - import { getShape } from './shapes/index.js'
 * - import { getComponent } from './components/index.js'
 */
