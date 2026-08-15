const test = require("node:test");
const assert = require("node:assert/strict");

const MARKDOWN = require("../lib/markdown.js");

function node(tagName, text = "") {
  return {
    tagName,
    children: [],
    attributes: {},
    _text: text,
    get textContent() {
      return this.children.length
        ? this.children.map((child) => child.textContent).join("")
        : this._text;
    },
    set textContent(value) {
      this.children = [];
      this._text = String(value);
    },
    appendChild(child) {
      this._text = "";
      this.children.push(child);
      return child;
    },
  };
}

const doc = {
  createElement: (tag) => node(tag.toLowerCase()),
  createTextNode: (text) => node("#text", String(text)),
};

test("AI Markdown 渲染标题、强调、列表、代码块和链接", () => {
  const root = node("div");
  MARKDOWN.render(
    root,
    "## 总结\n\n这是 **重点** 和 `code`。\n\n- 第一项\n- 第二项\n\n```js\nalert(1)\n```\n\n[文档](https://example.com)",
    doc,
  );

  assert.deepEqual(root.children.map((child) => child.tagName), [
    "h2",
    "p",
    "ul",
    "pre",
    "p",
  ]);
  assert.equal(root.children[1].children.some((child) => child.tagName === "strong"), true);
  assert.equal(root.children[2].children.length, 2);
  assert.equal(root.children[3].children[0].tagName, "code");
  const link = root.children[4].children[0];
  assert.equal(link.tagName, "a");
  assert.equal(link.href, "https://example.com");
});

test("Markdown 不执行 HTML，也拒绝 javascript 链接", () => {
  const root = node("div");
  MARKDOWN.render(root, '<img src=x onerror=alert(1)>\n\n[危险](javascript:alert(1))', doc);

  assert.equal(root.textContent.includes("<img src=x"), true);
  assert.equal(root.children.flatMap((child) => child.children).some((child) => child.tagName === "img"), false);
  assert.equal(root.children.flatMap((child) => child.children).some((child) => child.tagName === "a"), false);
});
