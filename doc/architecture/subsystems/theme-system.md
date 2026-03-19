# Theme System

> **`window.lcards.core.themeManager`** — Token-based theming with alert-mode palette transformations.

---

## Overview

`ThemeManager` extends `BaseService`. It holds a registry of loaded themes, resolves token paths to concrete values, and manages the active theme. During alert mode it injects palette transforms directly into CSS custom properties so all cards update without re-rendering.

---

## Key Classes

| Class | File | Role |
|---|---|---|
| `ThemeManager` | `core/themes/ThemeManager.js` | Theme registry, activation, token resolution |
| `ThemeTokenResolver` | `core/themes/ThemeTokenResolver.js` | Path-based token lookup (`palette.moonlight` etc.) |
| `paletteInjector` | `core/themes/paletteInjector.js` | Writes CSS custom properties for alert palette swaps |
| `alertModeTransform` | `core/themes/alertModeTransform.js` | Loads per-alert-condition colour transforms from helpers |
| `alertTransitions` | `core/themes/alertTransitions.js` | Smooth CSS colour transitions during alert state change |

---

## Theme Token Structure

```javascript
{
  palette: {
    moonlight: '#99ccff',
    'alert-red': '#ff2d2d',
    // ...
  },
  spacing: { small: '4px', medium: '8px', large: '16px' },
  borders: { radius: '8px', width: '2px' },
  components: {
    button: { background: '{palette.moonlight}', height: '40px' },
    // ...
  }
}
```

Tokens can reference other tokens by path: `'{palette.moonlight}'`.

---

## Built-in Themes

| ID | Description |
|---|---|
| `lcars-default` | Standard LCARS orange/blue palette |
| `lcars-dark` | Dark variant |
| `cb-lcars` | Retro CB-LCARS compatible palette |

---

## Token Usage

In card config any colour or style field accepts a theme token:

```yaml
style:
  background: "{theme:palette.moonlight}"
  border-color: "{theme:palette.alert-red}"
```

In JavaScript:

```javascript
const theme = window.lcards.core.themeManager.getCurrentTheme();
const color = theme.palette.moonlight;
```

---

## Alert Mode Integration

When alert mode changes, `paletteInjector` replaces CSS custom properties on `:root`, applying colour transforms from `ALERT_MODE_TRANSFORMS`. Cards using theme tokens in CSS see the change immediately — no re-render needed.

Transform spec:

```javascript
ALERT_MODE_TRANSFORMS['red'] = {
  'palette.moonlight': '#ff2d2d',
  'palette.background': '#2a0000',
  // ...
}
```

---

## Runtime API

```javascript
const tm = window.lcards.core.themeManager;
tm.getCurrentTheme()         // active theme object
tm.setActiveTheme('cb-lcars')
tm.resolveToken('palette.moonlight')
tm.getRegisteredThemes()     // Map of all loaded themes
```

---

## See Also

- [Alert Mode](../../core/alert-mode.md)
- [Pack System](pack-system.md)
