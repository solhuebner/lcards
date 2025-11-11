# CoreConfigManager - Final Architecture & Implementation Proposal

**Document Version**: 3.0 - FINAL  
**Date**: 2025-11-11  
**Author**: LCARdS Architecture Team  
**Status**: Ready for Implementation  
**Implementation Target**: Core Singleton System

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Architectural Decisions](#architectural-decisions)
4. [CoreConfigManager Design](#coreconfigmanager-design)
5. [Implementation Plan](#implementation-plan)
6. [Schema Registration Pattern](#schema-registration-pattern)
7. [Usage Examples](#usage-examples)
8. [MSD Migration Path](#msd-migration-path)
9. [Testing Strategy](#testing-strategy)
10. [Success Criteria](#success-criteria)

---

## Executive Summary

This proposal finalizes the architecture for **CoreConfigManager** - the last MSD system to be extracted into the LCARdS Core singleton infrastructure. This manager provides unified configuration processing for all card types (SimpleCard, MSD, future cards) while eliminating parallel systems and ensuring consistency across the codebase.

### What We're Building

A **lightweight facade** that coordinates existing proven systems:
- **Existing**: `mergePacks` (src/core/packs/mergePacks.js) - Deep config merging with provenance
- **Existing**: `CoreValidationService` (src/core/validation-service/) - Schema validation with error formatting
- **NEW**: `CoreConfigManager` - Card-type-agnostic API that wraps these systems

### Key Requirements

1. ✅ **MSD MUST use core singletons** - No parallel config systems
2. ✅ **All provenance tracking preserved** - Leverages existing `mergePacks` provenance
3. ✅ **Cards self-register schemas** - Schemas ship with card implementations
4. ✅ **Consistent API** - Same config processing for SimpleCard, MSD, future cards
5. ✅ **Backward compatible** - Existing MSD configs continue to work

---

## Current State Analysis

### What's Already Complete ✅

#### 1. Core Singleton Infrastructure (`src/core/lcards-core.js`)

All major MSD systems have been extracted to core singletons:

```javascript
// Already available in window.lcardsCore
{
  systemsManager: CoreSystemsManager,      // Entity state tracking
  dataSourceManager: DataSourceManager,    // Real MSD DataSourceManager
  rulesManager: RulesEngine,               // Real MSD RulesEngine
  themeManager: ThemeManager,              // Real MSD ThemeManager with packs
  animationManager: AnimationManager,      // Animation coordination
  validationService: CoreValidationService,// Config validation
  stylePresetManager: StylePresetManager,  // Style presets + CSS utilities
  animationRegistry: AnimationRegistry,    // Animation instance caching
  actionHandler: LCARdSActionHandler      // Unified action handling
}
```

#### 2. Config Merging System (`src/core/packs/mergePacks.js`)

**Already implements comprehensive config merging**:

```javascript
const merged = await mergePacks(userConfig);

// Returns complete merged config with provenance
{
  version: 1,
  anchors: {},
  overlays: [],
  rules: [],
  animations: [],
  timelines: [],
  theme: 'lcars-classic',
  base_svg: 'builtin:enterprise-d',
  
  __provenance: {
    // Track where every anchor came from
    anchors: {
      'bridge_anchor': {
        origin_pack: 'core',
        origin_type: 'svg',
        coordinates: [200, 150],
        overridden: true,
        override_source: 'user_config',
        override_history: [...]
      }
    },
    
    // Track overlay sources
    overlays: {
      'title_overlay': {
        origin_pack: 'builtin_themes',
        overridden: true,
        override_layer: 'user_config'
      }
    },
    
    // Track theme selection
    theme: {
      active_theme: 'lcars-classic',
      source_pack: 'builtin_themes',
      requested_theme: 'lcars-classic',
      default_theme: 'lcars-classic',
      fallback_used: false,
      themes_available: ['lcars-classic', 'picard', 'discovery'],
      theme_pack_loaded: true
    },
    
    // Track pack loading
    packs: {
      builtin: ['core', 'builtin_themes', 'lcards_buttons'],
      external: [],
      failed: []
    },
    
    // Merge order for debugging
    merge_order: [
      { type: 'builtin', pack: 'core', priority: 100 },
      { type: 'builtin', pack: 'builtin_themes', priority: 101 },
      { type: 'user', pack: 'user_config', priority: 1000 }
    ]
  }
}
```

**Features**:
- ✅ Multi-layer merging (builtin → external → user)
- ✅ ID-based merging (overlays, rules, animations)
- ✅ Comprehensive provenance tracking
- ✅ Pack loading with timeout/retry
- ✅ Removal support (`remove: true`)
- ✅ ~700 lines of proven, tested code

#### 3. Validation System (`src/core/validation-service/index.js`)

**Already implements schema validation**:

```javascript
const result = validationService.validate(config, schema);

// Returns formatted validation result
{
  valid: true/false,
  errors: [
    {
      type: 'invalid_enum',
      field: 'preset',
      message: 'Invalid enum value',
      formattedMessage: 'Field "preset" must be one of: lozenge, bullet, picard',
      suggestion: 'Use one of these values for "preset": lozenge, bullet, picard',
      severity: 'error',
      context: { field: 'preset', validValues: 'lozenge, bullet, picard' }
    }
  ],
  warnings: [
    {
      type: 'missing_entity',
      field: 'entity',
      message: 'Entity not found in Home Assistant',
      formattedMessage: 'Entity "light.missing" not found in Home Assistant',
      suggestion: 'Verify the entity exists in Home Assistant',
      severity: 'warning'
    }
  ]
}
```

**Features**:
- ✅ Schema registry with common schemas
- ✅ Type/format/enum validation
- ✅ Entity existence checking (against HASS)
- ✅ User-friendly error formatting
- ✅ Suggestion generation
- ✅ Result caching

#### 4. MSD Already Uses Core Systems

```javascript
// src/msd/pipeline/PipelineCore.js (lines 80-91)
lcardsLog.debug('[PipelineCore] 🚀 Phase 1.5: Connecting to LCARdS Core Infrastructure');
if (hass && lcardsCore._coreInitialized) {
  lcardsCore.updateHass(hass);
}

// src/msd/pipeline/ConfigProcessor.js
export async function processAndValidateConfig(userMsdConfig) {
  const mergedConfig = await mergePacks(userMsdConfig);  // ✅ Uses core merging
  const issues = validateMerged(mergedConfig);            // ✅ Uses validation
  return { mergedConfig, issues, provenance: mergedConfig.__provenance };
}
```

### What's Missing: CoreConfigManager 🔨

A **unified, card-type-agnostic API** that wraps these systems:

**Problem**: Currently each card type accesses systems differently:
- MSD: `mergePacks()` → `validateMerged()` → manual processing
- SimpleCard: Direct config assignment → no validation → no provenance

**Solution**: Single entry point for all cards:

```javascript
const result = await configManager.processConfig(config, cardType, context);
// Works for SimpleCard, MSD, future cards
```

---

## Architectural Decisions

### Decision 1: CoreConfigManager is a Facade ✅

**Rationale**:
- `mergePacks` and `CoreValidationService` already do the heavy lifting (~700 lines + ~600 lines)
- CoreConfigManager provides a unified API (~300 lines)
- Avoids duplicating complex, proven logic
- Enables consistent config processing across all cards

**Implementation Impact**: LOW
- Wraps existing systems
- No rewrite required
- Most complexity already solved

---

### Decision 2: MSD MUST Use Core Singletons ✅

**Rationale**:
- Eliminates parallel systems
- Ensures consistency
- Single source of truth for config processing
- Easier maintenance and debugging

**Current State**: MSD uses `mergePacks` directly but doesn't expose unified API

**Target State**: MSD uses `CoreConfigManager.processConfig()`

**Migration Path**:
```javascript
// BEFORE (current)
const { mergedConfig, issues } = await processAndValidateConfig(userMsdConfig);

// AFTER (target)
const result = await configManager.processConfig(userMsdConfig, 'msd', {});
const mergedConfig = result.mergedConfig;
const issues = { errors: result.errors, warnings: result.warnings };
```

---

### Decision 3: Cards Self-Register Schemas ✅

**Rationale**:
- Schema lives with card implementation (single source of truth)
- Adding new cards doesn't require core changes
- Follows "open for extension" principle
- Schema versioning per card

**Pattern**:
```javascript
// src/cards/lcards-simple-button.js

// Define schema inline with card
const SIMPLE_BUTTON_SCHEMA = {
  $id: 'simple-button-v1',
  type: 'object',
  required: ['type'],
  properties: {
    type: { type: 'string', enum: ['custom:lcards-simple-button'] },
    entity: { type: 'string', pattern: '^[a-z_]+\\.[a-z0-9_]+$' },
    preset: { 
      type: 'string', 
      enum: ['lozenge', 'bullet', 'picard', 'square', 'pill']
    },
    label: { type: 'string' },
    icon: { type: 'string' },
    style: { type: 'object' },
    show_label: { type: 'boolean' },
    show_icon: { type: 'boolean' },
    tap_action: { type: 'object' },
    hold_action: { type: 'object' }
  }
};

// Self-register when module loads
if (window.lcardsCore?.configManager) {
  window.lcardsCore.configManager.registerCardSchema('simple-button', SIMPLE_BUTTON_SCHEMA);
  window.lcardsCore.configManager.registerCardDefaults('simple-button', {
    style: {
      height: 45,
      fontSize: 20,
      textAlign: 'right'
    },
    show_label: true,
    show_icon: false
  });
}

export class LCARdSSimpleButton extends LCARdSSimpleCard {
  async setConfig(config) {
    // Use CoreConfigManager
    const result = await window.lcardsCore.configManager.processConfig(
      config,
      'simple-button',
      { hass: this.hass, entity: this._entity }
    );
    
    if (!result.valid) {
      throw new Error(`Config errors: ${result.errors.map(e => e.formattedMessage).join(', ')}`);
    }
    
    this._config = result.mergedConfig;
    this._provenance = result.provenance;
  }
}
```

**Registration Timing**:
1. Core initializes → `CoreConfigManager` created
2. Card module loads → Schema self-registers
3. Card instance created → Schema available for validation

---

### Decision 4: All Provenance Preserved ✅

**Guarantee**: CoreConfigManager wraps `mergePacks`, so all provenance tracking is preserved

```javascript
// CoreConfigManager.processConfig() implementation
if (this._usePackMerging(cardType)) {
  // MSD-style: Full pack merging
  mergedConfig = await mergePacks(userConfig);
  provenance = mergedConfig.__provenance;  // ✅ PRESERVED
} else {
  // SimpleCards: Simple merge with provenance
  mergedConfig = this._simpleDeepMerge(defaults, userConfig);
  provenance = this._createSimpleProvenance(defaults, userConfig);  // ✅ CREATED
}
```

**Provenance Structure**:
```javascript
{
  merge_order: ['defaults', 'theme_defaults', 'preset_lozenge', 'user_config'],
  field_sources: {
    'style.color': 'user_config',
    'style.fontSize': 'preset_lozenge',
    'style.height': 'defaults',
    'style.textAlign': 'theme_defaults'
  },
  theme: { /* theme selection provenance */ },
  packs: { /* pack loading info */ },
  anchors: { /* anchor provenance per ID */ },
  overlays: { /* overlay provenance per ID */ }
}
```

**Use Cases**:
- User asks "Why is my button orange?" → Check `field_sources['style.color']` → "user_config"
- Debug theme issues → Check `theme.fallback_used` → "true, requested 'custom' not found"
- Track anchor overrides → Check `anchors.bridge_anchor.override_history`

---

### Decision 5: SimpleCard is Primary Use Case ✅

**Focus**: CoreConfigManager primarily serves SimpleCard foundation

**Rationale**:
- SimpleCards need validation (currently have none)
- SimpleCards need default merging (currently shallow)
- SimpleCards need theme token resolution
- MSD already works (migration is for consistency)

**SimpleCard Hierarchy**:
```
src/base/LCARdSSimpleCard.js          # Base class (uses CoreConfigManager)
  ├─ src/cards/lcards-simple-button.js    # ✅ IMPLEMENTED
  ├─ src/cards/lcards-simple-label.js     # Future
  ├─ src/cards/lcards-simple-slider.js    # Future
  └─ src/cards/lcards-simple-gauge.js     # Future
```

---

## CoreConfigManager Design

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│           window.lcardsCore (Singleton Registry)             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │      CoreConfigManager (NEW - ~300 lines)              │  │
│  │                                                         │  │
│  │  ┌─ processConfig(config, cardType, context)          │  │
│  │  ├─ registerCardSchema(type, schema)                  │  │
│  │  ├─ registerCardDefaults(type, defaults)              │  │
│  │  └─ getDebugInfo()                                     │  │
│  │                                                         │  │
│  │         │                          │                    │  │
│  │         ▼                          ▼                    │  │
│  │  ┌─────────────┐          ┌─────────────────────────┐ │  │
│  │  │  mergePacks │          │ CoreValidationService   │ │  │
│  │  │  (existing) │          │     (existing)          │ │  │
│  │  │  ~700 lines │          │     ~600 lines          │ │  │
│  │  └─────────────┘          └─────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ThemeManager (existing) ✅                                   │
│  StylePresetManager (existing) ✅                             │
│  AnimationManager (existing) ✅                               │
└──────────────────────────────────────────────────────────────┘
                           ▲
                           │ All cards use unified API
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐  ┌────────▼────────┐  ┌─────▼──────┐
│ SimpleButton │  │   MSD Card      │  │  Future    │
│ (V2)         │  │                 │  │  Cards     │
│              │  │                 │  │            │
│ Self-        │  │ Uses            │  │ Self-      │
│ registers    │  │ CoreConfigMgr   │  │ register   │
│ schema       │  │ (migrated)      │  │ schema     │
└──────────────┘  └─────────────────┘  └────────────┘
```

### File Structure

```
src/core/config-manager/
├── index.js                    # CoreConfigManager class (main implementation)
├── schema-templates.js         # Common schema patterns/templates
└── README.md                   # Usage documentation
```

### API Design

```javascript
/**
 * CoreConfigManager - Unified configuration processing facade
 * 
 * Coordinates existing systems (mergePacks, CoreValidationService, ThemeManager)
 * to provide card-type-agnostic config processing with validation, merging,
 * and provenance tracking.
 * 
 * @example
 * // In card implementation
 * const result = await configManager.processConfig(
 *   userConfig,
 *   'simple-button',
 *   { hass, entity }
 * );
 * 
 * if (!result.valid) {
 *   throw new Error(result.errors.map(e => e.formattedMessage).join(', '));
 * }
 * 
 * this._config = result.mergedConfig;
 * this._provenance = result.provenance;
 */
export class CoreConfigManager {
  /**
   * Process card configuration
   * 
   * @param {Object} userConfig - Raw config from YAML/UI
   * @param {string} cardType - Card type identifier ('simple-button', 'msd', etc.)
   * @param {Object} context - Additional context { hass, entity, ... }
   * @returns {Promise<ConfigResult>} Result with merged config, validation, provenance
   * 
   * @typedef {Object} ConfigResult
   * @property {boolean} valid - Whether config is valid
   * @property {Object} mergedConfig - Fully merged configuration
   * @property {Array<Error>} errors - Validation errors (formatted)
   * @property {Array<Warning>} warnings - Validation warnings (formatted)
   * @property {Object} provenance - Merge provenance tracking
   */
  async processConfig(userConfig, cardType, context = {});

  /**
   * Register card type schema
   * 
   * @param {string} cardType - Card type identifier
   * @param {Object} schema - JSON schema definition
   * @param {Object} options - Registration options
   * @param {boolean} options.override - Override existing schema
   * 
   * @example
   * configManager.registerCardSchema('simple-button', {
   *   $id: 'simple-button-v1',
   *   type: 'object',
   *   required: ['type'],
   *   properties: { ... }
   * });
   */
  registerCardSchema(cardType, schema, options = {});

  /**
   * Register card type defaults
   * 
   * @param {string} cardType - Card type identifier
   * @param {Object} defaults - Default configuration
   * 
   * @example
   * configManager.registerCardDefaults('simple-button', {
   *   style: { height: 45, fontSize: 20 },
   *   show_label: true
   * });
   */
  registerCardDefaults(cardType, defaults);

  /**
   * Get debug information
   * 
   * @returns {Object} Debug info
   */
  getDebugInfo();
}
```

---

## Implementation Plan

### Phase 1: Create CoreConfigManager (2-3 days)

#### Task 1.1: Implement Core Class

**File**: `src/core/config-manager/index.js`

**Implementation** (full file):

```javascript
/**
 * @fileoverview CoreConfigManager - Unified configuration processing facade
 * 
 * Coordinates existing systems (mergePacks, CoreValidationService, ThemeManager)
 * to provide card-type-agnostic config processing.
 * 
 * @module core/config-manager
 */

import { lcardsLog } from '../../utils/lcards-logging.js';
import { mergePacks } from '../packs/mergePacks.js';

/**
 * CoreConfigManager - High-level configuration coordinator
 * 
 * Wraps existing proven systems with a unified, card-type-agnostic API.
 * Primary use case: SimpleCard foundation (simple-button, simple-label, etc.)
 * 
 * @class CoreConfigManager
 */
export class CoreConfigManager {
  constructor() {
    // References to other core systems (set during initialization)
    this.validationService = null;
    this.themeManager = null;
    this.stylePresetManager = null;
    
    // Card-specific configuration
    this._cardSchemas = new Map();
    this._cardDefaults = new Map();
    
    // Statistics
    this._stats = {
      processedConfigs: 0,
      validationErrors: 0,
      validationWarnings: 0,
      schemaRegistrations: 0,
      defaultRegistrations: 0
    };
    
    this.initialized = false;
    
    lcardsLog.debug('[CoreConfigManager] Instance created (not initialized)');
  }

  /**
   * Initialize with singleton references
   * 
   * @param {Object} singletons - References to other core systems
   * @param {CoreValidationService} singletons.validationService - Validation service
   * @param {ThemeManager} singletons.themeManager - Theme manager
   * @param {StylePresetManager} singletons.stylePresetManager - Style preset manager
   * @returns {Promise<void>}
   */
  async initialize(singletons) {
    lcardsLog.debug('[CoreConfigManager] 🚀 Initializing...');
    
    this.validationService = singletons.validationService;
    this.themeManager = singletons.themeManager;
    this.stylePresetManager = singletons.stylePresetManager;
    
    // Register builtin card types
    this._registerBuiltinCardTypes();
    
    this.initialized = true;
    
    lcardsLog.info('[CoreConfigManager] ✅ Initialized', {
      hasValidationService: !!this.validationService,
      hasThemeManager: !!this.themeManager,
      hasStylePresetManager: !!this.stylePresetManager,
      registeredSchemas: this._cardSchemas.size,
      registeredDefaults: this._cardDefaults.size
    });
  }

  /**
   * Process card configuration (main entry point)
   * 
   * Steps:
   * 1. Get card defaults
   * 2. Merge config (pack-based for MSD, simple for others)
   * 3. Validate against schema
   * 4. Resolve theme tokens
   * 5. Return result with provenance
   * 
   * @param {Object} userConfig - Raw config from YAML/UI
   * @param {string} cardType - Card type ('simple-button', 'msd', etc.)
   * @param {Object} context - Additional context (hass, entity, etc.)
   * @returns {Promise<Object>} { valid, mergedConfig, errors, warnings, provenance }
   * 
   * @example
   * const result = await configManager.processConfig(
   *   { type: 'custom:lcards-simple-button', preset: 'lozenge', label: 'Test' },
   *   'simple-button',
   *   { hass, entity }
   * );
   * 
   * if (!result.valid) {
   *   console.error('Config errors:', result.errors);
   * }
   * 
   * const finalConfig = result.mergedConfig;
   * const fieldSources = result.provenance.field_sources;
   */
  async processConfig(userConfig, cardType, context = {}) {
    lcardsLog.debug(`[CoreConfigManager] Processing config for ${cardType}`, {
      hasConfig: !!userConfig,
      configKeys: Object.keys(userConfig || {})
    });

    this._stats.processedConfigs++;

    try {
      // Step 1: Get card defaults
      const defaults = this._getCardDefaults(cardType);

      // Step 2: Merge with pack system (for MSD-style cards) or simple merge
      let mergedConfig;
      let provenance = null;
      
      if (this._usePackMerging(cardType, userConfig)) {
        // MSD-style: Use full pack merging (preserves all provenance)
        lcardsLog.debug(`[CoreConfigManager] Using pack merging for ${cardType}`);
        mergedConfig = await mergePacks(userConfig);
        provenance = mergedConfig.__provenance;
      } else {
        // Simple cards: Deep merge defaults + user
        lcardsLog.debug(`[CoreConfigManager] Using simple merge for ${cardType}`);
        mergedConfig = this._simpleDeepMerge(defaults, userConfig);
        provenance = this._createSimpleProvenance(defaults, userConfig, cardType);
      }

      // Step 3: Validate against schema
      const validation = this._validateConfig(mergedConfig, cardType, context);
      
      if (!validation.valid) {
        this._stats.validationErrors += validation.errors.length;
      }
      this._stats.validationWarnings += validation.warnings.length;

      // Step 4: Resolve theme tokens (if themeManager available)
      if (this.themeManager && this.themeManager.initialized) {
        this._resolveThemeTokens(mergedConfig, cardType);
      }

      // Step 5: Return complete result
      const result = {
        valid: validation.valid,
        mergedConfig,
        errors: validation.errors,
        warnings: validation.warnings,
        provenance
      };

      lcardsLog.debug(`[CoreConfigManager] Config processed for ${cardType}:`, {
        valid: result.valid,
        errorCount: result.errors.length,
        warningCount: result.warnings.length,
        hasProvenance: !!result.provenance
      });

      return result;

    } catch (error) {
      lcardsLog.error(`[CoreConfigManager] Config processing failed for ${cardType}:`, error);
      
      return {
        valid: false,
        mergedConfig: userConfig,
        errors: [{
          type: 'processing_error',
          message: `Configuration processing failed: ${error.message}`,
          formattedMessage: `Configuration processing failed: ${error.message}`,
          suggestion: 'Check your configuration syntax and try again',
          severity: 'error'
        }],
        warnings: [],
        provenance: null
      };
    }
  }

  /**
   * Register card type schema
   * 
   * @param {string} cardType - Card type identifier
   * @param {Object} schema - JSON schema definition
   * @param {Object} options - Registration options
   * @param {boolean} options.override - Override existing schema
   * 
   * @example
   * configManager.registerCardSchema('simple-button', {
   *   $id: 'simple-button-v1',
   *   type: 'object',
   *   required: ['type'],
   *   properties: {
   *     type: { type: 'string', enum: ['custom:lcards-simple-button'] },
   *     preset: { type: 'string', enum: ['lozenge', 'bullet'] }
   *   }
   * });
   */
  registerCardSchema(cardType, schema, options = {}) {
    if (!cardType || !schema) {
      lcardsLog.warn('[CoreConfigManager] Cannot register schema: missing cardType or schema');
      return;
    }

    const exists = this._cardSchemas.has(cardType);
    
    if (exists && !options.override) {
      lcardsLog.warn(`[CoreConfigManager] Schema for ${cardType} already registered (use override: true to replace)`);
      return;
    }

    this._cardSchemas.set(cardType, schema);
    
    // Also register with CoreValidationService if available
    if (this.validationService) {
      this.validationService.schemaRegistry.registerSchema(cardType, schema);
    }
    
    this._stats.schemaRegistrations++;
    
    lcardsLog.debug(`[CoreConfigManager] ${exists ? 'Updated' : 'Registered'} schema for ${cardType}`, {
      schemaId: schema.$id,
      hasRequired: !!schema.required,
      propertyCount: Object.keys(schema.properties || {}).length
    });
  }

  /**
   * Register card type defaults
   * 
   * @param {string} cardType - Card type identifier
   * @param {Object} defaults - Default configuration
   * 
   * @example
   * configManager.registerCardDefaults('simple-button', {
   *   style: {
   *     height: 45,
   *     fontSize: 20,
   *     textAlign: 'right'
   *   },
   *   show_label: true,
   *   show_icon: false
   * });
   */
  registerCardDefaults(cardType, defaults) {
    if (!cardType || !defaults) {
      lcardsLog.warn('[CoreConfigManager] Cannot register defaults: missing cardType or defaults');
      return;
    }

    const exists = this._cardDefaults.has(cardType);
    this._cardDefaults.set(cardType, defaults);
    this._stats.defaultRegistrations++;
    
    lcardsLog.debug(`[CoreConfigManager] ${exists ? 'Updated' : 'Registered'} defaults for ${cardType}`, {
      defaultKeys: Object.keys(defaults)
    });
  }

  /**
   * Validate config against registered schema
   * @private
   */
  _validateConfig(config, cardType, context) {
    const schema = this._cardSchemas.get(cardType);
    
    if (!schema) {
      lcardsLog.debug(`[CoreConfigManager] No schema registered for ${cardType}, skipping validation`);
      return { valid: true, errors: [], warnings: [] };
    }

    if (!this.validationService) {
      lcardsLog.warn('[CoreConfigManager] ValidationService not available, skipping validation');
      return { valid: true, errors: [], warnings: [] };
    }

    return this.validationService.validate(config, schema, context);
  }

  /**
   * Get card defaults
   * @private
   */
  _getCardDefaults(cardType) {
    const defaults = this._cardDefaults.get(cardType);
    return defaults ? structuredClone(defaults) : {};
  }

  /**
   * Determine if card type should use pack merging
   * @private
   */
  _usePackMerging(cardType, userConfig) {
    // MSD always uses pack merging
    if (cardType === 'msd') {
      return true;
    }
    
    // Simple cards use pack merging if they specify use_packs
    if (userConfig && userConfig.use_packs) {
      return true;
    }
    
    // Otherwise use simple merge
    return false;
  }

  /**
   * Simple deep merge for non-MSD cards
   * @private
   */
  _simpleDeepMerge(target, source) {
    const result = structuredClone(target);
    
    for (const [key, value] of Object.entries(source)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Nested object - recurse
        result[key] = this._simpleDeepMerge(result[key] || {}, value);
      } else {
        // Primitive or array - overwrite
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Create simple provenance tracking for non-MSD cards
   * @private
   */
  _createSimpleProvenance(defaults, userConfig, cardType) {
    const provenance = {
      card_type: cardType,
      merge_order: [],
      field_sources: {},
      timestamp: Date.now()
    };

    // Track merge layers
    if (Object.keys(defaults).length > 0) {
      provenance.merge_order.push('defaults');
    }
    
    // Check for theme defaults
    if (this.themeManager && this.themeManager.initialized) {
      const componentType = this._mapCardTypeToComponent(cardType);
      const themeDefaults = this.themeManager.getDefault(componentType, 'base');
      if (themeDefaults && Object.keys(themeDefaults).length > 0) {
        provenance.merge_order.push('theme_defaults');
      }
    }
    
    // Check for preset
    if (userConfig.preset) {
      provenance.merge_order.push(`preset_${userConfig.preset}`);
    }
    
    provenance.merge_order.push('user_config');

    // Track field sources
    this._trackFieldSources(provenance.field_sources, defaults, userConfig, '');

    return provenance;
  }

  /**
   * Track field sources for provenance
   * @private
   */
  _trackFieldSources(sources, defaults, userConfig, path) {
    // Track where each field came from
    const allKeys = new Set([
      ...Object.keys(defaults || {}),
      ...Object.keys(userConfig || {})
    ]);
    
    for (const key of allKeys) {
      const fieldPath = path ? `${path}.${key}` : key;
      
      const userValue = userConfig?.[key];
      const defaultValue = defaults?.[key];
      
      // Recurse into nested objects
      if (userValue && typeof userValue === 'object' && !Array.isArray(userValue)) {
        this._trackFieldSources(sources, defaultValue || {}, userValue, fieldPath);
      } else {
        // Track source
        if (key in userConfig) {
          sources[fieldPath] = 'user_config';
        } else if (key in defaults) {
          sources[fieldPath] = 'defaults';
        }
      }
    }
    
    return sources;
  }

  /**
   * Resolve theme token references in config
   * @private
   */
  _resolveThemeTokens(config, cardType) {
    if (!this.themeManager || !this.themeManager.resolver) {
      return;
    }

    lcardsLog.debug(`[CoreConfigManager] Resolving theme tokens for ${cardType}`);
    
    // Get component-scoped resolver
    const componentType = this._mapCardTypeToComponent(cardType);
    const resolveToken = this.themeManager.resolver.forComponent(componentType);
    
    // Walk object tree and resolve tokens
    this._walkAndResolveTokens(config, resolveToken, '');
  }

  /**
   * Walk object tree and resolve theme tokens
   * @private
   */
  _walkAndResolveTokens(obj, resolveToken, path) {
    if (!obj || typeof obj !== 'object') return;
    
    for (const [key, value] of Object.entries(obj)) {
      const fieldPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string' && value.startsWith('theme:')) {
        // Resolve theme token
        const tokenPath = value.substring(6); // Remove 'theme:' prefix
        const resolved = resolveToken(tokenPath, value);
        
        if (resolved !== value) {
          obj[key] = resolved;
          lcardsLog.debug(`[CoreConfigManager] Resolved token at ${fieldPath}: ${value} → ${resolved}`);
        }
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recurse into nested objects
        this._walkAndResolveTokens(value, resolveToken, fieldPath);
      }
    }
  }

  /**
   * Map card type to component type (for ThemeManager)
   * @private
   */
  _mapCardTypeToComponent(cardType) {
    const mapping = {
      'simple-button': 'button',
      'simple-label': 'text',
      'simple-slider': 'slider',
      'simple-gauge': 'gauge',
      'msd': 'msd'
    };
    return mapping[cardType] || cardType;
  }

  /**
   * Register builtin card types
   * @private
   */
  _registerBuiltinCardTypes() {
    // Register simple-button defaults
    this.registerCardDefaults('simple-button', {
      style: {
        width: null,
        height: 45,
        fontSize: 20,
        textAlign: 'right'
      },
      show_label: true,
      show_icon: false
    });

    lcardsLog.debug('[CoreConfigManager] Builtin card types registered');
  }

  /**
   * Get statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return { ...this._stats };
  }

  /**
   * Get debug information
   * @returns {Object} Debug info
   */
  getDebugInfo() {
    return {
      initialized: this.initialized,
      hasValidationService: !!this.validationService,
      hasThemeManager: !!this.themeManager,
      hasStylePresetManager: !!this.stylePresetManager,
      registeredCardTypes: {
        schemas: Array.from(this._cardSchemas.keys()),
        defaults: Array.from(this._cardDefaults.keys())
      },
      stats: this.getStats()
    };
  }

  /**
   * Destroy and clean up
   */
  destroy() {
    this._cardSchemas.clear();
    this._cardDefaults.clear();
    this.validationService = null;
    this.themeManager = null;
    this.stylePresetManager = null;
    this.initialized = false;
    
    lcardsLog.debug('[CoreConfigManager] Destroyed');
  }
}
```

#### Task 1.2: Integrate with lcardsCore

**File**: `src/core/lcards-core.js`

**Changes**:

```javascript
// CHANGE 1: Add import (line 28, after other imports)
import { CoreValidationService } from './validation-service/index.js';
import { CoreConfigManager } from './config-manager/index.js';  // ✅ ADD THIS

// CHANGE 2: Add to constructor (line 55, after validationService)
this.validationService = null;   // Config validation and error reporting (Phase 2a)
this.configManager = null;       // ✅ ADD THIS - Config processing coordinator (Phase 2a)

// CHANGE 3: Initialize in _performInitialization (line 154, after ValidationService init)
// Initialize ValidationService (Phase 2a)
this.validationService = new CoreValidationService({
  validateEntities: true,
  cacheResults: true,
  debug: false
});
await this.validationService.initialize(hass);
lcardsLog.debug('[LCARdSCore] ✅ ValidationService initialized');

// ✅ ADD THIS BLOCK
// Initialize ConfigManager (Phase 2a)
this.configManager = new CoreConfigManager();
await this.configManager.initialize({
  validationService: this.validationService,
  themeManager: this.themeManager,
  stylePresetManager: this.stylePresetManager
});
lcardsLog.debug('[LCARdSCore] ✅ ConfigManager initialized');

// CHANGE 4: Add to cardContext (line 264, after validationService)
validationService: this.validationService,
configManager: this.configManager,  // ✅ ADD THIS

// CHANGE 5: Add to getDebugInfo (line 396, after validationService)
validationService: this.validationService ? this.validationService.getDebugInfo() : null,
configManager: this.configManager ? this.configManager.getDebugInfo() : null,  // ✅ ADD THIS

// CHANGE 6: Add to destroy (line 695, after validationService)
if (this.validationService) {
  this.validationService.destroy();
  this.validationService = null;
}

// ✅ ADD THIS BLOCK
if (this.configManager) {
  this.configManager.destroy();
  this.configManager = null;
}
```

#### Task 1.3: Create Documentation

**File**: `src/core/config-manager/README.md`

```markdown
# CoreConfigManager

Unified configuration processing coordinator for all LCARdS card types.

## Purpose

Provides a single, consistent API for config validation, merging, and provenance tracking across SimpleCard, MSD, and future card types.

## Features

- ✅ Card-type-agnostic config processing
- ✅ Schema validation with user-friendly errors
- ✅ Deep config merging with provenance tracking
- ✅ Theme token resolution
- ✅ Pack-based merging (for MSD)
- ✅ Self-registration pattern for card schemas

## Usage

### In Card Implementation

```javascript
import { LCARdSSimpleCard } from '../base/LCARdSSimpleCard.js';

// Define schema
const CARD_SCHEMA = {
  $id: 'my-card-v1',
  type: 'object',
  required: ['type'],
  properties: {
    type: { type: 'string' },
    label: { type: 'string' }
  }
};

// Self-register
if (window.lcardsCore?.configManager) {
  window.lcardsCore.configManager.registerCardSchema('my-card', CARD_SCHEMA);
  window.lcardsCore.configManager.registerCardDefaults('my-card', {
    label: 'Default Label'
  });
}

export class MyCard extends LCARdSSimpleCard {
  async setConfig(config) {
    const result = await window.lcardsCore.configManager.processConfig(
      config,
      'my-card',
      { hass: this.hass }
    );
    
    if (!result.valid) {
      throw new Error(result.errors.map(e => e.formattedMessage).join(', '));
    }
    
    this._config = result.mergedConfig;
    this._provenance = result.provenance;
  }
}
```

## Architecture

CoreConfigManager is a **facade** that coordinates:
- `mergePacks` (src/core/packs/mergePacks.js) - Deep merging with provenance
- `CoreValidationService` (src/core/validation-service/) - Schema validation

## Provenance Tracking

All config processing includes provenance tracking:

```javascript
{
  merge_order: ['defaults', 'theme_defaults', 'preset_lozenge', 'user_config'],
  field_sources: {
    'style.color': 'user_config',
    'style.fontSize': 'preset_lozenge',
    'style.height': 'defaults'
  }
}
```

## API Reference

See JSDoc in `index.js` for complete API documentation.
```

---

### Phase 2: Integrate with SimpleCard (2-3 days)

#### Task 2.1: Update SimpleCard Base Class

**File**: `src/base/LCARdSSimpleCard.js`

**Find the `setConfig` method and replace**:

```javascript
// BEFORE (current implementation - lines ~50-60)
setConfig(config) {
  if (!config) {
    throw new Error('Invalid configuration');
  }
  this._config = config;
  // ... rest of implementation
}

// AFTER (using CoreConfigManager)
async setConfig(config) {
  if (!config) {
    throw new Error('Invalid configuration');
  }

  // Get card type from config or class name
  const cardType = this._getCardType();
  
  // Use CoreConfigManager for unified processing
  const configManager = this._singletons?.configManager || window.lcardsCore?.configManager;
  
  if (configManager) {
    lcardsLog.debug(`[${this.constructor.name}] Processing config via CoreConfigManager`);
    
    try {
      const result = await configManager.processConfig(
        config,
        cardType,
        {
          hass: this.hass,
          entity: this._entity
        }
      );

      if (!result.valid) {
        // Format errors for user display
        const errorMessages = result.errors.map(e => e.formattedMessage).join('\n');
        throw new Error(`Configuration errors:\n${errorMessages}`);
      }

      this._config = result.mergedConfig;
      this._provenance = result.provenance;
      
      lcardsLog.debug(`[${this.constructor.name}] Config processed successfully:`, {
        valid: result.valid,
        warnings: result.warnings.length,
        hasProvenance: !!result.provenance
      });
      
    } catch (error) {
      lcardsLog.error(`[${this.constructor.name}] Config processing failed:`, error);
      throw error;
    }
  } else {
    // Fallback: Direct config assignment (for backward compatibility)
    lcardsLog.warn(`[${this.constructor.name}] CoreConfigManager not available, using fallback`);
    this._config = config;
    this._provenance = null;
  }

  // Continue with existing initialization
  this._extractEntity();
  // ... rest of method
}

// ADD NEW HELPER METHOD
/**
 * Get card type identifier for config processing
 * @returns {string} Card type (e.g., 'simple-button')
 * @private
 */
_getCardType() {
  // Extract from config type if available
  if (this._config?.type) {
    const match = this._config.type.match(/custom:lcards-(.*)/);
    if (match) {
      return match[1]; // e.g., 'simple-button'
    }
  }
  
  // Extract from class name
  const className = this.constructor.name; // e.g., 'LCARdSSimpleButton'
  const match = className.match(/LCARdSSimple(.+)/);
  if (match) {
    const type = match[1].toLowerCase(); // e.g., 'button'
    return `simple-${type}`;
  }
  
  return 'simple-card';
}
```

#### Task 2.2: Update Simple Button Card with Schema Registration

**File**: `src/cards/lcards-simple-button.js`

**Add at top of file (after imports, before class definition)**:

```javascript
import { LCARdSSimpleCard } from '../base/LCARdSSimpleCard.js';
import { lcardsLog } from '../utils/lcards-logging.js';

// ✅ ADD THIS BLOCK
/**
 * Simple Button Card Schema
 * Defines valid configuration structure for simple-button cards
 */
const SIMPLE_BUTTON_SCHEMA = {
  $id: 'simple-button-v1',
  type: 'object',
  required: ['type'],
  properties: {
    type: { 
      type: 'string', 
      enum: ['custom:lcards-simple-button']
    },
    entity: { 
      type: 'string', 
      pattern: '^[a-z_]+\\.[a-z0-9_]+$',
      errorMessage: 'Entity ID must follow format: domain.entity_id'
    },
    preset: { 
      type: 'string', 
      enum: ['lozenge', 'bullet', 'picard', 'square', 'pill'],
      errorMessage: 'Preset must be one of: lozenge, bullet, picard, square, pill'
    },
    label: { type: 'string' },
    icon: { type: 'string' },
    show_label: { type: 'boolean' },
    show_icon: { type: 'boolean' },
    style: { 
      type: 'object',
      properties: {
        width: { type: ['number', 'null'] },
        height: { type: 'number', minimum: 10, maximum: 1000 },
        fontSize: { type: 'number', minimum: 8, maximum: 100 },
        textAlign: { type: 'string', enum: ['left', 'center', 'right'] },
        color: { type: 'string' },
        backgroundColor: { type: 'string' },
        borderRadius: { type: 'number', minimum: 0 }
      }
    },
    tap_action: { type: 'object' },
    hold_action: { type: 'object' },
    double_tap_action: { type: 'object' }
  }
};

/**
 * Simple Button Card Defaults
 * Default values applied when not specified in config
 */
const SIMPLE_BUTTON_DEFAULTS = {
  style: {
    width: null,
    height: 45,
    fontSize: 20,
    textAlign: 'right'
  },
  show_label: true,
  show_icon: false
};

// Self-register schema and defaults when module loads
if (window.lcardsCore?.configManager) {
  lcardsLog.debug('[SimpleButton] Registering schema and defaults with CoreConfigManager');
  
  window.lcardsCore.configManager.registerCardSchema(
    'simple-button', 
    SIMPLE_BUTTON_SCHEMA,
    { override: true }
  );
  
  window.lcardsCore.configManager.registerCardDefaults(
    'simple-button',
    SIMPLE_BUTTON_DEFAULTS
  );
  
  lcardsLog.info('[SimpleButton] ✅ Schema and defaults registered');
} else {
  lcardsLog.warn('[SimpleButton] CoreConfigManager not available, schema not registered');
}

// Existing class definition follows...
export class LCARdSSimpleButton extends LCARdSSimpleCard {
  // ... existing implementation
}
```

#### Task 2.3: Add Tests

**File**: `test/unit/core/config-manager.test.js` (new file)

```javascript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { CoreConfigManager } from '../../../src/core/config-manager/index.js';

describe('CoreConfigManager', () => {
  let configManager;
  let mockValidationService;
  let mockThemeManager;

  beforeEach(() => {
    configManager = new CoreConfigManager();
    
    mockValidationService = {
      validate: (config, schema) => ({ valid: true, errors: [], warnings: [] }),
      schemaRegistry: {
        registerSchema: () => {}
      }
    };
    
    mockThemeManager = {
      initialized: true,
      resolver: {
        forComponent: () => (token) => token
      },
      getDefault: () => ({})
    };
    
    configManager.initialize({
      validationService: mockValidationService,
      themeManager: mockThemeManager,
      stylePresetManager: null
    });
  });

  it('should merge base defaults with user config', async () => {
    configManager.registerCardDefaults('test-card', {
      style: { height: 45, fontSize: 20 }
    });

    const result = await configManager.processConfig(
      { style: { color: 'red' } },
      'test-card',
      {}
    );

    expect(result.valid).toBe(true);
    expect(result.mergedConfig.style.height).toBe(45);
    expect(result.mergedConfig.style.fontSize).toBe(20);
    expect(result.mergedConfig.style.color).toBe('red');
  });

  it('should track provenance for all fields', async () => {
    configManager.registerCardDefaults('test-card', {
      style: { height: 45 }
    });

    const result = await configManager.processConfig(
      { style: { color: 'red' } },
      'test-card',
      {}
    );

    expect(result.provenance.field_sources['style.height']).toBe('defaults');
    expect(result.provenance.field_sources['style.color']).toBe('user_config');
  });

  it('should validate against registered schema', async () => {
    const schema = {
      type: 'object',
      required: ['type'],
      properties: {
        type: { type: 'string', enum: ['test'] }
      }
    };

    mockValidationService.validate = (config, schema) => ({
      valid: false,
      errors: [{ type: 'invalid_enum', field: 'type' }],
      warnings: []
    });

    configManager.registerCardSchema('test-card', schema);

    const result = await configManager.processConfig(
      { type: 'invalid' },
      'test-card',
      {}
    );

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

---

### Phase 3: MSD Migration (2-3 days)

#### Task 3.1: Update MSD ConfigProcessor

**File**: `src/msd/pipeline/ConfigProcessor.js`

**Replace the entire `processAndValidateConfig` function**:

```javascript
// BEFORE (lines 7-59)
export async function processAndValidateConfig(userMsdConfig) {
  const mergedConfig = await mergePacks(userMsdConfig);
  const provenance = mergedConfig.__provenance;
  
  // ... existing validation logic
  
  return { mergedConfig, issues, provenance };
}

// AFTER (using CoreConfigManager)
export async function processAndValidateConfig(userMsdConfig) {
  lcardsLog.debug('[ConfigProcessor] Processing MSD config via CoreConfigManager');
  
  // Use CoreConfigManager for unified processing
  const configManager = window.lcardsCore?.configManager;
  
  if (configManager && configManager.initialized) {
    // NEW PATH: Use CoreConfigManager
    const result = await configManager.processConfig(
      userMsdConfig,
      'msd',
      {}
    );
    
    // Convert to MSD expected format
    const issues = {
      errors: result.errors.map(err => ({
        code: err.type,
        severity: 'error',
        message: err.formattedMessage || err.message,
        msg: err.message
      })),
      warnings: result.warnings.map(warn => ({
        code: warn.type,
        severity: 'warning',
        message: warn.formattedMessage || warn.message,
        msg: warn.message
      }))
    };
    
    const mergedConfig = result.mergedConfig;
    const provenance = result.provenance;
    
    lcardsLog.debug('[ConfigProcessor] MSD config processed via CoreConfigManager:', {
      valid: result.valid,
      errorCount: issues.errors.length,
      warningCount: issues.warnings.length
    });
    
    // Continue with MSD-specific anchor validation (existing logic)
    try {
      const existingCodes = new Set(issues.errors.map(e => e.code));
      const anchorSet = new Set(Object.keys(mergedConfig.anchors || {}));

      const overlayIds = new Set();
      (mergedConfig.overlays || []).forEach(overlay => {
        if (overlay && overlay.id) {
          overlayIds.add(overlay.id);
          anchorSet.add(overlay.id);
        }
      });

      (mergedConfig.overlays || []).forEach(o => {
        if (!o || !o.id) return;
        const aRefs = [];
        if (typeof o.anchor === 'string') aRefs.push(o.anchor);
        if (typeof o.attach_to === 'string') aRefs.push(o.attach_to);
        if (typeof o.attachTo === 'string') aRefs.push(o.attachTo);
        aRefs.forEach(ref => {
          if (ref && !anchorSet.has(ref)) {
            const code = 'anchor.missing';
            if (!existingCodes.has(`${code}:${ref}:${o.id}`)) {
              issues.errors.push({
                code,
                severity: 'error',
                overlay: o.id,
                anchor: ref,
                msg: `Overlay ${o.id} references missing anchor '${ref}'`
              });
              existingCodes.add(`${code}:${ref}:${o.id}`);
            }
          }
        });
      });
    } catch (anchorError) {
      lcardsLog.warn('[ConfigProcessor] Anchor validation failed:', anchorError);
    }

    return { mergedConfig, issues, provenance };
    
  } else {
    // FALLBACK PATH: Use legacy direct mergePacks (for backward compatibility)
    lcardsLog.warn('[ConfigProcessor] CoreConfigManager not available, using legacy path');
    
    const mergedConfig = await mergePacks(userMsdConfig);
    const provenance = mergedConfig.__provenance;

    // Store original user config in debug namespace
    if (typeof window !== 'undefined') {
      window.lcards = window.lcards || {};
      window.lcards.debug = window.lcards.debug || {};
      window.lcards.debug.msd = window.lcards.debug.msd || {};
      window.lcards.debug.msd._originalUserConfig = userMsdConfig;
    }

    // Validation pass (existing logic)
    const t0 = performance.now();
    const issues = validateMerged(mergedConfig);
    mergedConfig.__issues = issues;
    const t1 = performance.now();
    try {
      window.lcards.debug.msd && (window.lcards.debug.msd._validationMs = (t1 - t0));
    } catch {}

    // Anchor validation (existing logic - same as above)
    try {
      const existingCodes = new Set(issues.errors.map(e => e.code));
      const anchorSet = new Set(Object.keys(mergedConfig.anchors || {}));
      // ... same anchor validation logic
    } catch {}

    return { mergedConfig, issues, provenance };
  }
}
```

#### Task 3.2: Register MSD Schema

**File**: `src/msd/schemas/msd-schema-registration.js` (new file)

```javascript
/**
 * MSD Card Schema Registration
 * 
 * Registers the MSD card configuration schema with CoreConfigManager.
 * This enables validation of MSD configs through the unified config system.
 */

import { lcardsLog } from '../../utils/lcards-logging.js';

/**
 * MSD Card Configuration Schema
 * Defines the valid structure for MSD (Master Systems Display) cards
 */
export const MSD_SCHEMA = {
  $id: 'msd-v1',
  type: 'object',
  required: ['type'],
  properties: {
    type: { 
      type: 'string', 
      enum: ['custom:cb-lcars-card']
    },
    version: { type: 'number' },
    use_packs: {
      type: 'object',
      properties: {
        builtin: { type: 'array', items: { type: 'string' } },
        external: { type: 'array', items: { type: 'string' } }
      }
    },
    theme: { type: 'string' },
    base_svg: { 
      oneOf: [
        { type: 'string' },
        { 
          type: 'object',
          properties: {
            source: { type: 'string' },
            filters: { type: 'object' },
            filter_preset: { type: 'string' }
          }
        }
      ]
    },
    view_box: { 
      type: 'array',
      minItems: 4,
      maxItems: 4,
      items: { type: 'number' }
    },
    anchors: { type: 'object' },
    overlays: { 
      type: 'array',
      items: { type: 'object' }
    },
    rules: {
      type: 'array',
      items: { type: 'object' }
    },
    animations: {
      type: 'array',
      items: { type: 'object' }
    },
    timelines: {
      type: 'array',
      items: { type: 'object' }
    },
    data_sources: { type: 'object' },
    routing: { type: 'object' },
    debug: { type: 'object' },
    remove: { type: 'object' }
  }
};

/**
 * Register MSD schema with CoreConfigManager
 * Called during MSD initialization
 */
export function registerMSDSchema() {
  if (window.lcardsCore?.configManager) {
    lcardsLog.debug('[MSD] Registering schema with CoreConfigManager');
    
    window.lcardsCore.configManager.registerCardSchema(
      'msd',
      MSD_SCHEMA,
      { override: true }
    );
    
    lcardsLog.info('[MSD] ✅ Schema registered with CoreConfigManager');
  } else {
    lcardsLog.warn('[MSD] CoreConfigManager not available, schema not registered');
  }
}

// Auto-register when module loads
registerMSDSchema();
```

**Import in MSD index**:

```javascript
// src/msd/index.js
import './schemas/msd-schema-registration.js';  // ✅ ADD THIS
```

---

## Schema Registration Pattern

### Self-Registration Flow

```
1. Core Init
   └─> LCARdSCore initialized
       └─> CoreConfigManager initialized
           └─> window.lcardsCore.configManager available

2. Card Module Load
   └─> Card file executed
       └─> Schema defined inline
       └─> Self-registration block executes
           if (window.lcardsCore?.configManager) {
             configManager.registerCardSchema(...)
             configManager.
