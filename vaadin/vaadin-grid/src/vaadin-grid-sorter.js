/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import '@polymer/polymer/polymer-legacy.js';

import '@polymer/polymer/lib/elements/custom-style.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<custom-style>
  <style>
    @font-face {
      font-family: 'vaadin-grid-sorter-icons';
      src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAQwAA0AAAAABuwAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABGRlRNAAAEFAAAABkAAAAcfep+mUdERUYAAAP4AAAAHAAAAB4AJwAOT1MvMgAAAZgAAAA/AAAAYA8TBPpjbWFwAAAB7AAAAFUAAAFeF1fZ4mdhc3AAAAPwAAAACAAAAAgAAAAQZ2x5ZgAAAlgAAABcAAAAnMvguMloZWFkAAABMAAAAC8AAAA2C5Ap72hoZWEAAAFgAAAAHQAAACQGbQPHaG10eAAAAdgAAAAUAAAAHAoAAABsb2NhAAACRAAAABIAAAASAIwAYG1heHAAAAGAAAAAFgAAACAACwAKbmFtZQAAArQAAAECAAACZxWCgKhwb3N0AAADuAAAADUAAABZCrApUXicY2BkYGAA4rDECVrx/DZfGbhZGEDgyqNPOxH0/wNMq5kPALkcDEwgUQBWRA0dAHicY2BkYGA+8P8AAwMLAwgwrWZgZEAFbABY4QM8AAAAeJxjYGRgYOAAQiYGEICQSAAAAi8AFgAAeJxjYGY6yziBgZWBgWkm0xkGBoZ+CM34msGYkZMBFTAKoAkwODAwvmRiPvD/AIMDMxCD1CDJKjAwAgBktQsXAHicY2GAAMZQCM0EwqshbAALxAEKeJxjYGBgZoBgGQZGBhCIAPIYwXwWBhsgzcXAwcAEhIwMCi+Z/v/9/x+sSuElA4T9/4k4K1gHFwMMMILMY2QDYmaoABOQYGJABUA7WBiGNwAAJd4NIQAAAAAAAAAACAAIABAAGAAmAEAATgAAeJyNjLENgDAMBP9tIURJwQCMQccSZgk2i5fIYBDAidJjycXr7x5EPwE2wY8si7jmyBNXGo/bNBerxJNrpxhbO3/fEFpx8ZICpV+ghxJ74fAMe+h7Ox14AbrsHB14nK2QQWrDMBRER4mTkhQK3ZRQKOgCNk7oGQqhhEIX2WSlWEI1BAlkJ5CDdNsj5Ey9Rncdi38ES+jzNJo/HwTgATcoDEthhY3wBHc4CE+pfwsX5F/hGe7Vo/AcK/UhvMSz+mGXKhZU6pww8ISz3oWn1BvhgnwTnuEJf8Jz1OpFeIlX9YULDLdFi4ASHolkSR0iuYdjLak1vAequBhj21D61Nqyi6l3qWybGPjySbPHGScGJl6dP58MYcQRI0bts7mjebBqrFENH7t3qWtj0OuqHnXcW7b0HOTZFnKryRGW2hFX1m0O2vEM3opNMfTau+CS6Z3Vx6veNnEXY6jwDxhsc2gAAHicY2BiwA84GBgYmRiYGJkZmBlZGFkZ2djScyoLMgzZS/MyDQwMwLSrpYEBlIbxjQDrzgsuAAAAAAEAAf//AA94nGNgZGBg4AFiMSBmYmAEQnYgZgHzGAAD6wA2eJxjYGBgZACCKyoz1cD0o087YTQATOcIewAAAA==) format('woff');
      font-weight: normal;
      font-style: normal;
    }
  </style>
