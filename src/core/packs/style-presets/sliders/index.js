/**
 * Slider Style Presets
 *
 * Complete slider presets for LCARdS cards.
 * Provides pills (segmented) and gauge (ruler) visual styles.
 *
 * Architecture:
 * - Separate visual style (pills/gauge) from interactivity (control.locked)
 * - Pills: Segmented bar style for interactive sliders
 * - Gauge: Ruler with tick marks for displays and controls
 *
 * @module core/packs/style-presets/sliders
 */

/**
 * Slider presets object
 */
export const SLIDER_PRESETS = {
  // =====================================
  // BASE SLIDER - Foundation
  // =====================================
  base: {
    // Track configuration
    track: {
      orientation: 'horizontal',
      height: 'theme:components.slider.track.height',
      background: 'theme:components.slider.track.background',
      margin: 'theme:components.slider.track.margin',
    },
    // Border configuration (directly at root)
    border: {
      left: {
        enabled: false,
        size: 0,
        color: {
          default: 'theme:components.slider.border.color.default',
          active: 'theme:components.slider.border.color.active',
          inactive: 'theme:components.slider.border.color.inactive',
          unavailable: 'theme:components.slider.border.color.unavailable',
          hover: 'theme:components.slider.border.color.hover',
          pressed: 'theme:components.slider.border.color.pressed'
        }
      },
      top: {
        enabled: false,
        size: 0,
        color: {
          default: 'theme:components.slider.border.color.default',
          active: 'theme:components.slider.border.color.active',
          inactive: 'theme:components.slider.border.color.inactive',
          unavailable: 'theme:components.slider.border.color.unavailable',
          hover: 'theme:components.slider.border.color.hover',
          pressed: 'theme:components.slider.border.color.pressed'
        }
      },
      right: {
        enabled: false,
        size: 0,
        color: {
          default: 'theme:components.slider.border.color.default',
          active: 'theme:components.slider.border.color.active',
          inactive: 'theme:components.slider.border.color.inactive',
          unavailable: 'theme:components.slider.border.color.unavailable',
          hover: 'theme:components.slider.border.color.hover',
          pressed: 'theme:components.slider.border.color.pressed'
        }
      },
      bottom: {
        enabled: false,
        size: 0,
        color: {
          default: 'theme:components.slider.border.color.default',
          active: 'theme:components.slider.border.color.active',
          inactive: 'theme:components.slider.border.color.inactive',
          unavailable: 'theme:components.slider.border.color.unavailable',
          hover: 'theme:components.slider.border.color.hover',
          pressed: 'theme:components.slider.border.color.pressed'
        }
      }
    },

    // Text configuration (directly at root)
    text: {
      default: {
        font_family: 'theme:typography.fontFamily.primary',
        font_size: 'theme:typography.fontSize.base',
        color: {
          default: 'theme:components.button.text.color.active',
          active: 'theme:components.button.text.color.active',
          inactive: 'theme:components.button.text.color.inactive',
          unavailable: 'theme:components.button.text.color.unavailable'
        }
      }
    },

    // Gauge scale configuration (tick marks and labels)
    gauge: {
      scale: {
        tick_marks: {
          major: {
            color: {
              default: 'theme:components.slider.gauge.tick.major.color.default',
              active: 'theme:components.slider.gauge.tick.major.color.active',
              inactive: 'theme:components.slider.gauge.tick.major.color.inactive',
              unavailable: 'theme:components.slider.gauge.tick.major.color.unavailable'
            }
          },
          minor: {
            color: {
              default: 'theme:components.slider.gauge.tick.minor.color.default',
              active: 'theme:components.slider.gauge.tick.minor.color.active',
              inactive: 'theme:components.slider.gauge.tick.minor.color.inactive',
              unavailable: 'theme:components.slider.gauge.tick.minor.color.unavailable'
            }
          }
        },
        labels: {
          color: {
            default: 'theme:components.slider.gauge.label.color.default',
            active: 'theme:components.slider.gauge.label.color.active',
            inactive: 'theme:components.slider.gauge.label.color.inactive',
            unavailable: 'theme:components.slider.gauge.label.color.unavailable'
          }
        }
      }
    }
  },

  // =====================================
  // PILLS PRESET - Segmented slider
  // =====================================
  'pills-basic': {
    extends: 'slider.base',
    description: 'Segmented pill slider',
    compatibleComponents: ['default'],

    // Track configuration overrides (directly at root)
    track: {
      type: 'pills',  // ✅ THIS determines pills mode
      margin: {
        top: 5,
        left: 5,
        right: 0,
        bottom: 0
      },
      segments: {
        enabled: true,
        gap: 'theme:components.slider.pills.gap',
        size: {
          width: 'theme:components.slider.pills.segment.width',
        },
        shape: {
          radius: 'theme:components.slider.pills.radius'
        },
        gradient: {
          interpolated: true,
          start: 'theme:components.slider.pills.gradient.start',
          end: 'theme:components.slider.pills.gradient.end'
        },
        appearance: {
          unfilled: { opacity: 0.2 },
          filled: { opacity: 1.0 }
        }
      }
    }
  },

  // =====================================
  // PILLS PRESET - Segmented slider
  // =====================================
  'pills-left-border': {
    extends: 'slider.pills-basic',
    description: 'Left border with pills slider. ',
    compatibleComponents: ['default'],

    border: {
      top: {
        enabled: true,
        size: 10
      },
      left: {
        enabled: true,
        size: 120
      }
    }
  },


  // =====================================
  // GAUGE PRESET - Ruler style
  // =====================================
  'gauge-basic': {
    extends: 'slider.base',
    description: 'Ruler-style gauge for displays and controls',
    compatibleComponents: ['default'],

    // Track configuration overrides (directly at root)
    track: {
      type: 'gauge',
      margin: 0  // Override base margin for seamless ruler
    }
  },

  // =====================================
  // GAUGE PRESET - Ruler style with left border
  // =====================================
  'gauge-left-border': {
    extends: 'slider.gauge-basic',
    description: 'Left border with gauge slider.',
    compatibleComponents: ['default'],
    border: {
      top: {
        enabled: true,
        size: 10
      },
      left: {
        enabled: true,
        size: 120
      }
    },
  },

  // =====================================
  // PILLS PRESET - Pills with rounded corners (LCARS end-cap style)
  // =====================================
  'pills-left-border-rounded': {
    extends: 'slider.pills-left-border',
    description: 'Pills slider with left border and rounded free-end corners. The left (bordered) end stays flat; only the right end is rounded — classic LCARS end-cap look. Override style.border.radius for a different radius or per-corner control.',
    compatibleComponents: ['default'],

    border: {
      radius: {
        top_left:     0,
        bottom_left:  0,
        top_right:    12,
        bottom_right: 12
      }
    }
  },

  // =====================================
  // GAUGE PRESET - Gauge with rounded corners (LCARS end-cap style)
  // =====================================
  'gauge-left-border-rounded': {
    extends: 'slider.gauge-left-border',
    description: 'Gauge slider with left border and rounded free-end corners. The left (bordered) end stays flat; only the right end is rounded. Override style.border.radius for a different radius or per-corner control.',
    compatibleComponents: ['default'],

    border: {
      radius: {
        top_left:     0,
        bottom_left:  0,
        top_right:    12,
        bottom_right: 12
      }
    }
  },

  // =====================================
  // SHAPED PRESETS — Generic clip-path fill
  // =====================================
  //
  // Both presets default to shape type 'lozenge' but the user can override
  // style.shaped.type to any supported shape (rect, rounded, diamond, etc.).

  /**
   * shaped-vertical: Vertical shaped slider.  Fill rises from the bottom.
   * Text: state value at top-center, entity name at bottom-center.
   */
  'shaped-vertical': {
    extends: 'slider.base',
    description: 'Vertical shaped slider with exterior text labels. Change style.shaped.type for different shapes (lozenge, rounded, diamond…).',
    compatibleComponents: ['shaped'],

    component: 'shaped',

    track: {
      type:        'shaped',
      orientation: 'vertical',
      invert_fill: false,   // fill rises from bottom
      margin:      0        // clip path handles the shape boundary
    },

    shaped: {
      type: 'lozenge',      // default shape — override with style.shaped.type
      text_bands: {
        top:    { size: 36 },   // reserve 36px above shape for state readout
        bottom: { size: 36 },   // reserve 36px below shape for entity name
        left:   { size: 0 },
        right:  { size: 0 }
      },
      track: {
        background: 'theme:components.slider.track.background'
      }
    },

    text: {
      name:  { position: 'bottom-center', show: true },
      state: { position: 'top-center',    show: true }
    }
  },

  /**
   * shaped-horizontal: Horizontal shaped slider.  Fill grows from the left.
   * Text: entity name at left-center, state value at right-center.
   */
  'shaped-horizontal': {
    extends: 'slider.base',
    description: 'Horizontal shaped slider with exterior text labels. Change style.shaped.type for different shapes (lozenge, rounded, diamond…).',
    compatibleComponents: ['shaped'],

    component: 'shaped',

    track: {
      type:        'shaped',
      orientation: 'horizontal',
      invert_fill: false,   // fill grows from left
      margin:      0
    },

    shaped: {
      type: 'lozenge',      // default shape — override with style.shaped.type
      text_bands: {
        top:    { size: 0 },
        bottom: { size: 0 },
        left:   { size: 60 },   // reserve 80px left of shape for entity name
        right:  { size: 60 }    // reserve 60px right of shape for state readout
      },
      track: {
        background: 'theme:components.slider.track.background'
      }
    },

    text: {
      name:  { position: 'left-center',  show: true },
      state: { position: 'right-center', show: true }
    }
  },

  // -----------------------------------------------------------------------

  // =====================================
  // PICARD PRESET - Picard-style vertical slider
  // =====================================

  'picard-gauge-vertical': {
    extends: 'slider.gauge-basic',
    description: 'Picard-style vertical slider',
    compatibleComponents: ['picard'],

    // Track configuration overrides (directly at root)
    track: {
      orientation: 'vertical',
      invert_fill: false,
    },
    gauge: {
      indicator: {
        enabled: true,
        size: {
          height: 20,
          width: 52
        },
        type: 'round',
        border: {
          enabled: true
        }
      }
    }
  }
};
