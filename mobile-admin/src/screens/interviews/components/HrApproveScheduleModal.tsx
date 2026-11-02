import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminService, InterviewItem } from '../../../services/admin.services';

interface HrApproveScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  interview: InterviewItem | null;
  onSuccess: () => void;
}

export const HrApproveScheduleModal: React.FC<HrApproveScheduleModalProps> = ({
  visible,
  onClose,
  interview,
  onSuccess,
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!visible || !interview) return null;

  const cand = interview.candidateId;
  const candName = typeof cand === 'object' ? cand?.fullName || cand?.name : 'Ứng viên';
  const job = interview.jobDescriptionId;
  const jobTitle = typeof job === 'object' ? job?.title : 'Vị trí tuyển dụng';
  const deptName =
    typeof job === 'object' && typeof job?.departmentId === 'object'
      ? (job?.departmentId as any)?.name
      : 'Phòng ban';

  const interviewerName =
    typeof interview.interviewerId === 'object'
      ? interview.interviewerId?.name || interview.interviewerId?.email
      : 'Chưa chỉ định';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await adminService.hrApproveSchedule(interview._id);
      Alert.alert('Thành công', 'Đã duyệt lịch phỏng vấn thành công.');
      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert(
        'Lỗi',
        err?.response?.data?.message || err?.message || 'Không thể duyệt lịch phỏng vấn.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar-outline" size={20} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Phê duyệt Lịch phỏng vấn</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                Ứng viên: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{candName}</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={17} color="#2563EB" />
            <Text style={styles.infoBannerText}>
              Trưởng phòng ban <Text style={{ fontWeight: '700' }}>{deptName}</Text> đã xếp lịch phỏng vấn bên dưới. Sau khi bạn bấm đồng ý duyệt, lịch hẹn sẽ được chốt và gửi thông báo tới ứng viên.
            </Text>
          </View>

          {/* Details Table */}
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Ionicons name="briefcase-outline" size={14} color="#64748B" />
              <Text style={styles.detailLabel}>Vị trí tuyển dụng:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{jobTitle}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={14} color="#64748B" />
              <Text style={styles.detailLabel}>Ngày phỏng vấn:</Text>
              <Text style={styles.detailValue}>{formatDate(interview.date)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={14} color="#64748B" />
              <Text style={styles.detailLabel}>Khung giờ:</Text>
              <Text style={styles.detailValue}>
                {interview.startTime || '09:00'} - {interview.endTime || '10:00'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={14} color="#64748B" />
              <Text style={styles.detailLabel}>Interviewer:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{interviewerName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons
                name={interview.locationType === 'ONLINE' ? 'videocam-outline' : 'business-outline'}
                size={14}
                color="#64748B"
              />
              <Text style={styles.detailLabel}>Hình thức:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {interview.locationType === 'ONLINE'
                  ? 'Trực tuyến (Meet)'
                  : interview.offsiteLocation || 'Tại văn phòng'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.approveBtn}
              onPress={handleApprove}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.approveBtnText}>Đồng ý duyệt lịch</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11.5,
    color: '#64748B',
  },
  closeBtn: {
    padding: 4,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 11.5,
    color: '#1E3A8A',
    lineHeight: 16,
  },
  detailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 11.5,
    color: '#64748B',
    width: 110,
  },
  detailValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 10,
  },
  approveBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default HrApproveScheduleModal;
