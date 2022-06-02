/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   vaadin-themable-mixin.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

import {DomModule} from '@polymer/polymer/lib/elements/dom-module.js';

import {ThemePropertyMixin} from './vaadin-theme-property-mixin.js';

export {ThemableMixin};

declare function ThemableMixin<T extends new (...args: any[]) => {}>(base: T): T & ThemableMixinConstructor & ThemePropertyMixinConstructor;

import {ThemePropertyMixinConstructor} from './vaadin-theme-property-mixin.js';

interface ThemableMixinConstructor {
  new(...args: any[]): ThemableMixin;
  finalize(): void;
}

export {ThemableMixinConstructor};

interface ThemableMixin extends ThemePropertyMixin {
}
