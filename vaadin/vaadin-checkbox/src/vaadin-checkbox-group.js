/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { CheckboxElement } from './vaadin-checkbox.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
/**
 * `<vaadin-checkbox-group>` is a Polymer element for grouping vaadin-checkboxes.
 *
 * ```html
 * <vaadin-checkbox-group label="Preferred language of contact:">
 *  <vaadin-checkbox value="en">English</vaadin-checkbox>
 *  <vaadin-checkbox value="fr">Français</vaadin-checkbox>
 *  <vaadin-checkbox value="de">Deutsch</vaadin-checkbox>
 * </vaadin-checkbox-group>
 * ```
 *
 * ### Styling
 *
 * The following shadow DOM parts are available for styling:
 *
 * Part name | Description
 * ----------------|----------------
 * `label` | The label element
 * `group-field` | The element that wraps checkboxes
 * `error-message` | The error message element
 *
 * The following state attributes are available for styling:
 *
 * Attribute  | Description | Part name
 * -----------|-------------|------------
 * `disabled`   | Set when the checkbox group and its children are disabled. | :host
 * `focused` | Set when the checkbox group contains focus | :host
 * `has-label` | Set when the element has a label | :host
 * `has-value` | Set when the element has a value | :host
 * `required` | Set when the element is required | :host
 * `invalid` | Set when the element is invalid | :host
 *
 * See [ThemableMixin – how to apply styles for shadow parts](https://github.com/vaadin/vaadin-themable-mixin/wiki)
 *
 * @memberof Vaadin
 * @mixes Vaadin.ThemableMixin
 * @element vaadin-checkbox-group
 * @demo demo/index.html
 */
class CheckboxGroupElement extends ThemableMixin(PolymerElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: inline-flex;

        /* Prevent horizontal overflow in IE 11 instead of wrapping checkboxes */
        max-width: 100%;
      }

      :host::before {
        content: "\\2003";
        width: 0;
        display: inline-block;
      }

      :host([hidden]) {
        display: none !important;
      }

      .vaadin-group-field-container {
        display: flex;
        flex-direction: column;

        /* Prevent horizontal overflow in IE 11 instead of wrapping checkboxes */
        width: 100%;
      }

      [part="label"]:empty {
        display: none;
      }
    </style>

    <div class="vaadin-group-field-container">
      <label part="label">[[label]]</label>

      <div part="group-field">
        <slot id="slot"></slot>
      </div>

      <div part="error-message" aria-live="assertive" aria-hidden\$="[[_getErrorMessageAriaHidden(invalid, errorMessage)]]">[[errorMessage]]</div>

    </div>
