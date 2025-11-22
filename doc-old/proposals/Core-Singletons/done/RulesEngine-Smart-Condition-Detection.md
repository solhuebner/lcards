# RulesEngine Smart Condition Detection - Enhanced Proposal

**Status:** ✅ Enhanced with Auto-Detection
**Based On:** Template Detection from v1.9.30

---

## The Better Way: Auto-Detection 🎯

You're absolutely right! Instead of requiring users to specify `jinja2:` or `javascript:` keys, we can **auto-detect** the template type using our existing `TemplateDetector`.

### Current Proposal (Explicit)
```yaml
# ❌ Verbose - requires explicit type declaration
when:
  jinja2: "{{ states('sensor.temp') | float > 25 }}"

when:
  javascript: "entity.state === 'on'"
```

### Enhanced Proposal (Auto-Detect) ✨
```yaml
# ✅ Clean - auto-detects template type
when:
  condition: "{{ states('sensor.temp') | float > 25 }}"

when:
  condition: "entity.state === 'on'"
```

---

## Implementation: Smart Condition Node

### Phase 1: Enhanced compileConditions.js

Add auto-detection to `compileNode()`:

```javascript
// compileConditions.js - ENHANCED with Auto-Detection

import { TemplateDetector } from '../templates/TemplateDetector.js';

function compileNode(node, issues, ruleId) {
  // ... existing code ...

  // NEW: Auto-detect template type from 'condition' field
  if (node.condition) {
    const conditionStr = String(node.condition);
    const types = TemplateDetector.detectTemplateTypes(conditionStr);

    // Priority order: Jinja2 > JavaScript > Token
    if (types.hasJinja2) {
      return {
        type: 'jinja2',
        template: conditionStr,
        detected: true // Flag for debugging
      };
    }

    if (types.hasJavaScript) {
      return {
        type: 'javascript',
        code: conditionStr,
        detected: true
      };
    }

    // If it's just a token like "entity.state > 25", treat as JavaScript expression
    if (types.hasTokens) {
      return {
        type: 'javascript',
        code: conditionStr,
        detected: true,
        isExpression: true // Pure expression, not full JS code
      };
    }

    // Fallback: Treat as JavaScript expression
    return {
      type: 'javascript',
      code: conditionStr,
      detected: true,
      fallback: true
    };
  }

  // FALLBACK: Still support explicit types for power users
  if (node.jinja2) {
    return {
      type: 'jinja2',
      template: node.jinja2,
      detected: false // Explicitly declared
    };
  }

  if (node.javascript || node.js) {
    return {
      type: 'javascript',
      code: node.javascript || node.js,
      detected: false
    };
  }

  // ... existing entity conditions, time_between, etc ...
}
```

---

## Usage Examples - Clean Syntax

### 1. Simple Jinja2 (Auto-Detected)
```yaml
rules:
  - id: temp_alert
    when:
      condition: "{{ states('sensor.temp') | float > 25 }}"
    apply:
      overlays:
        warning:
          style:
            color: var(--lcars-red)
```

### 2. JavaScript Expression (Auto-Detected)
```yaml
rules:
  - id: light_bright
    when:
      condition: "entity.state === 'on' && entity.attributes.brightness > 128"
    apply:
      overlays:
        bright_indicator:
          style:
            visible: true
```

### 3. Mixed Entity + Template
```yaml
rules:
  - id: complex_rule
    when:
      all:
        - entity: light.living_room
          state: "on"
        - condition: "{{ now().hour >= 18 and now().hour < 23 }}"
        - condition: "entity.attributes.brightness > 100"
    apply:
      overlays:
        evening_mode:
          style:
            visible: true
```

### 4. Power User - Explicit Type (Still Supported)
```yaml
rules:
  - id: explicit_type
    when:
      # Still works if you want to be explicit
      jinja2: "{{ states('sensor.temp') | float > 25 }}"
    apply:
      # ...
```

---

## Detection Logic

### Auto-Detection Priority

