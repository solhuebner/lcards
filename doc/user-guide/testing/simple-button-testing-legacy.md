# Simple Button Card - Testing Guide

**Version:** 1.10.69
**Purpose:** Systematic testing of all configuration options
**Use:** Copy test configs to Lovelace dashboard for verification

---

## Quick Test Setup

Add these cards to a test dashboard to verify all features work correctly.

---

## Test 1: Basic Rendering

```yaml
type: custom:lcards-simple-button
label: "Basic Button"
```

**Expected:**
- Orange button (default theme color)
- Black text
- Label reads "Basic Button"

---

## Test 2: Entity Binding (State Changes)

```yaml
type: custom:lcards-simple-button
entity: light.living_room
label: "Living Room Light"
style:
  card:
    color:
      background:
        active: 'var(--lcars-orange)'
        inactive: 'var(--lcars-gray)'
        unavailable: 'var(--lcars-ui-red)'
  text:
    label:
      color:
        active: black
        inactive: 'var(--lcars-color-text-disabled)'
```

**Test Actions:**
1. Toggle light ON → Button turns orange, text black
2. Toggle light OFF → Button turns gray, text dim
3. Make entity unavailable → Button turns red

**Expected:** Colors change **instantly** without page refresh.

---

## Test 3: Computed Tokens (Alpha)

```yaml
type: custom:lcards-simple-button
entity: switch.coffee_maker
label: "Coffee Maker"
style:
  card:
    color:
      background:
        active: 'var(--lcars-orange)'
        inactive: alpha(colors.accent.primary, 0.5)
        unavailable: alpha(colors.ui.error, 0.3)
```

**Verification:**
1. Inspect DOM (F12)
2. Look at `<path fill="...">` attribute
3. Should see: `color-mix(in srgb, var(--lcars-orange) 50%, transparent)`
4. Should NOT see: `alpha(colors.accent.primary, 0.5)` as literal text

**Expected:** Computed tokens resolve to CSS `color-mix()`.

---

## Test 4: Computed Tokens (Darken/Lighten)

```yaml
type: custom:lcards-simple-button
label: "Darken Test"
style:
  card:
    color:
      background:
        active: darken(colors.accent.primary, 30)
```

```yaml
type: custom:lcards-simple-button
label: "Lighten Test"
style:
  card:
    color:
      background:
        active: lighten(colors.accent.primary, 40)
```

**Verification:** Inspect DOM, should see `color-mix()` with black/white mixing.

---

## Test 5: Theme Tokens

```yaml
type: custom:lcards-simple-button
entity: light.bedroom
label: "Theme Token Test"
style:
  card:
    color:
      background:
        active: theme:components.button.base.background.active
        inactive: theme:components.button.base.background.inactive
  text:
    label:
      color:
        active: theme:components.button.base.text.active
```

**Expected:** Colors resolve from theme configuration.

---

## Test 6: CSS Variables

```yaml
type: custom:lcards-simple-button
label: "CSS Var Test"
style:
  card:
    color:
      background:
        active: var(--ha-card-background)
  border_radius: var(--ha-card-border-radius, 12px)
  font_size: var(--paper-font-body1_-_font-size, 14px)
```

**Expected:** CSS variables pass through unchanged, browser resolves at runtime.

---

## Test 7: Per-Corner Radius

```yaml
type: custom:lcards-simple-button
label: "Asymmetric"
style:
  card:
    color:
      background:
        active: 'var(--lcars-blue)'
  border_radius:
    top_left: 30px
    top_right: 4px
    bottom_right: 30px
    bottom_left: 4px
```

**Expected:** Top-left and bottom-right have large radius, others sharp.

---

## Test 8: Lozenge Preset

```yaml
type: custom:lcards-simple-button
preset: lozenge
entity: climate.living_room
label: "Climate Control"
style:
  card:
    color:
      background:
        active: 'var(--lcars-yellow)'
```

**Expected:** Tall lozenge shape (large corner radius), yellow when active.

