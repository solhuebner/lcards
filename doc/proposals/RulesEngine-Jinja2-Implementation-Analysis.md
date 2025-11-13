# RulesEngine Jinja2 Integration - Implementation Analysis

**Date:** November 12, 2025
**Status:** Ready for Implementation
**Phase:** Post-Template System v1.9.30

---

## Executive Summary

The proposal is **largely accurate** and **implementable**, but there are some important clarifications:

### ✅ What's Accurate:
1. **Syntax mismatch exists** - `compileConditions.js` and `RulesEngine.evaluateCondition()` have different approaches
2. **Jinja2 support is missing** - No template evaluation in rules
3. **JavaScript support is missing** - No inline JS conditions
4. **We now have Jinja2 infrastructure** - `UnifiedTemplateEvaluator` and `HATemplateEvaluator` are ready

### ⚠️ What Needs Clarification:
1. **RulesEngine doesn't use compileConditions** - They're parallel implementations!
2. **compileConditions.js is unused** - It's a standalone compiler, not integrated
3. **The real issue** - Need to integrate compilation OR enhance existing evaluator

---

## Current State Analysis

### What Actually Exists

#### 1. **compileConditions.js** (Standalone, Unused)

**Purpose:** Compile rules to optimized evaluation trees
**Status:** ✅ Complete but **NOT INTEGRATED** into RulesEngine
**Features:**
- Compiles rules to AST-like trees
- Supports: `entity`, `entity_attr`, `map_range_cond`, `time_between`, `weekday_in`, `sun_elevation`, `perf_metric`, `flag`, `random_chance`
- Has evaluation function: `evalCompiled(tree, ctx)`
- Logical operators: `all`, `any`, `not`

**Key Finding:** This is a **complete condition compiler** that RulesEngine doesn't use!

```javascript
// compileConditions.js - What it DOES support
{
  entity: "sensor.temp",
  above: 25,
  below: 30
}

// Compiles to:
{
  type: 'entity',
  c: { entity: "sensor.temp", above: 25, below: 30 }
}

// Then evaluates with compareValue()
```

#### 2. **RulesEngine.js** (Active Implementation)

**Purpose:** Evaluate rules and apply patches to overlays
**Status:** ✅ Active, used by MSD cards
**Features:**
- Manual condition evaluation in `evaluateCondition()`
- Supports: `entity` with `state`/`above`/`below`/`equals`, `time_between`, `time` (after/before), `map_range_cond`
- Integrated with DataSourceManager
- HASS state caching and fresh state management
- Priority-based rule evaluation

**Key Finding:** Re-implements condition logic **instead of using compileConditions**!

```javascript
// RulesEngine.evaluateCondition() - Manual implementation
if (condition.entity) {
  // ... 100 lines of entity lookup logic ...
  if (condition.state !== undefined) {
    result.matched = String(entityValue) === String(condition.state);
  } else if (condition.above !== undefined) {
    result.matched = parseFloat(entityValue) > condition.above;
  }
  // ... etc
}
```

---

## The Real Problem

### Issue: Duplicate Logic

We have **two separate condition evaluation systems**:

1. **compileConditions.js** - Optimized compiler with `evalCompiled()`
2. **RulesEngine.evaluateCondition()** - Manual evaluation duplicating the same logic

**Why this happened:** Historical evolution - `compileConditions.js` was created as an optimization but never integrated.

### Issue: No Template Support

Neither system supports:
- ❌ Jinja2 conditions: `jinja2: "{{ states('sensor.temp') | float > 25 }}"`
- ❌ JavaScript conditions: `javascript: "entity.state === 'on'"`

---

## Proposed Solutions

### Option A: Integrate compileConditions (Recommended ✅)

**Approach:** Make RulesEngine use `compileConditions.js`

**Pros:**
- ✅ Eliminates duplicate logic
- ✅ Optimized compiled trees
- ✅ Single source of truth for condition syntax
- ✅ Easier to add new condition types (Jinja2, JS)
- ✅ Better performance (pre-compiled)

**Cons:**
- ⚠️ Larger refactor of RulesEngine
- ⚠️ Need to ensure all current functionality preserved

**Changes Required:**

