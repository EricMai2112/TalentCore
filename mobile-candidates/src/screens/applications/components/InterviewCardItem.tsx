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
import { HrContactNoteCallout } from './HrContactNoteCallout';

interface InterviewCardItemProps {
  interview: CandidateInterviewItem;
  onConfirm: () => void;
  onReschedule?: () => void;
  onCancel: () => void;
}

export const InterviewCardItem: React.FC<InterviewCardItemProps> = ({
  interview,
  onConfirm,
  onCancel,
}) => {
  const job = interview.jobDescriptionId;
  const jobTitle = job?.title || 'Phỏng vấn tuyển dụng';
  const deptName =
    typeof job?.departmentId === 'object' ? job?.departmentId?.name : 'TalentCore';

  const confirmationStatus = interview.confirmationStatus || 'PENDING';
  const isConfirmed = confirmationStatus === 'CONFIRMED';
  const isCancelRequested = confirmationStatus === 'CANCEL_REQUESTED';
  const isOnline = interview.locationType === 'ONLINE' || !interview.locationType;
  const isCompleted = interview.status === 'COMPLETED';
  const isCancelled = interview.status === 'CANCELLED';
  const isActive =
    interview.status === 'SCHEDULED' ||
    interview.status === 'UPCOMING' ||
    interview.status === 'IN_PROGRESS';

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

  const getConfirmationBadge = () => {
    if (isCompleted || isCancelled) return null;

    switch (confirmationStatus) {
      case 'CONFIRMED':
        return (
          <View style={[styles.statusBadge, styles.badgeConfirmed]}>
            <Text style={styles.badgeConfirmedText}>✓ Đã xác nhận tham gia</Text>
          </View>
        );
      case 'CANCEL_REQUESTED':
        return (
          <View style={[styles.statusBadge, styles.badgeCancelReq]}>
            <Text style={styles.badgeCancelReqText}>⚠️ Đã gửi yêu cầu hủy lịch</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.statusBadge, styles.badgePending]}>
            <Text style={styles.badgePendingText}>⚠️ Chờ xác nhận</Text>
          </View>
        );
    }
  };

  const getStatusBadge = () => {
    switch (interview.status) {
      case 'COMPLETED':
        return (
          <View style={[styles.statusBadge, styles.badgeCompleted]}>
            <Ionicons name="checkmark-circle" size={12} color="#059669" />
            <Text style={styles.badgeCompletedText}>Hoàn thành</Text>
          </View>
        );
      case 'CANCELLED':
        return (
          <View style={[styles.statusBadge, styles.badgeCancelled]}>
            <Ionicons name="close-circle" size={12} color="#e11d48" />
            <Text style={styles.badgeCancelledText}>Đã hủy</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.statusBadge, styles.badgeScheduled]}>
            <View style={styles.scheduledDot} />
            <Text style={styles.badgeScheduledText}>Đã lên lịch</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleArea}>
          <View style={styles.titleWithBadge}>
            <Text style={styles.jobTitle}>{jobTitle}</Text>
            {getConfirmationBadge()}
          </View>
          <Text style={styles.deptText}>{deptName}</Text>
        </View>
        {getStatusBadge()}
      </View>

      {/* Details Box */}
      <View style={styles.detailsBox}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color="#7c3aed" />
          <Text style={styles.detailText}>
            {interview.startTime} - {interview.endTime}, {formatDate(interview.date)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name={isOnline ? 'videocam-outline' : 'business-outline'}
            size={14}
            color="#2563eb"
          />
          <Text style={styles.detailText}>
            {isOnline
              ? 'Phỏng vấn Online (Jitsi Meet)'
              : interview.offsiteLocation || 'Trực tiếp tại văn phòng'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={14} color="#059669" />
          <Text style={styles.detailText}>
            {interview.interviewerId?.name || 'Hội đồng phỏng vấn'}
          </Text>
        </View>
      </View>

      {/* HR Support Zalo/Phone Callout Note */}
      {isActive && <HrContactNoteCallout phone="0987654321" zaloPhone="0987654321" />}

      {/* Action Buttons */}
      {isActive && (
        <View style={styles.actionsRow}>
          {/* If NOT confirmed and NOT cancel requested: Show 2 buttons */}
          {!isConfirmed && !isCancelRequested && (
            <>
              <Pressable style={styles.confirmBtn} onPress={onConfirm}>
                <Ionicons name="checkmark-circle" size={14} color="#ffffff" />
                <Text style={styles.confirmBtnText}>Xác nhận</Text>
              </Pressable>

              <Pressable style={styles.cancelBtn} onPress={onCancel}>
                <Ionicons name="alert-circle-outline" size={14} color="#e11d48" />
                <Text style={styles.cancelBtnText}>Yêu cầu hủy lịch</Text>
              </Pressable>
            </>
          )}

          {/* If CONFIRMED: Show join meeting (if online & has link) and cancel request button */}
          {isConfirmed && (
            <>
              {isOnline && !!interview.meetingLink && (
                <Pressable style={styles.joinBtn} onPress={handleJoinMeeting}>
                  <Ionicons name="videocam" size={14} color="#ffffff" />
                  <Text style={styles.joinBtnText}>Vào phòng họp</Text>
                </Pressable>
              )}

              <Pressable style={styles.cancelBtn} onPress={onCancel}>
                <Ionicons name="alert-circle-outline" size={14} color="#e11d48" />
                <Text style={styles.cancelBtnText}>Yêu cầu hủy lịch</Text>
              </Pressable>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  titleArea: {
    flex: 1,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  jobTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  deptText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeConfirmed: { backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#a7f3d0' },
  badgeConfirmedText: { color: '#059669', fontSize: 10.5, fontWeight: '700' },
  badgeCancelReq: { backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecdd3' },
  badgeCancelReqText: { color: '#e11d48', fontSize: 10.5, fontWeight: '700' },
  badgePending: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  badgePendingText: { color: '#16a34a', fontSize: 10.5, fontWeight: '700' },
  badgeCompleted: { backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#a7f3d0' },
  badgeCompletedText: { color: '#059669', fontSize: 10.5, fontWeight: '700' },
  badgeCancelled: { backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecdd3' },
  badgeCancelledText: { color: '#e11d48', fontSize: 10.5, fontWeight: '700' },
  badgeScheduled: { backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#c7d2fe' },
  badgeScheduledText: { color: '#4338ca', fontSize: 10.5, fontWeight: '700' },
  scheduledDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4338ca',
  },
  detailsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 10,
    gap: 7,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  detailText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#059669',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  cancelBtnText: {
    color: '#e11d48',
    fontSize: 12,
    fontWeight: '700',
  },
  joinBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#4f46e5',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  joinBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
