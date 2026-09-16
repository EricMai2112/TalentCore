"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown, Check } from "lucide-react";

export interface CustomTimePickerProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  value: string; // "HH:mm" e.g. "14:00"
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const COMMON_TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00"
];

export default function CustomTimePicker({
  label,
  required,
  error,
  helperText,
  value,
  onChange,
  placeholder = "--:--",
  disabled = false,
  className = "",
}: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse hour & minute
  const [hour, setHour] = useState<string>(value ? value.split(":")[0] || "14" : "14");
  const [minute, setMinute] = useState<string>(value ? value.split(":")[1] || "00" : "00");

  useEffect(() => {
    if (value && value.includes(":")) {
      const parts = value.split(":");
      setHour(parts[0]);
      setMinute(parts[1]);
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

  const handleSelectSlot = (slot: string) => {
    onChange(slot);
    setIsOpen(false);
  };

  const handleCustomTimeApply = () => {
    const formatted = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const hoursList = Array.from({ length: 15 }, (_, i) => String(i + 7).padStart(2, "0")); // 07 to 21
  const minutesList = ["00", "15", "30", "45"];

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
              ? "bg-white/95 text-slate-900 border-[#3B82F6] ring-4 ring-[#3B82F6]/15 shadow-sm"
              : "bg-white/55 backdrop-blur-md text-slate-800 border-white/65 hover:bg-white/75 hover:border-slate-300 focus:bg-white/90"
          } ${error ? "border-rose-400 ring-4 ring-rose-500/10" : ""} cursor-pointer`}
        >
          <div className="flex items-center gap-2.5">
            <Clock size={18} className="text-[#3B82F6] shrink-0" />
            <span className={value ? "text-slate-900 font-bold" : "text-slate-400 font-normal"}>
              {value || placeholder}
            </span>
          </div>
          <ChevronDown
            size={18}
            className={`text-[#3B82F6] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Time Picker Dropdown Panel */}
        {isOpen && !disabled && (
          <div className="absolute left-0 top-full mt-2 w-64 z-50 bg-white/90 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-xl shadow-blue-500/10 p-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Khung giờ phổ biến
            </div>

            {/* Quick Time Slots Grid */}
            <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1 mb-3">
              {COMMON_TIME_SLOTS.map((slot) => {
                const isSelected = slot === value;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleSelectSlot(slot)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      isSelected
                        ? "bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/20"
                        : "bg-slate-50/80 text-slate-800 hover:bg-[#3B82F6]/10 hover:text-[#3B82F6] border border-slate-200/60"
                    }`}
                  >
                    <span>{slot}</span>
                    {isSelected && <Check size={12} className="shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Hour & Minute Selectors */}
            <div className="pt-2 border-t border-slate-200/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Tùy chỉnh giờ
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  className="w-1/2 p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3B82F6] cursor-pointer"
                >
                  {hoursList.map((h) => (
                    <option key={h} value={h}>
                      {h} giờ
                    </option>
                  ))}
                </select>

                <span className="text-[#3B82F6] font-bold">:</span>

                <select
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  className="w-1/2 p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3B82F6] cursor-pointer"
                >
                  {minutesList.map((m) => (
                    <option key={m} value={m}>
                      {m} phút
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleCustomTimeApply}
                className="mt-2.5 w-full py-2 bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Xác nhận thời gian
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
