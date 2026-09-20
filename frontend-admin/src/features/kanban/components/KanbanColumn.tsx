'use client'

import { useMemo } from 'react'
import { Inbox, FileText, Filter, Users, Send, CheckCircle2, Briefcase, Search } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { PipelineStage } from '@/src/features/job-description/types/job-description.types'
import { KanbanApplication } from '../types/kanban.types'
import CandidateKanbanCard from './CandidateKanbanCard'

interface KanbanColumnProps {
  stage: PipelineStage
  applications: KanbanApplication[]
  onSelectCandidate: (app: KanbanApplication) => void
}

export default function KanbanColumn({
  stage,
  applications,
  onSelectCandidate
}: KanbanColumnProps) {
  const stageId = stage._id || stage.name
  const { setNodeRef, isOver } = useDroppable({
    id: stageId
  })

  const itemIds = useMemo(() => applications.map((app) => app._id), [applications])
  const stageColorHex = stage.color || '#3B82F6'

  // Stage Icon & Subtitle Meta (Supports Vietnamese & English stage names)
  const stageMeta = useMemo(() => {
    const n = (stage.name || '').toLowerCase()
    if (n.includes('mới') || n.includes('nộp') || n.includes('applied')) {
      return {
        icon: <FileText size={14} />,
        subtitle: 'Ứng viên vừa nộp hồ sơ'
      }
    }
    if (n.includes('sàng lọc') || n.includes('cv') || n.includes('screening')) {
      return {
        icon: <Filter size={14} />,
        subtitle: 'Đang xem xét hồ sơ'
      }
    }
    if (n.includes('review') || n.includes('đánh giá')) {
      return {
        icon: <Search size={14} />,
        subtitle: 'Đánh giá hồ sơ & chuyên môn'
      }
    }
    if (n.includes('phỏng vấn') || n.includes('interview')) {
      return {
        icon: <Users size={14} />,
        subtitle: 'Đang tham gia phỏng vấn'
      }
    }
    if (n.includes('đề nghị') || n.includes('offer')) {
      return {
        icon: <Send size={14} />,
        subtitle: 'Đang gửi đề nghị nhận việc'
      }
    }
    if (n.includes('nhận việc') || n.includes('hired') || n.includes('hoàn thành')) {
      return {
        icon: <CheckCircle2 size={14} />,
        subtitle: 'Hoàn thành tuyển dụng'
      }
    }
    return {
      icon: <Briefcase size={14} />,
      subtitle: 'Giai đoạn quy trình'
    }
  }, [stage.name])

  return (
    <div
      ref={setNodeRef}
      className={`bg-white/30 backdrop-blur-md border rounded-3xl min-w-[300px] max-w-[360px] flex-1 flex flex-col shadow-xl shadow-blue-500/5 transition-all duration-200 overflow-hidden ${
        isOver
          ? 'border-[#3B82F6] bg-[#3B82F6]/10 ring-4 ring-[#3B82F6]/20 shadow-2xl scale-[1.01]'
          : 'border-white/70'
      }`}
    >
      {/* Flush Edge-to-Edge Column Header */}
      <div
        className="p-4 border-b flex items-center justify-between gap-2.5 transition-all shadow-2xs backdrop-blur-md"
        style={{
          backgroundColor: `${stageColorHex}18`,
          borderColor: `${stageColorHex}30`
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs"
            style={{
              backgroundColor: `${stageColorHex}25`,
              color: stageColorHex
            }}
          >
            {stageMeta.icon}
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className="text-xs font-black truncate tracking-tight"
              style={{ color: stageColorHex }}
              title={stage.name}
            >
              {stage.name}
            </h3>
            <p className="text-[10.5px] font-semibold text-slate-500 truncate mt-0.5">
              {stageMeta.subtitle}
            </p>
          </div>
        </div>

        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-2xs"
          style={{
            backgroundColor: `${stageColorHex}25`,
            color: stageColorHex
          }}
        >
          {applications.length}
        </div>
      </div>

      {/* Column Body Container with Inner Padding */}
      <div className="p-3.5 flex-1 flex flex-col">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="flex-1 space-y-3.5 min-h-[420px] flex flex-col">
            {applications.length === 0 ? (
              <div className="h-full flex-1 flex flex-col items-center justify-center py-16 text-slate-300 space-y-2 select-none border-2 border-dashed border-slate-300/40 rounded-2xl bg-white/10">
                <div className="w-12 h-12 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-center text-slate-400 shadow-2xs">
                  <Inbox size={22} />
                </div>
                <span className="text-xs font-bold text-slate-400">Trống</span>
              </div>
            ) : (
              applications.map((app) => (
                <CandidateKanbanCard key={app._id} application={app} onSelect={onSelectCandidate} />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
