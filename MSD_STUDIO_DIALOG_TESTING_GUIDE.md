# MSD Studio Dialog Testing Guide

## Overview

This guide provides step-by-step instructions for testing the refactored MSD Configuration Studio dialog after the ha-dialog pattern migration.

## Prerequisites

1. Home Assistant instance running
2. LCARdS integration installed
3. Fresh build of LCARdS deployed to HA:
   ```bash
   npm run build
   cp dist/lcards.js /path/to/homeassistant/www/community/lcards/
   ```
4. Hard refresh browser (Ctrl+Shift+R) to clear cache

## Test Plan

### 1. Basic Dialog Functionality

#### 1.1 Opening the Dialog

**Steps:**
1. Go to Home Assistant Lovelace dashboard in edit mode
2. Add a new card or edit existing MSD card
3. In the card editor, find the "Configuration" tab
4. Click the "Open Configuration Studio" button

**Expected Results:**
- ✅ Dialog opens immediately
- ✅ Dialog appears on top of all other content (proper z-index)
- ✅ Dialog covers ~95% of viewport width and ~90% height
- ✅ Dialog has standard HA appearance (rounded corners, shadow, backdrop)

#### 1.2 Dialog Structure

**Visual Inspection:**
- ✅ Title bar shows "MSD Configuration Studio"
- ✅ Save button in top-right corner (primary action, raised style)
- ✅ Reset button next to Save (secondary action, with restore icon)
- ✅ Cancel button next to Reset (secondary action, with close icon)
- ✅ All buttons have appropriate icons

#### 1.3 Mode Toolbar

**Location:** Below title bar, above content area

**Visual Inspection:**
- ✅ Toolbar has light background (secondary-background-color)
- ✅ 5 mode buttons visible:
  1. View (cursor icon)
  2. Place Anchor (map marker icon)
  3. Place Control (widgets icon)
  4. Connect Line (vector line icon)
  5. Draw Channel (timeline icon)
- ✅ Mode status badge on right side of toolbar
- ✅ Status badge shows: "Mode: View" (or current mode)
- ✅ Status badge has icon matching current mode

**Interaction:**
1. Click each mode button
2. Verify active mode has different styling (blue background)
3. Verify status badge updates to show current mode
4. Click active mode again - should toggle back to "View"

### 2. Layout and Panels

#### 2.1 Split Panel Layout

**Expected Layout:**
- ✅ Left panel (Config): 60% width
- ✅ Right panel (Preview): 40% width
- ✅ Vertical divider between panels (2px solid line)
- ✅ No scrolling issues with content

#### 2.2 Configuration Panel (Left)

**Tab Navigation:**
- ✅ 6 tabs visible: Base SVG, Anchors, Controls, Lines, Channels, Debug
- ✅ Active tab has blue underline (4px thick)
- ✅ Clicking tab switches content

**Tab Content:**
1. Click each tab
2. Verify placeholder content shows:
   - Icon (64px, centered)
   - Title
   - Description
   - "Coming in Phase X" text

#### 2.3 Preview Panel (Right)

**Expected Content:**
- ✅ "Live Preview" header with eye icon
- ✅ Refresh button (icon-button) in header
- ✅ Preview container shows current MSD card
- ✅ Footer shows info message about auto-updates

**Interaction:**
1. Click refresh button
2. Verify preview updates (if config changes made)

### 3. Dialog Actions

#### 3.1 Save Button

**Steps:**
1. Make any change (switch tabs, change mode)
2. Click "Save" button

**Expected Results:**
- ✅ Dialog closes
- ✅ Config changes saved to card editor
- ✅ Card editor shows updated config
- ✅ No console errors

#### 3.2 Cancel Button

**Steps:**
1. Open dialog
2. Switch to different mode/tab
3. Click "Cancel" button

**Expected Results:**
- ✅ Dialog closes immediately
- ✅ No changes saved
- ✅ Card editor config unchanged
- ✅ No console errors

#### 3.3 Reset Button

**Steps:**
1. Open dialog
2. Switch to different mode/tab
3. Click "Reset" button
4. Observe dialog

**Expected Results:**
- ✅ Dialog remains open
- ✅ Mode resets to "View"
- ✅ Active tab resets to "Base SVG"
- ✅ Config reverts to initial state
- ✅ Preview updates to show initial config

#### 3.4 Close (X) Button

**Steps:**
1. Open dialog
2. Click X button in title bar (if visible in ha-dialog)

**Expected Results:**
- ✅ Dialog closes
- ✅ Same behavior as Cancel
- ✅ No changes saved

### 4. Visual Consistency with Chart Studio

#### 4.1 Side-by-Side Comparison

