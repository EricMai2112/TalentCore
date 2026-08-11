"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Zap, Check, AlertTriangle } from "lucide-react";
import {
  Skill,
  PositionWithSkills,
  DeptOption,
  CreateSkillDto,
  buildDepartmentGroups,
} from "../types/skill.types";
import { skillApi, positionApi } from "../services/skill.api";
import DepartmentGroup from "./DepartmentGroup";
import AddSkillModal from "./AddSkillModal";
import EditPositionModal from "./EditPositionModal";
import DeletePositionModal from "./DeletePositionModal";

interface SkillManagerProps {
  initialPositions: PositionWithSkills[];
  initialSkills: Skill[];
  initialDepartments: DeptOption[];
}

type ModalMode = "add-skill" | "add-position";

export default function SkillManager({
  initialPositions,
  initialSkills,
  initialDepartments,
}: SkillManagerProps) {
  const router = useRouter();
  const [positions, setPositions] = useState<PositionWithSkills[]>(initialPositions);
  const [allSkills, setAllSkills] = useState<Skill[]>(initialSkills);
  const [departments] = useState<DeptOption[]>(initialDepartments);

  useEffect(() => { setPositions(initialPositions); }, [initialPositions]);
  useEffect(() => { setAllSkills(initialSkills); }, [initialSkills]);

  // Add modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalMode, setAddModalMode] = useState<ModalMode>("add-skill");
  const [preselectedDeptId, setPreselectedDeptId] = useState<string | undefined>();

  // Edit position modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionWithSkills | null>(null);

  // Delete position modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingPosition, setDeletingPosition] = useState<PositionWithSkills | null>(null);

  // Loading & toast
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (message: string, type: "success" | "error") => setToast({ message, type });

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchPositions = async () => {
    try { setPositions(await positionApi.getWithSkills()); } catch { /* silent */ }
  };
  const fetchSkills = async () => {
    try { setAllSkills(await skillApi.getAll()); } catch { /* silent */ }
  };

  // ── Add modal ──────────────────────────────────────────────────────────
  const openAddModal = (mode: ModalMode, deptId?: string) => {
    setAddModalMode(mode);
    setPreselectedDeptId(deptId);
    setAddModalOpen(true);
  };

  const handleCreateSkill = async (data: CreateSkillDto) => {
    setIsSubmitting(true);
    try {
      await skillApi.create(data);
      showToast("Tạo kỹ năng thành công!", "success");
      setAddModalOpen(false);
      await fetchSkills();
      router.refresh();
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePosition = async (name: string, departmentId: string) => {
    setIsSubmitting(true);
    try {
      await positionApi.create({ name, departmentId });
      showToast("Tạo vị trí thành công!", "success");
      setAddModalOpen(false);
      await fetchPositions();
      router.refresh();
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Skill on position ──────────────────────────────────────────────────
  const handleAddSkill = async (positionId: string, skillId: string) => {
    try {
      await positionApi.addSkill(positionId, skillId);
      setPositions((prev) =>
        prev.map((p) => {
          if (p._id !== positionId) return p;
          const skill = allSkills.find((s) => s._id === skillId);
          if (!skill || p.skillIds.find((s) => s._id === skillId)) return p;
          return { ...p, skillIds: [...p.skillIds, skill] };
        }),
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Không thể thêm kỹ năng", "error");
      await fetchPositions();
    }
  };

  const handleRemoveSkill = async (positionId: string, skillId: string) => {
    setPositions((prev) =>
      prev.map((p) =>
        p._id === positionId
          ? { ...p, skillIds: p.skillIds.filter((s) => s._id !== skillId) }
          : p,
      ),
    );
    try {
      await positionApi.removeSkill(positionId, skillId);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Không thể xóa kỹ năng", "error");
      await fetchPositions();
    }
  };

  // ── Edit position ──────────────────────────────────────────────────────
  const handleOpenEdit = (position: PositionWithSkills) => {
    setEditingPosition(position);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (id: string, name: string, departmentId: string) => {
    setIsSubmitting(true);
    try {
      await positionApi.update(id, { name, departmentId });
      showToast("Cập nhật vị trí thành công!", "success");
      setEditModalOpen(false);
      setEditingPosition(null);
      await fetchPositions();
      router.refresh();
    } catch (err: unknown) {
      throw new Error(err instanceof Error ? err.message : "Không thể cập nhật vị trí");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete position ────────────────────────────────────────────────────
  const handleOpenDelete = (position: PositionWithSkills) => {
    setDeletingPosition(position);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPosition) return;
    setIsDeleting(true);
    try {
      await positionApi.remove(deletingPosition._id);
      showToast("Xóa vị trí thành công!", "success");
      setDeleteModalOpen(false);
      setDeletingPosition(null);
      setPositions((prev) => prev.filter((p) => p._id !== deletingPosition._id));
      router.refresh();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Không thể xóa vị trí", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── View ───────────────────────────────────────────────────────────────
  const groups = buildDepartmentGroups(positions);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 animate-in slide-in-from-top-5 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : "bg-red-50 border-red-100 text-red-800"
          }`}
        >
          {toast.type === "success" ? <Check size={16} /> : <AlertTriangle size={16} />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="text-indigo-600 shrink-0" size={22} />
            Danh mục kỹ năng
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý kỹ năng theo phòng ban và vị trí
          </p>
        </div>
        <button
          onClick={() => openAddModal("add-skill")}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-indigo-100 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={16} />
          Thêm kỹ năng
        </button>
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-xs">
          <Zap className="mx-auto text-gray-300 mb-3" size={40} />
          <h3 className="text-base font-semibold text-gray-800">Chưa có dữ liệu kỹ năng</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            Hãy tạo vị trí trong phòng ban, sau đó gắn kỹ năng vào từng vị trí.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => openAddModal("add-skill")}
              className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-sm rounded-xl transition-colors border border-indigo-100 cursor-pointer"
            >
              <Plus size={15} /> Thêm kỹ năng
            </button>
            <button
              onClick={() => openAddModal("add-position")}
              className="inline-flex items-center gap-1 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold text-sm rounded-xl transition-colors border border-gray-200 cursor-pointer"
            >
              <Plus size={15} /> Thêm vị trí
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group, idx) => (
            <DepartmentGroup
              key={group.deptId}
              group={group}
              allSkills={allSkills}
              onAddSkill={handleAddSkill}
              onRemoveSkill={handleRemoveSkill}
              onEditPosition={handleOpenEdit}
              onDeletePosition={handleOpenDelete}
              onAddPosition={(deptId) => openAddModal("add-position", deptId)}
              defaultOpen={false}
            />
          ))}
        </div>
      )}

      {/* Add skill / position modal */}
      <AddSkillModal
        isOpen={addModalOpen}
        mode={addModalMode}
        onClose={() => setAddModalOpen(false)}
        onCreateSkill={handleCreateSkill}
        onCreatePosition={handleCreatePosition}
        onAddSkillToPosition={handleAddSkill}
        departments={departments}
        positions={positions}
        allSkills={allSkills}
        preselectedDeptId={preselectedDeptId}
        isSubmitting={isSubmitting}
      />

      {/* Edit position modal */}
      <EditPositionModal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingPosition(null); }}
        onSubmit={handleEditSubmit}
        position={editingPosition}
        departments={departments}
        isSubmitting={isSubmitting}
      />

      {/* Delete position modal */}
      <DeletePositionModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingPosition(null); }}
        onConfirm={handleDeleteConfirm}
        positionName={deletingPosition?.name ?? ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
