import { lcardsLog } from '../../utils/lcards-logging.js';
import { TemplateEvaluator } from '../../core/templates/TemplateEvaluator.js';
import { TemplateParser } from '../../core/templates/TemplateParser.js';

/**
 * MSDTemplateEvaluator - Evaluates MSD DataSource templates
 *
 * Extracted from MSDContentResolver.processEnhancedTemplateStrings()
 *
 * Supports:
 * - Simple DataSource references: {datasource}
 * - Nested paths: {datasource.key}
 * - Transformations: {datasource.transformations.celsius}
 * - Aggregations: {datasource.aggregations.avg}
 * - Format specifications: {datasource:.2f}, {datasource:int}
 *
 * Context requirements:
 * - dataSourceManager: The DataSourceManager singleton instance
 *
 * @extends TemplateEvaluator
 * @module MSDTemplateEvaluator
 */
export class MSDTemplateEvaluator extends TemplateEvaluator {
  /**
   * Create MSD template evaluator
   *
   * @param {Object} dataSourceManager - DataSourceManager singleton
   */
  constructor(dataSourceManager) {
    super({ dataSourceManager });

    if (!dataSourceManager) {
      lcardsLog.debug('[MSDTemplateEvaluator] Created without dataSourceManager (template evaluation will be limited)');
    }

    this.dataSourceManager = dataSourceManager;
  }

