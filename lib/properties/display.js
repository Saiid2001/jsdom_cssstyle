"use strict";

const parsers = require("../parsers");

// The legacy aliases browsers parse as the keyword they name; every other value
// is kept as written. -webkit-box and -webkit-inline-box are not aliases: they
// are the old flexbox, a different layout.
// https://drafts.csswg.org/css-display/#display-legacy
const aliases = {
  "-webkit-flex": "flex",
  "-webkit-inline-flex": "inline-flex"
};

module.exports.parse = function parse(v) {
  if (typeof v !== "string") {
    return v;
  }
  return aliases[v.toLowerCase()] ?? v;
};

module.exports.isValid = function isValid() {
  return true;
};

module.exports.definition = {
  set(v) {
    v = parsers.prepareValue(v, this._global);
    this._setProperty("display", module.exports.parse(v));
  },
  get() {
    return this.getPropertyValue("display");
  },
  enumerable: true,
  configurable: true
};
