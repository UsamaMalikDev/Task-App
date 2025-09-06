"use client";
import React from "react";
import { useNotification } from "../contexts/NotificationContext";
import NotificationContainer from "./NotificationContainer";

const NotificationWrapper: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <NotificationContainer
      notifications={notifications}
      onRemoveNotification={removeNotification}
    />
  );
};

export default NotificationWrapper;
