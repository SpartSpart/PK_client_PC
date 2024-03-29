/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { microTask } from '@polymer/polymer/lib/utils/async.js';

import { PolymerElement } from '@polymer/polymer/polymer-element.js';

/**
 * @polymerMixin
 */
export const SortMixin = superClass => class SortMixin extends superClass {
  static get properties() {
    return {
      /**
       * When `true`, all `<vaadin-grid-sorter>` are applied for sorting.
       */
      multiSort: {
        type: Boolean,
        value: false
      },

      _sorters: {
        type: Array,
        value: function() {
          return [];
        }
      },

      _previousSorters: {
        type: Array,
        value: function() {
          return [];
        }
      }
    };
  }

  ready() {
    super.ready();
    this.addEventListener('sorter-changed', this._onSorterChanged);

    // With Polymer 2 & shady the 'sorter-changed' listener isn't guaranteed to be registered
    // before child <vaadin-grid-sorter>'s upgrade and fire the events. The following
    // makes sure that 'sorter-changed' is fired for all <vaadin-grid-sorter> elements
    // after this (<vaadin-grid>) is ready (and the listeners are active).
    if (window.ShadyDOM) {
      microTask.run(() => {
        const sorters = this.querySelectorAll('vaadin-grid-sorter');
        Array.from(sorters).forEach((sorter) => {
          // Don't try to fire if the sorter hasn't been upgraded yet
          if (sorter instanceof PolymerElement) {
            sorter.dispatchEvent(new CustomEvent('sorter-changed', {bubbles: true, composed: true}));
          }
        });
      });
    }
  }

  _onSorterChanged(e) {
    const sorter = e.target;

    this._removeArrayItem(this._sorters, sorter);
    sorter._order = null;

    if (this.multiSort) {
      if (sorter.direction) {
        this._sorters.unshift(sorter);
      }

      this._sorters.forEach((sorter, index) => sorter._order = this._sorters.length > 1 ? index : null, this);
    } else {
      if (sorter.direction) {
        this._sorters.forEach(sorter => {
          sorter._order = null;
          sorter.direction = null;
        });
        this._sorters = [sorter];
      }
    }

    e.stopPropagation();

    if (this.dataProvider &&
      // No need to clear cache if sorters didn't change
      JSON.stringify(this._previousSorters) !== JSON.stringify(this._mapSorters())) {
      this.clearCache();
    }

    this._a11yUpdateSorters();

    this._previousSorters = this._mapSorters();
  }

  _mapSorters() {
    return this._sorters.map(sorter => {
      return {
        path: sorter.path,
        direction: sorter.direction
      };
    });
  }

  _removeArrayItem(array, item) {
    const index = array.indexOf(item);
    if (index > -1) {
      array.splice(index, 1);
    }
  }
};
