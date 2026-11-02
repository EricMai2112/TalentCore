import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeadcountPlan {
  hired?: number;
  target?: number;
  percentage?: number;
}

interface JobsKpi {
  active?: number;
  total?: number;
  newCount?: number;
}

interface TimeToHireKpi {
  avgDays?: number | null;
  isEmpty?: boolean;
  sampleSize?: number;
}

interface OffersKpi {
  acceptanceRate?: number;
  accepted?: number;
  sent?: number;
}

interface Props {
  headcountPlan?: HeadcountPlan;
  jobs?: JobsKpi;
  timeToHire?: TimeToHireKpi;
  offers?: OffersKpi;
}

export const KpiStatsGrid: React.FC<Props> = ({
  headcountPlan,
  jobs,
  timeToHire,
  offers,
}) => {
  const isTthOverdue = (timeToHire?.avgDays ?? 0) > 25;

  return (
    <View style={styles.grid}>
      {/* ─── CARD 1: CHỈ TIÊU TUYỂN DỤNG ─── */}
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={[styles.iconBox, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
            <Ionicons name="disc" size={17} color="#2563EB" />
          </View>
          <View style={[styles.badge, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
            <Text style={[styles.badgeText, { color: '#2563EB' }]}>
              {headcountPlan?.percentage || 0}% đạt
            </Text>
          </View>
        </View>

        <Text style={styles.label} numberOfLines={1}>CHỈ TIÊU TUYỂN DỤNG</Text>

        <View style={styles.valueRow}>
          <Text style={styles.valueNumber} numberOfLines={1}>
            {headcountPlan?.hired || 0}
            <Text style={styles.valueTarget}> / {headcountPlan?.target || 0}</Text>
          </Text>
          <Text style={styles.unitText}>người</Text>
        </View>
      </View>

      {/* ─── CARD 2: VỊ TRÍ ĐANG MỞ ─── */}
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={[styles.iconBox, { backgroundColor: '#EEF2FF', borderColor: '#E0E7FF' }]}>
            <Ionicons name="briefcase" size={16} color="#4F46E5" />
          </View>
          <View style={[styles.badge, { backgroundColor: '#EEF2FF', borderColor: '#E0E7FF' }]}>
            <Text style={[styles.badgeText, { color: '#4F46E5' }]}>
              +{jobs?.newCount ?? 0} trong 30 ngày
            </Text>
          </View>
        </View>

        <Text style={styles.label} numberOfLines={1}>VỊ TRÍ ĐANG MỞ</Text>

        <View style={styles.valueRow}>
          <Text style={styles.valueNumber} numberOfLines={1}>
            {jobs?.active || 0}
          </Text>
          <Text style={styles.unitText}>vị trí</Text>
        </View>
      </View>

      {/* ─── CARD 3: TỐC ĐỘ TUYỂN DỤNG ─── */}
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={[styles.iconBox, { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' }]}>
            <Ionicons name="flash" size={16} color="#D97706" />
          </View>
          <View
            style={[
              styles.badge,
              isTthOverdue
                ? { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }
                : { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isTthOverdue ? '#DC2626' : '#B45309' },
              ]}
            >
              Mục tiêu ≤ 25 ngày
            </Text>
          </View>
        </View>

        <Text style={styles.label} numberOfLines={1}>TỐC ĐỘ TUYỂN DỤNG</Text>

        <View style={styles.valueRow}>
          <Text style={styles.valueNumber} numberOfLines={1}>
            {timeToHire?.isEmpty || timeToHire?.avgDays === null ? '—' : timeToHire?.avgDays}
          </Text>
          {!timeToHire?.isEmpty && <Text style={styles.unitText}>ngày</Text>}
        </View>
      </View>

      {/* ─── CARD 4: TỶ LỆ NHẬN VIỆC ─── */}
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={[styles.iconBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <Ionicons name="checkmark-circle" size={17} color="#059669" />
          </View>
          <View style={[styles.badge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <Text style={[styles.badgeText, { color: '#047857' }]}>
              Mục tiêu ≥ 80%
            </Text>
          </View>
        </View>

        <Text style={styles.label} numberOfLines={1}>TỶ LỆ NHẬN VIỆC</Text>

        <View style={styles.valueRow}>
          <Text style={styles.valueNumber} numberOfLines={1}>
            {offers?.acceptanceRate || 0}%
          </Text>
          <Text style={styles.unitText}>chấp thuận</Text>
        </View>
      </View>
    </View>
  );
};

export default KpiStatsGrid;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  card: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    justifyContent: 'space-between',
    minHeight: 108,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.3,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  valueNumber: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  valueTarget: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  unitText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
});
