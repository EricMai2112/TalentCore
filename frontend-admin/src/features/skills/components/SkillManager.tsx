"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Zap } from "lucide-react";
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
import { useAuth } from "@/src/providers/AuthProvider";
import { UserRole, Department } from "@/src/features/users/types/user.types";
import { CustomButton, Toast, useToast } from "@/src/components/common";

interface SkillManagerProps {
  initialPositions: PositionWithSkills[];
  initialSkills: Skill[];
  initialDepartments: DeptOption[];
}

type ModalMode = "add-skill" | "add-position";

const getDeptIdStr = (dept: string | Department | DeptOption | { _id: string } | undefined): string => {
  if (!dept) return "";
  if (typeof dept === "string") return dept;
  if (typeof dept === "object" && "_id" in dept && typeof dept._id === "string") return dept._id;
  return "";
};

export default function SkillManager({
  initialPositions,
  initialSkills,
  initialDepartments,
}: SkillManagerProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const isDeptManager = currentUser?.role === UserRole.DEPARTMENT_MANAGER;
  const userDeptId = getDeptIdStr(currentUser?.departmentId);

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
  const { toast, showToast, hideToast } = useToast();

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
    setPreselectedDeptId(deptId || (isDeptManager ? userDeptId : undefined));
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
      const finalDeptId = isDeptManager ? userDeptId : departmentId;
      await positionApi.create({ name, departmentId: finalDeptId });
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
      const finalDeptId = isDeptManager ? userDeptId : departmentId;
      await positionApi.update(id, { name, departmentId: finalDeptId });
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
  const scopedPositions = positions.filter((p) => {
    if (isDeptManager && userDeptId) {
      const pDeptId = getDeptIdStr(p.departmentId);
      if (pDeptId !== userDeptId) return false;
    }
    return true;
  });

  const groups = buildDepartmentGroups(scopedPositions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/60 shadow-2xs shrink-0">
              <Zap size={20} />
            </span>
            Danh mục kỹ năng
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isDeptManager
              ? "Quản lý kỹ năng và vị trí thuộc phòng ban của bạn"
              : "Quản lý kỹ năng theo phòng ban và vị trí chuyên môn"}
          </p>
        </div>
        <CustomButton
          onClick={() => openAddModal("add-skill")}
          variant="primary"
          icon={<Plus size={16} />}
          className="self-start sm:self-auto shrink-0"
        >
          Thêm kỹ năng
        </CustomButton>
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white/50 border border-white/70 rounded-3xl backdrop-blur-md shadow-xl shadow-blue-500/5">
          <div className="p-4 rounded-2xl bg-slate-100/80 text-slate-400 mb-4 shadow-2xs">
            <Zap size={36} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Chưa có dữ liệu kỹ năng</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Hãy tạo vị trí trong phòng ban, sau đó gắn kỹ năng vào từng vị trí.
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <CustomButton
              onClick={() => openAddModal("add-skill")}
              variant="primary"
              icon={<Plus size={15} />}
            >
              Thêm kỹ năng
            </CustomButton>
            <CustomButton
              onClick={() => openAddModal("add-position")}
              variant="secondary"
              icon={<Plus size={15} />}
            >
              Thêm vị trí
            </CustomButton>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {groups.map((group) => (
            <DepartmentGroup
              key={group.deptId}
              group={group}
              allSkills={allSkills}
              onAddSkill={handleAddSkill}
              onRemoveSkill={handleRemoveSkill}
              onEditPosition={handleOpenEdit}
              onDeletePosition={handleOpenDelete}
              onAddPosition={(deptId) => openAddModal("add-position", deptId)}
              defaultOpen={isDeptManager}
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
        positions={scopedPositions}
        allSkills={allSkills}
        preselectedDeptId={preselectedDeptId || (isDeptManager ? userDeptId : undefined)}
        isSubmitting={isSubmitting}
        isDeptManager={isDeptManager}
        userDeptId={userDeptId}
      />

      {/* Edit position modal */}
      <EditPositionModal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingPosition(null); }}
        onSubmit={handleEditSubmit}
        position={editingPosition}
        departments={departments}
        isSubmitting={isSubmitting}
        isDeptManager={isDeptManager}
        userDeptId={userDeptId}
      />

      {/* Delete position modal */}
      <DeletePositionModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingPosition(null); }}
        onConfirm={handleDeleteConfirm}
        positionName={deletingPosition?.name ?? ""}
        isDeleting={isDeleting}
      />

      {/* Standard Toast Notification */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
