/** 有序 AI Provider 的纯路由策略，网络调用由 background.js 执行。 */
var VIDEO_PROVIDER_ROUTER = (() => {
  const RECOVERABLE_CODES = new Set([
    "AI_NETWORK_ERROR",
    "AI_IDLE_TIMEOUT",
    "AI_HARD_TIMEOUT",
    "EMPTY_AI_RESPONSE",
  ]);
  const RECOVERABLE_STATUSES = new Set([408, 409, 425, 429]);

  function isRecoverable(error) {
    if (RECOVERABLE_CODES.has(error?.code)) return true;
    const status = Number(error?.status) || 0;
    return RECOVERABLE_STATUSES.has(status) || status >= 500;
  }

  function shouldFailOver(...args) {
    // 新列表调用只传 error；保留旧三个参数签名，兼容已加载的旧页面与测试。
    if (args.length === 1) return isRecoverable(args[0]);
    const [role, enabled, error] = args;
    return role === "primary" && Boolean(enabled) && isRecoverable(error);
  }

  function routeOrder(providers) {
    // 配置顺序就是执行顺序，不在 worker 内维护额外的主服务熔断状态。
    return Array.isArray(providers) ? [...providers] : [];
  }

  return {
    RECOVERABLE_CODES,
    RECOVERABLE_STATUSES,
    isRecoverable,
    shouldFailOver,
    routeOrder,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = VIDEO_PROVIDER_ROUTER;
}
