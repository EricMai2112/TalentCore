'use client';

import React from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, Calendar } from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '@/src/components/common/glass';

export default function NotificationsPage() {
  const notifications = [
    {
      id: '1',
      title: 'Ứng viên mới nộp hồ sơ',
      desc: 'Nguyễn Văn An vừa nộp hồ sơ cho vị trí Senior Frontend Developer.',
      time: '10 phút trước',
      type: 'info',
      read: false,
    },
    {
      id: '2',
      title: 'Lịch phỏng vấn sắp diễn ra',
      desc: 'Phỏng vấn Tech Round với Trần Thị Bình lúc 14:00 hôm nay.',
      time: '1 giờ trước',
      type: 'warning',
      read: false,
    },
    {
      id: '3',
      title: 'Ứng viên chấp nhận Offer',
      desc: 'Lê Minh Cường đã xác nhận đồng ý Offer vị trí Backend Engineer.',
      time: '3 giờ trước',
      type: 'success',
      read: true,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Thông Báo Hệ Thống</h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Cập nhật ứng viên, lịch phỏng vấn và phản hồi Offer mới nhất.
          </p>
        </div>
        <GlassButton variant="secondary" size="sm">
          Đánh dấu tất cả là đã đọc
        </GlassButton>
      </div>

      {/* List */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <GlassCard
            key={n.id}
            variant="hover"
            className={`p-5 ${!n.read ? 'border-l-4 border-l-[#2A95BF]' : ''}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-2xl shrink-0 ${
                    n.type === 'success'
                      ? 'bg-emerald-500/15 text-emerald-600'
                      : n.type === 'warning'
                      ? 'bg-amber-500/15 text-amber-600'
                      : 'bg-[#2A95BF]/15 text-[#1261A6]'
                  }`}
                >
                  {n.type === 'success' ? (
                    <CheckCircle2 size={20} />
                  ) : n.type === 'warning' ? (
                    <Calendar size={20} />
                  ) : (
                    <Info size={20} />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">{n.desc}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-2">{n.time}</p>
                </div>
              </div>
              {!n.read && (
                <GlassBadge variant="accent" size="sm">
                  Mới
                </GlassBadge>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
