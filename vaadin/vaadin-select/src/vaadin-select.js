/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '@polymer/polymer/lib/elements/custom-style.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { ThemePropertyMixin } from '@vaadin/vaadin-themable-mixin/vaadin-theme-property-mixin.js';
import { ControlStateMixin } from '@vaadin/vaadin-control-state-mixin/vaadin-control-state-mixin.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@polymer/iron-media-query/iron-media-query.js';
import { ElementMixin } from '@vaadin/vaadin-element-mixin/vaadin-element-mixin.js';
import './vaadin-select-overlay.js';
import './vaadin-select-text-field.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<custom-style>
  <style>
    @font-face {
      font-family: "vaadin-select-icons";
      src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAASEAAsAAAAABDgAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABPUy8yAAABCAAAAGAAAABgDxIGKmNtYXAAAAFoAAAAVAAAAFQXVtKHZ2FzcAAAAbwAAAAIAAAACAAAABBnbHlmAAABxAAAAHwAAAB8CohkJ2hlYWQAAAJAAAAANgAAADYOavgEaGhlYQAAAngAAAAkAAAAJAarA8ZobXR4AAACnAAAABQAAAAUCAABP2xvY2EAAAKwAAAADAAAAAwAKABSbWF4cAAAArwAAAAgAAAAIAAHABduYW1lAAAC3AAAAYYAAAGGmUoJ+3Bvc3QAAARkAAAAIAAAACAAAwAAAAMEAAGQAAUAAAKZAswAAACPApkCzAAAAesAMwEJAAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAQAAA6QADwP/AAEADwABAAAAAAQAAAAAAAAAAAAAAIAAAAAAAAwAAAAMAAAAcAAEAAwAAABwAAwABAAAAHAAEADgAAAAKAAgAAgACAAEAIOkA//3//wAAAAAAIOkA//3//wAB/+MXBAADAAEAAAAAAAAAAAAAAAEAAf//AA8AAQAAAAAAAAAAAAIAADc5AQAAAAABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAQE/AUAC6QIVABQAAAEwFx4BFxYxMDc+ATc2MTAjKgEjIgE/ISJPIiEhIk8iIUNCoEJDAhUhIk8iISEiTyIhAAEAAAABAABvL5bdXw889QALBAAAAAAA1jHaeQAAAADWMdp5AAAAAALpAhUAAAAIAAIAAAAAAAAAAQAAA8D/wAAABAAAAAAAAukAAQAAAAAAAAAAAAAAAAAAAAUEAAAAAAAAAAAAAAAAAAAABAABPwAAAAAACgAUAB4APgABAAAABQAVAAEAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAADgCuAAEAAAAAAAEABwAAAAEAAAAAAAIABwBgAAEAAAAAAAMABwA2AAEAAAAAAAQABwB1AAEAAAAAAAUACwAVAAEAAAAAAAYABwBLAAEAAAAAAAoAGgCKAAMAAQQJAAEADgAHAAMAAQQJAAIADgBnAAMAAQQJAAMADgA9AAMAAQQJAAQADgB8AAMAAQQJAAUAFgAgAAMAAQQJAAYADgBSAAMAAQQJAAoANACkaWNvbW9vbgBpAGMAbwBtAG8AbwBuVmVyc2lvbiAxLjAAVgBlAHIAcwBpAG8AbgAgADEALgAwaWNvbW9vbgBpAGMAbwBtAG8AbwBuaWNvbW9vbgBpAGMAbwBtAG8AbwBuUmVndWxhcgBSAGUAZwB1AGwAYQByaWNvbW9vbgBpAGMAbwBtAG8AbwBuRm9udCBnZW5lcmF0ZWQgYnkgSWNvTW9vbi4ARgBvAG4AdAAgAGcAZQBuAGUAcgBhAHQAZQBkACAAYgB5ACAASQBjAG8ATQBvAG8AbgAuAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format('woff');
      font-weight: normal;
      font-style: normal;
    }
  </style>
