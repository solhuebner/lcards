/**
 * LCARdS Theme Token Browser Tab
 *
 * Browse and search the full active theme's token tree, cross-reference usage,
 * and enable quick copy/insertion with proper LCARdS token syntax.
 *
 * @element lcards-theme-token-browser-tab
 * @property {Object} editor - Parent card editor instance
 * @property {Object} config - Full card configuration
 * @property {Object} hass - Home Assistant instance
 */

import { LitElement, html, css } from 'lit';
import { lcardsLog } from '../../../utils/lcards-logging.js';
import '../common/lcards-message.js';

export class LCARdSThemeTokenBrowserTab extends LitElement {
  static get properties() {
    return {
      editor: { type: Object },
      config: { type: Object },
      hass: { type: Object },
      _tokens: { type: Array, state: true },
      _filteredTokens: { type: Array, state: true },
      _searchQuery: { type: String, state: true },
      _selectedCategory: { type: String, state: true },
      _isLoading: { type: Boolean, state: true },
      _activeTheme: { type: Object, state: true }
    };
  }

  constructor() {
    super();
    this._tokens = [];
    this._filteredTokens = [];
    this._searchQuery = '';
    this._selectedCategory = 'all';
    this._isLoading = false;
    this._activeTheme = null;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 16px;
      }

