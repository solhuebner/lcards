/**
 * LCARdS Template Evaluation Tab
 *
 * Displays all templates and tokens found in card config with live evaluation results.
 * Helps users discover, debug, and utilize templates across all supported syntaxes:
 * - JavaScript: [[[...]]]
 * - LCARdS Tokens: {theme:...}, {datasource:...}, {ds:...}, {entity.state}, etc.
 * - Jinja2: {{...}}
 *
 * @element lcards-template-evaluation-tab
 * @property {Object} editor - Parent card editor instance
 * @property {Object} config - Full card configuration
 * @property {Object} hass - Home Assistant instance
 */

import { LitElement, html, css } from 'lit';
import { TemplateDetector } from '../../../core/templates/TemplateDetector.js';
import { LCARdSCardTemplateEvaluator } from '../../../core/templates/LCARdSCardTemplateEvaluator.js';
import { UnifiedTemplateEvaluator } from '../../../core/templates/UnifiedTemplateEvaluator.js';
import { lcardsLog } from '../../../utils/lcards-logging.js';
import '../common/lcards-message.js';

export class LCARdSTemplateEvaluationTab extends LitElement {
  static get properties() {
    return {
      editor: { type: Object },
      config: { type: Object },
      hass: { type: Object },
      _templates: { type: Array, state: true },
      _isEvaluating: { type: Boolean, state: true },
      _filterType: { type: String, state: true }
    };
  }

