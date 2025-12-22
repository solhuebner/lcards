/**
 * @fileoverview Unified Provenance Tracker for LCARdS
 *
 * Provides standardized provenance tracking across all card types for:
 * - Config layers (card defaults → theme defaults → preset → user → rules)
 * - Theme token resolution chains (token path → computed tokens → final value)
 * - Rule patches (original value → patched value + rule info)
 * - Template processing (template → processed output + dependencies)
 * - Style resolution (explicit → theme → preset → default)
 * - Renderer info (MSD-specific: defaults accessed, features used, timing)
 *
 * @module utils/provenance-tracker
 */

import { lcardsLog } from './lcards-logging.js';

/**
 * Unified Provenance Tracker
 *
 * Stores provenance information for debugging and troubleshooting.
 * Tracks where every config value, style, and resolved setting originates.
 *
 * @class ProvenanceTracker
 */
export class ProvenanceTracker {
  /**
   * Create a new provenance tracker
   * @param {string} cardGuid - Unique identifier for the card
   */
  constructor(cardGuid) {
    this.cardGuid = cardGuid;

    // Provenance data storage
    this.data = {
      // Config layer provenance (from CoreConfigManager)
      config: {
        merge_order: [],           // Layer precedence
        field_sources: {},         // Field → layer mapping
        card_type: null,
        timestamp: null
      },

      // Theme token resolution chains
      theme_tokens: {},

      // Rule patches (runtime overrides)
      rule_patches: {},

      // Template processing
      templates: {},

      // Style resolution (MSD-specific)
      styles: null,

      // Renderer info (MSD-specific)
      renderer: null
    };

    // Statistics
    this.stats = {
      tokensTracked: 0,
      patchesTracked: 0,
      templatesTracked: 0
    };
  }

  /**
   * Track config provenance from CoreConfigManager
   *
   * @param {Object} provenance - Config provenance object
   * @param {string[]} provenance.merge_order - Layer precedence
   * @param {Object} provenance.field_sources - Field → layer mapping
   * @param {string} provenance.card_type - Card type
   * @param {number} provenance.timestamp - Merge timestamp
   */
  trackConfig(provenance) {
    if (!provenance) return;

    this.data.config = {
      merge_order: provenance.merge_order || [],
      field_sources: provenance.field_sources || {},
      card_type: provenance.card_type || null,
      timestamp: provenance.timestamp || Date.now()
    };

    lcardsLog.trace(`[ProvenanceTracker:${this.cardGuid}] Config tracked`, {
      layers: this.data.config.merge_order.length,
      fields: Object.keys(this.data.config.field_sources).length
    });
  }

  /**
   * Track theme token resolution
   *
   * @param {string} tokenPath - Token path (e.g., 'colors.accent.primary')
   * @param {string} originalRef - Original reference (e.g., 'theme:colors.accent.primary')
   * @param {any} resolvedValue - Final resolved value
   * @param {Array<Object>} resolutionChain - Resolution steps
   * @param {string[]} usedByFields - Fields using this token
   */
  trackThemeToken(tokenPath, originalRef, resolvedValue, resolutionChain = [], usedByFields = []) {
    this.data.theme_tokens[tokenPath] = {
      original_ref: originalRef,
      resolved_value: resolvedValue,
      resolution_chain: resolutionChain,
      used_by_fields: usedByFields,
      timestamp: Date.now()
    };

    this.stats.tokensTracked++;

    lcardsLog.trace(`[ProvenanceTracker:${this.cardGuid}] Token tracked: ${tokenPath}`, {
      resolvedValue,
      chainLength: resolutionChain.length
    });
  }

  /**
   * Track rule patch application
   *
   * @param {string} fieldPath - Field path (e.g., 'style.opacity')
   * @param {any} originalValue - Value before patch
   * @param {any} patchedValue - Value after patch
   * @param {string} ruleId - Rule ID that applied the patch
   * @param {string} ruleCondition - Human-readable rule condition
   */
  trackRulePatch(fieldPath, originalValue, patchedValue, ruleId, ruleCondition) {
    this.data.rule_patches[fieldPath] = {
      original_value: originalValue,
      patched_value: patchedValue,
      rule_id: ruleId,
      rule_condition: ruleCondition,
      applied_at: Date.now()
    };

    this.stats.patchesTracked++;

    lcardsLog.trace(`[ProvenanceTracker:${this.cardGuid}] Patch tracked: ${fieldPath}`, {
      ruleId,
      originalValue,
      patchedValue
    });
  }

