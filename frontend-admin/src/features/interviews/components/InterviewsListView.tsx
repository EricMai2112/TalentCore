'use client';

import React from 'react';
import InterviewCard from './InterviewCard';
import {
  InterviewItem,
  InterviewStatus,
  InterviewResult,
} from '../types/interview.types';

interface InterviewsListViewProps {
  interviews: InterviewItem[];
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  onOpenStatusModal: (interview: InterviewItem) => void;
  formatDate: (dateStr?: string) => string;
  getStatusBadge: (status: InterviewStatus) => React.ReactNode;
  getResultBadge: (result: InterviewResult) => React.ReactNode;
}

export default function InterviewsListView({
  interviews,
  activeMenuId,
  setActiveMenuId,
  onOpenStatusModal,
  formatDate,
  getStatusBadge,
  getResultBadge,
}: InterviewsListViewProps) {
  return (
    <div className="space-y-4">
      {interviews.map((item) => (
        <InterviewCard
          key={item._id}
          item={item}
          onOpenStatusModal={onOpenStatusModal}
          activeMenuId={activeMenuId}
          setActiveMenuId={setActiveMenuId}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          getResultBadge={getResultBadge}
        />
      ))}
    </div>
  );
}
