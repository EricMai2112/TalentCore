'use client'

import React from 'react'
import { Loader2, Table as TableIcon } from 'lucide-react'
import CustomPagination from './CustomPagination'

export interface CustomTableContainerProps {
  children: React.ReactNode
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
    onPageChange: (page: number) => void
  }
  isLoading?: boolean
  loadingMessage?: string
  isEmpty?: boolean
  emptyIcon?: React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
  maxHeightClass?: string
  className?: string
}

export default function CustomTableContainer({
  children,
  pagination,
  isLoading = false,
  loadingMessage = 'Đang tải dữ liệu...',
  isEmpty = false,
  emptyIcon,
  emptyTitle = 'Không tìm thấy dữ liệu',
  emptyDescription = 'Không có kết quả nào phù hợp với điều kiện tìm kiếm.',
  maxHeightClass = 'max-h-[calc(100vh-270px)]',
  className = ''
}: CustomTableContainerProps) {
  return (
    <div
      className={`overflow-hidden bg-white/50 border border-white/70 shadow-xl shadow-[#1261A6]/8 rounded-3xl transition-all duration-300 backdrop-blur-md flex flex-col ${maxHeightClass} ${className}`}
    >
      {/* Loading Overlay State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3 bg-white/40 backdrop-blur-xs flex-1 min-h-[300px]">
          <Loader2 size={36} className="text-[#3B82F6] animate-spin" />
          <p className="text-xs font-semibold text-slate-600">{loadingMessage}</p>
        </div>
      ) : isEmpty ? (
        /* Empty Data State */
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-slate-500 bg-white/40 flex-1 min-h-[300px] space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100/80 text-slate-400 border border-slate-200/80 flex items-center justify-center shadow-2xs">
            {emptyIcon || <TableIcon className="w-8 h-8 stroke-[1.5]" />}
          </div>
          <div className="max-w-sm space-y-1">
            <h3 className="text-sm font-bold text-slate-800">{emptyTitle}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{emptyDescription}</p>
          </div>
        </div>
      ) : (
        /* Table Content Area with Internal Scroll */
        <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0 [scrollbar-width:thin] [scrollbar-color:rgba(59,130,246,0.6)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#3B82F6]/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#2563EB]">
          {children}
        </div>
      )}

      {/* Pinned Pagination Footer */}
      {pagination && !isLoading && !isEmpty && (
        <div className="sticky bottom-0 z-10 bg-white/60 backdrop-blur-lg border-t border-white/60 shrink-0">
          <CustomPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  )
}
