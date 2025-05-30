'use strict';

var { CSSStyleDeclaration } = require('./CSSStyleDeclaration');

var allProperties = require('./allProperties');
var allExtraProperties = require('./allExtraProperties');
var implementedProperties = require('./implementedProperties');
var parsers = require('./parsers');

var dashedProperties = [...allProperties, ...allExtraProperties];
var allowedProperties = dashedProperties.map(parsers.dashedToCamelCase);
implementedProperties = Array.from(implementedProperties).map(parsers.dashedToCamelCase);
var invalidProperties = implementedProperties.filter((prop) => !allowedProperties.includes(prop));

describe('CSSStyleDeclaration', () => {
  test('has only valid properties implemented', () => {
    expect(invalidProperties.length).toEqual(0);
  });

  test('has all properties', () => {
    var style = new CSSStyleDeclaration();
    allProperties.forEach((property) => {
      expect(style.__lookupGetter__(property)).toBeTruthy();
      expect(style.__lookupSetter__(property)).toBeTruthy();
    });
  });

  test('has dashed properties', () => {
    var style = new CSSStyleDeclaration();
    dashedProperties.forEach((property) => {
      expect(style.__lookupGetter__(property)).toBeTruthy();
      expect(style.__lookupSetter__(property)).toBeTruthy();
    });
  });

  test('has all functions', () => {
    var style = new CSSStyleDeclaration();

    expect(typeof style.item).toEqual('function');
    expect(typeof style.getPropertyValue).toEqual('function');
    expect(typeof style.setProperty).toEqual('function');
    expect(typeof style.getPropertyPriority).toEqual('function');
    expect(typeof style.removeProperty).toEqual('function');

    // TODO - deprecated according to MDN and not implemented at all, can we remove?
    expect(typeof style.getPropertyCSSValue).toEqual('function');
  });

  test('has special properties', () => {
    var style = new CSSStyleDeclaration();

    expect(style.__lookupGetter__('cssText')).toBeTruthy();
    expect(style.__lookupSetter__('cssText')).toBeTruthy();
    expect(style.__lookupGetter__('length')).toBeTruthy();
    expect(style.__lookupSetter__('length')).toBeTruthy();
    expect(style.__lookupGetter__('parentRule')).toBeTruthy();
  });

  test('from style string', () => {
    var style = new CSSStyleDeclaration();
    style.cssText = 'color: blue; background-color: red; width: 78%; height: 50vh;';
    expect(style.length).toEqual(4);
    expect(style.cssText).toEqual('color: blue; background-color: red; width: 78%; height: 50vh;');
    expect(style.getPropertyValue('color')).toEqual('blue');
    expect(style.item(0)).toEqual('color');
    expect(style[1]).toEqual('background-color');
    expect(style.backgroundColor).toEqual('red');
    style.cssText = '';
    expect(style.cssText).toEqual('');
    expect(style.length).toEqual(0);
  });

  test('from properties', () => {
    var style = new CSSStyleDeclaration();
    style.color = 'blue';
    expect(style.length).toEqual(1);
    expect(style[0]).toEqual('color');
    expect(style.cssText).toEqual('color: blue;');
    expect(style.item(0)).toEqual('color');
    expect(style.color).toEqual('blue');
    style.backgroundColor = 'red';
    expect(style.length).toEqual(2);
    expect(style[0]).toEqual('color');
    expect(style[1]).toEqual('background-color');
    expect(style.cssText).toEqual('color: blue; background-color: red;');
    expect(style.backgroundColor).toEqual('red');
    style.removeProperty('color');
    expect(style[0]).toEqual('background-color');
  });

  test('shorthand properties', () => {
    var style = new CSSStyleDeclaration();
    style.background = 'blue url(http://www.example.com/some_img.jpg)';
    expect(style.backgroundColor).toEqual('blue');
    expect(style.backgroundImage).toEqual('url(http://www.example.com/some_img.jpg)');
    expect(style.background).toEqual('blue url(http://www.example.com/some_img.jpg)');
    style.border = '0 solid black';
    expect(style.borderWidth).toEqual('0px');
    expect(style.borderStyle).toEqual('solid');
    expect(style.borderColor).toEqual('black');
    expect(style.borderTopWidth).toEqual('0px');
    expect(style.borderLeftStyle).toEqual('solid');
    expect(style.borderBottomColor).toEqual('black');
    style.font = '12em monospace';
    expect(style.fontSize).toEqual('12em');
    expect(style.fontFamily).toEqual('monospace');
  });

  test('width and height properties and null and empty strings', () => {
    var style = new CSSStyleDeclaration();
    style.height = 6;
    expect(style.height).toEqual('');
    style.width = 0;
    expect(style.width).toEqual('0px');
    style.height = '34%';
    expect(style.height).toEqual('34%');
    style.height = '100vh';
    expect(style.height).toEqual('100vh');
    style.height = '100vw';
    expect(style.height).toEqual('100vw');
    style.height = '';
    expect(1).toEqual(style.length);
    expect(style.cssText).toEqual('width: 0px;');
    style.width = null;
    expect(0).toEqual(style.length);
    expect(style.cssText).toEqual('');
  });

  test('implicit properties', () => {
    var style = new CSSStyleDeclaration();
    style.borderWidth = 0;
    expect(style.length).toEqual(1);
    expect(style.borderWidth).toEqual('0px');
    expect(style.borderTopWidth).toEqual('0px');
    expect(style.borderBottomWidth).toEqual('0px');
    expect(style.borderLeftWidth).toEqual('0px');
    expect(style.borderRightWidth).toEqual('0px');
    expect(style.cssText).toEqual('border-width: 0px;');
  });

  test('top, left, right, bottom properties', () => {
    var style = new CSSStyleDeclaration();
    style.top = 0;
    style.left = '0%';
    style.right = '5em';
    style.bottom = '12pt';
    expect(style.top).toEqual('0px');
    expect(style.left).toEqual('0%');
    expect(style.right).toEqual('5em');
    expect(style.bottom).toEqual('12pt');
    expect(style.length).toEqual(4);
    expect(style.cssText).toEqual('top: 0px; left: 0%; right: 5em; bottom: 12pt;');
  });

  test('clear and clip properties', () => {
    var style = new CSSStyleDeclaration();
    style.clear = 'none';
    expect(style.clear).toEqual('none');
    style.clear = 'lfet';
    expect(style.clear).toEqual('none');
    style.clear = 'left';
    expect(style.clear).toEqual('left');
    style.clear = 'right';
    expect(style.clear).toEqual('right');
    style.clear = 'both';
    expect(style.clear).toEqual('both');
    style.clip = 'elipse(5px, 10px)';
    expect(style.clip).toEqual('');
    expect(style.length).toEqual(1);
    style.clip = 'rect(0, 3Em, 2pt, 50%)';
    expect(style.clip).toEqual('rect(0px, 3em, 2pt, 50%)');
    expect(style.length).toEqual(2);
    expect(style.cssText).toEqual('clear: both; clip: rect(0px, 3em, 2pt, 50%);');
  });

  test('colors', () => {
    var style = new CSSStyleDeclaration();
    style.color = 'rgba(0,0,0,0)';
    expect(style.color).toEqual('rgba(0, 0, 0, 0)');
    style.color = 'rgba(5%, 10%, 20%, 0.4)';
    expect(style.color).toEqual('rgba(12, 25, 51, 0.4)');
    style.color = 'rgb(33%, 34%, 33%)';
    expect(style.color).toEqual('rgb(84, 86, 84)');
    style.color = 'rgba(300, 200, 100, 1.5)';
    expect(style.color).toEqual('rgb(255, 200, 100)');
    style.color = 'hsla(0, 1%, 2%, 0.5)';
    expect(style.color).toEqual('rgba(5, 5, 5, 0.5)');
    style.color = 'hsl(0, 1%, 2%)';
    expect(style.color).toEqual('rgb(5, 5, 5)');
    style.color = 'rebeccapurple';
    expect(style.color).toEqual('rebeccapurple');
    style.color = 'transparent';
    expect(style.color).toEqual('transparent');
    style.color = 'currentcolor';
    expect(style.color).toEqual('currentcolor');
    style.color = '#ffffffff';
    expect(style.color).toEqual('rgba(255, 255, 255, 1)');
    style.color = '#fffa';
    expect(style.color).toEqual('rgba(255, 255, 255, 0.667)');
    style.color = '#ffffff66';
    expect(style.color).toEqual('rgba(255, 255, 255, 0.4)');
  });

  test('short hand properties with embedded spaces', () => {
    var style = new CSSStyleDeclaration();
    style.background = 'rgb(0, 0, 0) url(/something/somewhere.jpg)';
    expect(style.backgroundColor).toEqual('rgb(0, 0, 0)');
    expect(style.backgroundImage).toEqual('url(/something/somewhere.jpg)');
    expect(style.cssText).toEqual('background: rgb(0, 0, 0) url(/something/somewhere.jpg);');
    style = new CSSStyleDeclaration();
    style.border = '  1px  solid   black  ';
    expect(style.border).toEqual('1px solid black');
  });

  test('setting shorthand properties to an empty string should clear all dependent properties', () => {
    var style = new CSSStyleDeclaration();
    style.borderWidth = '1px';
    expect(style.cssText).toEqual('border-width: 1px;');
    style.border = '';
    expect(style.cssText).toEqual('');
  });

  test('setting implicit properties to an empty string should clear all dependent properties', () => {
    var style = new CSSStyleDeclaration();
    style.borderTopWidth = '1px';
    expect(style.cssText).toEqual('border-top-width: 1px;');
    style.borderWidth = '';
    expect(style.cssText).toEqual('');
  });

  test('setting a shorthand property, whose shorthands are implicit properties, to an empty string should clear all dependent properties', () => {
    var style = new CSSStyleDeclaration();
    style.borderTopWidth = '1px';
    expect(style.cssText).toEqual('border-top-width: 1px;');
    style.border = '';
    expect(style.cssText).toEqual('');
    style.borderTop = '1px solid black';
    expect(style.cssText).toEqual('border-top: 1px solid black;');
    style.border = '';
    expect(style.cssText).toEqual('');
  });

  test('setting border values to "none" should clear dependent values', () => {
    var style = new CSSStyleDeclaration();
    style.borderTopWidth = '1px';
    expect(style.cssText).toEqual('border-top-width: 1px;');
    style.border = 'none';
    expect(style.cssText).toEqual('');
    style.borderTopWidth = '1px';
    expect(style.cssText).toEqual('border-top-width: 1px;');
    style.borderTopStyle = 'none';
    expect(style.cssText).toEqual('');
    style.borderTopWidth = '1px';
    expect(style.cssText).toEqual('border-top-width: 1px;');
    style.borderTop = 'none';
    expect(style.cssText).toEqual('');
    style.borderTopWidth = '1px';
    style.borderLeftWidth = '1px';
    expect(style.cssText).toEqual('border-top-width: 1px; border-left-width: 1px;');
    style.borderTop = 'none';
    expect(style.cssText).toEqual('border-left-width: 1px;');
  });

  test('setting border to 0 should be okay', () => {
    var style = new CSSStyleDeclaration();
    style.border = 0;
    expect(style.cssText).toEqual('border: 0px;');
  });

  test('setting values implicit and shorthand properties via csstext and setproperty should propagate to dependent properties', () => {
    var style = new CSSStyleDeclaration();
    style.cssText = 'border: 1px solid black;';
    expect(style.cssText).toEqual('border: 1px solid black;');
    expect(style.borderTop).toEqual('1px solid black');
    style.border = '';
    expect(style.cssText).toEqual('');
    style.setProperty('border', '1px solid black');
    expect(style.cssText).toEqual('border: 1px solid black;');
  });

  test('setting opacity should work', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('opacity', 0.75);
    expect(style.cssText).toEqual('opacity: 0.75;');
    style.opacity = '0.50';
    expect(style.cssText).toEqual('opacity: 0.5;');
    style.opacity = 1;
    expect(style.cssText).toEqual('opacity: 1;');
  });

  test('width and height of auto should work', () => {
    var style = new CSSStyleDeclaration();
    style.width = 'auto';
    expect(style.cssText).toEqual('width: auto;');
    expect(style.width).toEqual('auto');
    style = new CSSStyleDeclaration();
    style.height = 'auto';
    expect(style.cssText).toEqual('height: auto;');
    expect(style.height).toEqual('auto');
  });

  test('padding and margin should set/clear shorthand properties', () => {
    var style = new CSSStyleDeclaration();
    var parts = ['Top', 'Right', 'Bottom', 'Left'];
    var testParts = function (name, v, V) {
      style[name] = v;
      for (var i = 0; i < 4; i++) {
        var part = name + parts[i];
        expect(style[part]).toEqual(V[i]);
      }

      expect(style[name]).toEqual(v);
      style[name] = '';
    };
    testParts('padding', '1px', ['1px', '1px', '1px', '1px']);
    testParts('padding', '1px 2%', ['1px', '2%', '1px', '2%']);
    testParts('padding', '1px 2px 3px', ['1px', '2px', '3px', '2px']);
    testParts('padding', '1px 2px 3px 4px', ['1px', '2px', '3px', '4px']);
    style.paddingTop = style.paddingRight = style.paddingBottom = style.paddingLeft = '1px';
    testParts('padding', '', ['', '', '', '']);
    testParts('margin', '1px', ['1px', '1px', '1px', '1px']);
    testParts('margin', '1px auto', ['1px', 'auto', '1px', 'auto']);
    testParts('margin', '1px 2% 3px', ['1px', '2%', '3px', '2%']);
    testParts('margin', '1px 2px 3px 4px', ['1px', '2px', '3px', '4px']);
    style.marginTop = style.marginRight = style.marginBottom = style.marginLeft = '1px';
    testParts('margin', '', ['', '', '', '']);
  });

  test('padding and margin shorthands should set main properties', () => {
    var style = new CSSStyleDeclaration();
    var parts = ['Top', 'Right', 'Bottom', 'Left'];
    var testParts = function (name, v, V) {
      var expected;
      for (var i = 0; i < 4; i++) {
        style[name] = v;
        style[name + parts[i]] = V;
        expected = v.split(/ /);
        expected[i] = V;
        expected = expected.join(' ');

        expect(style[name]).toEqual(expected);
      }
    };
    testParts('padding', '1px 2px 3px 4px', '10px');
    testParts('margin', '1px 2px 3px 4px', '10px');
    testParts('margin', '1px 2px 3px 4px', 'auto');
  });

  test('setting individual padding and margin properties to an empty string should clear them', () => {
    var style = new CSSStyleDeclaration();

    var properties = ['padding', 'margin'];
    var parts = ['Top', 'Right', 'Bottom', 'Left'];
    for (var i = 0; i < properties.length; i++) {
      for (var j = 0; j < parts.length; j++) {
        var property = properties[i] + parts[j];
        style[property] = '12px';
        expect(style[property]).toEqual('12px');

        style[property] = '';
        expect(style[property]).toEqual('');
      }
    }
  });

  test('removing and setting individual margin properties updates the combined property accordingly', () => {
    var style = new CSSStyleDeclaration();
    style.margin = '1px 2px 3px 4px';

    style.marginTop = '';
    expect(style.margin).toEqual('');
    expect(style.marginRight).toEqual('2px');
    expect(style.marginBottom).toEqual('3px');
    expect(style.marginLeft).toEqual('4px');

    style.marginBottom = '';
    expect(style.margin).toEqual('');
    expect(style.marginRight).toEqual('2px');
    expect(style.marginLeft).toEqual('4px');

    style.marginBottom = '5px';
    expect(style.margin).toEqual('');
    expect(style.marginRight).toEqual('2px');
    expect(style.marginBottom).toEqual('5px');
    expect(style.marginLeft).toEqual('4px');

    style.marginTop = '6px';
    expect(style.cssText).toEqual('margin: 6px 2px 5px 4px;');
  });

  test.each(['padding', 'margin'])(
    'removing an individual %s property should remove the combined property and replace it with the remaining individual ones',
    (property) => {
      var style = new CSSStyleDeclaration();
      var parts = ['Top', 'Right', 'Bottom', 'Left'];
      var partValues = ['1px', '2px', '3px', '4px'];

      for (var j = 0; j < parts.length; j++) {
        var partToRemove = parts[j];
        style[property] = partValues.join(' ');
        style[property + partToRemove] = '';

        // Main property should have been removed
        expect(style[property]).toEqual('');

        // Expect other parts to still be there
        for (var k = 0; k < parts.length; k++) {
          var propertyCss = property + '-' + parts[k].toLowerCase() + ': ' + partValues[k] + ';';
          if (k === j) {
            expect(style[property + parts[k]]).toEqual('');
            expect(style.cssText).not.toContain(propertyCss);
          } else {
            expect(style[property + parts[k]]).toEqual(partValues[k]);
            expect(style.cssText).toContain(propertyCss);
          }
        }
      }
    }
  );

  test.each(['margin', 'padding'])(
    'setting additional %s properties keeps important status of others',
    (property) => {
      var style = new CSSStyleDeclaration();
      var importantProperty = property + '-top: 3px !important;';
      style.cssText = importantProperty;
      expect(style.cssText).toContain(importantProperty);

      style[property + 'Right'] = '4px';
      style[property + 'Bottom'] = '5px';
      style[property + 'Left'] = '6px';

      expect(style.cssText).toContain(importantProperty);
      expect(style.cssText).toContain(property + '-right: 4px;');
      expect(style.cssText).toContain(property + '-bottom: 5px;');
      expect(style.cssText).toContain(property + '-left: 6px;');
      expect(style.cssText).not.toContain('margin:');
    }
  );

  test.each(['margin', 'padding'])(
    'setting individual %s keeps important status of others',
    (property) => {
      var style = new CSSStyleDeclaration();
      style.cssText = property + ': 3px !important;';

      style[property + 'Top'] = '4px';

      expect(style.cssText).toContain(property + '-top: 4px;');
      expect(style.cssText).toContain(property + '-right: 3px !important;');
      expect(style.cssText).toContain(property + '-bottom: 3px !important;');
      expect(style.cssText).toContain(property + '-left: 3px !important;');
      expect(style.cssText).not.toContain('margin:');
    }
  );

  test('setting a value to 0 should return the string value', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('fill-opacity', 0);
    expect(style.fillOpacity).toEqual('0');
  });

  test('onchange callback should be called when the csstext changes', () => {
    var called = 0;
    var style = new CSSStyleDeclaration(function (cssText) {
      called++;
      expect(cssText).toEqual('opacity: 0;');
    });
    style.cssText = 'opacity: 0;';
    expect(called).toEqual(1);
    style.cssText = 'opacity: 0;';
    expect(called).toEqual(2);
  });

  test('onchange callback should be called only once when multiple properties were added', () => {
    var called = 0;
    var style = new CSSStyleDeclaration(function (cssText) {
      called++;
      expect(cssText).toEqual('width: 100px; height: 100px;');
    });
    style.cssText = 'width: 100px;height:100px;';
    expect(called).toEqual(1);
  });

  test('onchange callback should not be called when property is set to the same value', () => {
    var called = 0;
    var style = new CSSStyleDeclaration(function () {
      called++;
    });

    style.setProperty('opacity', 0);
    expect(called).toEqual(1);
    style.setProperty('opacity', 0);
    expect(called).toEqual(1);
  });

  test('onchange callback should not be called when removeProperty was called on non-existing property', () => {
    var called = 0;
    var style = new CSSStyleDeclaration(function () {
      called++;
    });
    style.removeProperty('opacity');
    expect(called).toEqual(0);
  });

  test('setting float should work the same as cssfloat', () => {
    var style = new CSSStyleDeclaration();
    style.float = 'left';
    expect(style.cssFloat).toEqual('left');
  });

  test('setting improper css to csstext should not throw', () => {
    var style = new CSSStyleDeclaration();
    style.cssText = 'color: ';
    expect(style.cssText).toEqual('');
    style.color = 'black';
    style.cssText = 'float: ';
    expect(style.cssText).toEqual('');
  });

  test('url parsing works with quotes', () => {
    var style = new CSSStyleDeclaration();
    style.backgroundImage = 'url(http://some/url/here1.png)';
    expect(style.backgroundImage).toEqual('url(http://some/url/here1.png)');
    style.backgroundImage = "url('http://some/url/here2.png')";
    expect(style.backgroundImage).toEqual('url(http://some/url/here2.png)');
    style.backgroundImage = 'url("http://some/url/here3.png")';
    expect(style.backgroundImage).toEqual('url(http://some/url/here3.png)');
  });

  test('setting 0 to a padding or margin works', () => {
    var style = new CSSStyleDeclaration();
    style.padding = 0;
    expect(style.cssText).toEqual('padding: 0px;');
    style.margin = '1em';
    style.marginTop = '0';
    expect(style.marginTop).toEqual('0px');
  });

  test('setting ex units to a padding or margin works', () => {
    var style = new CSSStyleDeclaration();
    style.padding = '1ex';
    expect(style.cssText).toEqual('padding: 1ex;');
    style.margin = '1em';
    style.marginTop = '0.5ex';
    expect(style.marginTop).toEqual('0.5ex');
  });

  test('setting empty string and null to a padding or margin works', () => {
    var style = new CSSStyleDeclaration();
    var parts = ['Top', 'Right', 'Bottom', 'Left'];
    function testParts(base, nullValue) {
      var props = [base].concat(parts.map((part) => base + part));
      for (let prop of props) {
        expect(style[prop]).toEqual('');
        style[prop] = '10px';
        expect(style[prop]).toEqual('10px');
        style[prop] = nullValue;
        expect(style[prop]).toEqual('');
      }
    }

    testParts('margin', '');
    testParts('margin', null);
    testParts('padding', '');
    testParts('padding', null);
  });

  test('setting undefined to a padding or margin does nothing', () => {
    var style = new CSSStyleDeclaration();
    var parts = ['Top', 'Right', 'Bottom', 'Left'];
    function testParts(base) {
      var props = [base].concat(parts.map((part) => base + part));
      for (let prop of props) {
        style[prop] = '10px';
        expect(style[prop]).toEqual('10px');
        style[prop] = undefined;
        expect(style[prop]).toEqual('10px');
      }
    }

    testParts('margin');
    testParts('padding');
  });

  test('setting null to background works', () => {
    var style = new CSSStyleDeclaration();
    style.background = 'red';
    expect(style.cssText).toEqual('background: red;');
    style.background = null;
    expect(style.cssText).toEqual('');
  });

  test('flex properties should keep their values', () => {
    var style = new CSSStyleDeclaration();
    style.flexDirection = 'column';
    expect(style.cssText).toEqual('flex-direction: column;');
    style.flexDirection = 'row';
    expect(style.cssText).toEqual('flex-direction: row;');
  });

  test('camelcase properties are not assigned with `.setproperty()`', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('fontSize', '12px');
    expect(style.cssText).toEqual('');
  });

  test('casing is ignored in `.setproperty()`', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('FoNt-SiZe', '12px');
    expect(style.fontSize).toEqual('12px');
    expect(style.getPropertyValue('font-size')).toEqual('12px');
  });

  test('support non string entries in border-spacing', () => {
    var style = new CSSStyleDeclaration();
    style.borderSpacing = 0;
    expect(style.cssText).toEqual('border-spacing: 0px;');
  });

  test('float should be valid property for `.setproperty()`', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('float', 'left');
    expect(style.float).toEqual('left');
    expect(style.getPropertyValue('float')).toEqual('left');
  });

  test('flex-shrink works', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('flex-shrink', 0);
    expect(style.getPropertyValue('flex-shrink')).toEqual('0');
    style.setProperty('flex-shrink', 1);
    expect(style.getPropertyValue('flex-shrink')).toEqual('1');
    expect(style.cssText).toEqual('flex-shrink: 1;');
  });

  test('flex-grow works', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('flex-grow', 2);
    expect(style.getPropertyValue('flex-grow')).toEqual('2');
    expect(style.cssText).toEqual('flex-grow: 2;');
  });

  test('flex-basis works', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('flex-basis', 0);
    expect(style.getPropertyValue('flex-basis')).toEqual('0px');
    style.setProperty('flex-basis', '250px');
    expect(style.getPropertyValue('flex-basis')).toEqual('250px');
    style.setProperty('flex-basis', '10em');
    expect(style.getPropertyValue('flex-basis')).toEqual('10em');
    style.setProperty('flex-basis', '30%');
    expect(style.getPropertyValue('flex-basis')).toEqual('30%');
    expect(style.cssText).toEqual('flex-basis: 30%;');
  });

  test('shorthand flex works', () => {
    var style = new CSSStyleDeclaration();
    style.setProperty('flex', 'none');
    expect(style.getPropertyValue('flex-grow')).toEqual('0');
    expect(style.getPropertyValue('flex-shrink')).toEqual('0');
    expect(style.getPropertyValue('flex-basis')).toEqual('auto');
    style.removeProperty('flex');
    style.removeProperty('flex-basis');
    style.setProperty('flex', 'auto');
    expect(style.getPropertyValue('flex-grow')).toEqual('');
    expect(style.getPropertyValue('flex-shrink')).toEqual('');
    expect(style.getPropertyValue('flex-basis')).toEqual('auto');
    style.removeProperty('flex');
    style.setProperty('flex', '0 1 250px');
    expect(style.getPropertyValue('flex')).toEqual('0 1 250px');
    expect(style.getPropertyValue('flex-grow')).toEqual('0');
    expect(style.getPropertyValue('flex-shrink')).toEqual('1');
    expect(style.getPropertyValue('flex-basis')).toEqual('250px');
    style.removeProperty('flex');
    style.setProperty('flex', '2');
    expect(style.getPropertyValue('flex-grow')).toEqual('2');
    expect(style.getPropertyValue('flex-shrink')).toEqual('');
    expect(style.getPropertyValue('flex-basis')).toEqual('');
    style.removeProperty('flex');
    style.setProperty('flex', '20%');
    expect(style.getPropertyValue('flex-grow')).toEqual('');
    expect(style.getPropertyValue('flex-shrink')).toEqual('');
    expect(style.getPropertyValue('flex-basis')).toEqual('20%');
    style.removeProperty('flex');
    style.setProperty('flex', '2 2');
    expect(style.getPropertyValue('flex-grow')).toEqual('2');
    expect(style.getPropertyValue('flex-shrink')).toEqual('2');
    expect(style.getPropertyValue('flex-basis')).toEqual('');
    style.removeProperty('flex');
  });

  test('font-size get a valid value', () => {
    var style = new CSSStyleDeclaration();
    const invalidValue = '1r5px';
    style.cssText = 'font-size: 15px';
    expect(1).toEqual(style.length);
    style.cssText = `font-size: ${invalidValue}`;
    expect(0).toEqual(style.length);
    expect(undefined).toEqual(style[0]);
  });

  test('getPropertyValue for custom properties in cssText', () => {
    const style = new CSSStyleDeclaration();
    style.cssText = '--foo: red';

    expect(style.getPropertyValue('--foo')).toEqual('red');
  });

  test('getPropertyValue for custom properties with setProperty', () => {
    const style = new CSSStyleDeclaration();
    style.setProperty('--bar', 'blue');

    expect(style.getPropertyValue('--bar')).toEqual('blue');
  });

  test('getPropertyValue for custom properties with object setter', () => {
    const style = new CSSStyleDeclaration();
    style['--baz'] = 'yellow';

    expect(style.getPropertyValue('--baz')).toEqual('');
  });

  test('custom properties are case-sensitive', () => {
    const style = new CSSStyleDeclaration();
    style.cssText = '--fOo: purple';

    expect(style.getPropertyValue('--foo')).toEqual('');
    expect(style.getPropertyValue('--fOo')).toEqual('purple');
  });

  test('supports calc', () => {
    const style = new CSSStyleDeclaration();
    style.setProperty('width', 'calc(100% - 100px)');
    expect(style.getPropertyValue('width')).toEqual('calc(100% - 100px)');
  });

  test('implements webkitTextFillColor', () => {
    const style = new CSSStyleDeclaration();
    style.setProperty('-webkit-text-fill-color', '#ffffff66');

    expect(style.webkitTextFillColor).toEqual('rgba(255, 255, 255, 0.4)');
    expect(style.WebkitTextFillColor).toEqual('rgba(255, 255, 255, 0.4)');
    expect(style.cssText).toEqual('-webkit-text-fill-color: rgba(255, 255, 255, 0.4);');
  });

  test('vendor property with cssText', () => {
    const style = new CSSStyleDeclaration();
    style.cssText = '-webkit-line-clamp: 20';

    expect(style.WebkitLineClamp).toEqual('20');
    expect(style.webkitLineClamp).toEqual('20');
    expect(style.getPropertyValue('-webkit-line-clamp')).toEqual('20');
  });

  test('-webkit-transform', () => {
    const style = new CSSStyleDeclaration();
    style.cssText = '-webkit-transform: scale(2);';

    expect(style.WebkitTransform).toEqual('scale(2)');
    expect(style.WebkitTransform).toEqual('scale(2)');
    expect(style.getPropertyValue('-webkit-transform')).toEqual('scale(2)');
  });

  test('-webkit-text-stroke-width', () => {
    const style = new CSSStyleDeclaration();
    style.cssText = '-webkit-text-stroke-width: 0.5em;';

    expect(style.WebkitTextStrokeWidth).toEqual('0.5em');
    expect(style.webkitTextStrokeWidth).toEqual('0.5em');
    expect(style.getPropertyValue('-webkit-text-stroke-width')).toEqual('0.5em');
  });
});
