import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import {
  adminService,
  DashboardData,
  DepartmentItem,
  JobDescriptionItem,
} from '../../services/admin.services';
import { UserRole } from '../../features/auth/types/auth.types';
import CustomSelect from '../../components/common/CustomSelect';
import KpiStatsGrid from './components/KpiStatsGrid';
import RecruitmentFunnel from './components/RecruitmentFunnel';
import TimelineTrend from './components/TimelineTrend';
import OfferDonut from './components/OfferDonut';

type AlertTab = 'offers' | 'pending' | 'interviews';

export interface DashboardScreenProps {
  onNavigateTab?: (
    tab: 'dashboard' | 'recruitment' | 'interviews' | 'offers' | 'notifications',
    options?: { segment?: 'jobs' | 'candidates' }
  ) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const isDeptManager = user?.role === UserRole.DEPARTMENT_MANAGER;
  const userDeptId =
    typeof user?.departmentId === 'object' && user?.departmentId !== null
      ? (user.departmentId as any)._id
      : user?.departmentId;

  // Filter states
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [allJobs, setAllJobs] = useState<JobDescriptionItem[]>([]);


  // Dashboard Data states
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Alert tab state
  const [activeAlertTab, setActiveAlertTab] = useState<AlertTab>('offers');

  // Xác định department áp dụng (nếu là Manager thì cố định)
  const activeDeptId = isDeptManager && userDeptId ? userDeptId : selectedDeptId;

