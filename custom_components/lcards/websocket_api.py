"""WebSocket API for LCARdS.

Provides the lcards/* WebSocket command namespace.
Currently implements lcards/info — the probe endpoint used by
IntegrationService on the frontend to detect backend availability.
"""
import logging
import voluptuous as vol

from homeassistant.core import HomeAssistant
from homeassistant.components import websocket_api

from .const import DOMAIN, DOMAIN_VERSION

_LOGGER = logging.getLogger(__name__)


def async_setup_ws(hass: HomeAssistant) -> None:
    """Register all LCARdS WebSocket commands."""
    websocket_api.async_register_command(hass, ws_lcards_info)
    _LOGGER.debug("LCARdS: WebSocket command %s/info registered", DOMAIN)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/info",
    }
)
@websocket_api.async_response
async def ws_lcards_info(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Handle lcards/info.

    Returns integration availability and version.
    Frontend IntegrationService probes this on boot to determine
    whether the backend is present.
    """
    _LOGGER.debug("LCARdS: %s/info probe received", DOMAIN)
    connection.send_result(
        msg["id"],
        {
            "available": True,
            "version": DOMAIN_VERSION,
        },
    )
