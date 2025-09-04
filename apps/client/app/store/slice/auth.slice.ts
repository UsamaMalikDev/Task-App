'use client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  expires: string | undefined;
  expiresPrettyPrint: string | undefined;
  token: string | undefined;
}

const initialState: AuthState = {
  expires: undefined,
  expiresPrettyPrint: undefined,
  token: undefined,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<AuthState>) => {
      return { ...state, ...action.payload };
    },
    removeAuthUser: (state) => {
      return initialState;
    },
  },
});

export const { setAuthUser, removeAuthUser } = authSlice.actions;
export default authSlice.reducer;
