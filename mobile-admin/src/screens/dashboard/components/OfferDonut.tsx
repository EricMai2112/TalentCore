import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

export interface OfferStatusCounts {
  ACCEPTED?: number;
  DECLINED?: number;
  SENT?: number;
  CANCELLED?: number;
  EXPIRED?: number;
  DRAFT?: number;
}

interface Props {
  totalOffers?: number;
  acceptanceRate?: number;
  statusCounts?: OfferStatusCounts;
}

export const OfferDonut: React.FC<Props> = ({
  totalOffers = 0,
  acceptanceRate = 0,
  statusCounts = {},
}) => {
  const accepted = statusCounts.ACCEPTED || 0;
  const declined = statusCounts.DECLINED || 0;
  const sent = statusCounts.SENT || 0;
  const cancelled = statusCounts.CANCELLED || 0;
  const expired = statusCounts.EXPIRED || 0;
  const draft = statusCounts.DRAFT || 0;

  const totalTracked = accepted + declined + sent + cancelled + expired + draft;
  const calcPct = (v: number) =>
    totalTracked > 0 ? Math.round((v / totalTracked) * 100) : 0;

  const items = [
    { name: 'Đã Tuyển', count: accepted, color: '#10B981', pct: calcPct(accepted), always: true },
    { name: 'Đang phản hồi', count: sent, color: '#F59E0B', pct: calcPct(sent), always: true },
    { name: 'Đã từ chối', count: declined, color: '#EF4444', pct: calcPct(declined), always: true },
    { name: 'Đã hủy', count: cancelled, color: '#64748B', pct: calcPct(cancelled), always: false },
    { name: 'Hết hạn', count: expired, color: '#8B5CF6', pct: calcPct(expired), always: false },
    { name: 'Bản nháp', count: draft, color: '#0284C7', pct: calcPct(draft), always: false },
  ];

  const visibleItems = items.filter((d) => d.always || d.count > 0);
  const activeSlices = items.filter((d) => d.count > 0);

  // SVG Donut Dimensions
  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = activeSlices.length > 1 ? 3 : 0;

  // Compute slice offsets
  let accumulatedOffset = 0;
  const slicesWithOffsets = activeSlices.map((item) => {
    const sliceRatio = totalTracked > 0 ? item.count / totalTracked : 0;
    const strokeLength = Math.max(0, sliceRatio * circumference - gap);
    const offset = accumulatedOffset;
    accumulatedOffset += sliceRatio * circumference;
    return {
      ...item,
      strokeLength,
      offset,
    };
  });

  return (
    <View style={styles.card}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="document-text" size={15} color="#D97706" />
          </View>
          <View>
            <Text style={styles.title}>Phân tích Offer</Text>
            <Text style={styles.subtitle}>{totalOffers} offer tổng cộng</Text>
          </View>
        </View>

        <View style={styles.rateBadge}>
          <Text style={styles.rateBadgeText}>{acceptanceRate}% chấp nhận</Text>
        </View>
      </View>

      {/* ─── Body: Donut + Legend ─── */}
      <View style={styles.bodyRow}>
        {/* Left: Donut Chart with Center Label */}
        <View style={styles.chartCol}>
          <View style={styles.donutContainer}>
            <Svg width={size} height={size} style={styles.donutSvg}>
              <G>
                {/* Background Ring */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#F1F5F9"
                  strokeWidth={strokeWidth}
                  fill="none"
                />

                {/* Slices */}
                {slicesWithOffsets.map((slice, idx) => (
                  <Circle
                    key={idx}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={slice.color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={`${slice.strokeLength} ${circumference}`}
                    strokeDashoffset={-slice.offset}
                    strokeLinecap="round"
                  />
                ))}
              </G>
            </Svg>

            {/* Center Label (ĐÃ TUYỂN) */}
            <View style={styles.centerLabel}>
              <Text style={styles.centerNumber}>{accepted}</Text>
              <Text style={styles.centerText}>ĐÃ TUYỂN</Text>
            </View>
          </View>
        </View>

        {/* Right: Legend Breakdown */}
        <View style={styles.legendCol}>
          {visibleItems.map((item, idx) => (
            <View key={idx} style={styles.legendItem}>
              <View style={styles.legendLeft}>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <Text style={styles.legendName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
              <View style={styles.legendRight}>
                <Text style={styles.legendCount}>{item.count}</Text>
                <Text style={styles.legendPct}>({item.pct}%)</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default OfferDonut;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  rateBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  rateBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#047857',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartCol: {
    width: '46%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutSvg: {
    transform: [{ rotate: '-90deg' }],
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerNumber: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 20,
  },
  centerText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  legendCol: {
    width: '54%',
    gap: 7,
    paddingLeft: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  legendCount: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  legendPct: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
