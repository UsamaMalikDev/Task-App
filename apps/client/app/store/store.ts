import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";

import storage from "./storage";
import authReducer from "./slice/auth.slice";
import { profileReducer } from "./slice/profile.slice";
import { notificationReducer } from "./slice/notification.slice";

// Combine all reducers into a root reducer
const reducers = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  notification: notificationReducer,
});

// Configuration for Redux Persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["profile"],
  version: 1,
};

// Create a persisted reducer with Redux Persist
const persistedReducer = persistReducer(persistConfig, reducers);

// Configure the Redux store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist internal actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types
export type RootState = ReturnType<typeof reducers>;
export type AppDispatch = typeof store.dispatch;
