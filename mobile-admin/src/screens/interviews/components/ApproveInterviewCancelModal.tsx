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

interface ApproveInterviewCancelModalProps {
  visible: boolean;
  onClose: () => void;
  interview: InterviewItem | null;
  onSuccess: () => void;
}

export const ApproveInterviewCancelModal: React.FC<ApproveInterviewCancelModalProps> = ({
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
  const cancelReason = interview.cancelReason || 'Ứng viên gửi yêu cầu xin hủy buổi phỏng vấn.';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const handleConfirmCancel = async () => {
    try {
      setSubmitting(true);
      await adminService.approveCandidateCancellation(interview._id);
      Alert.alert('Thành công', 'Đã duyệt hủy lịch phỏng vấn theo yêu cầu của ứng viên.');
      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert(
        'Lỗi',
        err?.response?.data?.message || err?.message || 'Không thể duyệt yêu cầu hủy lịch.'
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
              <Ionicons name="calendar-outline" size={20} color="#E11D48" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Duyệt Yêu Cầu Hủy Lịch</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                Ứng viên: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{candName}</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Interview Details Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoJobText}>{jobTitle}</Text>
            <Text style={styles.infoScheduleText}>
              Ngày: {formatDate(interview.date)} • Khung giờ: {interview.startTime || '09:00'} -{' '}
              {interview.endTime || '10:00'}
            </Text>
          </View>

          {/* Cancellation Reason Box */}
          <View style={styles.reasonBox}>
            <View style={styles.reasonHeader}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#E11D48" />
              <Text style={styles.reasonLabel}>Lý do hủy từ Ứng viên:</Text>
            </View>
            <Text style={styles.reasonContent}>"{cancelReason}"</Text>
          </View>

          <Text style={styles.disclaimerText}>
            Sau khi duyệt, buổi phỏng vấn này sẽ chuyển sang trạng thái{' '}
            <Text style={{ fontWeight: '700', color: '#DC2626' }}>Đã hủy (Cancelled)</Text>.
          </Text>

          {/* Action Buttons */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={styles.cancelBtnText}>Đóng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.approveBtn}
              onPress={handleConfirmCancel}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={15} color="#FFFFFF" />
                  <Text style={styles.approveBtnText}>Xác nhận duyệt hủy</Text>
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
    backgroundColor: '#FFF1F2',
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
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  infoJobText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  infoScheduleText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  reasonBox: {
    backgroundColor: '#FFF1F2',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: 10,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  reasonLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#E11D48',
  },
  reasonContent: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#881337',
    lineHeight: 16,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 14,
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
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 10,
  },
  approveBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ApproveInterviewCancelModal;
