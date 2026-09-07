'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2, Inbox } from 'lucide-react'
import { CandidateApplicationItem, ApplicationStats } from '../../types/application.types'
import { candidateApplicationsApi } from '../../services/candidate-applications.api'
import { ApplicationStatsCards } from './ApplicationStatsCards'
import { ApplicationCardItem } from './ApplicationCardItem'

interface MyApplicationsContentProps {
  onStatsLoaded?: (stats: ApplicationStats) => void
}

export function MyApplicationsContent({ onStatsLoaded }: MyApplicationsContentProps) {
  const [applications, setApplications] = useState<CandidateApplicationItem[]>([])
  const [stats, setStats] = useState<ApplicationStats>({
    totalApplied: 0,
    processingCount: 0,
    interviewCount: 0,
    offerCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true)
      try {
        const data = await candidateApplicationsApi.getMyApplications()
        setApplications(data.applications || [])
        const retrievedStats = data.stats || {
          totalApplied: 0,
          processingCount: 0,
          interviewCount: 0,
          offerCount: 0
        }
        setStats(retrievedStats)
        if (onStatsLoaded) onStatsLoaded(retrievedStats)
      } catch (err) {
        console.error('Lỗi khi lấy đơn ứng tuyển của tôi:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchApplications()
  }, [])

  return (
    <div className="space-y-8">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900">
          Ứng tuyển của tôi
        </h1>
        <p className="mt-1 text-xs font-medium sm:text-sm text-slate-500">
          Theo dõi tiến trình ứng tuyển của bạn qua từng giai đoạn
        </p>
      </div>

      {/* 4 Metric Summary Cards Grid */}
      <ApplicationStatsCards stats={stats} />

      {/* Application Cards List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border shadow-xs text-slate-400 rounded-3xl border-slate-200/80">
          <Loader2 size={32} className="mb-3 text-indigo-600 animate-spin" />
          <p className="text-xs font-semibold">Đang tải danh sách ứng tuyển...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 py-20 space-y-3 text-center bg-white border shadow-xs rounded-3xl border-slate-200/80">
          <div className="flex items-center justify-center mb-1 w-14 h-14 rounded-3xl bg-slate-100 text-slate-400">
            <Inbox size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Bạn chưa ứng tuyển vị trí nào</h3>
          <p className="max-w-sm text-xs text-slate-500">
            Khám phá các cơ hội việc làm hấp dẫn và gửi hồ sơ ứng tuyển ngay hôm nay.
          </p>
          <Link
            href="/jobs"
            className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-indigo-500/20 transition-all"
          >
            <span>Xem danh sách việc làm</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <ApplicationCardItem key={app._id} app={app} />
          ))}
        </div>
      )}
    </div>
  )
}
