# Validation Service

> Config schema validation for all LCARdS card types.

---

## Overview

The Validation Service provides runtime config validation using a schema registry. When a card receives a config object, validation catches structural errors and unknown fields early, before rendering starts.

---

## Key Files

| File | Role |
|---|---|
| `core/validation-service/index.js` | Service entry point |
| `core/validation-service/SchemaRegistry.js` | Stores schemas keyed by card type; register/lookup |
| `core/validation-service/DataSourceValidator.js` | Validates `data_sources` block |
| `core/validation-service/OverlayValidator.js` | Validates MSD overlay definitions |
| `core/validation-service/TokenValidator.js` | Detects invalid token syntax in string fields |
| `core/validation-service/ValueValidator.js` | Type + range checking for scalar fields |
| `core/validation-service/ErrorFormatter.js` | Formats error objects into human-readable messages |
| `core/validation-service/schemas/` | Per-card JSON schema definitions |

---

## Schema Registration

Card schemas are registered at startup via `CoreConfigManager`:

```javascript
import { SchemaRegistry } from '../core/validation-service/SchemaRegistry.js';

SchemaRegistry.register('lcards-button', buttonSchema);
SchemaRegistry.register('lcards-slider', sliderSchema);
```

---

## Card Usage

```javascript
import { validateConfig } from '../core/validation-service/index.js';

// Returns { valid: boolean, errors: string[], warnings: string[] }
const result = validateConfig('lcards-button', this.config);

if (!result.valid) {
  lcardsLog.warn('[MyCard] Config validation failed:', result.errors);
}
```

---

## Error Display

Validation errors surface in two places:

1. **Browser console** — structured log messages with field paths
2. **Card editor** — the YAML tab shows inline error markers via CodeMirror integration

---

## See Also

- [Card Foundation](../cards/lcards-card-foundation.md)
- [Developer: Custom Card](../../development/custom-card.md)
