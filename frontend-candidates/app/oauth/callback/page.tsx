'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/src/providers/AuthProvider'
import { authApi } from '@/src/features/auth/service/auth.api'
import { Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

function OAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleAuth = async () => {
      const error = searchParams.get('error')
      if (error) {
        setErrorMessage(error)
        setTimeout(() => {
          router.push(`/login?error=${encodeURIComponent(error)}`)
        }, 2000)
        return
      }

      const accessToken = searchParams.get('access_token')
      if (accessToken) {
        try {
          localStorage.setItem('access_token', accessToken)
          // Lấy thông tin user hiện tại qua token/cookie
          const user = await authApi.getMe()
          setUser(user)
          router.push('/jobs')
        } catch (err: any) {
          console.error('Lỗi khi lấy thông tin tài khoản Google:', err)
          setErrorMessage(err.message || 'Không thể xác thực thông tin tài khoản Google')
          setTimeout(() => {
            router.push('/login')
          }, 2500)
        }
      } else {
        setErrorMessage('Không nhận được token xác thực từ Google')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    }

    handleAuth()
  }, [searchParams, router, setUser])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-blue-500/25 mb-6 animate-pulse">
        TC
      </div>

      {errorMessage ? (
        <div className="max-w-md bg-rose-50 border border-rose-200 text-rose-700 p-5 rounded-2xl flex flex-col items-center gap-3">
          <AlertCircle size={32} className="text-rose-600 shrink-0" />
          <p className="text-sm font-semibold">{errorMessage}</p>
          <p className="text-xs text-rose-500">Đang quay lại trang đăng nhập...</p>
          <Link
            href="/login"
            className="mt-2 text-xs font-bold text-blue-600 hover:underline"
          >
            Quay lại đăng nhập ngay
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="text-blue-600 animate-spin" />
          <h2 className="text-lg font-bold text-slate-800">
            Đang xác thực tài khoản Google...
          </h2>
          <p className="text-xs text-slate-500">
            Vui lòng chờ giây lát trong khi chúng tôi chuẩn bị không gian làm việc của bạn.
          </p>
        </div>
      )}
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 size={32} className="text-blue-600 animate-spin" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  )
}
