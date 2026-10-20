'use client';

import React from 'react';
import { Target, Briefcase, Zap, CheckCircle2 } from 'lucide-react';
import { OverviewKpis } from '../types/dashboard.types';

interface KpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  blobGradient: string;
  label: string;
  value: string | number;
  unit: string;
  badgeText: string;
  badgeColor: string;
  tooltip?: string;
}

function KpiCard({
  icon,
  iconBg,
  blobGradient,
  label,
  value,
  unit,
  badgeText,
  badgeColor,
  tooltip,
}: KpiCardProps) {
  return (
    <div
      title={tooltip}
      className="relative bg-white/30 backdrop-blur-md border border-white/60 rounded-2xl p-2.5 px-3.5 
                 shadow-md shadow-blue-500/5 hover:bg-white/40 transition-all duration-200 
                 overflow-hidden flex items-center gap-3 h-[68px] group min-w-0"
    >
      {/* Ambient Accent background */}
      <div
        className={`absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${blobGradient} blur-lg pointer-events-none`}
      />

      {/* Left: Icon Badge */}
      <div
        className={`w-8.5 h-8.5 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${iconBg}`}
      >
        {icon}
      </div>

      {/* Right: Label + Value & Badge */}
      <div className="relative z-10 flex-1 min-w-0">
        <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block truncate leading-tight">
          {label}
        </span>
        <div className="flex items-baseline justify-between gap-1.5 mt-0.5">
          <div className="flex items-baseline gap-1 truncate">
            <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
              {value}
            </span>
            {unit && (
              <span className="text-[10px] font-bold text-slate-400 leading-none truncate">
                {unit}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 leading-none ${badgeColor}`}
          >
            {badgeText}
          </span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  kpis: OverviewKpis;
}

export default function KpiStatsRow({ kpis }: Props) {
  const { headcountPlan, jobs, timeToHire, offers } = kpis;

  const cards: KpiCardProps[] = [
    {
      icon: <Target size={16} className="stroke-[2.2]" />,
      iconBg: 'bg-blue-100/90 text-[#3B82F6] border-blue-200/60',
      blobGradient: 'from-blue-500/15 via-sky-400/10 to-transparent',
      label: 'CHỈ TIÊU TUYỂN DỤNG',
      value: `${headcountPlan?.hired || 0} / ${headcountPlan?.target || 0}`,
      unit: 'người',
      badgeText: `${headcountPlan?.percentage || 0}% đạt`,
      badgeColor: 'bg-blue-50 text-[#3B82F6] border-blue-100',
      tooltip: `Đã tuyển được ${headcountPlan?.hired || 0} trên tổng chỉ tiêu ${headcountPlan?.target || 0} nhân sự`,
    },
    {
      icon: <Briefcase size={16} className="stroke-[2.2]" />,
      iconBg: 'bg-indigo-100/90 text-indigo-600 border-indigo-200/60',
      blobGradient: 'from-indigo-500/15 via-purple-400/10 to-transparent',
      label: 'VỊ TRÍ ĐANG MỞ',
      value: jobs?.active || 0,
      unit: 'vị trí',
      badgeText: `+${jobs?.newCount ?? 0} trong 30 ngày`,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      tooltip: `Có ${jobs?.active || 0} vị trí đang mở nhận hồ sơ (+${jobs?.newCount ?? 0} vị trí tạo mới trong 30 ngày qua trên tổng số ${jobs?.total || 0} tin tuyển dụng)`,
    },
    {
      icon: <Zap size={16} className="stroke-[2.2]" />,
      iconBg: 'bg-amber-100/90 text-amber-600 border-amber-200/60',
      blobGradient: 'from-amber-500/15 via-orange-400/10 to-transparent',
      label: 'TỐC ĐỘ TUYỂN DỤNG',
      value: timeToHire?.isEmpty || timeToHire?.avgDays === null ? '—' : timeToHire.avgDays,
      unit: timeToHire?.isEmpty ? '' : 'ngày',
      badgeText: 'Mục tiêu ≤ 25 ngày',
      badgeColor:
        timeToHire?.avgDays && timeToHire.avgDays > 25
          ? 'bg-rose-50 text-rose-700 border-rose-100'
          : 'bg-amber-50 text-amber-700 border-amber-100',
      tooltip: 'Thời gian trung bình từ lúc ứng viên nộp đơn đến khi chấp nhận Offer (Mục tiêu chuẩn ≤ 25 ngày)',
    },
    {
      icon: <CheckCircle2 size={16} className="stroke-[2.2]" />,
      iconBg: 'bg-emerald-100/90 text-emerald-600 border-emerald-200/60',
      blobGradient: 'from-emerald-500/15 via-teal-400/10 to-transparent',
      label: 'TỶ LỆ NHẬN VIỆC',
      value: `${offers?.acceptanceRate || 0}%`,
      unit: 'chấp thuận',
      badgeText: 'Mục tiêu ≥ 80%',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      tooltip: `${offers?.accepted || 0} offer đồng ý trên tổng số offer đã có phản hồi (Mục tiêu chuẩn ≥ 80%)`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
      {cards.map((card, i) => (
        <KpiCard key={i} {...card} />
      ))}
    </div>
  );
}
