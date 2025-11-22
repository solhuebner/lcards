# LCARdS Experience Pack System - Implementation Proposal

**Project**: LCARdS - Star Trek LCARS Interface for Home Assistant  
**Feature**: Unified Experience Pack System with Asset Management  
**Date**: 2025-11-11  
**Status**: Proposal for Implementation  

---

## Executive Summary

This proposal introduces a **unified Experience Pack System** that consolidates asset loading (fonts, SVGs, icons) with configuration management (themes, presets, animations) into cohesive, shareable "experience packs". This system builds upon the existing `AssetManager` singleton proposal and creates an orchestration layer that enables:

- ✅ **Complete theme experiences** - One pack loads fonts, SVGs, theme tokens, style presets, and animations
- ✅ **Community ecosystem** - Shareable packs via URL, local files, or builtin
- ✅ **Backward compatibility** - Existing pack system continues to work
- ✅ **Progressive migration** - Incremental adoption without breaking changes
- ✅ **Elegant API** - `loadExperiencePack('lcars_voyager')` loads everything

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Core Components](#2-core-components)
3. [Pack Structure Definition](#3-pack-structure-definition)
4. [Implementation Details](#4-implementation-details)
5. [Integration with Existing Systems](#5-integration-with-existing-systems)
6. [Migration Strategy](#6-migration-strategy)
7. [File Changes Required](#7-file-changes-required)
8. [Implementation Timeline](#8-implementation-timeline)
9. [Testing Strategy](#9-testing-strategy)
10. [Future Enhancements](#10-future-enhancements)

---

## 1. Architecture Overview

### 1.1 Current State Analysis

**Current Asset Loading** (scattered):
```javascript
// lcards.js - Line 163
await loadCoreFonts();  // Legacy font loader

// lcards.js - Line 152
await preloadSVGs(LCARdS.builtin_svg_keys, LCARdS.builtin_svg_basepath);

// lcards-msd.js - Lines 831-887
_handleSvgLoading(msdConfig) {
    // Ad-hoc SVG loading per card
}
```

**Current Config Loading** (organized but separate):
```javascript
// lcards-core.js - Line 135-136
const builtinPacks = loadBuiltinPacks(['core', 'builtin_themes']);
await this.themeManager.initialize(builtinPacks, 'lcars-classic');

// lcards-core.js - Line 162-163
const builtinPacks = loadBuiltinPacks(['core', 'lcards_buttons', 'builtin_themes']);
await this.stylePresetManager.initialize(builtinPacks);
```

**Problem**: Assets and configs are loaded separately, scattered across multiple files, with no unified "experience" concept.

---

### 1.2 Proposed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│               ExperiencePackLoader                          │
│  (Orchestrates complete pack loading)                       │
│                                                              │
│  loadExperiencePack('lcars_voyager') →                     │
│    ├─ Load Assets (AssetManager)                           │
│    │   ├─ Fonts                                            │
│    │   ├─ SVGs                                             │
│    │   └─ Icons                                            │
│    │                                                        │
│    └─ Load Configs (Existing Managers)                     │
│        ├─ Themes → ThemeManager                            │
│        ├─ Presets → StylePresetManager                     │
│        └─ Animations → AnimationManager                    │
└─────────────────────────────────────────────────────────────┘
```

**Key Principles**:
1. **Separation of Concerns**: Assets (files) vs Configs (definitions)
2. **Non-Disruptive**: Works alongside existing systems
3. **Orchestration Layer**: Coordinates loading across managers
4. **Pack-First**: Everything is packaged for easy sharing

---

### 1.3 Singleton Responsibilities (Final)

After analysis, we **DO NOT consolidate singletons**. Each has a clear, distinct purpose:

| Singleton | Responsibility | Keeps Separate? |
|-----------|---------------|-----------------|
| `SystemsManager` | Entity state tracking | ✅ Yes - Different concern |
| `DataSourceManager` | Real-time data updates | ✅ Yes - Different concern |
| `RulesManager` | Business logic evaluation | ✅ Yes - Different concern |
| `ValidationManager` | Config validation | ✅ Yes - Different concern |
| `ThemeManager` | Token/color management | ✅ Yes - Config layer |
| `StylePresetManager` | Style bundle management | ✅ Yes - Config layer |
| `AnimationManager` | Runtime animation execution | ✅ Yes - Execution layer |
| `AnimationRegistry` | Animation caching | ✅ Yes - Performance layer |
| **`AssetManager`** | **File loading (fonts/SVGs/icons)** | ✅ **NEW - Asset layer** |

**Rationale**: Each singleton operates at a different architectural layer. Merging would create a monolithic "god object" that's harder to test, maintain, and extend.

---

## 2. Core Components

### 2.1 ExperiencePackLoader

**Purpose**: Orchestrates complete pack loading across all managers.

**Location**: `src/core/packs/ExperiencePackLoader.js` (NEW FILE)

**Responsibilities**:
- Fetch pack definitions (builtin, URL, local)
- Coordinate asset loading via `AssetManager`
- Coordinate config loading via existing managers
- Track loaded packs and dependencies
- Handle errors and fallbacks

**Key Methods**:
```javascript
class ExperiencePackLoader {
    async loadExperiencePack(packId);
    async unloadExperiencePack(packId);
    async reloadExperiencePack(packId);
    getLoadedPacks();
    isPackLoaded(packId);
}
```

---

### 2.2 Pack Structure

**Two-Tier System**:

```javascript
{
    // ===== METADATA =====
    id: 'lcars_voyager',
    name: 'LCARS Voyager Experience',
    version: '1.0.0',
    author: 'LCARdS Team',
    description: 'Complete Voyager-era LCARS interface',
    
    // ===== DEPENDENCIES (optional) =====
    depends_on: ['builtin:core_assets'],
    
    // ===== ASSETS (Files - loaded by AssetManager) =====
    assets: {
        fonts: [
            {
                name: 'LCARS',
                source: '/hacsfiles/lcards/fonts/LCARS.woff2',
                weight: 400,
                style: 'normal',
                display: 'swap',
                preload: true
            },
            {
                name: 'Voyager Display',
                source: '/hacsfiles/lcards/fonts/VoyagerDisplay.woff2',
                weight: 700,
                style: 'normal'
            }
        ],
        svgs: [
            {
                key: 'voyager_ops',
                source: '/hacsfiles/lcards/msd/voyager_ops.svg',
                preload: true,
                extractAnchors: true
            },
            {
                key: 'voyager_engine',
                source: '/hacsfiles/lcards/msd/voyager_engine.svg',
                preload: false,
                extractAnchors: true
            }
        ],
        icons: []  // Future: icon sprite sheets
    },
    
    // ===== CONFIG (Definitions - loaded by existing managers) =====
    config: {
        // Theme tokens → ThemeManager
        themes: {
            voyager: {
                name: 'Voyager',
                tokens: {
                    colors: {
                        primary: '#cc99ff',
                        secondary: '#9999cc',
                        accent: '#ffcc99',
                        background: '#000000',
                        text: '#ffffff'
                    },
                    fonts: {
                        primary: 'Voyager Display',
                        secondary: 'LCARS',
                        monospace: 'Courier New'
                    },
                    spacing: {
                        small: '8px',
                        medium: '16px',
                        large: '24px'
                    }
                }
            }
        },
        
        // Style presets → StylePresetManager
        presets: {
            button: {
                voyager_rounded: {
                    borderRadius: '20px',
                    padding: '12px 24px',
                    fontFamily: 'var(--font-primary)',
                    backgroundColor: 'var(--color-primary)'
                },
                voyager_pill: {
                    borderRadius: '50px',
                    padding: '10px 30px'
                }
            },
            text: {
                voyager_title: {
                    fontSize: '24px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-primary)',
                    color: 'var(--color-accent)'
                },
                voyager_label: {
                    fontSize: '14px',
                    fontWeight: 400,
                    textTransform: 'uppercase'
                }
            }
        },
        
        // Animation presets → AnimationManager
        animations: {
            voyager_pulse: {
                keyframes: [
                    { opacity: 1 },
                    { opacity: 0.6 },
                    { opacity: 1 }
                ],
                duration: 2000,
                easing: 'linear',
                loop: true
            },
            voyager_slide_in: {
                keyframes: [
                    { translateX: '-100%', opacity: 0 },
                    { translateX: '0%', opacity: 1 }
                ],
                duration: 600,
                easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
            }
        }
    },
    
    // ===== METADATA FOR UI (optional) =====
    preview: {
        screenshot: '/hacsfiles/lcards/previews/voyager.png',
        thumbnail: '/hacsfiles/lcards/previews/voyager_thumb.png',
        demoConfig: {
            type: 'lcards-button',
            preset: 'voyager_rounded',
            label: 'Preview Button'
        }
    }
}
```

---

### 2.3 Pack Source Resolution

**Supported Pack Sources**:

1. **Builtin Packs**: `builtin:pack_name`
   - Located in `src/core/packs/builtin/`
   - Shipped with LCARdS
   - Examples: `builtin:core_assets`, `builtin:lcars_voyager`

2. **Local Packs**: `/local/path/to/pack.json`
   - User-uploaded to Home Assistant
   - JSON format for user-friendliness

3. **URL Packs**: `https://example.com/packs/custom.json`
   - Community-hosted packs
   - CDN-friendly
   - Version management possible

4. **HACSFILES Packs**: `/hacsfiles/lcards/packs/community_pack.json`
   - Installed via HACS
   - Managed by Home Assistant

---

## 3. Pack Structure Definition

### 3.1 Pack Type: Builtin JavaScript

**File**: `src/core/packs/builtin/lcars_voyager.js`

```javascript
/**
 * LCARS Voyager Experience Pack
 * 
 * Complete Voyager-era LCARS interface including fonts, SVGs,
 * theme tokens, style presets, and animation definitions.
 * 
 * @module packs/builtin/lcars_voyager
 */

export default {
    // ===== METADATA =====
    id: 'lcars_voyager',
    name: 'LCARS Voyager Experience',
    version: '1.0.0',
    author: 'LCARdS Team',
    description: 'Complete Voyager-era LCARS interface with custom fonts and MSD templates',
    license: 'MIT',
    homepage: 'https://github.com/snootched/LCARdS',
    
    // ===== DEPENDENCIES =====
    depends_on: [
        'builtin:core_assets'  // Requires base fonts and utilities
    ],
    
    // ===== ASSETS =====
    assets: {
        fonts: [
            {
                name: 'LCARS',
                source: '/hacsfiles/lcards/fonts/LCARS.woff2',
                weight: 400,
                style: 'normal',
                display: 'swap',
                preload: true
            },
            {
                name: 'Voyager Display',
                source: '/hacsfiles/lcards/fonts/VoyagerDisplay.woff2',
                weight: 700,
                style: 'normal',
                display: 'swap',
                preload: true
            },
            {
                name: 'Antonio',
                source: '/hacsfiles/lcards/fonts/Antonio-Bold.woff2',
                weight: 700,
                style: 'normal',
                display: 'swap',
                preload: false
            }
        ],
        
        svgs: [
            {
                key: 'voyager_ops',
                source: '/hacsfiles/lcards/msd/voyager_ops.svg',
                preload: true,
                extractAnchors: true,
                description: 'Voyager Operations MSD'
            },
            {
                key: 'voyager_engine',
                source: '/hacsfiles/lcards/msd/voyager_engine.svg',
                preload: false,
                extractAnchors: true,
                description: 'Voyager Engineering MSD'
            },
            {
                key: 'voyager_tactical',
                source: '/hacsfiles/lcards/msd/voyager_tactical.svg',
                preload: false,
                extractAnchors: true,
                description: 'Voyager Tactical Display'
            }
        ],
        
        icons: [
            // Future: Icon sprite sheets
            // {
            //     name: 'voyager_icons',
            //     source: '/hacsfiles/lcards/icons/voyager-sprite.svg',
            //     preload: true
            // }
        ]
    },
    
    // ===== CONFIGURATION =====
    config: {
        // Theme Tokens (loaded by ThemeManager)
        themes: {
            voyager: {
                name: 'Voyager',
                description: 'Voyager-era LCARS color scheme',
                tokens: {
                    colors: {
                        primary: '#cc99ff',      // Voyager purple
                        secondary: '#9999cc',    // Light purple
                        accent: '#ffcc99',       // Peach accent
                        background: '#000000',   // Black background
                        foreground: '#1a1a2e',   // Dark blue-black
                        text: '#ffffff',         // White text
                        textSecondary: '#cccccc',
                        success: '#99ff99',      // Light green
                        warning: '#ffcc66',      // Amber
                        error: '#ff6666',        // Red
                        info: '#6699ff'          // Blue
                    },
                    fonts: {
                        primary: 'Voyager Display',
                        secondary: 'LCARS',
                        body: 'Antonio',
                        monospace: 'Courier New'
                    },
                    spacing: {
                        xs: '4px',
                        small: '8px',
                        medium: '16px',
                        large: '24px',
                        xl: '32px'
                    },
                    borderRadius: {
                        small: '8px',
                        medium: '16px',
                        large: '24px',
                        pill: '50px'
                    }
                }
            },
            
            voyager_dark: {
                name: 'Voyager Dark',
                description: 'Darker variant for night use',
                tokens: {
                    colors: {
                        primary: '#9966cc',
                        secondary: '#666699',
                        accent: '#cc9966',
                        background: '#000000',
                        foreground: '#0d0d1a',
                        text: '#cccccc',
                        textSecondary: '#999999'
                    },
                    fonts: {
                        primary: 'Voyager Display',
                        secondary: 'LCARS',
                        body: 'Antonio'
                    }
                }
            }
        },
        
        // Style Presets (loaded by StylePresetManager)
        presets: {
            button: {
                voyager_rounded: {
                    name: 'Voyager Rounded Button',
                    borderRadius: '20px',
                    padding: '12px 24px',
                    fontFamily: 'var(--font-primary)',
                    fontSize: '16px',
                    fontWeight: 700,
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-text)',
                    border: '2px solid var(--color-accent)',
                    transition: 'all 0.3s ease'
                },
                
                voyager_pill: {
                    name: 'Voyager Pill Button',
                    borderRadius: '50px',
                    padding: '10px 30px',
                    fontFamily: 'var(--font-primary)',
                    fontSize: '14px',
                    fontWeight: 700,
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-background)'
                },
                
                voyager_rectangle: {
                    name: 'Voyager Rectangle',
                    borderRadius: '8px',
                    padding: '16px 32px',
                    fontFamily: 'var(--font-secondary)',
                    fontSize: '18px',
                    fontWeight: 400
                }
            },
            
            text: {
                voyager_title: {
                    name: 'Voyager Title',
                    fontSize: '28px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-primary)',
                    color: 'var(--color-accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                },
                
                voyager_subtitle: {
                    name: 'Voyager Subtitle',
                    fontSize: '18px',
                    fontWeight: 400,
                    fontFamily: 'var(--font-secondary)',
                    color: 'var(--color-text)',
                    textTransform: 'uppercase'
                },
                
                voyager_label: {
                    name: 'Voyager Label',
                    fontSize: '14px',
                    fontWeight: 400,
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-textSecondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }
            },
            
            overlay: {
                voyager_panel: {
                    name: 'Voyager Panel',
                    backgroundColor: 'var(--color-foreground)',
                    border: '2px solid var(--color-primary)',
                    borderRadius: 'var(--radius-medium)',
                    padding: 'var(--spacing-medium)'
                }
            }
        },
        
        // Animation Presets (loaded by AnimationManager)
        animations: {
            voyager_pulse: {
                name: 'Voyager Pulse',
                description: 'Gentle pulsing animation',
                keyframes: [
                    { opacity: 1, scale: 1 },
                    { opacity: 0.7, scale: 0.98 },
                    { opacity: 1, scale: 1 }
                ],
                duration: 2000,
                easing: 'linear',
                loop: true
            },
            
            voyager_slide_in_left: {
                name: 'Voyager Slide In (Left)',
                keyframes: [
                    { translateX: '-100%', opacity: 0 },
                    { translateX: '0%', opacity: 1 }
                ],
                duration: 600,
                easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
            },
            
            voyager_slide_in_right: {
                name: 'Voyager Slide In (Right)',
                keyframes: [
                    { translateX: '100%', opacity: 0 },
                    { translateX: '0%', opacity: 1 }
                ],
                duration: 600,
                easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)'
            },
            
            voyager_fade_in: {
                name: 'Voyager Fade In',
                keyframes: [
                    { opacity: 0 },
                    { opacity: 1 }
                ],
                duration: 400,
                easing: 'easeInOut'
            },
            
            voyager_glow: {
                name: 'Voyager Glow',
                description: 'LCARS glow effect',
                keyframes: [
                    { filter: 'drop-shadow(0 0 4px var(--color-primary))' },
                    { filter: 'drop-shadow(0 0 12px var(--color-primary))' },
                    { filter: 'drop-shadow(0 0 4px var(--color-primary))' }
                ],
                duration: 1500,
                easing: 'linear',
                loop: true
            }
        }
    },
    
    // ===== PREVIEW/UI METADATA =====
    preview: {
        screenshot: '/hacsfiles/lcards/previews/voyager.png',
        thumbnail: '/hacsfiles/lcards/previews/voyager_thumb.png',
        tags: ['voyager', 'purple', 'lcars', 'official'],
        demoConfig: {
            type: 'lcards-button',
            preset: 'voyager_rounded',
            label: 'Voyager Button',
            theme: 'voyager'
        }
    }
};
```

---

### 3.2 Pack Type: User JSON

**File**: `/local/lcards/packs/my_custom_pack.json`

```json
{
    "id": "user_custom_enterprise",
    "name": "My Custom Enterprise Theme",
    "version": "1.0.0",
    "author": "User",
    "description": "Custom Enterprise-D theme with personal touches",
    
    "depends_on": [
        "builtin:core_assets"
    ],
    
    "assets": {
        "fonts": [
            {
                "name": "Enterprise Display",
                "source": "/local/fonts/EnterpriseDis play.woff2",
                "weight": 700,
                "style": "normal"
            }
        ],
        "svgs": [
            {
                "key": "my_enterprise_msd",
                "source": "/local/svgs/enterprise_custom.svg",
                "extractAnchors": true
            }
        ]
    },
    
    "config": {
        "themes": {
            "my_enterprise": {
                "name": "My Enterprise",
                "tokens": {
                    "colors": {
                        "primary": "#ff9966",
                        "secondary": "#cc6633",
                        "accent": "#ffcc99"
                    }
                }
            }
        },
        "presets": {
            "button": {
                "my_rounded": {
                    "borderRadius": "25px",
                    "backgroundColor": "var(--color-primary)"
                }
            }
        }
    }
}
```

---

## 4. Implementation Details

### 4.1 ExperiencePackLoader Implementation

**File**: `src/core/packs/ExperiencePackLoader.js` (NEW FILE)

```javascript
/**
 * ExperiencePackLoader
 * 
 * Orchestrates loading of complete experience packs including assets
 * (fonts, SVGs, icons) and configs (themes, presets, animations).
 * 
 * Philosophy:
 * - Coordinate across managers (don't duplicate logic)
 * - Support multiple pack sources (builtin, URL, local)
 * - Handle dependencies and versioning
 * - Provide clear error messages
 * 
 * @module core/packs/ExperiencePackLoader
 */

import { lcardsLog } from '../../utils/lcards-logging.js';

export class ExperiencePackLoader {
    /**
     * @param {Object} core - LCARdSCore instance
     */
    constructor(core) {
        this.core = core;
        
        // Track loaded packs
        this.loadedPacks = new Map();      // packId → pack definition
        this.loadOrder = [];               // Array of packIds in load order
        
        // Track errors
        this.loadErrors = new Map();       // packId → error
        
        lcardsLog.debug('[ExperiencePackLoader] Instance created');
    }

    /**
     * Load a complete experience pack
     * 
     * Supports multiple source types:
     * - builtin:pack_name → src/core/packs/builtin/pack_name.js
     * - /local/path.json → Home Assistant local storage
     * - https://url.com/pack.json → Remote URL
     * 
     * @param {string} packId - Pack identifier
     * @param {Object} options - Loading options
     * @returns {Promise<Object>} Loaded pack definition
     */
    async loadExperiencePack(packId, options = {}) {
        try {
            lcardsLog.info(`[ExperiencePackLoader] 📦 Loading experience pack: ${packId}`);

            // Check if already loaded
            if (this.loadedPacks.has(packId) && !options.force) {
                lcardsLog.debug(`[ExperiencePackLoader] Pack already loaded: ${packId}`);
                return this.loadedPacks.get(packId);
            }

            // Fetch pack definition
            const pack = await this._fetchPack(packId);

            // Validate pack structure
            this._validatePack(pack);

            // Load dependencies first
            if (pack.depends_on && Array.isArray(pack.depends_on)) {
                lcardsLog.debug(`[ExperiencePackLoader] Loading ${pack.depends_on.length} dependencies for ${packId}`);
                
                for (const depId of pack.depends_on) {
                    await this.loadExperiencePack(depId);
                }
            }

            // Load assets (fonts, SVGs, icons)
            if (pack.assets) {
                await this._loadAssets(pack);
            }

            // Load configs (themes, presets, animations)
            if (pack.config) {
                await this._loadConfigs(pack);
            }

            // Store loaded pack
            this.loadedPacks.set(packId, pack);
            this.loadOrder.push(packId);

            lcardsLog.info(`[ExperiencePackLoader] ✅ Experience pack loaded: ${packId}`);
            return pack;

        } catch (error) {
            this.loadErrors.set(packId, error);
            lcardsLog.error(`[ExperiencePackLoader] ❌ Failed to load pack ${packId}:`, error);
            throw error;
        }
    }

    /**
     * Fetch pack definition from various sources
     * @private
     */
    async _fetchPack(packId) {
        // Builtin pack: builtin:pack_name
        if (packId.startsWith('builtin:')) {
            return await this._fetchBuiltinPack(packId);
        }

        // URL pack: https://example.com/pack.json
        if (packId.startsWith('http://') || packId.startsWith('https://')) {
            return await this._fetchUrlPack(packId);
        }

        // Local pack: /local/path/pack.json
        if (packId.startsWith('/local/') || packId.startsWith('/hacsfiles/')) {
            return await this._fetchLocalPack(packId);
        }

        throw new Error(`Unknown pack source format: ${packId}`);
    }

    /**
     * Fetch builtin pack (JavaScript module)
     * @private
     */
    async _fetchBuiltinPack(packId) {
        const packName = packId.replace('builtin:', '');
        
        try {
            // Dynamic import from builtin packs
            const module = await import(`./builtin/${packName}.js`);
            const pack = module.default;

            if (!pack) {
                throw new Error(`Builtin pack module does not export default: ${packName}`);
            }

            lcardsLog.debug(`[ExperiencePackLoader] Loaded builtin pack: ${packName}`);
            return pack;

        } catch (error) {
            lcardsLog.error(`[ExperiencePackLoader] Failed to load builtin pack ${packName}:`, error);
            throw new Error(`Builtin pack not found: ${packName}`);
        }
    }

    /**
     * Fetch pack from URL (JSON)
     * @private
     */
    async _fetchUrlPack(url) {
        try {
            lcardsLog.debug(`[ExperiencePackLoader] Fetching pack from URL: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const pack = await response.json();
            
            lcardsLog.debug(`[ExperiencePackLoader] Fetched pack from URL: ${pack.id || 'unknown'}`);
            return pack;

        } catch (error) {
            lcardsLog.error(`[ExperiencePackLoader] Failed to fetch pack from URL ${url}:`, error);
            throw error;
        }
    }

    /**
     * Fetch pack from local file (JSON)
     * @private
     */
    async _fetchLocalPack(path) {
        try {
            lcardsLog.debug(`[ExperiencePackLoader] Fetching pack from local path: ${path}`);
            
            const response = await fetch(path);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const pack = await response.json();
            
            lcardsLog.debug(`[ExperiencePackLoader] Fetched local pack: ${pack.id || 'unknown'}`);
            return pack;

        } catch (error) {
            lcardsLog.error(`[ExperiencePackLoader] Failed to fetch local pack ${path}:`, error);
            throw error;
        }
    }

    /**
     * Validate pack structure
     * @private
     */
    _validatePack(pack) {
        if (!pack.id) {
            throw new Error('Pack missing required field: id');
        }

        if (!pack.name) {
            lcardsLog.warn(`[ExperiencePackLoader] Pack ${pack.id} missing name field`);
        }

        if (!pack.version) {
            lcardsLog.warn(`[ExperiencePackLoader] Pack ${pack.id} missing version field`);
        }

        // Check for assets or config (at least one required)
        if (!pack.assets && !pack.config) {
            throw new Error(`Pack ${pack.id} has no assets or config`);
        }

        lcardsLog.debug(`[ExperiencePackLoader] Pack validation passed: ${pack.id}`);
    }

    /**
     * Load pack assets via AssetManager
     * @private
     */
    async _loadAssets(pack) {
        if (!this.core.assetManager) {
            lcardsLog.warn('[ExperiencePackLoader] AssetManager not available, skipping assets');
            return;
        }

        lcardsLog.debug(`[ExperiencePackLoader] Loading assets for pack: ${pack.id}`);

        try {
            // Build asset pack for AssetManager
            const assetPack = {
                id: pack.id,
                fonts: pack.assets.fonts || [],
                svgs: pack.assets.svgs || [],
                icons: pack.assets.icons || []
            };

            // Load via AssetManager
            await this.core.assetManager.loadPack(assetPack);

            lcardsLog.debug(`[ExperiencePackLoader] Assets loaded for pack: ${pack.id}`);

        } catch (error) {
            lcardsLog.error(`[ExperiencePackLoader] Failed to load assets for pack ${pack.id}:`, error);
            throw error;
        }
    }

    /**
     * Load pack configs via respective managers
     * @private
     */
    async _loadConfigs(pack) {
        lcardsLog.debug(`[ExperiencePackLoader] Loading configs for pack: ${pack.id}`);

        // Load themes
        if (pack.config.themes) {
            await this._loadThemes(pack);
        }

        // Load presets
        if (pack.config.presets) {
            await this._loadPresets(pack);
        }

        // Load animations
        if (pack.config.animations) {
            await this._loadAnimations(pack);
        }

        lcardsLog.debug(`[ExperiencePackLoader] Configs loaded for pack: ${pack.id}`);
    }

    /**
     * Load theme configs via ThemeManager
     * @private
     */
    async _loadThemes(pack) {
        if (!this.core.themeManager) {
            lcardsLog.warn('[ExperiencePackLoader] ThemeManager not available, skipping themes');
            return;
        }

        try {
            lcardsLog.debug(`[ExperiencePackLoader] Loading ${Object.keys(pack.config.themes).length} themes from pack: ${pack.id}`);

            // ThemeManager expects pack format with themes property
            const themePack = {
                id: pack.id,
                themes: pack.config.themes
            };

            // Check if ThemeManager has a method to load themes from pack
            if (typeof this.core.themeManager.loadThemesFromPack === 'function') {
                await this.core.themeManager.loadThemesFromPack(themePack);
            } else {
                // Fallback: Register themes individually
                for (const [themeId, themeDef] of Object.entries(pack.config.themes)) {
                    if (typeof this.core.themeManager.registerTheme === 'function') {
                        this.core.themeManager.registerTheme(themeId, themeDef);
                    }
                }
            }

            lcardsLog.debug(`[ExperiencePackLoader] Themes loaded from pack: ${pack.id}`);

        } catch (error) {
            lcardsLog.error(`[ExperiencePackLoader] Failed to load themes from pack ${pack.id}:`, error);
            // Non-fatal: continue loading other configs
        }
    }

    /**
     * Load preset configs via StylePresetManager
     * @private
     */
    async _loadPresets(pack) {
        if (!this.core.stylePresetManager) {
            lcardsLog.warn('[ExperiencePackLoader] StylePresetManager not available, skipping presets');
            return;
        }

        try {
            lcardsLog.debug(`[ExperiencePackLoader] Loading presets from pack: ${pack.id}`);

            // StylePresetManager expects pack format with presets property
            const presetPack = {
                id: pack.id,
                presets: pack.config.presets
            };

            // Load via StylePresetManager (already supports pack loading)
            // This uses the existing initialize() method
            await this.core.stylePresetManager.loadPresetsFromPack(presetPack);

            lcardsLog.debug(`[ExperiencePackLoader] Presets loaded from pack: ${pack.id}`);

        } catch (error) {
            lcardsLog.error(`[ExperiencePackLoader] Failed to load presets from pack ${pack.id}:`, error);
            // Non-fatal: continue loading other configs
        }
    }

    /**
     * Load animation configs via AnimationManager
     * @private
     */
    async _loadAnimations(pack) {
        if (!this.core.animationManager) {
            lcardsLog.warn('[ExperiencePackLoader] AnimationManager not available, skipping animations');
            return;
        }

        try {
            lcardsLog.debug(`[ExperiencePackLoader] Loading ${Object.keys(pack.config.animations).length} animation presets from pack: ${pack.id}`);

            // Register animation presets with AnimationManager
            for (const [animId, animDef] of Object.entries(pack.config.animations)) {
                if (typeof this.core.animationManager.registerPreset === 'function') {
                    this.core.animationManager.registerPreset(animId, animDef, pack.id);
                }
            }

            lcardsLog.debug(`[ExperiencePackLoader] Animation presets loaded from pack: ${pack.id}`);

        } catch (error) {
            lcardsLog.error(`[ExperiencePackLoader] Failed to load animations from pack ${pack.id}:`, error);
            // Non-fatal: continue loading other configs
        }
    }

    /**
     * Unload an experience pack
     * @param {string} packId - Pack to unload
     */
    async unloadExperiencePack(packId) {
        lcardsLog.info(`[ExperiencePackLoader] Unloading pack: ${packId}`);

        const pack = this.loadedPacks.get(packId);
        
        if (!pack) {
            lcardsLog.warn(`[ExperiencePackLoader] Cannot unload: pack not loaded: ${packId}`);
            return;
        }

        try {
            // Unload assets
            if (pack.assets && this.core.assetManager) {
                await this.core.assetManager.unloadPack(packId);
            }

            // Unload themes
            if (pack.config?.themes && this.core.themeManager) {
                for (const themeId of Object.keys(pack.config.themes)) {
                    if (typeof this.core.themeManager.unregisterTheme === 'function') {
                        this.core.themeManager.unregisterTheme(themeId);
                    }
                }
            }

            // Unload presets
            if (pack.config?.presets && this.core.stylePresetManager) {
                // StylePresetManager may need unload support
                if (typeof this.core.stylePresetManager.unloadPresetPack === 'function') {
                    this.core.stylePresetManager.unloadPresetPack(packId);
                }
            }

            // Unload animations
            if (pack.config?.animations && this.core.animationManager) {
                for (const animId of Object.keys(pack.config.animations)) {
                    if (typeof this.core.animationManager.unregisterPreset === 'function') {
                        this.core.animationManager.unregisterPreset(animId);
                    }
                }
            }

            // Remove from tracking
            this.loadedPacks.delete(packId);
            const orderIndex = this.loadOrder.indexOf(packId);
            if (orderIndex >= 0) {
                this.loadOrder.splice(orderIndex, 1);
            }

            lcardsLog.info(`[ExperiencePackLoader] ✅ Pack unloaded: ${packId}`);

        } catch (error) {
            lcardsLog.error(`[ExperiencePackLoader] Error unloading pack ${packId}:`, error);
            throw error;
        }
    }

    /**
     * Reload a pack (unload then load)
     * @param {string} packId - Pack to reload
     */
    async reloadExperiencePack(packId) {
        lcardsLog.info(`[ExperiencePackLoader] Reloading pack: ${packId}`);
        
        await this.unloadExperiencePack(packId);
        await this.loadExperiencePack(packId, { force: true });
    }

    /**
     * Get all loaded packs
     * @returns {Array<Object>} Array of pack definitions
     */
    getLoadedPacks() {
        return Array.from(this.loadedPacks.values());
    }

    /**
     * Check if pack is loaded
     * @param {string} packId - Pack identifier
     * @returns {boolean}
     */
    isPackLoaded(packId) {
        return this.loadedPacks.has(packId);
    }

    /**
     * Get pack load order
     * @returns {Array<string>} Array of pack IDs in load order
     */
    getLoadOrder() {
        return [...this.loadOrder];
    }

    /**
     * Get pack load errors
     * @returns {Map<string, Error>} Map of packId → error
     */
    getLoadErrors() {
        return new Map(this.loadErrors);
    }

    /**
     * Get debug information
     * @returns {Object}
     */
    getDebugInfo() {
        return {
            loadedPackCount: this.loadedPacks.size,
            loadedPacks: Array.from(this.loadedPacks.keys()),
            loadOrder: this.loadOrder,
            errors: Array.from(this.loadErrors.entries()).map(([id, err]) => ({
                packId: id,
                error: err.message
            }))
        };
    }

    /**
     * Cleanup (destroy)
     */
    destroy() {
        lcardsLog.debug('[ExperiencePackLoader] Destroying...');
        
        this.loadedPacks.clear();
        this.loadOrder = [];
        this.loadErrors.clear();
    }
}
```

---

### 4.2 Builtin Core Assets Pack

**File**: `src/core/assets/packs/builtin-assets-pack.js` (UPDATE)

```javascript
/**
 * Builtin Core Assets Pack
 * 
 * Core fonts and SVGs shipped with LCARdS. This pack is always loaded
 * and provides the base assets needed by all experience packs.
 * 
 * @module core/assets/packs/builtin-assets-pack
 */

export const builtinAssetsPack = {
    id: 'core_assets',
    version: '1.0.0',
    name: 'LCARdS Core Assets',
    description: 'Core fonts and SVG templates for LCARdS - always loaded',
    author: 'LCARdS Team',

    // Core Fonts (required by all themes)
    fonts: [
        {
            name: 'LCARS',
            source: '/hacsfiles/lcards/fonts/LCARS.woff2',
            weight: 400,
            style: 'normal',
            display: 'swap',
            preload: true,
            description: 'Primary LCARS font'
        },
        {
            name: 'Antonio',
            source: '/hacsfiles/lcards/fonts/Antonio-Bold.woff2',
            weight: 700,
            style: 'normal',
            display: 'swap',
            preload: true,
            description: 'Bold variant for headings'
        },
        {
            name: 'Antonio',
            source: '/hacsfiles/lcards/fonts/Antonio-Regular.woff2',
            weight: 400,
            style: 'normal',
            display: 'swap',
            preload: false,
            description: 'Regular variant for body text'
        }
    ],

    // Core SVG Templates (commonly used)
    svgs: [
        {
            key: 'picard_panel',
            source: 'builtin:picard_panel',
            preload: true,
            extractAnchors: true,
            description: 'Picard-era LCARS panel'
        }
        // Additional builtin SVGs can be added here
    ],

    // Icons (future)
    icons: []
};
```

---

### 4.3 Pack Registry

**File**: `src/core/packs/builtin/index.js` (NEW FILE)

```javascript
/**
 * Builtin Pack Registry
 * 
 * Central index of all builtin experience packs.
 * Used by ExperiencePackLoader for `builtin:pack_name` resolution.
 * 
 * @module core/packs/builtin
 */

// Import builtin packs
import lcarsVoyager from './lcars_voyager.js';
import lcarsClassic from './lcars_classic.js';
import lcarsTng from './lcars_tng.js';

/**
 * Registry of all builtin packs
 */
export const builtinPacks = {
    'lcars_voyager': lcarsVoyager,
    'lcars_classic': lcarsClassic,
    'lcars_tng': lcarsTng
};

/**
 * Get a builtin pack by name
 * @param {string} name - Pack name
 * @returns {Object|null} Pack definition or null
 */
export function getBuiltinPack(name) {
    return builtinPacks[name] || null;
}

/**
 * Get all builtin pack names
 * @returns {Array<string>}
 */
export function getBuiltinPackNames() {
    return Object.keys(builtinPacks);
}

/**
 * Check if pack name is builtin
 * @param {string} name - Pack name
 * @returns {boolean}
 */
export function isBuiltinPack(name) {
    return name in builtinPacks;
}
```

---

## 5. Integration with Existing Systems

### 5.1 Update `lcards-core.js`

**File**: `src/core/lcards-core.js`

**Changes Required**:

1. **Add imports** (top of file, ~line 30):
```javascript
// ADD THESE IMPORTS
import { AssetManager } from './assets/AssetManager.js';
import { builtinAssetsPack } from './assets/packs/builtin-assets-pack.js';
import { ExperiencePackLoader } from './packs/ExperiencePackLoader.js';
```

2. **Add singletons to constructor** (~line 56):
```javascript
class LCARdSCore {
    constructor() {
        // ... existing singletons ...
        
        // ADD THESE
        this.assetManager = null;          // Asset loading (fonts, SVGs, icons)
        this.packLoader = null;            // Experience pack orchestration
        
        // ... rest of constructor ...
    }
}
```

3. **Initialize in `_performInitialization()`** (~line 172, after AnimationRegistry):
```javascript
async _performInitialization(hass) {
    try {
        // ... existing initialization (SystemsManager, ThemeManager, etc.) ...

        // Initialize AnimationRegistry (Phase 2b) - ✅ Real MSD AnimationRegistry as singleton
        this.animationRegistry = new AnimationRegistry();
        lcardsLog.debug('[LCARdSCore] ✅ AnimationRegistry initialized');

        // ===== ADD THIS SECTION =====
        // Initialize AssetManager (Phase 2d)
        this.assetManager = new AssetManager();
        await this.assetManager.initialize([builtinAssetsPack]);
        lcardsLog.debug('[LCARdSCore] ✅ AssetManager initialized');

        // Initialize ExperiencePackLoader (Phase 2e)
        this.packLoader = new ExperiencePackLoader(this);
        lcardsLog.debug('[LCARdSCore] ✅ ExperiencePackLoader initialized');

        // Load core experience packs
        await this.packLoader.loadExperiencePack('builtin:core_assets');
        await this.packLoader.loadExperiencePack('builtin:lcars_classic');
        lcardsLog.info('[LCARdSCore] ✅ Core experience packs loaded');
        // ===== END NEW SECTION =====

        // Initialize ActionHandler (Phase 2c) - ✅ Unified action handling for all cards
        this.actionHandler = new LCARdSActionHandler();
        lcardsLog.debug('[LCARdSCore] ✅ ActionHandler initialized');

        // ... rest of initialization ...
    }
}
```

4. **Add to debug info** (~line 400):
```javascript
getDebugInfo() {
    return {
        // ... existing debug info ...
        
        // ADD THESE
        assetManager: this.assetManager ? this.assetManager.getDebugInfo() : null,
        packLoader: this.packLoader ? this.packLoader.getDebugInfo() : null,
        
        // ... rest of debug info ...
    };
}
```

5. **Add to destroy method** (~line 700):
```javascript
destroy() {
    lcardsLog.info('[LCARdSCore] 🚨 Destroying core systems...');

    // ... existing cleanup ...

    // ADD THESE
    if (this.packLoader) {
        this.packLoader.destroy();
        this.packLoader = null;
    }

    if (this.assetManager) {
        this.assetManager.destroy();
        this.assetManager = null;
    }

    // ... rest of cleanup ...
}
```

---

### 5.2 Update `lcards.js` (Main Entry Point)

**File**: `src/lcards.js`

**Changes Required**:

1. **Remove legacy font loading** (lines 163-164):
```javascript
// BEFORE:
// Await font loading if loadCoreFonts is async
await loadCoreFonts();

// AFTER:
// REMOVED - now handled by AssetManager via ExperiencePackLoader
// await loadCoreFonts();
```

2. **Remove legacy SVG preloading** (lines 152-153):
```javascript
// BEFORE:
// Await SVG preload
await preloadSVGs(LCARdS.builtin_svg_keys, LCARdS.builtin_svg_basepath)
    .catch(error => lcardsLog.error('[initializeCustomCard] Error preloading built-in SVGs:', error));

// AFTER:
// REMOVED - now handled by AssetManager via ExperiencePackLoader
// await preloadSVGs(...);
```

3. **Keep legacy functions for backward compatibility** (lines 97-101):
```javascript
// KEEP THESE for backward compatibility (they redirect to AssetManager)
window.lcards.loadFont = loadFont;
window.lcards.loadUserSVG = async function(key, url) {
    return await loadSVGToCache(key, url);
};
window.lcards.getSVGFromCache = getSVGFromCache;
```

---

### 5.3 Update Utility Functions (Fallback Wrappers)

**File**: `src/utils/lcards-theme.js`

**Changes Required**:

```javascript
/**
 * Load a font (redirects to AssetManager if available)
 * @param {string} name - Font family name
 * @param {string} source - Font source URL
 * @param {Object} options - Font options
 * @returns {Promise<FontFace>}
 */
export async function loadFont(name, source, options = {}) {
    // NEW: Use AssetManager if available
    if (window.lcards?.core?.assetManager) {
        lcardsLog.debug(`[loadFont] Using AssetManager for: ${name}`);
        return window.lcards.core.assetManager.loadFont(name, source, options);
    }

    // FALLBACK: Legacy implementation
    lcardsLog.warn(`[loadFont] AssetManager not available, using legacy loader for: ${name}`);
    return loadFontLegacy(name, source, options);
}

/**
 * Legacy font loading (kept for fallback)
 * @private
 */
async function loadFontLegacy(name, source, options = {}) {
    // ... existing implementation ...
    // (keep current loadFont implementation here)
}

// Export legacy loader for testing
export { loadFontLegacy };
```

**File**: `src/utils/lcards-fileutils.js`

**Changes Required**:

```javascript
/**
 * Load SVG to cache (redirects to AssetManager if available)
 * @param {string} key - SVG key
 * @param {string} url - SVG source URL
 * @returns {Promise<string>}
 */
export async function loadSVGToCache(key, url) {
    // NEW: Use AssetManager if available
    if (window.lcards?.core?.assetManager) {
        lcardsLog.debug(`[loadSVGToCache] Using AssetManager for: ${key}`);
        const svgData = await window.lcards.core.assetManager.loadSvg(key, url);
        return svgData.content;
    }

    // FALLBACK: Legacy implementation
    lcardsLog.warn(`[loadSVGToCache] AssetManager not available, using legacy loader for: ${key}`);
    return loadSVGToCacheLegacy(key, url);
}

/**
 * Get SVG from cache (redirects to AssetManager if available)
 * @param {string} key - SVG key
 * @returns {string|null}
 */
export function getSVGFromCache(key) {
    // NEW: Try AssetManager first
    if (window.lcards?.core?.assetManager) {
        const content = window.lcards.core.assetManager.getSvgContent(key);
        if (content) {
            return content;
        }
    }

    // FALLBACK: Legacy cache
    return window.lcards?.assets?.svg_templates?.[key] || null;
}

/**
 * Legacy SVG loading (kept for fallback)
 * @private
 */
async function loadSVGToCacheLegacy(key, url) {
    // ... existing implementation ...
    // (keep current loadSVGToCache implementation here)
}

// Export legacy loader for testing
export { loadSVGToCacheLegacy };
```

---

### 5.4 Update MSD Card SVG Loading

**File**: `src/cards/lcards-msd.js`

**Changes Required** (~line 831):

```javascript
/**
 * Handle SVG loading
 * @private
 */
_handleSvgLoading(msdConfig) {
    if (!msdConfig.base_svg?.source) {
        return;
    }

    lcardsLog.trace('[LCARdSMSDCard] Handling SVG loading:', msdConfig.base_svg.source);

    const source = msdConfig.base_svg.source;

    // ===== ADD THIS SECTION =====
    // NEW: Try AssetManager first
    if (window.lcards?.core?.assetManager) {
        this._handleSvgLoadingViaAssetManager(source, msdConfig);
        return;
    }
    // ===== END NEW SECTION =====

    // FALLBACK: Legacy loading (keep existing implementation)
    let svgKey = null;
    let svgUrl = null;

    if (msdConfig.base_svg.source === 'none') {
        // ... existing "none" handling ...
    } else if (msdConfig.base_svg.source.startsWith('builtin:')) {
        // ... existing builtin handling ...
    } else if (msdConfig.base_svg.source.startsWith('/local/')) {
        // ... existing user SVG handling ...
    }
}

/**
 * Handle SVG loading via AssetManager (NEW METHOD)
 * @private
 */
async _handleSvgLoadingViaAssetManager(source, msdConfig) {
    try {
        lcardsLog.debug('[LCARdSMSDCard] Loading SVG via AssetManager:', source);

        // Determine SVG key
        let svgKey;
        if (source === 'none') {
            // No SVG - process anchors immediately
            this._processAnchors(msdConfig);
            return;
        } else if (source.startsWith('builtin:')) {
            svgKey = source.replace('builtin:', '');
        } else if (source.startsWith('/local/')) {
            svgKey = source.split('/').pop().replace('.svg', '');
        } else {
            svgKey = source;
        }

        // Load via AssetManager
        const svgData = await window.lcards.core.assetManager.loadSvg(
            svgKey,
            source,
            { extractAnchors: true }
        );

        // Use extracted data
        this._viewBox = svgData.viewBox;
        this._anchors = svgData.anchors;
        this._anchorsReady = true;

        lcardsLog.debug('[LCARdSMSDCard] SVG loaded via AssetManager:', {
            key: svgKey,
            viewBox: this._viewBox,
            anchorCount: Object.keys(this._anchors).length
        });

        // Trigger pipeline initialization
        this._tryInitializePipeline();

    } catch (error) {
        lcardsLog.warn('[LCARdSMSDCard] AssetManager load failed, falling back to legacy:', error);
        
        // Fallback to legacy loading
        this._handleSvgLoadingLegacy(source, msdConfig);
    }
}

/**
 * Legacy SVG loading (RENAME existing method)
 * @private
 */
_handleSvgLoadingLegacy(source, msdConfig) {
    // ... existing _handleSvgLoading implementation ...
    // (move current logic here)
}
```

---

### 5.5 Add Pack Loading Methods to Existing Managers

**File**: `src/core/themes/ThemeManager.js`

**Add Method** (~line 200):

```javascript
/**
 * Load themes from experience pack
 * @param {Object} pack - Pack with themes property
 */
async loadThemesFromPack(pack) {
    if (!pack.themes) {
        lcardsLog.warn('[ThemeManager] Pack has no themes');
        return;
    }

    lcardsLog.debug(`[ThemeManager] Loading ${Object.keys(pack.themes).length} themes from pack: ${pack.id}`);

    for (const [themeId, themeDef] of Object.entries(pack.themes)) {
        this.registerTheme(themeId, themeDef);
    }

    lcardsLog.info(`[ThemeManager] Themes loaded from pack: ${pack.id}`);
}

/**
 * Register a single theme
 * @param {string} themeId - Theme identifier
 * @param {Object} themeDef - Theme definition
 */
registerTheme(themeId, themeDef) {
    // Implementation depends on your ThemeManager structure
    // This is a placeholder - adapt to your actual API
    
    if (!this.themes) {
        this.themes = new Map();
    }

    this.themes.set(themeId, themeDef);
    lcardsLog.debug(`[ThemeManager] Theme registered: ${themeId}`);
}

/**
 * Unregister a theme
 * @param {string} themeId - Theme to remove
 */
unregisterTheme(themeId) {
    if (this.themes && this.themes.has(themeId)) {
        this.themes.delete(themeId);
        lcardsLog.debug(`[ThemeManager] Theme unregistered: ${themeId}`);
    }
}
```

**File**: `src/core/presets/StylePresetManager.js`

**Add Method** (~line 250):

```javascript
/**
 * Load presets from experience pack
 * @param {Object} pack - Pack with presets property
 */
async loadPresetsFromPack(pack) {
    if (!pack.presets) {
        lcardsLog.warn('[StylePresetManager] Pack has no presets');
        return;
    }

    lcardsLog.debug(`[StylePresetManager] Loading presets from pack: ${pack.id}`);

    // Merge presets into existing preset structure
    for (const [type, presets] of Object.entries(pack.presets)) {
        for (const [presetName, presetDef] of Object.entries(presets)) {
            this.registerPreset(type, presetName, presetDef, pack.id);
        }
    }

    lcardsLog.info(`[StylePresetManager] Presets loaded from pack: ${pack.id}`);
}

/**
 * Register a single preset
 * @param {string} type - Overlay type (button, text, etc.)
 * @param {string} name - Preset name
 * @param {Object} definition - Preset definition
 * @param {string} packId - Source pack ID
 */
registerPreset(type, name, definition, packId = 'user') {
    // Implementation depends on your StylePresetManager structure
    // This is a placeholder - adapt to your actual API

    if (!this.presetsByType) {
        this.presetsByType = new Map();
    }

    if (!this.presetsByType.has(type)) {
        this.presetsByType.set(type, new Map());
    }

    const typePresets = this.presetsByType.get(type);
    typePresets.set(name, { ...definition, _packId: packId });

    lcardsLog.debug(`[StylePresetManager] Preset registered: ${type}.${name} (from ${packId})`);
}

/**
 * Unload all presets from a pack
 * @param {string} packId - Pack identifier
 */
unloadPresetPack(packId) {
    if (!this.presetsByType) return;

    let removedCount = 0;

    for (const [type, presets] of this.presetsByType.entries()) {
        const toRemove = [];

        for (const [name, preset] of presets.entries()) {
            if (preset._packId === packId) {
                toRemove.push(name);
            }
        }

        toRemove.forEach(name => {
            presets.delete(name);
            removedCount++;
        });
    }

    lcardsLog.debug(`[StylePresetManager] Unloaded ${removedCount} presets from pack: ${packId}`);
