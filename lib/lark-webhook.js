/**
 * 飞书多维表格 Webhook 的统一笔记载荷。
 *
 * 无论来源是视频摘录、手记还是 AI 记，均逐条发送相同的对象结构。这样飞书
 * 工作流只需要维护一套字段映射；用 note.id 做唯一标识时也可以自行实现 upsert。
 */
var BILI_LARK_WEBHOOK = (() => {
  const EVENT = "video_digest.note.sync";
  const SCHEMA_VERSION = 1;

  function stringOrNull(value, maxLength = 20_000) {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return text ? text.slice(0, maxLength) : null;
  }

  function numberOrNull(value, { integer = false } = {}) {
    const number = Number(value);
    if (!Number.isFinite(number)) return null;
    return integer ? Math.floor(number) : number;
  }

  function isoOrNull(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  function notePayload(note, { sentAt = new Date().toISOString() } = {}) {
    const source = note && typeof note === "object" ? note : {};
    return {
      event: EVENT,
      schemaVersion: SCHEMA_VERSION,
      sentAt: isoOrNull(sentAt) || new Date().toISOString(),
      note: {
        id: stringOrNull(source.id, 300),
        kind: stringOrNull(source.kind, 100),
        text: stringOrNull(source.text),
        rawText: stringOrNull(source.rawText),
        createdAt: isoOrNull(source.createdAt),
        site: stringOrNull(source.site, 100),
        videoId: stringOrNull(source.videoId || source.bvid, 500),
        page: numberOrNull(source.page, { integer: true }),
        videoTitle: stringOrNull(source.videoTitle, 1_000),
        ownerName: stringOrNull(source.ownerName, 500),
        timestamp: stringOrNull(source.timestamp, 100),
        timestampSeconds: numberOrNull(source.timestampSeconds),
        sourceUrl: stringOrNull(source.timestampedUrl, 4_000),
        pending: Boolean(source.pending),
      },
    };
  }

  function testNote(now = Date.now()) {
    return {
      id: `video_digest_sync_test_${now}`,
      kind: "sync_test",
      text: "Video Digest AI 飞书多维表格 Webhook 测试记录",
      rawText: null,
      createdAt: now,
      site: null,
      videoId: null,
      page: null,
      videoTitle: null,
      ownerName: null,
      timestamp: null,
      timestampSeconds: null,
      timestampedUrl: null,
      pending: false,
    };
  }

  return { EVENT, SCHEMA_VERSION, notePayload, testNote };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = BILI_LARK_WEBHOOK;
}
