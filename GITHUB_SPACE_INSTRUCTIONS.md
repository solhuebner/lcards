You are an expert developer working on LCARdS - a comprehensive Star Trek LCARS interface system for Home Assistant. This is a production-grade project implementing advanced card systems with enterprise-level architecture.

## CRITICAL PROJECT CONTEXT

**RECENT MAJOR REFACTOR (Nov 2025)**: We just completed implementing the V2 card foundation system, moving away from legacy button-card templates to native LIT-based cards. Key components:
- `src/base/V2CardSystemsManager.js` - Central coordinator for singleton systems
- `src/base/LightweightTemplateProcessor.js` - Template processing with `[[[JavaScript]]]` syntax
- `src/base/V2StyleResolver.js` - Multi-source style resolution
- `src/base/LCARdSV2Card.js` - Enhanced base class for V2 cards
- `src/cards/lcards-v2-button.js` - Reference V2 implementation

**CURRENT PRIORITY**: Migrating legacy YAML templates (lcards-button-picard, lcards-button-lozenge, etc.) to native V2 cards using the new foundation.

## ARCHITECTURE PRINCIPLES

**DOM Context**: Always use `this.mountEl` for DOM operations, never `document`. We work within shadowRoots and card-specific mount elements.

**Core Systems**:
- MSD (Master Systems Display) in `src/msd/` - modular design with overlay/controls layers
- Global singletons (`lcardsCore`) for themes, rules, animations, datasources
- V2 cards connect directly to singletons without MSD pipeline dependency

**Template Processing**: Support button-card syntax `[[[return code]]]` and token replacement `{{token}}` with rich evaluation context (entity, hass, theme, variables).

## TECHNICAL REQUIREMENTS

**Animations**: Anime.js v4 ONLY. Key changes: `targets` is separate parameter, use `alternate`/`reversed` not `direction`. Create chainable LCARS-specific animations on `window.cblcars.anim`.

**Code Standards**:
- Full JSDoc documentation
- Provide complete patched files/functions
- Include 3-5 lines context for edits
- Forward-thinking extensible design

**File Structure**:
```
src/
├── base/ - Foundation classes (V2CardSystemsManager, processors, resolvers)
├── cards/ - Card implementations (V2 and legacy)
├── msd/ - Master Systems Display modules
├── core/ - Singleton systems (themes, rules, animations)
└── utils/ - Shared utilities
```

## MIGRATION FOCUS

**Legacy → V2 Migration Path**:
1. Convert button-card YAML templates to V2 preset system
2. Implement style variable resolution (`ulcars_*` variables)
3. Maintain backward compatibility
4. Create migration utilities

**Key Files to Reference**:
- `/doc/architecture/` - System architecture
- `V2_FOUNDATION_COMPLETE.md` - Recent refactor summary
- `template-migration-test.js` - Migration examples

## DEVELOPMENT PATTERNS

**V2 Card Creation**: Extend `LCARdSV2Card`, use `this.systemsManager` for template/style processing. Example:
```javascript
async processTemplate(template) {
  return this.systemsManager.processTemplate(template, this._config, this.hass, this._entity);
}
```

**Style Resolution**: Combine base + theme tokens + state overrides:
```javascript
const style = this.resolveStyle(baseStyle, ['theme.token'], stateOverrides);
```

**MSD Integration**: Use singleton pattern via `window.lcardsCore.getSystem('systemName')`. Systems: ThemeManager, RulesEngine, AnimationManager, DataSourceManager.

**Template Syntax**:
- JavaScript: `[[[return entity.state === 'on' ? 'Active' : 'Inactive']]]`
- Tokens: `{{entity.attributes.friendly_name}}`
- Variables: Access via `variables.ulcars_card_color`

## TESTING & VALIDATION

Use `test-v2-foundation.html` for live testing. Build with `npm run build`. All V2 components compile without errors.

**Architecture Goal**: Create the definitive, extensible LCARS interface solution for Home Assistant. Prioritize performance, maintainability, and seamless legacy migration.