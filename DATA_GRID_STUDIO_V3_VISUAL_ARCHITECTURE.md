# Data Grid Studio V3 - Visual Architecture

## Preview Update Flow (CRITICAL FIX)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  User changes config (e.g., font size 18 → 24)                          │
│  via ha-textfield @input event                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  _updateConfig('style.font_size', 24)                                    │
│                                                                           │
│  1. Deep clone: JSON.parse(JSON.stringify(this._workingConfig))         │
│  2. Navigate path: style → font_size                                     │
│  3. Set value: target['font_size'] = 24                                  │
│  4. Atomic assignment: this._workingConfig = newConfig  ← TRIGGERS LIT   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Lit detects new object reference                                        │
│  (Object identity changed: oldConfig !== newConfig)                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  updated(changedProperties) lifecycle hook fires                         │
│                                                                           │
│  if (changedProperties.has('_workingConfig')) {                          │
│    this._updatePreviewCard();  ← MANUAL CARD UPDATE                      │
│  }                                                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  _updatePreviewCard()                                                     │
│                                                                           │
│  1. Remove old card:                                                     │
│     while (this._previewRef.value.firstChild) {                          │
│       this._previewRef.value.firstChild.remove();                        │
│     }                                                                     │
│                                                                           │
│  2. Create fresh card instance:                                          │
│     const card = document.createElement('lcards-data-grid');             │
│     card.hass = this.hass;                                               │
│                                                                           │
│  3. Deep clone config (prevent mutations):                               │
│     const clonedConfig = JSON.parse(JSON.stringify(config));             │
│     card.setConfig(clonedConfig);                                        │
│                                                                           │
│  4. Insert into container:                                               │
│     this._previewRef.value.appendChild(card);                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PREVIEW UPDATED WITH FONT SIZE 24                                       │
│  ✅ 100% RELIABLE                                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

## Tab Navigation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MAIN TAB STRUCTURE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────┬─────────────┬───────────┬──────────┐                       │
│  │  Data   │ Appearance  │ Animation │ Advanced │  ← Main Tabs          │
│  └─────────┴─────────────┴───────────┴──────────┘                       │
│      │                                                                    │
│      ├─ Mode & Source      ← Sub-tabs (Data)                            │
│      ├─ Grid Layout                                                      │
│      └─ Data Configuration                                               │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

USER CLICKS "Appearance" TAB
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  <ha-tab-group @wa-tab-show=${this._handleMainTabChange}>               │
│    <ha-tab-group-tab value="appearance" ?active=${...}>                 │
│  </ha-tab-group>                                                         │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼  wa-tab-show event fires
          │
