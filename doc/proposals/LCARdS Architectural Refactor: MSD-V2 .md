# LCARdS Architectural Refactor: MSD-V2 Unification Plan

**Date**: 2025-01-09
**Status**: APPROVED FOR IMPLEMENTATION
**Priority**: CRITICAL - Blocks all new overlay/card development

---

## Executive Summary

We are **inverting the architecture**: V2 cards become the foundation, MSD becomes the spatial compositor. This eliminates duplicate rendering logic, standardizes configuration, and preserves MSD's advanced features (selective updates, routing, anchoring).

**Key Principle**: If it renders pixels, it's a V2 card. If it positions/composes V2 cards, it's MSD.

---

## Phase 1: Extract Shared Renderers (Week 1)

### 1.1 Create Base Renderer Library

**New Directory Structure**:
```
src/
├── base/
│   ├── renderers/
│   │   ├── ButtonRenderer.js      ← Extract from MSD
│   │   ├── StatusGridRenderer.js  ← Extract from MSD
│   │   ├── LineRenderer.js        ← Extract from MSD
│   │   └── TextRenderer.js        ← Extract from MSD (core)
│   └── schemas/
│       ├── button-config.js       ← Universal config schema
│       ├── status-grid-config.js
│       └── text-config.js
```

### 1.2 ButtonRenderer Extraction

**Source**: `src/msd/renderer/core/ButtonRenderer.js`
**Destination**: `src/base/renderers/ButtonRenderer.js`

**Changes Required**:
```javascript
// BEFORE (MSD-coupled)
class ButtonRenderer extends BaseRenderer {
  static render(config, style, size, position, options = {}) {
    // Uses MSD-specific: overlayId, gridContext, cardInstance
    // Reads from: systemsManager.themeManager
    // Returns: { markup, actions, metadata }
  }
}

// AFTER (Context-agnostic)
class ButtonRenderer {
  /**
   * Render button SVG with universal context
   * @param {Object} config - Normalized button configuration
   * @param {Object} context - Rendering context
   *   @param {Object} context.hass - Home Assistant object
   *   @param {Function} context.getThemeToken - Theme token resolver
   *   @param {Function} context.processTemplate - Template processor
   *   @param {Object} context.entity - Current entity state
   *   @param {Element} context.container - DOM container for measurements
   *   @param {Array} context.viewBox - [x, y, width, height] for scaling
   * @returns {Object} { markup, metadata, actions }
   */
  static render(config, context) {
    // Extract from context
    const { hass, getThemeToken, processTemplate, entity, container, viewBox } = context;

    // Resolve button style using context functions
    const buttonStyle = this._resolveButtonStyle(config.style, getThemeToken);

    // Process template content
    const processedTexts = config.texts.map(text => ({
      ...text,
      content: processTemplate(text.content, { entity, hass })
    }));

    // Generate SVG (same logic, different data sources)
    const markup = this._generateButtonSVG(processedTexts, buttonStyle, config.size);

    return {
      markup,
      metadata: {
        bounds: this._calculateBounds(config),
        attachmentPoints: this._computeAttachmentPoints(config)
      },
      actions: this._extractActions(config)
    };
  }

  /**
   * Update button DOM incrementally
   * Preserves MSD's selective update innovation
   */
  static update(element, updates, context) {
    // Check what changed
    if (updates.content) {
      const textElements = element.querySelectorAll('[data-button-text]');
      textElements.forEach((el, i) => {
        if (updates.content[i]) {
          const processed = context.processTemplate(updates.content[i], context);
          el.textContent = processed;
        }
      });
    }

    if (updates.style) {
      // Apply style changes without re-render
      this._applyStyleUpdates(element, updates.style);
    }

    return true; // Indicate DOM was updated
  }
}
```

**Key Changes**:
1. ✅ Remove `extends BaseRenderer` - pure static utility
2. ✅ Replace `systemsManager` references with `context` parameter
3. ✅ Add `context.getThemeToken()` for theme access
4. ✅ Add `context.processTemplate()` for template evaluation
5. ✅ Keep all sophisticated rendering logic intact
6. ✅ Preserve `update()` method for selective DOM updates

