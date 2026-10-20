'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText } from 'lucide-react';
import { OfferBreakdown } from '../types/dashboard.types';
import { EmptyState } from './DashboardSkeletons';

interface Props {
  offers: OfferBreakdown;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xl px-3 py-2 text-[11px] z-50 min-w-[120px]">
      <div className="flex items-center gap-1.5 font-bold text-slate-800">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
        <span>{d.name}</span>
      </div>
      <div className="text-[10.5px] text-slate-600 mt-1">
        <span className="font-bold text-slate-900">{d.count}</span> offer ({d.percentage}%)
      </div>
    </div>
  );
}

export default function OfferDonutChart({ offers }: Props) {
  const accepted = offers.statusCounts?.ACCEPTED || 0;
  const declined = offers.statusCounts?.DECLINED || 0;
  const sent = offers.statusCounts?.SENT || 0;
  const totalTracked = accepted + declined + sent;

  const pct = (val: number) => (totalTracked > 0 ? Math.round((val / totalTracked) * 100) : 0);

  const displayData = [
    {
      name: 'Đã Tuyển',
      count: accepted,
      color: '#10B981',
      percentage: pct(accepted),
      bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    },
    {
      name: 'Đang phản hồi',
      count: sent,
      color: '#F59E0B',
      percentage: pct(sent),
      bgBadge: 'bg-amber-50 text-amber-700 border-amber-200/80',
    },
    {
      name: 'Đã từ chối',
      count: declined,
      color: '#EF4444',
      percentage: pct(declined),
      bgBadge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    },
  ];

  const chartData = displayData.filter((d) => d.count > 0);

  return (
    <div className="bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl p-3.5 
                    shadow-sm shadow-blue-500/5 h-full flex flex-col justify-between min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center border rounded-lg w-7 h-7 bg-amber-100/90 text-amber-600 border-amber-200/60">
            <FileText size={14} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs font-bold leading-tight text-slate-800">
              Phân tích Offer
            </h3>
            <p className="text-[10px] text-slate-400">{offers.totalOffers} offer tổng cộng</p>
          </div>
        </div>
        {!offers.isEmpty && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            {offers.acceptanceRate}% chấp nhận
          </span>
        )}
      </div>

      {offers.isEmpty || totalTracked === 0 ? (
        <EmptyState message="Chưa có dữ liệu offer" icon={<FileText size={24} />} />
      ) : (
        <div className="grid items-center flex-1 min-h-0 grid-cols-12 gap-3">
          {/* Left: Donut Chart (5/12 cols) */}
          <div className="col-span-5 h-full relative flex items-center justify-center min-h-[110px]">
            {/* Center label (placed at z-0 so tooltip at z-100 renders cleanly on top) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
              <span className="text-sm font-black leading-none text-slate-800">
                {accepted}
              </span>
              <span className="text-[8.5px] text-slate-400 font-semibold uppercase leading-tight mt-0.5">
                Đã Tuyển
              </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={48}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomTooltip />}
                  wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Right: Legend 3 trạng thái (7/12 cols) */}
          <div className="col-span-7 flex flex-col justify-around h-full py-1 space-y-1.5 min-h-0">
            {displayData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100/80 text-[11px] hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-700 truncate leading-none">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  <span className="font-bold text-slate-800 leading-none">
                    {item.count}
                  </span>
                  <span
                    className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-md border leading-none ${item.bgBadge}`}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
