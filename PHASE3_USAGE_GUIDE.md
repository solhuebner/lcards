# Phase 3: Transformation and Aggregation Editor - Quick Usage Guide

## Overview

This guide shows how to use the new transformation and aggregation editors in the LCARdS datasource editor.

## Accessing the Editors

1. Open a LCARdS card in edit mode
2. Navigate to the "Data Sources" tab
3. Click "Add Source" or edit an existing datasource
4. Scroll down past the basic entity/timing settings
5. You'll see two new sections:
   - **Transformations** - Process values before use
   - **Aggregations** - Calculate statistics over time windows

## Transformations

Transformations process incoming values before they're used in your card. They execute in the order they're defined.

### Common Use Cases

#### Convert Temperature Units
```yaml
# Example: Convert Celsius to Fahrenheit
transformations:
  fahrenheit:
    type: unit_conversion
    from_unit: celsius
    to_unit: fahrenheit
```

**UI Steps:**
1. Click "Add Transformation"
2. Name: `fahrenheit`
3. Type: "Unit Conversion"
4. From Unit: celsius
5. To Unit: fahrenheit
6. Click "Create"

#### Scale Values
```yaml
# Example: Map 0-100 to 0-255
transformations:
  scaled:
    type: scale
    input_min: 0
    input_max: 100
    output_min: 0
    output_max: 255
```

**UI Steps:**
1. Click "Add Transformation"
2. Name: `scaled`
3. Type: "Scale/Map Range"
4. Input Min: 0
5. Input Max: 100
6. Output Min: 0
7. Output Max: 255
8. Click "Create"

#### Smooth Noisy Data
```yaml
# Example: Apply exponential smoothing
transformations:
  smoothed:
    type: exponential_smoothing
    alpha: 0.3
```

**UI Steps:**
1. Click "Add Transformation"
2. Name: `smoothed`
3. Type: "Exponential Smoothing"
4. Alpha: 0.3 (use slider)
5. Click "Create"

#### Custom Expression
```yaml
# Example: Complex calculation
transformations:
  custom:
    type: expression
    expression: "value * 1.8 + 32"
```

**UI Steps:**
1. Click "Add Transformation"
2. Name: `custom`
3. Type: "Expression (JavaScript)"
4. Expression: `value * 1.8 + 32`
5. Click "Create"

### All Transformation Types

| Type | Description | Use Case |
|------|-------------|----------|
| unit_conversion | Convert between units | Temperature, distance, speed |
| scale | Map input range to output range | Normalize values |
| exponential_smoothing | Reduce noise | Smooth sensor readings |
| moving_average | Average last N points | Smooth data |
| clamp | Limit to min/max | Prevent outliers |
| offset | Add/subtract constant | Adjust baseline |
| multiply | Scale by factor | Unit conversion |
| round | Round to decimals | Clean display |
| delta | Rate of change | Detect changes |
| expression | Custom JavaScript | Complex logic |

### Advanced YAML Mode

For unsupported transformation types or complex configurations:

1. Click "Add Transformation"
2. Select "📝 Advanced (YAML Editor)"
3. Enter YAML configuration directly:

```yaml
type: custom_transform
parameter1: value1
parameter2: value2
```

## Aggregations

Aggregations calculate statistics over time windows. They're useful for trend analysis and smoothing.

### Common Use Cases

#### Calculate Average
```yaml
# Example: Average temperature over 5 minutes
aggregations:
  avg_temp:
    type: avg
    window_seconds: 300
```

**UI Steps:**
1. Click "Add Aggregation"
2. Name: `avg_temp`
3. Type: "Average"
4. Window (seconds): 300
5. Click "Create"

#### Track Peak Values
```yaml
# Example: Maximum in last hour
aggregations:
  peak:
    type: max
    window_seconds: 3600
```

**UI Steps:**
1. Click "Add Aggregation"
2. Name: `peak`
3. Type: "Maximum"
4. Window (seconds): 3600
5. Click "Create"

#### Calculate Rate of Change
```yaml
# Example: Change per minute
aggregations:
  rate:
    type: rate
    window_seconds: 300
    per_unit: minute
```

**UI Steps:**
1. Click "Add Aggregation"
2. Name: `rate`
3. Type: "Rate of Change"
4. Window (seconds): 300
5. Time Unit: "Per Minute"
6. Click "Create"

#### Detect Trends
```yaml
# Example: Rising/falling/stable detection
aggregations:
  trend:
    type: trend
    window_seconds: 300
    threshold: 1.0
```