  /**
   * Evaluate MSD template content
   *
   * @param {string} content - Template content to evaluate
   * @returns {string} Evaluated content
   *
   * @example
   * const evaluator = new MSDTemplateEvaluator(dataSourceManager);
   *
   * evaluator.evaluate('Temperature: {sensor.temp:.1f}°C')
   * // => 'Temperature: 23.5°C'
   *
   * evaluator.evaluate('{cpu.transformations.celsius} degrees')
   * // => '45.2 degrees'
   */
  evaluate(content) {
    if (!this._validateContent(content)) {
      return content;
    }

    if (!this.dataSourceManager) {
      lcardsLog.warn('[MSDTemplateEvaluator] Cannot evaluate: dataSourceManager not available');
      return content;
    }

    return this._safeEvaluate(() => {
      // Replace all {reference} patterns with their resolved values
      const result = content.replace(/\{([^}]+)\}/g, (match, reference) => {
        return this._resolveReference(match, reference);
      });

      this._logEvaluation(content, result);

      return result;
    }, content, content);
  }

  /**
   * Resolve a single template reference
   *
   * @private
   * @param {string} match - The full matched string (e.g., '{sensor.temp:.1f}')
   * @param {string} reference - The reference content (e.g., 'sensor.temp:.1f')
   * @returns {string} Resolved value or original match if resolution fails
   */
  _resolveReference(match, reference) {
    try {
      // Parse the reference
      const parsed = TemplateParser.parseMSDReference(reference);
      const { source, path, format } = parsed;

      // Get the DataSource
      const dataSource = this.dataSourceManager.getSource(source);
      if (!dataSource) {
        lcardsLog.debug(`[MSDTemplateEvaluator] DataSource '${source}' not found`);
        return match; // Return original if datasource not found
      }

      // Get current data
      const currentData = dataSource.getCurrentData();
      if (!currentData) {
        lcardsLog.debug(`[MSDTemplateEvaluator] No data for DataSource '${source}'`);
        return match;
      }

      // Resolve value based on path
      let value = this._resolveValue(currentData, path);

      if (value === null || value === undefined) {
        lcardsLog.debug(`[MSDTemplateEvaluator] Value not found for '${reference}'`);
        return match;
      }

      // Apply format if specified
      if (format) {
        value = this._applyFormat(value, format, currentData.metadata);
      }

      return String(value);

    } catch (error) {
      lcardsLog.error('[MSDTemplateEvaluator] Reference resolution failed:', error);
      return match; // Return original on error
    }
  }

  /**
   * Resolve value from currentData using path
   *
   * @private
   * @param {Object} currentData - DataSource current data
   * @param {Array<string>} path - Path array (e.g., ['transformations', 'celsius'])
   * @returns {*} Resolved value
   */
  _resolveValue(currentData, path) {
    // No path - return base value
    if (path.length === 0) {
      return currentData.v || currentData.value;
    }

    // Handle transformations and aggregations
    const firstPart = path[0];

    if (firstPart === 'transformations' && currentData.transformations) {
      const transformKey = path.slice(1).join('.');
      return this._getNestedValue(currentData.transformations, transformKey);
    }

    if (firstPart === 'aggregations' && currentData.aggregations) {
      const aggKey = path.slice(1)[0];
      const aggData = currentData.aggregations[aggKey];

      if (aggData === null || aggData === undefined) {
        return null;
      }

      // If there are nested keys beyond the aggregation key
      if (path.length > 2) {
        const nestedPath = path.slice(2).join('.');
        return this._getNestedValue(aggData, nestedPath);
      }

      // Handle aggregation object
      if (typeof aggData === 'object' && aggData !== null) {
        // Try common aggregation result properties
        if (aggData.avg !== undefined) return aggData.avg;
        if (aggData.value !== undefined) return aggData.value;
        if (aggData.last !== undefined) return aggData.last;
        if (aggData.current !== undefined) return aggData.current;
        if (aggData.direction !== undefined) return aggData.direction;
        // If no known property, return stringified object
        return JSON.stringify(aggData);
      }

      return aggData;
    }

    // Generic nested path resolution
    return this._getNestedValue(currentData, path.join('.'));
  }

  /**
   * Get nested value from object using path
   *
   * @private
   * @param {Object} obj - Object to traverse
   * @param {string} path - Dot-separated path
   * @returns {*} Nested value or null
   */
  _getNestedValue(obj, path) {
    if (!path) return obj;

    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Apply format specification to value
   *
   * @private
   * @param {*} value - Value to format
   * @param {string} formatSpec - Format specification (e.g., '.2f', 'int')
   * @param {Object} metadata - DataSource metadata (optional)
   * @returns {string} Formatted value
   */
  _applyFormat(value, formatSpec, metadata = null) {
    if (typeof value !== 'number') {
      return String(value);
    }

    const parsedFormat = TemplateParser.parseFormatSpec(formatSpec);

    switch (parsedFormat.type) {
      case 'float':
        const formatted = value.toFixed(parsedFormat.precision);
        return this._appendUnit(formatted, metadata);

      case 'integer':
        const intValue = Math.round(value).toString();
        return this._appendUnit(intValue, metadata);

      case 'string':
        return String(value);

      case 'boolean':
        return value ? 'true' : 'false';

      case 'custom':
        // Handle custom formats
        if (formatSpec.endsWith('%')) {
          const precision = parseInt(formatSpec.slice(1, -1)) || 0;
          const isAlreadyPercent = metadata?.unit_of_measurement === '%';
          const percentValue = isAlreadyPercent ? value : value * 100;
          return `${percentValue.toFixed(precision)}%`;
        }
        // Default for unknown formats
        return String(value);

      default:
        return String(value);
    }
  }

  /**
   * Append unit from metadata if available
   *
   * @private
   * @param {string} formattedValue - Already formatted value
   * @param {Object} metadata - DataSource metadata
   * @returns {string} Value with unit appended
   */
  _appendUnit(formattedValue, metadata) {
    if (metadata?.unit_of_measurement) {
      return `${formattedValue}${metadata.unit_of_measurement}`;
    }
    return formattedValue;
  }

  /**
   * Get dependencies from template content
   *
   * @param {string} content - Template content to analyze
   * @returns {Array<string>} Array of DataSource names
   *
   * @example
   * evaluator.getDependencies('{sensor.temp} and {sensor.humidity}')
   * // => ['sensor', 'sensor']
   */
  getDependencies(content) {
    if (!this._validateContent(content)) {
      return [];
    }

    const references = TemplateParser.extractMSDReferences(content);
    const dependencies = references.map(ref => ref.source);

    return dependencies;
  }

  /**
   * Update DataSourceManager reference
   *
   * @param {Object} dataSourceManager - New DataSourceManager instance
   */
  updateDataSourceManager(dataSourceManager) {
    if (!dataSourceManager) {
      lcardsLog.warn('[MSDTemplateEvaluator] Attempted to set null dataSourceManager');
      return;
    }

    this.dataSourceManager = dataSourceManager;
    this.updateContext({ dataSourceManager });
  }
}

// Expose for debugging
if (typeof window !== 'undefined') {
  window.__msdTemplateEvaluator = MSDTemplateEvaluator;
}
