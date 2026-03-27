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

from .const import (
    DOMAIN,
    CONF_SHOW_PANEL, DEFAULT_SHOW_PANEL,
    CONF_SIDEBAR_TITLE, DEFAULT_SIDEBAR_TITLE,
    CONF_SIDEBAR_ICON, DEFAULT_SIDEBAR_ICON,
    CONF_LOG_LEVEL, DEFAULT_LOG_LEVEL,
)
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


def _register_panel(
    hass: HomeAssistant,
    title: str = DEFAULT_SIDEBAR_TITLE,
    icon: str = DEFAULT_SIDEBAR_ICON,
) -> None:
    """Register the LCARdS sidebar panel with the given title and icon."""
    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=title,
        sidebar_icon=icon,
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


async def _async_options_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the config entry when options are updated.

    This triggers async_unload_entry → async_setup_entry so the panel
    is registered or removed according to the new setting immediately,
    without requiring an HA restart.
    """
    await hass.config_entries.async_reload(entry.entry_id)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up LCARdS from a config entry.

    Injects lcards.js into every HA frontend session and, if enabled in
    options, registers the LCARdS Config sidebar panel.
    Cleaned up in async_unload_entry (restart / reload / removal).
    """
    # Inject lcards.js (add_extra_js_url + Lovelace resource for Cast).
    # Pass the configured log level so lcards.js reads it from import.meta.url.
    log_level = entry.options.get(CONF_LOG_LEVEL, DEFAULT_LOG_LEVEL)
    await async_register_frontend_script_resource(hass, log_level)

    # Conditionally register the sidebar panel based on user option.
    # Defaults to True (visible) on first install.
    if entry.options.get(CONF_SHOW_PANEL, DEFAULT_SHOW_PANEL):
        title = entry.options.get(CONF_SIDEBAR_TITLE, DEFAULT_SIDEBAR_TITLE)
        icon  = entry.options.get(CONF_SIDEBAR_ICON, DEFAULT_SIDEBAR_ICON)
        _register_panel(hass, title, icon)

    # Re-apply setup whenever the user saves new options.
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry.

    Called on HA restart, explicit reload, or just before removal.
    Removes JS injection and the sidebar panel so no orphaned UI elements
    remain until async_setup_entry fires again.
    """
    await async_remove_frontend_script_resource(hass)

    try:
        async_remove_panel(hass, "lcards-config")
    except Exception:  # noqa: BLE001
        # Panel may already be gone if HA is shutting down
        pass

    return True


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Called after async_unload_entry when the integration is deleted.

    async_unload_entry already handled the cleanup — nothing extra needed.
    """
