import '@vaadin/vaadin-lumo-styles/color.js';
import '@vaadin/vaadin-lumo-styles/sizing.js';
import '@vaadin/vaadin-lumo-styles/spacing.js';
import '@vaadin/vaadin-lumo-styles/typography.js';
import '@vaadin/vaadin-lumo-styles/mixins/required-field.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

const $_documentContainer = html`<dom-module id="lumo-custom-field" theme-for="vaadin-custom-field">
  <template>
    <style include="lumo-required-field">
      :host {
        --lumo-text-field-size: var(--lumo-size-m);
        color: var(--lumo-body-text-color);
        font-size: var(--lumo-font-size-m);
        /* align with text-field height + vertical paddings */
        line-height: calc(var(--lumo-text-field-size) + 2 * var(--lumo-space-xs));
        font-family: var(--lumo-font-family);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        -webkit-tap-highlight-color: transparent;
        padding: 0;
      }

      :host::before {
        margin-top: var(--lumo-space-xs);
        height: var(--lumo-text-field-size);
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
      }

      /* align with text-field label */
      :host([has-label]) [part="label"] {
        padding-bottom: calc(0.5em - var(--lumo-space-xs));
      }

      :host(:not([has-label])) [part="label"],
      :host(:not([has-label]))::before {
        display: none;
      }

      /* align with text-field error message */
      :host([invalid]) [part="error-message"]:not(:empty)::before {
        height: calc(0.4em - var(--lumo-space-xs));
      }

      :host([focused]:not([disabled])) [part="label"] {
        color: var(--lumo-primary-text-color);
      }

      :host(:hover:not([disabled]):not([focused])) [part="label"] {
        color: var(--lumo-body-text-color);
      }

      /* Touch device adjustment */
      @media (pointer: coarse) {
        :host(:hover:not([disabled]):not([focused])) [part="label"] {
          color: var(--lumo-secondary-text-color);
        }
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
