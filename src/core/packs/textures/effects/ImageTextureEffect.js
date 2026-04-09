/**
 * @fileoverview ImageTextureEffect — renders a user-supplied image clipped to the card shape.
 *
 * Integrates into the Shape Texture system as a standard texture effect.
 * The image is drawn inside the `<foreignObject>` canvas that sits inside the card SVG,
 * clipped to the card's shape geometry (button, elbow, etc.) via a Path2D clip path.
 *
 * Extends BaseTextureEffect, which already handles ctx.save()/restore(), ctx.clip(),
 * and ctx.globalAlpha before calling _draw().  Subclasses implement _draw(), not draw().
 *
 * @module core/packs/textures/effects/ImageTextureEffect
 */

import { BaseTextureEffect } from './BaseTextureEffect.js';
import { loadImage }         from '../../shared/ImageLoader.js';
import { ImageDrawUtils }    from '../../shared/ImageDrawUtils.js';
import { lcardsLog }         from '../../../../utils/lcards-logging.js';

/**
 * Draws a user-supplied image clipped to the card shape geometry.
 *
 * mix_blend_mode is applied by CanvasTextureRenderer as a CSS property on the canvas
 * element — this works for image textures for free, no special handling required.
 *
 * @extends BaseTextureEffect
 */
export class ImageTextureEffect extends BaseTextureEffect {
    /**
     * @param {Object}     config
     * @param {string}     [config.url='']           - Absolute URL or /local/ path to the image.
     * @param {string}     [config.size='cover']      - 'cover' | 'contain' | 'fill' | '<n>px'
     * @param {string}     [config.position='center'] - CSS background-position style string.
     * @param {boolean}    [config.repeat=false]      - If true, tile the image inside the shape.
     * @param {number}     [config.opacity=1]         - Passed to BaseTextureEffect for globalAlpha.
     * @param {Path2D|null}[config._clipPath]         - Managed by CanvasTextureRenderer.
     */
    constructor(config = {}) {
        super(config); // handles opacity, speed, _clipPath

        this._url      = config.url      ?? '';
        this._size     = config.size     ?? 'cover';
        this._position = config.position ?? 'center';
        this._repeat   = config.repeat   ?? false;

        /** @type {HTMLImageElement|null} */
        this._img       = null;
        this._loadError = false;

        if (this._url) this._load();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    _load() {
        this._img       = null;
        this._loadError = false;
        loadImage(this._url)
            .then(img => { this._img = img; })
            .catch(err => {
                this._loadError = true;
                lcardsLog.warn('[ImageTextureEffect]', err.message);
            });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BaseTextureEffect contract
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Hot-update config properties without destroying the effect.
     * Calls super.updateConfig() first so BaseTextureEffect handles opacity,
     * speed, and _clipPath (the clip path is pushed here by CanvasTextureRenderer
     * on every resize).
     *
     * @param {Object} cfg - Partial config to apply.
     */
    updateConfig(cfg) {
        super.updateConfig(cfg); // handles opacity, speed, _clipPath

        const newUrl = cfg.url ?? '';
        if (cfg.url !== undefined && newUrl !== this._url) {
            this._url = newUrl;
            if (this._url) {
                this._load();
            } else {
                this._img       = null;
                this._loadError = false;
            }
        }

        if (cfg.size     !== undefined) this._size     = cfg.size;
        if (cfg.position !== undefined) this._position = cfg.position;
        if (cfg.repeat   !== undefined) this._repeat   = cfg.repeat;
    }

    /**
     * Draw the image.  Called by BaseTextureEffect.draw() after ctx.save(),
     * ctx.clip(_clipPath), and ctx.globalAlpha have already been applied.
     *
     * @param {CanvasRenderingContext2D} ctx - Already clipped and alpha-set by base class.
     * @param {number} w
     * @param {number} h
     */
    _draw(ctx, w, h) {
        if (!this._img || this._loadError) return;

        if (this._repeat) {
            const pattern = ctx.createPattern(this._img, 'repeat');
            if (pattern) {
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, w, h);
            }
        } else {
            const { sx, sy, sw, sh, dx, dy, dw, dh } =
                ImageDrawUtils.computeDrawParams(this._img, w, h, this._size, this._position);
            ctx.drawImage(this._img, sx, sy, sw, sh, dx, dy, dw, dh);
        }
    }
}
