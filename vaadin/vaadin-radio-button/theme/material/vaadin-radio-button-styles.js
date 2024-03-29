import '@vaadin/vaadin-material-styles/color.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

const $_documentContainer = html`<dom-module id="material-radio-button" theme-for="vaadin-radio-button">
  <template>
    <style>
      :host {
        display: inline-block;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        outline: none;
        -webkit-tap-highlight-color: transparent;
      }

      [part="label"]:not([empty]) {
        margin: 4px 0.875em 4px 0.375em;
      }

      [part="native-radio"] {
        opacity: 0;
        position: absolute;
      }

      [part="radio"] {
        display: inline-block;
        width: 16px;
        height: 16px;
        flex: none;
        margin: 4px;
        position: relative;
        border: 2px solid;
        border-radius: 50%;
        background-color: transparent;
        transition: transform 0.2s cubic-bezier(.12, .32, .54, 2), background-color 0.15s;
        pointer-events: none;
        will-change: transform;
        line-height: 1.2;
      }

      /* IE11 only */
      ::-ms-backdrop,
      [part="radio"] {
        line-height: 1;
      }

      /* Used for activation "halo" */
      [part="radio"]::before {
        /* Needed to align the radio-button nicely on the baseline */
        content: "\\2003";
        color: transparent;
        display: inline-block;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        background-color: var(--material-primary-color);
        transform: scale(2.5);
        opacity: 0;
        transition: transform 0.1s, opacity 0.8s;
      }

      :host([checked]) [part="radio"] {
        border-color: var(--material-primary-color);
      }

      /* Used for the selection dot */
      [part="radio"]::after {
        content: "";
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: var(--material-primary-color);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        transition: transform 0.2s;
      }

      :host([checked]) [part="radio"]::after {
        transform: translate(-50%, -50%) scale(1);
      }

      :host(:not([checked]):not([disabled])) [part="radio"] {
        border-color: var(--material-secondary-text-color);
      }

      :host([active][checked]) [part="radio"]::before,
      :host([active]:not([checked])) [part="radio"]::before {
        transition-duration: 0.01s, 0.01s;
        transform: scale(0);
        opacity: 0.2;
      }

      :host([focus-ring]) [part="radio"]::before {
        transform: scale(2.5);
        transition-duration: 0s;
        opacity: 0.15;
      }

      :host([disabled]) {
        pointer-events: none;
        color: var(--material-disabled-text-color);
      }

      :host([disabled]) ::slotted(*) {
        color: inherit;
      }

      :host([disabled]) [part="radio"] {
        border-color: var(--material-disabled-color);
      }

      :host([disabled]) [part="radio"]::after {
        background-color: var(--material-disabled-color);
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
