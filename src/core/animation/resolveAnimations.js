/**
 * Legacy animation_ref system removed.
 * Animations are now defined directly on overlays via animations[] array.
 * AnimationManager handles animation processing directly from overlay configs.
 *
 * This file kept as stub to avoid breaking imports.
 */

/**
 * @deprecated Legacy animation_ref system removed
 * @returns {Array} Empty array
 */
export function resolveDesiredAnimations(overlays, animationIndex, ruleAnimations) {
  // Legacy system removed - animations handled by AnimationManager
  return [];
}
