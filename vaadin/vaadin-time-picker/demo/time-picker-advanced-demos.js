import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
class TimePickerAdvancedDemos extends DemoReadyEventEmitter(ElementDemo(PolymerElement)) {
  static get template() {
    return html`
    <style include="vaadin-component-demo-shared-styles">
      :host {
        display: block;
      }
    </style>

    <h3>Custom Parser And Formatter</h3>
    <vaadin-demo-snippet id="time-picker-advanced-demos-format-parse-example" when-defined="vaadin-time-picker">
      <template preserve-content="">
        <vaadin-time-picker label="Arrival hour"></vaadin-time-picker>
        <script>
          window.addDemoReadyListener('#time-picker-advanced-demos-format-parse-example', function(document) {
            const timePicker = document.querySelector('vaadin-time-picker');

            timePicker.i18n = {
              formatTime: function(timeObject) {
                if (timeObject) {
                  const pad = function(n) {
                    n = parseInt(n || 0);
                    return n < 10 ? '0' + n : n;
                  };
                  const period = timeObject.hours > 11 ? 'PM' : 'AM';
                  const hours = timeObject.hours % 12 || 12;
                  return pad(hours) + ':' + pad(timeObject.minutes) + ' ' + period;
                }
              },
              parseTime: function(timeString) {
                if (timeString) {
                  const parts = /^(\\d{1,2})(?::(\\d{1,2}))?(?:\\s(\\w{2}))?\$/.exec(timeString);
                  return parts && {
                    hours: parseInt(parts[1]) + (parts[3] == 'PM' ? 12 : 0),
                    minutes: parts[2]
                  };
                }
              }
            };
          });
        &lt;/script>
      </template>
    </vaadin-demo-snippet>

    <h3>Custom Validator</h3>
    <p>Extend <code>Vaadin.TimePickerElement</code> to create your own custom element,
       then override the <code>checkValidity()</code> method to validate the input.</p>
    <vaadin-demo-snippet id="time-picker-advanced-demos-custom-validator" when-defined="vaadin-time-picker" ignore-ie="">
      <template preserve-content="">
        <vaadin-time-picker-working-hours label="Delivery hour" error-message="Select a vaild working hour (9:00 to 17:00)"></vaadin-time-picker-working-hours>

        <script>
          window.addDemoReadyListener('#time-picker-advanced-demos-custom-validator', function(document) {
            class TimePickerWorkingHoursElement extends Vaadin.TimePickerElement {
              checkValidity() {
                var hour = /^(\\d+)/.exec(this.value)[1];
                return hour >= 9 && hour < 17;
              }
            }

            if (!customElements.get('vaadin-time-picker-working-hours')) {
              customElements.define('vaadin-time-picker-working-hours', TimePickerWorkingHoursElement);
            }
          });
        &lt;/script>
      </template>
    </vaadin-demo-snippet>
`;
  }

  static get is() {
    return 'time-picker-advanced-demos';
  }
}
customElements.define(TimePickerAdvancedDemos.is, TimePickerAdvancedDemos);
