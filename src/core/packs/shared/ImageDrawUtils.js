/**
 * @fileoverview ImageDrawUtils — shared Canvas2D drawing math for image effects.
 *
 * Computes source / destination rectangles for `ctx.drawImage()` that mimic the
 * behaviour of CSS `background-size: cover | contain | fill` combined with
 * `background-position` keywords and percentages.
 *
 * Used by both `ImageEffect` (background animation layer) and
 * `ImageTextureEffect` (shape texture layer) to keep the math in one place.
 *
 * @module core/packs/shared/ImageDrawUtils
 */

/**
 * CSS keyword → fractional origin mapping.
 * @type {Object.<string, number>}
 */
const KEYWORDS = { left: 0, center: 0.5, right: 1, top: 0, bottom: 1 };

/**
 * Compute draw parameters for `ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)`.
 *
 * The returned values always use the full source image (sx=0, sy=0, sw=iw, sh=ih)
 * and a destination rect that places / scales the image according to `size` and
 * `position`.  This matches CSS `background-size` / `background-position` semantics.
 *
 * @param {HTMLImageElement} img        - Fully loaded image element.
 * @param {number}           canvasW    - Canvas (destination) width in px.
 * @param {number}           canvasH    - Canvas (destination) height in px.
 * @param {string}           [size='cover']     - 'cover' | 'contain' | 'fill' | '<n>px'
 * @param {string}           [position='center'] - CSS background-position style string,
 *   e.g. 'center', 'top left', '50% 20%', 'right bottom'.
 * @returns {{ sx: number, sy: number, sw: number, sh: number,
 *             dx: number, dy: number, dw: number, dh: number }}
 */
export const ImageDrawUtils = {
    computeDrawParams(img, canvasW, canvasH, size = 'cover', position = 'center') {
        // naturalWidth/naturalHeight are 0 for SVG elements that lack explicit width/height
        // attributes (common output from Inkscape, Figma, etc.).  Fall back to the canvas
        // dimensions so the image still fills the available area instead of drawing nothing.
        let iw = img.naturalWidth  || img.width  || canvasW;
        let ih = img.naturalHeight || img.height || canvasH;

        let dw, dh;

        if (size === 'cover') {
            const scale = Math.max(canvasW / iw, canvasH / ih);
            dw = iw * scale;
            dh = ih * scale;
        } else if (size === 'contain') {
            const scale = Math.min(canvasW / iw, canvasH / ih);
            dw = iw * scale;
            dh = ih * scale;
        } else if (size === 'fill') {
            dw = canvasW;
            dh = canvasH;
        } else {
            // Treat as a pixel width — e.g. size: '200px'
            const px = parseFloat(size);
            if (!isNaN(px) && px > 0) {
                const scale = px / iw;
                dw = px;
                dh = ih * scale;
            } else {
                // Fallback: cover
                const scale = Math.max(canvasW / iw, canvasH / ih);
                dw = iw * scale;
                dh = ih * scale;
            }
        }

        const [dx, dy] = ImageDrawUtils._resolvePosition(position, canvasW, canvasH, dw, dh);

        return { sx: 0, sy: 0, sw: iw, sh: ih, dx, dy, dw, dh };
    },

    /**
     * Resolve a CSS background-position string to pixel offsets.
     *
     * @param {string} position
     * @param {number} cw - Canvas width
     * @param {number} ch - Canvas height
     * @param {number} dw - Drawn image width
     * @param {number} dh - Drawn image height
     * @returns {[number, number]} [x, y] pixel offsets
     */
    _resolvePosition(position, cw, ch, dw, dh) {
        const parts = String(position ?? 'center').trim().split(/\s+/);
        const p0 = parts[0] ?? 'center';
        const p1 = parts[1] ?? 'center';

        const resolveOne = (val, containerSize, drawSize) => {
            const lval = val.toLowerCase();
            if (lval in KEYWORDS) return KEYWORDS[lval] * (containerSize - drawSize);
            if (val.endsWith('%'))  return (parseFloat(val) / 100) * (containerSize - drawSize);
            const px = parseFloat(val);
            return isNaN(px) ? 0 : px;
        };

        return [
            resolveOne(p0, cw, dw),
            resolveOne(p1, ch, dh),
        ];
    },
};
