"""Persistent storage for LCARdS.

Wraps HA's Store with a flat key/value namespace:

    { "data": { "<key>": <any JSON-serialisable value> } }

The Store version (STORAGE_VERSION = 1) is managed by HA and written to
.storage/lcards in the HA config directory.  Data persists across HA
restarts and HACS upgrades — it lives outside custom_components/.

Lifecycle:
  LCARdSStorage is created and loaded in async_setup_entry(), stored on
  hass.data[DOMAIN]["storage"].  WebSocket commands look it up there at
  call time, so they work correctly across config-entry reloads.
"""
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
_STORAGE_KEY = DOMAIN  # written to .storage/lcards


class LCARdSStorage:
    """Flat key/value persistent store for LCARdS."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store = Store(hass, STORAGE_VERSION, _STORAGE_KEY)
        self._data: dict[str, Any] = {}

    async def async_load(self) -> "LCARdSStorage":
        """Load data from disk into the in-memory cache. Returns self."""
        stored = await self._store.async_load()
        if stored:
            self._data = stored.get("data", {})
        _LOGGER.debug("LCARdS: storage loaded (%d key(s))", len(self._data))
        return self

    async def _async_save(self) -> None:
        """Persist the current in-memory state to disk (debounced by HA)."""
        await self._store.async_save({"data": self._data})

    async def async_get(self, key: str | None = None) -> Any:
        """Return a single key's value, or the full data dict if key is None.

        Returns None for a missing key (not an error).
        """
        if key is None:
            return dict(self._data)
        return self._data.get(key)

    async def async_set(self, updates: dict[str, Any]) -> None:
        """Shallow-merge *updates* into the store and persist."""
        self._data.update(updates)
        await self._async_save()
        _LOGGER.debug(
            "LCARdS: storage set %d key(s): %s", len(updates), list(updates)
        )

    async def async_delete(self, key: str) -> bool:
        """Delete *key* from the store. Returns True if the key existed."""
        if key not in self._data:
            return False
        del self._data[key]
        await self._async_save()
        _LOGGER.debug("LCARdS: storage deleted key %r", key)
        return True

    async def async_reset(self) -> None:
        """Wipe the entire data store and persist."""
        count = len(self._data)
        self._data = {}
        await self._async_save()
        _LOGGER.info("LCARdS: storage reset (%d key(s) removed)", count)

    def dump(self) -> dict:
        """Return the full in-memory store contents (synchronous, for debug)."""
        return {"version": STORAGE_VERSION, "data": dict(self._data)}
