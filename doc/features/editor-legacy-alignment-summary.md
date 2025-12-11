# Editor Components: Legacy Alignment Summary

## Quick Reference

### Enhanced Components

| Component | File | New Features |
|-----------|------|--------------|
| **lcards-form-section** | `src/editor/components/form/lcards-form-section.js` | Icons, header levels, secondary text, noCollapse |
| **lcards-form-field** | `src/editor/components/form/lcards-form-field.js` | Consistent padding, form-control wrapper |
| **lcards-grid-layout** | `src/editor/components/form/lcards-grid-layout.js` | Tighter spacing (8px gap) |
| **lcards-message** | `src/editor/components/common/lcards-message.js` | NEW: Info/warning/error messages |
| **lcards-divider** | `src/editor/components/common/lcards-divider.js` | NEW: Horizontal dividers |

### Global Style Updates

| File | Changes |
|------|---------|
| **editor-styles.js** | Grid-based form-row, two-controls class, legacy padding |
| **LCARdSBaseEditor.js** | Updated section styles |

---

## Before & After Comparison

### Form Section Component

#### BEFORE
```javascript
<lcards-form-section
    header="Basic Configuration"
    ?expanded=${true}>
    <!-- content -->
</lcards-form-section>
```

**Properties Available:**
- header
- description
- expanded
- outlined (default: false)
- leftChevron

#### AFTER
```javascript
<lcards-form-section
    header="Basic Configuration"
    description="Core card settings"
    icon="mdi:cog"
    secondary="[Advanced]"
    headerLevel="4"
    ?expanded=${true}
    ?outlined=${true}
    ?noCollapse=${false}>
    <!-- content -->
</lcards-form-section>
```

**New Properties:**
- ✨ `icon` - MDI icon in header
- ✨ `headerLevel` - Semantic header (h1-h6)
- ✨ `secondary` - Secondary text
- ✨ `noCollapse` - Disable collapse
- ⚡ `outlined` - Now defaults to `true`

---

### Form Field Component

#### BEFORE
```javascript
<lcards-form-field
    .editor=${this}
    path="entity"
    label="Entity">
</lcards-form-field>
```

**Rendering:**
```html
<div class="form-field">
    <label>Entity</label>
    <ha-selector ...></ha-selector>
    <div class="helper-text">...</div>
</div>
```

#### AFTER
```javascript
<lcards-form-field
    .editor=${this}
    path="entity"
    label="Entity">
</lcards-form-field>
```

**Rendering (with form-control wrapper):**
```html
<div class="form-field">
    <label style="padding: 2px 8px">Entity</label>
    <div class="form-control" style="padding: 2px 8px">
        <ha-selector ...></ha-selector>
    </div>
    <div class="helper-text" style="padding: 0 8px">...</div>
</div>
```

**Changes:**
- ✨ Consistent padding (2px 8px) on labels
- ✨ form-control wrapper div
- ✨ Helper text padding

---

### Grid Layout Component

#### BEFORE
```javascript
<lcards-grid-layout>
    <lcards-form-field ...></lcards-form-field>
    <lcards-form-field ...></lcards-form-field>
</lcards-grid-layout>
```

**Gap:** 16px (too loose)

#### AFTER
```javascript
<lcards-grid-layout>
    <lcards-form-field ...></lcards-form-field>
    <lcards-form-field ...></lcards-form-field>
</lcards-grid-layout>
```

**Gap:** 8px (matches legacy)

**Changes:**
- ⚡ Reduced default gap from 16px → 8px
- ✨ Better visual density

---

## New Components

### lcards-message

Displays informational messages, warnings, or errors.

```javascript
<lcards-message
    type="info"
    title="Configuration Note"
    message="This card requires an entity to be selected.">
</lcards-message>
```

**Properties:**
- `type`: 'info' | 'warning' | 'error' | 'success'
- `title`: Optional title
- `message`: Message content
- Supports slot for custom content

**Fallback:** Renders styled div if `ha-alert` unavailable

---

### lcards-divider

Horizontal divider for separating sections.

```javascript
<lcards-divider></lcards-divider>
```

**Styling:**
- Width: 95% (centered)
- Border: 1px solid var(--chip-background-color)
- Margins: 16px vertical

---

## Button Editor Enhancements

### Enhanced Sections

All sections now include proper icons and configuration:

| Section | Icon | Expanded by Default |
|---------|------|---------------------|
| Basic Configuration | `mdi:cog` | Yes |
| Layout | `mdi:grid` | No |
| Text Content | `mdi:format-textbox` | Yes |
| Icon | `mdi:alpha-i-circle-outline` | No |
| Tap Action | `mdi:gesture-tap` | Yes |
| Double Tap Action | `mdi:gesture-double-tap` | No |
| Hold Action | `mdi:gesture-tap-hold` | No |

