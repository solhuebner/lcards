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

# Legacy resource URL prefixes that were manually added by users following the
# old installation docs (HACS frontend plugin path). The integration removes
# these automatically on first setup so lcards.js is not loaded twice.
_LEGACY_RESOURCE_PREFIXES = (
    "/hacsfiles/lcards/lcards.js",
    "/local/community/lcards/lcards.js",
)


def _get_lovelace_resources(hass: HomeAssistant):
    """Return the Lovelace resources collection, or None if unavailable.

    hass.data["lovelace"] is a LovelaceData named-tuple/dataclass — access
    .resources as an attribute, not via dict .get().
    """
    lovelace = hass.data.get("lovelace")
    if lovelace is None:
        return None
    return getattr(lovelace, "resources", None)


async def async_register_static_path(hass: HomeAssistant) -> None:
    """Register static HTTP paths for LCARdS.

    Two paths are registered:

    1. /{DOMAIN}/lcards.js  — the main JS bundle served by the integration.

    2. /hacsfiles/lcards/   — alias pointing at the same custom_components dir.
       All hardcoded asset URLs in the LCARdS JS bundle reference
       /hacsfiles/lcards/fonts/*, /hacsfiles/lcards/msd/*, etc.
       By serving that prefix from the integration directory, fonts, SVGs
       and sounds all resolve correctly without any JS changes.

    Called from async_setup() so both paths are available from HA start,
    even before a config entry exists.
    """
    integration_dir = hass.config.path(f"custom_components/{DOMAIN}")
    try:
        await hass.http.async_register_static_paths(
            [
                # Main JS bundle
                StaticPathConfig(
                    f"/{DOMAIN}/{FRONTEND_SCRIPT_URL}",
                    hass.config.path(
                        f"custom_components/{DOMAIN}/{FRONTEND_SCRIPT_URL}"
                    ),
                    # cache=True — browser caches; HA appends ?v= to bust on upgrade
                    True,
                ),
                # Source map — served alongside lcards.js so browser devtools
                # can map the bundle back to original source files.
                StaticPathConfig(
                    f"/{DOMAIN}/{FRONTEND_SCRIPT_URL}.map",
                    hass.config.path(
                        f"custom_components/{DOMAIN}/{FRONTEND_SCRIPT_URL}.map"
                    ),
                    True,
                ),
                # Asset alias — /hacsfiles/lcards/* → custom_components/lcards/*
                # Keeps all existing font/SVG/sound URL references working.
                StaticPathConfig(
                    "/hacsfiles/lcards",
                    integration_dir,
                    True,
                ),
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
    resources = _get_lovelace_resources(hass)
    if not resources:
        return

    if not resources.loaded:
        await resources.async_load()
        resources.loaded = True

    # Remove any legacy manually-added resources from the old plugin install path.
    # These would cause lcards.js to load twice alongside the integration resource.
    legacy_ids = [
        r["id"]
        for r in resources.async_items()
        if any(r["url"].startswith(prefix) for prefix in _LEGACY_RESOURCE_PREFIXES)
    ]
    for legacy_id in legacy_ids:
        if isinstance(resources, ResourceStorageCollection):
            await resources.async_delete_item(legacy_id)
        else:
            resources.data[:] = [
                r for r in resources.data
                if not any(r.get("url", "").startswith(p) for p in _LEGACY_RESOURCE_PREFIXES)
            ]

    if legacy_ids:
        import logging
        logging.getLogger(__name__).info(
            "LCARdS: removed %d legacy Lovelace resource(s) from the old plugin "
            "install path — lcards.js is now served by the integration.",
            len(legacy_ids),
        )

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

    resources = _get_lovelace_resources(hass)
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
