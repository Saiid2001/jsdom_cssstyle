"use strict";

const parsers = require("../parsers");

// Validated as width and height are: a value that is not one of these is
// dropped where it is declared, and the declaration before it stands.
// https://drafts.csswg.org/css-sizing-3/#min-size-properties
module.exports.parse = function parse(v) {
  const dim = parsers.parseMeasurement(v, true);
  if (dim) {
    return dim;
  }
  const keywords = ["none", "min-content", "max-content", "fit-content"];
  return parsers.parseKeyword(v, keywords);
};

module.exports.isValid = function isValid(v) {
  if (v === "") {
    return true;
  }
  return typeof module.exports.parse(v) === "string";
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    this._setProperty("max-width", module.exports.parse(v));
  },
  get() {
    return this.getPropertyValue("max-width");
  },
  enumerable: true,
  configurable: true
};
