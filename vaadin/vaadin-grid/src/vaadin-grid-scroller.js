/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';

import { animationFrame } from '@polymer/polymer/lib/utils/async.js';
import { flush } from '@polymer/polymer/lib/utils/flush.js';
import { PolymerIronList } from './iron-list.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
/**
 * This Element is used internally by vaadin-grid.
 *
 * @private
 */
class GridScrollerElement extends PolymerIronList {

  static get is() {
    return 'vaadin-grid-scroller';
  }

  static get properties() {
    return {
      size: {
        type: Number,
        notify: true
      },
      _vidxOffset: {
        value: 0
      }
    };
  }

  static get observers() {
    return [
      '_effectiveSizeChanged(_effectiveSize)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this._scrollHandler();
  }

  /**
  * @protected
  */
  _updateScrollerItem(item, index) {}
  /**
  * @protected
  */
  _afterScroll() {}
  /**
  * @protected
  */
  _getRowTarget() {}
  /**
  * @protected
  */
  _createScrollerRows() {}
  /**
  * @protected
  */
  _canPopulate() {}

  /**
  * @private
  */
  scrollToIndex(index) {
    this._warnPrivateAPIAccess('scrollToIndex');

    if (index > 0) {
      this._pendingScrollToIndex = null;
    }
    if (!parseInt(this.$.items.style.borderTopWidth) && index > 0) {
      // Schedule another scroll to be invoked once init is complete
      this._pendingScrollToIndex = index;
    }

    this._scrollingToIndex = true;
    index = Math.min(Math.max(index, 0), this._effectiveSize - 1);
    this.$.table.scrollTop = index / this._effectiveSize * (this.$.table.scrollHeight - this.$.table.offsetHeight);
    this._scrollHandler();

    if (this._accessIronListAPI(() => this._maxScrollTop) && this._virtualCount < this._effectiveSize) {
      this._adjustVirtualIndexOffset(1000000);
    }

    this._accessIronListAPI(() => super.scrollToIndex(index - this._vidxOffset));
    this._scrollHandler();

    // Ensure scroll position
    const row = Array.from(this.$.items.children).filter(child => child.index === index)[0];
    if (row) {
      const headerOffset = row.getBoundingClientRect().top - this.$.header.getBoundingClientRect().bottom;
      if (Math.abs(headerOffset) > 1) {
        this.$.table.scrollTop += headerOffset;
        this._scrollHandler();
      }
    }

    this._scrollingToIndex = false;
  }

  _effectiveSizeChanged(size) {
    let fvi; // first visible (adjusted) index
    let fviOffset = 0;
    this._iterateItems((pidx, vidx) => {
      if (vidx === this._firstVisibleIndex) {
        const row = this._physicalItems[pidx];
        fvi = row.index;
        fviOffset = row.getBoundingClientRect().top;
      }
    });

    if (this.items && size < this.items.length) {
      // Size was reduced, scroll to 0 first
      this._scrollTop = 0;
    }
    if (!Array.isArray(this.items)) {
      // Edge/IE seems to have the lowest maximum
      const maxVirtualItems = this._edge || this._ie ? 30000 : 100000;
      this.items = {length: Math.min(size, maxVirtualItems)};
    }

    this._accessIronListAPI(() => super._itemsChanged({path: 'items'}));

    this._virtualCount = Math.min(this.items.length, size) || 0;

    if (this._scrollTop === 0) {
      this._accessIronListAPI(() => this._scrollToIndex(Math.min(size - 1, fvi)));
      this._iterateItems((pidx, vidx) => {
        const row = this._physicalItems[pidx];
        if (row.index === fvi) {
          this.$.table.scrollTop += Math.round(row.getBoundingClientRect().top - fviOffset);
        }
        // Restore keyboard focus to the right cell
        if (row.index === this._focusedItemIndex && this._itemsFocusable && this.$.items.contains(this.shadowRoot.activeElement)) {
          const cellIndex = Array.from(this._itemsFocusable.parentElement.children).indexOf(this._itemsFocusable);
          row.children[cellIndex].focus();
        }
      });
    }
    this._assignModels();
    requestAnimationFrame(() => this._update());
  }

  _positionItems() {
    this._adjustScrollPosition();

    let rePosition;
    if (isNaN(this._physicalTop)) {
      rePosition = true;
      this._physicalTop = 0;
    }

    let y = this._physicalTop;
    this._iterateItems((pidx, vidx) => {
      this._physicalItems[pidx].style.transform = `translateY(${y}px)`;
      y += this._physicalSizes[pidx];
    });

    if (rePosition) {
      this._scrollToIndex(0);
    }
  }

  _increasePoolIfNeeded(count) {
    if ((count === 0 && this._scrollingToIndex) || !this._canPopulate() || !this._effectiveSize) {
      return;
    }

    if (!this._initialPoolCreated) {
      this._initialPoolCreated = true;
      super._increasePoolIfNeeded(25);
    } else if (this._optPhysicalSize !== Infinity) {
      this._debounceIncreasePool = Debouncer.debounce(
        this._debounceIncreasePool,
        animationFrame,
        () => {
          this._updateMetrics();
          const remainingPhysicalSize = this._optPhysicalSize - this._physicalSize;
          let estimatedMissingRowCount = Math.ceil(remainingPhysicalSize / this._physicalAverage);

          if (this._physicalCount + estimatedMissingRowCount > this._effectiveSize) {
            // Do not increase the physical item count above the this._effectiveSize
            estimatedMissingRowCount = Math.max(0, this._effectiveSize - this._physicalCount);
          }

          if (this._physicalSize && estimatedMissingRowCount > 0) {
            super._increasePoolIfNeeded(estimatedMissingRowCount);
            // Ensure the rows are in order after increasing pool
            this.__reorderChildNodes();
          }
        });
    }
  }

  __reorderChildNodes() {
    const childNodes = Array.from(this.$.items.childNodes);
    const rowsInOrder = !!childNodes.reduce((inOrder, current, currentIndex, array) => {
      if (currentIndex === 0 || array[currentIndex - 1].index === current.index - 1) {
        return inOrder;
      }
    }, true);

    if (!rowsInOrder) {
      childNodes.sort((row1, row2) => {
        return row1.index - row2.index;
      }).forEach(row => this.$.items.appendChild(row));
    }
  }

  _createPool(size) {
    const fragment = document.createDocumentFragment();
    const physicalItems = this._createScrollerRows(size);

    physicalItems.forEach(inst => fragment.appendChild(inst));
    this._getRowTarget().appendChild(fragment);

    // Weird hack needed to get Safari to actually distribute slots
    const content = this.querySelector('[slot]');
    if (content) {
      const slot = content.getAttribute('slot');
      content.setAttribute('slot', 'foo-bar');
      content.setAttribute('slot', slot);
    }

    this._updateHeaderFooterMetrics();

    afterNextRender(this, () => this.notifyResize());
    return physicalItems;
  }

  /**
   * Assigns the data models to a given set of items.
   * @param {!Array<number>=} itemSet
   */
  _assignModels(itemSet) {
    this._iterateItems((pidx, vidx) => {
      const el = this._physicalItems[pidx];
      this._toggleAttribute('hidden', vidx >= this._effectiveSize, el);
      this._updateScrollerItem(el, vidx + (this._vidxOffset || 0));
    }, itemSet);
  }

  _scrollHandler() {
    const delta = this.$.table.scrollTop - this._scrollPosition;
    this._accessIronListAPI(super._scrollHandler);
    const oldOffset = this._vidxOffset;
    if (this._accessIronListAPI(() => this._maxScrollTop) && this._virtualCount < this._effectiveSize) {
      this._adjustVirtualIndexOffset(delta);
    }
    if (this._vidxOffset !== oldOffset) {
      this._update();
    }
    this._afterScroll();
  }

  _adjustVirtualIndexOffset(delta) {
    if (Math.abs(delta) > 10000) {
      if (this._noScale) {
        this._noScale = false;
        return;
      }
      const scale = this.$.table.scrollTop / (this.$.table.scrollHeight - this.$.table.offsetHeight);
      const offset = scale * this._effectiveSize;
      this._vidxOffset = Math.round(offset - scale * this._virtualCount);
    } else {
      // Make sure user can always swipe/wheel scroll to the start and end
      const oldOffset = this._vidxOffset || 0;
      const threshold = 1000;
      const maxShift = 100;
      // At start
      if (this._scrollTop === 0) {
        this._vidxOffset = 0;
        if (oldOffset !== this._vidxOffset) {
          super.scrollToIndex(0);
        }
      } else if (this.firstVisibleIndex < threshold && this._vidxOffset > 0) {
        this._vidxOffset -= Math.min(this._vidxOffset, maxShift);
        if (oldOffset !== this._vidxOffset) {
          super.scrollToIndex(this.firstVisibleIndex + (oldOffset - this._vidxOffset));
        }
        this._noScale = true;
      }
      // At end
      const maxOffset = this._effectiveSize - this._virtualCount;
      if (this._scrollTop >= this._maxScrollTop && this._maxScrollTop > 0) {
        this._vidxOffset = maxOffset;
        if (oldOffset !== this._vidxOffset) {
          super.scrollToIndex(this._virtualCount);
        }
      } else if (this.firstVisibleIndex > this._virtualCount - threshold && this._vidxOffset < maxOffset) {
        this._vidxOffset += Math.min(maxOffset - this._vidxOffset, maxShift);
        if (oldOffset !== this._vidxOffset) {
          super.scrollToIndex(this.firstVisibleIndex - (this._vidxOffset - oldOffset));
        }
        this._noScale = true;
      }
    }
  }

  _accessIronListAPI(cb) {
    this._warnPrivateAPIAccessAsyncEnabled = false;
    const returnValue = cb.apply(this);
    this._debouncerWarnPrivateAPIAccess = Debouncer.debounce(
      this._debouncerWarnPrivateAPIAccess,
      animationFrame,
      () => this._warnPrivateAPIAccessAsyncEnabled = true
    );
    return returnValue;
  }

  /* Allow iron-list to access its APIs from debounced callbacks without warns */
  _debounceRender(cb, asyncModule) {
    super._debounceRender(() => this._accessIronListAPI(cb), asyncModule);
  }

  /* Warn when iron-list APIs are being accessed directly */
  _warnPrivateAPIAccess(apiName) {
    if (this._warnPrivateAPIAccessAsyncEnabled) {
      console.warn(`Accessing private API (${apiName})!`);
    }
  }

  _render() {
    this._accessIronListAPI(super._render);
  }

  _createFocusBackfillItem() { /* Ignore */ }
  _multiSelectionChanged() { /* Ignore */ }
  clearSelection() { /* Ignore */ }
  _itemsChanged() { /* Ignore */ }
  _manageFocus() { /* Ignore */ }
  _removeFocusedItem() { /* Ignore */ }

  get _firstVisibleIndex() {
    return this._accessIronListAPI(() => super.firstVisibleIndex);
  }
  get _lastVisibleIndex() {
    return this._accessIronListAPI(() => super.lastVisibleIndex);
  }
  _scrollToIndex(index) {
    this._accessIronListAPI(() => this.scrollToIndex(index));
  }
  get firstVisibleIndex() {
    this._warnPrivateAPIAccess('firstVisibleIndex'); return super.firstVisibleIndex;
  }
  set firstVisibleIndex(value) {
    this._warnPrivateAPIAccess('firstVisibleIndex'); super.firstVisibleIndex = value;
  }
  get lastVisibleIndex() {
    this._warnPrivateAPIAccess('lastVisibleIndex'); return super.lastVisibleIndex;
  }
  set lastVisibleIndex(value) {
    this._warnPrivateAPIAccess('lastVisibleIndex'); super.lastVisibleIndex = value;
  }
  updateViewportBoundaries() {
    this._warnPrivateAPIAccess('updateViewportBoundaries'); super.updateViewportBoundaries.apply(this, arguments);
  }
  _resizeHandler() {
    super._resizeHandler();
    flush();
  }
}

customElements.define(GridScrollerElement.is, GridScrollerElement);

export { GridScrollerElement as ScrollerElement };
