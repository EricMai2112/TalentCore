"use client";

import { useState } from "react";
import { Share2, Send } from "lucide-react";
import { CandidateJob } from "../types/job.types";
import ApplyModal from "./ApplyModal";

interface JobDetailHeaderActionsProps {
  job: CandidateJob;
}

export function JobDetailHeaderActions({ job }: JobDetailHeaderActionsProps) {
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
        >
          <Share2 size={16} />
          <span>{copied ? "Đã chép link!" : "Chia sẻ"}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsApplyOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
        >
          <Send size={16} />
          <span>Ứng tuyển ngay</span>
        </button>
      </div>

      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        job={job}
      />
    </>
  );
}

interface JobSidebarApplyButtonProps {
  job: CandidateJob;
}

export function JobSidebarApplyButton({ job }: JobSidebarApplyButtonProps) {
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsApplyOpen(true)}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
      >
        <Send size={18} />
        <span>Ứng tuyển ngay vị trí này</span>
      </button>

      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        job={job}
      />
    </>
  );
}
