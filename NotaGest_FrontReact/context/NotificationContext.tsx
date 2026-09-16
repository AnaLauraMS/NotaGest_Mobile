"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Tipo das notificações
export interface Notification {
  id: number;
  message: string;
  type?: "success" | "error" | "info"; 
  time?: string;
}

interface NotificationContextProps {
  notifications: Notification[];
  addNotification: (
    message: string,
    type?: "success" | "error" | "info"
  ) => void;
  removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // adiciona uma notificação
  const addNotification = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setNotifications((prev) => [
      ...prev,
      { id: Date.now(), message, type },
    ]);
  };

  // remove uma notificação pelo id
  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications deve ser usado dentro de NotificationProvider");
  }
  return context;
};
