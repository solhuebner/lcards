# Coming from CB-LCARS

LCARdS originates from, and supersedes, the [CB-LCARS](https://github.com/snootched/cb-lcars) project.

!!! tip "You can run both simultaneously"
    CB-LCARS and LCARdS can coexist while you transition. All new features and fixes will be made in LCARdS only going forward.

Use this table to quickly find the LCARdS equivalent for each CB-LCARS card or feature.

---

## Feature Comparison

✅ Present | ❌ Not present | ⚠️ Partial

| Feature | CB-LCARS | LCARdS | Notes |
|---|:---:|:---:|---|
| Buttons | ✅ `cb-lcars-button-card` | ✅ `lcards-button` | Built-in `preset` collection provides the standard LCARS button styles, which are completely configurable. |
| Multi-Segment Buttons | ❌ | ✅ `lcards-button` | Allows complex button designs (known as `component`) to be used as advanced multi-segment/multi-touch controls, configured via `segments`. |
| DPAD | ✅ `cb-lcars-dpad-card` | ✅ `lcards-button` | First advanced button to use the `component` feature of `lcards-button`. |
| ALERT | ⚠️ background animation | ✅ `lcards-button` | Promoted to a button card component — allows full interactive configuration. |
| Labels | ✅ `cb-lcars-label-card` | ✅ `lcards-button` | Label functionality is available via `lcards-button`. Additional presets available for text labels with or without decoration. |
| Elbows | ✅ `cb-lcars-elbow-card` | ✅ `lcards-elbow` | Equivalent in LCARdS — enhanced with more corner styles (e.g. straight cut with configurable angles). |
| Double Elbows | ✅ `cb-lcars-double-elbow-card` | ✅ `lcards-elbow` | Double Elbow functionality is now consolidated into a single unified `lcards-elbow` card. |
| Sliders | ✅ `cb-lcars-multimeter-card` | ✅ `lcards-slider` | Completely replacing the former multimeter card. Vastly improved — configurable direction, inversion, display min/max, control min/max, and more. |
| Cascade Data Grid | ⚠️ background animation | ✅ `lcards-data-grid` | CB-LCARS provided a decorative-only version as a background animation. `lcards-data-grid` is a full-featured grid that can show real entity data, text, etc. Decorative mode is still available. |
| Charts / Graphs | ❌ | ✅ `lcards-chart` | Embedded ApexCharts library providing 15+ chart types to plot entity/data. |
| MSD (Master Systems Display) | ❌ | ✅ `lcards-msd` | Full MSD system in a card. Embed controls, connect routing lines, add animations to reflect statuses. |
| Background Animations | ✅ GRID, ALERT, GEO Array, Pulsewave | ⚠️ ✅ | Background animations split into stackable layers — mix and match building blocks. ✅ GRID (enhanced), ✅ ALERT (button component), ✅ Starfield & Nebula (enhanced). ⚠️ GEO Array, Pulsewave (pending). |
| Element Animations | ❌ | ✅ | Embedded Anime.js v4 enabling animation of any SVG element (cards, lines/stroke, text, etc.). |
| Symbiont (embedded cards) | ✅ | ✅ | Available in Elbow card — attempts native card injection for basic style imprinting. Add `card_mod` config for advanced styling. |
| State-based Styling / Custom States | ✅ | ✅✅ | CB-LCARS has a limited set of states. LCARdS uses common state groupings (`default` \| `active` \| `inactive` \| `unavailable`) plus the ability to define ***any state*** for customised styling. Integrates with the core rules engine for hot-patching. |
| Sounds | ❌ | ✅ | Customisable sounds for many UI and card event types (tap, double tap, hold, hover, sidebar expand/collapse, and more). |
| Alert Overlay | ❌ | ✅ `lcards-alert-overlay` | Dashboard-level card that reacts to `input_select.lcards_alert_mode` and displays a full-screen configurable backdrop with an embedded content card. |

---

## Key Differences

### Unified Core vs. Standalone Cards

CB-LCARS cards are largely independent. LCARdS cards share a **common core** — the Rules Engine, DataSource Manager, Theme Manager, and other services operate once per dashboard and serve all cards together. This enables cross-card coordination that CB-LCARS could not achieve.

### Preset System

LCARdS has a formal **preset system** (via packs) that replaces CB-LCARS's implicit styling approach. Named presets for buttons, sliders, and elbows are loaded once and applied by name.

### Template System

Any text field in any LCARdS card supports four template syntaxes (JavaScript, LCARdS tokens, DataSource, and Jinja2) — far more powerful than CB-LCARS's variable substitution.
