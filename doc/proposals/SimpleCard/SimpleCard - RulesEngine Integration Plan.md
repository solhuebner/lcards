# RulesEngine Integration for SimpleCards - Implementation Proposal

**Document Version**: 1.0  
**Date**: 2025-11-10  
**Author**: LCARdS Architecture Team  
**Status**: Proposal - Ready for Implementation

---

## Executive Summary

This proposal outlines the integration of the **RulesEngine singleton** with **SimpleCard** (`lcards-simple-button`) to enable cross-card rule-based styling, tag-based targeting, and global state coordination. The RulesEngine already supports multi-card broadcasting; this integration will make SimpleCards first-class citizens in the rules ecosystem.

**Key Benefits**:
- ✅ SimpleCards can be targeted by rules from **any card** (MSD, other SimpleCards)
- ✅ Tag-based targeting enables global theme coordination
- ✅ Emergency alerts can affect all SimpleCards simultaneously
- ✅ No performance overhead (rules evaluated once, distributed to all cards)
- ✅ Fully backward compatible (opt-in feature)

---

## Current Architecture Status

### RulesEngine Singleton (Already Complete)

**Location**: `src/msd/rules/RulesEngine.js` (Real MSD class as singleton)

**Current Capabilities**:
- ✅ Multi-card callback registration
- ✅ Cross-card overlay targeting
- ✅ Tag-based selectors (`*[tag~='emergency']`)
- ✅ Type-based selectors (`type:button`)
- ✅ ID-based selectors (direct overlay ID)
- ✅ Wildcard selectors (`all`)
- ✅ Pattern matching (`pattern:regex`)
- ✅ Exclusion lists
- ✅ Entity state monitoring
- ✅ DataSource integration

**What SimpleCard Needs**: Registration, callback handling, and patch application.

---

## Integration Architecture

### 1. Overlay Registration

SimpleCards register themselves as "overlays" with the RulesEngine:

```javascript
// In LCARdSSimpleCard._onFirstRender()
_registerWithRulesEngine() {
  const rulesEngine = this._singletons?.rulesEngine;
  if (!rulesEngine) return;

  // Determine overlay ID (config.id or auto-generated)
  this._overlayId = this.config.id || `simple-button-${this._cardGuid}`;
  this._overlayTags = this.config.tags || [];
  this._overlayType = 'simple-button';

  lcardsLog.debug(`[SimpleCard] Registering with RulesEngine:`, {
    id: this._overlayId,
    tags: this._overlayTags,
    type: this._overlayType
  });

  // Store metadata for rule resolution
  this._overlayMetadata = {
    id: this._overlayId,
    type: this._overlayType,
    tags: this._overlayTags,
    cardGuid: this._cardGuid,
    config: this.config
  };
}
```

---

### 2. Callback Registration

Register a callback that triggers when rules are re-evaluated:

```javascript
// In LCARdSSimpleCard._registerWithRulesEngine()
_setupRuleCallback() {
  const rulesEngine = this._singletons?.rulesEngine;
  if (!rulesEngine) return;

  // Register re-evaluation callback
  // Note: RulesEngine supports multiple callbacks (array-based)
  this._ruleCallbackId = rulesEngine.setReEvaluationCallback(() => {
    this._handleRuleEvaluation();
  });

  lcardsLog.debug(`[SimpleCard] Rule callback registered for ${this._overlayId}`);
}
```

---

### 3. Rule Evaluation Handler

When rules are re-evaluated, check for patches targeting this button:

