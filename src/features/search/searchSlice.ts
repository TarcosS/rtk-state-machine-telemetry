import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { runSearch } from "./searchThunks";

export type SearchStatus = "idle" | "loading" | "success" | "error";

export type SearchResult = {
  id: string;
  title: string;
};

type SearchState = {
  query: string;
  status: SearchStatus;
  dataByQuery: Record<string, SearchResult[]>;
  error?: string;

  activeRequestId?: string;
  lastDurationMs?: number;
  lastFromCache?: boolean;
  aborted?: boolean;
};

const initialState: SearchState = {
  query: "",
  status: "idle",
  dataByQuery: {},
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    resetSearch(state) {
      state.query = "";
      state.status = "idle";
      state.error = undefined;
      state.activeRequestId = undefined;
      state.lastDurationMs = undefined;
      state.lastFromCache = undefined;
      state.aborted = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runSearch.pending, (state, action) => {
        state.status = "loading";
        state.error = undefined;
        state.activeRequestId = action.meta.requestId;
        state.lastDurationMs = undefined;
        state.lastFromCache = undefined;
        state.aborted = undefined;
      })
      .addCase(runSearch.fulfilled, (state, action) => {
        // Only accept latest request
        if (state.activeRequestId !== action.meta.requestId) return;

        state.status = "success";
        state.dataByQuery[action.payload.query] = action.payload.results;
        state.lastDurationMs = action.payload.durationMs;
        state.lastFromCache = action.payload.fromCache;
        state.aborted = false;
      })
      .addCase(runSearch.rejected, (state, action) => {
        if (state.activeRequestId !== action.meta.requestId) return;

        if (action.payload?.error?.name.toLowerCase() === "aborterror") {
          // Aborted requests are treated as a neutral outcome
          state.status = "idle";
          state.lastDurationMs = action.payload.durationMs;
          state.aborted = true;
          return;
        }

        state.status = "error";
        state.error = action.payload?.message ?? "unknown_error";
        state.lastDurationMs = action.payload?.durationMs;
        state.lastFromCache = false;
        state.aborted = false;
      });
  },
});

export const { setQuery, resetSearch } = searchSlice.actions;
export const searchReducer = searchSlice.reducer;
