import UserManager from "@/src/features/users/components/UserManager";
import { userApi } from "@/src/features/users/services/user.api";
import { User, Department } from "@/src/features/users/types/user.types";

export const revalidate = 0; // Luôn fetch dữ liệu mới nhất (no cache)

export default async function UsersPage() {
  let users: User[] = [];
  let departments: Department[] = [];

  try {
    [users, departments] = await Promise.all([
      userApi.getEmployees(),
      userApi.getDepartments(),
    ]);
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu users/departments server-side:", error);
  }

  return (
    <div className="space-y-6">
      <UserManager initialUsers={users} initialDepartments={departments} />
    </div>
  );
}
