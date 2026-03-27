"""WebSocket API for LCARdS.

Provides the lcards/* WebSocket command namespace:

  lcards/info            — backend probe used by IntegrationService
  lcards/storage/get     — read one key (or all)
  lcards/storage/set     — shallow-merge one or many keys
  lcards/storage/delete  — remove one key
  lcards/storage/reset   — wipe entire store
  lcards/storage/dump    — return full store (debug)
"""
import logging
import voluptuous as vol

from homeassistant.core import HomeAssistant
from homeassistant.components import websocket_api

from .const import DOMAIN, DOMAIN_VERSION

_LOGGER = logging.getLogger(__name__)


def _get_storage(hass: HomeAssistant):
    """Return the LCARdSStorage instance from hass.data, or None."""
    return hass.data.get(DOMAIN, {}).get("storage")


def async_setup_ws(hass: HomeAssistant) -> None:
    """Register all LCARdS WebSocket commands."""
    for cmd in (
        ws_lcards_info,
        ws_storage_get,
        ws_storage_set,
        ws_storage_delete,
        ws_storage_reset,
        ws_storage_dump,
    ):
        websocket_api.async_register_command(hass, cmd)
    _LOGGER.debug("LCARdS: registered %d WebSocket command(s) under %s/*", 6, DOMAIN)


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


# ---------------------------------------------------------------------------
# Storage commands
# ---------------------------------------------------------------------------

_STORAGE_UNAVAILABLE = "storage_unavailable"
_STORAGE_UNAVAILABLE_MSG = "LCARdS storage is not initialised"


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/storage/get",
        vol.Optional("key"): str,
    }
)
@websocket_api.async_response
async def ws_storage_get(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Handle lcards/storage/get.

    Returns the value for *key*, or the full data dict if key is omitted.
    """
    storage = _get_storage(hass)
    if storage is None:
        connection.send_error(msg["id"], _STORAGE_UNAVAILABLE, _STORAGE_UNAVAILABLE_MSG)
        return
    key = msg.get("key")
    value = await storage.async_get(key)
    connection.send_result(msg["id"], {"key": key, "value": value})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/storage/set",
        vol.Required("data"): dict,
    }
)
@websocket_api.async_response
async def ws_storage_set(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Handle lcards/storage/set.

    Shallow-merges *data* (a dict of key→value pairs) into the store.
    """
    storage = _get_storage(hass)
    if storage is None:
        connection.send_error(msg["id"], _STORAGE_UNAVAILABLE, _STORAGE_UNAVAILABLE_MSG)
        return
    await storage.async_set(msg["data"])
    connection.send_result(msg["id"], {"ok": True, "keys": list(msg["data"].keys())})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/storage/delete",
        vol.Required("key"): str,
    }
)
@websocket_api.async_response
async def ws_storage_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Handle lcards/storage/delete.

    Deletes *key* from the store. Responds with existed=True/False.
    """
    storage = _get_storage(hass)
    if storage is None:
        connection.send_error(msg["id"], _STORAGE_UNAVAILABLE, _STORAGE_UNAVAILABLE_MSG)
        return
    existed = await storage.async_delete(msg["key"])
    connection.send_result(msg["id"], {"ok": True, "existed": existed})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/storage/reset",
    }
)
@websocket_api.async_response
async def ws_storage_reset(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Handle lcards/storage/reset.

    Wipes the entire LCARdS store. Irreversible.
    """
    storage = _get_storage(hass)
    if storage is None:
        connection.send_error(msg["id"], _STORAGE_UNAVAILABLE, _STORAGE_UNAVAILABLE_MSG)
        return
    await storage.async_reset()
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/storage/dump",
    }
)
@websocket_api.async_response
async def ws_storage_dump(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Handle lcards/storage/dump.

    Returns the full store contents including the schema version.
    Intended for debugging and dev-tools inspection.
    """
    storage = _get_storage(hass)
    if storage is None:
        connection.send_error(msg["id"], _STORAGE_UNAVAILABLE, _STORAGE_UNAVAILABLE_MSG)
        return
    connection.send_result(msg["id"], storage.dump())
