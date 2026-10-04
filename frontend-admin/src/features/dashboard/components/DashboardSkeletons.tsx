'use client';

import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

// ─── Compact KPI Skeleton ──────────────────────────────────────────────────
export function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,0.85fr)] gap-2.5 shrink-0 items-stretch">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white/40 border border-white/60 rounded-2xl p-2 px-2.5 animate-pulse flex items-center gap-2.5 h-[66px]"
        >
          <div className="w-8.5 h-8.5 rounded-xl bg-slate-200/60 shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="h-2 bg-slate-200/60 rounded w-14" />
            <div className="h-4 bg-slate-200/60 rounded w-10" />
          </div>
        </div>
      ))}
      {/* 6th column: Filter Skeleton */}
      <div className="bg-white/40 border border-white/60 rounded-2xl p-2 px-2.5 animate-pulse flex flex-col justify-center h-[66px] col-span-2 sm:col-span-1 lg:col-span-1">
        <div className="h-2 bg-slate-200/60 rounded w-12 mb-1.5" />
        <div className="h-7 bg-slate-200/60 rounded-xl w-full" />
      </div>
    </div>
  );
}

// ─── Flexible Box Skeleton ──────────────────────────────────────────────────
export function BoxSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-white/40 border border-white/60 rounded-2xl animate-pulse p-4 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="h-3.5 bg-slate-200/60 rounded w-28" />
        <div className="h-3 bg-slate-200/60 rounded w-12" />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-3/4 bg-slate-200/40 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Error State ─────────────────────────────────────────────────────────────
export function ErrorCard({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="bg-rose-50/70 border border-rose-200/60 rounded-2xl p-4 flex items-center justify-between text-left shrink-0">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="text-rose-500 shrink-0" size={20} />
        <div>
          <p className="text-xs font-bold text-rose-800">Không thể tải dữ liệu phân tích</p>
          <p className="text-[11px] text-rose-600">Vui lòng kiểm tra kết nối mạng hoặc thử lại.</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-xs font-bold text-rose-700 
                     bg-rose-100 hover:bg-rose-200 border border-rose-200 
                     rounded-lg px-2.5 py-1.5 transition-colors shrink-0"
        >
          <RefreshCw size={12} />
          Thử lại
        </button>
      )}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4 text-center">
      {icon && <div className="text-slate-300">{icon}</div>}
      <p className="text-xs text-slate-400 font-medium">{message}</p>
    </div>
  );
}
