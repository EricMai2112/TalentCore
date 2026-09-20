"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Briefcase } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
} from "@dnd-kit/core";
import { Department, JobDescription, PipelineStage, JobStatus } from "@/src/features/job-description/types/job-description.types";
import { KanbanApplication } from "../types/kanban.types";
import { kanbanApi } from "../services/kanban.api";
import { useAuth } from "@/src/providers/AuthProvider";
import { UserRole } from "@/src/features/users/types/user.types";
import KanbanHeaderFilters from "./KanbanHeaderFilters";
import KanbanColumn from "./KanbanColumn";
import CandidateKanbanCard from "./CandidateKanbanCard";
import CandidateDetailModal from "@/src/features/candidates/components/CandidateDetailModal";

interface KanbanContainerProps {
  initialDepartments: Department[];
  initialJobs: JobDescription[];
  initialApplications: KanbanApplication[];
}

const DEFAULT_STAGES: PipelineStage[] = [
  { _id: "stage-1", name: "Mới ứng tuyển", color: "#6366f1", order: 1 },
  { _id: "stage-2", name: "Sàng lọc CV", color: "#f59e0b", order: 2 },
  { _id: "stage-3", name: "Phỏng vấn sơ loại", color: "#8b5cf6", order: 3 },
  { _id: "stage-4", name: "Phỏng vấn chuyên môn", color: "#3b82f6", order: 4 },
  { _id: "stage-5", name: "Đề nghị nhận việc", color: "#10b981", order: 5 },
];

