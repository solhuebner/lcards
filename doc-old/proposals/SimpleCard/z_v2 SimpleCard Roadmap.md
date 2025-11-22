# LCARdS Simple Button Roadmap - Refined with Decisions

Based on your feedback, I'll update the roadmap with clarified priorities and implementation details. Let me first search for relevant architecture patterns around config validation, merging, and selective rendering.Let me search for the MSD cascade animation and validation/merging utilities:Excellent clarifications! Let me create a **revised and enhanced roadmap** that addresses your specific architectural requirements and incorporates the validation/config merging patterns from your existing MSD system.

# LCARdS Simple Button Card - Enhanced Roadmap v2

## Critical Architecture Review

Based on your feedback, I've identified **key architectural gaps** in the current SimpleCard implementation that need immediate attention:

### 🚨 **Priority 0: Foundation Fixes (BLOCKING ALL DEVELOPMENT)**

Before implementing any visual features, we must ensure SimpleCards follow the same robust patterns as MSD:

#### **0.1 Config Validation & Merging Integration**
**Problem**: Current `LCARdSSimpleCard` doesn't leverage `ValidationService` or proper config merging
**Impact**: Config errors aren't caught, preset merging is manual, no schema validation

**Required Changes**:

```javascript
// In LCARdSSimpleCard._onConfigSet()
_onConfigSet(config) {
  super._onConfigSet(config);
  
  // 1. Validate config against schema (like MSD does)
  if (this._singletons?.validationService) {
    const validation = this._singletons.validationService.validateConfig(
      config,
      'simple-card-button' // schema name
    );
    
    if (!validation.valid) {
      throw new Error(`Invalid config: ${validation.errors.join(', ')}`);
    }
  }
  
  // 2. Merge with preset if specified (deep merge like MSD)
  if (config.preset && this._singletons?.stylePresetManager) {
    const preset = this._singletons.stylePresetManager.getPreset('button', config.preset);
    if (preset) {
      // Use MSD's config merger (supports precedence, inheritance, token resolution)
      this._mergedConfig = this._deepMergeConfig(preset, config);
    }
  }
  
  // 3. Store entity reference
  if (config.entity && this.hass) {
    this._entity = this.hass.states[config.entity];
  }
}

/**
 * Deep merge configs with proper precedence (user config > preset > defaults)
 * Mirrors MSD's validateMerged.js approach
 */
_deepMergeConfig(preset, userConfig) {
  // Import or replicate MSD's deep merge logic
  // Handle 'extends' chains, token resolution, array merging
  return window.lcards?.utils?.deepMerge?.(preset, userConfig) || userConfig;
}
```

**Files to Study**:
- `src/msd/validation/validateMerged.js` - Config merging logic
- `src/core/validation-service/` - Validation patterns
- `src/msd/presets/StylePresetManager.js` - Preset resolution

---

#### **0.2 Selective Re-Rendering (Performance Critical)**
**Problem**: Current implementation does full card re-render on any state change
**Impact**: Flashing effects, poor performance, unnecessary SVG regeneration

**Required Changes**:

