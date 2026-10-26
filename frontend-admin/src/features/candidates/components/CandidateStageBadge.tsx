'use client'

import React from 'react'
import { GlassBadge } from '@/src/components/common/glass'

interface CandidateStageBadgeProps {
  stageName?: string
  stageColor?: string
  size?: 'sm' | 'md'
  className?: string
}

export function CandidateStageBadge({
  stageName,
  stageColor,
  size = 'md',
  className = '',
}: CandidateStageBadgeProps) {
  const s = stageName || 'Mới'
  const sLower = s.toLowerCase()

  let variant: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' = 'secondary'
  let dotColor = 'bg-slate-400'

  if (sLower.includes('tech') || sLower.includes('kỹ thuật')) {
    variant = 'primary'
    dotColor = 'bg-[#3B82F6]'
  } else if (sLower.includes('phone') || sLower.includes('gọi')) {
    variant = 'accent'
    dotColor = 'bg-[#8B5CF6]'
  } else if (sLower.includes('culture') || sLower.includes('văn hóa')) {
    variant = 'info'
    dotColor = 'bg-[#06B6D4]'
  } else if (sLower.includes('offer') || sLower.includes('đề nghị')) {
    variant = 'success'
    dotColor = 'bg-[#10B981]'
  } else if (sLower.includes('từ chối') || sLower.includes('reject')) {
    variant = 'danger'
    dotColor = 'bg-rose-500'
  } else if (sLower.includes('sàng lọc') || sLower.includes('filter') || sLower.includes('cv')) {
    variant = 'warning'
    dotColor = 'bg-[#F59E0B]'
  } else if (sLower.includes('mới') || sLower.includes('new')) {
    variant = 'secondary'
    dotColor = 'bg-slate-400'
  } else if (stageColor) {
    return (
      <span
        style={{
          backgroundColor: `${stageColor}18`,
          borderColor: `${stageColor}40`,
          color: stageColor,
        }}
        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1.5 backdrop-blur-xs shadow-2xs ${className}`}
      >
        <span style={{ backgroundColor: stageColor }} className="w-1.5 h-1.5 rounded-full" />
        <span>{s}</span>
      </span>
    )
  }

  return (
    <GlassBadge variant={variant} size={size} className={`gap-1.5 ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{s}</span>
    </GlassBadge>
  )
}

export default CandidateStageBadge
