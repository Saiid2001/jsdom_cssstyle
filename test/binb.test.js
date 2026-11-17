"use strict";

// What binb's renderer reads from this fork beyond upstream 4.6.0.

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { CSSStyleDeclaration } = require("../lib/CSSStyleDeclaration");

describe("-webkit- properties", () => {
  it("implements -webkit-text-fill-color under both camel cases", () => {
    const style = new CSSStyleDeclaration();
    style.setProperty("-webkit-text-fill-color", "#ffffff66");

    assert.equal(style.webkitTextFillColor, "rgba(255, 255, 255, 0.4)");
    assert.equal(style.WebkitTextFillColor, "rgba(255, 255, 255, 0.4)");
    assert.equal(style.cssText, "-webkit-text-fill-color: rgba(255, 255, 255, 0.4);");
  });

  it("keeps -webkit-line-clamp from cssText", () => {
    const style = new CSSStyleDeclaration();
    style.cssText = "-webkit-line-clamp: 20";

    assert.equal(style.WebkitLineClamp, "20");
    assert.equal(style.webkitLineClamp, "20");
    assert.equal(style.getPropertyValue("-webkit-line-clamp"), "20");
  });

  it("keeps -webkit-transform", () => {
    const style = new CSSStyleDeclaration();
    style.cssText = "-webkit-transform: scale(2);";

    assert.equal(style.WebkitTransform, "scale(2)");
    assert.equal(style.webkitTransform, "scale(2)");
    assert.equal(style.getPropertyValue("-webkit-transform"), "scale(2)");
  });

  it("keeps -webkit-text-stroke-width", () => {
    const style = new CSSStyleDeclaration();
    style.cssText = "-webkit-text-stroke-width: 0.5em;";

    assert.equal(style.WebkitTextStrokeWidth, "0.5em");
    assert.equal(style.webkitTextStrokeWidth, "0.5em");
    assert.equal(style.getPropertyValue("-webkit-text-stroke-width"), "0.5em");
  });

  it("keeps the user agent stylesheet's logical margins", () => {
    const style = new CSSStyleDeclaration();
    style.cssText = "-webkit-margin-before: 1em; -webkit-margin-start: 40px;";

    assert.equal(style.getPropertyValue("-webkit-margin-before"), "1em");
    assert.equal(style.getPropertyValue("-webkit-margin-start"), "40px");
  });

  it("keeps the aliases upstream 4.6.0 dropped", () => {
    const style = new CSSStyleDeclaration();
    style.cssText =
      "display: -webkit-box; -webkit-box-orient: vertical; -webkit-user-select: none; " +
      "-webkit-appearance: none; -webkit-transition: opacity 1s;";

    assert.equal(style.getPropertyValue("display"), "-webkit-box");
    assert.equal(style.getPropertyValue("-webkit-box-orient"), "vertical");
    assert.equal(style.webkitUserSelect, "none");
    assert.equal(style.WebkitAppearance, "none");
    assert.equal(style.getPropertyValue("-webkit-transition"), "opacity 1s");
  });
});

describe("flex-flow", () => {
  it("expands both components in either order", () => {
    const style = new CSSStyleDeclaration();
    style.flexFlow = "wrap column";

    assert.equal(style.flexDirection, "column");
    assert.equal(style.flexWrap, "wrap");
    assert.equal(style.flexFlow, "column wrap");
  });

  it("resets an omitted component to its initial value", () => {
    const style = new CSSStyleDeclaration();
    style.flexWrap = "wrap";
    style.flexFlow = "column";

    assert.equal(style.flexDirection, "column");
    assert.equal(style.flexWrap, "nowrap");
  });

  it("rejects what is not a direction or a wrap", () => {
    const style = new CSSStyleDeclaration();
    style.flexFlow = "row";
    style.flexFlow = "row row";
    style.flexFlow = "sideways";

    assert.equal(style.flexDirection, "row");
    assert.equal(style.flexFlow, "row nowrap");
  });

  it("lets a later longhand win through cssText", () => {
    const style = new CSSStyleDeclaration();
    style.cssText = "flex-flow: row wrap; flex-direction: column;";

    assert.equal(style.flexDirection, "column");
    assert.equal(style.flexWrap, "wrap");
  });
});

