import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SearchStatus = 'idle' | 'loading' | 'succeeded' | 'error';

export type SearchResult = {
    id: string;
    title: string;
}

type SearchState = {
    query: string;
    status: SearchStatus;
    dataByQuery: Record<string, SearchResult[]>;
    error?: string;
}

const initialState: SearchState = {
    query: '',
    status: 'idle',
    dataByQuery: {},
};

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setQuery(state, action: PayloadAction<string>) {
            state.query = action.payload;
        },
        startSearch(state) {
            state.status = 'loading';
            state.error = undefined;
        },
        searchSuccess(
            state, 
            action: PayloadAction<{ query: string; results: SearchResult[] }>
        ) {
            const { query, results } = action.payload;
            state.status = 'succeeded';
            state.dataByQuery[query] = results;
        },
        searchError(state, action: PayloadAction<string>) {
            state.status = 'error';
            state.error = action.payload;
        },
        resetSearch(state) {
            state.query = '';
            state.status = 'idle';
            state.error = undefined;
        },
    },
});

export const { setQuery, startSearch, searchSuccess, searchError, resetSearch } = searchSlice.actions;
export const searchReducer = searchSlice.reducer;