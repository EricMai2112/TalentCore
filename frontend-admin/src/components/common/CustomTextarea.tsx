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
          className={`w-full p-4 bg-slate-50/80 border ${
            error
              ? "border-rose-300 ring-2 ring-rose-500/10 focus:border-rose-500"
              : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          } rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white outline-none resize-none transition-all cursor-text ${
            disabled ? "bg-slate-100/90 text-slate-400 border-slate-200 cursor-not-allowed opacity-75" : ""
          } ${className}`}
          {...props}
        />

        {error ? (
          <p className="text-[11px] font-medium text-rose-500">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] font-medium text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

CustomTextarea.displayName = "CustomTextarea";

export default CustomTextarea;
