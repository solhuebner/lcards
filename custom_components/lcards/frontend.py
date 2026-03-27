"""Frontend registration for LCARdS.

Registers lcards.js as a static HTTP path, injects it into every HA
frontend session via add_extra_js_url, and manages the Lovelace resource
entry for Cast / kiosk support.

Modelled closely on UIX (Lint-Free-Technology/uix) — same pattern, same
safety guards.
"""
from homeassistant.core import HomeAssistant
from homeassistant.components.frontend import add_extra_js_url, remove_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace.resources import ResourceStorageCollection

from .const import DOMAIN, FRONTEND_SCRIPT_URL, DOMAIN_VERSION


async def async_register_static_path(hass: HomeAssistant) -> None:
    """Register the static HTTP path that serves lcards.js.

    Called from async_setup() so the path is available from HA start,
    even before a config entry exists.
    """
    try:
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    f"/{DOMAIN}/{FRONTEND_SCRIPT_URL}",
                    hass.config.path(
                        f"custom_components/{DOMAIN}/{FRONTEND_SCRIPT_URL}"
                    ),
                    # cache=True — browser will cache; HA appends ?v= to bust on upgrade
                    True,
                )
            ]
        )
    except RuntimeError:
        # Already registered — happens when the integration is removed
        # and HA has not been fully restarted yet.
        pass


async def async_register_frontend_script_resource(hass: HomeAssistant) -> None:
    """Inject lcards.js into every HA frontend session.

    1. add_extra_js_url  — loads the script on every HA page automatically.
    2. Lovelace resource — makes the card available in Cast / kiosk mode.

    Called from async_setup_entry() so it only runs when the integration
    is actually configured and active.
    """
    resource_url = f"/{DOMAIN}/{FRONTEND_SCRIPT_URL}?v={DOMAIN_VERSION}"

    # 1. Inject into every HA frontend session (no Lovelace dashboard needed)
    add_extra_js_url(hass, resource_url)

    # 2. Register / update Lovelace resource for Cast support
    resources = hass.data.get("lovelace", {}).get("resources")
    if not resources:
        return

    if not resources.loaded:
        await resources.async_load()
        resources.loaded = True

    frontend_added = False
    for r in resources.async_items():
        if r["url"].startswith(f"/{DOMAIN}/{FRONTEND_SCRIPT_URL}"):
            frontend_added = True
            # Update URL if the version query string changed (upgrade scenario)
            if not r["url"].endswith(DOMAIN_VERSION):
                if isinstance(resources, ResourceStorageCollection):
                    await resources.async_update_item(
                        r["id"],
                        {"res_type": "module", "url": resource_url},
                    )
                else:
                    # Fallback for non-storage resource collections
                    r["url"] = resource_url

    if not frontend_added:
        if getattr(resources, "async_create_item", None):
            await resources.async_create_item(
                {"res_type": "module", "url": resource_url}
            )
        elif getattr(resources, "data", None) and getattr(
            resources.data, "append", None
        ):
            resources.data.append({"type": "module", "url": resource_url})


async def async_remove_frontend_script_resource(hass: HomeAssistant) -> None:
    """Remove lcards.js from extra JS URLs and Lovelace resources.

    Called from async_remove_entry() when the integration is uninstalled.
    """
    resource_url = f"/{DOMAIN}/{FRONTEND_SCRIPT_URL}?v={DOMAIN_VERSION}"

    remove_extra_js_url(hass, resource_url)

    resources = hass.data.get("lovelace", {}).get("resources")
    if not resources:
        return

    if not resources.loaded:
        await resources.async_load()
        resources.loaded = True

    for r in resources.async_items():
        if r["url"].startswith(f"/{DOMAIN}/{FRONTEND_SCRIPT_URL}"):
            if isinstance(resources, ResourceStorageCollection):
                await resources.async_delete_item(r["id"])
            else:
                resources.data.remove(r)
