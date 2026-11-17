'use client'

import { useState } from 'react'
import { X, User, Phone, Mail, Building2, ShieldCheck, Loader2, Save } from 'lucide-react'
import { useAuth } from '@/src/providers/AuthProvider'
import { authApi } from '@/src/features/auth/services/auth.api'
import { useToast } from '@/src/hooks/useToast'
import { USER_ROLE_LABEL } from '@/src/features/users/types/user.types'
import { CustomAvatar } from '@/src/components/common'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, setUser } = useAuth()
  const { success, error } = useToast()

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !user) return null

  const roleName = user?.role ? USER_ROLE_LABEL[user.role] : 'Người dùng'
  const deptName =
    typeof user?.departmentId === 'object' && user?.departmentId
      ? user.departmentId.name
      : 'Chưa phân bổ'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      error('Họ và tên không được để trống')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await authApi.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      })
      if (res?.user) {
        setUser(res.user)
      }
      success('Cập nhật thông tin cá nhân thành công')
      onClose()
    } catch (err: any) {
      error(err?.message || 'Có lỗi xảy ra khi cập nhật thông tin')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Hồ sơ cá nhân</h3>
              <p className="text-xs text-slate-500 font-medium">Xem và chỉnh sửa thông tin tài khoản</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Top User Overview Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
            <CustomAvatar
              name={user.name}
              src={user.avatar}
              size="xl"
              rounded="rounded-2xl"
              className="ring-2 ring-blue-500/20"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-extrabold text-slate-900 truncate leading-tight">
                {user.name}
              </h4>
              <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                  <ShieldCheck size={12} />
                  <span>{roleName}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                  <Building2 size={12} />
                  <span>{deptName}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <User size={16} className="absolute left-3.5 z-10 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  style={{ paddingLeft: '2.75rem' }}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email đăng nhập <span className="text-slate-400 font-normal">(Cố định)</span>
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 z-10 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  style={{ paddingLeft: '2.75rem' }}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100/70 text-sm text-slate-500 font-medium cursor-not-allowed select-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số điện thoại liên hệ
              </label>
              <div className="relative flex items-center">
                <Phone size={16} className="absolute left-3.5 z-10 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0912345678"
                  style={{ paddingLeft: '2.75rem' }}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
