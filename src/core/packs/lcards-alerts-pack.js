/**
 * @fileoverview LCARdS Alerts Sound Pack
 *
 * A library of individual alert audio assets.
 * This pack does NOT define a sound scheme — its assets are
 * intended to be selected individually via per-event overrides
 * in the Config Panel Sound tab.
 *
 * File layout on disk (relative to the HA www root):
 *   /hacsfiles/lcards/sounds/lcards_alerts/<asset>.mp3
 *
 * Asset key conventions:
 *   alerts_<descriptor>   e.g. alerts_red, alerts_blue
 *
 * To add real audio files:
 *   1. Place .mp3 files in hacsfiles/lcards/sounds/lcards_alerts/
 *   2. Update the `url` fields below to match the actual filenames.
 *   3. Rebuild (npm run build) and hard-refresh HA.
 *
 * Note: no sound_schemes key is defined here — these assets are
 * available in the override picker without forming a named scheme.
 */

const BASE_URL = '/hacsfiles/lcards/sounds/lcards_alerts';

// ──────────────────────────────────────────────────────────────
// AUDIO ASSET REGISTRY
// Registered with AssetManager → available in Config Panel override picker.
// No scheme mapping required.
// ──────────────────────────────────────────────────────────────
const AUDIO_ASSETS = {
  // ── Alerts ──
  red_alert: {
    url: `${BASE_URL}/tng_red_alert_3.mp3`,
    description: 'TNG Red Alert 3',
  },
  blue_alert: {
    url: `${BASE_URL}/voy_blue_alert.mp3`,
    description: 'Voyager Blue Alert',
  },
};

// ──────────────────────────────────────────────────────────────
// PACK EXPORT
// No sound_schemes — assets only.
// ──────────────────────────────────────────────────────────────
export const LCARDS_ALERTS_PACK = {
  id:          'lcards_alerts',
  version:     '1.0.0',
  name:        'LCARdS Alerts',
  description: 'Library of individual alert assets for use as per-event sound overrides',
  /** Registered with AssetManager → available in Config Panel override picker */
  audio_assets: AUDIO_ASSETS,

  // No sound_schemes — this pack is an asset library, not a preset scheme.
};
