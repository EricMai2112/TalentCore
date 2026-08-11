import PipelineManager from "@/src/features/pipeline/components/PipelineManager";
import { pipelineApi } from "@/src/features/pipeline/services/pipeline.api";
import { PipelineTemplate } from "@/src/features/pipeline/types/pipeline.types";

export const revalidate = 0; // Luôn fetch dữ liệu mới nhất (no cache)

export default async function PipelinePage() {
  let templates: PipelineTemplate[] = [];

  try {
    templates = await pipelineApi.getTemplates();
  } catch (error) {
    console.error("Lỗi khi tải danh sách pipeline templates server-side:", error);
  }

  return (
    <div className="space-y-6">
      <PipelineManager initialTemplates={templates} />
    </div>
  );
}

