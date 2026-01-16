# MSD Studio Card Picker Integration - Manual Testing Guide

## Overview

This guide covers testing the new HA native card picker integration in MSD Studio, including the three-tab structure (Placement, Card, Preview) and fallback implementation.

## Test Setup

1. Build the project:
   ```bash
   npm run build
   ```

2. Copy `dist/lcards.js` to Home Assistant's `www/community/lcards/` directory

3. Hard refresh browser (Ctrl+Shift+R) to load new version

4. Open Lovelace dashboard editor

5. Add or edit an LCARdS MSD card

6. Click "Open MSD Studio"

## Test Cases

### Test 1: Three-Tab Structure ✓

**Action:** Open control form (click "Add Control" or edit existing)

**Expected:**
- Dialog shows 3 tabs: "Placement", "Card", "Preview"
- Tabs are clickable and switch content correctly
- Default tab is "Placement"

**Validation:**
- [ ] Three tabs visible in control form dialog
- [ ] Tab switching works correctly
- [ ] Default tab is "Placement"

---

### Test 2: HA Native Card Picker (if available)

**Action:** Switch to "Card" tab with no card selected

**Expected:**
- Visual card picker grid appears (hui-card-picker component)
- Shows icons and names for all HA cards + custom cards
- Grid is scrollable if many cards
- No warning message about legacy picker

**Validation:**
- [ ] hui-card-picker component renders
- [ ] Card grid displays with icons
- [ ] All card types visible (HA + custom)
- [ ] No legacy warning message

**Action:** Click a card type (e.g., "Button")

**Expected:**
- Card is selected
- Shows card type badge with icon and "Change Card Type" button
- Native card editor (hui-card-element-editor) appears below
- Card-specific configuration fields visible

**Validation:**
- [ ] Card selection works
- [ ] Badge shows correct icon and name
- [ ] "Change Card Type" button present
- [ ] hui-card-element-editor renders
- [ ] Configuration fields appropriate for card type

**Action:** Configure the card using native editor

**Expected:**
- Changes are captured in real-time
- Card preview updates (if watching Preview tab)

**Validation:**
- [ ] Configuration changes save
- [ ] Preview updates automatically

**Action:** Click "Change Card Type" button

**Expected:**
- Returns to card picker
- Previous card config is cleared
- Can select different card type

**Validation:**
- [ ] Returns to picker UI
- [ ] Config is reset
- [ ] Can select new card type

---

### Test 3: Legacy Fallback (if HA components unavailable)

**Action:** Switch to "Card" tab (if hui-card-picker not available)

**Expected:**
- Warning message: "Using legacy card picker (HA components unavailable)"
- Custom grid picker with buttons appears
- All standard HA cards + custom cards listed

**Validation:**
- [ ] Warning message displayed
- [ ] Legacy card grid renders
- [ ] All card types available

**Action:** Click a card type button

**Expected:**
- Card selected
- Generic ha-selector editor appears (not native card editor)
- Basic configuration available

**Validation:**
- [ ] Card selection works in legacy mode
- [ ] ha-selector editor appears
- [ ] Can configure card

---

### Test 4: Preview Tab

**Action:** Switch to "Preview" tab with no card selected

**Expected:**
- Shows placeholder with icon and message
- Message: "Select a card type in the 'Card' tab to see live preview"

**Validation:**
- [ ] Placeholder renders correctly
- [ ] Message is clear and helpful

**Action:** Select card in "Card" tab, then switch to "Preview"

**Expected:**
- Shows card type badge with icon and "Real-time" chip
- Live card preview renders in bordered wrapper
- Card displays with actual HASS data
- Footer message: "Preview updates automatically..."

**Validation:**
- [ ] Preview header shows card info
- [ ] "Real-time" chip present
- [ ] Card renders correctly
- [ ] Card shows live HASS data
- [ ] Footer message present

**Action:** Switch back to "Card" tab, modify config, return to "Preview"

**Expected:**
- Preview updates automatically with new config
- No errors in console

**Validation:**
- [ ] Preview reflects config changes
- [ ] No console errors

---

### Test 5: Card Selection Flow

**Action:** Complete flow: Placement → Card → Preview → Save

**Steps:**
1. **Placement tab:** Configure position (coordinates or anchor), size, attachment
2. **Card tab:** Select "Button" card, set entity, name, icon
3. **Preview tab:** Verify button card displays correctly
4. **Save:** Click save button

**Expected:**
- Placement: All position/size fields work correctly
- Card: Card picker → selection → configuration all work
- Preview: Live button card shows with entity state
- Save: Control overlay appears on MSD preview
- No console errors throughout flow

**Validation:**
- [ ] Placement configuration saves
- [ ] Card selection and config work
- [ ] Preview shows configured card
- [ ] Save creates control overlay
- [ ] Control appears in MSD preview
- [ ] No console errors

---

### Test 6: Edit Existing Control

**Action:** Edit control with existing card config

**Expected:**
- Card tab loads with card already selected
- Native editor shows existing card config
- Preview tab shows current card state
- Can modify and save changes

**Validation:**
- [ ] Existing card loads correctly
- [ ] Editor shows current config
- [ ] Preview shows current state
- [ ] Can modify and save

---

## Console Verification

Open browser console (F12) and check during testing:

