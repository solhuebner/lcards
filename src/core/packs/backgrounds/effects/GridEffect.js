import { BaseEffect } from './BaseEffect.js';
import { lcardsLog } from '../../../../utils/lcards-logging.js';

/**
 * GridEffect - Scrolling LCARS-style grid background effect
 *
 * Renders a grid of horizontal and vertical lines that scroll.
 * Animatable properties: scrollX, scrollY, lineSpacing, lineWidth, color, opacity
 *
 * @class GridEffect
 * @extends BaseEffect
 */
export class GridEffect extends BaseEffect {
  /**
   * @param {Object} config - Effect configuration
   * @param {number} [config.lineSpacing=40] - Space between grid lines in pixels
   * @param {number} [config.lineWidth=1] - Width of grid lines in pixels
   * @param {string} [config.color='rgba(255, 153, 102, 0.3)'] - LCARS orange with transparency
   * @param {number} [config.scrollX=0] - Initial horizontal scroll offset
   * @param {number} [config.scrollY=0] - Initial vertical scroll offset
   * @param {number} [config.scrollSpeedX=20] - Horizontal scroll speed (pixels/second)
   * @param {number} [config.scrollSpeedY=20] - Vertical scroll speed (pixels/second)
   */
  constructor(config = {}) {
    super(config);

    // Grid-specific properties
    this.lineSpacing = config.lineSpacing ?? 40;
    this.lineWidth = config.lineWidth ?? 1;
    this.color = config.color ?? 'rgba(255, 153, 102, 0.3)'; // LCARS orange

    // Scrolling state
    this.scrollX = config.scrollX ?? 0;
    this.scrollY = config.scrollY ?? 0;
    this.scrollSpeedX = config.scrollSpeedX ?? 20; // pixels/second
    this.scrollSpeedY = config.scrollSpeedY ?? 20; // pixels/second

    lcardsLog.debug('[GridEffect] Created grid effect', {
      lineSpacing: this.lineSpacing,
      scrollSpeedX: this.scrollSpeedX,
      scrollSpeedY: this.scrollSpeedY
    });
  }

  /**
   * Update grid scroll position based on speed and deltaTime
   *
   * @param {number} deltaTime - Time since last update in milliseconds
   * @param {number} canvasWidth - Canvas width in pixels
   * @param {number} canvasHeight - Canvas height in pixels
   */
  update(deltaTime, canvasWidth, canvasHeight) {
    super.update(deltaTime, canvasWidth, canvasHeight);

    // Convert deltaTime from milliseconds to seconds
    const deltaSeconds = deltaTime / 1000;

    // Update scroll position (modulo spacing to wrap seamlessly)
    this.scrollX = (this.scrollX + this.scrollSpeedX * this.speed * deltaSeconds) % this.lineSpacing;
    this.scrollY = (this.scrollY + this.scrollSpeedY * this.speed * deltaSeconds) % this.lineSpacing;
  }

  /**
   * Draw grid to canvas
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context
   * @param {number} canvasWidth - Canvas width in pixels
   * @param {number} canvasHeight - Canvas height in pixels
   */
  draw(ctx, canvasWidth, canvasHeight) {
    ctx.save();

    // Apply base transforms (opacity, rotation, scale)
    this.applyTransforms(ctx);

    // Set line style
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;

    // Draw vertical lines
    for (let x = -this.lineSpacing + this.scrollX; x < canvasWidth; x += this.lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = -this.lineSpacing + this.scrollY; y < canvasHeight; y += this.lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    ctx.restore();
  }
}
