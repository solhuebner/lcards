# DataSources Configuration Guide

> **Real-time data processing from Home Assistant entities**
> DataSources connect HA entities to your overlays with powerful processing capabilities.

## Quick Start

```yaml
data_sources:
  temperature:
    entity: sensor.outdoor_temperature
    processing:
      fahrenheit:
        type: convert_unit
        from: c
        to: f
```

Use in overlays:
```yaml
overlays:
  - content: "{temperature.value}°C"        # Raw value
  - content: "{temperature.fahrenheit}°F"   # Processed value
```

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Basic Configuration](#basic-configuration)
3. [Processing Pipeline](#processing-pipeline)
4. [Computed Sources](#computed-sources)
5. [History & Buffering](#history--buffering)
6. [Template Access](#template-access)
7. [Chart Integration](#chart-integration)
8. [Performance Tuning](#performance-tuning)

---

## Core Concepts

### Data Flow

```
Home Assistant Entity
    ↓
Subscribe to changes
    ↓
Buffer recent history
    ↓
Processing Pipeline (optional)
    ↓
Available to overlays/charts
```

**Key Features:**
- ✅ **Real-time updates** - Instant updates when entities change
- ✅ **Historical data** - Load past data for charts and analysis
- ✅ **Processing** - Transform, scale, smooth, aggregate data
- ✅ **Multiple outputs** - One entity → many processed values
- ✅ **Efficient** - Memory-optimized buffering and throttling

### Lifecycle

1. **Card loads** → DataSources created
2. **Subscribe** → Connect to HA entities
3. **Preload history** (optional) → Fill buffer with past data
4. **Process** → Run processing pipeline on each update
5. **Emit** → Provide values to overlays/charts
6. **Card unloads** → Cleanup and unsubscribe

---

## Basic Configuration

### Entity DataSource

```yaml
data_sources:
  temp:
    entity: sensor.temperature
```

### With Attribute

```yaml
data_sources:
  forecast:
    entity: weather.home
    attribute: temperature
```

### Nested Attribute Path

```yaml
data_sources:
  next_hour_temp:
    entity: weather.home
    attribute_path: "forecast[0].temperature"
```

### With History

```yaml
data_sources:
  temp:
    entity: sensor.temperature
    history:
      preload: true
      hours: 24
```

---

## Processing Pipeline

The `processing` field defines a pipeline of processors that transform data. Each processor has a unique name and receives input from either the raw value or another processor.

### Simple Processing

```yaml
data_sources:
  temp:
    entity: sensor.temperature
    processing:
      fahrenheit:
        type: convert_unit
        from: c
        to: f
```

Access: `{temp.fahrenheit}`

### Chained Processing

Processors can depend on other processors using the `from` field:

```yaml
data_sources:
  temp:
    entity: sensor.temperature
    processing:
      # Step 1: Convert to Fahrenheit
      fahrenheit:
        type: convert_unit
        from: c
        to: f

      # Step 2: Scale to comfort index (uses fahrenheit)
      comfort:
        type: scale
        from: fahrenheit
        input_range: [32, 95]
        output_range: [0, 100]

      # Step 3: Smooth the comfort value
      smoothed:
        type: smooth
        from: comfort
        method: exponential
        alpha: 0.3
```

Access:
- `{temp.value}` - Raw °C
- `{temp.fahrenheit}` - °F
- `{temp.comfort}` - Comfort index 0-100
- `{temp.smoothed}` - Smoothed comfort index

### Processor Types

**Data Transformation:**
- `convert_unit` - Unit conversion (temp, power, distance, etc.)
- `scale` - Map input range to output range
- `round` - Round to precision
- `clamp` - Limit to min/max
- `delta` - Change from previous value
- `expression` - Custom JavaScript formula

**Smoothing & Filtering:**
- `smooth` - Exponential or moving average smoothing

**Statistics & Analysis:**
- `statistics` - Calculate min, max, mean, median, std dev
- `rate` - Rate of change over time
- `trend` - Detect increasing/decreasing/stable trends
- `duration` - Track time spent in a condition
- `threshold` - Binary threshold conversion

See [Processor Reference](../reference/datasources/processor-reference.md) for complete documentation.

### Unit Conversion Reference

Quick reference for `convert_unit` processor:

**Temperature:** `c` (Celsius), `f` (Fahrenheit), `k` (Kelvin)
**Power:** `w` (Watts), `kw` (Kilowatts), `mw` (Megawatts)
**Energy:** `wh`, `kwh`, `mwh` (Watt-hours), `j` (Joules)
**Distance:** `mm`, `cm`, `m`, `km` (Metric), `in` (Inches), `ft` (Feet)
**Speed:** `ms` (m/s), `kmh` (km/h), `mph` (Miles/Hour)
**Pressure:** `hpa` (Hectopascals), `bar`, `psi`, `mmhg`
**Data Size:** `b`, `kb`, `mb`, `gb`, `tb` (Bytes)

```yaml
processing:
  fahrenheit:
    type: convert_unit
    from: c
    to: f

  kilowatts:
    type: convert_unit
    from: w
    to: kw
```

### Execution Order

Processors execute in **dependency order**:

1. Processors with no `from` field run first (using raw value)
2. Processors with `from` wait for their dependency
3. Circular dependencies are detected and rejected

```yaml
processing:
  # Runs first (no dependencies)
  celsius:
    type: convert_unit
    from: f
    to: c

  # Runs second (depends on celsius)
  stats:
    type: statistics
    from: celsius
    window: 1h
    stats: [min, max, mean]

  # Also runs second (depends on celsius, parallel with stats)
  smoothed:
    type: smooth
    from: celsius
    method: exponential
```

---

## Computed Sources

Computed sources create virtual DataSources by evaluating JavaScript expressions against one or more Home Assistant entities. Perfect for calculations requiring multiple data sources or custom formulas.

### Basic Computed Source

```yaml
data_sources:
  total_power:
    type: computed
    inputs:
      - sensor.solar_power
      - sensor.grid_power
      - sensor.battery_power
    expression: "inputs[0] + inputs[1] + inputs[2]"

    processing:
      kilowatts:
        type: convert_unit
        from: w
        to: kw
```

Access: `{total_power.value}` (watts), `{total_power.kilowatts}` (kW)

### Expression Context

Available in expressions:

- **`inputs[]`** - Array of input entity values (in order)
- **`states`** - Full Home Assistant states object
- **`hass`** - Complete HASS object for advanced use
- **`Math`** - Full JavaScript Math library (Math.sqrt, Math.pow, etc.)

### Math Library Examples

**Square Root:**
```yaml
data_sources:
  rms_voltage:
    type: computed
    inputs:
      - sensor.voltage_squared
    expression: "Math.sqrt(inputs[0])"
```

**Power Calculation:**
```yaml
data_sources:
  power:
    type: computed
    inputs:
      - sensor.voltage
      - sensor.current
    expression: "Math.pow(inputs[0], 2) / inputs[1]"
```

**Trigonometry:**
```yaml
data_sources:
  wind_component:
    type: computed
    inputs:
      - sensor.wind_speed
      - sensor.wind_direction
    expression: "inputs[0] * Math.cos(inputs[1] * Math.PI / 180)"
```

### Multi-Entity Calculations

**Net Energy Flow:**
```yaml
data_sources:
  net_energy:
    type: computed
    inputs:
      - sensor.solar_production
      - sensor.house_consumption
    expression: "inputs[0] - inputs[1]"

    processing:
      direction:
        type: expression
        formula: "value > 0 ? 'Exporting' : 'Importing'"
```

**Heat Index:**
```yaml
data_sources:
  heat_index:
    type: computed
    inputs:
      - sensor.temperature_f
      - sensor.humidity
    expression: >
      0.5 * (inputs[0] + 61.0 +
        ((inputs[0] - 68.0) * 1.2) +
        (inputs[1] * 0.094))

    processing:
      celsius:
        type: convert_unit
        from: f
        to: c
```

**Energy Cost:**
```yaml
data_sources:
  energy_cost:
    type: computed
    inputs:
      - sensor.power_kwh
      - sensor.electricity_rate
    expression: "inputs[0] * inputs[1]"

    processing:
      formatted:
        type: round
        precision: 2
```

### Conditional Logic

**Ternary Operator:**
```yaml
data_sources:
  comfort_status:
    type: computed
    inputs:
      - sensor.temperature
      - sensor.humidity
    expression: >
      (inputs[0] >= 20 && inputs[0] <= 25 && inputs[1] <= 60)
        ? 100
        : 0
```

**Complex Conditions:**
```yaml
data_sources:
  heating_needed:
    type: computed
    inputs:
      - sensor.indoor_temp
      - sensor.outdoor_temp
      - sensor.time_of_day
    expression: >
      (inputs[0] < 18 && inputs[1] < 10 && inputs[2] >= 6)
        ? 1
        : 0
```

### Accessing Entity Attributes

Use `states` object for attributes:

```yaml
data_sources:
  forecast_temp:
    type: computed
    inputs:
      - weather.home
    expression: "states['weather.home'].attributes.forecast[0].temperature"
```

### Processing on Computed Sources

Computed sources support full processing pipeline:

```yaml
data_sources:
  total_power:
    type: computed
    inputs:
      - sensor.phase1_power
      - sensor.phase2_power
      - sensor.phase3_power
    expression: "inputs[0] + inputs[1] + inputs[2]"

    processing:
      # Convert to kW
      kilowatts:
        type: convert_unit
        from: w
        to: kw

      # Smooth for display
      smoothed:
        type: smooth
        from: kilowatts
        method: exponential
        alpha: 0.2

      # Calculate hourly average
      hourly_avg:
        type: statistics
        from: kilowatts
        window: 3600
        stats: [mean]
```

### History & Buffering

Computed sources buffer their calculated values:

```yaml
data_sources:
  net_power:
    type: computed
    inputs:
      - sensor.solar
      - sensor.grid
    expression: "inputs[0] - inputs[1]"

    history_size: 1000    # Keep 1000 calculated samples
    update_interval: 5    # Recalculate every 5 seconds
```

Use in charts to visualize computed trends over time.

---

## History & Buffering

### Preload History

Load historical data when card initializes:

```yaml
data_sources:
  temp:
    entity: sensor.temperature
    history:
      preload: true
      hours: 24           # Load last 24 hours
```

**Use Cases:**
- Charts showing historical trends
- Statistical analysis on past data
- Initial min/max calculations

### Buffer Configuration

Control how much data is retained:

```yaml
data_sources:
  temp:
    entity: sensor.temperature
    history_size: 1000    # Keep 1000 recent samples (default: 500)
```

**Buffer Behavior:**
- Automatically manages memory
- Oldest values removed when full
- Each processor gets its own buffer (for charts)

### Update Control

Fine-tune update frequency:

```yaml
data_sources:
  temp:
    entity: sensor.temperature
    update_interval: 30   # Minimum 30 seconds between updates
    coalesce_ms: 100      # Batch rapid updates (milliseconds)
    max_delay_ms: 1000    # Maximum delay before forcing update
```

**When to use:**
- High-frequency sensors (updates faster than needed)
- Reduce CPU load from rapid changes
- Smooth out jittery sensors

---

## Template Access

### Basic Access

```yaml
overlays:
  - content: "{datasource_name.value}"        # Raw value
  - content: "{datasource_name.processor_name}"  # Processed value
```

### Metadata

```yaml
overlays:
  - content: "{temp.metadata.friendly_name}"
  - content: "{temp.metadata.unit_of_measurement}"
  - content: "{temp.metadata.last_updated}"
```

### Formatting

```yaml
overlays:
  - content: "{temp.fahrenheit:.1f}°F"        # 1 decimal place
  - content: "{temp.comfort:.0f}%"            # No decimals
```

### Object Results

Some processors return objects:

```yaml
processing:
  stats:
    type: statistics
    window: 1h
    stats: [min, max, mean]
```

Access:
```yaml
overlays:
  - content: "Min: {temp.stats.min:.1f}°C"
  - content: "Max: {temp.stats.max:.1f}°C"
  - content: "Avg: {temp.stats.mean:.1f}°C"
```

---

## Chart Integration

Charts can visualize raw data or any processor output.

### Simple Source

```yaml
type: custom:lcards-chart
data_sources:
  temp:
    entity: sensor.temperature

sources:
  - temp              # Main buffer (raw data)
```

### Processor Buffers

```yaml
type: custom:lcards-chart
data_sources:
  temp:
    entity: sensor.temperature
    processing:
      fahrenheit:
        type: convert_unit
        from: c
        to: f
      smoothed:
        type: smooth
        from: fahrenheit
        method: exponential

sources:
  - temp              # Raw °C
  - temp.fahrenheit   # Converted °F
  - temp.smoothed     # Smoothed °F
```

### Advanced Configuration

```yaml
sources:
  - datasource: temp
    buffer: fahrenheit
    name: "Temperature (°F)"
    type: line

  - datasource: temp
    buffer: smoothed
    name: "Smoothed"
    type: area
```

---

## Performance Tuning

### Minimize Processors

Only create processors you actually use. Each processor:
- Consumes memory (buffer)
- Adds CPU overhead (calculations)
- Increases complexity

**Bad:**
```yaml
processing:
  fahrenheit: {...}
  celsius: {...}      # Not used anywhere
  smoothed: {...}
  smoothed2: {...}    # Duplicate
```

**Good:**
```yaml
processing:
  fahrenheit: {...}   # Used in overlay
  smoothed: {...}     # Used in chart
```

### Use Update Controls

For high-frequency sensors:

```yaml
data_sources:
  battery:
    entity: sensor.battery_voltage
    update_interval: 60     # Only update every 60s
    coalesce_ms: 500        # Batch updates within 500ms
```

### Limit History Size

```yaml
data_sources:
  temp:
    entity: sensor.temperature
    history_size: 100       # Small buffer if not used for charts
```

Default is 500 samples. Reduce if not using historical data.

### Efficient Smoothing

```yaml
processing:
  # Exponential smoothing - lightweight, single value
  smoothed:
    type: smooth
    method: exponential
    alpha: 0.3

  # Moving average - heavier, requires window of samples
  moving_avg:
    type: smooth
    method: moving_average
    window: 10
```

Use exponential for real-time displays, moving average for accurate historical analysis.

---

## Common Patterns

### Temperature Monitoring

```yaml
data_sources:
  outdoor:
    entity: sensor.outdoor_temperature
    history:
      preload: true
      hours: 24
    processing:
      fahrenheit:
        type: convert_unit
        from: c
        to: f
      stats:
        type: statistics
        from: fahrenheit
        window: 24h
        stats: [min, max, mean]
```

### Power Monitoring

```yaml
data_sources:
  power:
    entity: sensor.current_power
    processing:
      kilowatts:
        type: convert_unit
        from: w
        to: kw
      rate:
        type: rate
        from: kilowatts
        unit: per_hour
      smoothed:
        type: smooth
        from: kilowatts
        method: exponential
        alpha: 0.2
```

### Comfort Index

```yaml
data_sources:
  comfort:
    type: computed
    inputs:
      - sensor.temperature
      - sensor.humidity
    expression: "inputs[0] - ((100 - inputs[1]) * 0.5)"
    processing:
      rounded:
        type: round
        precision: 1
      clamped:
        type: clamp
        from: rounded
        min: 0
        max: 100
```

### Motion Detection

```yaml
data_sources:
  motion:
    entity: binary_sensor.motion
    processing:
      duration:
        type: duration
        condition: "== 'on'"
      trend:
        type: trend
        samples: 5
```

---

## Troubleshooting

### DataSource Not Updating

**Check:**
1. Entity ID is correct: `entity: sensor.temperature`
2. Entity exists in Home Assistant
3. Card is loaded (DataSources only active when card visible)

**Debug:**
```javascript
// Browser console
window.lcards.core.dataSourceManager.sources
```

### Processor Not Available

**Check:**
1. Processor name matches exactly (case-sensitive)
2. No circular dependencies (`from` field loops)
3. `from` field references valid processor name

**Example error:**
```yaml
processing:
  smoothed:
    type: smooth
    from: nonexistent    # ❌ No processor named "nonexistent"
```

### Template Not Resolving

**Check:**
1. Template syntax: `{datasource.processor}`
2. DataSource name matches config
3. Processor name matches config

### Performance Issues

**Check:**
1. Too many processors (>10 per datasource)
2. High-frequency updates without throttling
3. Large history buffers (>1000 samples)
4. Complex expressions in `expression` processors

**Solutions:**
- Add `update_interval` to slow down updates
- Reduce `history_size` if not using charts
- Simplify processing pipeline
- Use `coalesce_ms` to batch rapid updates

---

## Next Steps

- **[Processor Reference](../reference/datasources/processor-reference.md)** - Complete list of all 12 processor types
- **[Template Syntax](../reference/templates.md)** - Advanced template usage
- **[Chart Configuration](./charts.md)** - Using DataSources in charts
- **[Rules Engine](./rules.md)** - Conditional styling with DataSources

---

*Last updated: February 2026 | LCARdS v1.12+*