```javascript
// Check for component availability:
customElements.get('hui-card-picker')        // Should be defined in modern HA
customElements.get('hui-card-element-editor') // Should be defined in modern HA

// Enable debug logging (optional):
window.lcards.setGlobalLogLevel('debug')

// Expected debug logs when working:
// [MSDStudio] Rendering Card tab with HA native components
// [MSDStudio] Card picked: { config: { type: 'button', ... } }
// [MSDStudio] Card set to: { type: 'button', ... }
// [MSDStudio] Creating preview card in tab

// Check for errors (should be none):
// - No "hui-card-picker not registered" warnings (unless using legacy)
// - No "Preview card failed" errors
// - No uncaught exceptions
```

---

## Known Issues / Expected Behavior

### Expected Behaviors

1. **Preview Tab Loading Delay:** Small delay (0-500ms) when switching to preview as card element creation is async
2. **Card Not Registered:** Some custom cards may not load immediately - preview shows "Loading card..." then renders
3. **Legacy Fallback:** If HA components unavailable (older HA versions), legacy picker is used - this is expected
4. **Preview Re-render:** Preview only updates when switching tabs (intentional to avoid performance issues)

### Potential Issues

1. **hui-card-picker not available:** 
   - Occurs in HA versions < 2023.x (estimated)
   - Legacy fallback activates automatically
   - Warning message displays

2. **Card element fails to create:**
   - Occurs if custom card not properly registered
   - Preview shows error message with details
   - User can still configure in editor

---

## Success Criteria

All of the following must be true:

- ✅ Three tabs render correctly and are switchable
- ✅ HA native components used when available
- ✅ Legacy fallback works when components unavailable
- ✅ Preview tab shows live card rendering with HASS data
- ✅ Card selection and configuration flow works end-to-end
- ✅ Card changes save correctly to control overlay
- ✅ No console errors during normal operation
- ✅ Saved controls work correctly in MSD preview
- ✅ Existing controls can be edited without data loss

---

## Troubleshooting

### Issue: "Using legacy card picker" warning appears

**Cause:** HA components not loaded yet or HA version too old

**Solution:** 
- Check HA version (recommend 2023.x+)
- Legacy fallback should work correctly
- No action needed if legacy works

---

### Issue: Preview shows "Card type not registered"

**Cause:** Custom card not loaded in HA

**Solution:**
- Verify card is installed and registered in HA
- Check browser console for card loading errors
- Try standard HA card instead to verify system works

---

### Issue: Preview doesn't update when config changes

**Cause:** Preview only renders on tab activation (intentional)

**Solution:**
- Switch to another tab, then back to Preview
- This is expected behavior to avoid continuous re-renders

---

### Issue: Card config lost when changing card type

**Cause:** Expected behavior to prevent invalid configs

**Solution:**
- This is intentional - different card types have different schemas
- Reconfigure new card type as needed

---

### Issue: hui-card-picker shows empty or minimal cards

**Cause:** HA Lovelace instance not properly accessed

**Solution:**
- Check console for "_getRealLovelace" errors
- Verify running in HA Lovelace context (not standalone)
- Legacy fallback should activate if Lovelace unavailable

---

## Component Architecture

### File Changes Summary

**Modified Files:**
- `src/editor/dialogs/lcards-msd-studio-dialog.js` (~400 lines changed)
- `src/editor/dialogs/msd-studio/msd-studio-styles.js` (~70 lines added)

**Key Methods Added:**
- `_renderControlFormCard()` - Component availability check and routing
- `_renderControlFormCardNative()` - HA native component implementation
- `_renderControlFormCardLegacy()` - Fallback implementation
- `_renderControlFormPreview()` - Preview tab rendering
- `_handleCardPicked()` - hui-card-picker event handler
- `_getEnhancedStubConfig()` - Merge stub configs
- `_getCardTypeName()` - Pretty card names
- `_getCardIcon()` - Card type icon mapping
- `_createPreviewCardInTab()` - Preview card creation

### Component Flow

```
Control Form Dialog Opens
    ↓
Three Tabs Render: Placement | Card | Preview
    ↓
User selects "Card" tab
    ↓
Check: customElements.get('hui-card-picker')
    ↓
┌─────────────────────────┬─────────────────────────┐
│ Available               │ Not Available           │
│ ↓                       │ ↓                       │
│ hui-card-picker         │ Legacy card grid        │
│ ↓                       │ ↓                       │
│ User picks card         │ User picks card         │
│ ↓                       │ ↓                       │
│ hui-card-element-editor │ ha-selector (generic)   │
└─────────────────────────┴─────────────────────────┘
    ↓
Card config captured
    ↓
User switches to "Preview" tab
    ↓
Live card renders with HASS data
    ↓
User clicks "Save"
    ↓
Control overlay created in MSD
```

---

## Testing Checklist

Print this checklist for manual testing:

- [ ] **Setup Complete:** Built and deployed to HA
- [ ] **Test 1:** Three-tab structure works
- [ ] **Test 2:** HA native picker works (if available)
- [ ] **Test 3:** Legacy fallback works (if needed)
- [ ] **Test 4:** Preview tab displays correctly
- [ ] **Test 5:** Complete card selection flow works
- [ ] **Test 6:** Edit existing control works
- [ ] **Console:** No unexpected errors
- [ ] **Success Criteria:** All items pass

---

## Related Documentation

- Main Implementation: `/home/runner/work/LCARdS/LCARdS/src/editor/dialogs/lcards-msd-studio-dialog.js`
- Styles: `/home/runner/work/LCARdS/LCARdS/src/editor/dialogs/msd-studio/msd-studio-styles.js`
- Problem Statement: See GitHub issue for full requirements

---

**Last Updated:** 2026-01-16  
**LCARdS Version:** 1.20.01+  
**Testing Status:** Implementation Complete, Manual Testing Required
