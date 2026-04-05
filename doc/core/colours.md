# Colours

LCARdS accepts several colour formats wherever a colour value is expected. You can also define state-based colour maps so colours change automatically with entity state.

---

## Colour Value Formats

| Format | Example | Notes |
|--------|---------|-------|
| Hex 6-digit | `#FF9900` | Standard RGB hex |
| Hex 8-digit | `#FF990080` | Last two digits are alpha (00–FF) |
| RGB | `rgb(255, 153, 0)` | Standard CSS rgb() |
| RGBA | `rgba(255, 153, 0, 0.5)` | CSS rgba() with 0–1 alpha |
| CSS variable | `var(--lcards-orange)` | Any `--lcards-*` or HA CSS variable |
| Theme token path | `{theme:colors.ui.primary}` | Resolved from active theme |
| Computed token | `darken(var(--lcards-orange), 0.2)` | Computed by ThemeTokenResolver |

### CSS Variables

The `--lcards-*` variables are defined by the active theme pack. Common ones:

```yaml
var(--lcards-orange)
var(--lcards-orange-medium)
var(--lcards-blue)
var(--lcards-blue-light)
var(--lcards-moonlight)        # Near-white; default text and label colour
var(--lcards-gray)             # Standby / inactive state colour
var(--lcards-alert-red)
var(--lcards-alert-yellow)
```

### Theme Token Paths

Use `{theme:path.to.token}` to reference a value from the active theme's token tree:

```yaml
color: "{theme:colors.text.onDark}"
color: "{theme:colors.ui.primary}"
color: "{theme:colors.ui.secondary}"
color: "{theme:colors.alert.red}"
```

See [Themes](themes/) for available token paths.

### Computed Colour Tokens

The ThemeTokenResolver supports derived colours:

```yaml
color: "darken(var(--lcards-orange), 0.2)"    # Darken by 20%
color: "lighten(var(--lcards-blue), 0.15)"    # Lighten by 15%
color: "alpha(var(--lcards-orange), 0.6)"     # Set opacity to 60%
```

---

## State-Based Colour Maps

Instead of a single colour string, you can supply an object whose keys are entity states. LCARdS resolves the right colour based on the entity bound to the card.

```yaml
style:
  border:
    color:
      default: "var(--lcards-gray)"
      active: "var(--lcards-orange)"
      inactive: "var(--lcards-gray)"
      unavailable: "var(--lcards-alert-red)"
      heat: "var(--lcards-alert-red)"       # Custom state — exact match
      cool: "var(--lcards-blue)"            # Custom state — exact match
```

### State Keys

| Key | Matched entity states |
|-----|-----------------------|
| `default` | Fallback for any unmatched state, or cards without an entity |
| `active` | `on` · `open` · `playing` · `home` · `heat` · `cool` · `auto` · `fan_only` · `dry` · `locked` · `armed_home` · `armed_away` · `armed_night` · `armed_vacation` · `armed_custom_bypass` · `cleaning` · `mowing` · `docked` · `returning` · `paused` · `active` · `above_horizon` |
| `inactive` | `off` · `closed` · `away` · `idle` · `stopped` · `standby` · `unlocked` · `disarmed` · `inactive` — and any state not in the `active` or `unavailable` lists |
| `unavailable` | `unavailable` · `unknown` |
| `zero` | Entity state parses to exactly `0` — checked before range conditions |
| `non_zero` | Entity state is any non-zero number (including negatives) — catch-all used only when no range condition matched |
| `above:N` | Numeric state strictly greater than `N` — e.g. `above:50` |
| `below:N` | Numeric state strictly less than `N` — e.g. `below:20` |
| `between:N:M` | Numeric state `N ≤ value ≤ M` (inclusive) — e.g. `between:20:80` |
| Any custom string | Exact match — e.g. `heat`, `cool`, `buffering`, `charging` |

### Resolution Order

For each colour field, the resolved value is determined in this order:

1. **Exact state match** — e.g. the entity state is `"heat"` and a `heat:` key exists
2. **`zero`** — if the numeric state is exactly `0` and a `zero:` key exists
3. **Range conditions** (`above:N`, `below:N`, `between:N:M`) — all matching ranges are evaluated and the most specific one wins:
   - `between` — narrowest range (smallest `M − N`) wins
   - `above` — highest threshold wins
   - `below` — lowest threshold wins
