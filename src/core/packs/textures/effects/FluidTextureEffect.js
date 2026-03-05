/**
 * @fileoverview FluidTextureEffect - Canvas fluid / nebula texture
 *
 * Wraps NebulaEffect to render organic drifting blobs inside the shape boundary.
 *
 * @module core/packs/textures/effects/FluidTextureEffect
 */

import { NebulaEffect } from '../../backgrounds/effects/NebulaEffect.js';
import { BaseTextureEffect } from './BaseTextureEffect.js';

/**
 * FluidTextureEffect - Organic nebula clouds
 *
 * @extends BaseTextureEffect
 */
export class FluidTextureEffect extends BaseTextureEffect {
    /**
     * @param {Object} config
     * @param {string} [config.color='rgba(100,180,255,0.8)'] - Cloud colour
     * @param {number} [config.base_frequency=0.010]          - Controls noiseScale (lower = larger blobs)
     * @param {number} [config.scroll_speed_x=7]              - Horizontal drift (px/s)
     * @param {number} [config.scroll_speed_y=10]             - Vertical drift (px/s)
     * @param {number} [config.speed=1]                       - Speed multiplier
     */
    constructor(config = {}) {
        super(config);
        this._nebula = new NebulaEffect({
            colors:       [config.color ?? 'rgba(100,180,255,0.8)'],
            noiseScale:   config.base_frequency ? config.base_frequency * 800 : 8,
            cloudCount:   3,
            scrollSpeedX: config.scroll_speed_x ?? 7,
            scrollSpeedY: config.scroll_speed_y ?? 10,
            speed:        config.speed ?? 1,
            opacity:      1,
        });
    }

    update(dt, w, h) {
        super.update(dt, w, h);
        this._nebula.speed = this.speed;
        this._nebula.update(dt, w, h);
    }

    _draw(ctx, w, h) {
        this._nebula.draw(ctx, w, h);
    }

    updateConfig(cfg) {
        super.updateConfig(cfg);
        if (cfg.color          !== undefined) this._nebula.colors       = [cfg.color];
        if (cfg.scroll_speed_x !== undefined) this._nebula.scrollSpeedX = cfg.scroll_speed_x;
        if (cfg.scroll_speed_y !== undefined) this._nebula.scrollSpeedY = cfg.scroll_speed_y;
    }
}
