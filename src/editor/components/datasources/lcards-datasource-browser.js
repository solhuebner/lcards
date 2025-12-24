/**
 * LCARdS DataSource Browser
 *
 * Professional modal dialog for browsing and inspecting all datasources
 * (card-local and global) with hierarchical tree view and live detail pane.
 *
 * Features:
 * - Tree view: Datasources → Entity → Transformations → Aggregations → Buffers
 * - Detail pane: Live values, configuration, buffer charts/tables
 * - Live subscription to DataSourceManager (no polling)
 * - Responsive styling matching Theme Browser & Provenance Inspector
 *
 * @element lcards-datasource-browser
 * @fires closed - When dialog is closed
 *
 * @property {Object} hass - Home Assistant instance
 * @property {Object} cardConfig - Card configuration (optional, for card-local context)
 */

import { LitElement, html, css } from 'lit';
import { lcardsLog } from '../../../utils/lcards-logging.js';

export class LCARdSDataSourceBrowser extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      cardConfig: { type: Object },
      open: { type: Boolean },
      _selectedNode: { type: Object, state: true },
      _expandedNodes: { state: true, attribute: false },
      _treeData: { type: Array, state: true },
      _subscriptions: { state: true, attribute: false }
    };
  }

  constructor() {
    super();
    this.open = false;
    this._selectedNode = null;
    this._expandedNodes = new Set();
    this._treeData = [];
    this._subscriptions = new Map();
  }

  updated(changedProps) {
    super.updated(changedProps);

    // When dialog opens, build tree and subscribe
    if (changedProps.has('open') && this.open) {
      this._buildTreeData();
      this._subscribeToDataSources();
    }

    // When dialog closes, unsubscribe
    if (changedProps.has('open') && !this.open) {
      this._unsubscribeAll();
    }
  }

  /**
   * Close the browser dialog
   * @private
   */
  _handleClose() {
    this._unsubscribeAll();
    this.dispatchEvent(new CustomEvent('close'));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribeAll();
  }

  /**
   * Build hierarchical tree data from DataSourceManager
   * @private
   */
  _buildTreeData() {
    const dsManager = window.lcards?.core?.dataSourceManager;
    if (!dsManager) {
      lcardsLog.warn('[DataSourceBrowser] DataSourceManager not available');
      this._treeData = [];
      return;
    }

    const tree = [];

    // Get all sources from manager
    const sources = dsManager.sources || new Map();

    sources.forEach((dataSource, sourceName) => {
      const node = {
        id: `ds_${sourceName}`,
        type: 'datasource',
        label: sourceName,
        icon: 'mdi:database',
        data: dataSource,
        children: []
      };

      // Add entity node
      if (dataSource.cfg?.entity) {
        node.children.push({
          id: `${node.id}_entity`,
          type: 'entity',
          label: dataSource.cfg.entity,
          icon: 'mdi:home-assistant',
          data: { entityId: dataSource.cfg.entity },
          children: []
        });
      }

      // Add transformations
      if (dataSource.transformations && dataSource.transformations.size > 0) {
        const transformsNode = {
          id: `${node.id}_transforms`,
          type: 'transformations',
          label: `Transformations (${dataSource.transformations.size})`,
          icon: 'mdi:sync',
          data: Array.from(dataSource.transformations.entries()),
          children: []
        };

        let idx = 0;
        dataSource.transformations.forEach((processor, key) => {
          transformsNode.children.push({
            id: `${node.id}_transform_${idx}`,
            type: 'transformation',
            label: `${key}`,
            icon: 'mdi:sync',
            data: { key, processor },
            children: []
          });
          idx++;
        });

        node.children.push(transformsNode);
      }

      // Add aggregations
      if (dataSource.aggregations && dataSource.aggregations.size > 0) {
        const aggsNode = {
          id: `${node.id}_aggs`,
          type: 'aggregations',
          label: `Aggregations (${dataSource.aggregations.size})`,
          icon: 'mdi:chart-line',
          data: Array.from(dataSource.aggregations.entries()),
          children: []
        };

        dataSource.aggregations.forEach((processor, key) => {
          aggsNode.children.push({
            id: `${node.id}_agg_${key}`,
            type: 'aggregation',
            label: key,
            icon: 'mdi:chart-line',
            data: { key, processor },
            children: []
          });
        });

        node.children.push(aggsNode);
      }

      // Add buffers
      const bufferNode = {
        id: `${node.id}_buffers`,
        type: 'buffers',
        label: 'Buffers',
        icon: 'mdi:database-outline',
        data: {},
        children: []
      };

      // Main buffer
      if (dataSource.buffer) {
        bufferNode.children.push({
          id: `${node.id}_buffer_main`,
          type: 'buffer',
          label: `Main Buffer (${dataSource.buffer.size()} values)`,
          icon: 'mdi:database-outline',
          data: { buffer: dataSource.buffer, bufferType: 'main' },
          children: []
        });
      }

      // Transformed buffers (Map)
      if (dataSource.transformedBuffers && dataSource.transformedBuffers.size > 0) {
        dataSource.transformedBuffers.forEach((buffer, key) => {
          bufferNode.children.push({
            id: `${node.id}_buffer_${key}`,
            type: 'buffer',
            label: `${key} Buffer (${buffer.size()} values)`,
            icon: 'mdi:database-outline',
            data: { buffer, bufferType: key },
            children: []
          });
        });
      }

      if (bufferNode.children.length > 0) {
        node.children.push(bufferNode);
      }

      tree.push(node);
    });

    this._treeData = tree;
    lcardsLog.debug('[DataSourceBrowser] Tree data built', { nodeCount: tree.length });
  }

  /**
   * Subscribe to all datasources for live updates
   * @private
   */
  _subscribeToDataSources() {
    const dsManager = window.lcards?.core?.dataSourceManager;
    if (!dsManager) return;

    const sources = dsManager.sources || new Map();

    sources.forEach((dataSource, sourceName) => {
      if (dataSource.subscribe) {
        const unsubscribe = dataSource.subscribe(() => {
          // Data updated - rebuild tree if needed
          this.requestUpdate();
        });

        this._subscriptions.set(sourceName, unsubscribe);
      }
    });

    lcardsLog.debug('[DataSourceBrowser] Subscribed to datasources', {
      count: this._subscriptions.size
    });
  }

  /**
   * Unsubscribe from all datasources
   * @private
   */
  _unsubscribeAll() {
    this._subscriptions.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });

    this._subscriptions.clear();
  }

  /**
   * Toggle node expansion
   * @private
   */
  _toggleNode(nodeId) {
    if (this._expandedNodes.has(nodeId)) {
      this._expandedNodes.delete(nodeId);
    } else {
      this._expandedNodes.add(nodeId);
    }
    this.requestUpdate();
  }

  /**
   * Select a node
   * @private
   */
  _selectNode(node) {
    this._selectedNode = node;
    this.requestUpdate();
  }

  /**
   * Render tree nodes recursively
   * @private
   */
  _renderTreeNodes(nodes, level = 0) {
    return nodes.map(node => html`
      <div class="tree-node" style="--node-level: ${level}">
        <div
          class="tree-node-content ${this._selectedNode?.id === node.id ? 'selected' : ''}"
          @click=${() => this._selectNode(node)}>
          <span
            class="tree-expander ${node.children.length === 0 ? 'leaf' : ''} ${this._expandedNodes.has(node.id) ? 'expanded' : ''}"
            @click=${(e) => {
              e.stopPropagation();
              if (node.children.length > 0) {
                this._toggleNode(node.id);
              }
            }}>
            ${node.children.length > 0 ? (this._expandedNodes.has(node.id) ? '▼' : '▶') : ''}
          </span>
          <ha-icon icon="${node.icon}"></ha-icon>
          <span class="node-label">${node.label}</span>
        </div>
        ${this._expandedNodes.has(node.id) && node.children.length > 0
          ? html`<div class="tree-node-children">${this._renderTreeNodes(node.children, level + 1)}</div>`
          : ''}
      </div>
    `);
  }

  /**
   * Render node detail pane
   * @private
   */
  _renderNodeDetail() {
    if (!this._selectedNode) {
      return html`
        <div class="detail-panel-empty">
          <ha-icon icon="mdi:cursor-pointer"></ha-icon>
          <p>Select a node from the tree to view details</p>
        </div>
      `;
    }

    const { type, label, data } = this._selectedNode;

    return html`
      <div class="detail-panel">
        <div class="detail-header">
          <ha-icon icon="${this._selectedNode.icon}"></ha-icon>
          <h3>${label}</h3>
          <span class="detail-type">${type}</span>
        </div>

        <div class="detail-content">
          ${this._renderDetailContent(type, data)}
        </div>
      </div>
    `;
  }

  /**
   * Render detail content based on node type
   * @private
   */
  _renderDetailContent(type, data) {
    switch (type) {
      case 'datasource':
        return this._renderDataSourceDetail(data);
      case 'entity':
        return this._renderEntityDetail(data);
      case 'transformation':
        return this._renderTransformationDetail(data);
      case 'aggregation':
        return this._renderAggregationDetail(data);
      case 'buffer':
        return this._renderBufferDetail(data);
      default:
        return html`<p>No detail view for ${type}</p>`;
    }
  }

  /**
   * Render datasource detail
   * @private
   */
  _renderDataSourceDetail(dataSource) {
    return html`
      <div class="detail-section">
        <h4>Configuration</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Entity ID:</span>
            <span class="detail-value">${dataSource.cfg?.entity || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Attribute:</span>
            <span class="detail-value">${dataSource.cfg?.attribute || '__state__'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Window:</span>
            <span class="detail-value">${dataSource.cfg?.windowSeconds || 60}s</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Min Emit:</span>
            <span class="detail-value">${dataSource.minEmitMs || 0}ms</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Buffer Size:</span>
            <span class="detail-value">${dataSource.buffer?.size() || 0} / ${dataSource.buffer?.capacity || 0}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Subscribers:</span>
            <span class="detail-value">${dataSource.subscribers?.size || 0}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h4>Current Value</h4>
        <div class="current-value">
          ${dataSource.buffer && dataSource.buffer.size() > 0
            ? html`
              <div class="value-display">
                <div><strong>Value:</strong> ${dataSource.buffer.last()?.v ?? 'N/A'}</div>
                <div><strong>Timestamp:</strong> ${dataSource.buffer.last()?.t ? new Date(dataSource.buffer.last().t).toLocaleString() : 'N/A'}</div>
              </div>
            `
            : html`<em>No data</em>`}
        </div>
      </div>
    `;
  }

  /**
   * Render entity detail
   * @private
   */
  _renderEntityDetail(data) {
    const entity = this.hass?.states?.[data.entityId];

    if (!entity) {
      return html`<p>Entity not found: ${data.entityId}</p>`;
    }

    return html`
      <div class="detail-section">
        <h4>Entity State</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">State:</span>
            <span class="detail-value">${entity.state}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Last Changed:</span>
            <span class="detail-value">${new Date(entity.last_changed).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h4>Attributes</h4>
        <div class="attributes-table">
          ${Object.entries(entity.attributes).map(([key, value]) => html`
            <div class="attribute-row">
              <span class="attribute-key">${key}:</span>
              <span class="attribute-value">${JSON.stringify(value)}</span>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  /**
   * Render transformation detail
   * @private
   */
  /**
   * Render transformation detail
   * @private
   */
  _renderTransformationDetail(data) {
    const { key, processor } = data;

    // Create a clean object without hass and circular references
    const cleanConfig = this._sanitizeForDisplay(processor);

    return html`
      <div class="detail-section">
        <h4>Transformation: ${key}</h4>
        <pre class="config-block">${JSON.stringify(cleanConfig, null, 2)}</pre>
      </div>
    `;
  }

  /**
   * Render aggregation detail
   * @private
   */
  _renderAggregationDetail(data) {
    const { key, processor } = data;

    // Create a clean object without hass and circular references
    const cleanConfig = this._sanitizeForDisplay(processor);

    return html`
      <div class="detail-section">
        <h4>Aggregation: ${key}</h4>
        <pre class="config-block">${JSON.stringify(cleanConfig, null, 2)}</pre>
      </div>
    `;
  }

  /**
   * Sanitize object for JSON display - remove hass, circular refs, functions
   * @private
   */
  _sanitizeForDisplay(obj, depth = 0, seen = new WeakSet()) {
    if (depth > 10) return '[Max Depth]';
    if (obj === null || obj === undefined) return obj;

    // Handle primitives
    if (typeof obj !== 'object' && typeof obj !== 'function') return obj;

    // Skip functions
    if (typeof obj === 'function') return '[Function]';

    // Handle circular references
    if (seen.has(obj)) return '[Circular]';
    seen.add(obj);

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => this._sanitizeForDisplay(item, depth + 1, seen));
    }

    // Handle objects
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip hass object and known problematic keys
      if (key === 'hass' || key === '_hass' || key === 'hassInstance') {
        cleaned[key] = '[HASS Object - Hidden]';
        continue;
      }

      // Skip functions
      if (typeof value === 'function') {
        continue;
      }

      cleaned[key] = this._sanitizeForDisplay(value, depth + 1, seen);
    }

    return cleaned;
  }

  /**
   * Render buffer detail
   * @private
   */
  _renderBufferDetail(data) {
    const { buffer, bufferType } = data;

    if (!buffer || !buffer.size || buffer.size() === 0) {
      return html`
        <div class="detail-section">
          <h4>${bufferType} Buffer</h4>
          <p><em>No data in buffer</em></p>
        </div>
      `;
    }

    const bufferSize = buffer.size();
    const allData = buffer.getAll(); // Get all buffer data
    const last10 = allData.slice(-10).reverse();

    return html`
      <div class="detail-section">
        <h4>${bufferType} Buffer (${bufferSize} / ${buffer.capacity} values)</h4>
        <div class="buffer-table">
          ${last10.map((entry, idx) => html`
            <div class="buffer-row">
              <span class="buffer-index">#${bufferSize - idx}</span>
              <span class="buffer-time">${new Date(entry.t).toLocaleTimeString()}</span>
              <span class="buffer-value">${entry.v}</span>
            </div>
          `)}
        </div>
        ${bufferSize > 10 ? html`<p class="buffer-note">Showing last 10 of ${bufferSize} values</p>` : ''}
      </div>
    `;
  }  static get styles() {
    return css`
      :host {
        display: block;
      }

      /* Dialog styles matching Provenance Inspector */
      ha-dialog {
        --mdc-dialog-min-width: 90vw;
        --mdc-dialog-max-width: 90vw;
        --mdc-dialog-min-height: 600px;
      }

      .dialog-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        height: 75vh;
        max-height: 75vh;
        overflow: hidden;
      }

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 12px;
        border-bottom: 2px solid var(--divider-color);
        flex-shrink: 0;
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      /* Split pane layout */
      .split-pane-container {
        display: grid;
        grid-template-columns: 35% 65%;
        grid-template-rows: minmax(0, 1fr);
        gap: 16px;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      /* Tree pane */
      .tree-pane {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-right: 1px solid var(--divider-color);
        min-height: 0;
      }

      .tree-pane-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
        background: var(--secondary-background-color);
        flex-shrink: 0;
      }

      .tree-pane-header span {
        font-weight: 500;
        font-size: 14px;
        color: var(--primary-text-color);
      }

      .tree-container {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        background: var(--code-background-color, #1e1e1e);
        border-radius: 8px;
      }

      /* Tree nodes */
      .tree-node {
        margin-left: calc(var(--node-level, 0) * 16px);
        margin-bottom: 4px;
      }

      .tree-node-content {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s;
        user-select: none;
      }

      .tree-node-content:hover {
        background: var(--secondary-background-color);
      }

      .tree-node-content.selected {
        background: var(--primary-color);
        color: var(--text-primary-color, white);
      }

      .tree-expander {
        width: 16px;
        text-align: center;
        font-size: 12px;
        transition: transform 0.2s;
      }

      .tree-expander.leaf {
        opacity: 0;
      }

      .tree-expander.expanded {
        transform: rotate(0deg);
      }

      .node-label {
        flex: 1;
        font-size: 14px;
      }

      /* Detail pane */
      .detail-pane {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 0;
      }

      .detail-pane-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding-left: 8px;
      }

      .detail-panel-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--secondary-text-color);
        gap: 16px;
      }

      .detail-panel-empty ha-icon {
        --mdc-icon-size: 64px;
        opacity: 0.3;
      }

      .detail-panel {
        height: 100%;
      }

      .detail-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: var(--secondary-background-color);
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .detail-header h3 {
        margin: 0;
        flex: 1;
        font-size: 18px;
      }

      .detail-type {
        padding: 4px 12px;
        background: var(--primary-color);
        color: var(--text-primary-color, white);
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
      }

      .detail-content {
        padding: 0 16px;
      }

      .detail-section {
        margin-bottom: 24px;
      }

      .detail-section h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .detail-grid {
        display: grid;
        gap: 12px;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: var(--secondary-background-color);
        border-radius: 6px;
      }

      .detail-label {
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      .detail-value {
        font-family: 'Courier New', monospace;
        color: var(--primary-text-color);
      }

      .current-value {
        padding: 12px;
        background: var(--code-background-color, #1e1e1e);
        border-radius: 6px;
        overflow-x: auto;
      }

      .current-value code {
        color: var(--primary-color);
        font-size: 13px;
      }

      .config-block {
        padding: 12px;
        background: var(--code-background-color, #1e1e1e);
        border-radius: 6px;
        overflow-x: auto;
        color: var(--primary-color);
        font-size: 13px;
      }

      .attributes-table {
        display: grid;
        gap: 8px;
      }

      .attribute-row {
        display: flex;
        gap: 8px;
        padding: 8px 12px;
        background: var(--secondary-background-color);
        border-radius: 6px;
      }

      .attribute-key {
        font-weight: 500;
        color: var(--secondary-text-color);
        min-width: 150px;
      }

      .attribute-value {
        font-family: 'Courier New', monospace;
        color: var(--primary-text-color);
        word-break: break-all;
      }

      .buffer-table {
        display: grid;
        gap: 4px;
        padding: 12px;
        background: var(--code-background-color, #1e1e1e);
        border-radius: 8px;
        max-height: 400px;
        overflow-y: auto;
      }

      .buffer-row {
        display: grid;
        grid-template-columns: 60px 120px 1fr;
        gap: 12px;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        align-items: center;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .buffer-index {
        color: var(--secondary-text-color);
        font-weight: bold;
      }

      .buffer-time {
        color: var(--secondary-text-color);
        font-size: 12px;
      }

      .buffer-value {
        color: var(--primary-color);
        word-break: break-all;
      }

      .buffer-note {
        margin-top: 8px;
        font-size: 13px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .value-display {
        padding: 12px;
        background: var(--code-background-color, #1e1e1e);
        border-radius: 8px;
        font-family: 'Courier New', monospace;
      }

      .value-display div {
        margin: 6px 0;
      }
    `;
  }

  render() {
    if (!this.open) {
      return html``;
    }

    return html`
      <ha-dialog
        open
        @closed=${this._handleClose}
        .heading=${'DataSource Browser'}>
        <div class="dialog-content">
          <div class="dialog-header">
            <h2>🔍 DataSource Browser</h2>
          </div>

          <div class="split-pane-container">
            <!-- Left Pane: Tree View -->
            <div class="tree-pane">
              <div class="tree-pane-header">
                <span>Data Sources (${this._treeData.length})</span>
              </div>
              <div class="tree-container">
                ${this._treeData.length > 0
                  ? this._renderTreeNodes(this._treeData)
                  : html`<p style="color: var(--secondary-text-color); text-align: center; padding: 24px;">No datasources found</p>`}
              </div>
            </div>

            <!-- Right Pane: Detail View -->
            <div class="detail-pane">
              <div class="detail-pane-content">
                ${this._renderNodeDetail()}
              </div>
            </div>
          </div>
        </div>

        <ha-button
          slot="primaryAction"
          @click=${this._handleClose}
          dialogAction="close">
          Close
        </ha-button>
      </ha-dialog>
    `;
  }
}

customElements.define('lcards-datasource-browser', LCARdSDataSourceBrowser);
