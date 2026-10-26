'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  FileText,
  Users,
  Calendar,
  Gift,
  Info,
  CheckCheck,
  Trash2,
  ExternalLink,
  UserCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '@/src/components/common/glass';
import { useNotifications } from '@/src/providers/NotificationProvider';
import {
  NotificationCategory,
  NotificationItem,
  NotificationType,
} from '@/src/features/notifications/types/notification.types';

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<
    'all' | 'unread' | 'jd' | 'candidate' | 'interview_offer'
  >('all');

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const filteredNotifications = safeNotifications.filter((item) => {
    if (activeTab === 'unread') return !item.isRead;
    if (activeTab === 'jd')
      return (
        item.category === NotificationCategory.JD ||
        item.category === NotificationCategory.RECRUITMENT
      );
    if (activeTab === 'candidate')
      return (
        item.category === NotificationCategory.CANDIDATE ||
        item.type === NotificationType.DEPARTMENT_REVIEW ||
        item.type === NotificationType.STAGE_DEPARTMENT_REVIEW
      );
    if (activeTab === 'interview_offer')
      return (
        item.category === NotificationCategory.INTERVIEW ||
        item.category === NotificationCategory.OFFER
      );
    return true;
  });

  const getCategoryIcon = (category: NotificationCategory, type: NotificationType) => {
    if (type === NotificationType.JD_APPROVED) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-md">
          <CheckCheck size={20} />
        </div>
      );
    }
    if (type === NotificationType.JD_REJECTED) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-400 text-white flex items-center justify-center shrink-0 shadow-md">
          <X size={20} />
        </div>
      );
    }
    if (type === NotificationType.DEPARTMENT_REVIEW || type === NotificationType.STAGE_DEPARTMENT_REVIEW) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shrink-0 shadow-md">
          <UserCheck size={20} />
        </div>
      );
    }
    if (category === NotificationCategory.JD || category === NotificationCategory.RECRUITMENT) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3B82F6] to-[#6366F1] text-white flex items-center justify-center shrink-0 shadow-md">
          <FileText size={20} />
        </div>
      );
    }
    if (category === NotificationCategory.CANDIDATE) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-md">
          <Users size={20} />
        </div>
      );
    }
    if (category === NotificationCategory.INTERVIEW) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md">
          <Calendar size={20} />
        </div>
      );
    }
    if (category === NotificationCategory.OFFER) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-400 text-white flex items-center justify-center shrink-0 shadow-md">
          <Gift size={20} />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-500 to-slate-400 text-white flex items-center justify-center shrink-0 shadow-md">
        <Info size={20} />
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
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const handleCardClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      await markAsRead(item._id);
    }
    if (item.actionUrl) {
      router.push(item.actionUrl);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Trung Tâm Thông Báo
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-black border border-rose-200">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Theo dõi yêu cầu duyệt JD, đánh giá ứng viên phòng ban và các cập nhật mới nhất.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => markAllAsRead()}
              className="cursor-pointer gap-1.5 font-bold"
            >
              <CheckCheck size={14} />
              <span>Đọc tất cả</span>
            </GlassButton>
          )}
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/50 backdrop-blur-md rounded-2xl border border-white/60">
        {[
          { id: 'all', label: `Tất cả (${safeNotifications.length})` },
          { id: 'unread', label: `Chưa đọc (${unreadCount})` },
          {
            id: 'jd',
            label: 'Yêu cầu JD',
            count: safeNotifications.filter(
              (n) =>
                n.category === NotificationCategory.JD ||
                n.category === NotificationCategory.RECRUITMENT,
            ).length,
          },
          {
            id: 'candidate',
            label: 'Ứng viên & Đánh giá',
            count: safeNotifications.filter(
              (n) =>
                n.category === NotificationCategory.CANDIDATE ||
                n.type === NotificationType.DEPARTMENT_REVIEW ||
                n.type === NotificationType.STAGE_DEPARTMENT_REVIEW,
            ).length,
          },
          {
            id: 'interview_offer',
            label: 'Phỏng vấn & Offer',
            count: safeNotifications.filter(
              (n) =>
                n.category === NotificationCategory.INTERVIEW ||
                n.category === NotificationCategory.OFFER,
            ).length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#3B82F6] to-[#6366F1] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading && safeNotifications.length === 0 ? (
          <div className="p-12 text-center text-sm font-medium text-slate-400 bg-white/40 rounded-3xl border border-white/60 backdrop-blur-md">
            Đang tải dữ liệu thông báo...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center bg-white/40 rounded-3xl border border-white/60 backdrop-blur-md">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#3B82F6] flex items-center justify-center mb-3">
              <Bell size={28} className="opacity-60" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Không có thông báo nào trong mục này
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Mọi cập nhật về duyệt JD tuyển dụng và đánh giá hồ sơ ứng viên sẽ tự động hiển thị tức thì.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <GlassCard
              key={notif._id}
              variant="hover"
              onClick={() => handleCardClick(notif)}
              className={`p-4 transition-all cursor-pointer relative group ${
                !notif.isRead
                  ? 'border-l-[5px] border-l-[#3B82F6] bg-gradient-to-r from-blue-50/95 via-sky-50/40 to-white/95 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/20 hover:shadow-lg'
                  : 'border border-white/60 bg-white/40 hover:bg-white/70 opacity-65 hover:opacity-95 shadow-none'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Category icon */}
                  {getCategoryIcon(notif.category, notif.type)}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          !notif.isRead
                            ? 'text-[#3B82F6] bg-blue-100/70 border-blue-200'
                            : 'text-slate-400 bg-slate-100/70 border-slate-200'
                        }`}
                      >
                        {notif.category}
                      </span>
                      {!notif.isRead && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-0.5 rounded-full shadow-2xs">
                          Chưa đọc
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-medium ml-auto">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <h3
                      className={`text-sm leading-snug ${
                        !notif.isRead
                          ? 'font-black text-slate-900 tracking-tight'
                          : 'font-medium text-slate-600'
                      }`}
                    >
                      {notif.title}
                    </h3>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        !notif.isRead
                          ? 'text-slate-700 font-medium'
                          : 'text-slate-400 font-normal'
                      }`}
                    >
                      {notif.message}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div
                  className="flex items-center gap-1 shrink-0 pt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {!notif.isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notif._id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-[#3B82F6] hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Đánh dấu đã đọc"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                  {notif.actionUrl && (
                    <Link
                      href={notif.actionUrl}
                      onClick={() => {
                        if (!notif.isRead) markAsRead(notif._id);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-[#3B82F6] hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Xem chi tiết"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteNotification(notif._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Xóa thông báo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
