/**
@license
Vaadin App Layout
Copyright (C) 2019 Vaadin Ltd
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import './safe-area-inset.js';

import './detect-ios-navbar.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { beforeNextRender, afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { ElementMixin } from '@vaadin/vaadin-element-mixin/vaadin-element-mixin.js';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

/**
 * `<vaadin-app-layout>` is a Web Component providing a quick and easy way to get a common application layout structure done.
 *
 * ```
 * <vaadin-app-layout primary-section="navbar|drawer">
 *  <vaadin-drawer-toggle slot="navbar [touch-optimized]"></vaadin-drawer-toggle>
 *  <h3 slot="navbar [touch-optimized]">Company Name</h3>
 *  <vaadin-tabs orientation="vertical" slot="drawer">
 *    <vaadin-tab>Menu item 1</vaadin-tab>
 *  </vaadin-tabs>
 *  <!-- Everything else will be the page content -->
 *  <div>
 *    <h3>Page title</h3>
 *    <p>Page content</p>
 *  </div>
 * </vaadin-app-layout>
 * ```
 *
 * For best results, the component should be added to the root level of your application (i.e., as a direct child of `<body>`).
 *
 * The page should include a viewport meta tag which contains `viewport-fit=cover`, like the following:
 * ```
 * <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
 * ```
 * This causes the viewport to be scaled to fill the device display.
 * To ensure that important content is displayed, use the provided css variables.
 * ```
 * --safe-area-inset-top
 * --safe-area-inset-right
 * --safe-area-inset-bottom
 * --safe-area-inset-left
 * ```
 *
 * ### Styling
 *
 * The following Shadow DOM parts of the `<vaadin-app-layout>` are available for styling:
 *
 * Part name     | Description
 * --------------|---------------------------------------------------------|
 * `navbar`      | Container for the navigation bar
 * `drawer`      | Container for the drawer area
 * `content`     | Container for page content.
 *
 * See [ThemableMixin – how to apply styles for shadow parts](https://github.com/vaadin/vaadin-themable-mixin/wiki)
 *
 * ### Component's slots
 *
 * The following slots are available to be set
 *
 * Slot name          | Description
 * -------------------|---------------------------------------------------|
 * no name            | Default container for the page content
 * `navbar `          | Container for the top navbar area
 * `drawer`           | Container for an application menu
 * `touch-optimized`  | Container for the bottom navbar area (only visible for mobile devices)
 *
 *
 * See examples of setting the content into slots in the live demos.
 *
 * #### Touch optimized
 *
 * App Layout has a pseudo-slot `touch-optimized` in order to give more control of the presentation of
 * elements with `slot[navbar]`. Internally, when the user is interacting with App Layout from a
 * touchscreen device, the component will search for elements with `slot[navbar touch-optimized]` and move
 * them to the bottom of the page.
 *
 * ### Navigation
 *
 * As the drawer opens as an overlay in small devices, it makes sense to close it once a navigation happens.
 *
 * In order to do so, there are two options:
 * - If the `vaadin-app-layout` instance is available, then `drawerOpened` can be set to `false`
 * - If not, a custom event `close-overlay-drawer` can be dispatched either by calling
 *  `window.dispatchEvent(new CustomEvent('close-overlay-drawer'))` or by calling
 *  `Vaadin.AppLayoutElement.dispatchCloseOverlayDrawerEvent()`
 *
 * ### Scrolling areas
 *
 * By default, the component will act with the "body scrolling", so on mobile (iOS Safari and Android Chrome),
 * the toolbars will collapse when a scroll happens.
 *
 * To use the "content scrolling", in case of the content of the page relies on a pre-defined height (for instance,
 * it has a `height:100%`), then the developer can set `height: 100%` to both `html` and `body`.
 * That will make the `[content]` element of app layout scrollable.
 * On this case, the toolbars on mobile device won't collapse.
 *
 * @memberof Vaadin
 * @mixes Vaadin.ElementMixin
 * @mixes Vaadin.ThemableMixin
 * @demo demo/index.html
 */
