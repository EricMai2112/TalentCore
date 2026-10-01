import { useQuery } from '@tanstack/react-query';
import { skillApi } from '../services/skill.api';
import { Skill } from '../types/skill.types';

export const SKILLS_QUERY_KEY = ['skills'] as const;

export function useSkillsQuery(options?: { initialData?: Skill[] }) {
  return useQuery({
    queryKey: SKILLS_QUERY_KEY,
    queryFn: () => skillApi.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    ...options,
  });
}
