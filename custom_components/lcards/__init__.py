"""LCARdS — HACS Integration.

Handles:
  - Static path registration for lcards.js  (/lcards/lcards.js)
  - Frontend injection via add_extra_js_url  (auto-loads on every HA page)
  - Lovelace resource registration           (Cast / kiosk support)
  - Sidebar panel registration               (LCARdS Config)
  - WebSocket API namespace                  (lcards/*)

Architecture:
  async_setup()        → static path + WebSocket commands (runs at HA start,
                          before any config entry exists)
  async_setup_entry()  → JS injection + sidebar panel (runs when the
                          integration is active and configured)
  async_remove_entry() → cleans up JS injection + sidebar panel

No configuration.yaml changes required. Everything is automatic once the
integration is installed and set up via the HA integrations UI.
"""
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.components.frontend import (
    async_register_built_in_panel,
    async_remove_panel,
)
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN
from .frontend import (
    async_register_static_path,
    async_register_frontend_script_resource,
    async_remove_frontend_script_resource,
)
from .websocket_api import async_setup_ws

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up LCARdS component.

    Registers the static HTTP path and WebSocket command namespace.
    These must be available even before a config entry exists so that
    the frontend can probe lcards/info after a hot-reload.
    """
    await async_register_static_path(hass)
    async_setup_ws(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up LCARdS from a config entry.

    Injects lcards.js into every HA frontend session and registers the
    LCARdS Config sidebar panel. Both are cleaned up in async_remove_entry.
    """
    # Inject lcards.js (add_extra_js_url + Lovelace resource for Cast)
    await async_register_frontend_script_resource(hass)

    # Register the sidebar panel — appears automatically in the HA sidebar.
    # require_admin=False: all users can access the Config Panel.
    # Revisit when write APIs (theme overrides, etc.) are added in Phase 2+.
    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title="LCARdS Config",
        sidebar_icon="mdi:space-invaders",
        frontend_url_path="lcards-config",
        config={
            "_panel_custom": {
                "name": "lcards-config-panel",
                "module_url": f"/{DOMAIN}/lcards.js",
                "embed_iframe": False,
            }
        },
        require_admin=False,
    )

    return True


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Clean up when the integration is removed.

    Removes JS injection and unregisters the sidebar panel so no
    orphaned UI elements remain after uninstall.
    """
    await async_remove_frontend_script_resource(hass)

    try:
        async_remove_panel("lcards-config")
    except Exception:  # noqa: BLE001
        # Panel may already be gone if HA is shutting down
        pass
