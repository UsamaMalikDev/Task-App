'use client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProfileStateInterface {
  email: string;
  name: string;
  password: string;
  avatar: string;
  roles: Array<string>;
  _id: string;
}

const initialState: ProfileStateInterface = {
  email: '',
  name: '',
  password: '',
  avatar: '',
  roles: [],
  _id: '',
};

export const profileReducer = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileUser: (state, action: PayloadAction<ProfileStateInterface>) => {
      return { ...state, ...action.payload };
    },
    patchProfileUser: (state, action: PayloadAction<Partial<ProfileStateInterface>>) => {
      return { ...state, ...action.payload };
    },
    removeProfile: () => {
      return initialState;
    },
  },
});

export const { setProfileUser, removeProfile, patchProfileUser } = profileReducer.actions;
export default profileReducer.reducer;
