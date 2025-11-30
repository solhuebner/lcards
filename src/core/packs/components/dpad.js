/**
 * D-Pad Component Preset
 *
 * Interactive 9-segment D-pad control for media players, remotes, or directional navigation.
 * Provides 4 directional arrows (up/down/left/right), 4 diagonal corners, and center button.
 *
 * Integrates with theme system via component tokens for consistent styling across themes.
 *
 * @module core/packs/components/dpad
 */

/**
 * D-pad component preset configuration
 * @type {Object}
 */
export const dpadComponentPreset = {
    // Component metadata
    id: 'dpad',
    name: 'D-Pad Control',
    description: 'Interactive directional control with 9 segments',
    version: '1.0.0',

    // Shape reference
    shape: 'dpad',

    // Default segment configurations with theme token references
    segments: {
        // Directional arrows
        up: {
            style: {
                fill: 'theme:components.dpad.segment.directional.fill',
                stroke: 'theme:components.dpad.segment.directional.stroke',
                'stroke-width': 'theme:components.dpad.segment.directional.stroke-width',
            }
        },
        down: {
            style: {
                fill: 'theme:components.dpad.segment.directional.fill',
                stroke: 'theme:components.dpad.segment.directional.stroke',
                'stroke-width': 'theme:components.dpad.segment.directional.stroke-width',
            }
        },
        left: {
            style: {
                fill: 'theme:components.dpad.segment.directional.fill',
                stroke: 'theme:components.dpad.segment.directional.stroke',
                'stroke-width': 'theme:components.dpad.segment.directional.stroke-width',
            }
        },
        right: {
            style: {
                fill: 'theme:components.dpad.segment.directional.fill',
                stroke: 'theme:components.dpad.segment.directional.stroke',
                'stroke-width': 'theme:components.dpad.segment.directional.stroke-width',
            }
        },

        // Diagonal corners
        'up-left': {
            style: {
                fill: 'theme:components.dpad.segment.diagonal.fill',
                stroke: 'theme:components.dpad.segment.diagonal.stroke',
                'stroke-width': 'theme:components.dpad.segment.diagonal.stroke-width',
            }
        },
        'up-right': {
            style: {
                fill: 'theme:components.dpad.segment.diagonal.fill',
                stroke: 'theme:components.dpad.segment.diagonal.stroke',
                'stroke-width': 'theme:components.dpad.segment.diagonal.stroke-width',
            }
        },
        'down-left': {
            style: {
                fill: 'theme:components.dpad.segment.diagonal.fill',
                stroke: 'theme:components.dpad.segment.diagonal.stroke',
                'stroke-width': 'theme:components.dpad.segment.diagonal.stroke-width',
            }
        },
        'down-right': {
            style: {
                fill: 'theme:components.dpad.segment.diagonal.fill',
                stroke: 'theme:components.dpad.segment.diagonal.stroke',
                'stroke-width': 'theme:components.dpad.segment.diagonal.stroke-width',
            }
        },

        // Center button
        center: {
            style: {
                fill: 'theme:components.dpad.segment.center.fill',
                stroke: 'theme:components.dpad.segment.center.stroke',
                'stroke-width': 'theme:components.dpad.segment.center.stroke-width',
            }
        },
    },

    // Example usage documentation
    examples: {
        basic: {
            description: 'Basic media player control',
            config: {
                component: 'dpad',
                entity: 'media_player.living_room',
                dpad: {
                    segments: {
                        up: { tap_action: { action: 'call-service', service: 'media_player.volume_up' } },
                        down: { tap_action: { action: 'call-service', service: 'media_player.volume_down' } },
                        left: { tap_action: { action: 'call-service', service: 'media_player.media_previous_track' } },
                        right: { tap_action: { action: 'call-service', service: 'media_player.media_next_track' } },
                        center: { tap_action: { action: 'call-service', service: 'media_player.media_play_pause' } },
                    },
                },
            },
        },
        advanced: {
            description: 'Remote control with full directional navigation',
            config: {
                component: 'dpad',
                entity: 'remote.roku',
                dpad: {
                    segments: {
                        up: { tap_action: { action: 'call-service', service: 'remote.send_command', data: { command: 'up' } } },
                        down: { tap_action: { action: 'call-service', service: 'remote.send_command', data: { command: 'down' } } },
                        left: { tap_action: { action: 'call-service', service: 'remote.send_command', data: { command: 'left' } } },
                        right: { tap_action: { action: 'call-service', service: 'remote.send_command', data: { command: 'right' } } },
                        center: { tap_action: { action: 'call-service', service: 'remote.send_command', data: { command: 'select' } } },
                        'up-left': { tap_action: { action: 'call-service', service: 'remote.send_command', data: { command: 'home' } } },
                        'up-right': { tap_action: { action: 'call-service', service: 'remote.send_command', data: { command: 'back' } } },
                    },
                },
            },
        },
    },
};