```javascript
function detectConditionType(conditionStr) {
  const types = TemplateDetector.detectTemplateTypes(conditionStr);

  // 1. JINJA2: Highest priority - most specific syntax
  //    Indicators: {{...}}, {%...%}, {#...#}, states(), filters (|)
  if (types.hasJinja2) {
    return 'jinja2';
  }

  // 2. JAVASCRIPT: Check for JavaScript syntax
  //    Indicators: [[[...]]], JavaScript operators (===, !==, &&, ||)
  if (types.hasJavaScript) {
    return 'javascript';
  }

  // 3. TOKEN/EXPRESSION: Simple expressions with tokens
  //    Indicators: {entity.state}, {config.value}
  //    Treat as JavaScript expression
  if (types.hasTokens) {
    return 'javascript'; // Token templates evaluate in JS context
  }

  // 4. FALLBACK: Plain string - treat as JavaScript expression
  //    Examples: "entity.state === 'on'", "value > 25"
  return 'javascript';
}
```

### Why This Works

**Jinja2 is Unambiguous:**
- `{{...}}` - Double braces unique to Jinja2
- `{%...%}` - Control structures
- `states()`, `now()` - Jinja2-specific functions
- `| filter` - Pipe syntax

**JavaScript is Default:**
- Most generic syntax
- Handles plain expressions: `entity.state === 'on'`
- Handles complex logic: `entity.state === 'on' && value > 25`

**No Conflicts:**
- Can't accidentally interpret Jinja2 as JS (syntax too different)
- Can't accidentally interpret JS as Jinja2 (requires `{{` or `{%`)

---

## Implementation Details

### Enhanced evalJavaScript for Expressions

```javascript
// compileConditions.js - Enhanced JS evaluator

function evalJavaScript(tree, ctx) {
  try {
    const code = tree.code;
    const isExpression = tree.isExpression; // Plain expression vs full code

    // Create safe evaluation context
    const evalContext = {
      entity: ctx.entity,
      hass: ctx.hass,
      states: ctx.hass?.states || {},
      getEntity: ctx.getEntity,

      // Utility functions
      parseFloat,
      parseInt,
      Math,
      Date,

      // Convenience getters
      state: ctx.entity?.state,
      attributes: ctx.entity?.attributes || {}
    };

    // For plain expressions, wrap in return
    const wrappedCode = isExpression ? `return (${code})` : code;

    // Create function and execute
    const func = new Function(
      ...Object.keys(evalContext),
      wrappedCode
    );

    const result = func(...Object.values(evalContext));
    return !!result; // Ensure boolean
  } catch (error) {
    console.error('[compileConditions] JavaScript evaluation failed:', error);
    console.error('Code:', tree.code);
    return false;
  }
}
```

### Context Access in JS Expressions

Users can write natural expressions:

```javascript
// Direct access to common properties
"state === 'on'"                          // Uses evalContext.state
"attributes.brightness > 100"             // Uses evalContext.attributes
"entity.state === 'on'"                   // Uses evalContext.entity

// Advanced access
"states['light.kitchen'].state === 'on'"  // Uses evalContext.states
"Math.round(attributes.temperature) > 25" // Uses evalContext.Math
```

---

## Benefits of Auto-Detection

### 1. **Cleaner Syntax** ✨
```yaml
# Before (explicit)
when:
  jinja2: "{{ states('sensor.temp') | float > 25 }}"

# After (auto-detect)
when:
  condition: "{{ states('sensor.temp') | float > 25 }}"
```

### 2. **Less Cognitive Load** 🧠
Users don't need to remember:
- Which key to use (`jinja2` vs `javascript` vs `js`)
- When to use which syntax
- Template type differences

### 3. **Familiar Pattern** 🎯
Matches how templates work elsewhere:
- MSD overlays auto-detect datasources
- SimpleCard auto-detects template types
- Consistent with rest of LCARdS

### 4. **Still Explicit When Needed** 💪
Power users can still be explicit:
```yaml
when:
  jinja2: "{{ ... }}"      # Explicit type
  # OR
  condition: "{{ ... }}"   # Auto-detected
```

### 5. **Migration Path** 🛤️
Existing entity conditions don't change:
```yaml
# Still works exactly as before
when:
  entity: sensor.temperature
  above: 25
```

---

## Edge Cases Handled

### 1. Ambiguous Syntax
```yaml
# Could be JS or Jinja2?
condition: "value > 25"

# Resolution: Treated as JavaScript (fallback)
# If user meant Jinja2, they'd write: "{{ value > 25 }}"
```