      .theme-info {
        background: var(--secondary-background-color, #f5f5f5);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .theme-name {
        font-size: 18px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .theme-description {
        font-size: 14px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .syntax-reminder {
        background: var(--info-color, #2196f3);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 13px;
        font-family: 'Courier New', monospace;
      }

      .controls {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }

      .search-box {
        flex: 1;
        min-width: 200px;
      }

      .category-filter {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .category-chip {
        padding: 6px 12px;
        border-radius: 16px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
      }

      .category-chip:hover {
        background: var(--secondary-background-color);
      }

      .category-chip.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .tokens-grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }

      .token-card {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 16px;
        transition: all 0.2s;
      }

      .token-card:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border-color: var(--primary-color);
      }

      .token-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
      }

      .token-path {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: var(--primary-color);
        word-break: break-all;
      }

      .token-category {
        font-size: 10px;
        padding: 3px 6px;
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
        text-transform: uppercase;
        font-weight: 500;
      }

      .token-value {
        margin: 12px 0;
        padding: 12px;
        background: var(--secondary-background-color);
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        word-break: break-word;
        position: relative;
      }

      .token-preview {
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .color-preview {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        border: 2px solid var(--divider-color);
      }

      .font-preview {
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
      }

      .spacing-preview {
        height: 20px;
        background: var(--primary-color);
        border-radius: 2px;
      }

      .token-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .action-button {
        flex: 1;
        padding: 8px;
        font-size: 12px;
        cursor: pointer;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        transition: background 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }

      .action-button:hover {
        background: var(--secondary-background-color);
      }

      .action-button.primary {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .action-button.primary:hover {
        opacity: 0.9;
      }

      .usage-list {
        margin-top: 8px;
        padding: 8px;
        background: var(--secondary-background-color);
        border-radius: 4px;
        font-size: 12px;
      }

      .usage-item {
        padding: 4px 0;
        color: var(--secondary-text-color);
        font-family: 'Courier New', monospace;
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
    `;
  }

  firstUpdated() {
    this._loadTokens();
  }

  render() {
    return html`
      ${this._renderThemeInfo()}
      ${this._renderControls()}
      ${this._renderTokensGrid()}
    `;
  }

  _renderThemeInfo() {
    if (!this._activeTheme) {
      return html`
        <lcards-message
          type="warning"
          message="Theme system not available. Make sure LCARdS is properly initialized.">
        </lcards-message>
      `;
    }

    return html`
      <div class="theme-info">
        <div>
          <div class="theme-name">${this._activeTheme.name || 'Unknown Theme'}</div>
          <div class="theme-description">
            ${this._tokens.length} tokens available
          </div>
        </div>
        <div class="syntax-reminder">
          Copy format: {theme:token.path}
        </div>
      </div>
    `;
  }

  _renderControls() {
    const categories = this._getCategories();

    return html`
      <div class="controls">
        <ha-textfield
          class="search-box"
          .value=${this._searchQuery}
          @input=${this._handleSearchInput}
          placeholder="Search tokens..."
          .label=${'Search'}>
          <ha-icon slot="leadingIcon" icon="mdi:magnify"></ha-icon>
        </ha-textfield>
      </div>

      <div class="category-filter">
        <button 
          class="category-chip ${this._selectedCategory === 'all' ? 'active' : ''}"
          @click=${() => this._selectCategory('all')}>
          All (${this._tokens.length})
        </button>
        ${categories.map(cat => html`
          <button 
            class="category-chip ${this._selectedCategory === cat.key ? 'active' : ''}"
            @click=${() => this._selectCategory(cat.key)}>
            ${cat.label} (${cat.count})
          </button>
        `)}
      </div>
    `;
  }

  _renderTokensGrid() {
    if (this._isLoading) {
      return html`
        <div class="loading-state">
          <ha-circular-progress active></ha-circular-progress>
          <p>Loading theme tokens...</p>
        </div>
      `;
    }

    if (this._filteredTokens.length === 0) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:palette"></ha-icon>
          <p>No tokens found</p>
          <p style="font-size: 12px;">
            ${this._searchQuery || this._selectedCategory !== 'all' 
              ? 'Try adjusting your filters' 
              : 'No theme tokens are available'}
          </p>
        </div>
      `;
    }

    return html`
      <div class="tokens-grid">
        ${this._filteredTokens.map(token => this._renderTokenCard(token))}
      </div>
    `;
  }

  _renderTokenCard(token) {
    return html`
      <div class="token-card">
        <div class="token-header">
          <div class="token-path">{theme:${token.path}}</div>
          <div class="token-category">${token.category}</div>
        </div>

        <div class="token-value">
          ${token.value}
        </div>

        ${this._renderTokenPreview(token)}

        <div class="token-actions">
          <button 
            class="action-button primary"
            @click=${() => this._copyTokenSyntax(token.path)}
            title="Copy token syntax to clipboard">
            📋 Copy Token
          </button>
          <button 
            class="action-button"
            @click=${() => this._copyValue(token.value)}
            title="Copy resolved value to clipboard">
            📄 Copy Value
          </button>
        </div>

        ${token.usage && token.usage.length > 0 ? html`
          <div class="usage-list">
            <strong>Used in:</strong>
            ${token.usage.map(path => html`
              <div class="usage-item">${path}</div>
            `)}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderTokenPreview(token) {
    const valueStr = String(token.value);
    
    // Color preview
    if (token.category === 'colors' || this._isColorValue(valueStr)) {
      return html`
        <div class="token-preview">
          <div class="color-preview" style="background-color: ${valueStr}"></div>
          <span>Color</span>
        </div>
      `;
    }

    // Font preview
    if (token.category === 'typography' && token.path.includes('fontFamily')) {
      return html`
        <div class="token-preview">
          <div class="font-preview" style="font-family: ${valueStr}">
            The quick brown fox
          </div>
        </div>
      `;
    }

    // Spacing preview
    if (token.category === 'spacing' && typeof token.value === 'number') {
      return html`
        <div class="token-preview">
          <div class="spacing-preview" style="width: ${token.value}px"></div>
          <span>${token.value}px</span>
        </div>
      `;
    }

    return null;
  }

  _handleSearchInput(e) {
    this._searchQuery = e.target.value.toLowerCase();
    this._applyFilters();
  }

  _selectCategory(category) {
    this._selectedCategory = category;
    this._applyFilters();
  }

  _applyFilters() {
    let filtered = this._tokens;

    // Apply category filter
    if (this._selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === this._selectedCategory);
    }

    // Apply search filter
    if (this._searchQuery) {
      filtered = filtered.filter(t => 
        t.path.toLowerCase().includes(this._searchQuery) ||
        String(t.value).toLowerCase().includes(this._searchQuery)
      );
    }

    this._filteredTokens = filtered;
    this.requestUpdate();
  }

  _getCategories() {
    const categoryCounts = {};
    this._tokens.forEach(token => {
      categoryCounts[token.category] = (categoryCounts[token.category] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([key, count]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      count
    }));
  }

  async _loadTokens() {
    this._isLoading = true;
    this.requestUpdate();

    try {
      const themeManager = window.lcards?.core?.themeManager;
      
      if (!themeManager) {
        lcardsLog.warn('[ThemeTokenBrowser] ThemeManager not available');
        this._tokens = [];
        this._filteredTokens = [];
        this._isLoading = false;
        this.requestUpdate();
        return;
      }

      this._activeTheme = themeManager.getCurrentTheme?.() || { name: 'Unknown' };
      
      // Get theme tokens from the theme manager
      const tokens = this._extractTokensFromTheme(themeManager);
      
      // Find usage in current config
      tokens.forEach(token => {
        token.usage = this._findTokenUsage(token.path);
      });

      this._tokens = tokens;
      this._filteredTokens = tokens;
    } catch (error) {
      lcardsLog.error('[ThemeTokenBrowser] Error loading tokens:', error);
      this._tokens = [];
      this._filteredTokens = [];
    } finally {
      this._isLoading = false;
      this.requestUpdate();
    }
  }

  /**
   * Extract all tokens from theme manager
   */
  _extractTokensFromTheme(themeManager) {
    const tokens = [];
    const theme = themeManager.getCurrentTheme?.();
    
    if (!theme || !theme.tokens) {
      return tokens;
    }

    this._extractTokensRecursive(theme.tokens, '', tokens);
    return tokens;
  }

  /**
   * Recursively extract tokens from theme object
   */
  _extractTokensRecursive(obj, path, tokens, category = '') {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      const currentCategory = category || key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recurse into nested objects
        this._extractTokensRecursive(value, currentPath, tokens, currentCategory);
      } else {
        // This is a leaf token
        tokens.push({
          path: currentPath,
          value: value,
          category: currentCategory
        });
      }
    }
  }

  /**
   * Find where a token is used in the current config
   */
  _findTokenUsage(tokenPath) {
    const usage = [];
    const tokenSyntax = `{theme:${tokenPath}}`;
    
    this._findTokenUsageRecursive(this.config, '', tokenSyntax, usage);
    
    return usage;
  }

  /**
   * Recursively search config for token usage
   */
  _findTokenUsageRecursive(obj, path, tokenSyntax, usage) {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof value === 'string' && value.includes(tokenSyntax)) {
        usage.push(currentPath);
      } else if (typeof value === 'object' && value !== null) {
        this._findTokenUsageRecursive(value, currentPath, tokenSyntax, usage);
      }
    }
  }

