import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { adminService, DashboardData } from '../../services/admin.services';

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await adminService.getDashboardData();
      setData(res);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const kpis = data?.kpis;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
      }
    >
      <LinearGradient
        colors={['#1D4ED8', '#2563EB', '#4F46E5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeBanner}
      >
        <View style={styles.bannerHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </Text>
          </View>
          <View style={styles.bannerInfo}>
            <Text style={styles.welcomeSubtitle}>Trung tâm Phân tích & Báo cáo Tuyển dụng</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || 'Quản trị viên TalentCore'}
            </Text>
          </View>
        </View>

        <View style={styles.bannerTagRow}>
          <View style={styles.bannerTag}>
            <Ionicons name="sparkles" size={13} color="#FBBF24" />
            <Text style={styles.bannerTagText}>AI Matching 2.0</Text>
          </View>
          <View style={styles.bannerTag}>
            <Ionicons name="shield-checkmark" size={13} color="#34D399" />
            <Text style={styles.bannerTagText}>OTP Offer Signed</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Chỉ số Hiệu suất Tuyển dụng</Text>
      </View>

      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="people" size={20} color="#2563EB" />
          </View>
          <Text style={styles.kpiLabel}>TỔNG ỨNG VIÊN</Text>
          <View style={styles.kpiValueRow}>
            <Text style={styles.kpiValue}>{data?.funnel?.totalApplications ?? 456}</Text>
            <Text style={styles.kpiUnit}>hồ sơ</Text>
          </View>
          <Text style={styles.kpiSubText}>
            +{kpis?.candidates.newLast30Days ?? 0} mới • {kpis?.candidates.total ?? 459} tài khoản
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBox, { backgroundColor: '#F5F3FF' }]}>
            <Ionicons name="briefcase" size={20} color="#7C3AED" />
          </View>
          <Text style={styles.kpiLabel}>JD ĐANG MỞ</Text>
          <View style={styles.kpiValueRow}>
            <Text style={styles.kpiValue}>{kpis?.jobs.active ?? 0}</Text>
            <Text style={styles.kpiUnit}>vị trí</Text>
          </View>
          <Text style={styles.kpiSubText}>
            {kpis?.jobs.total ?? 0} tổng tin đăng tuyển
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBox, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="calendar" size={20} color="#4F46E5" />
          </View>
          <Text style={styles.kpiLabel}>PV HÔM NAY</Text>
          <View style={styles.kpiValueRow}>
            <Text style={styles.kpiValue}>{kpis?.interviews.today ?? 0}</Text>
            <Text style={styles.kpiUnit}>cuộc hẹn</Text>
          </View>
          <Text style={styles.kpiSubText}>
            {kpis?.interviews.upcoming ?? 0} lịch hẹn sắp tới
          </Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="ribbon" size={20} color="#059669" />
          </View>
          <Text style={styles.kpiLabel}>TỶ LỆ NHẬN OFFER</Text>
          <View style={styles.kpiValueRow}>
            <Text style={styles.kpiValue}>{kpis?.offers.acceptanceRate ?? 85}%</Text>
            <Text style={styles.kpiUnit}>nhận việc</Text>
          </View>
          <Text style={styles.kpiSubText}>
            {kpis?.offers.accepted ?? 0}/{kpis?.offers.total ?? 0} đã xác thực OTP
          </Text>
        </View>
      </View>

      <View style={styles.blockCard}>
        <View style={styles.blockHeader}>
          <Ionicons name="funnel-outline" size={18} color="#2563EB" />
          <Text style={styles.blockTitle}>Phễu Tuyển dụng (Recruitment Funnel)</Text>
        </View>
        <View style={styles.funnelList}>
          {data?.funnel?.stages?.map((st) => (
            <View key={st.id} style={styles.funnelItem}>
              <View style={styles.funnelTextRow}>
                <Text style={styles.funnelStageName}>{st.name}</Text>
                <Text style={styles.funnelCount}>
                  {st.count} ứng viên ({st.percentage}%)
                </Text>
              </View>
              <View style={styles.funnelTrack}>
                <View
                  style={[
                    styles.funnelBar,
                    {
                      width: `${Math.max(10, Math.min(100, st.percentage))}%`,
                      backgroundColor: st.color || '#2563EB',
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.blockCard}>
        <View style={styles.blockHeader}>
          <Ionicons name="business-outline" size={18} color="#7C3AED" />
          <Text style={styles.blockTitle}>Tiến độ Tuyển dụng theo Phòng ban</Text>
        </View>
        <View style={styles.deptList}>
          {data?.departmentFulfillment?.map((dept) => (
            <View key={dept.id} style={styles.deptItem}>
              <View style={styles.deptTextRow}>
                <Text style={styles.deptName}>{dept.name}</Text>
                <Text style={styles.deptStats}>
                  {dept.hiredCount} / {dept.targetHeadcount} ({dept.percentage}%)
                </Text>
              </View>
              <View style={styles.deptTrack}>
                <View
                  style={[
                    styles.deptBar,
                    {
                      width: `${Math.min(100, dept.percentage)}%`,
                      backgroundColor: dept.percentage >= 100 ? '#10B981' : '#7C3AED',
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.blockCard}>
        <View style={styles.blockHeader}>
          <Ionicons name="pie-chart-outline" size={18} color="#059669" />
          <Text style={styles.blockTitle}>Cơ cấu Trạng thái Offers</Text>
        </View>
        <View style={styles.offerBreakdownRow}>
          {data?.offersBreakdown?.chartData?.map((item, idx) => (
            <View key={idx} style={styles.offerStatBox}>
              <View style={[styles.offerDot, { backgroundColor: item.color }]} />
              <Text style={styles.offerCount}>{item.count}</Text>
              <Text style={styles.offerName}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.blockCard}>
        <View style={styles.blockHeader}>
          <Ionicons name="time-outline" size={18} color="#D97706" />
          <Text style={styles.blockTitle}>Hoạt động Tuyển dụng Gần đây</Text>
        </View>
        <View style={styles.activityList}>
          {data?.recentActivities?.applications?.map((app) => (
            <View key={app.id} style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#2563EB' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{app.candidateName}</Text>
                <Text style={styles.activityDesc}>Đã nộp hồ sơ vào vị trí {app.jobTitle}</Text>
              </View>
            </View>
          ))}
          {data?.recentActivities?.offers?.map((off) => (
            <View key={off.id} style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#10B981' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{off.candidateName}</Text>
                <Text style={styles.activityDesc}>
                  Đã đồng ý nhận việc vị trí {off.positionTitle} qua xác thực OTP
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 100,
  },
  loadingBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeBanner: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  bannerInfo: {
    flex: 1,
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11.5,
    fontWeight: '600',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  bannerTagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bannerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  bannerTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitleRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  kpiCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  kpiValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  kpiUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  kpiSubText: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 4,
  },
  blockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  blockTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  funnelList: {
    gap: 12,
  },
  funnelItem: {
    gap: 5,
  },
  funnelTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  funnelStageName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  funnelCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  funnelTrack: {
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  funnelBar: {
    height: '100%',
    borderRadius: 4,
  },
  deptList: {
    gap: 12,
  },
  deptItem: {
    gap: 5,
  },
  deptTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deptName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  deptStats: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  deptTrack: {
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  deptBar: {
    height: '100%',
    borderRadius: 4,
  },
  offerBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  offerStatBox: {
    alignItems: 'center',
    gap: 4,
  },
  offerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  offerCount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  offerName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  activityDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
});
