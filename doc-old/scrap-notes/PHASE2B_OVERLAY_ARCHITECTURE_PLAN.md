# LCARdS Phase 2B: Overlay Card Architecture Plan

**Date:** November 7, 2025
**Objective:** Extract MSD overlays to work as both MSD components AND standalone cards

## 🎯 **Problem Statement**

Currently, overlay types (TextOverlay, ButtonOverlay, etc.) are **captive** within the MSD system. Users cannot use them as standalone cards, and we need this functionality to:

1. **Replace legacy custom-button-cards** with native LCARdS overlay implementations
2. **Allow overlays to work standalone** without requiring full MSD setup
3. **Maintain code reuse** - same overlay classes work in both MSD and standalone contexts
4. **Enable future overlay types** (sliders, etc.) to work in both modes

## 🏗️ **Architecture Solution**

### **Current State:**
```
MSD Card → AdvancedRenderer → TextOverlay/ButtonOverlay → Core Renderers
           (MSD-only)        (Captive in MSD)
```

### **Target State:**
```
┌─────────────────┐    ┌─────────────────────┐
│   MSD Card      │    │ LCARdS Text Card    │  ← NEW
│                 │    │ LCARdS Button Card  │  ← NEW
└─────────────────┘    └─────────────────────┘
         │                       │
         └───────┬───────────────┘
                 │ BOTH USE SAME:
                 ▼
    ┌─────────────────────────┐
    │   Shared Overlays       │
    │ - TextOverlay.js        │  ← SINGLE COPY
    │ - ButtonOverlay.js      │  ← SINGLE COPY
    │ - StatusGridOverlay.js  │  ← SINGLE COPY
    └─────────────────────────┘
                 │
                 ▼
    ┌─────────────────────────┐
    │   Core Renderers        │
    │ - TextRenderer.js       │  ← SINGLE COPY
    │ - ButtonRenderer.js     │  ← SINGLE COPY
    └─────────────────────────┘
```

## 📋 **Implementation Plan**

### **Phase 1: Base Infrastructure**
1. **Create `LCARdSOverlayCard`** - base class extending `LCARdSNativeCard`
2. **Add context detection** - overlays detect MSD vs standalone mode
3. **Create overlay registry** - maps overlay types to classes

### **Phase 2: Specific Card Types**
1. **Create `LCARdSTextCard`** extending `LCARdSOverlayCard`
2. **Create `LCARdSButtonCard`** extending `LCARdSOverlayCard`
3. **Add validation schemas** for each card type
4. **Register with Home Assistant** as separate card types

### **Phase 3: Context-Aware Overlays**
1. **Modify existing overlays** to work in both contexts:
   - **MSD Mode**: Full MSD pipeline (attachment points, line routing, systemsManager)
   - **Standalone Mode**: Basic mode (core systems only, no MSD features)
2. **No code duplication** - same overlay classes, different context

### **Phase 4: Testing & Migration**
1. **Test dual-context functionality**
2. **Create migration guide** for legacy custom-button-cards
3. **Add documentation** and examples

## 🔧 **Technical Details**

### **Card Type Architecture:**

```javascript
// Base class
class LCARdSOverlayCard extends LCARdSNativeCard {
  static get properties() {
    return {
      ...super.properties,
      overlay_type: { type: String },
      _overlayInstance: { type: Object, state: true }
    };
  }

  async createOverlay() {
    // Factory method to create overlay based on type
  }

  // Access to core systems
  get coreRules() { return window.lcards.core.rules; }
  get coreThemes() { return window.lcards.core.theme; }
  get coreAnimation() { return window.lcards.core.animation; }
}

// Specific implementations
class LCARdSTextCard extends LCARdSOverlayCard {
  static overlayType = 'text';
  static validationSchema = TEXT_OVERLAY_SCHEMA;
}

class LCARdSButtonCard extends LCARdSOverlayCard {
  static overlayType = 'button';
  static validationSchema = BUTTON_OVERLAY_SCHEMA;
}
```

### **User Configuration Examples:**

```yaml
# Standalone Text Card
- type: lcards-text-card
  text: "Hello World"
  position: [10, 20]
  style:
    color: red
    font_size: 18px
  tap_action:
    action: more-info

# Standalone Button Card
- type: lcards-button-card
  label: "Click Me"
  entity: light.living_room
  tap_action:
    action: toggle

# MSD continues to work as before
- type: lcards-msd-card
  msd:
    overlays:
      - type: text
        text: "Same TextOverlay class!"
      - type: button
        label: "Same ButtonOverlay class!"
```

