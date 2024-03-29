/**
@license
Vaadin Drawer Toggle
Copyright (C) 2018 Vaadin Ltd
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { ButtonElement } from '@vaadin/vaadin-button/src/vaadin-button.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';

/**
 * The Drawer Toggle component controls the drawer in App Layout component.
 *
 * ```
 * <vaadin-app-layout>
 *   <vaadin-drawer-toggle slot="navbar">Toggle drawer</vaadin-drawer-toggle>
 * </vaadin-app-layout>
 * ```
 *
 * @memberof Vaadin
 * @demo demo/index.html
 */
class DrawerToggleElement extends ButtonElement {
  static get template() {
    return html`
    <style>
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: default;
        position: relative;
        outline: none;
        height: 24px;
        width: 24px;
        padding: 4px;
      }

      #button {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: inherit;
      }

      [part="icon"],
      [part="icon"]::after,
      [part="icon"]::before {
        position: absolute;
        top: 8px;
        height: 3px;
        width: 24px;
        background-color: #000;
      }

      [part="icon"]::after,
      [part="icon"]::before {
        content: "";
      }

      [part="icon"]::after {
        top: 6px;
      }

      [part="icon"]::before {
        top: 12px;
      }
    </style>
    <slot>
      <div part="icon"></div>
    </slot>
    <button id="button" type="button" aria-label\$="[[ariaLabel]]"></button>
`;
  }

  static get is() {
    return 'vaadin-drawer-toggle';
  }

  static get properties() {
    return {
      ariaLabel: String
    };
  }

  constructor() {
    super();

    this.addEventListener('click', e => {
      this.dispatchEvent(new CustomEvent('drawer-toggle-click', {bubbles: true, composed: true}));
    });
  }

  connectedCallback() {
    super.connectedCallback();
  }
}

customElements.define(DrawerToggleElement.is, DrawerToggleElement);

export { DrawerToggleElement };
