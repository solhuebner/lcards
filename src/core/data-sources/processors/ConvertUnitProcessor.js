/**
 * @fileoverview Unit Conversion Processor
 *
 * Converts between different units of measurement.
 * Supports 50+ conversions across multiple categories.
 *
 * @module core/data-sources/processors/ConvertUnitProcessor
 */

import { Processor } from './BaseProcessor.js';
import { lcardsLog } from '../../../utils/lcards-logging.js';

/**
 * Unit Conversion Processor
 *
 * Config:
 * ```yaml
 * processor_name:
 *   type: convert_unit
 *   from: c        # Source unit code
 *   to: f          # Target unit code
 * ```
 */
export class ConvertUnitProcessor extends Processor {
  constructor(config) {
    super(config);

    this.from = config.from;
    this.to = config.to;

    // Validate units provided
    if (!this.from || !this.to) {
      throw new Error('convert_unit processor requires "from" and "to" unit codes');
    }

    // Get conversion function
    this._conversionFn = this._getConversionFunction(this.from, this.to);

    if (!this._conversionFn) {
      throw new Error(
        `No conversion available from "${this.from}" to "${this.to}". ` +
        `Check unit codes are correct and compatible.`
      );
    }

    lcardsLog.trace(`[ConvertUnitProcessor] ${this.key}: ${this.from} → ${this.to}`);
  }

  _doProcess(value, timestamp, mainBuffer, processingResults) {
    if (value === null || value === undefined || !Number.isFinite(value)) {
      return null;
    }

    return this._conversionFn(value);
  }

  /**
   * Normalize unit name to short code
   * @private
   * @param {string} unit - Unit name (e.g., 'celsius', 'fahrenheit', 'c', 'f')
   * @returns {string} Normalized short code
   */
  _normalizeUnit(unit) {
    const normalized = unit.toLowerCase().trim();

    // Temperature aliases
    const tempAliases = {
      'celsius': 'c',
      'fahrenheit': 'f',
      'kelvin': 'k'
    };

    return tempAliases[normalized] || normalized;
  }

  /**
   * Get conversion function for unit pair
   * @private
   * @param {string} from - Source unit
   * @param {string} to - Target unit
   * @returns {Function|null} Conversion function or null
   */
  _getConversionFunction(from, to) {
    // Normalize unit codes (handles aliases like 'celsius' -> 'c')
    const fromLower = this._normalizeUnit(from);
    const toLower = this._normalizeUnit(to);

    // Check if same unit (no-op)
    if (fromLower === toLower) {
      return (v) => v;
    }

    // Try direct lookup
    const key = `${fromLower}_to_${toLower}`;
    if (this.conversions[key]) {
      return this.conversions[key];
    }

    // Try reverse lookup (and invert)
    const reverseKey = `${toLower}_to_${fromLower}`;
    if (this.conversions[reverseKey]) {
      const reverseFn = this.conversions[reverseKey];
      // Invert the function (won't work for all, but works for linear conversions)
      return (v) => {
        // For temperature we need special handling
        if (this._isTemperatureConversion(fromLower, toLower)) {
          return this._invertTemperatureConversion(v, toLower, fromLower);
        }
        // For linear conversions, just invert
        return 1 / reverseFn(1) * v;
      };
    }

    return null;
  }

  /**
   * Check if conversion is between temperature units
   * @private
   */
  _isTemperatureConversion(unit1, unit2) {
    const tempUnits = ['c', 'f', 'k', '°c', '°f'];
    return tempUnits.includes(unit1) && tempUnits.includes(unit2);
  }

  /**
   * Invert temperature conversion
   * @private
   */
  _invertTemperatureConversion(value, from, to) {
    // Just do the direct conversion
    const directKey = `${from}_to_${to}`;
    if (this.conversions[directKey]) {
      return this.conversions[directKey](value);
    }
    return value;
  }

