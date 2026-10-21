import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
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

type AlertTab = 'offers' | 'stale' | 'pending' | 'interviews';

export const DashboardScreen: React.FC = () => {
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

  // Modal selector states
  const [deptModalVisible, setDeptModalVisible] = useState<boolean>(false);
  const [jobModalVisible, setJobModalVisible] = useState<boolean>(false);

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
                ? 'Hội đồng Phỏng vấn'
                : 'Giám đốc Nhân sự (HR Admin)'}
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
          <TouchableOpacity
            style={[
              styles.filterPill,
              (activeDeptId || deptModalVisible) ? styles.filterPillActive : null,
              isDeptManager ? styles.filterPillDisabled : null,
            ]}
            onPress={() => !isDeptManager && setDeptModalVisible(true)}
            activeOpacity={isDeptManager ? 1 : 0.7}
          >
            <Ionicons
              name="business"
              size={14}
              color={activeDeptId || deptModalVisible ? '#1E3A8A' : '#64748B'}
            />
            <Text
              style={[
                styles.filterPillText,
                (activeDeptId || deptModalVisible) ? styles.filterPillTextActive : null,
              ]}
              numberOfLines={1}
            >
              {currentDeptName}
            </Text>
            {!isDeptManager && (
              <Ionicons
                name={deptModalVisible ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={deptModalVisible ? '#1E3A8A' : '#64748B'}
              />
            )}
          </TouchableOpacity>

          {/* Nút lọc Vị trí tuyển dụng */}
          <TouchableOpacity
            style={[
              styles.filterPill,
              (selectedJobId || jobModalVisible) ? styles.filterPillActive : null,
              !activeDeptId ? styles.filterPillDisabled : null,
            ]}
            onPress={() => activeDeptId && setJobModalVisible(true)}
            activeOpacity={!activeDeptId ? 1 : 0.7}
          >
            <Ionicons
              name="briefcase"
              size={14}
              color={selectedJobId || jobModalVisible ? '#1E3A8A' : '#64748B'}
            />
            <Text
              style={[
                styles.filterPillText,
                (selectedJobId || jobModalVisible) ? styles.filterPillTextActive : null,
              ]}
              numberOfLines={1}
            >
              {currentJobTitle}
            </Text>
            <Ionicons
              name={jobModalVisible ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={jobModalVisible ? '#1E3A8A' : '#64748B'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── TẦNG 1: 4 THẺ KPI CHIẾN LƯỢC (STRATEGIC KPIS) ─────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chỉ số Hiệu suất Chính (KPIs)</Text>
      </View>

      <View style={styles.kpiGrid}>
        {/* KPI 1: Định biên Tuyển dụng */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiTopRow}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="flag" size={18} color="#2563EB" />
            </View>
            <View style={[styles.badge, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.badgeText, { color: '#1E40AF' }]}>
                {kpis?.headcountPlan?.percentage || 0}% đạt
              </Text>
            </View>
          </View>
          <Text style={styles.kpiLabel}>CHỈ TIÊU TUYỂN DỤNG</Text>
          <View style={styles.kpiValueRow}>
            <Text style={styles.kpiValue}>
              {kpis?.headcountPlan?.hired || 0}
              <Text style={styles.kpiSubValue}> / {kpis?.headcountPlan?.target || 0}</Text>
            </Text>
            <Text style={styles.kpiUnit}>người</Text>
          </View>
          <View style={styles.miniProgressBarTrack}>
            <View
              style={[
                styles.miniProgressBarFill,
                { width: `${Math.min(100, kpis?.headcountPlan?.percentage || 0)}%` },
              ]}
            />
          </View>
        </View>

        {/* KPI 2: Vị trí Đang mở */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiTopRow}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="briefcase" size={18} color="#7C3AED" />
            </View>
            <View style={[styles.badge, { backgroundColor: '#EDE9FE' }]}>
              <Text style={[styles.badgeText, { color: '#6D28D9' }]}>
                {kpis?.headcountPlan?.target || 0} cần tuyển
              </Text>
            </View>
          </View>
          <Text style={styles.kpiLabel}>VỊ TRÍ ĐANG MỞ</Text>
          <View style={styles.kpiValueRow}>
            <Text style={styles.kpiValue}>{kpis?.jobs?.active || 0}</Text>
            <Text style={styles.kpiUnit}>vị trí</Text>
          </View>
          <Text style={styles.kpiSubText}>
            +{kpis?.jobs?.newCount || 0} JD tạo mới trong tháng
          </Text>
        </View>

        {/* KPI 3: Tốc độ Tuyển dụng TB (Time-to-Hire) */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiTopRow}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="timer" size={18} color="#EA580C" />
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: isTthGood ? '#DCFCE7' : '#FEE2E2' },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: isTthGood ? '#166534' : '#991B1B' },
                ]}
              >
                {isTthGood ? 'SLA ≤ 25 ngày' : 'Cần đẩy nhanh'}
              </Text>
            </View>
          </View>
          <Text style={styles.kpiLabel}>TỐC ĐỘ TUYỂN DỤNG</Text>
          <View style={styles.kpiValueRow}>
            <Text style={styles.kpiValue}>{tthDays}</Text>
            <Text style={styles.kpiUnit}>ngày / người</Text>
          </View>
          <Text style={styles.kpiSubText}>
            Mẫu tính trên {kpis?.timeToHire?.sampleSize || 0} ứng viên đã nhận việc
          </Text>
        </View>

        {/* KPI 4: Tỷ lệ Nhận Offer */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiTopRow}>
            <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="checkmark-done-circle" size={18} color="#059669" />
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: isOfferGood ? '#DCFCE7' : '#FEF3C7' },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: isOfferGood ? '#166534' : '#92400E' },
                ]}
              >
                {isOfferGood ? 'Chuẩn ≥ 80%' : 'Chưa đạt 80%'}
              </Text>
            </View>
          </View>
          <Text style={styles.kpiLabel}>TỶ LỆ NHẬN OFFER</Text>
          <View style={styles.kpiValueRow}>
            <Text style={styles.kpiValue}>{offerRate}%</Text>
            <Text style={styles.kpiUnit}>đồng ý</Text>
          </View>
          <Text style={styles.kpiSubText}>
            {kpis?.offers?.accepted || 0} đã nhận việc • {kpis?.offers?.sent || 0} chờ phản hồi
          </Text>
        </View>
      </View>

      {/* ─── TẦNG 2: CẦN XỬ LÝ NGAY (ACTIONABLE ALERTS) ───────────────── */}
      <View style={styles.blockCard}>
        <View style={styles.blockHeaderBetween}>
          <View style={styles.alertHeaderLeft}>
            <View style={styles.alertIconCircle}>
              <Ionicons name="warning" size={16} color="#D97706" />
            </View>
            <View>
              <Text style={styles.blockTitle}>Cần Xử Lý Ngay</Text>
              <Text style={styles.blockSubtitle}>Cảnh báo hạn chót & tồn đọng</Text>
            </View>
          </View>
          <View
            style={[
              styles.alertCountBadge,
              alertSummary.totalAlerts > 0
                ? styles.alertCountBadgeWarning
                : styles.alertCountBadgeSuccess,
            ]}
          >
            <Text
              style={[
                styles.alertCountBadgeText,
                alertSummary.totalAlerts > 0
                  ? styles.alertCountBadgeTextWarning
                  : styles.alertCountBadgeTextSuccess,
              ]}
            >
              {alertSummary.totalAlerts > 0
                ? `${alertSummary.totalAlerts} việc ưu tiên`
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
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{alertSummary.expiringOffers}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.alertTabButton,
              activeAlertTab === 'stale' && styles.alertTabButtonActive,
            ]}
            onPress={() => setActiveAlertTab('stale')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.alertTabButtonText,
                activeAlertTab === 'stale' && styles.alertTabButtonTextActive,
              ]}
            >
              CV tồn
            </Text>
            {alertSummary.staleApplications > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{alertSummary.staleApplications}</Text>
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
              <View style={styles.tabBadge}>
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
              <View style={styles.tabBadge}>
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
                    <Text style={styles.alertItemTitle}>{item.candidateName}</Text>
                    <Text style={styles.alertItemDesc}>
                      {item.positionTitle} • Lương {item.salary?.toLocaleString('vi-VN')} ₫
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
                      {item.isOverdue ? 'Quá hạn phản hồi' : `Còn ${item.daysLeft} ngày`}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyAlertBox}>
                <Ionicons name="checkmark-circle-outline" size={26} color="#10B981" />
                <Text style={styles.emptyAlertText}>Không có Offer nào sắp hết hạn</Text>
              </View>
            )
          )}

          {activeAlertTab === 'stale' && (
            alerts?.staleApplications?.length ? (
              alerts.staleApplications.map((item) => (
                <View key={item.id} style={styles.alertItemRow}>
                  <View style={styles.alertItemLeft}>
                    <Text style={styles.alertItemTitle}>{item.candidateName}</Text>
                    <Text style={styles.alertItemDesc}>
                      {item.jobTitle} • Vòng: {item.stageName}
                    </Text>
                  </View>
                  <View style={[styles.alertBadgeSmall, styles.badgeRose]}>
                    <Text style={[styles.alertBadgeSmallText, styles.textRose]}>
                      Tồn {item.daysInStage} ngày
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyAlertBox}>
                <Ionicons name="checkmark-circle-outline" size={26} color="#10B981" />
                <Text style={styles.emptyAlertText}>Không có CV nào tồn đọng quá 5 ngày</Text>
              </View>
            )
          )}

          {activeAlertTab === 'pending' && (
            alerts?.pendingJobs?.length ? (
              alerts.pendingJobs.map((item) => (
                <View key={item.id} style={styles.alertItemRow}>
                  <View style={styles.alertItemLeft}>
                    <Text style={styles.alertItemTitle}>{item.title}</Text>
                    <Text style={styles.alertItemDesc}>
                      Đã tuyển {item.hiredCount}/{item.targetHeadcount} • {item.applicationCount} đơn nộp
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
                      {item.isOverdue ? 'Đã hết hạn' : `Còn ${item.daysLeft} ngày`}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyAlertBox}>
                <Ionicons name="checkmark-circle-outline" size={26} color="#10B981" />
                <Text style={styles.emptyAlertText}>Tất cả các tin JD đều trong hạn tuyển</Text>
              </View>
            )
          )}

          {activeAlertTab === 'interviews' && (
            alerts?.todayInterviews?.length ? (
              alerts.todayInterviews.map((item) => (
                <View key={item.id} style={styles.alertItemRow}>
                  <View style={styles.alertItemLeft}>
                    <Text style={styles.alertItemTitle}>{item.candidateName}</Text>
                    <Text style={styles.alertItemDesc}>
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
                <Ionicons name="checkmark-circle-outline" size={26} color="#10B981" />
                <Text style={styles.emptyAlertText}>Không có lịch phỏng vấn tồn đọng</Text>
              </View>
            )
          )}
        </View>
      </View>

      {/* ─── TẦNG 3: PHỄU TUYỂN DỤNG (RECRUITMENT FUNNEL) ──────────────── */}
      <View style={styles.blockCard}>
        <View style={styles.blockHeaderBetween}>
          <View style={styles.alertHeaderLeft}>
            <View style={[styles.alertIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="filter" size={16} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.blockTitle}>Phễu Tuyển Dụng</Text>
              <Text style={styles.blockSubtitle}>Tỷ lệ chuyển đổi qua các vòng</Text>
            </View>
          </View>
          <Text style={styles.funnelTotalText}>
            {data?.funnel?.totalApplications || 0} hồ sơ
          </Text>
        </View>

        <View style={styles.funnelContainer}>
          {data?.funnel?.stages?.map((stage, idx) => {
            const isLast = idx === (data.funnel.stages.length - 1);
            return (
              <View key={stage.id} style={styles.funnelStageBox}>
                <View style={styles.funnelRow}>
                  <View style={styles.funnelStageNameBox}>
                    <Text style={styles.funnelStageIndex}>{idx + 1}.</Text>
                    <Text style={styles.funnelStageName}>{stage.name}</Text>
                  </View>
                  <View style={styles.funnelMetricsBox}>
                    <Text style={styles.funnelStageCount}>
                      {stage.count} <Text style={styles.funnelStageUnit}>người</Text>
                    </Text>
                    <Text style={styles.funnelStagePct}>({stage.percentage}%)</Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.funnelTrack}>
                  <View
                    style={[
                      styles.funnelBar,
                      {
                        width: `${Math.max(6, Math.min(100, stage.percentage))}%`,
                        backgroundColor: stage.color || '#2563EB',
                      },
                    ]}
                  />
                </View>

                {/* Step conversion rate arrow */}
                {!isLast && stage.stepConversionRate !== undefined && (
                  <View style={styles.stepConversionRow}>
                    <Ionicons name="arrow-down" size={11} color="#94A3B8" />
                    <Text style={styles.stepConversionText}>
                      Chuyển vòng: {stage.stepConversionRate}%
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* ─── TẦNG 4: TIẾN ĐỘ THEO PHÒNG BAN ───────────────────────────── */}
      <View style={styles.blockCard}>
        <View style={styles.blockHeaderBetween}>
          <View style={styles.alertHeaderLeft}>
            <View style={[styles.alertIconCircle, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="business" size={16} color="#7C3AED" />
            </View>
            <View>
              <Text style={styles.blockTitle}>Tiến độ Tuyển dụng Phòng ban</Text>
              <Text style={styles.blockSubtitle}>Tỷ lệ lấp đầy định biên nhân sự</Text>
            </View>
          </View>
        </View>

        <View style={styles.deptList}>
          {data?.departmentFulfillment?.map((dept) => {
            const isFull = dept.percentage >= 100;
            const isSelected = activeDeptId === dept.id;
            return (
              <TouchableOpacity
                key={dept.id}
                style={[
                  styles.deptItemCard,
                  isSelected && styles.deptItemCardSelected,
                ]}
                onPress={() => {
                  if (!isDeptManager) {
                    setSelectedDeptId(isSelected ? '' : dept.id);
                    setSelectedJobId('');
                  }
                }}
                activeOpacity={isDeptManager ? 1 : 0.7}
              >
                <View style={styles.deptHeaderRow}>
                  <View style={styles.deptNameLeft}>
                    <Text style={styles.deptNameText}>{dept.name}</Text>
                    <Text style={styles.deptJobsText}>
                      {dept.activeJobs} vị trí đang mở
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.deptBadge,
                      isFull ? styles.badgeGreen : styles.badgeBlue,
                    ]}
                  >
                    <Text
                      style={[
                        styles.deptBadgeText,
                        isFull ? styles.textGreen : styles.textBlue,
                      ]}
                    >
                      {dept.hiredCount} / {dept.targetHeadcount} ({dept.percentage}%)
                    </Text>
                  </View>
                </View>

                <View style={styles.deptTrack}>
                  <View
                    style={[
                      styles.deptBar,
                      {
                        width: `${Math.min(100, dept.percentage)}%`,
                        backgroundColor: isFull ? '#10B981' : '#3B82F6',
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ─── TẦNG 5: XU HƯỚNG TUYỂN DỤNG CÁC THÁNG ─────────────────────── */}
      <View style={styles.blockCard}>
        <View style={styles.blockHeaderBetween}>
          <View style={styles.alertHeaderLeft}>
            <View style={[styles.alertIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="trending-up" size={16} color="#059669" />
            </View>
            <View>
              <Text style={styles.blockTitle}>Xu Hướng Tuyển Dụng</Text>
              <Text style={styles.blockSubtitle}>Biến động hồ sơ & nhân sự nhận việc</Text>
            </View>
          </View>
        </View>

        <View style={styles.trendList}>
          {data?.trends?.data?.map((m) => (
            <View key={m.month} style={styles.trendRow}>
              <Text style={styles.trendMonthLabel}>{m.month}</Text>
              <View style={styles.trendBarsBox}>
                <View style={styles.trendBarItem}>
                  <View
                    style={[
                      styles.trendBarFill,
                      {
                        width: `${Math.min(100, Math.max(8, m.applications * 1.5))}%`,
                        backgroundColor: '#3B82F6',
                      },
                    ]}
                  />
                  <Text style={styles.trendBarText}>{m.applications} ứng tuyển</Text>
                </View>
                <View style={styles.trendBarItem}>
                  <View
                    style={[
                      styles.trendBarFill,
                      {
                        width: `${Math.min(100, Math.max(8, m.hired * 8))}%`,
                        backgroundColor: '#10B981',
                      },
                    ]}
                  />
                  <Text style={styles.trendBarText}>{m.hired} nhận việc</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ─── TẦNG 6: PHÂN TÍCH KẾT QUẢ OFFER ───────────────────────────── */}
      <View style={styles.blockCard}>
        <View style={styles.blockHeaderBetween}>
          <View style={styles.alertHeaderLeft}>
            <View style={[styles.alertIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="pie-chart" size={16} color="#1E3A8A" />
            </View>
            <View>
              <Text style={styles.blockTitle}>Cơ cấu Thư mời Nhận việc</Text>
              <Text style={styles.blockSubtitle}>
                Tổng số {data?.offers?.totalOffers || 0} Offer • Chấp nhận {data?.offers?.acceptanceRate || 0}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.offerBreakdownGrid}>
          {data?.offers?.chartData?.map((item, idx) => (
            <View key={idx} style={styles.offerStatBox}>
              <View style={styles.offerStatTop}>
                <View style={[styles.offerDot, { backgroundColor: item.color }]} />
                <Text style={styles.offerStatName}>{item.name}</Text>
              </View>
              <Text style={styles.offerStatCount}>{item.count}</Text>
              <Text style={styles.offerStatPct}>
                {data.offers.totalOffers > 0
                  ? Math.round((item.count / data.offers.totalOffers) * 100)
                  : 0}
                %
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ─── MODAL CHỌN PHÒNG BAN (GIỐNG WEB) ───────────────────────── */}
      <Modal
        visible={deptModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeptModalVisible(false)}
      >
        <Pressable
          style={styles.webDropdownOverlay}
          onPress={() => setDeptModalVisible(false)}
        >
          <Pressable
            style={styles.webDropdownCard}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              style={styles.webDropdownList}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity
                style={[
                  styles.webDropdownItem,
                  !selectedDeptId && styles.webDropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedDeptId('');
                  setSelectedJobId('');
                  setDeptModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.webDropdownItemText,
                    !selectedDeptId && styles.webDropdownItemTextActive,
                  ]}
                >
                  Tất cả phòng ban
                </Text>
                {!selectedDeptId && (
                  <Ionicons name="checkmark" size={17} color="#2563EB" />
                )}
              </TouchableOpacity>
              {departments.map((dept) => (
                <TouchableOpacity
                  key={dept._id}
                  style={[
                    styles.webDropdownItem,
                    selectedDeptId === dept._id && styles.webDropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedDeptId(dept._id);
                    setSelectedJobId('');
                    setDeptModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.webDropdownItemText,
                      selectedDeptId === dept._id && styles.webDropdownItemTextActive,
                    ]}
                  >
                    {dept.name}
                  </Text>
                  {selectedDeptId === dept._id && (
                    <Ionicons name="checkmark" size={17} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ─── MODAL CHỌN VỊ TRÍ TUYỂN DỤNG (GIỐNG WEB) ───────────────── */}
      <Modal
        visible={jobModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setJobModalVisible(false)}
      >
        <Pressable
          style={styles.webDropdownOverlay}
          onPress={() => setJobModalVisible(false)}
        >
          <Pressable
            style={styles.webDropdownCard}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              style={styles.webDropdownList}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity
                style={[
                  styles.webDropdownItem,
                  !selectedJobId && styles.webDropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedJobId('');
                  setJobModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.webDropdownItemText,
                    !selectedJobId && styles.webDropdownItemTextActive,
                  ]}
                >
                  Tất cả vị trí
                </Text>
                {!selectedJobId && (
                  <Ionicons name="checkmark" size={17} color="#2563EB" />
                )}
              </TouchableOpacity>
              {availableJobs.map((job) => (
                <TouchableOpacity
                  key={job._id}
                  style={[
                    styles.webDropdownItem,
                    selectedJobId === job._id && styles.webDropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedJobId(job._id);
                    setJobModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.webDropdownItemText,
                      selectedJobId === job._id && styles.webDropdownItemTextActive,
                    ]}
                  >
                    {job.title}
                  </Text>
                  {selectedJobId === job._id && (
                    <Ionicons name="checkmark" size={17} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kpiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  kpiLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  kpiValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  kpiSubValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  kpiUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  kpiSubText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 13,
  },
  miniProgressBarTrack: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  miniProgressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },

  // Block Card
  blockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  blockSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  alertCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  alertCountBadgeWarning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  alertCountBadgeSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  alertCountBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  alertCountBadgeTextWarning: {
    color: '#B45309',
  },
  alertCountBadgeTextSuccess: {
    color: '#15803D',
  },

  // Alert Tabs
  alertTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 2,
    marginBottom: 10,
  },
  alertTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
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
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  alertTabButtonTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  tabBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  alertContentBox: {
    minHeight: 80,
  },
  alertItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  alertItemLeft: {
    flex: 1,
    marginRight: 8,
  },
  alertItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  alertItemDesc: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  alertBadgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
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
    paddingVertical: 20,
    gap: 6,
  },
  emptyAlertText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },

  // Funnel
  funnelTotalText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  funnelContainer: {
    gap: 8,
  },
  funnelStageBox: {
    marginBottom: 4,
  },
  funnelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  funnelStageNameBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  funnelStageIndex: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  funnelStageName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  funnelMetricsBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  funnelStageCount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  funnelStageUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
  },
  funnelStagePct: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
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
  stepConversionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
    marginLeft: 14,
  },
  stepConversionText: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
  },

  // Department List
  deptList: {
    gap: 8,
  },
  deptItemCard: {
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deptItemCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  deptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  deptNameLeft: {
    flex: 1,
    marginRight: 6,
  },
  deptNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  deptJobsText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  deptBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deptBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  deptTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  deptBar: {
    height: '100%',
    borderRadius: 3,
  },

  // Trend
  trendList: {
    gap: 8,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  trendMonthLabel: {
    width: 60,
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  trendBarsBox: {
    flex: 1,
    gap: 4,
  },
  trendBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendBarFill: {
    height: 6,
    borderRadius: 3,
  },
  trendBarText: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
  },

  // Offer breakdown
  offerBreakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  offerStatBox: {
    width: '31.3%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  offerStatTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  offerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  offerStatName: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#475569',
  },
  offerStatCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  offerStatPct: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 1,
  },

  // ─── WEB-STYLE FLOATING DROPDOWN MODAL (KHỚP 100% WEB & RECRUITMENT) ───
  webDropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  webDropdownCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  webDropdownList: {
    maxHeight: 280,
  },
  webDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 2,
  },
  webDropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  webDropdownItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  webDropdownItemTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
});
