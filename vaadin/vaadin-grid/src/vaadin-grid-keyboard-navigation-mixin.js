/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
/**
 * @polymerMixin
 */
export const KeyboardNavigationMixin = superClass => class KeyboardNavigationMixin extends superClass {
  static get properties() {
    return {
      _headerFocusable: {
        type: Object,
        observer: '_focusableChanged'
      },
      _itemsFocusable: {
        type: Object,
        observer: '_focusableChanged'
      },
      _footerFocusable: {
        type: Object,
        observer: '_focusableChanged'
      },
      _navigatingIsHidden: Boolean,
      _focusedItemIndex: {
        type: Number,
        value: 0
      },
      _focusedColumnOrder: Number
    };
  }

  ready() {
    super.ready();

    if (this._ios || this._android) {
      // Disable keyboard navigation on mobile devices
      return;
    }

    this.addEventListener('keydown', this._onKeyDown);
    this.addEventListener('focusin', this._onFocusIn);
    this.addEventListener('focusout', this._onFocusOut);

    // When focus goes from cell to another cell, focusin/focusout events do
    // not escape the grid’s shadowRoot, thus listening inside the shadowRoot.
    this.$.table.addEventListener('focusin', this._onCellFocusIn.bind(this));
    this.$.table.addEventListener('focusout', this._onCellFocusOut.bind(this));

    this.addEventListener('mousedown', () => {
      this._toggleAttribute('navigating', false, this);
      this._isMousedown = true;
    });
    this.addEventListener('mouseup', () => this._isMousedown = false);
  }

  _focusableChanged(focusable, oldFocusable) {
    if (oldFocusable) {
      oldFocusable.setAttribute('tabindex', '-1');
    }
    if (focusable) {
      focusable.setAttribute('tabindex', '0');
    }
  }

  _onKeyDown(e) {
    // Ensure standard key value, unified across browsers
    let key = e.key;
    if (key === 'Up' || key === 'Down' || key === 'Left' || key === 'Right') {
      // MSIE & Edge
      key = 'Arrow' + key;
    }
    if (key === 'Esc') {
      // MSIE & Edge
      key = 'Escape';
    }
    if (key === 'Spacebar') {
      // MSIE
      key = ' ';
    }

    let keyGroup;
    switch (key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'PageUp':
      case 'PageDown':
      case 'Home':
      case 'End':
        keyGroup = 'Navigation';
        break;
      case 'Enter':
      case 'Escape':
      case 'F2':
        keyGroup = 'Interaction';
        break;
      case 'Tab':
        keyGroup = 'Tab';
        break;
      case ' ':
        keyGroup = 'Space';
        break;
    }

    this._detectInteracting(e);
    if (this.hasAttribute('interacting') && keyGroup !== 'Interaction') {
      // When in the interacting mode, only the “Interaction” keys are handled.
      keyGroup = undefined;
    }

    if (keyGroup) {
      this[`_on${keyGroup}KeyDown`](e, key);
    }
  }

  _ensureScrolledToIndex(index) {
    const targetRowInDom = Array.from(this.$.items.children).filter(child => child.index === index)[0];
    if (!targetRowInDom) {
      this._scrollToIndex(index);
    }
  }

  _onNavigationKeyDown(e, key) {
    e.preventDefault();

    function indexOfChildElement(el) {
      return Array.prototype.indexOf.call(el.parentNode.children, el);
    }

    const visibleItemsCount = this._lastVisibleIndex - this._firstVisibleIndex - 1;

    let dx = 0, dy = 0;
    switch (key) {
      case 'ArrowRight':
        dx = 1;
        break;
      case 'ArrowLeft':
        dx = -1;
        break;
      case 'Home':
        dx = -Infinity;
        e.ctrlKey && (dy = -Infinity);
        break;
      case 'End':
        dx = Infinity;
        e.ctrlKey && (dy = Infinity);
        break;
      case 'ArrowDown':
        dy = 1;
        break;
      case 'ArrowUp':
        dy = -1;
        break;
      case 'PageDown':
        dy = visibleItemsCount;
        break;
      case 'PageUp':
        dy = -visibleItemsCount;
        break;
    }

    const activeCell = e.composedPath()[0];
    const columnIndex = indexOfChildElement(activeCell);
    const isRowDetails = this._elementMatches(activeCell, '[part~="details-cell"]');

    const activeRow = activeCell.parentNode;

    const activeRowGroup = activeRow.parentNode;
    const maxRowIndex = (activeRowGroup === this.$.items ? this._effectiveSize : activeRowGroup.children.length) - 1;

    // Body rows have index property, otherwise DOM child index of the row is used.
    const rowIndex = (activeRowGroup === this.$.items) ?
      (this._focusedItemIndex !== undefined ? this._focusedItemIndex : activeRow.index) :
      indexOfChildElement(activeRow);

    // Index of the destination row
    let dstRowIndex = Math.max(0, Math.min(rowIndex + dy, maxRowIndex));

    // Row details navigation logic
    let dstIsRowDetails = false;
    if (activeRowGroup === this.$.items) {
      const item = activeRow._item;
      const dstItem = this._cache.getItemForIndex(dstRowIndex);
      // Should we navigate to row details?
      if (isRowDetails) {
        dstIsRowDetails = dy === 0;
      } else {
        dstIsRowDetails = dy === 1 && this._isDetailsOpened(item) ||
          dy === -1 && dstRowIndex !== rowIndex && this._isDetailsOpened(dstItem);
      }
      // Should we navigate between details and regular cells of the same row?
      if (dstIsRowDetails !== isRowDetails &&
          (dy === 1 && dstIsRowDetails || dy === -1 && !dstIsRowDetails)) {
        dstRowIndex = rowIndex;
      }
    }

    // Header and footer could have hidden rows, e. g., if none of the columns
    // or groups on the given column tree level define template. Skip them
    // in vertical keyboard navigation.
    if (activeRowGroup !== this.$.items) {
      if (dstRowIndex > rowIndex) {
        while (
          dstRowIndex < maxRowIndex &&
          activeRowGroup.children[dstRowIndex].hidden
        ) {
          dstRowIndex++;
        }
      } else if (dstRowIndex < rowIndex) {
        while (
          dstRowIndex > 0 &&
          activeRowGroup.children[dstRowIndex].hidden
        ) {
          dstRowIndex--;
        }
      }
    }

    // _focusedColumnOrder is memoized — this is to ensure predictable
    // navigation when entering and leaving detail and column group cells.
    if (this._focusedColumnOrder === undefined) {
      if (isRowDetails) {
        this._focusedColumnOrder = 0;
      } else {
        this._focusedColumnOrder = this._getColumns(activeRowGroup, rowIndex)[columnIndex]._order;
      }
    }

    // Find orderedColumnIndex — the index of order closest matching the
    // original _focusedColumnOrder in the sorted array of orders
    // of the visible columns on the destination row.
    const dstColumns = this._getColumns(activeRowGroup, dstRowIndex);
    const dstSortedColumnOrders = dstColumns.filter(c => !c.hidden).map(c => c._order)
      .sort((b, a) => (b - a));
    const maxOrderedColumnIndex = dstSortedColumnOrders.length - 1;
    const orderedColumnIndex = dstSortedColumnOrders.indexOf(
      dstSortedColumnOrders.slice(0).sort((b, a) =>
        Math.abs(b - this._focusedColumnOrder) - Math.abs(a - this._focusedColumnOrder)
      )[0]
    );

    // Index of the destination column order
    const dstOrderedColumnIndex = (dy === 0 && isRowDetails) ? orderedColumnIndex :
      Math.max(0, Math.min(orderedColumnIndex + dx, maxOrderedColumnIndex));

    if (dstOrderedColumnIndex !== orderedColumnIndex) {
      // Horizontal movement invalidates stored _focusedColumnOrder
      this._focusedColumnOrder = undefined;
    }

    // Ensure correct vertical scroll position, destination row is visible
    if (activeRowGroup === this.$.items) {
      this._ensureScrolledToIndex(dstRowIndex);
    }

    // This has to be set after scrolling, otherwise it can be removed by
    // `_preventScrollerRotatingCellFocus(item, index)` during scrolling.
    this._toggleAttribute('navigating', true, this);

    const columnIndexByOrder = dstColumns.reduce((acc, col, i) => (acc[col._order] = i, acc), {});
    const dstColumnIndex = columnIndexByOrder[dstSortedColumnOrders[dstOrderedColumnIndex]];

    // For body rows, use index property to find destination row, otherwise use DOM child index
    const dstRow = activeRowGroup === this.$.items ?
      Array.from(activeRowGroup.children).filter(el => el.index === dstRowIndex)[0] :
      activeRowGroup.children[dstRowIndex];
    if (!dstRow) {
      return;
    }

    // Here we go!
    const dstCell = dstIsRowDetails ?
      Array.from(dstRow.children)
        .filter(el => this._elementMatches(el, '[part~="details-cell"]'))[0] :
      dstRow.children[dstColumnIndex];
    this._scrollHorizontallyToCell(dstCell);
    if (activeRowGroup === this.$.items) {
      // When scrolling with repeated keydown, sometimes FocusEvent listeners
      // are too late to update _focusedItemIndex. Ensure next keydown
      // listener invocation gets updated _focusedItemIndex value.
      this._focusedItemIndex = dstRowIndex;
    }

    if (activeRowGroup === this.$.items) {
      const dstRect = dstCell.getBoundingClientRect();
      const footerTop = this.$.footer.getBoundingClientRect().top;
      const headerBottom = this.$.header.getBoundingClientRect().bottom;
      if (dstRect.bottom > footerTop) {
        this.$.table.scrollTop += dstRect.bottom - footerTop;
        this._scrollHandler();
      } else if (dstRect.top < headerBottom) {
        this.$.table.scrollTop -= headerBottom - dstRect.top;
        this._scrollHandler();
      }
    }

    dstCell.focus();
  }

  _parseEventPath(path) {
    const tableIndex = path.indexOf(this.$.table);
    return {
      rowGroup: path[tableIndex - 1],
      row: path[tableIndex - 2],
      cell: path[tableIndex - 3]
    };
  }

  _onInteractionKeyDown(e, key) {
    const localTarget = e.composedPath()[0];
    const localTargetIsTextInput = localTarget.localName === 'input' &&
      !/^(button|checkbox|color|file|image|radio|range|reset|submit)$/i.test(localTarget.type);

    let wantInteracting;
    switch (key) {
      case 'Enter':
        wantInteracting = this.hasAttribute('interacting') ? !localTargetIsTextInput : true;
        break;
      case 'Escape':
        wantInteracting = false;
        break;
      case 'F2':
        wantInteracting = !this.hasAttribute('interacting');
        break;
    }

    const {cell} = this._parseEventPath(e.composedPath());

    if (this.hasAttribute('interacting') !== wantInteracting) {
      if (wantInteracting) {
        const focusTarget = cell._content.querySelector('[focus-target]') ||
          cell._content.firstElementChild;
        if (focusTarget) {
          e.preventDefault();
          focusTarget.focus();
          this._toggleAttribute('interacting', true, this);
          this._toggleAttribute('navigating', false, this);
        }
      } else {
        e.preventDefault();
        this._focusedColumnOrder = undefined;
        cell.focus();
        this._toggleAttribute('interacting', false, this);
        this._toggleAttribute('navigating', true, this);
      }
    }
  }

  _predictFocusStepTarget(srcElement, step) {
    const tabOrder = [
      this.$.table,
      this._headerFocusable,
      this._itemsFocusable,
      this._footerFocusable,
      this.$.focusexit
    ];

    let index = tabOrder.indexOf(srcElement);

    index += step;
    while (index >= 0 && index <= tabOrder.length - 1 &&
        (!tabOrder[index] || tabOrder[index].parentNode.hidden)) {
      index += step;
    }

    return tabOrder[index];
  }

  _onTabKeyDown(e) {
    const focusTarget = this._predictFocusStepTarget(e.composedPath()[0], e.shiftKey ? -1 : 1);

    if (focusTarget === this.$.table) {
      // The focus is about to exit the grid to the top.
      this.$.table.focus();
    } else if (focusTarget === this.$.focusexit) {
      // The focus is about to exit the grid to the bottom.
      this.$.focusexit.focus();
    } else if (focusTarget === this._itemsFocusable) {
      let itemsFocusTarget = focusTarget;
      const targetRow = this._itemsFocusable.parentNode;
      this._ensureScrolledToIndex(this._focusedItemIndex);
      if (targetRow.index !== this._focusedItemIndex) {
        // The target row, which is about to be focused next, has been
        // assigned with a new index since last focus, probably because of
        // scrolling. Focus the row for the stored focused item index instead.
        const columnIndex = Array.from(targetRow.children).indexOf(this._itemsFocusable);
        const focusedItemRow = Array.from(this.$.items.children)
          .filter(row => row.index === this._focusedItemIndex)[0];
        if (focusedItemRow) {
          itemsFocusTarget = focusedItemRow.children[columnIndex];
        }
      }
      e.preventDefault();
      itemsFocusTarget.focus();
    } else {
      e.preventDefault();
      focusTarget.focus();
    }

    this._toggleAttribute('navigating', true, this);
  }

  _onSpaceKeyDown(e) {
    e.preventDefault();

    const cell = e.composedPath()[0];
    if (cell._content && cell._content.firstElementChild) {
      const wasNavigating = this.hasAttribute('navigating');
      cell._content.firstElementChild.click();
      this._toggleAttribute('navigating', wasNavigating, this);
    } else {
      this.dispatchEvent(new CustomEvent('cell-activate', {detail: {
        model: this.__getRowModel(cell.parentElement)
      }}));
    }
  }

  _onFocusIn(e) {
    if (!this._isMousedown) {
      this._toggleAttribute('navigating', true, this);
    }

    const rootTarget = e.composedPath()[0];

    if (rootTarget === this.$.table ||
        rootTarget === this.$.focusexit) {
      // The focus enters the top (bottom) of the grid, meaning that user has
      // tabbed (shift-tabbed) into the grid. Move the focus to
      // the first (the last) focusable.
      this._predictFocusStepTarget(
        rootTarget,
        rootTarget === this.$.table ? 1 : -1
      ).focus();
      this._toggleAttribute('interacting', false, this);
    } else {
      this._detectInteracting(e);
    }
  }

  _onFocusOut(e) {
    this._toggleAttribute('navigating', false, this);
    this._detectInteracting(e);
  }

  _onCellFocusIn(e) {
    this._detectInteracting(e);

    if (e.composedPath().indexOf(this.$.table) === 3) {
      const cell = e.composedPath()[0];
      this._activeRowGroup = cell.parentNode.parentNode;
      if (this._activeRowGroup === this.$.header) {
        this._headerFocusable = cell;
      } else if (this._activeRowGroup === this.$.items) {
        this._itemsFocusable = cell;
      } else if (this._activeRowGroup === this.$.footer) {
        this._footerFocusable = cell;
      }
      // Inform cell content of the focus (used in <vaadin-grid-sorter>)
      cell._content.dispatchEvent(new CustomEvent('cell-focusin', {bubbles: false}));
    }

    this._detectFocusedItemIndex(e);
  }

  _onCellFocusOut(e) {
    if (e.composedPath().indexOf(this.$.table) === 3) {
      const cell = e.composedPath()[0];
      // Inform cell content of the focus (used in <vaadin-grid-sorter>)
      cell._content.dispatchEvent(new CustomEvent('cell-focusout', {bubbles: false}));
    }
  }

  _detectInteracting(e) {
    this._toggleAttribute('interacting',
      e.composedPath().some(el => el.localName === 'vaadin-grid-cell-content'),
      this);
  }

  _detectFocusedItemIndex(e) {
    const {rowGroup, row} = this._parseEventPath(e.composedPath());
    if (rowGroup === this.$.items) {
      this._focusedItemIndex = row.index;
    }
  }

  _preventScrollerRotatingCellFocus(item, index) {
    if (item.index === this._focusedItemIndex && this.hasAttribute('navigating') && this._activeRowGroup === this.$.items) {
      // Focused item has went, hide navigation mode
      this._navigatingIsHidden = true;
      this._toggleAttribute('navigating', false, this);
    }
    if (index === this._focusedItemIndex && this._navigatingIsHidden) {
      // Focused item is back, restore navigation mode
      this._navigatingIsHidden = false;
      this._toggleAttribute('navigating', true, this);
    }
  }

  _getColumns(rowGroup, rowIndex) {
    let columnTreeLevel = this._columnTree.length - 1;
    if (rowGroup === this.$.header) {
      columnTreeLevel = rowIndex;
    } else if (rowGroup === this.$.footer) {
      columnTreeLevel = this._columnTree.length - 1 - rowIndex;
    }
    return this._columnTree[columnTreeLevel];
  }

  _resetKeyboardNavigation() {
    if (this.$.header.firstElementChild) {
      this._headerFocusable = Array.from(this.$.header.firstElementChild.children).filter(el => !el.hidden)[0];
    }

    if (this.$.items.firstElementChild) {
      const firstVisibleIndexRow = this._iterateItems((pidx, vidx) => {
        if (this._firstVisibleIndex === vidx) {
          return this.$.items.children[pidx];
        }
      });
      if (firstVisibleIndexRow) {
        this._itemsFocusable = Array.from(firstVisibleIndexRow.children).filter(el => !el.hidden)[0];
      }
    }

    if (this.$.footer.firstElementChild) {
      this._footerFocusable = Array.from(this.$.footer.firstElementChild.children).filter(el => !el.hidden)[0];
    }
  }

  _scrollHorizontallyToCell(dstCell) {
    if (dstCell.hasAttribute('frozen') || this._elementMatches(dstCell, '[part~="details-cell"]')) {
      // These cells are, by design, always visible, no need to scroll.
      return;
    }

    const dstCellRect = dstCell.getBoundingClientRect();
    const dstRow = dstCell.parentNode;
    const dstCellIndex = Array.from(dstRow.children).indexOf(dstCell);
    const tableRect = this.$.table.getBoundingClientRect();
    let leftBoundary = tableRect.left, rightBoundary = tableRect.right;
    for (let i = dstCellIndex - 1; i >= 0; i--) {
      const cell = dstRow.children[i];
      if (cell.hasAttribute('hidden') ||
          this._elementMatches(cell, '[part~="details-cell"]')) {
        continue;
      }
      if (cell.hasAttribute('frozen')) {
        leftBoundary = cell.getBoundingClientRect().right;
        break;
      }
    }
    for (let i = dstCellIndex + 1; i < dstRow.children.length; i++) {
      const cell = dstRow.children[i];
      if (cell.hasAttribute('hidden') ||
          this._elementMatches(cell, '[part~="details-cell"]')) {
        continue;
      }
      if (cell.hasAttribute('frozen')) {
        rightBoundary = cell.getBoundingClientRect().left;
        break;
      }
    }

    if (dstCellRect.left < leftBoundary) {
      this.$.table.scrollLeft += Math.round(dstCellRect.left - leftBoundary);
    }
    if (dstCellRect.right > rightBoundary) {
      this.$.table.scrollLeft += Math.round(dstCellRect.right - rightBoundary);
    }
  }

  _elementMatches(el, query) {
    return el.matches ? el.matches(query) :
      Array.from(el.parentNode.querySelectorAll(query)).indexOf(el) !== -1;
  }
};
