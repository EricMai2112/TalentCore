import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface FunnelStage {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color?: string;
  order?: number;
}

interface Props {
  stages?: FunnelStage[];
  totalApplications?: number;
  overallRate?: number;
}

const STAGE_GRADIENTS: Record<number, { colors: [string, string]; dotColor: string }> = {
  1: { colors: ['#3B82F6', '#6366F1'], dotColor: '#3B82F6' },
  2: { colors: ['#38BDF8', '#06B6D4'], dotColor: '#06B6D4' },
  3: { colors: ['#8B5CF6', '#A855F7'], dotColor: '#8B5CF6' },
  4: { colors: ['#F43F5E', '#EC4899'], dotColor: '#F43F5E' },
  5: { colors: ['#F59E0B', '#F97316'], dotColor: '#F59E0B' },
  6: { colors: ['#10B981', '#14B8A6'], dotColor: '#10B981' },
};

export const RecruitmentFunnel: React.FC<Props> = ({
  stages = [],
  totalApplications = 0,
  overallRate = 0,
}) => {
  const maxCount = stages[0]?.count || totalApplications || 1;
  const hiredCount = stages[stages.length - 1]?.count || 0;

  return (
    <View style={styles.card}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="filter" size={15} color="#4F46E5" />
          </View>
          <View>
            <Text style={styles.title}>Phễu Tuyển Dụng</Text>
            <Text style={styles.subtitle}>Theo quy trình tuyển dụng chuẩn</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.totalText}>{totalApplications.toLocaleString()} hồ sơ</Text>
          <View style={styles.hiredBadge}>
            <Text style={styles.hiredBadgeText}>{overallRate}% trúng tuyển</Text>
          </View>
        </View>
      </View>

      {/* ─── Body: 2 Columns Funnel List ─── */}
      <View style={styles.stagesContainer}>
        {stages.map((stage, idx) => {
          const count = stage.count || 0;
          const ratio = maxCount > 0 ? count / maxCount : 0;
          const widthPercent = Math.max(32, Math.min(100, Math.round(32 + ratio * 68)));
          const stageOrder = stage.order || idx + 1;
          const conf =
            STAGE_GRADIENTS[stageOrder] ||
            STAGE_GRADIENTS[((stageOrder - 1) % 6) + 1] || {
              colors: ['#3B82F6', '#6366F1'],
              dotColor: '#3B82F6',
            };

          return (
            <View key={stage.id || idx} style={styles.stageRow}>
              {/* Cột Trái (40%): Dot + Tên giai đoạn */}
              <View style={styles.stageNameCol}>
                <View style={[styles.dot, { backgroundColor: conf.dotColor }]} />
                <Text style={styles.stageNameText} numberOfLines={1}>
                  {stage.name}
                </Text>
              </View>

              {/* Cột Phải (60%): Khối phễu Gradient căn giữa */}
              <View style={styles.stageBarCol}>
                <LinearGradient
                  colors={conf.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.funnelPill, { width: `${widthPercent}%` }]}
                >
                  <Text style={styles.pillCount}>
                    {count.toLocaleString()}{' '}
                    <Text style={styles.pillPct}>({stage.percentage}%)</Text>
                  </Text>
                </LinearGradient>
              </View>
            </View>
          );
        })}
      </View>

      {/* ─── Footer: Summary Row ─── */}
      <View style={styles.footerRow}>
        <View style={styles.footerItem}>
          <Ionicons name="people" size={14} color="#64748B" />
          <Text style={styles.footerLabel}>
            Tiếp nhận: <Text style={styles.footerValue}>{totalApplications.toLocaleString()}</Text>
          </Text>
        </View>

        <View style={styles.footerItem}>
          <Ionicons name="trending-up" size={14} color="#10B981" />
          <Text style={styles.footerLabel}>
            Trúng tuyển: <Text style={[styles.footerValue, { color: '#10B981' }]}>{hiredCount} ({overallRate}%)</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default RecruitmentFunnel;

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
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  hiredBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hiredBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#047857',
  },
  stagesContainer: {
    gap: 7,
    marginBottom: 12,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  stageNameCol: {
    width: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  stageNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    flexShrink: 1,
  },
  stageBarCol: {
    width: '60%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  funnelPill: {
    height: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  pillCount: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  pillPct: {
    fontSize: 9.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  footerValue: {
    fontWeight: '800',
    color: '#0F172A',
  },
});