**Setup:**
1. Open Chart card editor → "Open Configuration Studio"
2. Take note of dialog appearance
3. Close chart studio
4. Open MSD card editor → "Open Configuration Studio"

**Comparison Checklist:**
- ✅ Same dialog size (95vw × 90vh)
- ✅ Same title bar style
- ✅ Same button layout (Save primary, Reset/Cancel secondary)
- ✅ Same button styling (icons, raised/flat)
- ✅ Same backdrop/shadow effect
- ✅ Same overall color scheme

**Differences (Expected):**
- Mode toolbar (MSD-specific feature) - not in chart studio
- Tab count (6 for MSD vs 10 for chart)
- Preview panel content (MSD card vs Chart)

### 5. Responsive Behavior

#### 5.1 Desktop (>1024px width)

**Expected:**
- ✅ Side-by-side layout (60/40 split)
- ✅ All tabs visible in single row
- ✅ Mode toolbar buttons in single row

#### 5.2 Tablet/Mobile (<1024px width)

**Steps:**
1. Resize browser window to <1024px
2. Open MSD studio dialog

**Expected:**
- ✅ Layout switches to stacked (config over preview)
- ✅ Config panel takes top 50%
- ✅ Preview panel takes bottom 50%
- ✅ Tabs may wrap to multiple rows
- ✅ Dialog remains functional

### 6. Browser Developer Console

**Open console during all tests:**

**Check for:**
- ✅ No red errors
- ✅ No warnings about missing ha-dialog
- ✅ LCARdS debug logs show proper initialization
- ✅ Dialog lifecycle events fire correctly:
  - `[MSDStudio] Opened with config:`
  - `[MSDStudio] Mode changed:`
  - `[MSDStudio] Tab changed:`
  - `[MSDStudio] Saving config:` (on save)
  - `[MSDStudio] Cancelled` (on cancel)

### 7. Edge Cases

#### 7.1 Rapid Interactions

**Steps:**
1. Open dialog
2. Rapidly click mode buttons (spam click)
3. Rapidly switch tabs
4. Click Save/Cancel quickly

**Expected:**
- ✅ No crashes
- ✅ UI remains responsive
- ✅ Final state is consistent
- ✅ No memory leaks

#### 7.2 Long Content

**Steps:**
1. Create MSD card with many overlays (50+)
2. Open studio dialog
3. Scroll through config panel

**Expected:**
- ✅ Config panel scrolls independently
- ✅ Preview panel remains fixed/scrolls independently
- ✅ No layout breaking
- ✅ Performance remains acceptable

### 8. Cleanup and Memory

#### 8.1 Dialog Removal

**Steps:**
1. Open browser DevTools → Elements/Inspector
2. Open MSD studio dialog
3. In DevTools, find `<lcards-msd-studio-dialog>` element
4. Click Cancel/Save to close
5. Verify element removed from DOM

**Expected:**
- ✅ Dialog element removed from DOM tree
- ✅ No orphaned elements
- ✅ Event listeners cleaned up

## Regression Testing

### Areas That Should NOT Be Affected

- ✅ MSD card rendering (outside editor)
- ✅ MSD editor main UI (Configuration tab)
- ✅ Other card editors (button, chart, etc.)
- ✅ Other studio dialogs (chart studio, data grid studio)
- ✅ Core LCARdS functionality

## Known Issues

None expected - this is a pure UI refactor with no logic changes.

## Performance Benchmarks

### Metrics to Track

1. **Dialog Open Time:** Should be <500ms
2. **Mode Switch Time:** Should be instant (<100ms)
3. **Tab Switch Time:** Should be instant (<100ms)
4. **Save/Close Time:** Should be <200ms

### How to Measure

1. Open browser DevTools → Performance tab
2. Start recording
3. Perform action
4. Stop recording
5. Analyze timeline

## Success Criteria

All checkboxes (✅) must be marked for the refactor to be considered successful.

**Critical Path Tests:**
1. ✅ Dialog opens correctly
2. ✅ Dialog has proper z-index (appears on top)
3. ✅ All 6 tabs accessible
4. ✅ Mode toolbar functional
5. ✅ Save/Cancel/Reset work correctly
6. ✅ Preview panel shows card
7. ✅ No console errors
8. ✅ Visual consistency with chart studio

## Reporting Issues

If any test fails:

1. Note the specific test section and step
2. Capture screenshot of issue
3. Copy browser console errors (if any)
4. Note browser version and OS
5. Report in GitHub issue or PR comments

## Contact

For questions about this testing guide or the refactor:
- See: `MSD_STUDIO_DIALOG_REFACTOR_SUMMARY.md`
- PR: `copilot/fix-msd-studio-dialog-pattern`
- Commit: `b2ce3ce`