### **Context Detection Pattern:**

```javascript
export class TextOverlay {
  constructor(overlay, contextOrSystemsManager) {
    this.overlay = overlay;

    // Detect context
    this.isMSDMode = !!(contextOrSystemsManager?.getThemeManager);

    if (this.isMSDMode) {
      // MSD Mode: Full pipeline access
      this.systemsManager = contextOrSystemsManager;
      this.themeManager = contextOrSystemsManager.getThemeManager();
      this.rulesEngine = contextOrSystemsManager.getRulesEngine();
    } else {
      // Standalone Mode: Core systems access
      this.core = window.lcards.core;
      this.hass = contextOrSystemsManager; // Just HASS object
    }
  }

  render() {
    if (this.isMSDMode) {
      // Use MSD pipeline (attachment points, etc.)
      return this.renderMSDMode();
    } else {
      // Use core systems only (basic card boundary)
      return this.renderStandaloneMode();
    }
  }
}
```

## ✅ **Expected Benefits**

### **For Users:**
- ✅ **Standalone overlay cards** available (text, button, etc.)
- ✅ **Same functionality** as MSD overlays but in simple card form
- ✅ **Migration path** from legacy custom-button-cards
- ✅ **Consistent theming** and behavior across MSD and standalone

### **For Development:**
- ✅ **No code duplication** - same overlay classes work everywhere
- ✅ **Easy to add new overlays** - just extend the pattern
- ✅ **Maintainability** - single source of truth for overlay logic
- ✅ **Future-proof** - foundation for replacing all legacy cards

### **Core System Access:**
- ✅ **Rules Engine**: Both local and global rules work
- ✅ **Theme System**: Full theming capabilities
- ✅ **Animation System**: All animations available
- ✅ **Action Handling**: Tap/hold/double-tap actions work
- ✅ **DataSource Integration**: Entity binding and templates
- ✅ **Validation**: Schema validation for configurations

## 📁 **File Structure**

```
src/
├── cards/
│   ├── lcards-msd.js              # Existing MSD card
│   ├── overlays/                  # NEW - Base overlay card system
│   │   ├── LCARdSOverlayCard.js   # Base overlay wrapper class
│   │   ├── LCARdSTextCard.js      # Text card implementation
│   │   ├── LCARdSButtonCard.js    # Button card implementation
│   │   └── registry.js            # Overlay type registry
├── msd/
│   ├── overlays/                  # Existing overlay classes (SHARED)
│   │   ├── TextOverlay.js         # Modified for dual-context
│   │   ├── ButtonOverlay.js       # Modified for dual-context
│   │   └── ...
│   └── renderer/
│       ├── AdvancedRenderer.js    # Continues to use shared overlays
│       └── core/                  # Core renderers (SHARED)
```

## 🚀 **Implementation Steps**

### **Step 1: Base Infrastructure**
- [ ] Create `LCARdSOverlayCard` base class
- [ ] Add overlay type registry system
- [ ] Test core system access

### **Step 2: First Implementation**
- [ ] Create `LCARdSTextCard` with TextOverlay integration
- [ ] Modify `TextOverlay` for dual-context support
- [ ] Test standalone text card functionality

### **Step 3: Validation**
- [ ] Ensure MSD TextOverlay still works normally
- [ ] Test that same overlay class works in both contexts
- [ ] Verify all core systems are accessible

### **Step 4: Expansion**
- [ ] Create `LCARdSButtonCard`
- [ ] Add more overlay types as needed
- [ ] Create migration documentation

## 🎯 **Success Criteria**

1. **Same overlay classes** work in both MSD and standalone contexts
2. **No code duplication** between MSD and standalone implementations
3. **Full feature parity** - rules, themes, animations, actions all work
4. **Transparent user experience** - overlays behave identically
5. **Easy migration path** from legacy custom-button-cards
6. **Foundation for future** overlay types (sliders, charts, etc.)

---

**Next Actions:** Begin implementation starting with `LCARdSOverlayCard` base class and `LCARdSTextCard` as the first example.