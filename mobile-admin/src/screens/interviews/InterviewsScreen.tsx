import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  adminService,
  InterviewItem,
  DepartmentItem,
  StaffUser,
  CandidateApplication,
} from '../../services/admin.services';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../features/auth/types/auth.types';
import CustomSelect from '../../components/common/CustomSelect';
import CustomPagination from '../../components/common/CustomPagination';
import InterviewStatCards from './components/InterviewStatCards';
import InterviewWorkflowBadge, { InterviewResultBadge } from './components/InterviewWorkflowBadge';
import InterviewCalendarMobileView from './components/InterviewCalendarMobileView';
import DeptScheduleModal from './components/DeptScheduleModal';
import HrApproveScheduleModal from './components/HrApproveScheduleModal';
import ApproveInterviewCancelModal from './components/ApproveInterviewCancelModal';
import InterviewEvaluationModal from './components/InterviewEvaluationModal';
import CandidateDetailModal from '../recruitment/components/CandidateDetailModal';
import RejectCandidateModal from '../recruitment/components/RejectCandidateModal';

// Helper: Filter by time tab
function isMatchingTimeTab(
  itemDateStr?: string,
  tab: 'ALL' | 'TODAY' | 'THIS_WEEK' | 'NEXT_WEEK' = 'ALL',
  todayISO?: string
): boolean {
  if (tab === 'ALL' || !itemDateStr) return true;
  const d = new Date(itemDateStr);
  if (isNaN(d.getTime())) return true;
  const dStr = d.toISOString().split('T')[0];

  if (tab === 'TODAY') {
    return dStr === (todayISO ?? new Date().toISOString().split('T')[0]);
  }

  const curr = new Date();
  const dayOfWeek = curr.getDay() === 0 ? 7 : curr.getDay(); // Mon = 1, Sun = 7

  const mondayThisWeek = new Date(curr);
  mondayThisWeek.setDate(curr.getDate() - dayOfWeek + 1);
  mondayThisWeek.setHours(0, 0, 0, 0);

  const sundayThisWeek = new Date(mondayThisWeek);
  sundayThisWeek.setDate(mondayThisWeek.getDate() + 6);
  sundayThisWeek.setHours(23, 59, 59, 999);

  if (tab === 'THIS_WEEK') {
    return d >= mondayThisWeek && d <= sundayThisWeek;
  }

  const mondayNextWeek = new Date(mondayThisWeek);
  mondayNextWeek.setDate(mondayThisWeek.getDate() + 7);

  const sundayNextWeek = new Date(sundayThisWeek);
  sundayNextWeek.setDate(sundayThisWeek.getDate() + 7);

  if (tab === 'NEXT_WEEK') {
    return d >= mondayNextWeek && d <= sundayNextWeek;
  }

  return true;
}

