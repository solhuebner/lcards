# LCARdS Overlay Cards - Debugging Guide

## Error Analysis: OVERLAY_REGISTRY is not defined

This error occurs when the module loading order causes the registry to be accessed before it's fully initialized.

## Debugging Steps for Home Assistant

1. **Open Browser Console** in Home Assistant
2. **Add debug parameter** to URL: `?lcards_log_level=debug`
3. **Look for these log messages** in console:

```
✅ Expected Success Messages:
[LCARdSOverlayCard] Registry created and exposed globally
[LCARdSTextCard] Text overlay registered in registry
[LCARdSButtonCard] Button overlay registered in registry
[OverlayCards] All overlay cards registered successfully

❌ Error Messages to Watch For:
[LCARdSTextCard] OVERLAY_REGISTRY is not defined - import order issue
[LCARdSButtonCard] OVERLAY_REGISTRY is not defined - import order issue
[OverlayCards] Failed to register overlay cards: ReferenceError
```

## Runtime Checks

Run these commands in browser console after LCARdS loads:

```javascript
// Check if registry exists
console.log('LCARDS_OVERLAY_REGISTRY:', window.LCARDS_OVERLAY_REGISTRY);

// Check custom elements
console.log('Text card defined:', customElements.get('lcards-text-card'));
console.log('Button card defined:', customElements.get('lcards-button-card'));

// Check core systems
console.log('LCARdS core:', window.lcards?.core);

// Check overlay cards module
console.log('Overlay cards:', window.lcards?.overlays);
```

## Expected Output

```javascript
LCARDS_OVERLAY_REGISTRY: {
  text: { class: TextOverlay, schema: {...} },
  button: { class: ButtonOverlay, schema: {...} }
}

Text card defined: class LCARdSTextCard extends LCARdSOverlayCard
Button card defined: class LCARdSButtonCard extends LCARdSOverlayCard

LCARdS core: { dataSource: {...}, theme: {...}, animation: {...} }

Overlay cards: { LCARdSTextCard: class, LCARdSButtonCard: class, ... }
```

## Troubleshooting

### If registry is empty `{}`
- Cards are loading but registration functions haven't completed
- Try refreshing page or check for import errors

### If registry is `undefined`
- Base class didn't load properly
- Check for webpack compilation errors
- Verify resource loading in Network tab

### If custom elements are `undefined`
- Element registration failed
- Check for JavaScript errors during load
- Verify lcards.js is loaded completely

### If cards show as defined but don't work
- Configuration or runtime errors
- Check for template processing issues
- Verify HASS object is available

## Test Configuration

Try this minimal configuration first:

```yaml
# Add to Home Assistant dashboard
type: custom:lcards-text-card
text: "Test Text"
position: { x: 50, y: 50 }
style:
  fontSize: "20px"
  color: "#FF9900"
```

## Manual Registry Fix (Emergency)

If the registry is broken, you can manually populate it:

```javascript
// Run in console after lcards loads
if (!window.LCARDS_OVERLAY_REGISTRY) {
    window.LCARDS_OVERLAY_REGISTRY = {};
}

// Check if overlays are available
if (window.lcards?.overlays) {
    // Registry should auto-populate, but if not:
    console.log('Overlays module loaded:', window.lcards.overlays);
}
```

## File Loading Order

The correct loading sequence is:
1. `lcards.js` (main entry)
2. `LCARdSOverlayCard.js` (creates empty registry)
3. `LCARdSTextCard.js` (populates registry.text)
4. `LCARdSButtonCard.js` (populates registry.button)
5. `index.js` (confirms registration)

If this order is disrupted, the registry errors occur.

## Production Fix Status

**Fixed Issues:**
- ✅ Defensive registry access with try/catch
- ✅ Async registration with existence checks
- ✅ Global registry exposure in base class
- ✅ Timeout-based logging to avoid timing issues

**Current Status:** Should work in HA environment
**Next Step:** Test with debug logging enabled