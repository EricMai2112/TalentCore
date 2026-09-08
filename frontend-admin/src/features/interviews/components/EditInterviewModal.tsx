'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  Building2,
  AlertCircle,
  Loader2,
  User as UserIcon,
  Sparkles,
  Edit3
} from 'lucide-react';
import {
  InterviewItem,
  InterviewStatus,
  LocationType,
  UpdateInterviewPayload
} from '../types/interview.types';
import { interviewsApi } from '../services/interviews.api';
import { userApi } from '@/src/features/users/services/user.api';
import { User } from '@/src/features/users/types/user.types';
import {
  CustomInput,
  CustomSelect,
  CustomDatePicker,
  CustomTimePicker,
  CustomTextarea
} from '@/src/components/common';

interface EditInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInterview: InterviewItem | null;
  onSaveSuccess: () => void;
}

export default function EditInterviewModal({
  isOpen,
  onClose,
  selectedInterview,
  onSaveSuccess
}: EditInterviewModalProps) {
  const [staffOptions, setStaffOptions] = useState<User[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(false);

  // Form states
  const [interviewerIdVal, setInterviewerIdVal] = useState<string>('');
  const [dateVal, setDateVal] = useState<string>('');
  const [startTimeVal, setStartTimeVal] = useState<string>('14:00');
  const [endTimeVal, setEndTimeVal] = useState<string>('15:30');
  const [locationTypeVal, setLocationTypeVal] = useState<LocationType>(LocationType.ONLINE);
  const [autoCreateMeet, setAutoCreateMeet] = useState<boolean>(true);
  const [offsiteLocationVal, setOffsiteLocationVal] = useState<string>('');
  const [statusVal, setStatusVal] = useState<InterviewStatus>(InterviewStatus.SCHEDULED);
  const [notesVal, setNotesVal] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load staff users for Interviewer select dropdown
  useEffect(() => {
    if (!isOpen) return;

    const fetchStaff = async () => {
      setIsLoadingStaff(true);
      try {
        const users = await userApi.getEmployees();
        setStaffOptions(users || []);
      } catch (err) {
        console.error('Lỗi khi tải danh sách nhân viên:', err);
      } finally {
        setIsLoadingStaff(false);
      }
    };

    fetchStaff();
  }, [isOpen]);

  // Populate form values when selectedInterview changes
  useEffect(() => {
    if (selectedInterview) {
      const currentInterviewerId =
        typeof selectedInterview.interviewerId === 'object'
          ? selectedInterview.interviewerId._id
          : selectedInterview.interviewerId || '';

      setInterviewerIdVal(currentInterviewerId);

      // Format date to YYYY-MM-DD
      if (selectedInterview.date) {
        const d = new Date(selectedInterview.date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        setDateVal(`${y}-${m}-${day}`);
      } else {
        setDateVal('');
      }

      setStartTimeVal(selectedInterview.startTime || '14:00');
      setEndTimeVal(selectedInterview.endTime || '15:30');
      setLocationTypeVal(selectedInterview.locationType || LocationType.ONLINE);
      setOffsiteLocationVal(selectedInterview.offsiteLocation || '');
      setStatusVal(selectedInterview.status || InterviewStatus.SCHEDULED);
      setNotesVal(selectedInterview.notes || '');
      setErrorMsg(null);
    }
  }, [selectedInterview, isOpen]);

  if (!isOpen || !selectedInterview) return null;

  const candidateName =
    typeof selectedInterview.candidateId === 'object'
      ? selectedInterview.candidateId?.fullName || selectedInterview.candidateId?.name
      : 'Ứng viên';

  const jobTitle =
    typeof selectedInterview.jobDescriptionId === 'object'
      ? selectedInterview.jobDescriptionId?.title
      : 'Vị trí tuyển dụng';

  const deptName =
    typeof selectedInterview.jobDescriptionId === 'object' &&
    typeof selectedInterview.jobDescriptionId?.departmentId === 'object'
      ? selectedInterview.jobDescriptionId.departmentId.name
      : 'Phòng ban';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!interviewerIdVal) {
      setErrorMsg('Vui lòng chọn người phỏng vấn.');
      return;
    }
    if (!dateVal) {
      setErrorMsg('Vui lòng chọn ngày phỏng vấn.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload: UpdateInterviewPayload = {
        interviewerId: interviewerIdVal,
        date: dateVal,
        startTime: startTimeVal,
        endTime: endTimeVal,
        locationType: locationTypeVal,
        autoCreateMeet,
        offsiteLocation: locationTypeVal === LocationType.OFFSITE ? offsiteLocationVal : undefined,
        status: statusVal,
        notes: notesVal
      };

      await interviewsApi.updateInterview(selectedInterview._id, payload);
      onSaveSuccess();
      onClose();
    } catch (err: any) {
      console.error('Lỗi khi cập nhật lịch phỏng vấn:', err);
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          'Cập nhật lịch phỏng vấn thất bại. Vui lòng thử lại!'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const interviewerSelectOptions = staffOptions.map((u) => ({
    value: u._id,
    label: `${u.name || u.email} (${u.role === 'DEPARTMENT_MANAGER' ? 'Trưởng phòng' : 'Nhân viên'})`
  }));

  const statusOptions = [
    { value: InterviewStatus.SCHEDULED, label: 'Đã lên lịch' },
    { value: InterviewStatus.COMPLETED, label: 'Hoàn thành' },
    { value: InterviewStatus.CANCELLED, label: 'Đã hủy' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Edit3 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Chỉnh sửa lịch phỏng vấn
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Cập nhật ngày, thời gian, hình thức và người phỏng vấn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-medium flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Candidate Summary Info Box */}
          <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200/80 rounded-2xl space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <UserIcon size={16} className="text-indigo-600" />
                <span>{candidateName}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {deptName}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 pl-6">
              Vị trí: <strong className="text-slate-800">{jobTitle}</strong>
            </p>
          </div>

          {/* Người phỏng vấn Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Người phỏng vấn <span className="text-rose-500">*</span>
            </label>
            {isLoadingStaff ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                <Loader2 size={15} className="animate-spin text-indigo-600" />
                <span>Đang tải danh sách nhân viên...</span>
              </div>
            ) : (
              <CustomSelect
                options={interviewerSelectOptions}
                value={interviewerIdVal}
                onChange={(val) => setInterviewerIdVal(val)}
                placeholder="-- Chọn người phỏng vấn --"
              />
            )}
          </div>

          {/* Ngày & Giờ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Ngày phỏng vấn <span className="text-rose-500">*</span>
              </label>
              <CustomDatePicker
                value={dateVal}
                onChange={(val) => setDateVal(val)}
                placeholder="dd/mm/yyyy"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Giờ bắt đầu <span className="text-rose-500">*</span>
                </label>
                <CustomTimePicker
                  value={startTimeVal}
                  onChange={(val) => setStartTimeVal(val)}
                  placeholder="14:00"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Giờ kết thúc <span className="text-rose-500">*</span>
                </label>
                <CustomTimePicker
                  value={endTimeVal}
                  onChange={(val) => setEndTimeVal(val)}
                  placeholder="15:30"
                />
              </div>
            </div>
          </div>

          {/* Hình thức & Trạng thái */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hình thức */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Hình thức phỏng vấn
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLocationTypeVal(LocationType.ONLINE)}
                  className={`py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    locationTypeVal === LocationType.ONLINE
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Video size={15} />
                  <span>Online</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLocationTypeVal(LocationType.OFFSITE)}
                  className={`py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    locationTypeVal === LocationType.OFFSITE
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building2 size={15} />
                  <span>Offsite</span>
                </button>
              </div>
            </div>

            {/* Trạng thái */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Trạng thái
              </label>
              <CustomSelect
                options={statusOptions}
                value={statusVal}
                onChange={(val) => setStatusVal(val as InterviewStatus)}
              />
            </div>
          </div>

          {/* Location details */}
          {locationTypeVal === LocationType.ONLINE ? (
            <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-start gap-2.5">
              <input
                type="checkbox"
                id="editAutoMeet"
                checked={autoCreateMeet}
                onChange={(e) => setAutoCreateMeet(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="editAutoMeet" className="cursor-pointer select-none text-xs">
                <span className="font-bold text-slate-900 block">
                  Tự động sinh / cập nhật link phòng họp Online (Jitsi Meet)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Link phòng phỏng vấn trực tuyến sẽ được cập nhật tự động.
                </span>
              </label>
            </div>
          ) : (
            <CustomInput
              label="Địa điểm cụ thể"
              value={offsiteLocationVal}
              onChange={(e) => setOffsiteLocationVal(e.target.value)}
              placeholder="Ví dụ: Phòng họp 3.2 - Tầng 3, Trụ sở TPHCM"
            />
          )}

          {/* Ghi chú */}
          <CustomTextarea
            label="Ghi chú"
            rows={3}
            value={notesVal}
            onChange={(e) => setNotesVal(e.target.value)}
            placeholder="Ghi chú thêm về buổi phỏng vấn..."
          />

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Calendar size={15} />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
