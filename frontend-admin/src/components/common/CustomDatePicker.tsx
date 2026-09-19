"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

export interface CustomDatePickerProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  value: string; // ISO date string YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string;
  className?: string;
}

export default function CustomDatePicker({
  label,
  required,
  error,
  helperText,
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  disabled = false,
  minDate,
  className = "",
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date or default to current date
  const parseDate = (valStr: string) => {
    if (!valStr) return new Date();
    const parts = valStr.split("-");
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date();
  };

  const selectedDate = value ? parseDate(value) : null;
  const [viewDate, setViewDate] = useState<Date>(selectedDate || new Date());

  // Keep viewDate synchronized when value changes
  useEffect(() => {
    if (value) {
      setViewDate(parseDate(value));
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  // Generate calendar grid (42 days)
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week index: 0 = Mon, 1 = Tue, ..., 6 = Sun
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  const daysInMonth = lastDayOfMonth.getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: { day: number; monthOffset: number; dateStr: string }[] = [];

  // Previous month padded days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, d);
    const dateStr = formatDateStr(prevDate);
    calendarDays.push({ day: d, monthOffset: -1, dateStr });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const currDate = new Date(year, month, d);
    const dateStr = formatDateStr(currDate);
    calendarDays.push({ day: d, monthOffset: 0, dateStr });
  }

  // Next month padded days
  const remainingCells = 42 - calendarDays.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dateStr = formatDateStr(nextDate);
    calendarDays.push({ day: d, monthOffset: 1, dateStr });
  }

  function formatDateStr(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatDisplayDate(valStr: string) {
    if (!valStr) return "";
    const parts = valStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return valStr;
  }

  const todayStr = formatDateStr(new Date());

  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const monthNamesVi = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  return (
    <div className={`space-y-1.5 relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition-all shadow-2xs outline-none ${
            disabled
              ? "bg-slate-100/70 text-slate-400 border-slate-200/80 cursor-not-allowed opacity-75"
              : isOpen
              ? "bg-white/80 text-slate-900 border-[#3B82F6] ring-4 ring-[#3B82F6]/15 shadow-sm"
              : "bg-white/25 text-slate-800 border-white/60 hover:bg-white/40 hover:border-slate-300 focus:bg-white/50"
          } ${error ? "border-rose-400 ring-4 ring-rose-500/10" : ""} cursor-pointer`}
        >
          <div className="flex items-center gap-2.5">
            <CalendarIcon size={18} className="text-[#3B82F6] shrink-0" />
            <span className={value ? "text-slate-900 font-bold" : "text-slate-400 font-normal"}>
              {value ? formatDisplayDate(value) : placeholder}
            </span>
          </div>
          <ChevronDown
            size={18}
            className={`text-[#3B82F6] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Calendar Dropdown Panel */}
        {isOpen && !disabled && (
          <div className="absolute left-0 top-full mt-2 w-80 z-50 bg-white/95 border border-white/80 rounded-2xl shadow-xl shadow-blue-500/10 p-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header Month Navigation */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200/60">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl border border-slate-200/80 hover:bg-[#3B82F6]/10 text-[#3B82F6] transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs sm:text-sm font-bold text-slate-900">
                {monthNamesVi[month]} {year}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl border border-slate-200/80 hover:bg-[#3B82F6]/10 text-[#3B82F6] transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((dayLabel) => (
                <span key={dayLabel} className="text-[11px] font-bold text-slate-400 uppercase">
                  {dayLabel}
                </span>
              ))}
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarDays.map((cell, idx) => {
                const isSelected = cell.dateStr === value;
                const isToday = cell.dateStr === todayStr;
                const isOtherMonth = cell.monthOffset !== 0;
                const isDisabled = minDate ? cell.dateStr < minDate : false;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectDay(cell.dateStr)}
                    className={`h-9 w-full rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? "bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/30"
                        : isToday
                        ? "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 font-extrabold"
                        : isOtherMonth
                        ? "text-slate-300 hover:bg-slate-50"
                        : "text-slate-800 hover:bg-slate-100/80"
                    } ${isDisabled ? "opacity-30 cursor-not-allowed" : ""}`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {/* Footer Quick Action */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleSelectDay(todayStr)}
                className="text-xs font-bold text-[#3B82F6] hover:underline transition-colors cursor-pointer"
              >
                Hôm nay ({formatDisplayDate(todayStr)})
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-[11px] font-bold text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] font-medium text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
