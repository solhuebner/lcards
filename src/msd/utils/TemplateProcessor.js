import { lcardsLog } from '../../utils/lcards-logging.js';
import { TemplateDetector } from '../../core/templates/TemplateDetector.js';
import { TemplateParser } from '../../core/templates/TemplateParser.js';

/**
 * [TemplateProcessor] Unified template processing system
 *
 * PHASE 6: Now delegates to core template infrastructure
 * - Detection delegated to TemplateDetector
 * - Parsing delegated to TemplateParser
 * - Maintains backward compatibility with existing code
 *
 * Consolidates all template processing logic from:
 * - MSDContentResolver (MSD templates: {data_source.key:format})
 * - OverlayUtils (legacy simple templates)
 * - Scattered inline template detection
 *
 * Provides:
 * - Template detection and validation
 * - Reference extraction (for subscriptions)
 * - Entity dependency tracking
 * - Format specification parsing
 * - Template caching
 *
 * Does NOT handle:
 * - HA template evaluation ({{...}}) - delegated to MsdTemplateEngine
 * - Action context templates - handled by ActionHelpers
 *
 * @module TemplateProcessor
 */
export class TemplateProcessor {
  /**
   * Template syntax constants
   */
  static TEMPLATE_PATTERNS = {
    // MSD DataSource templates: {data_source}, {data_source.key}, {data_source:format}
    MSD: /\{([^}]+)\}/g,

