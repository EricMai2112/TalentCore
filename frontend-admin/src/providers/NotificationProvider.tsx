'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthProvider';
import { env } from '@/src/config/env.config';
import {
  NotificationItem,
  NotificationCategory,
} from '../features/notifications/types/notification.types';
import { notificationsApi } from '../features/notifications/services/notifications.api';
import { Bell, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (category?: string, isRead?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  isConnected: false,
});

/**
 * Play subtle notification sound using Web Audio API (Zero external assets needed)
 */
function playChimeSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;

    // High melodic chime: Note 1 (880Hz - A5) -> Note 2 (1318.5Hz - E6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.5, now + 0.12);
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch {
    // AudioContext autoplay restrictions or not supported
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<NotificationItem | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract department id string
  const departmentId =
    typeof user?.departmentId === 'object'
      ? (user?.departmentId as any)?._id
      : user?.departmentId;

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (category?: string, isRead?: boolean) => {
      if (!user) return;
      setIsLoading(true);
      try {
        const res = await notificationsApi.getNotifications({
          category,
          isRead,
          limit: 30,
        });
        setNotifications(Array.isArray(res?.items) ? res.items : []);
        setUnreadCount(typeof res?.unreadCount === 'number' ? res.unreadCount : 0);
      } catch (err) {
        console.error('Lỗi khi tải danh sách thông báo:', err);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  // Initial fetch when user is authenticated
  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?._id, fetchNotifications]);

  // Socket.IO real-time connection
  useEffect(() => {
    if (!user?._id) return;

    const socketUrl = env.apiUrl.replace(/\/api\/?$/, '');
    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      query: {
        userId: user._id,
        role: user.role,
        departmentId: departmentId || '',
      },
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('notification:new', (newNotif: NotificationItem) => {
      // Prepend to state
      setNotifications((prev) => [
        newNotif,
        ...(Array.isArray(prev) ? prev : []).filter((n) => n && n._id !== newNotif._id),
      ]);
      setUnreadCount((prev) => prev + 1);

      // Play audio notification
      playChimeSound();

      // Show real-time glass toast (5 seconds)
      setToastNotification(newNotif);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setToastNotification(null);
      }, 5000);
    });

    socket.on('notification:unreadCount', (data: { count: number }) => {
      setUnreadCount(typeof data?.count === 'number' ? data.count : 0);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id, user?.role, departmentId]);

  // Mark single as read
  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) =>
          n._id === id ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Lỗi khi đánh dấu đã đọc:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) => ({ ...n, isRead: true })),
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      const safeList = Array.isArray(notifications) ? notifications : [];
      const target = safeList.find((n) => n._id === id);
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).filter((n) => n._id !== id),
      );
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Lỗi khi xóa thông báo:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: Array.isArray(notifications) ? notifications : [],
        unreadCount: typeof unreadCount === 'number' ? unreadCount : 0,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        isConnected,
      }}
    >
      {children}

      {/* Floating Glassmorphism Real-time Toast (5 seconds with progress bar) */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white/95 backdrop-blur-2xl border border-[#3B82F6]/30 rounded-2xl p-4 shadow-2xl shadow-blue-500/20 animate-in slide-in-from-bottom-5 duration-300 overflow-hidden">
          <div className="flex items-start gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bell size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3B82F6]">
                  {toastNotification.category || 'Thông báo mới'}
                </span>
                <button
                  type="button"
                  onClick={() => setToastNotification(null)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-0.5 truncate">
                {toastNotification.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                {toastNotification.message}
              </p>
              {toastNotification.actionUrl && (
                <Link
                  href={toastNotification.actionUrl}
                  onClick={() => {
                    markAsRead(toastNotification._id);
                    setToastNotification(null);
                  }}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#3B82F6] hover:text-[#2563EB] transition-colors"
                >
                  <span>Xem chi tiết</span>
                  <ExternalLink size={12} />
                </Link>
              )}
            </div>
          </div>

          {/* 5-second animated indicator line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100/70 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]"
              style={{
                animation: 'toastCountdown 5s linear forwards',
              }}
            />
          </div>
          <style jsx>{`
            @keyframes toastCountdown {
              from {
                width: 100%;
              }
              to {
                width: 0%;
              }
            }
          `}</style>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