describe("what the fork carried and 4.6.0 now does itself", () => {
  it("expands one-value flex", () => {
    const style = new CSSStyleDeclaration();
    style.flex = "2";
    assert.equal(style.flex, "2 1 0%");
    style.flex = "100%";
    assert.equal(style.flex, "1 1 100%");
    assert.equal(style.flexGrow, "1");
    style.flex = "auto";
    assert.equal(style.flex, "1 1 auto");
  });

  it("takes auto for top, right, bottom and left", () => {
    const style = new CSSStyleDeclaration();
    for (const side of ["top", "right", "bottom", "left"]) {
      style[side] = "10px";
      style[side] = "auto";
      assert.equal(style[side], "auto");
    }
  });
});

describe("a colour the resolver cannot take", () => {
  it("drops that declaration instead of throwing out of setProperty", () => {
    const colorPath = require.resolve("@asamuzakjp/css-color", {
      paths: [require.resolve("../lib/parsers")]
    });
    require(colorPath);
    const cached = require.cache[colorPath];
    const original = cached.exports;
    const parsersPath = require.resolve("../lib/parsers");
    const ownModules = () =>
      Object.keys(require.cache).filter((key) => key.includes("/jsdom_cssstyle/lib/"));

    // The resolver throws on some values (getbootstrap.com's color-mix(), with
    // its variables substituted); a stand-in that always throws reaches the
    // same path.
    cached.exports = {
      ...original,
      resolve: () => {
        throw new TypeError("object null is not iterable");
      }
    };
    for (const key of ownModules()) {
      delete require.cache[key];
    }

    try {
      const { parseColor } = require(parsersPath);
      const { CSSStyleDeclaration: Fresh } = require("../lib/CSSStyleDeclaration");

      assert.equal(parseColor("color-mix(in srgb, red 50%, blue)"), undefined);

      const style = new Fresh();
      style.setProperty("color", "color-mix(in srgb, red 50%, blue)");
      assert.equal(style.color, "");
      style.setProperty("width", "10px");
      assert.equal(style.width, "10px");
    } finally {
      cached.exports = original;
      for (const key of ownModules()) {
        delete require.cache[key];
      }
    }
  });
});

// https://drafts.csswg.org/css-display/#display-legacy-flex aliases, which
// browsers parse as the unprefixed keyword: a page that writes only the
// prefixed one is laid out as a flex container.
describe("display", () => {
  it("parses -webkit-flex as flex and -webkit-inline-flex as inline-flex", () => {
    const style = new CSSStyleDeclaration();
    style.display = "-webkit-flex";
    assert.equal(style.display, "flex");

    style.setProperty("display", "-WEBKIT-INLINE-FLEX");
    assert.equal(style.display, "inline-flex");

    style.cssText = "display: -webkit-flex";
    assert.equal(style.getPropertyValue("display"), "flex");
  });

  it("keeps every other valid value as written", () => {
    const style = new CSSStyleDeclaration();

    for (const value of [
      "-webkit-box",
      "-webkit-inline-box",
      "block",
      "inline flow-root",
      "flex inline",
      "contents",
      "list-item",
      "inline list-item flow-root",
      "table-cell",
      "inherit",
      "var(--d)"
    ]) {
      style.display = value;
      assert.equal(style.display, value);
    }
  });

  // A page writes `display: flex; display: -ms-flexbox` for old browsers; Chrome
  // drops the value it does not know and keeps the flex before it.
  it("ignores a value that is not a display", () => {
    const style = new CSSStyleDeclaration();
    style.display = "flex";

    for (const value of [
      "-ms-flexbox",
      "-moz-box",
      "box",
      "block block",
      "flex grid",
      "list-item table",
      "flex 1"
    ]) {
      style.display = value;
      assert.equal(style.display, "flex", value);
    }

    style.cssText = "display: flex; display: -ms-flexbox";
    assert.equal(style.display, "flex");
  });
});