```javascript
// RulesEngine.js - SIMPLIFIED

import { compileRule, evalCompiled } from './compileConditions.js';

constructor(rules = [], dataSourceManager = null) {
  // ... existing code ...

  // NEW: Compile all rules once
  this.compiledRules = new Map();
  this.rules.forEach(rule => {
    const compiled = compileRule(rule, []);
    this.compiledRules.set(rule.id, compiled);
  });
}

evaluateRule(rule, getEntity) {
  const compiled = this.compiledRules.get(rule.id);
  if (!compiled) return this.createUnmatchedResult(rule);

  // Create evaluation context
  const ctx = {
    getEntity,
    hass: this.systemsManager?.getHass?.(),
    now: Date.now(),
    sun: this.systemsManager?.getSunInfo?.(),
    getPerf: (key) => this.perfMetrics?.[key],
    flags: this.debugFlags || {},

    // NEW: Template evaluators
    haTemplateEvaluator: this._haTemplateEvaluator,
    jsEvaluator: this._jsEvaluator
  };

  // Evaluate compiled tree
  const matched = evalCompiled(compiled.tree, ctx);

  return {
    ruleId: rule.id,
    matched,
    rule,
    // ... rest of result
  };
}
```

### Option B: Enhance RulesEngine Only

**Approach:** Add Jinja2/JS support directly to `evaluateCondition()`

**Pros:**
- ✅ Smaller change
- ✅ No refactoring of existing code
- ✅ Keeps current working logic

**Cons:**
- ❌ Maintains duplicate logic
- ❌ More complex evaluateCondition()
- ❌ Harder to maintain long-term

---

## Recommended Implementation: Option A

### Phase 1: Enhance compileConditions.js

**Add Jinja2 and JavaScript support to the compiler:**

```javascript
// compileConditions.js - ENHANCED

function compileNode(node, issues, ruleId) {
  // ... existing code ...

  // NEW: Jinja2 template conditions
  if (node.jinja2) {
    return {
      type: 'jinja2',
      template: node.jinja2
    };
  }

  // NEW: JavaScript conditions
  if (node.javascript || node.js) {
    return {
      type: 'javascript',
      code: node.javascript || node.js
    };
  }

  // ... existing code ...
}

export async function evalCompiled(tree, ctx) {
  switch (tree.type) {
    // ... existing cases ...

    case 'jinja2':
      return await evalJinja2(tree, ctx);

    case 'javascript':
      return evalJavaScript(tree, ctx);

    // ... existing cases ...
  }
}

async function evalJinja2(tree, ctx) {
  if (!ctx.haTemplateEvaluator) {
    console.warn('[compileConditions] Jinja2 evaluator not available');
    return false;
  }

  try {
    // Evaluate Jinja2 template - expects "True" or "False" string
    const result = await ctx.haTemplateEvaluator.evaluate(tree.template);

    // Convert result to boolean
    const resultStr = String(result).trim().toLowerCase();
    return resultStr === 'true' || resultStr === '1' || resultStr === 'yes';
  } catch (error) {
    console.error('[compileConditions] Jinja2 evaluation failed:', error);
    return false;
  }
}

function evalJavaScript(tree, ctx) {
  try {
    // Create safe evaluation context
    const evalContext = {
      entity: ctx.entity,
      hass: ctx.hass,
      states: ctx.hass?.states || {},
      getEntity: ctx.getEntity,
      Math,
      Date
    };

    // Create function and execute
    const func = new Function(
      ...Object.keys(evalContext),
      `return (${tree.code})`
    );

    const result = func(...Object.values(evalContext));
    return !!result; // Ensure boolean
  } catch (error) {
    console.error('[compileConditions] JavaScript evaluation failed:', error);
    return false;
  }
}
```

### Phase 2: Integrate into RulesEngine

**Make RulesEngine use compiled conditions:**

