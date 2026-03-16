# Actions

LCARdS cards support actions `tap_action`, `hold_action`, and `double_tap_action`. These follow the standard Home Assistant action model.

---

## Action Object Options

| Field | Type | Description |
|-------|------|-------------|
| `action` | string | Action type — see table below (required) |
| `entity` | string | Override entity for `toggle` / `more-info` (defaults to the card's `entity`) |
| `service` | string | Service to call, e.g. `light.turn_on` (alias: `perform_action`) |
| `service_data` | object | Data passed to the service (alias: `data`) |
| `target` | object | HA service target — `entity_id`, `device_id`, or `area_id` |
| `navigation_path` | string | Dashboard path for `navigate` action, must start with `/` |
| `url_path` | string | URL to open for `url` action |

---

## Action Types

| `action` value | Description |
|---------------|-------------|
| `toggle` | Toggle the card's entity on/off |
| `more-info` | Open the HA more-info dialog for the entity |
| `call-service` | Call a HA service (use `service` + `service_data`) |
| `perform-action` | Alias for `call-service` (HA 2024+ naming) |
| `navigate` | Navigate to a dashboard path |
| `url` | Open a URL |
| `assist` | Open the HA Assist dialog |
| `none` | Do nothing — suppresses the default action |

---

## Double-Tap Disambiguation

When `double_tap_action` is configured, a 300 ms window is used to distinguish a single tap from a double tap. If the second tap arrives within 300 ms, the double-tap action fires instead of the single-tap action.
