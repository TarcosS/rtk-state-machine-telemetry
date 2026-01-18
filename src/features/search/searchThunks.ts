import { createAsyncThunk } from "@reduxjs/toolkit";
import type { SearchResult } from "./searchSlice";
import type { RootState } from "../../app/store";
import { searchApi } from "../../api/searchApi";

type FulfilledPayload = {
  query: string;
  results: SearchResult[];
  durationMs: number;
  fromCache: boolean;
};

type RejectedPayload = {
  message: "aborted" | "request_failed";
  durationMs: number;
  error?: {
    name: "AbortError" | string;
    message: string;
  };
};

function logEvent(payload: Record<string, unknown>) {
  console.log(
    JSON.stringify({
      ...payload,
      ts: new Date().toISOString(),
    })
  );
}

export const runSearch = createAsyncThunk<
  FulfilledPayload,
  { query: string },
  { state: RootState; rejectValue: RejectedPayload }
>("search/runSearch", async ({ query }, { getState, signal, requestId, rejectWithValue }) => {
  const started = performance.now();
  const normalized = query.trim();

  const cached = getState().search.dataByQuery[normalized];
  if (cached) {
    const durationMs = Math.round(performance.now() - started);
    logEvent({
      event: "search.cache_hit",
      requestId,
      query: normalized,
      durationMs,
      count: cached.length,
    });
    return {
      query: normalized,
      results: cached,
      durationMs,
      fromCache: true,
    };
  }

  logEvent({
    event: "search.request_start",
    requestId,
    query: normalized,
  });

  try {
    const results = await searchApi.search(normalized, { signal });

    const durationMs = Math.round(performance.now() - started);

    logEvent({
      event: "search.request_success",
      requestId,
      query: normalized,
      durationMs,
      count: results.length,
    });

    return {
      query: normalized,
      results,
      durationMs,
      fromCache: false,
    };
  } catch (error: any) {
    const durationMs = Math.round(performance.now() - started);

    if (signal.aborted) {
      logEvent({
        event: "search.request_aborted",
        requestId,
        query: normalized,
        durationMs,
      });

      return rejectWithValue({
        message: "aborted",
        durationMs,
      });
    }

    logEvent({
      event: "search.request_error",
      requestId,
      query: normalized,
      durationMs,
      error: String(error?.message || error),
    });

    return rejectWithValue({
      message: "request_failed",
      durationMs,
    });
  }
});
