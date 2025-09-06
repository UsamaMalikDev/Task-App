"use client";
import React from "react";
import Notification, { NotificationProps } from "./Notification";

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationContainerProps {
  notifications: NotificationData[];
  onRemoveNotification: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onRemoveNotification,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={onRemoveNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
