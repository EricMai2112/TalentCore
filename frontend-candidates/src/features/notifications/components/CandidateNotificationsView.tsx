'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Calendar,
  FileText,
  Gift,
  Sparkles,
  Trash2,
  ExternalLink,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useNotification } from '@/src/providers/NotificationProvider';
import {
  NotificationCategory,
  NotificationItem,
  NotificationType,
} from '../types/notification.types';

export default function CandidateNotificationsView() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotification();

  const [activeTab, setActiveTab] = useState<
    'all' | 'unread' | 'interview' | 'stage' | 'offer'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const safeNotifications = useMemo(
    () => (Array.isArray(notifications) ? notifications : []),
    [notifications],
  );

  const interviewCount = useMemo(
    () =>
      safeNotifications.filter(
        (n) =>
          n.category === NotificationCategory.INTERVIEW ||
          n.type === NotificationType.INTERVIEW_SCHEDULED ||
          n.type === NotificationType.INTERVIEW_RESCHEDULED,
      ).length,
    [safeNotifications],
  );

  const stageCount = useMemo(
    () =>
      safeNotifications.filter(
        (n) =>
          n.category === NotificationCategory.CANDIDATE ||
          n.type === NotificationType.STAGE_CHANGED,
      ).length,
    [safeNotifications],
  );

  const offerCount = useMemo(
    () =>
      safeNotifications.filter(
        (n) =>
          n.category === NotificationCategory.OFFER ||
          n.type === NotificationType.OFFER_SENT,
      ).length,
    [safeNotifications],
  );

  const filteredNotifications = useMemo(() => {
    return safeNotifications.filter((item) => {
      if (activeTab === 'unread' && item.isRead) return false;
      if (
        activeTab === 'interview' &&
        item.category !== NotificationCategory.INTERVIEW &&
        item.type !== NotificationType.INTERVIEW_SCHEDULED &&
        item.type !== NotificationType.INTERVIEW_RESCHEDULED
      )
        return false;
      if (
        activeTab === 'stage' &&
        item.category !== NotificationCategory.CANDIDATE &&
        item.type !== NotificationType.STAGE_CHANGED
      )
        return false;
      if (
        activeTab === 'offer' &&
        item.category !== NotificationCategory.OFFER &&
        item.type !== NotificationType.OFFER_SENT
      )
        return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(query);
        const messageMatch = item.message?.toLowerCase().includes(query);
        return titleMatch || messageMatch;
      }

      return true;
    });
  }, [safeNotifications, activeTab, searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchNotifications();
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  const getCategoryBadge = (category: NotificationCategory, type: NotificationType) => {
    if (
      category === NotificationCategory.INTERVIEW ||
      type === NotificationType.INTERVIEW_SCHEDULED ||
      type === NotificationType.INTERVIEW_RESCHEDULED
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <Calendar size={12} />
          Lịch phỏng vấn
        </span>
      );
    }
    if (category === NotificationCategory.OFFER || type === NotificationType.OFFER_SENT) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Gift size={12} />
          Đãi ngộ & Offer
        </span>
      );
    }
    if (type === NotificationType.STAGE_CHANGED) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Sparkles size={12} />
          Tiến trình hồ sơ
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <FileText size={12} />
        Hồ sơ ứng tuyển
      </span>
    );
  };

  const getCategoryIcon = (category: NotificationCategory, type: NotificationType) => {
    if (
      category === NotificationCategory.INTERVIEW ||
      type === NotificationType.INTERVIEW_SCHEDULED ||
      type === NotificationType.INTERVIEW_RESCHEDULED
    ) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
          <Calendar size={20} />
        </div>
      );
    }
    if (category === NotificationCategory.OFFER || type === NotificationType.OFFER_SENT) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
          <Gift size={20} />
        </div>
      );
    }
    if (type === NotificationType.STAGE_CHANGED) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
          <Sparkles size={20} />
        </div>
      );
    }
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
        <FileText size={20} />
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
      });
    } catch {
      return dateStr;
    }
  };

  const formatFullDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Trang chủ
        </Link>
        <ChevronRight size={14} />
        <span className="text-slate-800">Thông báo của tôi</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Thông báo của bạn
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500 text-white shadow-sm shadow-rose-500/30">
                {unreadCount} mới
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Theo dõi tức thì các cập nhật về lịch phỏng vấn, sự thay đổi vòng đánh giá hồ sơ và thư mời nhận việc từ các nhà tuyển dụng tại TalentCore.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-60"
            title="Làm mới thông báo"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
            <span>Làm mới</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <CheckCheck size={15} />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Tất cả thông báo</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{safeNotifications.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Tổng số hoạt động</p>
        </div>

        <div
          onClick={() => setActiveTab('unread')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'unread'
              ? 'bg-rose-50/50 border-rose-500 ring-2 ring-rose-500/20 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-600">Chưa đọc</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{unreadCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Cần bạn xem ngay</p>
        </div>

        <div
          onClick={() => setActiveTab('interview')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'interview'
              ? 'bg-purple-50/50 border-purple-500 ring-2 ring-purple-500/20 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-700">Lịch phỏng vấn</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{interviewCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Lịch hẹn trực tiếp & online</p>
        </div>

        <div
          onClick={() => setActiveTab('stage')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'stage'
              ? 'bg-teal-50/50 border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-700">Tiến trình hồ sơ</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stageCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Cập nhật vòng tuyển dụng</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Tất cả ({safeNotifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'unread'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('interview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'interview'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Phỏng vấn ({interviewCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stage')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'stage'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Hồ sơ ({stageCount})
          </button>
          {offerCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('offer')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'offer'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Offer ({offerCount})
            </button>
          )}
        </div>

        <div className="relative min-w-[260px] sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm thông báo..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all shadow-2xs"
          />
        </div>
      </div>

      <div className="space-y-3">
        {isLoading && safeNotifications.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto mb-3" />
            Đang tải dữ liệu thông báo...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 px-4 text-center bg-white rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
              <Inbox size={32} className="opacity-70" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {searchQuery
                ? 'Không tìm thấy thông báo phù hợp'
                : activeTab === 'unread'
                ? 'Tuyệt vời! Bạn đã đọc hết mọi thông báo.'
                : 'Chưa có thông báo nào'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {searchQuery
                ? `Không có kết quả nào khớp với từ khóa "${searchQuery}". Hãy thử từ khóa khác.`
                : 'Mọi thông tin lịch phỏng vấn và cập nhật hồ sơ sẽ xuất hiện tại đây khi có tiến trình mới.'}
            </p>
            <div className="flex items-center gap-3 mt-6">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
              >
                <span>Khám phá việc làm</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/user/applications"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                <span>Hồ sơ đã nộp</span>
              </Link>
            </div>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isUnread = !notif.isRead;
            return (
              <div
                key={notif._id}
                className={`p-4 sm:p-5 rounded-2xl transition-all relative group flex flex-col sm:flex-row sm:items-start gap-4 ${
                  isUnread
                    ? 'bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white border-l-[5px] border-l-blue-600 border border-blue-200 shadow-sm hover:shadow-md'
                    : 'bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-2xs text-slate-600'
                }`}
              >
                {getCategoryIcon(notif.category, notif.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {getCategoryBadge(notif.category, notif.type)}

                    {isUnread && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-600 text-white shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Mới
                      </span>
                    )}

                    <span className="text-xs text-slate-400 font-medium ml-auto flex items-center gap-1">
                      <Clock size={12} />
                      <span title={formatFullDateTime(notif.createdAt)}>
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </span>
                  </div>

                  <h3
                    onClick={() => handleItemClick(notif)}
                    className={`text-sm sm:text-base leading-snug cursor-pointer transition-colors ${
                      isUnread
                        ? 'font-bold text-slate-900 hover:text-blue-600'
                        : 'font-semibold text-slate-800 hover:text-blue-600'
                    }`}
                  >
                    {notif.title}
                  </h3>

                  <p
                    className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${
                      isUnread ? 'text-slate-700 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {notif.message}
                  </p>

                  {notif.metadata?.jobTitle && (
                    <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100/80 text-slate-700 text-xs font-semibold">
                      <span className="text-slate-400 font-normal">Vị trí:</span>
                      <span>{notif.metadata.jobTitle}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200/60 text-xs">
                    {notif.actionUrl && (
                      <Link
                        href={notif.actionUrl}
                        onClick={() => {
                          if (isUnread) markAsRead(notif._id);
                        }}
                        className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                      >
                        <span>Xem chi tiết hồ sơ</span>
                        <ExternalLink size={13} />
                      </Link>
                    )}

                    <span className="text-slate-400 text-[11px] hidden sm:inline">
                      {formatFullDateTime(notif.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {isUnread ? (
                    <button
                      type="button"
                      onClick={() => markAsRead(notif._id)}
                      className="p-2 rounded-xl text-blue-600 hover:bg-blue-100/80 transition-colors cursor-pointer"
                      title="Đánh dấu đã đọc"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => deleteNotification(notif._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Xóa thông báo"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