```javascript
/**
 * Handle rule re-evaluation callback
 * Applies any matching rule patches to this button
 * @private
 */
_handleRuleEvaluation() {
  const rulesEngine = this._singletons?.rulesEngine;
  if (!rulesEngine) return;

  try {
    // Get rule evaluation results
    // Note: evaluateDirty() returns all matched rules with patches
    const results = rulesEngine.evaluateDirty(this.hass);

    if (!results.overlayPatches || results.overlayPatches.length === 0) {
      return; // No patches to apply
    }

    // Filter patches targeting this button
    const relevantPatches = this._filterRelevantPatches(results.overlayPatches);

    if (relevantPatches.length > 0) {
      lcardsLog.debug(`[SimpleCard] Applying ${relevantPatches.length} rule patch(es) to ${this._overlayId}`);
      this._applyRulePatches(relevantPatches);
    }

  } catch (error) {
    lcardsLog.error(`[SimpleCard] Rule evaluation failed:`, error);
  }
}

/**
 * Filter patches relevant to this button
 * @param {Array} patches - All overlay patches from rule evaluation
 * @returns {Array} Patches targeting this button
 * @private
 */
_filterRelevantPatches(patches) {
  return patches.filter(patch => {
    // Direct ID match
    if (patch.id === this._overlayId) {
      lcardsLog.debug(`[SimpleCard] Patch matches by ID: ${patch.id}`);
      return true;
    }

    // Tag match (if patch has selector with tag)
    if (patch.selector) {
      // Tag selector: *[tag~='emergency']
      if (patch.selector.includes('tag~=')) {
        const tagMatch = patch.selector.match(/tag~='([^']+)'/);
        if (tagMatch && this._overlayTags.includes(tagMatch[1])) {
          lcardsLog.debug(`[SimpleCard] Patch matches by tag: ${tagMatch[1]}`);
          return true;
        }
      }

      // Type selector: type:button or type:simple-button
      if (patch.selector === 'type:button' || patch.selector === 'type:simple-button') {
        lcardsLog.debug(`[SimpleCard] Patch matches by type`);
        return true;
      }

      // Wildcard selector: all
      if (patch.selector === 'all') {
        lcardsLog.debug(`[SimpleCard] Patch matches by wildcard (all)`);
        return true;
      }

      // Pattern selector: pattern:emergency_.*
      if (patch.selector.startsWith('pattern:')) {
        const pattern = patch.selector.substring(8);
        try {
          const regex = new RegExp(pattern);
          if (regex.test(this._overlayId)) {
            lcardsLog.debug(`[SimpleCard] Patch matches by pattern: ${pattern}`);
            return true;
          }
        } catch (e) {
          lcardsLog.warn(`[SimpleCard] Invalid regex pattern: ${pattern}`);
        }
      }
    }

    return false;
  });
}
```

---

### 4. Patch Application

Apply rule patches to button configuration and trigger re-render:

```javascript
/**
 * Apply rule patches to button configuration
 * @param {Array} patches - Rule patches to apply
 * @private
 */
_applyRulePatches(patches) {
  let configModified = false;

  patches.forEach(patch => {
    // Apply style overrides
    if (patch.style) {
      lcardsLog.debug(`[SimpleCard] Applying style patch:`, patch.style);

      // Deep merge style into config
      this.config.style = this._deepMerge(
        this.config.style || {},
        patch.style
      );

      configModified = true;
    }

    // Apply cell-specific updates (for future multi-cell buttons)
    if (patch.cellTarget || patch.cell_target) {
      const cellId = patch.cellTarget || patch.cell_target;
      lcardsLog.debug(`[SimpleCard] Cell-specific patch for: ${cellId}`);
      // TODO: Future - multi-cell button support
    }

    // Trigger animations from rules
    if (patch.animations && Array.isArray(patch.animations)) {
      const animationManager = this._singletons?.animationManager;
      if (animationManager) {
        lcardsLog.debug(`[SimpleCard] Triggering ${patch.animations.length} animation(s) from rule`);

        patch.animations.forEach(animDef => {
          animationManager.playAnimation(this._overlayId, animDef, this.shadowRoot);
        });
      }
    }
  });

  // Re-render if configuration was modified
  if (configModified) {
    lcardsLog.debug(`[SimpleCard] Triggering re-render due to rule patch`);
    this._scheduleTemplateUpdate();
  }
}

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 * @private
 */
_deepMerge(target, source) {
  const result = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = this._deepMerge(result[key] || {}, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}
```

---

### 5. Card-Local Rules

SimpleCards can declare their own rules in configuration:

