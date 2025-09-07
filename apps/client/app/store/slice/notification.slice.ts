import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationState {
  notifications: NotificationData[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<NotificationData, 'id'>>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newNotification: NotificationData = {
        ...action.payload,
        id,
      };
      state.notifications.push(newNotification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearAllNotifications } = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;
