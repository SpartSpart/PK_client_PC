/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   vaadin-element-mixin.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

/// <reference path="custom_typings/vaadin-usage-statistics.d.ts" />
/// <reference path="custom_typings/vaadin.d.ts" />

import {idlePeriod} from '@polymer/polymer/lib/utils/async.js';

import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';

import {enqueueDebouncer} from '@polymer/polymer/lib/utils/flush.js';

import {DirMixin} from './vaadin-dir-mixin.js';

import {usageStatistics} from '@vaadin/vaadin-usage-statistics/vaadin-usage-statistics.js';

export {ElementMixin};

declare function ElementMixin<T extends new (...args: any[]) => {}>(base: T): T & ElementMixinConstructor & DirMixinConstructor;

import {DirMixinConstructor} from './vaadin-dir-mixin.js';

interface ElementMixinConstructor {
  new(...args: any[]): ElementMixin;
  finalize(): void;
}

export {ElementMixinConstructor};

interface ElementMixin extends DirMixin {
}
