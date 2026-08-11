// Manager được populate từ backend — trả về object User thay vì ObjectId
export interface ManagerInfo {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  managerId?: ManagerInfo | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentDto {
  name: string;
  code: string;
  managerId?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  code?: string;
  managerId?: string;
}

// Helper: lấy manager name từ populated hoặc plain string
export function getManagerName(managerId?: ManagerInfo | string | null): string | null {
  if (!managerId) return null;
  if (typeof managerId === "string") return null;
  return managerId.name ?? null;
}
