import DepartmentManager from "@/src/features/departments/components/DepartmentManager";
import { departmentApi } from "@/src/features/departments/services/department.api";
import { userApi } from "@/src/features/users/services/user.api";
import { Department } from "@/src/features/departments/types/department.types";
import { User } from "@/src/features/users/types/user.types";

export const revalidate = 0;

export default async function DepartmentsPage() {
  let departments: Department[] = [];
  let employees: User[] = [];

  try {
    [departments, employees] = await Promise.all([
      departmentApi.getAll(),
      userApi.getEmployees(),
    ]);
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu departments/employees server-side:", error);
  }

  return (
    <div className="space-y-6">
      <DepartmentManager
        initialDepartments={departments}
        employees={employees}
      />
    </div>
  );
}
