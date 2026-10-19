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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  adminService,
  CandidateApplication,
  JobDescriptionItem,
} from '../../services/admin.services';

interface StageItem {
  _id: string;
  name: string;
  color?: string;
}

export const RecruitmentScreen: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<'candidates' | 'jobs'>('candidates');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedJobStatus, setSelectedJobStatus] = useState<string>('ALL');

  const [candidates, setCandidates] = useState<CandidateApplication[]>([]);
  const [jobs, setJobs] = useState<JobDescriptionItem[]>([]);
  const [pipelineStages, setPipelineStages] = useState<StageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplication | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobDescriptionItem | null>(null);

  const [showStageModal, setShowStageModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('Hồ sơ chưa phù hợp với yêu cầu vị trí thời điểm hiện tại.');

  const fetchData = useCallback(async () => {
    try {
      const [candList, jobList, stages] = await Promise.all([
        adminService.getCandidates(),
        adminService.getJobs(),
        adminService.getPipelineStages(),
      ]);
      setCandidates(candList);
      setJobs(jobList);
      setPipelineStages(stages);
    } catch {
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

  const filteredJobs = useMemo(() => {
    return jobs.filter((item) => {
      const q = searchQuery.toLowerCase();
      const title = item.title || '';
      const dept =
        typeof item.departmentId === 'object'
          ? item.departmentId?.name || ''
          : item.departmentName || '';

      const matchSearch =
        !searchQuery || title.toLowerCase().includes(q) || dept.toLowerCase().includes(q);

      const matchStatus =
        selectedJobStatus === 'ALL' ||
        (selectedJobStatus === 'ACTIVE' &&
          (item.status === 'JD_CREATED' || item.status === 'APPROVED')) ||
        item.status === selectedJobStatus;

      return matchSearch && matchStatus;
    });
  }, [jobs, searchQuery, selectedJobStatus]);

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

  const handleUpdateJobStatus = async (status: string, label: string) => {
    if (!selectedJob) return;
    try {
      setActionLoading(true);
      await adminService.updateJobStatus(selectedJob._id, status);
      Alert.alert('Thành công', `Đã cập nhật trạng thái tin thành: ${label}`);
      setSelectedJob((prev) => (prev ? { ...prev, status } : null));
      fetchData();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật trạng thái');
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityInfo = (priority?: string) => {
    switch (priority) {
      case 'HIGH':
        return { label: 'Tuyển gấp', color: '#EF4444', bg: '#FEE2E2' };
      case 'MEDIUM':
        return { label: 'Bình thường', color: '#D97706', bg: '#FEF3C7' };
      case 'LOW':
        return { label: 'Ưu tiên thấp', color: '#64748B', bg: '#F1F5F9' };
      default:
        return { label: 'Bình thường', color: '#2563EB', bg: '#EFF6FF' };
    }
  };

  const getJobStatusInfo = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return { label: 'Đã duyệt', color: '#059669', bg: '#ECFDF5' };
      case 'PENDING':
        return { label: 'Chờ duyệt', color: '#D97706', bg: '#FFFBEB' };
      case 'JD_CREATED':
        return { label: 'Đang tuyển', color: '#2563EB', bg: '#EFF6FF' };
      case 'COMPLETED':
        return { label: 'Đã hoàn thành', color: '#64748B', bg: '#F1F5F9' };
      case 'REJECTED':
        return { label: 'Bị từ chối', color: '#EF4444', bg: '#FEE2E2' };
      default:
        return { label: status || 'Đang tuyển', color: '#2563EB', bg: '#EFF6FF' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.segmentContainer}>
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
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#94A3B8" />
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

        {activeSegment === 'candidates' ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipRow}
          >
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'Sàng lọc', label: 'Sàng lọc CV' },
              { id: 'Phỏng vấn', label: 'Phỏng vấn' },
              { id: 'Offer', label: 'Đề nghị (Offer)' },
              { id: 'tuyển', label: 'Đã tuyển' },
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipRow}
          >
            {[
              { id: 'ALL', label: `Tất cả (${jobs.length})` },
              { id: 'ACTIVE', label: 'Đang mở tuyển' },
              { id: 'PENDING', label: 'Chờ duyệt' },
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
        )}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563EB" />
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
                          <Ionicons
                            name="sparkles"
                            size={11}
                            color={
                              c.aiFitScore >= 85
                                ? '#059669'
                                : c.aiFitScore >= 70
                                ? '#D97706'
                                : '#475569'
                            }
                          />
                          <Text
                            style={[
                              styles.aiBadgeText,
                              {
                                color:
                                  c.aiFitScore >= 85
                                    ? '#059669'
                                    : c.aiFitScore >= 70
                                    ? '#D97706'
                                    : '#475569',
                              },
                            ]}
                          >
                            {c.aiFitScore}%
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.candidateBottomRow}>
                      <View style={styles.stageTag}>
                        <View
                          style={[
                            styles.stageDot,
                            { backgroundColor: c.stageColor || '#2563EB' },
                          ]}
                        />
                        <Text style={styles.stageText}>
                          {c.stageName || 'Vòng sơ tuyển'}
                        </Text>
                      </View>

                      <View style={styles.cardActionGroup}>
                        <TouchableOpacity
                          style={styles.quickStageBtn}
                          onPress={() => {
                            setSelectedCandidate(c);
                            setShowStageModal(true);
                          }}
                        >
                          <Ionicons name="swap-horizontal" size={13} color="#2563EB" />
                          <Text style={styles.quickStageText}>Chuyển vòng</Text>
                        </TouchableOpacity>

                        <Text style={styles.appliedDateText}>
                          {formatDate(c.appliedAt)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )
          ) : filteredJobs.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="briefcase-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Không tìm thấy tin tuyển dụng</Text>
              <Text style={styles.emptySubtitle}>Thử thay đổi từ khóa tìm kiếm</Text>
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

              return (
                <TouchableOpacity
                  key={j._id}
                  style={styles.jobCard}
                  onPress={() => setSelectedJob(j)}
                  activeOpacity={0.8}
                >
                  <View style={styles.jobTopRow}>
                    <View style={styles.jobHeaderInfo}>
                      <Text style={styles.jobTitle}>{j.title}</Text>
                      {deptName && <Text style={styles.jobDept}>{deptName}</Text>}
                    </View>
                    <View style={[styles.jobBadge, { backgroundColor: statusInfo.bg }]}>
                      <Text style={[styles.jobBadgeText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.jobTagRow}>
                    {j.priority && (
                      <View style={[styles.priorityTag, { backgroundColor: priorityInfo.bg }]}>
                        <Text style={[styles.priorityTagText, { color: priorityInfo.color }]}>
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

                  <View style={styles.jobMetaRow}>
                    <View style={styles.jobMetaItem}>
                      <Ionicons name="cash-outline" size={14} color="#64748B" />
                      <Text style={styles.jobMetaText}>
                        {formatSalary(salaryMin, salaryMax)}
                      </Text>
                    </View>
                    <View style={styles.jobMetaItem}>
                      <Ionicons name="people" size={14} color="#2563EB" />
                      <Text style={[styles.jobMetaText, { color: '#2563EB', fontWeight: '700' }]}>
                        {appCount} hồ sơ
                      </Text>
                    </View>
                  </View>

                  {deadline && (
                    <View style={styles.jobDeadlineRow}>
                      <Ionicons name="calendar-outline" size={13} color="#94A3B8" />
                      <Text style={styles.jobDeadlineText}>Hạn chót: {formatDate(deadline) || deadline}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      <Modal
        visible={!!selectedCandidate && !showStageModal && !showRejectModal}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedCandidate(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setSelectedCandidate(null)}
            activeOpacity={1}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalDragHandle} />
            {selectedCandidate && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalAvatarCircle}>
                    <Text style={styles.modalAvatarText}>
                      {getCandidateName(selectedCandidate).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.modalHeaderInfo}>
                    <Text style={styles.modalName}>
                      {getCandidateName(selectedCandidate)}
                    </Text>
                    <Text style={styles.modalPos}>
                      {selectedCandidate.jobDescriptionId?.title}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedCandidate(null)}
                  >
                    <Ionicons name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Thông tin liên hệ</Text>
                    <View style={styles.infoRow}>
                      <Ionicons name="mail-outline" size={15} color="#64748B" />
                      <Text style={styles.infoText}>
                        {getCandidateEmail(selectedCandidate) || 'Chưa cung cấp email'}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="call-outline" size={15} color="#64748B" />
                      <Text style={styles.infoText}>
                        {getCandidatePhone(selectedCandidate) || 'Chưa cung cấp số điện thoại'}
                      </Text>
                    </View>
                  </View>

                  {selectedCandidate.aiEvaluation && (
                    <View style={styles.aiInsightBox}>
                      <View style={styles.aiInsightHeader}>
                        <Ionicons name="sparkles" size={15} color="#2563EB" />
                        <Text style={styles.aiInsightTitle}>
                          AI Đánh giá Phù hợp ({selectedCandidate.aiFitScore}%)
                        </Text>
                      </View>
                      {selectedCandidate.aiEvaluation.overallRecommendation && (
                        <Text style={styles.aiRecommendationText}>
                          Khuyến nghị: {selectedCandidate.aiEvaluation.overallRecommendation}
                        </Text>
                      )}
                      {selectedCandidate.aiEvaluation.summary && (
                        <Text style={styles.aiInsightText}>
                          {selectedCandidate.aiEvaluation.summary}
                        </Text>
                      )}
                    </View>
                  )}

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Vòng tuyển dụng hiện tại</Text>
                    <TouchableOpacity
                      style={styles.stageSelectBox}
                      onPress={() => setShowStageModal(true)}
                    >
                      <Ionicons name="layers-outline" size={18} color="#2563EB" />
                      <Text style={styles.stageSelectText}>
                        {selectedCandidate.stageName || 'Đang xử lý'}
                      </Text>
                      <View style={styles.stageChangeHint}>
                        <Text style={styles.stageChangeHintText}>Đổi vòng</Text>
                        <Ionicons name="chevron-forward" size={14} color="#2563EB" />
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.actionButtonContainer}>
                    <TouchableOpacity
                      style={styles.moveStageBtn}
                      onPress={() => setShowStageModal(true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
                      <Text style={styles.moveStageBtnText}>Chuyển giai đoạn tuyển dụng</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => setShowRejectModal(true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
                      <Text style={styles.rejectBtnText}>Từ chối hồ sơ ứng viên</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showStageModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowStageModal(false)}
      >
        <View style={styles.stageModalOverlay}>
          <View style={styles.stageModalContent}>
            <View style={styles.stageModalHeader}>
              <Text style={styles.stageModalTitle}>Chọn vòng tuyển dụng</Text>
              <TouchableOpacity onPress={() => setShowStageModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.stageModalSubtitle}>
              Di chuyển hồ sơ của {getCandidateName(selectedCandidate)} sang bước tiếp theo
            </Text>

            <ScrollView style={{ maxHeight: 300 }}>
              {pipelineStages.map((stage) => {
                const isCurrent = selectedCandidate?.currentStageId === stage._id;
                return (
                  <TouchableOpacity
                    key={stage._id}
                    style={[styles.stageOptionItem, isCurrent && styles.stageOptionItemCurrent]}
                    onPress={() => handleMoveStage(stage)}
                    disabled={actionLoading}
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
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showRejectModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.stageModalOverlay}>
          <View style={styles.stageModalContent}>
            <View style={styles.stageModalHeader}>
              <Text style={[styles.stageModalTitle, { color: '#EF4444' }]}>Từ chối hồ sơ</Text>
              <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.stageModalSubtitle}>
              Nhập lý do từ chối ứng viên {getCandidateName(selectedCandidate)}:
            </Text>

            <TextInput
              style={styles.reasonInput}
              multiline
              numberOfLines={3}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Nhập lý do từ chối..."
              placeholderTextColor="#94A3B8"
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

      <Modal
        visible={!!selectedJob}
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
                  <View style={[styles.modalAvatarCircle, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                    <Ionicons name="briefcase" size={22} color="#16A34A" />
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
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Chi tiết công việc</Text>
                    <View style={styles.infoRow}>
                      <Ionicons name="cash-outline" size={15} color="#64748B" />
                      <Text style={styles.infoText}>
                        Mức lương: {formatSalary(selectedJob.minimumSalary ?? selectedJob.salaryMin, selectedJob.maximumSalary ?? selectedJob.salaryMax)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="people-outline" size={15} color="#64748B" />
                      <Text style={styles.infoText}>
                        Số lượng hồ sơ: {applicantCountMap[selectedJob._id] ?? selectedJob.applicantCount ?? 0} hồ sơ đã nộp
                      </Text>
                    </View>
                    {(selectedJob.experienceLevel || selectedJob.level) && (
                      <View style={styles.infoRow}>
                        <Ionicons name="ribbon-outline" size={15} color="#64748B" />
                        <Text style={styles.infoText}>Cấp bậc: {selectedJob.experienceLevel || selectedJob.level}</Text>
                      </View>
                    )}
                    {selectedJob.employmentType && (
                      <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={15} color="#64748B" />
                        <Text style={styles.infoText}>Hình thức: {selectedJob.employmentType}</Text>
                      </View>
                    )}
                    {(selectedJob.applicationDeadline || selectedJob.deadline) && (
                      <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={15} color="#64748B" />
                        <Text style={styles.infoText}>
                          Hạn nộp hồ sơ: {formatDate(selectedJob.applicationDeadline || selectedJob.deadline) || (selectedJob.applicationDeadline || selectedJob.deadline)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Thao tác quản lý tin tuyển dụng</Text>
                    <View style={styles.jobActionsCol}>
                      <TouchableOpacity
                        style={[styles.jobActionBtn, { backgroundColor: '#10B981' }]}
                        onPress={() => handleUpdateJobStatus('APPROVED', 'Đã duyệt')}
                        disabled={actionLoading}
                      >
                        <Ionicons name="checkmark-done-circle" size={17} color="#FFFFFF" />
                        <Text style={styles.jobActionBtnText}>Duyệt tin tuyển dụng</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.jobActionBtn, { backgroundColor: '#3B82F6' }]}
                        onPress={() => handleUpdateJobStatus('COMPLETED', 'Đã hoàn thành')}
                        disabled={actionLoading}
                      >
                        <Ionicons name="lock-closed" size={17} color="#FFFFFF" />
                        <Text style={styles.jobActionBtnText}>Đóng tin / Hoàn thành tuyển dụng</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.jobActionBtn, { backgroundColor: '#EF4444' }]}
                        onPress={() => handleUpdateJobStatus('REJECTED', 'Từ chối')}
                        disabled={actionLoading}
                      >
                        <Ionicons name="close-circle" size={17} color="#FFFFFF" />
                        <Text style={styles.jobActionBtnText}>Hủy / Từ chối tin</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
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
    paddingHorizontal: 16,
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
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 100,
    gap: 12,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#94A3B8',
  },
  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  candidateTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  candidateAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  candidateAvatarText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2563EB',
  },
  candidateMainInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  candidatePos: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2563EB',
  },
  candidateDept: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  aiBadgeHigh: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  aiBadgeMedium: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  aiBadgeLow: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  candidateBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  stageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  stageText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
  cardActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickStageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  quickStageText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
  },
  appliedDateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  jobTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  jobHeaderInfo: {
    flex: 1,
    paddingRight: 10,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  jobDept: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  jobBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  jobBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  jobTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priorityTagText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  metaTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  metaTagText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  jobMetaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  jobMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jobMetaText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  jobDeadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  jobDeadlineText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  modalDragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  modalAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalPos: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    maxHeight: 460,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#475569',
  },
  aiInsightBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  aiInsightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aiInsightTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  aiRecommendationText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 4,
  },
  aiInsightText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },
  stageSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  stageSelectText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  stageChangeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  stageChangeHintText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  actionButtonContainer: {
    gap: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  moveStageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  moveStageBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  rejectBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
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
    padding: 20,
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
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 14,
  },
  stageOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stageOptionName: {
    flex: 1,
    fontSize: 13.5,
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
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    textAlignVertical: 'top',
    height: 90,
    marginBottom: 16,
  },
  confirmRejectRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelRejectBtn: {
    flex: 1,
    paddingVertical: 12,
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
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  confirmRejectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  jobActionsCol: {
    gap: 10,
    marginTop: 6,
  },
  jobActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  jobActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
