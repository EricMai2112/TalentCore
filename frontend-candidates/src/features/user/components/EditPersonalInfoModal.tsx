"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Check, Loader2 } from "lucide-react";
import { CandidateProfile, SocialLinkItem } from "../types/profile.types";
import { profileApi } from "../services/user.api";
import { useActiveProfile } from "../context/ActiveProfileContext";

interface EditPersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CandidateProfile | null;
  defaultName?: string;
  defaultPhone?: string;
  onSuccess: (updatedData: any) => void;
}

const PLATFORM_OPTIONS = [
  "GitHub",
  "LinkedIn",
  "Portfolio",
  "Facebook",
  "Twitter / X",
  "GitLab",
  "Website khác",
];

export default function EditPersonalInfoModal({
  isOpen,
  onClose,
  profile,
  defaultName = "",
  defaultPhone = "",
  onSuccess,
}: EditPersonalInfoModalProps) {
  const { saveProfile } = useActiveProfile();
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [summary, setSummary] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHeadline(profile?.headline || "");
      setAddress(profile?.address || "");
      setSummary(profile?.summary || "");
      setSocialLinks(profile?.socialLinks ? [...profile.socialLinks] : []);

      const existingName =
        typeof profile?.userId === "object" && profile?.userId !== null
          ? (profile.userId as any).name
          : defaultName;
      setName(existingName || "");

      const existingPhone =
        typeof profile?.userId === "object" && profile?.userId !== null
          ? (profile.userId as any).phone
          : defaultPhone;
      setPhone(existingPhone || "");
    }
  }, [profile, isOpen, defaultName, defaultPhone]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddSocialLink = () => {
    setSocialLinks((prev) => [...prev, { platform: "GitHub", url: "" }]);
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSocialChange = (
    index: number,
    field: "platform" | "url",
    value: string
  ) => {
    setSocialLinks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const cleanSocialLinks = socialLinks.filter((s) => s.url.trim() !== "");

      const payload = {
        name: name.trim(),
        headline: headline.trim(),
        phone: phone.trim(),
        address: address.trim(),
        summary: summary.trim(),
        socialLinks: cleanSocialLinks,
      };

      const response = await saveProfile(payload);

      const updatedData = (response as any)?.data || response || payload;
      
      onSuccess(updatedData);
      onClose();
    } catch (error) {
      console.error("Cập nhật thông tin cá nhân thất bại:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150 text-slate-900 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Chỉnh sửa thông tin cá nhân & Giới thiệu
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật họ tên, chức danh, số điện thoại và liên kết hồ sơ
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Họ và tên & Chức danh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Chức danh nghề nghiệp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="VD: Full-Stack Developer"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Số điện thoại & Địa chỉ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Số điện thoại liên hệ
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0987654321"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Địa chỉ / Khu vực sinh sống
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: Quận Gò Vấp, TP. Hồ Chí Minh"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Giới thiệu bản thân */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Giới thiệu bản thân
            </label>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Nêu ngắn gọn kinh nghiệm, kỹ năng thế mạnh và định hướng làm việc..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all leading-relaxed font-normal resize-none"
            />
          </div>

          {/* Liên kết mạng xã hội */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Liên kết mạng xã hội & Portfolio
              </label>
              <button
                type="button"
                onClick={handleAddSocialLink}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                <Plus size={14} /> Thêm liên kết
              </button>
            </div>

            {socialLinks.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-1">
                Chưa có liên kết nào. Bấm &quot;Thêm liên kết&quot; để bổ sung GitHub, LinkedIn, Portfolio.
              </p>
            ) : (
              <div className="space-y-2.5">
                {socialLinks.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={item.platform}
                      onChange={(e) => handleSocialChange(idx, "platform", e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white shrink-0"
                    >
                      {PLATFORM_OPTIONS.map((plat) => (
                        <option key={plat} value={plat}>
                          {plat}
                        </option>
                      ))}
                    </select>

                    <input
                      type="url"
                      value={item.url}
                      onChange={(e) => handleSocialChange(idx, "url", e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveSocialLink(idx)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Xóa link này"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
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