class AppLayoutElement extends ElementMixin(ThemableMixin(PolymerElement)) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
        box-sizing: border-box;
        height: 100%;
        --vaadin-app-layout-transition: 200ms;
        transition: padding var(--vaadin-app-layout-transition);
        --vaadin-app-layout-touch-optimized: false;
        --vaadin-app-layout-navbar-offset-top: var(--_vaadin-app-layout-navbar-offset-size);
        --vaadin-app-layout-navbar-offset-bottom: var(--_vaadin-app-layout-navbar-offset-size-bottom);
        padding-top: var(--vaadin-app-layout-navbar-offset-top);
        padding-bottom: var(--vaadin-app-layout-navbar-offset-bottom);
        padding-left: var(--vaadin-app-layout-navbar-offset-left);
      }

      :host([hidden]),
      [hidden] {
        display: none !important;
      }

      :host([no-anim]) {
        --vaadin-app-layout-transition: none !important;
      }

      :host([drawer-opened]) {
        --vaadin-app-layout-drawer-offset-left: var(--_vaadin-app-layout-drawer-offset-size);
      }

      :host([overlay]) {
        --vaadin-app-layout-drawer-offset-left: 0;
        --vaadin-app-layout-navbar-offset-left: 0;
      }

      :host(:not([no-scroll])) [content] {
        overflow: auto;
        -webkit-overflow-scrolling: touch;
      }

      [content] {
        height: 100%;
      }

      @media (pointer: coarse) and (max-width: 800px) and (min-height: 500px) {
        :host {
          --vaadin-app-layout-touch-optimized: true;
        }
      }

      [part="navbar"],
      [part="navbar"]::before {
        position: fixed;
        display: flex;
        align-items: center;
        top: 0;
        right: 0;
        left: 0;
        transition: left var(--vaadin-app-layout-transition);
        padding-top: var(--safe-area-inset-top);
        padding-left: var(--safe-area-inset-left);
        padding-right: var(--safe-area-inset-right);
        z-index: 1;
      }

      :host([primary-section="drawer"][drawer-opened]:not([overlay])) [part="navbar"] {
        left: var(--vaadin-app-layout-drawer-offset-left, 0);
      }

      :host([primary-section="drawer"]) [part="drawer"] {
        top: 0;
      }

      [part="navbar"][bottom] {
        top: auto;
        bottom: 0;
        padding-bottom: var(--safe-area-inset-bottom);
      }

      [part="drawer"] {
        position: fixed;
        top: var(--vaadin-app-layout-navbar-offset-top, 0);
        right: auto;
        bottom: var(--vaadin-app-layout-navbar-offset-bottom, var(--vaadin-viewport-offset-bottom, 0));
        left: var(--vaadin-app-layout-navbar-offset-left, 0);
        transition: transform var(--vaadin-app-layout-transition);
        transform: translateX(-100%);
        max-width: 90%;
        width: 16em;
        box-sizing: border-box;
        padding: var(--safe-area-inset-top) 0 var(--safe-area-inset-bottom) var(--safe-area-inset-left);
        outline: none;
      }

      :host([drawer-opened]) [part="drawer"] {
        transform: translateX(0%);
        touch-action: manipulation;
      }

      [part="backdrop"] {
        background-color: #000;
        opacity: 0.3;
      }

      :host(:not([drawer-opened])) [part="backdrop"] {
        opacity: 0;
      }

      :host([overlay]) [part="backdrop"] {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        pointer-events: none;
        transition: opacity var(--vaadin-app-layout-transition);
        -webkit-tap-highlight-color: transparent;
      }

      :host([overlay]) [part="drawer"] {
        top: 0;
        bottom: 0;
      }

      :host([overlay]) [part="drawer"],
      :host([overlay]) [part="backdrop"] {
        z-index: 2;
      }

      :host([drawer-opened][overlay]) [part="backdrop"] {
        pointer-events: auto;
        touch-action: manipulation;
      }

      :host([drawer-opened]:not([overlay])) {
        padding-left: var(--vaadin-app-layout-drawer-offset-left);
      }

      @media (max-width: 800px),
      (max-height: 600px) {
        :host {
          --vaadin-app-layout-drawer-overlay: true;
        }

        [part="drawer"] {
          width: 20em;
        }
      }
    </style>
    <div part="navbar" id="navbarTop">
      <slot name="navbar"></slot>
    </div>
    <div part="backdrop" on-click="_close" on-touchstart="_close"></div>
    <div part="drawer" id="drawer">
      <slot name="drawer" id="drawerSlot"></slot>
    </div>
    <div content="">
      <slot></slot>
    </div>
    <div part="navbar" id="navbarBottom" bottom="" hidden="">
      <slot name="navbar-bottom"></slot>
    </div>