`;
  }

  static get is() {
    return 'vaadin-checkbox-group';
  }

  static get properties() {
    return {
      /**
       * The current disabled state of the checkbox group. True if group and all internal checkboxes are disabled.
       */
      disabled: {
        type: Boolean,
        reflectToAttribute: true,
        observer: '_disabledChanged'
      },

      /**
       * String used for the label element.
       */
      label: {
        type: String,
        value: '',
        observer: '_labelChanged'
      },

      /**
       * Value of the checkbox group.
       * Note: toggling the checkboxes modifies the value by creating new
       * array each time, to override Polymer dirty-checking for arrays.
       * You can still use Polymer array mutation methods to update the value.
       */
      value: {
        type: Array,
        value: () => [],
        notify: true
      },

      /**
       * Error to show when the input value is invalid.
       */
      errorMessage: {
        type: String,
        value: ''
      },

      /**
       * Specifies that the user must fill in a value.
       */
      required: {
        type: Boolean,
        reflectToAttribute: true
      },

      /**
       * This property is set to true when the control value is invalid.
       */
      invalid: {
        type: Boolean,
        reflectToAttribute: true,
        notify: true,
        value: false
      },

    };
  }

  static get observers() {
    return [
      '_updateValue(value, value.splices)'
    ];
  }

  ready() {
    super.ready();

    this.addEventListener('focusin', () => this._setFocused(this._containsFocus()));

    this.addEventListener('focusout', e => {
      // validate when stepping out of the checkbox group
      if (!this._checkboxes.some(checkbox => e.relatedTarget === checkbox || checkbox.shadowRoot.contains(e.relatedTarget))) {
        this.validate();
        this._setFocused(false);
      }
    });

    const checkedChangedListener = (e) => {
      this._changeSelectedCheckbox(e.target);
    };

    this._observer = new FlattenedNodesObserver(this, info => {
      const addedCheckboxes = this._filterCheckboxes(info.addedNodes);

      addedCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('checked-changed', checkedChangedListener);
        if (this.disabled) {
          checkbox.disabled = true;
        }
        if (checkbox.checked) {
          this._addCheckboxToValue(checkbox.value);
        } else if (this.value.indexOf(checkbox.value) > -1) {
          checkbox.checked = true;
        }
      });

      this._filterCheckboxes(info.removedNodes).forEach(checkbox => {
        checkbox.removeEventListener('checked-changed', checkedChangedListener);
        if (checkbox.checked) {
          this._removeCheckboxFromValue(checkbox.value);
        }
      });

      if (addedCheckboxes.some(checkbox => !checkbox.hasAttribute('value'))) {
        console.warn('Please add value attribute to all checkboxes in checkbox group');
      }
    });
  }

  /**
   * Returns true if `value` is valid.
   * `<iron-form>` uses this to check the validity or all its elements.
   *
   * @return {boolean} True if the value is valid.
   */
  validate() {
    this.invalid = this.required && this.value.length === 0;
    return !this.invalid;
  }

  get _checkboxes() {
    return this._filterCheckboxes(this.querySelectorAll('*'));
  }

  _filterCheckboxes(nodes) {
    return Array.from(nodes)
      .filter(child => child instanceof CheckboxElement);
  }

  _disabledChanged(disabled) {
    this.setAttribute('aria-disabled', disabled);

    this._checkboxes.forEach(checkbox => checkbox.disabled = disabled);
  }

  _addCheckboxToValue(value) {
    if (this.value.indexOf(value) === -1) {
      this.value = this.value.concat(value);
    }
  }

  _removeCheckboxFromValue(value) {
    this.value = this.value.filter(v => v !== value);
  }

  _changeSelectedCheckbox(checkbox) {
    if (this._updatingValue) {
      return;
    }

    if (checkbox.checked) {
      this._addCheckboxToValue(checkbox.value);
    } else {
      this._removeCheckboxFromValue(checkbox.value);
    }
  }

  _updateValue(value, splices) {
    // setting initial value to empty array, skip validation
    if (value.length === 0 && this._oldValue === undefined) {
      return;
    }

    if (value.length) {
      this.setAttribute('has-value', '');
    } else {
      this.removeAttribute('has-value');
    }

    this._oldValue = value;
    // set a flag to avoid updating loop
    this._updatingValue = true;
    // reflect the value array to checkboxes
    this._checkboxes.forEach(checkbox => {
      checkbox.checked = value.indexOf(checkbox.value) > -1;
    });
    this._updatingValue = false;

    this.validate();
  }

  _labelChanged(label) {
    if (label) {
      this.setAttribute('has-label', '');
    } else {
      this.removeAttribute('has-label');
    }
  }

  _getErrorMessageAriaHidden(invalid, errorMessage) {
    return (!errorMessage || !invalid).toString();
  }

  _containsFocus() {
    const root = this.getRootNode();
    // Safari 9 needs polyfilled `_activeElement` to return correct node
    const activeElement = root._activeElement !== undefined ? root._activeElement : root.activeElement;
    return this.contains(activeElement);
  }

  _setFocused(focused) {
    if (focused) {
      this.setAttribute('focused', '');
    } else {
      this.removeAttribute('focused');
    }
  }
}

customElements.define(CheckboxGroupElement.is, CheckboxGroupElement);

export { CheckboxGroupElement };
