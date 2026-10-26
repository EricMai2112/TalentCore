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
  Linking,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminService, InterviewItem } from '../../services/admin.services';

export const InterviewsScreen: React.FC = () => {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedInterview, setSelectedInterview] = useState<InterviewItem | null>(null);
  const [editStatus, setEditStatus] = useState<string>('COMPLETED');
  const [editResult, setEditResult] = useState<string>('PASS');
  const [editFeedback, setEditFeedback] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      const list = await adminService.getInterviews();
      setInterviews(list);
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

  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      const candName =
        item.candidateId?.fullName || item.candidateId?.name || '';
      const jobTitle = item.jobDescriptionId?.title || '';
      const q = searchQuery.toLowerCase();

      const matchStatus =
        statusFilter === 'ALL' || item.status === statusFilter;

      const matchSearch =
        !searchQuery ||
        candName.toLowerCase().includes(q) ||
        jobTitle.toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [interviews, statusFilter, searchQuery]);

  const formatSchedule = (dateStr: string, start?: string, end?: string) => {
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
      Alert.alert('Thông báo', 'Cuộc hẹn này không có liên kết Google Meet.');
      return;
    }
    Linking.openURL(link).catch(() => {
      Alert.alert('Lỗi', 'Không thể mở ứng dụng Google Meet.');
    });
  };

  const openActionModal = (item: InterviewItem) => {
    setSelectedInterview(item);
    setEditStatus(item.status || 'COMPLETED');
    setEditResult(item.result || 'PASS');
    setEditFeedback(item.feedback || '');
  };

  const handleSaveInterviewStatus = async () => {
    if (!selectedInterview) return;
    try {
      setActionLoading(true);
      await adminService.updateInterviewStatus(selectedInterview._id, {
        status: editStatus,
        result: editResult,
        feedback: editFeedback,
      });
      Alert.alert('Thành công', 'Đã cập nhật trạng thái buổi phỏng vấn.');
      setSelectedInterview(null);
      fetchData();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật phỏng vấn');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'UPCOMING':
        return { label: 'Sắp diễn ra', color: '#7C3AED', bg: '#F5F3FF' };
      case 'SCHEDULED':
        return { label: 'Chờ xác nhận', color: '#D97706', bg: '#FFFBEB' };
      case 'IN_PROGRESS':
        return { label: 'Đang diễn ra', color: '#2563EB', bg: '#EFF6FF' };
      case 'COMPLETED':
        return { label: 'Đã hoàn thành', color: '#059669', bg: '#ECFDF5' };
      case 'CANCELLED':
        return { label: 'Đã hủy', color: '#EF4444', bg: '#FEE2E2' };
      default:
        return { label: status || 'Lên lịch', color: '#64748B', bg: '#F1F5F9' };
    }
  };

  const getResultBadge = (result?: string) => {
    switch (result) {
      case 'PASS':
        return { label: 'Đạt (Pass)', color: '#059669', bg: '#ECFDF5' };
      case 'FAIL':
        return { label: 'Chưa đạt (Fail)', color: '#EF4444', bg: '#FEE2E2' };
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo ứng viên, vị trí tuyển dụng..."
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'UPCOMING', label: 'Sắp diễn ra' },
            { id: 'SCHEDULED', label: 'Chờ xác nhận' },
            { id: 'COMPLETED', label: 'Đã hoàn thành' },
            { id: 'CANCELLED', label: 'Đã hủy' },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setStatusFilter(tab.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
          {filteredInterviews.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Không có cuộc phỏng vấn nào</Text>
              <Text style={styles.emptySubtitle}>Các lịch phỏng vấn đồng bộ từ web sẽ hiển thị tại đây</Text>
            </View>
          ) : (
            filteredInterviews.map((item) => {
              const candName =
                item.candidateId?.fullName || item.candidateId?.name || 'Ứng viên';
              const jobTitle =
                item.jobDescriptionId?.title || 'Vị trí tuyển dụng';
              const deptName = item.jobDescriptionId?.departmentId?.name;
              const interviewerName = item.interviewerId?.name;
              const statusInfo = getStatusBadge(item.status);
              const resultInfo = getResultBadge(item.result);

              return (
                <View key={item._id} style={styles.interviewCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.headerInfo}>
                      <Text style={styles.candidateName}>{candName}</Text>
                      <Text style={styles.jobTitle}>{jobTitle}</Text>
                      {deptName && <Text style={styles.deptName}>{deptName}</Text>}
                    </View>
                    <View style={styles.badgeColumn}>
                      <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                          {statusInfo.label}
                        </Text>
                      </View>
                      {resultInfo && (
                        <View style={[styles.statusBadge, { backgroundColor: resultInfo.bg, marginTop: 4 }]}>
                          <Text style={[styles.statusBadgeText, { color: resultInfo.color }]}>
                            {resultInfo.label}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.detailsBox}>
                    <View style={styles.detailRow}>
                      <Ionicons name="time" size={15} color="#2563EB" />
                      <Text style={styles.detailTimeText}>
                        {formatSchedule(item.date, item.startTime, item.endTime)}
                      </Text>
                    </View>

                    {interviewerName && (
                      <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={15} color="#64748B" />
                        <Text style={styles.detailText}>
                          Phỏng vấn bởi: {interviewerName}
                        </Text>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Ionicons
                        name={item.locationType === 'ONLINE' ? 'videocam-outline' : 'business-outline'}
                        size={15}
                        color="#64748B"
                      />
                      <Text style={styles.detailText}>
                        Hình thức: {item.locationType === 'ONLINE' ? 'Trực tuyến (Google Meet)' : item.offsiteLocation || 'Tại văn phòng'}
                      </Text>
                    </View>

                    {item.feedback && (
                      <View style={styles.feedbackBox}>
                        <Text style={styles.feedbackLabel}>Đánh giá:</Text>
                        <Text style={styles.feedbackText}>{item.feedback}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.btnActionRow}>
                    {item.locationType === 'ONLINE' && item.meetingLink && (
                      <TouchableOpacity
                        style={styles.meetBtn}
                        onPress={() => handleOpenMeet(item.meetingLink)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="videocam" size={15} color="#FFFFFF" />
                        <Text style={styles.meetBtnText}>Vào Google Meet</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.updateStatusBtn}
                      onPress={() => openActionModal(item)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="create-outline" size={15} color="#2563EB" />
                      <Text style={styles.updateStatusBtnText}>Cập nhật kết quả</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      <Modal
        visible={!!selectedInterview}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedInterview(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setSelectedInterview(null)}
            activeOpacity={1}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalDragHandle} />
            {selectedInterview && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalAvatarCircle}>
                    <Ionicons name="calendar" size={20} color="#2563EB" />
                  </View>
                  <View style={styles.modalHeaderInfo}>
                    <Text style={styles.modalName}>
                      {selectedInterview.candidateId?.fullName || selectedInterview.candidateId?.name}
                    </Text>
                    <Text style={styles.modalPos}>
                      {selectedInterview.jobDescriptionId?.title}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedInterview(null)}
                  >
                    <Ionicons name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <Text style={styles.fieldLabel}>Kết quả phỏng vấn</Text>
                  <View style={styles.choiceRow}>
                    <TouchableOpacity
                      style={[
                        styles.choiceBtn,
                        editResult === 'PASS' && styles.choiceBtnActiveGreen,
                      ]}
                      onPress={() => setEditResult('PASS')}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={editResult === 'PASS' ? '#059669' : '#64748B'}
                      />
                      <Text
                        style={[
                          styles.choiceBtnText,
                          editResult === 'PASS' && styles.choiceBtnTextGreen,
                        ]}
                      >
                        Đạt (PASS)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.choiceBtn,
                        editResult === 'FAIL' && styles.choiceBtnActiveRed,
                      ]}
                      onPress={() => setEditResult('FAIL')}
                    >
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={editResult === 'FAIL' ? '#EF4444' : '#64748B'}
                      />
                      <Text
                        style={[
                          styles.choiceBtnText,
                          editResult === 'FAIL' && styles.choiceBtnTextRed,
                        ]}
                      >
                        Không đạt (FAIL)
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.fieldLabel}>Trạng thái buổi hẹn</Text>
                  <View style={styles.choiceRow}>
                    {[
                      { id: 'COMPLETED', label: 'Hoàn thành' },
                      { id: 'SCHEDULED', label: 'Chờ diễn ra' },
                      { id: 'CANCELLED', label: 'Hủy lịch' },
                    ].map((st) => (
                      <TouchableOpacity
                        key={st.id}
                        style={[
                          styles.statusOptionBtn,
                          editStatus === st.id && styles.statusOptionBtnActive,
                        ]}
                        onPress={() => setEditStatus(st.id)}
                      >
                        <Text
                          style={[
                            styles.statusOptionBtnText,
                            editStatus === st.id && styles.statusOptionBtnTextActive,
                          ]}
                        >
                          {st.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.fieldLabel}>Nhận xét / Đánh giá chi tiết</Text>
                  <TextInput
                    style={styles.feedbackInput}
                    multiline
                    numberOfLines={4}
                    value={editFeedback}
                    onChangeText={setEditFeedback}
                    placeholder="Nhập nhận xét phỏng vấn, năng lực chuyên môn, thái độ..."
                    placeholderTextColor="#94A3B8"
                  />

                  <TouchableOpacity
                    style={styles.saveActionBtn}
                    onPress={handleSaveInterviewStatus}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="save-outline" size={17} color="#FFFFFF" />
                        <Text style={styles.saveActionBtnText}>Lưu kết quả phỏng vấn</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default InterviewsScreen;

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
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
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
    paddingVertical: 60,
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
  interviewCard: {
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
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerInfo: {
    flex: 1,
    paddingRight: 8,
  },
  candidateName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  deptName: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  badgeColumn: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  detailText: {
    fontSize: 12.5,
    color: '#475569',
  },
  feedbackBox: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 2,
  },
  feedbackLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  feedbackText: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
  },
  btnActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  meetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  meetBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  updateStatusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  updateStatusBtnText: {
    color: '#2563EB',
    fontSize: 12.5,
    fontWeight: '700',
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
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
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    marginTop: 6,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  choiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  choiceBtnActiveGreen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  choiceBtnActiveRed: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  choiceBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  choiceBtnTextGreen: {
    color: '#059669',
    fontWeight: '800',
  },
  choiceBtnTextRed: {
    color: '#EF4444',
    fontWeight: '800',
  },
  statusOptionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  statusOptionBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  statusOptionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  statusOptionBtnTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  feedbackInput: {
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
  saveActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    marginBottom: 20,
  },
  saveActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