### 1.3 Create Universal Button Config Schema

**File**: `src/base/schemas/button-config.js`

```javascript
/**
 * Universal Button Configuration Schema
 * Validated by ValidationService, used by V2 cards and MSD adapters
 */
export const ButtonConfigSchema = {
  // Identity
  id: { type: 'string', required: true },
  type: { type: 'string', default: 'button' },

  // Entity binding (optional - buttons can be static)
  entity: {
    type: 'string',
    optional: true,
    description: 'Home Assistant entity ID for state-driven buttons'
  },

  // Content - unified text system
  texts: {
    type: 'array',
    items: {
      content: { type: 'string', templates: true },
      position: {
        type: 'string',
        enum: ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'left', 'right'],
        default: 'center'
      },
      style: {
        fontSize: { type: 'number', default: 18 },
        fontFamily: { type: 'string', default: 'Antonio' },
        fontWeight: { type: 'string', default: 'normal' },
        color: { type: 'color', tokens: true }
      }
    },
    description: 'Text elements rendered on button'
  },

  // Legacy support (auto-convert to texts array)
  label: { type: 'string', templates: true, deprecated: true },
  value: { type: 'string', templates: true, deprecated: true },

  // Layout
  size: {
    type: 'array',
    items: { type: 'number' },
    length: 2,
    required: true,
    description: '[width, height] in SVG units'
  },

  position: {
    type: ['array', 'string'],
    msd_only: true,
    description: 'MSD positioning - [x, y] coordinates or anchor reference'
  },

  // Style system
  style: {
    // Preset system
    preset: {
      type: 'string',
      description: 'Named preset: lozenge, picard-filled, etc.',
      resolves_to: 'StylePresetManager'
    },

    // Appearance
    background: { type: 'color', tokens: true, default: 'var(--lcars-blue)' },

    // Border system (unified)
    border: {
      width: { type: 'number', default: 1 },
      color: { type: 'color', tokens: true },
      radius: { type: 'number', default: 8 },

      // Individual control
      top: { type: 'object', optional: true },
      right: { type: 'object', optional: true },
      bottom: { type: 'object', optional: true },
      left: { type: 'object', optional: true }
    },

    // Effects
    glow: { type: 'object', optional: true },
    gradient: { type: 'object', optional: true },
    pattern: { type: 'object', optional: true },

    // LCARS features
    brackets: {
      enabled: { type: 'boolean', default: false },
      style: { type: 'string', enum: ['standard', 'rounded', 'sharp'] },
      color: { type: 'color', tokens: true }
    }
  },

  // Actions (universal)
  tap_action: {
    type: 'action',
    default: { action: 'toggle' }
  },
  hold_action: { type: 'action', optional: true },
  double_tap_action: { type: 'action', optional: true },

  // Update triggers (V2 cards)
  triggers_update: {
    type: 'array',
    items: { type: 'string' },
    description: 'Entity IDs or DataSource names that trigger updates'
  }
};

/**
 * Normalize legacy config to standard schema
 */
export function normalizeButtonConfig(config) {
  const normalized = { ...config };

  // Convert label/value to texts array
  if (!normalized.texts && (normalized.label || normalized.value)) {
    normalized.texts = [];

    if (normalized.label) {
      normalized.texts.push({
        content: normalized.label,
        position: 'center',
        style: {}
      });
    }

    if (normalized.value) {
      normalized.texts.push({
        content: normalized.value,
        position: 'bottom-right',
        style: { fontSize: 14 }
      });
    }
  }

  // Flatten legacy style properties
  if (normalized.lcars_button_preset && !normalized.style?.preset) {
    normalized.style = normalized.style || {};
    normalized.style.preset = normalized.lcars_button_preset;
  }

  return normalized;
}
```

---

## Phase 2: Refactor V2 Button Card (Week 1)