  constructor() {
    super();
    this._templates = [];
    this._isEvaluating = false;
    this._filterType = 'all';
  }

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 16px;
      }

      .syntax-reference {
        background: var(--secondary-background-color, #f5f5f5);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 24px;
      }

      .syntax-reference h3 {
        margin-top: 0;
        color: var(--primary-text-color);
        font-size: 16px;
        font-weight: 500;
      }

      .syntax-list {
        display: grid;
        gap: 8px;
        margin-top: 12px;
      }

      .syntax-item {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 12px;
        align-items: start;
      }

      .syntax-code {
        font-family: 'Courier New', monospace;
        background: var(--code-background-color, #282c34);
        color: var(--code-text-color, #abb2bf);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 13px;
        white-space: nowrap;
      }

      .syntax-description {
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      .filter-bar {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }

      .filter-chip {
        padding: 6px 12px;
        border-radius: 16px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
      }

      .filter-chip:hover {
        background: var(--secondary-background-color);
      }

      .filter-chip.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .templates-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }

      .templates-table thead {
        background: var(--secondary-background-color);
      }

      .templates-table th {
        padding: 12px;
        text-align: left;
        font-weight: 500;
        border-bottom: 2px solid var(--divider-color);
      }

      .templates-table td {
        padding: 12px;
        border-bottom: 1px solid var(--divider-color);
        vertical-align: top;
      }

      .templates-table tr:hover {
        background: var(--secondary-background-color);
      }

      .template-path {
        font-family: 'Courier New', monospace;
        color: var(--primary-color);
        font-size: 12px;
      }

      .template-raw {
        font-family: 'Courier New', monospace;
        background: var(--code-background-color, #282c34);
        color: var(--code-text-color, #abb2bf);
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        max-width: 300px;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-all;
      }

      .template-type {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
      }

      .type-javascript {
        background: #f7df1e;
        color: #000;
      }

      .type-token {
        background: #61dafb;
        color: #000;
      }

      .type-theme {
        background: #9c27b0;
        color: white;
      }

      .type-datasource {
        background: #ff9800;
        color: white;
      }

      .type-jinja2 {
        background: #b71c1c;
        color: white;
      }

      .template-result {
        font-family: 'Courier New', monospace;
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        max-width: 300px;
        overflow-x: auto;
        word-break: break-word;
      }

      .status-icon {
        font-size: 18px;
        display: inline-block;
      }

      .status-success { color: #4caf50; }
      .status-error { color: #f44336; }
      .status-warning { color: #ff9800; }

      .action-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .action-button {
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        transition: background 0.2s;
      }

      .action-button:hover {
        background: var(--secondary-background-color);
      }

      .empty-state {
        text-align: center;
        padding: 48px 24px;
        color: var(--secondary-text-color);
      }

      .loading-state {
        text-align: center;
        padding: 48px 24px;
      }

      .error-message {
        color: var(--error-color, #f44336);
        font-size: 12px;
        margin-top: 4px;
      }
    `;
  }

  firstUpdated() {
    this._discoverTemplates();
  }

  updated(changedProps) {
    if (changedProps.has('config')) {
      this._discoverTemplates();
    }
  }

  render() {
    return html`
      ${this._renderSyntaxReference()}
      ${this._renderFilterBar()}
      ${this._renderTemplatesTable()}
    `;
  }

  _renderSyntaxReference() {
    return html`
      <div class="syntax-reference">
        <h3>🔍 Template & Token Syntax Reference</h3>
        <div class="syntax-list">
          <div class="syntax-item">
            <code class="syntax-code">[[[...]]]</code>
            <span class="syntax-description">JavaScript expression — Evaluated client-side with access to entity, config, variables</span>
          </div>
          <div class="syntax-item">
            <code class="syntax-code">{theme:token.path}</code>
            <span class="syntax-description">LCARdS theme token — Single curly braces with <strong>theme:</strong> prefix</span>
          </div>
          <div class="syntax-item">
            <code class="syntax-code">{datasource:name}</code>
            <span class="syntax-description">LCARdS datasource token — Single curly braces with <strong>datasource:</strong> or <strong>ds:</strong> prefix</span>
          </div>
          <div class="syntax-item">
            <code class="syntax-code">{entity.state}</code>
            <span class="syntax-description">LCARdS simple token — Single curly braces for entity/config/variables paths</span>
          </div>
          <div class="syntax-item">
            <code class="syntax-code">{{...}}</code>
            <span class="syntax-description">Jinja2 template — Double curly braces, evaluated by Home Assistant (async)</span>
          </div>
        </div>
      </div>
    `;
  }

  _renderFilterBar() {
    const counts = this._getTypeCounts();
    
    return html`
      <div class="filter-bar">
        <button 
          class="filter-chip ${this._filterType === 'all' ? 'active' : ''}"
          @click=${() => this._filterType = 'all'}>
          All (${counts.total})
        </button>
        <button 
          class="filter-chip ${this._filterType === 'javascript' ? 'active' : ''}"
          @click=${() => this._filterType = 'javascript'}>
          JavaScript (${counts.javascript})
        </button>
        <button 
          class="filter-chip ${this._filterType === 'theme' ? 'active' : ''}"
          @click=${() => this._filterType = 'theme'}>
          Theme (${counts.theme})
        </button>
        <button 
          class="filter-chip ${this._filterType === 'datasource' ? 'active' : ''}"
          @click=${() => this._filterType = 'datasource'}>
          Datasource (${counts.datasource})
        </button>
        <button 
          class="filter-chip ${this._filterType === 'token' ? 'active' : ''}"
          @click=${() => this._filterType = 'token'}>
          Token (${counts.token})
        </button>
        <button 
          class="filter-chip ${this._filterType === 'jinja2' ? 'active' : ''}"
          @click=${() => this._filterType = 'jinja2'}>
          Jinja2 (${counts.jinja2})
        </button>
      </div>
    `;
  }

  _renderTemplatesTable() {
    if (this._isEvaluating) {
      return html`
        <div class="loading-state">
          <ha-circular-progress active></ha-circular-progress>
          <p>Discovering and evaluating templates...</p>
        </div>
      `;
    }

    const filteredTemplates = this._getFilteredTemplates();

    if (filteredTemplates.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:code-braces"></ha-icon>
          <p>No templates found in configuration</p>
          <p style="font-size: 12px;">Templates will appear here when you use JavaScript expressions, tokens, or Jinja2 templates in your card config.</p>
        </div>
      `;
    }

    return html`
      <table class="templates-table">
        <thead>
          <tr>
            <th>Path</th>
            <th>Type</th>
            <th>Template</th>
            <th>Result</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filteredTemplates.map(template => this._renderTemplateRow(template))}
        </tbody>
      </table>
    `;
  }

  _renderTemplateRow(template) {
    return html`
      <tr>
        <td><div class="template-path">${template.path}</div></td>
        <td>
          <span class="template-type type-${template.type.toLowerCase()}">${template.type}</span>
        </td>
        <td><div class="template-raw">${template.raw}</div></td>
        <td>
          <div class="template-result">${template.result || '(empty)'}</div>
          ${template.error ? html`<div class="error-message">${template.error}</div>` : ''}
        </td>
        <td>
          <span class="status-icon ${template.status}">${this._getStatusIcon(template.status)}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="action-button" @click=${() => this._copyToClipboard(template.result || '')}>
              📋 Copy
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  _getStatusIcon(status) {
    switch (status) {
      case 'status-success': return '✅';
      case 'status-error': return '❌';
      case 'status-warning': return '⚠️';
      default: return '❓';
    }
  }

  _getTypeCounts() {
    return {
      total: this._templates.length,
      javascript: this._templates.filter(t => t.type === 'JavaScript').length,
      theme: this._templates.filter(t => t.type === 'Theme').length,
      datasource: this._templates.filter(t => t.type === 'Datasource').length,
      token: this._templates.filter(t => t.type === 'Token').length,
      jinja2: this._templates.filter(t => t.type === 'Jinja2').length
    };
  }

  _getFilteredTemplates() {
    if (this._filterType === 'all') {
      return this._templates;
    }
    
    const typeMap = {
      'javascript': 'JavaScript',
      'theme': 'Theme',
      'datasource': 'Datasource',
      'token': 'Token',
      'jinja2': 'Jinja2'
    };
    
    return this._templates.filter(t => t.type === typeMap[this._filterType]);
  }

  /**
   * Recursively scan config for all templates and tokens
   */
  async _discoverTemplates() {
    if (!this.config) {
      this._templates = [];
      return;
    }

    this._isEvaluating = true;
    this.requestUpdate();

    try {
      const templates = [];
      this._scanObject(this.config, '', templates);
      
      // Evaluate all templates
      await this._evaluateTemplates(templates);
      
      this._templates = templates;
    } catch (error) {
      lcardsLog.error('[TemplateEvaluationTab] Error discovering templates:', error);
      this._templates = [];
    } finally {
      this._isEvaluating = false;
      this.requestUpdate();
    }
  }

  /**
   * Recursively scan object for template strings
   */
  _scanObject(obj, path, templates) {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof value === 'string') {
        this._checkForTemplates(value, currentPath, templates);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          const arrayPath = `${currentPath}[${index}]`;
          if (typeof item === 'string') {
            this._checkForTemplates(item, arrayPath, templates);
          } else if (typeof item === 'object') {
            this._scanObject(item, arrayPath, templates);
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        this._scanObject(value, currentPath, templates);
      }
    }
  }

  /**
   * Check if string contains templates and categorize them
   */
  _checkForTemplates(str, path, templates) {
    if (!str || typeof str !== 'string') return;

    const types = TemplateDetector.detectTemplateTypes(str);
    
    // JavaScript templates
    if (types.hasJavaScript) {
      const matches = str.matchAll(/\[\[\[([\s\S]*?)\]\]\]/g);
      for (const match of matches) {
        templates.push({
          path,
          type: 'JavaScript',
          raw: match[0],
          fullString: str,
          result: null,
          error: null,
          status: 'status-warning'
        });
      }
    }

    // Theme tokens
    if (str.includes('{theme:')) {
      const matches = str.matchAll(/\{theme:([^}]+)\}/g);
      for (const match of matches) {
        templates.push({
          path,
          type: 'Theme',
          raw: match[0],
          fullString: str,
          result: null,
          error: null,
          status: 'status-warning'
        });
      }
    }

    // Datasource tokens
    if (str.includes('{datasource:') || str.includes('{ds:')) {
      const matches = str.matchAll(/\{(?:datasource|ds):([^}]+)\}/g);
      for (const match of matches) {
        templates.push({
          path,
          type: 'Datasource',
          raw: match[0],
          fullString: str,
          result: null,
          error: null,
          status: 'status-warning'
        });
      }
    }

    // Simple tokens (excluding theme, datasource, and jinja2)
    if (types.hasTokens && !types.hasJinja2) {
      const matches = str.matchAll(/\{(?!theme:)(?!datasource:)(?!ds:)(?!\{)([^{}]+)\}/g);
      for (const match of matches) {
        templates.push({
          path,
          type: 'Token',
          raw: match[0],
          fullString: str,
          result: null,
          error: null,
          status: 'status-warning'
        });
      }
    }

    // Jinja2 templates
    if (types.hasJinja2) {
      const matches = str.matchAll(/\{\{([^}]+)\}\}/g);
      for (const match of matches) {
        templates.push({
          path,
          type: 'Jinja2',
          raw: match[0],
          fullString: str,
          result: null,
          error: null,
          status: 'status-warning'
        });
      }
    }
  }

  /**
   * Evaluate all discovered templates
   */
  async _evaluateTemplates(templates) {
    const entity = this._getEntity();
    const themeManager = window.lcards?.core?.themeManager;
    const dataSourceManager = window.lcards?.core?.dataSourceManager;

    for (const template of templates) {
      try {
        let result = null;

        if (template.type === 'Theme') {
          // Evaluate theme token
          const tokenPath = template.raw.match(/\{theme:([^}]+)\}/)[1];
          result = themeManager?.getToken(tokenPath, template.raw) || '(not found)';
        } else if (template.type === 'Datasource') {
          // Evaluate datasource token
          const dsMatch = template.raw.match(/\{(?:datasource|ds):([^}]+)\}/);
          if (dsMatch && dataSourceManager) {
            const dsName = dsMatch[1].split('.')[0];
            result = `(datasource: ${dsName})`;
          } else {
            result = '(DataSourceManager not available)';
          }
        } else {
          // Use UnifiedTemplateEvaluator for JavaScript, Tokens, and Jinja2
          const evaluator = new UnifiedTemplateEvaluator({
            hass: this.hass,
            context: {
              entity,
              config: this.config,
              variables: {},
              theme: themeManager?.getCurrentTheme?.() || {}
            },
            dataSourceManager
          });

          if (template.type === 'Jinja2') {
            result = await evaluator.evaluateAsync(template.fullString);
          } else {
            result = evaluator.evaluate(template.fullString);
          }
        }

        template.result = String(result);
        template.status = 'status-success';
      } catch (error) {
        template.error = error.message;
        template.status = 'status-error';
        lcardsLog.warn('[TemplateEvaluationTab] Template evaluation failed:', template.raw, error);
      }
    }
  }

  /**
   * Get the entity from config if available
   */
  _getEntity() {
    const entityId = this.config?.entity;
    if (!entityId || !this.hass?.states) {
      return null;
    }
    return this.hass.states[entityId];
  }

  /**
   * Copy text to clipboard
   */
  async _copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      // Could show a toast notification here
    } catch (error) {
      lcardsLog.error('[TemplateEvaluationTab] Failed to copy to clipboard:', error);
    }
  }
}

customElements.define('lcards-template-evaluation-tab', LCARdSTemplateEvaluationTab);
