Excellent forward-thinking question! This is a critical design decision that will shape how flexible the button system becomes. Let me analyze the current state and propose an elegant solution.

---

# Custom SVG Button Shapes - Design Proposal

## Current State Analysis

### Current Button Implementation

Looking at `lcards-simple-button.js`:

```javascript
// Line 310-362: _generateSimpleButtonSVG
_generateSimpleButtonSVG(width, height, config) {
    const cornerRadius = config.preset === 'lozenge' ? 30 :
                        config.preset === 'pill' ? 50 :
                        config.preset === 'rectangle' ? 5 : 20;
    
    // Always uses <rect> with borderRadius
    return `
        <rect
            class="button-bg button-clickable"
            x="${strokeWidth/2}"
            y="${strokeWidth/2}"
            width="${width - strokeWidth}"
            height="${height - strokeWidth}"
            rx="${cornerRadius}"
            ry="${cornerRadius}"
        />
    `;
}
```

**Problem**: Hard-coded to rectangular shapes with rounded corners. No support for custom SVG paths.

---

## Proposed Solution: Shape Definition System

### Architecture Overview

```
Experience Pack
    ├── Assets
    │   ├── Fonts
    │   ├── SVGs (MSD templates)
    │   └── Shapes (NEW - Button shapes) ← NEW CONCEPT
    │
    └── Config
        ├── Themes
        ├── Presets
        │   └── Button Presets (reference shapes)
        └── Animations
```

**Key Insight**: Treat button shapes as **reusable SVG fragments** (like mini-templates), not full SVGs.

---

## 1. Shape Definition Structure

### Shape Pack Format

```javascript
// In experience pack definition
{
    id: 'lcars_voyager',
    
    assets: {
        fonts: [...],
        svgs: [...],  // Full MSD SVGs
        
        // NEW: Button shape definitions
        shapes: [
            {
                id: 'voyager_chevron',
                name: 'Voyager Chevron',
                type: 'button',
                
                // Path definition (viewBox coordinates)
                path: 'M 10,10 L 190,10 L 200,30 L 190,50 L 10,50 L 20,30 Z',
                
                // OR template function for dynamic shapes
                pathTemplate: function(width, height, options) {
                    const chevronDepth = options.chevronDepth || 10;
                    return `M 10,10 L ${width-10},10 L ${width},${height/2} L ${width-10},${height-10} L 10,${height-10} L ${10+chevronDepth},${height/2} Z`;
                },
                
                // Default viewBox for this shape
                viewBox: [0, 0, 200, 60],
                
                // Anchor points for text positioning
                textAnchors: {
                    center: [100, 30],
                    left: [30, 30],
                    right: [170, 30]
                },
                
                // Style hints
                styleHints: {
                    defaultPadding: '12px 24px',
                    textAlign: 'center'
                },
                
                // Metadata
                tags: ['lcars', 'voyager', 'angular'],
                preview: '/hacsfiles/lcards/shapes/previews/chevron.svg'
            },
            
            {
                id: 'picard_trapezoid',
                name: 'Picard Trapezoid',
                type: 'button',
                path: 'M 10,10 L 180,10 L 190,50 L 20,50 Z',
                viewBox: [0, 0, 200, 60],
                textAnchors: {
                    center: [100, 30]
                },
                tags: ['lcars', 'picard', 'angular']
            },
            
            {
                id: 'enterprise_rounded_rect',
                name: 'Enterprise Rounded Rectangle',
                type: 'button',
                
                // Can reference standard shapes with modifiers
                baseShape: 'rect',
                modifiers: {
                    borderRadius: 20,
                    cornerCut: 'top-right'  // Cut specific corner
                },
                viewBox: [0, 0, 200, 60]
            },
            
            {
                id: 'ds9_octagon',
                name: 'DS9 Octagon',
                type: 'button',
                
                // Multi-segment path (can be animated)
                segments: [
                    { id: 'top', path: 'M 50,10 L 150,10' },
                    { id: 'top-right', path: 'L 190,25' },
                    { id: 'right', path: 'L 190,35' },
                    { id: 'bottom-right', path: 'L 150,50' },
                    { id: 'bottom', path: 'L 50,50' },
                    { id: 'bottom-left', path: 'L 10,35' },
                    { id: 'left', path: 'L 10,25' },
                    { id: 'top-left', path: 'Z' }
                ],
                viewBox: [0, 0, 200, 60],
                
                // Segments can be individually styled/animated
                segmentStyles: {
                    'top': { strokeWidth: 2 },
                    'right': { strokeWidth: 3 }
                }
            }
        ]
    },
    
    config: {
        presets: {
            button: {
                voyager_chevron: {
                    name: 'Voyager Chevron Button',
                    shape: 'voyager_chevron',  // ← References shape
                    backgroundColor: 'var(--color-primary)',
                    textColor: 'var(--color-text)',
                    fontSize: '16px'
                },
                
                picard_trapezoid: {
                    name: 'Picard Trapezoid',
                    shape: 'picard_trapezoid',
                    backgroundColor: 'var(--color-accent)'
                }
            }
        }
    }
}
```

