import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
  addNotification as addNotificationAction, 
  removeNotification as removeNotificationAction, 
  clearAllNotifications as clearAllNotificationsAction,
  NotificationData 
} from '../store/slice/notification.slice';

export const useNotification = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: any) => state.notification.notifications);

  const addNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    dispatch(addNotificationAction(notification));
  }, [dispatch]);

  const removeNotification = useCallback((id: string) => {
    dispatch(removeNotificationAction(id));
  }, [dispatch]);

  const clearAllNotifications = useCallback(() => {
    dispatch(clearAllNotificationsAction());
  }, [dispatch]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };
};