---

## Test 9: Icon (Left Position)

```yaml
type: custom:lcards-simple-button
entity: light.kitchen
label: "Kitchen"
icon:
  type: mdi
  icon: lightbulb
  position: left
  color: black
  size: 24
style:
  card:
    color:
      background:
        active: 'var(--lcars-yellow)'
        inactive: 'var(--lcars-gray)'
```

**Expected:** Lightbulb icon on left side, black color, 24px size.

---

## Test 10: Icon (Right Position)

```yaml
type: custom:lcards-simple-button
label: "GitHub"
icon:
  type: si
  icon: github
  position: right
  color: white
  size: 20
style:
  card:
    color:
      background:
        active: 'black'
  text:
    label:
      color:
        active: white
```

**Expected:** GitHub icon on right side, white color, 20px size.

---

## Test 11: Typography

```yaml
type: custom:lcards-simple-button
label: "Custom Font"
style:
  font_size: 20px
  font_weight: 900
  font_family: "'Courier New', monospace"
  card:
    color:
      background:
        active: 'var(--lcars-purple)'
  text:
    label:
      color:
        active: white
```

**Expected:** Large, bold, monospace text.

---

## Test 12: Actions (Tap/Hold/Double-Tap)

```yaml
type: custom:lcards-simple-button
entity: light.test
label: "Action Test"
tap_action:
  action: toggle
hold_action:
  action: more-info
double_tap_action:
  action: call-service
  service: light.turn_on
  service_data:
    entity_id: light.test
    brightness: 255
```

**Test Actions:**
1. **Tap** → Light toggles
2. **Hold (2 seconds)** → More info dialog appears
3. **Double-tap** → Light turns on at full brightness

---

## Test 13: Backward Compatibility (Flat Schema)

```yaml
type: custom:lcards-simple-button
label: "Flat Schema"
style:
  background_color: 'var(--lcars-green)'
  text_color: black
  border_color: 'var(--lcars-gray)'
  border_width: 2px
  border_radius: 8px
```

**Expected:** Works despite using deprecated flat keys.

---

## Test 14: Rules Engine

```yaml
type: custom:lcards-simple-button
entity: sensor.temperature
label: "Temperature"
style:
  card:
    color:
      background:
        default: 'var(--lcars-blue)'
  text:
    label:
      color:
        default: white
rules:
  - conditions:
      - entity: sensor.temperature
        above: 75
    style_patch:
      card:
        color:
          background:
            default: 'var(--lcars-ui-red)'

  - conditions:
      - entity: sensor.temperature
        below: 60
    style_patch:
      card:
        color:
          background:
            default: 'var(--lcars-ui-blue)'
```

**Test Scenarios:**
- Temp > 75°F → Red
- Temp 60-75°F → Blue (default)
- Temp < 60°F → Blue (cold blue)

---

## Test 15: Nested Schema + Computed Tokens

```yaml
type: custom:lcards-simple-button
entity: binary_sensor.motion
label: "Motion Sensor"
style:
  card:
    color:
      background:
        active: 'var(--lcars-ui-red)'
        inactive: alpha(colors.accent.primary, 0.3)
        unavailable: darken(colors.ui.error, 50)
  text:
    label:
      color:
        active: white
        inactive: lighten(colors.ui.text, 20)
        unavailable: 'var(--lcars-ui-red)'
  border_radius:
    top_left: 20px
    top_right: 8px
    bottom_right: 20px
    bottom_left: 8px
```

**Complexity Test:** Multiple features together:
- Nested CB-LCARS schema
- Computed tokens in multiple states
- Per-corner radius
- State-based text colors

---

## Test 16: Theme Token + Computed Token (Nested Resolution)

```yaml
type: custom:lcards-simple-button
entity: switch.test
label: "Nested Resolution"
style:
  card:
    color:
      background:
        inactive: theme:components.button.base.background.inactive
```

