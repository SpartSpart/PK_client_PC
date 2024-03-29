/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
/**
 * @polymerMixin
 */
export const FilterMixin = superClass => class FilterMixin extends superClass {

  static get properties() {
    return {
      _filters: {
        type: Array,
        value: function() {
          return [];
        }
      }
    };
  }

  ready() {
    super.ready();
    this.addEventListener('filter-changed', this._filterChanged.bind(this));
  }

  _filterChanged(e) {
    if (this._filters.indexOf(e.target) === -1) {
      this._filters.push(e.target);
    }

    e.stopPropagation();

    if (this.dataProvider) {
      this.clearCache();
    }
  }

  _mapFilters() {
    return this._filters.map(filter => {
      return {
        path: filter.path,
        value: filter.value
      };
    });
  }
};
