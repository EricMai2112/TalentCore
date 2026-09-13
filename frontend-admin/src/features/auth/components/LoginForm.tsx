'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertTriangle, Lock, Mail } from 'lucide-react'
import { authApi } from '../services/auth.api'
import { useAuth } from '@/src/providers/AuthProvider'

export default function LoginForm() {
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
    <>
      {/* Error */}
      {error && (
        <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl text-sm animate-in fade-in duration-200">
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
          className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-md shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none cursor-pointer flex items-center justify-center gap-2 group mt-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
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
              <span>Đang đăng nhập...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:translate-x-0.5 transition-transform duration-200"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Đăng nhập</span>
            </>
          )}
        </button>
      </form>
    </>
  )
}
