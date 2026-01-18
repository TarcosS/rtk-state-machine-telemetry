import { configureStore } from "@reduxjs/toolkit";
import { searchReducer } from "../features/search/searchSlice";

export const store = configureStore({
  reducer: {
    search: searchReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serializable check for specific use cases
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
