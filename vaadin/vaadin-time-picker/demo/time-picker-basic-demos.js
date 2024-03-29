import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
class TimePickerBasicDemos extends DemoReadyEventEmitter(ElementDemo(PolymerElement)) {
  static get template() {
    return html`
    <style include="vaadin-component-demo-shared-styles">
      :host {
        display: block;
      }
    </style>


    <h3>Plain Time Picker</h3>
    <vaadin-demo-snippet id="time-picker-basic-demos-plain-example">
      <template preserve-content="">
        <vaadin-time-picker label="Arrival hour (hh:mm)"></vaadin-time-picker>
      </template>
    </vaadin-demo-snippet>

    <h3>Value Resolution</h3>
    <p>
      The <code>step</code> property specified in seconds affects the resolution of the time picker and visibility of the dropdown.
      If step is less than 15 mins dropdown is hidden
    </p>
    <vaadin-demo-snippet id="time-picker-basic-demos-step-example">
      <template preserve-content="">
        <vaadin-time-picker step="0.5" label="Duration (hh:mm:ss.fff)"></vaadin-time-picker>
      </template>
    </vaadin-demo-snippet>

    <h3>Time Range</h3>
    <p>
      The <code>min</code> and <code>max</code> properties affect the range of times that will be available
      in the picker.
    </p>
    <vaadin-demo-snippet id="time-picker-basic-demos-time-range-example">
      <template preserve-content="">
        <vaadin-time-picker min="09:00" max="17:00" label="Lunch hour (hh:mm:ss.fff)"></vaadin-time-picker>
      </template>
    </vaadin-demo-snippet>

    <h3>Clear Button</h3>

    <p>Use the <code>clear-button-visible</code> attribute to display the clear button of an individual time-picker.</p>

    <vaadin-demo-snippet id="time-picker-basic-demos-clear-button">
      <template preserve-content="">
        <vaadin-time-picker label="Time" value="10:10" clear-button-visible=""></vaadin-time-picker>
      </template>
    </vaadin-demo-snippet>
`;
  }

  static get is() {
    return 'time-picker-basic-demos';
  }
}
customElements.define(TimePickerBasicDemos.is, TimePickerBasicDemos);
