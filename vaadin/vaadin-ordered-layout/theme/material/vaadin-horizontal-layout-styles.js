import './vaadin-ordered-layout.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="material-horizontal-layout" theme-for="vaadin-horizontal-layout">
  <template>
    <style include="material-ordered-layout">
      :host([theme~="spacing-xs"]) ::slotted(*) {
        margin-left: 4px;
      }

      :host([theme~="spacing-s"]) ::slotted(*) {
        margin-left: 8px;
      }

      :host([theme~="spacing"]) ::slotted(*) {
        margin-left: 16px;
      }

      :host([theme~="spacing-l"]) ::slotted(*) {
        margin-left: 24px;
      }

      :host([theme~="spacing-xl"]) ::slotted(*) {
        margin-left: 40px;
      }

      /*
        Compensate for the first item margin, so that there is no gap around
        the layout itself.
       */
      :host([theme~="spacing-xs"])::before {
        content: "";
        margin-left: -4px;
      }

      :host([theme~="spacing-s"])::before {
        content: "";
        margin-left: -8px;
      }

      :host([theme~="spacing"])::before {
        content: "";
        margin-left: -16px;
      }

      :host([theme~="spacing-l"])::before {
        content: "";
        margin-left: -24px;
      }

      :host([theme~="spacing-xl"])::before {
        content: "";
        margin-left: -40px;
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
