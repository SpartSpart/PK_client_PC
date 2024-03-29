import '@vaadin/vaadin-lumo-styles/color.js';
import '@vaadin/vaadin-lumo-styles/spacing.js';
import '@vaadin/vaadin-lumo-styles/typography.js';
import '@vaadin/vaadin-overlay/vaadin-overlay.js';
import './vaadin-login-form-wrapper-styles.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

const $_documentContainer = html`<dom-module id="vaadin-login-overlay-wrapper-lumo-styles" theme-for="vaadin-login-overlay-wrapper">
  <template>
    <style include="lumo-color lumo-typography">
      :host {
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }

      [part="backdrop"] {
        background: var(--lumo-base-color) linear-gradient(var(--lumo-shade-5pct), var(--lumo-shade-5pct));
      }

      [part="content"] {
        padding: 0;
      }

      [part="overlay"] {
        background: none;
        border-radius: 0;
        box-shadow: none;
        width: 100%;
        height: 100%;
      }

      @media only screen
      and (max-width: 500px) {
        [part="overlay"],
        [part="content"] {
          height: 100%;
        }
      }

      [part="card"] {
        width: calc(var(--lumo-size-m) * 10);
        background: var(--lumo-base-color) linear-gradient(var(--lumo-tint-5pct), var(--lumo-tint-5pct));
      }

      [part="brand"] {
        padding: var(--lumo-space-l) var(--lumo-space-xl) var(--lumo-space-l) var(--lumo-space-l);
        background-color: var(--lumo-primary-color);
        color: var(--lumo-primary-contrast-color);
        min-height: calc(var(--lumo-size-m) * 5);
      }

      [part="description"] {
        line-height: var(--lumo-line-height-s);
        color: var(--lumo-tint-70pct);
        margin-bottom: 0;
      }

      [part="content"] {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      [part="card"] {
        border-radius: var(--lumo-border-radius);
        box-shadow: var(--lumo-box-shadow-s);
        margin: var(--lumo-space-s);
        height: auto;
      }

      /* Small screen */
      @media only screen
      and (max-width: 500px) {
        [part="content"] {
          min-height: 100%;
          background: var(--lumo-base-color);
          align-items: flex-start;
        }

        [part="card"],
        [part="overlay"] {
          width: 100%;
          border-radius: 0;
          box-shadow: none;
          margin: 0;
        }
      }

      /* Landscape small screen */
      @media only screen
      and (max-height: 600px)
      and (min-width: 600px)
      and (orientation: landscape) {
        [part="card"] {
          flex-direction: row;
          align-items: stretch;
          max-width: calc(var(--lumo-size-m) * 16);
          width: 100%;
        }

        [part="brand"],
        [part="form"] {
          flex: auto;
          flex-basis: 0;
          box-sizing: border-box;
        }

        [part="brand"] {
          justify-content: flex-start;
        }

        [part="form"] {
          padding: var(--lumo-space-l);
          overflow: auto;
        }
      }

      /* Landscape really small screen */
      @media only screen
      and (max-height: 500px)
      and (min-width: 600px)
      and (orientation: landscape),
      only screen
      and (max-width: 600px)
      and (min-width: 600px)
      and (orientation: landscape) {
        [part="content"] {
          height: 100vh;
        }

        [part="card"] {
          margin: 0;
          width: 100%;
          max-width: none;
          height: 100%;
          flex: auto;
          border-radius: 0;
          box-shadow: none;
        }

        [part="form"] {
          height: 100%;
          overflow: auto;
          -webkit-overflow-scrolling: touch;
        }
      }

      /* Handle iPhone X notch */
      @media only screen
      and (device-width: 375px)
      and (device-height: 812px)
      and (-webkit-device-pixel-ratio: 3) {
        [part="card"] {
          padding: 0 constant(safe-area-inset-bottom);
          padding: 0 env(safe-area-inset-bottom);
        }

        [part="brand"] {
          margin-left: calc(constant(safe-area-inset-bottom) * -1);
          margin-left: calc(env(safe-area-inset-bottom) * -1);
          padding-left: calc(var(--lumo-space-l) + constant(safe-area-inset-bottom));
          padding-left: calc(var(--lumo-space-l) + env(safe-area-inset-bottom));
        }
      }
    </style>
  </template>
</dom-module><dom-module id="lumo-login-overlay" theme-for="vaadin-login-form-wrapper">
  <template>
    <style include="lumo-color lumo-typography">
      :host([theme~="with-overlay"]) {
        min-height: 100%;
        display: flex;
        justify-content: center;
        max-width: 100%;
      }

      /* Landscape small screen */
      @media only screen
      and (max-height: 600px)
      and (min-width: 600px)
      and (orientation: landscape) {
        :host([theme~="with-overlay"]) [part="form"] {
          height: 100%;
          -webkit-overflow-scrolling: touch;
          flex: 1;
          padding: 2px;
        }
      }
    </style>
  </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