```javascript
// RulesEngine.js - REFACTORED

import { compileRule, evalCompiled } from './compileConditions.js';
import { UnifiedTemplateEvaluator } from '../templates/UnifiedTemplateEvaluator.js';

constructor(rules = [], dataSourceManager = null) {
  super();
  this.rules = Array.isArray(rules) ? rules : [];
  this.dataSourceManager = dataSourceManager;

  // NEW: Create template evaluators for rule conditions
  this._initializeTemplateEvaluators();

  // NEW: Compile all rules
  this.compiledRules = new Map();
  this._compileRules();

  // ... rest of constructor
}

_initializeTemplateEvaluators() {
  // Create UnifiedTemplateEvaluator for Jinja2 support
  this._templateEvaluator = new UnifiedTemplateEvaluator({
    hass: this.systemsManager?.getHass?.(),
    context: {},
    dataSourceManager: this.dataSourceManager
  });
}

_compileRules() {
  const issues = [];

  this.rules.forEach(rule => {
    try {
      const compiled = compileRule(rule, issues);
      this.compiledRules.set(rule.id, compiled);
    } catch (error) {
      console.error(`[RulesEngine] Failed to compile rule ${rule.id}:`, error);
    }
  });

  if (issues.length > 0) {
    console.warn('[RulesEngine] Rule compilation issues:', issues);
  }
}

// REPLACE evaluateConditions() and evaluateCondition() with:
evaluateRule(rule, getEntity) {
  const compiled = this.compiledRules.get(rule.id);
  if (!compiled) {
    return this.createUnmatchedResult(rule);
  }

  // Create evaluation context
  const ctx = {
    getEntity,
    hass: this.systemsManager?.getHass?.(),
    entity: null, // Will be set by evalEntity if needed
    now: Date.now(),
    sun: this.systemsManager?.getSunInfo?.(),
    getPerf: (key) => this.perfMetrics?.[key],
    flags: this.debugFlags || {},

    // Template evaluators for Jinja2/JS conditions
    haTemplateEvaluator: this._templateEvaluator,
    jsEvaluator: this._jsEvaluator
  };

  // Evaluate compiled tree
  const matched = evalCompiled(compiled.tree, ctx);

  return {
    ruleId: rule.id,
    priority: rule.priority || 0,
    matched,
    rule,
    evaluationTime: performance.now() - startTime,
    conditions: { matched } // Simplified - tree already evaluated
  };
}
```

### Phase 3: Make evaluateDirty Async

**Handle async Jinja2 evaluation:**

```javascript
// RulesEngine.js - ASYNC SUPPORT

async evaluateDirty(context = {}) {
  return perfTime('rules.evaluate', async () => {
    // ... existing getEntity setup ...

    const dirtyRulesArray = Array.from(this.dirtyRules)
      .map(ruleId => this.rulesById.get(ruleId))
      .filter(rule => rule)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // NEW: Evaluate rules in parallel (or sequentially if needed)
    const results = [];
    for (const rule of dirtyRulesArray) {
      if (processedRules.has(rule.id)) continue;

      // Await async evaluation (for Jinja2)
      const result = await this.evaluateRule(rule, getEntity);
      processedRules.add(rule.id);

      this.lastEvaluation.set(rule.id, {
        matched: result.matched,
        timestamp: Date.now()
      });

      if (result.matched) {
        results.push(result);
        this.evalCounts.matched++;
      }

      this.dirtyRules.delete(rule.id);
    }

    // ... rest of method ...

    return this.aggregateResults(results);
  });
}

// Also need to make evaluateRule async
async evaluateRule(rule, getEntity) {
  const compiled = this.compiledRules.get(rule.id);
  if (!compiled) return this.createUnmatchedResult(rule);

  const ctx = { /* ... context ... */ };

  // Await async evaluation (for Jinja2 conditions)
  const matched = await evalCompiled(compiled.tree, ctx);

  return {
    ruleId: rule.id,
    matched,
    rule,
    // ...
  };
}
```

---

## New Syntax Examples

### After Implementation

```yaml
rules:
  # 1. Simple entity condition (existing)
  - id: temp_high
    when:
      entity: sensor.temperature
      above: 25
    apply:
      overlays:
        warning:
          style:
            visible: true

  # 2. Jinja2 condition (NEW!)
  - id: complex_logic
    when:
      jinja2: "{{ states('sensor.temp') | float > 25 and is_state('light.desk', 'on') }}"
    apply:
      overlays:
        desk_alert:
          style:
            color: var(--lcars-red)

  # 3. JavaScript condition (NEW!)
  - id: js_condition
    when:
      javascript: "entity.state === 'on' && entity.attributes.brightness > 128"
    apply:
      overlays:
        bright_indicator:
          style:
            visible: true

  # 4. Mixed conditions with logical operators
  - id: mixed
    when:
      all:
        - entity: light.living_room
          state: "on"
        - jinja2: "{{ now().hour >= 18 and now().hour < 23 }}"
        - any:
            - entity: sensor.temp
              above: 20
            - javascript: "states['climate.living'].state === 'heat'"
    apply:
      overlays:
        evening_mode:
          style:
            visible: true
```

