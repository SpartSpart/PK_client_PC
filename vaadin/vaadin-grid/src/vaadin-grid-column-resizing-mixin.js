/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';

import { addListener } from '@polymer/polymer/lib/utils/gestures.js';

/**
 * @polymerMixin
 */
export const ColumnResizingMixin = superClass => class ColumnResizingMixin extends GestureEventListeners(superClass) {

  ready() {
    super.ready();
    const scroller = this.$.scroller;
    addListener(scroller, 'track', this._onHeaderTrack.bind(this));

    // Disallow scrolling while resizing
    scroller.addEventListener('touchmove', e => scroller.hasAttribute('column-resizing') && e.preventDefault());

    // Disable contextmenu on any resize separator.
    scroller.addEventListener('contextmenu', e => e.target.getAttribute('part') == 'resize-handle' && e.preventDefault());

    // Disable native cell focus when resizing
    scroller.addEventListener('mousedown', e => e.target.getAttribute('part') === 'resize-handle' && e.preventDefault());
  }

  _onHeaderTrack(e) {
    const handle = e.target;
    if (handle.getAttribute('part') === 'resize-handle') {
      const cell = handle.parentElement;
      let column = cell._column;

      this._toggleAttribute('column-resizing', true, this.$.scroller);

      // Get the target column to resize
      while (column.localName === 'vaadin-grid-column-group') {
        column = Array.prototype.slice.call(column._childColumns, 0)
          .sort(function(a, b) {
            return a._order - b._order;
          })
          .filter(function(column) {
            return !column.hidden;
          }).pop();
      }

      const columnRowCells = Array.from(this.$.header.querySelectorAll('[part~="row"]:last-child [part~="cell"]'));
      var targetCell = columnRowCells.filter(cell => cell._column === column)[0];
      // Resize the target column
      if (targetCell.offsetWidth) {
        var style = window.getComputedStyle(targetCell);
        var minWidth = 10 + parseInt(style.paddingLeft) + parseInt(style.paddingRight) + parseInt(style.borderLeftWidth)
          + parseInt(style.borderRightWidth) + parseInt(style.marginLeft) + parseInt(style.marginRight);
        column.width = Math.max(minWidth, targetCell.offsetWidth + e.detail.x - targetCell.getBoundingClientRect().right) + 'px';
        column.flexGrow = 0;
      }
      // Fix width and flex-grow for all preceding columns
      columnRowCells
        .sort(
          function(a, b) {
            return a._column._order - b._column._order;
          })
        .forEach(function(cell, index, array) {
          if (index < array.indexOf(targetCell)) {
            cell._column.width = cell.offsetWidth + 'px';
            cell._column.flexGrow = 0;
          }
        });

      if (e.detail.state === 'end') {
        this._toggleAttribute('column-resizing', false, this.$.scroller);
        this.dispatchEvent(new CustomEvent('column-resize', {
          detail: {resizedColumn: column}
        }));
      }

      // Notify resize
      this._resizeHandler();
    }
  }

  /**
  * Fired when a column in the grid is resized by the user.
  *
  * @event column-resize
  * @param {Object} detail
  * @param {Object} detail.resizedColumn the column that was resized
  */
};
