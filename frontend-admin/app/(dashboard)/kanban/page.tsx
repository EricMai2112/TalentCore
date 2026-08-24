import { Metadata } from "next";
import KanbanContainer from "@/src/features/kanban/components/KanbanContainer";
import { jobDescriptionApi } from "@/src/features/job-description/services/job-description.api";
import { kanbanApi } from "@/src/features/kanban/services/kanban.api";

export const metadata: Metadata = {
  title: "Kanban Tuyển dụng | TalentCore ATS",
  description: "Theo dõi và quản lý ứng viên qua từng vòng phỏng vấn chuyên nghiệp.",
};

/**
 * Server Component (SSR) for Recruitment Kanban Board
 */
export default async function KanbanPage() {
  // Pre-fetch initial data server-side
  const [departments, jobs, applications] = await Promise.all([
    jobDescriptionApi.getDepartments(),
    jobDescriptionApi.getJobs(),
    kanbanApi.getKanbanApplications(),
  ]);

  return (
    <KanbanContainer
      initialDepartments={departments}
      initialJobs={jobs}
      initialApplications={applications}
    />
  );
}
