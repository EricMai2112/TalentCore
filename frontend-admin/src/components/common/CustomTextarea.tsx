'use client'

import React, { forwardRef } from 'react'

export interface CustomTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  required?: boolean
  error?: string
  helperText?: string
}

const CustomTextarea = forwardRef<HTMLTextAreaElement, CustomTextareaProps>(
  ({ label, required, error, helperText, className = '', rows = 4, disabled, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          rows={rows}
          disabled={disabled}
          className={`w-full p-3.5 bg-white/25 border ${
            error
              ? 'border-rose-400 ring-4 ring-rose-500/10 focus:border-rose-500'
              : 'border-white/60 hover:bg-white/40 hover:border-slate-300 focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/15 focus:bg-white/50'
          } rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none resize-none transition-all shadow-2xs ${
            disabled
              ? 'bg-slate-100/70 text-slate-400 border-slate-200/80 cursor-not-allowed opacity-75'
              : ''
          } ${className}`}
          {...props}
        />

        {error ? (
          <p className="text-[11px] font-bold text-rose-600">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] font-medium text-slate-400">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

CustomTextarea.displayName = 'CustomTextarea'

export default CustomTextarea
