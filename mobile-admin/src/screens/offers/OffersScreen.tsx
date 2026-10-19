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
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminService, OfferItem } from '../../services/admin.services';

export const OffersScreen: React.FC = () => {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedOffer, setSelectedOffer] = useState<OfferItem | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const list = await adminService.getOffers();
      setOffers(list);
    } catch {
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

  const filteredOffers = useMemo(() => {
    return offers.filter((item) => {
      const candName =
        item.candidateId?.userId?.name ||
        item.candidateId?.profileName ||
        '';
      const posTitle = item.positionTitle || '';
      const q = searchQuery.toLowerCase();

      const matchStatus =
        statusFilter === 'ALL' || item.status === statusFilter;

      const matchSearch =
        !searchQuery ||
        candName.toLowerCase().includes(q) ||
        posTitle.toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [offers, statusFilter, searchQuery]);

  const formatSalary = (amount: number) => {
    if (!amount) return 'Thỏa thuận';
    return `${amount.toLocaleString('vi-VN')} đ / tháng`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const handleUpdateStatus = async (newStatus: string, label: string) => {
    if (!selectedOffer) return;
    try {
      setActionLoading(true);
      await adminService.updateOfferStatus(selectedOffer._id, newStatus);
      Alert.alert('Thành công', `Đã cập nhật trạng thái Offer thành: ${label}`);
      setSelectedOffer(null);
      fetchData();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật Offer');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'ACCEPTED':
        return { label: 'Đồng ý nhận việc', color: '#059669', bg: '#ECFDF5' };
      case 'SENT':
        return { label: 'Chờ ứng viên phản hồi', color: '#D97706', bg: '#FFFBEB' };
      case 'DRAFT':
        return { label: 'Bản nháp', color: '#64748B', bg: '#F1F5F9' };
      case 'DECLINED':
        return { label: 'Đã từ chối', color: '#EF4444', bg: '#FEE2E2' };
      case 'CANCELLED':
        return { label: 'Đã hủy offer', color: '#EF4444', bg: '#FEE2E2' };
      case 'EXPIRED':
        return { label: 'Đã hết hạn', color: '#64748B', bg: '#F1F5F9' };
      default:
        return { label: status || 'Offer', color: '#2563EB', bg: '#EFF6FF' };
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

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#94A3B8" />
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'SENT', label: 'Chờ phản hồi' },
            { id: 'ACCEPTED', label: 'Đã nhận việc' },
            { id: 'DECLINED', label: 'Từ chối' },
            { id: 'CANCELLED', label: 'Đã hủy' },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setStatusFilter(tab.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563EB" />
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
              <Ionicons name="ribbon-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Không có thư mời nhận việc nào</Text>
              <Text style={styles.emptySubtitle}>Các đề nghị Offer đồng bộ từ web sẽ hiển thị tại đây</Text>
            </View>
          ) : (
            filteredOffers.map((item) => {
              const candName =
                item.candidateId?.userId?.name ||
                item.candidateId?.profileName ||
                'Ứng viên';
              const deptName = item.departmentId?.name;
              const statusInfo = getStatusInfo(item.status);

              return (
                <TouchableOpacity
                  key={item._id}
                  style={styles.offerCard}
                  onPress={() => setSelectedOffer(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.headerInfo}>
                      <Text style={styles.candidateName}>{candName}</Text>
                      <Text style={styles.jobTitle}>{item.positionTitle}</Text>
                      {deptName && <Text style={styles.deptName}>{deptName}</Text>}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.contractTagRow}>
                    <View style={styles.contractTag}>
                      <Text style={styles.contractTagText}>
                        {getContractLabel(item.contractType)}
                      </Text>
                    </View>
                    {item.workLocation && (
                      <View style={styles.locationTag}>
                        <Ionicons name="location-outline" size={12} color="#64748B" />
                        <Text style={styles.locationTagText} numberOfLines={1}>
                          {item.workLocation}
                        </Text>
                      </View>
                    )}
                  </View>

                  {(item.isOtpVerified || item.status === 'ACCEPTED') && (
                    <View style={styles.otpBadge}>
                      <Ionicons name="shield-checkmark" size={14} color="#059669" />
                      <Text style={styles.otpBadgeText}>
                        Đã xác thực chữ ký điện tử qua mã OTP ứng viên
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailsBox}>
                    <View style={styles.detailRow}>
                      <Ionicons name="cash-outline" size={16} color="#2563EB" />
                      <Text style={styles.salaryText}>{formatSalary(item.salary)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={15} color="#64748B" />
                      <Text style={styles.detailText}>
                        Ngày bắt đầu: {formatDate(item.startDate) || 'Thỏa thuận'}
                      </Text>
                    </View>

                    {item.expirationDate && (
                      <View style={styles.detailRow}>
                        <Ionicons name="hourglass-outline" size={15} color="#64748B" />
                        <Text style={styles.detailText}>
                          Hạn chót phản hồi: {formatDate(item.expirationDate)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardFooterAction}>
                    <Text style={styles.actionPromptText}>Nhấn để xem chi tiết & cập nhật trạng thái</Text>
                    <Ionicons name="chevron-forward" size={15} color="#2563EB" />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      <Modal
        visible={!!selectedOffer}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedOffer(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setSelectedOffer(null)}
            activeOpacity={1}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalDragHandle} />
            {selectedOffer && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalAvatarCircle}>
                    <Ionicons name="ribbon" size={22} color="#2563EB" />
                  </View>
                  <View style={styles.modalHeaderInfo}>
                    <Text style={styles.modalName}>
                      {selectedOffer.candidateId?.userId?.name || selectedOffer.candidateId?.profileName}
                    </Text>
                    <Text style={styles.modalPos}>{selectedOffer.positionTitle}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedOffer(null)}
                  >
                    <Ionicons name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Chi tiết đề nghị nhận việc</Text>
                    <View style={styles.infoRow}>
                      <Ionicons name="cash-outline" size={15} color="#64748B" />
                      <Text style={styles.infoText}>
                        Lương thỏa thuận: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{formatSalary(selectedOffer.salary)}</Text>
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="briefcase-outline" size={15} color="#64748B" />
                      <Text style={styles.infoText}>
                        Hình thức: {getContractLabel(selectedOffer.contractType)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="business-outline" size={15} color="#64748B" />
                      <Text style={styles.infoText}>
                        Địa điểm: {selectedOffer.workLocation || 'Tại trụ sở công ty'}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={15} color="#64748B" />
                      <Text style={styles.infoText}>
                        Ngày bắt đầu đi làm: {formatDate(selectedOffer.startDate) || 'Thỏa thuận'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Cập nhật trạng thái Offer</Text>
                    <View style={styles.actionBtnGrid}>
                      <TouchableOpacity
                        style={[styles.actionGridBtn, { backgroundColor: '#10B981' }]}
                        onPress={() => handleUpdateStatus('ACCEPTED', 'Đã đồng ý nhận việc')}
                        disabled={actionLoading}
                      >
                        <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                        <Text style={styles.actionGridBtnText}>Ứng viên đã nhận việc (ACCEPTED)</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionGridBtn, { backgroundColor: '#F59E0B' }]}
                        onPress={() => handleUpdateStatus('SENT', 'Đang chờ phản hồi')}
                        disabled={actionLoading}
                      >
                        <Ionicons name="mail" size={16} color="#FFFFFF" />
                        <Text style={styles.actionGridBtnText}>Đã gửi offer (SENT)</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionGridBtn, { backgroundColor: '#EF4444' }]}
                        onPress={() => handleUpdateStatus('DECLINED', 'Ứng viên từ chối')}
                        disabled={actionLoading}
                      >
                        <Ionicons name="close-circle" size={16} color="#FFFFFF" />
                        <Text style={styles.actionGridBtnText}>Ứng viên từ chối (DECLINED)</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionGridBtn, { backgroundColor: '#64748B' }]}
                        onPress={() => handleUpdateStatus('CANCELLED', 'Đã hủy offer')}
                        disabled={actionLoading}
                      >
                        <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.actionGridBtnText}>Hủy thư mời này (CANCELLED)</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 100,
    gap: 12,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#94A3B8',
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerInfo: {
    flex: 1,
    paddingRight: 8,
  },
  candidateName: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  deptName: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contractTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contractTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  contractTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationTagText: {
    fontSize: 11,
    color: '#64748B',
  },
  otpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  otpBadgeText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  detailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 7,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  salaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },
  detailText: {
    fontSize: 12.5,
    color: '#475569',
  },
  cardFooterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  actionPromptText: {
    fontSize: 11.5,
    color: '#2563EB',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  modalDragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  modalAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  modalHeaderInfo: {
    flex: 1,
  },
  modalName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalPos: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    maxHeight: 460,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#475569',
  },
  actionBtnGrid: {
    gap: 10,
    marginTop: 4,
    marginBottom: 20,
  },
  actionGridBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  actionGridBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
