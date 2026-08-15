/** 主备 Provider 的纯路由策略，网络调用由 background.js 执行。 */
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

  function shouldFailOver(role, enabled, error) {
    return role === "primary" && Boolean(enabled) && isRecoverable(error);
  }

  function routeOrder(providers, { now = Date.now(), primaryUnavailableUntil = 0 } = {}) {
    const list = Array.isArray(providers) ? [...providers] : [];
    if (
      now >= Number(primaryUnavailableUntil || 0) ||
      !list.some((provider) => provider?.role === "backup")
    ) {
      return list;
    }
    return list.filter((provider) => provider?.role !== "primary");
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
