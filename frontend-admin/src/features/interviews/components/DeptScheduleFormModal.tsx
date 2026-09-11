"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Calendar, Clock, Video, MapPin, UserCheck, Loader2 } from "lucide-react";
import { InterviewItem, LocationType } from "../types/interview.types";
import { interviewsApi } from "../services/interviews.api";
import { userApi } from "@/src/features/users/services/user.api";
import { User, USER_ROLE_LABEL } from "@/src/features/users/types/user.types";
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
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [locationType, setLocationType] = useState<LocationType>(LocationType.ONLINE);
  const [meetingLink, setMeetingLink] = useState("");
  const [offsiteLocation, setOffsiteLocation] = useState("");
  const [selectedInterviewerId, setSelectedInterviewerId] = useState("");

  const [staffList, setStaffList] = useState<User[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Errors state for validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState("");

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

  // Load all staff employees
  useEffect(() => {
    if (!isOpen) return;
    const fetchStaff = async () => {
      try {
        setIsLoadingStaff(true);
        const data = await userApi.getEmployees();
        setStaffList(data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách nhân sự:", err);
      } finally {
        setIsLoadingStaff(false);
      }
    };
    fetchStaff();
  }, [isOpen]);

  // Populate form on interview change
  useEffect(() => {
    if (interview && isOpen) {
      setErrors({});
      setTopError("");

      if (interview.date) {
        const d = new Date(interview.date);
        if (!isNaN(d.getTime())) {
          setDate(d.toISOString().split("T")[0]);
        }
      } else {
        setDate(new Date().toISOString().split("T")[0]);
      }

      if (interview.startTime) setStartTime(interview.startTime);
      if (interview.endTime) setEndTime(interview.endTime);

      const locType = interview.locationType || LocationType.ONLINE;
      setLocationType(locType);

      if (locType === LocationType.ONLINE) {
        const autoUrl = interview.meetingLink || generateJitsiUrl(deptName, candName, jobTitle);
        setMeetingLink(autoUrl);
        setOffsiteLocation("Tầng 1, Tòa nhà Landmark 81, Nguyễn Hữu Cảnh, HCM");
      } else {
        setOffsiteLocation(interview.offsiteLocation || "Tầng 1, Tòa nhà Landmark 81, Nguyễn Hữu Cảnh, HCM");
        setMeetingLink(generateJitsiUrl(deptName, candName, jobTitle));
      }

      const existingInterviewerId =
        typeof interview.interviewerId === "object"
          ? interview.interviewerId?._id
          : interview.interviewerId;

      if (existingInterviewerId) {
        setSelectedInterviewerId(existingInterviewerId);
      } else {
        setSelectedInterviewerId("");
      }
    }
  }, [interview, isOpen]);

  // Handle Location Type change
  const handleLocationTypeChange = (type: LocationType) => {
    setLocationType(type);
    setErrors((prev) => ({ ...prev, location: "" }));

    if (type === LocationType.ONLINE) {
      if (!meetingLink) {
        setMeetingLink(generateJitsiUrl(deptName, candName, jobTitle));
      }
    } else {
      if (!offsiteLocation) {
        setOffsiteLocation("Tầng 1, Tòa nhà Landmark 81, Nguyễn Hữu Cảnh, HCM");
      }
    }
  };

  // Filter department staff (including Department Manager and all members of department)
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

  if (!isOpen || !interview) return null;

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!date) {
      newErrors.date = "Vui lòng chọn ngày phỏng vấn";
    }

    if (!startTime) {
      newErrors.startTime = "Vui lòng chọn giờ bắt đầu";
    }

    if (!endTime) {
      newErrors.endTime = "Vui lòng chọn giờ kết thúc";
    } else if (startTime && endTime <= startTime) {
      newErrors.endTime = "Giờ kết thúc phải lớn hơn giờ bắt đầu";
    }

    if (locationType === LocationType.ONLINE) {
      if (!meetingLink.trim()) {
        newErrors.location = "Vui lòng nhập link phỏng vấn online";
      }
    } else {
      if (!offsiteLocation.trim()) {
        newErrors.location = "Vui lòng nhập địa chỉ phỏng vấn trực tiếp";
      }
    }

    if (!selectedInterviewerId) {
      newErrors.interviewer = "Vui lòng chọn Người phỏng vấn thuộc phòng ban";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopError("");

    if (!validateForm()) {
      setTopError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    try {
      setIsSubmitting(true);

      await interviewsApi.submitDeptSchedule(interview._id, {
        date,
        startTime,
        endTime,
        locationType,
        meetingLink: locationType === LocationType.ONLINE ? meetingLink.trim() : undefined,
        offsiteLocation: locationType === LocationType.OFFSITE ? offsiteLocation.trim() : undefined,
        interviewerId: selectedInterviewerId,
        interviewerIds: [selectedInterviewerId],
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Lỗi khi gửi lịch phỏng vấn:", err);
      setTopError(err?.message || "Có lỗi xảy ra khi gửi lịch phỏng vấn. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-lg text-slate-900 leading-snug">
              Xếp lịch Phỏng vấn & Chọn Người phỏng vấn
            </h3>
            <p className="text-xs font-semibold text-slate-800 mt-1">
              Ứng viên: <strong className="text-slate-800 font-bold">{candName} - {jobTitle}</strong>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
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
              setDate(val);
              setErrors((prev) => ({ ...prev, date: "" }));
            }}
            error={errors.date}
          />

          {/* Khung giờ Phỏng vấn */}
          <div className="grid grid-cols-2 gap-3">
            <CustomTimePicker
              label="Giờ bắt đầu"
              required
              value={startTime}
              onChange={(val) => {
                setStartTime(val);
                setErrors((prev) => ({ ...prev, startTime: "" }));
              }}
              error={errors.startTime}
            />

            <CustomTimePicker
              label="Giờ kết thúc"
              required
              value={endTime}
              onChange={(val) => {
                setEndTime(val);
                setErrors((prev) => ({ ...prev, endTime: "" }));
              }}
              error={errors.endTime}
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
                    ? "bg-cyan-50 border-cyan-300 text-cyan-700 shadow-xs ring-2 ring-cyan-500/10"
                    : "bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100"
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
                    ? "bg-amber-50 border-amber-300 text-amber-700 shadow-xs ring-2 ring-amber-500/10"
                    : "bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100"
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
              onChange={(e) => {
                setMeetingLink(e.target.value);
                setErrors((prev) => ({ ...prev, location: "" }));
              }}
              error={errors.location}
              icon={<Video size={16} />}
            />
          ) : (
            <CustomInput
              label="Địa chỉ / Phòng phỏng vấn trực tiếp"
              required
              type="text"
              placeholder="Tầng 1, Tòa nhà Landmark 81, Nguyễn Hữu Cảnh, HCM"
              value={offsiteLocation}
              disabled={false}
              onChange={(e) => {
                setOffsiteLocation(e.target.value);
                setErrors((prev) => ({ ...prev, location: "" }));
              }}
              error={errors.location}
              icon={<MapPin size={16} />}
            />
          )}

          {/* Người phỏng vấn (Interviewer thuộc phòng ban) */}
          <CustomSelect
            label="Người phỏng vấn (Interviewer thuộc phòng ban)"
            required
            placeholder={isLoadingStaff ? "Đang tải danh sách nhân sự..." : "-- Chọn người phỏng vấn --"}
            value={selectedInterviewerId}
            onChange={(val) => {
              setSelectedInterviewerId(val);
              setErrors((prev) => ({ ...prev, interviewer: "" }));
            }}
            options={filteredStaffOptions}
            error={errors.interviewer}
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
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20 inline-flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-75"
            >
              {isSubmitting && <Loader2 size={15} className="animate-spin" />}
              <span>Gửi HR duyệt lịch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
