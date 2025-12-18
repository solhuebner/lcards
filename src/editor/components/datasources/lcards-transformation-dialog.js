/**
 * LCARdS Transformation Dialog
 * 
 * Modal dialog for adding/editing transformations with type-specific forms.
 * Supports common types with declarative forms and YAML fallback for advanced. 
 * 
 * @element lcards-transformation-dialog
 * @fires save - When transformation is saved
 * @fires cancel - When dialog is cancelled
 * 
 * @property {Object} hass - Home Assistant instance
 * @property {string} mode - 'add' | 'edit'
 * @property {string} transformKey - Existing key (edit mode)
 * @property {Object} transformConfig - Existing config (edit mode)
 * @property {boolean} open - Dialog open state
 */

import { LitElement, html, css } from 'lit';
import { configToYaml, yamlToConfig } from '../../utils/yaml-utils.js';

export class LCARdSTransformationDialog extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      mode: { type: String },
      transformKey: { type: String },
      transformConfig: { type: Object },
      open: { type: Boolean },
      _key: { type: String, state: true },
      _selectedType: { type: String, state: true },
      _config: { type: Object, state: true },
      _useYaml: { type: Boolean, state: true },
      _yamlValue: { type: String, state: true },
      _errors: { type: Object, state: true }
    };
  }
  
  constructor() {
    super();
    this.mode = 'add';
    this.open = false;
    this._resetForm();
  }
  
  static get styles() {
    return css`
      :host {
        display: block;
      }

      ha-dialog {
        --mdc-dialog-min-width: 600px;
        --mdc-dialog-max-width: 800px;
      }

      .form-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 8px 0;
      }

      .helper-text {
        font-size: 12px;
        color: var(--secondary-text-color, #727272);
        margin-top: -8px;
        padding: 0 8px;
      }

      ha-textfield,
      ha-select,
      ha-textarea {
        width: 100%;
      }

      ha-alert {
        margin: 8px 0;
      }

      .example-code {
        font-family: monospace;
        font-size: 12px;
        background: var(--secondary-background-color, #f5f5f5);
        padding: 8px;
        border-radius: 4px;
        margin-top: 8px;
      }

      .example-code code {
        background: var(--primary-color);
        color: white;
        padding: 2px 4px;
        border-radius: 2px;
      }
    `;
  }
  
  _resetForm() {
    this._key = this.transformKey || '';
    this._selectedType = this.transformConfig?.type || '';
    this._config = this.transformConfig ? { ...this.transformConfig } : {};
    this._useYaml = false;
    this._yamlValue = '';
    this._errors = {};
  }
  
  // Common transform types with UI forms
  get supportedTypes() {
    return [
      { value: 'unit_conversion', label: 'Unit Conversion' },
      { value: 'scale', label: 'Scale/Map Range' },
      { value: 'exponential_smoothing', label: 'Exponential Smoothing' },
      { value: 'moving_average', label: 'Moving Average' },
      { value: 'clamp', label: 'Clamp (Min/Max)' },
      { value: 'offset', label: 'Offset (Add/Subtract)' },
      { value: 'multiply', label: 'Multiply (Scale Factor)' },
      { value: 'round', label: 'Round (Decimal Precision)' },
      { value: 'delta', label: 'Delta (Rate of Change)' },
      { value: 'expression', label: 'Expression (JavaScript)' },
      { value: '__yaml__', label: '📝 Advanced (YAML Editor)' }
    ];
  }
  
  willUpdate(changedProperties) {
    if (changedProperties.has('open') && this.open) {
      this._resetForm();
    }
  }
  
  render() {
    if (!this.open) {
      return html``;
    }

    return html`
      <ha-dialog
        .open=${this.open}
        @closed=${this._handleCancel}
        .heading=${this.mode === 'add' ? 'Add Transformation' : `Edit: ${this.transformKey}`}
        scrimClickAction=""
        escapeKeyAction="">
        
        <div style="padding: 0 24px 8px;">
          ${this._renderForm()}
        </div>
        
        <ha-button
          slot="secondaryAction"
          appearance="plain"
          @click=${this._handleCancel}
          dialogAction="cancel">
          Cancel
        </ha-button>
        
        <ha-button
          slot="primaryAction"
          variant="brand"
          appearance="accent"
          @click=${this._handleSave}
          ?disabled=${!this._isValid()}
          dialogAction="ok">
          ${this.mode === 'add' ? 'Create' : 'Save'}
        </ha-button>
      </ha-dialog>
    `;
  }
  
  _renderForm() {
    return html`
      <div class="form-content">
        <!-- Key -->
        <ha-textfield
          label="Name *"
          .value=${this._key}
          @input=${(e) => { this._key = e.target.value; }}
          ?disabled=${this.mode === 'edit'}
          placeholder="e.g., celsius, smoothed, scaled">
        </ha-textfield>
        
        <!-- Type Selector -->
        <ha-select
          label="Type *"
          .value=${this._useYaml ? '__yaml__' : this._selectedType}
          @selected=${this._handleTypeChange}>
          ${this.supportedTypes.map(type => html`
            <mwc-list-item .value=${type.value}>${type.label}</mwc-list-item>
          `)}
        </ha-select>
        
        <!-- Type-Specific Form or YAML Editor -->
        ${this._useYaml 
          ? this._renderYamlEditor()
          : this._renderTypeForm(this._selectedType)
        }
      </div>
    `;
  }
  
  _renderTypeForm(type) {
    switch (type) {
      case 'unit_conversion':
        return this._renderUnitConversionForm();
      case 'scale':
        return this._renderScaleForm();
      case 'exponential_smoothing':
        return this._renderExponentialSmoothingForm();
      case 'moving_average':
        return this._renderMovingAverageForm();
      case 'clamp':
        return this._renderClampForm();
      case 'offset':
        return this._renderOffsetForm();
      case 'multiply':
        return this._renderMultiplyForm();
      case 'round':
        return this._renderRoundForm();
      case 'delta':
        return this._renderDeltaForm();
      case 'expression':
        return this._renderExpressionForm();
      default:
        return html`
          <ha-alert alert-type="info">
            Select a transformation type to configure.
          </ha-alert>
        `;
    }
  }
  
  _renderUnitConversionForm() {
    const commonUnits = {
      temperature: ['celsius', 'fahrenheit', 'kelvin'],
      distance: ['meters', 'feet', 'miles', 'kilometers'],
      speed: ['m/s', 'km/h', 'mph'],
      pressure: ['pa', 'hpa', 'mbar', 'psi']
    };
    
    return html`
      <ha-alert alert-type="info">
        Convert between units (temperature, distance, speed, etc.)
      </ha-alert>
      
      <ha-select
        label="From Unit"
        .value=${this._config.from_unit || ''}
        @selected=${(e) => this._updateConfig('from_unit', e.target.value)}>
        ${Object.entries(commonUnits).map(([category, units]) => html`
          <mwc-list-item disabled>${category.toUpperCase()}</mwc-list-item>
          ${units.map(unit => html`
            <mwc-list-item .value=${unit}>${unit}</mwc-list-item>
          `)}
        `)}
      </ha-select>
      
      <ha-select
        label="To Unit"
        .value=${this._config.to_unit || ''}
        @selected=${(e) => this._updateConfig('to_unit', e.target.value)}>
        ${Object.entries(commonUnits).map(([category, units]) => html`
          <mwc-list-item disabled>${category.toUpperCase()}</mwc-list-item>
          ${units.map(unit => html`
            <mwc-list-item .value=${unit}>${unit}</mwc-list-item>
          `)}
        `)}
      </ha-select>
    `;
  }
  
  _renderScaleForm() {
    return html`
      <ha-alert alert-type="info">
        Map input range to output range (e.g., 0-100 to 0-255)
      </ha-alert>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <ha-selector
          .hass=${this.hass}
          .selector=${{ number: { mode: 'box' } }}
          .value=${this._config.input_min ?? 0}
          .label=${'Input Min'}
          @value-changed=${(e) => this._updateConfig('input_min', e.detail.value)}>
        </ha-selector>
        
        <ha-selector
          .hass=${this.hass}
          .selector=${{ number: { mode: 'box' } }}
          .value=${this._config.input_max ?? 100}
          .label=${'Input Max'}
          @value-changed=${(e) => this._updateConfig('input_max', e.detail.value)}>
        </ha-selector>
        
        <ha-selector
          .hass=${this.hass}
          .selector=${{ number: { mode: 'box' } }}
          .value=${this._config.output_min ?? 0}
          .label=${'Output Min'}
          @value-changed=${(e) => this._updateConfig('output_min', e.detail.value)}>
        </ha-selector>
        
        <ha-selector
          .hass=${this.hass}
          .selector=${{ number: { mode: 'box' } }}
          .value=${this._config.output_max ?? 255}
          .label=${'Output Max'}
          @value-changed=${(e) => this._updateConfig('output_max', e.detail.value)}>
        </ha-selector>
      </div>
    `;
  }
  
  _renderExponentialSmoothingForm() {
    return html`
      <ha-alert alert-type="info">
        Reduce noise with exponential smoothing (lower alpha = more smoothing)
      </ha-alert>
      
      <ha-selector
        .hass=${this.hass}
        .selector=${{ number: { min: 0, max: 1, step: 0.05, mode: 'slider' } }}
        .value=${this._config.alpha ?? 0.3}
        .label=${'Alpha (Smoothing Factor)'}
        @value-changed=${(e) => this._updateConfig('alpha', e.detail.value)}>
      </ha-selector>
      <div class="helper-text">0.1 = heavy smoothing, 0.9 = light smoothing</div>
    `;
  }
  
  _renderMovingAverageForm() {
    return html`
      <ha-alert alert-type="info">
        Average over the last N data points
      </ha-alert>
      
      <ha-selector
        .hass=${this.hass}
        .selector=${{ number: { min: 2, max: 100, mode: 'box' } }}
        .value=${this._config.window ?? 5}
        .label=${'Window Size (points)'}
        @value-changed=${(e) => this._updateConfig('window', e.detail.value)}>
      </ha-selector>
    `;
  }
  
  _renderClampForm() {
    return html`
      <ha-alert alert-type="info">
        Limit values to a minimum and maximum range
      </ha-alert>
      
      <ha-selector
        .hass=${this.hass}
        .selector=${{ number: { mode: 'box' } }}
        .value=${this._config.min ?? 0}
        .label=${'Minimum Value'}
        @value-changed=${(e) => this._updateConfig('min', e.detail.value)}>
      </ha-selector>
      
      <ha-selector
        .hass=${this.hass}
        .selector=${{ number: { mode: 'box' } }}
        .value=${this._config.max ?? 100}
        .label=${'Maximum Value'}
        @value-changed=${(e) => this._updateConfig('max', e.detail.value)}>
      </ha-selector>
    `;
  }
  
  _renderOffsetForm() {
    return html`
      <ha-alert alert-type="info">
        Add or subtract a constant value
      </ha-alert>
      
      <ha-selector
        .hass=${this.hass}
        .selector=${{ number: { mode: 'box', step: 0.1 } }}
        .value=${this._config.offset ?? 0}
        .label=${'Offset Value'}
        @value-changed=${(e) => this._updateConfig('offset', e.detail.value)}>
      </ha-selector>
    `;
  }
  
  _renderMultiplyForm() {
    return html`
      <ha-alert alert-type="info">
        Multiply values by a constant factor
      </ha-alert>
      
      <ha-selector
        .hass=${this.hass}
        .selector=${{ number: { mode: 'box', step: 0.1 } }}
        .value=${this._config.factor ?? 1}
        .label=${'Multiplication Factor'}
        @value-changed=${(e) => this._updateConfig('factor', e.detail.value)}>
      </ha-selector>
    `;
  }
  
  _renderRoundForm() {
    return html`
      <ha-alert alert-type="info">
        Round to specified decimal places
      </ha-alert>
      
      <ha-selector
        .hass=${this.hass}
        .selector=${{ number: { min: 0, max: 10, mode: 'box' } }}
        .value=${this._config.decimals ?? 2}
        .label=${'Decimal Places'}
        @value-changed=${(e) => this._updateConfig('decimals', e.detail.value)}>
      </ha-selector>
    `;
  }
  
  _renderDeltaForm() {
    return html`
      <ha-alert alert-type="info">
        Calculate rate of change (difference from previous value)
      </ha-alert>
      
      <ha-selector
        .hass=${this.hass}
        .selector=${{ boolean: {} }}
        .value=${this._config.absolute ?? false}
        .label=${'Absolute Value'}
        @value-changed=${(e) => this._updateConfig('absolute', e.detail.value)}>
      </ha-selector>
    `;
  }
  
  _renderExpressionForm() {
    return html`
      <ha-alert alert-type="warning">
        Advanced: JavaScript expression (has access to 'value', 'timestamp', 'buffer')
      </ha-alert>
      
      <ha-textfield
        label="Expression *"
        .value=${this._config.expression || ''}
        @input=${(e) => this._updateConfig('expression', e.target.value)}
        placeholder="e.g., value * 2 + 10">
      </ha-textfield>
      
      <div class="helper-text">
        Available variables: <code>value</code> (current), <code>timestamp</code>, <code>buffer</code> (history)
      </div>
      
      <div class="example-code">
        Examples: <br>
        • <code>value * 1.8 + 32</code> (celsius to fahrenheit)<br>
        • <code>Math.round(value * 100) / 100</code> (round to 2 decimals)<br>
        • <code>value > 100 ? 100 : value</code> (cap at 100)
      </div>
    `;
  }
  
  _renderYamlEditor() {
    return html`
      <ha-alert alert-type="info">
        Advanced YAML editor for custom transformation types. 
        See documentation for all available transformation types.
      </ha-alert>
      
      <ha-textarea
        label="YAML Configuration"
        .value=${this._yamlValue}
        @input=${(e) => this._yamlValue = e.target.value}
        rows="10"
        placeholder="type: custom_transform
parameter1: value1
parameter2: value2">
      </ha-textarea>
    `;
  }
  
  _handleTypeChange(event) {
    const value = event.target.value;
    
    if (value === '__yaml__') {
      this._useYaml = true;
      this._yamlValue = configToYaml(this._config);
    } else {
      this._useYaml = false;
      this._selectedType = value;
      this._config = { type: value };
    }
    
    this.requestUpdate();
  }
  
  _updateConfig(key, value) {
    this._config = {
      ...this._config,
      [key]: value
    };
    this.requestUpdate();
  }
  
  _isValid() {
    // Name is required
    if (!this._key || this._key.trim().length === 0) {
      return false;
    }
    
    // Check for valid identifier
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(this._key)) {
      return false;
    }
    
    // Type is required
    if (this._useYaml) {
      // YAML must be valid
      if (!this._yamlValue || this._yamlValue.trim().length === 0) {
        return false;
      }
      try {
        yamlToConfig(this._yamlValue);
      } catch (e) {
        return false;
      }
    } else {
      if (!this._selectedType) {
        return false;
      }
      
      // Type must exist in config
      if (!this._config.type) {
        return false;
      }
      
      // Validate type-specific requirements
      switch (this._selectedType) {
        case 'unit_conversion':
          return !!this._config.from_unit && !!this._config.to_unit;
        case 'expression':
          return !!this._config.expression;
        // Other types have defaults, so they're always valid
        default:
          return true;
      }
    }
    
    return true;
  }
  
  _handleSave() {
    if (!this._isValid()) return;
    
    let finalConfig;
    
    if (this._useYaml) {
      try {
        finalConfig = yamlToConfig(this._yamlValue);
      } catch (e) {
        console.error('[LCARdS] Failed to parse YAML:', e);
        return;
      }
    } else {
      finalConfig = { ...this._config };
    }
    
    this.dispatchEvent(new CustomEvent('save', {
      detail: {
        key: this._key,
        config: finalConfig
      },
      bubbles: true,
      composed: true
    }));
  }
  
  _handleCancel() {
    this.dispatchEvent(new CustomEvent('cancel', {
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('lcards-transformation-dialog', LCARdSTransformationDialog);