┌─────────────────────────────────────────────────────────────────────────┐
│  _handleMainTabChange(event) {                                           │
│    event.stopPropagation();  ← CRITICAL: Stop bubbling                  │
│                                                                           │
│    const tab = event.target.activeTab?.getAttribute('value');           │
│    // tab = 'appearance'                                                 │
│                                                                           │
│    if (tab && tab !== this._activeTab) {                                │
│      this._activeTab = tab;  ← Triggers re-render                       │
│    }                                                                     │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼  Lit re-renders
          │
┌─────────────────────────────────────────────────────────────────────────┐
│  render() {                                                              │
│    switch (this._activeTab) {                                            │
│      case 'appearance':                                                  │
│        return this._renderAppearanceTab();  ← Shows Appearance content  │
│    }                                                                     │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  APPEARANCE TAB WITH SUB-TABS DISPLAYED                                  │
│  ┌────────────┬────────┬──────────┬──────────────┐                      │
│  │ Typography │ Colors │ Borders  │ Header Style │                      │
│  └────────────┴────────┴──────────┴──────────────┘                      │
└─────────────────────────────────────────────────────────────────────────┘

USER CLICKS "Colors" SUB-TAB
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  <ha-tab-group @wa-tab-show=${this._handleAppearanceSubTabChange}>      │
│    <ha-tab-group-tab value="colors" ?active=${...}>                     │
│  </ha-tab-group>                                                         │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼  wa-tab-show event fires
          │
┌─────────────────────────────────────────────────────────────────────────┐
│  _handleAppearanceSubTabChange(event) {                                  │
│    event.stopPropagation();  ← CRITICAL: Prevent triggering main tab    │
│                                                                           │
│    const tab = event.target.activeTab?.getAttribute('value');           │
│    // tab = 'colors'                                                     │
│                                                                           │
│    if (tab && tab !== this._appearanceSubTab) {                         │
│      this._appearanceSubTab = tab;  ← Triggers re-render                │
│    }                                                                     │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼  WITHOUT stopPropagation() this would happen:
          │
┌─────────────────────────────────────────────────────────────────────────┐
│  ❌ WRONG: Event bubbles to parent                                       │
│  ❌ _handleMainTabChange() fires                                         │
│  ❌ Main tab switches unexpectedly                                       │
│  ❌ User confusion and broken UX                                         │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼  WITH stopPropagation():
          │
┌─────────────────────────────────────────────────────────────────────────┐
│  ✅ Event stopped at sub-tab handler                                     │
│  ✅ Only _appearanceSubTab changes                                       │
│  ✅ Main tab stays on "Appearance"                                       │
│  ✅ Sub-tab switches to "Colors"                                         │
│  ✅ Correct behavior                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

## Config Update Reactivity Chain

```
┌─────────────────────────────────────────────────────────────────────────┐
│  BEFORE: Broken Pattern (Old Studio)                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  _updateNestedConfig('style.font_size', 24) {                           │
│    const keys = path.split('.');                                         │
│    let obj = this._workingConfig;  ← MUTATES existing object            │
│    for (let i = 0; i < keys.length - 1; i++) {                          │
│      obj = obj[keys[i]];                                                 │
│    }                                                                     │
│    obj[keys[keys.length - 1]] = value;  ← Direct mutation               │
│    this._triggerPreviewUpdate();  ← Manual trigger hack                 │
│    this.requestUpdate();                                                 │
│  }                                                                       │
│                                                                           │
│  Problem:                                                                │
│  • Object reference unchanged: oldConfig === newConfig                   │
│  • Lit can't detect deep mutations reliably                              │
│  • Manual triggers unreliable                                            │
│  • Preview updates fail 🔴                                               │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  AFTER: Fixed Pattern (V3 Studio)                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  _updateConfig('style.font_size', 24) {                                 │
│    // 1. Deep clone entire config                                       │
│    const newConfig = JSON.parse(                                         │
│      JSON.stringify(this._workingConfig)                                │
│    );  ← NEW OBJECT                                                      │
│                                                                           │
│    // 2. Navigate and set value                                          │
│    const keys = path.split('.');                                         │
│    const lastKey = keys.pop();                                           │
│    let target = newConfig;                                               │
│    for (const key of keys) {                                             │
│      if (!target[key]) target[key] = {};                                │
│      target = target[key];                                               │
│    }                                                                     │
│    target[lastKey] = value;                                              │
│                                                                           │
│    // 3. Atomic assignment                                               │
│    this._workingConfig = newConfig;  ← NEW REFERENCE                    │
│  }                                                                       │
│                                                                           │
│  Result:                                                                 │
│  • Object reference changed: oldConfig !== newConfig                     │
│  • Lit detects change automatically                                      │
│  • updated() lifecycle fires                                             │
│  • Preview updates reliably ✅                                           │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
┌───────────────────────────────────────────────────────────────────────────┐
│  lcards-data-grid-studio-dialog-v3                                        │
│  (LitElement)                                                              │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  ha-dialog                                                           │  │
│  │  ┌───────────────────────────────────────────────────────────────┐  │  │
│  │  │  Main Tab Group (ha-tab-group)                                 │  │  │
│  │  │  • Data                                                         │  │  │
│  │  │  • Appearance                                                   │  │  │
│  │  │  • Animation                                                    │  │  │
│  │  │  • Advanced                                                     │  │  │
│  │  └───────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌───────────────────────────────────────────────────────────────┐  │  │
│  │  │  Studio Layout (CSS Grid 60/40)                                │  │  │
│  │  │  ┌──────────────────────┬──────────────────────┐               │  │  │
│  │  │  │  Config Panel        │  Preview Panel       │               │  │  │
│  │  │  │  (60%)               │  (40%)               │               │  │  │
│  │  │  │                      │                      │               │  │  │
│  │  │  │  ┌────────────────┐  │  ┌────────────────┐  │               │  │  │
│  │  │  │  │ Active Tab     │  │  │ Preview        │  │               │  │  │
│  │  │  │  │ Content        │  │  │ Container      │  │               │  │  │
│  │  │  │  │                │  │  │ (ref)          │  │               │  │  │
│  │  │  │  │ • Sub-tabs     │  │  │                │  │               │  │  │
│  │  │  │  │ • Form fields  │  │  │ [Card inserted │  │               │  │  │
│  │  │  │  │ • Sections     │  │  │  manually]     │  │               │  │  │
│  │  │  │  │                │  │  │                │  │               │  │  │
│  │  │  │  │                │  │  │ lcards-data-   │  │               │  │  │
│  │  │  │  │                │  │  │ grid instance  │  │               │  │  │
│  │  │  │  └────────────────┘  │  └────────────────┘  │               │  │  │
│  │  │  │                      │                      │               │  │  │
│  │  │  │  overflow-y: auto    │  position: sticky   │               │  │  │
│  │  │  └──────────────────────┴──────────────────────┘               │  │  │
│  │  └───────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌───────────────────────────────────────────────────────────────┐  │  │
│  │  │  Dialog Actions                                                │  │  │
│  │  │  • Save Configuration (primaryAction)                          │  │  │
│  │  │  • Cancel (secondaryAction)                                    │  │  │
│  │  └───────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└───────────────────────────────────────────────────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Reactive State Properties (state: true)                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  _workingConfig: { type: Object, state: true }                          │
│    ↓ Changes trigger updated() lifecycle                                │
│    ↓ Automatically updates preview card                                 │
│                                                                           │
│  _activeTab: { type: String, state: true }                              │
│    ↓ Controls which main tab content renders                            │
│    ↓ Values: 'data' | 'appearance' | 'animation' | 'advanced'           │
│                                                                           │
│  _dataSubTab: { type: String, state: true }                             │
│    ↓ Controls Data tab sub-tab content                                  │
│    ↓ Values: 'mode' | 'grid' | 'config'                                 │
│                                                                           │
│  _appearanceSubTab: { type: String, state: true }                       │
│    ↓ Controls Appearance tab sub-tab content                            │
│    ↓ Values: 'typography' | 'colors' | 'borders' | 'header'             │
│                                                                           │
│  _animationSubTab: { type: String, state: true }                        │
│    ↓ Controls Animation tab sub-tab content                             │
│    ↓ Values: 'cascade' | 'changes'                                      │
│                                                                           │
│  _advancedSubTab: { type: String, state: true }                         │
│    ↓ Controls Advanced tab sub-tab content                              │
│    ↓ Values: 'performance' | 'metadata' | 'expert'                      │
│                                                                           │
│  _validationErrors: { type: Array, state: true }                        │
│    ↓ Stores validation error messages                                   │
│    ↓ Displayed above config panel when non-empty                        │
│                                                                           │
│  _expertGridMode: { type: Boolean, state: true }                        │
│    ↓ Toggles expert CSS Grid properties visibility                      │
│    ↓ Shows/hides 10 advanced grid properties                            │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  Non-Reactive Properties                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  hass: { type: Object }                                                  │
│    ↓ Home Assistant instance (passed from editor)                       │
│                                                                           │
│  config: { type: Object }                                                │
│    ↓ Initial config (deep cloned to _workingConfig)                     │
│                                                                           │
│  _previewRef: createRef()                                                │
│    ↓ Reference to preview container DOM element                         │
│    ↓ Used for manual card insertion                                     │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## File Size Comparison

```
┌──────────────────────────────────────────────────────────────────────┐
│  File                                    Lines    Size    Status      │
├──────────────────────────────────────────────────────────────────────┤
│  lcards-data-grid-studio-dialog.js       858     ~35KB   Broken 🔴   │
│  (Original, Lit child rendering)                                     │
│                                                                       │
│  lcards-data-grid-studio-dialog-v3.js   1,335    ~55KB   Fixed ✅    │
│  (V3, Manual card instantiation)                                     │
│                                                                       │
│  Increase: +477 lines (+56%)                                         │
│  Reason: 100% schema coverage + proper patterns                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

```
┌───────────────────────────────────────────────────────────────────────┐
│  Decision                    Rationale                     Benefit    │
├───────────────────────────────────────────────────────────────────────┤
│  Manual card instantiation   Lit can't detect deep       100%        │
│  via createRef()              mutations reliably          reliable    │
│                                                           updates     │
├───────────────────────────────────────────────────────────────────────┤
│  event.stopPropagation()      Nested tabs would trigger  Correct     │
│  in all tab handlers          parent handlers            navigation  │
├───────────────────────────────────────────────────────────────────────┤
│  Single _updateConfig()       Multiple paths cause       Consistency │
│  method                       inconsistency                          │
├───────────────────────────────────────────────────────────────────────┤
│  Deep clone on every          Creates new object         Triggers    │
│  config change                reference                  Lit         │
│                                                           reactivity  │
├───────────────────────────────────────────────────────────────────────┤
│  Direct ha-textfield/         FormField adds complexity  Simplicity  │
│  ha-select usage              for this use case                      │
├───────────────────────────────────────────────────────────────────────┤
│  lcards-color-section         Consistent color editing   UX          │
│  for all colors               across LCARdS              consistency │
├───────────────────────────────────────────────────────────────────────┤
│  60/40 grid layout            Config needs space,        Balance     │
│                               preview needs visibility                │
└───────────────────────────────────────────────────────────────────────┘
```