---

## 2. ShapeManager Singleton

**New File**: `src/core/shapes/ShapeManager.js`

```javascript
/**
 * ShapeManager
 * 
 * Manages custom SVG button shapes across all experience packs.
 * Provides shape resolution, rendering, and caching.
 * 
 * @module core/shapes/ShapeManager
 */

import { lcardsLog } from '../../utils/lcards-logging.js';

export class ShapeManager {
    constructor() {
        // Shape storage
        this._shapes = new Map();           // shapeId → ShapeDefinition
        this._shapesByPack = new Map();     // packId → Set<shapeId>
        
        // Built-in shapes (always available)
        this._registerBuiltinShapes();
        
        lcardsLog.debug('[ShapeManager] Instance created');
    }

    /**
     * Register built-in shapes (rect, pill, lozenge)
     * @private
     */
    _registerBuiltinShapes() {
        // Rectangle (baseline)
        this.registerShape({
            id: 'rect',
            name: 'Rectangle',
            type: 'button',
            builtin: true,
            pathTemplate: (width, height, options = {}) => {
                const r = options.borderRadius || 5;
                return this._generateRoundedRectPath(width, height, r);
            },
            viewBox: [0, 0, 200, 60],
            textAnchors: { center: [100, 30] }
        });

        // Lozenge (rounded)
        this.registerShape({
            id: 'lozenge',
            name: 'Lozenge',
            type: 'button',
            builtin: true,
            pathTemplate: (width, height) => {
                return this._generateRoundedRectPath(width, height, 30);
            },
            viewBox: [0, 0, 200, 60],
            textAnchors: { center: [100, 30] }
        });

        // Pill (full round)
        this.registerShape({
            id: 'pill',
            name: 'Pill',
            type: 'button',
            builtin: true,
            pathTemplate: (width, height) => {
                return this._generateRoundedRectPath(width, height, height / 2);
            },
            viewBox: [0, 0, 200, 60],
            textAnchors: { center: [100, 30] }
        });

        lcardsLog.debug('[ShapeManager] Built-in shapes registered');
    }

    /**
     * Generate rounded rectangle path
     * @private
     */
    _generateRoundedRectPath(width, height, radius) {
        const r = Math.min(radius, width / 2, height / 2);
        
        return `
            M ${r},0
            L ${width - r},0
            Q ${width},0 ${width},${r}
            L ${width},${height - r}
            Q ${width},${height} ${width - r},${height}
            L ${r},${height}
            Q 0,${height} 0,${height - r}
            L 0,${r}
            Q 0,0 ${r},0
            Z
        `.trim();
    }

    /**
     * Register a shape definition
     * @param {Object} shapeDef - Shape definition
     * @param {string} packId - Source pack (optional)
     */
    registerShape(shapeDef, packId = null) {
        if (!shapeDef.id) {
            throw new Error('Shape definition must have an id');
        }

        // Validate shape
        if (!shapeDef.path && !shapeDef.pathTemplate && !shapeDef.segments) {
            throw new Error(`Shape ${shapeDef.id} must have path, pathTemplate, or segments`);
        }

        // Store shape
        this._shapes.set(shapeDef.id, {
            ...shapeDef,
            _packId: packId
        });

        // Track by pack
        if (packId) {
            if (!this._shapesByPack.has(packId)) {
                this._shapesByPack.set(packId, new Set());
            }
            this._shapesByPack.get(packId).add(shapeDef.id);
        }

        lcardsLog.debug(`[ShapeManager] Shape registered: ${shapeDef.id}${packId ? ` (from ${packId})` : ''}`);
    }

    /**
     * Load shapes from pack
     * @param {Object} pack - Pack with shapes array
     */
    loadShapesFromPack(pack) {
        if (!pack.shapes || !Array.isArray(pack.shapes)) {
            return;
        }

        lcardsLog.debug(`[ShapeManager] Loading ${pack.shapes.length} shapes from pack: ${pack.id}`);

        for (const shapeDef of pack.shapes) {
            this.registerShape(shapeDef, pack.id);
        }

        lcardsLog.info(`[ShapeManager] Shapes loaded from pack: ${pack.id}`);
    }

    /**
     * Get shape definition
     * @param {string} shapeId - Shape identifier
     * @returns {Object|null}
     */
    getShape(shapeId) {
        return this._shapes.get(shapeId) || null;
    }

    /**
     * Render shape to SVG path
     * @param {string} shapeId - Shape identifier
     * @param {number} width - Button width
     * @param {number} height - Button height
     * @param {Object} options - Additional options
     * @returns {string} SVG path data
     */
    renderShape(shapeId, width, height, options = {}) {
        const shape = this.getShape(shapeId);
        
        if (!shape) {
            lcardsLog.warn(`[ShapeManager] Shape not found: ${shapeId}, using rect`);
            return this.renderShape('rect', width, height, options);
        }

        // Static path
        if (shape.path) {
            return this._scalePath(shape.path, shape.viewBox, [0, 0, width, height]);
        }

        // Dynamic path template
        if (shape.pathTemplate && typeof shape.pathTemplate === 'function') {
            return shape.pathTemplate(width, height, options);
        }

        // Multi-segment path
        if (shape.segments && Array.isArray(shape.segments)) {
            return this._renderSegmentedShape(shape.segments, width, height, options);
        }

        lcardsLog.error(`[ShapeManager] Shape ${shapeId} has invalid definition`);
        return this.renderShape('rect', width, height, options);
    }

    /**
     * Scale SVG path from one viewBox to another
     * @private
     */
    _scalePath(path, fromViewBox, toViewBox) {
        const [fx, fy, fw, fh] = fromViewBox;
        const [tx, ty, tw, th] = toViewBox;

        const scaleX = tw / fw;
        const scaleY = th / fh;

        // Simple scaling (could be enhanced with proper SVG path parsing)
        // For production, consider using a library like svg-path-parser
        return path;  // Placeholder - implement proper scaling
    }

    /**
     * Render segmented shape
     * @private
     */
    _renderSegmentedShape(segments, width, height, options) {
        return segments.map(seg => seg.path).join(' ');
    }

    /**
     * Get text anchor point for shape
     * @param {string} shapeId - Shape identifier
     * @param {string} position - 'center', 'left', 'right', etc.
     * @param {number} width - Button width
     * @param {number} height - Button height
     * @returns {Array<number>} [x, y] coordinates
     */
    getTextAnchor(shapeId, position = 'center', width, height) {
        const shape = this.getShape(shapeId);
        
        if (!shape || !shape.textAnchors || !shape.textAnchors[position]) {
            // Default: center
            return [width / 2, height / 2];
        }

        const [anchorX, anchorY] = shape.textAnchors[position];
        const [vx, vy, vw, vh] = shape.viewBox || [0, 0, 200, 60];

        // Scale anchor to actual dimensions
        const x = (anchorX / vw) * width;
        const y = (anchorY / vh) * height;

        return [x, y];
    }

    /**
     * Get all shapes (optionally filtered)
     * @param {Object} filter - Filter options
     * @returns {Array<Object>}
     */
    getShapes(filter = {}) {
        let shapes = Array.from(this._shapes.values());

        if (filter.type) {
            shapes = shapes.filter(s => s.type === filter.type);
        }

        if (filter.tags) {
            const filterTags = Array.isArray(filter.tags) ? filter.tags : [filter.tags];
            shapes = shapes.filter(s => 
                s.tags && filterTags.some(tag => s.tags.includes(tag))
            );
        }

        if (filter.packId) {
            shapes = shapes.filter(s => s._packId === filter.packId);
        }

        return shapes;
    }

    /**
     * Unload shapes from pack
     * @param {string} packId - Pack identifier
     */
    unloadShapesFromPack(packId) {
        const shapeIds = this._shapesByPack.get(packId);
        
        if (!shapeIds) {
            return;
        }

        let count = 0;
        for (const shapeId of shapeIds) {
            this._shapes.delete(shapeId);
            count++;
        }

        this._shapesByPack.delete(packId);

        lcardsLog.debug(`[ShapeManager] Unloaded ${count} shapes from pack: ${packId}`);
    }

    /**
     * Get debug info
     * @returns {Object}
     */
    getDebugInfo() {
        return {
            totalShapes: this._shapes.size,
            builtinShapes: Array.from(this._shapes.values()).filter(s => s.builtin).length,
            customShapes: Array.from(this._shapes.values()).filter(s => !s.builtin).length,
            shapesByPack: Object.fromEntries(
                Array.from(this._shapesByPack.entries()).map(([pack, shapes]) => 
                    [pack, shapes.size]
                )
            ),
            availableShapes: Array.from(this._shapes.keys())
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        this._shapes.clear();
        this._shapesByPack.clear();
        lcardsLog.debug('[ShapeManager] Destroyed');
    }
}
```

