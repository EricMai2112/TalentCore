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
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow">
      {/* Card Header — clickable để expand */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
        onClick={() => setIsExpanded((p) => !p)}
      >
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
          <Building2 size={18} className="text-indigo-500" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-snug">
            {department.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {managerName ? (
              <>Trưởng phòng: {managerName}</>
            ) : (
              <span className="italic">Chưa có trưởng phòng</span>
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
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-50 px-5 py-4 bg-gray-50/40 space-y-4">
          {/* Detail grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2.5 bg-white rounded-xl px-3.5 py-2.5 border border-gray-100">
              <User size={14} className="text-indigo-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Mã phòng ban
                </p>
                <p className="text-sm font-bold text-gray-800 font-mono">
                  {department.code}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white rounded-xl px-3.5 py-2.5 border border-gray-100">
              <Users size={14} className="text-indigo-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Thành viên
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {memberCount} người
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white rounded-xl px-3.5 py-2.5 border border-gray-100">
              <Briefcase size={14} className="text-indigo-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Trưởng phòng
                </p>
                <p className="text-sm font-bold text-gray-800 truncate">
                  {managerName ?? (
                    <span className="text-gray-400 font-normal italic text-xs">
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
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-100 rounded-xl transition-all cursor-pointer"
            >
              <Pencil size={14} />
              Chỉnh sửa
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 border border-red-100 rounded-xl transition-all cursor-pointer"
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
