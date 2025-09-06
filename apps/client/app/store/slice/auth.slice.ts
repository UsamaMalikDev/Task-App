'use client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  expires: string;
  expiresPrettyPrint: string;
  token: string;
}

const initialState: AuthState = {
  expires: '',
  expiresPrettyPrint: '',
  token: '',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<AuthState>) => {
      return { ...state, ...action.payload };
    },
    removeAuthUser: () => {
      return initialState;
    },
  },
});

export const { setAuthUser, removeAuthUser } = authSlice.actions;
export default authSlice.reducer;
