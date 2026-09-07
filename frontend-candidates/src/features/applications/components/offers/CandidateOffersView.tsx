'use client'

import { FileText } from 'lucide-react'

export function CandidateOffersView() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900">
          Offer của tôi
        </h1>
        <p className="mt-1 text-xs font-medium sm:text-sm text-slate-500">
          Xem và tiếp nhận các thư mời nhận việc từ nhà tuyển dụng
        </p>
      </div>

      <div className="flex flex-col items-center justify-center p-8 py-20 space-y-3 text-center bg-white border shadow-xs rounded-3xl border-slate-200/80">
        <div className="flex items-center justify-center mb-1 w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600">
          <FileText size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-800">Chưa có Thư mời nhận việc (Offer)</h3>
        <p className="max-w-sm text-xs text-slate-500">
          Các thư mời nhận việc chính thức sẽ được gửi tới bạn khi kết thúc vòng phỏng vấn thành công.
        </p>
      </div>
    </div>
  )
}
