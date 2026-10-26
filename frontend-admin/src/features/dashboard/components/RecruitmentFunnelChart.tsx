'use client';

import React, { useState } from 'react';
import { Filter, Users, TrendingUp } from 'lucide-react';
import { RecruitmentFunnel, FunnelStage } from '../types/dashboard.types';
import { EmptyState } from './DashboardSkeletons';

interface Props {
  funnel?: RecruitmentFunnel;
}

// Bảng màu gradient tươi sáng, đồng bộ hoàn toàn với palette của Tiến độ Phòng ban & Dashboard
const STAGE_GRADIENTS: Record<number, { gradient: string; dotColor: string }> = {
  1: { gradient: 'from-blue-500 to-indigo-400', dotColor: '#3B82F6' },
  2: { gradient: 'from-sky-400 to-cyan-400', dotColor: '#06B6D4' },
  3: { gradient: 'from-violet-500 to-purple-400', dotColor: '#8B5CF6' },
  4: { gradient: 'from-rose-500 to-pink-400', dotColor: '#F43F5E' },
  5: { gradient: 'from-amber-500 to-orange-400', dotColor: '#F59E0B' },
  6: { gradient: 'from-emerald-500 to-teal-400', dotColor: '#10B981' },
};

export default function RecruitmentFunnelChart({ funnel }: Props) {
  const [hoveredStage, setHoveredStage] = useState<{ stage: FunnelStage; dotColor: string } | null>(null);

  if (!funnel || funnel.isEmpty || funnel.totalApplications === 0) {
    return (
      <div className="bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl p-3.5 
                      shadow-sm shadow-blue-500/5 h-full flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100/90 text-indigo-600 border border-indigo-200/60 flex items-center justify-center">
              <Filter size={14} className="stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold leading-tight text-slate-800">Phễu Tuyển Dụng</h3>
              <p className="text-[10px] text-slate-400">Tiến trình chuyển đổi ứng viên theo pipeline</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState message="Chưa có hồ sơ ứng viên" icon={<Filter size={24} />} />
        </div>
      </div>
    );
  }

  const stages = funnel.stages || [];
  const totalApps = funnel.totalApplications;
  const overallRate = funnel.conversionRates?.overallRate ?? 0;
  const maxCount = stages[0]?.count || totalApps || 1;

  return (
    <div className="bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl p-3.5 
                    shadow-sm shadow-blue-500/5 h-full flex flex-col justify-between min-h-0 relative">
      {/* ─── Header đồng bộ với Tiến độ Phòng ban ───────────── */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100/90 text-indigo-600 border border-indigo-200/60 flex items-center justify-center">
            <Filter size={14} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs font-bold leading-tight text-slate-800">Phễu Tuyển Dụng</h3>
            <p className="text-[10px] text-slate-400">Theo quy trình tuyển dụng chuẩn</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-medium text-slate-400">
            {totalApps.toLocaleString()} hồ sơ
          </span>
          <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-md border text-emerald-700 bg-emerald-50 border-emerald-200/80">
            {overallRate}% trúng tuyển
          </span>
        </div>
      </div>

      {/* ─── Body: 2 Cột (Trái: Tên giai đoạn - Phải: Biểu đồ phễu) ─── */}
      <div className="flex-1 min-h-0 flex flex-col justify-around py-0.5 space-y-1 relative">
        {stages.map((stage, index) => {
          const count = stage.count || 0;
          const ratio = maxCount > 0 ? count / maxCount : 0;
          // Scale mượt mà từ 100% xuống min 32% ở cột phải để con số luôn vừa vặn
          const widthPercent = Math.max(30, Math.min(100, Math.round(30 + ratio * 70)));

          const stageOrder = stage.order || index + 1;
          const style = STAGE_GRADIENTS[stageOrder] || STAGE_GRADIENTS[((stageOrder - 1) % 6) + 1];
          const isHovered = hoveredStage?.stage.id === stage.id;

          return (
            <div
              key={stage.id || index}
              className={`flex items-center justify-between gap-2 px-1 py-0.5 rounded-lg 
                          transition-all duration-200 cursor-pointer group ${
                            isHovered ? 'bg-slate-100/60' : 'hover:bg-slate-50/70'
                          }`}
              onMouseEnter={() => setHoveredStage({ stage, dotColor: style.dotColor })}
              onMouseLeave={() => setHoveredStage(null)}
            >
              {/* CỘT TRÁI: Tên giai đoạn (Chiếm 42% chiều ngang) */}
              <div className="w-[42%] flex items-center gap-1.5 min-w-0 shrink-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
                  style={{ backgroundColor: style.dotColor }}
                />
                <span className="text-[10.5px] font-semibold text-slate-700 truncate group-hover:text-slate-900 leading-tight">
                  {stage.name}
                </span>
              </div>

              {/* CỘT PHẢI: Khối phễu căn giữa (Chiếm 58% chiều ngang) */}
              <div className="w-[58%] flex items-center justify-center">
                <div
                  className={`h-5.5 sm:h-6 rounded-lg flex items-center justify-center px-1.5 
                             transition-all duration-300 shadow-xs select-none relative overflow-hidden
                             bg-gradient-to-r ${style.gradient} ${
                               isHovered ? 'shadow-md brightness-105 scale-[1.02]' : 'group-hover:brightness-105'
                             }`}
                  style={{
                    width: `${widthPercent}%`,
                  }}
                >
                  {/* Soft sheen highlight */}
                  <div className="absolute inset-x-0 top-0 h-[35%] bg-white/15 pointer-events-none" />

                  {/* Centered count and percentage */}
                  <div className="relative z-10 flex items-center justify-center gap-1 text-white leading-none whitespace-nowrap">
                    <span className="text-[11px] font-black tracking-wide drop-shadow-xs">
                      {count.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-white/85 font-semibold">
                      ({stage.percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ─── Interactive Tooltip on Hover ────────────────── */}
        {hoveredStage && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30
                          bg-slate-900/90 text-white backdrop-blur-md px-3 py-2 rounded-xl shadow-xl border border-white/20
                          text-[11px] min-w-[185px] transition-all duration-150 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-1.5 font-bold pb-1 mb-1 border-b border-white/10">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: hoveredStage.dotColor }}
              />
              <span className="text-white text-xs">{hoveredStage.stage.name}</span>
            </div>
            <div className="space-y-0.5 text-[10px] text-slate-300">
              <div className="flex justify-between">
                <span>Lũy kế đạt:</span>
                <strong className="text-white">{hoveredStage.stage.count.toLocaleString()} ứng viên</strong>
              </div>
              <div className="flex justify-between">
                <span>Tỷ lệ toàn phễu:</span>
                <strong className="text-white">{hoveredStage.stage.percentage}%</strong>
              </div>
              {hoveredStage.stage.currentCount !== undefined && (
                <div className="flex justify-between">
                  <span>Hồ sơ đang ở bước này:</span>
                  <strong className="text-indigo-300">{hoveredStage.stage.currentCount}</strong>
                </div>
              )}
              {hoveredStage.stage.stepConversionRate !== undefined && hoveredStage.stage.order && hoveredStage.stage.order > 1 && (
                <div className="flex justify-between pt-0.5 text-emerald-300">
                  <span>Chuyển tiếp từ bước trước:</span>
                  <strong>{hoveredStage.stage.stepConversionRate}%</strong>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Footer: Tóm tắt chuyển đổi ──────────────────────── */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
        <span className="flex items-center gap-1 text-slate-400">
          <Users size={11} className="text-indigo-500" />
          Tiếp nhận: <strong className="text-slate-700">{totalApps}</strong>
        </span>
        <span className="flex items-center gap-1 text-slate-400">
          <TrendingUp size={11} className="text-emerald-500" />
          Trúng tuyển: <strong className="text-emerald-700">{stages[stages.length - 1]?.count || 0} ({overallRate}%)</strong>
        </span>
      </div>
    </div>
  );
}
