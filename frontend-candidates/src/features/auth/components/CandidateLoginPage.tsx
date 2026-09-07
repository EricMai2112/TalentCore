"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useAuth } from "@/src/providers/AuthProvider";
import { authApi } from "../service/auth.api";

export default function CandidateLoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await authApi.login({ email, password });
      setUser(res.user);
      router.push("/jobs");
    } catch (err: any) {
      setError(err.message || "Email hoặc mật khẩu không chính xác");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      {/* Khung Auth Card rộng rãi, cân đối */}
      <div className="w-full bg-[#0a0f1d] rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[580px]">
        {/* Cột trái: Form Đăng nhập */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
          <div>
            {/* Header Brand */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                  TC
                </span>
                <span className="text-2xl font-bold tracking-tight text-white">
                  Talent<span className="text-blue-500">Core</span>
                </span>
              </Link>
              <p className="text-sm text-slate-400">
                Đăng nhập tài khoản Ứng viên
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Mật khẩu */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Nút Đăng nhập */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-2"
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            {/* Link Đăng ký */}
            <div className="mt-8 text-center text-sm text-slate-400">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="text-blue-400 font-semibold hover:underline ml-1"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>

          {/* Footer Policy */}
          <div className="mt-8 text-center text-xs text-slate-500 leading-relaxed">
            Bằng việc tiếp tục, bạn đồng ý với{" "}
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

        {/* Cột phải: Banner tràn viền phủ đầy diện tích */}
        <div className="hidden md:flex md:w-1/2 bg-slate-900/70 border-l border-slate-800/80 p-6 lg:p-8 items-center justify-center relative overflow-hidden">
          {/* Hiệu ứng đốm sáng trang trí */}
          <div className="absolute -top-12 -right-12 w-52 h-52 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative w-full h-full min-h-[440px] flex items-center justify-center">
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