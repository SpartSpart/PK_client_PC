/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   vaadin-dir-mixin.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

import {DirHelper} from './vaadin-dir-helper.js';

export {DirMixin};

declare function DirMixin<T extends new (...args: any[]) => {}>(base: T): T & DirMixinConstructor;

interface DirMixinConstructor {
  new(...args: any[]): DirMixin;
  finalize(): void;
}

export {DirMixinConstructor};

interface DirMixin {
  readonly dir: string|null|undefined;
  connectedCallback(): void;
  attributeChangedCallback(name: any, oldValue: any, newValue: any): void;
  disconnectedCallback(): void;
  __getNormalizedScrollLeft(element: Element|null): number;
  __setNormalizedScrollLeft(element: Element|null, scrollLeft: number): any;
}