  /**
   * All supported unit conversions
   * Each function takes a value and returns the converted value
   */
  conversions = {
    // ===== TEMPERATURE =====
    'f_to_c': (f) => (f - 32) * 5/9,
    '°f_to_°c': (f) => (f - 32) * 5/9,
    'c_to_f': (c) => (c * 9/5) + 32,
    '°c_to_°f': (c) => (c * 9/5) + 32,
    'k_to_c': (k) => k - 273.15,
    'c_to_k': (c) => c + 273.15,
    'k_to_f': (k) => (k - 273.15) * 9/5 + 32,
    'f_to_k': (f) => (f - 32) * 5/9 + 273.15,

    // ===== POWER =====
    'w_to_kw': (w) => w / 1000,
    'kw_to_w': (kw) => kw * 1000,
    'kw_to_mw': (kw) => kw / 1000,
    'mw_to_kw': (mw) => mw * 1000,
    'w_to_mw': (w) => w / 1000000,
    'mw_to_w': (mw) => mw * 1000000,
    'mw_to_gw': (mw) => mw / 1000,
    'gw_to_mw': (gw) => gw * 1000,

    // ===== ENERGY =====
    'wh_to_kwh': (wh) => wh / 1000,
    'kwh_to_wh': (kwh) => kwh * 1000,
    'kwh_to_mwh': (kwh) => kwh / 1000,
    'mwh_to_kwh': (mwh) => mwh * 1000,
    'j_to_kwh': (j) => j / 3600000,
    'kwh_to_j': (kwh) => kwh * 3600000,
    'cal_to_j': (cal) => cal * 4.184,
    'j_to_cal': (j) => j / 4.184,

    // ===== DISTANCE - METRIC =====
    'mm_to_cm': (mm) => mm / 10,
    'cm_to_mm': (cm) => cm * 10,
    'cm_to_m': (cm) => cm / 100,
    'm_to_cm': (m) => m * 100,
    'm_to_km': (m) => m / 1000,
    'km_to_m': (km) => km * 1000,

    // ===== DISTANCE - IMPERIAL =====
    'in_to_cm': (inch) => inch * 2.54,
    'cm_to_in': (cm) => cm / 2.54,
    'ft_to_m': (ft) => ft * 0.3048,
    'm_to_ft': (m) => m / 0.3048,
    'mi_to_km': (mi) => mi * 1.60934,
    'km_to_mi': (km) => km / 1.60934,
    'yd_to_m': (yd) => yd * 0.9144,
    'm_to_yd': (m) => m / 0.9144,

    // ===== SPEED =====
    'ms_to_kmh': (ms) => ms * 3.6,
    'kmh_to_ms': (kmh) => kmh / 3.6,
    'mph_to_kmh': (mph) => mph * 1.60934,
    'kmh_to_mph': (kmh) => kmh / 1.60934,
    'mph_to_ms': (mph) => mph * 0.44704,
    'ms_to_mph': (ms) => ms / 0.44704,
    'knot_to_kmh': (knot) => knot * 1.852,
    'kmh_to_knot': (kmh) => kmh / 1.852,

    // ===== PRESSURE =====
    'hpa_to_mmhg': (hpa) => hpa * 0.750062,
    'mmhg_to_hpa': (mmhg) => mmhg / 0.750062,
    'psi_to_hpa': (psi) => psi * 68.9476,
    'hpa_to_psi': (hpa) => hpa / 68.9476,
    'bar_to_hpa': (bar) => bar * 1000,
    'hpa_to_bar': (hpa) => hpa / 1000,
    'inhg_to_hpa': (inhg) => inhg * 33.8639,
    'hpa_to_inhg': (hpa) => hpa / 33.8639,
    'atm_to_hpa': (atm) => atm * 1013.25,
    'hpa_to_atm': (hpa) => hpa / 1013.25,

    // ===== DATA SIZE =====
    'b_to_kb': (b) => b / 1024,
    'kb_to_b': (kb) => kb * 1024,
    'kb_to_mb': (kb) => kb / 1024,
    'mb_to_kb': (mb) => mb * 1024,
    'mb_to_gb': (mb) => mb / 1024,
    'gb_to_mb': (gb) => gb * 1024,
    'gb_to_tb': (gb) => gb / 1024,
    'tb_to_gb': (tb) => tb * 1024,

    // ===== VOLUME =====
    'ml_to_l': (ml) => ml / 1000,
    'l_to_ml': (l) => l * 1000,
    'l_to_gal': (l) => l * 0.264172,
    'gal_to_l': (gal) => gal / 0.264172,
    'oz_to_ml': (oz) => oz * 29.5735,
    'ml_to_oz': (ml) => ml / 29.5735,
    'cup_to_ml': (cup) => cup * 236.588,
    'ml_to_cup': (ml) => ml / 236.588,

    // ===== MASS =====
    'g_to_kg': (g) => g / 1000,
    'kg_to_g': (kg) => kg * 1000,
    'kg_to_lb': (kg) => kg * 2.20462,
    'lb_to_kg': (lb) => lb / 2.20462,
    'oz_to_g': (oz) => oz * 28.3495,
    'g_to_oz': (g) => g / 28.3495,
    'ton_to_kg': (ton) => ton * 1000,
    'kg_to_ton': (kg) => kg / 1000,

    // ===== HOME ASSISTANT SPECIFIC =====

    // Brightness (0-255 ↔ 0-100%)
    'brightness_to_percent': (brightness) => (brightness / 255) * 100,
    'percent_to_brightness': (percent) => (percent / 100) * 255,

    // Volume (0-1 ↔ 0-100%)
    'volume_to_percent': (volume) => volume * 100,
    'percent_to_volume': (percent) => percent / 100,

    // Generic percentage conversions
    'percent_to_decimal': (percent) => percent / 100,
    'decimal_to_percent': (decimal) => decimal * 100,

    // Signal strength
    'dbm_to_percent': (dbm) => {
      // WiFi signal strength: -90 dBm (terrible) to -30 dBm (excellent)
      return Math.max(0, Math.min(100, ((dbm + 90) / 60) * 100));
    },
    'rssi_to_percent': (rssi) => {
      // Generic RSSI: 0 (worst) to 100 (best)
      return Math.max(0, Math.min(100, rssi));
    },

    // Light level
    'lux_to_percent': (lux) => {
      // 0 lux (dark) to ~20000 lux (very bright), capped at 100%
      return Math.min(100, (lux / 20000) * 100);
    },

    // Humidity comfort
    'humidity_to_comfort': (humidity) => {
      // Simplified comfort assessment
      if (humidity < 30) return 0;  // Too dry
      if (humidity > 60) return 0;  // Too humid
      if (humidity >= 40 && humidity <= 50) return 100; // Optimal
      // Linear scale in between
      if (humidity < 40) return ((humidity - 30) / 10) * 100;
      return ((60 - humidity) / 10) * 100;
    },

    // RGB color (0-255 ↔ 0-100%)
    'rgb_to_percent': (rgb) => (rgb / 255) * 100,
    'percent_to_rgb': (percent) => (percent / 100) * 255,

    // HVAC specific (0-1 ↔ 0-100%)
    'hvac_decimal_to_percent': (decimal) => decimal * 100,
    'hvac_percent_to_decimal': (percent) => percent / 100
  };
}