### 2. Mixed Braces
```yaml
# Has both {{ }} and normal text
condition: "{{ states('sensor.temp') }} > 25"

# Resolution: Detected as Jinja2 ({{ }} takes precedence)
```

### 3. Token Templates
```yaml
# SimpleCard token syntax
condition: "{entity.state} === 'on'"

# Resolution: Treated as JavaScript expression
# Token {entity.state} evaluated first, then JS expression
```

---

## Updated Implementation Plan

### Phase 1A: Add Auto-Detection (1 day)
- ✅ Import TemplateDetector into compileConditions.js
- ✅ Add `condition` field support to compileNode()
- ✅ Implement auto-detection logic
- ✅ Keep explicit `jinja2`/`javascript` as fallback
- ✅ Add tests for detection

### Phase 1B: Enhance Evaluation (1-2 days)
- ✅ Implement evalJinja2() with HATemplateEvaluator
- ✅ Enhance evalJavaScript() with rich context
- ✅ Add expression vs code detection
- ✅ Make evalCompiled() async

### Phase 2: Integrate into RulesEngine (3-4 days)
- ✅ Use compiled conditions
- ✅ Make evaluateDirty() async
- ✅ Update MSD integration
- ✅ Preserve existing functionality

### Phase 3: Testing & Polish (2 days)
- ✅ Test auto-detection accuracy
- ✅ Test all condition types
- ✅ Update documentation
- ✅ Performance testing

**Total: Still ~1.5-2 weeks** (auto-detection adds minimal complexity)

---

## Syntax Reference

### All Supported Syntaxes

```yaml
rules:
  # 1. Entity conditions (existing - no change)
  - when:
      entity: sensor.temperature
      above: 25

  # 2. Auto-detected Jinja2
  - when:
      condition: "{{ states('sensor.temp') | float > 25 }}"

  # 3. Auto-detected JavaScript expression
  - when:
      condition: "entity.state === 'on' && entity.attributes.brightness > 100"

  # 4. Auto-detected JavaScript with tokens
  - when:
      condition: "{entity.state} === 'on'"

  # 5. Explicit Jinja2 (power users)
  - when:
      jinja2: "{{ states('sensor.temp') | float > 25 }}"

  # 6. Explicit JavaScript (power users)
  - when:
      javascript: "entity.state === 'on'"

  # 7. Mixed with logical operators
  - when:
      all:
        - entity: light.living_room
          state: "on"
        - condition: "{{ now().hour >= 18 }}"
        - condition: "entity.attributes.brightness > 100"
```

---

## Documentation Updates

### User Documentation

```markdown
## Rule Conditions

### Simple Entity Conditions
```yaml
when:
  entity: sensor.temperature
  above: 25
```

### Template Conditions (Auto-Detected)

Use the `condition` field with any template syntax:

**Home Assistant Jinja2:**
```yaml
when:
  condition: "{{ states('sensor.temp') | float > 25 }}"
```

**JavaScript Expression:**
```yaml
when:
  condition: "entity.state === 'on' && entity.attributes.brightness > 100"
```

**Available in JavaScript Context:**
- `entity` - Current entity object
- `state` - Shortcut for entity.state
- `attributes` - Shortcut for entity.attributes
- `states` - All HASS states
- `Math`, `Date` - JavaScript standard objects

### Advanced: Explicit Type

For rare cases where auto-detection doesn't work:
```yaml
when:
  jinja2: "{{ ... }}"       # Force Jinja2
  javascript: "..."         # Force JavaScript
```
```

---

## Final Recommendation

**✅ Go with Auto-Detection (Enhanced Option A)**

**Why:**
1. **Cleaner user experience** - Less to remember
2. **Consistent with LCARdS** - Matches template behavior elsewhere
3. **Still type-safe** - Detection is reliable and unambiguous
4. **Backward compatible** - Existing syntax unchanged
5. **Minimal implementation cost** - Just uses existing TemplateDetector

**The only addition to original plan:**
- Import TemplateDetector
- Add auto-detection logic (~50 lines)
- Update docs to show `condition:` syntax

Everything else stays the same! 🚀

---

## Questions

1. **Field name** - Is `condition:` good, or prefer something else like `template:` or `expr:`?

2. **Fallback behavior** - If detection is ambiguous, default to JavaScript expression?

3. **Debug mode** - Should we log which type was detected (for troubleshooting)?

Ready to implement! 💪
