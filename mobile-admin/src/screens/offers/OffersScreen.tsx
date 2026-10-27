import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminService, OfferItem, DepartmentItem } from '../../services/admin.services';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../features/auth/types/auth.types';
import CustomSelect from '../../components/common/CustomSelect';

export const OffersScreen: React.FC = () => {
  const { user } = useAuth();
  const isDeptManager = user?.role === UserRole.DEPARTMENT_MANAGER;
  const userDeptId =
    typeof user?.departmentId === 'object' && user?.departmentId !== null
      ? (user.departmentId as any)._id
      : user?.departmentId;

  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>(
    isDeptManager && userDeptId ? userDeptId : 'ALL'
  );

  const fetchData = useCallback(async () => {
    try {
      const [offerList, deptList] = await Promise.all([
        adminService.getOffers(),
        adminService.getDepartments(),
      ]);
      setOffers(offerList);
      setDepartments(deptList);
    } catch (err) {
      console.error('Lỗi tải dữ liệu Offers:', err);
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

  // Options for Department Filter
  const deptFilterOptions = useMemo(() => {
    return [
      { value: 'ALL', label: 'Tất cả phòng ban' },
      ...departments.map((d) => ({
        value: d._id,
        label: d.name,
      })),
    ];
  }, [departments]);

  const selectedDeptName = useMemo(() => {
    if (selectedDept === 'ALL') return 'Tất cả phòng ban';
    const found = departments.find((d) => d._id === selectedDept);
    return found ? found.name : 'Tất cả phòng ban';
  }, [selectedDept, departments]);

  // Options for Status Filter (Chuẩn giống Web Admin)
  const statusFilterOptions = useMemo(() => {
    return [
      { value: 'ALL', label: 'Tất cả trạng thái' },
      { value: 'SENT', label: 'Chờ phản hồi' },
      { value: 'ACCEPTED', label: 'Đã đồng ý' },
      { value: 'DECLINED', label: 'Đã từ chối' },
      { value: 'CANCELLED', label: 'Đã thu hồi' },
      { value: 'DRAFT', label: 'Bản nháp' },
      { value: 'EXPIRED', label: 'Đã quá hạn' },
    ];
  }, []);

  const selectedStatusName = useMemo(() => {
    const found = statusFilterOptions.find((s) => s.value === selectedStatus);
    return found ? found.label : 'Tất cả trạng thái';
  }, [selectedStatus, statusFilterOptions]);

  // Is any filter active?
  const isFiltered =
    (!isDeptManager && selectedDept !== 'ALL') ||
    selectedStatus !== 'ALL' ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    if (!isDeptManager) {
      setSelectedDept('ALL');
    }
    setSelectedStatus('ALL');
    setSearchQuery('');
  };

  // Filtered offers list
  const filteredOffers = useMemo(() => {
    return offers.filter((item) => {
      const candName =
        item.candidateId?.userId?.name ||
        item.candidateId?.profileName ||
        '';
      const posTitle = item.positionTitle || '';
      const candEmail = item.candidateId?.userId?.email || '';
      const q = searchQuery.toLowerCase().trim();

      const itemDeptId =
        typeof item.departmentId === 'object' && item.departmentId !== null
          ? item.departmentId._id
          : (item.departmentId as any);

      // Filter by department
      const matchDept = selectedDept === 'ALL' || itemDeptId === selectedDept;

      // Filter by status
      const matchStatus =
        selectedStatus === 'ALL' || item.status === selectedStatus;

      // Filter by search
      const matchSearch =
        !q ||
        candName.toLowerCase().includes(q) ||
        posTitle.toLowerCase().includes(q) ||
        candEmail.toLowerCase().includes(q);

      return matchDept && matchStatus && matchSearch;
    });
  }, [offers, selectedDept, selectedStatus, searchQuery]);

  const formatSalary = (amount: number) => {
    if (!amount) return 'Thỏa thuận';
    return `${amount.toLocaleString('vi-VN')} đ / tháng`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'ACCEPTED':
        return {
          label: 'Đã đồng ý',
          color: '#059669',
          bg: '#ECFDF5',
          border: '#A7F3D0',
          icon: 'checkmark-circle' as const,
        };
      case 'SENT':
        return {
          label: 'Chờ phản hồi',
          color: '#D97706',
          bg: '#FFFBEB',
          border: '#FDE68A',
          icon: 'mail-unread' as const,
        };
      case 'DRAFT':
        return {
          label: 'Bản nháp',
          color: '#64748B',
          bg: '#F8FAFC',
          border: '#E2E8F0',
          icon: 'document-text-outline' as const,
        };
      case 'DECLINED':
        return {
          label: 'Đã từ chối',
          color: '#DC2626',
          bg: '#FEF2F2',
          border: '#FECACA',
          icon: 'close-circle' as const,
        };
      case 'CANCELLED':
        return {
          label: 'Đã thu hồi',
          color: '#475569',
          bg: '#F1F5F9',
          border: '#CBD5E1',
          icon: 'ban' as const,
        };
      case 'EXPIRED':
        return {
          label: 'Đã quá hạn',
          color: '#EA580C',
          bg: '#FFF7ED',
          border: '#FFEDD5',
          icon: 'time' as const,
        };
      default:
        return {
          label: status || 'Offer',
          color: '#2563EB',
          bg: '#EFF6FF',
          border: '#BFDBFE',
          icon: 'ribbon-outline' as const,
        };
    }
  };

  const getContractLabel = (type?: string) => {
    switch (type) {
      case 'FULL_TIME':
        return 'Toàn thời gian';
      case 'PART_TIME':
        return 'Bán thời gian';
      case 'INTERNSHIP':
        return 'Thực tập sinh';
      case 'FREELANCE':
        return 'Freelance';
      default:
        return type || 'Toàn thời gian';
    }
  };

  // Helper avatar initials
  const getInitials = (name?: string) => {
    if (!name) return 'UV';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <View style={styles.container}>
      {/* ─── THANH TÌM KIẾM VÀ BỘ LỌC ──────────────────────────────── */}
      <View style={styles.topBar}>
        {/* Ô Tìm kiếm */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={17} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo ứng viên, vị trí tuyển dụng..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.subFilterRow}>
          <View style={styles.selectWrapper}>
            <CustomSelect
              value={selectedDept}
              onChange={(val) => setSelectedDept(val)}
              options={deptFilterOptions}
              placeholder={selectedDeptName}
              icon="business-outline"
              disabled={isDeptManager}
              triggerStyle={styles.subFilterPill}
              triggerTextStyle={styles.subFilterPillText}
              activeTriggerStyle={styles.subFilterPillActive}
              activeTriggerTextStyle={styles.subFilterPillTextActive}
            />
          </View>

          <View style={styles.selectWrapper}>
            <CustomSelect
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              options={statusFilterOptions}
              placeholder={selectedStatusName}
              icon="time-outline"
              triggerStyle={styles.subFilterPill}
              triggerTextStyle={styles.subFilterPillText}
              activeTriggerStyle={styles.subFilterPillActive}
              activeTriggerTextStyle={styles.subFilterPillTextActive}
            />
          </View>
        </View>

        {/* Nút đặt lại bộ lọc */}
        {isFiltered && (
          <View style={styles.resetBarRow}>
            <Text style={styles.filterResultCount}>
              Tìm thấy <Text style={styles.filterResultBold}>{filteredOffers.length}</Text> thư mời
            </Text>
            <TouchableOpacity
              style={styles.subFilterResetBtn}
              onPress={handleResetFilters}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={13} color="#DC2626" />
              <Text style={styles.subFilterResetText}>Đặt lại bộ lọc</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ─── DANH SÁCH OFFERS ──────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Đang tải danh sách thư mời nhận việc...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
          }
        >
          {filteredOffers.length === 0 ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="document-text-outline" size={38} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>Không có thư mời nhận việc nào</Text>
              <Text style={styles.emptySubtitle}>
                {isFiltered
                  ? 'Không tìm thấy kết quả phù hợp với bộ lọc hiện tại'
                  : 'Các đề nghị Offer đồng bộ từ Web Admin sẽ hiển thị tại đây'}
              </Text>
              {isFiltered && (
                <TouchableOpacity
                  style={styles.emptyResetBtn}
                  onPress={handleResetFilters}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyResetBtnText}>Xóa tất cả bộ lọc</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredOffers.map((item) => {
              const candName =
                item.candidateId?.userId?.name ||
                item.candidateId?.profileName ||
                'Ứng viên';
              const candEmail = item.candidateId?.userId?.email || '';
              const deptName = item.departmentId?.name;
              const statusInfo = getStatusInfo(item.status);
              const initials = getInitials(candName);

              // Tính lương thử việc nếu có
              const probationPercentage = item.probationSalaryPercentage || 85;
              const probationSalary = Math.round((Number(item.salary || 0) * probationPercentage) / 100);

              return (
                <View key={item._id} style={styles.offerCard}>
                  {/* Header: Avatar, Tên, Chức danh, Badge Trạng thái */}
                  <View style={styles.cardHeader}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{initials}</Text>
                    </View>

                    <View style={styles.headerInfo}>
                      <Text style={styles.candidateName} numberOfLines={1}>
                        {candName}
                      </Text>
                      {candEmail ? (
                        <Text style={styles.candidateEmail} numberOfLines={1}>
                          {candEmail}
                        </Text>
                      ) : null}
                      <Text style={styles.jobTitle} numberOfLines={1}>
                        {item.positionTitle}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusInfo.bg,
                          borderColor: statusInfo.border,
                        },
                      ]}
                    >
                      <Ionicons name={statusInfo.icon} size={13} color={statusInfo.color} />
                      <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>

                  {/* Tag hàng: Phòng ban & Loại hợp đồng */}
                  <View style={styles.tagRow}>
                    {deptName ? (
                      <View style={styles.deptTag}>
                        <Ionicons name="business" size={12} color="#475569" />
                        <Text style={styles.deptTagText} numberOfLines={1}>
                          {deptName}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.contractTag}>
                      <Ionicons name="briefcase-outline" size={12} color="#2563EB" />
                      <Text style={styles.contractTagText}>
                        {getContractLabel(item.contractType)}
                      </Text>
                    </View>
                  </View>

                  {/* Khung chi tiết: Lương, Ngày bắt đầu, Hạn phản hồi */}
                  <View style={styles.detailsBox}>
                    {/* Mức lương chính thức */}
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconBox}>
                        <Ionicons name="cash-outline" size={15} color="#2563EB" />
                      </View>
                      <View style={styles.detailTextBox}>
                        <Text style={styles.detailLabel}>Mức lương chính thức:</Text>
                        <Text style={styles.salaryHighlight}>{formatSalary(item.salary)}</Text>
                      </View>
                    </View>

                    {/* Lương thử việc */}
                    {item.salary > 0 && (
                      <View style={styles.detailRow}>
                        <View style={styles.detailIconBox}>
                          <Ionicons name="calculator-outline" size={15} color="#64748B" />
                        </View>
                        <View style={styles.detailTextBox}>
                          <Text style={styles.detailLabel}>Lương thử việc ({probationPercentage}%):</Text>
                          <Text style={styles.detailValue}>
                            {probationSalary.toLocaleString('vi-VN')} đ / tháng
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Ngày bắt đầu đi làm */}
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconBox}>
                        <Ionicons name="calendar-outline" size={15} color="#64748B" />
                      </View>
                      <View style={styles.detailTextBox}>
                        <Text style={styles.detailLabel}>Ngày bắt đầu làm việc:</Text>
                        <Text style={styles.detailValue}>
                          {formatDate(item.startDate) || 'Theo thỏa thuận'}
                        </Text>
                      </View>
                    </View>

                    {/* Hạn chót phản hồi */}
                    {item.expirationDate ? (
                      <View style={styles.detailRow}>
                        <View style={styles.detailIconBox}>
                          <Ionicons name="hourglass-outline" size={15} color="#D97706" />
                        </View>
                        <View style={styles.detailTextBox}>
                          <Text style={styles.detailLabel}>Hạn chót phản hồi:</Text>
                          <Text style={[styles.detailValue, { color: '#B45309', fontWeight: '600' }]}>
                            {formatDate(item.expirationDate)}
                          </Text>
                        </View>
                      </View>
                    ) : null}
                  </View>

                  {/* Huy hiệu xác thực SMS OTP chữ ký điện tử */}
                  {(item.isOtpVerified || item.status === 'ACCEPTED') && (
                    <View style={styles.otpBadge}>
                      <Ionicons name="shield-checkmark" size={15} color="#059669" />
                      <Text style={styles.otpBadgeText}>
                        Đã xác thực chữ ký điện tử qua SMS OTP số điện thoại
                      </Text>
                    </View>
                  )}

                  {/* Lý do từ chối nếu có */}
                  {item.status === 'DECLINED' && item.declineReason ? (
                    <View style={styles.declineBox}>
                      <Ionicons name="alert-circle-outline" size={15} color="#DC2626" />
                      <Text style={styles.declineText}>
                        Lý do từ chối: <Text style={styles.declineReasonBold}>{item.declineReason}</Text>
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default OffersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  subFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  selectWrapper: {
    flex: 1,
  },
  subFilterPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  subFilterPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  subFilterPillActive: {
    backgroundColor: '#F0F9FF',
    borderColor: '#38BDF8',
  },
  subFilterPillTextActive: {
    color: '#0284C7',
    fontWeight: '700',
  },
  resetBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  filterResultCount: {
    fontSize: 11.5,
    color: '#64748B',
  },
  filterResultBold: {
    fontWeight: '700',
    color: '#2563EB',
  },
  subFilterResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  subFilterResetText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90,
    gap: 12,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyResetBtn: {
    marginTop: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  emptyResetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  avatarText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  headerInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  candidateEmail: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 0.5,
  },
  jobTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },
  deptTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deptTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  contractTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  contractTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  detailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 11,
    gap: 7,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIconBox: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTextBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  detailLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  salaryHighlight: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  otpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  otpBadgeText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    flex: 1,
  },
  declineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  declineText: {
    fontSize: 11,
    color: '#B91C1C',
    flex: 1,
  },
  declineReasonBold: {
    fontWeight: '700',
  },
});
