'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import InterviewPopoverTooltip from './InterviewPopoverTooltip';
import {
  InterviewItem,
  InterviewStatus,
  InterviewResult,
} from '../types/interview.types';

interface InterviewsCalendarViewProps {
  currentMonthDate: Date;
  setCurrentMonthDate: React.Dispatch<React.SetStateAction<Date>>;
  interviews: InterviewItem[];
  hoveredInterview: {
    item: InterviewItem;
    x: number;
    y: number;
  } | null;
  setHoveredInterview: React.Dispatch<
    React.SetStateAction<{
      item: InterviewItem;
      x: number;
      y: number;
    } | null>
  >;
  onOpenStatusModal: (interview: InterviewItem) => void;
  formatDate: (dateStr?: string) => string;
  getStatusBadge: (status: InterviewStatus, confirmationStatus?: string) => React.ReactNode;
  getResultBadge: (result: InterviewResult) => React.ReactNode;
}

export default function InterviewsCalendarView({
  currentMonthDate,
  setCurrentMonthDate,
  interviews,
  hoveredInterview,
  setHoveredInterview,
  onOpenStatusModal,
  formatDate,
  getStatusBadge,
  getResultBadge,
}: InterviewsCalendarViewProps) {
  const getDaysInMonthGrid = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay === -1) startDay = 6; // 0 = Mon, 6 = Sun

    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Prev month padding
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({ date: d, isCurrentMonth: false, dateStr });
    }

    // Current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({ date: d, isCurrentMonth: true, dateStr });
    }

    // Next month padding
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({ date: d, isCurrentMonth: false, dateStr });
    }

    return days;
  };

  const calendarDays = getDaysInMonthGrid(currentMonthDate);

  const prevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };
  const goToday = () => {
    setCurrentMonthDate(new Date());
  };

  const getEventBgByStatus = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.SCHEDULED:
        return 'bg-indigo-50 border-l-4 border-indigo-600 text-indigo-900 hover:bg-indigo-100/90';
      case InterviewStatus.COMPLETED:
        return 'bg-emerald-50 border-l-4 border-emerald-600 text-emerald-900 hover:bg-emerald-100/90';
      case InterviewStatus.CANCELLED:
        return 'bg-rose-50 border-l-4 border-rose-500 text-rose-900 hover:bg-rose-100/90';
      default:
        return 'bg-slate-100 border-l-4 border-slate-400 text-slate-900';
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 relative">
      {/* Calendar Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Tháng {currentMonthDate.getMonth() + 1}, {currentMonthDate.getFullYear()}
          </h2>

          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
              title="Tháng trước"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
              title="Tháng sau"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={goToday}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Hôm nay
          </button>
        </div>

        {/* Calendar Legend Bar */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span>Đã lên lịch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Hoàn thành</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Đã hủy</span>
          </div>
        </div>
      </div>

      {/* 7 Columns Days Header */}
      <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
        <div>Thứ 2</div>
        <div>Thứ 3</div>
        <div>Thứ 4</div>
        <div>Thứ 5</div>
        <div>Thứ 6</div>
        <div>Thứ 7</div>
        <div>Chủ Nhật</div>
      </div>

      {/* Month Grid Cells (35 or 42 boxes) */}
      <div className="grid grid-cols-7 gap-px bg-slate-200/70 rounded-2xl overflow-hidden border border-slate-200/80">
        {calendarDays.map((dayObj, idx) => {
          const dayStr = dayObj.dateStr;

          // Filter interviews occurring on this date
          const dayEvents = interviews.filter((inv) => {
            const invDate = formatDate(inv.date);
            return invDate === dayStr;
          });

          const todayStr = formatDate(new Date().toISOString());
          const isToday = dayStr === todayStr;

          return (
            <div
              key={idx}
              className={`min-h-[110px] p-2 flex flex-col justify-start transition-colors ${
                dayObj.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60 text-slate-300'
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-extrabold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : dayObj.isCurrentMonth
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {dayObj.date.getDate()}
                </span>
              </div>

              {/* List of Event Badges */}
              <div className="space-y-1.5 overflow-y-auto max-h-[85px]">
                {dayEvents.map((event) => {
                  const cand = event.candidateId;
                  const candName =
                    typeof cand === 'object' ? cand?.fullName || cand?.name : 'Ứng viên';

                  return (
                    <div
                      key={event._id}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredInterview({
                          item: event,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 10,
                        });
                      }}
                      onMouseLeave={() => setHoveredInterview(null)}
                      onClick={() => onOpenStatusModal(event)}
                      className={`p-1.5 rounded-xl text-[11px] font-bold transition-all shadow-2xs cursor-pointer truncate ${getEventBgByStatus(
                        event.status
                      )}`}
                    >
                      <div className="truncate flex items-center gap-1">
                        <span className="shrink-0">{event.startTime}</span>
                        <span className="truncate">{candName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Hover Popover Tooltip */}
      {hoveredInterview && (
        <InterviewPopoverTooltip
          hoveredInterview={hoveredInterview}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          getResultBadge={getResultBadge}
        />
      )}
    </div>
  );
}
