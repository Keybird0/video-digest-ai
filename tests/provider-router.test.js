const test = require("node:test");
const assert = require("node:assert/strict");

const router = require("../lib/provider-router.js");

test("网络、超时、限流和 5xx 会触发有序列表回退", () => {
  for (const error of [
    { code: "AI_NETWORK_ERROR" },
    { code: "AI_HARD_TIMEOUT" },
    { code: "EMPTY_AI_RESPONSE" },
    { status: 429 },
    { status: 503 },
  ]) {
    assert.equal(router.shouldFailOver(error), true);
  }
});

test("认证、模型、请求格式与权限错误不会盲目切下一项", () => {
  for (const error of [
    { status: 400 },
    { status: 401 },
    { status: 403 },
    { status: 404 },
    { code: "NEED_HOST_PERMISSION" },
    { code: "NO_AI_CONFIG" },
  ]) {
    assert.equal(router.shouldFailOver(error), false);
  }
  // 兼容旧主备调用签名，已保存的旧页面不会因此出现行为变化。
  assert.equal(router.shouldFailOver("backup", true, { status: 503 }), false);
  assert.equal(router.shouldFailOver("primary", false, { status: 503 }), false);
});

test("路由严格保留用户保存的 Provider 顺序", () => {
  const providers = [{ id: "ai-3" }, { id: "ai-1" }, { id: "ai-2" }];
  assert.deepEqual(router.routeOrder(providers), providers);
  assert.deepEqual(router.routeOrder(null), []);
});
