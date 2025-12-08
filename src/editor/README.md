# LCARdS Visual Editor

Visual editor components for LCARdS cards, integrated with Home Assistant's native card editor interface.

## Quick Start

### Creating a New Card Editor

1. **Create Schema** (`schemas/mycard-schema.js`):
```javascript
export const MYCARD_SCHEMA = {
    type: 'object',
    properties: {
        entity: { type: 'string', description: 'Entity ID' },
        // ... other properties
    }
};
```

2. **Create Editor** (`cards/lcards-mycard-editor.js`):
```javascript
import { LCARdSBaseEditor } from '../base/LCARdSBaseEditor.js';

export class LCARdSMyCardEditor extends LCARdSBaseEditor {
    _getTabDefinitions() {
        return [
            { label: 'Config', content: () => this._renderConfigTab() },
            { label: 'YAML', content: () => this._renderYamlTab() }
        ];
    }
    
    _getSchema() { return MYCARD_SCHEMA; }
    
    _renderConfigTab() { /* ... */ }
    _renderYamlTab() { /* ... */ }
}
```

3. **Register in Card** (`cards/lcards-mycard.js`):
```javascript
static getConfigElement() {
    import('../editor/cards/lcards-mycard-editor.js');
    return document.createElement('lcards-mycard-editor');
}
```

## Directory Structure

```
editor/
├── base/                    # Base classes and shared styles
├── cards/                   # Card-specific editors
├── components/              # Reusable editor components
│   ├── common/             # Common UI components
│   └── yaml/               # YAML editor
├── schemas/                # JSON Schema definitions
└── utils/                  # Utility functions
```

## Key Components

- **LCARdSBaseEditor** - Abstract base class for all editors
- **LCARdSCardConfigSection** - Common card properties (entity, ID, tags, layout)
- **LCARdSActionEditor** - Action configuration (tap, hold, double-tap)
- **LCARdSMonacoYamlEditor** - YAML editor with validation

## Features

✅ **Tab-based UI** - Organize editor into logical sections  
✅ **YAML synchronization** - Visual tabs ↔ YAML tab bidirectional sync  
✅ **Schema validation** - Real-time validation with helpful error messages  
✅ **Code splitting** - Editor code only loaded when needed  
✅ **HA integration** - Uses Home Assistant's standard components  
✅ **Graceful fallbacks** - Works without HA-specific components  

## Documentation

See [Visual Editor Architecture](../../doc/architecture/visual-editor-architecture.md) for detailed documentation.

## Status

### Phase 1: Foundation ✅ (Current)
- Base editor architecture
- Button card editor
- Basic components
- YAML editor (simple textarea)

### Phase 2: DataSource Builder 🔜 (Future)
- Visual datasource configuration
- Transform picker
- Preview

### Phase 3: Rules Engine Builder 🔜 (Future)
- Visual rule builder
- Condition tree
- Rule tester

### Phase 4: Enhanced Features 🔜 (Future)
- Full Monaco editor with IntelliSense
- Live card preview
- Theme preview
