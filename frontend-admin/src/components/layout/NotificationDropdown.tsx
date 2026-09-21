'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  FileText,
  UserCheck,
  Users,
  Calendar,
  Gift,
  Info,
  ChevronRight,
  ExternalLink,
  X,
} from 'lucide-react';
import { useNotifications } from '@/src/providers/NotificationProvider';
import {
  NotificationCategory,
  NotificationItem,
  NotificationType,
} from '@/src/features/notifications/types/notification.types';

export default function NotificationDropdown() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const filteredNotifications =
    activeTab === 'unread'
      ? safeNotifications.filter((n) => !n.isRead)
      : safeNotifications;

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    setIsOpen(false);
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  const getCategoryIcon = (category: NotificationCategory, type: NotificationType) => {
    if (type === NotificationType.JD_APPROVED) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-xs">
          <CheckCheck size={16} />
        </div>
      );
    }
    if (type === NotificationType.JD_REJECTED) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-red-400 text-white flex items-center justify-center shrink-0 shadow-xs">
          <X size={16} />
        </div>
      );
    }
    if (type === NotificationType.DEPARTMENT_REVIEW || type === NotificationType.STAGE_DEPARTMENT_REVIEW) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shrink-0 shadow-xs">
          <UserCheck size={16} />
        </div>
      );
    }
    if (category === NotificationCategory.JD || category === NotificationCategory.RECRUITMENT) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <FileText size={16} />
        </div>
      );
    }
    if (category === NotificationCategory.CANDIDATE) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Users size={16} />
        </div>
      );
    }
    if (category === NotificationCategory.INTERVIEW) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Calendar size={16} />
        </div>
      );
    }
    if (category === NotificationCategory.OFFER) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Gift size={16} />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-500 to-slate-400 text-white flex items-center justify-center shrink-0 shadow-xs">
        <Info size={16} />
      </div>
    );
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date().getTime();
      const past = new Date(dateStr).getTime();
      const diffMs = now - past;
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Vừa xong';
      if (diffMin < 60) return `${diffMin} phút trước`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour} giờ trước`;
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay < 7) return `${diffDay} ngày trước`;
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center border shadow-2xs ${
          isOpen
            ? 'bg-white/95 text-[#3B82F6] border-[#3B82F6] ring-4 ring-[#3B82F6]/15'
            : 'bg-white/40 hover:bg-white/80 text-[#3B82F6] hover:text-[#8B5CF6] border-[#3B82F6]/60 hover:border-[#8B5CF6]/60 backdrop-blur-md'
        }`}
        title="Thông báo"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black shadow-2xs leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose-400 animate-ping opacity-75" />
          </>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-24px)] bg-white/95 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-2xl shadow-blue-500/15 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-100/80 bg-white/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[11px] font-bold border border-rose-200">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 text-[11px] font-bold text-[#3B82F6] hover:text-[#1D4ED8] transition-colors cursor-pointer"
              >
                <CheckCheck size={13} />
                <span>Đọc tất cả</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 px-3 pt-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 -mb-px ${
                activeTab === 'all'
                  ? 'border-[#3B82F6] text-[#3B82F6]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả ({safeNotifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 -mb-px ${
                activeTab === 'unread'
                  ? 'border-[#3B82F6] text-[#3B82F6]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100/70 [scrollbar-width:thin]">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Đang tải thông báo...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#3B82F6] flex items-center justify-center mb-2">
                  <Bell size={22} className="opacity-60" />
                </div>
                <p className="text-xs font-bold text-slate-700">
                  {activeTab === 'unread'
                    ? 'Bạn đã đọc hết mọi thông báo!'
                    : 'Chưa có thông báo nào'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Các thông báo JD và ứng viên mới sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 flex items-start gap-3 transition-all cursor-pointer group relative ${
                    !notif.isRead
                      ? 'bg-gradient-to-r from-blue-50/95 via-sky-50/60 to-white/95 border-l-[4px] border-l-[#3B82F6] shadow-xs hover:bg-blue-100/70'
                      : 'bg-transparent hover:bg-slate-100/70 opacity-60 hover:opacity-90'
                  }`}
                >
                  {/* Category icon */}
                  {getCategoryIcon(notif.category, notif.type)}

                  {/* Body */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider ${
                          !notif.isRead ? 'text-[#3B82F6]' : 'text-slate-400'
                        }`}
                      >
                        {notif.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <h4
                      className={`text-xs leading-snug line-clamp-1 ${
                        !notif.isRead
                          ? 'font-black text-slate-900'
                          : 'font-medium text-slate-600'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <p
                      className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                        !notif.isRead
                          ? 'text-slate-700 font-medium'
                          : 'text-slate-400 font-normal'
                      }`}
                    >
                      {notif.message}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {!notif.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] ring-4 ring-blue-400/30 animate-pulse mt-1 shrink-0 shadow-xs" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 bg-white/80 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl text-xs font-bold text-[#3B82F6] hover:bg-blue-50/70 transition-colors"
            >
              <span>Xem tất cả thông báo</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
