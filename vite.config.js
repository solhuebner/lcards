import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// 'integration' mode writes directly into custom_components/lcards/ so the
// devcontainer bind-mount picks it up without a separate copy step.
// All other modes (default, 'development') write to dist/ as before.
const isIntegrationMode = (mode) => mode === 'integration';

export default defineConfig(({ mode }) => ({
    build: {
        lib: {
            entry: 'src/lcards.js',
            name: 'LCARdS',
            // String (not function) lets Vite append the format extension automatically → lcards.js
            fileName: 'lcards',
            formats: ['es'],
        },
        rollupOptions: {
            output: {
                // Keep a single output file — equivalent to the current webpack monolithic build.
                // Dynamic imports are inlined at build time rather than split into chunks.
                // This avoids Webpack's global chunk registry (webpackJsonp) which caused
                // inter-card module pollution when multiple Webpack-bundled cards are loaded
                // on the same HA dashboard.
                inlineDynamicImports: true,
            },
        },
        // integration mode → custom_components/lcards/  (bind-mounted into HA devcontainer)
        // all other modes  → dist/                      (legacy plugin path, unchanged)
        outDir: isIntegrationMode(mode) ? 'custom_components/lcards' : 'dist',
        // Never wipe outDir — Python files live alongside lcards.js in integration mode;
        // fonts/ and msd/ asset dirs are managed by CI in dist/ mode.
        emptyOutDir: false,
        sourcemap: true,
        // Disable minification in development / integration mode for readable output.
        // Production builds use esbuild (default, ~10x faster than Terser).
        minify: (mode === 'development' || isIntegrationMode(mode)) ? false : 'esbuild',
    },
    define: {
        __LCARDS_VERSION__: JSON.stringify(pkg.version),
        __LCARDS_BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },
}));
