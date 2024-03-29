import { html } from '@polymer/polymer/lib/utils/html-tag.js';

const $_documentContainer = html`<dom-module id="material-login-form-wrapper" theme-for="vaadin-login-form-wrapper">
  <template>
    <style include="material-typography">
      :host {
        background: var(--material-background-color) linear-gradient(hsla(0, 0%, 100%, 0.3), hsla(0, 0%, 100%, 0.3));
        min-height: 250px;
      }

      [part="form"] {
        padding: 1.5rem;
        flex: 1;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        justify-content: center;
      }

      [part="form-title"] {
        margin-top: calc(var(--material-h3-font-size) - var(--material-h4-font-size));
        font-size: var(--material-h5-font-size);
      }

      #forgotPasswordButton {
        margin: 0.5rem auto;
        padding-bottom: 12px;
        padding-top: 12px;
        text-transform: none;
      }

      [part="error-message"] {
        background-color: hsla(3, 100%, 60%, 0.1);
        padding: 1rem;
        padding-left: 2.25rem;
        border-radius: 0.25em;
        margin-top: 1rem;
        margin-bottom: 0.5rem;
        color: var(--material-error-text-color);
      }

      [part="error-message"]::before {
        content: "!";
        font-size: 1.3em;
        font-weight: 500;
        position: absolute;
        width: 2.25rem;
        height: 1em;
        line-height: 1;
        text-align: center;
        /* Visual centering */
        margin-left: calc(2.25rem * -0.95);
      }

      [part="error-message"] h5 {
        margin: 0 0 0.25em;
        color: inherit;
      }

      [part="error-message"] p {
        font-size: var(--material-small-font-size);
        line-height: 1.375;
        margin: 0;
        opacity: 0.9;
      }

      [part="footer"] {
        font-size: var(--material-small-font-size);
        line-height: 1.375;
        color: var(--material-secondary-text-color);
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
