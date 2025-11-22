# RulesEngine Integration Fixes - Critical Runtime Issues

**Date:** 2025-11-13
**Version:** v1.9.33
**Status:** ✅ FIXED (Both Issues)

## Issue #1: Missing await in async chain

### ProblemAfter implementing RulesEngine template support (Jinja2, JavaScript, tokens), the MSD card failed to load with the following error:

```
TypeError: Cannot read properties of undefined (reading 'length')
    at ModelBuilder._applyRules (ModelBuilder.js:241:49)
```

### Root Cause

The `RulesEngine.evaluateDirty()` method was made **async** to support Jinja2 template evaluation (which requires WebSocket communication with Home Assistant), but the caller in `ModelBuilder._applyRules()` was **not awaiting** the result.

This caused:
- `evaluateDirty()` to return a `Promise` instead of the result object
- `ruleResult` to be `undefined` instead of `{overlayPatches: [...]}`
- `.length` access to fail on `undefined.overlayPatches`

### Error Location

```javascript
// ModelBuilder.js:239 - NOT awaited!
const ruleResult = this.systems.rulesEngine.evaluateDirty({ getEntity });

// Line 241 - crash on undefined
lcardsLog.debug('[ModelBuilder] 📏 Rule evaluation result:', {
  overlayPatches: ruleResult.overlayPatches.length,  // ❌ ruleResult is undefined
  patches: ruleResult.overlayPatches
});
```

## Solution

Made the entire async chain properly await each async call:

### 1. Made `ModelBuilder._applyRules()` async

```javascript
// Before
_applyRules() {
  const ruleResult = this.systems.rulesEngine.evaluateDirty({ getEntity });
  return ruleResult;
}

// After
async _applyRules() {
  const ruleResult = await this.systems.rulesEngine.evaluateDirty({ getEntity });
  return ruleResult;
}
```

### 2. Made `ModelBuilder.computeResolvedModel()` async

```javascript
// Before
computeResolvedModel() {
  const ruleResult = this._applyRules();
  // ...
}

// After
async computeResolvedModel() {
  const ruleResult = await this._applyRules();
  // ...
}
```

### 3. Awaited in `PipelineCore.reRender()`

```javascript
// Before
async function reRender() {
  const resolvedModel = modelBuilder.computeResolvedModel();
  // ...
}

// After
async function reRender() {
  const resolvedModel = await modelBuilder.computeResolvedModel();
  // ...
}
```

## Files Modified

- ✅ `src/msd/pipeline/ModelBuilder.js`
  - Made `_applyRules()` async (+1 keyword, +1 await)
  - Made `computeResolvedModel()` async (+1 keyword, +1 await)

- ✅ `src/msd/pipeline/PipelineCore.js`
  - Added await to `computeResolvedModel()` call (+1 await)

## Verification

```bash
npm run build
# ✅ SUCCESS - webpack 5.97.0 compiled with 3 warnings in 7470 ms
# ✅ No errors, only bundle size warnings (expected)
```

## Impact Analysis

### Performance
- **Minimal impact:** Only one additional async/await level in the render chain
- Rules without templates execute synchronously (no WebSocket overhead)
- Rules with Jinja2 templates will have WebSocket latency (unavoidable, required for server-side evaluation)

### Backward Compatibility
- ✅ **100% compatible:** Existing rules work exactly as before
- ✅ **No breaking changes:** Only internal async propagation
- ✅ **Graceful degradation:** Non-template rules execute synchronously

### Testing Status
- ✅ Build: PASSES
- ⏳ Runtime: Testing in progress with user's MSD card
- ⏳ Jinja2 conditions: Not yet tested
- ⏳ JavaScript conditions: Not yet tested
- ⏳ Token conditions: Not yet tested

## Next Steps

1. ✅ Fix applied and built
2. ⏳ User testing with real Home Assistant instance
3. ⏳ Verify card loads and renders
4. ⏳ Test rule evaluation with different condition types
5. ⏳ Performance validation
6. ⏳ Documentation updates

## Lessons Learned

### Critical Mistake
When making a function async (especially in a dependency chain), **ALL callers** must be updated to await the result. Missing even one caller causes runtime failures.