  /**
   * Check if a value looks like a color
   */
  _isColorValue(value) {
    if (typeof value !== 'string') return false;
    
    // Check for hex colors
    if (/^#[0-9A-Fa-f]{3,8}$/.test(value)) return true;
    
    // Check for rgb/rgba
    if (/^rgba?\(/.test(value)) return true;
    
    // Check for hsl/hsla
    if (/^hsla?\(/.test(value)) return true;
    
    // Check for CSS color names (basic check)
    const cssColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'gray'];
    return cssColors.includes(value.toLowerCase());
  }

  /**
   * Copy token syntax to clipboard
   */
  async _copyTokenSyntax(tokenPath) {
    const syntax = `{theme:${tokenPath}}`;
    try {
      await navigator.clipboard.writeText(syntax);
      lcardsLog.info('[ThemeTokenBrowser] Copied token syntax:', syntax);
      // Could show a toast notification here
    } catch (error) {
      lcardsLog.error('[ThemeTokenBrowser] Failed to copy to clipboard:', error);
    }
  }

  /**
   * Copy resolved value to clipboard
   */
  async _copyValue(value) {
    try {
      await navigator.clipboard.writeText(String(value));
      lcardsLog.info('[ThemeTokenBrowser] Copied value:', value);
      // Could show a toast notification here
    } catch (error) {
      lcardsLog.error('[ThemeTokenBrowser] Failed to copy to clipboard:', error);
    }
  }
}

customElements.define('lcards-theme-token-browser-tab', LCARdSThemeTokenBrowserTab);
