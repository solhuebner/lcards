/**
 * @fileoverview BaseTextureEffect - Base class for canvas shape texture effects
 *
 * Extends BaseEffect to add per-frame clipping via a Path2D and opacity control.
 * All texture effects should extend this class.
 *
 * @module core/packs/textures/effects/BaseTextureEffect
 */

import { BaseEffect } from '../../backgrounds/effects/BaseEffect.js';

/**
 * BaseTextureEffect - Base class for all canvas texture effects
 *
 * Wraps draw() with ctx.save()/ctx.restore() and applies clip path + globalAlpha.
 * Subclasses override _draw() instead of draw().
 *
 * @extends BaseEffect
 */
export class BaseTextureEffect extends BaseEffect {
    /**
     * @param {Object} config
     * @param {Path2D|null} [config._clipPath] - Path2D to clip to, or null for no clip
     * @param {number}      [config.opacity=1] - Effect opacity (0–1)
     */
    constructor(config = {}) {
        super(config);
        this._clipPath = config._clipPath ?? null;
        this.opacity   = config.opacity ?? 1;
    }

    /**
     * Draw effect, clipped to _clipPath with globalAlpha applied.
     * Calls _draw() which subclasses implement.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} w
     * @param {number} h
     */
    draw(ctx, w, h) {
        ctx.save();
        if (this._clipPath) ctx.clip(this._clipPath);
        ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity));
        this._draw(ctx, w, h);
        ctx.restore();
    }

    /**
     * Override in subclasses. ctx is already clipped and globalAlpha is set.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} w
     * @param {number} h
     */
    _draw(ctx, w, h) {}

    /**
     * Hot-update config properties without teardown.
     * @param {Object} cfg - Partial config to apply
     */
    updateConfig(cfg) {
        if (cfg.opacity   !== undefined) this.opacity   = cfg.opacity;
        if (cfg.speed     !== undefined) this.speed     = cfg.speed;
        if (cfg._clipPath !== undefined) this._clipPath = cfg._clipPath;
    }
}
