# Integration Service

> **`window.lcards.core.integrationService`** — Backend availability probe and capability flag.

---

## Overview

`IntegrationService` probes the LCARdS HA backend on startup to determine whether the Python integration is installed and active. All other services and cards that want to call backend WebSocket APIs check `integrationService.available` before doing so, allowing LCARdS to degrade gracefully when the integration is absent (e.g. legacy plugin-only setups or development without HA).

---

## File

`src/core/services/IntegrationService.js`

---

## Responsibilities

- Send the `lcards/info` WebSocket command on the first HASS update that has a live connection
- Set `this.available = true/false` based on whether the integration responds
- Surface `this.version` for diagnostics and `window.lcards.info()`
- Probe exactly once per page load — subsequent HASS updates are ignored

---

## Lifecycle

The probe fires via `updateHass()`, which is called by the core on every HASS push. The service guards against re-probing with an internal `_probed` flag:

```
HA page loads → HASS first pushed to core
    → IntegrationService.updateHass(hass)
        → hass.connection available?  no → wait for next push
                                      yes → send lcards/info (once)
                                            success → available = true, version = "..."
                                            error   → available = false (degraded mode)
```

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `available` | `boolean` | `true` if the HA integration responded to `lcards/info`. Default `false`. |
| `version` | `string \| null` | Version string reported by the integration (`DOMAIN_VERSION` from `const.py`), or `null` if unavailable. |

---

## Usage Pattern

Any service or card that wants to use backend APIs should guard with `available`:

```javascript
const integration = window.lcards.core.integrationService;

if (integration.available) {
    // Safe to call lcards/* WebSocket commands
    const result = await hass.connection.sendMessagePromise({
        type: 'lcards/set_theme',
        theme: 'lcars-dark',
    });
} else {
    // Fall back to localStorage or no-op
    localStorage.setItem('lcards_theme', 'lcars-dark');
}
```

---

## Degraded Mode

When `available === false` (integration not installed, or removed):

- All `lcards/*` WebSocket commands will fail — services must handle this gracefully
- Phase 2 features (theme persistence, Store API) fall back to localStorage
- Cards continue to work fully — JS injection is independent of the integration probe
- `window.lcards.info()` reports `integration: { available: false, version: null }`

This supports the transition period where some users may still be on the legacy HACS Frontend Plugin path.

---

## WebSocket Endpoint

The probe hits the `lcards/info` command registered by the Python integration:

```python
# custom_components/lcards/websocket_api.py
@websocket_api.websocket_command({vol.Required("type"): "lcards/info"})
@callback
def ws_lcards_info(hass, connection, msg):
    connection.send_result(msg["id"], {
        "available": True,
        "version": DOMAIN_VERSION,
        "domain": DOMAIN,
    })
```

→ See [HA Integration Architecture](../ha-integration) for the full Python-side reference.
