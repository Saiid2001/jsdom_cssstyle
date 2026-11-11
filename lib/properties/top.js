'use strict';

var parseMeasurement = require('../parsers').parseMeasurement;

// auto is the initial value, and the one a later rule resets an offset to.
// parseMeasurement rejects it, which dropped the declaration and left an
// earlier rule's length standing.
function parse(v) {
  if (String(v).toLowerCase() === 'auto') {
    return 'auto';
  }
  if (String(v).toLowerCase() === 'inherit') {
    return 'inherit';
  }
  return parseMeasurement(v);
}

module.exports.definition = {
  set: function (v) {
    this._setProperty('top', parse(v));
  },
  get: function () {
    return this.getPropertyValue('top');
  },
  enumerable: true,
  configurable: true,
};
