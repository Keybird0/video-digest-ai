const test = require("node:test");
const assert = require("node:assert/strict");

const LarkWebhook = require("../lib/lark-webhook.js");

test("不同类型笔记使用完全相同的飞书 Webhook JSON 结构", () => {
  const quote = LarkWebhook.notePayload(
    {
      id: "note_1",
      kind: "quote",
      text: "视频摘录",
      rawText: "原始字幕",
      createdAt: 1_700_000_000_000,
      site: "youtube",
      videoId: "abc",
      page: 1,
      videoTitle: "Video title",
      ownerName: "Channel",
      timestamp: "1:23",
      timestampSeconds: 83,
      timestampedUrl: "https://www.youtube.com/watch?v=abc&t=83",
      pending: false,
    },
    { sentAt: "2026-08-16T00:00:00.000Z" },
  );
  const memo = LarkWebhook.notePayload(
    { id: "memo_1", kind: "memo", text: "不关联视频的手记", createdAt: 1_700_000_000_000 },
    { sentAt: "2026-08-16T00:00:00.000Z" },
  );
  const aiNote = LarkWebhook.notePayload(
    { id: "ai_1", kind: "ai_note", text: "AI 回答", createdAt: 1_700_000_000_000 },
    { sentAt: "2026-08-16T00:00:00.000Z" },
  );

  assert.equal(quote.event, "video_digest.note.sync");
  assert.equal(quote.schemaVersion, 1);
  assert.equal(quote.note.createdAt, "2023-11-14T22:13:20.000Z");
  assert.deepEqual(Object.keys(memo.note), Object.keys(quote.note));
  assert.deepEqual(Object.keys(aiNote.note), Object.keys(quote.note));
  assert.equal(memo.note.videoId, null);
  assert.equal(aiNote.note.sourceUrl, null);
  assert.doesNotThrow(() => JSON.stringify(quote));
});

test("飞书 Webhook 测试记录沿用同一笔记结构", () => {
  const payload = LarkWebhook.notePayload(LarkWebhook.testNote(123), {
    sentAt: "2026-08-16T00:00:00.000Z",
  });
  assert.equal(payload.note.kind, "sync_test");
  assert.equal(payload.note.id, "video_digest_sync_test_123");
  assert.deepEqual(Object.keys(payload.note), [
    "id",
    "kind",
    "text",
    "rawText",
    "createdAt",
    "site",
    "videoId",
    "page",
    "videoTitle",
    "ownerName",
    "timestamp",
    "timestampSeconds",
    "sourceUrl",
    "pending",
  ]);
});
