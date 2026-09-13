"use client";

import { useAuth } from "@/src/providers/AuthProvider";
import { USER_ROLE_LABEL } from "@/src/features/users/types/user.types";

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "buổi sáng";
  if (hour >= 12 && hour < 18) return "buổi chiều";
  return "buổi tối";
}

export default function UserGreeting() {
  const { user } = useAuth();
  const timeGreeting = getTimeGreeting();

  const userDisplayName = user?.name || (user?.role ? USER_ROLE_LABEL[user.role] : "Admin System");

  return (
    <div className="flex flex-col leading-snug">
      <p className="text-sm text-slate-700">
        Chào {timeGreeting},{" "}
        <span className="font-bold text-slate-900">{userDisplayName}</span>
      </p>
      <p className="text-[12px] text-slate-500">
        Chúc bạn một ngày làm việc hiệu quả!
      </p>
    </div>
  );
}
