'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, AlertTriangle, Lock, Mail } from 'lucide-react'
import logo from '@/public/logo-talentcore.png'
import login_image from '@/public/login_image.png'
import { authApi } from '../services/auth.api'
import { useAuth } from '@/src/providers/AuthProvider'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const res = await authApi.login({ email, password })
      setUser(res.user)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl flex items-center gap-10 px-6">
      {/* ── LEFT: Illustration float tự do trên nền gradient ── */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <div className="relative w-[520px] h-[520px]">
          <Image
            src={login_image}
            alt="TalentCore Illustration"
            fill
            className="object-contain"
            style={{ filter: 'drop-shadow(0 8px 32px rgba(10,101,187,0.15))' }}
            priority
          />
        </div>
      </div>

      {/* ── RIGHT: Form card — Ultra Frosted Glassmorphism ── */}
      <div
        className="w-full md:w-[450px] shrink-0 rounded-3xl p-10 flex flex-col transition-all duration-300"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0.28) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 20px 40px rgba(10, 101, 187, 0.12)'
        }}
      >
        {/* Logo + greeting */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-3">
            <Image src={logo} alt="TalentCore" width={180} className="h-auto" />
          </div>
          <p className="text-sm text-gray-500 italic">
            Chào mừng bạn đến với hệ thống quản trị tuyển dụng
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl text-sm">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Email</label>
            <div className="relative flex items-center">
              <Mail size={15} className="absolute left-3.5 text-gray-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0a65bb'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10,101,187,0.10)'
                  e.currentTarget.style.backgroundColor = '#ffffff'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3.5 text-gray-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full pl-10 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0a65bb'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10,101,187,0.10)'
                  e.currentTarget.style.backgroundColor = '#ffffff'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer relative overflow-hidden group mt-1"
            style={{
              background: isLoading
                ? '#5b9bd5'
                : 'linear-gradient(135deg, #0a65bb 0%, #1d88e5 100%)',
              boxShadow: '0 4px 14px rgba(10,101,187,0.35)'
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Đăng nhập
                </>
              )}
            </span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  'linear-gradient(135deg, transparent 0%, rgba(242,115,23,0.15) 50%, transparent 100%)'
              }}
            />
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} TalentCore — Hệ thống Quản trị Tuyển dụng
        </p>
      </div>
    </div>
  )
}
