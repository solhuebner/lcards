/**
 * Background Animation Preset Registry
 *
 * Presets define collections of effects that work together to create
 * background animations. Each preset provides a factory function that
 * creates and configures effect instances.
 *
 * @module core/packs/backgrounds/presets
 */
import { GridEffect } from '../effects/GridEffect.js';
import { lcardsLog } from '../../../../utils/lcards-logging.js';

/**
 * Built-in background animation presets
 */
export const BACKGROUND_PRESETS = {
  /**
   * Simple scrolling grid effect (proof-of-concept)
   */
  'grid-basic': {
    name: 'Basic Grid',
    description: 'Simple scrolling LCARS grid',

    createEffects(config) {
      lcardsLog.debug('[Preset:grid-basic] Creating grid effect');

      const gridConfig = {
        lineSpacing: config.line_spacing ?? 40,
        lineWidth: config.line_width ?? 1,
        color: config.color ?? 'rgba(255, 153, 102, 0.3)',
        scrollSpeedX: config.scroll_speed_x ?? 20,
        scrollSpeedY: config.scroll_speed_y ?? 20,
        opacity: config.opacity ?? 1
      };

      return [new GridEffect(gridConfig)];
    }
  }

  // Future presets will be added here:
  // 'starfield': { ... },
  // 'nebula': { ... },
  // 'geometric-array': { ... },
  // etc.
};
