import { html } from '@polymer/polymer/lib/utils/html-tag.js';

const $_documentContainer = html`<dom-module id="material-login-form" theme-for="vaadin-login-form">
  <template>
    <style>
      vaadin-button[part="vaadin-login-submit"] {
        margin-top: 3em;
        margin-bottom: 2em;
        flex-grow: 0;
      }

      /* Small screen */
      @media only screen
        and (max-width: 1023px) {
        vaadin-button[part="vaadin-login-submit"] {
          margin-top: 2.5em;
          margin-bottom: 1em;
        }
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
