"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { authApi } from "../service/auth.api";

export default function CandidateRegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm_password) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.register({
        email: form.email.trim(),
        password: form.password,
        confirm_password: form.confirm_password,
      });

      setSuccessMessage(res.message || "Đăng ký tài khoản thành công! Đang chuyển hướng...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <div className="w-full bg-[#0a0f1d] rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[620px]">
        {/* Cột trái: Form Đăng ký */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Header Brand */}
            <div className="text-center mb-6">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                  TC
                </span>
                <span className="text-2xl font-bold tracking-tight text-white">
                  Talent<span className="text-blue-500">Core</span>
                </span>
              </Link>
              <p className="text-sm text-slate-400">
                Tạo tài khoản Ứng viên mới
              </p>
            </div>

            {/* Thông báo Thành công */}
            {successMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5 mb-4 animate-in fade-in">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Thông báo Lỗi */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5 mb-4 animate-in fade-in">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="candidate@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Mật khẩu */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Nhập lại Mật khẩu */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Nhập lại mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    required
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Nút Đăng ký */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-3 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Đang tạo tài khoản...</span>
                  </>
                ) : (
                  "Đăng ký tài khoản"
                )}
              </button>
            </form>

            {/* Chuyển hướng Đăng nhập */}
            <div className="mt-6 text-center text-xs text-slate-400">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-blue-400 font-semibold hover:underline ml-1"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>

          {/* Footer Policy */}
          <div className="mt-6 text-center text-[10px] text-slate-500 leading-relaxed">
            Bằng việc đăng ký, bạn đồng ý với{" "}
            <a href="#" className="underline hover:text-slate-400">
              Điều khoản
            </a>{" "}
            và{" "}
            <a href="#" className="underline hover:text-slate-400">
              Chính sách bảo mật
            </a>{" "}
            của TalentCore.
          </div>
        </div>

        {/* Cột phải: Banner */}
        <div className="hidden md:flex md:w-1/2 bg-slate-900/70 border-l border-slate-800/80 p-6 lg:p-8 items-center justify-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-52 h-52 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative w-full h-full min-h-[460px] flex items-center justify-center">
            <Image
              src="/su-nghiep.png"
              alt="TalentCore Careers"
              fill
              className="object-cover rounded-2xl border border-slate-800 shadow-xl"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}