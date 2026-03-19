# Style Preset Manager

> **`window.lcards.core.stylePresetManager`** — Central registry of named style presets for buttons, sliders, and elbows.

---

## Overview

`StylePresetManager` stores named preset objects loaded from packs. When a card config declares `preset: lozenge`, the manager resolves the full style definition so the card never needs to hard-code shape geometry or default sizes.

---

## File

`src/core/presets/StylePresetManager.js`

---

## Preset Namespacing

Presets are keyed by `type.name`, e.g. `button.lozenge`, `slider.pills`, `elbow.header_left`. The card type is always implicit from the registering pack.

---

## Pack Registration

Packs contributed through `style_presets`:

```javascript
export const BUTTONS_PACK = {
  style_presets: {
    button: {
      lozenge: {
        shape: 'lozenge',
        height: 40,
        border_radius: 20,
        // ...
      },
      bullet: { shape: 'bullet', ... },
      pill:   { shape: 'pill',   ... },
    }
  }
};
```

---

## Preset Resolution

Cards call the manager to retrieve a merged style object:

```javascript
const spm = window.lcards.core.stylePresetManager;

// Returns preset object or null
const preset = spm.getPreset('button', 'lozenge');

// List available presets for a type
spm.getPresetIds('button')   // ['lozenge', 'bullet', 'capped', ...]
```

Card config `style` always merges *on top of* the preset, so any field can be overridden per-card.

---

## Built-in Presets

| Type | Presets |
|---|---|
| `button` | `lozenge`, `bullet`, `capped`, `outline`, `pill`, `text`, `icon` |
| `slider` | `pills`, `gauge` |
| `elbow` | `header_left`, `header_right`, `footer_left`, `footer_right` |

---

## See Also

- [Pack System](pack-system.md)
- [Button Card](../../cards/button/)
- [Slider Card](../../cards/slider-card/)
