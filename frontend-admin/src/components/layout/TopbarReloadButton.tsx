'use client';

import React, { useState, useEffect } from 'react';
import { RotateCw, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TopbarReloadButton() {
  const router = useRouter();
  const [isReloading, setIsReloading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    // Set initial formatted time on client mount
    const updateTime = () => {
      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    updateTime();
  }, []);

  const handleReload = () => {
    if (isReloading) return;
    setIsReloading(true);

    // Update timestamp immediately
    const now = new Date();
    setLastUpdated(
      now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );

    // Refresh route and then reload window for deep refresh
    router.refresh();
    setTimeout(() => {
      window.location.reload();
    }, 250);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Last Updated Timestamp Pill */}
      {lastUpdated && (
        <div
          title="Thời gian dữ liệu được cập nhật lần cuối"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/40 hover:bg-white/60 border border-white/70 backdrop-blur-md text-[11px] font-semibold text-slate-600 shadow-2xs transition-all cursor-default"
        >
          <Clock size={12} className="text-[#3B82F6]" />
          <span className="text-[10px] text-slate-400 font-medium">Cập nhật:</span>
          <span className="font-mono text-slate-700 font-bold">{lastUpdated}</span>
        </div>
      )}

      {/* Full Page Reload Button */}
      <button
        type="button"
        onClick={handleReload}
        disabled={isReloading}
        className={`relative p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center border shadow-2xs backdrop-blur-md ${
          isReloading
            ? 'bg-white/90 text-[#3B82F6] border-[#3B82F6] ring-4 ring-[#3B82F6]/15'
            : 'bg-white/40 hover:bg-white/80 text-[#3B82F6] hover:text-[#8B5CF6] border-[#3B82F6]/60 hover:border-[#8B5CF6]/60'
        }`}
        title="Tải lại toàn bộ dữ liệu trang"
      >
        <RotateCw
          size={18}
          className={`transition-transform duration-700 ${
            isReloading ? 'animate-spin text-[#3B82F6]' : 'hover:rotate-180'
          }`}
        />
      </button>
    </div>
  );
}
