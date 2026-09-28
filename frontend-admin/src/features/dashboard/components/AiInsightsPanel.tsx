'use client';

import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { AiInsights } from '../types/dashboard.types';
import { EmptyState } from './DashboardSkeletons';

interface MiniCircleGaugeProps {
  score: number;
  label: string;
  color: string;
}

function MiniCircleGauge({ score, label, color }: MiniCircleGaugeProps) {
  const r = 21;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-2">
      <svg width="50" height="50" viewBox="0 0 50 50" className="shrink-0">
        {/* Track */}
        <circle cx="25" cy="25" r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="4.5" />
        {/* Progress */}
        <circle
          cx="25"
          cy="25"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 25 25)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x="25" y="29" textAnchor="middle" fontSize="12" fontWeight="900" fill="white">
          {score}
        </text>
      </svg>
      <div className="min-w-0">
        <span className="text-[10px] font-bold text-white/80 block uppercase tracking-wider leading-tight">
          {label}
        </span>
        <span className="text-[9px] text-white/60 block leading-tight">Thang 100</span>
      </div>
    </div>
  );
}

interface Props {
  aiInsights: AiInsights;
}

export default function AiInsightsPanel({ aiInsights }: Props) {
  return (
    <div
      className="rounded-2xl shadow-sm shadow-violet-500/10 p-3.5 h-full flex flex-col min-h-0 overflow-hidden
                 bg-gradient-to-br from-violet-600/90 via-indigo-600/85 to-blue-600/90 text-white backdrop-blur-xl border border-white/25 relative"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 blur-xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white leading-tight">AI Talent Intelligence</h3>
            <p className="text-[10px] text-white/70">
              {aiInsights.isEmpty ? 'Chưa có hồ sơ' : `${aiInsights.totalEvaluations} CV đã chấm`}
            </p>
          </div>
        </div>
        <Sparkles size={14} className="text-amber-300 animate-pulse" />
      </div>

      {aiInsights.isEmpty ? (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-1.5 py-2">
          <Bot size={24} className="text-white/40" />
          <p className="text-[11px] text-white/70 text-center">
            Chưa có đánh giá AI nào trong hệ thống.
          </p>
        </div>
      ) : (
        <div className="relative z-10 flex-1 flex flex-col justify-between py-0.5 min-h-0">
          {/* Gauges row */}
          <div className="flex items-center justify-around gap-2 bg-white/10 rounded-xl p-1.5 px-2 border border-white/15">
            <MiniCircleGauge
              score={aiInsights.avgFitScore || 0}
              label="AI Fit"
              color="#34D399"
            />
            <div className="h-6 w-px bg-white/20" />
            <MiniCircleGauge
              score={aiInsights.avgEvidenceScore || 0}
              label="Bằng chứng"
              color="#60A5FA"
            />
          </div>

          {/* Distribution list */}
          <div className="space-y-1.5 mt-2">
            {aiInsights.distribution.slice(0, 3).map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-white/80 font-medium truncate pr-1">{item.label}</span>
                  <span className="font-bold text-white shrink-0">
                    {item.count} <span className="text-white/60 font-normal">({item.percentage}%)</span>
                  </span>
                </div>
                <div className="h-1 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
