/**
 * Shared routing constants for MSD system
 * Used by RouterCore, schema definitions, and Studio UI
 */

/**
 * Valid routing modes
 */
export const ROUTING_MODES = {
  MANHATTAN: 'manhattan',
  SMART: 'smart',
  GRID: 'grid',
  AUTO: 'auto'
};

/**
 * Valid channel types
 */
export const CHANNEL_TYPES = {
  BUNDLING: 'bundling',   // Soft preference - rewards routes inside
  AVOIDING: 'avoiding',   // Soft avoidance - penalizes routes inside
  WAYPOINT: 'waypoint'    // Hard requirement - high penalty if missed
};

/**
 * Valid channel modes
 */
export const CHANNEL_MODES = {
  PREFER: 'prefer',  // Soft preference for routing through channel
  AVOID: 'avoid',    // Soft avoidance of channel
  FORCE: 'force'     // Hard requirement - must route through channel
};

/**
 * Default channel shaping parameters
 * These are optimal values for smart routing with channels
 */
export const CHANNEL_SHAPING_DEFAULTS = {
  MAX_ATTEMPTS: 20,  // Maximum refinement attempts for channel shaping
  SPAN: 64,          // Search span for channel shaping adjustments
  TARGET_COVERAGE: 0.75  // Target percentage of route inside channel
};

/**
 * Waypoint penalty configuration
 * Cap at 3x prevents extreme routing costs while ensuring penalty
 * is significant enough to strongly encourage waypoint coverage
 */
export const WAYPOINT_CONFIG = {
  PENALTY_MULTIPLIER_CAP: 3,  // Maximum multiplier for missed waypoints
  MIN_COVERAGE_THRESHOLD: 0.1 // Minimum coverage to count as "hit"
};

/**
 * Get array of valid routing mode strings
 * @returns {Array<string>} Valid routing modes
 */
export function getValidRoutingModes() {
  return Object.values(ROUTING_MODES);
}

/**
 * Get array of valid channel type strings
 * @returns {Array<string>} Valid channel types
 */
export function getValidChannelTypes() {
  return Object.values(CHANNEL_TYPES);
}

/**
 * Get array of valid channel mode strings
 * @returns {Array<string>} Valid channel modes
 */
export function getValidChannelModes() {
  return Object.values(CHANNEL_MODES);
}

/**
 * Check if a routing mode is valid
 * @param {string} mode - Mode to validate
 * @returns {boolean} True if valid
 */
export function isValidRoutingMode(mode) {
  return Object.values(ROUTING_MODES).includes(mode);
}

/**
 * Check if a channel type is valid
 * @param {string} type - Type to validate
 * @returns {boolean} True if valid
 */
export function isValidChannelType(type) {
  return Object.values(CHANNEL_TYPES).includes(type);
}

/**
 * Check if a channel mode is valid
 * @param {string} mode - Mode to validate
 * @returns {boolean} True if valid
 */
export function isValidChannelMode(mode) {
  return Object.values(CHANNEL_MODES).includes(mode);
}
