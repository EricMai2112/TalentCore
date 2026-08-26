import { Metadata } from "next";
import KanbanContainer from "@/src/features/kanban/components/KanbanContainer";
import { jobDescriptionApi } from "@/src/features/job-description/services/job-description.api";
import { kanbanApi } from "@/src/features/kanban/services/kanban.api";

export const metadata: Metadata = {
  title: "Kanban Tuyển dụng | TalentCore ATS",
  description: "Theo dõi và quản lý ứng viên qua từng vòng phỏng vấn chuyên nghiệp.",
};

export const dynamic = 'force-dynamic';

/**
 * Server Component (SSR) for Recruitment Kanban Board
 */
export default async function KanbanPage() {
  let departments: any[] = [];
  let jobs: any[] = [];
  let applications: any[] = [];

  try {
    const results = await Promise.all([
      jobDescriptionApi.getDepartments().catch(() => []),
      jobDescriptionApi.getJobs().catch(() => []),
      kanbanApi.getKanbanApplications().catch(() => []),
    ]);
    departments = results[0];
    jobs = results[1];
    applications = results[2];
  } catch (error) {
    console.warn("⚠️ Khởi tạo dữ liệu Kanban server-side fallback:", error);
  }

  return (
    <KanbanContainer
      initialDepartments={departments}
      initialJobs={jobs}
      initialApplications={applications}
    />
  );
}
