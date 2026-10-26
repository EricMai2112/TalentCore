"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check, Loader2, AlertTriangle, Briefcase } from "lucide-react";
import { PositionWithSkills, DeptOption } from "../types/skill.types";
import { CustomInput, CustomSelect } from "@/src/components/common";

interface EditPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, name: string, departmentId: string) => Promise<void>;
  position: PositionWithSkills | null;
  departments: DeptOption[];
  isSubmitting: boolean;
  isDeptManager?: boolean;
  userDeptId?: string;
}

export default function EditPositionModal({
  isOpen,
  onClose,
  onSubmit,
  position,
  departments,
  isSubmitting,
  isDeptManager = false,
  userDeptId = "",
}: EditPositionModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [name, setName] = useState("");
  const [deptId, setDeptId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !position) return;
    setName(position.name);
    setDeptId(isDeptManager && userDeptId ? userDeptId : position.departmentId._id);
    setError(null);
  }, [isOpen, position, isDeptManager, userDeptId]);

  if (!isOpen || !position || !isMounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Tên vị trí không được để trống");
    const finalDeptId = isDeptManager ? userDeptId : deptId;
    if (!finalDeptId) return setError("Vui lòng chọn phòng ban");
    try {
      await onSubmit(position._id, name.trim(), finalDeptId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Full Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className="relative bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-sm shadow-2xl shadow-blue-500/10 border border-white/90 overflow-hidden flex flex-col max-h-[90vh] z-10 text-slate-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <Briefcase size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Chỉnh sửa vị trí</h3>
              <p className="text-xs text-slate-500">Cập nhật tên và phòng ban quản lý</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 [scrollbar-width:thin]">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 text-red-800 text-xs">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <CustomInput
            label="Tên vị trí"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <CustomSelect
            label="Phòng ban"
            required
            value={isDeptManager && userDeptId ? userDeptId : deptId}
            onChange={(val) => setDeptId(val)}
            isLocked={isDeptManager}
            disabled={isDeptManager}
            placeholder="— Chọn phòng ban —"
            options={[
              { value: "", label: "— Chọn phòng ban —" },
              ...departments.map((d) => ({
                value: d._id,
                label: d.name,
              })),
            ]}
          />
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex items-center justify-end gap-3 sticky bottom-0 z-10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-3xs cursor-pointer disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
