"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-6 text-center shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-bold mb-2">Đã xảy ra lỗi nghiêm trọng</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Ứng dụng gặp sự cố hệ thống. Vui lòng tải lại ứng dụng để tiếp tục làm việc.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/30"
          >
            <RotateCcw size={16} />
            <span>Tải lại ứng dụng</span>
          </button>
        </div>
      </body>
    </html>
  );
}
