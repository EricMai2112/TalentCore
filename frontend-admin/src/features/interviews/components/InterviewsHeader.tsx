'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface InterviewsHeaderProps {
  totalCount: number;
}

export default function InterviewsHeader({ totalCount }: InterviewsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Quản lý phỏng vấn
        </h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          {totalCount} buổi phỏng vấn
        </p>
      </div>

      <Link
        href="/interviews/create"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-sm shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
      >
        <Plus size={18} />
        <span>Tạo lịch phỏng vấn</span>
      </Link>
    </div>
  );
}
