/**
 * lcards-chart-series-list-editor.js
 * Chart series management component with collapsible cards
 *
 * Features:
 * - Unified DataSource approach (all series are DataSources)
 * - Entity picker + history slider for easy configuration
 * - Series-specific chart options (type, color, yaxis)
 * - Drag-to-reorder support
 * - Collapsible card UI (styled like animation-editor)
 *
 * Usage:
 * ```html
 * <lcards-chart-series-list-editor
 *   .hass=${this.hass}
 *   .config=${workingConfig}
 *   @config-changed=${(e) => this._handleConfigChanged(e.detail.config)}
 * ></lcards-chart-series-list-editor>
 * ```
 */

import { LitElement, html, css } from 'lit';
import { lcardsLog } from '../../utils/lcards-logging.js';
import './shared/lcards-form-section.js';
import './shared/lcards-message.js';
import '../dialogs/lcards-datasource-studio-dialog.js';

export class LCARdSChartSeriesListEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _expandedIndex: { type: Number, state: true },
      _showDataSourceDialog: { type: Boolean, state: true },
      _currentSeriesIndex: { type: Number, state: true }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
      }

      .series-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .series-item {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: var(--ha-card-border-radius, 12px);
        overflow: hidden;
      }

      .series-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        cursor: pointer;
        user-select: none;
        background: var(--secondary-background-color);
      }

      .series-header:hover {
        background: var(--primary-background-color);
      }

      .series-icon {
        color: var(--primary-color);
        --mdc-icon-size: 24px;
      }

      .series-info {
        flex: 1;
        min-width: 0;
      }

      .series-title-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }

      .series-title {
        font-weight: 600;
        font-size: 18px;
      }

      .series-mode-badge {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .series-mode-badge.quick {
        background: var(--success-color, #4caf50);
        color: white;
      }

      .series-mode-badge.advanced {
        background: var(--info-color, #2196f3);
        color: white;
      }

      .series-details {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-family: monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .series-actions {
        display: flex;
        gap: 4px;
      }

      .expand-icon {
        transition: transform 0.2s;
      }

      .expand-icon.expanded {
        transform: rotate(180deg);
      }

      .series-content {
        padding: 20px;
        background: var(--card-background-color, #fff);
      }

      .add-series-container {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }

      .add-series-container ha-button {
        flex: 1;
      }

      .empty-state {
        text-align: center;
        padding: 32px 16px;
        color: var(--secondary-text-color);
      }

      .empty-state ha-icon {
        font-size: 64px;
        opacity: 0.3;
        margin-bottom: 16px;
      }

      .empty-state-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .empty-state-subtitle {
        font-size: 14px;
        opacity: 0.7;
      }

      ha-icon-button {
        --mdc-icon-button-size: 36px;
        --mdc-icon-size: 20px;
      }

      .form-row {
        margin-bottom: 16px;
      }

      .form-row:last-child {
        margin-bottom: 0;
      }

      .grid-2col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .mode-toggle-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: var(--secondary-background-color);
        border-radius: 6px;
        margin-bottom: 16px;
      }

      .mode-toggle-label {
        font-weight: 500;
        font-size: 14px;
      }

      @media (max-width: 600px) {
        .grid-2col {
          grid-template-columns: 1fr;
        }
      }
    `;
  }

  constructor() {
    super();
    this.config = {};
    this._expandedIndex = null;
    this._showDataSourceDialog = false;
    this._currentSeriesIndex = null;
  }

  render() {
    const series = this._getSeriesList();

    return html`
      <div class="series-container">
        <!-- Add Series Button (Single unified approach) -->
        <div class="add-series-container">
          <ha-button @click=${() => this._addSeries()}>
            <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
            Add Series
          </ha-button>
        </div>

        ${series.length === 0 ? this._renderEmptyState() : ''}
        ${series.map((item, index) => this._renderSeriesItem(item, index))}
      </div>

      <!-- DataSource Creation Dialog -->
      <lcards-datasource-studio-dialog
        .hass=${this.hass}
        .mode=${'add'}
        .cardConfig=${this.config}
        .open=${this._showDataSourceDialog}
        @save=${this._handleDataSourceCreated}
        @cancel=${() => this._showDataSourceDialog = false}>
      </lcards-datasource-studio-dialog>
    `;
  }

  _renderEmptyState() {
    return html`
      <lcards-message type="info">
        <strong>📊 No Series Configured</strong><br>
        Add your first series to start building your chart. Use <strong>Quick Add</strong> for simple
        entity tracking, or <strong>Advanced Add</strong> to reference DataSources with transformations.
      </lcards-message>
    `;
  }

  _renderSeriesItem(item, index) {
    const isExpanded = this._expandedIndex === index;
    const mode = item.mode || 'quick';
    const title = item.name || `Series ${index + 1}`;
    const details = this._getSeriesDetails(item, mode);

    return html`
      <div class="series-item">
        <div class="series-header" @click=${() => this._toggleExpanded(index)}>
          <ha-icon
            class="series-icon"
            icon=${mode === 'quick' ? 'mdi:flash' : 'mdi:database-cog'}>
          </ha-icon>

          <div class="series-info">
            <div class="series-title-row">
              <span class="series-title">${title}</span>
              <span class="series-mode-badge ${mode}">${mode}</span>
            </div>
            <div class="series-details">${details}</div>
          </div>

          <div class="series-actions">
            <ha-icon-button
              @click=${(e) => this._moveSeries(e, index, -1)}
              .label=${'Move Up'}
              .disabled=${index === 0}>
              <ha-icon icon="mdi:arrow-up"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${(e) => this._moveSeries(e, index, 1)}
              .label=${'Move Down'}
              .disabled=${index === this._getSeriesList().length - 1}>
              <ha-icon icon="mdi:arrow-down"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${(e) => this._deleteSeries(e, index)}
              .label=${'Delete'}>
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>

          <ha-icon
            class="expand-icon ${isExpanded ? 'expanded' : ''}"
            icon="mdi:chevron-down">
          </ha-icon>
        </div>

        ${isExpanded ? html`
          <div class="series-content">
            ${this._renderSeriesForm(item, index, mode)}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderSeriesForm(item, index, mode) {
    return html`
      <!-- Mode Toggle -->
      <div class="mode-toggle-section">
        <span class="mode-toggle-label">
          ${mode === 'quick' ? '🚀 Quick Mode' : '⚙️ Advanced Mode'}
        </span>
        <ha-button
          size="small"
          @click=${() => this._toggleSeriesMode(index)}>
          <ha-icon icon=${mode === 'quick' ? 'mdi:cog' : 'mdi:flash'} slot="icon"></ha-icon>
          Switch to ${mode === 'quick' ? 'Advanced' : 'Quick'}
        </ha-button>
      </div>

      ${mode === 'quick' ? this._renderQuickMode(item, index) : this._renderAdvancedMode(item, index)}
    `;
  }

  _renderQuickMode(item, index) {
    const entity = item.entity || '';
    const windowHours = (item.window_seconds || 3600) / 3600;

    return html`
      <lcards-form-section header="Entity Data" icon="mdi:database" ?expanded=${true}>
        <div class="form-row">
          <ha-selector
            .hass=${this.hass}
            .selector=${{ entity: {} }}
            .value=${entity}
            .label=${'Entity'}
            .required=${true}
            @value-changed=${(e) => this._updateSeriesField(index, 'entity', e.detail.value)}>
          </ha-selector>
        </div>

        <div class="form-row">
          <label class="form-label">History Window: ${windowHours}h</label>
          <ha-selector
            .hass=${this.hass}
            .selector=${{ number: { min: 1, max: 168, step: 1, mode: 'slider', unit_of_measurement: 'hours' } }}
            .value=${windowHours}
            @value-changed=${(e) => this._updateSeriesField(index, 'window_seconds', e.detail.value * 3600, true)}>
          </ha-selector>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-top: 6px;">
            How far back to display data (1 hour to 7 days)
          </div>
        </div>
      </lcards-form-section>

      <lcards-form-section header="Series Options" icon="mdi:palette" ?expanded=${true}>
        <div class="form-row">
          <ha-selector
            .hass=${this.hass}
            .selector=${{ text: {} }}
            .value=${item.name || ''}
            .label=${'Series Name (optional)'}
            @value-changed=${(e) => this._updateSeriesField(index, 'name', e.detail.value)}>
          </ha-selector>
        </div>
      </lcards-form-section>
    `;
  }

  _renderAdvancedMode(item, index) {
    const sourceOptions = this._getDataSourceOptions();

    return html`
      <lcards-form-section header="DataSource" icon="mdi:database-cog" ?expanded=${true}>
        <div class="form-row">
          ${sourceOptions.length > 0 ? html`
            <ha-selector
              .hass=${this.hass}
              .selector=${{ select: { mode: 'dropdown', options: sourceOptions } }}
              .value=${item.source || ''}
              .label=${'Select DataSource'}
              .required=${true}
              @value-changed=${(e) => this._updateSeriesField(index, 'source', e.detail.value)}>
            </ha-selector>
          ` : html`
            <lcards-message type="info">
              No DataSources available. Create one below to get started.
            </lcards-message>
          `}
        </div>

        <div class="form-row">
          <ha-button
            @click=${() => this._openDataSourceDialog(index)}>
            <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
            Create New DataSource
          </ha-button>
        </div>
      </lcards-form-section>

      <lcards-form-section header="Chart Options" icon="mdi:chart-line" ?expanded=${true}>
        <div class="form-row">
          <ha-selector
            .hass=${this.hass}
            .selector=${{ text: {} }}
            .value=${item.name || ''}
            .label=${'Series Name'}
            @value-changed=${(e) => this._updateSeriesField(index, 'name', e.detail.value)}>
          </ha-selector>
        </div>

        <div class="grid-2col">
          <div class="form-row">
            <ha-selector
              .hass=${this.hass}
              .selector=${{
                select: {
                  mode: 'dropdown',
                  options: [
                    { value: 'line', label: 'Line' },
                    { value: 'area', label: 'Area' },
                    { value: 'bar', label: 'Bar' },
                    { value: 'scatter', label: 'Scatter' }
                  ]
                }
              }}
              .value=${item.type || 'line'}
              .label=${'Type'}
              @value-changed=${(e) => this._updateSeriesField(index, 'type', e.detail.value)}>
            </ha-selector>
          </div>

          <div class="form-row">
            <ha-selector
              .hass=${this.hass}
              .selector=${{ text: { type: 'color' } }}
              .value=${item.color || ''}
              .label=${'Color'}
              @value-changed=${(e) => this._updateSeriesField(index, 'color', e.detail.value)}>
            </ha-selector>
          </div>
        </div>

        <div class="form-row">
          <ha-selector
            .hass=${this.hass}
            .selector=${{ number: { min: 0, max: 5, mode: 'box' } }}
            .value=${item.yaxis || 0}
            .label=${'Y-Axis Index'}
            @value-changed=${(e) => this._updateSeriesField(index, 'yaxis', e.detail.value)}>
          </ha-selector>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-top: 6px;">
            Use different y-axes for multiple scales (0 = default)
          </div>
        </div>
      </lcards-form-section>
    `;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  _getSeriesList() {
    // Get series from config.sources array (schema-compliant)
    // Each item can be Quick mode (entity + window_seconds) or Advanced (source ref + chart options)
    const sources = this.config?.sources || [];
    const dataSources = this.config?.data_sources || {};

    return sources.map((sourceName, index) => {
      // Check if this is a DataSource reference or inline entity config
      const dsConfig = dataSources[sourceName];

      if (dsConfig) {
        // Check if this is a Quick mode DataSource (series_1, series_2) or Advanced DataSource (custom names)
        const isQuickDataSource = sourceName.match(/^series_\d+$/);

        if (isQuickDataSource) {
          // Quick mode - auto-named DataSource with history config
          const hours = dsConfig.history?.hours || ((dsConfig.window_seconds || 3600) / 3600);
          return {
            mode: 'quick',
            entity: dsConfig.entity || '',
            window_seconds: hours * 3600,
            name: dsConfig.name || ''
          };
        } else {
          // Advanced mode - references a custom named DataSource
          return {
            mode: 'advanced',
            source: sourceName,
            name: dsConfig.name || sourceName,
            type: 'line',
            color: '',
            yaxis: 0
          };
        }
      } else {
        // Fallback: treat as Quick mode entity
        return {
          mode: 'quick',
          entity: sourceName,
          window_seconds: 3600,
          name: ''
        };
      }
    });
  }

  _getSeriesDetails(item, mode) {
    if (mode === 'quick') {
      const hours = (item.window_seconds || 3600) / 3600;
      return item.entity ? `${item.entity} • ${hours}h history` : 'No entity selected';
    } else {
      const parts = [];
      if (item.source) parts.push(`Source: ${item.source}`);
      if (item.type) parts.push(`Type: ${item.type}`);
      if (item.color) parts.push(`Color: ${item.color}`);
      return parts.length > 0 ? parts.join(' • ') : 'Not configured';
    }
  }

  /**
   * Get all available DataSource options (card-local + global)
   */
  _getDataSourceOptions() {
    const options = [];

    // Card-local DataSources
    const cardSources = this.config?.data_sources || {};
    Object.keys(cardSources).forEach(name => {
      options.push({
        value: name,
        label: `📍 ${name} (card-local)`
      });
    });

    // Global DataSources from singleton
    const dsManager = window.lcards?.core?.dataSourceManager;
    if (dsManager?.sources) {
      dsManager.sources.forEach((source, name) => {
        // Don't duplicate card-local sources
        if (!cardSources[name]) {
          options.push({
            value: name,
            label: `🌐 ${name} (global)`
          });
        }
      });
    }

    return options;
  }

  /**
   * Open DataSource creation dialog
   */
  _openDataSourceDialog(seriesIndex) {
    this._currentSeriesIndex = seriesIndex;
    this._showDataSourceDialog = true;
    lcardsLog.debug('[ChartSeriesListEditor] Opening DataSource dialog for series:', seriesIndex);
  }

  /**
   * Handle DataSource creation from dialog
   */
  _handleDataSourceCreated(event) {
    const { name, config } = event.detail;

    lcardsLog.info('[ChartSeriesListEditor] DataSource created:', name);

    // Update config with new DataSource
    const newConfig = {
      ...this.config,
      data_sources: {
        ...(this.config.data_sources || {}),
        [name]: config
      }
    };

    // If we're creating for a specific series, auto-select it
    if (this._currentSeriesIndex !== null) {
      this._updateSeriesField(this._currentSeriesIndex, 'source', name);
    }

    // Close dialog
    this._showDataSourceDialog = false;
    this._currentSeriesIndex = null;

    // Notify parent of config change
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    }));

    this.requestUpdate();
  }

  _toggleExpanded(index) {
    this._expandedIndex = this._expandedIndex === index ? null : index;
  }

  _addSeries() {
    const series = this._getSeriesList();
    const newSeries = {
      entity: '',
      window_seconds: 3600,
      name: '',
      type: 'line',
      color: '',
      yaxis: 0
    };

    series.push(newSeries);
    this._updateConfig(series);
    this._expandedIndex = series.length - 1;

    lcardsLog.info('[ChartSeriesListEditor] Added series:', { index: series.length - 1 });
  }

  _deleteSeries(event, index) {
    event.stopPropagation();
    const series = this._getSeriesList();
    series.splice(index, 1);

    if (this._expandedIndex === index) {
      this._expandedIndex = null;
    } else if (this._expandedIndex > index) {
      this._expandedIndex--;
    }

    this._updateConfig(series);
    lcardsLog.info('[ChartSeriesListEditor] Deleted series:', { index });
  }

  _moveSeries(event, index, direction) {
    event.stopPropagation();
    const series = this._getSeriesList();
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= series.length) return;

    const [item] = series.splice(index, 1);
    series.splice(newIndex, 0, item);

    if (this._expandedIndex === index) {
      this._expandedIndex = newIndex;
    } else if (this._expandedIndex === newIndex) {
      this._expandedIndex = index;
    }

    this._updateConfig(series);
    lcardsLog.info('[ChartSeriesListEditor] Moved series:', { from: index, to: newIndex });
  }

  _toggleSeriesMode(index) {
    const series = this._getSeriesList();
    const item = series[index];
    const newMode = item.mode === 'quick' ? 'advanced' : 'quick';
    const newConfig = { ...this.config };

    if (newMode === 'advanced') {
      // Quick → Advanced: Create DataSource from entity config
      const timestamp = Date.now();
      const dsName = `chart_series_${timestamp}`;

      // Find and remove the old Quick mode DataSource (series_N)
      const oldDataSourceName = this.config.sources?.[index];
      if (oldDataSourceName && oldDataSourceName.match(/^series_\d+$/)) {
        // This is a Quick mode DataSource, remove it
        if (newConfig.data_sources && newConfig.data_sources[oldDataSourceName]) {
          delete newConfig.data_sources[oldDataSourceName];
          lcardsLog.info('[ChartSeriesListEditor] Quick→Advanced: Removed old Quick DataSource', {
            name: oldDataSourceName
          });
        }
      }

      // Create DataSource config from Quick mode entity settings
      const dataSourceConfig = {
        entity: item.entity || '',
        window_seconds: item.window_seconds || 3600,
        name: item.name || `Series ${index + 1}`
      };

      // Add DataSource to config
      if (!newConfig.data_sources) {
        newConfig.data_sources = {};
      }
      newConfig.data_sources[dsName] = dataSourceConfig;

      // Update series to Advanced mode
      series[index] = {
        mode: 'advanced',
        source: dsName,
        name: item.name || '',
        type: 'line',
        color: '',
        yaxis: 0
      };

      lcardsLog.info('[ChartSeriesListEditor] Quick→Advanced: Created DataSource', {
        name: dsName,
        entity: dataSourceConfig.entity,
        window: dataSourceConfig.window_seconds
      });
    } else {
      // Advanced → Quick: Convert DataSource back to inline entity
      const oldDataSourceName = item.source;
      const dataSources = newConfig.data_sources || {};
      const dsConfig = dataSources[oldDataSourceName];

      // Extract entity and window from DataSource (if it exists)
      const entity = dsConfig?.entity || '';
      const window_seconds = dsConfig?.window_seconds || 3600;

      // Convert to Quick mode
      series[index] = {
        mode: 'quick',
        entity: entity,
        window_seconds: window_seconds,
        name: item.name || ''
      };

      // Check if this DataSource is used by other series
      const isUsedElsewhere = series.some((s, i) =>
        i !== index && s.mode === 'advanced' && s.source === oldDataSourceName
      );

      // Clean up unused DataSource
      if (!isUsedElsewhere && oldDataSourceName && dataSources[oldDataSourceName]) {
        delete newConfig.data_sources[oldDataSourceName];
        lcardsLog.info('[ChartSeriesListEditor] Advanced→Quick: Removed unused DataSource', {
          name: oldDataSourceName
        });
      } else if (isUsedElsewhere) {
        lcardsLog.info('[ChartSeriesListEditor] Advanced→Quick: Kept DataSource (used by other series)', {
          name: oldDataSourceName
        });
      }
    }

    // Update sources array
    newConfig.sources = series.map((s) =>
      s.mode === 'quick' ? s.entity : s.source
    );

    // Dispatch config-changed event
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    }));

    this.requestUpdate();
  }

  _updateSeriesField(index, field, value, immediate = false) {
    const series = this._getSeriesList();
    series[index][field] = value;

    if (immediate) {
      // Immediate update for sliders and critical fields
      this._updateConfig(series);
    } else {
      // Debounce config updates for text fields to prevent rapid re-renders
      clearTimeout(this._updateTimeout);
      this._updateTimeout = setTimeout(() => {
        this._updateConfig(series);
      }, 300);
    }
  }

  _updateConfig(series) {
    // Convert series list back to config format
    const newConfig = { ...this.config };

    // Update DataSources for Quick mode items FIRST (so we have proper names)
    if (!newConfig.data_sources) {
      newConfig.data_sources = {};
    }

    // Find the next available series_N number
    const existingSeriesNumbers = Object.keys(newConfig.data_sources)
      .filter(name => name.match(/^series_(\d+)$/))
      .map(name => parseInt(name.match(/^series_(\d+)$/)[1]));
    const maxSeriesNumber = existingSeriesNumbers.length > 0 ? Math.max(...existingSeriesNumbers) : 0;

    // Track which DataSource names we're using
    const usedDataSourceNames = new Set();
    let nextSeriesNumber = 1;

    // Clean up old Quick mode DataSources that are no longer in use
    const currentSources = this.config.sources || [];
    Object.keys(newConfig.data_sources).forEach(dsName => {
      if (dsName.match(/^series_\d+$/) && !currentSources.includes(dsName)) {
        // This Quick mode DataSource is not in the current sources array
        const stillNeeded = series.some(s => s.mode === 'quick' && s.entity === newConfig.data_sources[dsName]?.entity);
        if (!stillNeeded) {
          delete newConfig.data_sources[dsName];
        }
      }
    });

    series.forEach((item, index) => {
      if (item.mode === 'quick' && item.entity) {
        // For Quick mode, find or create a properly named DataSource
        // Check if this entity already has a series_N DataSource
        let sourceName = null;
        for (const [dsName, dsConfig] of Object.entries(newConfig.data_sources)) {
          if (dsName.match(/^series_\d+$/) && dsConfig.entity === item.entity) {
            sourceName = dsName;
            break;
          }
        }

        // If not found, create a new one with next available number
        if (!sourceName) {
          while (newConfig.data_sources[`series_${nextSeriesNumber}`]) {
            nextSeriesNumber++;
          }
          sourceName = `series_${nextSeriesNumber}`;
          nextSeriesNumber++;
        }

        usedDataSourceNames.add(sourceName);

        newConfig.data_sources[sourceName] = {
          entity: item.entity,
          history: {
            preload: true,
            hours: Math.round((item.window_seconds || 3600) / 3600)
          },
          name: item.name || `Series ${index + 1}`
        };

        // Store the source name so we can map it in sources array
        item._generatedSourceName = sourceName;
      } else if (item.mode === 'advanced') {
        usedDataSourceNames.add(item.source);
      }
    });

    // Update sources array to use proper DataSource names
    newConfig.sources = series.map((item, index) => {
      if (item.mode === 'quick') {
        return item._generatedSourceName; // Use the generated/found DataSource name
      } else {
        return item.source; // Use existing DataSource name
      }
    });

    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    }));

    this.requestUpdate();
  }
}

customElements.define('lcards-chart-series-list-editor', LCARdSChartSeriesListEditor);
