'use client'

import { useState, useEffect } from 'react'
import { ApplicationStats } from '../types/application.types'
import { ApplicationTabsNav } from './ApplicationTabsNav'
import { MyApplicationsContent } from './my-applications/MyApplicationsContent'
import { CandidateInterviewsView } from './interviews/CandidateInterviewsView'
import { CandidateOffersView } from './offers/CandidateOffersView'

export default function MyApplicationsView() {
  const [activeTab, setActiveTab] = useState<'my_applications' | 'interviews' | 'offers'>(
    'my_applications'
  )
  const [stats, setStats] = useState<ApplicationStats>({
    totalApplied: 0,
    processingCount: 0,
    interviewCount: 0,
    offerCount: 0
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab')
      if (tabParam === 'offers' || tabParam === 'interviews' || tabParam === 'my_applications') {
        setActiveTab(tabParam)
      }
    }
  }, [])

  return (
    <div className="min-h-screen pb-16 bg-slate-50/60 text-slate-900">
      {/* Top Header Navigation Tabs */}
      <ApplicationTabsNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        interviewCount={stats.interviewCount}
        offerCount={stats.offerCount}
      />

      <main className="max-w-6xl px-4 pt-8 mx-auto space-y-8 sm:px-6">
        {activeTab === 'my_applications' && (
          <MyApplicationsContent onStatsLoaded={setStats} />
        )}

        {activeTab === 'interviews' && <CandidateInterviewsView />}

        {activeTab === 'offers' && <CandidateOffersView />}
      </main>
    </div>
  )
}
