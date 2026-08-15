/** Video Digest AI — 双 Provider 设置、授权与连通性测试。 */

"use strict";

const EN_TEXT = Object.freeze({
  "设置": "Settings",
  "界面语言": "Interface language",
  "适用范围": "Site availability",
  "默认同时在 YouTube 与 Bilibili 启用；关闭后，该网站不再显示 Digest 和 Note 按钮。": "Enabled for both YouTube and Bilibili by default. Disable a site to hide its Digest and Note buttons.",
  "标准视频播放页": "Standard watch pages",
  "普通视频、合集与分P": "Videos, collections, and multi-part pages",
  "修改后自动保存，并同步到已打开的视频页。": "Changes are saved automatically and applied to open video pages.",
  "适用范围已保存": "Site availability saved",
  "字幕服务": "Caption service",
  "Bilibili 字幕直接读取平台接口；YouTube 原生字幕通过 Supadata 获取，不下载音频，也不做语音转写。": "Bilibili captions are read from the platform API. Native YouTube captions are fetched through Supadata; audio is never downloaded or transcribed.",
  "用于 YouTube 原生字幕": "For native YouTube captions",
  "只保存在本机扩展存储，并只发送给 api.supadata.ai。": "Stored only in local extension storage and sent only to api.supadata.ai.",
  "保存": "Save",
  "字幕服务密钥已保存": "Caption service key saved",
  "如何申请 API Key": "How to get an API key",
  "打开 Supadata 控制台 ↗": "Open Supadata dashboard ↗",
  "注册或登录 Supadata；免费档不要求绑定信用卡。": "Sign up or sign in to Supadata; the free plan does not require a credit card.",
  "进入控制台的 API Keys 页面，创建并复制一个 Key。": "Open API Keys in the dashboard, then create and copy a key.",
  "粘贴到上方输入框，然后点击页面底部的保存按钮。": "Paste it above, then use the save button at the bottom of this page.",
  "免费额度与使用限制": "Free quota and usage limits",
  "官方规则 · 2026-08 查询": "Official rules · checked 2026-08",
  "免费档为每月 100 credits、限速 1 次/秒；没有单独的每日固定次数。": "The free plan includes 100 credits per month at 1 request/second; there is no separate fixed daily quota.",
  "本扩展只请求原生字幕：一次成功查询通常消耗 1 credit；字幕不可用的 206 响应也消耗 1 credit。": "This extension requests native captions only: a successful lookup normally costs 1 credit, and a 206 Transcript Unavailable response also costs 1 credit.",
  "额度不会结转到下月；用完后需等待额度刷新或升级套餐。缓存命中不会重新请求，手动“重新获取字幕”可能再次计费。": "Credits do not roll over. After the quota is exhausted, wait for renewal or upgrade. Cache hits make no new request; manually refreshing captions may be billed again.",
  "仅支持公开、已结束且有平台字幕的视频；私密、登录/年龄/地区受限视频和直播可能无法获取。": "Only public, completed videos with platform captions are supported. Private, sign-in/age/region-restricted videos and live streams may be unavailable.",
  "套餐、额度和计费规则可能调整，请以": "Plans, quotas, and billing may change. Always check the live",
  "官方定价页": "pricing page",
  "与": "and",
  "字幕 API 文档": "Transcript API documentation",
  "的实时说明为准。": "for the latest rules.",
  "AI 服务": "AI services",
  "主服务处理所有请求；遇到网络中断、超时、限流或服务端故障时，自动切换到备用服务。": "The primary handles all requests. Network failures, timeouts, rate limits, or server failures automatically switch to the backup.",
  "启用备用服务": "Enable backup",
  "主服务": "Primary",
  "备用服务": "Backup",
  "未测试": "Not tested",
  "正常情况下优先使用。请配置稳定、额度充足的模型。": "Used first under normal conditions. Choose a stable model with sufficient quota.",
  "主服务发生可恢复故障时接管后续请求，避免长视频任务整体失败。": "Takes over after a recoverable primary failure so a long-video task can continue.",
  "服务商": "Provider",
  "API 协议": "API protocol",
  "OpenAI 兼容": "OpenAI-compatible",
  "API 地址（base_url）": "API base URL",
  "自动拼接": "The endpoint is appended automatically:",
  "；明文 HTTP 仅允许本机。": "; plain HTTP is allowed only for localhost.",
  "本地模型可以留空。": "Optional for local models.",
  "请使用与主服务独立的凭据和额度。": "Use credentials and quota independent from the primary.",
  "模型": "Model",
  "模型名": "Model name",
  "选择主服务模型": "Choose primary model",
  "选择备用服务模型": "Choose backup model",
  "选择已获取的模型": "Choose a fetched model",
  "拉取模型": "Fetch models",
  "可手动填写，或从服务端拉取。": "Enter one manually or fetch it from the provider.",
  "DeepSeek 默认模型：deepseek-v4-flash，可直接保存或改为其他模型。": "DeepSeek default: deepseek-v4-flash. Save it as-is or choose another model.",
  "测试主服务": "Test primary",
  "测试备用服务": "Test backup",
  "并发数": "Concurrency",
  "两个 Provider 共用此并发上限，默认 3。": "Both providers share this limit; default: 3.",
  "单次请求超时（秒）": "Request timeout (seconds)",
  "主服务超时后会尝试备用服务。": "The backup is tried after a primary timeout.",
  "保存并授权两个服务": "Save and authorize providers",
  "保存时 Chrome 会一次性请求当前启用的 Provider 域名权限。仅在网络错误、超时、HTTP 408/409/425/429 或 5xx 时切换；密钥错误、模型错误和请求格式错误不会自动转到备用服务。": "Chrome requests host access for all enabled providers in one step. Failover occurs only for network errors, timeouts, HTTP 408/409/425/429, or 5xx responses; key, model, and request-format errors never trigger it.",
  "获取密钥 →": "Get API key →",
  "正在拉取模型…": "Fetching models…",
  "服务没有返回模型列表，请手动填写。": "The provider returned no models; enter one manually.",
  "模型列表已更新": "Model list updated",
  "配置不完整": "Incomplete",
  "正在测试…": "Testing…",
  "连接正常": "Healthy",
  "连接失败": "Failed",
  "需要授权才能访问该地址。": "Host permission is required for this address.",
  "API 地址不合法。": "The API URL is invalid.",
  "没有获得所有已启用 Provider 的域名权限。": "Host permission was not granted for every enabled provider.",
  "主备配置已保存并授权": "Primary and backup saved and authorized",
  "请填写 API 地址。": "Enter an API URL.",
  "API 地址不是合法的 URL。": "The API URL is invalid.",
  "API 地址必须以 http:// 或 https:// 开头。": "The API URL must start with http:// or https://.",
  "只有本机地址允许用 http，其余请用 https，否则密钥会明文传输。": "HTTP is allowed only for localhost; use HTTPS elsewhere to protect the API key.",
  "请填写 API 密钥。": "Enter an API key.",
  "请填写模型名，或点「拉取模型列表」选一个。": "Enter a model name or choose one with Fetch models.",
  "主服务和备用服务不能使用完全相同的地址与模型。": "Primary and backup cannot use the same URL and model.",
  "自定义": "Custom",
  "Google Gemini（OpenAI 兼容端点）": "Google Gemini (OpenAI-compatible endpoint)",
  "月之暗面 Kimi": "Moonshot Kimi",
  "智谱 GLM": "Zhipu GLM",
  "阿里云百炼（通义千问）": "Alibaba Cloud Model Studio (Qwen)",
  "火山方舟（Agent Plan）": "Volcengine Ark (Agent Plan)",
  "硅基流动 SiliconFlow": "SiliconFlow",
  "本地 Ollama": "Local Ollama",
});