  /**
   * Track template processing
   *
   * @param {string} fieldId - Field identifier (e.g., 'label', 'text.name')
   * @param {string} original - Original template string
   * @param {string} processed - Processed output
   * @param {string[]} dependencies - Entity/variable dependencies
   * @param {string} processor - Processor type (e.g., 'jinja2', 'javascript')
   */
  trackTemplate(fieldId, original, processed, dependencies = [], processor = 'unknown') {
    this.data.templates[fieldId] = {
      original,
      processed,
      dependencies,
      processor,
      last_updated: Date.now()
    };

    this.stats.templatesTracked++;

    lcardsLog.trace(`[ProvenanceTracker:${this.cardGuid}] Template tracked: ${fieldId}`, {
      processor,
      dependencies: dependencies.length
    });
  }

  /**
   * Track MSD-specific style provenance
   *
   * @param {Object} styleProvenance - Style provenance data from MSD ProvenanceTracker
   */
  trackStyles(styleProvenance) {
    this.data.styles = styleProvenance;

    lcardsLog.trace(`[ProvenanceTracker:${this.cardGuid}] MSD styles tracked`);
  }

  /**
   * Track MSD-specific renderer provenance
   *
   * @param {Object} rendererProvenance - Renderer provenance data from BaseRenderer
   */
  trackRenderer(rendererProvenance) {
    this.data.renderer = rendererProvenance;

    lcardsLog.trace(`[ProvenanceTracker:${this.cardGuid}] MSD renderer tracked`);
  }

  /**
   * Get provenance data
   *
   * Returns all tracked provenance information including config layers,
   * theme tokens, rule patches, and templates.
   *
   * The config section includes both a flat field_sources map and a
   * hierarchical tree view for easier navigation.
   *
   * @param {string} [path] - Optional path to specific provenance data
   * @returns {any} Provenance data (full or at path)
   *
   * @example
   * // Get all provenance
   * const prov = tracker.getProvenance();
   * // Returns:
   * // {
   * //   config: {
   * //     merge_order: ['card_defaults', 'preset_dpad', 'user_config'],
   * //     field_sources: { 'dpad': 'card_defaults', ... },  // Flat map
   * //     tree: { dpad: { __source: 'card_defaults', ... } }, // Hierarchical
   * //     card_type: 'button',
   * //     timestamp: 1234567890
   * //   },
   * //   theme_tokens: {...},
   * //   rule_patches: {...},
   * //   templates: {...}
   * // }
   *
   * // Get config provenance
   * tracker.getProvenance('config');
   *
   * // Get specific field source
   * tracker.getProvenance('config.field_sources.style.color');
   *
   * // Get config tree
   * tracker.getProvenance('config.tree');
   */
  getProvenance(path = null) {
    if (!path) {
      // Return full provenance with config tree included
      return {
        ...this.data,
        config: {
          ...this.data.config,
          tree: this.getConfigTree() // Add hierarchical tree view
        }
      };
    }

    // Special handling for config.tree path
    if (path === 'config.tree') {
      return this.getConfigTree();
    }

    // Navigate path for other queries
    const parts = path.split('.');
    let current = this.data;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }

