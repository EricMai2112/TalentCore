import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CandidateApplication } from '../../../services/admin.services';

interface RejectCandidateModalProps {
  visible: boolean;
  candidate: CandidateApplication | null;
  onClose: () => void;
  onConfirm: (candidateId: string, reason: string) => Promise<void>;
}

const PRESET_REASONS = [
  'Kỹ năng chưa phù hợp với yêu cầu vị trí',
  'Kỳ vọng mức lương không đáp ứng ngân sách',
  'Chưa đủ số năm kinh nghiệm yêu cầu',
  'Không phản hồi hoặc vắng mặt khi phỏng vấn',
  'Ứng viên chủ động rút hồ sơ ứng tuyển',
  'Lý do khác',
];

export const RejectCandidateModal: React.FC<RejectCandidateModalProps> = ({
  visible,
  candidate,
  onClose,
  onConfirm,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(PRESET_REASONS[0]);
  const [customNote, setCustomNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!candidate) return null;

  const candidateName =
    candidate.candidateId?.userId?.name ||
    candidate.candidateId?.fullName ||
    candidate.candidateId?.profileName ||
    'Ứng viên';

  const handleConfirm = async () => {
    const finalReason =
      selectedReason === 'Lý do khác'
        ? customNote.trim()
        : customNote.trim()
        ? `${selectedReason}: ${customNote.trim()}`
        : selectedReason;

    if (!finalReason) {
      Alert.alert('Yêu cầu', 'Vui lòng chọn hoặc nhập lý do từ chối.');
      return;
    }

    try {
      setLoading(true);
      await onConfirm(candidate._id, finalReason);
      setCustomNote('');
      setSelectedReason(PRESET_REASONS[0]);
      onClose();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể từ chối ứng viên');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.dialogCard} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="close-circle" size={24} color="#DC2626" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Từ chối ứng viên</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {candidateName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.sectionLabel}>Chọn lý do từ chối:</Text>
            <View style={styles.reasonList}>
              {PRESET_REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonItem, isSelected && styles.reasonItemActive]}
                    onPress={() => setSelectedReason(reason)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={16}
                      color={isSelected ? '#DC2626' : '#94A3B8'}
                    />
                    <Text
                      style={[styles.reasonText, isSelected && styles.reasonTextActive]}
                      numberOfLines={1}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 12 }]}>
              Ghi chú thêm (Tùy chọn):
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập ghi chú chi tiết gửi tới hội đồng tuyển dụng..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={customNote}
              onChangeText={setCustomNote}
            />
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.confirmBtnText}>Xác nhận từ chối</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default RejectCandidateModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  reasonList: {
    gap: 6,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  reasonItemActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  reasonText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },
  reasonTextActive: {
    color: '#DC2626',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    fontSize: 12,
    color: '#0F172A',
    minHeight: 65,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
