/**
@license
Vaadin Login
Copyright (C) 2018 Vaadin Ltd
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { ElementMixin } from '@vaadin/vaadin-element-mixin/vaadin-element-mixin.js';
import './vaadin-login-form.js';
import { LoginMixin } from './vaadin-login-mixin.js';
import './vaadin-login-overlay-wrapper.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
/**
 * `<vaadin-login-overlay>` is a wrapper of the `<vaadin-login-form>` which opens a login form in an overlay and
 * having an additional `brand` part for application title and description. Using `<vaadin-login-overlay>` allows
 * password managers to work with login form.
 *
 * ```
 * <vaadin-login-overlay opened></vaadin-login-overlay>
 * ```
 *
 * ### Styling
 *
 * To style the element check: [`<vaadin-login-overlay-wrapper>`](#/elements/vaadin-login-overlay-wrapper),
 * [`<vaadin-login-form-wrapper>`](#/elements/vaadin-login-form-wrapper), [`<vaadin-login-form>`](#/elements/vaadin-login-form)
 * and `<vaadin-overlay>` elements
 *
 * @memberof Vaadin
 * @mixes Vaadin.ElementMixin
 * @mixes Vaadin.ThemableMixin
 * @mixes Vaadin.Login.LoginMixin
 * @demo demo/index.html
 */
class LoginOverlayElement extends LoginMixin(ElementMixin(ThemableMixin(PolymerElement))) {
  static get template() {
    return html`
    <vaadin-login-overlay-wrapper id="vaadinLoginOverlayWrapper" opened="{{opened}}" focus-trap="" with-backdrop="" title="[[title]]" description="[[description]]" theme\$="[[theme]]">

      <vaadin-login-form theme="with-overlay" id="vaadinLoginForm" action="{{action}}" disabled="{{disabled}}" error="{{error}}" no-forgot-password="{{noForgotPassword}}" i18n="{{i18n}}" on-login="_retargetEvent" on-forgot-password="_retargetEvent">

      </vaadin-login-form>

    </vaadin-login-overlay-wrapper>
`;
  }

  static get is() {
    return 'vaadin-login-overlay';
  }

  static get properties() {
    return {
      /**
       * Defines the application description
       */
      description: {
        type: String,
        value: 'Application description',
        notify: true
      },
      /**
       * True if the overlay is currently displayed.
       */
      opened: {
        type: Boolean,
        value: false,
        observer: '_onOpenedChange'
      },
      /**
       * Defines the application title
       */
      title: {
        type: String,
        value: 'App name'
      },
      /**
       * Defines the theme of the element.
       * The value is propagated to vaadin-login-overlay-wrapper element.
       */
      theme: {
        type: String
      }
    };
  }

  static get observers() {
    return [
      '__i18nChanged(i18n.header.*)'
    ];
  }

  ready() {
    super.ready();

    this._preventClosingLogin = this._preventClosingLogin.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();

    this.$.vaadinLoginOverlayWrapper.addEventListener('vaadin-overlay-outside-click', this._preventClosingLogin);
    this.$.vaadinLoginOverlayWrapper.addEventListener('vaadin-overlay-escape-press', this._preventClosingLogin);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.$.vaadinLoginOverlayWrapper.removeEventListener('vaadin-overlay-outside-click', this._preventClosingLogin);
    this.$.vaadinLoginOverlayWrapper.removeEventListener('vaadin-overlay-escape-press', this._preventClosingLogin);
    this.$.vaadinLoginOverlayWrapper.opened = false;
  }

  __i18nChanged(i18n) {
    const header = i18n.base;
    if (!header) {
      return;
    }
    this.title = header.title;
    this.description = header.description;
  }

  _preventClosingLogin(e) {
    e.preventDefault();
  }

  _onOpenedChange() {
    if (!this.opened) {

      this.$.vaadinLoginForm.$.vaadinLoginUsername.value = '';
      this.$.vaadinLoginForm.$.vaadinLoginPassword.value = '';
      this.disabled = false;

      if (this._undoTeleport) {
        this._undoTeleport();
      }
    } else {
      this._undoTeleport = this._teleport(this._getElementsToTeleport());

      // Overlay sets pointerEvents on body to `none`, which breaks LastPass popup
      // Reverting it back to the previous state
      // https://github.com/vaadin/vaadin-overlay/blob/041cde4481b6262eac68d3a699f700216d897373/src/vaadin-overlay.html#L660
      document.body.style.pointerEvents = this.$.vaadinLoginOverlayWrapper._previousDocumentPointerEvents;
    }
  }

  _teleport(elements) {
    const teleported = Array.from(elements).map(e => {
      return this.$.vaadinLoginOverlayWrapper.appendChild(e);
    });
    // Function to undo the teleport
    return () => {
      while (teleported.length > 0) {
        this.appendChild(teleported.shift());
      }
    };
  }

  _getElementsToTeleport() {
    return this.querySelectorAll('[slot=title]');
  }
}

customElements.define(LoginOverlayElement.is, LoginOverlayElement);

export { LoginOverlayElement };
