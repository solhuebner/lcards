"""HA service (action) handlers for the LCARdS integration.

Provides the lcards.* action namespace:

  lcards.set_alert_mode   — set any alert mode by name
  lcards.red_alert        — activate red alert
  lcards.yellow_alert     — activate yellow alert
  lcards.blue_alert       — activate blue alert
  lcards.gray_alert       — activate gray alert
  lcards.black_alert      — activate black alert
  lcards.clear_alert      — return to normal (green_alert)
  lcards.reload           — fire a reload event to all connected frontends
  lcards.set_log_level    — change JS frontend log level at runtime

Alert mode services work by calling input_select.select_option on the
input_select.lcards_alert_mode helper, which is the single source of truth
for alert state.  The helper change propagates to ThemeManager, SoundManager,
and alert overlays via their existing HelperManager subscriptions.

The `reload` and `set_log_level` services use the lcards_event HA event bus
channel to push instructions directly to connected JS frontends.
"""
import logging
import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall

from .const import DOMAIN, LOG_LEVEL_OPTIONS, _LOG_LEVEL_MAP

_LOGGER = logging.getLogger(__name__)

# The HA input_select entity that drives alert mode across the LCARdS system.
_ALERT_MODE_ENTITY = "input_select.lcards_alert_mode"

# Valid option values (must match the input_select options in the helper registry).
_ALERT_MODES = [
    "green_alert",
    "red_alert",
    "yellow_alert",
    "blue_alert",
    "gray_alert",
    "black_alert",
]

# HA event name for the Python → JS push channel.
EVENT_LCARDS = "lcards_event"

# Service name constants
SERVICE_SET_ALERT_MODE = "set_alert_mode"
SERVICE_RED_ALERT      = "red_alert"
SERVICE_YELLOW_ALERT   = "yellow_alert"
SERVICE_BLUE_ALERT     = "blue_alert"
SERVICE_GRAY_ALERT     = "gray_alert"
SERVICE_BLACK_ALERT    = "black_alert"
SERVICE_CLEAR_ALERT    = "clear_alert"
SERVICE_RELOAD         = "reload"
SERVICE_SET_LOG_LEVEL  = "set_log_level"

_ALL_SERVICES = [
    SERVICE_SET_ALERT_MODE,
    SERVICE_RED_ALERT,
    SERVICE_YELLOW_ALERT,
    SERVICE_BLUE_ALERT,
    SERVICE_GRAY_ALERT,
    SERVICE_BLACK_ALERT,
    SERVICE_CLEAR_ALERT,
    SERVICE_RELOAD,
    SERVICE_SET_LOG_LEVEL,
]


async def _async_set_alert_mode(hass: HomeAssistant, mode: str) -> None:
    """Set alert mode by writing to input_select.lcards_alert_mode.

    Delegates to the standard input_select.select_option service so that
    the full LCARdS pipeline (theme, sound, overlay) fires via the helper
    subscription mechanism already wired up in JS.
    """
    _LOGGER.debug("LCARdS service: setting alert mode → %r", mode)
    try:
        await hass.services.async_call(
            "input_select",
            "select_option",
            {"entity_id": _ALERT_MODE_ENTITY, "option": mode},
            blocking=True,
        )
    except Exception as exc:  # noqa: BLE001
        _LOGGER.warning(
            "LCARdS: failed to set alert mode %r — is %s defined? (%s)",
            mode, _ALERT_MODE_ENTITY, exc,
        )


async def async_setup_services(hass: HomeAssistant) -> None:
    """Register all LCARdS HA services.

    Called from async_setup_entry.  Services are removed in
    async_remove_services (called from async_unload_entry).
    """

    async def handle_set_alert_mode(call: ServiceCall) -> None:
        await _async_set_alert_mode(hass, call.data["mode"])

    async def handle_red_alert(call: ServiceCall) -> None:
        await _async_set_alert_mode(hass, "red_alert")

    async def handle_yellow_alert(call: ServiceCall) -> None:
        await _async_set_alert_mode(hass, "yellow_alert")

    async def handle_blue_alert(call: ServiceCall) -> None:
        await _async_set_alert_mode(hass, "blue_alert")

    async def handle_gray_alert(call: ServiceCall) -> None:
        await _async_set_alert_mode(hass, "gray_alert")

    async def handle_black_alert(call: ServiceCall) -> None:
        await _async_set_alert_mode(hass, "black_alert")

    async def handle_clear_alert(call: ServiceCall) -> None:
        await _async_set_alert_mode(hass, "green_alert")

    async def handle_reload(call: ServiceCall) -> None:
        """Fire a reload push event to all connected LCARdS frontends."""
        _LOGGER.info("LCARdS service: firing reload event to connected frontends")
        hass.bus.async_fire(EVENT_LCARDS, {"action": "reload"})

    async def handle_set_log_level(call: ServiceCall) -> None:
        """Update log level on Python backend and push to all JS frontends."""
        level = call.data["level"]
        _LOGGER.info("LCARdS service: setting log level → %r", level)
        # Update Python logger hierarchy immediately
        py_level = _LOG_LEVEL_MAP.get(level, logging.WARNING)
        logging.getLogger(f"custom_components.{DOMAIN}").setLevel(py_level)
        # Push to all connected JS frontends via the lcards_event channel
        hass.bus.async_fire(EVENT_LCARDS, {"action": "set_log_level", "level": level})

    # --- Register all services ---

    hass.services.async_register(
        DOMAIN, SERVICE_SET_ALERT_MODE, handle_set_alert_mode,
        schema=vol.Schema({vol.Required("mode"): vol.In(_ALERT_MODES)}),
    )
    hass.services.async_register(DOMAIN, SERVICE_RED_ALERT,    handle_red_alert)
    hass.services.async_register(DOMAIN, SERVICE_YELLOW_ALERT, handle_yellow_alert)
    hass.services.async_register(DOMAIN, SERVICE_BLUE_ALERT,   handle_blue_alert)
    hass.services.async_register(DOMAIN, SERVICE_GRAY_ALERT,   handle_gray_alert)
    hass.services.async_register(DOMAIN, SERVICE_BLACK_ALERT,  handle_black_alert)
    hass.services.async_register(DOMAIN, SERVICE_CLEAR_ALERT,  handle_clear_alert)
    hass.services.async_register(DOMAIN, SERVICE_RELOAD,       handle_reload)
    hass.services.async_register(
        DOMAIN, SERVICE_SET_LOG_LEVEL, handle_set_log_level,
        schema=vol.Schema({vol.Required("level"): vol.In(LOG_LEVEL_OPTIONS)}),
    )

    _LOGGER.debug(
        "LCARdS: registered %d service(s) under %s.*",
        len(_ALL_SERVICES), DOMAIN,
    )


def async_remove_services(hass: HomeAssistant) -> None:
    """Remove all LCARdS HA services.

    Called from async_unload_entry so services disappear cleanly when the
    integration is reloaded or removed.
    """
    for service in _ALL_SERVICES:
        hass.services.async_remove(DOMAIN, service)
    _LOGGER.debug("LCARdS: removed %d service(s)", len(_ALL_SERVICES))
