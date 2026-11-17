'use client'

import { useState } from 'react'
import { X, Lock, KeyRound, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { authApi } from '@/src/features/auth/services/auth.api'
import { useToast } from '@/src/hooks/useToast'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { success, error } = useToast()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  if (!isOpen) return null

  const resetForm = () => {
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setLocalError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!oldPassword) {
      setLocalError('Vui lòng nhập mật khẩu hiện tại')
      return
    }

    if (newPassword.length < 6) {
      setLocalError('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp')
      return
    }

    if (oldPassword === newPassword) {
      setLocalError('Mật khẩu mới không được trùng với mật khẩu hiện tại')
      return
    }

    setIsSubmitting(true)
    try {
      await authApi.changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      })
      success('Đổi mật khẩu thành công')
      handleClose()
    } catch (err: any) {
      const msg = err?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.'
      setLocalError(msg)
      error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-blue-50/30 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <KeyRound size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Đổi mật khẩu</h3>
              <p className="text-xs text-slate-500 font-medium">Bảo vệ an toàn cho tài khoản của bạn</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {localError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 animate-in fade-in">
              {localError}
            </div>
          )}

          {/* Mật khẩu hiện tại */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu hiện tại <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 z-10 text-slate-400 pointer-events-none" />
              <input
                type={showOld ? 'text' : 'password'}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại..."
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3.5 z-10 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg"
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 z-10 text-slate-400 pointer-events-none" />
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự..."
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 z-10 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 z-10 text-slate-400 pointer-events-none" />
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 z-10 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Cập nhật mật khẩu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