### 2.1 Update V2 Button to Use Shared Renderer

**File**: `src/cards/lcards-v2-button.js`

**Changes**:

```javascript
// Add import
import { ButtonRenderer } from '../base/renderers/ButtonRenderer.js';
import { normalizeButtonConfig } from '../base/schemas/button-config.js';

export class LCARdSV2ButtonCard extends LCARdSV2Card {

  setConfig(config) {
    // Normalize config to standard schema
    const normalized = normalizeButtonConfig(config);
    super.setConfig(normalized);
  }

  render() {
    if (!this.config || !this._initialized) {
      return this._renderLoadingState();
    }

    // Create rendering context
    const context = this._createRenderingContext();

    // Use shared ButtonRenderer
    const result = ButtonRenderer.render(this.config, context);

    // Cache result for updates
    this._lastRenderResult = result;

    return html`
      <div class="v2-card-container">
        <svg
          class="v2-button-svg"
          width="${this.config.size[0]}"
          height="${this.config.size[1]}"
          viewBox="0 0 ${this.config.size[0]} ${this.config.size[1]}"
        >
          ${unsafeHTML(result.markup)}
        </svg>
      </div>
    `;
  }

  /**
   * Create rendering context for ButtonRenderer
   * This is the bridge between V2 card infrastructure and shared renderer
   */
  _createRenderingContext() {
    return {
      hass: this.hass,
      entity: this.hass?.states[this.config.entity],

      // Template processing via V2 systems
      processTemplate: (template, additionalContext = {}) => {
        return this.systemsManager.processTemplate(template, {
          ...additionalContext,
          entity: this.hass?.states[this.config.entity],
          config: this.config,
          hass: this.hass
        });
      },

      // Theme token resolution via V2 systems
      getThemeToken: (tokenPath, fallback) => {
        return this.systemsManager.getThemeToken(tokenPath, fallback);
      },

      // Container for measurements
      container: this.shadowRoot,

      // ViewBox for scaling calculations
      viewBox: [0, 0, this.config.size[0], this.config.size[1]]
    };
  }

  /**
   * Incremental update using shared renderer
   */
  updated(changedProperties) {
    super.updated(changedProperties);

    if (this._shouldIncrementalUpdate(changedProperties)) {
      const element = this.shadowRoot.querySelector('[data-button-id]');
      const updates = this._computeUpdates(changedProperties);
      const context = this._createRenderingContext();

      // Use shared update logic
      const updated = ButtonRenderer.update(element, updates, context);

      if (updated) {
        lcardsLog.debug(`[V2ButtonCard] Incremental update applied`);
      }
    }
  }

  _shouldIncrementalUpdate(changedProperties) {
    // Only entity state changes trigger incremental updates
    // Config changes require full re-render
    return changedProperties.has('hass') &&
           !changedProperties.has('config');
  }

  _computeUpdates(changedProperties) {
    const updates = {};

    if (changedProperties.has('hass')) {
      // Check what content needs updating
      const entity = this.hass?.states[this.config.entity];
      const oldEntity = changedProperties.get('hass')?.states[this.config.entity];

      if (entity?.state !== oldEntity?.state) {
        // Extract content templates that might have changed
        updates.content = this.config.texts.map(t => t.content);
      }

      if (entity?.state !== oldEntity?.state) {
        // Compute style updates for state changes
        updates.style = this._getStateBasedStyleUpdates(entity.state);
      }
    }

    return updates;
  }
}
```

**Remove from V2 Button**:
- ❌ `_renderFallbackButton()` - Use ButtonRenderer fallback
- ❌ `_buildMSDButtonConfig()` - Obsolete, config is already normalized
- ❌ `_resolveMSDButtonStyle()` - ButtonRenderer handles this
- ❌ Duplicate SVG generation logic

**Testing**:
```html
<!-- test-v2-button-refactor.html -->
<lcards-v2-button
  .config=${{
    entity: 'light.living_room',
    texts: [
      { content: 'Living Room', position: 'center' }
    ],
    size: [200, 50],
    style: { preset: 'lozenge' },
    tap_action: { action: 'toggle' }
  }}
  .hass=${mockHass}
></lcards-v2-button>
```

