'use strict';

// https://drafts.csswg.org/css-flexbox-1/#flex-flow-property
//
// Either component may be omitted and the two may appear in either order, so
// this is parsed by classifying each token rather than by position. An omitted
// component resets to its initial value, as a shorthand must.

var DIRECTIONS = ['row', 'row-reverse', 'column', 'column-reverse'];
var WRAPS = ['nowrap', 'wrap', 'wrap-reverse'];

function parse(v) {
  var parts = String(v).trim().toLowerCase().split(/\s+/);

  if (parts.length < 1 || parts.length > 2 || parts[0] === '') {
    return undefined;
  }

  var direction;
  var wrap;

  for (var i = 0; i < parts.length; i++) {
    if (direction === undefined && DIRECTIONS.indexOf(parts[i]) !== -1) {
      direction = parts[i];
    } else if (wrap === undefined && WRAPS.indexOf(parts[i]) !== -1) {
      wrap = parts[i];
    } else {
      return undefined;
    }
  }

  return {
    direction: direction === undefined ? 'row' : direction,
    wrap: wrap === undefined ? 'nowrap' : wrap,
  };
}

module.exports.isValid = function isValid(v) {
  return parse(v) !== undefined;
};

module.exports.definition = {
  set: function (v) {
    var parsed = parse(v);

    if (parsed === undefined) {
      return;
    }

    this._setProperty('flex-direction', parsed.direction);
    this._setProperty('flex-wrap', parsed.wrap);
    this._setProperty('flex-flow', parsed.direction + ' ' + parsed.wrap);
  },
  get: function () {
    return this.getPropertyValue('flex-flow');
  },
  enumerable: true,
  configurable: true,
};
