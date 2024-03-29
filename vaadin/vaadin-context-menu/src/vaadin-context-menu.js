/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';
import './vaadin-contextmenu-event.js';
import './vaadin-device-detector.js';
import { ItemsMixin } from './vaadin-contextmenu-items-mixin.js';
import { ElementMixin } from '@vaadin/vaadin-element-mixin/vaadin-element-mixin.js';
import { ThemePropertyMixin } from '@vaadin/vaadin-themable-mixin/vaadin-theme-property-mixin.js';
import './vaadin-context-menu-overlay.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { gestures, addListener, removeListener } from '@polymer/polymer/lib/utils/gestures.js';
/**
 *
 * `<vaadin-context-menu>` is a Web Component for creating context menus. The content of the
 * menu can be populated in three ways: imperatively by using the items API or a renderer callback function and
 * declaratively by using Polymer's Templates.
 *
 * ### Items
 *
 * Items is a higher level convenience API for defining a (hierarchical) menu structure for the component.
 * If a menu item has a non-empty `children` set, a sub-menu with the child items is opened
 * next to the parent menu on mouseover, tap or a right arrow keypress.
 *
 * When an item is selected, `<vaadin-context-menu>` dispatches an "item-selected" event
 * with the selected item as `event.detail.value` property.
 *
 * ```javascript
 * contextMenu.items = [
 *   {text: 'Menu Item 1', children:
 *     [
 *       {text: 'Menu Item 1-1', checked: true},
 *       {text: 'Menu Item 1-2'}
 *     ]
 *   },
 *   {component: 'hr'},
 *   {text: 'Menu Item 2', children:
 *     [
 *       {text: 'Menu Item 2-1'},
 *       {text: 'Menu Item 2-2', disabled: true}
 *     ]
 *   },
 *   {text: 'Menu Item 3', disabled: true}
 * ];
 *
 * contextMenu.addEventListener('item-selected', e => {
 *   const item = e.detail.value;
 *   console.log(`${item.text} selected`);
 * });
 * ```
 *
 * **NOTE:** when the `items` array is defined, the renderer or a template cannot be used.
 *
 * ### Rendering
 *
 * The renderer function provides `root`, `contextMenu`, `model` arguments when applicable.
 * Generate DOM content by using `model` object properties if needed, append it to the `root`
 * element and control the state of the host element by accessing `contextMenu`. Before generating
 * new content, the renderer function should check if there is already content in `root` for reusing it.
 *
 * ```html
 * <vaadin-context-menu id="contextMenu">
 *  <p>This paragraph has a context menu.</p>
 * </vaadin-context-menu>
 * ```
 * ```js
 * const contextMenu = document.querySelector('#contextMenu');
 * contextMenu.renderer = (root, contextMenu, context) => {
 *   let listBox = root.firstElementChild;
 *   if (!listBox) {
 *     listBox = document.createElement('vaadin-list-box');
 *     root.appendChild(listBox);
 *   }
 *
 *   let item = listBox.querySelector('vaadin-item');
 *   if (!item) {
 *     item = document.createElement('vaadin-item');
 *     listBox.appendChild(item);
 *   }
 *   item.textContent = 'Content of the selector: ' + context.target.textContent;
 * };
 * ```
 *
 * You can access the menu context inside the renderer using
 * `context.target` and `context.detail`.
 *
 * Renderer is called on the opening of the context-menu and each time the related context is updated.
 * DOM generated during the renderer call can be reused
 * in the next renderer call and will be provided with the `root` argument.
 * On first call it will be empty.
 *
 * **NOTE:** when the `renderer` function is defined, the template content
 * is not in use.
 *
 * ### Polymer Templates
 *
 * Alternatively to using the `renderer`, you can populate
 * the menu content using Polymer's Templates:
 *
 * ```html
 * <vaadin-context-menu>
 *   <template>
 *     <vaadin-list-box>
 *       <vaadin-item>First menu item</vaadin-item>
 *       <vaadin-item>Second menu item</vaadin-item>
 *     </vaadin-list-box>
 *   </template>
 * </vaadin-context-menu>
 * ```
 *
 * ### “vaadin-contextmenu” Gesture Event
 *
 * `vaadin-contextmenu` is a gesture event (a custom event),
 * which is dispatched after either `contextmenu` and long touch events.
 * This enables support for both mouse and touch environments in a uniform way.
 *
 * `<vaadin-context-menu>` opens the menu overlay on the `vaadin-contextmenu`
 * event by default.
 *
 * ### Menu Listener
 *
 * By default, the `<vaadin-context-menu>` element listens for the menu opening
 * event on itself. In order to have a context menu on your content, wrap
 * your content with the `<vaadin-context-menu>` element, and add a template
 * element with a menu. Example:
 *
 * ```html
 * <vaadin-context-menu>
 *   <template>
 *     <vaadin-list-box>
 *       <vaadin-item>First menu item</vaadin-item>
 *       <vaadin-item>Second menu item</vaadin-item>
 *     </vaadin-list-box>
 *   </template>
 *
 *   <p>This paragraph has the context menu provided in the above template.</p>
 *   <p>Another paragraph with the context menu.</p>
 * </vaadin-context-menu>
 * ```
 *
 * In case if you do not want to wrap the page content, you can listen for
 * events on an element outside the `<vaadin-context-menu>` by setting the
 * `listenOn` property:
 *
 * ```html
 * <vaadin-context-menu id="customListener">
 *   <template>
 *     <vaadin-list-box>
 *       ...
 *     </vaadin-list-box>
 *   </template>
 * </vaadin-context-menu>
 *
 * <div id="menuListener">The element that listens for the context menu.</div>
 * ```
 * ```javascript
 *   const contextMenu = document.querySelector('vaadin-context-menu#customListener');
 *   contextMenu.listenOn = document.querySelector('#menuListener');
 * ```
 *
 * ### Filtering Menu Targets
 *
 * By default, the listener element and all its descendants open the context
 * menu. You can filter the menu targets to a smaller set of elements inside
 * the listener element by setting the `selector` property.
 *
 * In the following example, only the elements matching `.has-menu` will open the context menu:
 *
 * ```html
 * <vaadin-context-menu selector=".has-menu">
 *   <template>
 *     <vaadin-list-box>
 *       ...
 *     </vaadin-list-box>
 *   </template>
 *
 *   <p class="has-menu">This paragraph opens the context menu</p>
 *   <p>This paragraph does not open the context menu</p>
 * </vaadin-context-menu>
 * ```
 *
 * ### Menu Context
 *
 * You can bind to the following properties in the menu template:
 *
 * - `target` is the menu opening event target, which is the element that
 * the user has called the context menu for
 * - `detail` is the menu opening event detail
 *
 * In the following example, the menu item text is composed with the contents
 * of the element that opened the menu:
 *
 * ```html
 * <vaadin-context-menu selector="li">
 *   <template>
 *     <vaadin-list-box>
 *       <vaadin-item>The menu target: [[target.textContent]]</vaadin-item>
 *     </vaadin-list-box>
 *   </template>
 *
 *   <ul>
 *     <li>Foo</li>
 *     <li>Bar</li>
 *     <li>Baz</li>
 *   </ul>
 * </vaadin-context-menu>
 * ```
 *
 * ### Styling
 *
 * `<vaadin-context-menu>` uses `<vaadin-context-menu-overlay>` internal
 * themable component as the actual visible context menu overlay. See
 * See [`<vaadin-overlay>` documentation](https://github.com/vaadin/vaadin-overlay/blob/master/src/vaadin-overlay.html)
 * for `<vaadin-context-menu-overlay>` parts.
 *
 * See [ThemableMixin – how to apply styles for shadow parts](https://github.com/vaadin/vaadin-themable-mixin/wiki)
 *
 * Note: the `theme` attribute value set on `<vaadin-context-menu>` is
 * propagated to the internal `<vaadin-context-menu-overlay>` component.
 * In case of using nested menu items, the `theme` attribute is also propagated
 * to internal `vaadin-context-menu-list-box` and `vaadin-context-menu-item`'s.
 *
 * @memberof Vaadin
 * @mixes Vaadin.ElementMixin
 * @mixes Vaadin.ThemePropertyMixin
 * @mixes Vaadin.ContextMenu.ItemsMixin
 * @mixes Polymer.GestureEventListeners
 * @demo demo/index.html
 */
