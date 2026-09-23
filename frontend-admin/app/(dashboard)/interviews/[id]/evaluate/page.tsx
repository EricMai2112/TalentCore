import CandidateEvaluationView from "@/src/features/evaluations/components/CandidateEvaluationView";

export const dynamic = "force-dynamic";

interface EvaluatePageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewEvaluatePage({ params }: EvaluatePageProps) {
  const { id } = await params;
  return <CandidateEvaluationView interviewId={id} />;
}
