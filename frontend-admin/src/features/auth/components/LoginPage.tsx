// src/features/auth/components/LoginPage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import logo from "@/public/logo-talentcore.png";
import login_image from "@/public/login_image.png";
import { authApi } from "../services/auth.api";
import { useAuth } from "@/src/providers/AuthProvider";

export default function LoginPage() {
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
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-[#13131a] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto">
      {/* Cột trái: Form Login */}
      <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-between">
        <div>
          <div className="text-center mb-8">
            <div className="w-70 mx-auto mb-2">
              <Image src={logo} alt="logo_login" className="w-full h-auto object-contain" />
            </div>
            <p className="text-xs text-gray-400">Login to your TalenCore account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full px-4 py-2.5 bg-[#1a1a24] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1a1a24] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg disabled:opacity-50 cursor-pointer mt-2"
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2 text-xs">
            <p className="text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-gray-200 underline hover:text-white">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Cột phải Banner */}
      <div className="hidden md:flex md:w-1/2 bg-white p-8 items-center justify-center relative overflow-hidden">
        <div className="relative w-full h-full min-h-[400px]">
          <Image src={login_image} alt="TalenCore Auth Banner" fill className="object-contain p-4" priority />
        </div>
      </div>
    </div>
  );
}