"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Star,
  Pencil,
  Trash2,
  Copy,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuth } from "@/src/providers/AuthProvider";
import { CandidateProfile } from "../types/profile.types";
import { profileApi } from "../services/user.api";
import { toast } from "react-toastify";

export default function ProfilesManager() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [profiles, setProfiles] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [cloneFromId, setCloneFromId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) { router.replace("/login"); return; }
    loadProfiles();
  }, [user, isAuthLoading]);

  const loadProfiles = async () => {
    try {
      const data = await profileApi.listProfiles();
      setProfiles(data);
    } catch (err) {
      toast.error("Không thể tải danh sách hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    setIsCreating(true);
    try {
      const created = await profileApi.createProfile(
        newProfileName.trim(),
        cloneFromId || undefined,
      );
      setProfiles((prev) => [...prev, created]);
      setIsCreateOpen(false);
      setNewProfileName("");
      setCloneFromId("");
      toast.success("Tạo hồ sơ mới thành công!");
      router.push(`/user/profile/${created._id}`);
    } catch (err: any) {
      toast.error(err?.message || "Tạo hồ sơ thất bại");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSetDefault = async (profileId: string) => {
    setSettingDefaultId(profileId);
    try {
      await profileApi.setDefault(profileId);
      setProfiles((prev) =>
        prev.map((p) => ({ ...p, isDefault: p._id === profileId }))
      );
      toast.success("Đã đặt hồ sơ mặc định");
    } catch (err: any) {
      toast.error(err?.message || "Thao tác thất bại");
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleDelete = async (profileId: string) => {
    if (profiles.length <= 1) {
      toast.error("Bạn phải giữ ít nhất một hồ sơ");
      return;
    }
    setIsDeleting(true);
    try {
      await profileApi.deleteProfile(profileId);
      setProfiles((prev) => prev.filter((p) => p._id !== profileId));
      toast.success("Đã xóa hồ sơ");
      setDeletingId(null);
    } catch (err: any) {
      toast.error(err?.message || "Xóa hồ sơ thất bại");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Hồ sơ của tôi</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tạo nhiều hồ sơ cho từng vị trí ứng tuyển khác nhau (Fullstack, Frontend, Backend...)
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          disabled={profiles.length >= 10}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <Plus size={16} />
          <span>Tạo hồ sơ mới</span>
        </button>
      </div>

      {/* Profile Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {profiles.map((profile) => {
          const skillCount = profile.skills?.length ?? 0;
          const expCount = profile.experiences?.length ?? 0;
          const projCount = profile.projects?.length ?? 0;
          const userName =
            typeof profile.userId === "object" ? profile.userId?.name : "";

          return (
            <div
              key={profile._id}
              className={`relative bg-white rounded-2xl border shadow-xs p-5 flex flex-col gap-4 transition-all hover:shadow-md ${
                profile.isDefault
                  ? "border-blue-300 ring-1 ring-blue-200"
                  : "border-slate-200"
              }`}
            >
              {/* Default badge */}
              {profile.isDefault && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
                    <Star size={10} className="fill-blue-500 text-blue-500" />
                    Mặc định
                  </span>
                </div>
              )}

              {/* Profile icon + name */}
              <div className="flex items-start gap-3 pr-16">
                <div className="p-2.5 bg-blue-50 rounded-xl shrink-0">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900 truncate">
                    {profile.profileName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {profile.headline || "Chưa có chức danh"}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  {skillCount} kỹ năng
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  {expCount} kinh nghiệm
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  {projCount} dự án
                </span>
              </div>

              {/* Action row */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                {/* Edit */}
                <Link
                  href={`/user/profile/${profile._id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors"
                >
                  <Pencil size={13} />
                  Chỉnh sửa
                </Link>

                {/* Set Default */}
                {!profile.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(profile._id)}
                    disabled={settingDefaultId === profile._id}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {settingDefaultId === profile._id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Star size={13} />
                    )}
                    Đặt mặc định
                  </button>
                )}

                {/* Delete */}
                {profiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setDeletingId(profile._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Xóa hồ sơ"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Profile Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setIsCreateOpen(false)} />
          <div
            className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tạo hồ sơ mới</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đặt tên theo vị trí bạn muốn ứng tuyển
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tên hồ sơ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="VD: Hồ sơ Frontend, Hồ sơ Fullstack..."
                  maxLength={80}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {profiles.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Sao chép từ hồ sơ có sẵn{" "}
                    <span className="text-slate-400 font-normal">(tùy chọn)</span>
                  </label>
                  <select
                    value={cloneFromId}
                    onChange={(e) => setCloneFromId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="">— Tạo hồ sơ trống —</option>
                    {profiles.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.profileName}{p.isDefault ? " (Mặc định)" : ""}
                      </option>
                    ))}
                  </select>
                  {cloneFromId && (
                    <p className="text-xs text-blue-600 flex items-center gap-1 font-medium">
                      <Copy size={11} />
                      Nội dung sẽ được sao chép — bạn có thể chỉnh sửa sau
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isCreating}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newProfileName.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-all"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Tạo hồ sơ</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setDeletingId(null)} />
          <div
            className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={26} className="text-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Xóa hồ sơ này?</h3>
              <p className="text-sm text-slate-500 mt-1">
                Hành động này không thể hoàn tác. Các đơn ứng tuyển đã nộp bằng hồ sơ này vẫn được giữ nguyên.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs active:scale-95 disabled:opacity-50 cursor-pointer transition-all"
              >
                {isDeleting ? (
                  <><Loader2 size={14} className="animate-spin" /><span>Đang xóa...</span></>
                ) : (
                  <><Trash2 size={14} /><span>Xóa hồ sơ</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
