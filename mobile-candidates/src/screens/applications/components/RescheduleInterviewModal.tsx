import React, { useEffect, useState } from 'react';
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
import { AvailableSlot, CandidateInterviewItem } from '../../../types/application.types';
import { applicationService } from '../../../services/application.service';

interface RescheduleInterviewModalProps {
  visible: boolean;
  onClose: () => void;
  interview: CandidateInterviewItem | null;
  onSuccess: () => void;
}

export const RescheduleInterviewModal: React.FC<RescheduleInterviewModalProps> = ({
  visible,
  onClose,
  interview,
  onSuccess,
}) => {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [customStartTime, setCustomStartTime] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && interview) {
      loadSlots();
    }
  }, [visible, interview]);

  const loadSlots = async () => {
    if (!interview) return;
    try {
      setLoadingSlots(true);
      const interviewerId =
        interview.interviewerId?._id || interview.interviewerIds?.[0]?._id;
      const data = await applicationService.getAvailableSlots(
        interviewerId,
        interview.date,
      );
      setSlots(data);
    } finally {
      setLoadingSlots(false);
    }
  };

  if (!interview) return null;

  const handleSubmit = async () => {
    if (!isCustomMode && selectedSlotIndex === null) {
      Alert.alert('Lưu ý', 'Vui lòng chọn một khung giờ phỏng vấn mới hoặc chuyển sang giờ tùy chọn.');
      return;
    }

    if (isCustomMode && (!customDate || !customStartTime || !customEndTime)) {
      Alert.alert('Lưu ý', 'Vui lòng nhập đầy đủ ngày và giờ bắt đầu/kết thúc mong muốn.');
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        reason: reason.trim(),
      };

      if (!isCustomMode && selectedSlotIndex !== null) {
        const slot = slots[selectedSlotIndex];
        payload.selectedSlot = {
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
        };
      } else if (isCustomMode) {
        payload.customSlot = {
          date: customDate.trim(),
          startTime: customStartTime.trim(),
          endTime: customEndTime.trim(),
        };
      }

      const ok = await applicationService.submitRescheduleRequest(
        interview._id,
        payload,
      );
      if (ok) {
        Alert.alert('Thành công', 'Đã gửi yêu cầu dời lịch phỏng vấn đến nhà tuyển dụng.');
        onSuccess();
        onClose();
        setReason('');
        setSelectedSlotIndex(null);
        setIsCustomMode(false);
      } else {
        Alert.alert('Lỗi', 'Không thể gửi yêu cầu dời lịch lúc này.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Yêu cầu dời lịch phỏng vấn</Text>
              <Text style={styles.subtitle}>
                {interview.jobDescriptionId?.title}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
          >
            {/* Mode Switcher */}
            <View style={styles.modeSwitcher}>
              <Pressable
                style={[
                  styles.modeBtn,
                  !isCustomMode && styles.modeBtnActive,
                ]}
                onPress={() => setIsCustomMode(false)}
              >
                <Text
                  style={[
                    styles.modeBtnText,
                    !isCustomMode && styles.modeBtnTextActive,
                  ]}
                >
                  Chọn khung giờ trống
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modeBtn,
                  isCustomMode && styles.modeBtnActive,
                ]}
                onPress={() => setIsCustomMode(true)}
              >
                <Text
                  style={[
                    styles.modeBtnText,
                    isCustomMode && styles.modeBtnTextActive,
                  ]}
                >
                  Đề xuất giờ khác
                </Text>
              </Pressable>
            </View>

            {/* Mode 1: Available Slots */}
            {!isCustomMode ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Khung giờ khả dụng:</Text>
                {loadingSlots ? (
                  <ActivityIndicator size="small" color="#7c3aed" style={{ marginVertical: 14 }} />
                ) : slots.length === 0 ? (
                  <Text style={styles.emptyText}>
                    Không có khung giờ trống cố định. Vui lòng chọn "Đề xuất giờ khác".
                  </Text>
                ) : (
                  <View style={styles.slotsGrid}>
                    {slots.map((slot, idx) => {
                      const isSelected = selectedSlotIndex === idx;
                      return (
                        <Pressable
                          key={idx}
                          style={[
                            styles.slotCard,
                            isSelected && styles.slotCardSelected,
                          ]}
                          onPress={() => setSelectedSlotIndex(idx)}
                        >
                          <Text
                            style={[
                              styles.slotTime,
                              isSelected && styles.slotTextSelected,
                            ]}
                          >
                            {slot.startTime} - {slot.endTime}
                          </Text>
                          <Text
                            style={[
                              styles.slotDate,
                              isSelected && styles.slotTextSelected,
                            ]}
                          >
                            {slot.date}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            ) : (
              /* Mode 2: Custom Slot Input */
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Khung giờ bạn mong muốn:</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Ngày (VD: 2026-05-15 hoặc 15/05/2026)"
                  placeholderTextColor="#94a3b8"
                  value={customDate}
                  onChangeText={setCustomDate}
                />
                <View style={styles.timeInputRow}>
                  <TextInput
                    style={[styles.inputField, { flex: 1 }]}
                    placeholder="Bắt đầu (VD: 09:00)"
                    placeholderTextColor="#94a3b8"
                    value={customStartTime}
                    onChangeText={setCustomStartTime}
                  />
                  <TextInput
                    style={[styles.inputField, { flex: 1 }]}
                    placeholder="Kết thúc (VD: 10:00)"
                    placeholderTextColor="#94a3b8"
                    value={customEndTime}
                    onChangeText={setCustomEndTime}
                  />
                </View>
              </View>
            )}

            {/* Reason */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Lý do dời lịch:</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                placeholder="Nêu lý do (trùng lịch thi cử, bận công tác...)"
                placeholderTextColor="#94a3b8"
                value={reason}
                onChangeText={setReason}
              />
            </View>
          </ScrollView>

          <View style={styles.footerRow}>
            <Pressable
              style={styles.cancelActionBtn}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={styles.cancelActionBtnText}>Hủy</Text>
            </Pressable>

            <Pressable
              style={styles.submitActionBtn}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitActionBtnText}>Gửi yêu cầu</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '82%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollArea: {
    paddingVertical: 12,
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 3,
    marginBottom: 14,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  modeBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  modeBtnText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: '#7c3aed',
    fontWeight: '800',
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotCard: {
    width: '48%',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  slotCardSelected: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  slotTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  slotDate: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 2,
  },
  slotTextSelected: {
    color: '#ffffff',
  },
  inputField: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12.5,
    color: '#0f172a',
    marginBottom: 8,
  },
  timeInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  textArea: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12.5,
    color: '#0f172a',
    height: 70,
    textAlignVertical: 'top',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cancelActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  cancelActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  submitActionBtn: {
    flex: 1.5,
    backgroundColor: '#7c3aed',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
