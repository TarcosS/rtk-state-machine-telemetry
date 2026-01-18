import type { RootState } from "../../app/store";

export const selectQuery = (state: RootState) => state.search.query;
export const selectStatus = (state: RootState) => state.search.status;
export const selectError = (state: RootState) => state.search.error;
export const selectResultsByQuery = (query: string) => (state: RootState) =>
  state.search.dataByQuery[query] || [];