---

## Phase 3: Create MSD V2 Card Adapter (Week 2)

### 3.1 V2 Card Adapter System

**New File**: `src/msd/adapters/V2CardAdapter.js`

```javascript
/**
 * V2 Card Adapter for MSD Integration
 *
 * Wraps V2 cards for use as MSD overlays, handling:
 * - SVG positioning via foreignObject
 * - Anchor integration
 * - Rule engine patches
 * - Line attachment points
 */
import { OverlayBase } from '../overlays/OverlayBase.js';
import { lcardsLog } from '../../utils/lcards-logging.js';

export class V2CardAdapter extends OverlayBase {
  constructor(overlay, systemsManager) {
    super(overlay, systemsManager);
    this.rendererName = 'V2CardAdapter';

    // Extract V2 card type from overlay
    this.cardType = overlay.card_type || this._inferCardType(overlay.type);
    this.cardInstance = null;
    this.wrapper = null;
  }

  /**
   * Infer V2 card type from overlay type
   * Maps legacy overlay types to V2 card types
   */
  _inferCardType(overlayType) {
    const mapping = {
      'button': 'lcards-v2-button',
      'status_grid': 'lcards-v2-status-grid',
      'slider': 'lcards-v2-slider'
      // Add more as V2 cards are created
    };

    return mapping[overlayType] || null;
  }

  /**
   * Initialize V2 card instance
   * Called once during MSD overlay setup
   */
  async initialize(mountEl) {
    await super.initialize(mountEl);

    if (!this.cardType) {
      throw new Error(`V2CardAdapter: Cannot determine card type for overlay ${this.overlay.id}`);
    }

    // Create V2 card element
    this.cardInstance = document.createElement(this.cardType);

    // Convert MSD overlay config to V2 card config
    const cardConfig = this._convertMSDConfigToV2(this.overlay);

    // Set config and HASS
    this.cardInstance.setConfig(cardConfig);
    this.cardInstance.hass = this.systems.getHassV2();

    lcardsLog.debug(`[V2CardAdapter] Initialized ${this.cardType} for ${this.overlay.id}`);
  }

  /**
   * Render V2 card within SVG using foreignObject
   * Returns SVG markup that embeds the V2 card
   */
  render(overlay, anchors, viewBox, svgContainer, cardInstance) {
    const position = this._resolvePosition(overlay.position, anchors);
    const size = overlay.size || [200, 50];

    if (!position) {
      lcardsLog.error(`[V2CardAdapter] Cannot resolve position for ${overlay.id}`);
      return '';
    }

    const [x, y] = position;
    const [width, height] = size;

    // Create foreignObject wrapper
    const markup = `
      <foreignObject
        x="${x}"
        y="${y}"
        width="${width}"
        height="${height}"
        data-overlay-id="${overlay.id}"
        data-overlay-type="v2_card"
        data-card-type="${this.cardType}"
      >
        <div xmlns="http://www.w3.org/1999/xhtml"
             style="width: ${width}px; height: ${height}px;">
          <!-- V2 card will be injected here -->
        </div>
      </foreignObject>
    `;

    // Schedule card injection after DOM is ready
    requestAnimationFrame(() => {
      this._injectCardIntoDOM(overlay.id);
    });

    return {
      markup,
      metadata: {
        bounds: { x, y, width, height },
        attachmentPoints: this._computeAttachmentPoints(overlay, position, size)
      },
      actions: null // V2 card handles its own actions
    };
  }

  /**
   * Inject V2 card instance into foreignObject wrapper
   */
  _injectCardIntoDOM(overlayId) {
    if (!this.cardInstance) return;

    const foreignObject = this.mountEl.querySelector(`[data-overlay-id="${overlayId}"]`);
    if (!foreignObject) {
      lcardsLog.warn(`[V2CardAdapter] Foreign object not found for ${overlayId}`);
      return;
    }

    const wrapper = foreignObject.querySelector('div');
    if (wrapper) {
      wrapper.appendChild(this.cardInstance);
      lcardsLog.debug(`[V2CardAdapter] Card injected for ${overlayId}`);
    }
  }

  /**
   * Update forwarding to V2 card
   * V2 cards handle their own incremental updates
   */
  update(overlayElement, overlay, sourceData) {
    if (!this.cardInstance) return false;

    // Forward HASS updates
    if (sourceData?.hass) {
      this.cardInstance.hass = sourceData.hass;
    }

    // V2 cards have reactive properties - they update themselves
    return true;
  }

  /**
   * Compute attachment points for line anchoring
   * Delegates to V2 card if it supports attachment points
   */
  _computeAttachmentPoints(overlay, position, size) {
    const [x, y] = position;
    const [width, height] = size;

    // Standard rectangle attachment points
    return {
      center: [x + width / 2, y + height / 2],
      top: [x + width / 2, y],
      bottom: [x + width / 2, y + height],
      left: [x, y + height / 2],
      right: [x + width, y + height / 2],
      topLeft: [x, y],
      topRight: [x + width, y],
      bottomLeft: [x, y + height],
      bottomRight: [x + width, y + height]
    };
  }

  /**
   * Convert MSD overlay config to V2 card config
   * Removes MSD-specific properties, preserves card configuration
   */
  _convertMSDConfigToV2(msdOverlay) {
    const v2Config = {
      // Copy core properties
      entity: msdOverlay.entity,

      // Copy content/style (V2 cards use same schema)
      texts: msdOverlay.texts,
      label: msdOverlay.label,
      value: msdOverlay.value,
      style: msdOverlay.style,

      // Copy actions
      tap_action: msdOverlay.tap_action,
      hold_action: msdOverlay.hold_action,
      double_tap_action: msdOverlay.double_tap_action,

      // Size for V2 card rendering
      size: msdOverlay.size,

      // Update triggers
      triggers_update: msdOverlay.triggers_update
    };

    // Remove MSD-specific properties
    delete v2Config.position;  // MSD handles positioning
    delete v2Config.attach_to; // MSD handles line attachment

    return v2Config;
  }

  /**
   * Resolve position from MSD anchors
   */
  _resolvePosition(position, anchors) {
    if (Array.isArray(position)) {
      return position;
    }

    if (typeof position === 'string' && anchors[position]) {
      return anchors[position];
    }

    return null;
  }

  /**
   * Cleanup V2 card instance
   */
  destroy() {
    if (this.cardInstance) {
      this.cardInstance.remove();
      this.cardInstance = null;
    }

    super.destroy();
  }
}
```

