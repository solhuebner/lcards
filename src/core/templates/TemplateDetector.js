import { lcardsLog } from '../../utils/lcards-logging.js';

/**
 * TemplateDetector - Unified template detection for all card types
 *
 * Detects various template syntaxes used across the codebase:
 * - MSD templates: {datasource}, {datasource.key:format}
 * - HA templates: {{states('entity')}}
 * - SimpleCard JavaScript: [[[JavaScript code]]]
 * - SimpleCard tokens: {{token}}
 *
 * Extracted from MSD TemplateProcessor and SimpleCard inline logic.
 *
 * @module TemplateDetector
 */
export class TemplateDetector {
  /**
   * Template syntax markers
   */
  static MARKERS = {
    MSD_START: '{',
    MSD_END: '}',
    HA_START: '{{',
    HA_END: '}}',
    JS_START: '[[[',
    JS_END: ']]]'
  };

  /**
   * Detect what types of templates are present in content
   *
   * @param {string} content - Content to analyze
   * @returns {{hasMSD: boolean, hasHA: boolean, hasJavaScript: boolean, hasTokens: boolean}}
   *
   * @example
   * TemplateDetector.detectTemplateTypes('{sensor.temp}')
   * // => { hasMSD: true, hasHA: false, hasJavaScript: false, hasTokens: false }
   *
   * TemplateDetector.detectTemplateTypes('{{states("sensor.temp")}}')
   * // => { hasMSD: false, hasHA: true, hasJavaScript: false, hasTokens: false }
   *
   * TemplateDetector.detectTemplateTypes('[[[return entity.state]]]')
   * // => { hasMSD: false, hasHA: false, hasJavaScript: true, hasTokens: false }
   */
  static detectTemplateTypes(content) {
    if (!content || typeof content !== 'string') {
      return {
        hasMSD: false,
        hasHA: false,
        hasJavaScript: false,
        hasTokens: false
      };
    }

    return {
      hasMSD: this.hasMSDTemplates(content),
      hasHA: this.hasHATemplates(content),
      hasJavaScript: this.hasJavaScript(content),
      hasTokens: this.hasTokens(content)
    };
  }

  /**
   * Check if content contains any template syntax
   *
   * @param {string} content - Content to check
   * @returns {boolean} True if any template syntax found
   */
  static hasTemplates(content) {
    if (!content || typeof content !== 'string') {
      return false;
    }

    return content.includes(this.MARKERS.MSD_START) ||
           content.includes(this.MARKERS.HA_START) ||
           content.includes(this.MARKERS.JS_START);
  }

  /**
   * Check if content has MSD templates specifically
   *
   * MSD templates use single braces: {datasource} or {datasource.key:format}
   * Must distinguish from HA templates which use double braces: {{...}}
   *
   * @param {string} content - Content to check
   * @returns {boolean} True if has MSD templates ({...})
   */
  static hasMSDTemplates(content) {
    if (!content || typeof content !== 'string') {
      return false;
    }

    // Pattern: { followed by non-brace characters, then }
    // But NOT {{ (to avoid false positive on HA templates)
    const hasSingleBrace = content.includes(this.MARKERS.MSD_START);
    const hasDoubleBrace = content.includes(this.MARKERS.HA_START);

    // If we have { but the first occurrence is not part of {{, it's MSD
    if (hasSingleBrace && !hasDoubleBrace) {
      return true;
    }

    if (hasSingleBrace && hasDoubleBrace) {
      // Need to check if there's a single brace that's not part of double brace
      // Look for pattern: non-brace character followed by single {
      return /[^{]\{[^{]/.test(content) || /^\{[^{]/.test(content);
    }

    return false;
  }

  /**
   * Check if content has Home Assistant templates
   *
   * HA templates use double braces: {{states('entity.id')}}
   *
   * @param {string} content - Content to check
   * @returns {boolean} True if has HA templates ({{...}})
   */
  static hasHATemplates(content) {
    if (!content || typeof content !== 'string') {
      return false;
    }

    return content.includes(this.MARKERS.HA_START) &&
           content.includes(this.MARKERS.HA_END);
  }

  /**
   * Check if content has JavaScript templates
   *
   * JavaScript templates use triple brackets: [[[JavaScript code]]]
   * Used by SimpleCard for button-card style templates.
   *
   * @param {string} content - Content to check
   * @returns {boolean} True if has JavaScript templates ([[[...]]])
   */
  static hasJavaScript(content) {
    if (!content || typeof content !== 'string') {
      return false;
    }

    return content.includes(this.MARKERS.JS_START) &&
           content.includes(this.MARKERS.JS_END);
  }

  /**
   * Check if content has token templates
   *
   * Token templates use double braces for simple substitution: {{entity.state}}
   * Note: This overlaps with HA template syntax but used differently in SimpleCard.
   *
   * @param {string} content - Content to check
   * @returns {boolean} True if has token templates ({{...}})
   */
  static hasTokens(content) {
    if (!content || typeof content !== 'string') {
      return false;
    }

    return content.includes(this.MARKERS.HA_START) &&
           content.includes(this.MARKERS.HA_END);
  }

  /**
   * Get all template types present as an array
   *
   * @param {string} content - Content to analyze
   * @returns {Array<string>} Array of template type names
   *
   * @example
   * TemplateDetector.getTemplateTypes('{sensor.temp} {{states("sensor.humidity")}}')
   * // => ['MSD', 'HA']
   */
  static getTemplateTypes(content) {
    const types = this.detectTemplateTypes(content);
    const result = [];

    if (types.hasMSD) result.push('MSD');
    if (types.hasHA) result.push('HA');
    if (types.hasJavaScript) result.push('JavaScript');
    if (types.hasTokens && !types.hasHA) result.push('Token');

    return result;
  }

  /**
   * Log template detection results (for debugging)
   *
   * @param {string} content - Content to analyze
   * @param {string} context - Context string for logging
   */
  static logDetection(content, context = 'Unknown') {
    const types = this.detectTemplateTypes(content);

    lcardsLog.debug(`[TemplateDetector] Detection for ${context}:`, {
      content: content?.substring(0, 100),
      types,
      typesList: this.getTemplateTypes(content)
    });
  }
}

// Expose for debugging
if (typeof window !== 'undefined') {
  window.__templateDetector = TemplateDetector;
}
