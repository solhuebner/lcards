# Intelligent Routing Mode Selection

> **Feature Status**: Production Ready
> **Version**: 1.12.01+
> **Subsystems**: RouterCore, MSD Schema, MSD Studio

---

## Overview

LCARdS now includes intelligent automatic routing mode selection that upgrades lines from simple Manhattan routing (L-shaped, single bend) to smart multi-bend routing when complexity is detected. This eliminates the need for manual `route: smart` configuration in most cases, making channel-based routing more intuitive and accessible.

### Key Benefits

- **Zero Configuration**: Lines with channels automatically use smart routing
- **Global Defaults**: Set routing behavior for entire MSD cards
- **Studio Integration**: Visual workflow for assigning channels to lines
- **Waypoint Channels**: Force routes through specific regions
- **Backward Compatible**: Existing explicit configurations respected
- **Observable**: Full metadata tracking for debugging

---

## Architecture

### Auto-Upgrade Priority Chain

```
1. Explicit `route` field in line config
   ↓ (if not set)
2. Global routing.default_mode setting
   ↓ (if not set or 'auto')
3. Auto-detection:
   - Has route_channels? → smart
   - Has obstacles (not avoid mode)? → smart
   ↓ (if no triggers)
4. Default to manhattan
```

### Performance

- **Overhead**: < 1ms per line (runs once at route request build time)
- **Caching**: Results cached by RouterCore
- **Metrics**: Performance counters track upgrade frequency
  - `routing.mode.auto_upgrade.channels`
  - `routing.mode.auto_upgrade.obstacles`
  - `routing.mode.from_global_default`

---

## Configuration

### Global Routing Defaults

Set default behavior for all lines in your MSD card:

```yaml
type: custom:lcards-msd
msd:
  routing:
    # Default routing mode for all lines
    default_mode: smart  # manhattan | smart | grid | auto

    # Enable/disable automatic upgrades (default: true)
    auto_upgrade_simple_lines: true

    # Other routing settings
    clearance: 8
    smart_proximity: 12
    channel_target_coverage: 0.75
```

#### `default_mode` Options

| Mode | Description | Use When |
|------|-------------|----------|
| `manhattan` | Simple L-shaped paths (1 bend max) | Minimal complexity, fast |
| `smart` | Multi-bend intelligent routing | Channels, obstacles, complex layouts |
| `grid` | A* grid-based pathfinding | High obstacle density |
| `auto` | Let system decide | Same as omitting (uses auto-upgrade) |

#### `auto_upgrade_simple_lines`

- **Default**: `true`
- **Purpose**: Automatically upgrade manhattan → smart when channels or obstacles detected
- **Set to `false`**: Require explicit `route: smart` on each line

### Line Overlay Property Reference

These properties can be set on individual line overlays to control routing behavior:

| Property | Type | Default | Description | Notes |
|----------|------|---------|-------------|-------|
| `route` | string | `'auto'` | Routing mode: `auto`, `manhattan`, `smart`, `grid`, `manual` | Schema-defined field |
| `route_hint` | string | `''` | First segment direction: `xy` (horiz first) or `yx` (vert first) | Direction control |
| `route_hint_last` | string | `''` | Last segment direction: `xy` or `yx` | Direction control |
| `route_channels` | array | `[]` | Channel IDs to route through | Prefer/avoid/force |
| `waypoints` | array | `[]` | Manual waypoints: `[[x1,y1], [x2,y2]]` | Used with `route: manual` |
| `clearance` | number | `0` | Obstacle clearance (pixels) | — |
| `corner_style` | string | `'miter'` | Corner style: `miter`, `round`, `bevel` | Visual styling |
| `corner_radius` | number | `0` | Corner rounding radius (pixels) for `round` style | Visual styling |
| `smoothing_mode` | string | `'none'` | Path smoothing: `none`, `chaikin` | Post-processing |
| `smoothing_iterations` | number | `0` | Number of smoothing passes (1-5) | Post-processing |
| `avoid` | array | `[]` | Overlay IDs to avoid as obstacles | Pathfinding |