### 3.2 Register V2 Card Adapter in MSD

**File**: `src/msd/renderer/AdvancedRenderer.js`

**Add to `_getRendererForOverlay()`**:

```javascript
_getRendererForOverlay(overlay) {
  // Check for V2 card adapter requirement
  if (overlay.type === 'v2_card' || overlay.card_type) {
    const adapter = new V2CardAdapter(overlay, this.systemsManager);
    this.overlayRenderers.set(overlay.id, adapter);
    return adapter;
  }

  // Existing overlay type handling...
}
```

### 3.3 MSD YAML Configuration

**New Overlay Type**:

```yaml
overlays:
  - type: v2_card              # Use V2 card adapter
    card_type: lcards-v2-button # Which V2 card to instantiate
    id: living_room_button
    position: [10, 10]          # MSD positioning
    size: [200, 50]             # MSD sizing

    # Standard V2 button config (passed directly to card)
    entity: switch.living_room
    texts:
      - content: "Living Room"
        position: "center"
    style:
      preset: lozenge
    tap_action:
      action: toggle
```

---

## Phase 4: MSD System Cleanup (Week 2-3)

### 4.1 What STAYS in MSD

**Keep These Systems** ✅:

1. **Routing System** (`src/msd/router/`)
   - `RouterCore.js` - Path routing for lines
   - Obstacle avoidance
   - Line attachment to overlays
   - **Why**: Unique to MSD's spatial composition