  // Lấy danh sách ban đầu (Departments, Jobs)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptList, jobList] = await Promise.all([
          adminService.getDepartments(),
          adminService.getJobs(),
        ]);
        setDepartments(deptList);
        setAllJobs(jobList);
      } catch (err) {
        console.error('Lỗi tải danh mục phòng ban và JD:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Lọc danh sách JD theo phòng ban đang chọn
  const availableJobs = useMemo(() => {
    if (!activeDeptId) return [];
    return allJobs.filter((job) => {
      const deptId =
        typeof job.departmentId === 'object' && job.departmentId !== null
          ? (job.departmentId as any)._id
          : job.departmentId;
      const isJobActive =
        job.status === 'JD_CREATED' ||
        job.status === 'APPROVED' ||
        job.status === 'ACTIVE';
      return String(deptId) === String(activeDeptId) && isJobActive;
    });
  }, [allJobs, activeDeptId]);

  // Tên phòng ban & vị trí đang chọn
  const currentDeptName = useMemo(() => {
    if (!activeDeptId) return 'Tất cả phòng ban';
    const found = departments.find((d) => d._id === activeDeptId);
    return found ? found.name : 'Phòng ban đã chọn';
  }, [departments, activeDeptId]);

  const currentJobTitle = useMemo(() => {
    if (!selectedJobId) return 'Tất cả vị trí';
    const found = allJobs.find((j) => j._id === selectedJobId);
    return found ? found.title : 'Vị trí đã chọn';
  }, [allJobs, selectedJobId]);

  const deptOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả phòng ban' },
      ...departments.map((d) => ({ value: d._id, label: d.name })),
    ],
    [departments]
  );

  const jobOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả vị trí' },
      ...availableJobs.map((j) => ({ value: j._id, label: j.title })),
    ],
    [availableJobs]
  );

  // Gọi API lấy dữ liệu thống kê
  const fetchData = useCallback(async () => {
    try {
      const res = await adminService.getDashboardData({
        departmentId: activeDeptId || undefined,
        jobDescriptionId: selectedJobId || undefined,
        months: 6,
        limit: 10,
      });
      setData(res);
    } catch (err) {
      console.error('Lỗi tải dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeDeptId, selectedJobId]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSelectMonths = async (months: number) => {
    try {
      const res = await adminService.getDashboardData({
        departmentId: activeDeptId || undefined,
        jobDescriptionId: selectedJobId || undefined,
        months,
        limit: 10,
      });
      if (res?.trends) {
        setData((prev) => (prev ? { ...prev, trends: res.trends } : res));
      }
    } catch (err) {
      console.error('Lỗi cập nhật xu hướng theo tháng:', err);
    }
  };

  // Reset bộ lọc
  const handleResetFilters = () => {
    if (!isDeptManager) {
      setSelectedDeptId('');
    }
    setSelectedJobId('');
  };

  const isFiltered = Boolean((!isDeptManager && selectedDeptId) || selectedJobId);

  if (loading && !data) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Đang tải dữ liệu báo cáo...</Text>
      </View>
    );
  }

  const kpis = data?.kpis;
  const alerts = data?.alerts;
  const alertSummary = alerts?.summary || {
    totalAlerts: 0,
    expiringOffers: 0,
    staleApplications: 0,
    pendingJobs: 0,
    todayInterviews: 0,
  };
  const totalAlertsCount = (alertSummary.expiringOffers || 0) + (alertSummary.pendingJobs || 0);

  // Tính SLA badge cho Time-to-Hire
  const tthDays = kpis?.timeToHire?.avgDays ?? 0;
  const isTthGood = tthDays > 0 && tthDays <= 25;

  // Tính Offer Acceptance badge
  const offerRate = kpis?.offers?.acceptanceRate ?? 0;
  const isOfferGood = offerRate >= 80;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
      }
    >
      {/* ─── BANNER CHÀO MỪNG ────────────────────────────────────────── */}
      <LinearGradient
        colors={['#1E3A8A', '#2563EB', '#3B82F6']}
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
            <Text style={styles.welcomeSubtitle}>Trung tâm Quản trị & Phân tích Tuyển dụng</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || 'Quản trị viên TalentCore'}
            </Text>
            <Text style={styles.roleTag}>
              {user?.role === UserRole.DEPARTMENT_MANAGER
                ? `Trưởng phòng • ${currentDeptName}`
                : user?.role === UserRole.EMPLOYEE
                ? 'Interviewer'
                : 'Quản trị Nhân sự (HR Admin)'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ─── THANH ĐIỀU KHIỂN & BỘ LỌC (TOP FILTER BAR) ───────────────── */}
      <View style={styles.filterCard}>
        <View style={styles.filterCardHeader}>
          <View style={styles.filterTitleRow}>
            <Ionicons name="options-outline" size={16} color="#1E3A8A" />
            <Text style={styles.filterSectionTitle}>Bộ lọc Báo cáo Quản trị</Text>
          </View>
          {isFiltered && (
            <TouchableOpacity
              onPress={handleResetFilters}
              style={styles.resetButton}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={13} color="#DC2626" />
              <Text style={styles.resetButtonText}>Đặt lại</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterButtonsRow}>
          {/* Nút lọc Phòng ban */}
          <CustomSelect
            containerStyle={{ flex: 1 }}
            value={selectedDeptId}
            onChange={(val) => {
              setSelectedDeptId(val);
              setSelectedJobId('');
            }}
            options={deptOptions}
            placeholder={currentDeptName}
            icon="business"
            disabled={isDeptManager}
            triggerStyle={styles.filterPill}
            triggerTextStyle={styles.filterPillText}
            activeTriggerStyle={styles.filterPillActive}
            activeTriggerTextStyle={styles.filterPillTextActive}
          />

          {/* Nút lọc Vị trí tuyển dụng */}
          <CustomSelect
            containerStyle={{ flex: 1 }}
            value={selectedJobId}
            onChange={(val) => setSelectedJobId(val)}
            options={jobOptions}
            placeholder="Tất cả vị trí"
            icon="briefcase"
            disabled={!activeDeptId}
            triggerStyle={styles.filterPill}
            triggerTextStyle={styles.filterPillText}
            activeTriggerStyle={styles.filterPillActive}
            activeTriggerTextStyle={styles.filterPillTextActive}
          />
        </View>
      </View>

      {/* ─── TẦNG 1: 4 THẺ KPI CHIẾN LƯỢC (KHỚP 100% ẢNH 3 WEB) ─────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chỉ số Hiệu suất Chính (KPIs)</Text>
      </View>
      <KpiStatsGrid
        headcountPlan={kpis?.headcountPlan}
        jobs={kpis?.jobs}
        timeToHire={kpis?.timeToHire}
        offers={kpis?.offers}
      />

      {/* ─── TẦNG 2: CẦN XỬ LÝ NGAY (ACTIONABLE ALERTS) ───────────────── */}
      <View style={styles.blockCard}>
        <View style={styles.blockHeaderBetween}>
          <View style={styles.alertHeaderLeft}>
            <View style={styles.alertIconCircle}>
              <Ionicons name="warning" size={15} color="#D97706" />
            </View>
            <View>
              <Text style={styles.blockTitle}>Cần Xử Lý Ngay</Text>
              <Text style={styles.blockSubtitle}>Cảnh báo hạn chót & tồn đọng</Text>
            </View>
          </View>
          <View
            style={[
              styles.alertCountBadge,
              totalAlertsCount > 0
                ? styles.alertCountBadgeWarning
                : styles.alertCountBadgeSuccess,
            ]}
          >
            <Text
              style={[
                styles.alertCountBadgeText,
                totalAlertsCount > 0
                  ? styles.alertCountBadgeTextWarning
                  : styles.alertCountBadgeTextSuccess,
              ]}
            >
              {totalAlertsCount > 0
                ? `${totalAlertsCount} việc ưu tiên`
                : 'Ổn định'}
            </Text>
          </View>
        </View>

        {/* 4 Mini Tabs */}
        <View style={styles.alertTabContainer}>
          <TouchableOpacity
            style={[
              styles.alertTabButton,
              activeAlertTab === 'offers' && styles.alertTabButtonActive,
            ]}
            onPress={() => setActiveAlertTab('offers')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.alertTabButtonText,
                activeAlertTab === 'offers' && styles.alertTabButtonTextActive,
              ]}
            >
              Offer
            </Text>
            {alertSummary.expiringOffers > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.tabBadgeText}>{alertSummary.expiringOffers}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.alertTabButton,
              activeAlertTab === 'pending' && styles.alertTabButtonActive,
            ]}
            onPress={() => setActiveAlertTab('pending')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.alertTabButtonText,
                activeAlertTab === 'pending' && styles.alertTabButtonTextActive,
              ]}
            >
              JD
            </Text>
            {alertSummary.pendingJobs > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: '#6366F1' }]}>
                <Text style={styles.tabBadgeText}>{alertSummary.pendingJobs}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.alertTabButton,
              activeAlertTab === 'interviews' && styles.alertTabButtonActive,
            ]}
            onPress={() => setActiveAlertTab('interviews')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.alertTabButtonText,
                activeAlertTab === 'interviews' && styles.alertTabButtonTextActive,
              ]}
            >
              Phỏng vấn
            </Text>
            {alertSummary.todayInterviews > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: '#10B981' }]}>
                <Text style={styles.tabBadgeText}>{alertSummary.todayInterviews}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Nội dung tương ứng của Alert Tab */}
        <View style={styles.alertContentBox}>
          {activeAlertTab === 'offers' && (
            alerts?.expiringOffers?.length ? (
              alerts.expiringOffers.map((item) => (
                <View key={item.id} style={styles.alertItemRow}>
                  <View style={styles.alertItemLeft}>
                    <Text style={styles.alertItemTitle} numberOfLines={1}>
                      {item.candidateName}
                    </Text>
                    <Text style={styles.alertItemDesc} numberOfLines={1}>
                      {item.positionTitle || item.jobTitle} • {item.salary?.toLocaleString('vi-VN')} ₫
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.alertBadgeSmall,
                      item.isOverdue ? styles.badgeRose : styles.badgeAmber,
                    ]}
                  >
                    <Text
                      style={[
                        styles.alertBadgeSmallText,
                        item.isOverdue ? styles.textRose : styles.textAmber,
                      ]}
                    >
                      {item.isOverdue ? 'Quá hạn' : `Còn ${(item).hoursLeft ?? item.daysLeft ?? 10}h`}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyAlertBox}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
                <Text style={styles.emptyAlertText}>Không có Offer nào sắp hết hạn</Text>
              </View>
            )
          )}

          {activeAlertTab === 'pending' && (
            alerts?.pendingJobs?.length ? (
              alerts.pendingJobs.map((item) => {
                let daysLeft = item.daysLeft;
                const deadlineStr = item.deadline || item.applicationDeadline;
                if ((daysLeft === undefined || daysLeft === null) && deadlineStr) {
                  const deadlineTime = new Date(deadlineStr).getTime();
                  if (!isNaN(deadlineTime)) {
                    daysLeft = Math.ceil((deadlineTime - Date.now()) / (1000 * 60 * 60 * 24));
                  }
                }

                const isOverdue = item.isOverdue || (daysLeft !== null && daysLeft !== undefined && daysLeft < 0);
                const targetCount = item.targetHeadcount ?? item.headcount ?? 1;
                const hired = item.hiredCount ?? 0;
                const appCount = item.applicationCount ?? 0;

                let badgeText = '';
                if (daysLeft !== null && daysLeft !== undefined) {
                  badgeText = isOverdue ? 'Đã hết hạn' : `Còn ${daysLeft} ngày`;
                } else {
                  badgeText = `${targetCount} chỉ tiêu`;
                }

                return (
                  <View key={item.id} style={styles.alertItemRow}>
                    <View style={styles.alertItemLeft}>
                      <Text style={styles.alertItemTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.alertItemDesc} numberOfLines={1}>
                        {item.departmentName ? `${item.departmentName} • ` : ''}Đã tuyển {hired}/{targetCount} • {appCount} đơn nộp
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.alertBadgeSmall,
                        isOverdue ? styles.badgeRose : styles.badgeAmber,
                      ]}
                    >
                      <Text
                        style={[
                          styles.alertBadgeSmallText,
                          isOverdue ? styles.textRose : styles.textAmber,
                        ]}
                      >
                        {badgeText}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyAlertBox}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
                <Text style={styles.emptyAlertText}>Tất cả tin JD đều trong hạn tuyển</Text>
              </View>
            )
          )}

          {activeAlertTab === 'interviews' && (
            alerts?.todayInterviews?.length ? (
              alerts.todayInterviews.map((item) => (
                <View key={item.id} style={styles.alertItemRow}>
                  <View style={styles.alertItemLeft}>
                    <Text style={styles.alertItemTitle} numberOfLines={1}>
                      {item.candidateName}
                    </Text>
                    <Text style={styles.alertItemDesc} numberOfLines={1}>
                      {item.jobTitle} • {item.startTime} - {item.endTime}
                    </Text>
                  </View>
                  <View style={[styles.alertBadgeSmall, styles.badgeBlue]}>
                    <Text style={[styles.alertBadgeSmallText, styles.textBlue]}>
                      Hôm nay
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyAlertBox}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
                <Text style={styles.emptyAlertText}>Không có lịch phỏng vấn tồn đọng</Text>
              </View>
            )
          )}
        </View>

        {/* Footer: Link xem chi tiết danh sách */}
        <TouchableOpacity
          style={styles.alertFooterLink}
          activeOpacity={0.7}
          onPress={() => {
            if (activeAlertTab === 'offers') {
              onNavigateTab?.('offers');
            } else if (activeAlertTab === 'pending') {
              onNavigateTab?.('recruitment', { segment: 'jobs' });
            } else if (activeAlertTab === 'interviews') {
              onNavigateTab?.('interviews');
            }
          }}
        >
          <Text style={styles.alertFooterLinkText}>Xem chi tiết danh sách</Text>
          <Ionicons name="chevron-forward" size={13} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* ─── TẦNG 3: TIẾN ĐỘ PHÒNG BAN (KHỚP 100% ẢNH 3 WEB) ───────────── */}
      <View style={styles.blockCard}>
        <View style={styles.blockHeaderBetween}>
          <View style={styles.alertHeaderLeft}>
            <View style={[styles.alertIconCircle, { backgroundColor: '#F5F3FF', borderColor: '#EDE9FE' }]}>
              <Ionicons name="business" size={15} color="#7C3AED" />
            </View>
            <View>
              <Text style={styles.blockTitle}>Tiến độ Phòng ban</Text>
              <Text style={styles.blockSubtitle}>Chỉ tiêu nhân sự tuyển dụng</Text>
            </View>
          </View>
          <Text style={styles.deptCountBadgeText}>
            {data?.departmentFulfillment?.length || 0} phòng ban
          </Text>
        </View>

        <View style={styles.deptList}>
          {data?.departmentFulfillment?.map((dept) => {
            const pct = dept.percentage || 0;
            const barColor = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#F43F5E';
            const badgeBg = pct >= 80 ? '#ECFDF5' : pct >= 50 ? '#FFFBEB' : '#FEF2F2';
            const badgeBorder = pct >= 80 ? '#A7F3D0' : pct >= 50 ? '#FEF3C7' : '#FECACA';
            const badgeText = pct >= 80 ? '#047857' : pct >= 50 ? '#B45309' : '#DC2626';

            return (
              <View key={dept.id} style={styles.deptItemBox}>
                <View style={styles.deptHeaderRow}>
                  <Text style={styles.deptNameText} numberOfLines={1}>
                    {dept.name}
                  </Text>
                  <View style={styles.deptRightMetrics}>
                    <Text style={styles.deptHiredRatio}>
                      {dept.hiredCount}/{dept.targetHeadcount}
                    </Text>
                    <View
                      style={[
                        styles.deptPctBadge,
                        { backgroundColor: badgeBg, borderColor: badgeBorder },
                      ]}
                    >
                      <Text style={[styles.deptPctText, { color: badgeText }]}>{pct}%</Text>
                    </View>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.deptProgressTrack}>
                  <View
                    style={[
                      styles.deptProgressBar,
                      {
                        width: `${Math.min(100, Math.max(2, pct))}%`,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* ─── TẦNG 4: PHỄU TUYỂN DỤNG (KHỚP 100% ẢNH 3 WEB) ─────────────── */}
      <RecruitmentFunnel
        stages={data?.funnel?.stages}
        totalApplications={data?.funnel?.totalApplications}
        overallRate={data?.funnel?.conversionRates?.overallRate}
      />

      {/* ─── TẦNG 5: XU HƯỚNG TUYỂN DỤNG (SVG AREA CHART) ──────────────── */}
      <TimelineTrend
        data={data?.trends?.data}
        onSelectMonths={handleSelectMonths}
      />

      {/* ─── TẦNG 6: PHÂN TÍCH OFFER (SVG DONUT CHART) ─────────────────── */}
      <OfferDonut
        totalOffers={data?.offers?.totalOffers}
        acceptanceRate={data?.offers?.acceptanceRate}
        statusCounts={data?.offers?.statusCounts}
      />
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
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 110,
  },
  loadingBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  // Banner
  welcomeBanner: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  bannerInfo: {
    flex: 1,
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 1,
  },
  roleTag: {
    color: '#BFDBFE',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  // Filter Card
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  filterCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  filterButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  filterPillDisabled: {
    opacity: 0.6,
  },
  filterPillText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#1E3A8A',
    fontWeight: '700',
  },

  // Section Header
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Block Card
  blockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  blockHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  alertHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  blockSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  alertCountBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  alertCountBadgeWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
  },
  alertCountBadgeSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  alertCountBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  alertCountBadgeTextWarning: {
    color: '#B45309',
  },
  alertCountBadgeTextSuccess: {
    color: '#047857',
  },

  // Alert Tabs
  alertTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
    marginBottom: 10,
    gap: 2,
  },
  alertTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5.5,
    borderRadius: 6,
    gap: 4,
  },
  alertTabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  alertTabButtonText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  alertTabButtonTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  tabBadge: {
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  alertContentBox: {
    minHeight: 60,
  },
  alertItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  alertItemLeft: {
    flex: 1,
    marginRight: 8,
  },
  alertItemTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  alertItemDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1.5,
  },
  alertBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  alertBadgeSmallText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  badgeRose: { backgroundColor: '#FEE2E2' },
  textRose: { color: '#B91C1C' },
  badgeAmber: { backgroundColor: '#FEF3C7' },
  textAmber: { color: '#B45309' },
  badgeBlue: { backgroundColor: '#DBEAFE' },
  textBlue: { color: '#1D4ED8' },
  badgeGreen: { backgroundColor: '#DCFCE7' },
  textGreen: { color: '#15803D' },
  emptyAlertBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 4,
  },
  emptyAlertText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  alertFooterLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  alertFooterLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },

  // Department List
  deptCountBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  deptList: {
    gap: 9,
  },
  deptItemBox: {
    gap: 5,
  },
  deptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deptNameText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
    marginRight: 8,
  },
  deptRightMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deptHiredRatio: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  deptPctBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 1,
  },
  deptPctText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  deptProgressTrack: {
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  deptProgressBar: {
    height: '100%',
    borderRadius: 2.5,
  },
});
