'use client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  _id: string;
  email: string;
  roles: string[];
  name: string;
  avatar: string;
  isVerified: string;
  disabled: boolean;
  organizationId: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    removeAuthUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuthUser, removeAuthUser } = authSlice.actions;
export default authSlice.reducer;
