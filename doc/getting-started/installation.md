# Installation

## Requirements

There are no external dependencies or prerequisites for LCARdS.

For the best visual experience, use [**HA-LCARS themes**](https://github.com/th3jesta/ha-lcars).

::: warning Breaking change from previous versions
LCARdS has moved from a **HACS Frontend Plugin** to a **HACS Integration**.
If you have an existing installation, follow [Migrating from the Frontend Plugin](#migrating-from-the-frontend-plugin) before installing.
:::

## Install via HACS

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=snootched&repository=LCARdS&category=integration)

1. Open **HACS** in Home Assistant
2. Go to **Integrations** and search for **LCARdS**
3. Click **Download** and confirm
4. **Restart Home Assistant**
5. Go to **Settings → Integrations → Add Integration** and search for **LCARdS**
6. Click through the setup — no configuration is required

LCARdS is now active. It automatically:
- Loads `lcards.js` on every Home Assistant page
- Registers the **LCARdS Config** sidebar panel

No `configuration.yaml` changes are required.

## Manual Installation

1. Download `lcards.zip` from the [latest GitHub release](https://github.com/snootched/lcards/releases/latest)
2. Extract the contents into `config/custom_components/lcards/`
   (the directory should contain `manifest.json` and `__init__.py` directly — not a nested `lcards/lcards/` folder)
3. **Restart Home Assistant**
4. Go to **Settings → Integrations → Add Integration → LCARdS**

## Configuration

After installation, LCARdS can be configured from the integration card:

**Settings → Integrations → LCARdS → Configure**

| Option | Default | Description |
|--------|---------|-------------|
| Show sidebar panel | On | Display the LCARdS Config entry in the Home Assistant sidebar. Disable if you prefer a cleaner sidebar — the integration stays active and all cards continue to work. |

Changes take effect immediately — no restart required.

## The LCARdS Config Panel

The **LCARdS Config Panel** is registered automatically by the integration.
Access it via the **LCARdS Config** entry in the Home Assistant sidebar.

From the Config Panel you can:
- **Create all required helpers** in one click (alert mode, sounds, sizing)
- Customise Alert Mode colour palettes per alert level
- Configure sound schemes and per-event overrides
- Browse theme tokens and CSS variables live
- Explore installed packs

If you don't want it visible all the time, toggle **Show sidebar panel** off in the integration options — it can be re-enabled at any time.

See [LCARdS Config Panel](../configuration/config-panel.md) for full details.

## Migrating from the Frontend Plugin

If you have a previous LCARdS installation (installed as a HACS **Frontend** plugin), you must remove it before installing the integration.

**Step 1 — Remove the old HACS Frontend plugin**

1. Open **HACS → Frontend**
2. Find **LCARdS** and click the three-dot menu → **Remove**
3. Confirm removal

**Step 2 — Remove any custom HACS repository entry**

If you added LCARdS as a custom repository:
1. Open **HACS → ⋮ (menu) → Custom repositories**
2. Find the LCARdS entry and delete it

**Step 3 — Remove the `panel_custom` config block**

If you added a `panel_custom:` block to `configuration.yaml` to enable the sidebar panel, remove it — the integration handles this automatically now.

```yaml
# Remove this entire block from configuration.yaml:
panel_custom:
  - name: lcards-config-panel
    sidebar_title: LCARdS Config
    sidebar_icon: mdi:space-invaders
    url_path: lcards-config-panel
    module_url: /hacsfiles/lcards/lcards.js
```

**Step 4 — Restart Home Assistant**

A full restart is required to clear the old frontend registration.

**Step 5 — Install via HACS Integrations**

Follow [Install via HACS](#install-via-hacs) above.
