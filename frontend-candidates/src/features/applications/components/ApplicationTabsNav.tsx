'use client'

interface ApplicationTabsNavProps {
  activeTab: 'my_applications' | 'interviews' | 'offers'
  onChangeTab: (tab: 'my_applications' | 'interviews' | 'offers') => void
  interviewCount?: number
  offerCount?: number
}

export function ApplicationTabsNav({
  activeTab,
  onChangeTab,
  interviewCount = 0,
  offerCount = 0
}: ApplicationTabsNavProps) {
  return (
    <div className="sticky top-20 z-30 bg-white border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:justify-center sm:gap-6 overflow-hidden">
          <button
            type="button"
            onClick={() => onChangeTab('my_applications')}
            className={`w-full sm:w-auto px-2 sm:px-5 py-2 rounded-2xl text-[11px] sm:text-sm font-bold transition-all cursor-pointer text-center justify-center flex items-center whitespace-nowrap ${
              activeTab === 'my_applications'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            Ứng tuyển của tôi
          </button>

          <button
            type="button"
            onClick={() => onChangeTab('interviews')}
            className={`w-full sm:w-auto px-2 sm:px-5 py-2 rounded-2xl text-[11px] sm:text-sm font-bold transition-all cursor-pointer text-center justify-center flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
              activeTab === 'interviews'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <span>Lịch phỏng vấn</span>
            {interviewCount > 0 && (
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] ${
                activeTab === 'interviews'
                  ? 'bg-indigo-600 text-white font-extrabold'
                  : 'bg-slate-100 text-slate-600 font-bold'
              }`}>
                {interviewCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangeTab('offers')}
            className={`w-full sm:w-auto px-2 sm:px-5 py-2 rounded-2xl text-[11px] sm:text-sm font-bold transition-all cursor-pointer text-center justify-center flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
              activeTab === 'offers'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <span>Offer</span>
            {offerCount > 0 && (
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] ${
                activeTab === 'offers'
                  ? 'bg-emerald-600 text-white font-extrabold'
                  : 'bg-slate-100 text-slate-600 font-bold'
              }`}>
                {offerCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