const ZH_TEXT = Object.freeze(
  Object.fromEntries(Object.entries(EN_TEXT).map(([zh, en]) => [en, zh])),
);

function translateText(text) {
  const value = String(text ?? "");
  const dictionary = uiLanguage === "en" ? EN_TEXT : ZH_TEXT;
  if (dictionary[value]) return dictionary[value];

  const replacements = uiLanguage === "en"
    ? [
        [/^已获取 (\d+) 个模型。$/, "Fetched $1 models."],
        [/^模型回复：/, "Model reply: "],
        [/^拉取失败：/, "Fetch failed: "],
        [/^测试失败：/, "Test failed: "],
        [/^保存失败：/, "Save failed: "],
        [/^备用服务：/, "Backup: "],
      ]
    : [
        [/^Fetched (\d+) models\.$/, "已获取 $1 个模型。"],
        [/^Model reply: /, "模型回复："],
        [/^Fetch failed: /, "拉取失败："],
        [/^Test failed: /, "测试失败："],
        [/^Save failed: /, "保存失败："],
        [/^Backup: /, "备用服务："],
      ];
  return replacements.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), value);
}

function applyPageLanguage() {
  document.documentElement.lang = uiLanguage;
  document.title = uiLanguage === "en" ? "Video Digest AI Settings" : "Video Digest AI 设置";

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const match = node.nodeValue.match(/^(\s*)(.*?)(\s*)$/s);
    if (!match?.[2]) continue;
    node.nodeValue = `${match[1]}${translateText(match[2])}${match[3]}`;
  }
  for (const element of document.querySelectorAll("[placeholder], [title], [aria-label]")) {
    for (const attribute of ["placeholder", "title", "aria-label"]) {
      if (element.hasAttribute(attribute)) {
        element.setAttribute(attribute, translateText(element.getAttribute(attribute)));
      }
    }
  }
  for (const button of document.querySelectorAll("[data-language]")) {
    button.setAttribute("aria-pressed", String(button.dataset.language === uiLanguage));
  }
}

