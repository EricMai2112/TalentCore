import { Metadata } from "next";
import KanbanContainer from "@/src/features/kanban/components/KanbanContainer";
import { jobDescriptionApi } from "@/src/features/job-description/services/job-description.api";
import { kanbanApi } from "@/src/features/kanban/services/kanban.api";

export const metadata: Metadata = {
  title: "Kanban Tuyển dụng | TalentCore ATS",
  description: "Theo dõi và quản lý ứng viên qua từng vòng phỏng vấn chuyên nghiệp.",
};

// Opt-out of static rendering — Kanban data is dynamic and must be live
export const dynamic = "force-dynamic";

/**
 * Server Component (SSR) for Recruitment Kanban Board
 */
export default async function KanbanPage() {
  let departments: any[] = [];
  let jobs: any[] = [];
  let applications: any[] = [];

  try {
    const [deptsRes, jobsRes, appsRes] = await Promise.allSettled([
      jobDescriptionApi.getDepartments(),
      jobDescriptionApi.getJobs(),
      kanbanApi.getKanbanApplications(),
    ]);

    if (deptsRes.status === "fulfilled") departments = deptsRes.value || [];
    if (jobsRes.status === "fulfilled") jobs = jobsRes.value || [];
    if (appsRes.status === "fulfilled") applications = appsRes.value || [];
  } catch (err) {
    console.error("Lỗi khi tải trước dữ liệu Kanban:", err);
  }

  return (
    <KanbanContainer
      initialDepartments={departments}
      initialJobs={jobs}
      initialApplications={applications}
    />
  );
}
