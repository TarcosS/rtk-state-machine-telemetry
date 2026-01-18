import { createSlice } from "@reduxjs/toolkit";

type SearchState = {
    query: string;
}

const initialState: SearchState = {
    query: '',
};

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {}
});

export const searchReducer = searchSlice.reducer;