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
    <div className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-2xs">
      <div className="flex items-center justify-center w-full gap-2 py-3 mx-auto sm:px-6 sm:gap-6">
        <button
          type="button"
          onClick={() => onChangeTab('my_applications')}
          className={`px-4.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
          className={`px-4.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'interviews'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <span>Lịch phỏng vấn</span>
          {interviewCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] ${
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
          className={`px-4.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'offers'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <span>Offer</span>
          {offerCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] ${
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
  )
}
