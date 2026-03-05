/**
 * @fileoverview CanvasTextureRenderer - Canvas2D overlay manager for shape textures
 *
 * Manages a <canvas> element absolutely positioned over a button/elbow shape.
 * Uses Canvas2DRenderer for the RAF loop and BaseTextureEffect subclasses for
 * per-preset rendering.  Replaces the SVG/SMIL ShapeTextureRenderer.
 *
 * @module core/packs/textures/CanvasTextureRenderer
 */

import { Canvas2DRenderer } from '../backgrounds/renderers/Canvas2DRenderer.js';
import { CANVAS_TEXTURE_PRESETS } from './presets/index.js';
import { lcardsLog } from '../../../utils/lcards-logging.js';

/**
 * CanvasTextureRenderer
 *
 * Lifecycle:
 *   new CanvasTextureRenderer(hostEl, config, instanceId)
 *   renderer.init(width, height, shapePath, border)  — creates canvas, starts RAF
 *   renderer.update(config)                          — hot-update effect props
 *   renderer.resize(width, height, shapePath, border)— resize + re-clip
 *   renderer.destroy()                              — stops RAF, removes canvas
 */
export class CanvasTextureRenderer {
    /**
     * @param {HTMLElement} hostEl     - Container element (position:relative) to append canvas into
     * @param {Object}      config     - shape_texture config object from card config
     * @param {string}      instanceId - Stable short ID (for debug logging)
     */
    constructor(hostEl, config, instanceId) {
        this._hostEl     = hostEl;
        this._config     = config;
        this._id         = instanceId;
        this._canvas     = null;
        this._renderer   = null;
        this._effect     = null;
        this._clipPath   = null;
    }

    /**
     * Create the canvas element, build the clip path, instantiate the effect and start RAF.
     *
     * @param {number}      width     - Canvas width in pixels
     * @param {number}      height    - Canvas height in pixels
     * @param {string|null} shapePath - SVG path d= string for clip, or null for full rect
     * @param {Object|null} border    - Border config { topLeft, topRight, … } for rounded rect clip
     */
    init(width, height, shapePath, border) {
        if (this._canvas) {
            lcardsLog.warn(`[CanvasTextureRenderer:${this._id}] init() called but canvas already exists — use resize() instead`);
            return;
        }

        const preset = this._config?.preset;
        const presetDef = CANVAS_TEXTURE_PRESETS[preset];
        if (!presetDef) {
            lcardsLog.warn(`[CanvasTextureRenderer:${this._id}] Unknown preset '${preset}', skipping init`);
            return;
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width  = Math.max(1, Math.round(width));
        canvas.height = Math.max(1, Math.round(height));
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';

        const blendMode = this._config?.mix_blend_mode || 'normal';
        canvas.style.mixBlendMode = blendMode;

        this._hostEl.appendChild(canvas);
        this._canvas = canvas;

        // Build clip path
        this._clipPath = _buildClipPath(shapePath, border, width, height);

        // Merge preset defaults with user config
        const resolvedConfig = {
            ...presetDef.defaults,
            ...(this._config?.config || {}),
            opacity:   this._config?.opacity  ?? 1,
            _clipPath: this._clipPath,
        };

        // Instantiate effect
        this._effect = new presetDef.effectClass(resolvedConfig);

        // Set up Canvas2DRenderer
        this._renderer = new Canvas2DRenderer(canvas);
        this._renderer.addEffect(this._effect);
        this._renderer.start();

        lcardsLog.debug(`[CanvasTextureRenderer:${this._id}] Initialized`, { preset, width, height });
    }

    /**
     * Hot-update effect properties without teardown/restart.
     * Call this after config changes (e.g. fill_pct driven by entity state).
     *
     * @param {Object} newConfig - Full or partial shape_texture config
     */
    update(newConfig) {
        if (!this._effect) return;

        this._config = newConfig;

        const mergedConfig = {
            ...(newConfig?.config || {}),
            opacity:   newConfig?.opacity ?? 1,
            _clipPath: this._clipPath,
        };

        const blendMode = newConfig?.mix_blend_mode || 'normal';
        if (this._canvas) {
            this._canvas.style.mixBlendMode = blendMode;
        }

        if (typeof this._effect.updateConfig === 'function') {
            this._effect.updateConfig(mergedConfig);
        }
    }

    /**
     * Resize the canvas and rebuild the clip path.
     * Called when the card container dimensions change.
     *
     * @param {number}      width
     * @param {number}      height
     * @param {string|null} shapePath
     * @param {Object|null} border
     */
    resize(width, height, shapePath, border) {
        if (!this._canvas) return;

        this._renderer.resize(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));

        this._clipPath = _buildClipPath(shapePath, border, width, height);
        if (this._effect) {
            if (typeof this._effect.updateConfig === 'function') {
                this._effect.updateConfig({ _clipPath: this._clipPath });
            } else {
                this._effect._clipPath = this._clipPath;
            }
        }
    }

    /**
     * Stop RAF and remove the canvas from the DOM.
     */
    destroy() {
        if (this._renderer) {
            this._renderer.destroy();
            this._renderer = null;
        }
        if (this._canvas && this._canvas.parentNode) {
            this._canvas.parentNode.removeChild(this._canvas);
        }
        this._canvas   = null;
        this._effect   = null;
        this._clipPath = null;
        lcardsLog.debug(`[CanvasTextureRenderer:${this._id}] Destroyed`);
    }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Build a Path2D for clipping the canvas to the shape boundary.
 *
 * @param {string|null} shapePath - SVG path d= string, or null for rect/rounded-rect
 * @param {Object|null} border    - Border radii config
 * @param {number}      w
 * @param {number}      h
 * @returns {Path2D}
 */
function _buildClipPath(shapePath, border, w, h) {
    if (shapePath) {
        return new Path2D(shapePath);
    }

    // Rounded rect
    const r = _computeClipRadius(border);
    const p = new Path2D();
    if (r > 0) {
        p.roundRect(0, 0, w, h, r);
    } else {
        p.rect(0, 0, w, h);
    }
    return p;
}

/**
 * Compute a conservative clip radius from border config.
 * @param {Object|null|undefined} border
 * @returns {number}
 */
function _computeClipRadius(border) {
    if (!border) return 0;
    const hasCorners =
        border.topLeft    !== undefined ||
        border.topRight   !== undefined ||
        border.bottomRight !== undefined ||
        border.bottomLeft  !== undefined;
    if (hasCorners) {
        return Math.min(
            Number(border.topLeft     ?? 0),
            Number(border.topRight    ?? 0),
            Number(border.bottomRight ?? 0),
            Number(border.bottomLeft  ?? 0)
        );
    }
    return Number(border.radius ?? 0);
}