2. **Anchor System** (`src/msd/renderer/AttachmentPointManager.js`)
   - Named anchor points
   - Dynamic anchor generation
   - Virtual anchors from overlay attachment points
   - **Why**: Core to MSD's positioning system

3. **Line Overlays** (`src/msd/overlays/LineOverlay.js`)
   - Uses routing system
   - Attaches to other overlays
   - **Why**: MSD-specific feature

4. **SystemsManager** (`src/msd/SystemsManager.js`)
   - Coordinates all MSD subsystems
   - Rule engine integration
   - DataSource management
   - **Why**: MSD orchestration layer

5. **Selective Update System**
   - Entity change detection
   - Incremental DOM updates
   - Update batching
   - **Why**: Performance optimization unique to MSD

6. **ValidationService** (`src/msd/ValidationService.js`)
   - Config schema validation
   - **Enhancement**: Add V2 card schema validation
   - **Why**: Shared between MSD and V2 cards

7. **MsdTemplateEngine** (`src/msd/templates/MsdTemplateEngine.js`)
   - HA template evaluation
   - **Why**: Shared by both MSD and V2 cards via context

### 4.2 What GOES from MSD

**Remove/Refactor These** ❌:

1. **ButtonOverlay** (`src/msd/overlays/ButtonOverlay.js`)
   - ❌ Remove class entirely
   - ✅ Replace with V2CardAdapter for button overlays
   - **Migration**: Existing MSD configs auto-convert

2. **StatusGridOverlay** (`src/msd/overlays/StatusGridOverlay.js`)
   - ❌ Remove after V2 status grid card is created
   - ✅ Use V2CardAdapter
   - **Timeline**: Phase 5

3. **ButtonRenderer** (`src/msd/renderer/core/ButtonRenderer.js`)
   - ❌ Remove from MSD
   - ✅ Already moved to `src/base/renderers/ButtonRenderer.js`
   - **Migration**: Update all imports

4. **StatusGridRenderer** (`src/msd/renderer/StatusGridRenderer.js`)
   - ❌ Remove after extraction to base
   - ✅ Move to `src/base/renderers/StatusGridRenderer.js`
   - **Timeline**: Phase 5

5. **Duplicate Config Schemas**
   - ❌ Remove MSD-specific button config
   - ✅ Use universal schemas from `src/base/schemas/`
   - **Migration**: ValidationService uses universal schemas

### 4.3 Update AdvancedRenderer

**File**: `src/msd/renderer/AdvancedRenderer.js`

**Changes**:

```javascript
// Remove old imports
// import { ButtonOverlay } from '../overlays/ButtonOverlay.js';
// import { StatusGridOverlay } from '../overlays/StatusGridOverlay.js';

// Add new imports
import { V2CardAdapter } from '../adapters/V2CardAdapter.js';
import { ButtonRenderer } from '../../base/renderers/ButtonRenderer.js';

// Update _getRendererForOverlay()
_getRendererForOverlay(overlay) {
  // Check cache first
  if (this.overlayRenderers.has(overlay.id)) {
    return this.overlayRenderers.get(overlay.id);
  }

  // V2 card adapter for button overlays
  if (overlay.type === 'button' || overlay.type === 'v2_card') {
    const adapter = new V2CardAdapter(overlay, this.systemsManager);
    this.overlayRenderers.set(overlay.id, adapter);
    return adapter;
  }

  // Text overlays still use TextOverlay (simple, no duplication issue)
  if (overlay.type === 'text') {
    const textOverlay = new TextOverlay(overlay, this.systemsManager);
    this.overlayRenderers.set(overlay.id, textOverlay);
    return textOverlay;
  }

  // Line overlays use LineOverlay (MSD-specific)
  if (overlay.type === 'line') {
    const lineOverlay = new LineOverlay(overlay, this.systemsManager, this.routerCore);
    this.overlayRenderers.set(overlay.id, lineOverlay);
    return lineOverlay;
  }

  // ApexCharts still uses wrapper (chart library integration)
  if (overlay.type === 'apexchart') {
    const apexOverlay = new ApexChartsOverlay(overlay, this.systemsManager);
    this.overlayRenderers.set(overlay.id, apexOverlay);
    return apexOverlay;
  }

  return null;
}
```

