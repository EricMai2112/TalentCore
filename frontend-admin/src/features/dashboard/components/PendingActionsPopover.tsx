'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, ChevronRight, FileText, Calendar, X } from 'lucide-react';
import Link from 'next/link';
import { PendingActions } from '../types/dashboard.types';

interface Props {
  pendingActions: PendingActions;
}

export default function PendingActionsPopover({ pendingActions }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!pendingActions || pendingActions.total === 0) return null;

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-2xs backdrop-blur-md border ${
          isOpen
            ? 'bg-amber-100/90 text-amber-800 border-amber-300 ring-2 ring-amber-400/20'
            : 'bg-amber-50/90 hover:bg-amber-100/90 text-amber-700 border-amber-200/80 hover:border-amber-300'
        }`}
        title="Nhấp để xem chi tiết các việc cần xử lý ngay"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
        <AlertCircle size={13} className="text-amber-600 stroke-[2.3]" />
        <span>{pendingActions.total} cần xử lý</span>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-xl shadow-amber-500/10 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <AlertCircle size={12} className="stroke-[2.5]" />
              </div>
              <h4 className="text-xs font-black text-slate-800">Hạng mục cần xử lý ngay</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={13} />
            </button>
          </div>

          <div className="space-y-2">
            {pendingActions.overdueOffers > 0 && (
              <Link
                href="/offers"
                onClick={() => setIsOpen(false)}
                className="flex items-start gap-2.5 p-2 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/60 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 group-hover:text-amber-800">
                    {pendingActions.overdueOffers} Offer quá hạn
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Đã gửi ứng viên quá 3 ngày chưa nhận được phản hồi
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-amber-600 mt-1 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}

            {pendingActions.pendingInterviewResults > 0 && (
              <Link
                href="/interviews"
                onClick={() => setIsOpen(false)}
                className="flex items-start gap-2.5 p-2 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200/60 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-800">
                    {pendingActions.pendingInterviewResults} PV chờ kết quả
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Phỏng vấn đã hoàn tất cần nhập đánh giá và kết quả
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-indigo-600 mt-1 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
