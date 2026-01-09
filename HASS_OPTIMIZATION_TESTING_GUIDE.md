# MSD Control Overlay HASS Optimization - Testing Guide

> **Testing Entity-Based Filtering for Control Overlays**
> Validate the 80-95% reduction in HASS update overhead

---

## 🎯 What Was Optimized

**Problem:** MSD control overlays updated ALL embedded cards on every HASS state change, even when only one entity changed.

**Solution:** Entity-based filtering tracks which entities each control uses and only updates affected controls.

**Expected Result:** 80-95% reduction in unnecessary control updates.

---

## 🧪 Testing Scenarios

### Scenario 1: Entity Tracking Verification

**Setup:**
1. Create an MSD card with multiple control overlays
2. Each control should use different entities

**Test Configuration:**
```yaml
type: custom:lcards-msd
overlays:
  - type: control
    id: control-kitchen-light
    card:
      type: light
      entity: light.kitchen
    position: [100, 100]
    size: [200, 100]
    
  - type: control
    id: control-living-light
    card:
      type: light
      entity: light.living_room
    position: [350, 100]
    size: [200, 100]
    
  - type: control
    id: control-temp-sensor
    card:
      type: sensor
      entity: sensor.temperature
    position: [100, 250]
    size: [200, 100]
```

**Console Commands:**
```javascript
// 1. Get the MSD card
const msdCard = document.querySelector('lcards-msd');

// 2. Get the controls renderer
const renderer = msdCard._msdPipeline.coordinator.controlsRenderer;

// 3. Enable manual HASS forwarding (required for optimization)
renderer._manualHassForwarding = true;

// 4. View entity tracking
console.log('Entity Map:', renderer._controlEntityMap);
// Expected output:
// Map {
//   'control-kitchen-light' => Set { 'light.kitchen' },
//   'control-living-light' => Set { 'light.living_room' },
//   'control-temp-sensor' => Set { 'sensor.temperature' }
// }

// 5. View control count
console.log('Total controls:', renderer.controlElements.size);
```

**✅ Pass Criteria:**
- Entity map shows correct entities per control
- Each control has at least one entity tracked

---

### Scenario 2: Selective Update Verification

**Setup:**
1. Enable performance tracking
2. Toggle one light entity
3. Verify only one control updates

**Console Commands:**
```javascript
// 1. Get renderer and enable tracking
const msdCard = document.querySelector('lcards-msd');
const renderer = msdCard._msdPipeline.coordinator.controlsRenderer;
renderer._manualHassForwarding = true;
renderer._perfTracking.enabled = true;

// 2. Wait a few seconds for HASS updates

// 3. Check performance stats
console.log(renderer.getPerformanceStats());
// Expected output:
// {
//   totalUpdates: 42,
//   avgUpdateTimeMs: '1.23',
//   avgEntitiesChanged: '2.4',
//   avgControlsUpdated: '1.8',  // << Should be much less than totalControls
//   totalControls: 3,
//   efficiencyGain: '82.0% reduction'  // << Should be 70-95%
// }
```

**Actions to Take:**
1. Toggle kitchen light via UI or dev tools
2. Wait 2 seconds
3. Check stats again
4. Toggle living room light
5. Wait 2 seconds
6. Check stats again

**✅ Pass Criteria:**
- `avgControlsUpdated` is significantly less than `totalControls`
- `efficiencyGain` shows 70-95% reduction
- Single entity toggle updates only 1-2 controls (not all)

---

### Scenario 3: Entity Change Detection

**Setup:**
1. Monitor entity changes in real-time
2. Verify early exit when no entities change

**Console Commands:**
```javascript
const msdCard = document.querySelector('lcards-msd');
const renderer = msdCard._msdPipeline.coordinator.controlsRenderer;
renderer._manualHassForwarding = true;

// Monkey-patch _detectEntityChanges to log results
const originalDetect = renderer._detectEntityChanges.bind(renderer);
renderer._detectEntityChanges = function(oldHass, newHass) {
  const result = originalDetect(oldHass, newHass);
  console.log('Entity changes detected:', result.size, Array.from(result));
  return result;
};

// Now watch console when toggling entities
```

**Actions to Take:**
1. Toggle light.kitchen
2. Observe console: Should show 1 entity changed
3. Toggle sensor.temperature (if you have one)
4. Observe console: Should show 1 entity changed
5. Wait for HASS updates with no state changes
6. Observe console: Should show 0 entities changed (early exit)

**✅ Pass Criteria:**
- Only changed entities are detected
- Zero changes result in early exit (logged)
- Console shows selective updates

---

### Scenario 4: Multiple Entity Control

**Setup:**
1. Create a control that uses multiple entities (entities card)
2. Verify it updates when ANY of its entities change

**Test Configuration:**
```yaml
type: custom:lcards-msd
overlays:
  - type: control
    id: control-multi-entity
    card:
      type: entities
      entities:
        - light.kitchen
        - light.living_room
        - sensor.temperature
    position: [100, 100]
    size: [300, 200]
    
  - type: control
    id: control-single
    card:
      type: light
      entity: light.bedroom
    position: [450, 100]
    size: [200, 100]
```

