"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Calendar, Clock, Video, MapPin, UserCheck, Loader2 } from "lucide-react";
import { InterviewItem, LocationType } from "../types/interview.types";
import { interviewsApi } from "../services/interviews.api";
import { User, UserRole, USER_ROLE_LABEL } from "@/src/features/users/types/user.types";
import { useEmployeesQuery } from "@/src/features/users/hooks/useEmployeesQuery";
import { useAuth } from "@/src/providers/AuthProvider";
import {
  interviewScheduleSchema,
  InterviewScheduleFormData,
} from "../schemas/interview-schedule.schema";
import {
  CustomDatePicker,
  CustomTimePicker,
  CustomInput,
  CustomSelect,
  CustomSelectOption,
} from "@/src/components/common";

interface DeptScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: InterviewItem | null;
  onSuccess: () => void;
}

export function DeptScheduleFormModal({
  isOpen,
  onClose,
  interview,
  onSuccess,
}: DeptScheduleFormModalProps) {
  const { user: currentUser } = useAuth();
  const isHrAdmin =
    currentUser?.role === UserRole.HR_ADMIN || (currentUser?.role as string) === "ADMIN";

  const { data: staffList = [], isLoading: isLoadingStaff } = useEmployeesQuery({ enabled: isOpen });
  const [topError, setTopError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Extract Info
  const cand = interview?.candidateId;
  const candName = typeof cand === "object" ? cand?.fullName || cand?.name : "Ứng viên";
  const job = interview?.jobDescriptionId;
  const jobTitle = typeof job === "object" ? job?.title : "Vị trí tuyển dụng";
  const deptName = typeof job === "object" && typeof job?.departmentId === "object" ? job?.departmentId?.name : "Phòng ban";
  const deptId = typeof job === "object" && typeof job?.departmentId === "object" ? job?.departmentId?._id : (typeof job === "object" ? (job as any)?.departmentId : undefined);

  // Helper to generate clean Jitsi URL without accents/spaces
  const generateJitsiUrl = (dept?: string, candidate?: string, title?: string) => {
    const sanitize = (str?: string) => {
      if (!str) return "";
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-zA-Z0-9]/g, "")
        .trim();
    };

    const dSlug = sanitize(dept) || "PhongBan";
    const cSlug = sanitize(candidate) || "UngVien";
    const jSlug = sanitize(title) || "ViTri";

    return `https://meet.jit.si/TalentCore-${dSlug}-${cSlug}-${jSlug}`;
  };

  // React Hook Form setup with Zod validation schema
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InterviewScheduleFormData>({
    resolver: zodResolver(interviewScheduleSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      locationType: LocationType.ONLINE,
      meetingLink: "",
      offsiteLocation: "Tầng 1, Tòa nhà Landmark 81, Nguyễn Hữu Cảnh, HCM",
      interviewerId: "",
    },
  });

  const locationType = watch("locationType");
  const date = watch("date");
  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const meetingLink = watch("meetingLink");
  const offsiteLocation = watch("offsiteLocation");
  const selectedInterviewerId = watch("interviewerId");

  // Populate form on interview change
  useEffect(() => {
    if (interview && isOpen) {
      setTopError("");

      let defaultDate = new Date().toISOString().split("T")[0];
      if (interview.date) {
        const d = new Date(interview.date);
        if (!isNaN(d.getTime())) {
          defaultDate = d.toISOString().split("T")[0];
        }
      }

      const locType = interview.locationType || LocationType.ONLINE;
      const autoUrl = interview.meetingLink || generateJitsiUrl(deptName, candName, jobTitle);
      const autoOffsite = interview.offsiteLocation || "Tầng 1, Tòa nhà Landmark 81, Nguyễn Hữu Cảnh, HCM";

      const existingInterviewerId =
        typeof interview.interviewerId === "object"
          ? interview.interviewerId?._id
          : interview.interviewerId || "";

      reset({
        date: defaultDate,
        startTime: interview.startTime || "09:00",
        endTime: interview.endTime || "10:00",
        locationType: locType,
        meetingLink: locType === LocationType.ONLINE ? autoUrl : "",
        offsiteLocation: locType === LocationType.OFFSITE ? autoOffsite : "Tầng 1, Tòa nhà Landmark 81, Nguyễn Hữu Cảnh, HCM",
        interviewerId: existingInterviewerId,
      });
    }
  }, [interview, isOpen, deptName, candName, jobTitle, reset]);

  // Handle Location Type change
  const handleLocationTypeChange = (type: LocationType) => {
    setValue("locationType", type, { shouldValidate: true });
    if (type === LocationType.ONLINE) {
      if (!meetingLink) {
        setValue("meetingLink", generateJitsiUrl(deptName, candName, jobTitle), { shouldValidate: true });
      }
    } else {
      if (!offsiteLocation) {
        setValue("offsiteLocation", "Tầng 1, Tòa nhà Landmark 81, Nguyễn Hữu Cảnh, HCM", { shouldValidate: true });
      }
    }
  };

  // Filter department staff
  const filteredStaffOptions: CustomSelectOption[] = useMemo(() => {
    let list = staffList;
    if (deptId) {
      const matched = staffList.filter((user) => {
        const uDeptId = typeof user.departmentId === "object" ? user.departmentId?._id : user.departmentId;
        return uDeptId === deptId;
      });
      if (matched.length > 0) {
        list = matched;
      }
    }

    return list.map((user) => ({
      value: user._id,
      label: user.name,
      subLabel: `${user.email} • ${USER_ROLE_LABEL[user.role] || user.role}`,
    }));
  }, [staffList, deptId]);

  if (!isOpen || !interview || !isMounted) return null;

  const onSubmit = async (data: InterviewScheduleFormData) => {
    setTopError("");
    try {
      await interviewsApi.submitDeptSchedule(interview._id, {
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        locationType: data.locationType,
        meetingLink: data.locationType === LocationType.ONLINE ? data.meetingLink?.trim() : undefined,
        offsiteLocation: data.locationType === LocationType.OFFSITE ? data.offsiteLocation?.trim() : undefined,
        interviewerId: data.interviewerId,
        interviewerIds: [data.interviewerId],
        isHrAdmin: !!isHrAdmin,
        byHr: !!isHrAdmin,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Lỗi khi gửi lịch phỏng vấn:", err);
      setTopError(err?.message || "Có lỗi xảy ra khi gửi lịch phỏng vấn. Vui lòng thử lại!");
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full shadow-2xl shadow-blue-500/10 border border-white/90 overflow-hidden flex flex-col max-h-[92vh] z-10 text-slate-900 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200/60 flex items-start justify-between bg-blue-500/5">
          <div>
            <h3 className="font-bold text-lg text-slate-900 leading-snug">
              {isHrAdmin ? "Chỉnh sửa Lịch phỏng vấn & Phân công Interviewer" : "Xếp lịch Phỏng vấn & Chọn Người phỏng vấn"}
            </h3>
            <p className="text-xs font-semibold text-slate-700 mt-1">
              Ứng viên: <strong className="text-slate-900 font-bold">{candName} - {jobTitle}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body with React Hook Form + Zod */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto" noValidate>
          {topError && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold">
              {topError}
            </div>
          )}

          {/* Ngày phỏng vấn */}
          <CustomDatePicker
            label="Ngày phỏng vấn"
            required
            value={date}
            onChange={(val) => {
              setValue("date", val, { shouldValidate: true });
            }}
            error={errors.date?.message}
          />

          {/* Khung giờ Phỏng vấn */}
          <div className="grid grid-cols-2 gap-3">
            <CustomTimePicker
              label="Giờ bắt đầu"
              required
              value={startTime}
              onChange={(val) => {
                setValue("startTime", val, { shouldValidate: true });
              }}
              error={errors.startTime?.message}
            />

            <CustomTimePicker
              label="Giờ kết thúc"
              required
              value={endTime}
              onChange={(val) => {
                setValue("endTime", val, { shouldValidate: true });
              }}
              error={errors.endTime?.message}
            />
          </div>

          {/* Hình thức phỏng vấn */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Hình thức phỏng vấn <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLocationTypeChange(LocationType.ONLINE)}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  locationType === LocationType.ONLINE
                    ? "bg-blue-50 border-[#3B82F6] text-[#3B82F6] ring-2 ring-blue-500/15 shadow-2xs"
                    : "bg-slate-50/80 border-slate-200/80 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Video size={15} />
                <span>Online (Meeting)</span>
              </button>
              <button
                type="button"
                onClick={() => handleLocationTypeChange(LocationType.OFFSITE)}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  locationType === LocationType.OFFSITE
                    ? "bg-blue-50 border-[#3B82F6] text-[#3B82F6] ring-2 ring-blue-500/15 shadow-2xs"
                    : "bg-slate-50/80 border-slate-200/80 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <MapPin size={15} />
                <span>Trực tiếp (Offsite)</span>
              </button>
            </div>
          </div>

          {/* Link cuộc họp / Địa điểm trực tiếp */}
          {locationType === LocationType.ONLINE ? (
            <CustomInput
              label="Link cuộc họp (Jitsi / Meet / Zoom)"
              required
              type="url"
              placeholder="https://meet.jit.si/..."
              value={meetingLink}
              disabled={true}
              error={errors.meetingLink?.message}
              icon={<Video size={16} />}
              {...register("meetingLink")}
            />
          ) : (
            <CustomInput
              label="Địa chỉ / Phòng phỏng vấn trực tiếp"
              required
              type="text"
              placeholder="Tầng 1, Tòa nhà Landmark 81, Nguyễn Hữu Cảnh, HCM"
              value={offsiteLocation}
              disabled={false}
              error={errors.offsiteLocation?.message}
              icon={<MapPin size={16} />}
              {...register("offsiteLocation")}
            />
          )}

          {/* Người phỏng vấn (Interviewer thuộc phòng ban) */}
          <CustomSelect
            label="Người phỏng vấn (Interviewer thuộc phòng ban)"
            required
            placeholder={isLoadingStaff ? "Đang tải danh sách nhân sự..." : "-- Chọn người phỏng vấn --"}
            value={selectedInterviewerId}
            onChange={(val) => {
              setValue("interviewerId", val, { shouldValidate: true });
            }}
            options={filteredStaffOptions}
            error={errors.interviewerId?.message}
            icon={<UserCheck size={16} />}
            disabled={isLoadingStaff}
          />

          {/* Footer Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] active:scale-95 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 inline-flex items-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              <span>{isHrAdmin ? "Lưu & Cập nhật lịch" : "Gửi HR duyệt lịch"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
