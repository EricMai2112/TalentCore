"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
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
import { interviewsApi } from "@/src/features/interviews/services/interviews.api";
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

  // Carousel 4-stages-per-page state
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragHoverEdgeRef = useRef<"left" | "right" | null>(null);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [edgeActive, setEdgeActive] = useState<"left" | "right" | null>(null);

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

  // Max carousel index (ensures 4 stages fit without screen scroll)
  const maxCarouselIndex = useMemo(
    () => Math.max(0, activeStages.length - 4),
    [activeStages.length]
  );

  // Reset carousel index when switching positions/jobs
  useEffect(() => {
    setCarouselIndex(0);
  }, [selectedJobId]);

  // Keep carousel index in valid range
  useEffect(() => {
    if (carouselIndex > maxCarouselIndex) {
      setCarouselIndex(maxCarouselIndex);
    }
  }, [maxCarouselIndex, carouselIndex]);

  const handlePrev = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCarouselIndex((prev) => Math.min(maxCarouselIndex, prev + 1));
  };

  // Calculated width for exactly 4 columns per view without horizontal scrolling
  const columnWidthStyle = useMemo(() => {
    if (activeStages.length < 4) {
      return `calc((100% - ${(activeStages.length - 1) * 16}px) / ${activeStages.length})`;
    }
    return "calc((100% - 48px) / 4)";
  }, [activeStages.length]);

  // Global window pointer listener: Automatically slide carousel when dragging candidate near board edges
  useEffect(() => {
    if (!activeApplication || maxCarouselIndex <= 0) {
      dragHoverEdgeRef.current = null;
      setEdgeActive(null);
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
      return;
    }

    const clearTimers = () => {
      if (slideTimerRef.current) {
        clearTimeout(slideTimerRef.current);
        slideTimerRef.current = null;
      }
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
        slideIntervalRef.current = null;
      }
      dragHoverEdgeRef.current = null;
      setEdgeActive(null);
    };

    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      // Check vertical tolerance within board container
      if (y < rect.top - 80 || y > rect.bottom + 80) {
        clearTimers();
        return;
      }

      const edgeZone = 120; // 120px zone near container borders

      // Right edge detection
      if (x >= rect.right - edgeZone) {
        if (dragHoverEdgeRef.current !== "right") {
          clearTimers();
          dragHoverEdgeRef.current = "right";
          setEdgeActive("right");
          slideTimerRef.current = setTimeout(() => {
            setCarouselIndex((prev) => Math.min(maxCarouselIndex, prev + 1));
            slideIntervalRef.current = setInterval(() => {
              setCarouselIndex((prev) => Math.min(maxCarouselIndex, prev + 1));
            }, 600);
          }, 250);
        }
      }
      // Left edge detection
      else if (x <= rect.left + edgeZone) {
        if (dragHoverEdgeRef.current !== "left") {
          clearTimers();
          dragHoverEdgeRef.current = "left";
          setEdgeActive("left");
          slideTimerRef.current = setTimeout(() => {
            setCarouselIndex((prev) => Math.max(0, prev - 1));
            slideIntervalRef.current = setInterval(() => {
              setCarouselIndex((prev) => Math.max(0, prev - 1));
            }, 600);
          }, 250);
        }
      } else {
        if (dragHoverEdgeRef.current !== null) {
          clearTimers();
        }
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("mousemove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousemove", handlePointerMove);
      clearTimers();
    };
  }, [activeApplication, maxCarouselIndex]);

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

  // Shared handler for moving application to another stage (via drag or quick action buttons)
  const handleMoveStage = async (appId: string, targetStageId: string) => {
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

      // Check if targetStage is Department Review / Phỏng vấn chuyên môn / Đánh giá phòng ban
      const targetStage = activeStages.find((s) => s._id === targetStageId);
      const stageLower = (targetStage?.name || targetStageId).toLowerCase();
      if (
        stageLower.includes("department") ||
        stageLower.includes("phòng ban") ||
        stageLower.includes("chuyên môn") ||
        stageLower.includes("đánh giá")
      ) {
        // Automatically request department schedule so interview document is created and visible to Dept Manager
        await interviewsApi.requestDeptSchedule(appId);
      }
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

  // Handle Drag End
  const handleDragEnd = async (event: DragEndEvent) => {
    if (slideTimerRef.current) {
      clearTimeout(slideTimerRef.current);
      slideTimerRef.current = null;
    }
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
      slideIntervalRef.current = null;
    }
    dragHoverEdgeRef.current = null;
    setEdgeActive(null);

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

    await handleMoveStage(appId, targetStageId);
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
      {/* Header Filters Bar with CustomInput, CustomSelect and Right-Aligned Carousel Controls */}
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
        rightSection={
          maxCarouselIndex > 0 ? (
            <div className="flex items-center gap-3">
              {/* Dot Page Indicator */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: maxCarouselIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCarouselIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      carouselIndex === idx
                        ? "w-6 bg-indigo-600"
                        : "w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                    title={`Trang ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={carouselIndex === 0}
                  onClick={handlePrev}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    carouselIndex === 0
                      ? "bg-white/40 text-slate-300 border-white/60 cursor-not-allowed"
                      : "bg-white text-slate-700 border-white/80 hover:bg-white hover:text-indigo-600 shadow-2xs active:scale-95"
                  }`}
                  title="Xem các giai đoạn trước"
                >
                  <ChevronLeft size={15} />
                  <span>Trước</span>
                </button>

                <button
                  type="button"
                  disabled={carouselIndex >= maxCarouselIndex}
                  onClick={handleNext}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    carouselIndex >= maxCarouselIndex
                      ? "bg-white/40 text-slate-300 border-white/60 cursor-not-allowed"
                      : "bg-white text-slate-700 border-white/80 hover:bg-white hover:text-indigo-600 shadow-2xs active:scale-95"
                  }`}
                  title="Xem các giai đoạn tiếp theo"
                >
                  <span>Tiếp</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          ) : null
        }
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

          {/* Carousel Viewport Container (No Horizontal Scrollbar, 4 Stages Fitted) */}
          <div ref={containerRef} className="relative w-full overflow-hidden rounded-3xl pb-2">
            {/* Floating Prev Button (Left) */}
            {maxCarouselIndex > 0 && carouselIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className={`absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full backdrop-blur-md shadow-lg border flex items-center justify-center transition-all cursor-pointer group ${
                  edgeActive === "left"
                    ? "bg-indigo-600 text-white border-indigo-400 scale-125 shadow-xl shadow-indigo-500/50 ring-4 ring-indigo-200"
                    : "bg-white/95 text-gray-700 border-gray-200 hover:text-indigo-600 hover:scale-110 active:scale-95"
                }`}
                title="Giai đoạn trước"
              >
                <ChevronLeft size={22} className={`transition-transform ${edgeActive === "left" ? "animate-pulse" : "group-hover:-translate-x-0.5"}`} />
              </button>
            )}

            {/* Floating Next Button (Right) */}
            {maxCarouselIndex > 0 && carouselIndex < maxCarouselIndex && (
              <button
                type="button"
                onClick={handleNext}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full backdrop-blur-md shadow-lg border flex items-center justify-center transition-all cursor-pointer group ${
                  edgeActive === "right"
                    ? "bg-indigo-600 text-white border-indigo-400 scale-125 shadow-xl shadow-indigo-500/50 ring-4 ring-indigo-200"
                    : "bg-white/95 text-gray-700 border-gray-200 hover:text-indigo-600 hover:scale-110 active:scale-95"
                }`}
                title="Giai đoạn sau"
              >
                <ChevronRight size={22} className={`transition-transform ${edgeActive === "right" ? "animate-pulse" : "group-hover:translate-x-0.5"}`} />
              </button>
            )}

            {/* Sliding Flex Track */}
            <div
              className="flex items-stretch gap-4 transition-transform duration-300 ease-in-out w-full"
              style={{
                transform:
                  maxCarouselIndex > 0
                    ? `translateX(calc(-${carouselIndex * 25}% - ${carouselIndex * 4}px))`
                    : "none",
              }}
            >
              {activeStages.map((stage) => (
                <KanbanColumn
                  key={stage._id || stage.name}
                  stage={stage}
                  stages={activeStages}
                  applications={applicationsByStage.get(stage._id || "") || []}
                  onSelectCandidate={setSelectedCandidateApp}
                  onMoveStage={handleMoveStage}
                  style={{ width: columnWidthStyle }}
                />
              ))}
            </div>
          </div>

          {/* DragOverlay for Smooth Floating Preview (Portaled directly to document.body to bypass layout backdrop-blur containing block) */}
          {isMounted && typeof window !== "undefined" && createPortal(
            <DragOverlay dropAnimation={null}>
              {activeApplication ? (
                <div className="w-[335px]">
                  <CandidateKanbanCard
                    application={activeApplication}
                    stages={activeStages}
                    isOverlay
                  />
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      ) : (
        /* Fallback SSR render before client hydration */
        <div className="relative w-full overflow-hidden rounded-3xl pb-2">
          <div className="flex items-stretch gap-4 w-full">
            {activeStages.slice(0, 4).map((stage) => (
              <KanbanColumn
                key={stage._id || stage.name}
                stage={stage}
                stages={activeStages}
                applications={applicationsByStage.get(stage._id || "") || []}
                onSelectCandidate={setSelectedCandidateApp}
                onMoveStage={handleMoveStage}
                style={{ width: columnWidthStyle }}
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
