import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CandidateInterviewItem } from '../../../types/application.types';
import { applicationService } from '../../../services/application.service';
import { HrContactNoteCallout } from './HrContactNoteCallout';

interface ConfirmInterviewModalProps {
  visible: boolean;
  onClose: () => void;
  interview: CandidateInterviewItem | null;
  onSuccess: () => void;
}

export const ConfirmInterviewModal: React.FC<ConfirmInterviewModalProps> = ({
  visible,
  onClose,
  interview,
  onSuccess,
}) => {
  const [submitting, setSubmitting] = useState(false);

  if (!interview) return null;

  const job = interview.jobDescriptionId;
  const deptName =
    typeof job?.departmentId === 'object' ? job?.departmentId?.name : 'IT & Engineering';
  const interviewerName =
    interview.interviewerId?.name ||
    interview.interviewerIds?.[0]?.name ||
    'Hội đồng phỏng vấn';
  const isOnline = interview.locationType === 'ONLINE' || !interview.locationType;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      const ok = await applicationService.confirmInterview(interview._id);
      if (ok) {
        onSuccess();
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="checkmark-circle" size={24} color="#059669" />
              </View>
              <View style={styles.headerTitleWrap}>
                <Text style={styles.headerTitle}>Xác nhận Lịch phỏng vấn</Text>
                <Text style={styles.headerSub}>
                  Xem chi tiết thông tin và xác nhận tham gia buổi phỏng vấn
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Ionicons name="close" size={20} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollBodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Vị trí ứng tuyển Card */}
            <View style={styles.jobCard}>
              <Text style={styles.jobCategoryLabel}>VỊ TRÍ ỨNG TUYỂN</Text>
              <Text style={styles.jobTitleText}>{job?.title || 'Vị trí công việc'}</Text>
              <View style={styles.deptRow}>
                <Ionicons name="business-outline" size={13} color="#64748b" />
                <Text style={styles.deptText}>{deptName}</Text>
              </View>

              <View style={styles.cardDivider} />

              {/* Details List */}
              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={15} color="#4f46e5" />
                  <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Ngày phỏng vấn: </Text>
                    {formatDate(interview.date)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={15} color="#4f46e5" />
                  <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Khung giờ: </Text>
                    {interview.startTime} - {interview.endTime}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons
                    name={isOnline ? 'videocam-outline' : 'location-outline'}
                    size={15}
                    color={isOnline ? '#0284c7' : '#d97706'}
                  />
                  <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Hình thức: </Text>
                    {isOnline
                      ? 'Phỏng vấn Online (Jitsi Meet)'
                      : interview.offsiteLocation || 'Trực tiếp tại văn phòng'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={15} color="#7c3aed" />
                  <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Hội đồng / Người phỏng vấn: </Text>
                    {interviewerName}
                  </Text>
                </View>
              </View>
            </View>

            {/* Ghi chú từ HR */}
            <HrContactNoteCallout phone="0987654321" zaloPhone="0987654321" />
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Pressable
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.cancelBtnText}>Hủy / Đóng</Text>
            </Pressable>

            <Pressable
              style={styles.confirmBtn}
              onPress={handleConfirm}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
                  <Text style={styles.confirmBtnText}>Xác nhận tham gia phỏng vấn</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 1,
    borderBottomColor: '#dcfce7',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    maxHeight: 460,
  },
  scrollBodyContent: {
    padding: 16,
    gap: 12,
  },
  jobCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  jobCategoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4f46e5',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  jobTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 3,
  },
  deptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  deptText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 10,
  },
  detailsList: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
  },
  detailLabel: {
    fontWeight: '700',
    color: '#0f172a',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  cancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
