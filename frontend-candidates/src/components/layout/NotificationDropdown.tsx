'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  Calendar,
  Gift,
  Info,
  ChevronRight,
  FileText,
  UserCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useNotification } from '@/src/providers/NotificationProvider';
import {
  NotificationCategory,
  NotificationItem,
  NotificationType,
} from '@/src/features/notifications/types/notification.types';

interface NotificationDropdownProps {
  isScrolled?: boolean;
}

export default function NotificationDropdown({ isScrolled }: NotificationDropdownProps) {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } =
    useNotification();
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
    if (category === NotificationCategory.INTERVIEW || type === NotificationType.INTERVIEW_SCHEDULED || type === NotificationType.INTERVIEW_RESCHEDULED) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
          <Calendar size={16} />
        </div>
      );
    }
    if (category === NotificationCategory.OFFER || type === NotificationType.OFFER_SENT) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
          <Gift size={16} />
        </div>
      );
    }
    if (type === NotificationType.STAGE_CHANGED) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
          <Sparkles size={16} />
        </div>
      );
    }
    if (category === NotificationCategory.CANDIDATE) {
      return (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
          <FileText size={16} />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 text-white flex items-center justify-center shrink-0 shadow-sm">
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
        className={`relative rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer flex items-center justify-center text-slate-300 hover:text-white ${
          isOpen ? 'ring-2 ring-blue-500/50 border-blue-500 text-blue-400' : ''
        } ${isScrolled ? 'w-8 h-8' : 'w-9 h-9'}`}
        title="Thông báo"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black shadow-md shadow-rose-500/30 leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose-400 animate-ping opacity-75" />
          </>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-24px)] bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Thông báo của bạn</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[11px] font-bold border border-rose-500/30">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                <CheckCheck size={13} />
                <span>Đọc tất cả</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/40 px-3 pt-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 -mb-px ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả ({safeNotifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`pb-2 px-2.5 font-bold transition-colors cursor-pointer border-b-2 -mb-px ${
                activeTab === 'unread'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/80 [scrollbar-width:thin]">
            {isLoading && safeNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Đang tải thông báo...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-blue-400 flex items-center justify-center mb-2 border border-slate-700">
                  <Bell size={22} className="opacity-70" />
                </div>
                <p className="text-xs font-bold text-slate-200">
                  {activeTab === 'unread'
                    ? 'Bạn đã đọc hết mọi thông báo!'
                    : 'Chưa có thông báo nào'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Các thông báo lịch phỏng vấn và trạng thái hồ sơ sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 flex items-start gap-3 transition-all cursor-pointer group relative ${
                    !notif.isRead
                      ? 'bg-gradient-to-r from-blue-950/60 via-indigo-950/30 to-slate-900 border-l-[3px] border-l-blue-500 hover:bg-blue-900/30'
                      : 'bg-transparent hover:bg-slate-800/50 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* Category icon */}
                  {getCategoryIcon(notif.category, notif.type)}

                  {/* Body */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          !notif.isRead ? 'text-blue-400' : 'text-slate-400'
                        }`}
                      >
                        {notif.category === NotificationCategory.INTERVIEW
                          ? 'Phỏng vấn'
                          : notif.category === NotificationCategory.CANDIDATE
                          ? 'Ứng tuyển'
                          : notif.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <h4
                      className={`text-xs leading-snug line-clamp-1 ${
                        !notif.isRead
                          ? 'font-bold text-white'
                          : 'font-medium text-slate-300'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <p
                      className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                        !notif.isRead
                          ? 'text-slate-200 font-medium'
                          : 'text-slate-400 font-normal'
                      }`}
                    >
                      {notif.message}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {!notif.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/30 animate-pulse mt-1 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-800 bg-slate-950/60 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-xl text-xs font-semibold text-blue-400 hover:text-white hover:bg-slate-800 transition-colors"
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
