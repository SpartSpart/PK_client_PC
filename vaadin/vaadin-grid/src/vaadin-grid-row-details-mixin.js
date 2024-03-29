/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { Templatizer } from './vaadin-grid-templatizer.js';

import { flush } from '@polymer/polymer/lib/utils/flush.js';

/**
 * @polymerMixin
 */
export const RowDetailsMixin = superClass => class RowDetailsMixin extends superClass {
  static get properties() {
    return {
      /**
       * An array containing references to items with open row details.
       */
      detailsOpenedItems: {
        type: Array,
        value: function() {
          return [];
        }
      },

      _rowDetailsTemplate: Object,

      /**
       * Custom function for rendering the content of the row details.
       * Receives three arguments:
       *
       * - `root` The row details content DOM element. Append your content to it.
       * - `grid` The `<vaadin-grid>` element.
       * - `rowData` The object with the properties related with
       *   the rendered item, contains:
       *   - `rowData.index` The index of the item.
       *   - `rowData.item` The item.
       */
      rowDetailsRenderer: Function,

      _detailsCells: {
        type: Array,
      }
    };
  }

  static get observers() {
    return [
      '_detailsOpenedItemsChanged(detailsOpenedItems.*, _rowDetailsTemplate, rowDetailsRenderer)',
      '_rowDetailsTemplateOrRendererChanged(_rowDetailsTemplate, rowDetailsRenderer)'
    ];
  }

  _rowDetailsTemplateOrRendererChanged(rowDetailsTemplate, rowDetailsRenderer) {
    if (rowDetailsTemplate && rowDetailsRenderer) {
      throw new Error('You should only use either a renderer or a template for row details');
    }
    if (rowDetailsTemplate || rowDetailsRenderer) {
      if (rowDetailsTemplate && !rowDetailsTemplate.templatizer) {
        var templatizer = new Templatizer();
        templatizer._grid = this;
        templatizer.dataHost = this.dataHost;
        templatizer.template = rowDetailsTemplate;
        rowDetailsTemplate.templatizer = templatizer;
      }

      if (this._columnTree) {
        // Only update the rows if the column tree has already been initialized
        Array.from(this.$.items.children).forEach(row => {
          if (!row.querySelector('[part~=details-cell]')) {
            this._updateRow(row, this._columnTree[this._columnTree.length - 1]);
            this._a11yUpdateRowDetailsOpened(row, false);
          }
          // Clear any old template instances
          delete row.querySelector('[part~=details-cell]')._instance;
        });
      }

      if (this.detailsOpenedItems.length) {
        Array.from(this.$.items.children).forEach(this._toggleDetailsCell, this);
        this._update();
      }
    }
  }

  _detailsOpenedItemsChanged(changeRecord, rowDetailsTemplate, rowDetailsRenderer) {
    if (changeRecord.path === 'detailsOpenedItems.length' || !changeRecord.value) {
      // Let’s avoid duplicate work of both “.splices” and “.length” updates.
      return;
    }
    Array.from(this.$.items.children).forEach(row => {
      this._toggleDetailsCell(row, row._item);
      this._a11yUpdateRowDetailsOpened(row, this._isDetailsOpened(row._item));
      this._toggleAttribute('details-opened', this._isDetailsOpened(row._item), row);
    });
  }

  _configureDetailsCell(cell) {
    cell.setAttribute('part', 'cell details-cell');
    // Freeze the details cell, so that it does not scroll horizontally
    // with the normal cells. This way it looks less weird.
    this._toggleAttribute('frozen', true, cell);
  }

  _toggleDetailsCell(row, item) {
    const cell = row.querySelector('[part~="details-cell"]');
    if (!cell) {
      return;
    }
    const detailsHidden = !this._isDetailsOpened(item);
    const hiddenChanged = !!cell.hidden !== detailsHidden;

    if (!cell._instance && !cell._renderer || cell.hidden !== detailsHidden) {
      cell.hidden = detailsHidden;
      if (detailsHidden) {
        row.style.removeProperty('padding-bottom');
      } else {
        if (this.rowDetailsRenderer) {
          cell._renderer = this.rowDetailsRenderer;
          cell._renderer.call(this, cell._content, this, {index: row.index, item: item});
        } else if (this._rowDetailsTemplate && !cell._instance) {
          // Stamp the template
          cell._instance = this._rowDetailsTemplate.templatizer.createInstance();
          cell._content.innerHTML = '';
          cell._content.appendChild(cell._instance.root);
          this._updateItem(row, item);
        }

        flush();
        row.style.setProperty('padding-bottom', `${cell.offsetHeight}px`);

        requestAnimationFrame(() => this.notifyResize());
      }
    }
    if (hiddenChanged) {
      this._updateMetrics();
      this._positionItems();
    }
  }

  _updateDetailsCellHeights() {
    Array.from(this.$.items.querySelectorAll('[part~="details-cell"]:not([hidden])')).forEach(cell => {
      cell.parentElement.style.setProperty('padding-bottom', `${cell.offsetHeight}px`);
    });
  }

  _isDetailsOpened(item) {
    return this.detailsOpenedItems && this._getItemIndexInArray(item, this.detailsOpenedItems) !== -1;
  }

  /**
   * Open the details row of a given item.
   */
  openItemDetails(item) {
    if (!this._isDetailsOpened(item)) {
      this.push('detailsOpenedItems', item);
    }
  }

  /**
   * Close the details row of a given item.
   */
  closeItemDetails(item) {
    if (this._isDetailsOpened(item)) {
      this.splice('detailsOpenedItems', this._getItemIndexInArray(item, this.detailsOpenedItems), 1);
    }
  }

  _detailsOpenedInstanceChangedCallback(instance, value) {
    if (super._detailsOpenedInstanceChangedCallback) {
      super._detailsOpenedInstanceChangedCallback(instance, value);
    }
    if (value) {
      this.openItemDetails(instance.item);
    } else {
      this.closeItemDetails(instance.item);
    }
  }
};
