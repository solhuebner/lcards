# Datasource Timing Fix - v1.9.28

## Problem

SimpleCard was updated to use UnifiedTemplateEvaluator to access MSD datasources (Phase 3 extension). However, datasource templates were showing as literal strings instead of resolving to values.

### Root Cause

**Timing Issue:** SimpleCard renders and processes templates **before** MSD initializes its DataSourceManager.

Timeline from trace.log:
```
Line 482: [UnifiedTemplateEvaluator] Created {hasDataSourceManager: false}
Line 486: [UnifiedTemplateEvaluator] No dataSourceManager available, skipping datasources
Line 676: [LCARdSSimpleCard] Templates processed: {label: '{datasource:temperature_chain:.1f}'}
...
Line 834: [SystemsManager] Initializing DataSourceManager with 14 data sources  ← TOO LATE!
Line 1110: [SystemsManager] ✅ DataSourceManager initialized
```

### Why SimpleCard Didn't Re-render

SimpleCard only re-processes templates when:
1. Config changes
2. **Tracked entities** change

But `{datasource:temperature_chain}` is NOT a tracked entity - it's a composite datasource computed by MSD. So SimpleCard had no way to know it should re-render after DataSourceManager became available.

## Solution

Added retry mechanism in `LCARdSSimpleCard.processTemplate()`:

1. **Detection:** Check if template contains datasource references
2. **Schedule Retry:** If datasources present but DataSourceManager not available, poll for it
3. **Re-process:** When DataSourceManager becomes available, trigger `_scheduleTemplateUpdate()`

### Implementation

```javascript
async processTemplate(template) {
    // ... existing context setup ...

    const dataSourceManager = window.lcards?.debug?.msd?.pipelineInstance?.systemsManager?.dataSourceManager;

    // Check if template has datasource references but manager not available yet
    const hasDatasources = template.includes('{datasource:') || /\{[a-z_]+\.[a-z_]+/.test(template);
    if (hasDatasources && !dataSourceManager) {
        this._scheduleDatasourceRetry();
        lcardsLog.debug('[LCARdSSimpleCard] Datasource template detected but DataSourceManager not ready, will retry');
    }

    // ... continue with evaluation ...
}

_scheduleDatasourceRetry() {
    if (this._datasourceRetryScheduled) return;
    this._datasourceRetryScheduled = true;

    // Poll every 100ms for DataSourceManager
    const checkInterval = setInterval(() => {
        const dataSourceManager = window.lcards?.debug?.msd?.pipelineInstance?.systemsManager?.dataSourceManager;

        if (dataSourceManager) {
            clearInterval(checkInterval);
            this._datasourceRetryScheduled = false;

            lcardsLog.info('[LCARdSSimpleCard] DataSourceManager now available, re-processing templates');
            this._scheduleTemplateUpdate();  // Trigger re-render
        }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => { /* cleanup */ }, 10000);
}
```

## Benefits

1. **Graceful Degradation:** First render shows literal template (harmless)
2. **Automatic Recovery:** Automatically re-renders once MSD loads
3. **No Race Conditions:** Polling ensures we catch DataSourceManager whenever it appears
4. **Timeout Protection:** Won't poll forever if MSD never loads
5. **Single Retry:** Flag prevents multiple retry schedulers

## Testing

### Test Case
```yaml
type: custom:lcards-simple-button-card
label: "{datasource:temperature_chain:.1f}"
```

### Expected Behavior
1. Initial render: Shows `{datasource:temperature_chain:.1f}` (literal)
2. After ~100-200ms: MSD initializes DataSourceManager
3. Automatic re-render: Shows `23.5` (resolved value)

## Files Changed

- `src/base/LCARdSSimpleCard.js`
  - Modified `processTemplate()` to detect datasource templates
  - Added `_scheduleDatasourceRetry()` polling mechanism
  - Version: 1.9.28

## Related Issues

- Phase 3: Unified Template System (0e254bc)
- Phase 3 Extension: SimpleCard datasource access
- User's architecture assumption confirmed: "datasource go into global singleton, so any card should be able to access them"

## Future Improvements

Consider adding an event-based system where MSD broadcasts "DataSourceManager Ready" instead of polling. This would be more efficient and eliminate the 100ms polling interval.

Alternative: Add DataSourceManager reference to global singleton immediately on creation (before initialization), then SimpleCard can subscribe to its "ready" event.
