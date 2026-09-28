'use client';

import React from 'react';
import { Filter } from 'lucide-react';
import { RecruitmentFunnel } from '../types/dashboard.types';
import { EmptyState } from './DashboardSkeletons';

interface Props {
  funnel: RecruitmentFunnel;
}

export default function RecruitmentFunnelChart({ funnel }: Props) {
  if (funnel.isEmpty || funnel.totalApplications === 0) {
    return (
      <div className="bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl p-3.5 
                      shadow-sm shadow-blue-500/5 h-full flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-100/90 text-indigo-600 border border-indigo-200/60 
                          flex items-center justify-center">
            <Filter size={14} className="stroke-[2.2]" />
          </div>
          <h3 className="text-xs font-bold text-slate-800">Phễu Tuyển dụng</h3>
        </div>
        <EmptyState message="Chưa có hồ sơ ứng viên" icon={<Filter size={24} />} />
      </div>
    );
  }

  return (
    <div className="bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl p-3.5 
                    shadow-sm shadow-blue-500/5 h-full flex flex-col min-h-0 justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100/90 text-indigo-600 border border-indigo-200/60 
                          flex items-center justify-center">
            <Filter size={14} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 leading-tight">Phễu Tuyển dụng</h3>
            <p className="text-[10px] text-slate-400">
              Tổng {funnel.totalApplications.toLocaleString()} hồ sơ
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full 
                         bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-2xs">
          {funnel.conversionRates.overallRate}% tuyển
        </span>
      </div>

      {/* Stages list - Clean layout without noisy micro percentages */}
      <div className="flex-1 flex flex-col justify-around py-1 min-h-0 gap-1.5">
        {funnel.stages.map((stage) => {
          return (
            <div key={stage.id} className="group">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-semibold text-slate-700 truncate pr-1 text-[11px]">
                  {stage.name}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-bold text-slate-800 text-[11px]">
                    {stage.count}
                  </span>
                  <span
                    className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-md leading-tight"
                    style={{
                      background: `${stage.color}15`,
                      color: stage.color,
                      border: `1px solid ${stage.color}30`,
                    }}
                  >
                    {stage.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar track */}
              <div className="h-2 w-full bg-slate-100/90 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, stage.percentage)}%`,
                    background: stage.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
