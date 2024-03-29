/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { FlattenedNodesObserver } from '@polymer/polymer/lib/utils/flattened-nodes-observer.js';

import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

/**
 * @polymerMixin
 */
export const DynamicColumnsMixin = superClass => class DynamicColumnsMixin extends superClass {

  ready() {
    super.ready();
    this._addNodeObserver();
  }

  _hasColumnGroups(columns) {
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].localName === 'vaadin-grid-column-group') {
        return true;
      }
    }

    return false;
  }

  _getChildColumns(el) {
    return FlattenedNodesObserver.getFlattenedNodes(el).filter(this._isColumnElement);
  }

  _flattenColumnGroups(columns) {
    return columns.map(col => {
      if (col.localName === 'vaadin-grid-column-group') {
        return this._getChildColumns(col);
      } else {
        return [col];
      }
    }).reduce((prev, curr) => {
      return prev.concat(curr);
    }, []);
  }

  _getColumnTree() {
    var rootColumns = FlattenedNodesObserver.getFlattenedNodes(this).filter(this._isColumnElement);
    var _columnTree = [];

    for (var c = rootColumns; ;) {
      _columnTree.push(c);
      if (!this._hasColumnGroups(c)) {
        break;
      }
      c = this._flattenColumnGroups(c);
    }

    return _columnTree;
  }

  _updateColumnTree() {
    var columnTree = this._getColumnTree();
    if (!this._arrayEquals(columnTree, this._columnTree)) {
      this._columnTree = columnTree;
    }
  }

  _addNodeObserver() {
    this._observer = new FlattenedNodesObserver(this, info => {

      const rowDetailsTemplate = info.addedNodes.filter(n => n.localName === 'template' && n.classList.contains('row-details'))[0];
      if (rowDetailsTemplate && this._rowDetailsTemplate !== rowDetailsTemplate) {
        this._rowDetailsTemplate = rowDetailsTemplate;
      }

      if (info.addedNodes.filter(this._isColumnElement).length > 0 ||
        info.removedNodes.filter(this._isColumnElement).length > 0) {
        this._updateColumnTree();
      }

      this._debouncerCheckImports = Debouncer.debounce(
        this._debouncerCheckImports,
        timeOut.after(2000),
        this._checkImports.bind(this));

      this._ensureFirstPageLoaded();
    });
  }

  _arrayEquals(arr1, arr2) {
    if (!arr1 || !arr2 || arr1.length != arr2.length) {
      return false;
    }

    for (var i = 0, l = arr1.length; i < l; i++) {
      // Check if we have nested arrays
      if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
        // recurse into the nested arrays
        if (!this._arrayEquals(arr1[i], arr2[i])) {
          return false;
        }
      } else if (arr1[i] != arr2[i]) {
        return false;
      }
    }
    return true;
  }

  _checkImports() {
    [
      'vaadin-grid-column-group',
      'vaadin-grid-filter',
      'vaadin-grid-filter-column',
      'vaadin-grid-tree-toggle',
      'vaadin-grid-selection-column',
      'vaadin-grid-sort-column',
      'vaadin-grid-sorter'
    ].forEach(elementName => {
      var element = this.querySelector(elementName);
      if (element && !(element instanceof PolymerElement)) {
        console.warn(`Make sure you have imported the required module for <${elementName}> element.`);
      }
    });
  }

  _updateFirstAndLastColumn() {
    Array.from(this.shadowRoot.querySelectorAll('tr')).forEach(row => this._updateFirstAndLastColumnForRow(row));
  }

  _updateFirstAndLastColumnForRow(row) {
    Array.from(row.querySelectorAll('[part~="cell"]:not([part~="details-cell"])'))
      .sort((a, b) => {
        return a._column._order - b._column._order;
      }).forEach((cell, cellIndex, children) => {
        this._toggleAttribute('first-column', cellIndex === 0, cell);
        this._toggleAttribute('last-column', cellIndex === children.length - 1, cell);
      });
  }

  _isColumnElement(node) {
    return node.nodeType === Node.ELEMENT_NODE && /\bcolumn\b/.test(node.localName);
  }
};
