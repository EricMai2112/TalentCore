'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { authApi } from '../service/auth.api'

export default function CandidateRegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirm_password: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!agreedTerms) {
      setError('Vui lòng đọc và đồng ý với Điều khoản sử dụng và Chính sách bảo mật')
      return
    }

    if (form.password !== form.confirm_password) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setIsLoading(true)

    try {
      const res = await authApi.register({
        email: form.email.trim(),
        password: form.password,
        confirm_password: form.confirm_password
      })

      setSuccessMessage(res.message || 'Đăng ký tài khoản thành công! Đang chuyển hướng...')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-8">
      {/* Khung Auth Card rộng rãi, phong cách hiện đại nền sáng */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-200/60 overflow-hidden flex flex-col md:flex-row min-h-[620px]">
        {/* Cột trái: Form Đăng ký */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Header Brand */}
            <div className="text-center mb-6">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                  TC
                </span>
                <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  Talent<span className="text-blue-600">Core</span>
                </span>
              </Link>
              <p className="text-sm font-medium text-slate-500">Tạo tài khoản Ứng viên mới</p>
            </div>

            {/* Thông báo Thành công */}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-xl text-xs flex items-center gap-2.5 mb-4 animate-in fade-in">
                <CheckCircle2 size={16} className="shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            {/* Thông báo Lỗi */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3.5 rounded-xl text-xs flex items-center gap-2.5 mb-4 animate-in fade-in">
                <AlertTriangle size={16} className="shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="candidate@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
              </div>

              {/* Mật khẩu */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all pr-11 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Nhập lại Mật khẩu */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Nhập lại mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirm_password"
                    required
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all pr-11 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Checkbox Điều khoản sử dụng & Chính sách bảo mật */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="agreedTerms"
                  checked={agreedTerms}
                  onChange={(e) => {
                    setAgreedTerms(e.target.checked)
                    if (error) setError(null)
                  }}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="agreedTerms" className="text-xs text-slate-600 leading-snug cursor-pointer select-none">
                  Tôi đã đọc và đồng ý với{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="font-bold text-blue-600 hover:text-blue-800 underline transition-colors"
                  >
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="font-bold text-blue-600 hover:text-blue-800 underline transition-colors"
                  >
                    Chính sách bảo mật
                  </Link>{' '}
                  của TalentCore.
                </label>
              </div>

              {/* Nút Đăng ký */}
              <button
                type="submit"
                disabled={isLoading || !agreedTerms}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-3 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Đang tạo tài khoản...</span>
                  </>
                ) : (
                  'Đăng ký tài khoản'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold">hoặc</span>
              </div>
            </div>

            {/* Nút Đăng ký với Google */}
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/google?state=candidates`}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow hover:border-slate-300 cursor-pointer"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
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
              <span>Đăng ký với Google</span>
            </a>

            {/* Chuyển hướng Đăng nhập */}
            <div className="mt-6 text-center text-xs text-slate-500">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-blue-600 font-bold hover:underline ml-1">
                Đăng nhập ngay
              </Link>
            </div>
          </div>

          {/* Footer Policy */}
          <div className="mt-6 text-center text-[10px] text-slate-400 leading-relaxed">
            Bằng việc đăng ký, bạn đồng ý với{' '}
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
          <div className="absolute -top-12 -right-12 w-52 h-52 bg-blue-200/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative w-full h-full min-h-[460px] flex items-center justify-center">
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
