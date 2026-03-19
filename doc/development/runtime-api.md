# Runtime API Reference

All methods are accessed via `window.lcards.msd`. Every method accepts an optional `cardId` parameter to target a specific card in multi-card dashboards; if omitted, the first MSD card is used.

```javascript
// Quick overview
window.lcards.msd.getInstance()
window.lcards.msd.getState()
window.lcards.msd.getConfig()
window.lcards.msd.validate()
window.lcards.msd.overlays.list()
window.lcards.msd.theme.list()
window.lcards.msd.theme.getCurrent()
window.lcards.msd.theme.apply('lcars-ds9')
window.lcards.msd.animate('cpu_status', 'pulse')
window.lcards.msd.stopAnimation('cpu_status')
```

---

## Instance Management

### `getInstance(cardId?)`

Returns the card's pipeline instance, or `null` if not found.

```javascript
const pipeline = window.lcards.msd.getInstance();         // first card
const pipeline = window.lcards.msd.getInstance('bridge'); // specific card
```

### `getCurrentInstance()`

Shorthand for `getInstance()` — returns current pipeline or `null`.

### `getAllInstances()`

Returns an array of all active MSD pipeline instances on the page.

---

## State & Configuration

### `getState(cardId?)`

Returns a high-level summary of the current card state:

```javascript
{
  overlays: number,    // Total overlay count
  anchors: number,     // Available anchor count
  hasDebug: boolean,   // Whether debug mode is active
  hasBaseSvg: boolean  // Whether a base SVG is loaded
}
```

### `getConfig(cardId?)`

Returns the full resolved model (`getResolvedModel()` result) with all overlays, anchors, viewBox, and merged configuration, or `null` if unavailable.

```javascript
const model = window.lcards.msd.getConfig();
model.overlays.forEach(ov => console.log(ov.id, ov.type));
```

### `validate(cardId?)`

Returns pipeline validation results:

```javascript
{
  success: boolean,
  summary: { errors: number, warnings: number },
  overlays: Array,   // Per-overlay validation results
  message: string
}
// On error: { success: false, error: { code, message } }
```

---

## Overlay Operations

### `overlays.list(cardId?)`

Returns all overlays as a simplified array:

```javascript
[{ id: string, type: string, position: [x, y], size: [w, h] }]
```

```javascript
const overlays = window.lcards.msd.overlays.list();
const lines = overlays.filter(o => o.type === 'line');
```

---

## Theme Management

### `theme.list()`

Returns all registered theme objects (id, name, description, packId).

### `theme.getCurrent(cardId?)`

Returns the active theme object from ThemeManager, or `null`.

### `theme.apply(themeName)` / `theme.apply(cardId, themeName)`

Activates a theme by ID. Returns `true` on success, `false` if theme not found.

```javascript
window.lcards.msd.theme.apply('lcars-ds9');
// Logs available themes if not found
```

---

## Animation Control

These methods delegate to `AnimationManager` on the card instance.

### `animate(overlayId, preset, params?)`

Plays an animation preset on an overlay.

```javascript
window.lcards.msd.animate('cpu_status', 'pulse');
window.lcards.msd.animate('cpu_status', 'pulse', { duration: 500 });
// Returns: { success: true, overlayId, preset } | { error, message }
```

### `stopAnimation(overlayId)`

Stops all animations on the specified overlay.

### `pauseAnimation(overlayId)`

Pauses animations on the specified overlay.

### `resumeAnimation(overlayId)`

Resumes paused animations on the specified overlay.

```javascript
// All return: { success: true, overlayId } | { error, message }
```

---

## Error Handling

All methods follow these conventions:
- **No exceptions thrown** — errors are logged and graceful values returned
- **`null` / empty array / `false`** on unavailable instance
- **Structured error objects** for animation methods: `{ error: 'CODE', message: '...' }`

---

## See Also

- [Debug API](debug-api.md)
- [Animation Manager](../architecture/subsystems/animation-manager.md)
- [Theme System](../architecture/subsystems/theme-system.md)
