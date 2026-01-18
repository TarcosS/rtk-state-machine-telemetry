import { configureStore } from "@reduxjs/toolkit";
import { searchReducer } from "../features/search/searchSlice";
import { loggerMiddleware } from "./loggerMiddleware";

export const store = configureStore({
  reducer: {
    search: searchReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serializable check for specific use cases
      serializableCheck: false,
    }).concat(loggerMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
