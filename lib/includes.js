/**
 * [if description]
 * @param  {[string/number]}
 * checks is an element exist in an array.
 * @return {[boolean]}
 *
 * Borrowed from mozilla polyfill [Array.prototype.includes]
 */


if (!Array.prototype.includes) {
  Array.prototype.includes = function(search /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      /* istanbul ignore next */
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      /* istanbul ignore next */
      k = len + n;
      /* istanbul ignore next */
      if (k < 0) { k = 0; }
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (search === currentElement ||
        (search !== search && currentElement !== currentElement)) {
        // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}