    // Home Assistant templates: {{states('entity.id')}}
    HA: /\{\{([^}]+)\}\}/g,

    // Format specification: {data_source:.2f} or {data_source:int}
    FORMAT_SPEC: /^(.+?):(.+)$/
  };

  /**
   * Template detection markers
   */
  static MARKERS = {
    MSD_START: '{',
    MSD_END: '}',
    HA_START: '{{',
    HA_END: '}}'
  };

  /**
   * Template cache for performance
   * @private
   */
  static _cache = new Map();

  /**
   * Cache statistics
   * @private
   */
  static _stats = {
    cacheHits: 0,
    cacheMisses: 0,
    templatesProcessed: 0,
    lastReset: Date.now()
  };

  /**
   * Check if content contains any template markers
   * PHASE 6: Delegates to TemplateDetector
   *
   * @param {string} content - Content to check
   * @returns {boolean} True if content has templates
   *
   * @example
   * TemplateProcessor.hasTemplates('{sensor.temp}')  // true
   * TemplateProcessor.hasTemplates('{{states("sensor.temp")}}')  // true
   * TemplateProcessor.hasTemplates('Plain text')  // false
   */
  static hasTemplates(content) {
    return TemplateDetector.hasTemplates(content);
  }

  /**
   * Check if content has MSD templates specifically
   * PHASE 6: Delegates to TemplateDetector
   *
   * @param {string} content - Content to check
   * @returns {boolean} True if has MSD templates ({...})
   */
  static hasMSDTemplates(content) {
    return TemplateDetector.hasMSDTemplates(content);
  }

  /**
   * Check if content has HA templates specifically
   * PHASE 6: Delegates to TemplateDetector
   *
   * @param {string} content - Content to check
   * @returns {boolean} True if has HA templates ({{...}})
   */
  static hasHATemplates(content) {
    return TemplateDetector.hasHATemplates(content);
  }

  /**
   * Extract all template references from content
   * PHASE 6: Delegates to TemplateParser
   *
   * Returns array of reference objects with:
   * - type: 'msd' | 'ha'
   * - reference: full reference string
   * - dataSource: DataSource name (for MSD)
   * - path: dot-notation path (for MSD)
   * - format: format specification (for MSD)
   *
   * @param {string} content - Content to parse
   * @returns {Array<Object>} Array of reference objects
   *
   * @example
   * TemplateProcessor.extractReferences('{cpu_temp.v:.1f}')
   * // Returns: [{
   * //   type: 'msd',
   * //   reference: 'cpu_temp.v:.1f',
   * //   dataSource: 'cpu_temp',
   * //   path: 'v',
   * //   format: '.1f'
   * // }]
   */
  static extractReferences(content) {
    if (!content || typeof content !== 'string') {
      return [];
    }

    const references = [];

    // Extract MSD references using TemplateParser
    const msdRefs = TemplateParser.extractMSDReferences(content);
    for (const ref of msdRefs) {
      const pathType = this._determinePathType(ref.path);

      references.push({
        type: 'msd',
        reference: ref.match.replace(/[{}]/g, ''), // Remove braces
        dataSource: ref.source,
        path: ref.path.length > 0 ? ref.path.join('.') : null,
        pathType,
        format: ref.format
      });
    }

    // Extract HA references (basic detection - full parsing done by MsdTemplateEngine)
    const haTokens = TemplateParser.extractTokens(content);
    for (const token of haTokens) {
      // Only treat as HA if it looks like HA template syntax
      if (token.match.includes('states') || token.match.includes('state_attr')) {
        references.push({
          type: 'ha',
          reference: token.path,
          expression: token.path
        });
      }
    }

    return references;
  }

  /**
   * Determine path type from parsed path array
   *
   * @private
   * @param {Array<string>} path - Path array
   * @returns {string} Path type ('value', 'transformation', or 'aggregation')
   */
  static _determinePathType(path) {
    if (!path || path.length === 0) {
      return 'value';
    }

    const firstPart = path[0];
    if (firstPart === 'transformations') {
      return 'transformation';
    }
    if (firstPart === 'aggregations') {
      return 'aggregation';
    }
    return 'value';
  }

  /**
   * Extract entity dependencies from content
   * PHASE 6: Uses TemplateParser for extraction
   *
   * For MSD templates: returns DataSource names
   * For HA templates: delegates to MsdTemplateEngine
   *
   * @param {string} content - Content to analyze
   * @returns {Array<string>} Array of entity/DataSource IDs
   *
   * @example
   * TemplateProcessor.extractEntityDependencies('{cpu_temp} and {memory}')
   * // Returns: ['cpu_temp', 'memory']
   */
  static extractEntityDependencies(content) {
    if (!content || typeof content !== 'string') {
      return [];
    }

    // Use TemplateParser for unified dependency extraction
    return TemplateParser.extractDependencies(content);
  }

  /**
   * Validate template syntax
   *
   * @param {string} content - Content to validate
   * @returns {Object} Validation result { valid: boolean, errors: Array }
   */
  static validate(content) {
    const result = {
      valid: true,
      errors: []
    };

    if (!content || typeof content !== 'string') {
      return result; // Empty content is valid
    }

    // Check for unmatched braces
    const msdOpen = (content.match(/\{/g) || []).length;
    const msdClose = (content.match(/\}/g) || []).length;
    const haOpen = (content.match(/\{\{/g) || []).length;
    const haClose = (content.match(/\}\}/g) || []).length;

    if (msdOpen !== msdClose) {
      result.valid = false;
      result.errors.push(`Unmatched braces: ${msdOpen} opening '{' vs ${msdClose} closing '}'`);
    }

    if (haOpen !== haClose) {
      result.valid = false;
      result.errors.push(`Unmatched HA template braces: ${haOpen} opening '{{' vs ${haClose} closing '}}'`);
    }

    // Check for nested templates (not supported)
    if (content.includes('{{') && content.includes('{')) {
      const hasNested = /\{\{[^}]*\{[^}]*\}\}/.test(content) ||
                       /\{[^}]*\{\{[^}]*\}/.test(content);
      if (hasNested) {
        result.valid = false;
        result.errors.push('Nested templates are not supported');
      }
    }

    return result;
  }

  /**
   * Get cache statistics
   *
   * @returns {Object} Cache stats
   */
  static getCacheStats() {
    return {
      ...this._stats,
      cacheSize: this._cache.size,
      hitRate: this._stats.cacheHits / (this._stats.cacheHits + this._stats.cacheMisses) || 0
    };
  }

  /**
   * Clear template cache
   */
  static clearCache() {
    this._cache.clear();
    this._stats = {
      cacheHits: 0,
      cacheMisses: 0,
      templatesProcessed: 0,
      lastReset: Date.now()
    };
    lcardsLog.debug('[TemplateProcessor] Cache cleared');
  }

  /**
   * Enable debug logging for template processing
   *
   * @param {boolean} enabled - Enable or disable debug mode
   */
  static setDebugMode(enabled) {
    this._debugMode = enabled;
    if (enabled) {
      lcardsLog.info('[TemplateProcessor] Debug mode enabled');
    }
  }
}

// Expose to window for debugging
if (typeof window !== 'undefined') {
  window.__templateProcessor = TemplateProcessor;
}
