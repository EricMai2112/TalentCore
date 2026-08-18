import { notFound } from "next/navigation";
import JobRequestFormWizard from "@/src/features/job-description/components/JobRequestFormWizard";
import { jobDescriptionApi } from "@/src/features/job-description/services/job-description.api";
import {
  JobDescription,
  Department,
  PipelineTemplate,
  Skill,
  User,
  Position,
} from "@/src/features/job-description/types/job-description.types";

export const dynamic = "force-dynamic";

interface EditJobRequestPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobRequestPage({ params }: EditJobRequestPageProps) {
  const { id } = await params;

  let job: JobDescription | null = null;
  let departments: Department[] = [];
  let pipelineTemplates: PipelineTemplate[] = [];
  let skills: Skill[] = [];
  let employees: User[] = [];
  let positions: Position[] = [];

  try {
    const [jobRes, deptsRes, templatesRes, skillsRes, empsRes, positionsRes] = await Promise.all([
      jobDescriptionApi.getJobById(id),
      jobDescriptionApi.getDepartments(),
      jobDescriptionApi.getPipelineTemplates(),
      jobDescriptionApi.getSkills(),
      jobDescriptionApi.getEmployees(),
      jobDescriptionApi.getPositions(),
    ]);

    job = jobRes;
    departments = deptsRes;
    pipelineTemplates = templatesRes;
    skills = skillsRes;
    employees = empsRes;
    positions = positionsRes;
  } catch (err) {
    console.error("Failed to fetch job data for edit page:", err);
  }

  if (!job) {
    return notFound();
  }

  return (
    <JobRequestFormWizard
      mode="edit"
      initialJob={job}
      departments={departments}
      pipelineTemplates={pipelineTemplates}
      skills={skills}
      employees={employees}
      positions={positions}
    />
  );
}
