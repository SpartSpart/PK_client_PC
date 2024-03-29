/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
/**
 * @polymerMixin
 */
export const A11yMixin = superClass => class A11yMixin extends superClass {
  static get observers() {
    return [
      '_a11yUpdateGridSize(size, _columnTree, _columnTree.*)'
    ];
  }

  _a11yGetHeaderRowCount(_columnTree) {
    return _columnTree.filter(level => level.some(col => col._headerTemplate || col.headerRenderer || col.path || col.header)).length;
  }

  _a11yGetFooterRowCount(_columnTree) {
    return _columnTree.filter(level => level.some(col => col._headerTemplate || col.headerRenderer)).length;
  }

  _a11yUpdateGridSize(size, _columnTree) {
    if (size === undefined || _columnTree === undefined) {
      return;
    }

    const bodyColumns = _columnTree[_columnTree.length - 1];
    this.$.table.setAttribute(
      'aria-rowcount',
      size + this._a11yGetHeaderRowCount(_columnTree) + this._a11yGetFooterRowCount(_columnTree)
    );
    this.$.table.setAttribute('aria-colcount', bodyColumns && bodyColumns.length || 0);

    this._a11yUpdateHeaderRows();
    this._a11yUpdateFooterRows();
  }

  _a11yUpdateHeaderRows() {
    Array.from(this.$.header.children).forEach((headerRow, index) =>
      headerRow.setAttribute('aria-rowindex', index + 1)
    );
  }

  _a11yUpdateFooterRows() {
    Array.from(this.$.footer.children).forEach((footerRow, index) =>
      footerRow.setAttribute(
        'aria-rowindex',
        this._a11yGetHeaderRowCount(this._columnTree) + this.size + index + 1
      )
    );
  }

  _a11yUpdateRowRowindex(row, index) {
    row.setAttribute('aria-rowindex', index + this._a11yGetHeaderRowCount(this._columnTree) + 1);
  }

  _a11yUpdateRowSelected(row, selected) {
    // Jaws reads selection only for rows, NVDA only for cells
    row.setAttribute('aria-selected', Boolean(selected));
    Array.from(row.children).forEach(cell =>
      cell.setAttribute('aria-selected', Boolean(selected))
    );
  }

  _a11yUpdateRowLevel(row, level) {
    row.setAttribute('aria-level', level + 1);
  }

  _a11yUpdateRowDetailsOpened(row, detailsOpened) {
    Array.from(row.children).forEach(cell => {
      if (typeof detailsOpened === 'boolean') {
        cell.setAttribute('aria-expanded', detailsOpened);
      } else {
        if (cell.hasAttribute('aria-expanded')) {
          cell.removeAttribute('aria-expanded');
        }
      }
    });
  }

  _a11ySetRowDetailsCell(row, detailsCell) {
    Array.from(row.children).forEach(cell => {
      if (cell !== detailsCell) {
        cell.setAttribute('aria-controls', detailsCell.id);
      }
    });
  }

  _a11yUpdateCellColspan(cell, colspan) {
    cell.setAttribute('aria-colspan', Number(colspan));
  }

  _a11yUpdateSorters() {
    Array.from(this.querySelectorAll('vaadin-grid-sorter')).forEach(sorter => {
      let cellContent = sorter.parentNode;
      while (cellContent && cellContent.localName !== 'vaadin-grid-cell-content') {
        cellContent = cellContent.parentNode;
      }
      if (cellContent && cellContent.assignedSlot) {
        const cell = cellContent.assignedSlot.parentNode;
        cell.setAttribute('aria-sort', {
          'asc': 'ascending',
          'desc': 'descending'
        }[String(sorter.direction)] || 'none');
      }
    });
  }
};
