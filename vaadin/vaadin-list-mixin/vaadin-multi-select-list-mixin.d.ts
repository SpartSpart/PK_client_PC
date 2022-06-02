/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   vaadin-multi-select-list-mixin.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

import {ListMixin} from './vaadin-list-mixin.js';

export {MultiSelectListMixin};


/**
 * A mixin for `nav` elements, facilitating multiple selection of childNodes.
 */
declare function MultiSelectListMixin<T extends new (...args: any[]) => {}>(base: T): T & MultiSelectListMixinConstructor & ListMixinConstructor;

import {ListMixinConstructor} from './vaadin-list-mixin.js';

interface MultiSelectListMixinConstructor {
  new(...args: any[]): MultiSelectListMixin;
}

export {MultiSelectListMixinConstructor};

interface MultiSelectListMixin extends ListMixin {

  /**
   * Specifies that multiple options can be selected at once.
   */
  multiple: boolean|null|undefined;

  /**
   * Array of indexes of the items selected in the items array
   * Note: Not updated when used in single selection mode.
   */
  selectedValues: string[]|null|undefined;
  ready(): void;
  _onMultipleClick(event: MouseEvent): void;
}