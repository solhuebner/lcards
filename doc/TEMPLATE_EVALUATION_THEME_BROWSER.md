# Template Evaluation & Theme Token Browser - Feature Documentation

## Overview

This document describes the new Template Evaluation Tab and Theme Token Browser features added to the LCARdS card editor system.

## Features

### 1. Template Evaluation Tab

The Template Evaluation Tab helps users discover, debug, and understand all templates and tokens used in their card configuration.

#### Key Features:

- **Automatic Template Discovery**: Recursively scans the entire card configuration to find all templates
- **Live Evaluation**: Evaluates each template in real-time with current entity state and context
- **Multiple Template Types Supported**:
  - JavaScript expressions: `[[[...]]]`
  - LCARdS theme tokens: `{theme:colors.primary}`
  - LCARdS datasource tokens: `{datasource:sensor.temp}` or `{ds:sensor.temp}`
  - LCARdS simple tokens: `{entity.state}`, `{config.entity}`, `{variables.color}`
  - Jinja2 templates: `{{states('sensor.temp')}}`

#### UI Components:

1. **Syntax Reference Panel** (top):
   - Shows all supported template syntaxes with examples
   - Emphasizes the difference between single braces (LCARdS) and double braces (Jinja2)
   - Provides quick reference while editing

2. **Filter Bar**:
   - Filter by template type (All, JavaScript, Theme, Datasource, Token, Jinja2)
   - Shows count for each type
   - Active filters highlighted

3. **Templates Table**:
   - **Path**: Config location (e.g., `text.name.content`, `style.color.default`)
   - **Type**: Badge showing template type with color coding
   - **Template**: Raw template string in code format
   - **Result**: Evaluated value or error message
   - **Status**: Visual indicator (✅ success, ❌ error, ⚠️ pending)
   - **Actions**: Copy button to copy evaluated result

#### Example Use Cases:

1. **Debugging Templates**: When a template doesn't work as expected, see the raw template, evaluated result, and any errors
2. **Discovery**: Find all places where templates are used in your card config
3. **Learning**: Understand the difference between template syntaxes
4. **Migration**: Identify templates that need updating when changing syntax

### 2. Theme Token Browser Tab

The Theme Token Browser helps users discover and use theme tokens with the correct LCARdS syntax.

#### Key Features:

- **Complete Token Tree**: Shows all tokens from the active theme
- **Search & Filter**: Find tokens by path or value
- **Category Filtering**: Filter by token category (colors, typography, spacing, etc.)
- **Usage Tracking**: See where each token is used in the current card config
- **Type-Aware Previews**:
  - Color tokens: Color swatch preview
  - Typography tokens: Font sample preview
  - Spacing tokens: Visual spacing indicator

#### UI Components:

1. **Theme Info Panel** (top):
   - Shows active theme name
   - Total token count
   - Syntax reminder: "Copy format: {theme:token.path}"

2. **Search & Filter Controls**:
   - Search box to filter by token path or value
   - Category chips showing count for each category
   - Active category highlighted

3. **Token Cards Grid**:
   - **Token Path**: Full token path in code format (e.g., `{theme:colors.accent.primary}`)
   - **Category Badge**: Token category label
   - **Value**: Resolved token value
   - **Preview**: Visual preview based on token type
   - **Actions**:
     - "Copy Token" button: Copies proper LCARdS syntax `{theme:token.path}`
     - "Copy Value" button: Copies the resolved value
   - **Usage List**: Shows config paths where this token is used

#### Example Use Cases:

1. **Token Discovery**: Browse all available theme tokens
2. **Color Exploration**: See all color tokens with visual previews
3. **Proper Syntax**: Always copy tokens with the correct `{theme:...}` format
4. **Usage Audit**: Find where specific tokens are used in your config
5. **Theme Migration**: Identify tokens that need updating when switching themes

## Integration

Both tabs are integrated into the button card editor and can be easily added to other card editors.

### For Button Card:

1. Open the button card in edit mode
2. Navigate to the "Templates" tab to see template evaluation
3. Navigate to the "Theme Tokens" tab to browse theme tokens

### Adding to Other Card Editors:

To add these tabs to other card editors (slider, chart, etc.):

1. Import the tab components:
```javascript
import '../components/templates/lcards-template-evaluation-tab.js';
import '../components/templates/lcards-theme-token-browser-tab.js';
```

