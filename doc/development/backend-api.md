# Backend API

Developer reference for calling LCARdS WebSocket commands from JS card code — cards, services, and the Config Panel.

::: tip Integration availability
Always check `window.lcards.core.integrationService.available` before calling `lcards/*` commands. When the Python integration is absent, commands will reject. Cards should degrade gracefully — see [Degraded mode](#degraded-mode).
:::

---

## Calling Pattern

Use `hass.connection.sendMessagePromise()` inside a card or service. This is the same connection HA uses for all WS communication — no setup required.

```javascript
const integration = window.lcards.core.integrationService;

if (integration.available) {
  const result = await hass.connection.sendMessagePromise({
    type: 'lcards/storage/get',
    key: 'user.preferences',
  });
  // result → { key: 'user.preferences', value: { theme: 'dark' } }
}
```

For one-off calls from the browser console (debugging / testing), use `window.hassConnection` instead — see [browser console testing](../architecture/subsystems/storage#browser-console-testing).

---

## `lcards/info`

Backend availability probe. Normally you do not call this directly — `IntegrationService` probes it once on startup and exposes the result as `integrationService.available`. Useful for diagnostic tooling.

```javascript
const result = await hass.connection.sendMessagePromise({
  type: 'lcards/info',
});
// → { available: true, version: '2026.3.25' }
```

→ See [Integration Service](../architecture/subsystems/integration-service) for the full probe lifecycle.

---

## Storage API

All storage commands are under `lcards/storage/*`. The store is a flat key/value namespace persisted to `.storage/lcards` in the HA config directory — survives HA restarts and HACS upgrades.

→ Full schema reference: [Persistent Storage](../architecture/subsystems/storage).

### `lcards/storage/get`

Read a single key, or the entire `data` dict if `key` is omitted.

```javascript
// Read one key
const { value } = await hass.connection.sendMessagePromise({
  type: 'lcards/storage/get',
  key: 'user.preferences',
});
// value → { theme: 'dark' }  or  null if missing

// Read everything
const { value: allData } = await hass.connection.sendMessagePromise({
  type: 'lcards/storage/get',
});
// value → { 'user.preferences': { theme: 'dark' }, ... }
```

---

### `lcards/storage/set`

Shallow-merge one or many key→value pairs. Existing keys not in `data` are preserved.

```javascript
await hass.connection.sendMessagePromise({
  type: 'lcards/storage/set',
  data: {
    'user.preferences': { theme: 'dark', animations: true },
    'dashboard.layout': { cols: 3 },
  },
});
// → { ok: true, keys: ['user.preferences', 'dashboard.layout'] }
```

::: warning Shallow merge
`set` merges at the top level only — if `user.preferences` already exists, it is **replaced**, not deep-merged. Read first, spread, then write if you need to update one sub-key:
```javascript
const { value: prefs } = await hass.connection.sendMessagePromise({
  type: 'lcards/storage/get', key: 'user.preferences',
});
await hass.connection.sendMessagePromise({
  type: 'lcards/storage/set',
  data: { 'user.preferences': { ...prefs, theme: 'dark' } },
});
```
:::

---

### `lcards/storage/delete`

Remove a single key. Returns `existed: false` if the key was not present — not an error.

```javascript
const { existed } = await hass.connection.sendMessagePromise({
  type: 'lcards/storage/delete',
  key: 'cache.stale',
});
// existed → true | false
```

---

### `lcards/storage/reset`

Wipe the entire store. **Irreversible.** Use only in dev tooling or with explicit user confirmation.

```javascript
await hass.connection.sendMessagePromise({
  type: 'lcards/storage/reset',
});
// → { ok: true }
```

---

### `lcards/storage/dump`

Return full store contents including schema version. Intended for debug panels and dev tooling.

```javascript
const store = await hass.connection.sendMessagePromise({
  type: 'lcards/storage/dump',
});
// → { version: 1, data: { 'user.preferences': { theme: 'dark' } } }
```

---

## Error Handling

All commands reject if the integration is unavailable or the storage instance is not yet initialised. Always wrap calls:

```javascript
try {
  const { value } = await hass.connection.sendMessagePromise({
    type: 'lcards/storage/get',
    key: 'user.preferences',
  });
  return value ?? defaultPreferences;
} catch (err) {
  // err.code === 'storage_unavailable' — integration not ready
  // err.code === 'unknown_command'     — old integration version without storage
  lcardsLog.warn('[MyCard] Storage unavailable, using defaults', err);
  return defaultPreferences;
}
```

---

## Degraded Mode

When `integrationService.available === false` (integration not installed or failed to load):

- All `lcards/*` commands will reject
- Cards must fall back gracefully — use `localStorage` or in-memory defaults for non-critical state
- Core card rendering continues to work — JS injection and integration availability are independent

```javascript
const integration = window.lcards.core.integrationService;

async function loadPreferences() {
  if (integration.available) {
    try {
      const { value } = await hass.connection.sendMessagePromise({
        type: 'lcards/storage/get',
        key: 'user.preferences',
      });
      return value ?? {};
    } catch {
      // fall through
    }
  }
  // Degrade: read from localStorage
  const raw = localStorage.getItem('lcards.user.preferences');
  return raw ? JSON.parse(raw) : {};
}
```

---

## Key Naming Convention

Use dot-separated namespaces to avoid collisions between cards and services:

| Prefix | Intended use |
|---|---|
| `dashboard.*` | Dashboard layout and persistent state |
| `user.*` | User preferences (theme, animation settings, etc.) |
| `panel.*` | Config panel UI state |
| `cache.*` | Transient computed values (safe to reset freely) |
| `card.<type>.*` | Card-specific state (e.g. `card.msd.last_route`) |

---

## Command Summary

| Command | Required params | Optional params | Returns |
|---|---|---|---|
| `lcards/info` | — | — | `{ available, version }` |
| `lcards/storage/get` | — | `key: string` | `{ key, value }` |
| `lcards/storage/set` | `data: object` | — | `{ ok, keys }` |
| `lcards/storage/delete` | `key: string` | — | `{ ok, existed }` |
| `lcards/storage/reset` | — | — | `{ ok }` |
| `lcards/storage/dump` | — | — | `{ version, data }` |