**⚠️ Deprecated Properties** (use schema-correct names):
- `route_mode_full` ❌ Use `route` instead
- `route_mode` ❌ Use `route_hint` instead (conflated mode with hint)
- `route_mode_last` ❌ Use `route_hint_last` instead

---

## Usage Examples

### Example 1: Auto-Upgrade with Channels

**Before** (manual configuration required):
```yaml
overlays:
  - id: power_line
    type: line
    anchor: reactor
    attach_to: bridge
    route_channels: [main_corridor]
    route: smart  # ❌ Had to configure manually
    channel_shaping_max_attempts: 20
```

**After** (automatic):
```yaml
overlays:
  - id: power_line
    type: line
    anchor: reactor
    attach_to: bridge
    route_channels: [main_corridor]
    # ✅ Automatically upgrades to smart mode
    # ✅ Uses optimal channel shaping params
```

### Example 2: Global Smart Default

```yaml
msd:
  routing:
    default_mode: smart  # All lines use smart by default
    auto_upgrade_simple_lines: true

  overlays:
    - id: line1
      type: line
      anchor: a1
      attach_to: a2
      # Uses smart mode from global default

    - id: line2
      type: line
      anchor: a3
      attach_to: a4
      route: manhattan  # Override: use manhattan explicitly
```

### Example 3: Waypoint Channels

Force lines to pass through specific regions:

```yaml
msd:
  channels:
    checkpoint_alpha:
      type: waypoint  # ✅ Routes through channel center
      bounds: [450, 200, 200, 150]  # [x, y, width, height]
      priority: 10
      color: "#00FF00"

  overlays:
    - id: power_conduit
      type: line
      anchor: reactor
      attach_to: bridge_console
      route_channels: [checkpoint_alpha]
      route_channel_mode: force  # Must pass through waypoint
```

**How Waypoint Routing Works**:
- **Simple Path**: Creates direct Manhattan-style path: start → waypoint center → end
- **No Grid A\***: Bypasses complex grid pathfinding for predictable results
- **LCARS Style**: Maintains orthogonal (horizontal/vertical only) segments
- **User Friendly**: Predictable behavior without complex multi-bend paths

**When to Use Waypoints**:
- ✅ Routing through specific junction points (e.g., main corridors, access panels)
- ✅ Enforcing visual "flow" through key areas of your display
- ✅ Creating clean, understandable routing that users can predict
- ❌ Avoiding obstacles (use `type: avoiding` instead)
- ❌ Complex pathfinding through dense obstacle fields (use `type: bundling` with smart mode)
        priority: 50

      checkpoint_beta:
        rect: [600, 400, 80, 80]
        type: waypoint
        priority: 50

  overlays:
    - id: critical_conduit
      type: line
      anchor: source
      attach_to: dest
      route_channels: [checkpoint_alpha, checkpoint_beta]
      route_channel_mode: force
      # Line must pass through both waypoints or incur high penalty
```

### Example 4: Disable Auto-Upgrade

```yaml
msd:
  routing:
    auto_upgrade_simple_lines: false  # Disable automatic upgrades

  overlays:
    - id: line1
      type: line
      route_channels: [corridor]
      # No auto-upgrade - stays manhattan
      # Must explicitly set route: smart if wanted
```

---

## Channel Types

### Overview

| Type | Behavior | Mode Support | Penalty | Use Case |
|------|----------|--------------|---------|----------|
| `bundling` | Soft preference | prefer, avoid, force | Reward/penalty based | Group related lines |
| `avoiding` | Soft avoidance | prefer, avoid, force | Penalty if inside | Keep lines clear of areas |
| `waypoint` | **Hard requirement** | force recommended | **High if missed** | Mandatory routing points |

### Bundling Channels (Default)

```yaml
routing:
  channels:
    power_corridor:
      rect: [300, 200, 200, 150]
      type: bundling  # or omit (default)
      priority: 10

overlays:
  - id: power_line
    route_channels: [power_corridor]
    route_channel_mode: prefer  # Rewards routing inside
