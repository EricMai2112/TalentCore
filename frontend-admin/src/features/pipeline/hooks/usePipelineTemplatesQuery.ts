import { useQuery } from '@tanstack/react-query';
import { pipelineApi } from '../services/pipeline.api';
import { PipelineTemplate } from '../types/pipeline.types';

export const PIPELINE_TEMPLATES_QUERY_KEY = ['pipeline-templates'] as const;

export function usePipelineTemplatesQuery(options?: { initialData?: PipelineTemplate[] }) {
  return useQuery({
    queryKey: PIPELINE_TEMPLATES_QUERY_KEY,
    queryFn: () => pipelineApi.getTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    ...options,
  });
}
