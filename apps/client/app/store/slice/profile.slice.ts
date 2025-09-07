'use client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProfileStateInterface {
  email: string;
  name: string;
  avatar: string;
  _id: string;
}

const initialState: ProfileStateInterface = {
  email: '',
  name: '',
  avatar: '',
  _id: '',
};

export const profileReducer = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileUser: (state, action: PayloadAction<ProfileStateInterface>) => {
      return { ...state, ...action.payload };
    },
    removeProfile: () => {
      return initialState;
    },
  },
});

export const { setProfileUser, removeProfile } = profileReducer.actions;
export default profileReducer.reducer;
