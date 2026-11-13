"use strict";
// deprecated
// @see https://drafts.fxtf.org/css-masking/#clip-property

const parsers = require("../parsers");
const strings = require("../utils/strings");

module.exports.parse = function parse(v) {
  if (v === "") {
    return v;
  }
  const val = parsers.parseKeyword(v, ["auto"]);
  if (val) {
    return val;
  }
  // parse legacy <shape>
  v = strings.asciiLowercase(v);
  const matches = v.match(/^rect\(\s*(.*)\s*\)$/);
  if (!matches) {
    return;
  }
  // Commas or whitespace between the edges, as browsers read it, though not
  // a mix of the two. https://www.w3.org/TR/CSS21/visufx.html#value-def-shape
  const inside = matches[1].trim();
  const parts = inside.includes(",") ? inside.split(/\s*,\s*/) : inside.split(/\s+/);
  if (parts.length !== 4) {
    return;
  }
  const valid = parts.every(function (part, index) {
    const measurement = part.trim() === "auto" ? "auto" : parsers.parseMeasurement(part.trim());
    parts[index] = measurement;
    return typeof measurement === "string";
  });
  if (!valid) {
    return;
  }
  return `rect(${parts.join(", ")})`;
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
    this._setProperty("clip", module.exports.parse(v));
  },
  get() {
    return this.getPropertyValue("clip");
  },
  enumerable: true,
  configurable: true
};
