/**
 * @fileoverview PlasmaTextureEffect - Dual-nebula plasma texture
 *
 * Composites two NebulaEffect instances using 'screen' blend mode to create a
 * vivid plasma effect inside the shape boundary.
 *
 * @module core/packs/textures/effects/PlasmaTextureEffect
 */

import { NebulaEffect } from '../../backgrounds/effects/NebulaEffect.js';
import { BaseTextureEffect } from './BaseTextureEffect.js';

/**
 * PlasmaTextureEffect - Two-colour plasma blobs composited via screen blending
 *
 * @extends BaseTextureEffect
 */
export class PlasmaTextureEffect extends BaseTextureEffect {
    /**
     * @param {Object} config
     * @param {string} [config.color_a='rgba(80,0,255,0.9)']   - First cloud colour
     * @param {string} [config.color_b='rgba(255,40,120,0.9)'] - Second cloud colour
     * @param {number} [config.base_frequency=0.012]           - Controls noiseScale
     * @param {number} [config.scroll_speed_x=8]               - Horizontal drift (px/s)
     * @param {number} [config.scroll_speed_y=5]               - Vertical drift (px/s)
     * @param {number} [config.speed=1]                        - Speed multiplier
     */
    constructor(config = {}) {
        super(config);
        const noiseScale = config.base_frequency ? config.base_frequency * 800 : 10;
        this._nebulaA = new NebulaEffect({
            colors:       [config.color_a ?? 'rgba(80,0,255,0.9)'],
            noiseScale,
            cloudCount:   3,
            scrollSpeedX: config.scroll_speed_x ?? 8,
            scrollSpeedY: config.scroll_speed_y ?? 5,
            speed:        config.speed ?? 1,
            opacity:      1,
        });
        this._nebulaB = new NebulaEffect({
            colors:       [config.color_b ?? 'rgba(255,40,120,0.9)'],
            noiseScale,
            cloudCount:   3,
            scrollSpeedX: -(config.scroll_speed_x ?? 8),
            scrollSpeedY: -(config.scroll_speed_y ?? 5),
            speed:        config.speed ?? 1,
            opacity:      1,
        });
    }

    update(dt, w, h) {
        super.update(dt, w, h);
        this._nebulaA.speed = this.speed;
        this._nebulaB.speed = this.speed;
        this._nebulaA.update(dt, w, h);
        this._nebulaB.update(dt, w, h);
    }

    _draw(ctx, w, h) {
        this._nebulaA.draw(ctx, w, h);
        const prev = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = 'screen';
        this._nebulaB.draw(ctx, w, h);
        ctx.globalCompositeOperation = prev;
    }

    updateConfig(cfg) {
        super.updateConfig(cfg);
        if (cfg.color_a        !== undefined) this._nebulaA.colors       = [cfg.color_a];
        if (cfg.color_b        !== undefined) this._nebulaB.colors       = [cfg.color_b];
        if (cfg.scroll_speed_x !== undefined) {
            this._nebulaA.scrollSpeedX =  cfg.scroll_speed_x;
            this._nebulaB.scrollSpeedX = -cfg.scroll_speed_x;
        }
        if (cfg.scroll_speed_y !== undefined) {
            this._nebulaA.scrollSpeedY =  cfg.scroll_speed_y;
            this._nebulaB.scrollSpeedY = -cfg.scroll_speed_y;
        }
    }
}
