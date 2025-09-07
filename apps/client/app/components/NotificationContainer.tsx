"use client";
import React from "react";
import Notification from "./Notification";
import { useNotification } from "../hooks/useNotification";
import { NotificationData } from "../store/slice/notification.slice";

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification: NotificationData) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