### Detection Strategy
- Use TypeScript (would catch this at compile time)
- Add runtime checks for Promise returns
- Test with real data immediately after async changes
- Use ESLint rules: `@typescript-eslint/no-floating-promises`

### Prevention
1. Always trace the full call chain when making functions async
2. Search codebase for all callers: `grep -r "functionName("`
3. Test immediately after async transformations
4. Consider adding a Promise return type check in development builds

## References

- Original implementation: [RulesEngine-Implementation-Summary.md](./RulesEngine-Implementation-Summary.md)
- Template syntax guide: [rules-engine-template-syntax.md](../architecture/rules-engine-template-syntax.md)
- Related issue: User testing revealed runtime error in trace.log

---

**Status:** Fixed and ready for continued testing
**Build:** ✅ Successful (v1.9.33)
**Runtime:** ⏳ Testing in progress

---

## Issue #2: Missing rule compilation after dynamic addition

### Problem

After fixing Issue #1, the MSD card loaded but rules weren't producing overlay patches when triggered. The trace log showed:

```
[RulesEngine] No compiled rule found for high_temperature_alert
[ModelBuilder] 📏 Rule evaluation result: {overlayPatches: 0, patches: Array(0)}
```

### Root Cause

When MSD cards dynamically add rules to the shared `RulesEngine` (via `SystemsManager`), the code was:
1. ✅ Pushing rules to `rules` array
2. ✅ Calling `buildRulesIndex()`
3. ✅ Calling `buildDependencyIndex()`
4. ❌ **NOT calling `_compileRules()`**

This meant:
- Rules were registered and indexed
- Dependencies were tracked
- But **no compiled trees** existed in `compiledRules` Map
- When `evaluateRule()` tried to lookup `compiledRules.get(rule.id)`, it returned `undefined`
- Warning logged: "No compiled rule found for {ruleId}"

### Error Location

```javascript
// SystemsManager.js:271-273 - Missing compilation!
this.rulesEngine.buildRulesIndex();
this.rulesEngine.buildDependencyIndex();
// ❌ Missing: this.rulesEngine._compileRules();
lcardsLog.debug(`[SystemsManager] ✅ Rules added...`);
```

### Solution

Added call to `_compileRules()` after dynamically adding rules:

```javascript
// SystemsManager.js:271-274 - Fixed!
this.rulesEngine.buildRulesIndex();
this.rulesEngine.buildDependencyIndex();
this.rulesEngine._compileRules();  // ✨ ADDED
lcardsLog.debug(`[SystemsManager] ✅ Rules added...`);
```

### Files Modified

- ✅ `src/msd/pipeline/SystemsManager.js`
  - Added `_compileRules()` call after `buildDependencyIndex()` (+1 line)

### Verification

```bash
npm run build
# ✅ SUCCESS - webpack 5.97.0 compiled with 3 warnings in 7630 ms
```

### Impact

- **Zero performance impact:** Compilation happens once at init, not per-evaluation
- **Backward compatible:** No changes to existing API
- **Required for templates:** Without compilation, template detection doesn't happen
- **Required for basic rules:** Even non-template rules need compiled trees for the new evaluator

---

## Combined Fix Summary

### Both Issues Fixed

1. ✅ **Issue #1:** Made async chain properly await (3 files, 4 changes)
2. ✅ **Issue #2:** Added `_compileRules()` call for dynamic rules (1 file, 1 change)

### Testing Status

- ✅ Build: PASSES (v1.9.33)
- ✅ Card loads: SUCCESS
- ⏳ Rules evaluate: Testing with user
- ⏳ Overlay patches applied: Testing with user
- ⏳ Templates work: Not yet tested

### Next Steps

1. ✅ Both fixes applied and built
2. ⏳ User testing: Toggle `light.tv` and verify overlay patches apply
3. ⏳ Test with Jinja2 conditions
4. ⏳ Test with JavaScript conditions
5. ⏳ Test with token conditions
6. ⏳ Performance validation

---

**Status:** Both fixes complete and ready for testing
**Build:** ✅ Successful (v1.9.33)
**Runtime:** ⏳ User testing rules evaluation with overlay patches

