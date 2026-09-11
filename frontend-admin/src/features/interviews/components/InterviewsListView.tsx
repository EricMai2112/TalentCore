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
  onOpenEditModal: (interview: InterviewItem) => void;
  onOpenRescheduleModal?: (interview: InterviewItem) => void;
  onOpenRescheduleRequestModal?: (interview: InterviewItem) => void;
  onApproveReschedule?: (interview: InterviewItem) => void;
  onRejectReschedule?: (interview: InterviewItem) => void;
  onApproveCandidateCancellation?: (interview: InterviewItem) => void;
  onOpenDeptScheduleModal?: (interview: InterviewItem) => void;
  onApproveHrSchedule?: (interview: InterviewItem) => void;
  formatDate: (dateStr?: string) => string;
  getStatusBadge: (status: InterviewStatus, confirmationStatus?: string) => React.ReactNode;
  getResultBadge: (result: InterviewResult) => React.ReactNode;
}

export default function InterviewsListView({
  interviews,
  activeMenuId,
  setActiveMenuId,
  onOpenStatusModal,
  onOpenEditModal,
  onOpenRescheduleModal,
  onOpenRescheduleRequestModal,
  onApproveReschedule,
  onRejectReschedule,
  onApproveCandidateCancellation,
  onOpenDeptScheduleModal,
  onApproveHrSchedule,
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
          onOpenEditModal={onOpenEditModal}
          onOpenRescheduleModal={onOpenRescheduleModal}
          onOpenRescheduleRequestModal={onOpenRescheduleRequestModal}
          onApproveReschedule={onApproveReschedule}
          onRejectReschedule={onRejectReschedule}
          onApproveCandidateCancellation={onApproveCandidateCancellation}
          onOpenDeptScheduleModal={onOpenDeptScheduleModal}
          onApproveHrSchedule={onApproveHrSchedule}
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