---

## Implementation Timeline

### Phase 1: Enhance compileConditions (2-3 days)
- ✅ Add Jinja2 condition type to `compileNode()`
- ✅ Add JavaScript condition type
- ✅ Implement `evalJinja2()` with HATemplateEvaluator
- ✅ Implement `evalJavaScript()` with safe eval
- ✅ Make `evalCompiled()` async
- ✅ Add tests for new condition types

### Phase 2: Integrate into RulesEngine (3-4 days)
- ✅ Add template evaluator initialization
- ✅ Add rule compilation in constructor
- ✅ Replace `evaluateConditions()`/`evaluateCondition()` with `evalCompiled()`
- ✅ Make `evaluateDirty()` async
- ✅ Make `evaluateRule()` async
- ✅ Update MSD card integration for async rules
- ✅ Preserve all existing functionality

### Phase 3: Testing & Documentation (2 days)
- ✅ Test all existing rule conditions still work
- ✅ Test new Jinja2 conditions
- ✅ Test new JavaScript conditions
- ✅ Test mixed conditions with logical operators
- ✅ Update documentation with new syntax
- ✅ Add migration guide for complex conditions

### Phase 4: Performance Optimization (1-2 days)
- ✅ Add caching for Jinja2 evaluation results
- ✅ Batch async evaluations where possible
- ✅ Profile rule evaluation performance

**Total: ~1.5-2 weeks**

---

## Breaking Changes Assessment

### ✅ No Breaking Changes!

All existing rule syntax will continue to work:
- ✅ `entity` with `state`, `above`, `below`, `equals`
- ✅ `time_between`
- ✅ `map_range_cond`
- ✅ Logical operators: `all`, `any`, `not`

The changes are **additive**:
- ➕ New `jinja2` condition type
- ➕ New `javascript` condition type
- ➕ Better performance (compiled trees)
- ➕ Single source of truth

---

## Dependencies

### Ready Now ✅
- ✅ UnifiedTemplateEvaluator (v1.9.30)
- ✅ HATemplateEvaluator (v1.9.30)
- ✅ SimpleCardTemplateEvaluator (for JS eval pattern)

### Need to Create
- 📝 Integration layer between RulesEngine and compileConditions
- 📝 Async rule evaluation flow
- 📝 Template evaluator initialization in RulesEngine
- 📝 Tests for new condition types

---

## Risk Assessment

### Low Risk ✅
- compileConditions.js is unused, so enhancing it has no impact on existing code
- RulesEngine refactor can be done incrementally
- All existing tests should pass (no syntax changes)

### Medium Risk ⚠️
- Making evaluateDirty() async requires MSD card updates
- Need to ensure performance doesn't degrade
- Jinja2 evaluation adds latency (network call to HA)

### Mitigation Strategies
1. **Incremental rollout** - Add compilation without removing old code initially
2. **Performance monitoring** - Track rule evaluation times
3. **Caching** - Cache Jinja2 results to minimize HA calls
4. **Fallback** - Keep old evaluateCondition() as fallback during transition

---

## Recommendation

**✅ Proceed with Option A (Integrate compileConditions)**

**Why:**
1. We have the template infrastructure ready (v1.9.30)
2. compileConditions.js is complete and well-designed
3. Eliminates duplicate logic and maintenance burden
4. Sets up RulesEngine for future enhancements
5. No breaking changes for users
6. Clear migration path

**Start with Phase 1** (enhance compileConditions) as it's isolated and low-risk.

---

## Questions for You

1. **Async MSD rendering** - Are MSD cards ready for async rule evaluation? Or do we need to update the rendering pipeline?

2. **Performance budget** - What's acceptable latency for Jinja2 rule evaluation? (HA websocket adds ~10-50ms)

3. **Caching strategy** - Should we cache Jinja2 results, and if so, for how long?

4. **Priority** - Should we do this before or after other planned MSD features?

Ready to start implementation when you give the green light! 🚀
