# LCARdS Data Grid Card - User Guide

> **Flexible grid visualization with cascade animations**
> Display data in LCARS-style grids with three input modes: random decorative, template-based, and real-time datasource.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Data Modes](#data-modes)
4. [Cascade Animations](#cascade-animations)
5. [Grid Configuration](#grid-configuration)
6. [Styling Guide](#styling-guide)
7. [Theme Integration](#theme-integration)
8. [Change Detection](#change-detection)
9. [Complete Examples](#complete-examples)
10. [Complete Schema Reference](#complete-schema-reference)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The **LCARdS Data Grid Card** provides authentic LCARS-style data grids with cascade animations, supporting multiple data input modes and real-time updates.

### Key Features

✅ **Three data modes** - Random decorative, template-based, DataSource integration
✅ **Cascade animations** - Row-by-row color cycling with AnimationManager
✅ **Change detection** - Highlight cells when values change
✅ **Theme integration** - LCARdS theme tokens and CSS variables
✅ **Real-time updates** - Live data from entities or DataSources
✅ **Multiple layouts** - Timeline and spreadsheet layouts for DataSource mode
✅ **Performance optimized** - CSS Grid layout and efficient updates
✅ **Flexible formatting** - Custom value templates and formatting

### When to Use Data Grid

- **Decorative displays** - LCARS-style random data cascades for ambiance
- **Status boards** - Show multiple sensor values in organized grid
- **Historical data** - Timeline of values from a single source
- **Multi-sensor grids** - Spreadsheet-style structured data display
- **Custom dashboards** - Flexible grid layouts with template expressions

---

## Quick Start

### Minimal Configuration (Random Mode)

The absolute minimum for a decorative grid:

```yaml
type: custom:lcards-data-grid
data_mode: random
grid:
  rows: 8
  columns: 12
```

**Result:** An 8x12 grid with random alphanumeric data and default cascade animation.

### With Cascade Animation

Add LCARS-style color cycling:

```yaml
type: custom:lcards-data-grid
data_mode: random
grid:
  rows: 8
  columns: 12
animation:
  type: cascade
  pattern: default
  colors:
    start: colors.lcars.blue
    text: colors.lcars.dark-blue
    end: colors.lcars.moonlight
```

### Simple Template Grid

Display live sensor data:

```yaml
type: custom:lcards-data-grid
data_mode: template
rows:
  - ['Living Room', '{{states.sensor.living_temp.state}}°C']
  - ['Bedroom', '{{states.sensor.bedroom_temp.state}}°C']
  - ['Kitchen', '{{states.sensor.kitchen_temp.state}}°C']
font_size: 16
```

---

## Data Modes

LCARdS Data Grid offers three distinct data input modes, each optimized for different use cases.

### Mode 1: Random (Decorative)

Auto-generates random data for LCARS-style visual effects.

**Basic Usage:**

```yaml
type: custom:lcards-data-grid
data_mode: random
format: mixed              # 'digit' | 'float' | 'alpha' | 'hex' | 'mixed'
grid:
  rows: 8
  columns: 12
  gap: 8
```

**Format Options:**

| Format | Output Example | Description |
|--------|----------------|-------------|
| `digit` | `0042`, `1337` | 4-digit numbers (padded) |
| `float` | `42.17`, `3.14` | Decimal numbers (2 places) |
| `alpha` | `AB`, `XY` | Two uppercase letters |
| `hex` | `A3F1`, `00FF` | 4-digit hexadecimal |
| `mixed` | Various | Random mix of all formats |

**With Auto-Refresh:**

```yaml
type: custom:lcards-data-grid
data_mode: random
format: hex
refresh_interval: 3000     # Update every 3 seconds
grid:
  rows: 6
  columns: 10
animation:
  type: cascade
  highlight_changes: true  # Animate changes when data refreshes
```

### Mode 2: Template (Manual Grid)

Define grid content using templates and entity values.

**Basic Template:**

```yaml
type: custom:lcards-data-grid
data_mode: template
rows:
  - ['Label', 'Value']
  - ['CPU', '{{states.sensor.cpu_usage.state}}%']
  - ['RAM', '{{states.sensor.memory_usage.state}}%']
  - ['Disk', '{{states.sensor.disk_usage.state}}%']
```

**Advanced Templates with Expressions:**

```yaml
type: custom:lcards-data-grid
data_mode: template
rows:
  - ['Room', 'Temp', 'Humidity', 'Status']
  - ['Living', '{{states.sensor.living_temp.state}}°C', '{{states.sensor.living_humidity.state}}%', '{% if states.sensor.living_temp.state|float > 22 %}WARM{% else %}COOL{% endif %}']
  - ['Bedroom', '{{states.sensor.bedroom_temp.state}}°C', '{{states.sensor.bedroom_humidity.state}}%', '{% if states.sensor.bedroom_temp.state|float > 22 %}WARM{% else %}COOL{% endif %}']
```

**Template Features:**

- Full Home Assistant template syntax
- Entity state access via `{{states.entity_id.state}}`
- Attribute access via `{{states.entity_id.attributes.attr}}`
- Jinja2 filters and conditionals
- Auto-updates when tracked entities change

### Mode 3: DataSource (Real-Time)

Integrate with LCARdS DataSource system for advanced data handling.

#### Timeline Layout

Display flowing data from a single source:

```yaml
type: custom:lcards-data-grid
data_mode: datasource
layout: timeline
source: sensor.temperature  # Entity or DataSource name
grid:
  rows: 6
  columns: 12
history_hours: 1           # Preload 1 hour of history
value_template: '{value}°C' # Format values
```

**Timeline Features:**
- Automatically flows new values into grid (left-to-right, top-to-bottom)
- Supports historical data preload
- Change detection highlights new values
- Auto-creates DataSource from entity if needed

#### Spreadsheet Layout

Structured grid with multiple data sources:

```yaml
type: custom:lcards-data-grid
data_mode: datasource
layout: spreadsheet

# Define columns
columns:
  - header: Room
    width: 120
    align: left
  - header: Temperature
    width: 100
    align: center
  - header: Humidity
    width: 100
    align: center

# Define rows with data sources
rows:
  - sources:
      - type: static
        column: 0
        value: Living Room
      - type: datasource
        column: 1
        source: living_temp
        format: '{value}°C'
      - type: datasource
        column: 2
        source: living_humidity
        format: '{value}%'
  
  - sources:
      - type: static
        column: 0
        value: Bedroom
      - type: datasource
        column: 1
        source: bedroom_temp
        format: '{value}°C'
      - type: datasource
        column: 2
        source: bedroom_humidity
        format: '{value}%'
```

**Spreadsheet Features:**
- Column headers with configurable width and alignment
- Mix static labels with dynamic data
- Per-cell value formatting
- Independent data sources per cell
- Efficient update handling

---

## Cascade Animations

The signature LCARS feature: row-by-row color cycling animations powered by AnimationManager.

### Basic Cascade

Enable default cascade animation:

```yaml
animation:
  type: cascade              # Enable cascade animation
  pattern: default           # Animation timing pattern
```

### Animation Patterns

Control the cascade timing behavior:

```yaml
animation:
  type: cascade
  pattern: niagara           # Choose pattern
```

| Pattern | Description | Delay Range | Use Case |
|---------|-------------|-------------|----------|
| `default` | Varied, organic | 100-800ms | Standard displays |
| `niagara` | Uniform cascade | 100-800ms (linear) | Smooth wave effect |
| `fast` | Quick cascade | 50-400ms | Rapid updates |
| `frozen` | No animation | 0ms | Static display after initial cascade |
| `custom` | User-defined | See below | Precise control |

### Custom Timing Pattern

Define precise timing for each row:

```yaml
animation:
  type: cascade
  pattern: custom
  timing:
    - { duration: 3000, delay: 100 }   # Row 1
    - { duration: 3000, delay: 200 }   # Row 2
    - { duration: 4000, delay: 300 }   # Row 3
    - { duration: 2000, delay: 150 }   # Row 4
    # ... more rows
```

### Cascade Colors

Customize the color cycle:

```yaml
animation:
  type: cascade
  colors:
    start: colors.lcars.blue        # First color (theme token)
    text: colors.lcars.dark-blue    # Middle color
    end: colors.lcars.moonlight     # End color
  cycle_duration: 5000              # Full cycle in milliseconds
```

**Color Options:**
- Theme tokens: `colors.lcars.blue`, `colors.lcars.orange`, etc.
- CSS variables: `var(--lcars-orange)`
- Hex colors: `#99ccff`

### Advanced Animation Configuration

Complete animation control:

```yaml
animation:
  type: cascade
  
  # Timing
  pattern: default
  cycle_duration: 5000       # Duration of full color cycle (ms)
  
  # Colors (3-color cascade)
  colors:
    start: '#99ccff'         # Starting color (left/top)
    text: '#4466aa'          # Middle color
    end: '#aaccff'           # Ending color (right/bottom)
  
  # Change Detection
  highlight_changes: true    # Pulse animation when values change
  change_preset: pulse       # 'pulse' | 'glow' | 'flash'
  max_highlight_cells: 50    # Limit animations for performance
```

### No Animation

Disable cascade for static grids:

```yaml
# Omit animation config entirely, or set:
animation:
  type: none
```

---

## Grid Configuration

Control the grid layout and appearance.

### Basic Grid

```yaml
grid:
  rows: 8                    # Number of rows
  columns: 12                # Number of columns
  gap: 8                     # Gap between cells (px)
```

### Cell Alignment

```yaml
alignment: left              # 'left' | 'center' | 'right'
```

Applies to all cells. For per-column alignment in spreadsheet mode, use column config.

### Font Styling

```yaml
font_size: 18               # Font size in pixels
font_family: "'Antonio', 'Helvetica Neue', sans-serif"
font_weight: 400            # 300 | 400 | 700
```

### Cell Width Control

**Auto-sizing (default):**
```yaml
grid:
  columns: 12
  cell_width: auto          # Equal-width columns
```

**Fixed width:**
```yaml
grid:
  columns: 12
  cell_width: 80            # 80px per cell
```

### Color Configuration

**Default text color:**
```yaml
color: '#99ccff'            # Hex, theme token, or CSS var
```

**Theme integration:**
```yaml
color: theme:colors.text.primary
```

---

## Styling Guide

Customize the visual appearance of the grid.

### Text Colors

```yaml
# Single color for all cells
color: '#99ccff'

# Or use theme tokens
color: theme:colors.lcars.blue

# Or CSS variables
color: var(--primary-text-color)
```

### Background

Grid cells are transparent by default for proper LCARS aesthetics:

```yaml
# Card background is handled by container
# Individual cell backgrounds not recommended for LCARS style
```

### Typography

```yaml
font_size: 16              # Cell text size
font_family: "'Antonio', sans-serif"  # LCARS font
font_weight: 400           # Font weight
```

### Grid Spacing

```yaml
grid:
  gap: 8                   # Gap between cells (px)
  
# Individual cell padding is auto-calculated from gap
```

### Borders and Dividers

For spreadsheet layout:

```yaml
# Column headers automatically styled with divider
# Controlled via theme tokens:
# - theme:colors.background.header
# - theme:colors.text.header
# - theme:colors.divider
```

---

## Theme Integration

LCARdS Data Grid fully integrates with LCARdS themes.

### Using Theme Tokens

Reference the theme system:

```yaml
color: theme:colors.text.primary

animation:
  colors:
    start: theme:colors.lcars.blue
    text: theme:colors.lcars.dark-blue
    end: theme:colors.lcars.moonlight
```

**Common Theme Tokens:**
- `theme:colors.lcars.blue` - LCARS blue (#99ccff)
- `theme:colors.lcars.dark-blue` - Dark blue (#4466aa)
- `theme:colors.lcars.moonlight` - Moonlight (#aaccff)
- `theme:colors.lcars.orange` - LCARS orange
- `theme:colors.lcars.yellow` - LCARS yellow
- `theme:colors.text.primary` - Primary text color
- `theme:colors.background.card` - Card background
- `theme:colors.divider` - Divider lines

### Using CSS Variables

Reference Home Assistant theme variables:

```yaml
color: var(--primary-text-color)

animation:
  colors:
    start: var(--lcars-blue, #99ccff)  # With fallback
```

### Color Examples

```yaml
# Classic LCARS blue cascade
animation:
  type: cascade
  colors:
    start: '#99ccff'
    text: '#4466aa'
    end: '#aaccff'

# Orange cascade
animation:
  type: cascade
  colors:
    start: '#ff9900'
    text: '#cc6600'
    end: '#ffcc00'

# Theme-based (adapts to active theme)
animation:
  type: cascade
  colors:
    start: theme:colors.accent.primary
    text: theme:colors.accent.secondary
    end: theme:colors.accent.tertiary
```

---

## Change Detection

Animate cells when their values change.

### Basic Change Detection

```yaml
animation:
  highlight_changes: true    # Enable change detection
```

**Behavior:**
- Detects when cell values change
- Triggers pulse animation on changed cells
- Works in all data modes (random, template, datasource)

### Change Animation Presets

```yaml
animation:
  highlight_changes: true
  change_preset: pulse       # 'pulse' | 'glow' | 'flash'
```

| Preset | Effect | Duration | Use Case |
|--------|--------|----------|----------|
| `pulse` | Scale + background | 500ms | Default, subtle |
| `glow` | Opacity pulse | 600ms | Attention |
| `flash` | Quick flash | 300ms | Rapid updates |

### Performance Limiting

Prevent excessive animations on large grids:

```yaml
animation:
  highlight_changes: true
  max_highlight_cells: 50    # Limit to 50 animated cells per update
```

### Complete Change Detection Config

```yaml
data_mode: datasource        # Or template with auto-refresh
layout: timeline
source: sensor.temperature

animation:
  type: cascade              # Cascade + change detection work together
  highlight_changes: true
  change_preset: pulse
  max_highlight_cells: 30
  
  # Cascade colors
  colors:
    start: theme:colors.lcars.blue
    text: theme:colors.lcars.dark-blue
    end: theme:colors.lcars.moonlight
```

---

## Complete Examples

### Decorative LCARS Display

Classic random data cascade for ambiance:

```yaml
type: custom:lcards-data-grid
data_mode: random
format: hex
grid:
  rows: 8
  columns: 12
  gap: 8
font_size: 18
color: theme:colors.lcars.blue
animation:
  type: cascade
  pattern: niagara
  cycle_duration: 6000
  colors:
    start: '#99ccff'
    text: '#4466aa'
    end: '#aaccff'
```

### Live Sensor Status Board

Template-based grid with live entity data:

```yaml
type: custom:lcards-data-grid
data_mode: template
rows:
  - ['SYSTEM', 'VALUE', 'STATUS']
  - ['CPU TEMP', '{{states.sensor.cpu_temperature.state}}°C', '{% if states.sensor.cpu_temperature.state|float > 70 %}HOT{% else %}OK{% endif %}']
  - ['CPU LOAD', '{{states.sensor.cpu_usage.state}}%', '{% if states.sensor.cpu_usage.state|float > 80 %}HIGH{% else %}OK{% endif %}']
  - ['MEMORY', '{{states.sensor.memory_usage.state}}%', '{% if states.sensor.memory_usage.state|float > 90 %}HIGH{% else %}OK{% endif %}']
  - ['DISK', '{{states.sensor.disk_usage.state}}%', '{% if states.sensor.disk_usage.state|float > 85 %}FULL{% else %}OK{% endif %}']
  - ['NETWORK', '{{states.sensor.network_speed.state}} Mbps', 'ACTIVE']
font_size: 16
alignment: left
animation:
  type: cascade
  pattern: fast
  highlight_changes: true
  colors:
    start: theme:colors.lcars.orange
    text: theme:colors.lcars.yellow
    end: theme:colors.lcars.orange
```

### Temperature Timeline

Historical temperature data in timeline layout:

```yaml
type: custom:lcards-data-grid
data_mode: datasource
layout: timeline
source: sensor.outdoor_temperature
grid:
  rows: 6
  columns: 12
  gap: 6
history_hours: 2            # Show last 2 hours
value_template: '{value}°C'
font_size: 14
alignment: center
animation:
  type: cascade
  pattern: default
  highlight_changes: true
  max_highlight_cells: 20
  colors:
    start: '#99ccff'
    text: '#6699cc'
    end: '#99ccff'
```

### Multi-Sensor Spreadsheet

Structured data grid with multiple sources:

```yaml
type: custom:lcards-data-grid
data_mode: datasource
layout: spreadsheet

columns:
  - header: Location
    width: 140
    align: left
  - header: Temp
    width: 80
    align: center
  - header: Humidity
    width: 80
    align: center
  - header: Status
    width: 100
    align: center

rows:
  - sources:
      - type: static
        column: 0
        value: Living Room
      - type: datasource
        column: 1
        source: sensor.living_temperature
        format: '{value}°C'
      - type: datasource
        column: 2
        source: sensor.living_humidity
        format: '{value}%'
      - type: static
        column: 3
        value: NORMAL
  
  - sources:
      - type: static
        column: 0
        value: Bedroom
      - type: datasource
        column: 1
        source: sensor.bedroom_temperature
        format: '{value}°C'
      - type: datasource
        column: 2
        source: sensor.bedroom_humidity
        format: '{value}%'
      - type: static
        column: 3
        value: NORMAL

font_size: 15
animation:
  type: cascade
  highlight_changes: true
  colors:
    start: theme:colors.lcars.blue
    text: theme:colors.lcars.dark-blue
    end: theme:colors.lcars.moonlight
```

### High-Performance Grid with Refresh

Random data with controlled updates:

```yaml
type: custom:lcards-data-grid
data_mode: random
format: mixed
refresh_interval: 2000      # Update every 2 seconds
grid:
  rows: 10
  columns: 15
  gap: 6
font_size: 14
animation:
  type: cascade
  pattern: fast
  cycle_duration: 3000
  highlight_changes: true
  max_highlight_cells: 30   # Limit animations for performance
  colors:
    start: '#99ccff'
    text: '#4466aa'
    end: '#aaccff'
```

---

## Complete Schema Reference

### Top-Level Configuration

```yaml
type: custom:lcards-data-grid

# Data Configuration (required)
data_mode: random | template | datasource

# Grid Layout
grid:
  rows: <number>             # Number of rows (random/template modes)
  columns: <number>          # Number of columns
  gap: <number>              # Gap between cells in px (default: 8)
  cell_width: auto | <number> # Cell width: 'auto' or fixed px

# Visual Styling
font_size: <number>          # Font size in px (default: 18)
font_family: <string>        # Font family (default: Antonio)
font_weight: <number>        # Font weight (default: 400)
color: <color>               # Default text color (hex, theme token, CSS var)
alignment: left | center | right  # Cell text alignment (default: left)

# Animation Configuration
animation:
  type: cascade | none       # Animation type
  pattern: default | niagara | fast | frozen | custom
  cycle_duration: <number>   # Full color cycle duration in ms (default: 5000)
  
  # Cascade Colors
  colors:
    start: <color>           # Starting color
    text: <color>            # Middle color
    end: <color>             # Ending color
  
  # Custom Timing (when pattern: custom)
  timing:
    - duration: <number>     # Duration in ms
      delay: <number>        # Delay in ms
    # ... more rows
  
  # Change Detection
  highlight_changes: <boolean>  # Enable change detection (default: false)
  change_preset: pulse | glow | flash  # Animation preset (default: pulse)
  max_highlight_cells: <number>  # Max cells to animate (default: 50)

# Card Metadata
id: <string>                 # Card identifier for rules/animations
tags: [<string>, ...]        # Tags for rules engine
```

### Random Mode

```yaml
data_mode: random

# Format
format: digit | float | alpha | hex | mixed  # Data format (default: mixed)

# Grid Size (required)
grid:
  rows: <number>
  columns: <number>

# Auto-Refresh
refresh_interval: <number>   # Update interval in ms (0 = disabled)
```

### Template Mode

```yaml
data_mode: template

# Template Rows (required)
rows:
  - [<template>, <template>, ...]  # Row 1
  - [<template>, <template>, ...]  # Row 2
  # ... more rows

# Template Syntax:
# - Static text: 'Label'
# - Entity state: '{{states.sensor.temp.state}}'
# - Entity attribute: '{{states.sensor.temp.attributes.unit}}'
# - Jinja2 expressions: '{% if ... %}...{% endif %}'
```

### DataSource Mode - Timeline Layout

```yaml
data_mode: datasource
layout: timeline

# Data Source (required)
source: <string>             # Entity ID or DataSource name

# Grid Configuration
grid:
  rows: <number>             # Display rows (optional)
  columns: <number>          # Display columns (required)

# History
history_hours: <number>      # Hours of history to preload (default: 1)

# Formatting
value_template: <string>     # Format template (default: '{value}')
                             # Use {value} placeholder
```

### DataSource Mode - Spreadsheet Layout

```yaml
data_mode: datasource
layout: spreadsheet

# Column Definitions (required)
columns:
  - header: <string>         # Column header text
    width: <number>          # Column width in px (optional)
    align: left | center | right  # Header/cell alignment (default: left)

# Row Definitions (required)
rows:
  - sources:                 # Array of cell sources
      - type: static | datasource
        column: <number>     # Column index (0-based)
        
        # For static type:
        value: <any>         # Static value
        
        # For datasource type:
        source: <string>     # DataSource name or entity
        format: <string>     # Format template (default: '{value}')
        aggregation: last | avg | min | max  # Aggregation (default: last)
```

---

## Troubleshooting

### Grid Not Appearing

**Check:**
1. Data mode is specified: `data_mode: random | template | datasource`
2. Required fields for mode are provided:
   - Random: `grid.rows` and `grid.columns`
   - Template: `rows` array
   - DataSource: `source` (timeline) or `columns`+`rows` (spreadsheet)
3. Console for errors (F12)

### Cascade Animation Not Working

**Check:**
1. Animation type is set: `animation.type: cascade`
2. Colors are valid (hex, theme tokens, or CSS vars)
3. AnimationManager is loaded (check console logs)
4. Pattern name is correct: `default`, `niagara`, `fast`, `frozen`, or `custom`

### Template Values Not Updating

**Check:**
1. Entity IDs are correct in templates
2. Entities have recent state changes
3. Template syntax is valid: `{{states.entity_id.state}}`
4. Console for template processing errors

### DataSource Mode Errors

**Check:**
1. DataSource exists or entity ID is valid
2. DataSourceManager is initialized (check console)
3. Source name matches registered DataSource
4. For spreadsheet: column indices match column definitions

### Change Detection Not Working

**Check:**
1. `animation.highlight_changes: true` is set
2. Data is actually changing (check entity history)
3. `max_highlight_cells` isn't limiting animations
4. Mode supports change detection (all modes do)

### Performance Issues

**Solutions:**
1. Reduce grid size: fewer rows/columns
2. Increase `refresh_interval` for random mode
3. Lower `max_highlight_cells` limit
4. Use `pattern: frozen` for static cascade
5. Disable change detection if not needed
6. Reduce `cycle_duration` for faster animations

### Spreadsheet Layout Issues

**Check:**
1. Column indices are 0-based (first column = 0)
2. All columns defined before use in rows
3. Source names match DataSource registry
4. Format templates use `{value}` placeholder

---

## Further Reading

- **Animation System:** See `doc/architecture/animation-system.md`
- **DataSource System:** See LCARdS DataSource documentation  
- **Theme System:** See LCARdS theme system documentation
- **Template Syntax:** Home Assistant template documentation

---

**Version:** 1.9.30
**Last Updated:** December 6, 2024