4. **`non_zero`** — if the numeric state is non-zero and no range matched
5. **Classified state** — `active`, `inactive`, or `unavailable` per the table above
6. **`default`** key — final fallback for any unmatched state

---

## Where Colour Maps Are Valid

State-based colour objects are accepted in all `color:` fields:

- `style.card.color.background`
- `style.border.color`
- `style.text.default.color` and `style.text.<field>.color`
- `icon_style.color`
- `shape_texture.config.color` (and `color_a`, `color_b`)
- `elbow.segment.color`
- Background animation `config.color`
- Divider `color`

---

## Comprehensive Example

A button that changes background, border, and text colour based on a climate entity's state:

```yaml
type: custom:lcards-button
entity: climate.living_room
preset: lozenge
text:
  label:
    content: Climate
    position: top-left
    color:
      default: "var(--lcards-moonlight)"
      active: "var(--lcards-orange)"
      unavailable: "var(--lcards-alert-red)"
  state:
    content: "{entity.state}"
    position: center
    color:
      heat: "var(--lcards-alert-red)"
      cool: "var(--lcards-blue)"
      auto: "var(--lcards-orange)"
      default: "var(--lcards-moonlight)"
style:
  card:
    color:
      background:
        default: "var(--ha-card-background)"
        active: "alpha(var(--lcards-orange), 0.08)"
  border:
    color:
      default: "var(--lcards-gray)"
      active: "var(--lcards-orange)"
      heat: "var(--lcards-alert-red)"
      cool: "var(--lcards-blue)"
      unavailable: "var(--lcards-alert-red)"
    width: 2
```

### Numeric Sensor Example

A battery sensor card that uses ranges to colour-code charge level:

```yaml
type: custom:lcards-button
entity: sensor.phone_battery
style:
  card:
    color:
      background:
        zero: "var(--lcards-alert-red)"       # exactly 0 %
        below:20: "var(--lcards-alert-red)"   # critical — checked after zero
        below:50: "var(--lcards-alert-yellow)" # low
        non_zero: "var(--lcards-green)"       # any positive level, no range matched
        default: "var(--lcards-gray)"
```

---

## Range Conditions on Non-Numeric Entities — `ranges_attribute`

Range keys (`above:N`, `below:N`, `between:N:M`) compare against the **numeric form of the entity state**. For many entities this works out of the box — sensors report numeric strings like `"72.4"`. But some domains give non-numeric states:

- Lights: `state = "on"` / `"off"` — range conditions never match against a string
- Cover/valve: `state = "open"` / `"closed"`
- Media players: `state = "playing"` / `"idle"`

For these, `ranges_attribute` tells LCARdS to compare range conditions against a named entity attribute instead of the entity state string. This affects **all** state maps on the card simultaneously — colours, borders, icons, and text.

### Special value: `brightness_pct`

Lights expose brightness as a raw `brightness` attribute in the range 0–255. Setting `ranges_attribute: brightness_pct` tells LCARdS to auto-compute a 0–100 percentage value (`Math.round(brightness / 2.55)`) so your thresholds can be written in familiar percentage terms.

### Example — light with brightness-based colour and icon

```yaml
type: custom:lcards-button
entity: light.tv
ranges_attribute: brightness_pct   # all range conditions compare against 0–100 brightness %
tap_action:
  action: toggle
show_icon: true
icon: mdi:lightbulb
icon_style:
  color:
    active: match-light
    inactive: "var(--lcards-orange)"
  icon:
    active: mdi:lightbulb
    inactive: mdi:lightbulb-off
    above:90: mdi:lightbulb-alert      # > 90 % brightness
    below:20: mdi:lightbulb-outline    # < 20 % brightness
style:
  card:
    color:
      background:
        active: "alpha(match-light, 0.5)"
        above:90: "var(--lcars-yellow)"
        default: "var(--ha-card-background)"
```

### Supported cards

`ranges_attribute` is a top-level key supported by `lcards-button`, `lcards-elbow`, and `lcards-slider`.

---
