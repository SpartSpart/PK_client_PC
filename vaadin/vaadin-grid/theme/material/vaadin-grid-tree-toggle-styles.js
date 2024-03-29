import '@vaadin/vaadin-material-styles/color.js';
import '@vaadin/vaadin-material-styles/font-icons.js';
import '@vaadin/vaadin-material-styles/typography.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

const $_documentContainer = html`<dom-module id="material-grid-tree-toggle" theme-for="vaadin-grid-tree-toggle">
  <template>
    <style>
      :host {
        --_material-grid-tree-toggle-collapsed-icon-transform: rotate(0);
      }

      :host(:dir(rtl)) {
        --_material-grid-tree-toggle-collapsed-icon-transform: rotate(180deg);
      }

      [part="toggle"] {
        width: calc(var(--material-icon-font-size) + 8px);
        align-self: stretch; /* NOTE(platosha): helps to maintain baseline */
      }

      [part="toggle"]::before {
        font-family: "material-icons";
        font-size: var(--material-icon-font-size);
        width: var(--material-icon-font-size);
        position: absolute; /* NOTE(platosha): helps to maintain baseline */
        transform: var(--_material-grid-tree-toggle-collapsed-icon-transform);
        transition: transform 0.1s cubic-bezier(.4, 0, .2, .1);
      }

      :host(:not([expanded])) [part="toggle"]::before,
      :host([expanded]) [part="toggle"]::before {
        content: var(--material-icons-chevron-right);
      }

      :host([expanded]) [part="toggle"]::before {
        transform: rotate(90deg);
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