```

**Behavior**: Routing algorithm rewarded for segments inside channel, penalized for segments outside.

### Waypoint Channels (NEW)

```yaml
routing:
  channels:
    critical_junction:
      rect: [400, 300, 100, 100]
      type: waypoint  # Forces routes through region
      priority: 50

overlays:
  - id: essential_line
    route_channels: [critical_junction]
    route_channel_mode: force
```

**Behavior**:
- Routes that miss waypoint incur **high penalty** (3x base penalty cap)
- Penalty capped to prevent extreme costs while ensuring significance
- Coverage tracked in route metadata

**Penalty Configuration**:
- Cap: 3x base `channel_force_penalty` (default: 800)
- Prevents routes from avoiding waypoints unless alternative is vastly superior
- Still allows fallback if waypoint is geometrically impossible to reach

---

## MSD Studio Workflow

### Smart Channel Assignment

When drawing a channel in MSD Studio:

1. **Draw Channel**: Use "Draw Channel" mode to draw rectangle
2. **Auto-Detection**: Studio automatically detects lines whose bounding boxes intersect
3. **Suggestion Panel**: Channel form shows "Smart Routing Detected" panel
4. **One-Click Assignment**: Click "Route Through (Prefer)" or "Force Through"
5. **Auto-Configuration**: Lines updated with optimal settings:
   - `route_channels: [channel_id]`
   - `route_channel_mode: prefer` or `force`
   - `channel_shaping_max_attempts: 20`
   - `channel_shaping_span: 64`
   - `route: smart` (auto-upgraded by RouterCore)

### Intersection Detection

**Algorithm**: Bounding box approximation for performance

**Accuracy**: May produce false positives (lines whose endpoint bounding boxes overlap channel but routed path doesn't cross). This is acceptable:
- Better to suggest than miss
- Users can skip unwanted suggestions
- Keeps computation fast

**Future Enhancement**: Implement precise line-rectangle intersection using actual routed path coordinates.

---

## Route Metadata

### Debugging with Metadata

Auto-upgraded routes include debugging metadata:

```javascript
// Browser console
const router = document.querySelector('lcards-msd')._msdPipeline.coordinator.router;
const routeInfo = router.inspect('line_id');

console.log(routeInfo.meta);
// {
//   strategy: 'grid-smart-preface',
//   modeAutoUpgraded: true,
//   autoUpgradeReason: 'channels_present',
//   cost: 450,
//   segments: 3,
//   bends: 2,
//   channel: {
//     mode: 'prefer',
//     coverage: 0.87,
//     inside: 245,
//     outside: 35,
//     waypointCoverage: 2,      // NEW
//     waypointTotal: 2,         // NEW
//     missedWaypoints: []       // NEW
//   }
// }
```

### Metadata Fields

- `modeAutoUpgraded`: Boolean indicating if mode was auto-upgraded
- `autoUpgradeReason`: Reason string (`'channels_present'`, `'obstacles_present'`)
- `channel.waypointCoverage`: Number of waypoints with coverage > 0
- `channel.waypointTotal`: Total waypoint channels requested
- `channel.missedWaypoints`: Array of waypoint IDs with no coverage

---

## Debug Tools

### Console Commands

```javascript
// Enable debug logging
window.lcards.setGlobalLogLevel('debug');

// Inspect route
const router = document.querySelector('lcards-msd')._msdPipeline.coordinator.router;
router.inspect('line_id');

// Check router stats
router.stats();

// Invalidate specific route cache
router.invalidate('line_id');

// Invalidate all routes
router.invalidate('*');
```

### Debug Logging

Look for log messages like:

```
[RouterCore] Auto-upgraded route 'power_line' to smart mode (2 channel(s) configured)
[RouterCore] Auto-upgraded route 'data_trunk' to smart mode (5 obstacle(s) detected)
[RouterCore] Route 'critical_line' missed 1 waypoint(s): checkpoint_alpha
[RouterCore] Invalid channel type 'bundling2' for channel 'ch1', defaulting to 'bundling'
```

---

## Migration Guide

### Backward Compatibility

**✅ No Breaking Changes**: All existing configurations work unchanged.

#### Scenarios

**Explicit modes are respected:**
```yaml
overlays:
  - id: line1
    route: manhattan
    route_channels: [corridor]
    # Manhattan mode is honored, no auto-upgrade
