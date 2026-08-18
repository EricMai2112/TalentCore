import JobRequestFormWizard from "@/src/features/job-description/components/JobRequestFormWizard";
import { jobDescriptionApi } from "@/src/features/job-description/services/job-description.api";
import {
  Department,
  PipelineTemplate,
  Skill,
  User,
  Position,
} from "@/src/features/job-description/types/job-description.types";

export const dynamic = "force-dynamic";

export default async function CreateJobRequestPage() {
  let departments: Department[] = [];
  let pipelineTemplates: PipelineTemplate[] = [];
  let skills: Skill[] = [];
  let employees: User[] = [];
  let positions: Position[] = [];

  try {
    const [deptsRes, templatesRes, skillsRes, empsRes, positionsRes] = await Promise.all([
      jobDescriptionApi.getDepartments(),
      jobDescriptionApi.getPipelineTemplates(),
      jobDescriptionApi.getSkills(),
      jobDescriptionApi.getEmployees(),
      jobDescriptionApi.getPositions(),
    ]);

    departments = deptsRes;
    pipelineTemplates = templatesRes;
    skills = skillsRes;
    employees = empsRes;
    positions = positionsRes;
  } catch (err) {
    console.error("Failed to fetch metadata for Create Job Request page:", err);
  }

  return (
    <JobRequestFormWizard
      mode="create"
      departments={departments}
      pipelineTemplates={pipelineTemplates}
      skills={skills}
      employees={employees}
      positions={positions}
    />
  );
}
