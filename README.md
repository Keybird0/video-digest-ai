# Video Digest AI

一个同时支持 YouTube 与 Bilibili 的 Chrome 侧边栏扩展。它把平台字幕整理成可搜索、可跳转的学习材料，并提供自动中英互译、AI 章节概览、视频问答、划词解释和时间戳笔记。

项目基于以下两个 MIT 项目合并与泛化：

- [youtube-digest](https://github.com/zarazhangrui/youtube-digest)
- [bilibili-digest](https://github.com/biuworks/bilibili-digest)

## 支持范围

- YouTube：标准 `youtube.com/watch` 页面；支持 Supadata、Captapi、TranscriptFetch 和 TranscriptAPI。可配置多个服务商，按设置页从上到下的顺序回退。
- Bilibili：普通视频、合集和分P；通过 Bilibili 官方接口与 WBI 签名读取当前登录会话可见的字幕。
- 不支持 Shorts、直播、番剧影视页和受限视频。四个 YouTube 字幕服务都只读取已发布字幕；没有可用字幕时会按顺序继续尝试下一项。

## 功能

- 原文、译文、双语三种字幕视图；中文字幕译英文，其他语言译中文。
- 跟随播放高亮、点击时间戳跳转、全文搜索、复制和 TXT 导出。
- Bilibili AI 中文字幕可用“顺句”补标点、修正常见同音错字。
- 长视频分块并发生成章节和金句，部分分块失败时保留已完成结果。
- “问 AI”支持自由连续问答；有字幕或概览时自动结合视频上下文，并可将回答一键转为带时间戳笔记。
- “问 AI”回答支持安全 Markdown 渲染；概览提示词可直接在侧边栏调整、自动保存并恢复默认。
- “手记”支持随时输入并保存文字；在视频页记录时会同时保存视频标题和当前播放位置的访问锚点。
- “AI 记”单独收纳从问答中保存的内容；无论是否打开视频，AI 回答都能一键保存。
- 划词解释；播放器按钮或 `n` 快捷键保存时间戳笔记。
- 两站的 Digest 按钮统一使用海蓝色，Note 在播放器上保持白色高对比文字；设置页可分别开关 YouTube 与 Bilibili，默认全开。
- 缓存和笔记按站点、视频与分P隔离，全部保存在本机。

## 主备 AI Provider

设置页可以同时配置主服务和备用服务。两套配置分别保存服务商、协议、Base URL、API Key 与模型，并可独立拉取模型列表、申请域名权限和测试连接。已拉取的模型列表会随 Provider 配置保存在本机，下次打开设置仍可从完整列表选择；DeepSeek 默认使用 `deepseek-v4-flash`，也可直接覆盖为其他模型 ID。

主服务遇到以下可恢复故障时自动切换备用服务：

- 网络连接失败、响应中断或请求超时
- HTTP `408`、`409`、`425`、`429`
- HTTP `5xx`
- Provider 返回空内容且内部自愈重试仍失败

切换后主服务会在当前 service worker 生命周期内熔断60秒，避免长视频的每个分块重复撞击故障服务。`400/401/403/404`、缺少域名授权、模型名错误和配置不完整不会触发备用服务，以免掩盖需要用户修正的配置问题。

内置常见服务商预设，包括 DeepSeek、OpenAI、Claude、Gemini、Kimi、GLM、通义千问、火山方舟 Agent Plan、SiliconFlow、OpenRouter 和 Ollama；也支持 OpenAI 兼容接口、Anthropic 原生协议和自定义服务。火山方舟预设使用 Agent Plan 专用的 `/api/plan/v3`，普通按量 API 或 Coding Plan 可通过“自定义”填写各自的 Base URL。远程地址必须使用 HTTPS；HTTP 只允许 localhost 与 127.0.0.1。

## YouTube 字幕服务商

设置页默认提供一个 Supadata 项，可通过“添加字幕服务商”继续添加 Captapi、TranscriptFetch 或 TranscriptAPI。填写各自的 API Key 后，可用“上移 / 下移”调整顺序；请求按从上到下的顺序执行，只有前一项失败才尝试后一项。密钥仅保存在 `chrome.storage.local`，并且仅发送至所属服务商域名。

- [Supadata](https://docs.supadata.ai/get-transcript)：扩展固定使用 `mode=native`，只取已有字幕。
- [Captapi](https://captapi.com/how-to/youtube-transcript)：返回 YouTube 已发布的带时间戳字幕。
- [TranscriptFetch](https://transcriptfetch.com/docs/endpoints)：扩展固定使用 `captions` 模式，只取已有字幕。
- [TranscriptAPI](https://transcriptapi.com/docs/api/)：返回带时间戳的 YouTube 字幕，并支持服务端语言优先级。

扩展会缓存已获取的字幕；缓存命中不会重新请求，手动“重新获取字幕”可能再次消耗服务商额度。套餐、额度和计费规则会变化，请以设置页每个服务商提供的官方文档和控制台说明为准。

## 本地安装

需要 Chrome 116 或更高版本。

1. 运行 `npm test`。
2. 运行 `npm run package`，得到 `dist/video-digest-ai-<version>.zip`。
3. 解压 ZIP，打开 `chrome://extensions`。
4. 开启开发者模式，选择“加载已解压的扩展程序”，选中解压目录。
5. 在自动打开的设置页配置至少一个 YouTube 字幕服务商、主 Provider，并按需启用备用 Provider 或调整“适用范围”。

所有密钥只写入 `chrome.storage.local`。扩展没有后端、账户、分析、广告或遥测。

## 开发检查

```bash
npm test
npm run package
```

自动化测试覆盖字幕解析、Bilibili WBI、YouTube native 请求、缓存隔离、AI 响应校验、主备路由、DOM 注入和侧边栏交互。真实字幕与模型服务仍需在 Chrome 中使用自己的密钥手工验证。

## 许可与致谢

[MIT](LICENSE)。保留两个上游项目的版权和提示词来源说明；详见 `LICENSE` 与 `prompts/`。
