import JobRequestManager from "@/src/features/job-description/components/JobRequestManager";
import { jobDescriptionApi } from "@/src/features/job-description/services/job-description.api";
import {
  JobDescription,
  Department,
  PipelineTemplate,
  Skill,
  User,
  Position,
} from "@/src/features/job-description/types/job-description.types";

// Opt-out of static rendering so data is fetched live from API on every request
export const dynamic = "force-dynamic";

export default async function JobDescriptionPage() {
  // Fetch all required data server-side
  let initialJobs: JobDescription[] = [];
  let departments: Department[] = [];
  let pipelineTemplates: PipelineTemplate[] = [];
  let skills: Skill[] = [];
  let employees: User[] = [];
  let positions: Position[] = [];

  try {
    const [jobsRes, deptsRes, templatesRes, skillsRes, empsRes, positionsRes] = await Promise.allSettled([
      jobDescriptionApi.getJobs(),
      jobDescriptionApi.getDepartments(),
      jobDescriptionApi.getPipelineTemplates(),
      jobDescriptionApi.getSkills(),
      jobDescriptionApi.getEmployees(),
      jobDescriptionApi.getPositions(),
    ]);

    if (jobsRes.status === "fulfilled") initialJobs = jobsRes.value;
    if (deptsRes.status === "fulfilled") departments = deptsRes.value;
    if (templatesRes.status === "fulfilled") pipelineTemplates = templatesRes.value;
    if (skillsRes.status === "fulfilled") skills = skillsRes.value;
    if (empsRes.status === "fulfilled") employees = empsRes.value;
    if (positionsRes.status === "fulfilled") positions = positionsRes.value;
  } catch (err) {
    console.error("Failed to fetch initial data for Job Requisitions:", err);
  }

  return (
    <div className="w-full space-y-6">
      <JobRequestManager
        initialJobs={initialJobs}
        departments={departments}
        pipelineTemplates={pipelineTemplates}
        skills={skills}
        employees={employees}
        positions={positions}
      />
    </div>
  );
}
