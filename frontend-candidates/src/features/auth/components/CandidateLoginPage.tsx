'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/src/providers/AuthProvider'
import { authApi } from '../service/auth.api'

export default function CandidateLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await authApi.login({ email, password })
      setUser(res.user)
      router.push('/jobs')
    } catch (err: any) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-8">
      {/* Khung Auth Card rộng rãi, phong cách hiện đại nền sáng */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-200/60 overflow-hidden flex flex-col md:flex-row min-h-[580px]">
        {/* Cột trái: Form Đăng nhập */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-white">
          <div>
            {/* Header Brand */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                  TC
                </span>
                <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  Talent<span className="text-blue-600">Core</span>
                </span>
              </Link>
              <p className="text-sm font-medium text-slate-500">Đăng nhập tài khoản Ứng viên</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
              </div>

              {/* Mật khẩu */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Mật khẩu</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all pr-11 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Nút Đăng nhập */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 cursor-pointer mt-2"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold">hoặc</span>
              </div>
            </div>

            {/* Nút Tiếp tục với Google */}
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/google?state=candidates`}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-700 flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow hover:border-slate-300 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Tiếp tục với Google</span>
            </a>

            {/* Link Đăng ký */}
            <div className="mt-8 text-center text-sm text-slate-500">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-blue-600 font-bold hover:underline ml-1">
                Đăng ký ngay
              </Link>
            </div>
          </div>

          {/* Footer Policy */}
          <div className="mt-8 text-center text-xs text-slate-400 leading-relaxed">
            Bằng việc tiếp tục, bạn đồng ý với{' '}
            <a href="#" className="underline hover:text-slate-600">
              Điều khoản
            </a>{' '}
            và{' '}
            <a href="#" className="underline hover:text-slate-600">
              Chính sách bảo mật
            </a>{' '}
            của TalentCore.
          </div>
        </div>

        {/* Cột phải: Banner đồng bộ tông màu sáng */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-50/60 via-slate-50 to-indigo-50/40 border-l border-slate-200/80 p-6 lg:p-8 items-center justify-center relative overflow-hidden">
          {/* Hiệu ứng đốm sáng trang trí */}
          <div className="absolute -top-12 -right-12 w-52 h-52 bg-blue-200/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative w-full h-full min-h-[440px] flex items-center justify-center">
            <Image
              src="/login-page.png"
              alt="TalentCore Careers"
              fill
              className="object-cover rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/60"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
