import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
class TimePickerStylingDemos extends DemoReadyEventEmitter(ElementDemo(PolymerElement)) {
  static get template() {
    return html`
    <style include="vaadin-component-demo-shared-styles">
      :host {
        display: block;
      }

    </style>

    <h3>Custom Theme Variant</h3>
    <vaadin-demo-snippet id="time-picker-styling-demos-custom-theme-variant">
      <template preserve-content="">
        <dom-module id="custom-text-field-and-item" theme-for="vaadin-text-field vaadin-combo-box-item">
          <template>
            <style>
              :host([theme~="custom"]) {
                font-family: monospace;
              }
            </style>
          </template>
        </dom-module>
        <dom-module id="custom-combo-box-overlay" theme-for="vaadin-combo-box-overlay">
          <template>
            <style>
              :host([theme~="custom"]) [part="overlay"] {
                background-image: linear-gradient(var(--lumo-shade-5pct), var(--lumo-shade-5pct));
              }
            </style>
          </template>
        </dom-module>
        <vaadin-time-picker theme="custom" label="Time"></vaadin-time-picker>
      </template>
    </vaadin-demo-snippet>
`;
  }

  static get is() {
    return 'time-picker-styling-demos';
  }
}
customElements.define(TimePickerStylingDemos.is, TimePickerStylingDemos);
