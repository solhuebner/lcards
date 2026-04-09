/**
 * @fileoverview LCARdS About / Welcome Tab
 *
 * Displays a welcome banner, version info, live runtime stats,
 * and quick links to documentation and GitHub.
 *
 * Stats are gathered lazily from window.lcards.core on each render so the
 * numbers stay current even if the panel is opened before full core init.
 *
 * @element lcards-about-tab
 */

import { LitElement, html, css } from 'lit';
import { lcardsLog } from '../../utils/lcards-logging.js';

/**
 * @typedef {{ label: string; value: string | number; icon: string; _ok?: boolean; _alert?: boolean; _warn?: boolean; }} StatItem
 */

export class LCARdSAboutTab extends LitElement {
  static properties = {
    hass: { type: Object },
    /** Trigger a re-render on a manual "Refresh" press */
    _refreshTick: { type: Number, state: true },
  };

  constructor() {
    super();
    /** @type {any} */
    this.hass = undefined;
    this._refreshTick = 0;
  }

  // ============================================================================
  // STATS HELPERS
  // ============================================================================

  _getVersion() {
    return window.lcards?.version ?? 'unknown';
  }

  _getBuildDate() {
    const core = window.lcards?.core;
    // Build date is stamped on the info function result; also available via the
    // __LCARDS_BUILD_DATE__ define but not importable here at runtime.
    // Fall back to window.lcards.info() if available.
    try {
      const info = window.lcards?.info?.();
      return info?.buildDate ?? '—';
    } catch {
      return '—';
    }
  }

  _getHAVersion() {
    return this.hass?.config?.version ?? '—';
  }

  /** @returns {StatItem[]} */
  _gatherStats() {
    const core = window.lcards?.core;
    const coreReady = !!core?._coreInitialized;

    const activeTheme = core?.themeManager?.getActiveTheme?.()?.id ?? '—';
    const alertMode  = core?.themeManager?.getAlertMode?.() ?? 'off';
    const dsCount    = core?.dataSourceManager
      ? Object.keys(core.dataSourceManager.sources ?? {}).length
      : 0;
    const packCount  = core?.packManager?.loadedPacks?.size ?? 0;
    const helperTotal = core?.helperManager ? core.helperManager.getAllHelpers().length : 0;
    const helperMissing = core?.helperManager ? core.helperManager.getMissingHelpers().length : 0;
    const helperOk   = helperTotal - helperMissing;

    // Registered card types from window.customCards — deduplicate by type in
    // case the bundle was evaluated more than once and entries were pushed twice.
    const cardTypes = new Set(
      (window.customCards ?? [])
        .filter(c => typeof c.type === 'string' && c.type.startsWith('lcards-'))
        .map(c => c.type)
    ).size;

    return [
      { icon: 'mdi:tag-outline',         label: 'Version',         value: this._getVersion() },
      { icon: 'mdi:calendar-outline',    label: 'Build Date',      value: this._getBuildDate() },
      { icon: 'mdi:home-assistant',      label: 'Home Assistant',  value: this._getHAVersion() },
      { icon: 'mdi:check-circle-outline',label: 'Core Status',     value: coreReady ? 'Initialized' : 'Pending…', _ok: coreReady },
      { icon: 'mdi:palette',             label: 'Active Theme',    value: activeTheme },
      { icon: 'mdi:alert-circle-outline',label: 'Alert Mode',      value: alertMode === 'off' ? 'Off' : alertMode.toUpperCase(), _alert: alertMode !== 'off' },
      { icon: 'mdi:package-variant',     label: 'Loaded Packs',    value: packCount },
      { icon: 'mdi:cards-outline',       label: 'Card Types',      value: cardTypes },
      { icon: 'mdi:database-outline',    label: 'Data Sources',    value: dsCount },
      { icon: 'mdi:tune',                label: 'Helpers',         value: `${helperOk} / ${helperTotal}`, _warn: helperMissing > 0 },
    ];
  }

