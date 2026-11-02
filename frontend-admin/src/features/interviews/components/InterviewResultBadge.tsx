'use client'

import React from 'react'
import { InterviewResult } from '../types/interview.types'
import { GlassBadge } from '@/src/components/common/glass'

interface InterviewResultBadgeProps {
  result: InterviewResult
  size?: 'sm' | 'md'
  className?: string
}

export function InterviewResultBadge({
  result,
  size = 'sm',
  className = '',
}: InterviewResultBadgeProps) {
  switch (result) {
    case InterviewResult.PASS:
      return (
        <GlassBadge variant="success" size={size} className={className}>
          Đạt (Pass)
        </GlassBadge>
      )
    case InterviewResult.FAIL:
      return (
        <GlassBadge variant="danger" size={size} className={className}>
          Không đạt (Fail)
        </GlassBadge>
      )
    default:
      return null
  }
}

export default InterviewResultBadge
