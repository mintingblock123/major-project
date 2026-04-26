"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type NotificationType = "success" | "error" | "info";

type NotificationContextType = {
  showNotification: (message: string, type?: NotificationType) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);

  const showNotification = (message: string, type: NotificationType = "success") => {
    setNotification({ message, type });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div className="fixed top-6 right-6 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`px-6 py-4 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-3 backdrop-blur-xl border ${
              notification.type === "success"
                ? "bg-[#064e3b]/80 border-green-500/30 text-white"
                : notification.type === "error"
                ? "bg-[#7f1d1d]/80 border-red-500/30 text-white"
                : "bg-[#1e3a8a]/80 border-blue-500/30 text-white"
            }`}
          >
            {notification.type === "success" && (
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className="font-bold text-sm tracking-wide">{notification.message}</span>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
