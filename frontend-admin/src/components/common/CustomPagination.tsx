"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function CustomPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  className = "",
}: CustomPaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  const safeTotalPages = Math.max(1, totalPages);
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate pagination buttons array with ellipsis (...)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (safeTotalPages <= maxVisible) {
      for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(safeTotalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= safeTotalPages - 2) {
        start = safeTotalPages - 3;
        end = safeTotalPages - 1;
      }

      if (start > 2) pages.push("...");

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < safeTotalPages - 1) pages.push("...");

      pages.push(safeTotalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5 bg-white/40 backdrop-blur-md border-t border-white/60 rounded-b-2xl ${className}`}
    >
      {/* Page item summary info */}
      <div className="text-xs text-slate-500 font-medium">
        Hiển thị <strong className="text-slate-800 font-bold">{startItem}</strong> -{" "}
        <strong className="text-slate-800 font-bold">{endItem}</strong> trên tổng số{" "}
        <strong className="text-slate-800 font-bold">{totalItems}</strong> bản ghi
      </div>

      {/* Pagination control buttons */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-xl border border-white/80 bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/60 transition-all cursor-pointer shadow-2xs"
          title="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, idx) => {
          if (typeof page === "string") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-1 text-xs text-slate-400 font-bold select-none"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={`page-${page}`}
              type="button"
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#3B82F6] text-white shadow-xs shadow-blue-500/30 scale-105 font-bold border border-[#3B82F6]"
                  : "bg-white/60 border border-white/80 text-slate-600 hover:bg-white hover:text-slate-900 shadow-2xs"
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage === safeTotalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-xl border border-white/80 bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/60 transition-all cursor-pointer shadow-2xs"
          title="Trang sau"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default CustomPagination;
