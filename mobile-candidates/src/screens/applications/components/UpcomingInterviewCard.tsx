import React from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CandidateInterviewItem } from '../../../types/application.types';

interface UpcomingInterviewCardProps {
  interview: CandidateInterviewItem;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const UpcomingInterviewCard: React.FC<UpcomingInterviewCardProps> = ({
  interview,
  onConfirm,
  onCancel,
}) => {
  const job = interview.jobDescriptionId;
  const jobTitle = job?.title || 'Buổi phỏng vấn';
  const deptName =
    typeof job?.departmentId === 'object' ? job?.departmentId?.name : 'TalentCore';

  const isConfirmed = interview.confirmationStatus === 'CONFIRMED';
  const isCancelRequested = interview.confirmationStatus === 'CANCEL_REQUESTED';
  const isOnline = interview.locationType === 'ONLINE' || !interview.locationType;

  const handleJoinMeeting = async () => {
    if (!interview.meetingLink) {
      Alert.alert('Thông báo', 'Đường dẫn tham gia phỏng vấn sẽ được cập nhật trước giờ diễn ra.');
      return;
    }
    try {
      const supported = await Linking.canOpenURL(interview.meetingLink);
      if (supported) {
        await Linking.openURL(interview.meetingLink);
      } else {
        Alert.alert('Lỗi', 'Không thể mở liên kết phòng họp trực tuyến này.');
      }
    } catch {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi mở phòng họp trực tuyến.');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <View style={styles.topBadge}>
          <Ionicons name="sparkles" size={12} color="#a5b4fc" />
          <Text style={styles.topBadgeText}>PHỎNG VẤN SẮP TỚI</Text>
        </View>
        <Text style={styles.dateBadge}>
          {interview.startTime} • {formatDate(interview.date)}
        </Text>
      </View>

      <Text style={styles.jobTitle}>{jobTitle}</Text>
      <Text style={styles.deptText}>{deptName}</Text>

      {/* Info Pills */}
      <View style={styles.pillsRow}>
        <View style={styles.pill}>
          <Ionicons
            name={isOnline ? 'videocam-outline' : 'business-outline'}
            size={13}
            color="#38bdf8"
          />
          <Text style={styles.pillText}>
            {isOnline ? 'Phỏng vấn Online (Jitsi)' : 'Tại văn phòng công ty'}
          </Text>
        </View>
        <View style={styles.pill}>
          <Ionicons name="person-outline" size={13} color="#c084fc" />
          <Text style={styles.pillText}>
            {interview.interviewerId?.name || 'Hội đồng phỏng vấn'}
          </Text>
        </View>
      </View>

      {/* Confirmed or Cancel Status Badge */}
      {isConfirmed && (
        <View style={styles.confirmedStatusBadge}>
          <Ionicons name="checkmark-circle" size={14} color="#34d399" />
          <Text style={styles.confirmedStatusText}>Đã xác nhận tham gia</Text>
        </View>
      )}

      {isCancelRequested && (
        <View style={styles.cancelRequestedBadge}>
          <Ionicons name="warning-outline" size={14} color="#fca5a5" />
          <Text style={styles.cancelRequestedText}>Đã gửi yêu cầu hủy lịch (Chờ HR xác nhận)</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        {/* Join Meeting button ONLY when candidate has confirmed and online interview */}
        {isConfirmed && isOnline && !!interview.meetingLink && (
          <Pressable style={styles.joinBtn} onPress={handleJoinMeeting}>
            <Ionicons name="videocam" size={15} color="#ffffff" />
            <Text style={styles.joinBtnText}>Vào phòng phỏng vấn</Text>
          </Pressable>
        )}

        {/* When NOT confirmed and NOT cancel requested: Show 2 buttons */}
        {!isConfirmed && !isCancelRequested && (
          <>
            <Pressable style={styles.confirmBtn} onPress={onConfirm}>
              <Ionicons name="checkmark-circle" size={15} color="#ffffff" />
              <Text style={styles.confirmBtnText}>Xác nhận</Text>
            </Pressable>

            {onCancel && (
              <Pressable style={styles.cancelBtn} onPress={onCancel}>
                <Ionicons name="close-circle-outline" size={14} color="#fca5a5" />
                <Text style={styles.cancelBtnText}>Yêu cầu hủy lịch</Text>
              </Pressable>
            )}
          </>
        )}

        {/* When confirmed: Still allow cancel request */}
        {isConfirmed && onCancel && (
          <Pressable style={styles.cancelBtnSubtle} onPress={onCancel}>
            <Ionicons name="close-circle-outline" size={13} color="#f87171" />
            <Text style={styles.cancelBtnSubtleText}>Hủy lịch</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 22,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#4338ca',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  topBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  dateBadge: {
    fontSize: 11.5,
    color: '#94a3b8',
    fontWeight: '700',
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  deptText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  pillText: {
    fontSize: 11.5,
    color: '#e2e8f0',
    fontWeight: '600',
  },
  confirmedStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    borderColor: 'rgba(5, 150, 105, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  confirmedStatusText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#6ee7b7',
  },
  cancelRequestedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(225, 29, 72, 0.2)',
    borderColor: 'rgba(225, 29, 72, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  cancelRequestedText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#fca5a5',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 12,
  },
  confirmBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingVertical: 10,
    borderRadius: 12,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fca5a5',
  },
  cancelBtnSubtle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  cancelBtnSubtleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f87171',
  },
  joinBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    borderRadius: 12,
  },
  joinBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
