import CandidatesManager from "@/src/features/candidates/components/CandidatesManager";
import { createServerApiClient } from "@/src/lib/api-client";
import { getCachedDepartments } from "@/src/lib/server-cache";
import { CandidateApplication } from "@/src/features/candidates/types/candidate.types";
import { Department } from "@/src/features/departments/types/department.types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý ứng viên | TalentCore Admin",
  description: "Quản lý và theo dõi toàn bộ ứng viên đang trong quy trình tuyển dụng",
};

// Opt-out of static rendering — data is auth-protected and dynamic
export const dynamic = "force-dynamic";

/**
 * Server Component — pre-fetches applications and departments using the
 * session cookie from the incoming request so the page renders with data
 * on first load (no client-side loading spinner).
 */
export default async function CandidatesPage() {
  let initialApplications: CandidateApplication[] = [];
  let initialDepartments: Department[] = [];

  try {
    const api = await createServerApiClient();

    interface ApiResponse<T> { message: string; data: T }

    const [appsRes, depts] = await Promise.allSettled([
      api.get<ApiResponse<CandidateApplication[]>>("/applications/kanban"),
      getCachedDepartments(),
    ]);

    if (appsRes.status === "fulfilled") {
      initialApplications = (appsRes.value as any)?.data ?? appsRes.value ?? [];
    }
    if (depts.status === "fulfilled") {
      initialDepartments = depts.value;
    }
  } catch (err) {
    // Silently fall back — CandidatesManager will fetch on the client side
    console.error("[CandidatesPage] SSR data fetch failed:", err);
  }

  return (
    <CandidatesManager
      initialApplications={initialApplications}
      initialDepartments={initialDepartments}
    />
  );
}
