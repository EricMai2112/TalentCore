import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CandidateInvitationItem } from '../../../types/application.types';
import { applicationService } from '../../../services/application.service';

interface InvitationHeroCardProps {
  invitation: CandidateInvitationItem | null;
  onRefresh: () => void;
}

export const InvitationHeroCard: React.FC<InvitationHeroCardProps> = ({
  invitation,
  onRefresh,
}) => {
  const [loadingAction, setLoadingAction] = useState(false);

  if (!invitation) return null;

  const job = invitation.jobDescriptionId;
  const deptName = job?.departmentId?.name || 'Phòng Công nghệ';
  const salaryText =
    job?.minimumSalary && job?.maximumSalary
      ? `${(job.minimumSalary / 1000000).toFixed(0)} - ${(job.maximumSalary / 1000000).toFixed(0)} triệu VNĐ`
      : 'Thỏa thuận';

  const handleAccept = async () => {
    Alert.alert(
      'Chấp nhận lời mời',
      `Bạn xác nhận tham gia đợt tuyển dụng cho vị trí "${job?.title}"? Hồ sơ của bạn sẽ được chuyển thẳng đến vòng xem xét.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'default',
          onPress: async () => {
            try {
              setLoadingAction(true);
              await applicationService.respondInvitation(invitation._id, 'ACCEPT');
              Alert.alert('Thành công', 'Bạn đã chấp nhận lời mời ứng tuyển thành công!');
              onRefresh();
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể chấp nhận lời mời lúc này.');
            } finally {
              setLoadingAction(false);
            }
          },
        },
      ],
    );
  };

  const handleDecline = () => {
    Alert.prompt
      ? Alert.prompt(
          'Từ chối lời mời',
          'Vui lòng nhập lý do từ chối (không bắt buộc):',
          [
            { text: 'Quay lại', style: 'cancel' },
            {
              text: 'Từ chối',
              style: 'destructive',
              onPress: async (reason?: string) => {
                try {
                  setLoadingAction(true);
                  await applicationService.respondInvitation(
                    invitation._id,
                    'DECLINE',
                    reason,
                  );
                  Alert.alert('Thông báo', 'Bạn đã từ chối lời mời cơ hội việc làm.');
                  onRefresh();
                } catch (err: any) {
                  Alert.alert('Lỗi', err.message || 'Không thể từ chối lúc này.');
                } finally {
                  setLoadingAction(false);
                }
              },
            },
          ],
        )
      : Alert.alert(
          'Từ chối lời mời',
          'Bạn có chắc chắn muốn từ chối lời mời việc làm này?',
          [
            { text: 'Quay lại', style: 'cancel' },
            {
              text: 'Từ chối',
              style: 'destructive',
              onPress: async () => {
                try {
                  setLoadingAction(true);
                  await applicationService.respondInvitation(invitation._id, 'DECLINE');
                  Alert.alert('Thông báo', 'Bạn đã từ chối lời mời cơ hội việc làm.');
                  onRefresh();
                } catch (err: any) {
                  Alert.alert('Lỗi', err.message || 'Không thể từ chối lúc này.');
                } finally {
                  setLoadingAction(false);
                }
              },
            },
          ],
        );
  };

  return (
    <View style={styles.container}>
      <View style={styles.badgeRow}>
        <View style={styles.badgeTop}>
          <Ionicons name="ribbon" size={13} color="#ffffff" />
          <Text style={styles.badgeTopText}>CƠ HỘI MỚI DÀNH RIÊNG CHO BẠN</Text>
        </View>
        <Text style={styles.expireText}>
          Hết hạn: {new Date(invitation.expiresAt).toLocaleDateString('vi-VN')}
        </Text>
      </View>

      <Text style={styles.title}>{job?.title}</Text>
      <Text style={styles.deptText}>
        {deptName} • {job?.location || 'Hồ Chí Minh'}
      </Text>

      {/* Salary & Special perk highlight */}
      <View style={styles.highlightRow}>
        <View style={styles.highlightItem}>
          <Ionicons name="cash-outline" size={14} color="#059669" />
          <Text style={styles.highlightItemText}>{salaryText}</Text>
        </View>
        <View style={styles.highlightItem}>
          <Ionicons name="flash" size={14} color="#7c3aed" />
          <Text style={styles.highlightItemText}>Vào thẳng Trưởng phòng duyệt</Text>
        </View>
      </View>

      {invitation.note ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Lời nhắn từ HR:</Text>
          <Text style={styles.noteContent}>"{invitation.note}"</Text>
        </View>
      ) : null}

      <View style={styles.actionRow}>
        <Pressable
          style={styles.declineBtn}
          onPress={handleDecline}
          disabled={loadingAction}
        >
          <Text style={styles.declineBtnText}>Từ chối</Text>
        </Pressable>

        <Pressable
          style={styles.acceptBtn}
          onPress={handleAccept}
          disabled={loadingAction}
        >
          {loadingAction ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
              <Text style={styles.acceptBtnText}>Chấp nhận lời mời</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#c7d2fe',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeTopText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  expireText: {
    fontSize: 11,
    color: '#d97706',
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  deptText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  highlightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  highlightItemText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  noteBox: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  noteTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  noteContent: {
    fontSize: 12,
    color: '#1e293b',
    fontStyle: 'italic',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  declineBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#4f46e5',
  },
  acceptBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});