```javascript
/**
 * Register card-local rules with RulesEngine
 * @private
 */
_registerCardLocalRules() {
  const rulesEngine = this._singletons?.rulesEngine;
  if (!rulesEngine || !this.config.rules) return;

  lcardsLog.debug(`[SimpleCard] Registering ${this.config.rules.length} card-local rule(s)`);

  this.config.rules.forEach(rule => {
    // Ensure rule has required fields
    if (!rule.id) {
      lcardsLog.warn(`[SimpleCard] Skipping rule without ID:`, rule);
      return;
    }

    // Add rule to global RulesEngine
    rulesEngine.addRule(rule);

    lcardsLog.debug(`[SimpleCard] Registered rule: ${rule.id}`);
  });
}
```

---

### 6. Cleanup on Disconnect

Unregister callbacks and rules when card is removed:

```javascript
/**
 * Cleanup rules integration on disconnect
 * @private
 */
disconnectedCallback() {
  super.disconnectedCallback();

  // Unregister rule callback
  if (this._ruleCallbackId) {
    const rulesEngine = this._singletons?.rulesEngine;
    if (rulesEngine && typeof rulesEngine.removeReEvaluationCallback === 'function') {
      rulesEngine.removeReEvaluationCallback(this._ruleCallbackId);
      lcardsLog.debug(`[SimpleCard] Unregistered rule callback for ${this._overlayId}`);
    }
    this._ruleCallbackId = null;
  }

  // TODO: Unregister card-local rules (if needed)
  // Currently rules persist in global engine - may want to track and remove
}
```

---

## Configuration Schema

### SimpleCard with Tags (Receives Rules from Other Cards)

```yaml
type: custom:lcards-simple-button
id: emergency_button          # Required for rule targeting
tags:                         # Optional tags for rule selectors
  - emergency
  - critical
  - security
entity: switch.emergency_lights
preset: picard-filled
label: 'Emergency Lights'
```

### SimpleCard with Local Rules (Affects Self or Other Cards)

```yaml
type: custom:lcards-simple-button
id: master_control
entity: input_boolean.master_mode
preset: lozenge

rules:
  # Local rule - affects this button
  - id: master_mode_active
    when:
      entity: input_boolean.master_mode
      state: 'on'
    apply:
      overlays:
        master_control:        # Target self by ID
          style:
            color: 'colors.status.success'
            border:
              color: 'colors.accent.primary'
              width: 3

  # Global rule - affects all emergency buttons
  - id: global_emergency_alert
    when:
      entity: alarm.security
      state: 'triggered'
    apply:
      overlays:
        "*[tag~='emergency']": # Target by tag across ALL cards
          style:
            color: 'colors.status.danger'
            border:
              color: 'colors.status.danger'
              width: 4
          animations:
            - preset: pulse-urgent
              duration: 1000
```

---

## Rule Selector Types

| Selector | Example | Description |
|----------|---------|-------------|
| **Direct ID** | `power_button` | Target specific overlay by ID |
| **Tag** | `*[tag~='emergency']` | Target all overlays with tag |
| **Type** | `type:button` | Target all button-type overlays |
| **Type (Specific)** | `type:simple-button` | Target only SimpleCard buttons |
| **Pattern** | `pattern:emergency_.*` | Target IDs matching regex |
| **Wildcard** | `all` | Target every overlay |
| **Exclude** | `exclude: ['button1', 'button2']` | Exclude specific IDs |

---

## Example Use Cases

### Use Case 1: Global Emergency Alert

**Scenario**: Security alarm affects all emergency-tagged buttons across all cards.

```yaml
# In any card (MSD, SimpleCard, etc.)
rules:
  - id: security_alert
    when: { entity: alarm.security, state: 'triggered' }
    apply:
      overlays:
        "*[tag~='emergency']":
          style:
            color: red
            border: { color: red, width: 3 }
          animations:
            - preset: pulse-urgent
```

**Result**: All SimpleCard buttons with `tags: ['emergency']` turn red and pulse.

---

### Use Case 2: Night Mode Theme

**Scenario**: Night mode dims all buttons.

