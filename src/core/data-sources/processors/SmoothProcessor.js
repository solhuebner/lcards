/**
 * @fileoverview Smooth Processor
 *
 * Applies smoothing algorithms to reduce noise.
 * Consolidates old moving_average aggregation with smoothing transformations.
 *
 * @module core/data-sources/processors/SmoothProcessor
 */

import { Processor } from './BaseProcessor.js';

/**
 * Smooth Processor
 *
 * Config:
 * ```yaml
 * processor_name:
 *   type: smooth
 *   from: source_processor  # Optional
 *   method: exponential  # exponential, moving_average, gaussian
 *   window: 10           # Window size (samples or time)
 *   alpha: 0.3           # For exponential method
 * ```
 */
export class SmoothProcessor extends Processor {
  constructor(config) {
    super(config);

    this.method = config.method || 'exponential';
    this.window = config.window || 10;
    this.alpha = config.alpha || 0.3;

    // State for smoothing methods
    this._previousValue = null;
    this._windowValues = [];
  }

  _doProcess(value, timestamp, mainBuffer, processingResults) {
    if (value === null || value === undefined || !Number.isFinite(value)) {
      return this._previousValue || null;
    }

    let smoothed;

    switch (this.method) {
      case 'exponential':
        smoothed = this._exponentialSmoothing(value);
        break;

      case 'moving_average':
        smoothed = this._movingAverage(value);
        break;

      case 'gaussian':
        smoothed = this._gaussianSmoothing(value, mainBuffer);
        break;

      default:
        smoothed = value;
    }

    this._previousValue = smoothed;
    return smoothed;
  }

  /**
   * Exponential moving average (EMA)
   * @private
   */
  _exponentialSmoothing(value) {
    if (this._previousValue === null) {
      return value;
    }

    return this.alpha * value + (1 - this.alpha) * this._previousValue;
  }

  /**
   * Simple moving average (SMA)
   * @private
   */
  _movingAverage(value) {
    this._windowValues.push(value);

    if (this._windowValues.length > this.window) {
      this._windowValues.shift();
    }

    const sum = this._windowValues.reduce((a, b) => a + b, 0);
    return sum / this._windowValues.length;
  }

  /**
   * Gaussian smoothing (weighted average with Gaussian weights)
   * @private
   */
  _gaussianSmoothing(value, mainBuffer) {
    // Get recent values from buffer
    const allData = mainBuffer.getAll();
    if (allData.length < 3) return value;

    // Use last 'window' values
    const recentData = allData.slice(-this.window);

    // Calculate Gaussian weights
    const sigma = this.window / 4; // Standard deviation
    const weights = recentData.map((_, i) => {
      const distance = Math.abs(i - recentData.length + 1);
      return Math.exp(-(distance * distance) / (2 * sigma * sigma));
    });

    // Normalize weights
    const sumWeights = weights.reduce((a, b) => a + b, 0);
    const normalizedWeights = weights.map(w => w / sumWeights);

    // Calculate weighted average
    const weighted = recentData.reduce((sum, data, i) => {
      return sum + data.v * normalizedWeights[i];
    }, 0);

    return weighted;
  }
}
