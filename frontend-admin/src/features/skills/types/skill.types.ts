// ── Skill ─────────────────────────────────────────────────────────────────

export interface Skill {
  _id: string;
  name: string;
  aliases: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSkillDto {
  name: string;
  aliases?: string[];
}

// ── Position (populated) ───────────────────────────────────────────────────

export interface PositionDeptRef {
  _id: string;
  name: string;
  code: string;
}

export interface PositionWithSkills {
  _id: string;
  name: string;
  departmentId: PositionDeptRef;
  skillIds: Skill[];          // populated
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionDto {
  name: string;
  departmentId: string;
}

export interface UpdatePositionDto {
  name?: string;
  departmentId?: string;
}

// ── Department (lightweight, for selects) ─────────────────────────────────

export interface DeptOption {
  _id: string;
  name: string;
  code: string;
}

// ── Grouped view (built client-side from PositionWithSkills[]) ────────────

export interface DepartmentSkillGroup {
  deptId: string;
  deptName: string;
  positions: PositionWithSkills[];
  totalPositions: number;
  totalSkills: number;
}

/** Build department groups from a flat positions array */
export function buildDepartmentGroups(
  positions: PositionWithSkills[],
): DepartmentSkillGroup[] {
  const map = new Map<string, DepartmentSkillGroup>();

  for (const pos of positions) {
    const dept = pos.departmentId;
    if (!dept?._id) continue;

    if (!map.has(dept._id)) {
      map.set(dept._id, {
        deptId: dept._id,
        deptName: dept.name,
        positions: [],
        totalPositions: 0,
        totalSkills: 0,
      });
    }

    const group = map.get(dept._id)!;
    group.positions.push(pos);
    group.totalPositions += 1;
    group.totalSkills += pos.skillIds.length;
  }

  // Sort groups alphabetically
  return Array.from(map.values()).sort((a, b) =>
    a.deptName.localeCompare(b.deptName),
  );
}