describe("background shorthand with a two-part position", () => {
  for (const [value, image, position, repeat] of [
    ["url(/i.png) center center no-repeat", 'url("/i.png")', "center center", "no-repeat"],
    ["#fff url(/i.png) no-repeat 0 0", 'url("/i.png")', "0px 0px", "no-repeat"],
    ["url(/i.png) left top repeat-x", 'url("/i.png")', "left top", "repeat-x"],
    ["url(/i.png) no-repeat 10px -20px", 'url("/i.png")', "10px -20px", "no-repeat"]
  ]) {
    it(`keeps background: ${value}`, () => {
      const style = new CSSStyleDeclaration();
      style.cssText = `background: ${value}`;

      assert.equal(style.backgroundImage, image);
      assert.equal(style.backgroundPosition, position);
      assert.equal(style.backgroundRepeat, repeat);
    });
  }

  it("still refuses position parts that are not adjacent", () => {
    const style = new CSSStyleDeclaration();
    style.cssText = "background: url(/i.png) left no-repeat top";

    assert.equal(style.backgroundImage, "");
  });
});

// CSS Contain 3 §6.1 container query lengths, which were dropped as unknown
// units: a declaration of one left the element without the property at all.
describe("container query lengths", () => {
  it("keeps cqw, cqh, cqi, cqb, cqmin and cqmax", () => {
    for (const value of ["50cqw", "10cqh", "1.5cqi", "2cqb", "3cqmin", "4cqmax"]) {
      const style = new CSSStyleDeclaration();
      style.width = value;
      assert.equal(style.width, value);
    }
  });
});

// usc.edu sets `calc(100vh - 86px` -- its closing parenthesis forgotten -- from
// jQuery's .css(). CSS closes a block left open at the end of a value, so
// Chrome reads it as `calc(100vh - 86px)`; here it threw out of the page's own
// style assignment, which a browser never does, and the throw ended the loop
// that attaches the site's every component. binb C-287.
describe("calc() left open at the end of a value", () => {
  it("is closed, as CSS closes it", () => {
    const style = new CSSStyleDeclaration();
    style.height = "calc(100vh - 86px";

    assert.equal(style.height, "calc(100vh - 86px)");
  });

  it("is closed however deep it was left open", () => {
    const style = new CSSStyleDeclaration();
    style.height = "calc(100vh - (86px + 2vh";

    assert.equal(style.height, "calc(100vh - (86px + 2vh))");
  });

  it("is closed through setProperty too", () => {
    const style = new CSSStyleDeclaration();
    style.setProperty("width", "calc(50vw - 10px");

    assert.equal(style.width, "calc(50vw - 10px)");
  });
});

describe("a calc() the reader cannot take", () => {
  it("drops that declaration instead of throwing out of the page's assignment", () => {
    const colorPath = require.resolve("@asamuzakjp/css-color", {
      paths: [require.resolve("../lib/parsers")]
    });
    require(colorPath);
    const cached = require.cache[colorPath];
    const original = cached.exports;
    const parsersPath = require.resolve("../lib/parsers");
    const ownModules = () =>
      Object.keys(require.cache).filter((key) => key.includes("/jsdom_cssstyle/lib/"));

    cached.exports = {
      ...original,
      utils: {
        ...original.utils,
        cssCalc: () => {
          throw new Error("Unexpected token 86px.");
        }
      }
    };
    for (const key of ownModules()) {
      delete require.cache[key];
    }

    try {
      const { CSSStyleDeclaration: Fresh } = require("../lib/CSSStyleDeclaration");
      const style = new Fresh();
      style.height = "10px";

      assert.doesNotThrow(() => { style.height = "calc(100vh - 86px)"; });
      assert.equal(style.height, "10px");
      assert.doesNotThrow(() => style.setProperty("width", "calc(1px + 2px)"));
      assert.equal(style.width, "");
    } finally {
      cached.exports = original;
      for (const key of ownModules()) {
        delete require.cache[key];
      }
    }
  });
});
