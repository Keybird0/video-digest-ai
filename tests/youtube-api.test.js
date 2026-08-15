const test = require("node:test");
const assert = require("node:assert/strict");

const youtube = require("../lib/youtube-api.js");

test("解析标准 YouTube 播放页并拒绝 Shorts", () => {
  assert.equal(
    youtube.parseVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30"),
    "dQw4w9WgXcQ",
  );
  assert.equal(youtube.parseVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ"), null);
});

test("规范链接会移除播放列表和来源参数", () => {
  assert.equal(
    youtube.canonicalVideoUrl("dQw4w9WgXcQ"),
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  );
  assert.equal(
    youtube.canonicalVideoUrl("dQw4w9WgXcQ", 65),
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=65s",
  );
});

test("Supadata 内容归一化为通用秒级字幕并清理说话人标记", () => {
  const result = youtube.normalizeTranscript({
    lang: "en",
    availableLangs: ["en", "zh"],
    content: [
      { text: ">> Hello world", offset: 1500, duration: 2200, lang: "en" },
      { text: "  ", offset: 4000, duration: 1000 },
    ],
  });
  assert.deepEqual(result.transcript, [
    { text: "Hello world", start: 1.5, duration: 2.2, language: "en" },
  ]);
  assert.deepEqual(result.availableLanguages, ["en", "zh"]);
});

test("字幕请求强制 native 模式并只发送规范 URL", async () => {
  let requested;
  const fetchImpl = async (url, options) => {
    requested = { url: new URL(url), options };
    return {
      status: 200,
      ok: true,
      async json() {
        return {
          lang: "en",
          content: [{ text: "Hello", offset: 0, duration: 1000 }],
        };
      },
    };
  };
  const result = await youtube.fetchTranscript("dQw4w9WgXcQ", "secret", {
    fetchImpl,
  });
  assert.equal(requested.url.searchParams.get("mode"), "native");
  assert.equal(
    requested.url.searchParams.get("url"),
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  );
  assert.equal(requested.options.headers["x-api-key"], "secret");
  assert.equal(result.transcript.length, 1);
});
