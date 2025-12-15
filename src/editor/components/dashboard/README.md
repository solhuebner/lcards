# Rules Dashboard Component

## Overview

The Rules Dashboard is a **read-only** component that provides visibility into the LCARdS Rules Engine. It displays all rules in the system and highlights which rules target the currently edited card.

## Purpose

This dashboard helps users:
1. See which rules affect the current card
2. View all rules in the system
3. Understand rule structure at a glance
4. Debug rule targeting issues

## Features

### ✅ Implemented
- Display all rules from `window.lcards.core.rulesManager`
- Highlight rules targeting current card by ID
- Show rule details:
  - Rule ID
  - Type (overlay, etc.)
  - Enabled/Disabled status
  - Target (card ID or "Global")
  - Conditions summary (ALL/ANY/NOT + count)
  - Number of actions
- Sortable columns (click headers to sort)
- Stats header showing:
  - Total rules in system
  - Rules targeting this card (highlighted)
  - Enabled rules count
- Collapsible sections:
  - "Rules Targeting This Card" (expanded by default)
  - "All Rules in System" (collapsed by default)
  - "About Rules" help section (collapsed by default)
- Empty state messages when no rules exist
- YAML example in help section

### ❌ Not Implemented (By Design)
- No ability to add rules
- No ability to edit rules
- No ability to delete rules
- No inline rule editor

**Reason**: A full visual rules editor would require 2000-3000 lines of code due to the complexity of the rules engine. Users should continue authoring rules in YAML.

## Usage

### In Card Editor

```javascript
import '../components/dashboard/lcards-rules-dashboard.js';

_renderRulesTab() {
    return html`
        <lcards-rules-dashboard
            .editor=${this}
            .cardId=${this.config.id || this.config.cardId || ''}
            .hass=${this.hass}>
        </lcards-rules-dashboard>
    `;
}

// Add to tab definitions
_getTabDefinitions() {
    return [
        { label: 'Config', content: () => this._renderConfigTab() },
        { label: 'Actions', content: () => this._renderActionsTab() },
        { label: 'Rules', content: () => this._renderRulesTab() },  // NEW
        { label: 'YAML', content: () => this._renderYamlTab() }
    ];
}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `editor` | Object | Parent editor instance |
| `cardId` | String | Current card ID for highlighting targeting rules |
| `hass` | Object | Home Assistant instance |

## Rule Targeting Logic

The dashboard checks if a rule targets the current card using these methods:

1. **Direct ID match**: `rule.target === cardId`
2. **Array includes**: `rule.target` is an array and includes `cardId`
3. **Tag-based**: (Future enhancement - requires card config access)

## Styling

The component uses CSS custom properties for theming:
- `--card-background-color`
- `--divider-color`
- `--primary-color`
- `--secondary-background-color`
- `--primary-text-color`
- `--secondary-text-color`

Highlighted rules (targeting current card):
- Light blue background (`rgba(3, 169, 244, 0.1)`)
- Blue left border (`4px solid var(--primary-color)`)

## Testing

See `/test/test-rules-dashboard.yaml` for a comprehensive test configuration with:
- 5 sample rules
- Different targeting strategies
- Enabled and disabled rules
- Various condition types
- Multiple actions

## Implementation Details

### Data Loading

```javascript
_loadRules() {
    const rulesManager = window.lcards?.core?.rulesManager;
    if (rulesManager && typeof rulesManager.getAllRules === 'function') {
        this._rules = rulesManager.getAllRules() || [];
    }
}
```

### Sorting

Click any column header to sort by that column. Click again to toggle between ascending and descending order. Sort indicators (▲/▼/⇅) show the current sort state.

Sortable columns:
- Rule ID (alphabetical)
- Type (alphabetical)
- Status (enabled first)
- Target (alphabetical)
- Actions (numeric count)

### RulesEngine Integration

The dashboard requires the `getAllRules()` method on RulesEngine:

```javascript
// Added to src/core/rules/RulesEngine.js
getAllRules() {
    return this.rules || [];
}
```

## Future Enhancements

Potential future improvements (not in current scope):
- Filter by rule type
- Search by rule ID or target
- Show rule evaluation history
- Export rules to YAML
- Link to rule definition in YAML tab
- Show rule dependencies
- Visual rule flow diagram

## Architecture Decisions

**Why Read-Only?**
1. Rules have complex nested structures (conditions, actions, overlays)
2. A full editor would require extensive UI (2000-3000 LOC)
3. YAML is more concise and powerful for rule authoring
4. Dashboard provides necessary visibility without maintenance burden

**Why Not Use Schema?**
Rules are not card-specific configuration. They're managed globally by the RulesEngine singleton, not stored in card config. A schema-driven approach doesn't apply here.

## See Also

- [RulesEngine Documentation](../../doc/features/rules-engine.md) (if exists)
- [Button Editor Implementation](../cards/lcards-button-editor.js)
- [Test Configuration](../../test/test-rules-dashboard.yaml)