### 4.4 Config Migration Utility

**New File**: `src/msd/migration/overlay-config-migrator.js`

```javascript
/**
 * Migrate legacy MSD overlay configs to V2 card adapter format
 */
export class OverlayConfigMigrator {

  /**
   * Migrate button overlay to V2 card adapter
   */
  static migrateButton(legacyOverlay) {
    return {
      type: 'v2_card',
      card_type: 'lcards-v2-button',
      id: legacyOverlay.id,
      position: legacyOverlay.position,
      size: legacyOverlay.size,

      // Forward all button config
      entity: legacyOverlay.entity,
      texts: legacyOverlay.texts,
      label: legacyOverlay.label,
      value: legacyOverlay.value,
      style: legacyOverlay.style,
      tap_action: legacyOverlay.tap_action,
      hold_action: legacyOverlay.hold_action,
      double_tap_action: legacyOverlay.double_tap_action,
      triggers_update: legacyOverlay.triggers_update
    };
  }

  /**
   * Auto-detect and migrate overlay configs
   */
  static migrate(overlay) {
    // Already using V2 adapter - no migration needed
    if (overlay.type === 'v2_card') {
      return overlay;
    }

    // Migrate based on overlay type
    switch (overlay.type) {
      case 'button':
        return this.migrateButton(overlay);

      // Add more as V2 cards are created
      case 'status_grid':
        return this.migrateStatusGrid(overlay);

      default:
        // No migration for this type yet
        return overlay;
    }
  }

  /**
   * Migrate entire MSD config
   */
  static migrateConfig(msdConfig) {
    return {
      ...msdConfig,
      overlays: msdConfig.overlays.map(overlay => this.migrate(overlay))
    };
  }
}

// Usage in MSD initialization
const migratedConfig = OverlayConfigMigrator.migrateConfig(rawConfig);
```

---

## Phase 5: Create Additional V2 Cards (Weeks 3-4)

### 5.1 V2 Status Grid Card

**New File**: `src/cards/lcards-v2-status-grid.js`

**Implementation Pattern** (same as V2 Button):
1. Extend `LCARdSV2Card`
2. Use shared `StatusGridRenderer` (to be extracted)
3. Create rendering context
4. Support incremental updates

**Schema**: `src/base/schemas/status-grid-config.js`

### 5.2 V2 Slider Card

**New File**: `src/cards/lcards-v2-slider.js`

**Extract**: `src/msd/controls/SliderControl.js` → `src/base/renderers/SliderRenderer.js`

### 5.3 Priority Order

1. **Week 3**: Status Grid (high usage in MSD)
2. **Week 4**: Slider (control interaction)
3. **Future**: Charts, custom shapes, etc.

---

## Testing & Validation

### Test Files to Create

1. **`test-button-renderer.html`**
   - Test ButtonRenderer in isolation
   - Various configs, themes, templates
   - Verify output matches old renderer

2. **`test-v2-button-refactored.html`**
   - Test V2 button with shared renderer
   - Entity updates, template processing
   - Incremental update validation

3. **`test-v2-card-adapter.html`**
   - Test V2CardAdapter in MSD context
   - Positioning, anchoring, line attachment
   - Rule engine patches

4. **`test-msd-migration.html`**
   - Load legacy MSD configs
   - Auto-migrate to V2 adapter
   - Verify visual parity

### Validation Checklist

For each phase:

- [ ] All existing functionality preserved
- [ ] No visual regressions
- [ ] Performance maintained or improved
- [ ] Config validation passes
- [ ] Legacy configs auto-migrate
- [ ] Documentation updated
- [ ] Unit tests pass