// 普通浏览器直接打开 options.html 时使用内存桩，方便本地预览；扩展环境始终使用 chrome API。
const chromeApi = globalThis.chrome?.storage?.local ? globalThis.chrome : {
  storage: {
    local: {
      async get() {
        return {};
      },
      async set() {},
    },
  },
  permissions: {
    async contains() {
      return false;
    },
    async request() {
      return true;
    },
  },
};

const storageKey = BILI_SETTINGS.STORAGE_KEY;
const globalStatus = document.getElementById("globalStatus");
const failoverEnabled = document.getElementById("failoverEnabled");
const youtubeEnabled = document.getElementById("youtubeEnabled");
const bilibiliEnabled = document.getElementById("bilibiliEnabled");
const siteScopeStatus = document.getElementById("siteScopeStatus");
const supadataApiKey = document.getElementById("supadataApiKey");
const supadataStatus = document.getElementById("supadataStatus");
const aiConcurrency = document.getElementById("aiConcurrency");
const aiTimeoutSeconds = document.getElementById("aiTimeoutSeconds");
let uiLanguage = "zh-CN";
let overviewPrompts = BILI_SETTINGS.normalizeOverviewPrompts();

const cards = Object.fromEntries(
  [...document.querySelectorAll("[data-provider-role]")].map((root) => {
    const field = (name) => root.querySelector(`[data-field="${name}"]`);
    return [
      root.dataset.providerRole,
      {
        root,
        field,
        preset: field("preset"),
        protocol: field("protocol"),
        baseUrl: field("baseUrl"),
        apiKey: field("apiKey"),
        model: field("model"),
        customFields: field("customFields"),
        presetHint: field("presetHint"),
        endpointPreview: field("endpointPreview"),
        modelOptions: field("modelOptions"),
        modelsHint: field("modelsHint"),
        health: field("health"),
        status: field("status"),
      },
    ];
  }),
);

const statusTimers = new WeakMap();

function showStatus(element, text, { sticky = false, error = false } = {}) {
  element.textContent = translateText(text);
  element.style.color = error ? "#d74747" : "";
  clearTimeout(statusTimers.get(element));
  if (!sticky) {
    statusTimers.set(
      element,
      setTimeout(() => {
        element.textContent = "";
        element.style.color = "";
      }, 5000),
    );
  }
}

function fillPresets(card) {
  card.preset.textContent = "";
  for (const preset of BILI_SETTINGS.PRESETS) {
    const option = document.createElement("option");
    option.value = preset.id;
    option.textContent = translateText(preset.label);
    card.preset.appendChild(option);
  }
}

function isCustom(card) {
  return card.preset.value === BILI_SETTINGS.CUSTOM_PRESET_ID;
}

function updateEndpoint(card) {
  card.endpointPreview.textContent =
    card.protocol.value === BILI_SETTINGS.PROTOCOLS.ANTHROPIC
      ? "/v1/messages"
      : "/chat/completions";
}

function updatePresetHint(card, preset) {
  card.presetHint.textContent = "";
  if (!preset?.docsUrl) return;
  const link = document.createElement("a");
  link.href = preset.docsUrl;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = translateText("获取密钥 →");
  card.presetHint.appendChild(link);
}

function modelOptionValues(card) {
  return [...card.modelOptions.options]
    .map((option) => option.value)
    .filter(Boolean);
}

