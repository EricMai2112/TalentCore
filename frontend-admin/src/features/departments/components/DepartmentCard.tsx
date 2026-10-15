"use client";

import { useState } from "react";
import { Building2, ChevronDown, Pencil, Trash2, User, Briefcase, Users } from "lucide-react";
import { Department, getManagerName } from "../types/department.types";

interface DepartmentCardProps {
  department: Department;
  memberCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

export default function DepartmentCard({
  department,
  memberCount,
  onEdit,
  onDelete,
}: DepartmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const managerName = getManagerName(department.managerId);

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:bg-white/85 transition-all">
      {/* Card Header — clickable để expand */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
        onClick={() => setIsExpanded((p) => !p)}
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100/60 flex items-center justify-center shrink-0 shadow-2xs">
          <Building2 size={18} className="text-blue-600" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-sm leading-snug">
            {department.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {managerName ? (
              <>Trưởng phòng: {managerName}</>
            ) : (
              <span className="italic text-slate-400">Chưa có trưởng phòng</span>
            )}
            {" · "}
            <span>0 jobs</span>
            {" · "}
            <span>{memberCount} interviewers</span>
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-100/80 px-5 py-4 bg-slate-50/50 backdrop-blur-xs space-y-4">
          {/* Detail grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2.5 bg-white/70 backdrop-blur-xs rounded-2xl px-4 py-3 border border-white/80 shadow-2xs">
              <User size={15} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mã phòng ban
                </p>
                <p className="text-sm font-bold text-slate-800 font-mono">
                  {department.code}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/70 backdrop-blur-xs rounded-2xl px-4 py-3 border border-white/80 shadow-2xs">
              <Users size={15} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Thành viên
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {memberCount} người
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/70 backdrop-blur-xs rounded-2xl px-4 py-3 border border-white/80 shadow-2xs">
              <Briefcase size={15} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Trưởng phòng
                </p>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {managerName ?? (
                    <span className="text-slate-400 font-normal italic text-xs">
                      Chưa phân công
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 border border-blue-200/60 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Pencil size={14} />
              Chỉnh sửa
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-rose-200/60 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Trash2 size={14} />
              Xóa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