```javascript
// In LCARdSSimpleCard
_handleHassUpdate(newHass, oldHass) {
  // CRITICAL: Analyze what actually changed (like MSD SystemsManager does)
  const changes = this._detectChanges(newHass, oldHass);
  
  if (!changes.requiresRender) {
    // No visual changes - skip render
    lcardsLog.trace(`[LCARdSSimpleCard] No render needed for ${this._cardGuid}`);
    return;
  }
  
  if (changes.onlyText) {
    // Only text changed - update text nodes directly (no SVG rebuild)
    this._updateTextNodesOnly(changes.textUpdates);
    return;
  }
  
  if (changes.onlyColor) {
    // Only color changed - update fill/stroke attributes (no structure rebuild)
    this._updateColorsOnly(changes.colorUpdates);
    return;
  }
  
  // Full re-render only when structure changes (size, icon, layout)
  this._scheduleTemplateUpdate();
}

/**
 * Detect what changed between HASS updates
 * Returns: { requiresRender, onlyText, onlyColor, textUpdates, colorUpdates }
 */
_detectChanges(newHass, oldHass) {
  const oldState = oldHass?.states[this.config.entity];
  const newState = this._entity;
  
  if (!oldState || !newState) {
    return { requiresRender: true }; // Entity appeared/disappeared
  }
  
  const changes = {
    requiresRender: false,
    onlyText: false,
    onlyColor: false,
    textUpdates: {},
    colorUpdates: {}
  };
  
  // Check state value change
  if (oldState.state !== newState.state) {
    // State change might affect text templates and colors
    changes.requiresRender = true;
    
    // Optimize: if config has no templates, only colors change
    if (!this._hasTemplates()) {
      changes.onlyColor = true;
      changes.colorUpdates = this._getStateColors(newState.state);
    }
  }
  
  // Check attribute changes (for template resolution)
  const oldAttrs = oldState.attributes;
  const newAttrs = newState.attributes;
  
  if (this._attributesChanged(oldAttrs, newAttrs)) {
    changes.requiresRender = true;
    changes.onlyText = this._onlyTextAttributesChanged(oldAttrs, newAttrs);
    
    if (changes.onlyText) {
      changes.textUpdates = this._getTextUpdates(newAttrs);
    }
  }
  
  return changes;
}

/**
 * Update only text content without rebuilding SVG structure
 */
_updateTextNodesOnly(textUpdates) {
  const svg = this.shadowRoot.querySelector('svg');
  if (!svg) return;
  
  Object.entries(textUpdates).forEach(([textId, newContent]) => {
    const textEl = svg.querySelector(`#${textId}`);
    if (textEl) {
      textEl.textContent = newContent;
    }
  });
  
  lcardsLog.debug(`[LCARdSSimpleCard] Updated text nodes only (no re-render)`);
}

/**
 * Update only colors without rebuilding SVG structure
 */
_updateColorsOnly(colorUpdates) {
  const svg = this.shadowRoot.querySelector('svg');
  if (!svg) return;
  
  // Update background rect fill
  const bgRect = svg.querySelector('.button-bg');
  if (bgRect && colorUpdates.background) {
    bgRect.setAttribute('fill', colorUpdates.background);
  }
  
  // Update text colors
  const textElements = svg.querySelectorAll('.button-text');
  textElements.forEach(el => {
    if (colorUpdates.text) {
      el.setAttribute('fill', colorUpdates.text);
    }
  });
  
  lcardsLog.debug(`[LCARdSSimpleCard] Updated colors only (no re-render)`);
}
```

**Performance Goal**: 
- Text-only updates: < 2ms (no Lit render cycle)
- Color-only updates: < 2ms (no Lit render cycle)
- Full re-render: < 16ms (only when necessary)

---

## Revised Roadmap (Post-Foundation Fixes)

### **PHASE 1: Validation & Config System Integration** ✅
**Priority: CRITICAL** - Must complete before any visual work

#### 1.1 Schema Definition for Simple Button Cards
**Goal**: Define validation schemas compatible with MSD's ValidationService

**Implementation**:
```javascript
// Create: src/cards/schemas/simple-button-schema.js
export const SimpleButtonSchema = {
  type: 'simple-button',
  version: '1.0.0',
  
  properties: {
    // Required
    type: { type: 'string', required: true, enum: ['custom:lcards-simple-button'] },
    
    // Core
    entity: { type: 'string', pattern: '^[a-z_]+\\.[a-z0-9_]+$' },
    preset: { type: 'string', enum: ['lozenge', 'bullet', 'capped', 'picard', 'picard-filled'] },
    
    // Text configuration
    label: { type: 'string', allowTemplates: true },
    texts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', required: true },
          text: { type: 'string', allowTemplates: true },
          position: { type: 'string', enum: ['top-left', 'center-center', /* ... */] },
          fontSize: { type: 'number', min: 8, max: 72 },
          color: { type: 'string', allowTokens: true }
        }
      }
    },
    
    // Icon configuration
    icon: {
      type: 'object',
      properties: {
        name: { type: 'string' }, // e.g., 'mdi:lightbulb' or 'builtin:starfleet_delta'
        position: { type: 'string', enum: ['left', 'right', 'top', 'bottom', 'center'] },
        size: { type: 'number', min: 12, max: 64 },
        color: { type: 'string', allowTokens: true }
      }
    },
    
    // Style overrides
    style: {
      type: 'object',
      properties: {
        cornerRadius: { type: 'number', min: 0, max: 100 },
        background: { type: 'string', allowTokens: true },
        textColor: { type: 'string', allowTokens: true }
        // ... all other style properties
      }
    },
    
    // Actions
    tap_action: { type: 'object' },
    hold_action: { type: 'object' },
    double_tap_action: { type: 'object' },
    
    // Animations
    animations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          trigger: { type: 'string', enum: ['on_tap', 'on_hold', 'on_hover', 'on_leave'] },
          preset: { type: 'string' },
          params: { type: 'object' }
        }
      }
    }
  }
};
```

**Register with ValidationService**:
```javascript
// In LCARdSCore initialization
validationService.registerSchema('simple-button', SimpleButtonSchema);
```

---

#### 1.2 Config Merger Integration
**Goal**: Use MSD's deep merge logic for preset + user config

**Implementation**:
```javascript
// In LCARdSSimpleCard
_mergeConfigWithPreset(userConfig, presetConfig) {
  // Use MSD's merger from validateMerged.js
  const merger = window.lcards?.utils?.configMerger;
  
  if (!merger) {
    lcardsLog.warn('[LCARdSSimpleCard] Config merger not available, using shallow merge');
    return { ...presetConfig, ...userConfig };
  }
  
  // Deep merge with proper precedence:
  // 1. Defaults (from preset 'base')
  // 2. Preset styles (from named preset like 'lozenge')
  // 3. User config (highest priority)
  const defaults = this._getDefaultConfig();
  const merged = merger.merge([defaults, presetConfig, userConfig], {
    arrayStrategy: 'replace', // User arrays replace preset arrays
    tokenResolution: false,    // Don't resolve tokens yet (done in render)
    validateSchema: true
  });
  
  return merged;
}
```

---

### **PHASE 2: Icon Support with Library System** 🎨
**Priority: HIGH** - Visual feature, but foundational for all button types

#### 2.1 Icon Library Infrastructure
**Goal**: Support MDI, Simple Icons, and builtin SVG icons

**Icon Resolution Strategy**:
```javascript
// Icon format examples:
// - 'mdi:lightbulb' → Load from MDI via <ha-icon>
// - 'si:github' → Load from Simple Icons
// - 'builtin:starfleet_delta' → Load from builtin pack SVG library
// - 'entity' (default) → Use entity's icon attribute

