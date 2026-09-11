'use client'

import { Info, Phone } from 'lucide-react'

interface HrContactNoteCalloutProps {
  phone?: string
  zaloPhone?: string
}

export function HrContactNoteCallout({
  phone = '0987654321',
  zaloPhone = '0987654321'
}: HrContactNoteCalloutProps) {
  return (
    <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
      <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
      <div className="space-y-1 leading-relaxed">
        <span className="font-bold block text-amber-950 text-xs">
          💡 Ghi chú từ Bộ phận Tuyển dụng (HR):
        </span>
        <p className="text-amber-800">
          Nếu quý ứng viên có thắc mắc hoặc cần hỗ trợ thay đổi thời gian phỏng vấn, vui lòng liên hệ trực tiếp với HR qua SĐT/Zalo:{' '}
          <a
            href={`tel:${phone}`}
            className="font-bold text-indigo-700 hover:text-indigo-900 underline inline-flex items-center gap-1 bg-white/70 px-2 py-0.5 rounded-md border border-amber-200/60"
          >
            <Phone size={12} />
            <span>{phone}</span>
          </a>
        </p>
      </div>
    </div>
  )
}
