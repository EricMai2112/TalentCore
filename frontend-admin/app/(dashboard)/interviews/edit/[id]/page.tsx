'use client';

import { use } from 'react';
import { InterviewForm } from '@/src/features/interviews/components';

interface EditInterviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditInterviewPage({ params }: EditInterviewPageProps) {
  const { id } = use(params);

  return <InterviewForm mode="edit" interviewId={id} />;
}
