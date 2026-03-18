/**
 * @fileoverview LCARdS Shape Textures Pack
 *
 * Metadata pack for Canvas2D-native shape texture presets.
 * CANVAS_TEXTURE_PRESETS are consumed directly by CanvasTextureRenderer — this pack
 * is a metadata anchor for the Pack Explorer only.
 *
 * Pack key:  lcards_textures
 */

export const LCARDS_TEXTURES_PACK = {
    id: 'lcards_textures',
    name: 'LCARdS Shape Textures',
    version: __LCARDS_VERSION__,
    description: 'Canvas-native shape texture presets for button and elbow cards'
    // No style_presets key — textures are consumed directly by render methods
};
