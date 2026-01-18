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
 * @param {Object} options - Resolution options
 * @param {string|null} options.actualState - The actual entity state (e.g., "heat", "cool", "playing")
 * @param {string} options.classifiedState - The classified/mapped state (e.g., "active", "inactive", "unavailable")
 * @param {Object|string} options.colorConfig - The color configuration (can be object with state keys or string)
 * @param {string} [options.fallback] - Optional fallback color value
 * @returns {string|null} The resolved color value or null if not found
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
    // 2. Classified state (e.g., "active", "inactive", "unavailable")
    // 3. Default state
    // 4. Fallback parameter
    return (actualState && colorConfig[actualState]) ||
           colorConfig[classifiedState] ||
           colorConfig.default ||
           fallback;
}

/**
 * Resolve a nested state-based color value (handles deep paths like border.color)
 *
 * @param {Object} options - Resolution options
 * @param {string|null} options.actualState - The actual entity state
 * @param {string} options.classifiedState - The classified/mapped state
 * @param {Object} options.configPath - The config object to navigate (e.g., border.color)
 * @param {string} [options.fallback] - Optional fallback color value
 * @returns {string|null} The resolved color value or null if not found
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