    return current;
  }

  /**
   * Get pretty-printed debug output
   *
   * NOTE: Uses emoji for visual appeal in console output. This is intentional
   * for human-readable debugging. Emojis render consistently in modern browsers.
   * For automated/programmatic access, use getProvenance() instead.
   *
   * @param {boolean} [toConsole=false] - If true, outputs directly to console with formatting
   * @returns {string|undefined} Formatted string if toConsole=false, undefined otherwise
   */
  debugProvenance(toConsole = false) {
    if (toConsole) {
      // Output directly to console with proper formatting
      console.group(`🔍 Provenance for ${this.cardGuid}`);

      // Config merge order
      if (this.data.config.merge_order.length > 0) {
        console.group('📦 Config Merge Order');
        console.log(this.data.config.merge_order);
        console.groupEnd();
      }

      // Field sources
      const fieldSources = Object.keys(this.data.config.field_sources);
      if (fieldSources.length > 0) {
        console.group(`📋 Field Sources (${fieldSources.length} total)`);

        // Group by source layer for better readability
        const byLayer = {};
        for (const [field, source] of Object.entries(this.data.config.field_sources)) {
          if (!byLayer[source]) byLayer[source] = [];
          byLayer[source].push(field);
        }

        for (const [layer, fields] of Object.entries(byLayer)) {
          console.groupCollapsed(`${layer} (${fields.length} fields)`);
          fields.forEach(field => console.log(field));
          console.groupEnd();
        }

        console.groupEnd();
      }

      // Theme tokens
      const tokens = Object.keys(this.data.theme_tokens);
      if (tokens.length > 0) {
        console.group(`🎨 Theme Tokens (${tokens.length})`);
        tokens.forEach(token => {
          const data = this.data.theme_tokens[token];
          console.groupCollapsed(token);
          console.log('Resolved value:', data.resolved_value);
          console.log('Original ref:', data.original_ref);
          if (data.used_by_fields.length > 0) {
            console.log('Used by fields:', data.used_by_fields);
          }
          console.log('Resolution chain:', data.resolution_chain);
          console.groupEnd();
        });
        console.groupEnd();
      }

      // Rule patches
      const patches = Object.keys(this.data.rule_patches);
      if (patches.length > 0) {
        console.group(`⚙️ Rule Patches (${patches.length})`);
        patches.forEach(field => {
          const patch = this.data.rule_patches[field];
          console.groupCollapsed(field);
          console.log('Original:', patch.original_value);
          console.log('Patched:', patch.patched_value);
          console.log('Rule ID:', patch.rule_id);
          console.log('Condition:', patch.rule_condition);
          console.groupEnd();
        });
        console.groupEnd();
      }

      // Templates
      const templates = Object.keys(this.data.templates);
      if (templates.length > 0) {
        console.group(`📝 Templates (${templates.length})`);
        templates.forEach(field => {
          const tmpl = this.data.templates[field];
          console.groupCollapsed(field);
          console.log('Original:', tmpl.original);
          console.log('Processed:', tmpl.processed);
          console.log('Processor:', tmpl.processor);
          if (tmpl.dependencies.length > 0) {
            console.log('Dependencies:', tmpl.dependencies);
          }
          console.groupEnd();
        });
        console.groupEnd();
      }

      // MSD-specific
      if (this.data.styles || this.data.renderer) {
        console.group('🎭 MSD Provenance');
        if (this.data.styles) {
          console.log('Style Provenance: Available');
        }
        if (this.data.renderer) {
          console.log('Renderer Provenance: Available');
        }
        console.groupEnd();
      }

      // Statistics
      console.group('📊 Statistics');
      console.log('Config layers:', this.data.config.merge_order.length);
      console.log('Fields tracked:', Object.keys(this.data.config.field_sources).length);
      console.log('Tokens tracked:', this.stats.tokensTracked);
      console.log('Patches tracked:', this.stats.patchesTracked);
      console.log('Templates tracked:', this.stats.templatesTracked);
      console.groupEnd();

      console.groupEnd();
      return; // No return value when outputting to console
    }

    // Legacy string output (for backwards compatibility)
    const lines = [];

    lines.push(`🔍 Provenance for ${this.cardGuid}`);
    lines.push('');

    // Config merge order
    if (this.data.config.merge_order.length > 0) {
      lines.push('  📦 Config Merge Order');
      lines.push(`    [${this.data.config.merge_order.map(l => `'${l}'`).join(', ')}]`);
      lines.push('');
    }

    // Field sources (sample)
    const fieldSources = Object.keys(this.data.config.field_sources);
    if (fieldSources.length > 0) {
      lines.push('  📋 Field Sources (Sample)');
      const sample = fieldSources.slice(0, 10);
      sample.forEach(field => {
        const source = this.data.config.field_sources[field];
        lines.push(`    ${field}: ${source}`);
      });
      if (fieldSources.length > 10) {
        lines.push(`    ... and ${fieldSources.length - 10} more`);
      }
      lines.push('');
    }

    // Theme tokens
    const tokens = Object.keys(this.data.theme_tokens);
    if (tokens.length > 0) {
      lines.push(`  🎨 Theme Tokens (${tokens.length})`);
      tokens.slice(0, 5).forEach(token => {
        const data = this.data.theme_tokens[token];
        lines.push(`    ${token}: ${JSON.stringify(data.resolved_value)}`);
        if (data.used_by_fields.length > 0) {
          lines.push(`      Used by: ${data.used_by_fields.join(', ')}`);
        }
      });
      if (tokens.length > 5) {
        lines.push(`    ... and ${tokens.length - 5} more`);
      }
      lines.push('');
    }

    // Rule patches
    const patches = Object.keys(this.data.rule_patches);
    if (patches.length > 0) {
      lines.push(`  ⚙️ Rule Patches (${patches.length})`);
      patches.slice(0, 5).forEach(field => {
        const patch = this.data.rule_patches[field];
        lines.push(`    ${field}: ${JSON.stringify(patch.original_value)} → ${JSON.stringify(patch.patched_value)}`);
        lines.push(`      Rule: ${patch.rule_id} (${patch.rule_condition})`);
      });
      if (patches.length > 5) {
        lines.push(`    ... and ${patches.length - 5} more`);
      }
      lines.push('');
    }

    // Templates
    const templates = Object.keys(this.data.templates);
    if (templates.length > 0) {
      lines.push(`  📝 Templates (${templates.length})`);
      templates.slice(0, 5).forEach(field => {
        const tmpl = this.data.templates[field];
        lines.push(`    ${field}: "${tmpl.original}" → "${tmpl.processed}"`);
        if (tmpl.dependencies.length > 0) {
          lines.push(`      Dependencies: ${tmpl.dependencies.join(', ')}`);
        }
      });
      if (templates.length > 5) {
        lines.push(`    ... and ${templates.length - 5} more`);
      }
      lines.push('');
    }

    // MSD-specific
    if (this.data.styles) {
      lines.push('  🎭 MSD Style Provenance: Available');
    }
    if (this.data.renderer) {
      lines.push('  🖼️ MSD Renderer Provenance: Available');
    }

    // Statistics
    lines.push('');
    lines.push('  📊 Statistics');
    lines.push(`    Tokens tracked: ${this.stats.tokensTracked}`);
    lines.push(`    Patches tracked: ${this.stats.patchesTracked}`);
    lines.push(`    Templates tracked: ${this.stats.templatesTracked}`);

    return lines.join('\n');
  }

  /**
   * Clear all provenance data
   */
  clear() {
    this.data = {
      config: { merge_order: [], field_sources: {}, card_type: null, timestamp: null },
      theme_tokens: {},
      rule_patches: {},
      templates: {},
      styles: null,
      renderer: null
    };

    this.stats = {
      tokensTracked: 0,
      patchesTracked: 0,
      templatesTracked: 0
    };

    lcardsLog.trace(`[ProvenanceTracker:${this.cardGuid}] Cleared`);
  }

  /**
   * Get statistics
   *
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      ...this.stats,
      configLayers: this.data.config.merge_order.length,
      fields: Object.keys(this.data.config.field_sources).length
    };
  }

  /**
   * Get the source layer for a specific config field
   *
   * Supports deep field paths like 'dpad.segments.default.style.fill'
   *
   * @param {string} fieldPath - Dot-notation field path
   * @returns {string|null} Source layer name or null if not found
   *
   * @example
   * tracker.getFieldSource('dpad'); // 'card_defaults'
   * tracker.getFieldSource('dpad.segments.default'); // 'card_defaults'
   * tracker.getFieldSource('dpad.segments.default.style.fill'); // 'user_config'
   */
  getFieldSource(fieldPath) {
    return this.data.config.field_sources[fieldPath] || null;
  }

  /**
   * Get all fields from a specific source layer
   *
   * @param {string} layerName - Layer name (e.g., 'card_defaults', 'user_config')
   * @returns {string[]} Array of field paths from that layer
   *
   * @example
   * tracker.getFieldsFromLayer('user_config');
   * // Returns: ['dpad.segments.default.style.fill', 'label', ...]
   */
  getFieldsFromLayer(layerName) {
    return Object.entries(this.data.config.field_sources)
      .filter(([_, source]) => source === layerName)
      .map(([field, _]) => field);
  }

  /**
   * Check if a field or any of its children were overridden by user
   *
   * Useful for determining if user customized a specific config section
   *
   * @param {string} fieldPrefix - Field path prefix to check
   * @returns {boolean} True if user overrode this field or any children
   *
   * @example
   * tracker.hasUserOverride('dpad.segments.default.style');
   * // Returns true if any field under dpad.segments.default.style is from user_config
   */
  hasUserOverride(fieldPrefix) {
    for (const [field, source] of Object.entries(this.data.config.field_sources)) {
      if (field === fieldPrefix || field.startsWith(`${fieldPrefix}.`)) {
        if (source === 'user_config') {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get config provenance as a tree structure
   *
   * Reconstructs the flat field_sources map into a hierarchical tree showing
   * the source layer for each field and its nested children.
   *
   * @returns {Object} Tree structure with fields as keys and values as either:
   *   - {__source: 'layer_name'} for leaf fields
   *   - {__source: 'layer_name', child: {...}} for parent fields
   *
   * @example
   * const tree = tracker.getConfigTree();
   * // Returns:
   * // {
   * //   dpad: {
   * //     __source: 'card_defaults',
   * //     segments: {
   * //       __source: 'card_defaults',
   * //       default: {
   * //         __source: 'card_defaults',
   * //         style: {
   * //           __source: 'preset_dpad',
   * //           fill: {
   * //             __source: 'user_config',
   * //             default: { __source: 'user_config' }
   * //           }
   * //         }
   * //       }
   * //     }
   * //   },
   * //   label: { __source: 'user_config' },
   * //   entity: { __source: 'user_config' }
   * // }
   */
  getConfigTree() {
    const tree = {};

    // Sort by path depth (shortest first) to build tree correctly
    const sortedEntries = Object.entries(this.data.config.field_sources)
      .sort((a, b) => {
        const depthA = a[0].split('.').length;
        const depthB = b[0].split('.').length;
        return depthA - depthB;
      });

    for (const [fieldPath, source] of sortedEntries) {
      const parts = fieldPath.split('.');
      let current = tree;

      // Navigate/create path
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;

        if (!current[part]) {
          current[part] = {};
        }

        if (isLast) {
          // Leaf node - set source
          current[part].__source = source;
        } else {
          // Parent node - navigate deeper
          current = current[part];
        }
      }
    }

    return tree;
  }

  /**
   * Print config tree to console in readable format
   *
   * Shows hierarchical view of config with source layers
   *
   * @param {string} [title='Config Provenance Tree'] - Title for output
   *
   * @example
   * tracker.printConfigTree();
   * // Output:
   * // 📋 Config Provenance Tree
   * //   dpad [card_defaults]
   * //     segments [card_defaults]
   * //       default [card_defaults]
   * //         style [preset_dpad]
   * //           fill [user_config]
   * //             default [user_config]
   * //   label [user_config]
   * //   entity [user_config]
   */
  printConfigTree(title = 'Config Provenance Tree') {
    const tree = this.getConfigTree();

    console.group(`📋 ${title}`);

    const printNode = (node, indent = '') => {
      for (const [key, value] of Object.entries(node)) {
        if (key === '__source') continue;

        const source = value.__source || 'unknown';
        const hasChildren = Object.keys(value).length > 1;

        if (hasChildren) {
          console.group(`${indent}${key} [${source}]`);
          printNode(value, '');
          console.groupEnd();
        } else {
          console.log(`${indent}${key} [${source}]`);
        }
      }
    };

    printNode(tree);
    console.groupEnd();
  }
}

export default ProvenanceTracker;
