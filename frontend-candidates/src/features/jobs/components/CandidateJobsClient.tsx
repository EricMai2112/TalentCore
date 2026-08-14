"use client";

import { useEffect, useState, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { Briefcase, Bell, RefreshCw } from "lucide-react";
import { CandidateJob, JobFilterState } from "@/src/features/jobs/types/job.types";
import JobFilters from "./JobFilters";
import JobCard from "./JobCard";
import ApplyModal from "./ApplyModal";
import { env } from "@/src/config/env.config";

interface CandidateJobsClientProps {
  initialJobs: CandidateJob[];
}

export default function CandidateJobsClient({ initialJobs }: CandidateJobsClientProps) {
  const [jobs, setJobs] = useState<CandidateJob[]>(initialJobs);

  // Apply Modal state
  const [selectedJob, setSelectedJob] = useState<CandidateJob | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  // Real-time Notification Banner state
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<JobFilterState>({
    keyword: "",
    employmentType: "",
    experienceLevel: "",
    location: "",
    minSalary: "",
  });

  // Real-time Socket.io Connection
  useEffect(() => {
    let socket: Socket;
    try {
      socket = io(env.socketUrl, {
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        console.log("Connected to Real-time Job Socket Server!");
      });

      // Listen for newly published job event (when HR promotes JD to JD_CREATED)
      socket.on("job_published", (publishedJob: CandidateJob) => {
        console.log("Real-time job published event received:", publishedJob);
        
        // Add or update in state
        setJobs((prevJobs) => {
          const exists = prevJobs.some((j) => j._id === publishedJob._id);
          if (exists) {
            return prevJobs.map((j) =>
              j._id === publishedJob._id ? { ...publishedJob, isNew: true } : j
            );
          }
          return [{ ...publishedJob, isNew: true }, ...prevJobs];
        });

        // Trigger Realtime Notification Banner
        setRealtimeNotification(`Vừa có cơ hội nghề nghiệp mới: "${publishedJob.title}"!`);
        setTimeout(() => setRealtimeNotification(null), 5000);
      });

      // Listen for job update event
      socket.on("job_updated", (updatedJob: CandidateJob) => {
        setJobs((prevJobs) =>
          prevJobs.map((j) => (j._id === updatedJob._id ? updatedJob : j))
        );
      });
    } catch (err) {
      console.error("Socket connection error:", err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  // Filter jobs dynamically based on candidate criteria
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Keyword search
      if (filters.keyword.trim()) {
        const kw = filters.keyword.toLowerCase().trim();
        const titleMatch = job.title?.toLowerCase().includes(kw);
        const locMatch = job.location?.toLowerCase().includes(kw);
        const descMatch = job.description?.toLowerCase().includes(kw);
        const reqMatch = job.requirements?.toLowerCase().includes(kw);
        if (!titleMatch && !locMatch && !descMatch && !reqMatch) return false;
      }

      // Employment type
      if (filters.employmentType && job.employmentType !== filters.employmentType) {
        return false;
      }

      // Location filter
      if (filters.location.trim()) {
        const locKw = filters.location.toLowerCase().trim();
        if (!job.location?.toLowerCase().includes(locKw)) return false;
      }

      // Minimum salary filter
      if (filters.minSalary.trim()) {
        const minVal = Number(filters.minSalary);
        if (!isNaN(minVal) && job.maximumSalary < minVal) return false;
      }

      return true;
    });
  }, [jobs, filters]);

  const handleApplyJob = (job: CandidateJob) => {
    setSelectedJob(job);
    setIsApplyOpen(true);
  };

  return (
    <>
      {/* Real-time Toast Banner Alert */}
      {realtimeNotification && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-5 duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0">
            <Bell size={18} className="animate-bounce text-emerald-400" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
              Thông báo Realtime
            </span>
            <span className="text-sm font-semibold">{realtimeNotification}</span>
          </div>
        </div>
      )}

      {/* Filter Panel (Solid white background) */}
      <JobFilters
        filters={filters}
        onChange={setFilters}
        totalJobs={filteredJobs.length}
      />

      {/* Jobs Grid / Empty State */}
      {filteredJobs.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xs">
          <Briefcase size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy công việc phù hợp</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
            Thử điều chỉnh từ khóa tìm kiếm hoặc bấm Đặt lại lọc để xem thêm các vị trí tuyển dụng khác.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onApply={handleApplyJob}
            />
          ))}
        </div>
      )}

      {/* Quick Application Form Modal */}
      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        job={selectedJob}
      />
    </>
  );
}
