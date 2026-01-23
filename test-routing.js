#!/usr/bin/env node
/**
 * Simple CLI test for RouterCore waypoint routing
 * Run with: node test-routing.js
 */

// Mock the logging and performance utilities
global.lcardsLog = {
  debug: (...args) => console.log('[DEBUG]', ...args),
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  trace: (...args) => console.log('[TRACE]', ...args)
};

global.perfCount = (metric, value) => {
  console.log(`[PERF] ${metric}: ${value}`);
};

global.perfTime = (metric, fn) => {
  const start = Date.now();
  const result = fn();
  const elapsed = Date.now() - start;
  console.log(`[PERF] ${metric}: ${elapsed}ms`);
  return result;
};

// Import RouterCore (this will need the actual path)
const path = require('path');
const RouterCore = require('./src/msd/routing/RouterCore.js').default || require('./src/msd/routing/RouterCore.js').RouterCore;

console.log('\n=== LCARdS RouterCore Waypoint Test ===\n');

// Test configuration matching user's setup
const config = {
  channels: {
    channel_1: {
      type: 'waypoint',
      bounds: [450, 200, 200, 150]
    }
  },
  routing: {
    default_mode: 'smart',
    auto_upgrade_simple_lines: true,
    smoothing_mode: 'none'
  }
};

// Anchors from the SVG
const anchors = {
  pn_1_label: [113.6632, 216.16125],
  scr_nw: [1154.0792, 502.73447]
};

const viewBox = [0, 0, 1920, 1080];

console.log('Config:', JSON.stringify(config, null, 2));
console.log('\nAnchors:', anchors);
console.log('\nViewBox:', viewBox);

// Create router instance
console.log('\n--- Initializing RouterCore ---');
const router = new RouterCore(viewBox, config.routing, anchors);

// Build a route request similar to what the card would create
console.log('\n--- Building Route Request ---');

const overlay = {
  id: 'line_1',
  type: 'line',
  anchor: 'pn_1_label',
  attach_to: 'scr_nw',
  anchor_side: 'center',
  attach_side: 'center',
  route_channels: ['channel_1'],
  route_channel_mode: 'force',
  style: {
    color: 'var(--lcars-orange)',
    width: 2
  }
};

console.log('Overlay config:', JSON.stringify(overlay, null, 2));

// Manually build route request to test
const req = router.buildRouteRequest(overlay, anchors['pn_1_label'], anchors['scr_nw']);

console.log('\n--- Route Request ---');
console.log(JSON.stringify(req, null, 2));

// Compute the route
console.log('\n--- Computing Route ---');
const result = router.computePath(req);

console.log('\n--- Route Result ---');
console.log('Strategy:', result.meta?.strategy);
console.log('Segments:', result.meta?.segments);
console.log('Bends:', result.meta?.bends);
console.log('Path:', result.d);
console.log('\nPoints:');
result.pts.forEach((pt, i) => {
  console.log(`  ${i}: [${pt[0]}, ${pt[1]}]`);
});

if (result.meta?.waypoint) {
  console.log('\nWaypoint used:', result.meta.waypoint);
}

if (result.meta?.channel) {
  console.log('\nChannel info:', result.meta.channel);
}

console.log('\n=== Test Complete ===\n');
