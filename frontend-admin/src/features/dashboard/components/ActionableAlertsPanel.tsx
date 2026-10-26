'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  FileCheck2,
  Calendar,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { ActionableAlerts } from '../types/dashboard.types';
import Link from 'next/link';

interface Props {
  alerts?: ActionableAlerts;
}

type TabType = 'offers' | 'pending' | 'interviews';

export default function ActionableAlertsPanel({ alerts }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('offers');

  const summary = alerts?.summary || {
    totalAlerts: 0,
    expiringOffers: 0,
    staleApplications: 0,
    pendingJobs: 0,
    todayInterviews: 0,
  };

  const expiringOffers = alerts?.expiringOffers || [];
  const staleApplications = alerts?.staleApplications || [];
  const pendingJobs = alerts?.pendingJobs || [];
  const todayInterviews = alerts?.todayInterviews || [];
  const totalAlerts = (summary.expiringOffers || 0) + (summary.pendingJobs || 0);

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-3 
                    shadow-xs shadow-slate-200/50 h-full flex flex-col justify-between min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle size={13} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 leading-none">
              Cần Xử Lý Ngay
            </h3>
            <p className="text-[10px] text-slate-400 leading-tight">
              Cảnh báo hạn chót & tồn đọng
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            totalAlerts > 0
              ? 'bg-amber-50 text-amber-700 border-amber-200/80 animate-pulse'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
          }`}
        >
          {totalAlerts > 0 ? `${totalAlerts} việc ưu tiên` : 'Ổn định'}
        </span>
      </div>

      {/* Mini Tabs */}
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100/90 mb-2 shrink-0">
        <button
          onClick={() => setActiveTab('offers')}
          className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
            activeTab === 'offers'
              ? 'bg-white text-slate-800 shadow-2xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Offer</span>
          {summary.expiringOffers > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
              {summary.expiringOffers}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-white text-slate-800 shadow-2xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>JD</span>
          {summary.pendingJobs > 0 && (
            <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] flex items-center justify-center font-bold">
              {summary.pendingJobs}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('interviews')}
          className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
            activeTab === 'interviews'
              ? 'bg-white text-slate-800 shadow-2xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Phỏng vấn</span>
          {summary.todayInterviews > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">
              {summary.todayInterviews}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content List - Compact Scrollable List */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-1.5 min-h-0 text-[11px]">
        {/* TAB 1: OFFERS SẮP HẾT HẠN */}
        {activeTab === 'offers' && (
          <>
            {expiringOffers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-3">
                <CheckCircle2 size={20} className="text-emerald-500 mb-1" />
                <p className="text-[10px]">Không có Offer nào sắp hết hạn</p>
              </div>
            ) : (
              expiringOffers.map((off) => (
                <Link
                  key={off.id}
                  href={`/offers`}
                  className="block p-1.5 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate max-w-[130px]">
                      {off.candidateName}
                    </span>
                    <span
                      className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-md ${
                        off.isOverdue
                          ? 'bg-rose-600 text-white'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {off.isOverdue ? 'Đã quá hạn' : `Còn ${off.hoursLeft}h`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                    <span className="truncate max-w-[140px]">{off.jobTitle}</span>
                    <span className="font-semibold text-slate-700">
                      {off.salary.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </Link>
              ))
            )}
          </>
        )}

        {/* TAB 3: YÊU CẦU CHỜ DUYỆT */}
        {activeTab === 'pending' && (
          <>
            {pendingJobs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-3">
                <CheckCircle2 size={20} className="text-emerald-500 mb-1" />
                <p className="text-[10px]">Không có yêu cầu tuyển dụng chờ duyệt</p>
              </div>
            ) : (
              pendingJobs.map((j) => (
                <Link
                  key={j.id}
                  href={`/job-description`}
                  className="block p-1.5 rounded-xl border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate max-w-[140px]">
                      {j.title}
                    </span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700">
                      {j.headcount} chỉ tiêu
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>{j.departmentName}</span>
                    <span className="text-slate-400">{j.creatorName}</span>
                  </div>
                </Link>
              ))
            )}
          </>
        )}

        {/* TAB 4: PHỎNG VẤN HÔM NAY */}
        {activeTab === 'interviews' && (
          <>
            {todayInterviews.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-3">
                <CheckCircle2 size={20} className="text-emerald-500 mb-1" />
                <p className="text-[10px]">Không có lịch phỏng vấn trong hôm nay</p>
              </div>
            ) : (
              todayInterviews.map((int) => (
                <Link
                  key={int.id}
                  href={`/interviews`}
                  className="block p-1.5 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate max-w-[130px]">
                      {int.candidateName}
                    </span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                      {int.startTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                    <span className="truncate max-w-[130px]">{int.jobTitle}</span>
                    <span className="text-slate-400 truncate max-w-[90px]">
                      {int.interviewerName}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </>
        )}
      </div>

      {/* Footer link */}
      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-end shrink-0">
        <Link
          href={
            activeTab === 'offers'
              ? '/offers'
              : activeTab === 'pending'
                ? '/job-description'
                : '/interviews'
          }
          className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>Xem chi tiết danh sách</span>
          <ChevronRight size={11} className="stroke-[2.5]" />
        </Link>
      </div>
    </div>
  );
}
