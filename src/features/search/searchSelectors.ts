import type { RootState } from "../../app/store";

export const selectQuery = (s: RootState) => s.search.query;
export const selectStatus = (s: RootState) => s.search.status;
export const selectError = (s: RootState) => s.search.error;

export const selectResultsForCurrentQuery = (s: RootState) =>
  s.search.dataByQuery[s.search.query.trim()] ?? [];

export const selectLastMeta = (s: RootState) => ({
  durationMs: s.search.lastDurationMs,
  fromCache: s.search.lastFromCache,
});
