import InterviewsManager from "@/src/features/interviews/components/InterviewsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý phỏng vấn | TalentCore Admin",
  description: "Quản lý và theo dõi lịch trình phỏng vấn ứng viên trực tuyến",
};

export default function InterviewsPage() {
  return <InterviewsManager />;
}