---

## 3. Update Button Card to Support Shapes

**File**: `src/cards/lcards-simple-button.js`

**Changes Required**:

```javascript
/**
 * Generate button SVG markup (UPDATED to support custom shapes)
 * @private
 */
_generateSimpleButtonSVG(width, height, config) {
    const primary = this._buttonStyle?.primary || 'var(--lcars-orange, #FF9900)';
    const textColor = this._buttonStyle?.textColor || 'var(--lcars-color-text, #FFFFFF)';
    const strokeWidth = 2;
    const text = config.label || 'Button';

    // NEW: Get shape from ShapeManager
    const shapeManager = this._singletons?.shapeManager;
    const shapeId = this._buttonStyle?.shape || config.shape || 'lozenge';
    
    let shapePath;
    let textAnchor;

    if (shapeManager) {
        // Render custom shape
        shapePath = shapeManager.renderShape(shapeId, width, height, {
            borderRadius: this._buttonStyle?.borderRadius,
            ...this._buttonStyle?.shapeOptions
        });

        // Get text anchor point
        const textPosition = this._buttonStyle?.textAlign || 'center';
        textAnchor = shapeManager.getTextAnchor(shapeId, textPosition, width, height);

        lcardsLog.debug(`[LCARdSSimpleButtonCard] Using shape: ${shapeId}`, { shapePath, textAnchor });
    } else {
        // FALLBACK: Legacy rect-based rendering
        const cornerRadius = config.preset === 'lozenge' ? 30 :
                            config.preset === 'pill' ? 50 :
                            config.preset === 'rectangle' ? 5 : 20;

        shapePath = `M ${cornerRadius},0 L ${width-cornerRadius},0 
                     Q ${width},0 ${width},${cornerRadius} 
                     L ${width},${height-cornerRadius} 
                     Q ${width},${height} ${width-cornerRadius},${height} 
                     L ${cornerRadius},${height} 
                     Q 0,${height} 0,${height-cornerRadius} 
                     L 0,${cornerRadius} Q 0,0 ${cornerRadius},0 Z`;
        
        textAnchor = [width / 2, height / 2];
    }

    const [textX, textY] = textAnchor;

    return `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <style>
                    .button-bg {
                        fill: ${primary};
                        stroke: var(--lcars-color-secondary, #000000);
                        stroke-width: ${strokeWidth};
                    }
                    .button-text {
                        fill: ${textColor};
                        font-family: 'LCARS', 'Antonio', sans-serif;
                        font-size: 14px;
                        font-weight: bold;
                        text-anchor: middle;
                        dominant-baseline: central;
                    }
                </style>
            </defs>

            <g data-button-id="simple-button"
               data-overlay-id="simple-button"
               class="button-group">
                
                <!-- Custom shape path -->
                <path
                    class="button-bg button-clickable"
                    d="${shapePath}"
                />

                <!-- Text at shape-specific anchor point -->
                <text
                    class="button-text"
                    x="${textX}"
                    y="${textY}">
                    ${this._escapeXML(text)}
                </text>
            </g>
        </svg>
    `.trim();
}
```

---

## 4. Integration with Experience Packs

### Update ExperiencePackLoader

**File**: `src/core/packs/ExperiencePackLoader.js`

**Add to `_loadAssets()` method** (~line 200):

```javascript
/**
 * Load pack assets via AssetManager and ShapeManager
 * @private
 */
async _loadAssets(pack) {
    // ... existing font/SVG loading ...

    // NEW: Load shapes via ShapeManager
    if (pack.assets.shapes && this.core.shapeManager) {
        lcardsLog.debug(`[ExperiencePackLoader] Loading shapes for pack: ${pack.id}`);
        this.core.shapeManager.loadShapesFromPack(pack);
    }

    lcardsLog.debug(`[ExperiencePackLoader] Assets loaded for pack: ${pack.id}`);
}
```

### Update LCARdSCore

**File**: `src/core/lcards-core.js`

**Add ShapeManager** (~line 56):

```javascript
import { ShapeManager } from './shapes/ShapeManager.js';

class LCARdSCore {
    constructor() {
        // ... existing singletons ...
        
        this.shapeManager = null;  // NEW: Shape management
        
        // ... rest of constructor ...
    }

    async _performInitialization(hass) {
        // ... existing initialization ...

        // Initialize ShapeManager (after AssetManager)
        this.shapeManager = new ShapeManager();
        lcardsLog.debug('[LCARdSCore] ✅ ShapeManager initialized');

        // ... rest of initialization ...
    }
}
```

---

## 5. Example: Voyager Chevron Button Pack

**File**: `src/core/packs/builtin/lcars_voyager.js`

**Add shapes section**:

```javascript
export default {
    id: 'lcars_voyager',
    name: 'LCARS Voyager Experience',
    // ... other pack properties ...

    assets: {
        fonts: [...],
        svgs: [...],
        
        // Custom button shapes
        shapes: [
            {
                id: 'voyager_chevron',
                name: 'Voyager Chevron',
                type: 'button',
                description: 'Angular chevron shape used on Voyager LCARS panels',
                
                // Dynamic path template
                pathTemplate: function(width, height, options = {}) {
                    const chevronDepth = options.chevronDepth || (width * 0.05);
                    const strokeW = 2;
                    
                    return `
                        M ${strokeW},${strokeW}
                        L ${width - chevronDepth - strokeW},${strokeW}
                        L ${width - strokeW},${height / 2}
                        L ${width - chevronDepth - strokeW},${height - strokeW}
                        L ${strokeW},${height - strokeW}
                        L ${chevronDepth + strokeW},${height / 2}
                        Z
                    `.trim();
                },
                
                viewBox: [0, 0, 200, 60],
                
                textAnchors: {
                    center: [100, 30],
                    left: [40, 30],
                    right: [160, 30]
                },
                
                styleHints: {
                    defaultPadding: '12px 32px',
                    textAlign: 'center'
                },
                
                tags: ['voyager', 'angular', 'chevron'],
                preview: '/hacsfiles/lcards/shapes/previews/voyager_chevron.png'
            },
            
            {
                id: 'voyager_trapezoid',
                name: 'Voyager Trapezoid',
                type: 'button',
                
                pathTemplate: function(width, height) {
                    const slant = width * 0.1;
                    return `
                        M ${slant},0
                        L ${width},0
                        L ${width - slant},${height}
                        L 0,${height}
                        Z
                    `.trim();
                },
                
                viewBox: [0, 0, 200, 60],
                textAnchors: { center: [100, 30] },
                tags: ['voyager', 'angular', 'trapezoid']
            },
            
            {
                id: 'voyager_rounded_pentagon',
                name: 'Voyager Rounded Pentagon',
                type: 'button',
                
                path: 'M 100,10 L 180,40 L 160,90 L 40,90 L 20,40 Z',
                viewBox: [0, 0, 200, 100],
                textAnchors: { center: [100, 55] },
                tags: ['voyager', 'angular', 'pentagon']
            }
        ]
    },
    
    config: {
        // ... themes, animations ...
        
        presets: {
            button: {
                voyager_chevron: {
                    name: 'Voyager Chevron Button',
                    shape: 'voyager_chevron',  // ← References shape
                    backgroundColor: '#cc99ff',
                    textColor: '#ffffff',
                    fontSize: '16px',
                    fontFamily: 'Voyager Display',
                    shapeOptions: {
                        chevronDepth: 15
                    }
                },
                
                voyager_trapezoid: {
                    name: 'Voyager Trapezoid',
                    shape: 'voyager_trapezoid',
                    backgroundColor: '#9999cc',
                    textColor: '#ffffff'
                }
            }
        }
    }
};
```

---

## 6. User Configuration Examples

### YAML Config

```yaml
# Simple: Use preset with shape
type: custom:lcards-button
entity: light.bedroom
preset: voyager_chevron
label: "Bedroom"

# Advanced: Override shape directly
type: custom:lcards-button
entity: light.kitchen
label: "Kitchen"
shape: voyager_trapezoid
style:
  backgroundColor: "#ff9900"
  textColor: "#000000"

# Custom shape options
type: custom:lcards-button
entity: switch.hallway
label: "Hallway"
shape: voyager_chevron
shape_options:
  chevronDepth: 20  # Deeper chevron
```

---

## 7. Benefits Summary

### For Users
✅ **Unlimited button shapes** - Not limited to rounded rectangles  
✅ **Pack-based distribution** - Download complete shape libraries  
✅ **Theme consistency** - Shapes distributed with matching themes  
✅ **Easy configuration** - Just reference shape ID in preset  

### For Developers
✅ **Reusable shapes** - Define once, use everywhere  
✅ **Dynamic rendering** - Shapes adapt to button size  
✅ **Clean separation** - Shape definition separate from style  
✅ **Extensible** - Easy to add new shapes via packs  

### For Pack Creators
✅ **Complete experiences** - Bundle shapes with themes  
✅ **Preview system** - Shape thumbnails for selection  
✅ **Metadata** - Tags, descriptions, style hints  
✅ **Versioning** - Track shape versions across packs  

---

## 8. Advanced Features (Future)

### Animated Shapes

```javascript
{
    id: 'pulse_hexagon',
    name: 'Pulsing Hexagon',
    segments: [
        { id: 'seg1', path: 'M 100,10 L 180,50' },
        { id: 'seg2', path: 'L 180,110' },
        { id: 'seg3', path: 'L 100,150' },
        { id: 'seg4', path: 'L 20,110' },
        { id: 'seg5', path: 'L 20,50' },
        { id: 'seg6', path: 'Z' }
    ],
    animations: {
        on_hover: {
            target: 'segments',
            keyframes: [
                { strokeWidth: 2 },
                { strokeWidth: 4 }
            ],
            duration: 300
        }
    }
}
```

### State-Dependent Shapes

```javascript
{
    id: 'state_morph_button',
    name: 'State Morphing Button',
    stateShapes: {
        'off': 'rect',
        'on': 'voyager_chevron',
        'unavailable': 'picard_trapezoid'
    }
}
```

### Multi-Layer Shapes

```javascript
{
    id: 'layered_button',
    name: 'Layered Button',
    layers: [
        { id: 'background', path: '...', fill: 'var(--bg-color)' },
        { id: 'border', path: '...', stroke: 'var(--border-color)', fill: 'none' },
        { id: 'highlight', path: '...', fill: 'url(#gradient)' }
    ]
}
```

---

## 9. Migration Path

### Phase 1: Core Implementation
1. ✅ Implement `ShapeManager` singleton
2. ✅ Add shape support to `ExperiencePackLoader`
3. ✅ Update button card rendering
4. ✅ Register built-in shapes (rect, lozenge, pill)

### Phase 2: Voyager Pack
1. ✅ Create Voyager chevron shape
2. ✅ Create Voyager trapezoid shape
3. ✅ Update Voyager presets to use shapes
4. ✅ Test rendering and resizing

### Phase 3: Community
1. ✅ Document shape definition format
2. ✅ Create shape creation guide
3. ✅ Build shape preview tool
4. ✅ Accept community contributions

---

## 10. Implementation Files Needed

### New Files
1. `src/core/shapes/ShapeManager.js` - Shape singleton
2. `src/core/shapes/builtin-shapes.js` - Built-in shape definitions
3. `doc/guides/creating-custom-shapes.md` - Documentation

### Modified Files
1. `src/core/lcards-core.js` - Add ShapeManager initialization
2. `src/core/packs/ExperiencePackLoader.js` - Load shapes from packs
3. `src/cards/lcards-simple-button.js` - Use ShapeManager for rendering
4. `src/core/packs/builtin/lcars_voyager.js` - Add shape definitions

---

## Recommendation

**Implement this shape system** as part of the Experience Pack proposal. It's a natural extension that provides:

1. **Immediate value** - Custom shapes for buttons
2. **Elegant integration** - Fits perfectly with pack system
3. **Future extensibility** - Foundation for shape libraries
4. **Community enablement** - Users can create/share shapes

The shape system completes the vision of "complete LCARS experiences" - fonts + SVGs + shapes + themes + presets + animations all bundled together.

**Want me to add this to the final implementation document?** 🚀