2. Add to tab definitions:
```javascript
tabs.push(
  { label: 'Templates', content: () => this._renderTemplatesTab() },
  { label: 'Theme Tokens', content: () => this._renderThemeTokensTab() }
);
```

3. Add render methods:
```javascript
_renderTemplatesTab() {
  return html`
    <lcards-template-evaluation-tab
      .editor=${this}
      .config=${this.config}
      .hass=${this.hass}>
    </lcards-template-evaluation-tab>
  `;
}

_renderThemeTokensTab() {
  return html`
    <lcards-theme-token-browser-tab
      .editor=${this}
      .config=${this.config}
      .hass=${this.hass}>
    </lcards-theme-token-browser-tab>
  `;
}
```

## Token Syntax Reference

### LCARdS Tokens (Single Braces)

**Theme Tokens:**
```yaml
# Correct:
color: {theme:colors.accent.primary}

# Wrong (Jinja2 syntax):
color: {{theme:colors.accent.primary}}
```

**Datasource Tokens:**
```yaml
# Explicit syntax (recommended):
content: {datasource:sensor.temperature}
content: {ds:sensor.temperature}

# Legacy syntax (still supported):
content: {sensor.temperature}
```

**Simple Tokens:**
```yaml
# Entity properties:
content: {entity.state}
content: {entity.attributes.friendly_name}

# Config properties:
width: {config.custom_width}

# Variables:
color: {variables.custom_color}
```

### JavaScript Templates (Triple Brackets)

```yaml
content: [[[return entity.state === 'on' ? 'Active' : 'Inactive']]]
color: [[[return entity.attributes.temperature > 25 ? '#ff0000' : '#00ff00']]]
```

### Jinja2 Templates (Double Braces)

```yaml
# Home Assistant functions:
content: {{states('sensor.temperature')}}
content: {{state_attr('sensor.temperature', 'unit_of_measurement')}}

# With filters:
content: {{states('sensor.temperature') | float | round(1)}}
```

## Technical Details

### Template Evaluation Order

Templates are evaluated in the following order:
1. JavaScript templates `[[[...]]]` (synchronous)
2. LCARdS tokens `{...}` (synchronous)
3. Datasource tokens `{datasource:...}` or `{ds:...}` (synchronous)
4. Jinja2 templates `{{...}}` (asynchronous)

### Dependencies

The components rely on:
- `window.lcards.core.themeManager` - For theme token resolution
- `window.lcards.core.dataSourceManager` - For datasource token evaluation
- `UnifiedTemplateEvaluator` - For template evaluation
- `TemplateDetector` - For template type detection

### Error Handling

- Invalid theme tokens: Shows "(not found)" with warning status
- Datasource errors: Shows descriptive error message
- JavaScript errors: Catches and displays error message
- Jinja2 errors: Shows async evaluation status

## Future Enhancements

Possible future additions (not in current implementation):

1. **Template Sandbox Modal**:
   - Edit templates in a sandbox environment
   - Override entity data for testing
   - Live preview of results
   - Copy working templates back to config

2. **Token Override Editor**:
   - Visual editor for card-level token overrides
   - Preview token changes in real-time

3. **Template Suggestions**:
   - AI-powered template suggestions based on context
   - Common template patterns library

4. **Performance Monitoring**:
   - Track template evaluation performance
   - Identify slow templates

## Related Documentation

- [LCARdS Template System](../doc/templates.md)
- [Theme Token System](../doc/themes.md)
- [Datasource System](../PHASE3_USAGE_GUIDE.md)
- [Card Editor Architecture](../VISUAL_EDITOR_PHASE1_SUMMARY.md)

## Migration Notes

If you have existing configurations using incorrect token syntax:

### Before:
```yaml
# Incorrect (double braces for theme tokens)
style:
  color: {{theme:colors.primary}}
```

### After:
```yaml
# Correct (single braces for theme tokens)
style:
  color: {theme:colors.primary}
```

The Template Evaluation Tab will help identify these issues by showing warning/error status for improperly formatted tokens.

## Support

For issues or questions:
- Check the syntax reference panel in the Template Evaluation Tab
- Review theme token formats in the Theme Token Browser
- Consult the [main documentation](../README.md)
- Report bugs via GitHub issues
