import EmailManager from "@/src/features/email-ai/components/EmailManager";
import { emailAiApi } from "@/src/features/email-ai/services/email-ai.api";
import { EmailTemplate } from "@/src/features/email-ai/types/email-ai.types";

export const revalidate = 0; // Luôn fetch dữ liệu mới nhất (no cache)

export default async function EmailAiPage() {
  let templates: EmailTemplate[] = [];
  try {
    templates = await emailAiApi.getTemplates();
  } catch (error) {
    console.error("Lỗi khi tải danh sách email templates server-side:", error);
  }

  return (
    <div className="space-y-6">
      <EmailManager initialTemplates={templates} />
    </div>
  );
}
