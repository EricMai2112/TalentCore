'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import { ApplicationTrends } from '../types/dashboard.types';
import { analyticsApi } from '../services/analytics.api';
import { EmptyState } from './DashboardSkeletons';

const MONTH_OPTIONS = [
  { label: '3T', value: 3 },
  { label: '6T', value: 6 },
  { label: '12T', value: 12 },
];

const SERIES_CONFIG = [
  { key: 'applications', label: 'Ứng tuyển', color: '#3B82F6', gradientId: 'colorApp' },
  { key: 'hired', label: 'Đã tuyển', color: '#10B981', gradientId: 'colorHired' },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const appEntry = payload.find((p: any) => p.dataKey === 'applications');
  const hiredEntry = payload.find((p: any) => p.dataKey === 'hired');
  const appVal = appEntry?.value ?? 0;
  const hiredVal = hiredEntry?.value ?? 0;
  const rate = appVal > 0 ? Math.round((hiredVal / appVal) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xl px-3 py-2 text-xs min-w-[140px] z-50">
      <p className="font-bold text-slate-800 mb-1.5">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0 bg-blue-500" />
            <span className="text-slate-600">Ứng tuyển:</span>
          </div>
          <span className="font-bold text-slate-900">{appVal}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-500" />
            <span className="text-slate-600">Đã tuyển:</span>
          </div>
          <span className="font-bold text-slate-900">{hiredVal}</span>
        </div>
        {appVal > 0 && (
          <div className="flex items-center justify-between gap-4 text-[10px] pt-1 mt-1 border-t border-slate-100 text-slate-400">
            <span>Tỉ lệ tuyển:</span>
            <strong className="text-emerald-600 font-bold">{rate}%</strong>
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  initialTrends: ApplicationTrends;
  departmentId?: string;
  jobDescriptionId?: string;
}

export default function TimelineTrendChart({
  initialTrends,
  departmentId,
  jobDescriptionId,
}: Props) {
  const [trends, setTrends] = useState<ApplicationTrends>(initialTrends);
  const [selectedMonths, setSelectedMonths] = useState<number>(6);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync if initialTrends updates from parent refetch
  useEffect(() => {
    if (selectedMonths === 6) {
      setTrends(initialTrends);
    } else {
      let isMounted = true;
      setIsLoading(true);
      analyticsApi
        .getTrends(selectedMonths, departmentId, jobDescriptionId)
        .then((res) => {
          if (isMounted) setTrends(res);
        })
        .catch((err) => {
          console.error('Failed to fetch timeline trends on filter change:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [initialTrends, departmentId, jobDescriptionId]);

  const handleSelectMonths = async (m: number) => {
    if (m === selectedMonths || isLoading) return;
    setSelectedMonths(m);
    setIsLoading(true);
    try {
      const res = await analyticsApi.getTrends(m, departmentId, jobDescriptionId);
      setTrends(res);
    } catch (err) {
      console.error('Failed to fetch timeline trends:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl p-3.5 
                    shadow-sm shadow-blue-500/5 h-full flex flex-col min-h-0 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100/90 text-blue-600 border border-blue-200/60 
                          flex items-center justify-center">
            <TrendingUp size={14} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 leading-tight">Xu hướng Tuyển dụng</h3>
            <p className="text-[10px] text-slate-400">So sánh số lượng Ứng tuyển & Đã tuyển</p>
          </div>
        </div>

        {/* Month toggle (Local fetch only, no full page reload) */}
        <div className="flex items-center bg-slate-100/80 rounded-lg p-0.5 gap-0.5">
          {MONTH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelectMonths(opt.value)}
              disabled={isLoading}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all duration-200 cursor-pointer
                ${
                  selectedMonths === opt.value
                    ? 'bg-white text-blue-600 shadow-2xs border border-blue-100'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Area Chart Canvas with localized smooth loading overlay */}
      <div className="flex-1 w-full min-h-0 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-xs rounded-xl">
            <Loader2 size={20} className="animate-spin text-blue-600" />
          </div>
        )}

        {trends.isEmpty ? (
          <EmptyState message="Chưa có dữ liệu xu hướng" icon={<TrendingUp size={28} />} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends.data} margin={{ top: 8, right: 10, left: -22, bottom: -6 }}>
              <defs>
                <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" vertical={false} />
              <XAxis
                dataKey="month"
                interval={0}
                padding={{ left: 8, right: 8 }}
                tick={{
                  fontSize: selectedMonths === 12 ? 8.5 : 9.5,
                  fill: '#64748B',
                  fontWeight: 600,
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9.5, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 100 }}
              />
              <Legend
                iconType="circle"
                iconSize={6}
                wrapperStyle={{ fontSize: 10, paddingTop: 4, color: '#64748B', fontWeight: 600 }}
              />
              {SERIES_CONFIG.map((cfg) => (
                <Area
                  key={cfg.key}
                  type="monotone"
                  dataKey={cfg.key}
                  name={cfg.label}
                  stroke={cfg.color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${cfg.gradientId})`}
                  dot={{ fill: cfg.color, strokeWidth: 1.5, r: 2.5, stroke: '#fff' }}
                  activeDot={{ r: 4, stroke: '#fff', strokeWidth: 1.5 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