</custom-style>`;

document.head.appendChild($_documentContainer.content);
/**
 * `<vaadin-grid-sorter>` is a helper element for the `<vaadin-grid>` that provides out-of-the-box UI controls,
 * visual feedback, and handlers for sorting the grid data.
 *
 * #### Example:
 * ```html
 * <vaadin-grid-column>
 *   <template class="header">
 *     <vaadin-grid-sorter path="name.first">First name</vaadin-grid-sorter>
 *   </template>
 *   <template>[[item.name.first]]</template>
 * </vaadin-grid-column>
 * ```
 *
 * ### Styling
 *
 * The following shadow DOM parts are available for styling:
 *
 * Part name | Description
 * ----------------|----------------
 * `content` | The slotted content wrapper
 * `indicators` | The internal sorter indicators.
 * `order` | The internal sorter order
 *
 * The following state attributes are available for styling:
 *
 * Attribute    | Description | Part name
 * -------------|-------------|------------
 * `direction` | Sort direction of a sorter | :host
 *
 * @memberof Vaadin
 */
class GridSorterElement extends ThemableMixin(PolymerElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: inline-flex;
        cursor: pointer;
        max-width: 100%;
      }

      [part="content"] {
        flex: 1 1 auto;
      }

      [part="indicators"] {
        position: relative;
        align-self: center;
        flex: none;
      }

      [part="order"] {
        display: inline;
        vertical-align: super;
      }

      [part="indicators"]::before {
        font-family: 'vaadin-grid-sorter-icons';
      }

      :host(:not([direction])) [part="indicators"]::before {
        content: "\\e901";
      }

      :host([direction=asc]) [part="indicators"]::before {
        content: "\\e900";
      }

      :host([direction=desc]) [part="indicators"]::before {
        content: "\\e902";
      }
    </style>

    <div part="content">
      <slot></slot>
    </div>
    <div part="indicators">
      <span part="order">[[_getDisplayOrder(_order)]]</span>
    </div>
`;
  }

  static get is() {
    return 'vaadin-grid-sorter';
  }

  static get properties() {
    return {
      /**
       * JS Path of the property in the item used for sorting the data.
       */
      path: String,

      /**
       * How to sort the data.
       * Possible values are `asc` to use an ascending algorithm, `desc` to sort the data in
       * descending direction, or `null` for not sorting the data.
       */
      direction: {
        type: String,
        reflectToAttribute: true,
        notify: true,
        value: null
      },

      _order: {
        type: Number,
        value: null
      },

      _isConnected: {
        type: Boolean,
        value: false
      }
    };
  }

  static get observers() {
    return [
      '_pathOrDirectionChanged(path, direction, _isConnected)',
      '_directionOrOrderChanged(direction, _order)'
    ];
  }

  ready() {
    super.ready();
    this.addEventListener('click', this._onClick.bind(this));
  }

  /** @protected */
  connectedCallback() {
    super.connectedCallback();
    this._isConnected = true;
  }

  /** @protected */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._isConnected = false;
  }

  _pathOrDirectionChanged(path, direction, isConnected) {
    if (path === undefined || direction === undefined || isConnected === undefined) {
      return;
    }

    if (isConnected) {
      this.dispatchEvent(new CustomEvent('sorter-changed', {bubbles: true, composed: true}));
    }
  }

  _getDisplayOrder(order) {
    return order === null ? '' : order + 1;
  }

  _onClick(e) {
    const activeElement = this.getRootNode().activeElement;
    if (this !== activeElement && this.contains(activeElement)) {
      // Some focusable content inside the sorter was clicked, do nothing.
      return;
    }

    e.preventDefault();
    if (this.direction === 'asc') {
      this.direction = 'desc';
    } else if (this.direction === 'desc') {
      this.direction = null;
    } else {
      this.direction = 'asc';
    }
  }

  _directionOrOrderChanged(direction, order) {
    if (direction === undefined || order === undefined) {
      return;
    }

    // Safari has an issue with repainting shadow root element styles when a host attribute changes.
    // Need this workaround (toggle any inline css property on and off) until the issue gets fixed.
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari && this.root) {
      this.root.querySelectorAll('*').forEach(function(el) {
        el.style['-webkit-backface-visibility'] = 'visible';
        el.style['-webkit-backface-visibility'] = '';
      });
    }
  }
}

customElements.define(GridSorterElement.is, GridSorterElement);

export { GridSorterElement };
