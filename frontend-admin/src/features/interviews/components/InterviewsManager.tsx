'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import {
  InterviewItem,
  InterviewStatus,
  InterviewResult,
} from '../types/interview.types';
import { interviewsApi } from '../services/interviews.api';
import { departmentApi } from '@/src/features/departments/services/department.api';
import { Department } from '@/src/features/departments/types/department.types';
import { useAuth } from '@/src/providers/AuthProvider';
import { UserRole } from '@/src/features/users/types/user.types';
import {
  InterviewsHeader,
  InterviewsFilterToolbar,
  InterviewsListView,
  InterviewsCalendarView,
  InterviewStatusModal,
  EditInterviewModal,
  AdminRescheduleModal,
  CandidateRescheduleRequestModal,
} from './';
import { DeptScheduleFormModal } from './DeptScheduleFormModal';
import { HrApproveScheduleModal } from './HrApproveScheduleModal';

export default function InterviewsManager() {
  const { user } = useAuth();

  const isDeptManager = user?.role === UserRole.DEPARTMENT_MANAGER;
  const isEmployee = user?.role === UserRole.EMPLOYEE;
  const userDeptId =
    typeof user?.departmentId === 'object'
      ? user?.departmentId?._id
      : user?.departmentId;

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Calendar Month Navigation
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    new Date(2026, 8, 1)
  ); // Default Sept 2026

  // Hover Popover State cho Calendar Event
  const [hoveredInterview, setHoveredInterview] = useState<{
    item: InterviewItem;
    x: number;
    y: number;
  } | null>(null);

  // State cho Modal Cập nhật trạng thái / Đánh giá
  const [selectedInterview, setSelectedInterview] =
    useState<InterviewItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [updateStatusVal, setUpdateStatusVal] = useState<InterviewStatus>(
    InterviewStatus.COMPLETED
  );
  const [updateResultVal, setUpdateResultVal] = useState<InterviewResult>(
    InterviewResult.PASS
  );
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // State cho Modal Chỉnh sửa Lịch phỏng vấn
  const [selectedEditInterview, setSelectedEditInterview] = useState<InterviewItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // State cho Modal Đề xuất Lịch khác từ HR
  const [selectedRescheduleInterview, setSelectedRescheduleInterview] = useState<InterviewItem | null>(null);
  const [isAdminRescheduleModalOpen, setIsAdminRescheduleModalOpen] = useState<boolean>(false);

  // State cho Modal Xem chi tiết yêu cầu đổi lịch của Ứng viên
  const [selectedRequestInterview, setSelectedRequestInterview] = useState<InterviewItem | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);

  // State cho Modal Xếp lịch của Trưởng phòng
  const [selectedDeptScheduleInterview, setSelectedDeptScheduleInterview] = useState<InterviewItem | null>(null);
  const [isDeptScheduleModalOpen, setIsDeptScheduleModalOpen] = useState<boolean>(false);

  const handleOpenDeptScheduleModal = (interview: InterviewItem) => {
    setSelectedDeptScheduleInterview(interview);
    setIsDeptScheduleModalOpen(true);
  };

  // State cho Modal HR Duyệt lịch xem trước
  const [selectedHrApproveInterview, setSelectedHrApproveInterview] = useState<InterviewItem | null>(null);
  const [isHrApproveModalOpen, setIsHrApproveModalOpen] = useState<boolean>(false);

  const handleApproveHrSchedule = (interview: InterviewItem) => {
    setSelectedHrApproveInterview(interview);
    setIsHrApproveModalOpen(true);
  };

  // Active dropdown action ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Load department list
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const list = await departmentApi.getAll();
        setDepartments(list);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách phòng ban:', err);
      }
    };
    loadDepartments();
  }, []);

  // Lock department filter if user is Department Manager or Employee
  useEffect(() => {
    if ((isDeptManager || isEmployee) && userDeptId) {
      setDepartmentFilter(userDeptId);
    }
  }, [userDeptId, isDeptManager, isEmployee]);

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const data = await interviewsApi.getInterviews();
      setInterviews(data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách phỏng vấn:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // Dynamic positions options based on current interviews & active department filter
  const availablePositions = Array.from(
    new Set(
      interviews
        .filter((item) => {
          if (!departmentFilter || departmentFilter === 'ALL') return true;
          const itemDeptId =
            typeof item.jobDescriptionId === 'object' &&
            item.jobDescriptionId?.departmentId
              ? typeof item.jobDescriptionId.departmentId === 'object'
                ? item.jobDescriptionId.departmentId._id
                : item.jobDescriptionId.departmentId
              : null;
          return itemDeptId === departmentFilter;
        })
        .map((item) =>
          typeof item.jobDescriptionId === 'object'
            ? item.jobDescriptionId?.title
            : null
        )
        .filter(Boolean)
    )
  ) as string[];

  // Role-based & Filtered Interviews
  const filteredInterviews = interviews.filter((item) => {
    const itemDeptId =
      typeof item.jobDescriptionId === 'object' &&
      item.jobDescriptionId?.departmentId
        ? typeof item.jobDescriptionId.departmentId === 'object'
          ? item.jobDescriptionId.departmentId._id
          : item.jobDescriptionId.departmentId
        : null;

    const itemInterviewerId =
      typeof item.interviewerId === 'object'
        ? item.interviewerId?._id
        : item.interviewerId;

    // 1. Role Scope Filter
    if (isDeptManager) {
      if (userDeptId && itemDeptId !== userDeptId) return false;
    } else if (isEmployee) {
      // Employee only sees interviews assigned to them
      const isAssigned =
        itemInterviewerId === user?._id ||
        itemInterviewerId === (user as any)?.id;
      if (!isAssigned) return false;
    }

    // 2. Department Dropdown Filter
    if (departmentFilter && departmentFilter !== 'ALL') {
      if (itemDeptId !== departmentFilter) return false;
    }

    // 3. Position Dropdown Filter
    if (positionFilter && positionFilter !== 'ALL') {
      const jobTitle =
        typeof item.jobDescriptionId === 'object'
          ? item.jobDescriptionId?.title
          : '';
      if (jobTitle !== positionFilter) return false;
    }

    // 4. Status Dropdown Filter
    if (statusFilter && statusFilter !== 'ALL') {
      if (item.status !== statusFilter) return false;
    }

    return true;
  });

  const handleOpenStatusModal = (interview: InterviewItem) => {
    setSelectedInterview(interview);
    setUpdateStatusVal(interview.status || InterviewStatus.COMPLETED);
    setUpdateResultVal(interview.result || InterviewResult.PASS);
    setFeedbackText(interview.feedback || '');
    setIsModalOpen(true);
    setActiveMenuId(null);
    setHoveredInterview(null);
  };

  const router = useRouter();

  const handleOpenEditModal = (interview: InterviewItem) => {
    setActiveMenuId(null);
    setHoveredInterview(null);
    router.push(`/interviews/edit/${interview._id}`);
  };

  const handleOpenRescheduleModal = (interview: InterviewItem) => {
    setSelectedRescheduleInterview(interview);
    setIsAdminRescheduleModalOpen(true);
    setActiveMenuId(null);
    setHoveredInterview(null);
  };

  const handleOpenRescheduleRequestModal = (interview: InterviewItem) => {
    setSelectedRequestInterview(interview);
    setIsRequestModalOpen(true);
    setActiveMenuId(null);
    setHoveredInterview(null);
  };

  const handleApproveReschedule = async (interview: InterviewItem) => {
    try {
      await interviewsApi.approveReschedule(interview._id);
      fetchInterviews();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Lỗi khi chấp nhận đổi lịch phỏng vấn');
    }
  };

  const handleRejectReschedule = async (interview: InterviewItem) => {
    const reason = window.prompt(
      'Nhập lý do từ chối yêu cầu đổi lịch (tùy chọn):',
      'Hội đồng phỏng vấn bận/không thể thu xếp khung giờ này.'
    );
    if (reason === null) return;

    try {
      await interviewsApi.rejectReschedule(interview._id, reason);
      fetchInterviews();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Lỗi khi từ chối đổi lịch phỏng vấn');
    }
  };

  const handleApproveCandidateCancellation = async (interview: InterviewItem) => {
    const candName = typeof interview.candidateId === 'object' ? interview.candidateId.fullName || interview.candidateId.name : 'Ứng viên';
    if (!window.confirm(`Xác nhận hủy lịch phỏng vấn của ứng viên "${candName}"?`)) {
      return;
    }

    try {
      await interviewsApi.approveCandidateCancellation(interview._id);
      fetchInterviews();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Lỗi khi xác nhận hủy lịch phỏng vấn');
    }
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;

    setIsUpdating(true);
    try {
      await interviewsApi.updateStatus(
        selectedInterview._id,
        updateStatusVal,
        updateResultVal,
        feedbackText
      );
      setIsModalOpen(false);
      fetchInterviews();
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái phỏng vấn:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '2026-07-28';
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getStatusBadge = (status: InterviewStatus, confirmationStatus?: string) => {
    switch (status) {
      case InterviewStatus.SCHEDULED:
        if (confirmationStatus === 'WAITING_DEPT_SCHEDULE') {
          return (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Chờ lên lịch
            </span>
          );
        }
        if (confirmationStatus === 'WAITING_HR_APPROVAL') {
          return (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
              Chờ duyệt
            </span>
          );
        }
        if (confirmationStatus === 'CONFIRMED') {
          return (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Xác nhận phỏng vấn
            </span>
          );
        }
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
            Đã lên lịch
          </span>
        );
      case InterviewStatus.COMPLETED:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            Hoàn thành
          </span>
        );
      case InterviewStatus.CANCELLED:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  const getResultBadge = (result: InterviewResult) => {
    switch (result) {
      case InterviewResult.PASS:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
            Pass
          </span>
        );
      case InterviewResult.FAIL:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
            Fail
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <InterviewsHeader totalCount={filteredInterviews.length} />

      {/* Toolbar / Filters */}
      <InterviewsFilterToolbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        positionFilter={positionFilter}
        setPositionFilter={setPositionFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        departments={departments}
        availablePositions={availablePositions}
        isDeptManager={isDeptManager}
        isEmployee={isEmployee}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 size={32} className="animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs font-medium text-slate-500">
            Đang tải danh sách phỏng vấn...
          </p>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="py-16 bg-white border border-slate-200/80 rounded-3xl text-center space-y-3">
          <CalendarIcon size={40} className="text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            Chưa có lịch phỏng vấn nào phù hợp
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Không tìm thấy buổi phỏng vấn nào khớp với phòng ban, vị trí hoặc trạng thái đã chọn.
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW MODE */
        <InterviewsListView
          interviews={filteredInterviews}
          activeMenuId={activeMenuId}
          setActiveMenuId={setActiveMenuId}
          onOpenStatusModal={handleOpenStatusModal}
          onOpenEditModal={handleOpenEditModal}
          onOpenRescheduleModal={handleOpenRescheduleModal}
          onOpenRescheduleRequestModal={handleOpenRescheduleRequestModal}
          onApproveReschedule={handleApproveReschedule}
          onRejectReschedule={handleRejectReschedule}
          onApproveCandidateCancellation={handleApproveCandidateCancellation}
          onOpenDeptScheduleModal={handleOpenDeptScheduleModal}
          onApproveHrSchedule={handleApproveHrSchedule}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          getResultBadge={getResultBadge}
        />
      ) : (
        /* CALENDAR VIEW MODE */
        <InterviewsCalendarView
          currentMonthDate={currentMonthDate}
          setCurrentMonthDate={setCurrentMonthDate}
          interviews={filteredInterviews}
          hoveredInterview={hoveredInterview}
          setHoveredInterview={setHoveredInterview}
          onOpenStatusModal={handleOpenStatusModal}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          getResultBadge={getResultBadge}
        />
      )}

      {/* Trưởng phòng Xếp lịch & Chọn Interviewer Modal */}
      <DeptScheduleFormModal
        isOpen={isDeptScheduleModalOpen}
        onClose={() => setIsDeptScheduleModalOpen(false)}
        interview={selectedDeptScheduleInterview}
        onSuccess={fetchInterviews}
      />

      {/* HR Duyệt lịch xem trước Modal */}
      <HrApproveScheduleModal
        isOpen={isHrApproveModalOpen}
        onClose={() => setIsHrApproveModalOpen(false)}
        interview={selectedHrApproveInterview}
        onSuccess={fetchInterviews}
      />

      {/* Status & Feedback Modal */}
      <InterviewStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedInterview={selectedInterview}
        updateStatusVal={updateStatusVal}
        setUpdateStatusVal={setUpdateStatusVal}
        updateResultVal={updateResultVal}
        setUpdateResultVal={setUpdateResultVal}
        feedbackText={feedbackText}
        setFeedbackText={setFeedbackText}
        isUpdating={isUpdating}
        onSaveStatus={handleSaveStatus}
      />

      {/* Edit Interview Schedule Modal */}
      <EditInterviewModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        selectedInterview={selectedEditInterview}
        onSaveSuccess={fetchInterviews}
      />

      {/* Admin Reschedule / Propose Alternate Slot Modal */}
      <AdminRescheduleModal
        isOpen={isAdminRescheduleModalOpen}
        onClose={() => setIsAdminRescheduleModalOpen(false)}
        interview={selectedRescheduleInterview}
        onSuccess={() => {
          setIsAdminRescheduleModalOpen(false);
          setIsRequestModalOpen(false);
          fetchInterviews();
        }}
      />

      {/* Candidate Reschedule Request Details Modal */}
      <CandidateRescheduleRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        interview={selectedRequestInterview}
        onApprove={handleApproveReschedule}
        onProposeOther={(interviewItem) => {
          handleOpenRescheduleModal(interviewItem);
        }}
        formatDate={formatDate}
      />
    </div>
  );
}
