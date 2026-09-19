'use client'

import React, { forwardRef } from 'react'

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  required?: boolean
  icon?: React.ReactNode
  rightElement?: React.ReactNode
  error?: string
  helperText?: string
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  (
    { label, required, icon, rightElement, error, helperText, className = '', disabled, ...props },
    ref
  ) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 z-10 text-[#3B82F6] pointer-events-none flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={`w-full ${icon ? 'pl-11' : 'px-4'} ${
              rightElement ? 'pr-11' : 'pr-4'
            } py-2.5 sm:py-3 bg-white/25 border ${
              error
                ? 'border-rose-400 ring-4 ring-rose-500/10 focus:border-rose-500'
                : 'border-white/60 hover:bg-white/40 hover:border-[#3B82F6]/50 focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/15 focus:bg-white/50'
            } rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none transition-all shadow-2xs ${
              disabled
                ? 'bg-slate-100/90 text-slate-400 border-slate-200 cursor-not-allowed opacity-75'
                : ''
            } ${className}`}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3.5 z-10 flex items-center justify-center shrink-0">
              {rightElement}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[11px] font-bold text-rose-600 mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] font-medium text-slate-400 mt-1">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

GlassInput.displayName = 'GlassInput'

export default GlassInput
