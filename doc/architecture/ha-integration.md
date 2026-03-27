# HA Integration Architecture

LCARdS ships as a **HACS Integration** (`custom_components/lcards/`). This page covers the Python-side architecture — how the integration boots, what it registers in Home Assistant, and how it hands off to the JavaScript frontend.

---

## Two-Layer Architecture

```mermaid
graph TB
    subgraph HA["Home Assistant"]
        subgraph Integration["custom_components/lcards/ (Python)"]
            Init["__init__.py\nasync_setup / async_setup_entry\nasync_unload_entry"]
            Frontend["frontend.py\nStatic paths + JS injection"]
            ConfigFlow["config_flow.py\nSetup flow + Options flow"]
            WS["websocket_api.py\nlcards/* WS commands"]
            Const["const.py\nDOMAIN, version, option keys"]
        end
        HTTP["HA HTTP server"]
        WSSrv["HA WebSocket server"]
        Lovelace["Lovelace resources"]
        Sidebar["Sidebar panel registry"]
    end

    subgraph Browser["Browser"]
        lcards_js["lcards.js\n(JS frontend bundle)"]
        IntSvc["IntegrationService\nwindow.lcards.core.integrationService"]
        Cards["LCARdS Cards"]
    end

    Init -->|"register static paths"| Frontend
    Init -->|"register WS commands"| WS
    Frontend -->|"StaticPathConfig × 3"| HTTP
    Frontend -->|"add_extra_js_url"| lcards_js
    Frontend -->|"Lovelace resource"| Lovelace
    Init -->|"async_register_built_in_panel"| Sidebar
    WS --> WSSrv

    lcards_js --> IntSvc
    IntSvc -->|"lcards/info WS"| WSSrv
    WSSrv --> WS
    lcards_js --> Cards

    style Integration fill:#1c3c55,stroke:#37a6d1,color:#eee
    style Browser fill:#2f3749,stroke:#52596e,color:#eee
    style HA fill:#1e2229,stroke:#2f3749,color:#eee
    style lcards_js fill:#e7442a,stroke:#ffb399,color:#fff
    style IntSvc fill:#6d748c,stroke:#d2d5df,color:#fff
    style Cards fill:#e7442a,stroke:#ffb399,color:#fff
```

---

## Python Component Files

| File | Responsibility |
|------|---------------|
| `__init__.py` | Entry point — wires up static paths, JS injection, sidebar panel, WS commands, and options update listener |
| `frontend.py` | Registers static HTTP paths and injects `lcards.js` into every HA frontend session |
| `config_flow.py` | Initial setup flow (single-instance, no user input) + options flow (sidebar toggle) |
| `websocket_api.py` | Registers `lcards/info` WebSocket command |
| `const.py` | Shared constants: `DOMAIN`, `DOMAIN_VERSION`, `CONF_SHOW_PANEL`, `DEFAULT_SHOW_PANEL` |
| `manifest.json` | HACS/HA integration manifest — domain, version (HA CalVer), dependencies |
| `strings.json` + `translations/en.json` | UI strings for the config and options dialog |

---

## Boot Sequence

HA calls the integration in two phases:

### Phase 1 — `async_setup()` (HA start, before config entry)

Runs at HA startup before any config entry is loaded. Registers infrastructure that must be available immediately:

1. **Static paths** (via `frontend.py`) — three paths registered:
   - `/lcards/lcards.js` → `custom_components/lcards/lcards.js`
   - `/lcards/lcards.js.map` → `custom_components/lcards/lcards.js.map`
   - `/hacsfiles/lcards/` → `custom_components/lcards/` (alias for asset URLs)
2. **WebSocket commands** — `lcards/info` registered so the JS probe works even before setup

### Phase 2 — `async_setup_entry()` (config entry active)

Runs when the integration is configured (after initial setup or on restart):

1. **JS injection** — `add_extra_js_url` loads `lcards.js` on every HA page
2. **Lovelace resource** — registers the script for Cast / kiosk support
3. **Sidebar panel** — `async_register_built_in_panel` if `show_panel` option is `True`
4. **Options listener** — `entry.add_update_listener()` triggers an entry reload when the user saves new options, applying changes without an HA restart

### Unload — `async_unload_entry()`

Called on HA restart, explicit reload (triggered by options change), or removal:

1. Removes `add_extra_js_url` injection
2. Removes the Lovelace resource
3. Removes the sidebar panel

`async_remove_entry()` is a no-op — `async_unload_entry` handles all cleanup.

---

## Static Paths

Three paths are served from the same `custom_components/lcards/` directory:

| URL path | Serves | Purpose |
|----------|--------|---------|
| `/lcards/lcards.js` | `lcards.js` | Main JS bundle — loaded by `add_extra_js_url` |
| `/lcards/lcards.js.map` | `lcards.js.map` | Source map for browser devtools stack traces |
| `/hacsfiles/lcards/*` | Whole `custom_components/lcards/` dir | Asset alias — all hardcoded font/SVG/sound URLs in the JS bundle reference this prefix |

The `/hacsfiles/lcards/` alias means the JS bundle's asset URLs (`/hacsfiles/lcards/fonts/...`, `/hacsfiles/lcards/msd/...`, `/hacsfiles/lcards/sounds/...`) resolve without any JS changes, regardless of whether HACS itself is installed.

---

## Config & Options Flow

LCARdS enforces a single-instance constraint (`async_set_unique_id(DOMAIN)`). The initial setup form requires no user input — clicking through is sufficient.

After setup, users configure options via **Settings → Integrations → LCARdS → Configure**:

| Option key | `const.py` | Default | Effect |
|------------|------------|---------|--------|
| `show_panel` | `CONF_SHOW_PANEL` | `True` | Register or remove the sidebar panel. Applied immediately via entry reload — no HA restart required. |

---

## WebSocket API

The integration registers WebSocket commands under the `lcards/*` namespace:

| Command type | Handler | Response |
|---|---|---|
| `lcards/info` | `ws_lcards_info` | `{ available: true, version: "...", domain: "lcards" }` |

The `lcards/info` command is the probe used by the JS-side `IntegrationService`. Additional commands for Phase 2 features (theme persistence, Store API) will be added here.

→ See [Integration Service](subsystems/integration-service) for the JS-side counterpart.

---

## Build & Dev Workflow

The integration build outputs directly into `custom_components/lcards/`:

```bash
npm run build:integration
# = vite build --mode integration && node scripts/copy-assets.js
# Outputs:
#   custom_components/lcards/lcards.js
#   custom_components/lcards/lcards.js.map
#   custom_components/lcards/fonts/   (from src/assets/fonts/)
#   custom_components/lcards/msd/     (from src/assets/msd/)
#   custom_components/lcards/sounds/  (from src/assets/sounds/)
```

In the devcontainer, `custom_components/lcards/` is bind-mounted into the HA core workspace, so a build is picked up immediately. A browser hard-refresh (`Ctrl+Shift+R`) applies JS changes; Python changes require a full HA restart.

---

## CI / Release Pipeline

The `release.yml` GitHub Actions workflow handles versioning and packaging:

1. Tag push or `workflow_dispatch` with a version string triggers the workflow
2. Version is normalised to HA CalVer (no leading zeros, no pre-release suffix) and stamped into `manifest.json`; the full tag is kept in `const.py`
3. `npm run build:integration` produces the complete integration directory
4. `custom_components/lcards/` is zipped as `lcards.zip` (excluding `__pycache__`, `.pyc`)
5. A GitHub release is created with the zip attached

HACS downloads this zip and extracts it into `custom_components/lcards/` on the user's HA instance.
