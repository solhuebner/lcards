# Data Grid Studio Dialog v4 - Technical Design

## Overview

The Data Grid Studio Dialog v4 is a complete redesign of the data grid configuration interface, featuring WYSIWYG editing capabilities, simplified mode architecture, and progressive disclosure of advanced features.

## Architecture

### Design Principles

1. **WYSIWYG First**: Users can click directly on cells/rows/columns in the preview to edit them
2. **Progressive Disclosure**: Basic tab for common tasks, Advanced tab for power users
3. **Mode Simplification**: Three clear modes instead of confusing random/template/datasource
4. **No Z-Index Hell**: Proper overlay management prevents dialog stacking issues
5. **Backward Compatible**: New mode names map to old names for card compatibility

### Component Hierarchy

```
lcards-data-grid-studio-dialog-v4 (Main Dialog)
├── Basic Tab
│   ├── Mode Selection Sub-Tab
│   ├── Grid Structure Sub-Tab
│   └── Configuration Sub-Tab
├── Advanced Tab
│   ├── Styling Sub-Tab
│   ├── Animation Sub-Tab
│   └── CSS Grid Sub-Tab
└── Preview Panel
    ├── Mode Toggle (Live / WYSIWYG)
    └── Card Container (manual instantiation)
```

### Overlay Editors

Three specialized overlay components for WYSIWYG editing:

- **lcards-grid-cell-editor**: Edit individual cells
- **lcards-grid-row-editor**: Row operations and styling
- **lcards-grid-column-editor**: Column configuration

## Mode Architecture

**v4 Names** (user-facing):
- `decorative` - Auto-generated random data
- `manual` - User-defined cell values
- `data-table` - Structured datasource data

**Card Names** (internal):
- `random` (mapped from decorative)
- `template` (mapped from manual)
- `datasource` (mapped from data-table)

## WYSIWYG System

### Click Handling

- Normal click → Cell editor
- Shift + click → Row editor
- Ctrl/Cmd + click → Column editor

### Overlay Positioning

Smart positioning near click location with screen boundary detection.

## References

- Card Implementation: `src/cards/lcards-data-grid.js`
- Schema Definition: `src/cards/schemas/data-grid-schema.js`

---

*Last Updated: January 2026*
*Status: Implementation Complete (Phases 1-3)*