class ContextMenuElement extends
  ElementMixin(
    ThemePropertyMixin(
      ItemsMixin(
        GestureEventListeners(PolymerElement)))) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none !important;
      }
    </style>

    <slot id="slot"></slot>

    <vaadin-device-detector phone="{{_phone}}" touch="{{_touch}}"></vaadin-device-detector>

    <vaadin-context-menu-overlay id="overlay" on-opened-changed="_onOverlayOpened" on-vaadin-overlay-open="_onVaadinOverlayOpen" with-backdrop="[[_phone]]" phone\$="[[_phone]]" model="[[_context]]" theme\$="[[theme]]">
    </vaadin-context-menu-overlay>
`;
  }

  static get is() {
    return 'vaadin-context-menu';
  }

  static get version() {
    return '4.3.15';
  }

  static get properties() {
    return {

      /**
       * CSS selector that can be used to target any child element
       * of the context menu to listen for `openOn` events.
       */
      selector: {
        type: String
      },

      /**
       * True if the overlay is currently displayed.
       */
      opened: {
        type: Boolean,
        value: false,
        notify: true,
        readOnly: true
      },

      /**
       * Event name to listen for opening the context menu.
       */
      openOn: {
        type: String,
        value: 'vaadin-contextmenu'
      },

      /**
       * The target element that's listened to for context menu opening events.
       * By default the vaadin-context-menu listens to the target's `vaadin-contextmenu`
       * events.
       * @type {HTMLElement}
       * @default self
       */
      listenOn: {
        type: Object,
        value: function() {
          return this;
        }
      },

      /**
       * Event name to listen for closing the context menu.
       */
      closeOn: {
        type: String,
        value: 'click',
        observer: '_closeOnChanged'
      },

      /**
       * Custom function for rendering the content of the menu overlay.
       * Receives three arguments:
       *
       * - `root` The root container DOM element. Append your content to it.
       * - `contextMenu` The reference to the `<vaadin-context-menu>` element.
       * - `context` The object with the menu context, contains:
       *   - `context.target`  the target of the menu opening event,
       *   - `context.detail` the menu opening event detail.
       */
      renderer: {
        type: Function
      },

      _context: Object,

      _boundClose: Object,

      _boundOpen: Object,

      _contentTemplate: Object,

      _oldTemplate: Object,

      _oldRenderer: Object,

      _touch: Boolean
    };
  }

  static get observers() {
    return [
      '_openedChanged(opened)',
      '_contextChanged(_context, _instance)',
      '_targetOrOpenOnChanged(listenOn, openOn)',
      '_templateOrRendererChanged(_contentTemplate, renderer, _context, items)'
    ];
  }

  constructor() {
    super();
    this._boundOpen = this.open.bind(this);
    this._boundClose = this.close.bind(this);
    this._boundOnGlobalContextMenu = this._onGlobalContextMenu.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();

    this.__boundOnScroll = this.__onScroll.bind(this);
    window.addEventListener('scroll', this.__boundOnScroll, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('scroll', this.__boundOnScroll, true);
    this.close();
  }

  ready() {
    super.ready();
    this._observer = new FlattenedNodesObserver(this, info => {
      this._setTemplateFromNodes(info.addedNodes);
    });
  }

  _setTemplateFromNodes(nodes) {
    this._contentTemplate = nodes.filter(node => node.localName && node.localName === 'template')[0] || this._contentTemplate;
  }

  // Runs before overlay is fully rendered
  _onOverlayOpened(e) {
    this._setOpened(e.detail.value);
    this.__alignOverlayPosition();
  }

  // Runs after overlay is fully rendered
  _onVaadinOverlayOpen(e) {
    this.__alignOverlayPosition();
    this.$.overlay.style.opacity = '';
    this.__forwardFocus();
  }

  _targetOrOpenOnChanged(listenOn, openOn) {
    if (this._oldListenOn && this._oldOpenOn) {
      this._unlisten(this._oldListenOn, this._oldOpenOn, this._boundOpen);

      this._oldListenOn.style.webkitTouchCallout = '';
      this._oldListenOn.style.webkitUserSelect = '';
      this._oldListenOn.style.msUserSelect = '';
      this._oldListenOn.style.userSelect = '';

      this._oldListenOn = null;
      this._oldOpenOn = null;
    }

    if (listenOn && openOn) {
      this._listen(listenOn, openOn, this._boundOpen);

      this._oldListenOn = listenOn;
      this._oldOpenOn = openOn;
    }
  }

  _setListenOnUserSelect(value) {
    // note: these styles don't seem to work in Firefox on iOS.
    this.listenOn.style.webkitTouchCallout = value;
    this.listenOn.style.webkitUserSelect = value; // Chrome, Safari, Firefox
    this.listenOn.style.msUserSelect = value; // IE 10+
    this.listenOn.style.userSelect = value;

    // note: because user-selection is disabled on the overlay
    // before opening the menu the text could be already selected
    // so we need to clear that selection
    document.getSelection().removeAllRanges();
  }

  _closeOnChanged(closeOn, oldCloseOn) {
    // Listen on this.$.overlay.root to workaround issue on
    //  ShadyDOM polyfill: https://github.com/webcomponents/shadydom/issues/159

    // Outside click event from overlay
    const evtOverlay = 'vaadin-overlay-outside-click';

    if (oldCloseOn) {
      this._unlisten(this.$.overlay, oldCloseOn, this._boundClose);
      this._unlisten(this.$.overlay.root, oldCloseOn, this._boundClose);
    }
    if (closeOn) {
      this._listen(this.$.overlay, closeOn, this._boundClose);
      this._listen(this.$.overlay.root, closeOn, this._boundClose);
      this._unlisten(this.$.overlay, evtOverlay, this._preventDefault);
    } else {
      this._listen(this.$.overlay, evtOverlay, this._preventDefault);
    }
  }

  _preventDefault(e) {
    e.preventDefault();
  }

  _openedChanged(opened) {
    if (opened) {
      if (!this._instance) {
        this.$.overlay.template = this.querySelector('template');
        this._instance = this.$.overlay._instance;
      }
      document.documentElement.addEventListener('contextmenu', this._boundOnGlobalContextMenu, true);
      this._setListenOnUserSelect('none');
    } else {
      document.documentElement.removeEventListener('contextmenu', this._boundOnGlobalContextMenu, true);
      this._setListenOnUserSelect('');
    }

    // Has to be set after instance has been created
    this.$.overlay.opened = opened;
  }

  /**
   * Manually invoke existing renderer.
   */
  render() {
    this.$.overlay.render();
  }

  _removeNewRendererOrTemplate(template, oldTemplate, renderer, oldRenderer) {
    if (template !== oldTemplate) {
      this._contentTemplate = undefined;
    } else if (renderer !== oldRenderer) {
      this.renderer = undefined;
    }
  }

  _templateOrRendererChanged(template, renderer, context, items) {
    if (template && renderer) {
      this._removeNewRendererOrTemplate(template, this._oldTemplate, renderer, this._oldRenderer);
      throw new Error('You should only use either a renderer or a template for context-menu content');
    }

    this._oldTemplate = template;
    this._oldRenderer = renderer;

    if (items) {
      if (template || renderer) {
        throw new Error('The items API cannot be used together with a template/renderer');
      }
      if (this.closeOn === 'click') {
        this.closeOn = '';
      }

      renderer = this.__itemsRenderer;
    }
    if (renderer && context) {
      this.$.overlay.setProperties({owner: this, renderer: renderer});
    }
  }

  _contextChanged(context, instance) {
    if (context === undefined || instance === undefined) {
      return;
    }
    instance.detail = context.detail;
    instance.target = context.target;
  }

  /**
   * Closes the overlay.
   */
  close() {
    this._setOpened(false);
  }

  _contextTarget(e) {
    if (this.selector) {
      const targets = this.listenOn.querySelectorAll(this.selector);

      return Array.prototype.filter.call(targets, el => {
        return e.composedPath().indexOf(el) > -1;
      })[0];
    } else {
      return e.target;
    }
  }

  /**
   * Opens the overlay.
   * @param {Event} e used as the context for the menu. Overlay coordinates are taken from this event.
   */
  open(e) {
    if (e && !this.opened) {
      this._context = {
        detail: e.detail,
        target: this._contextTarget(e)
      };

      if (this._context.target) {
        this._preventDefault(e);
        e.stopPropagation();

        // Used in alignment which is delayed until overlay is rendered
        this.__x = this._getEventCoordinate(e, 'x');
        this.__pageXOffset = window.pageXOffset;

        this.__y = this._getEventCoordinate(e, 'y');
        this.__pageYOffset = window.pageYOffset;

        this.$.overlay.style.opacity = '0';
        this._setOpened(true);
      }
    }
  }

  __onScroll() {
    if (!this.opened) {
      return;
    }

    const yDiff = window.pageYOffset - this.__pageYOffset;
    const xDiff = window.pageXOffset - this.__pageXOffset;

    this.__adjustPosition('left', -xDiff);
    this.__adjustPosition('right', xDiff);

    this.__adjustPosition('top', -yDiff);
    this.__adjustPosition('bottom', yDiff);

    this.__pageYOffset += yDiff;
    this.__pageXOffset += xDiff;
  }

  __adjustPosition(coord, diff) {
    const overlay = this.$.overlay;
    const style = overlay.style;

    style[coord] = (parseInt(style[coord]) || 0) + diff + 'px';
  }

  __alignOverlayPosition() {
    const overlay = this.$.overlay;
    const style = overlay.style;

    // Reset all properties before measuring
    ['top', 'right', 'bottom', 'left'].forEach(prop => style.removeProperty(prop));
    ['right-aligned', 'bottom-aligned'].forEach(attr => overlay.removeAttribute(attr));

    // Maximum x and y values are imposed by content size and overlay limits.
    const {xMax, yMax, left, top, width} = overlay.getBoundaries();
    // Reuse saved x and y event values, in order to this method be used async
    // in the `vaadin-overlay-change` which guarantees that overlay is ready
    let x = this.__x || left;
    const y = this.__y || top;

    // Select one overlay corner and move to the event x/y position.
    // Then set styling attrs for flex-aligning the content appropriately.
    const wdthVport = document.documentElement.clientWidth;
    const hghtVport = document.documentElement.clientHeight;

    // Align to the parent menu overlay, if any.
    const parent = overlay.parentOverlay;
    let alignedToParent = false;
    let parentContentRect;
    if (parent) {
      parentContentRect = parent.$.overlay.getBoundingClientRect();
      if (parent.hasAttribute('right-aligned')) {
        const parentStyle = getComputedStyle(parent);
        const getPadding = (el, direction) => {
          return parseFloat(getComputedStyle(el.$.content)['padding' + direction]);
        };
        const right = parseFloat(parentStyle.right) + parentContentRect.width;
        const padding = getPadding(parent, 'Left') + getPadding(overlay, 'Right');

        // Preserve right-aligned, if possible.
        if ((wdthVport - (right - padding)) > width) {
          overlay.setAttribute('right-aligned', '');
          style.right = right + 'px';
          alignedToParent = true;
        }
      } else if (x < parentContentRect.x) {
        // Check if sub menu opens on the left side and the parent menu is not right aligned.
        // If so, use actual width of the submenu content instead of the parent menu content.
        x = x - (width - parentContentRect.width);
      }
    }

    if (!alignedToParent) {
      // Sub-menu is displayed in the right side of root menu
      if ((x < wdthVport / 2 || x < xMax) && !parent) {
        style.left = x + 'px';
      } else if ((parent && (wdthVport - parentContentRect.width - parentContentRect.left
        >= parentContentRect.width))) { // Sub-menu is displayed in the right side of root menu If it is nested menu
        style.left = parentContentRect.left + parentContentRect.width + 'px';
      } else if (parent) { // Sub-menu is displayed in the left side of root menu If it is nested menu
        style.right = 'auto';
        style.left = Math.max(overlay.getBoundingClientRect().left,
          parentContentRect.left - overlay.getBoundingClientRect().width) + 'px';
        overlay.setAttribute('right-aligned', '');
      } else { // Sub-menu is displayed in the left side of root menu
        style.right = Math.max(0, (wdthVport - x)) + 'px';
        overlay.setAttribute('right-aligned', '');
      }
    }
    if (y < hghtVport / 2 || y < yMax) {
      style.top = y + 'px';
    } else {
      style.bottom = Math.max(0, (hghtVport - y)) + 'px';
      overlay.setAttribute('bottom-aligned', '');
    }
  }

  _getEventCoordinate(event, coord) {
    if (event.detail instanceof Object) {
      if (event.detail[coord]) {
        // Polymer gesture events, get coordinate from detail
        return event.detail[coord];
      } else if (event.detail.sourceEvent) {
        // Unwrap detailed event
        return this._getEventCoordinate(event.detail.sourceEvent, coord);
      }
    } else {
      const prop = 'client' + coord.toUpperCase();
      const position = event.changedTouches ? event.changedTouches[0][prop] : event[prop];

      if (position === 0) {
        // Native keyboard event
        const rect = event.target.getBoundingClientRect();
        return coord === 'x' ? rect.left : rect.top + rect.height;
      } else {
        // Native mouse or touch event
        return position;
      }
    }
  }

  _listen(node, evType, handler) {
    if (gestures[evType]) {
      addListener(node, evType, handler);
    } else {
      node.addEventListener(evType, handler);
    }
  }

  _unlisten(node, evType, handler) {
    if (gestures[evType]) {
      removeListener(node, evType, handler);
    } else {
      node.removeEventListener(evType, handler);
    }
  }

  _onGlobalContextMenu(e) {
    if (!e.shiftKey) {
      e.preventDefault();
      this.close();
    }
  }

  /**
   * Fired when an item is selected when the context menu is populated using the `items` API.
   *
   * @event item-selected
   * @param {Object} detail
   * @param {Object} detail.value the selected menu item
   */
}

customElements.define(ContextMenuElement.is, ContextMenuElement);
export { ContextMenuElement };
