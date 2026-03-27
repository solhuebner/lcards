#!/usr/bin/env node
/**
 * generate-brand-icon.js
 *
 * Generates custom_components/lcards/brand/icon.png — a 256×256 placeholder
 * brand icon required by the HACS validation check (Check Brands).
 *
 * Uses only Node.js built-ins (zlib, fs). Replace the output file with a
 * proper designer asset when one is available.
 *
 * Usage:
 *   node scripts/generate-brand-icon.js
 *   npm run generate-brand-icon
 */

import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root      = resolve(__dirname, '..');

const W = 256, H = 256;

// ── LCARS-inspired palette ────────────────────────────────────────────────────
const BG     = [0x1A, 0x1A, 0x2E];   // deep navy
const ORANGE = [0xFF, 0x99, 0x00];   // LCARS amber / orange
const BLUE   = [0x99, 0xCC, 0xFF];   // LCARS periwinkle

// ── Draw pixels ───────────────────────────────────────────────────────────────
// Layout (all radii in px from centre 128,128):
//   outer ring  : 116–106  orange
//   inner disc  : 76       orange
//   cutout ring : 60–46    navy
//   centre dot  : 32       blue
const pixels = new Uint8Array(H * W * 3);

for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
        const cx  = x - W / 2;
        const cy  = y - H / 2;
        const d   = Math.sqrt(cx * cx + cy * cy);
        const idx = (y * W + x) * 3;

        let c = BG;
        if (d <= 116 && d >= 106) c = ORANGE;  // outer ring
        if (d <   76)             c = ORANGE;  // inner filled disc
        if (d <   60 && d >= 46)  c = BG;      // dark annular gap
        if (d <   32)             c = BLUE;    // centre dot

        pixels[idx]     = c[0];
        pixels[idx + 1] = c[1];
        pixels[idx + 2] = c[2];
    }
}

// ── PNG helpers ───────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        t[i] = c;
    }
    return t;
})();

function crc32(buf) {
    let crc = 0xFFFFFFFF;
    for (const b of buf) crc = CRC_TABLE[(crc ^ b) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
    const t    = Buffer.from(type, 'ascii');
    const len  = Buffer.alloc(4);
    const cBuf = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    cBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
    return Buffer.concat([len, t, data, cBuf]);
}

// ── IHDR ──────────────────────────────────────────────────────────────────────
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8]  = 8;  // bit depth
ihdr[9]  = 2;  // colour type: RGB truecolour
ihdr[10] = 0;  // deflate/inflate
ihdr[11] = 0;  // adaptive filtering
ihdr[12] = 0;  // no interlace

// ── IDAT (filter-None rows → deflate) ────────────────────────────────────────
const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
    const rowOff = y * (1 + W * 3);
    raw[rowOff] = 0; // filter byte = None
    for (let x = 0; x < W; x++) {
        const src = (y * W + x) * 3;
        raw[rowOff + 1 + x * 3]     = pixels[src];
        raw[rowOff + 1 + x * 3 + 1] = pixels[src + 1];
        raw[rowOff + 1 + x * 3 + 2] = pixels[src + 2];
    }
}

const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
]);

// ── Write ─────────────────────────────────────────────────────────────────────
const outDir = resolve(root, 'custom_components/lcards/brand');
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'icon.png'), png);
console.log(`✅ custom_components/lcards/brand/icon.png  (${png.length} bytes)`);
