'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, AlertTriangle, Lock, Mail, ArrowRight } from 'lucide-react'
import { authApi } from '../services/auth.api'
import { useAuth } from '@/src/providers/AuthProvider'
import { GlassInput } from '@/src/components/common/glass'
import { loginSchema, LoginFormData } from '../schemas/login.schema'

export default function LoginForm() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    try {
      const res = await authApi.login({
        email: data.email,
        password: data.password,
      })
      setUser(res.user)
      router.push('/dashboard')
    } catch (err: any) {
      setServerError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!')
    }
  }

  return (
    <>
      {/* Glass Error Alert for Server Authentication Failure */}
      {serverError && (
        <div className="mb-5 flex items-start gap-2.5 bg-rose-500/15 backdrop-blur-md border border-rose-500/30 text-rose-700 p-3.5 rounded-2xl text-xs font-bold animate-in fade-in duration-200">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email Input using React Hook Form + Zod */}
        <GlassInput
          label="Email"
          type="email"
          required
          placeholder="admin@gmail.com"
          icon={<Mail size={18} className="text-[#3B82F6]" />}
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Password Input using React Hook Form + Zod */}
        <GlassInput
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          required
          placeholder="••••••••"
          icon={<Lock size={18} className="text-[#3B82F6]" />}
          error={errors.password?.message}
          {...register('password')}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#3B82F6] hover:text-[#1D4ED8] transition-colors cursor-pointer p-1 rounded-lg hover:bg-[#3B82F6]/10"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1 pb-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded-md text-[#3B82F6] focus:ring-[#3B82F6] border-slate-300 accent-[#3B82F6] cursor-pointer"
              {...register('rememberMe')}
            />
            <span className="text-xs font-semibold text-[#334155]">Ghi nhớ đăng nhập</span>
          </label>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              alert('Vui lòng liên hệ Admin để khôi phục mật khẩu tài khoản!')
            }}
            className="text-xs font-bold text-[#3B82F6] hover:text-[#1D4ED8] hover:underline"
          >
            Quên mật khẩu?
          </a>
        </div>

        {/* Submit Button with Loading State */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4] hover:opacity-95 hover:shadow-lg hover:shadow-purple-500/25 text-white text-sm font-bold rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none cursor-pointer flex items-center justify-center gap-2 group border border-white/30 mt-3"
        >
          {isSubmitting ? (
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
              <span>Đang xác thực...</span>
            </>
          ) : (
            <>
              <span>Đăng nhập hệ thống</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform duration-200"
              />
            </>
          )}
        </button>
      </form>
    </>
  )
}
