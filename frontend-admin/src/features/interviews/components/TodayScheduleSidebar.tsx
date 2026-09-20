'use client';

import React from 'react';
import { Calendar, Clock, ChevronRight, Lightbulb, Sparkles, Video, MapPin } from 'lucide-react';
import { InterviewItem, InterviewStatus, LocationType } from '../types/interview.types';

interface TodayScheduleSidebarProps {
  interviews: InterviewItem[];
  onViewCalendar?: () => void;
  onOpenStatusModal?: (interview: InterviewItem) => void;
}

export function TodayScheduleSidebar({
  interviews,
  onViewCalendar,
  onOpenStatusModal,
}: TodayScheduleSidebarProps) {
  // Format current date display
  const now = new Date();
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[now.getDay()];
  const formattedToday = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const todayISO = now.toISOString().split('T')[0];

  // Filter today's interviews or sort upcoming ones
  const todayInterviews = interviews.filter((item) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date).toISOString().split('T')[0];
    return itemDate === todayISO;
  });

  // Display list: if no interviews today, display next upcoming 3-4 interviews
  const displayList = todayInterviews.length > 0
    ? todayInterviews
    : interviews.slice(0, 4);

  const getTimelineStatusBadge = (status: InterviewStatus, startTime?: string) => {
    if (status === InterviewStatus.COMPLETED) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
          Đã hoàn thành
        </span>
      );
    }
    if (status === InterviewStatus.CANCELLED) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
          Đã hủy
        </span>
      );
    }
    // Time heuristic for status pill
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
        Chưa bắt đầu
      </span>
    );
  };

  const getDotColor = (status: InterviewStatus) => {
    if (status === InterviewStatus.COMPLETED) return 'bg-emerald-500 ring-emerald-200';
    if (status === InterviewStatus.CANCELLED) return 'bg-rose-500 ring-rose-200';
    return 'bg-blue-500 ring-blue-200';
  };

  return (
    <div className="space-y-5">
      {/* 1. Card: Lịch hôm nay */}
      <div className="p-5 rounded-3xl bg-white/30 backdrop-blur-xl border border-white/70 shadow-xl shadow-blue-500/5 space-y-4">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-[#3B82F6] flex items-center justify-center font-bold shadow-2xs border border-blue-200/50">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-none">
                Lịch hôm nay
              </h3>
              <p className="text-[11px] font-medium text-slate-600 mt-1">
                {dayName}, {formattedToday}
              </p>
            </div>
          </div>

          {onViewCalendar && (
            <button
              type="button"
              onClick={onViewCalendar}
              className="text-xs font-extrabold text-[#3B82F6] hover:underline cursor-pointer"
            >
              Xem tất cả
            </button>
          )}
        </div>

        {/* Timeline Items */}
        {displayList.length === 0 ? (
          <div className="py-8 text-center text-xs font-medium text-slate-400 bg-white/30 rounded-2xl border border-white/50">
            Không có lịch phỏng vấn nào trong hôm nay
          </div>
        ) : (
          <div className="relative pl-3 space-y-4 before:absolute before:left-[17px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200/80">
            {displayList.map((item) => {
              const cand = item.candidateId;
              const candName = typeof cand === 'object' ? cand?.fullName || cand?.name : 'Ứng viên';
              const jobTitle = typeof item.jobDescriptionId === 'object' ? item.jobDescriptionId?.title : 'Vị trí';

              return (
                <div key={item._id} className="relative flex items-start gap-3.5 group">
                  {/* Timeline Dot */}
                  <div className={`relative z-10 w-2.5 h-2.5 rounded-full mt-1.5 ring-4 ${getDotColor(item.status)} shrink-0 transition-transform group-hover:scale-125`} />

                  {/* Content Container */}
                  <div
                    onClick={() => onOpenStatusModal && onOpenStatusModal(item)}
                    className="flex-1 p-3 rounded-2xl bg-white/40 hover:bg-white/70 border border-white/60 shadow-2xs transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                        <Clock size={12} className="text-[#3B82F6]" />
                        <span>{item.startTime} - {item.endTime}</span>
                      </div>
                      {getTimelineStatusBadge(item.status, item.startTime)}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#3B82F6] transition-colors line-clamp-1">
                        {candName}
                      </p>
                      <p className="text-[11px] font-medium text-slate-600 line-clamp-1">
                        {jobTitle}
                      </p>
                    </div>

                    <div className="text-[10px] font-semibold text-slate-600 flex items-center gap-1 pt-0.5 border-t border-slate-100">
                      {item.locationType === LocationType.ONLINE ? (
                        <>
                          <Video size={10} className="text-indigo-500" />
                          <span>Google Meet</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={10} className="text-amber-500" />
                          <span className="truncate">{item.offsiteLocation || 'Phòng họp'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Card: Mẹo nhỏ */}
      <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-300/40 backdrop-blur-xl flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
            <Lightbulb size={16} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-amber-950">Mẹo nhỏ</h4>
            <p className="text-[11px] font-semibold text-amber-900/80 leading-relaxed mt-0.5">
              Bạn có thể xem lịch phỏng vấn theo giao diện Lịch để quản lý tổng quan công việc tốt hơn.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onViewCalendar}
          className="w-7 h-7 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* 3. Card: Banner TalentCore */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#3B82F6] via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
        <div className="relative z-10 space-y-3">
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-sm font-extrabold tracking-tight">
              Tối ưu quy trình tuyển dụng cùng TalentCore
            </h4>
            <p className="text-[11px] font-medium text-white/80 mt-1 leading-relaxed">
              Tự động thông báo email, sắp xếp lịch thông minh và quản lý ứng viên tập trung.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
