/**
 * @fileoverview ImageLoader — singleton image cache for background and texture effects.
 *
 * Caches HTMLImageElement instances by URL so the same image is only fetched once per
 * page load regardless of how many cards reference it.  Both `ImageEffect` (background
 * animation layer) and `ImageTextureEffect` (shape texture layer) import from here.
 *
 * CORS note: `crossOrigin = 'anonymous'` is required so Canvas2D `drawImage()` does not
 * taint the canvas when drawing images served from HA's /local/ static file server.
 * External HTTPS images from CORS-enabled CDNs will also work transparently.
 *
 * HTTP warning: plain http:// URLs will be blocked by the browser as mixed content when
 * HA is served over HTTPS.  A warning is logged at load time to surface this early.
 *
 * @module core/packs/shared/ImageLoader
 */

import { lcardsLog } from '../../../utils/lcards-logging.js';

/** @type {Map<string, Promise<HTMLImageElement>>} */
const _cache = new Map();

/**
 * Load (or retrieve from cache) an image by URL.
 *
 * @param {string} url - Absolute URL or /local/ path to the image.
 * @returns {Promise<HTMLImageElement>} Resolves with the loaded image element.
 *   Rejects on network or CORS error — callers should handle gracefully.
 */
export function loadImage(url) {
    if (!url) return Promise.reject(new Error('[ImageLoader] Empty URL'));

    // Warn about mixed-content risk early (before the browser silently blocks it)
    if (url.startsWith('http:') && typeof location !== 'undefined' && location.protocol === 'https:') {
        lcardsLog.warn(
            `[ImageLoader] http:// URL may be blocked as mixed content on HTTPS: "${url}". ` +
            'Use an https:// URL or a /local/ path instead.'
        );
    }

    if (_cache.has(url)) return _cache.get(url);

    const p = new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // required for canvas drawImage — avoids tainted-canvas errors
        img.onload  = () => resolve(img);
        img.onerror = () => reject(new Error(`[ImageLoader] Failed to load: "${url}"`));
        img.src = url;
    });

    _cache.set(url, p);
    return p;
}

/**
 * Remove a URL from the cache.  Subsequent calls to `loadImage(url)` will re-fetch.
 * Useful after a dynamic image at a stable URL has been updated on disk.
 *
 * @param {string} url
 */
export function evictImage(url) {
    _cache.delete(url);
}
