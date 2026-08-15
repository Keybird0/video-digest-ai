const test = require("node:test");
const assert = require("node:assert/strict");

const router = require("../lib/provider-router.js");

test("网络、超时、限流和 5xx 会触发主备切换", () => {
  for (const error of [
    { code: "AI_NETWORK_ERROR" },
    { code: "AI_HARD_TIMEOUT" },
    { code: "EMPTY_AI_RESPONSE" },
    { status: 429 },
    { status: 503 },
  ]) {
    assert.equal(router.shouldFailOver("primary", true, error), true);
  }
});

test("认证、模型、请求格式与权限错误不会盲目切备用", () => {
  for (const error of [
    { status: 400 },
    { status: 401 },
    { status: 403 },
    { status: 404 },
    { code: "NEED_HOST_PERMISSION" },
    { code: "NO_AI_CONFIG" },
  ]) {
    assert.equal(router.shouldFailOver("primary", true, error), false);
  }
  assert.equal(router.shouldFailOver("backup", true, { status: 503 }), false);
  assert.equal(router.shouldFailOver("primary", false, { status: 503 }), false);
});

test("主服务熔断期间直接路由到备用服务", () => {
  const providers = [{ role: "primary" }, { role: "backup" }];
  assert.deepEqual(
    router.routeOrder(providers, { now: 100, primaryUnavailableUntil: 200 }),
    [{ role: "backup" }],
  );
  assert.deepEqual(
    router.routeOrder(providers, { now: 200, primaryUnavailableUntil: 200 }),
    providers,
  );
  assert.deepEqual(
    router.routeOrder([{ role: "primary" }], {
      now: 100,
      primaryUnavailableUntil: 200,
    }),
    [{ role: "primary" }],
  );
});
