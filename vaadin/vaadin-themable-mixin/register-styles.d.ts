/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   register-styles.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.

import {CSSResult} from 'lit-element';

export {css, unsafeCSS} from 'lit-element';

export {registerStyles};


/**
 * Registers CSS styles for a component type. Make sure to register the styles before
 * the first instance of a component of the type is attached to DOM.
 */
declare function registerStyles(themeFor: String|null, styles: CSSResult|Array<CSSResult|null>|null, options?: object|null): void;
