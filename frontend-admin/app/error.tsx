"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl border border-rose-200 shadow-2xl rounded-2xl p-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4 shadow-inner">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Đã xảy ra sự cố</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {error.message || "Hệ thống gặp lỗi không mong muốn khi tải trang này. Bạn có thể thử tải lại hoặc quay về trang chủ."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-500/20"
          >
            <RotateCcw size={16} />
            <span>Thử lại</span>
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Home size={16} />
            <span>Trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
