import './vaadin-login-form-wrapper.js';
import '@vaadin/vaadin-text-field/src/vaadin-text-field.js';
import '@vaadin/vaadin-text-field/src/vaadin-password-field.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { LoginMixin } from './vaadin-login-mixin.js';
import { ElementMixin } from '@vaadin/vaadin-element-mixin/vaadin-element-mixin.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
/**
 * `<vaadin-login-form>` is a Web Component providing an easy way to require users
 * to log in into an application. Note that component has no shadowRoot.
 *
 * ```
 * <vaadin-login-form></vaadin-login-form>
 * ```
 *
 * Component has to be accessible from the `document` layer in order to allow password managers to work properly with form values.
 * Using `<vaadin-login-overlay>` allows to always attach the component to the document body.
 *
 * ### Styling
 *
 * The component doesn't have a shadowRoot, so the html form and input fields can be styled in an upper layer. To style
 * `vaadin-login-form-wrapper` check its documentation.
 *
 * See examples of setting the content into slots in the live demos.
 * @memberof Vaadin
 * @mixes Vaadin.ElementMixin
 * @mixes Vaadin.ThemableMixin
 * @mixes Vaadin.Login.LoginMixin
 * @demo demo/index.html
 */
class LoginFormElement extends LoginMixin(ElementMixin(ThemableMixin(PolymerElement))) {
  static get template() {
    return html`
    <style>
      [part="vaadin-login-native-form"] * {
        width: 100%;
      }
    </style>
    <vaadin-login-form-wrapper theme\$="[[theme]]" part="vaadin-login-native-form-wrapper" action="{{action}}" disabled="{{disabled}}" error="{{error}}" no-forgot-password="{{noForgotPassword}}" i18n="{{i18n}}" on-login="_retargetEvent" on-forgot-password="_retargetEvent">

      <form part="vaadin-login-native-form" method="POST" action\$="[[action]]" slot="form">
        <vaadin-text-field name="username" label="[[i18n.form.username]]" id="vaadinLoginUsername" required="" on-keydown="_handleInputKeydown" autocapitalize="none" autocorrect="off" spellcheck="false">
          <input type="text" slot="input" on-keyup="_handleInputKeyup">
        </vaadin-text-field>

        <vaadin-password-field name="password" label="[[i18n.form.password]]" id="vaadinLoginPassword" required="" on-keydown="_handleInputKeydown" spellcheck="false">
          <input type="password" slot="input" on-keyup="_handleInputKeyup">
        </vaadin-password-field>

        <vaadin-button part="vaadin-login-submit" theme="primary contained" on-click="submit" disabled\$="[[disabled]]">[[i18n.form.submit]]</vaadin-button>
      </form>
    </vaadin-login-form-wrapper>
`;
  }

  static get is() {
    return 'vaadin-login-form';
  }
  static get version() {
    return '1.0.1';
  }

  static get properties() {
    return {
      /**
       * Defines the theme of the element.
       * The value is propagated to vaadin-login-form-wrapper element.
       */
      theme: {
        type: String
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._handleInputKeydown = this._handleInputKeydown.bind(this);
  }

  _attachDom(dom) {
    this.appendChild(dom);
  }

  static get observers() {
    return [
      '_errorChanged(error)'
    ];
  }

  _errorChanged() {
    if (this.error && !this._preventAutoEnable) {
      this.disabled = false;
    }
  }

  submit() {
    if (this.disabled || !(this.__isValid(this.$.vaadinLoginUsername) && this.__isValid(this.$.vaadinLoginPassword))) {
      return;
    }

    this.error = false;
    this.disabled = true;

    const loginEventDetails = {
      bubbles: true,
      cancelable: true,
      detail: {
        username: this.$.vaadinLoginUsername.value,
        password: this.$.vaadinLoginPassword.value
      }
    };

    const firedEvent = this.dispatchEvent(new CustomEvent('login', loginEventDetails));
    if (this.action && firedEvent) {
      this.querySelector('[part="vaadin-login-native-form"]').submit();
    }
  }

  __isValid(input) {
    return (input.validate && input.validate()) || (input.checkValidity && input.checkValidity());
  }

  _isEnterKey(e) {
    return e.key === 'Enter' || e.keyCode === 13;
  }

  _handleInputKeydown(e) {
    if (this._isEnterKey(e)) {
      const {currentTarget: inputActive} = e;
      const nextInput = inputActive.id === 'vaadinLoginUsername'
        ? this.$.vaadinLoginPassword : this.$.vaadinLoginUsername;
      if (this.__isValid(inputActive)) {
        if (this.__isValid(nextInput)) {
          this.submit();
        } else {
          nextInput.focus();
        }
      }
    }
  }

  _handleInputKeyup(e) {
    const isTab = e.key === 'Tab' || e.keyCode === 9;
    const input = e.currentTarget;
    if (isTab && input && input.select) {
      input.select();
      // iOS 9 workaround: https://stackoverflow.com/a/7436574
      setTimeout(() => input.setSelectionRange(0, 9999));
    }
  }
}

customElements.define(LoginFormElement.is, LoginFormElement);

export { LoginFormElement };