  _refresh() {
    this._refreshTick++;
    lcardsLog.debug('[AboutTab] Manual refresh triggered');
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  render() {
    const stats = this._gatherStats();
    const version = this._getVersion();

    return html`
      <div class="scrollable-body">

      <!-- ── Banner ─────────────────────────────────────────────── -->
      <div class="banner">
        <div class="banner-left-bar"></div>
        <img
          class="banner-logo"
          src="/hacsfiles/lcards/brand/icon@2x.png"
          alt="LCARdS logo"
          @error=${(e) => { e.target.style.display = 'none'; }}
        />
        <div class="banner-content">
          <div class="banner-title">LCARdS</div>
          <div class="banner-subtitle">LCARS Card System for Home Assistant</div>
        </div>
        <div class="banner-version">v${version}</div>
        <div class="banner-right-bar"></div>
      </div>

      <!-- ── Intro text ──────────────────────────────────────────── -->
      <div class="section intro-section">
        <p class="intro-text">
          Welcome to <strong>LCARdS</strong> — a Lit-based LCARS-inspired card system bringing
          Starfleet aesthetics to your Home Assistant dashboard. Use the tabs above to manage
          helpers, explore themes, configure sounds, and more.
        </p>
        <p class="intro-text">
          Questions, bugs, or ideas? Head to the links in the <em>Resources</em> section below.
          Live long and automate. 🖖
        </p>
      </div>

      <!-- ── Stats grid ─────────────────────────────────────────── -->
      <div class="section">
        <div class="section-header">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          System Information
          <ha-icon-button
            class="refresh-btn"
            label="Refresh"
            title="Refresh stats"
            @click=${this._refresh}
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
          </ha-icon-button>
        </div>

        <div class="stats-grid">
          ${stats.map(s => html`
            <div class="stat-item ${s._alert ? 'stat-alert' : s._warn ? 'stat-warn' : s._ok === false ? 'stat-pending' : ''}">
              <ha-icon icon="${s.icon}" class="stat-icon"></ha-icon>
              <div class="stat-body">
                <span class="stat-label">${s.label}</span>
                <span class="stat-value">${s.value}</span>
              </div>
            </div>
          `)}
        </div>
      </div>

      <!-- ── Resources ─────────────────────────────────────────── -->
      <div class="section">
        <div class="section-header">
          <ha-icon icon="mdi:link-variant"></ha-icon>
          Resources
        </div>
        <div class="links-grid">
          <a class="link-card" href="https://lcards.unimatrix01.ca" target="_blank" rel="noopener">
            <ha-icon icon="mdi:book-open-variant"></ha-icon>
            <div class="link-body">
              <span class="link-title">Documentation</span>
              <span class="link-url">lcards.unimatrix01.ca</span>
            </div>
            <ha-icon icon="mdi:open-in-new" class="link-external"></ha-icon>
          </a>

          <a class="link-card" href="https://github.com/snootched/LCARdS" target="_blank" rel="noopener">
            <ha-icon icon="mdi:github"></ha-icon>
            <div class="link-body">
              <span class="link-title">GitHub Repository</span>
              <span class="link-url">github.com/snootched/LCARdS</span>
            </div>
            <ha-icon icon="mdi:open-in-new" class="link-external"></ha-icon>
          </a>

          <a class="link-card" href="https://github.com/snootched/LCARdS/issues" target="_blank" rel="noopener">
            <ha-icon icon="mdi:bug-outline"></ha-icon>
            <div class="link-body">
              <span class="link-title">Report an Issue</span>
              <span class="link-url">github.com/snootched/LCARdS/issues</span>
            </div>
            <ha-icon icon="mdi:open-in-new" class="link-external"></ha-icon>
          </a>

          <a class="link-card" href="https://github.com/snootched/LCARdS/releases" target="_blank" rel="noopener">
            <ha-icon icon="mdi:tag-multiple-outline"></ha-icon>
            <div class="link-body">
              <span class="link-title">Release Notes</span>
              <span class="link-url">github.com/snootched/LCARdS/releases</span>
            </div>
            <ha-icon icon="mdi:open-in-new" class="link-external"></ha-icon>
          </a>
        </div>
      </div>

      <!-- ── Legal / attribution ───────────────────────────────── -->
      <div class="footer">
        LCARdS is licensed MIT &nbsp;·&nbsp; LCARS aesthetics inspired by Star Trek, a&nbsp;trademark of CBS/Paramount
      </div>

      </div>
    `;
  }

  // ============================================================================
  // STYLES
  // ============================================================================

  static styles = css`
    :host {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }

    /* Scrollable content area — same pattern as sound/storage tabs */
    .scrollable-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-bottom: 8px;
    }

    /* ── Banner ──────────────────────────────────────── */
    .banner {
      display: flex;
      align-items: center;
      gap: 0;
      background: var(--primary-color, #1b4f8a);
      border-radius: var(--ha-card-border-radius, 12px);
      overflow: hidden;
      min-height: 72px;
      flex-shrink: 0;
    }

    .banner-left-bar {
      width: 12px;
      align-self: stretch;
      background: color-mix(in srgb, var(--primary-color, #1b4f8a) 50%, black);
      flex-shrink: 0;
    }

    .banner-logo {
      height: 64px;
      width: auto;
      margin: 0 16px 0 12px;
      flex-shrink: 0;
      object-fit: contain;
    }

    .banner-right-bar {
      width: 24px;
      align-self: stretch;
      background: color-mix(in srgb, var(--primary-color, #1b4f8a) 50%, black);
      flex-shrink: 0;
    }

    .banner-content {
      flex: 1;
      padding: 16px 20px;
    }

    .banner-title {
      font-size: 2.2em;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: white;
      line-height: 1;
      text-transform: uppercase;
      font-family: var(--lcars-font-family, 'Antonio', sans-serif);
    }

    .banner-subtitle {
      font-size: 0.85em;
      color: rgba(255,255,255,0.75);
      margin-top: 4px;
      letter-spacing: 0.05em;
    }

    .banner-version {
      padding: 0 20px;
      font-size: 1em;
      font-weight: 600;
      color: rgba(255,255,255,0.6);
      letter-spacing: 0.1em;
      white-space: nowrap;
      font-family: var(--lcars-font-family, 'Antonio', sans-serif);
    }

    /* ── Sections — matches lcards-form-section background ─────── */
    .section {
      background: rgba(60, 60, 60, 0.5);
      border-radius: var(--ha-card-border-radius, 12px);
      padding: 12px 16px;
    }

    .intro-section {
      background: color-mix(in srgb, var(--primary-color, #1b4f8a) 12%, rgba(60, 60, 60, 0.5));
      border: 1px solid color-mix(in srgb, var(--primary-color, #1b4f8a) 30%, transparent);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1em;
      font-weight: 600;
      color: var(--primary-text-color);
      padding-bottom: 12px;
      border-bottom: 1px solid color-mix(in srgb, var(--divider-color) 60%, transparent);
      margin-bottom: 12px;
    }

    .section-header ha-icon {
      --mdc-icon-size: 20px;
      color: var(--primary-color);
    }

    /* ── Intro text ──────────────────────────────────── */
    .intro-text {
      margin: 0 0 10px 0;
      color: var(--primary-text-color);
      font-size: 0.92em;
      line-height: 1.6;
    }

    .intro-text:last-child { margin-bottom: 0; }

    /* ── Stats grid ──────────────────────────────────── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 6px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      background: rgba(40, 40, 40, 0.6);
      border-radius: 8px;
      border: 1px solid color-mix(in srgb, var(--divider-color) 60%, transparent);
    }

    .stat-item.stat-alert {
      border-color: var(--error-color, #f44336);
      background: color-mix(in srgb, var(--error-color, #f44336) 15%, rgba(40, 40, 40, 0.6));
    }

    .stat-item.stat-warn {
      border-color: var(--warning-color, #ff9800);
      background: color-mix(in srgb, var(--warning-color, #ff9800) 15%, rgba(40, 40, 40, 0.6));
    }

    .stat-item.stat-pending {
      opacity: 0.55;
    }

    .stat-icon {
      --mdc-icon-size: 20px;
      color: var(--primary-color);
      flex-shrink: 0;
    }

    .stat-alert .stat-icon { color: var(--error-color, #f44336); }
    .stat-warn  .stat-icon { color: var(--warning-color, #ff9800); }

    .stat-body {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .stat-label {
      font-size: 0.73em;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: 0.92em;
      font-weight: 500;
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Refresh button sits at end of section-header */
    .refresh-btn {
      margin-left: auto;
      --mdc-icon-button-size: 30px;
      --mdc-icon-size: 16px;
      color: var(--secondary-text-color);
    }

    .refresh-btn:hover {
      color: var(--primary-color);
    }

    /* ── Links grid ──────────────────────────────────── */
    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 6px;
    }

    .link-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid color-mix(in srgb, var(--divider-color) 60%, transparent);
      background: rgba(40, 40, 40, 0.6);
      text-decoration: none;
      color: var(--primary-text-color);
      transition: background 0.15s, border-color 0.15s;
    }

    .link-card:hover {
      background: color-mix(in srgb, var(--primary-color, #1b4f8a) 18%, rgba(40, 40, 40, 0.8));
      border-color: var(--primary-color);
    }

    .link-card > ha-icon:first-child {
      --mdc-icon-size: 20px;
      color: var(--primary-color);
      flex-shrink: 0;
    }

    .link-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .link-title {
      font-size: 0.92em;
      font-weight: 500;
    }

    .link-url {
      font-size: 0.75em;
      color: var(--secondary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .link-external {
      --mdc-icon-size: 14px;
      color: var(--secondary-text-color);
      flex-shrink: 0;
    }

    /* ── Footer ──────────────────────────────────────── */
    .footer {
      text-align: center;
      font-size: 0.75em;
      color: var(--secondary-text-color);
      padding: 4px 0 12px;
    }
  `;
}

if (!customElements.get('lcards-about-tab')) {
  customElements.define('lcards-about-tab', LCARdSAboutTab);
}
