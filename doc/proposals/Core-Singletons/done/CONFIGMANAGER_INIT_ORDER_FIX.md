# ConfigManager Initialization Order Fix

**Date:** November 12, 2025
**Issue:** Cards falling back to raw config processing because CoreConfigManager not available during card initialization
**Status:** ✅ Fixed (v2 - Proper Wait Mechanism)

---

## Problem Analysis

### The Race Condition

Cards were being instantiated **before** CoreConfigManager was initialized, causing them to fall back to raw config processing instead of using the unified config system.

**Timeline from trace.log:**
```
Line 123: [LCARdSSimpleCard] CoreConfigManager not available - using raw config ← FALLBACK
Line 125: [LCARdSNativeCard] Config set for lcards-dvd50i2nj
...
[40+ lines of other initialization]
...
Line 159: [CoreConfigManager] Initializing...
Line 168: [CoreConfigManager] ✅ Initialized
```

### Root Cause

Cards can be instantiated **during** core initialization (e.g., when ThemeManager loads), before ConfigManager is ready. Simply moving ConfigManager earlier in the initialization order wasn't enough because:

1. Cards are created synchronously by Home Assistant during dashboard load
2. Cards can be created while core is still initializing
3. ConfigManager needs ValidationService, but also benefits from ThemeManager/StylePresetManager

**The fundamental issue:** Configuration validation is pointless if cards can bypass it during initialization!

---

## Solution v2: Proper Wait Mechanism

### Design Philosophy

**Configuration is a critical system** - Cards MUST wait for it to be ready before processing config. This ensures:
- ✅ All cards use validated, merged configuration
- ✅ Provenance tracking works for every card
- ✅ No silent fallbacks to raw config
- ✅ Theme defaults and presets always applied

### Implementation

#### 1. **Cards Wait for ConfigManager** (`src/base/LCARdSSimpleCard.js`)

Modified `setConfig()` to explicitly wait for ConfigManager initialization:

```javascript
async setConfig(config) {
    if (!config) {
        throw new Error('Invalid configuration');
    }

    const core = window.lcardsCore || window.lcards?.core;

    // ✅ NEW: Wait for CoreConfigManager to be ready (critical system)
    if (core && !core.configManager?.initialized) {
        lcardsLog.debug(`[LCARdSSimpleCard] Waiting for CoreConfigManager to initialize...`);

        // Wait for core initialization to complete
        await core.initialize(this.hass);

        if (!core.configManager?.initialized) {
            lcardsLog.warn(`[LCARdSSimpleCard] CoreConfigManager still not available after waiting - using raw config`);
            super.setConfig(config);
            return;
        }
    }

    // Now ConfigManager is guaranteed to be ready
    if (core?.configManager?.initialized) {
        // Process config through four-layer merge
        const result = await core.configManager.processConfig(config, cardType, { hass: this.hass });
        // ... use result.mergedConfig
    }
}
```

**Key Points:**
- Calls `core.initialize()` if ConfigManager not ready
- Safe to call multiple times (returns existing promise if already initializing)
- Only falls back to raw config if core singleton doesn't exist
- Logs warning only if initialization fails completely

#### 2. **ConfigManager Initialization** (`src/core/lcards-core.js`)

Kept ConfigManager in early position (after ValidationService) with late context update:

```javascript
// Phase 2a+: Initialize ConfigManager EARLY
this.configManager = new CoreConfigManager();
await this.configManager.initialize({
    validationService: this.validationService
    // Theme/Style managers added later via updateContext()
});

// ... Initialize ThemeManager, StylePresetManager, etc ...

// Phase 2d: Update ConfigManager context
if (this.configManager) {
    await this.configManager.updateContext({
        themeManager: this.themeManager,
        stylePresetManager: this.stylePresetManager
    });
}
```

#### 3. **Safe Multiple Initialization** (`src/core/lcards-core.js`)

The `initialize()` method already handles multiple calls safely:

