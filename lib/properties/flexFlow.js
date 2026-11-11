"use strict";

// binb: https://drafts.csswg.org/css-flexbox-1/#flex-flow-property
//
// Upstream leaves flex-flow a plain string, so its longhands never reach the
// computed style and a `flex-flow: column` container lays out as a row. Either
// component may be omitted and the two may appear in either order; an omitted
// one resets to its initial value, as a shorthand must.

const parsers = require("../parsers");

const keywordProperty = (keywords) => ({
  parse(v) {
    return parsers.parseKeyword(v, keywords);
  },
  isValid(v) {
    return keywords.includes(String(v).toLowerCase());
  }
});

const flexDirection = keywordProperty(["row", "row-reverse", "column", "column-reverse"]);
const flexWrap = keywordProperty(["nowrap", "wrap", "wrap-reverse"]);

const shorthandFor = new Map([
  ["flex-direction", flexDirection],
  ["flex-wrap", flexWrap]
]);

module.exports.parse = function parse(v) {
  const key = parsers.parseKeyword(v);
  if (key) {
    return key === "initial" ? "row nowrap" : undefined;
  }
  const obj = parsers.parseShorthand(v, shorthandFor);
  if (obj) {
    const flexFlow = {
      "flex-direction": "row",
      "flex-wrap": "nowrap"
    };
    for (const [property, value] of Object.entries(obj)) {
      flexFlow[property] = value;
    }
    return Object.values(flexFlow).join(" ");
  }
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
    if (parsers.hasVarFunc(v)) {
      this._shorthandSetter("flex-flow", "", shorthandFor);
      this._setProperty("flex-flow", v);
    } else {
      this._shorthandSetter("flex-flow", module.exports.parse(v), shorthandFor);
    }
  },
  get() {
    let val = this.getPropertyValue("flex-flow");
    if (parsers.hasVarFunc(val)) {
      return val;
    }
    val = this._shorthandGetter("flex-flow", shorthandFor);
    if (parsers.hasVarFunc(val)) {
      return "";
    }
    return val;
  },
  enumerable: true,
  configurable: true
};
