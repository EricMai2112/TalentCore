'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AlertTriangle, CheckCircle2, ArrowLeft, Mail, Send } from 'lucide-react'
import { authApi } from '../service/auth.api'

export default function CandidateForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [sentEmail, setSentEmail] = useState<string>('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Vui lòng nhập địa chỉ email của bạn.')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await authApi.forgotPassword({ email: email.trim() })
      setSentEmail(email.trim())
      setSuccessMessage(
        res.message ||
          'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư để tiến hành đổi mật khẩu.'
      )
      setCooldown(60)
    } catch (err: any) {
      setError(err?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-8">
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-200/60 overflow-hidden flex flex-col md:flex-row min-h-[580px]">
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-white">
          <div>
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                  TC
                </span>
                <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  Talent<span className="text-blue-600">Core</span>
                </span>
              </Link>
              <h1 className="text-2xl font-bold text-slate-900">Quên mật khẩu?</h1>
              <p className="text-xs font-medium text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Nhập địa chỉ email tài khoản ứng viên của bạn để nhận liên kết xác thực đặt lại mật khẩu mới
              </p>
            </div>

            {error && (
              <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-600 p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertTriangle size={16} className="shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-emerald-700">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                  <span>Đã gửi email khôi phục thành công!</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Chúng tôi đã gửi một email xác thực đến <strong>{sentEmail}</strong>.
                </p>
              </div>
            )}

            <form onSubmit={handleSendRequest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Email tài khoản</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || cooldown > 0}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  'Đang gửi email...'
                ) : cooldown > 0 ? (
                  `Gửi lại sau (${cooldown}s)`
                ) : (
                  <>
                    <Send size={16} />
                    Gửi liên kết đặt lại mật khẩu
                  </>
                )}
              </button>
            </form>

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
