# Asset Manager

> **`window.lcards.core.assetManager`** — SVG and font asset loading and caching.

---

## Overview

`AssetManager` loads external SVG and font assets from pack definitions, caches them in memory, and serves them to cards on request. It ensures that the same asset URL is never fetched twice within a session.

---

## File

`src/core/assets/AssetManager.js`

---

## Asset Types

| Type | Pack key | Description |
|---|---|---|
| SVG | `svg_assets` | SVG markup strings; used as card backgrounds, MSD base SVGs, component shapes |
| Font | `font_assets` | Webfont declarations loaded at startup |

---

## Pack Registration

Assets are registered by `PackManager` during startup:

```javascript
// Inside a pack definition:
export const MY_PACK = {
  svg_assets: {
    'enterprise_schematic': { url: '/local/lcards/assets/enterprise.svg' },
    'bridge_layout':        { url: '/local/lcards/assets/bridge.svg' },
  },
  font_assets: {
    'okuda': { url: '/local/lcards/fonts/okuda.woff2', family: 'Okuda' },
  }
};
```

---

## Card Usage

```javascript
const assetManager = window.lcards.core.assetManager;

// Returns promise resolving to SVG string (cached after first load)
const svg = await assetManager.loadSvg('enterprise_schematic');

// Check if already cached
if (assetManager.hasSvg('bridge_layout')) { ... }

// All registered SVG keys
const keys = assetManager.getSvgKeys();
```

---

## Caching

Assets are cached by key in a `Map`. The cache persists for the browser session. There is no expiry or invalidation — a page reload clears it.

---

## See Also

- [Pack System](pack-system.md)
- [Component Manager](component-manager.md)
