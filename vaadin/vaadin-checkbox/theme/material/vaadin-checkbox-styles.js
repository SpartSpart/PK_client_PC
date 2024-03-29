import '@vaadin/vaadin-material-styles/color.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

const $_documentContainer = html`<dom-module id="material-checkbox" theme-for="vaadin-checkbox">
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
        margin: 3px 12px 3px 6px;
      }

      [part="native-checkbox"] {
        opacity: 0;
        position: absolute;
      }

      [part="checkbox"] {
        display: inline-block;
        width: 16px;
        height: 16px;
        flex: none;
        margin: 4px;
        position: relative;
        border-radius: 2px;
        box-shadow: inset 0 0 0 2px var(--material-secondary-text-color);
        pointer-events: none;
        line-height: 1.275;
        background-color: transparent;
      }

      /* IE11 only */
      ::-ms-backdrop,
      [part="checkbox"] {
        line-height: 1;
      }

      /* Used for the ripple */
      [part="checkbox"]::before {
        /* Needed to align the checkbox nicely on the baseline */
        content: "\\2003";
        display: inline-block;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: var(--material-disabled-text-color);
        transform: scale(0);
        opacity: 0;
        transition: transform 0s 0.8s, opacity 0.8s;
        will-change: transform, opacity;
      }

      /* Used for the checkmark */
      [part="checkbox"]::after {
        content: "";
        display: inline-block;
        width: 10px;
        height: 19px;
        border: 0 solid var(--material-background-color);
        border-width: 3px 0 0 3px;
        box-sizing: border-box;
        transform-origin: 0 0;
        position: absolute;
        top: 12px;
        left: 6px;
        transform: scale(0) rotate(-135deg);
        transition: transform 0.2s;
      }

      :host([indeterminate]) [part="checkbox"],
      :host([checked]) [part="checkbox"] {
        background-color: var(--material-primary-color);
        box-shadow: none;
      }

      :host([checked]) [part="checkbox"]::after {
        transform: scale(0.55) rotate(-135deg);
      }

      :host(:not([checked]):not([indeterminate]):not([disabled]):hover) [part="checkbox"] {
        background-color: transparent;
      }

      :host([focus-ring]) [part="checkbox"]::before,
      :host([active]) [part="checkbox"]::before {
        transition-duration: 0.08s, 0.01s;
        transition-delay: 0s, 0s;
        transform: scale(2.5);
        opacity: 0.15;
      }

      :host([checked]) [part="checkbox"]::before {
        background-color: var(--material-primary-color);
      }

      :host([indeterminate]) [part="checkbox"]::after {
        transform: none;
        opacity: 1;
        top: 45%;
        height: 10%;
        left: 22%;
        right: 22%;
        width: auto;
        border: 0;
        background-color: var(--material-background-color);
        transition: opacity 0.4s;
      }

      :host([disabled]) {
        pointer-events: none;
        color: var(--material-disabled-text-color);
      }

      :host([disabled]) ::slotted(*) {
        color: inherit;
      }

      :host([disabled]:not([checked]):not([indeterminate])) [part="checkbox"] {
        box-shadow: inset 0 0 0 2px var(--material-disabled-color);
      }

      :host([disabled][checked]) [part="checkbox"],
      :host([disabled][indeterminate]) [part="checkbox"] {
        background-color: var(--material-disabled-color);
      }

      /* Workaround for vaadin-checkbox issue: https://github.com/vaadin/vaadin-checkbox/issues/16 */
      [part="native-checkbox"]:checked ~ [part="checkbox"] {
        opacity: 1;
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
