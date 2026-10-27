import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InterviewWorkflowBadgeProps {
  status?: string;
  confirmationStatus?: string;
  isEscalated?: boolean;
}

export const InterviewWorkflowBadge: React.FC<InterviewWorkflowBadgeProps> = ({
  status,
  confirmationStatus,
  isEscalated,
}) => {
  const getBadgeConfig = () => {
    // 1. Phê duyệt quy trình (Confirmation status)
    if (confirmationStatus === 'WAITING_DEPT_SCHEDULE') {
      return {
        label: 'Chờ TP xếp lịch',
        color: '#D97706',
        bg: '#FEF3C7',
        border: '#FDE68A',
        icon: 'time-outline' as const,
      };
    }

    if (confirmationStatus === 'WAITING_HR_APPROVAL') {
      return {
        label: 'Chờ HR duyệt',
        color: '#0284C7',
        bg: '#E0F2FE',
        border: '#BAE6FD',
        icon: 'shield-checkmark-outline' as const,
      };
    }

    if (confirmationStatus === 'CANCEL_REQUESTED') {
      return {
        label: 'Yêu cầu hủy lịch',
        color: '#E11D48',
        bg: '#FFF1F2',
        border: '#FECDD3',
        icon: 'alert-circle-outline' as const,
      };
    }

    if (confirmationStatus === 'RESCHEDULE_REQUESTED') {
      return {
        label: 'Yêu cầu đổi lịch',
        color: '#EA580C',
        bg: '#FFF7ED',
        border: '#FFEDD5',
        icon: 'swap-horizontal-outline' as const,
      };
    }

    if (confirmationStatus === 'CANCELLED' || confirmationStatus === 'REJECTED') {
      return {
        label: confirmationStatus === 'REJECTED' ? 'Đã từ chối' : 'Đã hủy lịch',
        color: '#DC2626',
        bg: '#FEF2F2',
        border: '#FECACA',
        icon: 'close-circle-outline' as const,
      };
    }

    if (confirmationStatus === 'CONFIRMED') {
      return {
        label: 'Sắp diễn ra',
        color: '#059669',
        bg: '#ECFDF5',
        border: '#A7F3D0',
        icon: 'checkmark-circle-outline' as const,
      };
    }

    if (confirmationStatus === 'SCHEDULED') {
      return {
        label: 'Đã lên lịch',
        color: '#7C3AED',
        bg: '#F5F3FF',
        border: '#DDD6FE',
        icon: 'calendar-outline' as const,
      };
    }

    // 2. Trạng thái cơ bản (Status fallback)
    switch (status) {
      case 'IN_PROGRESS':
        return {
          label: 'Đang diễn ra',
          color: '#2563EB',
          bg: '#EFF6FF',
          border: '#BFDBFE',
          icon: 'play-circle-outline' as const,
        };
      case 'COMPLETED':
        return {
          label: 'Đã hoàn thành',
          color: '#16A34A',
          bg: '#F0FDF4',
          border: '#BBF7D0',
          icon: 'checkmark-done-circle-outline' as const,
        };
      case 'CANCELLED':
        return {
          label: 'Đã hủy',
          color: '#DC2626',
          bg: '#FEF2F2',
          border: '#FECACA',
          icon: 'close-circle-outline' as const,
        };
      case 'UPCOMING':
        return {
          label: 'Sắp diễn ra',
          color: '#059669',
          bg: '#ECFDF5',
          border: '#A7F3D0',
          icon: 'calendar-outline' as const,
        };
      case 'SCHEDULED':
        return {
          label: 'Chờ ứng viên',
          color: '#7C3AED',
          bg: '#F5F3FF',
          border: '#DDD6FE',
          icon: 'time-outline' as const,
        };
      default:
        return {
          label: status || 'Chưa xếp lịch',
          color: '#64748B',
          bg: '#F1F5F9',
          border: '#E2E8F0',
          icon: 'help-circle-outline' as const,
        };
    }
  };

  const cfg = getBadgeConfig();

  return (
    <View style={styles.badgeWrap}>
      <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
        <Ionicons name={cfg.icon} size={11} color={cfg.color} />
        <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>

      {isEscalated && confirmationStatus !== 'CANCEL_REQUESTED' && (
        <View style={styles.escalatedBadge}>
          <Text style={styles.escalatedText}>Cần HR xử lý</Text>
        </View>
      )}
    </View>
  );
};

export const InterviewResultBadge: React.FC<{ result?: string }> = ({ result }) => {
  if (!result || result === 'PENDING') return null;

  const isPass = result === 'PASS';
  return (
    <View
      style={[
        styles.resultBadge,
        {
          backgroundColor: isPass ? '#ECFDF5' : '#FEF2F2',
          borderColor: isPass ? '#A7F3D0' : '#FECACA',
        },
      ]}
    >
      <Ionicons
        name={isPass ? 'checkmark' : 'close'}
        size={10}
        color={isPass ? '#059669' : '#DC2626'}
      />
      <Text style={[styles.resultText, { color: isPass ? '#059669' : '#DC2626' }]}>
        {isPass ? 'Đạt (Pass)' : 'Không đạt (Fail)'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  escalatedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  escalatedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9333EA',
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  resultText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

export default InterviewWorkflowBadge;
