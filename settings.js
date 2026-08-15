/** 共享的非机密配置：默认值、厂商预设与校验逻辑。密钥由 options.js 写入存储。 */
var BILI_SETTINGS = (() => {
  const STORAGE_KEY = "video_digest_settings";
  const LEGACY_STORAGE_KEY = "bili_digest_settings";

  // 只做两种协议：「OpenAI 兼容」是事实标准，Anthropic 是唯一值得单独适配的例外。
  const PROTOCOLS = Object.freeze({
    OPENAI: "openai",
    ANTHROPIC: "anthropic",
  });

  // 只预置 protocol 和 baseUrl；model 故意留空——模型名换代很快，
  // 写死等于埋一个过期默认值，设置页有「拉取模型列表」兜底。
  const PRESETS = Object.freeze([
    {
      id: "deepseek",
      label: "DeepSeek",
      protocol: PROTOCOLS.OPENAI,
      baseUrl: "https://api.deepseek.com",
      // 唯一预置模型：本项目已实测验证过。
      model: "deepseek-v4-flash",
      docsUrl: "https://platform.deepseek.com/api_keys",
    },
    {
      id: "openai",
      label: "OpenAI",
      protocol: PROTOCOLS.OPENAI,
      baseUrl: "https://api.openai.com/v1",
      model: "",
      docsUrl: "https://platform.openai.com/api-keys",
    },
    {
      id: "anthropic",
      label: "Anthropic Claude",
      protocol: PROTOCOLS.ANTHROPIC,
      baseUrl: "https://api.anthropic.com",
      model: "",
      docsUrl: "https://console.anthropic.com/settings/keys",
    },
    {
      id: "gemini",
      label: "Google Gemini（OpenAI 兼容端点）",
      protocol: PROTOCOLS.OPENAI,
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      model: "",
      docsUrl: "https://aistudio.google.com/apikey",
    },
    {
      id: "moonshot",
      label: "月之暗面 Kimi",
      protocol: PROTOCOLS.OPENAI,
      baseUrl: "https://api.moonshot.cn/v1",
      model: "",
      docsUrl: "https://platform.moonshot.cn/console/api-keys",
    },
    {
      id: "zhipu",
      label: "智谱 GLM",
      protocol: PROTOCOLS.OPENAI,
      baseUrl: "https://open.bigmodel.cn/api/paas/v4",
      model: "",
      docsUrl: "https://open.bigmodel.cn/usercenter/apikeys",
    },
    {
      id: "dashscope",
      label: "阿里云百炼（通义千问）",
      protocol: PROTOCOLS.OPENAI,
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      model: "",
      docsUrl: "https://bailian.console.aliyun.com/",
    },
    {
      id: "volcengine_ark",
      label: "火山方舟（Agent Plan）",
      protocol: PROTOCOLS.OPENAI,
      baseUrl: "https://ark.cn-beijing.volces.com/api/plan/v3",
      model: "",
      docsUrl: "https://console.volcengine.com/ark/region:ark+cn-beijing/openManagement?advancedActiveKey=agentPlan",
    },
    {
      id: "siliconflow",
      label: "硅基流动 SiliconFlow",
      protocol: PROTOCOLS.OPENAI,
      baseUrl: "https://api.siliconflow.cn/v1",
      model: "",
      docsUrl: "https://cloud.siliconflow.cn/account/ak",
    },
    {
      id: "openrouter",
      label: "OpenRouter",
      protocol: PROTOCOLS.OPENAI,
      baseUrl: "https://openrouter.ai/api/v1",
      model: "",
      docsUrl: "https://openrouter.ai/keys",
    },
    {
      id: "ollama",
      label: "本地 Ollama",
      protocol: PROTOCOLS.OPENAI,
      baseUrl: "http://localhost:11434/v1",
      model: "",
      docsUrl: "https://ollama.com/",
    },
    {
      id: "custom",
      label: "自定义",
      protocol: PROTOCOLS.OPENAI,
      baseUrl: "",
      model: "",
      docsUrl: "",
    },
  ]);

  const DEFAULT_PRESET = PRESETS[0];
  const CUSTOM_PRESET_ID = "custom";

  // 并发上限压在 8：再高容易撞限流；超时上限 10 分钟是为了照顾本地推理。
  const LIMITS = Object.freeze({
    concurrency: Object.freeze({ min: 1, max: 8, default: 3 }),
    timeoutSeconds: Object.freeze({ min: 30, max: 600, default: 120 }),
  });

  const DEFAULTS = Object.freeze({
    presetId: DEFAULT_PRESET.id,
    protocol: DEFAULT_PRESET.protocol,
    aiApiKey: "",
    aiBaseUrl: DEFAULT_PRESET.baseUrl,
    aiModel: DEFAULT_PRESET.model,
    aiConcurrency: LIMITS.concurrency.default,
    aiTimeoutSeconds: LIMITS.timeoutSeconds.default,
    // 字幕轨优先级：UP 主中文 > AI 中文 > 英文（见 lib/bili-api.js）。
    subtitleLangPreference: Object.freeze([
      "zh-CN",
      "zh-Hans",
      "zh-Hant",
      "zh",
      "ai-zh",
      "en-US",
      "en",
      "ai-en",
    ]),
  });

  const APP_DEFAULTS = Object.freeze({
    failoverEnabled: false,
    aiConcurrency: LIMITS.concurrency.default,
    aiTimeoutSeconds: LIMITS.timeoutSeconds.default,
    supadataApiKey: "",
    youtubeEnabled: true,
    bilibiliEnabled: true,
    uiLanguage: "zh-CN",
  });

  const DEFAULT_OVERVIEW_PROMPTS = Object.freeze({
    "zh-CN":
      "请基于完整视频字幕生成结构化概览：按话题转折划分覆盖全片的章节，每章包含准确时间戳、简洁标题和摘要；另外提取 3–5 条有信息量、可独立阅读的金句并保留准确时间戳。不要编造字幕中不存在的信息。",
    en:
      "Create a structured overview from the complete video transcript. Divide it into chapters at genuine topic shifts, covering the full timeline; each chapter needs an accurate timestamp, concise title, and summary. Also extract 3–5 informative, standalone key quotes with accurate timestamps. Do not invent information absent from the transcript.",
  });

  function normalizeOverviewPrompts(input) {
    const source = input && typeof input === "object" ? input : {};
    return Object.fromEntries(
      Object.entries(DEFAULT_OVERVIEW_PROMPTS).map(([language, fallback]) => {
        const value = typeof source[language] === "string" ? source[language].trim() : "";
        return [language, (value || fallback).slice(0, 5000)];
      }),
    );
  }

  const LANG_CODE_PATTERN = /^[A-Za-z]{2,8}(-[A-Za-z0-9]{2,8})*$/;

  function clampNumber(value, { min, max, default: fallback }) {
    // 空值不能交给 Number()——它把 null 和 "" 都算作 0，「没配过」会被夹成下界。
    if (value === null || value === undefined || value === "") return fallback;

    const number = Math.floor(Number(value));
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  }

  function normalizeLangPreference(input) {
    if (!Array.isArray(input)) return [...DEFAULTS.subtitleLangPreference];
    const cleaned = input
      .map((lang) => (typeof lang === "string" ? lang.trim() : ""))
      .filter((lang) => LANG_CODE_PATTERN.test(lang))
      .slice(0, 20);
    return cleaned.length ? cleaned : [...DEFAULTS.subtitleLangPreference];
  }

  function normalizeAvailableModels(input) {
    if (!Array.isArray(input)) return [];
    return [
      ...new Set(
        input
          .map((model) => (typeof model === "string" ? model.trim() : ""))
          .filter(Boolean)
          .map((model) => model.slice(0, 200)),
      ),
    ].slice(0, 500);
  }

  const presetById = (id) => PRESETS.find((preset) => preset.id === id) || null;

  const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "0.0.0.0"]);

  // 密钥会随请求发到这个地址，所以这里也是安全边界：明文 http 只对本机放行
  //（本地推理服务不配证书），其余一律要求 https。
  function validateBaseUrl(input, protocol = PROTOCOLS.OPENAI) {
    const text = String(input || "").trim();
    if (!text) return { ok: false, error: "请填写 API 地址。" };

    let parsed;
    try {
      parsed = new URL(text);
    } catch (error) {
      return { ok: false, error: "API 地址不是合法的 URL。" };
    }

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { ok: false, error: "API 地址必须以 http:// 或 https:// 开头。" };
    }
    if (parsed.protocol === "http:" && !LOCAL_HOSTS.has(parsed.hostname)) {
      return {
        ok: false,
        error: "只有本机地址允许用 http，其余请用 https，否则密钥会明文传输。",
      };
    }

    // 用户常常直接把文档里的完整端点粘进来。与其报错，不如把它还原成 base。
    let pathname = parsed.pathname.replace(/\/+$/, "");
    for (const suffix of ["/chat/completions", "/v1/messages", "/messages"]) {
      if (pathname.endsWith(suffix)) {
        pathname = pathname.slice(0, -suffix.length);
        break;
      }
    }
    // Anthropic 的端点自带 /v1，base 里再留一个会拼成 /v1/v1/messages。
    if (protocol === PROTOCOLS.ANTHROPIC && pathname.endsWith("/v1")) {
      pathname = pathname.slice(0, -3);
    }

    const url = `${parsed.origin}${pathname}`;
    return { ok: true, url, origin: `${parsed.origin}/` };
  }

  // 申请 host 权限时用的来源，形如 https://api.deepseek.com/。
  function originOf(baseUrl) {
    const result = validateBaseUrl(baseUrl);
    return result.ok ? result.origin : null;
  }

  function chatCompletionsUrl(settings) {
    const { aiBaseUrl, protocol } = normalize(settings);
    const base = validateBaseUrl(aiBaseUrl, protocol);
    if (!base.ok) return null;
    return protocol === PROTOCOLS.ANTHROPIC
      ? `${base.url}/v1/messages`
      : `${base.url}/chat/completions`;
  }

  function modelsUrl(settings) {
    const { aiBaseUrl, protocol } = normalize(settings);
    const base = validateBaseUrl(aiBaseUrl, protocol);
    if (!base.ok) return null;
    return protocol === PROTOCOLS.ANTHROPIC
      ? `${base.url}/v1/models`
      : `${base.url}/models`;
  }

  function normalize(input = {}) {
    const source = input && typeof input === "object" ? input : {};

    const preset = presetById(source.presetId) || DEFAULT_PRESET;
    const isCustom = preset.id === CUSTOM_PRESET_ID;

    // 选了具体厂商时，协议和地址完全由预设说了算——厂商换域名时老用户跟着
    // 升级走，而不是被存储里的旧值钉死。
    const protocol = !isCustom
      ? preset.protocol
      : Object.values(PROTOCOLS).includes(source.protocol)
        ? source.protocol
        : preset.protocol;

    const rawBaseUrl = !isCustom
      ? preset.baseUrl
      : typeof source.aiBaseUrl === "string" && source.aiBaseUrl.trim()
        ? source.aiBaseUrl.trim()
        : preset.baseUrl;
    const rawModel =
      typeof source.aiModel === "string" && source.aiModel.trim()
        ? source.aiModel.trim()
        : preset.model;
    // 整理不通过就原样保留，让设置页把错误指出来，而不是悄悄改回默认值。
    const checked = validateBaseUrl(rawBaseUrl, protocol);

    return {
      presetId: preset.id,
      protocol,
      aiApiKey: typeof source.aiApiKey === "string" ? source.aiApiKey.trim() : "",
      aiBaseUrl: checked.ok ? checked.url : rawBaseUrl,
      aiModel: rawModel.slice(0, 200),
      // 模型列表来自用户主动拉取，只保存在本机，供设置页下次打开时继续选择。
      availableModels: normalizeAvailableModels(source.availableModels),
      aiConcurrency: clampNumber(source.aiConcurrency, LIMITS.concurrency),
      aiTimeoutSeconds: clampNumber(source.aiTimeoutSeconds, LIMITS.timeoutSeconds),
      subtitleLangPreference: normalizeLangPreference(source.subtitleLangPreference),
    };
  }

  // 配置是否足以发起一次请求。设置页和 background 共用同一套判断。
  function validate(settings) {
    const normalized = normalize(settings);
    const errors = [];
    if (!normalized.aiApiKey && !isLocalBaseUrl(normalized.aiBaseUrl)) {
      errors.push("请填写 API 密钥。");
    }
    const base = validateBaseUrl(normalized.aiBaseUrl, normalized.protocol);
    if (!base.ok) errors.push(base.error);
    if (!normalized.aiModel) errors.push("请填写模型名，或点「拉取模型列表」选一个。");
    return { ok: errors.length === 0, errors, settings: normalized };
  }

  /**
   * 应用级配置把两个完整 provider 档案和全局执行参数分开保存。
   * 旧版只有一套扁平配置；首次读取时自动把它迁到 primaryProvider。
   */
  function normalizeAppSettings(input = {}) {
    const source = input && typeof input === "object" ? input : {};
    const hasProviderRoutes = !!(source.primaryProvider || source.backupProvider);
    const primarySource = hasProviderRoutes ? source.primaryProvider : source;
    const backupSource = hasProviderRoutes
      ? source.backupProvider
      : { presetId: "openai", aiApiKey: "", aiModel: "" };
    const primaryProvider = normalize(primarySource || {});
    const backupProvider = normalize(backupSource || {});

    return {
      primaryProvider,
      backupProvider,
      failoverEnabled: Boolean(source.failoverEnabled),
      aiConcurrency: clampNumber(
        source.aiConcurrency ?? primarySource?.aiConcurrency,
        LIMITS.concurrency,
      ),
      aiTimeoutSeconds: clampNumber(
        source.aiTimeoutSeconds ?? primarySource?.aiTimeoutSeconds,
        LIMITS.timeoutSeconds,
      ),
      subtitleLangPreference: normalizeLangPreference(
        source.subtitleLangPreference ?? primarySource?.subtitleLangPreference,
      ),
      supadataApiKey:
        typeof source.supadataApiKey === "string"
          ? source.supadataApiKey.trim()
          : "",
      // 老版本没有适用范围字段；只有显式保存为 false 才关闭，升级后仍默认全开。
      youtubeEnabled: source.youtubeEnabled !== false,
      bilibiliEnabled: source.bilibiliEnabled !== false,
      uiLanguage: source.uiLanguage === "en" ? "en" : "zh-CN",
      overviewPrompts: normalizeOverviewPrompts(source.overviewPrompts),
    };
  }

  function providerFingerprint(provider) {
    const normalized = normalize(provider);
    return `${normalized.protocol}|${normalized.aiBaseUrl}|${normalized.aiModel}`;
  }

  function validateAppSettings(input = {}) {
    const settings = normalizeAppSettings(input);
    const primary = validate(settings.primaryProvider);
    const errors = primary.errors.map((error) => `主服务：${error}`);
    let backup = { ok: true, errors: [], settings: settings.backupProvider };

    if (settings.failoverEnabled) {
      backup = validate(settings.backupProvider);
      errors.push(...backup.errors.map((error) => `备用服务：${error}`));
      if (
        primary.ok &&
        backup.ok &&
        providerFingerprint(primary.settings) === providerFingerprint(backup.settings)
      ) {
        errors.push("主服务和备用服务不能使用完全相同的地址与模型。");
      }
    }

    return {
      ok: errors.length === 0,
      errors,
      settings,
      primary,
      backup,
    };
  }

  function activeProviders(input = {}) {
    const settings = normalizeAppSettings(input);
    const providers = [
      { role: "primary", label: "主服务", settings: settings.primaryProvider },
    ];
    if (settings.failoverEnabled) {
      providers.push({
        role: "backup",
        label: "备用服务",
        settings: settings.backupProvider,
      });
    }
    return providers;
  }

  // 本地推理服务通常不校验密钥，不该因为密钥为空就拦下来。
  function isLocalBaseUrl(baseUrl) {
    try {
      return LOCAL_HOSTS.has(new URL(String(baseUrl)).hostname);
    } catch (error) {
      return false;
    }
  }

  return {
    STORAGE_KEY,
    LEGACY_STORAGE_KEY,
    PROTOCOLS,
    PRESETS,
    CUSTOM_PRESET_ID,
    DEFAULTS,
    APP_DEFAULTS,
    DEFAULT_OVERVIEW_PROMPTS,
    LIMITS,
    normalize,
    normalizeAppSettings,
    normalizeLangPreference,
    normalizeOverviewPrompts,
    validate,
    validateAppSettings,
    providerFingerprint,
    activeProviders,
    validateBaseUrl,
    isLocalBaseUrl,
    originOf,
    presetById,
    chatCompletionsUrl,
    modelsUrl,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = BILI_SETTINGS;
}
