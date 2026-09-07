"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Lock, Check } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface CustomSelectProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  isLocked?: boolean;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
  className?: string;
}

export default function CustomSelect({
  label,
  required,
  error,
  helperText,
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  disabled = false,
  isLocked = false,
  icon,
  size = "lg",
  align = "left",
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current ? dropdownRef.current.offsetHeight : 240;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placeAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    const style: React.CSSProperties = {
      position: "fixed",
      left: align === "right" ? "auto" : `${rect.left}px`,
      right: align === "right" ? `${window.innerWidth - rect.right}px` : "auto",
      minWidth: `${rect.width}px`,
      maxWidth: "calc(100vw - 32px)",
      zIndex: 99999,
    };

    if (placeAbove) {
      style.bottom = `${window.innerHeight - rect.top + 6}px`;
      style.top = "auto";
    } else {
      style.top = `${rect.bottom + 6}px`;
      style.bottom = "auto";
    }

    setMenuStyle(style);
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    const timer = requestAnimationFrame(updatePosition);

    const handleScrollOrResize = (e: Event) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      updatePosition();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      cancelAnimationFrame(timer);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, align]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideButton = buttonRef.current && buttonRef.current.contains(target);
      const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target);

      if (!isInsideButton && !isInsideDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const sizeClasses = {
    sm: "px-3 py-1.5 rounded-xl text-xs font-bold",
    md: "px-3.5 py-2.5 rounded-2xl text-xs font-bold",
    lg: "px-4 py-3.5 rounded-2xl text-sm font-bold",
  };

  const dropdownMenu = isOpen && !disabled && !isLocked && (
    <div
      ref={dropdownRef}
      style={menuStyle}
      className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto"
    >
      {options.length === 0 ? (
        <div className="p-3 text-center text-xs text-slate-400 font-medium">
          Không có lựa chọn nào.
        </div>
      ) : (
        options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`p-3 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                isSelected
                  ? "bg-indigo-50 text-indigo-900"
                  : "hover:bg-slate-50 text-slate-800"
              }`}
            >
              <div className="min-w-0 pr-2">
                <span className="block truncate">{opt.label}</span>
                {opt.subLabel && (
                  <span className="text-[11px] text-slate-400 font-medium block truncate mt-0.5">
                    {opt.subLabel}
                  </span>
                )}
              </div>
              {isSelected && <Check size={16} className="text-indigo-600 shrink-0" />}
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div
      className={`space-y-1.5 relative ${
        className ? className : size === "sm" ? "w-auto min-w-[160px]" : "w-full"
      }`}
      ref={containerRef}
    >
      {label && (
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Trigger Button */}
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled || isLocked}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between gap-2.5 ${sizeClasses[size]} transition-all border shadow-2xs outline-none text-left ${
            disabled || isLocked
              ? "bg-slate-100/90 text-slate-400 border-slate-200 cursor-not-allowed opacity-75"
              : isOpen
              ? "bg-white text-slate-900 border-indigo-500 ring-4 ring-indigo-500/10"
              : "bg-slate-50/80 text-slate-900 border-slate-200 hover:bg-slate-100/80 focus:bg-white"
          } ${error ? "border-rose-300 ring-2 ring-rose-500/10" : ""} cursor-pointer`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
            <span
              className={`whitespace-nowrap ${
                !selectedOption && placeholder ? "text-slate-400 font-medium" : "text-slate-900"
              }`}
            >
              {displayLabel}
            </span>
          </div>

          <div className="shrink-0 ml-1">
            {disabled || isLocked ? (
              <Lock size={16} className="text-slate-400" />
            ) : (
              <ChevronDown
                size={18}
                className={`text-slate-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-indigo-600" : ""
                }`}
              />
            )}
          </div>
        </button>
      </div>

      {error ? (
        <p className="text-[11px] font-medium text-rose-500">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] font-medium text-slate-400">{helperText}</p>
      ) : null}

      {mounted && dropdownMenu && createPortal(dropdownMenu, document.body)}
    </div>
  );
}
