/** YouTube 字幕数据源：Supadata native 模式，绝不回退到音频转写。 */
var VIDEO_YOUTUBE_API = (() => {
  const TRANSCRIPT_URL = "https://api.supadata.ai/v1/transcript";

  function parseVideoId(input) {
    const text = String(input || "").trim();
    if (/^[A-Za-z0-9_-]{6,20}$/.test(text)) return text;
    try {
      const url = new URL(text);
      if (!/(^|\.)youtube\.com$/.test(url.hostname)) return null;
      const id = url.searchParams.get("v") || "";
      return /^[A-Za-z0-9_-]{6,20}$/.test(id) ? id : null;
    } catch (error) {
      return null;
    }
  }

  function canonicalVideoUrl(videoId, seconds = 0) {
    const id = parseVideoId(videoId);
    if (!id) throw new Error("无效的 YouTube 视频 ID。");
    const url = new URL("https://www.youtube.com/watch");
    url.searchParams.set("v", id);
    const start = Math.max(0, Math.floor(Number(seconds) || 0));
    if (start) url.searchParams.set("t", `${start}s`);
    return url.toString();
  }

  function normalizeTranscript(payload) {
    const content = Array.isArray(payload?.content) ? payload.content : [];
    const transcript = content
      .map((chunk) => {
        const text = String(chunk?.text || "").replace(/>> ?/g, "").trim();
        if (!text) return null;
        return {
          text,
          start: Math.max(0, Number(chunk?.offset) || 0) / 1000,
          duration: Math.max(0, Number(chunk?.duration) || 0) / 1000,
          language: chunk?.lang || payload?.lang || null,
        };
      })
      .filter(Boolean);
    return {
      transcript,
      language:
        typeof payload?.lang === "string"
          ? payload.lang
          : transcript.find((entry) => entry.language)?.language || "",
      availableLanguages: Array.isArray(payload?.availableLangs)
        ? payload.availableLangs
        : [],
    };
  }

  async function readTranscriptResponse(response) {
    if (response.status === 206 || response.status === 404) {
      const error = new Error("这个 YouTube 视频没有可用的原生字幕。");
      error.code = "NO_SUBTITLE";
      throw error;
    }
    if (response.status === 401 || response.status === 403) {
      const error = new Error("Supadata API Key 无效，请到设置页检查。");
      error.code = "INVALID_SUPADATA_KEY";
      throw error;
    }
    if (response.status === 429) {
      const error = new Error("Supadata 已限流，请稍后重试。");
      error.code = "TRANSCRIPT_RATE_LIMITED";
      throw error;
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const error = new Error(payload?.message || `Supadata 请求失败：HTTP ${response.status}`);
      error.code = "TRANSCRIPT_FETCH_FAILED";
      throw error;
    }
    return response.json();
  }

  async function pollJob(
    jobId,
    apiKey,
    { fetchImpl = fetch, wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = {},
  ) {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      await wait(1000);
      const response = await fetchImpl(
        `${TRANSCRIPT_URL}/${encodeURIComponent(jobId)}`,
        { headers: { "x-api-key": apiKey } },
      );
      const data = await readTranscriptResponse(response);
      if (data?.status === "completed") return data;
      if (data?.status === "failed") {
        const error = new Error("Supadata 字幕任务处理失败。");
        error.code = "TRANSCRIPT_JOB_FAILED";
        throw error;
      }
    }
    const error = new Error("Supadata 字幕任务处理超时。");
    error.code = "TRANSCRIPT_JOB_TIMEOUT";
    throw error;
  }

  async function fetchTranscript(
    videoId,
    apiKey,
    { fetchImpl = fetch, wait } = {},
  ) {
    const id = parseVideoId(videoId);
    if (!id) {
      const error = new Error("没有识别到 YouTube 视频 ID。");
      error.code = "INVALID_VIDEO_ID";
      throw error;
    }
    if (!String(apiKey || "").trim()) {
      const error = new Error("请先在设置页填写 Supadata API Key。");
      error.code = "NO_SUPADATA_KEY";
      throw error;
    }

    const url = new URL(TRANSCRIPT_URL);
    url.searchParams.set("url", canonicalVideoUrl(id));
    url.searchParams.set("text", "false");
    url.searchParams.set("lang", "en");
    url.searchParams.set("mode", "native");
    const response = await fetchImpl(url.toString(), {
      headers: { "x-api-key": String(apiKey).trim() },
    });
    let data;
    if (response.status === 202) {
      const job = await response.json();
      data = await pollJob(job.jobId, String(apiKey).trim(), { fetchImpl, wait });
    } else {
      data = await readTranscriptResponse(response);
    }
    const result = normalizeTranscript(data);
    if (!result.transcript.length) {
      const error = new Error("Supadata 返回了空字幕。");
      error.code = "EMPTY_TRANSCRIPT";
      throw error;
    }
    return result;
  }

  return {
    TRANSCRIPT_URL,
    parseVideoId,
    canonicalVideoUrl,
    normalizeTranscript,
    fetchTranscript,
    pollJob,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = VIDEO_YOUTUBE_API;
}