export default function KanbanContainer({
  initialDepartments,
  initialJobs,
  initialApplications,
}: KanbanContainerProps) {
  const { user } = useAuth();
  const isDeptManager = user?.role === UserRole.DEPARTMENT_MANAGER;

  const userDeptId = useMemo(() => {
    if (!user?.departmentId) return "";
    return typeof user.departmentId === "string" ? user.departmentId : (user.departmentId as any)._id;
  }, [user]);

  // Selected filters state with safe initializers
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(() => {
    if (isDeptManager && userDeptId) return userDeptId;
    return initialDepartments.length > 0 ? initialDepartments[0]._id : "";
  });

  const [selectedJobId, setSelectedJobId] = useState<string>(() => {
    const defaultDeptId = (isDeptManager && userDeptId) || (initialDepartments.length > 0 ? initialDepartments[0]._id : "");
    if (defaultDeptId) {
      const deptJobs = initialJobs.filter((j) => {
        const dId = typeof j.departmentId === "object" ? j.departmentId?._id : j.departmentId;
        return dId === defaultDeptId && j.status === JobStatus.JD_CREATED;
      });
      if (deptJobs.length > 0) return deptJobs[0]._id;
    }
    return "";
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [scoreFilter, setScoreFilter] = useState<string>("all");

  // Real-time applications state
  const [applications, setApplications] = useState<KanbanApplication[]>(initialApplications);
  const [selectedCandidateApp, setSelectedCandidateApp] = useState<KanbanApplication | null>(null);
  const [activeApplication, setActiveApplication] = useState<KanbanApplication | null>(null);

  // dnd-kit sensors setup with pointer distance activation constraint
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Client mount state to prevent SSR hydration mismatch
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync department if user is manager and not set yet
  useEffect(() => {
    if (isDeptManager && userDeptId && selectedDepartmentId !== userDeptId) {
      setSelectedDepartmentId(userDeptId);
      const deptJobs = initialJobs.filter((j) => {
        const dId = typeof j.departmentId === "object" ? j.departmentId?._id : j.departmentId;
        return dId === userDeptId && j.status === JobStatus.JD_CREATED;
      });
      if (deptJobs.length > 0) {
        setSelectedJobId(deptJobs[0]._id);
      }
    }
  }, [isDeptManager, userDeptId, selectedDepartmentId, initialJobs]);

  // Handle department filter change
  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartmentId(deptId);
    if (!deptId) {
      setSelectedJobId("");
      return;
    }
    const deptJobs = initialJobs.filter((j) => {
      const dId = typeof j.departmentId === "object" ? j.departmentId?._id : j.departmentId;
      return dId === deptId && j.status === JobStatus.JD_CREATED;
    });
    setSelectedJobId(deptJobs.length > 0 ? deptJobs[0]._id : "");
  };

  // Fetch updated applications when filters change
  useEffect(() => {
    let isSubscribed = true;

    if (!selectedJobId) {
      setApplications([]);
      return;
    }

    const fetchKanban = async () => {
      try {
        const list = await kanbanApi.getKanbanApplications({
          departmentId: selectedDepartmentId || undefined,
          jobId: selectedJobId || undefined,
          search: searchQuery || undefined,
        });
        if (isSubscribed) {
          setApplications(list);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu Kanban:", err);
      }
    };

    fetchKanban();

    return () => {
      isSubscribed = false;
    };
  }, [selectedDepartmentId, selectedJobId, searchQuery]);

  // Determine active pipeline stages from selected JD's pipeline template
  const activeStages = useMemo(() => {
    if (selectedJobId) {
      const matchedJob = initialJobs.find((j) => j._id === selectedJobId);
      if (
        matchedJob &&
        typeof matchedJob.pipelineTemplateId === "object" &&
        matchedJob.pipelineTemplateId?.stages?.length
      ) {
        return matchedJob.pipelineTemplateId.stages.map((s, idx) => ({
          ...s,
          order: s.order || idx + 1,
        }));
      }
    }
    return DEFAULT_STAGES;
  }, [selectedJobId, initialJobs]);

  // Filter applications by score threshold
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (scoreFilter !== "all") {
        const minScore = Number(scoreFilter);
        const score = app.aiFitScore || 80;
        if (score < minScore) return false;
      }
      return true;
    });
  }, [applications, scoreFilter]);

  // Group applications by stageId and sort by score & evidence
  const applicationsByStage = useMemo(() => {
    const map = new Map<string, KanbanApplication[]>();
    activeStages.forEach((stg) => {
      if (stg._id) map.set(stg._id, []);
    });

    filteredApplications.forEach((app) => {
      const firstStageId = activeStages[0]?._id || "";
      const sId = app.currentStageId || firstStageId;
      if (map.has(sId)) {
        map.get(sId)!.push(app);
      } else {
        if (firstStageId) {
          if (!map.has(firstStageId)) map.set(firstStageId, []);
          map.get(firstStageId)!.push(app);
        }
      }
    });

    // Sort apps in each column
    const sortApps = (a: KanbanApplication, b: KanbanApplication) => {
      const scoreA = a.aiFitScore !== null && a.aiFitScore !== undefined ? a.aiFitScore : -1;
      const scoreB = b.aiFitScore !== null && b.aiFitScore !== undefined ? b.aiFitScore : -1;

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      const evidenceA = a.evidenceStrengthScore ?? a.aiEvaluation?.evidenceStrengthScore ?? 0;
      const evidenceB = b.evidenceStrengthScore ?? b.aiEvaluation?.evidenceStrengthScore ?? 0;

      if (evidenceB !== evidenceA) {
        return evidenceB - evidenceA;
      }

      const timeA = new Date(a.appliedAt || 0).getTime();
      const timeB = new Date(b.appliedAt || 0).getTime();
      return timeB - timeA;
    };

    map.forEach((list) => {
      list.sort(sortApps);
    });

    return map;
  }, [filteredApplications, activeStages]);

  // Handle Drag Start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = applications.find((a) => a._id === active.id);
    if (found) setActiveApplication(found);
  };

  // Handle Drag End
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveApplication(null);
    if (!over) return;

    const appId = String(active.id);
    const overId = String(over.id);

    // Over item can be a stage ID or an application ID inside a column
    let targetStageId = overId;
    const overApp = applications.find((a) => a._id === overId);
    if (overApp) {
      targetStageId = overApp.currentStageId;
    }

    const currentApp = applications.find((a) => a._id === appId);
    if (!currentApp || currentApp.currentStageId === targetStageId) return;

    // Optimistic UI Update
    setApplications((prev) =>
      prev.map((app) =>
        app._id === appId ? { ...app, currentStageId: targetStageId } : app
      )
    );

    try {
      await kanbanApi.updateApplicationStage(appId, targetStageId);
    } catch (err) {
      console.error("Lỗi cập nhật giai đoạn phỏng vấn:", err);
      // Revert if API fails
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, currentStageId: currentApp.currentStageId } : app
        )
      );
    }
  };

  // Handle Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setScoreFilter("all");
    if (!isDeptManager) {
      const defaultDeptId = initialDepartments.length > 0 ? initialDepartments[0]._id : "";
      setSelectedDepartmentId(defaultDeptId);
      if (defaultDeptId) {
        const deptJobs = initialJobs.filter((j) => {
          const dId = typeof j.departmentId === "object" ? j.departmentId?._id : j.departmentId;
          return dId === defaultDeptId && j.status === JobStatus.JD_CREATED;
        });
        setSelectedJobId(deptJobs.length > 0 ? deptJobs[0]._id : "");
      } else {
        setSelectedJobId("");
      }
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Filters Bar with CustomInput and CustomSelect */}
      <KanbanHeaderFilters
        totalCount={filteredApplications.length}
        departments={initialDepartments}
        jobs={initialJobs}
        selectedDepartmentId={selectedDepartmentId}
        selectedJobId={selectedJobId}
        searchQuery={searchQuery}
        scoreFilter={scoreFilter}
        onDepartmentChange={handleDepartmentChange}
        onJobChange={setSelectedJobId}
        onSearchChange={setSearchQuery}
        onScoreFilterChange={setScoreFilter}
        onResetFilters={handleResetFilters}
      />

      {!selectedJobId ? (
        /* Empty State Placeholder when No Position Selected */
        <div className="w-full bg-white/20 border-2 border-slate-300/80 shadow-xl rounded-3xl p-16 flex flex-col items-center justify-center text-center space-y-4 backdrop-blur-md">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-200/60 flex items-center justify-center text-[#3B82F6] shadow-2xs">
            <Briefcase size={32} />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-lg font-black text-slate-900">Vui lòng chọn Vị trí tuyển dụng</h3>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              Bảng Kanban hiển thị ứng viên và quy trình phỏng vấn theo từng vị trí cụ thể của phòng ban. Vui lòng chọn vị trí ở bộ lọc trên.
            </p>
          </div>
        </div>
      ) : isMounted ? (
        /* @dnd-kit DndContext Board */
        <DndContext
          id="kanban-dnd-board"
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Horizontal Scrollable Kanban Board Columns Container */}
          <div className="w-full overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-300/60">
            <div className="flex items-stretch gap-4 min-w-max">
              {activeStages.map((stage) => (
                <KanbanColumn
                  key={stage._id || stage.name}
                  stage={stage}
                  applications={applicationsByStage.get(stage._id || "") || []}
                  onSelectCandidate={setSelectedCandidateApp}
                />
              ))}
            </div>
          </div>

          {/* DragOverlay for Smooth Floating Preview (Portaled directly to document.body to bypass layout backdrop-blur containing block) */}
          {isMounted && typeof window !== "undefined" && createPortal(
            <DragOverlay dropAnimation={null}>
              {activeApplication ? (
                <CandidateKanbanCard
                  application={activeApplication}
                  isOverlay
                />
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      ) : (
        /* Fallback SSR render before client hydration */
        <div className="w-full overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-300/60">
          <div className="flex items-stretch gap-4 min-w-max">
            {activeStages.map((stage) => (
              <KanbanColumn
                key={stage._id || stage.name}
                stage={stage}
                applications={applicationsByStage.get(stage._id || "") || []}
                onSelectCandidate={setSelectedCandidateApp}
              />
            ))}
          </div>
        </div>
      )}

      {/* Candidate Quick Detail Modal */}
      <CandidateDetailModal
        application={selectedCandidateApp}
        onClose={() => setSelectedCandidateApp(null)}
      />
    </div>
  );
}