```yaml
rules:
  - id: night_mode_dimming
    when: { entity: input_boolean.night_mode, state: 'on' }
    apply:
      overlays:
        type:button:  # All button-type overlays
          style:
            opacity: 0.6
            brightness: 0.7
```

**Result**: All SimpleCards and MSD button overlays dim.

---

### Use Case 3: Master Control Coordination

**Scenario**: Master switch controls styling of related buttons.

```yaml
# Master control button
type: custom:lcards-simple-button
id: hvac_master
entity: climate.hvac_system

rules:
  - id: hvac_system_coordination
    when: { entity: climate.hvac_system, state: 'heat' }
    apply:
      overlays:
        pattern:hvac_.*:  # All buttons with IDs starting with "hvac_"
          style:
            color: 'colors.status.warning'  # Orange for heating
```

---

### Use Case 4: Conditional Button Visibility

**Scenario**: Hide/show buttons based on state.

```yaml
rules:
  - id: advanced_controls_visible
    when: { entity: input_boolean.expert_mode, state: 'on' }
    apply:
      overlays:
        "*[tag~='advanced']":
          style:
            display: 'block'
            opacity: 1

  - id: advanced_controls_hidden
    when: { entity: input_boolean.expert_mode, state: 'off' }
    apply:
      overlays:
        "*[tag~='advanced']":
          style:
            display: 'none'
            opacity: 0
```

---

## Implementation Roadmap

### Phase 1: Core Integration (2-3 days)

**Files to Modify**:
- `src/base/LCARdSSimpleCard.js`

**Tasks**:
1. Add `_registerWithRulesEngine()` method
2. Add `_setupRuleCallback()` method
3. Add `_handleRuleEvaluation()` method
4. Add `_filterRelevantPatches()` method
5. Add `_applyRulePatches()` method
6. Add `_registerCardLocalRules()` method
7. Add cleanup in `disconnectedCallback()`
8. Update config schema to support `id`, `tags`, `rules` properties

**Validation**:
- Create `test-simple-button-rules.html`
- Test direct ID targeting
- Test tag-based targeting
- Test type-based targeting
- Test wildcard targeting

---

### Phase 2: Advanced Selectors (1-2 days)

**Tasks**:
1. Test pattern matching (`pattern:regex`)
2. Test exclusion lists
3. Test multi-tag targeting
4. Test selector priority/precedence

**Validation**:
- Complex multi-card scenarios
- Performance testing with many rules

---

### Phase 3: Documentation & Examples (1 day)

**Tasks**:
1. Update SimpleCard documentation
2. Create rule examples gallery
3. Add troubleshooting guide
4. Document performance considerations

---

## Testing Strategy

### Test File: `test-simple-button-rules.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>SimpleCard RulesEngine Integration Test</title>
  <script type="module" src="/dist/lcards.js"></script>
