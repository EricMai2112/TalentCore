"use client";

import React, { forwardRef } from "react";

export interface CustomTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

const CustomTextarea = forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  ({ label, required, error, helperText, className = "", rows = 4, disabled, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          rows={rows}
          disabled={disabled}
          className={`w-full p-4 bg-white/95 backdrop-blur-md border ${
            error
              ? "border-rose-400 ring-4 ring-rose-500/10 focus:border-rose-500"
              : "border-[#1261A6]/35 hover:border-[#1261A6]/60 focus:border-[#1261A6] focus:ring-4 focus:ring-[#1261A6]/15 focus:bg-white"
          } rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none resize-none transition-all shadow-2xs ${
            disabled ? "bg-slate-100/90 text-slate-400 border-slate-200 cursor-not-allowed opacity-75" : ""
          } ${className}`}
          {...props}
        />

        {error ? (
          <p className="text-[11px] font-bold text-rose-600">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] font-medium text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

CustomTextarea.displayName = "CustomTextarea";

export default CustomTextarea;