```

**No auto-upgrade without triggers:**
```yaml
overlays:
  - id: line2
    type: line
    # No channels, no obstacles → stays manhattan
```

**Auto-upgrade can be disabled:**
```yaml
routing:
  auto_upgrade_simple_lines: false

overlays:
  - id: line3
    route_channels: [corridor]
    # No auto-upgrade
    route: smart  # Must specify explicitly
```

### Migrating from Manual Configuration

**Old Approach**:
```yaml
overlays:
  - id: line1
    route_channels: [ch1]
    route: smart
    channel_shaping_max_attempts: 20
    channel_shaping_span: 64
```

**New Approach** (simplified):
```yaml
overlays:
  - id: line1
    route_channels: [ch1]
    # That's it! Auto-upgraded + optimal defaults
```

**Result**: Same routing behavior, less configuration.

---

## Best Practices

### When to Use Each Mode

| Scenario | Recommended Mode | Why |
|----------|------------------|-----|
| 2-3 simple lines, no channels | `manhattan` | Fast, minimal bends |
| Many lines with channels | `smart` (auto) | Optimal channel coverage |
| High obstacle density | `grid` | Best pathfinding |
| Complex mixed layout | `default_mode: smart` | Covers all cases |

### Channel Configuration Tips

1. **Start with `bundling`**: Most flexible, good default
2. **Use `waypoint` sparingly**: Only for critical routing points
3. **Group related lines**: Assign same channel to related lines
4. **Use Studio workflow**: Visual assignment faster than manual YAML
5. **Test coverage**: Use `router.inspect()` to verify waypoint coverage

### Performance Optimization

- **Auto-upgrade**: Negligible overhead (< 1ms per line)
- **Caching**: Route results cached until invalidation
- **Channel count**: 10-20 channels per MSD is reasonable
- **Obstacle count**: 50+ obstacles → consider `grid` mode

---

## Troubleshooting

### Common Issues

**Issue**: Lines not auto-upgrading to smart mode

**Solutions**:
1. Check `auto_upgrade_simple_lines` is `true` (default)
2. Verify line has `route_channels` or obstacles are present
3. Check if explicit `route_mode_full` is overriding
4. Enable debug logging: `window.lcards.setGlobalLogLevel('debug')`

---

**Issue**: Waypoint coverage always 0

**Solutions**:
1. Verify waypoint bounds are reachable
2. Check `route_channel_mode` is `force` or `prefer`
3. Increase waypoint size (bounding box)
4. Inspect route metadata: `router.inspect('line_id').meta.channel`

---

**Issue**: Studio suggestions for wrong lines

**Solutions**:
1. This is expected (bounding box approximation)
2. Skip unwanted suggestions
3. Manually configure lines if needed
4. Suggestion false positives are harmless

---

## API Reference

### RouterCore

#### `buildRouteRequest(overlay, a1, a2)`

Builds route request with auto-upgrade logic.

**Parameters**:
- `overlay` (Object): Overlay configuration
- `a1` (Array): Start anchor `[x, y]`
- `a2` (Array): End anchor `[x, y]`

**Returns**: Route request object with `modeFull`, `_modeAutoUpgraded`, `_autoUpgradeReason`

---

## Troubleshooting

### Common Config Issues

#### ❌ Invalid property: `route: auto`

**Problem**: Line config has `route: auto` which is not a valid property.

**Solution**: Remove `route: auto`. The system automatically determines routing mode.

```yaml
# ❌ WRONG
overlays:
  - id: line_1
    type: line
    anchor: pn_1_label
    attach_to: scr_nw
    route: auto  # Not a valid property!
    route_channels: [channel_1]

# ✅ CORRECT - Let auto-upgrade handle it
overlays:
  - id: line_1
    type: line
    anchor: pn_1_label
    attach_to: scr_nw
    route_channels: [channel_1]
    # Automatically uses smart mode due to channels

# ✅ CORRECT - Explicit mode if needed
overlays:
  - id: line_1
    type: line
    anchor: pn_1_label
    attach_to: scr_nw
    route: smart
    route_channels: [channel_1]