</head>
<body>
  <h1>SimpleCard RulesEngine Integration Tests</h1>

  <!-- Test 1: Direct ID Targeting -->
  <section>
    <h2>Test 1: Direct ID Targeting</h2>
    <p>Turn on light.desk - button should turn green</p>

    <lcards-simple-button
      id="test1-button"
      entity="light.desk"
      preset="lozenge"
      label="Desk Light">
    </lcards-simple-button>

    <!-- Rule declared in separate button -->
    <lcards-simple-button
      id="test1-control"
      entity="input_boolean.test_mode">
      <script type="application/yaml">
        rules:
          - id: test1_rule
            when: { entity: light.desk, state: 'on' }
            apply:
              overlays:
                test1-button:  # Direct ID
                  style:
                    color: 'colors.status.success'
      </script>
    </lcards-simple-button>
  </section>

  <!-- Test 2: Tag-Based Targeting -->
  <section>
    <h2>Test 2: Tag-Based Targeting</h2>
    <p>Trigger alarm.security - all emergency buttons turn red</p>

    <lcards-simple-button
      id="emergency1"
      tags="emergency,critical"
      entity="switch.emergency_lights"
      preset="picard-filled"
      label="Emergency 1">
    </lcards-simple-button>

    <lcards-simple-button
      id="emergency2"
      tags="emergency"
      entity="switch.emergency_power"
      preset="picard-filled"
      label="Emergency 2">
    </lcards-simple-button>

    <lcards-simple-button
      id="emergency3"
      tags="normal"
      entity="switch.normal_lights"
      preset="lozenge"
      label="Normal Light">
    </lcards-simple-button>

    <!-- Rule controller -->
    <lcards-simple-button
      id="test2-control"
      entity="alarm.security">
      <script type="application/yaml">
        rules:
          - id: test2_emergency_alert
            when: { entity: alarm.security, state: 'triggered' }
            apply:
              overlays:
                "*[tag~='emergency']":  # Tag selector
                  style:
                    color: red
                    border: { color: red, width: 3 }
                  animations:
                    - preset: pulse
                      duration: 1000
      </script>
    </lcards-simple-button>
  </section>

  <!-- Test 3: Type-Based Targeting -->
  <section>
    <h2>Test 3: Type-Based Targeting</h2>
    <p>Enable night mode - all buttons dim</p>

    <lcards-simple-button
      id="button1"
      entity="light.living_room"
      preset="lozenge"
      label="Button 1">
    </lcards-simple-button>

    <lcards-simple-button
      id="button2"
      entity="light.bedroom"
      preset="bullet"
      label="Button 2">
    </lcards-simple-button>

    <!-- Rule controller -->
    <lcards-simple-button
      id="test3-control"
      entity="input_boolean.night_mode">
      <script type="application/yaml">
        rules:
          - id: test3_night_mode
            when: { entity: input_boolean.night_mode, state: 'on' }
            apply:
              overlays:
                type:simple-button:  # Type selector
                  style:
                    opacity: 0.6
      </script>
    </lcards-simple-button>
  </section>

  <!-- Test 4: Pattern Matching -->
  <section>
    <h2>Test 4: Pattern Matching</h2>
    <p>All HVAC buttons get orange when heating</p>

    <lcards-simple-button
      id="hvac_main"
      entity="climate.main"
      preset="lozenge"
      label="Main HVAC">
    </lcards-simple-button>

    <lcards-simple-button
      id="hvac_bedroom"
      entity="climate.bedroom"
      preset="lozenge"
      label="Bedroom HVAC">
    </lcards-simple-button>

    <lcards-simple-button
      id="other_control"
      entity="light.other"
      preset="lozenge"
      label="Other Control">
    </lcards-simple-button>

    <!-- Rule controller -->
    <lcards-simple-button
      id="test4-control"
      entity="climate.main">
      <script type="application/yaml">
        rules:
          - id: test4_hvac_heating
            when: { entity: climate.main, state: 'heat' }
            apply:
              overlays:
                pattern:hvac_.*:  # Pattern selector
                  style:
                    color: 'colors.status.warning'
      </script>
    </lcards-simple-button>
  </section>

  <!-- Test 5: Wildcard with Exclusion -->
  <section>
    <h2>Test 5: Wildcard with Exclusion</h2>
    <p>All buttons except excluded get styled</p>

    <lcards-simple-button
      id="included1"
      entity="light.light1"
      preset="lozenge"
      label="Included 1">
    </lcards-simple-button>

    <lcards-simple-button
      id="excluded1"
      entity="light.light2"
      preset="lozenge"
      label="Excluded">
    </lcards-simple-button>

    <lcards-simple-button
      id="included2"
      entity="light.light3"
      preset="lozenge"
      label="Included 2">
    </lcards-simple-button>

    <!-- Rule controller -->
    <lcards-simple-button
      id="test5-control"
      entity="input_boolean.test_mode">
      <script type="application/yaml">
        rules:
          - id: test5_wildcard
            when: { entity: input_boolean.test_mode, state: 'on' }
            apply:
              overlays:
                all:              # Wildcard
                exclude:
                  - excluded1     # Exclusion list
                style:
                  border: { color: blue, width: 2 }
      </script>
    </lcards-simple-button>
  </section>
