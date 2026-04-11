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
 * Resolve a `builtin:<key>` URL via AssetManager, if available.
 * Returns the resolved URL string, or null if the key is not registered.
 *
 * @param {string} key - Asset key (without 'builtin:' prefix).
 * @returns {string|null}
 */
function _resolveBuiltin(key) {
    try {
        return window?.lcards?.core?.assetManager?.resolveImageUrl?.(key) ?? null;
    } catch (_) {
        return null;
    }
}

/**
 * Load (or retrieve from cache) an image by URL.
 *
 * Accepts:
 * - `/local/` paths  — HA static file server
 * - `https://` URLs  — external CORS-enabled sources
 * - `builtin:<key>`  — named entries from the AssetManager image registry
 * - Any other browser-loadable URL
 *
 * @param {string} url - Image source: URL, /local/ path, or builtin:key reference.
 * @returns {Promise<HTMLImageElement>} Resolves with the loaded image element.
 *   Rejects on network or CORS error — callers should handle gracefully.
 */
export function loadImage(url) {
    if (!url) return Promise.reject(new Error('[ImageLoader] Empty URL'));

    // Resolve builtin:key references via AssetManager image registry
    if (url.startsWith('builtin:')) {
        const key = url.slice('builtin:'.length);
        const resolved = _resolveBuiltin(key);
        if (!resolved) {
            return Promise.reject(
                new Error(`[ImageLoader] builtin image not found: "${key}". Register it via assetManager or lcards-images-pack.`)
            );
        }
        lcardsLog.debug(`[ImageLoader] Resolved builtin:${key} → ${resolved}`);
        url = resolved; // fall through to normal load with resolved URL
    }

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