/**
 * Resolve icon source and format
 */
_resolveIcon(iconConfig, entity) {
  if (!iconConfig || iconConfig === 'none') {
    return null;
  }
  
  // Default: use entity icon
  if (iconConfig === 'entity' || !iconConfig.name) {
    return {
      type: 'mdi',
      name: entity?.attributes?.icon || 'mdi:help-circle'
    };
  }
  
  // Parse icon string
  const parts = iconConfig.name.split(':');
  
  if (parts.length === 2) {
    const [prefix, name] = parts;
    
    switch (prefix) {
      case 'mdi':
        return { type: 'mdi', name: iconConfig.name };
      
      case 'si':
        return { type: 'simple-icons', name };
      
      case 'builtin':
        // Load from builtin pack's icon library
        return { type: 'builtin-svg', name, svg: this._getBuiltinIcon(name) };
      
      default:
        lcardsLog.warn(`Unknown icon prefix: ${prefix}`);
        return null;
    }
  }
  
  // No prefix - assume MDI
  return { type: 'mdi', name: `mdi:${iconConfig.name}` };
}

/**
 * Get builtin icon SVG from pack
 */
_getBuiltinIcon(name) {
  const iconLibrary = window.lcards?.packs?.getResource('icons', name);
  return iconLibrary || null;
}
```

**Rendering Icons in SVG**:
```javascript
// In SimpleButtonRenderer
_generateIconMarkup(iconConfig, iconData, position, size) {
  const { x, y } = this._calculateIconPosition(position, size);
  
  if (iconData.type === 'mdi' || iconData.type === 'simple-icons') {
    // Use <foreignObject> to embed <ha-icon>
    return `
      <foreignObject x="${x}" y="${y}" width="${size}" height="${size}">
        <ha-icon icon="${iconData.name}" style="
          width: ${size}px;
          height: ${size}px;
          color: ${iconConfig.color};
        "></ha-icon>
      </foreignObject>
    `;
  }
  
  if (iconData.type === 'builtin-svg') {
    // Embed SVG directly with scaling
    const scaled = this._scaleBuiltinSVG(iconData.svg, size);
    return `
      <g transform="translate(${x}, ${y})">
        ${scaled}
      </g>
    `;
  }
  
  return '';
}
```

---

#### 2.2 Builtin Icon Pack Creation
**Goal**: Ship common LCARS icons with the system

**Pack Structure**:
```javascript
// Add to loadBuiltinPacks.js
const LCARS_ICONS_PACK = {
  id: 'lcars_icons',
  version: '1.0.0',
  
  icons: {
    // Starfleet/Federation symbols
    'starfleet_delta': '<svg>...</svg>',
    'federation_logo': '<svg>...</svg>',
    'romulan_emblem': '<svg>...</svg>',
    
    // LCARS-specific UI icons
    'lcars_arrow_left': '<svg>...</svg>',
    'lcars_arrow_right': '<svg>...</svg>',
    'lcars_alert': '<svg>...</svg>',
    'lcars_status_ok': '<svg>...</svg>',
    'lcars_status_warning': '<svg>...</svg>',
    'lcars_status_critical': '<svg>...</svg>',
    
    // Ship/system icons
    'warp_core': '<svg>...</svg>',
    'phaser_bank': '<svg>...</svg>',
    'shield_grid': '<svg>...</svg>',
    'transporter': '<svg>...</svg>'
  }
};
```

---

### **PHASE 3: Multi-Text Field System with Overflow Handling** 📝
**Priority: HIGH** - Core feature for complex buttons

#### 3.1 Text Array Configuration
**Goal**: Support multiple text fields with independent styling and positioning

**Configuration Schema**:
```yaml
texts:
  - id: main-label
    text: '{{entity.attributes.friendly_name}}'
    position: center-top
    fontSize: 22
    fontWeight: bold
    color: 'theme:components.button.base.text.onColor'
    overflow: ellipsis  # NEW: overflow handling strategy
    
  - id: status
    text: '[[[return entity.state.toUpperCase()]]]'
    position: right-bottom
    fontSize: 14
    fontWeight: normal
    color: 'colors.status.info'
    overflow: auto-scroll  # NEW: marquee scroll for long text
    
  - id: badge
    text: '{{entity.attributes.count}}'
    position: top-right
    fontSize: 10
    fontWeight: bold
    color: 'colors.alert.critical'
    overflow: shrink-to-fit  # NEW: reduce font size to fit
