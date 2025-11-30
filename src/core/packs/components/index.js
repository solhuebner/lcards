/**
 * Component Registry
 *
 * Centralized registry for component presets that combine SVG shapes with
 * segment configurations and theme token references. Components provide
 * reusable UI patterns with consistent theming.
 *
 * @module core/packs/components
 */

import { dpadComponentPreset } from './dpad.js';

/**
 * Component registry mapping component names to their presets
 * @type {Object.<string, Object>}
 */
export const components = {
    dpad: dpadComponentPreset,
};

/**
 * Get a component preset by name
 * @param {string} name - Component name
 * @returns {Object|undefined} Component preset or undefined if not found
 */
export function getComponent(name) {
    return components[name];
}

/**
 * Check if a component exists
 * @param {string} name - Component name
 * @returns {boolean} True if component exists
 */
export function hasComponent(name) {
    return name in components;
}

/**
 * Get all available component names
 * @returns {string[]} Array of component names
 */
export function getComponentNames() {
    return Object.keys(components);
}

/**
 * Get component metadata
 * @param {string} name - Component name
 * @returns {Object|null} Component metadata (id, name, description, version) or null
 */
export function getComponentMetadata(name) {
    const component = components[name];
    if (!component) return null;

    return {
        id: component.id,
        name: component.name,
        description: component.description,
        version: component.version,
    };
}
