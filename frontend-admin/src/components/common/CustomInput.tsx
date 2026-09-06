"use client";

import React, { forwardRef } from "react";

export interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  icon?: React.ReactNode;
  error?: string;
  helperText?: string;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, required, icon, error, helperText, className = "", disabled, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center shrink-0">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={`w-full ${
              icon ? "pl-11 pr-4" : "px-4"
            } py-3.5 bg-slate-50/80 border ${
              error
                ? "border-rose-300 ring-2 ring-rose-500/10 focus:border-rose-500"
                : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            } rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:bg-white outline-none transition-all cursor-text ${
              disabled ? "bg-slate-100/90 text-slate-400 border-slate-200 cursor-not-allowed opacity-75" : ""
            } ${className}`}
            {...props}
          />
        </div>

        {error ? (
          <p className="text-[11px] font-medium text-rose-500">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] font-medium text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";

export default CustomInput;