function setModelOptions(card, input, { showCount = false } = {}) {
  const preset = BILI_SETTINGS.presetById(card.preset.value);
  const current = card.model.value.trim();
  const models = [
    ...new Set(
      [
        "deepseek-v4-flash",
        "gpt-5.6-terra",
        preset?.model,
        current,
        ...(Array.isArray(input) ? input : []),
      ]
        .filter((model) => typeof model === "string" && model.trim())
        .map((model) => model.trim()),
    ),
  ];

  card.modelOptions.textContent = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = translateText("选择已获取的模型");
  card.modelOptions.appendChild(placeholder);
  for (const id of models) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = id;
    card.modelOptions.appendChild(option);
  }
  card.modelOptions.value = models.includes(current) ? current : "";

  if (showCount && input.length) {
    card.modelsHint.textContent = `已获取 ${input.length} 个模型。`;
  } else if (preset?.id === "deepseek" && current === preset.model) {
    card.modelsHint.textContent = translateText(
      "DeepSeek 默认模型：deepseek-v4-flash，可直接保存或改为其他模型。",
    );
  } else {
    card.modelsHint.textContent = translateText(
      "内置 deepseek-v4-flash 与 gpt-5.6-terra，也可手动填写或从服务端拉取。",
    );
  }
}

function applyPreset(card, { preserveModel = false } = {}) {
  const preset = BILI_SETTINGS.presetById(card.preset.value);
  if (!preset) return;
  if (preset.id !== BILI_SETTINGS.CUSTOM_PRESET_ID) {
    card.protocol.value = preset.protocol;
    card.baseUrl.value = preset.baseUrl;
    if (!preserveModel) card.model.value = preset.model;
  }
  card.customFields.hidden = !isCustom(card);
  setModelOptions(card, []);
  updatePresetHint(card, preset);
  updateEndpoint(card);
  setHealth(card, "未测试", "");
}

function readProvider(card) {
  return BILI_SETTINGS.normalize({
    presetId: card.preset.value,
    protocol: isCustom(card) ? card.protocol.value : undefined,
    aiBaseUrl: isCustom(card) ? card.baseUrl.value : undefined,
    aiApiKey: card.apiKey.value,
    aiModel: card.model.value,
    availableModels: modelOptionValues(card),
  });
}

function writeProvider(card, provider) {
  const settings = BILI_SETTINGS.normalize(provider);
  card.preset.value = settings.presetId;
  card.protocol.value = settings.protocol;
  card.baseUrl.value = settings.aiBaseUrl;
  card.apiKey.value = settings.aiApiKey;
  card.model.value = settings.aiModel;
  applyPreset(card, { preserveModel: true });
  card.baseUrl.value = settings.aiBaseUrl;
  setModelOptions(card, settings.availableModels, {
    showCount: settings.availableModels.length > 0,
  });
}

function currentAppSettings() {
  return BILI_SETTINGS.normalizeAppSettings({
    primaryProvider: readProvider(cards.primary),
    backupProvider: readProvider(cards.backup),
    failoverEnabled: failoverEnabled.checked,
    aiConcurrency: aiConcurrency.value,
    aiTimeoutSeconds: aiTimeoutSeconds.value,
    supadataApiKey: supadataApiKey.value,
    youtubeEnabled: youtubeEnabled.checked,
    bilibiliEnabled: bilibiliEnabled.checked,
    uiLanguage,
    overviewPrompts,
  });
}

async function notifySiteScopeChanged(settings) {
  try {
    await chromeApi.runtime?.sendMessage?.({
      action: "notifySiteScopeChanged",
      youtubeEnabled: settings.youtubeEnabled,
      bilibiliEnabled: settings.bilibiliEnabled,
    });
  } catch (error) {
    // 存储已成功；某个页面尚未加载内容脚本时广播失败不影响下次打开页面。
  }
}

function setHealth(card, text, state) {
  card.health.textContent = translateText(text);
  card.health.classList.toggle("ok", state === "ok");
  card.health.classList.toggle("error", state === "error");
}

function syncBackupState() {
  cards.backup.root.setAttribute(
    "aria-disabled",
    failoverEnabled.checked ? "false" : "true",
  );
}

async function ensurePermissionInteractive(provider) {
  const origin = BILI_SETTINGS.originOf(provider.aiBaseUrl);
  if (!origin) throw new Error("API 地址不合法。");
  if (await chromeApi.permissions.contains({ origins: [origin] })) return true;
  return chromeApi.permissions.request({ origins: [origin] });
}