```

#### ❌ Invalid property: `channel_mode`

**Problem**: UI or old configs use `channel_mode` instead of `route_channel_mode`.

**Solution**: Use correct property name `route_channel_mode`.

```yaml
# ❌ WRONG
overlays:
  - id: line_1
    route_channels: [channel_1]
    channel_mode: force  # Wrong property name

# ✅ CORRECT
overlays:
  - id: line_1
    route_channels: [channel_1]
    route_channel_mode: force  # Correct property name
```

#### Diagonal Lines / Non-Orthogonal Segments

**Problem**: Lines have diagonal segments instead of Manhattan-style (orthogonal) routing.

**Cause**: Grid A* pathfinding creates diagonal segments when snapping actual start/end points to grid-aligned coordinates.

**Solution**: The RouterCore now automatically inserts proper Manhattan elbows after grid snapping (fixed in v1.12.01+). If you still see diagonals:
1. Rebuild your LCARdS installation: `npm run build`
2. Hard refresh browser (Ctrl+Shift+R)
3. If using smoothing, set `smoothing_mode: none` temporarily to verify raw routing

```yaml
overlays:
  - id: line_1
    type: line
    anchor: point_a
    attach_to: point_b
    route_channels: [channel_1]
    smoothing_mode: none  # Disable smoothing to see raw routing
```

#### Too Many Bends / Complex Path Through Waypoint

**Problem**: Line makes many turns when using waypoint channel, instead of simple path through the waypoint.

**Cause**: Prior to v1.12.01+, waypoint channels used grid A* pathfinding which creates complex multi-bend paths.

**Solution**: Update to v1.12.01+ which uses **simple waypoint routing** for `type: waypoint` channels:
- Routes directly through waypoint center
- Manhattan-style (orthogonal only)
- Predictable: start → waypoint center → end

**Expected path with waypoint at (550, 275)**:
```
Start (113, 216)
  → (550, 216)      # Horizontal to waypoint X
  → (550, 275)      # Vertical to waypoint center
  → (1154, 275)     # Horizontal to destination X
  → (1154, 503)     # Vertical to destination
```

If you need complex pathfinding around obstacles, use `type: bundling` instead of `type: waypoint`.

#### Channel Bounding Boxes Not Showing

**Problem**: Channel rectangles don't appear in MSD Studio preview when toggle is enabled.

**Solution**: Use the dedicated "Routing Channels" toggle (chart-timeline icon), not "Show Bounding Boxes" (border-outside icon).
- **Bounding Boxes**: Shows control overlay bounds
- **Routing Channels**: Shows channel regions (distinct toggle)

Both are in the preview toolbar (top-right of preview panel).

---

#### `inspect(overlayId)`

Get route information for debugging.

**Parameters**:
- `overlayId` (String): Overlay identifier

**Returns**: Object with `pts`, `d`, `meta`, or `null` if not found

---

### Schema

#### `routing.default_mode`

- **Type**: String
- **Enum**: `['manhattan', 'smart', 'grid', 'auto']`
- **Default**: `'manhattan'`
- **Description**: Default routing mode for all lines

---

#### `routing.auto_upgrade_simple_lines`

- **Type**: Boolean
- **Default**: `true`
- **Description**: Automatically upgrade manhattan to smart when channels/obstacles detected

---

### Constants

Import from `src/msd/routing/routing-constants.js`:

```javascript
import {
  ROUTING_MODES,
  CHANNEL_TYPES,
  CHANNEL_MODES,
  CHANNEL_SHAPING_DEFAULTS,
  WAYPOINT_CONFIG
} from './msd/routing/routing-constants.js';
```

---

## Related Documentation

- [MSD Routing Architecture](../subsystems/routing.md)
- [Channel-Based Routing Guide](../../user/guides/channel-routing.md)
- [MSD Configuration Studio](../../user/guides/msd-studio.md)
- [Routing Performance](../subsystems/routing-performance.md)

---

*Last Updated: January 22, 2026*
*LCARdS Version: 1.12.01+*
