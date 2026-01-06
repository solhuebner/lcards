/**
 * MSD Card Schema
 *
 * Complete schema for MSD (Master Systems Display) cards.
 * Includes validation for card-level config (base_svg, view_box, anchors, etc.)
 * Overlay-level validation handled by overlay schemas (line, control).
 * 
 * @module cards/schemas/msd-schema
 */

/**
 * Get complete MSD card schema
 * @param {Object} options - Schema options
 * @param {Array<string>} options.availableFilterPresets - Available filter preset names
 * @returns {Object} Complete MSD schema
 */
export function getMsdSchema(options = {}) {
  const {
    availableFilterPresets = ['dimmed', 'subtle', 'backdrop', 'faded', 'red-alert', 'monochrome', 'none']
  } = options;

  return {
    type: 'object',
    title: 'MSD Card',
    description: 'Master Systems Display card with overlays and routing',
    
    'x-ui': {
      category: 'advanced',
      icon: 'mdi:monitor-dashboard',
      documentation: 'doc/architecture/schemas/msd-schema-definition.md'
    },

    required: ['base_svg'],

    properties: {
      type: {
        type: 'string',
        enum: ['custom:lcards-msd', 'custom:lcards-msd-card', 'custom:cb-lcars-card'],
        description: 'Card type identifier',
        'x-ui': {
          control: 'select',
          label: 'Card Type'
        }
      },

      base_svg: {
        type: 'object',
        title: 'Base SVG Configuration',
        required: ['source'],
        'x-ui': {
          control: 'object',
          expanded: true
        },
        properties: {
          source: {
            type: 'string',
            minLength: 1,
            description: 'SVG source: builtin:key, /local/path.svg, or "none"',
            examples: ['builtin:ncc-1701-a-blue', '/local/my-ship.svg', 'none'],
            'x-ui': {
              control: 'text',
              label: 'SVG Source',
              placeholder: 'builtin:ncc-1701-a-blue'
            },
            errorMessage: 'base_svg.source is required'
          },
          
          filter_preset: {
            type: 'string',
            enum: availableFilterPresets,
            optional: true,
            description: 'CSS filter preset to apply to base SVG',
            'x-ui': {
              control: 'select',
              label: 'Filter Preset'
            }
          },

          filters: {
            type: 'object',
            optional: true,
            description: 'Custom filter values (overrides preset)',
            properties: {
              opacity: {
                type: 'number',
                min: 0,
                max: 1,
                optional: true
              },
              blur: {
                type: 'string',
                optional: true,
                description: 'CSS length (e.g., "3px")'
              },
              brightness: {
                type: 'number',
                min: 0,
                optional: true
              },
              contrast: {
                type: 'number',
                min: 0,
                optional: true
              },
              grayscale: {
                type: 'number',
                min: 0,
                max: 1,
                optional: true
              },
              hue_rotate: {
                type: 'string',
                optional: true,
                description: 'CSS angle (e.g., "90deg")'
              },
              invert: {
                type: 'number',
                min: 0,
                max: 1,
                optional: true
              },
              saturate: {
                type: 'number',
                min: 0,
                optional: true
              },
              sepia: {
                type: 'number',
                min: 0,
                max: 1,
                optional: true
              }
            }
          }
        }
      },

      view_box: {
        oneOf: [
          {
            type: 'string',
            enum: ['auto'],
            description: 'Auto-extract from base_svg'
          },
          {
            type: 'array',
            minItems: 4,
            maxItems: 4,
            items: { type: 'number' },
            description: '[minX, minY, width, height]'
          }
        ],
        optional: true,
        default: 'auto',
        'x-ui': {
          control: 'text',
          label: 'View Box',
          helper: 'Auto-extract or [minX, minY, width, height]'
        }
      },

      anchors: {
        type: 'object',
        optional: true,
        description: 'Named anchor points for overlay positioning',
        additionalProperties: {
          type: 'array',
          minItems: 2,
          maxItems: 2,
          items: {
            oneOf: [
              { type: 'number' },
              { type: 'string', pattern: '^\\d+%$' }
            ]
          }
        },
        'x-ui': {
          control: 'yaml',
          label: 'Anchors',
          helper: 'Define anchor points: anchor_id: [x, y]'
        }
      },

      overlays: {
        type: 'array',
        optional: true,
        description: 'Array of overlay configurations (validated by overlay schemas)',
        items: {
          type: 'object',
          required: ['id', 'type'],
          properties: {
            type: {
              type: 'string',
              enum: ['line', 'control'],
              errorMessage: 'Only "line" and "control" overlay types supported. Use LCARdS cards for buttons/charts.'
            }
          }
        },
        'x-ui': {
          control: 'array',
          label: 'Overlays',
          addLabel: 'Add Overlay'
        }
      },

      routing: {
        type: 'object',
        optional: true,
        description: 'Line routing configuration',
        properties: {
          default_mode: {
            type: 'string',
            enum: ['manhattan', 'direct', 'auto', 'smart'],
            optional: true,
            description: 'Default routing algorithm'
          },
          clearance: {
            type: 'number',
            min: 0,
            optional: true,
            description: 'Minimum clearance around obstacles'
          },
          grid_size: {
            type: 'number',
            min: 1,
            optional: true,
            description: 'Grid cell size for routing'
          }
        }
      },

      data_sources: {
        type: 'object',
        optional: true,
        description: 'Named data source definitions',
        additionalProperties: {
          type: 'object',
          properties: {
            entity: {
              type: 'string',
              format: 'entity',
              description: 'Entity ID to fetch data from'
            },
            windowSeconds: {
              type: 'number',
              minimum: 1,
              optional: true,
              description: 'Time window in seconds for historical data'
            },
            update_interval: {
              type: 'number',
              minimum: 1,
              optional: true,
              description: 'Update interval in seconds'
            },
            history_size: {
              type: 'number',
              minimum: 1,
              optional: true,
              description: 'Maximum number of historical data points to keep'
            }
          },
          required: ['entity']
        }
      },

      rules: {
        type: 'array',
        optional: true,
        description: 'Dynamic styling rules',
        'x-ui': {
          control: 'array',
          label: 'Rules'
        }
      },

      debug: {
        type: 'object',
        optional: true,
        description: 'Debug configuration',
        properties: {
          enabled: {
            type: 'boolean',
            optional: true,
            description: 'Enable debug mode'
          },
          show_anchors: {
            type: 'boolean',
            optional: true,
            description: 'Show anchor points'
          },
          show_routing: {
            type: 'boolean',
            optional: true,
            description: 'Show routing grid'
          }
        }
      },

      theme: {
        type: 'string',
        optional: true,
        description: 'Theme to use for this card',
        'x-ui': {
          control: 'text',
          label: 'Theme'
        }
      }
    },

    validators: [
      // Warn about deprecated fields
      (config, context) => {
        if (config.use_packs) {
          return {
            valid: true,
            warnings: [{
              field: 'use_packs',
              type: 'deprecated_field',
              message: 'Field "use_packs" is deprecated (v1.22+). Packs loaded globally by PackManager.',
              severity: 'warning',
              suggestion: 'Remove "use_packs" from config'
            }]
          };
        }
        return { valid: true };
      },

      (config, context) => {
        if (config.version) {
          return {
            valid: true,
            warnings: [{
              field: 'version',
              type: 'deprecated_field',
              message: 'Field "version" is no longer required (v1.22+).',
              severity: 'warning',
              suggestion: 'Remove "version" from config'
            }]
          };
        }
        return { valid: true };
      },

      // Warn if msd.version is present (nested structure)
      (config, context) => {
        if (config.msd?.version) {
          return {
            valid: true,
            warnings: [{
              field: 'msd.version',
              type: 'deprecated_field',
              message: 'Field "msd.version" is no longer required (v1.22+).',
              severity: 'warning',
              suggestion: 'Remove "version" from msd configuration'
            }]
          };
        }
        return { valid: true };
      },

      // Validate view_box requirement when base_svg.source is "none"
      (config, context) => {
        if (config.base_svg?.source === 'none' && (!config.view_box || config.view_box === 'auto')) {
          return {
            valid: false,
            errors: [{
              field: 'view_box',
              type: 'required_field',
              message: 'view_box must be explicitly specified when base_svg.source is "none"',
              severity: 'error',
              suggestion: 'Add view_box: [minX, minY, width, height]'
            }]
          };
        }
        return { valid: true };
      }
    ]
  };
}

export default getMsdSchema;