export const InterviewsScreen: React.FC = () => {
  const { user } = useAuth();
  const roleStr = user?.role as string | undefined;
  const isHrAdmin = roleStr === UserRole.HR_ADMIN || roleStr === 'HR_ADMIN' || roleStr === 'ADMIN';
  const isDeptManager =
    roleStr === UserRole.DEPARTMENT_MANAGER || roleStr === 'DEPARTMENT_MANAGER';
  const isEmployee = roleStr === UserRole.EMPLOYEE || roleStr === 'EMPLOYEE';
  const userDeptId =
    typeof user?.departmentId === 'object' && user?.departmentId !== null
      ? (user.departmentId as any)._id
      : user?.departmentId;

  // View sub-tab: List view vs Google Calendar view
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'calendar'>('list');

  // Main list data
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>(
    (isDeptManager || isEmployee) && userDeptId ? userDeptId : 'ALL'
  );
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [timeTabFilter, setTimeTabFilter] = useState<'ALL' | 'TODAY' | 'THIS_WEEK' | 'NEXT_WEEK'>(
    'ALL'
  );
  const [selectedStat, setSelectedStat] = useState<string>('all');

  // Pagination for List View
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const scrollViewRef = useRef<ScrollView>(null);

  // Modals state
  const [deptScheduleInterview, setDeptScheduleInterview] = useState<InterviewItem | null>(null);
  const [hrApproveInterview, setHrApproveInterview] = useState<InterviewItem | null>(null);
  const [cancelApproveInterview, setCancelApproveInterview] = useState<InterviewItem | null>(null);
  const [evaluatingInterview, setEvaluatingInterview] = useState<InterviewItem | null>(null);
  const [detailCandidate, setDetailCandidate] = useState<CandidateApplication | null>(null);
  const [rejectingCandidate, setRejectingCandidate] = useState<CandidateApplication | null>(null);

  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Fetch all initial data
  const fetchData = useCallback(async () => {
    try {
      const [interviewData, deptData, employeeData] = await Promise.all([
        adminService.getInterviews(),
        adminService.getDepartments().catch(() => []),
        adminService.getEmployees().catch(() => []),
      ]);
      setInterviews(interviewData || []);
      setDepartments(deptData || []);
      setStaffList(employeeData || []);
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu phỏng vấn:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDept, selectedPosition, selectedStatus, timeTabFilter, selectedStat]);

  // Dynamic positions options based on current interviews & active department filter
  const availablePositions = useMemo(() => {
    const set = new Set<string>();
    interviews.forEach((item) => {
      const deptId =
        typeof item.jobDescriptionId === 'object' && item.jobDescriptionId?.departmentId
          ? typeof item.jobDescriptionId.departmentId === 'object'
            ? (item.jobDescriptionId.departmentId as any)._id
            : item.jobDescriptionId.departmentId
          : null;

      if (!selectedDept || selectedDept === 'ALL' || deptId === selectedDept) {
        const title =
          typeof item.jobDescriptionId === 'object' ? item.jobDescriptionId?.title : null;
        if (title) set.add(title);
      }
    });
    return Array.from(set).sort();
  }, [interviews, selectedDept]);

  // Base filtering (Search, Dept, Position, Workflow Status, Role scoping)
  const baseFilteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      const itemDeptId =
        typeof item.jobDescriptionId === 'object' && item.jobDescriptionId?.departmentId
          ? typeof item.jobDescriptionId.departmentId === 'object'
            ? (item.jobDescriptionId.departmentId as any)._id
            : item.jobDescriptionId.departmentId
          : null;

      const itemInterviewerId =
        typeof item.interviewerId === 'object' ? item.interviewerId?._id : item.interviewerId;

      // 1. Role Scope Filter
      if (isDeptManager) {
        if (userDeptId && itemDeptId !== userDeptId) return false;
      } else if (isEmployee) {
        const isAssigned =
          itemInterviewerId === user?._id || itemInterviewerId === (user as any)?.id;
        if (!isAssigned) return false;
      }

      // 2. Department Filter
      if (selectedDept && selectedDept !== 'ALL') {
        if (itemDeptId !== selectedDept) return false;
      }

      // 3. Position Filter
      if (selectedPosition && selectedPosition !== 'ALL') {
        const jobTitle =
          typeof item.jobDescriptionId === 'object' ? item.jobDescriptionId?.title : '';
        if (jobTitle !== selectedPosition) return false;
      }

      // 4. Workflow Status Filter
      if (selectedStatus && selectedStatus !== 'ALL') {
        const confirmationStatus = item.confirmationStatus;
        const status = item.status;

        switch (selectedStatus) {
          case 'WAITING_DEPT_SCHEDULE':
            if (confirmationStatus !== 'WAITING_DEPT_SCHEDULE') return false;
            break;
          case 'WAITING_HR_APPROVAL':
            if (confirmationStatus !== 'WAITING_HR_APPROVAL') return false;
            break;
          case 'SCHEDULED':
            if (
              confirmationStatus !== 'SCHEDULED' &&
              !(status === 'SCHEDULED' && !confirmationStatus)
            )
              return false;
            break;
          case 'CONFIRMED':
          case 'UPCOMING':
            if (confirmationStatus !== 'CONFIRMED' && status !== 'UPCOMING') return false;
            break;
          case 'IN_PROGRESS':
            if (status !== 'IN_PROGRESS') return false;
            break;
          case 'COMPLETED':
            if (status !== 'COMPLETED') return false;
            break;
          case 'CANCELLED':
          case 'REJECTED':
            if (
              status !== 'CANCELLED' &&
              confirmationStatus !== 'CANCELLED' &&
              confirmationStatus !== 'REJECTED' &&
              confirmationStatus !== 'CANCEL_REQUESTED'
            )
              return false;
            break;
          default:
            if (status !== selectedStatus && confirmationStatus !== selectedStatus) return false;
            break;
        }
      }

      // 5. KPI Stat Card Quick Filter
      if (selectedStat === 'today') {
        const itemDateStr = item.date ? new Date(item.date).toISOString().split('T')[0] : '';
        if (itemDateStr !== todayISO) return false;
      } else if (selectedStat === 'pending') {
        if (
          item.confirmationStatus !== 'WAITING_DEPT_SCHEDULE' &&
          item.confirmationStatus !== 'WAITING_HR_APPROVAL'
        )
          return false;
      } else if (selectedStat === 'confirmed') {
        if (
          item.confirmationStatus !== 'CONFIRMED' &&
          item.confirmationStatus !== 'SCHEDULED' &&
          item.status !== 'SCHEDULED'
        )
          return false;
      } else if (selectedStat === 'action_needed') {
        if (
          item.confirmationStatus !== 'RESCHEDULE_REQUESTED' &&
          item.confirmationStatus !== 'CANCEL_REQUESTED' &&
          !item.isEscalated
        )
          return false;
      }

      // 6. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const candName =
          typeof item.candidateId === 'object'
            ? (item.candidateId?.fullName || item.candidateId?.name || '').toLowerCase()
            : '';
        const jobTitle =
          typeof item.jobDescriptionId === 'object'
            ? (item.jobDescriptionId?.title || '').toLowerCase()
            : '';
        const interviewerName =
          typeof item.interviewerId === 'object'
            ? (item.interviewerId?.name || item.interviewerId?.email || '').toLowerCase()
            : '';

        const matches =
          candName.includes(q) || jobTitle.includes(q) || interviewerName.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [
    interviews,
    isDeptManager,
    isEmployee,
    userDeptId,
    user,
    selectedDept,
    selectedPosition,
    selectedStatus,
    selectedStat,
    searchQuery,
    todayISO,
  ]);

  // Tab counts for time tabs
  const tabCounts = useMemo(() => {
    return {
      all: baseFilteredInterviews.length,
      today: baseFilteredInterviews.filter((i) => isMatchingTimeTab(i.date, 'TODAY', todayISO))
        .length,
      thisWeek: baseFilteredInterviews.filter((i) =>
        isMatchingTimeTab(i.date, 'THIS_WEEK', todayISO)
      ).length,
      nextWeek: baseFilteredInterviews.filter((i) =>
        isMatchingTimeTab(i.date, 'NEXT_WEEK', todayISO)
      ).length,
    };
  }, [baseFilteredInterviews, todayISO]);

  // Final filtered interviews (applying time tab in list view)
  const finalInterviews = useMemo(() => {
    return baseFilteredInterviews
      .filter((item) => isMatchingTimeTab(item.date, timeTabFilter, todayISO))
      .sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.date || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.date || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
  }, [baseFilteredInterviews, timeTabFilter, todayISO]);

  // Pagination slicing
  const totalPages = Math.ceil(finalInterviews.length / pageSize);
  const paginatedInterviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return finalInterviews.slice(start, start + pageSize);
  }, [finalInterviews, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    if (!isDeptManager && !isEmployee) {
      setSelectedDept('ALL');
    }
    setSelectedPosition('ALL');
    setSelectedStatus('ALL');
    setTimeTabFilter('ALL');
    setSelectedStat('all');
  };

  const formatSchedule = (dateStr?: string, start?: string, end?: string) => {
    if (!dateStr) return 'Chưa xếp lịch';
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const timePart = start && end ? `${start} - ${end}` : start || '';
      return `${timePart ? timePart + ' • ' : ''}${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const handleOpenMeet = (link?: string) => {
    if (!link) {
      Alert.alert('Thông báo', 'Cuộc hẹn này không có liên kết trực tuyến.');
      return;
    }
    Linking.openURL(link).catch(() => {
      Alert.alert('Lỗi', 'Không thể mở liên kết phòng họp.');
    });
  };

  const handleOpenCandidateDetail = (item: InterviewItem) => {
    const appId =
      typeof item.applicationId === 'object' ? item.applicationId?._id : item.applicationId;

    const candApp: CandidateApplication = {
      _id: appId || item._id,
      candidateId: item.candidateId,
      jobDescriptionId: item.jobDescriptionId as any,
      stageName: item.status,
      currentStageId: '',
      appliedAt: item.date || new Date().toISOString(),
    };
    setDetailCandidate(candApp);
  };

  const getCandidateInitials = (name?: string) => {
    if (!name) return 'UV';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <View style={styles.container}>
      {/* ─── 1. TOP TOOLBAR: SEARCH & SELECT FILTERS ─── */}
      <View style={styles.topFilterBar}>
        {/* Search Input */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={17} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo ứng viên, người phỏng vấn..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* 3 Select Dropdowns & Reset Button */}
        <View style={styles.filterRow}>
          <CustomSelect
            value={selectedDept}
            onChange={(val) => {
              setSelectedDept(val);
              setSelectedPosition('ALL');
            }}
            options={[
              ...(!isDeptManager && !isEmployee
                ? [{ value: 'ALL', label: 'Tất cả phòng ban' }]
                : []),
              ...departments.map((d) => ({ value: d._id, label: d.name })),
            ]}
            placeholder="Phòng ban"
            disabled={isDeptManager || isEmployee}
            containerStyle={styles.subFilterCol}
          />

          <CustomSelect
            value={selectedPosition}
            onChange={(val) => setSelectedPosition(val)}
            options={[
              { value: 'ALL', label: 'Tất cả vị trí' },
              ...availablePositions.map((pos) => ({ value: pos, label: pos })),
            ]}
            placeholder="Vị trí"
            containerStyle={styles.subFilterCol}
          />

          <CustomSelect
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'WAITING_DEPT_SCHEDULE', label: 'Chờ TP xếp lịch' },
              { value: 'WAITING_HR_APPROVAL', label: 'Chờ HR duyệt' },
              { value: 'SCHEDULED', label: 'Đã lên lịch (Chờ UV)' },
              { value: 'CONFIRMED', label: 'Sắp diễn ra' },
              { value: 'IN_PROGRESS', label: 'Đang diễn ra' },
              { value: 'COMPLETED', label: 'Hoàn thành' },
              { value: 'CANCELLED', label: 'Đã hủy / Từ chối' },
            ]}
            placeholder="Trạng thái"
            containerStyle={styles.subFilterCol}
            align="right"
          />

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleResetFilters}
            activeOpacity={0.75}
            accessibilityLabel="Đặt lại bộ lọc"
          >
            <Ionicons name="refresh" size={15} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Sub-tab Switcher: Danh sách vs Lịch phỏng vấn */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabSwitchBtn, activeSubTab === 'list' && styles.tabSwitchBtnActive]}
            onPress={() => setActiveSubTab('list')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="list"
              size={15}
              color={activeSubTab === 'list' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={[
                styles.tabSwitchBtnText,
                activeSubTab === 'list' && styles.tabSwitchBtnTextActive,
              ]}
            >
              Danh sách ({finalInterviews.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabSwitchBtn, activeSubTab === 'calendar' && styles.tabSwitchBtnActive]}
            onPress={() => setActiveSubTab('calendar')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar"
              size={15}
              color={activeSubTab === 'calendar' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={[
                styles.tabSwitchBtnText,
                activeSubTab === 'calendar' && styles.tabSwitchBtnTextActive,
              ]}
            >
              Lịch phỏng vấn
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── 2. MAIN CONTENT AREA ─── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Đang tải danh sách phỏng vấn...</Text>
        </View>
      ) : activeSubTab === 'calendar' ? (
        /* ═══════════ SUB-TAB 2: GOOGLE CALENDAR MOBILE VIEW ═══════════ */
        <View style={styles.calendarContainer}>
          <InterviewCalendarMobileView
            interviews={baseFilteredInterviews}
            onOpenCandidateDetail={handleOpenCandidateDetail}
            onOpenDeptSchedule={setDeptScheduleInterview}
            onApproveHrSchedule={setHrApproveInterview}
            onApproveCancel={setCancelApproveInterview}
            onOpenEvaluate={setEvaluatingInterview}
            isHrAdmin={isHrAdmin}
            isDeptManager={isDeptManager}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </View>
      ) : (
        /* ═══════════ SUB-TAB 1: LIST VIEW MODE ═══════════ */
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
          }
        >
          {/* Top 5 KPI Stat Cards */}
          <InterviewStatCards
            interviews={interviews}
            selectedStat={selectedStat}
            onSelectStat={(sId) => setSelectedStat(sId === selectedStat ? 'all' : sId)}
          />

          {/* Time Tabs Filter */}
          <View style={styles.timeTabsRow}>
            {[
              { id: 'ALL', label: 'Tất cả', count: tabCounts.all },
              { id: 'TODAY', label: 'Hôm nay', count: tabCounts.today },
              { id: 'THIS_WEEK', label: 'Tuần này', count: tabCounts.thisWeek },
              { id: 'NEXT_WEEK', label: 'Tuần tới', count: tabCounts.nextWeek },
            ].map((tab) => {
              const isSelected = timeTabFilter === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.timeTabPill, isSelected && styles.timeTabPillActive]}
                  onPress={() => setTimeTabFilter(tab.id as any)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[styles.timeTabPillText, isSelected && styles.timeTabPillTextActive]}
                  >
                    {tab.label}
                  </Text>
                  <View
                    style={[styles.timeTabBadge, isSelected && styles.timeTabBadgeActive]}
                  >
                    <Text
                      style={[
                        styles.timeTabBadgeText,
                        isSelected && styles.timeTabBadgeTextActive,
                      ]}
                    >
                      {tab.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Interview Cards List */}
          {finalInterviews.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Không có cuộc phỏng vấn nào</Text>
              <Text style={styles.emptySubtitle}>
                Không tìm thấy buổi phỏng vấn nào phù hợp với bộ lọc hiện tại.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {paginatedInterviews.map((item) => {
                const candName =
                  item.candidateId?.fullName || item.candidateId?.name || 'Ứng viên';
                const candEmail = item.candidateId?.email;
                const jobTitle = item.jobDescriptionId?.title || 'Vị trí tuyển dụng';
                const deptName =
                  typeof item.jobDescriptionId?.departmentId === 'object'
                    ? item.jobDescriptionId?.departmentId?.name
                    : undefined;
                const interviewerName =
                  typeof item.interviewerId === 'object'
                    ? item.interviewerId?.name || item.interviewerId?.email
                    : undefined;
                const isOnline = item.locationType === 'ONLINE';
                const initials = getCandidateInitials(candName);
                const isCancelRequested = item.confirmationStatus === 'CANCEL_REQUESTED';
                const isWaitingDept = item.confirmationStatus === 'WAITING_DEPT_SCHEDULE';
                const isWaitingHr = item.confirmationStatus === 'WAITING_HR_APPROVAL';
                const isApproved =
                  item.confirmationStatus === 'SCHEDULED' ||
                  item.confirmationStatus === 'CONFIRMED';

                return (
                  <View key={item._id} style={styles.interviewCard}>
                    {/* Top Row: Candidate Avatar, Name, Job Title & Workflow Badge */}
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <View style={styles.avatarCircle}>
                          <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.candidateName}>{candName}</Text>
                          <Text style={styles.jobTitle} numberOfLines={1}>
                            {jobTitle}
                          </Text>
                          {deptName && <Text style={styles.deptName}>{deptName}</Text>}
                        </View>
                      </View>

                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <InterviewWorkflowBadge
                          status={item.status}
                          confirmationStatus={item.confirmationStatus}
                          isEscalated={item.isEscalated}
                        />
                        {item.result && item.result !== 'PENDING' && (
                          <InterviewResultBadge result={item.result} />
                        )}
                      </View>
                    </View>

                    {/* Schedule, Interviewer & Location details */}
                    <View style={styles.detailsBox}>
                      <View style={styles.detailRow}>
                        <Ionicons name="time" size={14} color="#2563EB" />
                        <Text style={styles.detailTimeText}>
                          {formatSchedule(item.date, item.startTime, item.endTime)}
                        </Text>
                      </View>

                      {interviewerName && (
                        <View style={styles.detailRow}>
                          <Ionicons name="person-outline" size={14} color="#64748B" />
                          <Text style={styles.detailText}>
                            Người phỏng vấn:{' '}
                            <Text style={{ fontWeight: '700', color: '#1E293B' }}>
                              {interviewerName}
                            </Text>
                          </Text>
                        </View>
                      )}

                      <View style={styles.detailRow}>
                        <Ionicons
                          name={isOnline ? 'videocam-outline' : 'business-outline'}
                          size={14}
                          color={isOnline ? '#4F46E5' : '#D97706'}
                        />
                        <Text style={styles.detailText} numberOfLines={1}>
                          {isOnline
                            ? 'Trực tuyến (Phòng họp Meet/Jitsi)'
                            : item.offsiteLocation || 'Tại văn phòng'}
                        </Text>
                      </View>

                      {item.feedback && (
                        <View style={styles.feedbackBox}>
                          <Text style={styles.feedbackLabel}>Đánh giá phỏng vấn:</Text>
                          <Text style={styles.feedbackText}>{item.feedback}</Text>
                        </View>
                      )}
                    </View>

                    {/* Action Buttons Row */}
                    <View style={styles.cardActionsRow}>
                      {/* Xem chi tiết hồ sơ */}
                      <TouchableOpacity
                        style={styles.actionBtnOutline}
                        onPress={() => handleOpenCandidateDetail(item)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="eye-outline" size={13} color="#2563EB" />
                        <Text style={styles.actionBtnOutlineText}>Chi tiết</Text>
                      </TouchableOpacity>

                      {/* Vào Meet nếu Online */}
                      {isApproved && isOnline && item.meetingLink && (
                        <TouchableOpacity
                          style={styles.meetBtn}
                          onPress={() => handleOpenMeet(item.meetingLink)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="videocam" size={13} color="#FFFFFF" />
                          <Text style={styles.meetBtnText}>Vào Meet</Text>
                        </TouchableOpacity>
                      )}

                      {/* Xếp lịch (Trưởng phòng) hoặc Sửa lịch (HR) */}
                      {(isWaitingDept || (isHrAdmin && isWaitingHr)) && (
                        <TouchableOpacity
                          style={styles.scheduleBtn}
                          onPress={() => setDeptScheduleInterview(item)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="calendar" size={13} color="#FFFFFF" />
                          <Text style={styles.scheduleBtnText}>
                            {isWaitingDept ? 'Xếp lịch' : 'Sửa lịch'}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Duyệt lịch (HR) */}
                      {isWaitingHr && isHrAdmin && (
                        <TouchableOpacity
                          style={styles.approveScheduleBtn}
                          onPress={() => setHrApproveInterview(item)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="checkmark-circle" size={13} color="#FFFFFF" />
                          <Text style={styles.approveScheduleBtnText}>Duyệt lịch</Text>
                        </TouchableOpacity>
                      )}

                      {/* Từ chối CV (Trưởng phòng) */}
                      {isWaitingDept && isDeptManager && (
                        <TouchableOpacity
                          style={styles.rejectCvBtn}
                          onPress={() => {
                            const appId =
                              typeof item.applicationId === 'object'
                                ? item.applicationId?._id
                                : item.applicationId;
                            setRejectingCandidate({
                              _id: appId || item._id,
                              candidateId: item.candidateId,
                              jobDescriptionId: item.jobDescriptionId as any,
                              currentStageId: '',
                              appliedAt: item.date || new Date().toISOString(),
                            });
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="close-circle" size={13} color="#FFFFFF" />
                          <Text style={styles.rejectCvBtnText}>Từ chối CV</Text>
                        </TouchableOpacity>
                      )}

                      {/* Duyệt hủy lịch (HR khi ứng viên xin hủy) */}
                      {isCancelRequested && isHrAdmin && (
                        <TouchableOpacity
                          style={styles.cancelApproveBtn}
                          onPress={() => setCancelApproveInterview(item)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="alert-circle" size={13} color="#FFFFFF" />
                          <Text style={styles.cancelApproveBtnText}>Duyệt hủy</Text>
                        </TouchableOpacity>
                      )}

                      {/* Đánh giá / Cập nhật kết quả */}
                      <TouchableOpacity
                        style={styles.evalBtn}
                        onPress={() => setEvaluatingInterview(item)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="create-outline" size={13} color="#334155" />
                        <Text style={styles.evalBtnText}>Đánh giá</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              {/* Phân trang danh sách */}
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={finalInterviews.length}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </View>
          )}
        </ScrollView>
      )}

      {/* ─── 3. MODALS NGHIỆP VỤ ─── */}
      {/* Modal 1: Trưởng phòng / HR Xếp lịch phỏng vấn */}
      <DeptScheduleModal
        visible={!!deptScheduleInterview}
        onClose={() => setDeptScheduleInterview(null)}
        interview={deptScheduleInterview}
        staffList={staffList}
        onSuccess={fetchData}
        isHrAdmin={isHrAdmin}
      />

      {/* Modal 2: HR Duyệt lịch phỏng vấn xem trước */}
      <HrApproveScheduleModal
        visible={!!hrApproveInterview}
        onClose={() => setHrApproveInterview(null)}
        interview={hrApproveInterview}
        onSuccess={fetchData}
      />

      {/* Modal 3: HR Duyệt yêu cầu hủy lịch của ứng viên */}
      <ApproveInterviewCancelModal
        visible={!!cancelApproveInterview}
        onClose={() => setCancelApproveInterview(null)}
        interview={cancelApproveInterview}
        onSuccess={fetchData}
      />

      {/* Modal 4: Đánh giá & Cập nhật kết quả phỏng vấn */}
      <InterviewEvaluationModal
        visible={!!evaluatingInterview}
        onClose={() => setEvaluatingInterview(null)}
        interview={evaluatingInterview}
        onSuccess={fetchData}
      />

      {/* Modal 5: Xem chi tiết ứng viên (Đầy đủ 100% hồ sơ, học vấn, kinh nghiệm) */}
      <CandidateDetailModal
        visible={!!detailCandidate}
        candidate={detailCandidate}
        onClose={() => setDetailCandidate(null)}
        onReject={(c) => {
          setDetailCandidate(null);
          setRejectingCandidate(c);
        }}
      />

      {/* Modal 6: Từ chối ứng viên */}
      <RejectCandidateModal
        visible={!!rejectingCandidate}
        candidate={rejectingCandidate}
        onClose={() => setRejectingCandidate(null)}
        onConfirm={async (candId, reason) => {
          await adminService.rejectCandidate(candId, reason);
          setRejectingCandidate(null);
          fetchData();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topFilterBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subFilterCol: {
    flex: 1,
  },
  resetBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Sub-tab switcher
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    gap: 4,
    marginTop: 2,
  },
  tabSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 9,
  },
  tabSwitchBtnActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tabSwitchBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabSwitchBtnTextActive: {
    color: '#FFFFFF',
  },

  // Main scroll area
  scrollArea: {
    flex: 1,
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 110,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  // Time Tabs Row
  timeTabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  timeTabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeTabPillActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  timeTabPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  timeTabPillTextActive: {
    color: '#2563EB',
  },
  timeTabBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  timeTabBadgeActive: {
    backgroundColor: '#DBEAFE',
  },
  timeTabBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
  },
  timeTabBadgeTextActive: {
    color: '#2563EB',
  },

  // Empty Box
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    marginTop: 10,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Interview Card
  interviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingRight: 6,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  candidateName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 1,
  },
  deptName: {
    fontSize: 11,
    color: '#64748B',
  },

  // Details box
  detailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 5,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailTimeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  detailText: {
    fontSize: 11.5,
    color: '#475569',
  },
  feedbackBox: {
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  feedbackLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  feedbackText: {
    fontSize: 11.5,
    color: '#334155',
    fontStyle: 'italic',
  },

  // Card Action Buttons
  cardActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  actionBtnOutlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  meetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
  },
  meetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#D97706',
  },
  scheduleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  approveScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  approveScheduleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rejectCvBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#DC2626',
  },
  rejectCvBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelApproveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E11D48',
  },
  cancelApproveBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  evalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  evalBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
});

export default InterviewsScreen;
