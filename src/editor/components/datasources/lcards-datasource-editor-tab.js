/**
 * LCARdS Datasource Editor Tab
 * 
 * Main container for datasource editing with ribbon navigation. 
 * Manages sub-tab state and coordinates between card-local and global views.
 * 
 * @element lcards-datasource-editor-tab
 * @fires config-changed - When card datasources are modified
 * 
 * @property {Object} editor - Parent card editor instance
 * @property {Object} config - Full card configuration
 * @property {Object} hass - Home Assistant instance
 */

import { LitElement, html, css } from 'lit';
import './lcards-card-datasources-list.js';
import './lcards-global-datasources-panel.js';
import '../common/lcards-message.js';

export class LCARdSDataSourceEditorTab extends LitElement {
  static get properties() {
    return {
      editor: { type: Object },
      config: { type: Object },
      hass: { type: Object },
      _activeSubTab: { type: String, state: true }  // 'card' | 'add' | 'global'
    };
  }
  
  constructor() {
    super();
    this._activeSubTab = 'card';
  }
  
  static get styles() {
    return css`
      :host {
        display: block;
      }
      
      .ribbon {
        display: flex;
        gap: 8px;
        padding: 12px;
        background: var(--secondary-background-color, #f5f5f5);
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        overflow-x: auto;
      }
      
      .ribbon-button {
        padding: 8px 16px;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s;
      }
      
      .ribbon-button[selected] {
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        border-color: var(--primary-color, #03a9f4);
      }
      
      .ribbon-button:hover:not([selected]) {
        background: var(--divider-color, #e0e0e0);
      }
      
      .content-area {
        padding: 16px;
      }

      .stub-message {
        padding: 16px;
      }
    `;
  }
  
  render() {
    return html`
      <div class="ribbon">
        <button 
          class="ribbon-button"
          ?selected=${this._activeSubTab === 'card'}
          @click=${() => this._setActiveTab('card')}>
          Card Sources
        </button>
        <button 
          class="ribbon-button"
          ?selected=${this._activeSubTab === 'add'}
          @click=${() => this._setActiveTab('add')}>
          + Add Source
        </button>
        <button 
          class="ribbon-button"
          ?selected=${this._activeSubTab === 'global'}
          @click=${() => this._setActiveTab('global')}>
          Global Sources
        </button>
      </div>
      
      <div class="content-area">
        ${this._renderActiveTab()}
      </div>
    `;
  }
  
  _renderActiveTab() {
    switch (this._activeSubTab) {
      case 'card':
        return html`
          <lcards-card-datasources-list
            .editor=${this.editor}
            .config=${this.config}
            .hass=${this.hass}>
          </lcards-card-datasources-list>
        `;
      
      case 'add':
        return html`
          <div class="stub-message">
            <lcards-message
              type="info"
              message="Add/Edit functionality coming in Phase 2. For now, edit datasources via YAML tab.">
            </lcards-message>
          </div>
        `;
      
      case 'global':
        return html`
          <lcards-global-datasources-panel
            .hass=${this.hass}>
          </lcards-global-datasources-panel>
        `;
      
      default:
        return html``;
    }
  }
  
  _setActiveTab(tab) {
    this._activeSubTab = tab;
  }
}

customElements.define('lcards-datasource-editor-tab', LCARdSDataSourceEditorTab);