### New Features

1. **Info Message** - Helpful tip at top of Configuration tab
2. **Icons Throughout** - Visual hierarchy and navigation
3. **Consistent Styling** - Matches legacy look and feel

---

## CSS Class Reference

### Legacy-Compatible Classes

```css
/* Grid-based form row */
.form-row {
    display: grid;
    grid-template-columns: 100%;
    grid-gap: 8px;
}

/* Two-column layout */
.form-row.two-controls {
    grid-template-columns: 50% 50%;
}

/* Form control wrapper */
.form-control {
    padding: 2px 8px;
    border-radius: 10px;
}

/* Labels */
.form-row label {
    padding: 2px 8px;
    font-weight: 500;
}

/* Helper text */
.helper-text {
    padding: 0 8px;
    font-size: 12px;
    color: var(--secondary-text-color);
}
```

---

## Selector Usage (HA Components)

We use **Home Assistant's native selector components** for consistency:

### Common Selectors

```javascript
// Text input
selector: { text: {} }

// Number input
selector: {
    number: {
        min: 0,
        max: 100,
        step: 1,
        mode: 'box'
    }
}

// Boolean toggle
selector: { boolean: {} }

// Entity picker
selector: { entity: {} }

// Icon picker
selector: { icon: {} }

// Color picker
selector: { color: {} }

// Select dropdown
selector: {
    select: {
        mode: 'dropdown',
        options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
        ]
    }
}

// Action selector
selector: { action: {} }
```

---

## Visual Comparison

### Legacy Formbuilder Look
```
┌─────────────────────────────────────────────┐
│  Section 31                            [▼]  │
│  ═══════════════════════════════════════    │
│                                             │
│  Label                                      │
│  ┌─────────────────────────────────────┐   │
│  │ Input Field                         │   │
│  └─────────────────────────────────────┘   │
│  Helper text here                           │
│                                             │
└─────────────────────────────────────────────┘
```

### New Editor Look (After Updates)
```
┌─────────────────────────────────────────────┐
│  ⚙️  Basic Configuration              [▼]  │
│  ═══════════════════════════════════════    │
│  Core card settings                         │
│                                             │
│  Entity                                     │
│  ┌─────────────────────────────────────┐   │
│  │ light.living_room              [▼] │   │
│  └─────────────────────────────────────┘   │
│  Select an entity to control                │
│                                             │
└─────────────────────────────────────────────┘
```

**Key Improvements:**
- ✨ Icons for visual hierarchy
- ✨ Better spacing and padding
- ✨ Consistent with legacy design
- ✨ Modern component architecture

---

## Migration Guide

### Updating Existing Sections

**Old Code:**
```javascript
<lcards-form-section header="Settings">
    <!-- content -->
</lcards-form-section>
```

**New Code:**
```javascript
<lcards-form-section
    header="Settings"
    icon="mdi:cog"
    headerLevel="4"
    ?outlined=${true}
    ?expanded=${true}>
    <!-- content -->
</lcards-form-section>
```

### Adding Messages

```javascript
<lcards-message
    type="info"
    message="Helpful information for users">
</lcards-message>
```

### Adding Dividers

```javascript
<lcards-divider></lcards-divider>
```

---

## Testing Checklist

- [ ] All sections display icons correctly
- [ ] Sections expand/collapse properly
- [ ] noCollapse sections stay open
- [ ] Two-column grid works on desktop
- [ ] Single-column on mobile (<768px)
- [ ] Form fields have proper padding
- [ ] Helper text displays correctly
- [ ] Messages render properly
- [ ] Dividers show correct styling
- [ ] YAML tab syncs with visual changes

---

## Next Steps

### Immediate
1. Test in Home Assistant environment
2. Verify all HA selector types work
3. Check responsive design on mobile

### Short-term
4. Implement `visibilityCondition` support
5. Add `disabledCondition` support
6. Create more editor examples

### Long-term
7. Full feature parity with legacy
8. Visual form builder UI
9. Migration tools for old configs

---

## Resources

- **Legacy Formbuilder:** https://github.com/snootched/ha-card-formbuilder
- **HA Selectors:** https://www.home-assistant.io/docs/blueprint/selectors/
- **MDI Icons:** https://pictogrammers.com/library/mdi/

---

**Last Updated:** 2025-12-09
**Status:** ✅ Ready for Testing
**Version:** v1.10.02
