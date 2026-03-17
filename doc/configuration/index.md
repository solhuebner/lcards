# LCARdS Config Panel

LCARdS configuration is managed through the **LCARdS Config Panel** — a sidebar entry in Home Assistant providing a central hub for all settings.

---

## Setup

See [Config Panel setup](config-panel.md) to register the panel in `configuration.yaml`.

---

## Panel Tabs

| Tab | What it does |
|-----|--------------|
| **[Helpers](persistent-helpers.md)** | View and create all required HA input helpers — one click to create everything |
| **Theme Browser** | Browse live theme tokens and CSS variables; find the exact token path to use in card config |
| **[Alert Mode Lab](alert-mode-lab.md)** | Customise colour palette parameters for each alert level; preview live; save to helpers |
| **[Sound](../core/sounds.md)** | Enable sounds, configure the active scheme, set per-event overrides and volume |
| **Pack Explorer** | Browse installed content packs — presets, animations, themes, sound schemes |
| **YAML Export** | Generate a `configuration.yaml` snippet for all helpers — for manual setup or backup |

::: tip First launch
Open the **Helpers** tab and click **Create All Helpers** — this creates every HA input helper LCARdS needs in one step.
:::