async function fetchModels(card) {
  const provider = readProvider(card);
  const check = BILI_SETTINGS.validate(provider);
  const baseErrors = check.errors.filter((error) => !error.includes("模型名"));
  if (baseErrors.length) {
    showStatus(card.status, baseErrors.join(" "), { sticky: true, error: true });
    return;
  }

  try {
    if (!(await ensurePermissionInteractive(provider))) {
      throw new Error("需要授权才能访问该地址。");
    }
    showStatus(card.status, "正在拉取模型…", { sticky: true });
    const request = BILI_AI_PROVIDER.buildModelsRequest(provider);
    const response = await fetch(request.url, { headers: request.headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(BILI_AI_PROVIDER.parseErrorMessage(data, response.status));
    }
    const models = BILI_AI_PROVIDER.parseModelsResponse(data);
    if (!models.length) throw new Error("服务没有返回模型列表，请手动填写。");
    setModelOptions(card, models, { showCount: true });
    if (!card.model.value) card.model.value = models[0];
    card.modelOptions.value = card.model.value;
    showStatus(card.status, "模型列表已更新");
  } catch (error) {
    showStatus(card.status, `拉取失败：${error.message}`, {
      sticky: true,
      error: true,
    });
  }
}

async function testProvider(card) {
  const provider = readProvider(card);
  const check = BILI_SETTINGS.validate(provider);
  if (!check.ok) {
    showStatus(card.status, check.errors.join(" "), { sticky: true, error: true });
    setHealth(card, "配置不完整", "error");
    return;
  }

  try {
    if (!(await ensurePermissionInteractive(provider))) {
      throw new Error("需要授权才能访问该地址。");
    }
    showStatus(card.status, "正在测试…", { sticky: true });
    const request = BILI_AI_PROVIDER.buildChatRequest({
      settings: provider,
      messages: [{ role: "user", content: "回复两个字：可用" }],
      maxTokens: 32,
    });
    const response = await fetch(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(request.body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(BILI_AI_PROVIDER.parseErrorMessage(data, response.status));
    }
    const text = BILI_AI_PROVIDER.parseChatResponse(provider.protocol, data).trim();
    setHealth(card, "连接正常", "ok");
    showStatus(card.status, text ? `模型回复：${text.slice(0, 30)}` : "连接正常");
  } catch (error) {
    setHealth(card, "连接失败", "error");
    showStatus(card.status, `测试失败：${error.message}`, {
      sticky: true,
      error: true,
    });
  }
}

async function save() {
  const appSettings = currentAppSettings();
  const check = BILI_SETTINGS.validateAppSettings(appSettings);
  if (!check.ok) {
    showStatus(globalStatus, check.errors.join(" "), {
      sticky: true,
      error: true,
    });
    return;
  }

  const origins = [
    ...new Set(
      BILI_SETTINGS.activeProviders(appSettings)
        .map(({ settings }) => BILI_SETTINGS.originOf(settings.aiBaseUrl))
        .filter(Boolean),
    ),
  ];

  try {
    // 一次请求两个 origin，确保仍在同一个用户点击手势里。
    const granted = await chromeApi.permissions.request({ origins });
    if (!granted) throw new Error("没有获得所有已启用 Provider 的域名权限。");
    await chromeApi.storage.local.set({ [storageKey]: appSettings });
    await notifySiteScopeChanged(appSettings);
    aiConcurrency.value = appSettings.aiConcurrency;
    aiTimeoutSeconds.value = appSettings.aiTimeoutSeconds;
    showStatus(globalStatus, "主备配置已保存并授权");
  } catch (error) {
    showStatus(globalStatus, `保存失败：${error.message}`, {
      sticky: true,
      error: true,
    });
  }
}

async function saveSiteScope() {
  youtubeEnabled.disabled = true;
  bilibiliEnabled.disabled = true;
  try {
    const stored = await chromeApi.storage.local.get([
      storageKey,
      BILI_SETTINGS.LEGACY_STORAGE_KEY,
    ]);
    const settings = BILI_SETTINGS.normalizeAppSettings(
      stored[storageKey] ?? stored[BILI_SETTINGS.LEGACY_STORAGE_KEY],
    );
    const next = BILI_SETTINGS.normalizeAppSettings({
      ...settings,
      youtubeEnabled: youtubeEnabled.checked,
      bilibiliEnabled: bilibiliEnabled.checked,
    });
    await chromeApi.storage.local.set({ [storageKey]: next });
    await notifySiteScopeChanged(next);
    showStatus(siteScopeStatus, "适用范围已保存");
  } catch (error) {
    showStatus(siteScopeStatus, `保存失败：${error.message}`, {
      sticky: true,
      error: true,
    });
  } finally {
    youtubeEnabled.disabled = false;
    bilibiliEnabled.disabled = false;
  }
}

async function saveSupadataKey() {
  try {
    const stored = await chromeApi.storage.local.get([
      storageKey,
      BILI_SETTINGS.LEGACY_STORAGE_KEY,
    ]);
    const settings = BILI_SETTINGS.normalizeAppSettings(
      stored[storageKey] ?? stored[BILI_SETTINGS.LEGACY_STORAGE_KEY],
    );
    const next = {
      ...settings,
      supadataApiKey: supadataApiKey.value.trim(),
    };
    await chromeApi.storage.local.set({ [storageKey]: next });
    supadataApiKey.value = next.supadataApiKey;
    showStatus(supadataStatus, "字幕服务密钥已保存");
  } catch (error) {
    showStatus(supadataStatus, `保存失败：${error.message}`, {
      sticky: true,
      error: true,
    });
  }
}

async function load() {
  Object.values(cards).forEach(fillPresets);
  const stored = await chromeApi.storage.local.get([
    storageKey,
    BILI_SETTINGS.LEGACY_STORAGE_KEY,
  ]);
  const settings = BILI_SETTINGS.normalizeAppSettings(
    stored[storageKey] ?? stored[BILI_SETTINGS.LEGACY_STORAGE_KEY],
  );
  writeProvider(cards.primary, settings.primaryProvider);
  writeProvider(cards.backup, settings.backupProvider);
  failoverEnabled.checked = settings.failoverEnabled;
  aiConcurrency.value = settings.aiConcurrency;
  aiTimeoutSeconds.value = settings.aiTimeoutSeconds;
  supadataApiKey.value = settings.supadataApiKey;
  youtubeEnabled.checked = settings.youtubeEnabled;
  bilibiliEnabled.checked = settings.bilibiliEnabled;
  uiLanguage = settings.uiLanguage;
  overviewPrompts = { ...settings.overviewPrompts };
  document.documentElement.lang = uiLanguage;
  applyPageLanguage();
  syncBackupState();
}

for (const card of Object.values(cards)) {
  card.preset.addEventListener("change", () => applyPreset(card));
  card.protocol.addEventListener("change", () => updateEndpoint(card));
  card.model.addEventListener("input", () => {
    card.modelOptions.value = modelOptionValues(card).includes(card.model.value.trim())
      ? card.model.value.trim()
      : "";
  });
  card.modelOptions.addEventListener("change", () => {
    if (!card.modelOptions.value) return;
    card.model.value = card.modelOptions.value;
    setHealth(card, "未测试", "");
  });
  card.root.querySelector('[data-action="models"]').addEventListener("click", () =>
    fetchModels(card),
  );
  card.root.querySelector('[data-action="test"]').addEventListener("click", () =>
    testProvider(card),
  );
}

failoverEnabled.addEventListener("change", syncBackupState);
youtubeEnabled.addEventListener("change", saveSiteScope);
bilibiliEnabled.addEventListener("change", saveSiteScope);
document.getElementById("saveSupadataBtn").addEventListener("click", saveSupadataKey);
document.getElementById("saveBtn").addEventListener("click", save);
for (const button of document.querySelectorAll("[data-language]")) {
  button.addEventListener("click", async () => {
    uiLanguage = button.dataset.language;
    applyPageLanguage();
    const stored = await chromeApi.storage.local.get([
      storageKey,
      BILI_SETTINGS.LEGACY_STORAGE_KEY,
    ]);
    const current = BILI_SETTINGS.normalizeAppSettings(
      stored[storageKey] ?? stored[BILI_SETTINGS.LEGACY_STORAGE_KEY],
    );
    await chromeApi.storage.local.set({
      [storageKey]: { ...current, uiLanguage },
    });
    try {
      await chromeApi.runtime?.sendMessage?.({
        action: "notifyUiLanguageChanged",
        uiLanguage,
      });
    } catch (error) {
      // 设置已经落库；没有打开侧栏时无需广播。
    }
  });
}

load();
