import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminService, InterviewItem } from '../../../services/admin.services';

interface InterviewEvaluationModalProps {
  visible: boolean;
  onClose: () => void;
  interview: InterviewItem | null;
  onSuccess: () => void;
}

export const InterviewEvaluationModal: React.FC<InterviewEvaluationModalProps> = ({
  visible,
  onClose,
  interview,
  onSuccess,
}) => {
  const [result, setResult] = useState<string>('PASS');
  const [status, setStatus] = useState<string>('COMPLETED');
  const [feedback, setFeedback] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (visible && interview) {
      setResult(interview.result === 'FAIL' ? 'FAIL' : 'PASS');
      setStatus(interview.status || 'COMPLETED');
      setFeedback(interview.feedback || '');
    }
  }, [visible, interview]);

  if (!visible || !interview) return null;

  const cand = interview.candidateId;
  const candName = typeof cand === 'object' ? cand?.fullName || cand?.name : 'Ứng viên';
  const job = interview.jobDescriptionId;
  const jobTitle = typeof job === 'object' ? job?.title : 'Vị trí tuyển dụng';

  const handleSave = async () => {
    try {
      setSubmitting(true);
      await adminService.updateInterviewStatus(interview._id, {
        status,
        result,
        feedback: feedback.trim(),
      });
      Alert.alert('Thành công', 'Đã lưu kết quả và đánh giá phỏng vấn thành công.');
      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert(
        'Lỗi',
        err?.response?.data?.message || err?.message || 'Không thể lưu kết quả phỏng vấn.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Đánh giá & Cập nhật Kết quả</Text>
              <Text style={styles.headerSub}>
                Ứng viên: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{candName}</Text> • {jobTitle}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* 1. Kết quả phỏng vấn */}
            <Text style={styles.sectionLabel}>Kết quả phỏng vấn *</Text>
            <View style={styles.choiceRow}>
              <TouchableOpacity
                style={[styles.choiceBtn, result === 'PASS' && styles.choiceBtnActiveGreen]}
                onPress={() => setResult('PASS')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={result === 'PASS' ? '#059669' : '#64748B'}
                />
                <Text style={[styles.choiceBtnText, result === 'PASS' && styles.choiceBtnTextGreen]}>
                  Đạt (PASS)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.choiceBtn, result === 'FAIL' && styles.choiceBtnActiveRed]}
                onPress={() => setResult('FAIL')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={result === 'FAIL' ? '#DC2626' : '#64748B'}
                />
                <Text style={[styles.choiceBtnText, result === 'FAIL' && styles.choiceBtnTextRed]}>
                  Không đạt (FAIL)
                </Text>
              </TouchableOpacity>
            </View>

            {/* 2. Trạng thái buổi hẹn */}
            <Text style={styles.sectionLabel}>Trạng thái buổi hẹn *</Text>
            <View style={styles.choiceRow}>
              {[
                { id: 'COMPLETED', label: 'Hoàn thành' },
                { id: 'IN_PROGRESS', label: 'Đang diễn ra' },
                { id: 'SCHEDULED', label: 'Chờ diễn ra' },
                { id: 'CANCELLED', label: 'Hủy lịch' },
              ].map((st) => (
                <TouchableOpacity
                  key={st.id}
                  style={[styles.statusPill, status === st.id && styles.statusPillActive]}
                  onPress={() => setStatus(st.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.statusPillText, status === st.id && styles.statusPillTextActive]}
                  >
                    {st.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 3. Nhận xét & Đánh giá chi tiết */}
            <Text style={styles.sectionLabel}>Nhận xét / Đánh giá chi tiết</Text>
            <TextInput
              style={styles.feedbackInput}
              multiline
              numberOfLines={4}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Nhập nhận xét về chuyên môn, thái độ, mức độ phù hợp văn hóa..."
              placeholderTextColor="#94A3B8"
              textAlignVertical="top"
            />

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={17} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Lưu kết quả phỏng vấn</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  dragHandle: {
    width: 38,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  choiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  choiceBtnActiveGreen: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  choiceBtnTextGreen: {
    color: '#059669',
    fontWeight: '700',
  },
  choiceBtnActiveRed: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  choiceBtnTextRed: {
    color: '#DC2626',
    fontWeight: '700',
  },
  choiceBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  statusPillActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  statusPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  statusPillTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    minHeight: 90,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default InterviewEvaluationModal;
