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

// The values that stand alone: the legacy and internal keywords, and the prefixed
// ones Chrome takes. -ms-flexbox and -moz-box are not among them, so a page's
// `display: flex; display: -ms-flexbox` keeps its flex, as in Chrome.
// https://drafts.csswg.org/css-display/#the-display-properties
const single = new Set([
  "none",
  "contents",
  "inline-block",
  "inline-table",
  "inline-flex",
  "inline-grid",
  "table-row-group",
  "table-header-group",
  "table-footer-group",
  "table-row",
  "table-cell",
  "table-column-group",
  "table-column",
  "table-caption",
  "ruby-base",
  "ruby-text",
  "ruby-base-container",
  "ruby-text-container",
  "-webkit-box",
  "-webkit-inline-box",
  "-webkit-flex",
  "-webkit-inline-flex"
]);
const outside = new Set(["block", "inline", "run-in"]);
const inside = new Set(["flow", "flow-root", "table", "flex", "grid", "ruby", "math"]);

// <display-outside> || <display-inside>, or list-item with at most an outside
// keyword and flow or flow-root, each keyword once and in any order.
function isDisplay(value) {
  const words = value.split(/\s+/);

  if (words.length === 1 && single.has(words[0])) {
    return true;
  }

  const seen = { outside: 0, inside: 0, list: 0 };
  let insideWord = "";

  for (const word of words) {
    if (outside.has(word)) {
      seen.outside++;
    } else if (inside.has(word)) {
      seen.inside++;
      insideWord = word;
    } else if (word === "list-item") {
      seen.list++;
    } else {
      return false;
    }
  }

  if (seen.outside > 1 || seen.inside > 1 || seen.list > 1) {
    return false;
  }

  return !seen.list || !insideWord || insideWord === "flow" || insideWord === "flow-root";
}

// The value as written, the unprefixed keyword for an alias, or undefined for a
// value that is not a display, which the declaration then ignores.
module.exports.parse = function parse(v) {
  if (typeof v !== "string") {
    return v;
  }

  const keyword = parsers.parseKeyword(v);

  if (keyword !== undefined) {
    return keyword;
  }

  const value = v.trim().toLowerCase();

  if (aliases[value]) {
    return aliases[value];
  }

  return isDisplay(value) ? v : undefined;
};

module.exports.isValid = function isValid(v) {
  return typeof module.exports.parse(v) === "string";
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
