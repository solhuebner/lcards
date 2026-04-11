# LCARdS Config Panel

The LCARdS Config Panel is a full-page sidebar panel that serves as the central control hub for your LCARdS installation. From here you can manage HA helpers, browse theme tokens, configure sounds, and explore installed content packs.

---

## Setup

The panel must be registered once in `configuration.yaml`. Add the following and restart Home Assistant:

```yaml
panel_custom:
  - name: lcards-config-panel
    sidebar_title: LCARdS Config
    sidebar_icon: mdi:cog
    url_path: lcards-config-panel
    module_url: /hacsfiles/lcards/lcards.js
```

After restarting, **LCARdS Config** appears in the HA sidebar.

> [!NOTE]
> If you installed via HACS the module URL above is correct. For manual installs, adjust the path to match where you placed `lcards.js`.

---

## Panel Tabs

| Tab | What it does |
|-----|--------------|
| **[Helpers](persistent-helpers.md)** | View all LCARdS HA input helpers, their status, and values — create all required helpers in one click |
| **Theme Browser** | Browse all live theme tokens and CSS variables; find the exact `{theme:...}` token to use in card config |
| **[Alert Mode Lab](alert-mode-lab.md)** | Customise colour palette parameters (hue, saturation, lightness) per alert level; preview live; save to helpers |
| **[Sound](../core/sounds.md)** | Enable/disable sounds, configure the active scheme, set per-event overrides, control volume |
| **Pack Explorer** | Browse installed content packs — view presets, animations, themes, and sound schemes per pack |

::: tip First launch
Open the **Helpers** tab and click **Create All Helpers** — this creates every HA input helper LCARdS needs in one step. Do this before using Alert Mode or Sounds.
:::

---