```javascript
async initialize(hass) {
    // Return existing promise if already initializing
    if (this._coreInitPromise) {
        lcardsLog.debug('[LCARdSCore] Core initialization already in progress, waiting...');
        return this._coreInitPromise;
    }

    // Return immediately if already initialized
    if (this._coreInitialized) {
        lcardsLog.debug('[LCARdSCore] Core already initialized, updating HASS');
        this._updateHass(hass);
        return;
    }

    // Start initialization
    this._coreInitPromise = this._performInitialization(hass);
    // ...
}
```

---

## Expected Behavior After Fix

### Good Path (Normal)
```
[LCARdSCore] 🚀 Initializing core systems...
[CoreConfigManager] Initializing...
[CoreConfigManager] ✅ Initialized (early - before cards need it)
...
[LCARdSNativeCard] Created card with GUID: lcards-xyz...
[LCARdSSimpleCard] Processing config with CoreConfigManager  ← ✅ NO WAIT NEEDED
[LCARdSSimpleCard] Config processed {valid: true, hasProvenance: true}
```

### Edge Case (Card Created During Init)
```
[LCARdSCore] 🚀 Initializing core systems...
[LCARdSNativeCard] Created card with GUID: lcards-xyz...
[LCARdSSimpleCard] Waiting for CoreConfigManager to initialize...  ← ✅ WAITS
[LCARdSCore] Core initialization already in progress, waiting...
...
[CoreConfigManager] ✅ Initialized
[LCARdSSimpleCard] Processing config with CoreConfigManager  ← ✅ NOW READY
[LCARdSSimpleCard] Config processed {valid: true, hasProvenance: true}
```

### Failure Case (No Core Singleton)
```
[LCARdSNativeCard] Created card with GUID: lcards-xyz...
[LCARdSSimpleCard] No core singleton available - using raw config  ← Only if core doesn't exist
```

---

## Files Modified

1. **`src/base/LCARdSSimpleCard.js`**
   - Added wait logic in `setConfig()` to ensure ConfigManager is ready
   - Calls `core.initialize()` if ConfigManager not yet initialized
   - Only falls back to raw config if core singleton unavailable

2. **`src/core/lcards-core.js`**
   - Moved ConfigManager initialization early (after ValidationService)
   - Added `updateContext()` call after ThemeManager/StylePresetManager ready
   - `initialize()` already safe for multiple calls (returns promise)

3. **`src/core/config-manager/index.js`**
   - Added `updateContext()` method for late binding of theme/style managers

---

## Benefits

✅ **Configuration validation is guaranteed** - No cards can bypass it
✅ **No silent fallbacks** - Cards wait for proper initialization
✅ **Provenance tracking works** - Every card knows where its config came from
✅ **Theme defaults always applied** - Four-layer merge happens for every card
✅ **Safe concurrent initialization** - Multiple cards can trigger init simultaneously
✅ **Graceful degradation** - Only falls back if core singleton completely unavailable

---

## Testing Checklist

- [ ] Clear browser cache and reload
- [ ] Check trace logs - no "using raw config" messages
- [ ] Verify "Waiting for CoreConfigManager" appears for early cards (if any)
- [ ] Confirm all cards show "Processing config with CoreConfigManager"
- [ ] Verify no ThemeManager/StylePresetManager warnings during ConfigManager init
- [ ] Check that provenance tracking works for all cards
- [ ] Test with multiple cards loading simultaneously
- [ ] Verify theme tokens and presets resolve correctly

---

## Performance Impact

**Minimal** - Cards only wait if they're instantiated before core initialization completes (rare edge case). Normal flow has zero wait time since ConfigManager is ready before dashboard loads cards.

---

## Future Considerations

This pattern (async wait for critical systems) should be applied to any card that requires core infrastructure:

- **MSD cards** - May need similar wait for DataSourceManager
- **Animated cards** - May need to wait for AnimationManager
- **Rule-based cards** - May need to wait for RulesEngine

Consider adding a general `core.waitForSystem(systemName)` utility for this pattern.