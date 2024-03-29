/**
@license
Copyright (c) 2018 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { ElementMixin } from '@vaadin/vaadin-element-mixin/vaadin-element-mixin.js';
import { CustomFieldMixin } from './vaadin-custom-field-mixin.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

/**
 * `<vaadin-custom-field>` is a Web Component providing field wrapper functionality.
 *
 * ```
 * <vaadin-custom-field label="Appointment time">
 *   <vaadin-date-picker></vaadin-date-picker>
 *   <vaadin-time-picker></vaadin-time-picker>
 * </vaadin-custom-field>
 * ```
 *
 * ### Styling
 *
 * The following shadow DOM parts are available for styling:
 *
 * Part name | Description
 * ----------------|----------------
 * `label` | The label element
 * `error-message` | The error message element
 *
 * The following state attributes are available for styling:
 *
 * Attribute    | Description | Part name
 * -------------|-------------|------------
 * `has-label`  | Set when the field has a label | :host
 * `invalid`    | Set when the field is invalid | :host
 * `focused`    | Set when the field contains focus | :host
 *
 * See [ThemableMixin – how to apply styles for shadow parts](https://github.com/vaadin/vaadin-themable-mixin/wiki)
 *
 * @memberof Vaadin
 * @mixes Vaadin.ElementMixin
 * @mixes Vaadin.ThemableMixin
 * @mixes Vaadin.CustomFieldMixin
 * @demo demo/index.html
 */
class CustomFieldElement extends ElementMixin(CustomFieldMixin(ThemableMixin(PolymerElement))) {
  static get template() {
    return html`
    <style>
      :host {
        display: inline-flex;
      }

      :host::before {
        content: "\\2003";
        width: 0;
        display: inline-block;
        /* Size and position this element on the same vertical position as the input-field element
           to make vertical align for the host element work as expected */
      }

      :host([hidden]) {
        display: none !important;
      }

      .container {
        display: flex;
        flex-direction: column;
      }

      .inputs-wrapper {
        flex: none;
      }
    </style>

    <div class="container">
      <label part="label" on-click="focus" id="[[__labelId]]">[[label]]</label>
      <div class="inputs-wrapper" on-change="__updateValue">
        <slot id="slot"></slot>
      </div>
      <div part="error-message" id="[[__errorId]]" aria-live="assertive" aria-hidden\$="[[__getErrorMessageAriaHidden(invalid, errorMessage, __errorId)]]">[[errorMessage]]</div>
    </div>
`;
  }

  static get is() {
    return 'vaadin-custom-field';
  }
  static get version() {
    return '1.0.9';
  }

  static get properties() {
    return {
      /**
       * String used for the label element.
       */
      label: {
        type: String,
        value: '',
        observer: '_labelChanged'
      },

      /**
       * The name of the control, which is submitted with the form data.
       */
      name: String,

      /**
       * Specifies that the user must fill in a value.
       */
      required: {
        type: Boolean,
        reflectToAttribute: true
      },

      /**
       * The value of the field. When wrapping several inputs, it will contain `\t`
       * (Tab character) as a delimiter indicating parts intended to be used as the
       * corresponding inputs values. Use the [`i18n`](#/elements/vaadin-custom-field#property-i18n)
       * property to customize this behavior.
       */
      value: {
        type: String,
        observer: '__valueChanged',
        notify: true
      },

      /**
       * This property is set to true when the control value is invalid.
       */
      invalid: {
        type: Boolean,
        reflectToAttribute: true,
        notify: true,
        value: false,
        observer: '__invalidChanged'
      },

      /**
       * Error to show when the input value is invalid.
       */
      errorMessage: {
        type: String,
        value: ''
      }
    };
  }

  static get observers() {
    return [
      '__getActiveErrorId(invalid, errorMessage, __errorId)',
      '__getActiveLabelId(label, __labelId)',
      '__toggleHasValue(value)'
    ];
  }

  __invalidChanged(invalid) {
    this.__setOrToggleAttribute('aria-invalid', invalid, this);
  }

  __toggleHasValue(value) {
    if (value !== null && value.trim() !== '') {
      this.setAttribute('has-value', '');
    } else {
      this.removeAttribute('has-value');
    }
  }

  _labelChanged(label) {
    if (label !== '' && label != null) {
      this.setAttribute('has-label', '');
    } else {
      this.removeAttribute('has-label');
    }
  }

  /**
   * Returns true if `value` is valid.
   * `<iron-form>` uses this to check the validity or all its elements.
   *
   * @return {boolean} True if the value is valid.
   */
  validate() {
    return !(this.invalid = !this.checkValidity());
  }

  /**
   * Returns true if the current inputs values satisfy all constraints (if any)
   * @returns {boolean}
   */
  checkValidity() {
    const invalidFields = this.inputs
      .filter(input => !(input.validate || input.checkValidity).call(input));

    if (invalidFields.length || (this.required && !this.value.trim())) {
      // Either 1. one of the input fields is invalid or
      // 2. the custom field itself is required but doesn't have a value
      return false;
    }
    return true;
  }

  __setOrToggleAttribute(name, value, node) {
    if (!name || !node) {
      return;
    }
    if (node.hasAttribute(name) === !value) {
      if (value) {
        node.setAttribute(name, (typeof value === 'boolean') ? '' : value);
      } else {
        node.removeAttribute(name);
      }
    }
  }

  __getActiveErrorId(invalid, errorMessage, errorId) {
    this.__setOrToggleAttribute('aria-describedby',
      (errorMessage && invalid ? errorId : undefined),
      this);
  }

  __getActiveLabelId(label, labelId) {
    this.__setOrToggleAttribute('aria-labelledby',
      (label ? labelId : undefined),
      this);
  }

  __getErrorMessageAriaHidden(invalid, errorMessage, errorId) {
    return (!(errorMessage && invalid ? errorId : undefined)).toString();
  }
}

customElements.define(CustomFieldElement.is, CustomFieldElement);

export { CustomFieldElement };