</custom-style>`;

document.head.appendChild($_documentContainer.content);
/**
 *
 * `<vaadin-select>` is a Web Component for selecting values from a list of items. The content of the
 * the select can be populated in two ways: imperatively by using renderer callback function and
 * declaratively by using Polymer's Templates.
 *
 * ### Rendering
 *
 * By default, the select uses the content provided by using the renderer callback function.
 *
 * The renderer function provides `root`, `select` arguments.
 * Generate DOM content, append it to the `root` element and control the state
 * of the host element by accessing `select`.
 *
 * ```html
 * <vaadin-select id="select"></vaadin-select>
 * ```
 * ```js
 * const select = document.querySelector('#select');
 * select.renderer = function(root, select) {
 *   const listBox = document.createElement('vaadin-list-box');
 *   // append 3 <vaadin-item> elements
 *   ['Jose', 'Manolo', 'Pedro'].forEach(function(name) {
 *     const item = document.createElement('vaadin-item');
 *     item.textContent = name;
 *     listBox.appendChild(item);
 *   });
 *
 *   // update the content
 *   root.appendChild(listBox);
 * };
 * ```
 *
 * Renderer is called on initialization of new select and on its opening.
 * DOM generated during the renderer call can be reused
 * in the next renderer call and will be provided with the `root` argument.
 * On first call it will be empty.
 *
 * ### Polymer Templates
 *
 * Alternatively, the content can be provided with Polymer's Template.
 * Select finds the first child template and uses that in case renderer callback function
 * is not provided. You can also set a custom template using the `template` property.
 *
 * ```
 * <vaadin-select>
 *   <template>
 *     <vaadin-list-box>
 *       <vaadin-item label="foo">Foo</vaadin-item>
 *       <vaadin-item>Bar</vaadin-item>
 *       <vaadin-item>Baz</vaadin-item>
 *     </vaadin-list-box>
 *   </template>
 * </vaadin-select>
 * ```
 *
 * Hint: By setting the `label` property of inner vaadin-items you will
 * be able to change the visual representation of the selected value in the input part.
 *
 * ### Styling
 *
 * The following shadow DOM parts are available for styling:
 *
 * Part name | Description
 * ----------------|----------------
 * `toggle-button` | The toggle button
 *
 * The following state attributes are available for styling:
 *
 * Attribute    | Description | Part name
 * -------------|-------------|------------
 * `opened` | Set when the select is open | :host
 * `invalid` | Set when the element is invalid | :host
 * `focused` | Set when the element is focused | :host
 * `focus-ring` | Set when the element is keyboard focused | :host
 * `readonly` | Set when the select is read only | :host
 *
 * `<vaadin-select>` element sets these custom CSS properties:
 *
 * Property name | Description | Theme for element
 * --- | --- | ---
 * `--vaadin-select-text-field-width` | Width of the select text field | `vaadin-select-overlay`
 *
 * See [ThemableMixin – how to apply styles for shadow parts](https://github.com/vaadin/vaadin-themable-mixin/wiki)
 *
 * In addition to `<vaadin-select>` itself, the following internal
 * components are themable:
 *
 * - `<vaadin-select-text-field>`
 * - `<vaadin-select-overlay>`
 *
 * Note: the `theme` attribute value set on `<vaadin-select>` is
 * propagated to the internal themable components listed above.
 *
 * @memberof Vaadin
 * @mixes Vaadin.ElementMixin
 * @mixes Vaadin.ControlStateMixin
 * @mixes Vaadin.ThemableMixin
 * @mixes Vaadin.ThemePropertyMixin
 * @demo demo/index.html
 */
class SelectElement extends
  ElementMixin(
    ControlStateMixin(
      ThemableMixin(
        ThemePropertyMixin(
          mixinBehaviors(IronResizableBehavior, PolymerElement))))) {
  static get template() {
    return html`
    <style>
      :host {
        display: inline-block;
      }

      vaadin-select-text-field {
        width: 100%;
        min-width: 0;
      }

      :host([hidden]) {
        display: none !important;
      }

      [part="toggle-button"] {
        font-family: "vaadin-select-icons";
      }

      [part="toggle-button"]::before {
        content: "\\e900";
      }
    </style>

    <vaadin-select-text-field placeholder="[[placeholder]]" label="[[label]]" required="[[required]]" invalid="[[invalid]]" error-message="[[errorMessage]]" readonly\$="[[readonly]]" theme\$="[[theme]]">
      <slot name="prefix" slot="prefix"></slot>
      <div part="value"></div>
      <div part="toggle-button" slot="suffix" role="button" aria-haspopup="listbox" aria-label="Toggle"></div>
    </vaadin-select-text-field>
    <vaadin-select-overlay opened="{{opened}}" with-backdrop="[[_phone]]" phone\$="[[_phone]]" theme\$="[[theme]]"></vaadin-select-overlay>

    <iron-media-query query="[[_phoneMediaQuery]]" query-matches="{{_phone}}"></iron-media-query>
