/**
 * @fileoverview FluidTextureEffect - Canvas fluid noise-field texture
 *
 * Renders a continuously scrolling fBm (fractional Brownian motion) Perlin-style
 * value-noise field inside the shape boundary.  Each frame the noise offset
 * advances, producing a seamlessly morphing colour-wash — similar to the old
 * SVG feTurbulence/feColorMatrix look, without any dependency on NebulaEffect.
 *
 * @module core/packs/textures/effects/FluidTextureEffect
 */

import { BaseTextureEffect } from './BaseTextureEffect.js';

// ---------------------------------------------------------------------------
// Inline value-noise helpers (hash-based, no look-up table required)
// ---------------------------------------------------------------------------

/** Pseudo-random hash in [−1, 1] for integer lattice point (ix, iy). */
function _hash(ix, iy) {
    return (Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453) % 1 * 2;
}

/** Smooth value-noise at continuous (x, y) via bilinear interpolation. */
function _smoothNoise(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    // Smoothstep fade
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a  = _hash(ix,     iy);
    const b  = _hash(ix + 1, iy);
    const c  = _hash(ix,     iy + 1);
    const d  = _hash(ix + 1, iy + 1);
    return a + (b - a) * ux + (c - a) * uy + (a + d - b - c) * ux * uy;
}

/** fBm: sum of `octaves` octaves of smoothNoise, output in [−1, 1]. */
function _fbm(x, y, octaves) {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1;
    for (let i = 0; i < octaves; i++) {
        value     += amplitude * _smoothNoise(x * frequency, y * frequency);
        amplitude *= 0.5;
        frequency *= 2;
    }
    return value;
}

/** Parse an rgba/rgb string into {r, g, b, a} (a in 0–1). */
function _parseRgba(str) {
    const m = str.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
    if (!m) return { r: 100, g: 180, b: 255, a: 0.8 };
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
}

// ---------------------------------------------------------------------------

const CELL = 4; // px — grid tile size (performance vs quality trade-off)

/**
 * FluidTextureEffect - Perlin fBm noise colour-wash
 *
 * @extends BaseTextureEffect
 */
export class FluidTextureEffect extends BaseTextureEffect {
    /**
     * @param {Object} config
     * @param {string} [config.color='rgba(100,180,255,0.8)'] - Fill colour (RGBA)
     * @param {number} [config.base_frequency=0.010]          - Noise frequency (lower = larger features)
     * @param {number} [config.num_octaves=4]                 - fBm octave count
     * @param {number} [config.scroll_speed_x=7]              - Horizontal scroll speed (px/s)
     * @param {number} [config.scroll_speed_y=10]             - Vertical scroll speed (px/s)
     * @param {number} [config.speed=1]                       - Global speed multiplier
     */
    constructor(config = {}) {
        super(config);
        this._color    = _parseRgba(config.color ?? 'rgba(100,180,255,0.8)');
        this._freq     = config.base_frequency   ?? 0.010;
        this._octaves  = config.num_octaves      ?? 4;
        this._speedX   = config.scroll_speed_x   ?? 7;
        this._speedY   = config.scroll_speed_y   ?? 10;
        this._offsetX  = 0;
        this._offsetY  = 0;
    }

    update(dt, w, h) {
        super.update(dt, w, h);
        const s = this.speed;
        this._offsetX += this._speedX * s * dt;
        this._offsetY += this._speedY * s * dt;
    }

    _draw(ctx, w, h) {
        const { r, g, b, a: baseAlpha } = this._color;
        const freq    = this._freq;
        const octaves = this._octaves;
        const ox      = this._offsetX;
        const oy      = this._offsetY;

        for (let y = 0; y < h; y += CELL) {
            for (let x = 0; x < w; x += CELL) {
                const n     = _fbm(x * freq + ox * freq, y * freq + oy * freq, octaves);
                const alpha = ((n + 1) * 0.5) * baseAlpha;
                ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
                ctx.fillRect(x, y, CELL, CELL);
            }
        }
    }

    updateConfig(cfg) {
        super.updateConfig(cfg);
        if (cfg.color          !== undefined) this._color   = _parseRgba(cfg.color);
        if (cfg.base_frequency !== undefined) this._freq    = cfg.base_frequency;
        if (cfg.num_octaves    !== undefined) this._octaves = cfg.num_octaves;
        if (cfg.scroll_speed_x !== undefined) this._speedX  = cfg.scroll_speed_x;
        if (cfg.scroll_speed_y !== undefined) this._speedY  = cfg.scroll_speed_y;
    }
}