**UI Steps:**
1. Click "Add Aggregation"
2. Name: `trend`
3. Type: "Trend Detection"
4. Window (seconds): 300
5. Stability Threshold: 1.0
6. Click "Create"

### All Aggregation Types

| Type | Description | Returns |
|------|-------------|---------|
| avg | Moving average | Number |
| min | Minimum value | Number |
| max | Maximum value | Number |
| sum | Total/sum | Number |
| rate | Rate of change | Number |
| trend | Trend detection | 'rising', 'falling', or 'stable' |

## Example: Complete Datasource Configuration

Here's a complete example showing transformations and aggregations working together:

```yaml
data_sources:
  temperature_sensor:
    entity: sensor.outdoor_temp
    window_seconds: 300
    
    transformations:
      # Convert to Fahrenheit
      fahrenheit:
        type: unit_conversion
        from_unit: celsius
        to_unit: fahrenheit
      
      # Smooth the data
      smoothed:
        type: exponential_smoothing
        alpha: 0.3
      
      # Round to 1 decimal
      rounded:
        type: round
        decimals: 1
    
    aggregations:
      # 5-minute average
      avg_5min:
        type: avg
        window_seconds: 300
      
      # Peak in last hour
      max_1hr:
        type: max
        window_seconds: 3600
      
      # Trend detection
      trend:
        type: trend
        window_seconds: 600
        threshold: 0.5
```

### UI Workflow for Above Example

1. Create datasource named "temperature_sensor"
2. Set entity to `sensor.outdoor_temp`
3. Set window_seconds to 300

4. **Add Transformations:**
   - Add "fahrenheit" (unit_conversion: celsius → fahrenheit)
   - Add "smoothed" (exponential_smoothing: alpha 0.3)
   - Add "rounded" (round: 1 decimal)

5. **Add Aggregations:**
   - Add "avg_5min" (avg: 300s window)
   - Add "max_1hr" (max: 3600s window)
   - Add "trend" (trend: 600s window, threshold 0.5)

6. Click "Save" on the datasource dialog

## Tips and Best Practices

### Transformation Order Matters

Transformations are applied in the order they're defined. For best results:

1. **Unit conversions** should come first
2. **Smoothing/averaging** should come next
3. **Scaling/clamping** should follow
4. **Rounding** should be last

### Window Sizes

Choose appropriate window sizes for aggregations:
- **Real-time data**: 30-60 seconds
- **Sensor smoothing**: 2-5 minutes
- **Trend analysis**: 5-15 minutes
- **Historical peaks**: 1-24 hours

### Performance

Each transformation and aggregation has a small performance cost:
- **Keep it simple**: Only add transformations you need
- **Use aggregations wisely**: Don't aggregate everything
- **Test with live data**: Verify performance with actual usage

### Debugging

To debug transformations and aggregations:
1. Check browser console for errors
2. Look at the datasource's current value
3. Test transformations one at a time
4. Use the YAML tab to verify configuration

## Editing and Deleting

### Edit Existing

1. Click the pencil icon on any transformation/aggregation
2. Make your changes
3. Click "Save"

**Note**: You cannot change the name in edit mode. If you need a different name, delete and recreate.

### Delete

1. Click the trash icon on any transformation/aggregation
2. Confirm the deletion
3. Click "Save" on the datasource dialog to persist

### Clear All

To remove all transformations or aggregations:
1. Delete each one individually
2. When you save the datasource, empty sections are automatically removed from the config

## Troubleshooting

### Transformation Not Working

- Check the name is valid (alphanumeric + underscore)
- Verify the type is spelled correctly
- Check all required parameters are filled
- Look for JavaScript console errors

### Aggregation Not Calculating

- Ensure window_seconds is appropriate for your data frequency
- Check that entity is receiving updates
- Verify the datasource's window_seconds is >= aggregation window

### YAML Mode Errors

- Ensure YAML syntax is correct (indentation matters!)
- Verify property names match expected format
- Check for required properties (type is always required)

### Dialog Won't Save

- Check that all required fields are filled (marked with *)
- Verify validation messages (red text)
- Ensure YAML parses correctly if using advanced mode

## Need Help?

- Check the main documentation
- Look at the datasource specification
- Review console logs for errors
- Ask in GitHub discussions

## Summary

The transformation and aggregation editors provide a powerful, user-friendly way to process datasource values:

✅ **10 common transformation types** with declarative forms
✅ **6 aggregation types** for time-series analysis  
✅ **YAML fallback** for advanced configurations
✅ **Visual management** of all transformations/aggregations
✅ **Type-specific forms** with validation
✅ **Integrated** into existing datasource dialog

Happy configuring! 🎉
