'use client';

import React from 'react';
import InterviewCard from './InterviewCard';
import {
  InterviewItem,
  InterviewStatus,
  InterviewResult,
} from '../types/interview.types';

import CustomPagination from '@/src/components/common/CustomPagination';

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
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
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
  currentPage = 1,
  pageSize = 10,
  onPageChange,
}: InterviewsListViewProps) {
  const paginatedInterviews = interviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {paginatedInterviews.map((item) => (
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

      {onPageChange && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <CustomPagination
            currentPage={currentPage}
            totalPages={Math.ceil(interviews.length / pageSize)}
            totalItems={interviews.length}
            pageSize={pageSize}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