```

**Overflow Strategies**:
1. **ellipsis** (default): Truncate with `...`
2. **auto-scroll**: Marquee animation for overflow (Anime.js)
3. **shrink-to-fit**: Dynamically reduce font size
4. **wrap**: Multi-line text (complex, requires height calculation)

**Implementation**:
```javascript
// In SimpleButtonRenderer
_handleTextOverflow(textConfig, textElement, availableWidth) {
  const textWidth = textElement.getComputedTextLength();
  
  if (textWidth <= availableWidth) {
    return; // No overflow
  }
  
  switch (textConfig.overflow || 'ellipsis') {
    case 'ellipsis':
      this._applyEllipsis(textElement, availableWidth);
      break;
    
    case 'auto-scroll':
      this._applyAutoScroll(textElement, textWidth, availableWidth);
      break;
    
    case 'shrink-to-fit':
      this._applyShrinkToFit(textElement, textWidth, availableWidth);
      break;
    
    case 'wrap':
      this._applyWrap(textElement, availableWidth);
      break;
  }
}

/**
 * Apply marquee scroll animation (Anime.js v4)
 */
_applyAutoScroll(textElement, textWidth, availableWidth) {
  const scrollDistance = textWidth - availableWidth;
  const duration = scrollDistance * 50; // 50ms per pixel
  
  // Create animation via AnimationManager
  if (window.cblcars?.anim) {
    window.cblcars.anim(textElement, {
      translateX: [0, -scrollDistance],
      duration: duration,
      easing: 'linear',
      loop: true,
      alternate: true,
      delay: 1000 // Pause before scrolling
    });
  }
}
```

---

#### 3.2 Text Layout Presets
**Goal**: Common text arrangements as reusable presets

**Preset Examples**:
```javascript
// In loadBuiltinPacks.js → LCARDS_BUTTONS_PACK
textLayoutPresets: {
  'label-only': {
    texts: [
      { id: 'label', position: 'center-center', fontSize: 22, fontWeight: 'bold' }
    ]
  },
  
  'label-state': {
    texts: [
      { id: 'label', position: 'left-center', fontSize: 22, fontWeight: 'bold' },
      { id: 'state', position: 'right-center', fontSize: 14, fontWeight: 'normal' }
    ]
  },
  
  'title-subtitle-badge': {
    texts: [
      { id: 'title', position: 'center-top', fontSize: 18, fontWeight: 'bold' },
      { id: 'subtitle', position: 'center-center', fontSize: 12 },
      { id: 'badge', position: 'top-right', fontSize: 10, fontWeight: 'bold', 
        color: 'colors.status.danger' }
    ]
  },
  
  'corner-labels': {
    texts: [
      { id: 'top-left', position: 'top-left', fontSize: 14 },
      { id: 'top-right', position: 'top-right', fontSize: 14 },
      { id: 'bottom-left', position: 'bottom-left', fontSize: 14 },
      { id: 'bottom-right', position: 'bottom-right', fontSize: 14 }
    ]
  }
}
```

**Usage**:
```yaml
type: custom:lcards-simple-button
preset: picard
text_layout: label-state  # Apply preset
texts:
  - id: label
    text: '{{entity.attributes.friendly_name}}'  # Override label text
  - id: state
    text: '[[[return entity.state]]]'  # Override state text