**Console Commands:**
```javascript
const renderer = document.querySelector('lcards-msd')._msdPipeline.coordinator.controlsRenderer;
renderer._manualHassForwarding = true;

// Check entity tracking
console.log('Multi-entity control:', renderer._controlEntityMap.get('control-multi-entity'));
// Expected: Set { 'light.kitchen', 'light.living_room', 'sensor.temperature' }

console.log('Single-entity control:', renderer._controlEntityMap.get('control-single'));
// Expected: Set { 'light.bedroom' }
```

**Actions to Take:**
1. Toggle light.kitchen → Multi-entity control updates
2. Toggle light.bedroom → Only single control updates
3. Change sensor.temperature → Multi-entity control updates

**✅ Pass Criteria:**
- Multi-entity control tracks all entities
- Multi-entity control updates when ANY entity changes
- Single-entity control only updates for its entity

---

### Scenario 5: Performance Benchmark

**Setup:**
1. Dashboard with 10+ control overlays
2. Measure before/after optimization

**Test Configuration:**
Create MSD with 10 control overlays using different entities.

**Console Commands:**
```javascript
const msdCard = document.querySelector('lcards-msd');
const renderer = msdCard._msdPipeline.coordinator.controlsRenderer;

// Test WITHOUT optimization (automatic mode)
renderer._manualHassForwarding = false;
console.log('=== Automatic Mode (no optimization) ===');
// Toggle a light and observe - all controls update

// Wait 5 seconds

// Test WITH optimization (manual mode)
renderer._manualHassForwarding = true;
renderer._perfTracking.enabled = true;
console.log('=== Optimized Mode (entity filtering) ===');
// Toggle the same light and observe - only 1 control updates

// Wait 30 seconds for some HASS updates

// Check results
console.log(renderer.getPerformanceStats());
```

**✅ Pass Criteria:**
- Automatic mode: All controls update on every change (visible in logs)
- Optimized mode: Only affected controls update (visible in logs)
- Performance stats show 80-95% efficiency gain

---

## 🐛 Debugging

### View Entity Extraction

```javascript
const renderer = document.querySelector('lcards-msd')._msdPipeline.coordinator.controlsRenderer;

// View all tracked entities
for (const [controlId, entities] of renderer._controlEntityMap) {
  console.log(`${controlId}:`, Array.from(entities));
}
```

### Monitor HASS Updates

```javascript
const renderer = document.querySelector('lcards-msd')._msdPipeline.coordinator.controlsRenderer;

// Patch setHass to log every call
const originalSetHass = renderer.setHass.bind(renderer);
let updateCount = 0;
renderer.setHass = function(hass) {
  updateCount++;
  console.log(`[HASS Update #${updateCount}]`, {
    controlsSize: this.controlElements.size,
    manualForwarding: this._manualHassForwarding
  });
  return originalSetHass(hass);
};
```

### Check Log Level

```javascript
// Set debug level to see all optimization logs
window.lcards.setGlobalLogLevel('debug');

// Or trace for even more detail
window.lcards.setGlobalLogLevel('trace');
```

---

## 📊 Expected Results Summary

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| **Controls updated per change** | 10 | 1-2 | 80-95% reduction |
| **Update time** | 50ms | 5ms | 80-95% faster |
| **Unnecessary updates** | 90% | 0% | 100% eliminated |
| **CPU time (100 updates/sec)** | 5000ms/sec | 500ms/sec | 90% savings |

---

## ✅ Validation Checklist

- [ ] Entity tracking correctly identifies entities per control
- [ ] Single entity change updates only affected controls
- [ ] Zero entity changes result in early exit (no updates)
- [ ] Multi-entity controls update when ANY entity changes
- [ ] Performance stats show 70-95% efficiency gain
- [ ] All card types still work correctly (LCARdS, HA, custom)
- [ ] No JavaScript errors in console
- [ ] Cards respond to actions (toggle, dimming, etc.)
- [ ] Cards show correct state after entity changes

---

## 🚨 Known Issues

**Issue:** Cards don't update when toggled

**Cause:** Manual HASS forwarding not enabled

**Fix:**
```javascript
document.querySelector('lcards-msd')._msdPipeline.coordinator.controlsRenderer._manualHassForwarding = true;
```

---

**Issue:** All controls still updating on every change

**Cause:** Manual forwarding disabled OR entity extraction failed

**Debug:**
```javascript
const renderer = document.querySelector('lcards-msd')._msdPipeline.coordinator.controlsRenderer;
console.log('Manual forwarding:', renderer._manualHassForwarding);
console.log('Entity map:', renderer._controlEntityMap);
```

**Fix:** Enable manual forwarding and verify entity map is populated.

---

## 📝 Notes

- Entity-based optimization only works when `_manualHassForwarding = true`
- When `_manualHassForwarding = false`, system relies on HA component tree (may not work in shadow DOM)
- Performance tracking must be explicitly enabled via `_perfTracking.enabled = true`
- First HASS update after page load will update all controls (no previous state to compare)
- Entity extraction supports: direct `entity`, `entities` array, nested `config.entity`, nested `config.entities`

---

**Last Updated:** 2026-01-09  
**Version:** v1.11.0+