</body>
</html>
```

---

## Performance Considerations

### Efficient Rule Evaluation

**RulesEngine Performance**:
- ✅ Rules evaluated **once** per entity change
- ✅ Results **distributed** to all registered callbacks
- ✅ Selector resolution cached
- ✅ Dirty tracking prevents redundant evaluation

**SimpleCard Performance**:
- Only re-renders when **relevant patches** exist
- Patch filtering is O(n) where n = number of patches (typically small)
- No DOM queries (uses stored metadata)

### Optimization Tips

1. **Use specific selectors** when possible (ID > Type > Tag > Wildcard)
2. **Minimize wildcard rules** (`all` selector)
3. **Group related overlays** with tags instead of individual rules
4. **Avoid complex regex patterns** in `pattern:` selectors

---

## Migration Path

### Existing SimpleCards (No Changes Needed)

SimpleCards without `id`, `tags`, or `rules` continue to work exactly as before. Rules integration is **opt-in**.

### Enabling Rules (Gradual Adoption)

1. **Step 1**: Add `id` to buttons you want to target
2. **Step 2**: Add `tags` for group-based targeting
3. **Step 3**: Add card-local `rules` for advanced behavior

**Example Progressive Enhancement**:
```yaml
# Before (no rules)
type: custom:lcards-simple-button
entity: light.desk
preset: lozenge

# After Step 1 (targetable by ID)
type: custom:lcards-simple-button
id: desk_light_button
entity: light.desk
preset: lozenge

# After Step 2 (targetable by tag)
type: custom:lcards-simple-button
id: desk_light_button
tags: ['office', 'workspace']
entity: light.desk
preset: lozenge

# After Step 3 (declares own rules)
type: custom:lcards-simple-button
id: desk_light_button
tags: ['office', 'workspace']
entity: light.desk
preset: lozenge
rules:
  - id: desk_work_mode
    when: { entity: input_boolean.work_mode, state: 'on' }
    apply:
      overlays:
        "*[tag~='office']":
          style:
            border: { color: blue, width: 2 }
```

---

## Security Considerations

### Rule Scope

- Rules from **any card** can target **any overlay** (by design)
- This is intentional for global coordination
- Users should be aware rules can have cross-card effects

### Mitigation Strategies

1. **Namespace overlay IDs** with card-specific prefixes
2. **Use specific selectors** to avoid unintended targets
3. **Test rules thoroughly** in development
4. **Document rule interactions** in card configs

---

## Future Enhancements

### Phase 4: Advanced Features (Future)

1. **Rule Priority** - Override order for conflicting rules
2. **Rule Inheritance** - Child overlays inherit parent rules
3. **Conditional Animations** - More complex animation triggers
4. **Rule Templates** - Reusable rule patterns
5. **Rule Debugging UI** - Visual rule inspector in dev tools

---

## Conclusion

This proposal provides a complete integration path for RulesEngine and SimpleCards. The implementation is straightforward, fully backward compatible, and leverages the existing RulesEngine singleton without modification.

**Implementation Estimate**: 3-5 days (including testing and documentation)

**Risk Assessment**: Low (RulesEngine is proven, SimpleCard changes are isolated)

**Value Proposition**: HIGH - Enables sophisticated cross-card coordination with minimal effort

---

## Appendix: API Reference

### Config Properties

```yaml
type: custom:lcards-simple-button

# Rule Integration Properties
id: string                    # Overlay ID for rule targeting
tags: string[]                # Tags for selector matching
rules: Rule[]                 # Card-local rules

# Standard Properties
entity: string
preset: string
label: string
# ... (existing properties)
```

### Rule Schema

```yaml
rules:
  - id: string                # Required: Unique rule ID
    when:                     # Required: Condition
      entity: string
      state: string           # Or: above, below, equals
    apply:                    # Required: Changes
      overlays:               # Overlay targets
        <selector>:           # ID, tag, type, pattern, or "all"
          style: object       # Style overrides
          animations: array   # Animation triggers
```

### Supported Selectors

- `overlay_id` - Direct ID match
- `*[tag~='tagname']` - Tag match
- `type:typename` - Type match
- `pattern:regex` - Pattern match
- `all` - Wildcard match
- `exclude: [...]` - Exclusion list

---

**Document End**
