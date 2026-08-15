/** 安全的轻量 Markdown 渲染器：只创建 DOM 节点，不解析或执行 HTML。 */
var BILI_MARKDOWN = (() => {
  const BLOCK_START = /^(?:```|#{1,6}\s+|>\s?|(?:[-*_]\s*){3,}$|\s*(?:[-+*]|\d+\.)\s+)/;

  function appendInline(parent, source, doc) {
    const text = String(source || "");
    const token = /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|\[[^\]\n]+\]\([^\s)]+\)|\n)/g;
    let cursor = 0;
    for (const match of text.matchAll(token)) {
      if (match.index > cursor) {
        parent.appendChild(doc.createTextNode(text.slice(cursor, match.index)));
      }
      const value = match[0];
      if (value === "\n") {
        parent.appendChild(doc.createElement("br"));
      } else if (value.startsWith("`")) {
        const code = doc.createElement("code");
        code.textContent = value.slice(1, -1);
        parent.appendChild(code);
      } else if (value.startsWith("**") || value.startsWith("__")) {
        const strong = doc.createElement("strong");
        strong.textContent = value.slice(2, -2);
        parent.appendChild(strong);
      } else if (value.startsWith("*") || value.startsWith("_")) {
        const emphasis = doc.createElement("em");
        emphasis.textContent = value.slice(1, -1);
        parent.appendChild(emphasis);
      } else {
        const link = value.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        const href = link?.[2] || "";
        if (/^https?:\/\//i.test(href)) {
          const anchor = doc.createElement("a");
          anchor.textContent = link[1];
          anchor.href = href;
          anchor.target = "_blank";
          anchor.rel = "noreferrer noopener";
          parent.appendChild(anchor);
        } else {
          parent.appendChild(doc.createTextNode(link?.[1] || value));
        }
      }
      cursor = match.index + value.length;
    }
    if (cursor < text.length) {
      parent.appendChild(doc.createTextNode(text.slice(cursor)));
    }
  }

  function render(container, markdown, doc = document) {
    container.textContent = "";
    const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
    let index = 0;
    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) {
        index += 1;
        continue;
      }

      const fence = line.match(/^```\s*([\w-]*)\s*$/);
      if (fence) {
        const body = [];
        index += 1;
        while (index < lines.length && !/^```\s*$/.test(lines[index])) {
          body.push(lines[index]);
          index += 1;
        }
        if (index < lines.length) index += 1;
        const pre = doc.createElement("pre");
        const code = doc.createElement("code");
        if (fence[1]) code.className = `language-${fence[1]}`;
        code.textContent = body.join("\n");
        pre.appendChild(code);
        container.appendChild(pre);
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        const node = doc.createElement(`h${heading[1].length}`);
        appendInline(node, heading[2], doc);
        container.appendChild(node);
        index += 1;
        continue;
      }

      if (/^(?:[-*_]\s*){3,}$/.test(line.trim())) {
        container.appendChild(doc.createElement("hr"));
        index += 1;
        continue;
      }

      if (/^>\s?/.test(line)) {
        const quote = [];
        while (index < lines.length && /^>\s?/.test(lines[index])) {
          quote.push(lines[index].replace(/^>\s?/, ""));
          index += 1;
        }
        const blockquote = doc.createElement("blockquote");
        appendInline(blockquote, quote.join("\n"), doc);
        container.appendChild(blockquote);
        continue;
      }

      const listItem = line.match(/^\s*([-+*]|\d+\.)\s+(.+)$/);
      if (listItem) {
        const ordered = /\d+\./.test(listItem[1]);
        const list = doc.createElement(ordered ? "ol" : "ul");
        while (index < lines.length) {
          const item = lines[index].match(/^\s*([-+*]|\d+\.)\s+(.+)$/);
          if (!item || /\d+\./.test(item[1]) !== ordered) break;
          const li = doc.createElement("li");
          appendInline(li, item[2], doc);
          list.appendChild(li);
          index += 1;
        }
        container.appendChild(list);
        continue;
      }

      const paragraph = [line];
      index += 1;
      while (index < lines.length && lines[index].trim() && !BLOCK_START.test(lines[index])) {
        paragraph.push(lines[index]);
        index += 1;
      }
      const node = doc.createElement("p");
      appendInline(node, paragraph.join("\n"), doc);
      container.appendChild(node);
    }
    return container;
  }

  return { render };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = BILI_MARKDOWN;
}
