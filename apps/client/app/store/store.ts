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

const reducers = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  notification: notificationReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["profile"],
  version: 1,
};
const persistedReducer = persistReducer<typeof reducers>(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof reducers| any>;
export type AppDispatch = typeof store.dispatch;
