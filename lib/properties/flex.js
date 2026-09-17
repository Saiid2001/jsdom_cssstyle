'use strict';

var parseNumber = require('../parsers').parseNumber;
var shorthandParser = require('../parsers').shorthandParser;
var shorthandSetter = require('../parsers').shorthandSetter;
var shorthandGetter = require('../parsers').shorthandGetter;

var shorthand_for = {
  'flex-grow': require('./flexGrow'),
  'flex-shrink': require('./flexShrink'),
  'flex-basis': require('./flexBasis'),
};

var myShorthandSetter = shorthandSetter('flex', shorthand_for);

module.exports.isValid = function isValid(v) {
  return shorthandParser(v, shorthand_for) !== undefined;
};

module.exports.definition = {
  set: function (v) {
    var normalizedValue = String(v).trim().toLowerCase();

    if (normalizedValue === 'none') {
      myShorthandSetter.call(this, '0 0 auto');
      return;
    }
    if (normalizedValue === 'initial') {
      myShorthandSetter.call(this, '0 1 auto');
      return;
    }
    if (normalizedValue === 'auto') {
      myShorthandSetter.call(this, '1 1 auto');
      return;
    }

    // https://drafts.csswg.org/css-flexbox-1/#flex-property: a one value form
    // that is a width rather than a number means "1 1 <width>", and a bare
    // number means "<number> 1 0%". Leaving the omitted components unset gave a
    // "flex: 100%" item a flex-grow of zero, so it never took the line it was
    // asking for and every sibling collapsed alongside it.
    var parts = normalizedValue.split(/\s+/);

    if (parts.length === 1 && parts[0] !== '') {
      if (parseNumber(parts[0]) !== undefined) {
        myShorthandSetter.call(this, parts[0] + ' 1 0%');
      } else {
        myShorthandSetter.call(this, '1 1 ' + parts[0]);
      }
      return;
    }

    myShorthandSetter.call(this, v);
  },
  get: shorthandGetter('flex', shorthand_for),
  enumerable: true,
  configurable: true,
};
