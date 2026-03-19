# Debug API Reference

Developer introspection and debugging tools, accessed via `window.lcards.debug.msd`.

::: tip Discover the API in the console
```javascript
window.lcards.debug.msd.help()           // list all namespaces
window.lcards.debug.msd.help('routing')  // show methods in a namespace
```
:::

---

## Root Methods

### `help([topic])`

Prints all available namespaces (no args) or the methods in a specific namespace.

### `listMsdCards()`

Lists all MSD cards registered with SystemsManager — useful for multi-card dashboards.

```javascript
window.lcards.debug.msd.listMsdCards()
// Returns: [{ id, systemId, hasConfig, hasPipeline, overlayCount, routingChannels, element }]
```

### `core()`

Returns debug info from `window.lcards.core.getDebugInfo()`.

### `singleton(manager)`

Returns debug info from a specific core singleton, e.g. `singleton('dataSourceManager')`.

### `singletons()`

Lists all singleton managers that expose a `getDebugInfo()` method.

---

## Namespaces

All namespace methods are called as `window.lcards.debug.msd.<namespace>.<method>()`.

### `routing` — Routing & resolution

| Method | Description |
|--------|-------------|
| `inspect(guid)` | Inspect routing resolution for an overlay |
| `trace(guid)` | Trace routing path through the resolver |
| `analyze(guid)` | Detailed routing analysis |
| `listActive()` | List all active routing channels |
| `testMatch()` | Test route matching |

```javascript
window.lcards.debug.msd.routing.inspect('my_overlay')
window.lcards.debug.msd.routing.listActive()
```

### `data` — Data context & subscriptions

| Method | Description |
|--------|-------------|
| `context()` | Current data context snapshot |
| `subscriptions()` | All active entity subscriptions |
| `inspect(entityId)` | Inspect a specific entity's data |
| `entities()` | List all tracked entities |
| `trace(entityId)` | Trace data flow for an entity |
| `validate()` | Validate current data context |

```javascript
window.lcards.debug.msd.data.subscriptions()
window.lcards.debug.msd.data.inspect('sensor.cpu_temp')
```

### `styles` — Style computation

| Method | Description |
|--------|-------------|
| `computed(guid)` | Fully computed style for an overlay |
| `effective(guid)` | Effective styles after cascade |
| `overrides(guid)` | Active style overrides |
| `inheritance(guid)` | Style inheritance chain |
| `cascade(guid)` | Full cascade breakdown |
| `validate(guid)` | Validate style config for an overlay |

### `charts` — Chart data processing

| Method | Description |
|--------|-------------|
| `inspect(guid)` | Inspect chart data pipeline for an overlay |
| `trace(guid)` | Trace chart data processing |
| `validate(guid)` | Validate chart configuration |
| `compareSnapshots()` | Compare chart data snapshots |

### `rules` — Rules engine

| Method | Description |
|--------|-------------|
| `listActive(options)` | List currently active rules |
| `trace()` | Trace rule evaluation |
| `validate()` | Validate all rule configurations |

### `animations` — Animation state

| Method | Description |
|--------|-------------|
| `list()` | List all registered animations |
| `inspect(id)` | Inspect animation state for an overlay |
| `control(id, action)` | Control playback: `play`, `pause`, `stop`, `resume` |
| `registry()` | Dump the full animation registry |

```javascript
window.lcards.debug.msd.animations.list()
window.lcards.debug.msd.animations.control('my_overlay', 'pause')
```

### `packs` — Pack management

| Method | Description |
|--------|-------------|
| `list()` | List all registered packs |
| `inspect(packId)` | Inspect a specific pack |
| `compile()` | Trigger pack recompilation |
| `validate()` | Validate all pack configurations |

### `visual` — Visual debugging

| Method | Description |
|--------|-------------|
| `hud()` | Toggle debug HUD overlay |
| `highlight(guid)` | Highlight an overlay visually |
| `inspect(guid)` | Visual inspection of an overlay |
| `snapshot()` | Capture current render snapshot |
| `diff(before, after)` | Diff two snapshots |
| `validate(guid)` | Validate visual output for an overlay |
| `toggleBorders()` | Toggle overlay border visualization |

### `overlays` — Overlay management

| Method | Description |
|--------|-------------|
| `list(filter?)` | List overlays, optionally filtered |
| `inspect(id)` | Full overlay inspection |
| `create()` | Create overlay (debug mode) |
| `update(id, changes)` | Update overlay properties |
| `remove(id)` | Remove overlay |
| `bulkUpdate(selector, changes)` | Update multiple overlays by selector |
| `bulkRemove(selector)` | Remove multiple overlays |
| `bulkApplyTags(selector, tags)` | Apply tags to multiple overlays |
| `validate(id)` | Validate overlay configuration |
| `export(filter?)` | Export overlay configuration |
| `import(data)` | Import overlay configuration |

### `pipeline` — Pipeline lifecycle

| Method | Description |
|--------|-------------|
| `status()` | Current pipeline status |
| `lifecycle()` | Pipeline lifecycle events |
| `trace()` | Trace pipeline execution |
| `rerun()` | Force pipeline re-execution |
| `getInstance()` | Get pipeline instance reference |

```javascript
window.lcards.debug.msd.pipeline.status()
window.lcards.debug.msd.pipeline.rerun()
```

---

## See Also

- [Runtime API](runtime-api.md)
- [Systems Manager](../architecture/subsystems/systems-manager.md)
- [Rules Engine](../architecture/subsystems/rules-engine.md)
- [Animation Manager](../architecture/subsystems/animation-manager.md)
