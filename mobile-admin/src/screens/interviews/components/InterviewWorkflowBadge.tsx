import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface InterviewWorkflowBadgeProps {
  status?: string;
  confirmationStatus?: string;
  isEscalated?: boolean;
}

/**
 * Component hiển thị nhãn trạng thái phỏng vấn trên Mobile Admin
 * Chuẩn hóa đồng bộ 6 trạng thái nghiệp vụ duy nhất.
 */
export const InterviewWorkflowBadge: React.FC<InterviewWorkflowBadgeProps> = ({
  status,
  confirmationStatus,
  isEscalated,
}) => {
  const getBadgeConfig = () => {
    // 5. Đã kết thúc
    if (status === 'COMPLETED') {
      return {
        label: 'Đã kết thúc',
        color: '#FFFFFF',
        bg: '#1E293B',
        border: '#0F172A',
      };
    }

    // 6. Đã hủy / Từ chối
    if (
      status === 'CANCELLED' ||
      confirmationStatus === 'CANCELLED' ||
      confirmationStatus === 'REJECTED' ||
      confirmationStatus === 'CANCEL_REQUESTED'
    ) {
      return {
        label: 'Đã hủy / Từ chối',
        color: '#DC2626',
        bg: '#FEF2F2',
        border: '#FECACA',
      };
    }

    // 1. Chờ Trưởng phòng lên lịch
    if (confirmationStatus === 'WAITING_DEPT_SCHEDULE') {
      return {
        label: 'Chờ Trưởng phòng lên lịch',
        color: '#D97706',
        bg: '#FEF3C7',
        border: '#FDE68A',
      };
    }

    // 2. Chờ HR duyệt
    if (confirmationStatus === 'WAITING_HR_APPROVAL') {
      return {
        label: 'Chờ HR duyệt',
        color: '#0284C7',
        bg: '#E0F2FE',
        border: '#BAE6FD',
      };
    }

    // 4. Đã lên lịch (Ứng viên đã xác nhận tham gia)
    if (
      confirmationStatus === 'CONFIRMED' ||
      status === 'UPCOMING' ||
      status === 'IN_PROGRESS'
    ) {
      return {
        label: 'Đã lên lịch',
        color: '#065F46',
        bg: '#ECFDF5',
        border: '#A7F3D0',
      };
    }

    // 3. Chờ ứng viên xác nhận (Mặc định)
    return {
      label: 'Chờ ứng viên xác nhận',
      color: '#6D28D9',
      bg: '#F5F3FF',
      border: '#DDD6FE',
    };
  };

  const badge = getBadgeConfig();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: badge.bg,
            borderColor: badge.border,
          },
        ]}
      >
        <Text style={[styles.badgeText, { color: badge.color }]}>
          {badge.label}
        </Text>
      </View>

      {isEscalated && (
        <View style={styles.escalatedPill}>
          <Text style={styles.escalatedPillText}>Cần HR xử lý</Text>
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
        styles.badge,
        {
          backgroundColor: isPass ? '#ECFDF5' : '#FEF2F2',
          borderColor: isPass ? '#A7F3D0' : '#FECACA',
        },
      ]}
    >
      <Text style={[styles.badgeText, { color: isPass ? '#059669' : '#DC2626' }]}>
        {isPass ? 'Đạt (Pass)' : 'Không đạt (Fail)'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  escalatedPill: {
    backgroundColor: '#F3E8FF',
    borderColor: '#D8B4FE',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  escalatedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7E22CE',
  },
});

export default InterviewWorkflowBadge;
