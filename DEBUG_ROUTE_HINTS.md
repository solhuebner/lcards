# Route Hint Debugging Guide

## Step 1: Enable Debug Logging

Open your browser's Developer Console (F12) and run:

```javascript
window.lcards.setGlobalLogLevel('debug');
```

This will show all routing decisions in the console.

## Step 2: Inspect Your Line Configuration

In the console, run this to see your line's actual config:

```javascript
// Get the MSD card element (adjust selector if needed)
const msd = document.querySelector('lcards-msd');

// Check the overlays config
console.log('Overlays:', msd.config.overlays);

// Find your specific line (adjust line_3 to your line ID)
const line3 = msd.config.overlays.find(o => o.id === 'line_3');
console.log('line_3 config:', line3);
console.log('route_hint:', line3.route_hint);
console.log('route_hint_last:', line3.route_hint_last);
```

## Step 3: Check What RouterCore Receives

Add this temporary logging to see what the router receives. In console:

```javascript
// Check if RouterCore is getting the hint
const core = window.lcards.core;
console.log('Core available:', !!core);
```

## Step 4: Force Re-render

After changing route_hint in the UI, force the card to re-render:

```javascript
const msd = document.querySelector('lcards-msd');
msd.requestUpdate();
```

## Step 5: Look for These Debug Messages

With debug logging enabled, you should see messages like:

```
[RouterCore] Waypoint 'channel_1': Using explicit route_hint (xy) for detour direction: horizontal
[RouterCore] Waypoint 'channel_1': Forcing horizontal detour through center (...)
```

If you see:
- `Using channel direction` instead → route_hint is NOT being passed
- `undefined` for modeHint → hint is not being parsed from config

## Step 6: Check SVG Output

Inspect the rendered SVG line element:

```javascript
const svg = document.querySelector('lcards-msd').shadowRoot.querySelector('svg');
const line3Path = svg.querySelector('path[data-overlay-id="line_3"]');
console.log('Line 3 path:', line3Path.getAttribute('d'));
console.log('Routing strategy:', line3Path.getAttribute('data-routing-strategy'));
```

## Expected Behavior

For a line with `route_hint: 'xy'` (horizontal first):
- Should see: "Using explicit route_hint (xy) for detour direction: horizontal"
- Path should start with horizontal segment: `M x1,y1 L x2,y1 ...` (Y stays same)

For a line with `route_hint: 'yx'` (vertical first):
- Should see: "Using explicit route_hint (yx) for detour direction: vertical"
- Path should start with vertical segment: `M x1,y1 L x1,y2 ...` (X stays same)

## Common Issues

1. **Empty string ''** - If route_hint is empty string, it uses channel direction
2. **Not saving** - Check if the hint is actually in the YAML config
3. **Wrong channel mode** - If channel mode is 'avoid' not 'force', waypoint routing won't trigger
4. **Build not loaded** - Make sure you copied dist/lcards.js to HA after running `npm run build`

## Quick Test Line Config

```yaml
- id: test_line_xy
  type: line
  anchor_to: overlay_1
  attach_to: overlay_2
  route: auto
  route_hint: 'xy'  # Horizontal first
  route_channels:
    - my_channel
  route_channel_mode: force
  style:
    color: '#FF00FF'
    width: 3
```

Change `route_hint` between 'xy', 'yx', and '' to see the difference.
