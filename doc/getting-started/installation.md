# Installation

## Requirements

There are no external dependencies or prerequisites for LCARdS.

For the best visual experience, use [**HA-LCARS themes**](https://github.com/th3jesta/ha-lcars).

## Install via HACS

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=snootched&repository=LCARdS&category=frontend)

1. Open **HACS** in Home Assistant
2. Search for **LCARdS**
3. Click Download to install
4. Hard-refresh your browser (`Ctrl+Shift+R`) to clear the cache

## Enable the LCARdS Config Panel

The **LCARdS Config Panel** is a standalone sidebar entry in Home Assistant — a central hub for managing LCARdS settings.

Add the following to `configuration.yaml` and restart Home Assistant:

```yaml
panel_custom:
  - name: lcards-config-panel
    sidebar_title: LCARdS Config
    sidebar_icon: mdi:space-invaders
    url_path: lcards-config-panel
    module_url: /hacsfiles/lcards/lcards.js
```

From the Config Panel you can:
- **Create all required helpers** in one click (alert mode, sounds, sizing)
- Customise Alert Mode colour palettes per alert level
- Configure sound schemes and per-event overrides
- Browse theme tokens and CSS variables live
- Explore installed packs

See [LCARdS Config Panel](../configuration/config-panel.md) for full details.
