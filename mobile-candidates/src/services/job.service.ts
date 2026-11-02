import { API_CONFIG } from '../config/api.config';
import { DepartmentItem, JobItem } from '../types/job.types';

const DEFAULT_DEPARTMENTS: DepartmentItem[] = [
  { id: 'All', name: 'Tất cả', icon: 'grid-outline', color: '#7c3aed', bgColor: '#f3e8ff' },
];

const DEFAULT_JOBS: JobItem[] = [];

const formatSalary = (min?: number, max?: number): string => {
  if (!min && !max) return 'Thỏa thuận';
  if (min && max) {
    if (min >= 1000000) {
      return `${(min / 1000000).toFixed(0)} - ${(max / 1000000).toFixed(0)} triệu / tháng`;
    }
    return `$${min.toLocaleString()} - $${max.toLocaleString()} / tháng`;
  }
  if (min) {
    if (min >= 1000000) return `Từ ${(min / 1000000).toFixed(0)} triệu / tháng`;
    return `Từ $${min.toLocaleString()} / tháng`;
  }
  return 'Thỏa thuận';
};

const formatCreatedAt = (dateStr?: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getDeptTheme = (name: string): { icon: string; color: string; bgColor: string } => {
  const lower = name.toLowerCase();
  if (lower.includes('it') || lower.includes('software') || lower.includes('engineer')) {
    return { icon: 'code-slash-outline', color: '#2563eb', bgColor: '#eff6ff' };
  }
  if (lower.includes('design') || lower.includes('thiết kế')) {
    return { icon: 'color-palette-outline', color: '#9333ea', bgColor: '#faf5ff' };
  }
  if (lower.includes('finance') || lower.includes('tài chính') || lower.includes('kế toán')) {
    return { icon: 'business-outline', color: '#059669', bgColor: '#ecfdf5' };
  }
  if (lower.includes('hr') || lower.includes('nhân sự')) {
    return { icon: 'people-outline', color: '#d97706', bgColor: '#fffbeb' };
  }
  if (lower.includes('market')) {
    return { icon: 'megaphone-outline', color: '#e11d48', bgColor: '#fff1f2' };
  }
  return { icon: 'briefcase-outline', color: '#475569', bgColor: '#f1f5f9' };
};

export const jobService = {
  getDepartments: async (): Promise<DepartmentItem[]> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_CONFIG.BASE_URL}/departments`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return DEFAULT_DEPARTMENTS;
      }

      const list = await response.json();

      if (Array.isArray(list) && list.length > 0) {
        const mapped: DepartmentItem[] = list.map((d: any) => {
          const theme = getDeptTheme(d.name);
          return {
            id: d._id || d.code,
            name: d.name,
            icon: theme.icon,
            color: theme.color,
            bgColor: theme.bgColor,
          };
        });
        return [
          { id: 'All', name: 'Tất cả', icon: 'grid-outline', color: '#7c3aed', bgColor: '#f3e8ff' },
          ...mapped,
        ];
      }

      return DEFAULT_DEPARTMENTS;
    } catch {
      return DEFAULT_DEPARTMENTS;
    }
  },

  getJobs: async (): Promise<JobItem[]> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`${API_CONFIG.BASE_URL}/job-descriptions/public`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return DEFAULT_JOBS;
      }

      const resJson = await response.json();
      const list = resJson.data || resJson;

      if (Array.isArray(list) && list.length > 0) {
        return list.map((item: any) => {
          const deptObj = item.departmentId;
          const deptName = typeof deptObj === 'object' && deptObj?.name
            ? deptObj.name
            : 'IT & Engineering';

          const skills = Array.isArray(item.requiredSkills)
            ? item.requiredSkills.map((s: any) => (typeof s === 'object' ? s.name : s)).filter(Boolean)
            : [];

          const workTypeMap: Record<string, string> = {
            FULL_TIME: 'Toàn thời gian',
            PART_TIME: 'Bán thời gian',
            REMOTE: 'Từ xa (Remote)',
            HYBRID: 'Linh hoạt (Hybrid)',
          };

          const rawPriority = item.priority || 'MEDIUM';
          const isUrgent = rawPriority === 'HIGH';

          return {
            _id: item._id,
            title: item.title,
            department: deptName,
            departmentCode: typeof deptObj === 'object' ? deptObj?.code : undefined,
            salaryMin: item.minimumSalary,
            salaryMax: item.maximumSalary,
            salaryDisplay: formatSalary(item.minimumSalary, item.maximumSalary),
            location: item.location || 'Toàn quốc',
            workType: workTypeMap[item.employmentType] || item.employmentType || 'Toàn thời gian',
            level: item.experienceLevel || 'Có kinh nghiệm',
            priority: rawPriority,
            isUrgent,
            skills,
            description: item.description,
            requirements: item.requirements,
            benefits: item.benefits,
            responsibilities: item.responsibilities,
            experienceLevel: item.experienceLevel,
            employmentType: item.employmentType,
            postedTime: formatCreatedAt(item.createdAt),
            createdAt: item.createdAt,
          };
        });
      }

      return DEFAULT_JOBS;
    } catch {
      return DEFAULT_JOBS;
    }
  },

  getJobById: async (id: string): Promise<JobItem | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`${API_CONFIG.BASE_URL}/job-descriptions/${id}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const resJson = await response.json();
        const item = resJson.data || resJson;
        if (item && item._id) {
          const deptObj = item.departmentId;
          const deptName = typeof deptObj === 'object' && deptObj?.name
            ? deptObj.name
            : 'IT & Engineering';

          const skills = Array.isArray(item.requiredSkills)
            ? item.requiredSkills.map((s: any) => (typeof s === 'object' ? s.name : s)).filter(Boolean)
            : [];

          const workTypeMap: Record<string, string> = {
            FULL_TIME: 'Toàn thời gian',
            PART_TIME: 'Bán thời gian',
            REMOTE: 'Từ xa (Remote)',
            HYBRID: 'Linh hoạt (Hybrid)',
          };

          const rawPriority = item.priority || 'MEDIUM';
          const isUrgent = rawPriority === 'HIGH' || rawPriority === 'URGENT';

          return {
            _id: item._id,
            title: item.title,
            department: deptName,
            departmentCode: typeof deptObj === 'object' ? deptObj?.code : undefined,
            salaryMin: item.minimumSalary,
            salaryMax: item.maximumSalary,
            salaryDisplay: formatSalary(item.minimumSalary, item.maximumSalary),
            location: item.location || 'Toàn quốc',
            workType: workTypeMap[item.employmentType] || item.employmentType || 'Toàn thời gian',
            level: item.experienceLevel || 'Có kinh nghiệm',
            priority: rawPriority,
            isUrgent,
            skills,
            description: item.description,
            requirements: item.requirements,
            benefits: item.benefits,
            responsibilities: item.responsibilities,
            experienceLevel: item.experienceLevel,
            employmentType: item.employmentType,
            postedTime: formatCreatedAt(item.createdAt),
            createdAt: item.createdAt,
          };
        }
      }

      const foundInDefault = DEFAULT_JOBS.find((j) => j._id === id);
      return foundInDefault || null;
    } catch {
      const foundInDefault = DEFAULT_JOBS.find((j) => j._id === id);
      return foundInDefault || null;
    }
  },
};
