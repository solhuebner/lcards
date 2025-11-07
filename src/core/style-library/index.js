/**
 * @fileoverview CoreStyleLibrary - Shared style system for LCARdS core infrastructure
 *
 * Simplified version of MSD StyleResolverService focused on:
 * - Basic style presets for common UI patterns
 * - Token resolution and CSS variable integration
 * - Style utility functions for shared patterns
 * - Lightweight style caching
 * - CSS class generation and management
 *
 * Note: This is a streamlined version. For full MSD style capabilities
 * including advanced preset inheritance and provenance tracking,
 * the MSD StyleResolverService continues to provide comprehensive features.
 *
 * @module core/style-library
 */

import { lcardsLog } from '../../utils/lcards-logging.js';

/**
 * Simple preset manager for core style patterns
 */
class CorePresetManager {
  constructor() {
    this.presets = new Map();
    this._initializeDefaultPresets();
  }

  /**
   * Initialize default style presets
   * @private
   */
  _initializeDefaultPresets() {
    // Button presets
    this.presets.set('button-primary', {
      background: 'var(--primary-color, #ff6600)',
      color: 'var(--primary-text-color, #000)',
      border: '1px solid var(--primary-color, #ff6600)',
      borderRadius: '4px',
      padding: '8px 16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    });

    this.presets.set('button-secondary', {
      background: 'transparent',
      color: 'var(--primary-color, #ff6600)',
      border: '1px solid var(--primary-color, #ff6600)',
      borderRadius: '4px',
      padding: '8px 16px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    });

    // Text presets
    this.presets.set('text-title', {
      fontSize: '1.2em',
      fontWeight: 'bold',
      color: 'var(--primary-text-color, #ff6600)',
      marginBottom: '8px'
    });

    this.presets.set('text-body', {
      fontSize: '1em',
      color: 'var(--primary-text-color, #ff6600)',
      lineHeight: '1.4'
    });

    this.presets.set('text-caption', {
      fontSize: '0.8em',
      color: 'var(--secondary-text-color, #999)',
      fontStyle: 'italic'
    });

    // Card presets
    this.presets.set('card-default', {
      background: 'var(--card-background-color, #1e1e1e)',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      border: '1px solid var(--divider-color, #333)'
    });

    this.presets.set('card-elevated', {
      background: 'var(--card-background-color, #1e1e1e)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      border: '1px solid var(--divider-color, #333)',
      transform: 'translateY(-2px)'
    });

    // Input presets
    this.presets.set('input-default', {
      background: 'var(--input-background-color, #2a2a2a)',
      color: 'var(--primary-text-color, #ff6600)',
      border: '1px solid var(--divider-color, #333)',
      borderRadius: '4px',
      padding: '8px 12px',
      fontSize: '1em',
      outline: 'none'
    });

    // Status presets
    this.presets.set('status-success', {
      color: 'var(--success-color, #4caf50)',
      background: 'rgba(76, 175, 80, 0.1)',
      border: '1px solid var(--success-color, #4caf50)',
      borderRadius: '4px',
      padding: '4px 8px'
    });

    this.presets.set('status-warning', {
      color: 'var(--warning-color, #ff9800)',
      background: 'rgba(255, 152, 0, 0.1)',
      border: '1px solid var(--warning-color, #ff9800)',
      borderRadius: '4px',
      padding: '4px 8px'
    });

    this.presets.set('status-error', {
      color: 'var(--error-color, #f44336)',
      background: 'rgba(244, 67, 54, 0.1)',
      border: '1px solid var(--error-color, #f44336)',
      borderRadius: '4px',
      padding: '4px 8px'
    });

    lcardsLog.debug(`[CorePresetManager] Loaded ${this.presets.size} default presets`);
  }

  /**
   * Get a preset by name
   * @param {string} presetName - Preset identifier
   * @returns {Object|null} Preset styles or null if not found
   */
  getPreset(presetName) {
    return this.presets.get(presetName) || null;
  }

  /**
   * Add a custom preset
   * @param {string} name - Preset name
   * @param {Object} styles - Style object
   */
  addPreset(name, styles) {
    this.presets.set(name, styles);
    lcardsLog.debug(`[CorePresetManager] Added custom preset: ${name}`);
  }

  /**
   * List available presets
   * @returns {Array<string>} Array of preset names
   */
  listPresets() {
    return Array.from(this.presets.keys());
  }

  /**
   * Remove a preset
   * @param {string} name - Preset name
   */
  removePreset(name) {
    return this.presets.delete(name);
  }
}

/**
 * Simple token resolver for CSS variables and theme tokens
 */
class CoreTokenResolver {
  constructor(themeManager = null) {
    this.themeManager = themeManager;
    this.cache = new Map();

    // Common CSS variable mappings
    this.cssVariables = {
      // Colors
      'primary': '--primary-color',
      'primary-text': '--primary-text-color',
      'secondary-text': '--secondary-text-color',
      'background': '--primary-background-color',
      'card-background': '--card-background-color',
      'divider': '--divider-color',
      'success': '--success-color',
      'warning': '--warning-color',
      'error': '--error-color',
      'info': '--info-color',

      // Sizing
      'border-radius': '--ha-card-border-radius',
      'spacing': '--mdc-layout-grid-margin-desktop',

      // Shadows
      'elevation-01': '--ha-card-box-shadow',
      'elevation-02': '0 4px 8px rgba(0,0,0,0.3)',
      'elevation-03': '0 8px 16px rgba(0,0,0,0.4)'
    };
  }

  /**
   * Resolve a token to its CSS value
   * @param {string} token - Token name or CSS variable name
   * @param {*} fallback - Fallback value
   * @returns {string} Resolved CSS value
   */
  resolveToken(token, fallback = null) {
    // Check cache first
    if (this.cache.has(token)) {
      return this.cache.get(token);
    }

    let resolved = null;

    // Try CSS variable mapping first
    if (this.cssVariables[token]) {
      resolved = `var(${this.cssVariables[token]}`;
      if (fallback) {
        resolved += `, ${fallback})`;
      } else {
        resolved += ')';
      }
    }
    // If it's already a CSS variable, use as-is
    else if (token.startsWith('--')) {
      resolved = `var(${token}`;
      if (fallback) {
        resolved += `, ${fallback})`;
      } else {
        resolved += ')';
      }
    }
    // Try theme manager if available
    else if (this.themeManager && typeof this.themeManager.getToken === 'function') {
      try {
        resolved = this.themeManager.getToken(token, fallback);
      } catch (error) {
        lcardsLog.debug(`[CoreTokenResolver] Theme manager resolution failed: ${error.message}`);
        resolved = fallback;
      }
    }
    // Use as literal value or fallback
    else {
      resolved = token || fallback;
    }

    // Cache and return
    this.cache.set(token, resolved);
    return resolved;
  }

  /**
   * Clear token resolution cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Add custom CSS variable mapping
   * @param {string} token - Token name
   * @param {string} cssVar - CSS variable name (with or without --)
   */
  addCSSVariable(token, cssVar) {
    if (!cssVar.startsWith('--')) {
      cssVar = '--' + cssVar;
    }
    this.cssVariables[token] = cssVar;
  }
}

/**
 * Style utility functions for common patterns
 */
class CoreStyleUtils {
  /**
   * Generate CSS string from style object
   * @param {Object} styles - Style object
   * @returns {string} CSS string
   */
  static objectToCSS(styles) {
    if (!styles || typeof styles !== 'object') {
      return '';
    }

    return Object.entries(styles)
      .map(([prop, value]) => {
        // Convert camelCase to kebab-case
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssProp}: ${value};`;
      })
      .join(' ');
  }

  /**
   * Create CSS class from style object
   * @param {string} className - Class name
   * @param {Object} styles - Style object
   * @returns {string} CSS rule string
   */
  static createCSSClass(className, styles) {
    const cssString = this.objectToCSS(styles);
    return `.${className} { ${cssString} }`;
  }

  /**
   * Merge multiple style objects with priority
   * @param {...Object} styleObjects - Style objects to merge
   * @returns {Object} Merged style object
   */
  static mergeStyles(...styleObjects) {
    return Object.assign({}, ...styleObjects);
  }

  /**
   * Apply responsive styles based on container size
   * @param {Object} styles - Base styles
   * @param {Object} breakpoints - Responsive breakpoints
   * @param {number} containerWidth - Container width in pixels
   * @returns {Object} Responsive styles
   */
  static applyResponsive(styles, breakpoints = {}, containerWidth = 0) {
    const responsive = { ...styles };

    // Default breakpoints
    const defaultBreakpoints = {
      small: 480,
      medium: 768,
      large: 1024,
      ...breakpoints
    };

    // Apply responsive styles based on container width
    Object.entries(defaultBreakpoints).forEach(([size, minWidth]) => {
      if (containerWidth >= minWidth && styles[`@${size}`]) {
        Object.assign(responsive, styles[`@${size}`]);
      }
    });

    // Remove responsive keys from final styles
    Object.keys(responsive).forEach(key => {
      if (key.startsWith('@')) {
        delete responsive[key];
      }
    });

    return responsive;
  }

  /**
   * Generate animation styles
   * @param {string} animationType - Type of animation
   * @param {Object} options - Animation options
   * @returns {Object} Animation styles
   */
  static generateAnimation(animationType, options = {}) {
    const defaults = {
      duration: '0.3s',
      easing: 'ease',
      delay: '0s',
      fillMode: 'both'
    };

    const config = { ...defaults, ...options };

    const animations = {
      'fade-in': {
        animation: `fadeIn ${config.duration} ${config.easing} ${config.delay} ${config.fillMode}`
      },
      'slide-in': {
        animation: `slideIn ${config.duration} ${config.easing} ${config.delay} ${config.fillMode}`
      },
      'scale-in': {
        animation: `scaleIn ${config.duration} ${config.easing} ${config.delay} ${config.fillMode}`
      },
      'bounce': {
        animation: `bounce ${config.duration} ${config.easing} ${config.delay} ${config.fillMode}`
      }
    };

    return animations[animationType] || {};
  }
}

/**
 * CoreStyleLibrary - Central style coordination for shared core infrastructure
 *
 * Provides essential style management for all LCARdS card types including
 * preset management, token resolution, and style utilities.
 */
export class CoreStyleLibrary {
  constructor(config = {}) {
    // Configuration
    this.config = {
      enablePresets: true,
      enableTokens: true,
      cacheEnabled: true,
      debug: false,
      ...config
    };

    // Components
    this.presetManager = null;
    this.tokenResolver = null;

    // State
    this.initialized = false;
    this.themeManager = null;

    // Generated CSS tracking
    this.generatedClasses = new Set();
    this.styleElement = null;

    // Statistics
    this.stats = {
      presetsUsed: 0,
      tokensResolved: 0,
      classesGenerated: 0,
      cacheHits: 0
    };

    lcardsLog.debug('[CoreStyleLibrary] 📚 Core style library created');
  }

  /**
   * Initialize style library
   * @param {Object} themeManager - Theme manager instance (optional)
   * @returns {Promise<void>}
   */
  async initialize(themeManager = null) {
    lcardsLog.debug('[CoreStyleLibrary] 🚀 Initializing core style system');

    try {
      this.themeManager = themeManager;

      // Initialize components
      if (this.config.enablePresets) {
        this.presetManager = new CorePresetManager();
      }

      if (this.config.enableTokens) {
        this.tokenResolver = new CoreTokenResolver(themeManager);
      }

      // Create style element for dynamic CSS
      this._createStyleElement();

      // Generate default CSS classes
      this._generateDefaultClasses();

      this.initialized = true;

      lcardsLog.info('[CoreStyleLibrary] ✅ Core style system initialized:', {
        hasThemeManager: !!this.themeManager,
        presetsEnabled: this.config.enablePresets,
        tokensEnabled: this.config.enableTokens,
        defaultPresets: this.presetManager ? this.presetManager.listPresets().length : 0
      });

    } catch (error) {
      lcardsLog.error('[CoreStyleLibrary] ❌ Style system initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create style element for dynamic CSS injection
   * @private
   */
  _createStyleElement() {
    if (typeof document === 'undefined') return;

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'lcards-core-styles';
    this.styleElement.textContent = '/* LCARdS Core Styles */\n';
    document.head.appendChild(this.styleElement);
  }

  /**
   * Generate default CSS classes from presets
   * @private
   */
  _generateDefaultClasses() {
    if (!this.presetManager || !this.styleElement) return;

    const presets = this.presetManager.listPresets();
    let css = '';

    presets.forEach(presetName => {
      const styles = this.presetManager.getPreset(presetName);
      if (styles) {
        const className = `lcards-${presetName}`;
        css += CoreStyleUtils.createCSSClass(className, styles) + '\n';
        this.generatedClasses.add(className);
        this.stats.classesGenerated++;
      }
    });

    // Add animation keyframes
    css += this._generateAnimationKeyframes();

    if (this.styleElement) {
      this.styleElement.textContent += css;
    }
  }

  /**
   * Generate CSS animation keyframes
   * @private
   */
  _generateAnimationKeyframes() {
    return `
/* LCARdS Core Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes scaleIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}
`;
  }

  /**
   * Get a style preset
   * @param {string} presetName - Preset name
   * @returns {Object|null} Preset styles
   */
  getPreset(presetName) {
    if (!this.presetManager) return null;

    this.stats.presetsUsed++;
    return this.presetManager.getPreset(presetName);
  }

  /**
   * Apply preset to an element
   * @param {Element} element - DOM element
   * @param {string} presetName - Preset name
   */
  applyPreset(element, presetName) {
    if (!element) return;

    const className = `lcards-${presetName}`;
    if (this.generatedClasses.has(className)) {
      element.classList.add(className);
    } else {
      // Apply styles directly if no CSS class available
      const styles = this.getPreset(presetName);
      if (styles) {
        Object.assign(element.style, styles);
      }
    }
  }

  /**
   * Resolve a token to its value
   * @param {string} token - Token name
   * @param {*} fallback - Fallback value
   * @returns {string} Resolved value
   */
  resolveToken(token, fallback = null) {
    if (!this.tokenResolver) return fallback;

    this.stats.tokensResolved++;
    return this.tokenResolver.resolveToken(token, fallback);
  }

  /**
   * Create custom CSS class from styles
   * @param {string} className - Class name
   * @param {Object} styles - Style object
   * @param {boolean} addToDOM - Add to DOM style element
   */
  createClass(className, styles, addToDOM = true) {
    if (!className || !styles) return;

    // Resolve tokens in styles
    const resolvedStyles = this._resolveTokensInStyles(styles);

    if (addToDOM && this.styleElement) {
      const css = CoreStyleUtils.createCSSClass(className, resolvedStyles);
      this.styleElement.textContent += css + '\n';
    }

    this.generatedClasses.add(className);
    this.stats.classesGenerated++;

    return resolvedStyles;
  }

  /**
   * Resolve tokens in a style object
   * @private
   */
  _resolveTokensInStyles(styles) {
    if (!this.tokenResolver || !styles) return styles;

    const resolved = {};

    for (const [prop, value] of Object.entries(styles)) {
      if (typeof value === 'string' && value.startsWith('token:')) {
        // Token reference format: "token:primary-color"
        const tokenName = value.substring(6);
        resolved[prop] = this.resolveToken(tokenName, value);
      } else {
        resolved[prop] = value;
      }
    }

    return resolved;
  }

  /**
   * Add custom preset
   * @param {string} name - Preset name
   * @param {Object} styles - Style object
   */
  addPreset(name, styles) {
    if (this.presetManager) {
      this.presetManager.addPreset(name, styles);

      // Generate CSS class for new preset
      if (this.styleElement) {
        const className = `lcards-${name}`;
        const resolvedStyles = this._resolveTokensInStyles(styles);
        const css = CoreStyleUtils.createCSSClass(className, resolvedStyles);
        this.styleElement.textContent += css + '\n';
        this.generatedClasses.add(className);
      }
    }
  }

  /**
   * Get available presets
   * @returns {Array<string>} Array of preset names
   */
  listPresets() {
    return this.presetManager ? this.presetManager.listPresets() : [];
  }

  /**
   * Get style utilities
   * @returns {Object} Style utility functions
   */
  getUtils() {
    return CoreStyleUtils;
  }

  /**
   * Get style statistics
   * @returns {Object} Style statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Get debug information
   * @returns {Object} Debug info
   */
  getDebugInfo() {
    return {
      initialized: this.initialized,
      hasThemeManager: !!this.themeManager,
      config: { ...this.config },
      stats: this.getStats(),
      presetsAvailable: this.listPresets().length,
      generatedClasses: Array.from(this.generatedClasses),
      hasStyleElement: !!this.styleElement
    };
  }

  /**
   * Update theme manager (for consistency with other core managers)
   * @param {Object} themeManager - Theme manager instance
   */
  updateThemeManager(themeManager) {
    this.themeManager = themeManager;

    if (this.tokenResolver) {
      this.tokenResolver.themeManager = themeManager;
      this.tokenResolver.clearCache();
    }

    lcardsLog.debug('[CoreStyleLibrary] 🔄 Theme manager updated');
  }

  /**
   * Update HASS instance (for consistency with other core managers)
   * @param {Object} hass - Home Assistant instance
   */
  updateHass(hass) {
    // Style library doesn't need HASS directly, but keep for API consistency
    lcardsLog.debug('[CoreStyleLibrary] 🔄 HASS updated (no-op for styles)');
  }

  /**
   * Destroy style library and clean up resources
   */
  destroy() {
    // Remove style element
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
    }

    // Clear caches
    if (this.tokenResolver) {
      this.tokenResolver.clearCache();
    }

    // Reset state
    this.generatedClasses.clear();
    this.presetManager = null;
    this.tokenResolver = null;
    this.styleElement = null;
    this.themeManager = null;
    this.initialized = false;

    lcardsLog.debug('[CoreStyleLibrary] Destroyed');
  }
}