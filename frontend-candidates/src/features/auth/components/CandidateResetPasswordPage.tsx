'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AlertTriangle, CheckCircle2, ArrowLeft, KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react'
import { authApi } from '../service/auth.api'

function ResetPasswordFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isVerifying, setIsVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [verificationError, setVerificationError] = useState<string | null>(null)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Tự động kiểm tra tính hợp lệ của token khi tải trang
  useEffect(() => {
    if (!token) {
      setIsVerifying(false)
      setTokenValid(false)
      setVerificationError('Liên kết không chứa mã xác thực hợp lệ.')
      return
    }

    let isMounted = true

    const verifyToken = async () => {
      try {
        const res = await authApi.verifyForgotPassword({ token })
        if (isMounted) {
          setTokenValid(true)
          setUserEmail(res.email || '')
          setIsVerifying(false)
        }
      } catch (err: any) {
        if (isMounted) {
          setTokenValid(false)
          setVerificationError(err?.message || 'Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.')
          setIsVerifying(false)
        }
      }
    }

    verifyToken()

    return () => {
      isMounted = false
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) {
      setFormError('Vui lòng nhập đầy đủ mật khẩu mới và mật khẩu xác nhận.')
      return
    }

    if (password.length < 6) {
      setFormError('Mật khẩu mới phải có ít nhất 6 ký tự.')
      return
    }

    if (password !== confirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp với mật khẩu mới.')
      return
    }

    setIsLoading(true)
    setFormError(null)

    try {
      const res = await authApi.resetPassword({
        token: token || '',
        password,
        confirm_password: confirmPassword,
      })

      setSuccessMessage(res.message || 'Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setFormError(err?.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-8">
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-200/60 overflow-hidden flex flex-col md:flex-row min-h-[580px]">
        {/* Cột trái: Form Reset Password */}
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
              <h1 className="text-2xl font-bold text-slate-900">Thiết lập mật khẩu mới</h1>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Tạo mật khẩu an toàn mới cho tài khoản của bạn
              </p>
            </div>

            {isVerifying && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-sm font-medium text-slate-600">Đang kiểm tra liên kết xác thực...</p>
              </div>
            )}

            {!isVerifying && !tokenValid && (
              <div className="py-8 text-center space-y-5 animate-in fade-in">
                <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200 shadow-sm">
                  <AlertTriangle size={28} />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-base font-bold text-slate-800">Liên kết không còn hiệu lực</h2>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    {verificationError || 'Liên kết đặt lại mật khẩu đã hết hạn (sau 15 phút) hoặc đã được sử dụng trước đó.'}
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/forgot-password"
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20"
                  >
                    Gửi lại yêu cầu khôi phục mật khẩu
                  </Link>
                </div>
              </div>
            )}

            {!isVerifying && tokenValid && (
              <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in">
                {userEmail && (
                  <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl px-4 py-2.5 text-xs text-blue-800 flex items-center gap-2">
                    <KeyRound size={15} className="text-blue-600 shrink-0" />
                    <span>
                      Tài khoản: <strong>{userEmail}</strong>
                    </span>
                  </div>
                )}

                {formError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span className="font-medium">{formError}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                    <span className="font-medium leading-relaxed">{successMessage}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
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

                {/* Xác nhận mật khẩu mới */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Xác nhận mật khẩu mới</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>

                {/* Nút Submit */}
                <button
                  type="submit"
                  disabled={isLoading || !!successMessage}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 cursor-pointer mt-2"
                >
                  {isLoading ? 'Đang cập nhật mật khẩu...' : 'Cập nhật mật khẩu mới'}
                </button>
              </form>
            )}

            {/* Back to Login link */}
            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft size={14} />
                Quay lại trang Đăng nhập
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-slate-400 leading-relaxed">
            Hỗ trợ tài khoản: vui lòng liên hệ{' '}
            <a href="mailto:support@talentcore.vn" className="underline hover:text-slate-600">
              support@talentcore.vn
            </a>
          </div>
        </div>

        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-50/60 via-slate-50 to-indigo-50/40 border-l border-slate-200/80 p-6 lg:p-8 items-center justify-center relative overflow-hidden">
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

export default function CandidateResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <ResetPasswordFormContent />
    </Suspense>
  )
}
