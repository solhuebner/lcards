"""WebSocket API for LCARdS.

Provides the lcards/* WebSocket command namespace.
Currently implements lcards/info — the probe endpoint used by
IntegrationService on the frontend to detect backend availability.
"""
import voluptuous as vol

from homeassistant.core import HomeAssistant
from homeassistant.components import websocket_api

from .const import DOMAIN, DOMAIN_VERSION


def async_setup_ws(hass: HomeAssistant) -> None:
    """Register all LCARdS WebSocket commands."""
    hass.components.websocket_api.async_register_command(ws_lcards_info)


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
    connection.send_result(
        msg["id"],
        {
            "available": True,
            "version": DOMAIN_VERSION,
        },
    )