`;
  }

  static get is() {
    return 'vaadin-app-layout';
  }

  static get version() {
    return '2.0.4';
  }

  static get properties() {
    return {
      /**
       * Defines whether navbar or drawer will come first visually.
       * - By default (`primary-section="navbar"`), the navbar takes the full available width and moves the drawer down.
       * - If `primary-section="drawer"` is set, then the drawer will move the navbar, taking the full available height.
       */
      primarySection: {
        type: String,
        value: 'navbar',
        notify: true,
        reflectToAttribute: true,
        observer: '_primarySectionObserver'
      },

      /**
       * Controls whether the drawer is opened (visible) or not.
       * Its default value depends on the viewport:
       * - `true`, for desktop size views
       * - `false`, for mobile size views
       */
      drawerOpened: {
        type: Boolean,
        notify: true,
        value: true,
        reflectToAttribute: true,
        observer: '_drawerOpenedObserver'
      },

      /**
       *  Drawer is an overlay on top of the content
       *  Controlled via CSS using `--vaadin-app-layout-drawer-overlay: true|false`;
       */
      overlay: {
        type: Boolean,
        notify: true,
        readOnly: true,
        value: false,
        reflectToAttribute: true
      }
    };
  }

  constructor() {
    super();
    // TODO(jouni): might want to debounce
    this.__boundResizeListener = this._resize.bind(this);
    this.__drawerToggleClickListener = this._drawerToggleClick.bind(this);
    this.__closeOverlayDrawerListener = this.__closeOverlayDrawer.bind(this);
  }

  /**
  * @private
  */
  connectedCallback() {
    super.connectedCallback();

    this._blockAnimationUntilAfterNextRender();

    window.addEventListener('resize', this.__boundResizeListener);
    this.addEventListener('drawer-toggle-click', this.__drawerToggleClickListener);

    // Wait for all children to upgrade before trying to measure sizes
    if (window.HTMLImports && !window.HTMLImports.useNative) {
      Array.from(this.querySelectorAll('*')).forEach(child => {
        if (child.localName.indexOf('-') > -1) {
          window.customElements.whenDefined(child.localName).then(() => {
            // TODO(jouni): might want to debounce
            beforeNextRender(this, this._afterFirstRender);
          });
        }
      });
    } else {
      beforeNextRender(this, this._afterFirstRender);
    }

    this._updateTouchOptimizedMode();

    this._navbarChildObserver = new FlattenedNodesObserver(this.$.drawerSlot, (info) => {
      this._updateDrawerSize();
    });
    this._updateDrawerSize();
    this._updateOverlayMode();

    window.addEventListener('close-overlay-drawer', this.__closeOverlayDrawerListener);
  }

  /**
  * @private
  */
  disconnectedCallback() {
    super.disconnectedCallback();

    this._navbarChildObserver && this._navbarChildObserver.disconnect();
    window.removeEventListener('resize', this.__boundResizeListener);
    this.removeEventListener('drawer-toggle-click', this.__drawerToggleClickListener);
    this.removeEventListener('close-overlay-drawer', this.__drawerToggleClickListener);
  }

  /**
   * Helper static method that dispatches a `close-overlay-drawer` event
   */
  static dispatchCloseOverlayDrawerEvent() {
    window.dispatchEvent(new CustomEvent('close-overlay-drawer'));
  }

  _primarySectionObserver(value) {
    const isValid = ['navbar', 'drawer'].indexOf(value) !== -1;
    if (!isValid) {
      this.set('primarySection', 'navbar');
    }
  }

  _drawerOpenedObserver() {
    const drawer = this.$.drawer;

    drawer.removeAttribute('tabindex');

    if (this.overlay) {
      if (this.drawerOpened) {
        drawer.setAttribute('tabindex', 0);
        drawer.focus();
      }
    }
  }


  _isShadyCSS() {
    return window.ShadyCSS && !window.ShadyCSS.nativeCss;
  }

  _afterFirstRender() {
    this._blockAnimationUntilAfterNextRender();
    this._updateOffsetSize();
  }

  _drawerToggleClick(e) {
    e.stopPropagation();
    this.drawerOpened = !this.drawerOpened;
  }

  /**
   * App Layout listens to `close-overlay-drawer` on the window level.
   * A custom event can be dispatched and the App Layout will close the drawer in overlay.
   *
   * That can be used, for instance, when a navigation occurs when user clicks in a menu item inside the drawer.
   *
   * See `dispatchCloseOverlayDrawerEvent()` helper method.
   *
   * @event close-overlay-drawer
   */
  __closeOverlayDrawer() {
    if (this.overlay) {
      this.drawerOpened = false;
    }
  }

  _updateDrawerSize() {
    const childCount = this.querySelectorAll('[slot=drawer]').length;
    const drawer = this.$.drawer;

    if (childCount === 0) {
      drawer.setAttribute('hidden', '');
    } else {
      drawer.removeAttribute('hidden');
    }
    this._updateOffsetSize();
  }

  _resize() {
    this._blockAnimationUntilAfterNextRender();
    this._updateTouchOptimizedMode();
    this._updateOverlayMode();
  }

  _updateOffsetSize() {
    const navbar = this.shadowRoot.querySelector('[part="navbar"]');
    const navbarRect = navbar.getBoundingClientRect();

    const navbarBottom = this.shadowRoot.querySelector('[part="navbar"][bottom]');
    const navbarBottomRect = navbarBottom.getBoundingClientRect();

    if (this._isShadyCSS()) {
      window.ShadyCSS.styleSubtree(this, {
        '--_vaadin-app-layout-navbar-offset-size': navbarRect.height + 'px',
        '--_vaadin-app-layout-navbar-offset-size-bottom': navbarBottomRect.height + 'px'
      });
    } else {
      this.style.setProperty('--_vaadin-app-layout-navbar-offset-size', navbarRect.height + 'px');
      this.style.setProperty('--_vaadin-app-layout-navbar-offset-size-bottom', navbarBottomRect.height + 'px');
    }

    const drawer = this.$.drawer;
    const drawerRect = drawer.getBoundingClientRect();

    if (this._isShadyCSS()) {
      window.ShadyCSS.styleSubtree(this, {
        '--_vaadin-app-layout-drawer-offset-size': drawerRect.width + 'px',
        // Have to update both because ShadyCSS may not apply the one below if not in use
        '--vaadin-app-layout-drawer-offset-left': 'var(--_vaadin-app-layout-drawer-offset-size)'
      });
    } else {
      this.style.setProperty('--_vaadin-app-layout-drawer-offset-size', drawerRect.width + 'px');
    }

  }

  _updateOverlayMode() {
    const overlay = this._getCustomPropertyValue('--vaadin-app-layout-drawer-overlay') == 'true';
    const drawer = this.$.drawer;

    if (!this.overlay && overlay) { // Changed from not overlay to overlay
      this._drawerStateSaved = this.drawerOpened;
      this.drawerOpened = false;
    }

    this._setOverlay(overlay);

    if (this.overlay) {
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-modal', 'true');
      drawer.setAttribute('aria-label', 'drawer');
    } else {
      if (this._drawerStateSaved) {
        this.drawerOpened = this._drawerStateSaved;
        this._drawerStateSaved = null;
      }

      drawer.removeAttribute('role');
      drawer.removeAttribute('aria-modal');
      drawer.removeAttribute('aria-label');
    }

    // TODO(jouni): ARIA attributes. The drawer should act similar to a modal dialog when in ”overlay” mode
  }

  _close() {
    this.drawerOpened = false;
  }

  _getCustomPropertyValue(customProperty) {
    let customPropertyValue;

    if (this._isShadyCSS()) {
      window.ShadyCSS.styleSubtree(this);
      customPropertyValue = window.ShadyCSS.getComputedStyleValue(this, customProperty);
    } else {
      customPropertyValue = getComputedStyle(this).getPropertyValue(customProperty);
    }

    return (customPropertyValue || '').trim().toLowerCase();
  }

  _updateTouchOptimizedMode() {
    const touchOptimized = this._getCustomPropertyValue('--vaadin-app-layout-touch-optimized') == 'true';

    const navbarItems = this.querySelectorAll('[slot*="navbar"]');

    if (navbarItems.length > 0) {
      Array.from(navbarItems).forEach(navbar => {
        if (navbar.getAttribute('slot').indexOf('touch-optimized') > -1) {
          navbar.__touchOptimized = true;
        }

        if (touchOptimized && navbar.__touchOptimized) {
          navbar.setAttribute('slot', 'navbar-bottom');
        } else {
          navbar.setAttribute('slot', 'navbar');
        }
      });
    }

    if (this.$.navbarTop.querySelector('[name=navbar]').assignedNodes().length === 0) {
      this.$.navbarTop.setAttribute('hidden', '');
    } else {
      this.$.navbarTop.removeAttribute('hidden');
    }

    if (touchOptimized) {
      this.$.navbarBottom.removeAttribute('hidden');
    } else {
      this.$.navbarBottom.setAttribute('hidden', '');
    }

    this._updateOffsetSize();
  }

  _blockAnimationUntilAfterNextRender() {
    this.setAttribute('no-anim', '');
    afterNextRender(this, () => {
      this.removeAttribute('no-anim');
      if (this._isShadyCSS()) {
        window.ShadyCSS.styleSubtree(this);
      }
    });
  }
}

customElements.define(AppLayoutElement.is, AppLayoutElement);

export { AppLayoutElement };
