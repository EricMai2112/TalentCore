'use client'

import React, { useState } from 'react'
import { Zap, UserPlus, Calendar, FileText, ArrowRight } from 'lucide-react'
import {
  RecentActivities,
  PendingActions
} from '../types/dashboard.types'
import { EmptyState } from './DashboardSkeletons'
import PendingActionsPopover from './PendingActionsPopover'
import Link from 'next/link'

function timeAgo(dateStr: string | undefined): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'vừa xong'
  if (mins < 60) return `${mins}p`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function cleanCandidateName(name?: string, fallback = 'Ứng viên'): string {
  if (!name || name.trim() === 'Hồ sơ của tôi' || !name.trim()) return fallback;
  return name.trim();
}

function getInitials(name: string) {
  const clean = cleanCandidateName(name);
  return clean
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

const AVATAR_COLORS = [
  'from-blue-400 to-indigo-500',
  'from-violet-400 to-purple-500',
  'from-teal-400 to-cyan-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500'
]

function MiniAvatar({ name, idx }: { name: string; idx: number }) {
  return (
    <div
      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} 
                   flex items-center justify-center shrink-0 shadow-2xs`}
    >
      <span className="text-[10px] font-black text-white">{getInitials(name) || 'UV'}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: 'bg-blue-50 text-blue-700 border-blue-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    HIRED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    SCHEDULED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    UPCOMING: 'bg-violet-50 text-violet-700 border-violet-200',
    COMPLETED: 'bg-slate-50 text-slate-600 border-slate-200',
    CANCELLED: 'bg-slate-50 text-slate-400 border-slate-100',
    SENT: 'bg-amber-50 text-amber-700 border-amber-200',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DECLINED: 'bg-rose-50 text-rose-700 border-rose-200',
    DRAFT: 'bg-slate-50 text-slate-500 border-slate-200',
    EXPIRED: 'bg-slate-50 text-slate-400 border-slate-100'
  }
  const label: Record<string, string> = {
    ACTIVE: 'Đang xem',
    REJECTED: 'Từ chối',
    HIRED: 'Đã tuyển',
    SCHEDULED: 'Đã lên lịch',
    UPCOMING: 'Sắp tới',
    COMPLETED: 'Xong',
    CANCELLED: 'Hủy',
    SENT: 'Đang chờ',
    ACCEPTED: 'Đã nhận',
    DECLINED: 'Từ chối',
    DRAFT: 'Nháp',
    EXPIRED: 'Hết hạn'
  }
  const cls = map[status] ?? 'bg-slate-50 text-slate-500 border-slate-200'
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${cls}`}>
      {label[status] ?? status}
    </span>
  )
}

type TabId = 'applications' | 'interviews' | 'offers'

const TABS: { id: TabId; label: string; icon: React.ReactNode; href: string }[] = [
  { id: 'applications', label: 'Ứng tuyển', icon: <UserPlus size={11} />, href: '/candidates' },
  { id: 'interviews', label: 'Phỏng vấn', icon: <Calendar size={11} />, href: '/interviews' },
  { id: 'offers', label: 'Offer', icon: <FileText size={11} />, href: '/offers' }
]

interface Props {
  activities: RecentActivities
  pendingActions?: PendingActions
}

export default function RecentActivityFeed({ activities, pendingActions }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('applications')
  const activeTabCfg = TABS.find((t) => t.id === activeTab)!

  return (
    <div
      className="bg-white/55 backdrop-blur-md border border-white/70 rounded-2xl p-3.5 
                    shadow-sm shadow-blue-500/5 h-full flex flex-col min-h-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center border rounded-lg w-7 h-7 bg-cyan-100/90 text-cyan-600 border-cyan-200/60">
            <Zap size={14} className="stroke-[2.2]" />
          </div>
          <h3 className="text-xs font-bold text-slate-800">Hoạt động gần đây</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Smart Pending Actions Popover inside Activity Card */}
          {pendingActions && pendingActions.total > 0 && (
            <PendingActionsPopover pendingActions={pendingActions} />
          )}

          <Link
            href={activeTabCfg.href}
            className="flex items-center gap-0.5 text-[10px] font-bold text-blue-600 
                       hover:text-blue-700 transition-colors group"
          >
            Xem tất cả
            <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100/80 rounded-lg p-0.5 gap-0.5 mb-2 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-1 text-[10px] font-bold 
                        rounded-md transition-all duration-200
                        ${
                          activeTab === tab.id
                            ? 'bg-white text-blue-600 shadow-2xs border border-blue-100'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* List content with slim inner scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.3)_transparent] hover:[scrollbar-color:rgba(148,163,184,0.6)_transparent]">
        {activeTab === 'applications' &&
          (activities.applications.length === 0 ? (
            <EmptyState message="Không có ứng tuyển mới" />
          ) : (
            activities.applications.map((app, i) => (
              <div
                key={app.id}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/60 transition-colors"
              >
                <MiniAvatar name={cleanCandidateName(app.candidateName)} idx={i} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">
                    {cleanCandidateName(app.candidateName)}
                  </p>
                  <p className="text-[9.5px] text-slate-400 truncate leading-tight">
                    {app.jobTitle}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <StatusBadge status={app.status} />
                  <span className="text-[8.5px] text-slate-400">{timeAgo(app.appliedAt)}</span>
                </div>
              </div>
            ))
          ))}

        {activeTab === 'interviews' &&
          (activities.interviews.length === 0 ? (
            <EmptyState message="Không có lịch phỏng vấn" />
          ) : (
            activities.interviews.map((int, i) => (
              <div
                key={int.id}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/60 transition-colors"
              >
                <MiniAvatar name={cleanCandidateName(int.candidateName)} idx={i} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">
                    {cleanCandidateName(int.candidateName)}
                  </p>
                  <p className="text-[9.5px] text-slate-400 truncate leading-tight">
                    {int.startTime ? `${int.startTime} · ` : ''}
                    {int.jobTitle}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <StatusBadge status={int.status} />
                  <span className="text-[8.5px] text-slate-400">
                    {int.locationType === 'ONLINE' ? 'Online' : 'Trực tiếp'}
                  </span>
                </div>
              </div>
            ))
          ))}

        {activeTab === 'offers' &&
          (activities.offers.length === 0 ? (
            <EmptyState message="Không có đề nghị gần đây" />
          ) : (
            activities.offers.map((off, i) => (
              <div
                key={off.id}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/60 transition-colors"
              >
                <MiniAvatar name={cleanCandidateName(off.candidateName)} idx={i} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">
                    {cleanCandidateName(off.candidateName)}
                  </p>
                  <p className="text-[9.5px] text-slate-400 truncate leading-tight">
                    {off.positionTitle}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <StatusBadge status={off.status} />
                  <span className="text-[8.5px] text-slate-400">{timeAgo(off.createdAt)}</span>
                </div>
              </div>
            ))
          ))}
      </div>
    </div>
  )
}
