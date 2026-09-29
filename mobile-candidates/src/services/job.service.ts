import { API_CONFIG } from '../config/api.config';
import { DepartmentItem, JobItem } from '../types/job.types';

const DEFAULT_DEPARTMENTS: DepartmentItem[] = [
  { id: 'All', name: 'Tất cả', icon: 'grid-outline', color: '#7c3aed', bgColor: '#f3e8ff' },
  { id: 'IT001', name: 'IT & Engineering', icon: 'code-slash-outline', color: '#2563eb', bgColor: '#eff6ff' },
  { id: 'FIN001', name: 'Finance & Accounting', icon: 'business-outline', color: '#059669', bgColor: '#ecfdf5' },
  { id: 'HR001', name: 'Human Resources', icon: 'people-outline', color: '#d97706', bgColor: '#fffbeb' },
  { id: 'MKT001', name: 'Marketing', icon: 'megaphone-outline', color: '#e11d48', bgColor: '#fff1f2' },
  { id: 'DES001', name: 'Design', icon: 'color-palette-outline', color: '#9333ea', bgColor: '#faf5ff' },
];

const DEFAULT_JOBS: JobItem[] = [
  {
    _id: 'job-1',
    title: 'Kỹ sư Dữ liệu - Data Engineer (Khối Dữ liệu)',
    department: 'IT & Engineering',
    departmentCode: 'IT001',
    salaryMin: 35000000,
    salaryMax: 55000000,
    salaryDisplay: '35 - 55 triệu / tháng',
    location: 'Hà Nội',
    workType: 'Toàn thời gian',
    level: 'Có kinh nghiệm (Mid-level)',
    priority: 'HIGH',
    isUrgent: true,
    skills: ['Python', 'SQL', 'Spark', 'Kafka', 'AWS'],
    postedTime: '15 phút trước',
    createdAt: new Date().toISOString(),
    description: 'Xây dựng và tối ưu hệ thống xử lý dữ liệu lớn (Big Data Pipeline) phục vụ phân tích thời gian thực.',
  },
  {
    _id: 'job-2',
    title: 'Chuyên viên Thiết kế UI/UX Senior',
    department: 'Design',
    departmentCode: 'DES001',
    salaryMin: 30000000,
    salaryMax: 45000000,
    salaryDisplay: '30 - 45 triệu / tháng',
    location: 'TP. Hồ Chí Minh',
    workType: 'Toàn thời gian',
    level: 'Cao cấp (Senior)',
    priority: 'HIGH',
    isUrgent: true,
    skills: ['Figma', 'Design System', 'Prototyping', 'UX Research'],
    postedTime: '1 giờ trước',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    description: 'Thiết kế giao diện và kiến trúc trải nghiệm người dùng toàn diện cho các nền tảng TalentCore.',
  },
  {
    _id: 'job-3',
    title: 'Lập trình viên Frontend (React / TypeScript)',
    department: 'IT & Engineering',
    departmentCode: 'IT001',
    salaryMin: 22000000,
    salaryMax: 35000000,
    salaryDisplay: '22 - 35 triệu / tháng',
    location: 'TP. Hồ Chí Minh',
    workType: 'Linh hoạt (Hybrid)',
    level: 'Mid-level',
    priority: 'MEDIUM',
    isUrgent: false,
    skills: ['React', 'TypeScript', 'TailwindCSS', 'Next.js'],
    postedTime: '3 giờ trước',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    description: 'Phát triển các module ứng dụng web và mobile chất lượng cao, tối ưu hóa trải nghiệm tương tác mượt mà.',
  },
  {
    _id: 'job-4',
    title: 'Finance Manager (Quản lý Tài chính)',
    department: 'Finance & Accounting',
    departmentCode: 'FIN001',
    salaryMin: 30000000,
    salaryMax: 50000000,
    salaryDisplay: '$1,500 - $2,500 / tháng',
    location: 'TP. Hồ Chí Minh',
    workType: 'Toàn thời gian',
    level: 'Trưởng nhóm (Lead)',
    priority: 'MEDIUM',
    isUrgent: false,
    skills: ['Quản lý ngân sách', 'Thuế', 'Báo cáo tài chính', 'Excel'],
    postedTime: 'Hôm nay',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    description: 'Quản trị dòng tiền, lập ngân sách và chiến lược tài chính cho các dự án mở rộng.',
  },
  {
    _id: 'job-5',
    title: 'Kỹ sư Backend (Node.js / NestJS)',
    department: 'IT & Engineering',
    departmentCode: 'IT001',
    salaryMin: 25000000,
    salaryMax: 40000000,
    salaryDisplay: '25 - 40 triệu / tháng',
    location: 'Hà Nội',
    workType: 'Toàn thời gian',
    level: 'Có kinh nghiệm',
    priority: 'HIGH',
    isUrgent: true,
    skills: ['Node.js', 'NestJS', 'PostgreSQL', 'Docker', 'Redis'],
    postedTime: 'Hôm qua',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    description: 'Thiết kế và triển khai hệ thống microservices backend với khả năng chịu tải và bảo mật cao.',
  },
];

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
  if (!dateStr) return 'Mới đăng';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Mới đăng';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return 'Vừa đăng';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;

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
};