```

---

### **PHASE 4: Animation System (Opt-In with Flag)** ✨
**Priority: MEDIUM** - Polish feature

#### 4.1 Animation Configuration with Enable Flag
**Goal**: Animations are opt-in, not automatic

**Configuration**:
```yaml
animations:
  enabled: true  # REQUIRED: must explicitly enable animations
  
  configs:
    - trigger: on_hover
      preset: pulse-soft
      params:
        scale: [1, 1.05, 1]
        duration: 600
    
    - trigger: on_tap
      preset: ripple
      params:
        origin: center
        duration: 400
```

**Implementation in LCARdSSimpleCard**:
```javascript
_registerAnimations() {
  // Only register if animations.enabled === true
  if (!this.config.animations || !this.config.animations.enabled) {
    lcardsLog.debug(`[LCARdSSimpleCard] Animations disabled for ${this._cardGuid}`);
    return;
  }
  
  const animConfigs = this.config.animations.configs || [];
  
  if (animConfigs.length === 0) {
    lcardsLog.warn(`[LCARdSSimpleCard] Animations enabled but no configs provided`);
    return;
  }
  
  // Register with AnimationManager (existing logic)
  super._registerAnimations();
}
```

---

### **PHASE 5: Label/Text Card & Cascade Animation** 📄
**Priority: MEDIUM** - Next card type after buttons are solid

#### 5.1 Label/Text Card Architecture
**Goal**: Dedicated card for text-heavy displays (no button interaction)

**New Card**: `lcards-simple-label`
```javascript
export class LCARdSSimpleLabelCard extends LCARdSSimpleCard {
  // Extends SimpleCard but disables action handling
  
  _setupButtonActions() {
    // Override: no actions for labels
    lcardsLog.debug('[LCARdSSimpleLabelCard] Skipping action setup (labels are non-interactive)');
  }
  
  _renderCard() {
    // Use SimpleTextRenderer instead of SimpleButtonRenderer
    return this._renderLabelContent();
  }
}
```

**Text Rendering Options**:
1. **Single Field**: Large text with word wrap
2. **Grid Layout**: Multiple text blocks in grid (user-defined rows/columns)
3. **Cascade Animation**: Sequential reveal of text lines (LCARS classic effect)

---

#### 5.2 LCARS Cascade Animation
**Goal**: Replicate legacy cascade effect using Anime.js v4

**Reference Legacy Implementation**: Review `lcards-label.yaml` cascade variables

**New Implementation** (Anime.js v4):
```javascript
// In SimpleTextRenderer or AnimationManager
applyCascadeAnimation(textElements, config) {
  const {
    direction = 'top-to-bottom', // or 'left-to-right', 'bottom-to-top', 'right-to-left'
    stagger = 100,  // ms delay between elements
    duration = 800, // per-element animation duration
    easing = 'easeOutExpo'
  } = config;
  
  // Initial state: hidden
  textElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = this._getCascadeTransform(direction, 'start');
  });
  
  // Animate in sequence (Anime.js v4 stagger)
  if (window.cblcars?.anim) {
    window.cblcars.anim(textElements, {
      opacity: [0, 1],
      translateY: direction === 'top-to-bottom' ? [-20, 0] : 
                  direction === 'bottom-to-top' ? [20, 0] : 0,
      translateX: direction === 'left-to-right' ? [-20, 0] :
                  direction === 'right-to-left' ? [20, 0] : 0,
      duration: duration,
      easing: easing,
      delay: window.cblcars.animStagger(stagger) // Anime.js v4 stagger
    });
  }
}

