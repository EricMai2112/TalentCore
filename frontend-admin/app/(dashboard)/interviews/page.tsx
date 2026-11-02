import InterviewsManager from "@/src/features/interviews/components/InterviewsManager";
import { createServerApiClient } from "@/src/lib/api-client";
import { getCachedDepartments } from "@/src/lib/server-cache";
import { InterviewItem } from "@/src/features/interviews/types/interview.types";
import { Department } from "@/src/features/departments/types/department.types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý phỏng vấn | TalentCore Admin",
  description: "Quản lý và theo dõi lịch trình phỏng vấn ứng viên trực tuyến",
};

// Opt-out of static rendering — interview data is dynamic and auth-protected
export const dynamic = "force-dynamic";

/**
 * Server Component — pre-fetches interviews, departments, and candidate
 * applications using the session cookie so the page renders with data
 * on first load (no client-side loading spinner).
 */
export default async function InterviewsPage() {
  let initialInterviews: InterviewItem[] = [];
  let initialDepartments: Department[] = [];
  let initialApplications: any[] = [];

  try {
    const api = await createServerApiClient();

    interface ApiResponse<T> { message: string; data: T }

    const [interviewsRes, depts, appsRes] = await Promise.allSettled([
      api.get<InterviewItem[] | ApiResponse<InterviewItem[]>>("/interviews"),
      getCachedDepartments(),
      api.get<any[] | ApiResponse<any[]>>("/applications/kanban"),
    ]);

    if (interviewsRes.status === "fulfilled") {
      initialInterviews = (interviewsRes.value as any)?.data ?? interviewsRes.value ?? [];
    }
    if (depts.status === "fulfilled") {
      initialDepartments = depts.value;
    }
    if (appsRes.status === "fulfilled") {
      initialApplications = (appsRes.value as any)?.data ?? appsRes.value ?? [];
    }
  } catch (err) {
    // Silently fall back — InterviewsManager will fetch on the client side
    console.error("[InterviewsPage] SSR data fetch failed:", err);
  }

  return (
    <InterviewsManager
      initialInterviews={initialInterviews}
      initialDepartments={initialDepartments}
      initialApplications={initialApplications}
    />
  );
}
