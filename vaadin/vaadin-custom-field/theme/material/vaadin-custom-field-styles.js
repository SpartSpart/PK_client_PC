import '@vaadin/vaadin-material-styles/color.js';
import '@vaadin/vaadin-material-styles/typography.js';
import '@vaadin/vaadin-material-styles/mixins/required-field.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

const $_documentContainer = html`<dom-module id="material-custom-field" theme-for="vaadin-custom-field">
  <template>
    <style include="material-required-field">
      :host {
        display: inline-flex;
        position: relative;
        margin-bottom: 8px;
        outline: none;
        color: var(--material-body-text-color);
        font-size: var(--material-body-font-size);
        font-family: var(--material-font-family);
        line-height: 48px;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* align with text-field label */
      :host([has-label]) {
        padding-top: 16px;
      }

      /* align with text-field error message */
      [part="error-message"]:not(:empty) {
        margin-top: -8px;
      }

      :host([focused]:not([invalid])) [part="label"] {
        color: var(--material-primary-text-color);
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
