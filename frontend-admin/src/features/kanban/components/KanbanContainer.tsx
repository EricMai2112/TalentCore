"use client";

import { useState, useEffect, useMemo } from "react";
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
import { io, Socket } from "socket.io-client";
import { KanbanApplication } from "../types/kanban.types";
import { kanbanApi } from "../services/kanban.api";
import { useAuth } from "@/src/providers/AuthProvider";
import { UserRole } from "@/src/features/users/types/user.types";
import KanbanHeaderFilters from "./KanbanHeaderFilters";
import KanbanColumn from "./KanbanColumn";
import CandidateKanbanCard from "./CandidateKanbanCard";
import CandidateDetailModal from "./CandidateDetailModal";

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

  // dnd-kit sensors setup
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

  // Real-time WebSocket Listener for New Applications & AI Updates
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    const socket: Socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to TalentCore Realtime Socket:', socket.id);
    });

    socket.on('new_application', (newApp: KanbanApplication) => {
      console.log('⚡ Realtime Event: Candidate Applied!', newApp);

      const appJobId = typeof newApp.jobDescriptionId === 'object' 
        ? newApp.jobDescriptionId?._id 
        : newApp.jobDescriptionId;

      if (!selectedJobId || appJobId === selectedJobId) {
        setApplications((prev) => {
          const exists = prev.some((a) => a._id === newApp._id);
          if (exists) {
            return prev.map((a) => (a._id === newApp._id ? { ...a, ...newApp } : a));
          }
          return [newApp, ...prev];
        });
      }
    });

    socket.on('application_updated', (updatedApp: KanbanApplication) => {
      console.log('⚡ Realtime Event: Application Updated (AI Fit Score / Stage)!', updatedApp);

      setApplications((prev) => {
        return prev.map((a) => (a._id === updatedApp._id ? { ...a, ...updatedApp } : a));
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedJobId]);

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

  // Group applications by stageId
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

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header Filters Bar */}
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
      />

      {!selectedJobId ? (
        /* Empty State Placeholder when No Position Selected */
        <div className="w-full bg-white border border-gray-100 rounded-3xl p-16 flex flex-col items-center justify-center text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Briefcase size={30} />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-lg font-extrabold text-gray-900">Vui lòng chọn Vị trí tuyển dụng</h3>
            <p className="text-xs font-medium text-gray-500 leading-relaxed">
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
          <div className="w-full overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-200">
            <div className="flex items-start gap-4 min-w-max">
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

          {/* DragOverlay for Smooth Floating Preview */}
          <DragOverlay>
            {activeApplication ? (
              <CandidateKanbanCard
                application={activeApplication}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        /* Fallback SSR render before client hydration */
        <div className="w-full overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-200">
          <div className="flex items-start gap-4 min-w-max">
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
