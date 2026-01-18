import type { Middleware } from "@reduxjs/toolkit";

function safePickSearchState(state: any) {
  const s = state?.search;
  return {
    status: s?.status,
    query: s?.query,
    activeRequestId: s?.activeRequestId,
    lastDurationMs: s?.lastDurationMs,
    lastFromCache: s?.lastFromCache,
    hasError: Boolean(s?.error),
  };
}

export const loggerMiddleware: Middleware = (store) => (next) => (action: any) => {
  const started = performance.now();
  const result = next(action);
  const durationMs = Math.round(performance.now() - started);

  const type = typeof action?.type === "string" ? action.type : "unknown_action";

  // Keep noise low: focus only on this feature's actions
  if (type.startsWith("search/")) {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        event: "redux.action",
        type,
        durationMs,
        meta: action?.meta
          ? {
              requestId: action.meta.requestId,
              arg: action.meta.arg,
              requestStatus: action.meta.requestStatus,
            }
          : undefined,
        state: safePickSearchState(store.getState()),
      })
    );
  }

  return result;
};
