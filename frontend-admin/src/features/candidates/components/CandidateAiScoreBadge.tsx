'use client'

import React from 'react'
import { GlassBadge } from '@/src/components/common/glass'

interface CandidateAiScoreBadgeProps {
  score?: number | null
  size?: 'sm' | 'md'
  className?: string
}

export function CandidateAiScoreBadge({
  score,
  size = 'sm',
  className = '',
}: CandidateAiScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <GlassBadge variant="secondary" size={size} className={className}>
        N/A
      </GlassBadge>
    )
  }
  if (score >= 80) {
    return (
      <GlassBadge variant="success" size={size} className={className}>
        {score}/100
      </GlassBadge>
    )
  }
  if (score >= 50) {
    return (
      <GlassBadge variant="warning" size={size} className={className}>
        {score}/100
      </GlassBadge>
    )
  }
  return (
    <GlassBadge variant="danger" size={size} className={className}>
      {score}/100
    </GlassBadge>
  )
}

export default CandidateAiScoreBadge
