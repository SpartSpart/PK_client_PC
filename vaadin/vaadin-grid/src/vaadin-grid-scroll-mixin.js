/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';

import { timeOut, animationFrame, microTask } from '@polymer/polymer/lib/utils/async.js';

/**
 * @polymerMixin
 */
export const ScrollMixin = superClass => class ScrollMixin extends superClass {

  get _timeouts() {
    return {
      SCROLL_PERIOD: 1000,
      WHEEL_SCROLLING: 200,
      SCROLLING: 100,
      IGNORE_WHEEL: 500
    };
  }

  static get properties() {
    return {

      // Cached array of frozen cells
      _frozenCells: {
        type: Array,
        value: function() {
          return [];
        },
      },

      _scrollbarWidth: {
        type: Number,
        value: function() {
          // Create the measurement node
          var scrollDiv = document.createElement('div');
          scrollDiv.style.width = '100px';
          scrollDiv.style.height = '100px';
          scrollDiv.style.overflow = 'scroll';
          scrollDiv.style.position = 'absolute';
          scrollDiv.style.top = '-9999px';
          document.body.appendChild(scrollDiv);
          // Get the scrollbar width
          var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
          // Delete the DIV
          document.body.removeChild(scrollDiv);
          return scrollbarWidth;
        }
      },

      _rowWithFocusedElement: Element,

      _deltaYAcc: {
        type: Number,
        value: 0
      }

    };
  }

  static get observers() {
    return [
      '_scrollHeightUpdated(_estScrollHeight)',
      '_scrollViewportHeightUpdated(_viewportHeight)'
    ];
  }

  // Override (from iron-scroll-target-behavior) to avoid document scroll
  set _scrollTop(top) {
    this.$.table.scrollTop = top;
  }

  get _scrollTop() {
    return this.$.table.scrollTop;
  }

  constructor() {
    super();
    this._scrollLineHeight = this._getScrollLineHeight();
  }

  /**
   * @returns {Number|undefined} - The browser's default font-size in pixels
   */
  _getScrollLineHeight() {
    const el = document.createElement('div');
    el.style.fontSize = 'initial';
    el.style.display = 'none';
    document.body.appendChild(el);
    const fontSize = window.getComputedStyle(el).fontSize;
    document.body.removeChild(el);
    return fontSize ? window.parseInt(fontSize) : undefined;
  }

  _scrollViewportHeightUpdated(_viewportHeight) {
    this._scrollPageHeight = _viewportHeight - this.$.header.clientHeight - this.$.footer.clientHeight - this._scrollLineHeight;
  }

  ready() {
    super.ready();
    this.scrollTarget = this.$.table;

    this.addEventListener('wheel', e => {
      this._wheelScrolling = true;
      this._debouncerWheelScrolling = Debouncer.debounce(
        this._debouncerWheelScrolling,
        timeOut.after(this._timeouts.WHEEL_SCROLLING),
        () => this._wheelScrolling = false
      );
      this._onWheel(e);
    });

    this.$.table.addEventListener('scroll', e => {
      if (this.$.outerscroller.outerScrolling) {
        e.stopImmediatePropagation();
      }
    }, true);

    this.$.items.addEventListener('focusin', (e) => {
      const itemsIndex = e.composedPath().indexOf(this.$.items);
      this._rowWithFocusedElement = e.composedPath()[itemsIndex - 1];
    });
    this.$.items.addEventListener('focusout', () => this._rowWithFocusedElement = undefined);
  }

  /**
   * Scroll to a specific row index in the virtual list. Note that the row index is
   * not always the same for any particular item. For example, sorting/filtering/expanding
   * or collapsing hierarchical items can affect the row index related to an item.
   *
   * @param {number} index Row index to scroll to
   */
  scrollToIndex(index) {
    this._accessIronListAPI(() => super.scrollToIndex(index));
  }

  _onWheel(e) {
    if (e.ctrlKey || this._hasScrolledAncestor(e.target, e.deltaX, e.deltaY)) {
      return;
    }

    const table = this.$.table;

    let deltaY = e.deltaY;
    if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) {
      // Scrolling by "lines of text" instead of pixels
      deltaY *= this._scrollLineHeight;
    } else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
      // Scrolling by "pages" instead of pixels
      deltaY *= this._scrollPageHeight;
    }

    if (this._wheelAnimationFrame) {
      // Skip new wheel events while one is being processed
      this._deltaYAcc += deltaY;
      e.preventDefault();
      return;
    }

    deltaY += this._deltaYAcc;
    this._deltaYAcc = 0;

    this._wheelAnimationFrame = true;
    this._debouncerWheelAnimationFrame = Debouncer.debounce(
      this._debouncerWheelAnimationFrame,
      animationFrame,
      () => this._wheelAnimationFrame = false
    );

    var momentum = Math.abs(e.deltaX) + Math.abs(deltaY);

    if (this._canScroll(table, e.deltaX, deltaY)) {
      e.preventDefault();
      table.scrollTop += deltaY;
      table.scrollLeft += e.deltaX;
      this._scrollHandler();
      this._hasResidualMomentum = true;

      this._ignoreNewWheel = true;
      this._debouncerIgnoreNewWheel = Debouncer.debounce(
        this._debouncerIgnoreNewWheel,
        timeOut.after(this._timeouts.IGNORE_WHEEL),
        () => this._ignoreNewWheel = false
      );
    } else if (this._hasResidualMomentum && momentum <= this._previousMomentum || this._ignoreNewWheel) {
      e.preventDefault();
    } else if (momentum > this._previousMomentum) {
      this._hasResidualMomentum = false;
    }
    this._previousMomentum = momentum;
  }

  /**
   * Determines if the element has an ancestor prior to this
   * cell content that handles the scroll delta
   */
  _hasScrolledAncestor(el, deltaX, deltaY) {
    if (el.localName === 'vaadin-grid-cell-content') {
      return false;
    } else if (this._canScroll(el, deltaX, deltaY)
      && ['auto', 'scroll'].indexOf(getComputedStyle(el).overflow) !== -1) {
      return true;
    } else if (el !== this && el.parentElement) {
      return this._hasScrolledAncestor(el.parentElement, deltaX, deltaY);
    }
  }

  /**
   * Determines if the the given scroll deltas can be applied to the element
   * (fully or partially)
   */
  _canScroll(el, deltaX, deltaY) {
    return (deltaY > 0 && el.scrollTop < el.scrollHeight - el.offsetHeight) ||
    (deltaY < 0 && el.scrollTop > 0) ||
    (deltaX > 0 && el.scrollLeft < el.scrollWidth - el.offsetWidth) ||
    (deltaX < 0 && el.scrollLeft > 0);
  }

  _scheduleScrolling() {
    if (!this._scrollingFrame) {
      // Defer setting state attributes to avoid Edge hiccups
      this._scrollingFrame = requestAnimationFrame(() => this._toggleAttribute('scrolling', true, this.$.scroller));
    }
    this._debounceScrolling = Debouncer.debounce(
      this._debounceScrolling,
      timeOut.after(this._timeouts.SCROLLING),
      () => {
        cancelAnimationFrame(this._scrollingFrame);
        delete this._scrollingFrame;
        this._toggleAttribute('scrolling', false, this.$.scroller);
        if (!this.$.outerscroller.outerScrolling) {
          this._reorderRows();
        }
      }
    );

    if (!this._scrollPeriodFrame) {
      this._scrollPeriodFrame = requestAnimationFrame(() => this._toggleAttribute('scroll-period', true, this.$.scroller));
    }
    this._debounceScrollPeriod = Debouncer.debounce(
      this._debounceScrollPeriod,
      timeOut.after(this._timeouts.SCROLL_PERIOD),
      () => {
        cancelAnimationFrame(this._scrollPeriodFrame);
        delete this._scrollPeriodFrame;
        this._toggleAttribute('scroll-period', false, this.$.scroller);
      }
    );
  }

  _afterScroll() {
    this._translateStationaryElements();

    if (!this.hasAttribute('reordering')) {
      this._scheduleScrolling();
    }

    const os = this.$.outerscroller;
    if (!this._ios && (this._wheelScrolling || os.passthrough)) {
      os.syncOuterScroller();
    }

    if (this._ios) {
      // Enable vertical rubberband feedback
      const overScroll = Math.max(-os.scrollTop, 0) ||
        Math.min(0, os.scrollHeight - os.scrollTop - os.offsetHeight);
      this.$.items.style.transform = `translateY(${overScroll}px)`;
    }

    this._updateOverflow();
  }

  _updateOverflow() {
    // Set overflow styling attributes
    let overflow = '';
    const table = this.$.table;
    if (table.scrollTop < table.scrollHeight - table.clientHeight) {
      overflow += ' bottom';
    }

    if (table.scrollTop > 0) {
      overflow += ' top';
    }

    if (table.scrollLeft < table.scrollWidth - table.clientWidth) {
      overflow += ' right';
    }

    if (table.scrollLeft > 0) {
      overflow += ' left';
    }

    this._debounceOverflow = Debouncer.debounce(
      this._debounceOverflow,
      animationFrame,
      () => {
        const value = overflow.trim();
        if (value.length > 0 && this.getAttribute('overflow') !== value) {
          this.setAttribute('overflow', value);
        } else if (value.length == 0 && this.hasAttribute('overflow')) {
          this.removeAttribute('overflow');
        }
      }
    );
  }

  // correct order needed for preserving correct tab order between cell contents.
  _reorderRows() {
    const body = this.$.items;
    const items = body.querySelectorAll('tr');
    if (!items.length) {
      return;
    }

    const adjustedVirtualStart = this._virtualStart + this._vidxOffset;

    // Which row to use as a target?
    const targetRow = this._rowWithFocusedElement || Array.from(items).filter(row => !row.hidden)[0];
    if (!targetRow) {
      // All rows are hidden, don't reorder
      return;
    }

    // Where the target row should be?
    const targetPhysicalIndex = targetRow.index - adjustedVirtualStart;

    // Reodrer the DOM elements to keep the target row at the target physical index
    const delta = Array.from(items).indexOf(targetRow) - targetPhysicalIndex;
    if (delta > 0) {
      for (let i = 0; i < delta; i++) {
        body.appendChild(items[i]);
      }
    } else if (delta < 0) {
      for (let i = items.length + delta; i < items.length; i++) {
        body.insertBefore(items[i], items[0]);
      }
    }
  }

  _frozenCellsChanged() {
    this._debouncerCacheElements = Debouncer.debounce(
      this._debouncerCacheElements,
      microTask,
      () => {
        Array.from(this.root.querySelectorAll('[part~="cell"]')).forEach(function(cell) {
          cell.style.transform = '';
        });
        this._frozenCells = Array.prototype.slice.call(this.$.table.querySelectorAll('[frozen]'));
        this._translateStationaryElements();
      }
    );
    this._updateLastFrozen();
  }

  _updateLastFrozen() {
    if (!this._columnTree) {
      return;
    }

    const columnsRow = this._columnTree[this._columnTree.length - 1].slice(0);
    columnsRow.sort((a, b) => {
      return a._order - b._order;
    });
    const lastFrozen = columnsRow.reduce((prev, col, index) => {
      col._lastFrozen = false;
      return col.frozen && !col.hidden ? index : prev;
    }, undefined);
    if (lastFrozen !== undefined) {
      columnsRow[lastFrozen]._lastFrozen = true;
    }
  }

  _translateStationaryElements() {
    if (this._edge && !this._scrollbarWidth) {
      // Fixed mode (Tablet Edge)
      this.$.items.style.transform =
      this._getTranslate(-this._scrollLeft || 0, -this._scrollTop || 0);

      this.$.footer.style.transform = this.$.header.style.transform =
      this._getTranslate(-this._scrollLeft || 0, 0);
    } else {
      this.$.footer.style.transform = this.$.header.style.transform = this._getTranslate(0, this._scrollTop);
    }

    var frozenCellTransform = this._getTranslate(this._scrollLeft, 0);
    for (var i = 0; i < this._frozenCells.length; i++) {
      this._frozenCells[i].style.transform = frozenCellTransform;
    }
  }

  _getTranslate(x, y) {
    return 'translate(' + x + 'px,' + y + 'px)';
  }

  _scrollHeightUpdated(_estScrollHeight) {
    this.$.outersizer.style.top = this.$.fixedsizer.style.top = _estScrollHeight + 'px';
  }

};