**Note:** If theme defines `inactive` as `alpha(colors.accent.primary, 0.7)`, it should:
1. Resolve `theme:...` → `alpha(...)`
2. Resolve `alpha(...)` → `color-mix(...)`

**Expected:** Two-level resolution works correctly.

---

## Test 17: Edge Case - No Entity

```yaml
type: custom:lcards-simple-button
label: "No Entity"
style:
  card:
    color:
      background:
        active: 'var(--lcars-purple)'
        inactive: 'var(--lcars-gray)'  # Never used (no entity)
```

**Expected:** Always uses `active` state (no entity to check).

---

## Test 18: Edge Case - Invalid Entity

```yaml
type: custom:lcards-simple-button
entity: light.does_not_exist
label: "Invalid Entity"
style:
  card:
    color:
      background:
        unavailable: 'var(--lcars-ui-red)'
```

**Expected:** Uses `unavailable` state (entity doesn't exist).

---

## Test 19: Edge Case - Malformed Computed Token

```yaml
type: custom:lcards-simple-button
label: "Bad Token"
style:
  card:
    color:
      background:
        active: alpha(invalid.path.here, 0.7)
```

**Expected:** Graceful fallback (doesn't crash), logs warning to console.

---

## Test 20: Performance Test (Many Buttons)

Create 20+ buttons with different entities:

```yaml
type: horizontal-stack
cards:
  - type: custom:lcards-simple-button
    entity: light.1
    label: "Light 1"
  - type: custom:lcards-simple-button
    entity: light.2
    label: "Light 2"
  # ... repeat for 20+ lights
```

**Test:**
1. Toggle all lights rapidly
2. Check for flicker or lag
3. Open browser console, check for errors

**Expected:** Smooth updates, no console errors, no memory leaks.

---

## Verification Checklist

After running all tests, verify:

### Rendering
- [ ] All buttons render correctly
- [ ] No console errors on page load
- [ ] No console errors on state changes

### Colors
- [ ] Nested schema works (`card.color.background.active`)
- [ ] Flat schema works (backward compat)
- [ ] State changes update colors instantly
- [ ] CSS variables resolve correctly
- [ ] Theme tokens resolve correctly
- [ ] Computed tokens render as `color-mix()` (not literal text)

### Computed Tokens
- [ ] `alpha()` works
- [ ] `darken()` works
- [ ] `lighten()` works
- [ ] Computed tokens work in nested schema
- [ ] Nested resolution (theme → computed) works

### Layout
- [ ] Border radius applies correctly
- [ ] Per-corner radius works independently
- [ ] CSS variable radius works

### Icons
- [ ] Material Design icons render
- [ ] Simple Icons render
- [ ] Icon position left/right works
- [ ] Icon color applies
- [ ] Icon size applies

### Typography
- [ ] Font size applies
- [ ] Font weight applies
- [ ] Font family applies

### Actions
- [ ] Tap action works
- [ ] Hold action works
- [ ] Double-tap action works

### Rules
- [ ] Rules apply patches
- [ ] Rules override config styles
- [ ] Rules trigger on state changes

### Edge Cases
- [ ] No entity doesn't crash
- [ ] Invalid entity shows unavailable
- [ ] Malformed tokens fail gracefully

### Performance
- [ ] Many buttons render efficiently
- [ ] State changes don't lag
- [ ] No memory leaks

---

## Test Environment

**Browser:** Chrome/Firefox/Safari
**Home Assistant Version:** 2024.x+
**LCARdS Version:** 1.10.69+

**Setup:**
1. Create test dashboard
2. Add test light entities (or use existing)
3. Copy configs from this guide
4. Verify each test systematically

---

## Reporting Issues

If any test fails, report with:

1. **Test number** that failed
2. **Expected behavior** (from guide)
3. **Actual behavior** (what you saw)
4. **Browser console errors** (F12 → Console)
5. **DOM inspection** (F12 → Elements, inspect button SVG)
6. **Home Assistant version**
7. **LCARdS version**

---

**Status:** Ready for systematic testing
**Version:** 1.10.69
