'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Video,
  Building2,
  AlertCircle,
  Loader2,
  User as UserIcon,
  ChevronDown,
  Check,
  Sparkles,
  Lock
} from 'lucide-react';
import {
  CandidateSelectOption,
  LocationType,
  StaffUser
} from '@/src/features/interviews/types/interview.types';
import { interviewsApi } from '@/src/features/interviews/services/interviews.api';
import UnsavedChangesModal from '@/src/features/job-description/components/UnsavedChangesModal';
import {
  CustomInput,
  CustomSelect,
  CustomDatePicker,
  CustomTimePicker,
  CustomTextarea
} from '@/src/components/common';

export default function CreateInterviewPage() {
  const router = useRouter();

  const [candidateOptions, setCandidateOptions] = useState<CandidateSelectOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState<boolean>(true);

  // Form State
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateSelectOption | null>(null);

  // Candidate Search Combobox State
  const [candidateSearchQuery, setCandidateSearchQuery] = useState<string>('');
  const [isCandidateDropdownOpen, setIsCandidateDropdownOpen] = useState<boolean>(false);
  const candidateComboboxRef = useRef<HTMLDivElement>(null);

  // Interviewer Selection State
  const [interviewerOptions, setInterviewerOptions] = useState<StaffUser[]>([]);
  const [selectedInterviewerId, setSelectedInterviewerId] = useState<string>('');
  const [isInterviewerDropdownOpen, setIsInterviewerDropdownOpen] = useState<boolean>(false);
  const interviewerDropdownRef = useRef<HTMLDivElement>(null);

  const [dateVal, setDateVal] = useState<string>('');
  const [startTimeVal, setStartTimeVal] = useState<string>('14:00');
  const [endTimeVal, setEndTimeVal] = useState<string>('15:30');

  const [locationTypeVal, setLocationTypeVal] = useState<LocationType>(LocationType.ONLINE);
  const [autoCreateMeet, setAutoCreateMeet] = useState<boolean>(true);
  const [offsiteLocationVal, setOffsiteLocationVal] = useState<string>('');
  const [notesVal, setNotesVal] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Track Unsaved Changes & Target Link Navigation
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState<boolean>(false);
  const pendingNavigationUrlRef = useRef<string>('/interviews');

  // Load candidate list for select
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const list = await interviewsApi.getCandidatesForSelect();
        setCandidateOptions(list);
      } catch (err) {
        console.error('Lỗi khi tải danh sách ứng viên:', err);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // Global Unsaved Changes Interception (intercept sidebar/header link clicks & page leave)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleGlobalDocumentClick = (e: MouseEvent) => {
      if (!isDirty) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a') as HTMLAnchorElement | null;

      if (anchor && anchor.href) {
        const targetUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Only intercept if navigating away from the current page
        if (targetUrl.pathname !== currentUrl.pathname) {
          e.preventDefault();
          e.stopPropagation();
          pendingNavigationUrlRef.current = targetUrl.pathname + targetUrl.search + targetUrl.hash;
          setIsUnsavedModalOpen(true);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleGlobalDocumentClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleGlobalDocumentClick, true);
    };
  }, [isDirty]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        candidateComboboxRef.current &&
        !candidateComboboxRef.current.contains(e.target as Node)
      ) {
        setIsCandidateDropdownOpen(false);
      }
      if (
        interviewerDropdownRef.current &&
        !interviewerDropdownRef.current.contains(e.target as Node)
      ) {
        setIsInterviewerDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered candidate list based on search query
  const filteredCandidateOptions = candidateOptions.filter((opt) => {
    const query = candidateSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      opt.candidateName.toLowerCase().includes(query) ||
      opt.jobTitle.toLowerCase().includes(query) ||
      opt.label.toLowerCase().includes(query)
    );
  });

  // Handle selecting candidate
  const handleSelectCandidateOption = (cand: CandidateSelectOption) => {
    setSelectedAppId(cand.applicationId);
    setSelectedCandidate(cand);
    setCandidateSearchQuery(cand.label);
    setIsCandidateDropdownOpen(false);
    setErrorMsg(null);
    setIsDirty(true);

    // Interviewer assignment logic
    if (cand.defaultInterviewerId) {
      setSelectedInterviewerId(cand.defaultInterviewerId);
    } else {
      setSelectedInterviewerId('');
    }

    if (cand.departmentStaff && cand.departmentStaff.length > 0) {
      setInterviewerOptions(cand.departmentStaff);
    } else {
      setInterviewerOptions([]);
    }
  };

  const handleBackOrCancelClick = () => {
    if (isDirty) {
      pendingNavigationUrlRef.current = '/interviews';
      setIsUnsavedModalOpen(true);
    } else {
      router.push('/interviews');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAppId) {
      setErrorMsg('Vui lòng tìm và chọn một ứng viên.');
      return;
    }
    if (!selectedInterviewerId) {
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
      await interviewsApi.createInterview({
        applicationId: selectedAppId,
        interviewerId: selectedInterviewerId,
        date: dateVal,
        startTime: startTimeVal,
        endTime: endTimeVal,
        locationType: locationTypeVal,
        autoCreateMeet,
        offsiteLocation: locationTypeVal === LocationType.OFFSITE ? offsiteLocationVal : undefined,
        notes: notesVal,
      });

      setIsDirty(false);
      router.push('/interviews');
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          'Tạo lịch phỏng vấn thất bại. Vui lòng thử lại!'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Interviewer name label
  const getSelectedInterviewerLabel = () => {
    if (!selectedAppId) return '-- Vui lòng chọn ứng viên trước --';
    if (!selectedInterviewerId) return '-- Chọn người phỏng vấn --';
    if (
      selectedCandidate?.defaultInterviewerId === selectedInterviewerId &&
      selectedCandidate.defaultInterviewerName
    ) {
      return `${selectedCandidate.defaultInterviewerName} (Theo vị trí JD)`;
    }
    const found = interviewerOptions.find((u) => u._id === selectedInterviewerId);
    if (found) {
      const roleName = found.role === 'DEPARTMENT_MANAGER' ? 'Trưởng phòng' : 'Nhân viên';
      return `${found.name || found.email} (${roleName})`;
    }
    return '-- Chọn người phỏng vấn --';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-slate-900">
      {/* Main Form Container Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-indigo-50/40 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleBackOrCancelClick}
              className="w-11 h-11 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs group"
              title="Quay lại danh sách"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Lên lịch phỏng vấn mới
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Tạo lịch phỏng vấn
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Lên lịch và gửi thông báo tự động đến ứng viên & interviewer
              </p>
            </div>
          </div>

          {/* Right Header Metadata */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-2xs flex items-center gap-2">
              <Calendar size={14} className="text-indigo-600" />
              <span>Hôm nay: 05/09/2026</span>
            </div>
            <span className="px-3.5 py-1.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Thiết lập lịch phỏng vấn</span>
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7">
          {/* Error Alert */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-medium flex items-center gap-3 animate-in fade-in">
              <AlertCircle size={18} className="shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Trường Ứng viên (Text Cursor on hover) */}
          <div className="space-y-2 relative" ref={candidateComboboxRef}>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Ứng viên <span className="text-rose-500">*</span>
            </label>

            {isLoadingOptions ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-600" />
                <span>Đang tải danh sách ứng viên...</span>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={candidateSearchQuery}
                  onFocus={() => setIsCandidateDropdownOpen(true)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCandidateSearchQuery(val);
                    setIsCandidateDropdownOpen(true);
                    setIsDirty(true);
                    if (selectedCandidate && val !== selectedCandidate.label) {
                      setSelectedAppId('');
                      setSelectedCandidate(null);
                      setSelectedInterviewerId('');
                    }
                  }}
                  placeholder="Gõ tên ứng viên hoặc vị trí công việc để tìm kiếm..."
                  className="w-full px-4 py-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all cursor-text"
                />

                {/* Custom Rounded Dropdown Options Box */}
                {isCandidateDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto">
                    {filteredCandidateOptions.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">
                        Không tìm thấy ứng viên phù hợp.
                      </div>
                    ) : (
                      filteredCandidateOptions.map((cand) => {
                        const isSelected = selectedAppId === cand.applicationId;
                        return (
                          <div
                            key={cand.applicationId}
                            onClick={() => handleSelectCandidateOption(cand)}
                            className={`p-3.5 border-b border-slate-100 last:border-0 flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-50/80 text-indigo-900 font-bold'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div>
                              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <UserIcon size={14} className="text-indigo-600" />
                                <span>{cand.candidateName}</span>
                              </div>
                              <div className="text-xs font-semibold text-slate-500 mt-0.5 pl-5">
                                Vị trí: <span className="text-indigo-700">{cand.jobTitle}</span>
                              </div>
                            </div>

                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                              {cand.departmentName}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Redesigned Candidate Info Summary Box */}
            {selectedAppId && selectedCandidate && candidateSearchQuery === selectedCandidate.label && (
              <div className="mt-3 p-4 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-emerald-50/20 border border-slate-200/80 rounded-2xl flex flex-wrap items-center gap-4 text-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <span className="text-slate-500 font-semibold">Phòng ban tuyển dụng:</span>
                  <span className="font-extrabold text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
                    {selectedCandidate.departmentName}
                  </span>
                </div>

                {selectedCandidate.defaultInterviewerName && (
                  <div className="flex items-center gap-2 sm:border-l sm:border-slate-200/80 sm:pl-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-slate-500 font-semibold">Interviewer tự động chọn:</span>
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200/80 shadow-2xs">
                      {selectedCandidate.defaultInterviewerName}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Trường Người phỏng vấn (Disabled until Candidate is selected) */}
          <div className="space-y-2 relative" ref={interviewerDropdownRef}>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Người phỏng vấn <span className="text-rose-500">*</span>
            </label>

            <div className="relative">
              <button
                type="button"
                disabled={!selectedAppId}
                onClick={() => {
                  if (selectedAppId) {
                    setIsInterviewerDropdownOpen(!isInterviewerDropdownOpen);
                  }
                }}
                className={`w-full px-4 py-3.5 border rounded-2xl text-sm font-bold flex items-center justify-between outline-none transition-all text-left ${
                  !selectedAppId
                    ? 'bg-slate-100/90 text-slate-400 border-slate-200 cursor-not-allowed opacity-75'
                    : 'bg-slate-50/80 text-slate-900 border-slate-200 hover:bg-slate-100/80 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer'
                }`}
              >
                <span>{getSelectedInterviewerLabel()}</span>
                {!selectedAppId ? (
                  <Lock size={16} className="text-slate-400" />
                ) : (
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-200 ${
                      isInterviewerDropdownOpen ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                )}
              </button>

              {/* Custom Rounded Options Popup */}
              {isInterviewerDropdownOpen && selectedAppId && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto p-1.5 space-y-1">
                  {/* Default Interviewer Option if assigned from JD */}
                  {selectedCandidate?.defaultInterviewerId &&
                    !interviewerOptions.some(
                      (u) => u._id === selectedCandidate.defaultInterviewerId
                    ) && (
                      <div
                        onClick={() => {
                          setSelectedInterviewerId(selectedCandidate.defaultInterviewerId!);
                          setIsInterviewerDropdownOpen(false);
                          setIsDirty(true);
                        }}
                        className={`p-3 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                          selectedInterviewerId === selectedCandidate.defaultInterviewerId
                            ? 'bg-indigo-50 text-indigo-900'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span>{selectedCandidate.defaultInterviewerName} (Theo vị trí JD)</span>
                        {selectedInterviewerId === selectedCandidate.defaultInterviewerId && (
                          <Check size={16} className="text-indigo-600" />
                        )}
                      </div>
                    )}

                  {interviewerOptions.map((user) => {
                    const isSelected = selectedInterviewerId === user._id;
                    const roleName = user.role === 'DEPARTMENT_MANAGER' ? 'Trưởng phòng' : 'Nhân viên';
                    return (
                      <div
                        key={user._id}
                        onClick={() => {
                          setSelectedInterviewerId(user._id);
                          setIsInterviewerDropdownOpen(false);
                          setIsDirty(true);
                        }}
                        className={`p-3 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-900'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div>
                          <span>{user.name || user.email}</span>
                          <span className="text-[11px] text-slate-400 font-medium ml-2">
                            ({roleName})
                          </span>
                        </div>
                        {isSelected && <Check size={16} className="text-indigo-600" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Vui lòng chọn ứng viên trước để hệ thống gợi ý danh sách người phỏng vấn tương ứng.
            </p>
          </div>

          {/* 3. Trường Ngày & Giờ (Custom Rounded Date & Time Pickers) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Ngày <span className="text-rose-500">*</span>
              </label>
              <CustomDatePicker
                value={dateVal}
                onChange={(val) => {
                  setDateVal(val);
                  setIsDirty(true);
                }}
                placeholder="dd/mm/yyyy"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Giờ bắt đầu <span className="text-rose-500">*</span>
                </label>
                <CustomTimePicker
                  value={startTimeVal}
                  onChange={(val) => {
                    setStartTimeVal(val);
                    setIsDirty(true);
                  }}
                  placeholder="14:00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Giờ kết thúc <span className="text-rose-500">*</span>
                </label>
                <CustomTimePicker
                  value={endTimeVal}
                  onChange={(val) => {
                    setEndTimeVal(val);
                    setIsDirty(true);
                  }}
                  placeholder="15:30"
                />
              </div>
            </div>
          </div>

          {/* 4. Hình thức Phỏng vấn */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Hình thức phỏng vấn
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setLocationTypeVal(LocationType.ONLINE);
                  setIsDirty(true);
                }}
                className={`py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  locationTypeVal === LocationType.ONLINE
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Video size={16} />
                <span>Online</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLocationTypeVal(LocationType.OFFSITE);
                  setIsDirty(true);
                }}
                className={`py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  locationTypeVal === LocationType.OFFSITE
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Building2 size={16} />
                <span>Offsite</span>
              </button>
            </div>
          </div>

          {/* Google Meet Option (nếu Online) */}
          {locationTypeVal === LocationType.ONLINE && (
            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-start gap-3">
              <input
                type="checkbox"
                id="autoMeet"
                checked={autoCreateMeet}
                onChange={(e) => {
                  setAutoCreateMeet(e.target.checked);
                  setIsDirty(true);
                }}
                className="mt-0.5 w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded-md focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="autoMeet" className="cursor-pointer select-none">
                <span className="text-xs font-bold text-slate-900 block">
                  Tự động tạo link phòng họp Online (Jitsi Meet)
                </span>
                <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                  Link phòng họp tự động sinh dạng: https://meet.jit.si/TalentCore-[Phòng_Ban]-[Tên_Ứng_Viên]-[Vị_Trí]
                </span>
              </label>
            </div>
          )}

          {/* Offsite Location Field (nếu Offsite) */}
          {locationTypeVal === LocationType.OFFSITE && (
            <CustomInput
              label="Địa điểm cụ thể"
              value={offsiteLocationVal}
              onChange={(e) => {
                setOffsiteLocationVal(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Ví dụ: Phòng họp 3.2 - Tầng 3, Trụ sở TPHCM"
            />
          )}

          {/* 5. Ghi chú */}
          <CustomTextarea
            label="Ghi chú"
            rows={4}
            value={notesVal}
            onChange={(e) => {
              setNotesVal(e.target.value);
              setIsDirty(true);
            }}
            placeholder="Ghi chú cho interviewer hoặc ứng viên..."
          />

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleBackOrCancelClick}
              className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Đang tạo lịch...</span>
                </>
              ) : (
                <>
                  <Calendar size={16} />
                  <span>Tạo lịch & gửi thông báo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Unsaved Changes Warning Modal */}
      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onClose={() => setIsUnsavedModalOpen(false)}
        onConfirm={() => {
          setIsDirty(false);
          setIsUnsavedModalOpen(false);
          router.push(pendingNavigationUrlRef.current);
        }}
      />
    </div>
  );
}
