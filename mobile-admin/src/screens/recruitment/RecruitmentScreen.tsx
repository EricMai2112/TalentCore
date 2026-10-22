import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  adminService,
  CandidateApplication,
  JobDescriptionItem,
  DepartmentItem,
} from '../../services/admin.services';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../features/auth/types/auth.types';

interface StageItem {
  _id: string;
  name: string;
  color?: string;
}

export interface RecruitmentScreenProps {
  initialSegment?: 'jobs' | 'candidates';
}

export const RecruitmentScreen: React.FC<RecruitmentScreenProps> = ({ initialSegment }) => {
  const { user } = useAuth();
  const isDeptManager = user?.role === UserRole.DEPARTMENT_MANAGER;
  const userDeptId =
    typeof user?.departmentId === 'object' && user?.departmentId !== null
      ? (user.departmentId as any)._id
      : user?.departmentId;

  const [activeSegment, setActiveSegment] = useState<'jobs' | 'candidates'>(
    initialSegment || 'jobs'
  );

  useEffect(() => {
    if (initialSegment && initialSegment !== activeSegment) {
      setActiveSegment(initialSegment);
    }
  }, [initialSegment]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');

  // Filters dành riêng cho Tin Tuyển Dụng
  const [selectedJobStatus, setSelectedJobStatus] = useState<string>('ALL');
  const [selectedJobDept, setSelectedJobDept] = useState<string>(
    isDeptManager && userDeptId ? userDeptId : 'ALL'
  );
  const [selectedJobPriority, setSelectedJobPriority] = useState<string>('ALL');

  // Data states
  const [candidates, setCandidates] = useState<CandidateApplication[]>([]);
  const [jobs, setJobs] = useState<JobDescriptionItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [pipelineStages, setPipelineStages] = useState<StageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Modal Selection states
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplication | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobDescriptionItem | null>(null);

  // Candidate Modals
  const [showStageModal, setShowStageModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>(
    'Hồ sơ chưa phù hợp với yêu cầu vị trí thời điểm hiện tại.'
  );

  // Job Filters Pickers Modal
  const [showDeptPickerModal, setShowDeptPickerModal] = useState<boolean>(false);
  const [showPriorityPickerModal, setShowPriorityPickerModal] = useState<boolean>(false);

  // Review Modal states (Khớp 100% Ảnh 3)
  const [reviewJob, setReviewJob] = useState<JobDescriptionItem | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reviewNote, setReviewNote] = useState<string>('');
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);

  // Lấy dữ liệu
  const fetchData = useCallback(async () => {
    try {
      const [candList, jobList, stages, deptList] = await Promise.all([
        adminService.getCandidates(),
        adminService.getJobs(),
        adminService.getPipelineStages(),
        adminService.getDepartments(),
      ]);
      setCandidates(candList);
      setJobs(jobList);
      setPipelineStages(stages);
      setDepartments(deptList);
    } catch (err) {
      console.error('Lỗi tải dữ liệu Tuyển dụng:', err);
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

  // Helper tính tên ứng viên
  const getCandidateName = (item: CandidateApplication | null | undefined): string => {
    if (!item) return 'Ứng viên';
    return (
      item.candidateId?.userId?.name ||
      item.candidateId?.fullName ||
      item.candidateId?.profileName ||
      'Ứng viên'
    );
  };

  const getCandidateEmail = (item: CandidateApplication | null | undefined): string => {
    if (!item) return '';
    return item.candidateId?.userId?.email || item.candidateId?.email || '';
  };

  const getCandidatePhone = (item: CandidateApplication | null | undefined): string => {
    if (!item) return '';
    return item.candidateId?.userId?.phone || item.candidateId?.phone || '';
  };

  // Map số lượng hồ sơ nộp cho từng JD
  const applicantCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    candidates.forEach((c) => {
      const jdId =
        typeof c.jobDescriptionId === 'object'
          ? c.jobDescriptionId?._id
          : c.jobDescriptionId;
      if (jdId) {
        map[jdId] = (map[jdId] || 0) + 1;
      }
    });
    return map;
  }, [candidates]);

  // Lọc danh sách ứng viên
  const filteredCandidates = useMemo(() => {
    return candidates.filter((item) => {
      const name = getCandidateName(item);
      const email = getCandidateEmail(item);
      const pos = item.jobDescriptionId?.title || '';
      const q = searchQuery.toLowerCase();

      const matchSearch =
        !searchQuery ||
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        pos.toLowerCase().includes(q);

      const matchStage =
        selectedStage === 'ALL' ||
        (item.stageName?.toLowerCase().includes(selectedStage.toLowerCase()) ?? false);

      return matchSearch && matchStage;
    });
  }, [candidates, searchQuery, selectedStage]);

  // Thống kê 6 trạng thái JD (Stat Cards như Web)
  const jobStats = useMemo(() => {
    const total = jobs.length;
    const pending = jobs.filter((j) => j.status === 'PENDING').length;
    const approved = jobs.filter((j) => j.status === 'APPROVED').length;
    const jdCreated = jobs.filter((j) => j.status === 'JD_CREATED').length;
    const completed = jobs.filter((j) => j.status === 'COMPLETED').length;
    const rejected = jobs.filter((j) => j.status === 'REJECTED').length;

    const pct = (val: number) => (total > 0 ? Math.round((val / total) * 100) : 0);

    return [
      {
        id: 'ALL',
        label: 'TỔNG YÊU CẦU',
        count: total,
        percent: 100,
        color: '#2563EB',
        bgColor: '#EFF6FF',
        borderColor: '#BFDBFE',
        icon: 'document-text',
      },
      {
        id: 'PENDING',
        label: 'CHỜ DUYỆT',
        count: pending,
        percent: pct(pending),
        color: '#D97706',
        bgColor: '#FEF3C7',
        borderColor: '#FDE68A',
        icon: 'time',
      },
      {
        id: 'APPROVED',
        label: 'ĐÃ DUYỆT',
        count: approved,
        percent: pct(approved),
        color: '#059669',
        bgColor: '#ECFDF5',
        borderColor: '#A7F3D0',
        icon: 'checkmark-circle',
      },
      {
        id: 'JD_CREATED',
        label: 'ĐÃ TẠO JD',
        count: jdCreated,
        percent: pct(jdCreated),
        color: '#7C3AED',
        bgColor: '#F5F3FF',
        borderColor: '#DDD6FE',
        icon: 'briefcase',
      },
      {
        id: 'COMPLETED',
        label: 'HOÀN THÀNH',
        count: completed,
        percent: pct(completed),
        color: '#0284C7',
        bgColor: '#F0F9FF',
        borderColor: '#BAE6FD',
        icon: 'checkbox',
      },
      {
        id: 'REJECTED',
        label: 'TỪ CHỐI',
        count: rejected,
        percent: pct(rejected),
        color: '#DC2626',
        bgColor: '#FEF2F2',
        borderColor: '#FECACA',
        icon: 'close-circle',
      },
    ];
  }, [jobs]);

  // Lọc danh sách Tin tuyển dụng (JD)
  const filteredJobs = useMemo(() => {
    return jobs.filter((item) => {
      const q = searchQuery.toLowerCase();
      const title = item.title || '';
      const deptName =
        typeof item.departmentId === 'object'
          ? item.departmentId?.name || ''
          : item.departmentName || '';
      const deptId =
        typeof item.departmentId === 'object'
          ? item.departmentId?._id
          : item.departmentId;

      const matchSearch =
        !searchQuery || title.toLowerCase().includes(q) || deptName.toLowerCase().includes(q);

      // Lọc trạng thái
      let matchStatus = true;
      if (selectedJobStatus === 'ALL') {
        matchStatus = true;
      } else if (selectedJobStatus === 'ACTIVE') {
        matchStatus = item.status === 'JD_CREATED' || item.status === 'APPROVED';
      } else {
        matchStatus = item.status === selectedJobStatus;
      }

      // Lọc phòng ban
      const matchDept = selectedJobDept === 'ALL' || String(deptId) === String(selectedJobDept);

      // Lọc ưu tiên
      const matchPriority =
        selectedJobPriority === 'ALL' || item.priority === selectedJobPriority;

      return matchSearch && matchStatus && matchDept && matchPriority;
    });
  }, [jobs, searchQuery, selectedJobStatus, selectedJobDept, selectedJobPriority]);

  const isJobFiltered =
    selectedJobStatus !== 'ALL' ||
    selectedJobDept !== (isDeptManager && userDeptId ? userDeptId : 'ALL') ||
    selectedJobPriority !== 'ALL' ||
    searchQuery.trim().length > 0;

  const handleResetJobFilters = () => {
    setSearchQuery('');
    setSelectedJobStatus('ALL');
    if (!isDeptManager) {
      setSelectedJobDept('ALL');
    }
    setSelectedJobPriority('ALL');
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Thỏa thuận';
    const minM = min ? `${(min / 1000000).toFixed(0)}tr` : '';
    const maxM = max ? `${(max / 1000000).toFixed(0)}tr` : '';
    if (minM && maxM) return `${minM} - ${maxM} / tháng`;
    return `Từ ${minM || maxM} / tháng`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const formatIsoDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  // Chuyển giai đoạn ứng viên
  const handleMoveStage = async (stage: StageItem) => {
    if (!selectedCandidate) return;
    try {
      setActionLoading(true);
      await adminService.updateCandidateStage(selectedCandidate._id, stage._id);
      Alert.alert('Thành công', `Đã chuyển ứng viên sang vòng: ${stage.name}`);
      setSelectedCandidate((prev) =>
        prev
          ? {
              ...prev,
              currentStageId: stage._id,
              stageName: stage.name,
              stageColor: stage.color,
            }
          : null
      );
      setShowStageModal(false);
      fetchData();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể chuyển giai đoạn');
    } finally {
      setActionLoading(false);
    }
  };

  // Từ chối ứng viên
  const handleConfirmReject = async () => {
    if (!selectedCandidate) return;
    try {
      setActionLoading(true);
      await adminService.rejectCandidate(selectedCandidate._id, rejectReason);
      Alert.alert('Thành công', 'Đã cập nhật trạng thái từ chối ứng viên.');
      setShowRejectModal(false);
      setSelectedCandidate(null);
      fetchData();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể từ chối ứng viên');
    } finally {
      setActionLoading(false);
    }
  };

  // Cập nhật trạng thái tin tuyển dụng (Duyệt, Mở tuyển, Đóng)
  const handleUpdateJobStatus = async (status: string, label: string) => {
    if (!selectedJob) return;
    try {
      setActionLoading(true);
      await adminService.updateJob(selectedJob._id, { status });
      Alert.alert('Thành công', `Đã cập nhật trạng thái tin thành: ${label}`);
      setSelectedJob((prev) => (prev ? { ...prev, status } : null));
      fetchData();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật trạng thái');
    } finally {
      setActionLoading(false);
    }
  };

  // Xử lý nộp quyết định Xét duyệt yêu cầu (Approve/Reject - Khớp Ảnh 3)
  const handleReviewSubmit = async () => {
    if (!reviewJob) return;

    if (reviewDecision === 'REJECTED' && !reviewNote.trim()) {
      Alert.alert('Yêu cầu', 'Vui lòng nhập lý do từ chối vào phần ghi chú.');
      return;
    }

    try {
      setReviewLoading(true);
      await adminService.updateJob(reviewJob._id, {
        status: reviewDecision,
        note: reviewNote.trim(),
      });

      Alert.alert(
        'Thành công',
        reviewDecision === 'APPROVED'
          ? 'Đã phê duyệt yêu cầu tuyển dụng!'
          : 'Đã từ chối yêu cầu tuyển dụng!'
      );

      setReviewJob(null);
      setSelectedJob(null);
      fetchData();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Lỗi khi lưu quyết định xét duyệt');
    } finally {
      setReviewLoading(false);
    }
  };

  // Thông tin mức ưu tiên
  const getPriorityInfo = (priority?: string) => {
    switch (priority) {
      case 'HIGH':
        return { label: '▲ Gấp', color: '#EF4444', bg: '#FEE2E2', border: '#FECACA' };
      case 'MEDIUM':
        return { label: 'Bình thường', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' };
      case 'LOW':
        return { label: 'Thấp', color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0' };
      default:
        return { label: 'Bình thường', color: '#2563EB', bg: '#EFF6FF', border: '#DBEAFE' };
    }
  };

  // Thông tin nhãn trạng thái JD
  const getJobStatusInfo = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Chờ duyệt', color: '#D97706', bg: '#FEF3C7' };
      case 'APPROVED':
        return { label: 'Đã duyệt', color: '#059669', bg: '#DCFCE7' };
      case 'JD_CREATED':
        return { label: 'Đang tuyển', color: '#2563EB', bg: '#EFF6FF' };
      case 'COMPLETED':
        return { label: 'Hoàn thành', color: '#0284C7', bg: '#F0F9FF' };
      case 'REJECTED':
        return { label: 'Từ chối', color: '#DC2626', bg: '#FEE2E2' };
      default:
        return { label: status || 'Đang tuyển', color: '#2563EB', bg: '#EFF6FF' };
    }
  };

  const selectedDeptName = useMemo(() => {
    if (selectedJobDept === 'ALL') return 'Tất cả phòng ban';
    const found = departments.find((d) => d._id === selectedJobDept);
    return found ? found.name : 'Phòng ban đã chọn';
  }, [departments, selectedJobDept]);

  const selectedPriorityName = useMemo(() => {
    if (selectedJobPriority === 'ALL') return 'Tất cả ưu tiên';
    if (selectedJobPriority === 'HIGH') return '▲ Gấp';
    if (selectedJobPriority === 'MEDIUM') return 'Bình thường';
    if (selectedJobPriority === 'LOW') return 'Thấp';
    return selectedJobPriority;
  }, [selectedJobPriority]);

  return (
    <View style={styles.container}>
      {/* ─── THANH ĐIỀU HƯỚNG SUB-TABS (Ứng viên vs Tin tuyển dụng) ─────── */}
      <View style={styles.topBar}>
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeSegment === 'jobs' && styles.segmentBtnActive]}
            onPress={() => setActiveSegment('jobs')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="briefcase"
              size={16}
              color={activeSegment === 'jobs' ? '#2563EB' : '#64748B'}
            />
            <Text
              style={[
                styles.segmentText,
                activeSegment === 'jobs' && styles.segmentTextActive,
              ]}
            >
              Tin tuyển dụng ({jobs.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeSegment === 'candidates' && styles.segmentBtnActive]}
            onPress={() => setActiveSegment('candidates')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="people"
              size={16}
              color={activeSegment === 'candidates' ? '#2563EB' : '#64748B'}
            />
            <Text
              style={[
                styles.segmentText,
                activeSegment === 'candidates' && styles.segmentTextActive,
              ]}
            >
              Ứng viên ({candidates.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ô Tìm kiếm */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={17} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeSegment === 'candidates'
                ? 'Tìm kiếm họ tên, email, vị trí...'
                : 'Tìm kiếm tin tuyển dụng, phòng ban...'
            }
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

        {/* ─── FILTERS CHO TAB ỨNG VIÊN ─── */}
        {activeSegment === 'candidates' ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipRow}
          >
            {[
              { id: 'ALL', label: `Tất cả (${candidates.length})` },
              ...pipelineStages.map((st) => ({
                id: st.name,
                label: st.name,
              })),
            ].map((chip) => {
              const isSelected = selectedStage === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  onPress={() => setSelectedStage(chip.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextActive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          /* ─── FILTERS CHO TAB TIN TUYỂN DỤNG (Khớp Ảnh 1) ─── */
          <View>
            {/* Filter pills ngang các trạng thái */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipRow}
            >
              {[
                { id: 'ALL', label: `Tất cả (${jobs.length})` },
                { id: 'ACTIVE', label: 'Đang mở tuyển' },
                { id: 'PENDING', label: 'Chờ duyệt' },
                { id: 'APPROVED', label: 'Đã duyệt' },
                { id: 'JD_CREATED', label: 'Đã tạo JD' },
                { id: 'COMPLETED', label: 'Hoàn thành' },
                { id: 'REJECTED', label: 'Từ chối' },
              ].map((chip) => {
                const isSelected = selectedJobStatus === chip.id;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                    onPress={() => setSelectedJobStatus(chip.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isSelected && styles.filterChipTextActive,
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Dòng bộ lọc phụ: Phòng ban + Ưu tiên + Đặt lại */}
            <View style={styles.subFilterRow}>
              {/* Nút lọc Phòng ban */}
              <TouchableOpacity
                style={[
                  styles.subFilterPill,
                  (selectedJobDept !== 'ALL' || showDeptPickerModal) && styles.subFilterPillActive,
                ]}
                onPress={() => !isDeptManager && setShowDeptPickerModal(true)}
                activeOpacity={isDeptManager ? 1 : 0.7}
              >
                <Ionicons
                  name="business-outline"
                  size={13}
                  color={selectedJobDept !== 'ALL' || showDeptPickerModal ? '#2563EB' : '#64748B'}
                />
                <Text
                  style={[
                    styles.subFilterPillText,
                    selectedJobDept !== 'ALL' && styles.subFilterPillTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {selectedDeptName}
                </Text>
                {!isDeptManager && (
                  <Ionicons
                    name={showDeptPickerModal ? 'chevron-up' : 'chevron-down'}
                    size={13}
                    color={showDeptPickerModal ? '#2563EB' : '#64748B'}
                  />
                )}
              </TouchableOpacity>

              {/* Nút lọc Mức ưu tiên */}
              <TouchableOpacity
                style={[
                  styles.subFilterPill,
                  (selectedJobPriority !== 'ALL' || showPriorityPickerModal) && styles.subFilterPillActive,
                ]}
                onPress={() => setShowPriorityPickerModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="flag-outline"
                  size={13}
                  color={selectedJobPriority !== 'ALL' || showPriorityPickerModal ? '#2563EB' : '#64748B'}
                />
                <Text
                  style={[
                    styles.subFilterPillText,
                    selectedJobPriority !== 'ALL' && styles.subFilterPillTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {selectedPriorityName}
                </Text>
                <Ionicons
                  name={showPriorityPickerModal ? 'chevron-up' : 'chevron-down'}
                  size={13}
                  color={showPriorityPickerModal ? '#2563EB' : '#64748B'}
                />
              </TouchableOpacity>

              {/* Nút Đặt lại bộ lọc */}
              {isJobFiltered && (
                <TouchableOpacity
                  style={styles.subFilterResetBtn}
                  onPress={handleResetJobFilters}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={12} color="#DC2626" />
                  <Text style={styles.subFilterResetText}>Đặt lại</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>

      {/* ─── NỘI DUNG CUỘN CHÍNH ──────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Đang tải danh sách...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
          }
        >
          {activeSegment === 'candidates' ? (
            /* ─── DANH SÁCH ỨNG VIÊN ─── */
            filteredCandidates.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="people-outline" size={44} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>Không tìm thấy ứng viên</Text>
                <Text style={styles.emptySubtitle}>Thử thay đổi từ khóa hoặc bộ lọc trạng thái</Text>
              </View>
            ) : (
              filteredCandidates.map((c) => {
                const candName = getCandidateName(c);
                const deptName =
                  typeof c.jobDescriptionId?.departmentId === 'object'
                    ? c.jobDescriptionId?.departmentId?.name
                    : undefined;

                return (
                  <TouchableOpacity
                    key={c._id}
                    style={styles.candidateCard}
                    onPress={() => setSelectedCandidate(c)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.candidateTopRow}>
                      <View style={styles.candidateAvatar}>
                        <Text style={styles.candidateAvatarText}>
                          {candName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.candidateMainInfo}>
                        <Text style={styles.candidateName}>{candName}</Text>
                        <Text style={styles.candidatePos} numberOfLines={1}>
                          {c.jobDescriptionId?.title || 'Vị trí tuyển dụng'}
                        </Text>
                        {deptName && <Text style={styles.candidateDept}>{deptName}</Text>}
                      </View>

                      {c.aiFitScore !== null && c.aiFitScore !== undefined && (
                        <View
                          style={[
                            styles.aiBadge,
                            c.aiFitScore >= 85
                              ? styles.aiBadgeHigh
                              : c.aiFitScore >= 70
                              ? styles.aiBadgeMedium
                              : styles.aiBadgeLow,
                          ]}
                        >
                          <Ionicons name="sparkles" size={11} color="#FFFFFF" />
                          <Text style={styles.aiBadgeText}>{c.aiFitScore}%</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.candidateMetaRow}>
                      <View
                        style={[
                          styles.stageBadge,
                          { backgroundColor: c.stageColor ? `${c.stageColor}20` : '#EFF6FF' },
                        ]}
                      >
                        <View
                          style={[
                            styles.stageDot,
                            { backgroundColor: c.stageColor || '#2563EB' },
                          ]}
                        />
                        <Text
                          style={[
                            styles.stageBadgeText,
                            { color: c.stageColor || '#2563EB' },
                          ]}
                        >
                          {c.stageName || 'Applied'}
                        </Text>
                      </View>

                      {c.appliedAt && (
                        <Text style={styles.appliedDate}>
                          Nộp: {formatDate(c.appliedAt)}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )
          ) : (
            /* ─── PHẦN TIN TUYỂN DỤNG (JD) ─── */
            <View>
              {/* Dải 6 Stat Cards cuộn ngang (Giống Web Ảnh 2) */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.statCardsRow}
              >
                {jobStats.map((stat) => {
                  const isSelected = selectedJobStatus === stat.id;
                  return (
                    <TouchableOpacity
                      key={stat.id}
                      style={[
                        styles.statCardItem,
                        { borderColor: isSelected ? stat.color : '#E2E8F0' },
                        isSelected && { backgroundColor: stat.bgColor },
                      ]}
                      onPress={() => setSelectedJobStatus(stat.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.statCardHeader}>
                        <View
                          style={[
                            styles.statCardIconBox,
                            { backgroundColor: stat.bgColor },
                          ]}
                        >
                          <Ionicons
                            name={stat.icon as any}
                            size={14}
                            color={stat.color}
                          />
                        </View>
                        <View
                          style={[
                            styles.statCardBadge,
                            { backgroundColor: `${stat.color}15` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statCardBadgeText,
                              { color: stat.color },
                            ]}
                          >
                            {stat.percent}%
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.statCardLabel}>{stat.label}</Text>
                      <Text style={[styles.statCardCount, { color: stat.color }]}>
                        {stat.count}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Danh sách Thẻ Tin tuyển dụng (Khớp Ảnh 1 & 4) */}
              {filteredJobs.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="briefcase-outline" size={44} color="#CBD5E1" />
                  <Text style={styles.emptyTitle}>Không tìm thấy tin tuyển dụng</Text>
                  <Text style={styles.emptySubtitle}>Thử thay đổi từ khóa hoặc bộ lọc trạng thái</Text>
                </View>
              ) : (
                filteredJobs.map((j) => {
                  const statusInfo = getJobStatusInfo(j.status);
                  const priorityInfo = getPriorityInfo(j.priority);
                  const deptName =
                    typeof j.departmentId === 'object'
                      ? j.departmentId?.name
                      : j.departmentName;

                  const salaryMin = j.minimumSalary ?? j.salaryMin;
                  const salaryMax = j.maximumSalary ?? j.salaryMax;
                  const level = j.experienceLevel || j.level;
                  const deadline = j.applicationDeadline || j.deadline;
                  const appCount = applicantCountMap[j._id] ?? j.applicantCount ?? 0;
                  const isPending = j.status === 'PENDING';

                  return (
                    <TouchableOpacity
                      key={j._id}
                      style={styles.jobCard}
                      onPress={() => setSelectedJob(j)}
                      activeOpacity={0.8}
                    >
                      {/* Dòng 1: Tiêu đề và Badge trạng thái */}
                      <View style={styles.jobTopRow}>
                        <View style={styles.jobHeaderInfo}>
                          <Text style={styles.jobTitle} numberOfLines={2}>
                            {j.title}
                          </Text>
                          {deptName && <Text style={styles.jobDept}>{deptName}</Text>}
                        </View>
                        <View
                          style={[
                            styles.jobBadge,
                            { backgroundColor: statusInfo.bg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.jobBadgeText,
                              { color: statusInfo.color },
                            ]}
                          >
                            {statusInfo.label}
                          </Text>
                        </View>
                      </View>

                      {/* Dòng 2: Tags (Ưu tiên, Level, Hình thức) */}
                      <View style={styles.jobTagRow}>
                        {j.priority && (
                          <View
                            style={[
                              styles.priorityTag,
                              { backgroundColor: priorityInfo.bg, borderColor: priorityInfo.border },
                            ]}
                          >
                            <Text
                              style={[
                                styles.priorityTagText,
                                { color: priorityInfo.color },
                              ]}
                            >
                              {priorityInfo.label}
                            </Text>
                          </View>
                        )}
                        {level && (
                          <View style={styles.metaTag}>
                            <Text style={styles.metaTagText}>{level}</Text>
                          </View>
                        )}
                        {j.employmentType && (
                          <View style={styles.metaTag}>
                            <Text style={styles.metaTagText}>{j.employmentType}</Text>
                          </View>
                        )}
                      </View>

                      {/* Dòng 3: Thông số Lương & Số hồ sơ nộp */}
                      <View style={styles.jobMetaRow}>
                        <View style={styles.jobMetaItem}>
                          <Ionicons name="cash-outline" size={14} color="#64748B" />
                          <Text style={styles.jobMetaText}>
                            {formatSalary(salaryMin, salaryMax)}
                          </Text>
                        </View>
                        <View style={styles.jobMetaItem}>
                          <Ionicons name="people" size={14} color="#2563EB" />
                          <Text
                            style={[
                              styles.jobMetaText,
                              { color: '#2563EB', fontWeight: '700' },
                            ]}
                          >
                            {appCount} hồ sơ
                          </Text>
                        </View>
                      </View>

                      {/* Dòng 4: Hạn chót & Nút Xét duyệt nhanh nếu là PENDING */}
                      <View style={styles.jobBottomActionRow}>
                        {deadline ? (
                          <View style={styles.jobDeadlineRow}>
                            <Ionicons name="calendar-outline" size={13} color="#94A3B8" />
                            <Text style={styles.jobDeadlineText}>
                              Hạn chót: {formatDate(deadline)}
                            </Text>
                          </View>
                        ) : (
                          <View />
                        )}

                        {isPending && (
                          <TouchableOpacity
                            style={styles.quickReviewBtn}
                            onPress={() => {
                              setReviewJob(j);
                              setReviewDecision('APPROVED');
                              setReviewNote('');
                            }}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="checkmark-circle" size={13} color="#059669" />
                            <Text style={styles.quickReviewBtnText}>Xét duyệt</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* ─── MODAL XÉT DUYỆT YÊU CẦU (REVIEW MODAL - KHỚP ẢNH 3) ──────── */}
      <Modal
        visible={!!reviewJob}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setReviewJob(null)}
      >
        <Pressable
          style={styles.modalBackdropOverlay}
          onPress={() => setReviewJob(null)}
        >
          <Pressable
            style={styles.reviewModalCard}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <View style={styles.reviewModalHeader}>
              <View style={styles.reviewModalHeaderLeft}>
                <View
                  style={[
                    styles.reviewHeaderIconCircle,
                    {
                      backgroundColor:
                        reviewDecision === 'APPROVED' ? '#DCFCE7' : '#FEE2E2',
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      reviewDecision === 'APPROVED'
                        ? 'checkmark'
                        : 'close'
                    }
                    size={18}
                    color={
                      reviewDecision === 'APPROVED' ? '#16A34A' : '#DC2626'
                    }
                  />
                </View>
                <View>
                  <Text style={styles.reviewModalTitle}>Xét duyệt yêu cầu</Text>
                  <Text style={styles.reviewModalSubtitle}>
                    {reviewDecision === 'APPROVED'
                      ? 'Phê duyệt yêu cầu tuyển dụng này'
                      : 'Từ chối yêu cầu tuyển dụng này'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setReviewJob(null)}
                style={styles.reviewModalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Thẻ tóm tắt thông tin yêu cầu */}
            {reviewJob && (
              <View style={styles.reviewInfoSummaryBox}>
                <View style={styles.reviewInfoRow}>
                  <Text style={styles.reviewInfoLabel}>VỊ TRÍ</Text>
                  <Text style={styles.reviewInfoValue} numberOfLines={1}>
                    {reviewJob.title}
                  </Text>
                </View>
                <View style={styles.reviewInfoRow}>
                  <Text style={styles.reviewInfoLabel}>PHÒNG BAN</Text>
                  <Text style={styles.reviewInfoValue}>
                    {typeof reviewJob.departmentId === 'object'
                      ? reviewJob.departmentId?.name
                      : reviewJob.departmentName || 'Chưa xác định'}
                  </Text>
                </View>
                <View style={styles.reviewInfoRow}>
                  <Text style={styles.reviewInfoLabel}>NGƯỜI YÊU CẦU</Text>
                  <Text style={styles.reviewInfoValue}>
                    {typeof reviewJob.postedById === 'object'
                      ? reviewJob.postedById?.name
                      : 'Trưởng bộ phận'}
                  </Text>
                </View>
                <View style={styles.reviewInfoRow}>
                  <Text style={styles.reviewInfoLabel}>NGÀY GỬI</Text>
                  <Text style={styles.reviewInfoValue}>
                    {formatIsoDate(reviewJob.createdAt) || '2026-10-19'}
                  </Text>
                </View>
              </View>
            )}

            {/* Quyết định Phê duyệt / Từ chối */}
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionLabel}>QUYẾT ĐỊNH</Text>
              <View style={styles.reviewDecisionButtonGroup}>
                <TouchableOpacity
                  style={[
                    styles.reviewDecisionBtn,
                    reviewDecision === 'APPROVED'
                      ? styles.reviewDecisionBtnApproveActive
                      : styles.reviewDecisionBtnInactive,
                  ]}
                  onPress={() => setReviewDecision('APPROVED')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={reviewDecision === 'APPROVED' ? '#FFFFFF' : '#475569'}
                  />
                  <Text
                    style={[
                      styles.reviewDecisionBtnText,
                      reviewDecision === 'APPROVED'
                        ? styles.reviewDecisionBtnTextActive
                        : null,
                    ]}
                  >
                    Phê duyệt
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.reviewDecisionBtn,
                    reviewDecision === 'REJECTED'
                      ? styles.reviewDecisionBtnRejectActive
                      : styles.reviewDecisionBtnInactive,
                  ]}
                  onPress={() => setReviewDecision('REJECTED')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="close"
                    size={16}
                    color={reviewDecision === 'REJECTED' ? '#FFFFFF' : '#475569'}
                  />
                  <Text
                    style={[
                      styles.reviewDecisionBtnText,
                      reviewDecision === 'REJECTED'
                        ? styles.reviewDecisionBtnTextActive
                        : null,
                    ]}
                  >
                    Từ chối
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Ghi chú cho Trưởng phòng */}
            <View style={styles.reviewSection}>
              <Text style={styles.reviewSectionLabel}>GHI CHÚ CHO TRƯỞNG PHÒNG</Text>
              <TextInput
                style={styles.reviewNoteInput}
                placeholder="VD: Đồng ý, sẽ tạo JD trong tuần này..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={reviewNote}
                onChangeText={(text) => text.length <= 500 && setReviewNote(text)}
              />
              <Text style={styles.reviewCharCount}>{reviewNote.length}/500 ký tự</Text>
            </View>

            {/* Nút hành động Modal */}
            <View style={styles.reviewFooterButtons}>
              <TouchableOpacity
                style={styles.reviewCancelBtn}
                onPress={() => setReviewJob(null)}
                disabled={reviewLoading}
              >
                <Text style={styles.reviewCancelBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.reviewConfirmSubmitBtn,
                  reviewDecision === 'APPROVED'
                    ? styles.bgGreenButton
                    : styles.bgRedButton,
                ]}
                onPress={handleReviewSubmit}
                disabled={reviewLoading}
              >
                {reviewLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name={reviewDecision === 'APPROVED' ? 'checkmark' : 'close'}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.reviewConfirmSubmitText}>
                      {reviewDecision === 'APPROVED' ? 'Phê duyệt' : 'Từ chối'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ─── MODAL CHI TIẾT TIN TUYỂN DỤNG (JOB DETAILS BOTTOMSHEET) ───── */}
      <Modal
        visible={!!selectedJob && !reviewJob}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedJob(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setSelectedJob(null)}
            activeOpacity={1}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalDragHandle} />
            {selectedJob && (
              <>
                <View style={styles.modalHeader}>
                  <View
                    style={[
                      styles.modalAvatarCircle,
                      { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
                    ]}
                  >
                    <Ionicons name="briefcase" size={20} color="#16A34A" />
                  </View>
                  <View style={styles.modalHeaderInfo}>
                    <Text style={styles.modalName}>{selectedJob.title}</Text>
                    <Text style={styles.modalPos}>
                      {typeof selectedJob.departmentId === 'object'
                        ? selectedJob.departmentId?.name
                        : selectedJob.departmentName || 'Tuyển dụng'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedJob(null)}
                  >
                    <Ionicons name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {/* Trạng thái hiện tại */}
                  <View style={styles.jobDetailStatusBanner}>
                    <Text style={styles.jobDetailStatusLabel}>Trạng thái hiện tại:</Text>
                    <View
                      style={[
                        styles.jobBadge,
                        { backgroundColor: getJobStatusInfo(selectedJob.status).bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.jobBadgeText,
                          { color: getJobStatusInfo(selectedJob.status).color },
                        ]}
                      >
                        {getJobStatusInfo(selectedJob.status).label}
                      </Text>
                    </View>
                  </View>

                  {/* Thông tin cốt lõi */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Thông tin tuyển dụng</Text>
                    <View style={styles.infoRow}>
                      <Ionicons name="cash-outline" size={15} color="#64748B" />
                      <Text style={styles.infoText}>
                        Mức lương: {formatSalary(selectedJob.minimumSalary ?? selectedJob.salaryMin, selectedJob.maximumSalary ?? selectedJob.salaryMax)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="people-outline" size={15} color="#64748B" />
                      <Text style={styles.infoText}>
                        Chỉ tiêu tuyển: {selectedJob.headcount || 1} nhân sự • {applicantCountMap[selectedJob._id] ?? selectedJob.applicantCount ?? 0} hồ sơ đã nộp
                      </Text>
                    </View>
                    {(selectedJob.experienceLevel || selectedJob.level) && (
                      <View style={styles.infoRow}>
                        <Ionicons name="ribbon-outline" size={15} color="#64748B" />
                        <Text style={styles.infoText}>
                          Kinh nghiệm: {selectedJob.experienceLevel || selectedJob.level}
                        </Text>
                      </View>
                    )}
                    {selectedJob.employmentType && (
                      <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={15} color="#64748B" />
                        <Text style={styles.infoText}>Hình thức: {selectedJob.employmentType}</Text>
                      </View>
                    )}
                    {selectedJob.location && (
                      <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={15} color="#64748B" />
                        <Text style={styles.infoText}>Địa điểm: {selectedJob.location}</Text>
                      </View>
                    )}
                    {(selectedJob.applicationDeadline || selectedJob.deadline) && (
                      <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={15} color="#64748B" />
                        <Text style={styles.infoText}>
                          Hạn chót: {formatDate(selectedJob.applicationDeadline || selectedJob.deadline)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Mô tả công việc nếu có */}
                  {selectedJob.description && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Mô tả công việc</Text>
                      <Text style={styles.descriptionParagraphText}>
                        {selectedJob.description}
                      </Text>
                    </View>
                  )}

                  {/* Yêu cầu công việc nếu có */}
                  {selectedJob.requirements && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Yêu cầu ứng viên</Text>
                      <Text style={styles.descriptionParagraphText}>
                        {selectedJob.requirements}
                      </Text>
                    </View>
                  )}

                  {/* Quyền lợi nếu có */}
                  {selectedJob.benefits && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Quyền lợi đãi ngộ</Text>
                      <Text style={styles.descriptionParagraphText}>
                        {selectedJob.benefits}
                      </Text>
                    </View>
                  )}

                  {/* Ghi chú duyệt */}
                  {selectedJob.note && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Ghi chú xét duyệt</Text>
                      <View style={styles.noteBox}>
                        <Ionicons name="information-circle-outline" size={16} color="#2563EB" />
                        <Text style={styles.noteText}>{selectedJob.note}</Text>
                      </View>
                    </View>
                  )}

                  {/* Thao tác quản lý nghiệp vụ */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Thao tác quản lý</Text>
                    <View style={styles.jobActionsCol}>
                      {/* Nếu Chờ duyệt -> Mở ReviewModal */}
                      {selectedJob.status === 'PENDING' && (
                        <TouchableOpacity
                          style={[styles.jobActionBtn, { backgroundColor: '#059669' }]}
                          onPress={() => {
                            setReviewJob(selectedJob);
                            setReviewDecision('APPROVED');
                            setReviewNote('');
                          }}
                        >
                          <Ionicons name="shield-checkmark" size={17} color="#FFFFFF" />
                          <Text style={styles.jobActionBtnText}>Xét duyệt yêu cầu</Text>
                        </TouchableOpacity>
                      )}

                      {/* Nếu Đã duyệt -> Cho phép chuyển sang Đang tuyển */}
                      {selectedJob.status === 'APPROVED' && (
                        <TouchableOpacity
                          style={[styles.jobActionBtn, { backgroundColor: '#2563EB' }]}
                          onPress={() => handleUpdateJobStatus('JD_CREATED', 'Đang tuyển (Đã tạo JD)')}
                          disabled={actionLoading}
                        >
                          <Ionicons name="megaphone" size={17} color="#FFFFFF" />
                          <Text style={styles.jobActionBtnText}>Mở tuyển JD (Tạo Job)</Text>
                        </TouchableOpacity>
                      )}

                      {/* Nếu Đang tuyển -> Cho phép hoàn thành */}
                      {(selectedJob.status === 'JD_CREATED' || selectedJob.status === 'APPROVED') && (
                        <TouchableOpacity
                          style={[styles.jobActionBtn, { backgroundColor: '#0284C7' }]}
                          onPress={() => handleUpdateJobStatus('COMPLETED', 'Đã hoàn thành')}
                          disabled={actionLoading}
                        >
                          <Ionicons name="lock-closed" size={17} color="#FFFFFF" />
                          <Text style={styles.jobActionBtnText}>Đóng tin / Hoàn thành tuyển dụng</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ─── MODAL CHỌN PHÒNG BAN CHO BỘ LỌC JD (GIỐNG WEB) ─────────── */}
      <Modal
        visible={showDeptPickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeptPickerModal(false)}
      >
        <Pressable
          style={styles.webDropdownOverlay}
          onPress={() => setShowDeptPickerModal(false)}
        >
          <Pressable
            style={styles.webDropdownCard}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              style={styles.webDropdownList}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity
                style={[
                  styles.webDropdownItem,
                  selectedJobDept === 'ALL' && styles.webDropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedJobDept('ALL');
                  setShowDeptPickerModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.webDropdownItemText,
                    selectedJobDept === 'ALL' && styles.webDropdownItemTextActive,
                  ]}
                >
                  Tất cả phòng ban
                </Text>
                {selectedJobDept === 'ALL' && (
                  <Ionicons name="checkmark" size={17} color="#2563EB" />
                )}
              </TouchableOpacity>

              {departments.map((d) => (
                <TouchableOpacity
                  key={d._id}
                  style={[
                    styles.webDropdownItem,
                    selectedJobDept === d._id && styles.webDropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedJobDept(d._id);
                    setShowDeptPickerModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.webDropdownItemText,
                      selectedJobDept === d._id && styles.webDropdownItemTextActive,
                    ]}
                  >
                    {d.name}
                  </Text>
                  {selectedJobDept === d._id && (
                    <Ionicons name="checkmark" size={17} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ─── MODAL CHỌN MỨC ƯU TIÊN CHO BỘ LỌC JD (GIỐNG WEB) ───────── */}
      <Modal
        visible={showPriorityPickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPriorityPickerModal(false)}
      >
        <Pressable
          style={styles.webDropdownOverlay}
          onPress={() => setShowPriorityPickerModal(false)}
        >
          <Pressable
            style={styles.webDropdownCard}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              style={styles.webDropdownList}
              showsVerticalScrollIndicator={false}
            >
              {[
                { id: 'ALL', label: 'Tất cả ưu tiên' },
                { id: 'HIGH', label: '▲ Gấp' },
                { id: 'MEDIUM', label: 'Bình thường' },
                { id: 'LOW', label: 'Thấp' },
              ].map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.webDropdownItem,
                    selectedJobPriority === p.id && styles.webDropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedJobPriority(p.id);
                    setShowPriorityPickerModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.webDropdownItemText,
                      selectedJobPriority === p.id && styles.webDropdownItemTextActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                  {selectedJobPriority === p.id && (
                    <Ionicons name="checkmark" size={17} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ─── MODAL CHUYỂN VÒNG ỨNG VIÊN ─── */}
      <Modal
        visible={showStageModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowStageModal(false)}
      >
        <View style={styles.stageModalOverlay}>
          <View style={styles.stageModalContent}>
            <View style={styles.stageModalHeader}>
              <Text style={styles.stageModalTitle}>Chuyển giai đoạn tuyển dụng</Text>
              <TouchableOpacity onPress={() => setShowStageModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.stageModalSubtitle}>
              Chọn vòng tuyển dụng mới cho ứng viên {getCandidateName(selectedCandidate)}
            </Text>

            {pipelineStages.map((stage) => {
              const isCurrent =
                selectedCandidate?.currentStageId === stage._id ||
                selectedCandidate?.stageName === stage.name;
              return (
                <TouchableOpacity
                  key={stage._id}
                  style={[
                    styles.stageOptionItem,
                    isCurrent && styles.stageOptionItemCurrent,
                  ]}
                  onPress={() => handleMoveStage(stage)}
                  disabled={actionLoading || isCurrent}
                >
                  <View
                    style={[
                      styles.stageOptionDot,
                      { backgroundColor: stage.color || '#2563EB' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.stageOptionName,
                      isCurrent && styles.stageOptionNameCurrent,
                    ]}
                  >
                    {stage.name}
                  </Text>
                  {isCurrent && (
                    <Ionicons name="checkmark-circle" size={18} color="#2563EB" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* ─── MODAL TỪ CHỐI ỨNG VIÊN ─── */}
      <Modal
        visible={showRejectModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.stageModalOverlay}>
          <View style={styles.stageModalContent}>
            <View style={styles.stageModalHeader}>
              <Text style={[styles.stageModalTitle, { color: '#EF4444' }]}>
                Từ chối ứng viên
              </Text>
              <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.stageModalSubtitle}>
              Lý do loại hồ sơ {getCandidateName(selectedCandidate)}:
            </Text>

            <TextInput
              style={styles.reasonInput}
              placeholder="Nhập lý do từ chối..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={rejectReason}
              onChangeText={setRejectReason}
            />

            <View style={styles.confirmRejectRow}>
              <TouchableOpacity
                style={styles.cancelRejectBtn}
                onPress={() => setShowRejectModal(false)}
              >
                <Text style={styles.cancelRejectText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmRejectBtn}
                onPress={handleConfirmReject}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmRejectText}>Xác nhận từ chối</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default RecruitmentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    marginBottom: 10,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 11,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0F172A',
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },

  // Sub-filter row
  subFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  subFilterPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 4,
  },
  subFilterPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  subFilterPillText: {
    flex: 1,
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  subFilterPillTextActive: {
    color: '#1E3A8A',
    fontWeight: '700',
  },
  subFilterResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  subFilterResetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },

  // Stat Cards Row
  statCardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statCardItem: {
    width: 105,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statCardIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  statCardBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  statCardLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  statCardCount: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },

  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 110,
    gap: 12,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },

  // Candidate Card
  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  candidateTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  candidateAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  candidateAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },
  candidateMainInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  candidatePos: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  candidateDept: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  aiBadgeHigh: { backgroundColor: '#10B981' },
  aiBadgeMedium: { backgroundColor: '#F59E0B' },
  aiBadgeLow: { backgroundColor: '#94A3B8' },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  candidateMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stageBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  appliedDate: {
    fontSize: 10.5,
    color: '#94A3B8',
  },

  // Job Card (Khớp Ảnh 1 & 4)
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  jobTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  jobHeaderInfo: {
    flex: 1,
    marginRight: 8,
  },
  jobTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 19,
  },
  jobDept: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  jobBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  jobBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  jobTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  priorityTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityTagText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  metaTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  metaTagText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '600',
  },
  jobMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
    paddingTop: 4,
  },
  jobMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobMetaText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
  },
  jobBottomActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  jobDeadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobDeadlineText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  quickReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  quickReviewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },

  // Modal common styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    maxHeight: '85%',
  },
  modalDragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  modalHeaderInfo: {
    flex: 1,
  },
  modalName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalPos: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalBody: {
    marginTop: 10,
  },
  modalSection: {
    marginBottom: 14,
  },
  modalSectionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12.5,
    color: '#475569',
  },
  descriptionParagraphText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
  },
  jobDetailStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobDetailStatusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  jobActionsCol: {
    gap: 8,
    marginTop: 4,
  },
  jobActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  jobActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // ─── REVIEW MODAL STYLES (KHỚP 100% ẢNH 3) ───
  modalBackdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  reviewModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  reviewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  reviewModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewHeaderIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  reviewModalSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  reviewModalCloseBtn: {
    padding: 4,
  },
  reviewInfoSummaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    gap: 8,
  },
  reviewInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewInfoLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  reviewInfoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    maxWidth: '65%',
    textAlign: 'right',
  },
  reviewSection: {
    marginBottom: 12,
  },
  reviewSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  reviewDecisionButtonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  reviewDecisionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  reviewDecisionBtnInactive: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  reviewDecisionBtnApproveActive: {
    backgroundColor: '#059669',
  },
  reviewDecisionBtnRejectActive: {
    backgroundColor: '#DC2626',
  },
  reviewDecisionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  reviewDecisionBtnTextActive: {
    color: '#FFFFFF',
  },
  reviewNoteInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    fontSize: 12.5,
    color: '#0F172A',
    textAlignVertical: 'top',
    height: 70,
  },
  reviewCharCount: {
    fontSize: 10.5,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 4,
  },
  reviewFooterButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  reviewCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  reviewConfirmSubmitBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  bgGreenButton: {
    backgroundColor: '#059669',
  },
  bgRedButton: {
    backgroundColor: '#DC2626',
  },
  reviewConfirmSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ─── WEB-STYLE FLOATING DROPDOWN MODAL (KHỚP 100% ẢNH 3) ───
  webDropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  webDropdownCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  webDropdownList: {
    maxHeight: 280,
  },
  webDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 2,
  },
  webDropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  webDropdownItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  webDropdownItemTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },

  // Stage Modal styles
  stageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stageModalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    maxWidth: 400,
  },
  stageModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stageModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  stageModalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  stageOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  stageOptionItemCurrent: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  stageOptionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stageOptionName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  stageOptionNameCurrent: {
    color: '#2563EB',
    fontWeight: '800',
  },
  reasonInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    fontSize: 12.5,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    textAlignVertical: 'top',
    height: 80,
    marginBottom: 14,
  },
  confirmRejectRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelRejectBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelRejectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmRejectBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  confirmRejectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
