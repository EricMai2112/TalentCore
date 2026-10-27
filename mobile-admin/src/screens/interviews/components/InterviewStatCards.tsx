import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InterviewItem } from '../../../services/admin.services';

interface InterviewStatCardsProps {
  interviews: InterviewItem[];
  selectedStat?: string;
  onSelectStat: (statId: string) => void;
}

export const InterviewStatCards: React.FC<InterviewStatCardsProps> = ({
  interviews,
  selectedStat = 'all',
  onSelectStat,
}) => {
  const totalCount = interviews.length;
  const todayStr = new Date().toISOString().split('T')[0];

  const todayCount = interviews.filter((item) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date).toISOString().split('T')[0];
    return itemDate === todayStr;
  }).length;

  const pendingCount = interviews.filter((item) => {
    return (
      item.confirmationStatus === 'WAITING_DEPT_SCHEDULE' ||
      item.confirmationStatus === 'WAITING_HR_APPROVAL'
    );
  }).length;

  const confirmedCount = interviews.filter((item) => {
    return (
      item.confirmationStatus === 'CONFIRMED' ||
      item.confirmationStatus === 'SCHEDULED' ||
      (!item.confirmationStatus && item.status === 'SCHEDULED')
    );
  }).length;

  const actionNeededCount = interviews.filter((item) => {
    return (
      item.confirmationStatus === 'RESCHEDULE_REQUESTED' ||
      item.confirmationStatus === 'CANCEL_REQUESTED' ||
      item.isEscalated
    );
  }).length;

  const pct = (cnt: number) => (totalCount > 0 ? Math.round((cnt / totalCount) * 100) : 0);

  const configs = [
    {
      id: 'all',
      label: 'TỔNG LỊCH',
      count: totalCount,
      percent: 100,
      icon: 'calendar' as const,
      color: '#2563EB',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
    },
    {
      id: 'today',
      label: 'HÔM NAY',
      count: todayCount,
      percent: pct(todayCount),
      icon: 'time' as const,
      color: '#0891B2',
      bgColor: '#ECFEFF',
      borderColor: '#A5F3FC',
    },
    {
      id: 'pending',
      label: 'CHỜ XẾP / DUYỆT',
      count: pendingCount,
      percent: pct(pendingCount),
      icon: 'hourglass' as const,
      color: '#D97706',
      bgColor: '#FFFBEB',
      borderColor: '#FDE68A',
    },
    {
      id: 'confirmed',
      label: 'SẮP TỚI',
      count: confirmedCount,
      percent: pct(confirmedCount),
      icon: 'checkmark-circle' as const,
      color: '#059669',
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0',
    },
    {
      id: 'action_needed',
      label: 'CẦN XỬ LÝ',
      count: actionNeededCount,
      percent: pct(actionNeededCount),
      icon: 'notifications' as const,
      color: '#E11D48',
      bgColor: '#FFF1F2',
      borderColor: '#FECDD3',
    },
  ];

  return (
    <View style={styles.grid}>
      {configs.map((card) => {
        const isSelected = selectedStat === card.id;
        return (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              isSelected && {
                borderColor: card.color,
                backgroundColor: card.bgColor,
                shadowColor: card.color,
                shadowOpacity: 0.15,
                elevation: 3,
              },
            ]}
            onPress={() => onSelectStat(card.id)}
            activeOpacity={0.75}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: card.bgColor }]}>
                <Ionicons name={card.icon} size={14} color={card.color} />
              </View>
              <View style={[styles.pctBadge, { backgroundColor: `${card.color}15` }]}>
                <Text style={[styles.pctText, { color: card.color }]}>{card.percent}%</Text>
              </View>
            </View>

            <Text style={styles.label} numberOfLines={1}>
              {card.label}
            </Text>
            <Text style={[styles.count, { color: card.color }]}>{card.count}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  card: {
    width: '31%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pctBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  pctText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  count: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
});

export default InterviewStatCards;
