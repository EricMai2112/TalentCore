"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Lock, Check } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  isLocked?: boolean;
  icon?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  disabled = false,
  isLocked = false,
  icon,
  align = "left",
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border shadow-2xs ${
          disabled
            ? "bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed"
            : isOpen
            ? "bg-white text-indigo-600 border-indigo-500 ring-2 ring-indigo-500/20"
            : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
        } cursor-pointer`}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          <span className="truncate">{displayLabel}</span>
        </div>

        <div className="shrink-0 ml-1">
          {disabled || isLocked ? (
            <Lock size={13} className="text-slate-400" />
          ) : (
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-indigo-600" : ""
              }`}
            />
          )}
        </div>
      </button>

      {/* Options Menu Panel */}
      {isOpen && !disabled && (
        <div
          className={`absolute top-full mt-1.5 min-w-[180px] w-max max-w-[calc(100vw-32px)] sm:max-w-xs z-50 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-1.5 text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-150 overflow-hidden ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="max-h-60 overflow-y-auto space-y-0.5 px-1">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 rounded-xl text-left font-medium transition-colors flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={14} className="text-indigo-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
