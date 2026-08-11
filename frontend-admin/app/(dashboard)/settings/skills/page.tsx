import SkillManager from "@/src/features/skills/components/SkillManager";
import { skillApi, positionApi, deptOptionApi } from "@/src/features/skills/services/skill.api";
import { Skill, PositionWithSkills, DeptOption } from "@/src/features/skills/types/skill.types";

export const revalidate = 0;

export default async function SkillsPage() {
  let positions: PositionWithSkills[] = [];
  let allSkills: Skill[] = [];
  let departments: DeptOption[] = [];

  try {
    [positions, allSkills, departments] = await Promise.all([
      positionApi.getWithSkills(),
      skillApi.getAll(),
      deptOptionApi.getAll(),
    ]);
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu skills server-side:", error);
  }

  return (
    <div className="space-y-6">
      <SkillManager
        initialPositions={positions}
        initialSkills={allSkills}
        initialDepartments={departments}
      />
    </div>
  );
}
