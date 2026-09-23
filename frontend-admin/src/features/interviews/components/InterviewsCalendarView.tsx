'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react'
import InterviewPopoverTooltip from './InterviewPopoverTooltip'
import { InterviewItem, InterviewStatus, InterviewResult } from '../types/interview.types'

interface InterviewsCalendarViewProps {
  currentMonthDate: Date
  setCurrentMonthDate: React.Dispatch<React.SetStateAction<Date>>
  interviews: InterviewItem[]
  hoveredInterview: {
    item: InterviewItem
    x: number
    y: number
  } | null
  setHoveredInterview: React.Dispatch<
    React.SetStateAction<{
      item: InterviewItem
      x: number
      y: number
    } | null>
  >
  onOpenStatusModal?: (interview: InterviewItem) => void
  formatDate: (dateStr?: string) => string
  getStatusBadge: (status: InterviewStatus, confirmationStatus?: string) => React.ReactNode
  getResultBadge: (result: InterviewResult) => React.ReactNode
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
  getResultBadge
}: InterviewsCalendarViewProps) {
  const router = useRouter()

  // Selected date state for weekly navigation (default today)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Helper: Get 7 days of the active week (Monday -> Sunday)
  const getWeekDays = (date: Date) => {
    const d = new Date(date)
    let dayOfWeek = d.getDay() === 0 ? 7 : d.getDay() // 1 = Mon, 7 = Sun
    const monday = new Date(d)
    monday.setDate(d.getDate() - dayOfWeek + 1)
    monday.setHours(0, 0, 0, 0)

    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday)
      nextDay.setDate(monday.getDate() + i)
      days.push(nextDay)
    }
    return days
  }

  const weekDays = getWeekDays(selectedDate)

  // Helper: Get mini month grid (Sunday -> Saturday headers to match standard mini calendar)
  const getMiniMonthGrid = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)

    let startDay = firstDayOfMonth.getDay() // 0 = Sun, 6 = Sat

    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = []

    // Prev month padding
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i)
      const dateStr = formatDate(d.toISOString())
      days.push({ date: d, isCurrentMonth: false, dateStr })
    }

    // Current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i)
      const dateStr = formatDate(d.toISOString())
      days.push({ date: d, isCurrentMonth: true, dateStr })
    }

    // Next month padding
    const remaining = (7 - (days.length % 7)) % 7
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      const dateStr = formatDate(d.toISOString())
      days.push({ date: d, isCurrentMonth: false, dateStr })
    }

    return days
  }

  const miniDays = getMiniMonthGrid(currentMonthDate)

  // Week navigation controls
  const prevWeek = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 7)
    setSelectedDate(d)
    setCurrentMonthDate(new Date(d.getFullYear(), d.getMonth(), 1))
  }

  const nextWeek = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 7)
    setSelectedDate(d)
    setCurrentMonthDate(new Date(d.getFullYear(), d.getMonth(), 1))
  }

  const goToday = () => {
    const today = new Date()
    setSelectedDate(today)
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  // Mini month navigation controls
  const prevMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
    )
  }
  const nextMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
    )
  }

  // Translucent glass styling for weekly event chips
  const getEventBgByStatus = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.SCHEDULED:
        return 'bg-blue-500/25 border-l-4 border-[#3B82F6] text-blue-950 hover:bg-blue-500/35 shadow-sm backdrop-blur-sm'
      case InterviewStatus.COMPLETED:
        return 'bg-emerald-500/25 border-l-4 border-emerald-600 text-emerald-950 hover:bg-emerald-500/35 shadow-sm backdrop-blur-sm'
      case InterviewStatus.CANCELLED:
        return 'bg-rose-500/25 border-l-4 border-rose-500 text-rose-950 hover:bg-rose-500/35 shadow-sm backdrop-blur-sm'
      default:
        return 'bg-slate-500/20 border-l-4 border-slate-400 text-slate-900 shadow-sm backdrop-blur-sm'
    }
  }

  // Hours array from 8 AM to 5 PM
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
  const HOUR_HEIGHT = 50 // 50px per hour row -> fits 100% inside 1 screen viewport without scrollbar

  // Helper to parse time string "09:30" -> hours & minutes
  const parseTime = (timeStr?: string) => {
    if (!timeStr) return { hour: 9, min: 0 }
    const parts = timeStr.trim().split(':')
    const h = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10)
    return {
      hour: isNaN(h) ? 9 : h,
      min: isNaN(m) ? 0 : m
    }
  }

  // Helper to convert "HH:MM" to minutes from midnight
  const timeToMinutes = (timeStr?: string) => {
    if (!timeStr) return 0
    const parts = timeStr.trim().split(':')
    const h = parseInt(parts[0], 10) || 0
    const m = parseInt(parts[1], 10) || 0
    return h * 60 + m
  }

  // Helper to calculate rank relative to current time:
  // 0 = Ongoing (current time is between startTime and endTime)
  // 1 = Upcoming (startTime is after current time)
  // 2 = Past (endTime is before current time)
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const getInterviewTimeRank = (item: InterviewItem) => {
    const startMin = timeToMinutes(item.startTime)
    let endMin = timeToMinutes(item.endTime)
    if (!endMin || endMin <= startMin) endMin = startMin + 60

    if (currentMinutes >= startMin && currentMinutes < endMin) {
      return 0 // Ongoing
    } else if (currentMinutes < startMin) {
      return 1 // Upcoming
    } else {
      return 2 // Past
    }
  }

  // Format week range string e.g. "21 - 27 Tháng 9, 2026"
  const startWeekDay = weekDays[0]
  const endWeekDay = weekDays[6]
  const weekRangeTitle = `${startWeekDay.getDate()} - ${endWeekDay.getDate()} Tháng ${
    endWeekDay.getMonth() + 1
  }, ${endWeekDay.getFullYear()}`

  const todayISO = formatDate(new Date().toISOString())
  const activeWeekISOs = weekDays.map((d) => formatDate(d.toISOString()))

  // Helper: Only render official approved interviews on the calendar view grid
  const isOfficialSchedule = (item: InterviewItem) => {
    if (!item.date || !item.startTime || !item.endTime) return false
    if (
      item.confirmationStatus === 'WAITING_DEPT_SCHEDULE' ||
      item.confirmationStatus === 'WAITING_HR_APPROVAL' ||
      item.confirmationStatus === 'REJECTED' ||
      item.status === InterviewStatus.CANCELLED
    ) {
      return false
    }
    return true
  }

  // Filter today's interviews, sort by User Priority Rules, and limit to MAX 5 items
  const todayInterviews = interviews
    .filter((inv) => isOfficialSchedule(inv) && formatDate(inv.date) === todayISO)
    .sort((a, b) => {
      const rankA = getInterviewTimeRank(a)
      const rankB = getInterviewTimeRank(b)

      if (rankA !== rankB) {
        return rankA - rankB // Ongoing (0) -> Upcoming (1) -> Past (2)
      }

      // If in same category, sort by startTime ascending
      const startA = timeToMinutes(a.startTime)
      const startB = timeToMinutes(b.startTime)
      return startA - startB
    })
    .slice(0, 5) // Maximum 5 items!

  const formattedTodayText = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  return (
    <div className="flex flex-col lg:flex-row gap-3 relative">
      {/* LEFT COLUMN: Mini Month Calendar Sidebar & Vertical Timeline Today Schedule */}
      <div className="w-full lg:w-56 shrink-0 bg-white/20 border border-white/70 shadow-xl shadow-blue-500/5 rounded-3xl p-3 space-y-3">
        {/* Mini Calendar Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-800 tracking-tight">
            Tháng {currentMonthDate.getMonth() + 1}, {currentMonthDate.getFullYear()}
          </h3>
          <div className="flex items-center gap-0.5 bg-white/50 border border-white/70 p-0.5 rounded-lg shadow-2xs">
            <button
              type="button"
              onClick={prevMonth}
              className="p-0.5 text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded transition-all cursor-pointer"
              title="Tháng trước"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-0.5 text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded transition-all cursor-pointer"
              title="Tháng sau"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Mini Calendar Weekday Header (Cn T2 T3 T4 T5 T6 T7) */}
        <div className="grid grid-cols-7 text-center font-bold text-[10px] text-slate-500">
          <div>Cn</div>
          <div>T2</div>
          <div>T3</div>
          <div>T4</div>
          <div>T5</div>
          <div>T6</div>
          <div>T7</div>
        </div>

        {/* Mini Month Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {miniDays.map((dayObj, idx) => {
            const isToday = dayObj.dateStr === todayISO
            const isSelected = dayObj.dateStr === formatDate(selectedDate.toISOString())
            const isInActiveWeek = activeWeekISOs.includes(dayObj.dateStr)

            return (
              <button
                type="button"
                key={idx}
                onClick={() => {
                  setSelectedDate(dayObj.date)
                  if (dayObj.date.getMonth() !== currentMonthDate.getMonth()) {
                    setCurrentMonthDate(
                      new Date(dayObj.date.getFullYear(), dayObj.date.getMonth(), 1)
                    )
                  }
                }}
                className={`w-6 h-6 mx-auto flex items-center justify-center rounded-full text-[10.5px] font-bold transition-all cursor-pointer ${
                  isToday
                    ? 'bg-[#3B82F6] text-white shadow-sm shadow-blue-500/30'
                    : isSelected
                      ? 'bg-blue-100 text-blue-900 ring-2 ring-[#3B82F6]'
                      : isInActiveWeek
                        ? 'bg-blue-50/80 text-blue-900 font-extrabold'
                        : dayObj.isCurrentMonth
                          ? 'text-slate-700 hover:bg-white/60'
                          : 'text-slate-400/60'
                }`}
              >
                {dayObj.date.getDate()}
              </button>
            )
          })}
        </div>

        {/* Today's Schedule Section (Max 5 items, prioritized by Ongoing -> Upcoming -> Past) */}
        <div className="pt-2.5 border-t border-white/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-[#3B82F6]/15 text-[#3B82F6] rounded-lg border border-blue-400/30">
                <CalendarIcon size={13} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                  Lịch hôm nay ({todayInterviews.length})
                </h4>
                <p className="text-[9px] font-semibold text-slate-500 capitalize">
                  {formattedTodayText}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Items List (Max 5, prioritized) */}
          <div className="pt-2 overflow-y-auto pr-0.5 space-y-0">
            {todayInterviews.length > 0 ? (
              todayInterviews.map((item, idx) => {
                const cand = item.candidateId
                const candName =
                  typeof cand === 'object' ? cand?.fullName || cand?.name : 'Ứng viên'
                const jobTitle =
                  typeof item.jobDescriptionId === 'object' ? item.jobDescriptionId?.title : ''
                const isLast = idx === todayInterviews.length - 1

                const rank = getInterviewTimeRank(item)

                const dotColorClass =
                  rank === 0
                    ? 'bg-[#3B82F6] shadow-blue-500/40 ring-2 ring-blue-300'
                    : rank === 1
                      ? 'bg-emerald-500 shadow-emerald-500/30'
                      : 'bg-slate-400 shadow-slate-400/20'

                const lineColorClass =
                  rank === 0
                    ? 'bg-blue-300/80'
                    : rank === 1
                      ? 'bg-emerald-300/60'
                      : 'bg-slate-200/80'

                const statusBadge =
                  rank === 0 ? (
                    <span className="text-[8.5px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-extrabold animate-pulse">
                      Đang diễn ra
                    </span>
                  ) : rank === 1 ? (
                    <span className="text-[8.5px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 font-extrabold">
                      Sắp diễn ra
                    </span>
                  ) : (
                    <span className="text-[8.5px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-extrabold">
                      Đã xong
                    </span>
                  )

                return (
                  <div
                    key={item._id}
                    onClick={() => router.push(`/interviews/${item._id}/evaluate`)}
                    className="flex gap-2.5 group cursor-pointer relative pb-3"
                  >
                    {/* Left Timeline Line & Dot Column */}
                    <div className="flex flex-col items-center shrink-0 w-3 pt-0.5 relative">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${dotColorClass} shadow-xs z-10`}
                      />
                      {!isLast && (
                        <span className={`w-0.5 absolute top-3 bottom-0 ${lineColorClass}`} />
                      )}
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0 transition-all group-hover:translate-x-0.5">
                      <div className="text-[10px] font-extrabold text-[#3B82F6] flex items-center justify-between leading-none">
                        <span>
                          {item.startTime} - {item.endTime}
                        </span>
                        {statusBadge}
                      </div>
                      <div className="text-[11px] font-extrabold text-slate-900 truncate leading-tight mt-0.5 group-hover:text-[#3B82F6] transition-colors">
                        {candName}
                      </div>
                      {jobTitle && (
                        <div className="text-[9.5px] font-semibold text-slate-500 truncate leading-tight mt-0.5">
                          {jobTitle}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-2.5 px-2 text-center text-[10px] font-bold text-slate-400 bg-white/30 rounded-xl border border-white/50">
                Không có lịch phỏng vấn hôm nay
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Google Calendar 8 AM - 5 PM Weekly Time-Grid */}
      <div className="flex-1 bg-white/20 border border-white/70 shadow-xl shadow-blue-500/5 rounded-3xl p-3 space-y-2 overflow-hidden flex flex-col">
        {/* Top Header Controls + Horizontal Legend Indicators */}
        <div className="flex items-center justify-between gap-2 pb-0.5">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={goToday}
              className="px-2.5 py-0.5 bg-white/80 border border-white/90 hover:bg-white text-slate-800 text-xs font-extrabold rounded-lg transition-all cursor-pointer shadow-2xs"
            >
              Hôm nay
            </button>

            <div className="flex items-center gap-0.5 bg-white/50 border border-white/70 p-0.5 rounded-lg shadow-2xs">
              <button
                type="button"
                onClick={prevWeek}
                className="p-0.5 text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded transition-all cursor-pointer"
                title="Tuần trước"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={nextWeek}
                className="p-0.5 text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded transition-all cursor-pointer"
                title="Tuần sau"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <h2 className="text-xs font-extrabold text-slate-900 tracking-tight">
              {weekRangeTitle}
            </h2>
          </div>

          {/* Horizontal Legend Indicators Bar */}
          <div className="flex items-center gap-3 text-[10px] font-extrabold text-slate-700 bg-white/40 px-2.5 py-1 rounded-lg border border-white/70 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              <span>Đã lên lịch</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Hoàn thành</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Đã hủy</span>
            </div>
          </div>
        </div>

        {/* Weekly Time-Grid Container */}
        <div className="border-2 border-slate-300/80 bg-white/15 rounded-2xl overflow-hidden shadow-md flex flex-col flex-1">
          {/* Header Row: GMT column + 7 Day Headers with bold border-b & border-r */}
          <div className="flex border-b-2 border-slate-300/80 bg-white/40 text-center font-extrabold text-xs text-slate-700 py-1">
            <div className="w-16 shrink-0 text-[10px] text-slate-600 uppercase tracking-wider flex items-center justify-center border-r-2 border-slate-300/80 font-black">
              GMT+07
            </div>
            <div className="flex-1 grid grid-cols-7">
              {weekDays.map((day, dIdx) => {
                const dayStr = formatDate(day.toISOString())
                const isToday = dayStr === todayISO
                const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']

                return (
                  <div
                    key={dIdx}
                    className={`flex flex-col items-center justify-center py-0.5 ${
                      dIdx < 6 ? 'border-r border-slate-300/80' : ''
                    }`}
                  >
                    <span className="text-[9.5px] text-slate-500 uppercase font-bold">
                      {dayNames[dIdx]}
                    </span>
                    <span
                      className={`text-xs font-extrabold w-5 h-5 flex items-center justify-center rounded-full mt-0.5 ${
                        isToday
                          ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/30'
                          : 'text-slate-800'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Time Grid Rows (8 AM to 5 PM - Single Screen Viewport, No Scrollbar) */}
          <div className="relative overflow-hidden flex-1">
            <div className="flex relative" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>
              {/* Left Hour Labels Column (Narrow w-16 width) */}
              <div className="w-16 shrink-0 border-r-2 border-slate-300/80 bg-white/20 select-none">
                {hours.map((h, hIdx) => {
                  const label = h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`
                  return (
                    <div
                      key={hIdx}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      className="text-[9.5px] font-bold text-slate-500 pr-2 pt-0.5 text-right border-b border-slate-300/60"
                    >
                      {label}
                    </div>
                  )
                })}
              </div>

              {/* 7 Day Main Columns with Horizontal Hour Grid lines */}
              <div className="flex-1 grid grid-cols-7 relative">
                {weekDays.map((weekDay, dIdx) => {
                  const dayISOStr = formatDate(weekDay.toISOString())

                  // Filter interviews for this day
                  const dayEvents = interviews.filter(
                    (inv) => isOfficialSchedule(inv) && formatDate(inv.date) === dayISOStr
                  )

                  return (
                    <div
                      key={dIdx}
                      className={`relative ${dIdx < 6 ? 'border-r border-slate-300/80' : ''}`}
                    >
                      {/* Background hour grid lines */}
                      {hours.map((_, hIdx) => (
                        <div
                          key={hIdx}
                          style={{ height: `${HOUR_HEIGHT}px` }}
                          className="border-b border-slate-300/60"
                        />
                      ))}

                      {/* Positioned Event Cards */}
                      {dayEvents.map((event) => {
                        const start = parseTime(event.startTime)
                        const end = parseTime(event.endTime)

                        // Calculate start offset from 8 AM
                        const startOffsetMinutes = (start.hour - 8) * 60 + start.min
                        const endOffsetMinutes = (end.hour - 8) * 60 + end.min
                        let durationMinutes = endOffsetMinutes - startOffsetMinutes
                        if (durationMinutes <= 0) durationMinutes = 60 // Default 1 hour

                        const topPx = (startOffsetMinutes / 60) * HOUR_HEIGHT
                        const heightPx = Math.max((durationMinutes / 60) * HOUR_HEIGHT, 34)

                        const cand = event.candidateId
                        const candName =
                          typeof cand === 'object' ? cand?.fullName || cand?.name : 'Ứng viên'
                        const jobTitle =
                          typeof event.jobDescriptionId === 'object'
                            ? event.jobDescriptionId?.title
                            : ''

                        return (
                          <div
                            key={event._id}
                            style={{
                              top: `${topPx}px`,
                              height: `${heightPx}px`
                            }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              setHoveredInterview({
                                item: event,
                                x: rect.left + rect.width / 2,
                                y: rect.top - 10
                              })
                            }}
                            onMouseLeave={() => setHoveredInterview(null)}
                            onClick={() => router.push(`/interviews/${event._id}/evaluate`)}
                            className={`absolute inset-x-1 p-1 px-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer overflow-hidden z-10 flex flex-col justify-center gap-0.5 border ${getEventBgByStatus(
                              event.status
                            )}`}
                          >
                            <div className="flex items-center gap-1 text-[9.5px] font-extrabold truncate leading-tight">
                              <span>
                                {event.startTime} - {event.endTime}
                              </span>
                            </div>
                            <div className="truncate font-extrabold text-slate-900 leading-tight">
                              {jobTitle}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
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
  )
}
