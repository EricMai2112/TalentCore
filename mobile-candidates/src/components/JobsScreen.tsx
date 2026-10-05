import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/job.service';
import { DepartmentItem, JobItem } from '../types/job.types';
import { JobSkeleton } from './JobSkeleton';

interface JobsScreenProps {
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onApplyJob?: (job: JobItem) => void;
}

export const JobsScreen: React.FC<JobsScreenProps> = ({
  onOpenNotifications,
  onOpenProfile,
  onApplyJob,
}) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('All');
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [expandedJobIds, setExpandedJobIds] = useState<string[]>([]);

  const toggleExpandJob = (id: string) => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedJobIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const loadData = async () => {
    try {
      const [jobsData, deptsData] = await Promise.all([
        jobService.getJobs(),
        jobService.getDepartments(),
      ]);
      setJobs(jobsData);
      setDepartments(deptsData);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleSaveJob = (id: string) => {
    setSavedJobIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenJobDetail = (job: JobItem) => {
    router.push(`/job/${job._id}` as any);
  };

  const handleLogoutPress = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Chào buổi sáng'
      : currentHour < 18
      ? 'Chào buổi chiều'
      : 'Chào buổi tối';

  const displayName = user?.name || user?.email?.split('@')[0] || 'Ứng viên';

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesDept = true;
    if (selectedDeptId !== 'All') {
      const selectedDeptObj = departments.find((d) => d.id === selectedDeptId);
      if (selectedDeptObj) {
        matchesDept =
          job.department.toLowerCase().includes(selectedDeptObj.name.toLowerCase()) ||
          job.departmentCode === selectedDeptObj.id;
      }
    }

    return matchesSearch && matchesDept;
  });

  return (
    <View style={styles.screenWrapper}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#7c3aed" />
        }
      >
        <LinearGradient
          colors={['#7c3aed', '#6366f1', '#2563eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBanner}
        >
          <SafeAreaView>
            <View style={styles.headerTop}>
              <Image
                source={require('../../assets/images/logo-talentcore.png')}
                style={styles.headerLogoLarge}
                resizeMode="contain"
              />

              <View style={styles.headerActions}>
                <Pressable
                  style={styles.headerActionBtn}
                  onPress={onOpenNotifications}
                  hitSlop={10}
                >
                  <Ionicons name="notifications-outline" size={20} color="#1e1b4b" />
                  <View style={styles.notificationDot} />
                </Pressable>

                <Pressable
                  style={styles.headerActionBtn}
                  onPress={handleLogoutPress}
                  hitSlop={10}
                >
                  <Ionicons name="log-out-outline" size={20} color="#dc2626" />
                </Pressable>
              </View>
            </View>

            <View style={styles.greetingBox}>
              <Text style={styles.greetingText}>
                {greeting}, {displayName}!
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.searchSection}>
          <View style={styles.searchInputCard}>
            <Ionicons name="search-outline" size={20} color="#7c3aed" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm việc theo tên, kỹ năng hoặc địa điểm..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </Pressable>
            )}
            <Pressable style={styles.filterInsideBtn} hitSlop={10}>
              <Ionicons name="options-outline" size={20} color="#2563eb" />
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>Tìm việc theo ngành</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.deptChipsScroll}
        >
          {departments.map((dept) => {
            const isSelected = selectedDeptId === dept.id;
            return (
              <Pressable
                key={dept.id}
                style={[styles.deptCardItem, isSelected && styles.deptCardItemSelected]}
                onPress={() => setSelectedDeptId(dept.id)}
              >
                <View
                  style={[
                    styles.deptIconCircle,
                    { backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : dept.bgColor || '#f1f5f9' },
                  ]}
                >
                  <Ionicons
                    name={dept.icon as any}
                    size={16}
                    color={isSelected ? '#ffffff' : dept.color || '#475569'}
                  />
                </View>
                <Text
                  style={[styles.deptCardText, isSelected && styles.deptCardTextSelected]}
                  numberOfLines={1}
                >
                  {dept.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>Danh sách công việc</Text>
        </View>

        {loading ? (
          <JobSkeleton />
        ) : (
          <View style={styles.jobsListContainer}>
            {filteredJobs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="briefcase-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyTitle}>Chưa có công việc phù hợp</Text>
                <Text style={styles.emptySubtitle}>
                  Vui lòng chọn ngành nghề khác hoặc thử từ khóa tìm kiếm mới
                </Text>
              </View>
            ) : (
              filteredJobs.map((job) => {
                const isExpanded = expandedJobIds.includes(job._id);
                return (
                  <Pressable
                    key={job._id}
                    style={styles.jobItemCard}
                    onPress={() => handleOpenJobDetail(job)}
                  >
                    <View style={styles.jobItemHeader}>
                      <View style={styles.jobMainInfo}>
                        <View style={styles.jobTagRow}>
                          <View style={styles.deptLabel}>
                            <Text style={styles.deptLabelText}>{job.department}</Text>
                          </View>

                          {(job.priority === 'HIGH' || job.priority === 'URGENT') && (
                            <View style={styles.urgentLabel}>
                              <Ionicons name="flame" size={12} color="#e11d48" />
                              <Text style={styles.urgentLabelText}>Ưu tiên gấp</Text>
                            </View>
                          )}
                        </View>

                        <Text style={styles.jobItemTitle} numberOfLines={2}>
                          {job.title}
                        </Text>
                      </View>

                      <View style={styles.companyLogoBox}>
                        <Image
                          source={require('../../assets/images/favicon-talentcore.png')}
                          style={styles.companyFavicon}
                          resizeMode="contain"
                        />
                      </View>
                    </View>

                    <View style={styles.salaryContainer}>
                      <Text style={styles.salaryLabel}>Mức lương:</Text>
                      <Text style={styles.salaryValue}>{job.salaryDisplay}</Text>
                    </View>

                    <View style={styles.metaLayoutGrid}>
                      <View style={styles.metaBadge}>
                        <Ionicons name="ribbon-outline" size={13} color="#6366f1" />
                        <Text style={styles.metaBadgeLabel}>Cấp bậc:</Text>
                        <Text style={styles.metaBadgeValue} numberOfLines={1}>
                          {job.level}
                        </Text>
                      </View>

                      <View style={styles.metaBadge}>
                        <Ionicons name="location-outline" size={13} color="#2563eb" />
                        <Text style={styles.metaBadgeLabel}>Địa điểm:</Text>
                        <Text style={styles.metaBadgeValue} numberOfLines={1}>
                          {job.location}
                        </Text>
                      </View>

                      <View style={styles.metaBadge}>
                        <Ionicons name="briefcase-outline" size={13} color="#059669" />
                        <Text style={styles.metaBadgeLabel}>Hình thức:</Text>
                        <Text style={styles.metaBadgeValue} numberOfLines={1}>
                          {job.workType}
                        </Text>
                      </View>

                      <View style={styles.metaBadge}>
                        <Ionicons name="time-outline" size={13} color="#d97706" />
                        <Text style={styles.metaBadgeLabel}>Đăng lúc:</Text>
                        <Text style={styles.metaBadgeValue} numberOfLines={1}>
                          {job.postedTime}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.jobItemFooter}>
                      <Pressable
                        style={[styles.quickViewBtn, isExpanded && styles.quickViewBtnActive]}
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleExpandJob(job._id);
                        }}
                        hitSlop={8}
                      >
                        <Text style={[styles.quickViewText, isExpanded && styles.quickViewTextActive]}>
                          {isExpanded ? 'Thu gọn' : 'Xem nhanh'}
                        </Text>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={14}
                          color={isExpanded ? '#7c3aed' : '#475569'}
                        />
                      </Pressable>

                      <Pressable
                        style={styles.applyNowBtn}
                        onPress={() => handleOpenJobDetail(job)}
                      >
                        <Text style={styles.applyNowText}>Ứng tuyển ngay</Text>
                        <Ionicons name="arrow-forward" size={14} color="#ffffff" />
                      </Pressable>
                    </View>

                    {isExpanded && (
                      <View style={styles.quickSummaryContainer}>
                        <View style={styles.quickSummaryHeader}>
                          <Text style={styles.quickSummaryTitle}>Yêu cầu công việc</Text>
                        </View>
                        {job.requirements ? (
                          <Text style={styles.quickSummaryText}>
                            {job.requirements}
                          </Text>
                        ) : null}
                        {job.skills && job.skills.length > 0 && (
                          <View style={styles.summarySkillsRow}>
                            {job.skills.map((skill, sIdx) => (
                              <View key={sIdx} style={styles.summarySkillChip}>
                                <Text style={styles.summarySkillText}>{skill}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                        {!job.requirements && (!job.skills || job.skills.length === 0) && (
                          <Text style={styles.quickSummaryText}>
                            Phù hợp ứng viên có cấp bậc {job.level} và kinh nghiệm chuyên môn liên quan.
                          </Text>
                        )}
                        <Pressable
                          style={styles.summaryFullDetailBtn}
                          onPress={() => handleOpenJobDetail(job)}
                        >
                          <Text style={styles.summaryFullDetailText}>Xem toàn bộ chi tiết</Text>
                          <Ionicons name="chevron-forward" size={13} color="#7c3aed" />
                        </Pressable>
                      </View>
                    )}
                  </Pressable>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    paddingBottom: 110,
    backgroundColor: '#ffffff',
  },
  headerBanner: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLogoLarge: {
    width: 155,
    height: 42,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  greetingBox: {
    marginTop: 4,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 4,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: -18,
    marginBottom: 16,
  },
  searchInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  filterInsideBtn: {
    padding: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  deptCountText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '700',
  },
  badgeCountText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  deptChipsScroll: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  deptCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  deptCardItemSelected: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  deptIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deptCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  deptCardTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  jobsListContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  jobItemCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#c7d2fe',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  jobItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  jobMainInfo: {
    flex: 1,
  },
  jobTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  deptLabel: {
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  deptLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  urgentLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  urgentLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e11d48',
  },
  jobItemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 22,
  },
  companyLogoBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  companyFavicon: {
    width: 32,
    height: 32,
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#dcfce7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
    gap: 6,
  },
  salaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  salaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16a34a',
    letterSpacing: 0.2,
  },
  metaLayoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  metaBadge: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 4,
  },
  metaBadgeLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  metaBadgeValue: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: '700',
    flex: 1,
  },
  jobItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  quickViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  quickViewBtnActive: {
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  quickViewText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  quickViewTextActive: {
    color: '#7c3aed',
    fontWeight: '700',
  },
  applyNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  applyNowText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  quickSummaryContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ede9fe',
  },
  quickSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickSummaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickSummaryText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
  },
  summarySkillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  summarySkillChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  summarySkillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  summaryFullDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 10,
    paddingTop: 6,
  },
  summaryFullDetailText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
  },
});
