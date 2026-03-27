# Integration Service

> **`window.lcards.core.integrationService`** — Backend availability probe, capability flag, and storage convenience API.

---

## Overview

`IntegrationService` probes the LCARdS HA backend on startup to determine whether the Python integration is installed and active. All other services and cards that want to call backend WebSocket APIs check `integrationService.available` before doing so, allowing LCARdS to degrade gracefully when the integration is absent (e.g. legacy plugin-only setups or development without HA).

It also exposes three convenience methods — `readStorage()`, `writeStorage()`, and `deleteStorage()` — so services and cards can access the backend persistent store without reimplementing the guard-and-call pattern.

---

## File

`src/core/services/IntegrationService.js`

---

## Responsibilities

- Send the `lcards/info` WebSocket command on the first HASS update that has a live connection
- Set `this.available = true/false` based on whether the integration responds
- Surface `this.version`, `this.storageKeyCount`, and `this.options` for diagnostics
- Probe exactly once per page load — subsequent HASS updates are ignored
- Provide `readStorage()` / `writeStorage()` / `deleteStorage()` with built-in availability guards

---

## Lifecycle

The probe fires via `updateHass()`, which is called by the core on every HASS push. The service guards against re-probing with an internal `_probed` flag:

```
HA page loads → HASS first pushed to core
    → IntegrationService.updateHass(hass)
        → hass.connection available?  no → wait for next push
                                      yes → send lcards/info (once)
                                            success → available = true, version, storageKeyCount, options
                                            error   → available = false (degraded mode)
```

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `available` | `boolean` | `true` if the HA integration responded to `lcards/info`. Default `false`. |
| `version` | `string \| null` | Version string reported by the integration (`DOMAIN_VERSION` from `const.py`), or `null`. |
| `storageKeyCount` | `number \| null` | Number of keys currently in backend storage, or `null` if unavailable. |
| `options` | `Object \| null` | Snapshot of the integration's configured options (`show_panel`, `sidebar_title`, `sidebar_icon`, `log_level`), or `null`. |

---

## Backend Storage Convenience API

These three methods wrap the `lcards/storage/*` WebSocket commands with availability guards. They return sensible fallback values when the integration is unavailable rather than throwing.

### `readStorage(key) → Promise<any>`

Returns the stored value for `key`, or `undefined` on miss, unavailable backend, or error.

```javascript
const integration = window.lcards.core.integrationService;
const prefs = await integration.readStorage('my_service_prefs');
// prefs === undefined if key not set or integration not available
```

### `writeStorage(updates) → Promise<boolean>`

Shallow-merges `updates` (a plain `{ key: value }` object) into the store. Returns `true` on success, `false` on error or unavailable backend.

```javascript
const ok = await integration.writeStorage({ my_service_prefs: { theme: 'dark' } });
```

### `deleteStorage(key) → Promise<boolean>`

Removes a single key from the store. Returns `true` on success, `false` on error or unavailable.

```javascript
await integration.deleteStorage('my_service_prefs');
```

### `resetStorage() → Promise<boolean>`

Wipes the **entire** store — all keys removed, saved to disk. Irreversible. Returns `true` on success.

After calling this, services must invalidate their in-memory caches or they will re-write stale data on the next save operation.

```javascript
await integration.resetStorage();
// Caller is responsible for clearing service caches, e.g.:
// soundManager._overridesCache = {};
```

### Usage pattern

```javascript
const integration = window.lcards.core.integrationService;

if (integration.available) {
    // Reads / writes go to the persistent HA .storage/lcards file
    const value = await integration.readStorage('sound_overrides');
} else {
    // Fall back to localStorage or no-op
    const value = JSON.parse(localStorage.getItem('lcards_sound_overrides') ?? '{}');
}
```

---

## Degraded Mode

When `available === false` (integration not installed, or removed):

- All three storage helpers return `undefined` / `false` silently — no throws
- Services must fall back to `localStorage` or no-op behaviour
- Cards continue to work fully — JS injection is independent of the integration probe
- `window.lcards.info()` reports `integration: { available: false, version: null }`

---

## WebSocket Endpoint

The probe hits the `lcards/info` command. The expanded response (since Phase 2C) includes storage diagnostics and the options snapshot:

```python
# custom_components/lcards/websocket_api.py — ws_lcards_info response
{
    "available":         True,
    "version":           "2026.3.25",
    "storage_key_count": 3,          # number of keys in .storage/lcards
    "options": {                     # from the config entry (None if not configured)
        "show_panel":    True,
        "sidebar_title": "LCARdS Config",
        "sidebar_icon":  "mdi:space-invaders",
        "log_level":     "warn",
    },
}
```

→ See [HA Integration Architecture](../ha-integration) for the full Python-side reference.
→ See [Backend WS API](../../development/backend-api) for the full storage command reference.
