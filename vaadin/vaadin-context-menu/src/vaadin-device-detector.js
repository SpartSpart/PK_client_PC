/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-media-query/iron-media-query.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
/**
 * Element for internal use only.
 *
 * @memberof Vaadin
 * @private
 */
class DeviceDetectorElement extends (class extends PolymerElement {}) {
  static get template() {
    return html`
    <iron-media-query query="min-device-width: 750px" query-matches="{{wide}}"></iron-media-query>
`;
  }

  static get is() {
    return 'vaadin-device-detector';
  }

  static get properties() {
    return {
      /**
       * `true`, when running in a phone.
       */
      phone: {
        type: Boolean,
        computed: '_phone(wide, touch)',
        notify: true
      },

      /**
       * `true`, when running in a touch device.
       * @default false
       */
      touch: {
        type: Boolean,
        notify: true,
        value: () => this._touch()
      },

      /**
       * `true`, when running in a tablet/desktop device.
       */
      wide: {
        type: Boolean,
        notify: true
      }
    };
  }

  static _touch() {
    try {
      document.createEvent('TouchEvent');
      return true;
    } catch (err) {
      return false;
    }
  }

  _phone(wide, touch) {
    return !wide && touch;
  }
}

customElements.define(DeviceDetectorElement.is, DeviceDetectorElement);
