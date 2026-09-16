"use client";

import React, { useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { useNotifications } from "../../context/NotificationContext";

const NotificationDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { notifications } = useNotifications();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 border border-gray-300 rounded-full hover:bg-gray-100 focus:outline-none"
      >
        <IoNotificationsOutline size={24} className="text-white" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg max-h-80 overflow-y-auto z-50">
          {notifications.length === 0 ? (
            <p className="p-4 text-gray-500">Nenhuma notificação</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="p-4 border-b last:border-0">
                <p className="text-sm">{n.message}</p>
                <span className="text-xs text-gray-400">{n.time}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
