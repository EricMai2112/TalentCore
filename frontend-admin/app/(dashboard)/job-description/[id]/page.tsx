import { notFound } from "next/navigation";
import JobRequestDetailsView from "@/src/features/job-description/components/JobRequestDetailsView";
import { jobDescriptionApi } from "@/src/features/job-description/services/job-description.api";
import { JobDescription } from "@/src/features/job-description/types/job-description.types";

export const dynamic = "force-dynamic";

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;
  let job: JobDescription | null = null;

  try {
    job = await jobDescriptionApi.getJobById(id);
  } catch (err) {
    console.error("Failed to fetch job details:", err);
  }

  if (!job) {
    return notFound();
  }

  return <JobRequestDetailsView job={job} />;
}