---

## Documentation Updates

### Files to Update

1. **`/doc/architecture/V2_CARDS.md`**
   - Document shared renderer pattern
   - Explain V2CardAdapter system
   - Migration guide for new V2 cards

2. **`/doc/architecture/MSD_SYSTEM.md`**
   - Update to reflect V2 adapter architecture
   - Document what stays vs. what's deprecated
   - Migration path for MSD users

3. **`/doc/migration/MSD_TO_V2.md`** (NEW)
   - Step-by-step migration guide
   - Config conversion examples
   - Troubleshooting

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Extract ButtonRenderer to base
- [ ] Create button config schema
- [ ] Refactor V2 button card
- [ ] Test standalone V2 button

### Week 2: Adapter System
- [ ] Create V2CardAdapter
- [ ] Integrate with AdvancedRenderer
- [ ] Test MSD with adapted button
- [ ] Create migration utility

### Week 3: Cleanup & Status Grid
- [ ] Remove ButtonOverlay
- [ ] Update all imports
- [ ] Extract StatusGridRenderer
- [ ] Create V2 status grid card

### Week 4: Polish & Document
- [ ] Comprehensive testing
- [ ] Performance validation
- [ ] Documentation updates
- [ ] Migration guide

---

## Success Criteria

✅ **V2 button card works standalone** without MSD
✅ **V2 button card works in MSD** via adapter
✅ **No duplicate rendering code** - ButtonRenderer is shared
✅ **Config schema is unified** - validated universally
✅ **Legacy MSD configs auto-migrate** - no breaking changes
✅ **Performance is maintained** - selective updates preserved
✅ **All tests pass** - visual and functional parity

---

## Agent Implementation Instructions

### Starting Point

```bash
# Create feature branch
git checkout -b refactor/msd-v2-unification

# Create new directories
mkdir -p src/base/renderers
mkdir -p src/base/schemas
mkdir -p src/msd/adapters
mkdir -p src/msd/migration
```

### Step-by-Step Implementation

**Session 1**: Extract ButtonRenderer
- Copy `src/msd/renderer/core/ButtonRenderer.js` → `src/base/renderers/ButtonRenderer.js`
- Remove `extends BaseRenderer`
- Replace `this.themeManager` with `context.getThemeToken()`
- Replace `this.systemsManager` with context parameters
- Add JSDoc for new API
- Create unit test

**Session 2**: Create Config Schema
- Create `src/base/schemas/button-config.js`
- Define `ButtonConfigSchema` object
- Implement `normalizeButtonConfig()` function
- Add validation rules
- Create schema test

**Session 3**: Refactor V2 Button
- Update imports in `src/cards/lcards-v2-button.js`
- Add `_createRenderingContext()` method
- Update `render()` to use ButtonRenderer
- Add incremental update support
- Test standalone functionality

**Session 4**: Create V2CardAdapter
- Implement `src/msd/adapters/V2CardAdapter.js`
- Handle foreignObject wrapping
- Implement config conversion
- Add attachment point computation
- Test in MSD context

**Session 5**: Integrate with MSD
- Update `src/msd/renderer/AdvancedRenderer.js`
- Modify `_getRendererForOverlay()`
- Update overlay registration
- Test existing MSD configs

**Session 6**: Cleanup
- Remove `src/msd/overlays/ButtonOverlay.js`
- Update all imports
- Run full test suite
- Update documentation

---

## Risk Mitigation

### Rollback Plan

Each phase is **independently reversible**:
1. Extracted renderers can coexist with MSD versions
2. V2CardAdapter is additive (doesn't break existing overlays)
3. Migration utility is optional (legacy configs still work)
4. Feature flags can disable adapter system

### Compatibility Shims

During transition period, support both:
```javascript
// Old way (deprecated, still works)
overlays:
  - type: button
    # ... config

// New way (preferred)
overlays:
  - type: v2_card
    card_type: lcards-v2-button
    # ... config
```
