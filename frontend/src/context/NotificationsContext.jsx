"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useUser } from "@/context/UserContext";
import apiClient from "@/libs/api";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
    const { user } = useUser();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(
        async (options = { unread: false }) => {
            if (!user) {
                setItems([]);
                setUnreadCount(0);
                return;
            }
            setLoading(true);

            try {
                const query = new URLSearchParams(options).toString();
                const { data } = await apiClient.get(`/notifications?${query}`);

                setItems(data.data || []);
                setUnreadCount((data.data || []).filter((n) => !n.is_read).length);
            
            } catch (err) {
                const status = err.response?.status;
                if (status === 401) {
                    setItems([]);
                    setUnreadCount(0);
                } else {
                    console.error("Failed to fetch notifications", err);
                }

            } finally {
                setLoading(false);
            }
        },
        [user]
    );

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (!user) return;

        const socketBase =
            process.env.NEXT_PUBLIC_SOCKET_URL ||
            process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "https://api-ibc.itr-compass.co.id";

        const socket = io(socketBase, {
            withCredentials: true,
            transports: ["websocket"],
        });

        socket.on("notification:new", (notification) => {
            setItems((prev) => {
                const existing = new Map(prev.map((item) => [item.notification_id, item]));
                existing.set(notification.notification_id, notification);
                const merged = Array.from(existing.values()).sort(
                    (a, b) => new Date(b.createdon).getTime() - new Date(a.createdon).getTime()
                );
                return merged;
            });

            if (!notification.is_read) {
                setUnreadCount((prev) => prev + 1);
            }
        });

        socket.on("connect_error", (err) => {
            console.warn("Socket error", err.message);
        });

        return () => socket.disconnect();
    }, [user]);

    const markAsRead = useCallback(
        async (id) => {
            try {
                await apiClient.patch(`/notifications/${id}`, { is_read: true });
                setItems((prev) =>
                    prev.map((item) => (item.notification_id === id ? { ...item, is_read: true } : item))
                );
                setUnreadCount((prev) => Math.max(prev - 1, 0));
            } catch (err) {
                console.error("Failed to mark notification", err);
            }
        },
        []
    );

    const markAllAsRead = useCallback(async () => {
        try {
            await apiClient.post("/notifications/mark-all-read");
            setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark-all", err);
        }
    }, []);

        const value = useMemo(() => ({
            items,
            unreadCount,
            loading,
            refetch: fetchNotifications,
            markAsRead,
            markAllAsRead,
        }),
        [items, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead]
    );

    return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
    const ctx = useContext(NotificationsContext);

    if (!ctx) {
        throw new Error("useNotifications must be used within NotificationProvider");
    }
    
    return ctx;
}