`;
  }

  static get is() {
    return 'vaadin-select';
  }

  static get version() {
    return '2.1.6';
  }

  static get properties() {
    return {
      /**
       * Set when the select is open
       */
      opened: {
        type: Boolean,
        value: false,
        notify: true,
        reflectToAttribute: true,
        observer: '_openedChanged'
      },

      /**
       * Custom function for rendering the content of the `<vaadin-select>`.
       * Receives two arguments:
       *
       * - `root` The `<vaadin-select-overlay>` internal container
       *   DOM element. Append your content to it.
       * - `select` The reference to the `<vaadin-select>` element.
       */
      renderer: Function,

      /**
       * The error message to display when the select value is invalid
       */
      errorMessage: {
        type: String,
        value: ''
      },

      /**
       * String used for the label element.
       */
      label: {
        type: String
      },

      /**
       * It stores the the `value` property of the selected item, providing the
       * value for iron-form.
       * When there’s an item selected, it's the value of that item, otherwise
       * it's an empty string.
       * On change or initialization, the component finds the item which matches the
       * value and displays it.
       * If no value is provided to the component, it selects the first item without
       * value or empty value.
       * Hint: If you do not want to select any item by default, you can either set all
       * the values of inner vaadin-items, or set the vaadin-select value to
       * an inexistent value in the items list.
       */
      value: {
        type: String,
        value: '',
        notify: true,
        observer: '_valueChanged'
      },

      /**
       * The current required state of the select. True if required.
       */
      required: {
        type: Boolean,
        reflectToAttribute: true,
        observer: '_requiredChanged'
      },

      /**
       * Set to true if the value is invalid.
       */
      invalid: {
        type: Boolean,
        reflectToAttribute: true,
        notify: true,
        value: false
      },

      /**
       * The name of this element.
       */
      name: {
        type: String,
        reflectToAttribute: true
      },

      /**
       * A hint to the user of what can be entered in the control.
       * The placeholder will be displayed in the case that there
       * is no item selected, or the selected item has an empty
       * string label, or the selected item has no label and it's
       * DOM content is empty.
       */
      placeholder: {
        type: String
      },

      /**
       * When present, it specifies that the element is read-only.
       */
      readonly: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },

      _phone: Boolean,

      _phoneMediaQuery: {
        value: '(max-width: 420px), (max-height: 420px)'
      },

      _overlayElement: Object,

      _inputElement: Object,

      _toggleElement: Object,

      _items: Object,

      _contentTemplate: Object,

      _oldTemplate: Object,

      _oldRenderer: Object
    };
  }

  static get observers() {
    return [
      '_updateSelectedItem(value, _items)',
      '_updateAriaExpanded(opened, _toggleElement, _inputElement)',
      '_templateOrRendererChanged(_contentTemplate, renderer, _overlayElement)'
    ];
  }

  /** @private */
  constructor() {
    super();
    this._boundSetPosition = this._setPosition.bind(this);
  }

  /** @private */
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('iron-resize', this._boundSetPosition);
  }

  ready() {
    super.ready();

    this._overlayElement = this.shadowRoot.querySelector('vaadin-select-overlay');
    this._valueElement = this.shadowRoot.querySelector('[part="value"]');
    this._toggleElement = this.shadowRoot.querySelector('[part="toggle-button"]');
    this._nativeInput = this.focusElement.shadowRoot.querySelector('input');
    this._nativeInput.setAttribute('aria-hidden', true);
    this._nativeInput.setAttribute('tabindex', -1);
    this._nativeInput.style.pointerEvents = 'none';

    this.focusElement.addEventListener('click', e => this.opened = !this.readonly);
    this.focusElement.addEventListener('keydown', e => this._onKeyDown(e));

    this._observer = new FlattenedNodesObserver(this, info => this._setTemplateFromNodes(info.addedNodes));
    this._observer.flush();
  }

  _setTemplateFromNodes(nodes) {
    const template = Array.from(nodes).filter(node => node.localName && node.localName === 'template')[0] || this._contentTemplate;
    this._overlayElement.template = this._contentTemplate = template;
    this._setForwardHostProps();
  }

  _setForwardHostProps() {
    if (this._overlayElement.content) {
      const origForwardHostProp = this._overlayElement._instance && this._overlayElement._instance.forwardHostProp;

      if (this._overlayElement._instance) {
        this._overlayElement._instance.forwardHostProp = (...args) => {
          origForwardHostProp.apply(this._overlayElement._instance, args);
          setTimeout(() => {
            this._updateValueSlot();
          });
        };

        this._assignMenuElement();
      }
    }
  }

  /**
   * Manually invoke existing renderer.
   */
  render() {
    this._overlayElement.render();
    if (this._menuElement && this._menuElement.items) {
      this._updateSelectedItem(this.value, this._menuElement.items);
    }
  }

  _removeNewRendererOrTemplate(template, oldTemplate, renderer, oldRenderer) {
    if (template !== oldTemplate) {
      this._contentTemplate = undefined;
    } else if (renderer !== oldRenderer) {
      this.renderer = undefined;
    }
  }

  _templateOrRendererChanged(template, renderer, overlay) {
    if (!overlay) {
      return;
    }

    if (template && renderer) {
      this._removeNewRendererOrTemplate(template, this._oldTemplate, renderer, this._oldRenderer);
      throw new Error('You should only use either a renderer or a template for select content');
    }

    this._oldTemplate = template;
    this._oldRenderer = renderer;

    if (renderer) {
      overlay.setProperties({owner: this, renderer: renderer});
      this.render();

      if (overlay.content.firstChild) {
        this._assignMenuElement();
      }
    }
  }

  _assignMenuElement() {
    this._menuElement = Array.from(this._overlayElement.content.children).filter(element => element.localName !== 'style')[0];

    if (this._menuElement) {
      this._menuElement.addEventListener('items-changed', e => {
        this._items = this._menuElement.items;
        this._items.forEach(item => item.setAttribute('role', 'option'));
      });
      this._menuElement.addEventListener('selected-changed', e => this._updateValueSlot());
      this._menuElement.addEventListener('keydown', e => this._onKeyDownInside(e));
      this._menuElement.addEventListener('click', e => {
        this.__userInteraction = true;
        this.opened = false;
      }, true);

      this._menuElement.setAttribute('role', 'listbox');
    }
  }

  /** @protected */
  get focusElement() {
    return this._inputElement ||
      (this._inputElement = this.shadowRoot.querySelector('vaadin-select-text-field'));
  }

  /** @private */
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('iron-resize', this._boundSetPosition);
    // Making sure the select is closed and removed from DOM after detaching the select.
    this.opened = false;
  }

  /** @private */
  notifyResize() {
    super.notifyResize();
    if (this.positionTarget && this.opened) {
      this._setPosition();
      // Schedule another position update (to cover virtual keyboard opening for example)
      requestAnimationFrame(this._setPosition.bind(this));
    }
  }

  _requiredChanged(required) {
    this.setAttribute('aria-required', required);
  }

  _valueChanged(value, oldValue) {
    if (value === '') {
      this.focusElement.removeAttribute('has-value');
    } else {
      this.focusElement.setAttribute('has-value', '');
    }

    // Skip validation for the initial empty string value
    if (value === '' && oldValue === undefined) {
      return;
    }
    this.validate();
  }

  _onKeyDown(e) {
    if (!this.readonly && !this.opened) {
      if (/^(Enter|SpaceBar|\s|ArrowDown|Down|ArrowUp|Up)$/.test(e.key)) {
        e.preventDefault();
        this.opened = true;

      } else if (/[a-zA-Z0-9]/.test(e.key) && e.key.length === 1) {
        const selected = this._menuElement.selected;
        const currentIdx = selected !== undefined ? selected : -1;
        const newIdx = this._menuElement._searchKey(currentIdx, e.key);
        if (newIdx >= 0) {
          this.__userInteraction = true;
          this._updateSelectedItem(this._items[newIdx].value, this._items);
        }
      }
    }
  }

  _onKeyDownInside(e) {
    if (/^(Tab)$/.test(e.key)) {
      this.opened = false;
    }
  }

  _openedChanged(opened, wasOpened) {
    if (opened) {
      if (
        !this._overlayElement ||
        !this._menuElement ||
        !this._toggleElement ||
        !this.focusElement ||
        this.disabled ||
        this.readonly
      ) {
        this.opened = false;
        return;
      }

      this._openedWithFocusRing = this.hasAttribute('focus-ring') || this.focusElement.hasAttribute('focus-ring');
      this._menuElement.focus();
      this._setPosition();
      window.addEventListener('scroll', this._boundSetPosition, true);
    } else if (wasOpened) {
      if (this._phone) {
        this._setFocused(false);
      } else {
        this.focusElement.focus();
        if (this._openedWithFocusRing) {
          this.focusElement.setAttribute('focus-ring', '');
        }
      }
      this.validate();
      window.removeEventListener('scroll', this._boundSetPosition, true);
    }
  }

  _hasContent(selected) {
    if (!selected) {
      return false;
    }
    return Boolean(
      selected.hasAttribute('label') ?
        selected.getAttribute('label') :
        selected.textContent.trim() || selected.children.length
    );
  }

  _attachSelectedItem(selected) {
    if (!selected) {
      return;
    }
    let labelItem;
    if (selected.hasAttribute('label')) {
      labelItem = document.createElement('vaadin-item');
      labelItem.textContent = selected.getAttribute('label');
    } else {
      labelItem = selected.cloneNode(true);
    }

    // store reference to the original item
    labelItem._sourceItem = selected;

    labelItem.removeAttribute('tabindex');
    labelItem.removeAttribute('role');

    this._valueElement.appendChild(labelItem);

    labelItem.selected = true;
  }

  _updateAriaExpanded(opened, toggleElement, inputElement) {
    toggleElement && toggleElement.setAttribute('aria-expanded', opened);
    if (inputElement && inputElement.focusElement) {
      inputElement.focusElement.setAttribute('aria-expanded', opened);
    }
  }

  _updateValueSlot() {
    this.opened = false;
    this._valueElement.innerHTML = '';

    const selected = this._items[this._menuElement.selected];

    const hasContent = this._hasContent(selected);

    // Check if text-field is using slotted input
    const slotName = this._inputElement.shadowRoot.querySelector('slot[name="input"]') ? 'input' : 'value';

    // Toggle visibility of _valueElement vs fallback input with placeholder
    this._valueElement.slot = hasContent ? slotName : '';

    // Ensure the slot distribution to apply correct style scope for cloned item
    if (hasContent && window.ShadyDOM) {
      window.ShadyDOM.flush();
    }

    this._attachSelectedItem(selected);

    if (!this._valueChanging && selected) {
      this._selectedChanging = true;
      this.value = selected.value || '';
      if (this.__userInteraction) {
        this.dispatchEvent(new CustomEvent('change', {bubbles: true}));
        this.__userInteraction = false;
      }
      delete this._selectedChanging;
    }
  }

  _updateSelectedItem(value, items) {
    if (items) {
      this._menuElement.selected = items.reduce((prev, item, idx) => {
        return prev === undefined && item.value === value ? idx : prev;
      }, undefined);
      if (!this._selectedChanging) {
        this._valueChanging = true;
        this._updateValueSlot();
        delete this._valueChanging;
      }
    }
  }

  /** @override */
  _setFocused(focused) {
    // Keep `focused` state when opening the overlay for styling purpose.
    super._setFocused(this.opened || focused);
    this.focusElement._setFocused(this.hasAttribute('focused'));
    !this.hasAttribute('focused') && this.validate();
  }

  _setPosition() {
    const inputRect = this._inputElement.shadowRoot.querySelector('[part~="input-field"]').getBoundingClientRect();
    const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
    const bottomAlign = inputRect.top > (viewportHeight - inputRect.height) / 2;

    this._overlayElement.style.left = inputRect.left + 'px';
    if (bottomAlign) {
      this._overlayElement.setAttribute('bottom-aligned', '');
      this._overlayElement.style.removeProperty('top');
      this._overlayElement.style.bottom = (viewportHeight - inputRect.bottom) + 'px';
    } else {
      this._overlayElement.removeAttribute('bottom-aligned');
      this._overlayElement.style.removeProperty('bottom');
      this._overlayElement.style.top = inputRect.top + 'px';
    }

    this._overlayElement.updateStyles({'--vaadin-select-text-field-width': inputRect.width + 'px'});
  }

  /**
   * Returns true if `value` is valid, and sets the `invalid` flag appropriately.
   *
   * @return {boolean} True if the value is valid and sets the `invalid` flag appropriately
   */
  validate() {
    return !(this.invalid = !(this.disabled || !this.required || this.value));
  }

  /**
   * Fired when the user commits a value change.
   *
   * @event change
   */
}

customElements.define(SelectElement.is, SelectElement);

export { SelectElement };
