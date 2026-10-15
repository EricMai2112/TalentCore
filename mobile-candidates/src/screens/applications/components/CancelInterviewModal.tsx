import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CandidateInterviewItem } from '../../../types/application.types';
import { applicationService } from '../../../services/application.service';

interface CancelInterviewModalProps {
  visible: boolean;
  onClose: () => void;
  interview: CandidateInterviewItem | null;
  onSuccess: () => void;
}

export const CancelInterviewModal: React.FC<CancelInterviewModalProps> = ({
  visible,
  onClose,
  interview,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!interview) return null;

  const handleCancel = async () => {
    if (!reason.trim()) {
      setErrorMessage('Vui lòng nhập lý do hủy lịch phỏng vấn.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      const ok = await applicationService.submitCancelRequest(
        interview._id,
        reason.trim(),
      );
      if (ok) {
        Alert.alert('Thành công', 'Đã gửi yêu cầu hủy lịch phỏng vấn đến nhà tuyển dụng.');
        onSuccess();
        onClose();
        setReason('');
      } else {
        setErrorMessage('Không thể gửi yêu cầu hủy lúc này. Vui lòng thử lại sau.');
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
                <Ionicons name="alert-circle" size={24} color="#e11d48" />
              </View>
              <View style={styles.headerTitleWrap}>
                <Text style={styles.headerTitle}>Yêu cầu hủy lịch phỏng vấn</Text>
                <Text style={styles.headerSub}>
                  Nhà tuyển dụng sẽ nhận được thông báo và xem xét lý do của bạn
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
            {/* Lưu ý quan trọng Warning Box */}
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>⚠️ Lưu ý quan trọng</Text>
              <Text style={styles.warningDesc}>
                Bạn đã xác nhận tham gia buổi phỏng vấn này. Việc yêu cầu hủy lịch có thể ảnh hưởng đến kết quả đánh giá tuyển dụng. Vui lòng cung cấp lý do cụ thể và chính xác.
              </Text>
            </View>

            {/* Form Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Lý do bạn không thể tham gia phỏng vấn <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, !!errorMessage && styles.inputError]}
                multiline
                numberOfLines={4}
                placeholder="Ví dụ: Tôi gặp sự cố cá nhân đột xuất / Tôi đã nhận được lời mời làm việc khác..."
                placeholderTextColor="#94a3b8"
                value={reason}
                onChangeText={(text) => {
                  setReason(text);
                  if (errorMessage) setErrorMessage('');
                }}
                textAlignVertical="top"
              />
              {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Pressable
              style={styles.backBtn}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.backBtnText}>Hủy bỏ</Text>
            </Pressable>

            <Pressable
              style={[styles.submitBtn, !reason.trim() && styles.submitBtnDisabled]}
              onPress={handleCancel}
              disabled={submitting || !reason.trim()}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="paper-plane-outline" size={15} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Gửi yêu cầu hủy lịch</Text>
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
    backgroundColor: '#fff1f2',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe4e6',
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
    backgroundColor: '#ffe4e6',
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
  warningBox: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78350f',
    marginBottom: 4,
  },
  warningDesc: {
    fontSize: 11.5,
    color: '#92400e',
    lineHeight: 17,
  },
  formGroup: {
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    fontSize: 13,
    color: '#0f172a',
    minHeight: 100,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 5,
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
  backBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f43f5e',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