_getCascadeTransform(direction, phase) {
  const offsets = {
    'top-to-bottom': { start: 'translateY(-20px)', end: 'translateY(0)' },
    'bottom-to-top': { start: 'translateY(20px)', end: 'translateY(0)' },
    'left-to-right': { start: 'translateX(-20px)', end: 'translateX(0)' },
    'right-to-left': { start: 'translateX(20px)', end: 'translateX(0)' }
  };
  
  return offsets[direction]?.[phase] || 'none';
}
```

**Configuration**:
```yaml
type: custom:lcards-simple-label
texts:
  - id: line1
    text: 'LCARS SYSTEM STATUS'
  - id: line2
    text: 'ALL SYSTEMS NOMINAL'
  - id: line3
    text: 'READY FOR OPERATIONS'

animations:
  enabled: true
  configs:
    - trigger: on_mount  # NEW: trigger on card mount
      preset: cascade
      params:
        direction: top-to-bottom
        stagger: 150
        duration: 800
```

---

### **PHASE 6: Slider/Multimeter Card** 🎚️
**Priority: LOW** - Advanced card type, deferred until buttons/labels are complete

(Details to be defined in future roadmap session)

---

## Consolidated Priority Order

### **Sprint 0: Foundation (Week 1 - BLOCKING)**
1. ✅ **Config Validation Integration** (Phase 1.1)
2. ✅ **Config Merger Integration** (Phase 1.2)
3. ✅ **Selective Re-Rendering** (Priority 0.2)

**Outcome**: SimpleCards use MSD-grade validation and don't flash on updates

---

### **Sprint 1: Icons & Presets (Week 2-3)**
4. ✅ **Icon Library Infrastructure** (Phase 2.1)
5. ✅ **Builtin Icon Pack** (Phase 2.2)
6. ✅ **Complete Button Presets** (Phase 1 from original roadmap)

**Outcome**: All legacy button types replicated with icon support

---

### **Sprint 2: Advanced Text (Week 4-5)**
7. ✅ **Multi-Text Array System** (Phase 3.1)
8. ✅ **Text Overflow Handling** (Phase 3.1)
9. ✅ **Text Layout Presets** (Phase 3.2)

**Outcome**: Complex button layouts with multiple labels/values

---

### **Sprint 3: Animations (Week 6)**
10. ✅ **Opt-In Animation System** (Phase 4.1)
11. ✅ **Animation Presets for Buttons** (Phase 4.1)

**Outcome**: Polished hover/tap animations, configurable

---

### **Sprint 4: Label Card (Week 7-8)**
12. ✅ **Label Card Base** (Phase 5.1)
13. ✅ **Cascade Animation** (Phase 5.2)
14. ✅ **Text Grid Layouts** (Phase 5.1)

**Outcome**: Full-featured label/text card with LCARS cascade

---

### **Sprint 5: Future Cards (Week 9+)**
15. 🔮 **Slider/Multimeter Card** (Phase 6)
16. 🔮 **Advanced Features** (TBD)

---

## Testing Strategy (Per Sprint)

Each sprint should include:

1. **Unit Tests**: Config validation, merging, template processing
2. **Integration Tests**: Full card rendering with various configs
3. **Performance Tests**: Verify selective re-rendering works (< 2ms for text/color updates)
4. **Visual Regression Tests**: Screenshot comparison for preset variations

---

## Next Steps

1. **Immediate Action**: Review `src/msd/validation/validateMerged.js` to understand config merging patterns
2. **Schema Definition**: Create `simple-button-schema.js` with full property definitions
3. **Selective Rendering**: Implement `_detectChanges()` and `_updateTextNodesOnly()` methods
4. **Test File Creation**: Set up `test-simple-button-validation.html` for validation testing

**Question for You**: Should we tackle Sprint 0 (Foundation) immediately, or do you want to see a working icon implementation first to validate the approach? I recommend Sprint 0 first since it unblocks everything else and ensures quality from the start.
