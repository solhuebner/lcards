/**
 * State-Based Color Resolution Utility
 *
 * Provides consistent logic for resolving state-based colors across all cards.
 * Checks actual entity state first (e.g., "heat", "cool", "playing") before
 * falling back to mapped/classified states (e.g., "active", "inactive").
 *
 * @module utils/state-color-resolver
 */

/**
 * Resolve a state-based color value
 *
 * Automatically resolves computed color tokens (e.g., "darken(var(--lcards-orange), 0.2)")
 * via the ThemeTokenResolver singleton, making computed tokens work seamlessly across all cards.
 *
 * @param {Object} options - Resolution options
 * @param {string|null} options.actualState - The actual entity state (e.g., "heat", "cool", "playing")
 * @param {string} options.classifiedState - The classified/mapped state (e.g., "active", "inactive", "unavailable")
 * @param {Object|string} options.colorConfig - The color configuration (can be object with state keys or string)
 * @param {string|number|null} [options.fallback] - Optional fallback value
 * @returns {string|number|null} The resolved color value or null if not found
 *
 * @example
 * // With actual state "heat" that exists in config
 * resolveStateColor({
 *   actualState: 'heat',
 *   classifiedState: 'inactive',
 *   colorConfig: { heat: '#FF6600', inactive: '#666666', default: '#999999' }
 * });
 * // Returns: '#FF6600'
 *
 * @example
 * // With computed color token
 * resolveStateColor({
 *   actualState: 'on',
 *   classifiedState: 'active',
 *   colorConfig: { active: 'darken(var(--lcards-orange), 0.2)' }
 * });
 * // Returns: 'rgb(204, 102, 0)' (computed color)
 *
 * @example
 * // With actual state "heat" that doesn't exist in config
 * resolveStateColor({
 *   actualState: 'heat',
 *   classifiedState: 'inactive',
 *   colorConfig: { inactive: '#666666', default: '#999999' }
 * });
 * // Returns: '#666666' (falls back to classified state)
 *
 * @example
 * // With plain string config (no state-based colors)
 * resolveStateColor({
 *   actualState: 'heat',
 *   classifiedState: 'inactive',
 *   colorConfig: '#FF9900'
 * });
 * // Returns: '#FF9900'
 */
export function resolveStateColor({ actualState, classifiedState, colorConfig, fallback = null }) {
    // If colorConfig is null/undefined, return fallback
    if (!colorConfig) {
        return fallback;
    }

    // If colorConfig is a plain string (not state-based), return it directly
    if (typeof colorConfig !== 'object') {
        return colorConfig;
    }

    // State-based color object - check in priority order:
    // 1. Actual entity state (e.g., "heat", "cool", "playing")
    // 2. Numeric virtual states: "zero" (state == 0) / "non_zero" (state != 0)
    // 3. Classified state (e.g., "active", "inactive", "unavailable")
    // 4. Default state
    // 5. Fallback parameter
    //
    // NOTE: Use !== undefined throughout to avoid silently skipping falsy color
    // values (e.g., an empty string reset or a future numeric token).
    let resolved;

    // 1. Exact raw state match
    if (actualState != null && colorConfig[actualState] !== undefined) {
        resolved = colorConfig[actualState];
    }

    // 2. Numeric virtual state matching
    if (resolved === undefined) {
        const numericVal = parseFloat(actualState);
        if (!isNaN(numericVal)) {
            if (numericVal === 0 && colorConfig.zero !== undefined) {
                resolved = colorConfig.zero;
            } else if (numericVal !== 0 && colorConfig.non_zero !== undefined) {
                resolved = colorConfig.non_zero;
            }
        }
    }

    // 3. Classified state (active / inactive / unavailable / default)
    if (resolved === undefined && classifiedState != null && colorConfig[classifiedState] !== undefined) {
        resolved = colorConfig[classifiedState];
    }

    // 4. Default / fallback
    if (resolved === undefined) {
        resolved = colorConfig.default !== undefined ? colorConfig.default : fallback;
    }

    // Resolve computed tokens (e.g., "darken(var(--lcards-orange), 0.2)") via ThemeTokenResolver.
    // Skip match-light/match-brightness tokens — these are per-card runtime placeholders that
    // must not be evaluated here; _resolveMatchLightColor() handles them at render time.
    if (resolved && window.lcards?.core?.themeManager?.resolver &&
        !String(resolved).includes('match-light') && !String(resolved).includes('match-brightness')) {
        resolved = window.lcards.core.themeManager.resolver.resolve(resolved, resolved);
    }

    return resolved;
}

/**
 * Resolve a nested state-based color value (handles deep paths like border.color)
 *
 * @param {Object} options - Resolution options
 * @param {string|null} options.actualState - The actual entity state
 * @param {string} options.classifiedState - The classified/mapped state
 * @param {Object} options.configPath - The config object to navigate (e.g., border.color)
 * @param {string|number|null} [options.fallback] - Optional fallback value
 * @returns {string|number|null} The resolved color value or null if not found
 *
 * @example
 * // Resolve border.color with actual state
 * resolveNestedStateColor({
 *   actualState: 'heat',
 *   classifiedState: 'inactive',
 *   configPath: buttonStyle.border.color,
 *   fallback: 'var(--lcars-color-secondary)'
 * });
 */
export function resolveNestedStateColor({ actualState, classifiedState, configPath, fallback = null }) {
    return resolveStateColor({
        actualState,
        classifiedState,
        colorConfig: configPath,
        fallback
    });
}
