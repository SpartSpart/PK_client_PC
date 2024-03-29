/**
@license
Copyright (c) 2018 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import { ElementMixin } from '@vaadin/vaadin-element-mixin/vaadin-element-mixin.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { AccordionPanelElement } from './vaadin-accordion-panel.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

/**
 * `<vaadin-accordion>` is a Web Component implementing accordion widget —
 * a vertically stacked set of expandable panels. The component should be
 * used as a wrapper for two or more `<vaadin-accordion-panel>` components.
 *
 * Panel headings function as controls that enable users to open (expand)
 * or hide (collapse) their associated sections of content. The user can
 * toggle panels by mouse click, Enter and Space keys.
 *
 * Only one panel can be opened at a time, opening a new one forces
 * previous panel to close and hide its content.
 *
 * ```
 * <vaadin-accordion>
 *   <vaadin-accordion-panel>
 *     <div slot="summary">Panel 1</div>
 *     This panel is opened, so the text is visible by default.
 *   </vaadin-accordion-panel>
 *   <vaadin-accordion-panel>
 *     <div slot="summary">Panel 2</div>
 *     After opening this panel, the first one becomes closed.
 *   </vaadin-accordion-panel>
 * </vaadin-accordion>
 * ```
 *
 * ### Styling
 *
 * See the [`<vaadin-accordion-panel>`](#/elements/vaadin-accordion-panel)
 * documentation for the available state attributes and stylable shadow parts.
 *
 * **Note:** You can apply the theme to `<vaadin-accordion>` component itself,
 * especially by using the following CSS selector:
 *
 * ```
 * :host ::slotted(vaadin-accordion-panel) {
 *   margin-bottom: 5px;
 * }
 * ```
 *
 * See [ThemableMixin – how to apply styles for shadow parts](https://github.com/vaadin/vaadin-themable-mixin/wiki)
 *
 * @memberof Vaadin
 * @mixes Vaadin.ElementMixin
 * @mixes Vaadin.ThemableMixin
 * @demo demo/index.html
 */
class AccordionElement extends ThemableMixin(ElementMixin(PolymerElement)) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }
    </style>
    <slot></slot>
`;
  }

  static get is() {
    return 'vaadin-accordion';
  }

  static get version() {
    return '1.0.1';
  }

  static get properties() {
    return {
      /**
       * The index of currently opened panel. First panel is opened by
       * default. Only one panel can be opened at the same time.
       * Setting null or undefined closes all the accordion panels.
       */
      opened: {
        type: Number,
        value: 0,
        notify: true,
        reflectToAttribute: true
      },

      /**
       * The list of `<vaadin-accordion-panel>` child elements.
       * It is populated from the elements passed to the light DOM,
       * and updated dynamically when adding or removing panels.
       */
      items: {
        type: Array,
        readOnly: true,
        notify: true
      }
    };
  }

  static get observers() {
    return [
      '_updateItems(items, opened)'
    ];
  }

  constructor() {
    super();
    this._boundUpdateOpened = this._updateOpened.bind(this);
  }

  /**
   * @protected
   */
  get focused() {
    return this.getRootNode().activeElement;
  }

  /**
   * @protected
   */
  focus() {
    if (this._observer) {
      this._observer.flush();
    }
    const focusable = Array.isArray(this.items) && this.items[0];
    if (focusable) {
      focusable.focus();
    }
  }

  ready() {
    super.ready();

    this.addEventListener('keydown', e => this._onKeydown(e));

    this._observer = new FlattenedNodesObserver(this, info => {
      this._setItems(this._filterItems(Array.from(this.children)));

      this._filterItems(info.addedNodes).forEach(el => {
        el.addEventListener('opened-changed', this._boundUpdateOpened);
      });
    });
  }

  _filterItems(array) {
    return array.filter(el => el instanceof AccordionPanelElement);
  }

  _updateItems(items, opened) {
    if (items) {
      const itemToOpen = items[opened];
      items.forEach(item => {
        item.opened = item === itemToOpen;
      });
    }
  }

  _onKeydown(event) {
    // only check keyboard events on details toggle buttons
    const item = event.composedPath()[0];
    if (!this.items.some(el => el.focusElement === item)) {
      return;
    }

    // IE names for arrows do not include the Arrow prefix
    const key = event.key.replace(/^Arrow/, '');

    const currentIdx = this.items.indexOf(this.focused);
    let idx;
    let increment;

    switch (key) {
      case 'Up':
        increment = -1;
        idx = currentIdx - 1;
        break;
      case 'Down':
        increment = 1;
        idx = currentIdx + 1;
        break;
      case 'Home':
        increment = 1;
        idx = 0;
        break;
      case 'End':
        increment = -1;
        idx = this.items.length - 1;
        break;
      default:
        // do nothing.
    }

    idx = this._getAvailableIndex(idx, increment);
    if (idx >= 0) {
      this.items[idx].focus();
      this.items[idx].setAttribute('focus-ring', '');
      event.preventDefault();
    }
  }

  _getAvailableIndex(index, increment) {
    const totalItems = this.items.length;
    let idx = index;
    for (let i = 0; typeof idx === 'number' && i < totalItems; i++, idx += increment || 1) {
      if (idx < 0) {
        idx = totalItems - 1;
      } else if (idx >= totalItems) {
        idx = 0;
      }

      const item = this.items[idx];
      if (!item.disabled) {
        return idx;
      }
    }
    return -1;
  }

  _updateOpened(e) {
    const target = this._filterItems(e.composedPath())[0];
    const idx = this.items.indexOf(target);
    if (e.detail.value) {
      if (target.disabled || idx === -1) {
        return;
      }

      this.opened = idx;

      this.items.forEach(item => {
        if (item !== target && item.opened) {
          item.opened = false;
        }
      });
    } else if (!this.items.some(item => item.opened)) {
      this.opened = null;
    }
  }
}

customElements.define(AccordionElement.is, AccordionElement);

export { AccordionElement };
