#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

for file in background.js content-bilibili.js content-youtube.js options.js settings.js sidepanel.js lib/*.js; do
  node --check "$file"
done

node - <<'NODE'
const fs = require("fs");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
if (manifest.manifest_version !== 3) throw new Error("manifest_version 必须是 3");
const referenced = [
  manifest.background?.service_worker,
  manifest.side_panel?.default_path,
  manifest.options_ui?.page,
  ...(manifest.content_scripts || []).flatMap((entry) => entry.js || []),
  ...Object.values(manifest.action?.default_icon || {}),
  ...Object.values(manifest.icons || {}),
].filter(Boolean);
for (const file of referenced) {
  if (!fs.existsSync(file)) throw new Error(`manifest 引用了不存在的文件：${file}`);
}
for (const host of manifest.host_permissions || []) {
  if (!host.startsWith("https://")) throw new Error(`固定权限不得使用明文 HTTP：${host}`);
}
NODE

if rg -n --glob '!tests/**' --glob '!README.md' --glob '!PRIVACY.md' \
  '(sk-[A-Za-z0-9_-]{16,}|AIza[A-Za-z0-9_-]{20,})' .; then
  echo "检测到疑似硬编码密钥" >&2
  exit 1
fi

echo "静态检查通过"
