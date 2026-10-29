import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import {
  ApplicationStats,
  CandidateApplicationItem,
  CandidateInterviewItem,
  CandidateInvitationItem,
  CandidateOfferItem,
} from '../../types/application.types';
import { applicationService } from '../../services/application.service';

// Sub components
import {
  ApplicationSubTab,
  ApplicationsSubTabNav,
} from './components/ApplicationsSubTabNav';
import { InvitationHeroCard } from './components/InvitationHeroCard';
import { ApplicationCardItem } from './components/ApplicationCardItem';
import { UpcomingInterviewCard } from './components/UpcomingInterviewCard';
import { InterviewCardItem } from './components/InterviewCardItem';
import { ConfirmInterviewModal } from './components/ConfirmInterviewModal';
import { CancelInterviewModal } from './components/CancelInterviewModal';
import { RescheduleInterviewModal } from './components/RescheduleInterviewModal';
import { OfferCardItem } from './components/OfferCardItem';
import { OfferDetailModal } from './components/OfferDetailModal';

export interface ApplicationsNavOptions {
  subTab?: ApplicationSubTab;
  targetId?: string;
  timestamp?: number;
}

interface ApplicationsScreenProps {
  onRequireLogin?: () => void;
  navOptions?: ApplicationsNavOptions | null;
  onClearNavOptions?: () => void;
}

export const ApplicationsScreen: React.FC<ApplicationsScreenProps> = ({
  onRequireLogin,
  navOptions,
  onClearNavOptions,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ApplicationSubTab>(
    navOptions?.subTab || 'my_applications'
  );

  // Applications Tab State
  const [applications, setApplications] = useState<CandidateApplicationItem[]>([]);
  const [invitations, setInvitations] = useState<CandidateInvitationItem[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    totalApplied: 0,
    processingCount: 0,
    interviewCount: 0,
    offerCount: 0,
  });

  // Interviews Tab State
  const [interviews, setInterviews] = useState<CandidateInterviewItem[]>([]);
  const [interviewStatusFilter, setInterviewStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [selectedInterview, setSelectedInterview] =
    useState<CandidateInterviewItem | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  // Offers Tab State
  const [offers, setOffers] = useState<CandidateOfferItem[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<CandidateOfferItem | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAllData = useCallback(async () => {
    if (!user) return;
    try {
      const [appData, interviewData, offerData, invData] = await Promise.all([
        applicationService.getMyApplications(),
        applicationService.getMyInterviews(),
        applicationService.getMyOffers(),
        applicationService.getMyInvitations(),
      ]);

      setApplications(appData.applications || []);
      setStats(
        appData.stats || {
          totalApplied: 0,
          processingCount: 0,
          interviewCount: 0,
          offerCount: 0,
        },
      );
      setInterviews(interviewData || []);
      setOffers(offerData || []);
      setInvitations(invData || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu ứng tuyển:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    if (!navOptions) return;

    if (navOptions.subTab && navOptions.subTab !== activeTab) {
      setActiveTab(navOptions.subTab);
    }

    if (!navOptions.targetId) return;

    if (!loading) {
      if (navOptions.subTab === 'offers') {
        const found = offers.find(
          (o) =>
            o._id === navOptions.targetId ||
            (typeof o.applicationId === 'object' && o.applicationId?._id === navOptions.targetId) ||
            o.applicationId === navOptions.targetId,
        );
        if (found) {
          setSelectedOffer(found);
          setIsOfferModalOpen(true);
          onClearNavOptions?.();
        } else {
          applicationService
            .getMyOffers()
            .then((freshOffers) => {
              if (freshOffers && freshOffers.length > 0) {
                setOffers(freshOffers);
                const freshFound = freshOffers.find(
                  (o) =>
                    o._id === navOptions.targetId ||
                    (typeof o.applicationId === 'object' && o.applicationId?._id === navOptions.targetId) ||
                    o.applicationId === navOptions.targetId,
                );
                if (freshFound) {
                  setSelectedOffer(freshFound);
                  setIsOfferModalOpen(true);
                }
              }
              onClearNavOptions?.();
            })
            .catch(() => {
              onClearNavOptions?.();
            });
        }
      } else if (navOptions.subTab === 'interviews') {
        const found = interviews.find(
          (i) =>
            i._id === navOptions.targetId ||
            i.applicationId === navOptions.targetId,
        );
        if (found) {
          setSelectedInterview(found);
          setIsConfirmModalOpen(true);
          onClearNavOptions?.();
        } else {
          applicationService
            .getMyInterviews()
            .then((freshInterviews) => {
              if (freshInterviews && freshInterviews.length > 0) {
                setInterviews(freshInterviews);
                const freshFound = freshInterviews.find(
                  (i) =>
                    i._id === navOptions.targetId ||
                    i.applicationId === navOptions.targetId,
                );
                if (freshFound) {
                  setSelectedInterview(freshFound);
                  setIsConfirmModalOpen(true);
                }
              }
              onClearNavOptions?.();
            })
            .catch(() => {
              onClearNavOptions?.();
            });
        }
      } else {
        onClearNavOptions?.();
      }
    }
  }, [navOptions, loading, offers, interviews, activeTab, onClearNavOptions]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notLoggedContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="document-text-outline" size={44} color="#7c3aed" />
          </View>
          <Text style={styles.emptyTitle}>Theo dõi hồ sơ ứng tuyển</Text>
          <Text style={styles.emptyDesc}>
            Vui lòng đăng nhập tài khoản ứng viên để theo dõi tiến trình xét duyệt và lịch phỏng vấn của các vị trí đã nộp.
          </Text>
          <Pressable style={styles.loginBtn} onPress={onRequireLogin}>
            <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Active Pending Invitation for Hero Card
  const pendingInvitation = invitations.find((i) => i.status === 'PENDING') || null;

  // Next upcoming scheduled interview
  const upcomingInterview = interviews.find(
    (i) =>
      (i.status === 'SCHEDULED' || i.status === 'UPCOMING' || i.status === 'IN_PROGRESS') &&
      i.confirmationStatus !== 'CANCELLED' &&
      i.confirmationStatus !== 'REJECTED',
  );

  // Filtered interviews list by status
  const filteredInterviews = interviews.filter((i) => {
    if (interviewStatusFilter !== 'ALL') {
      if (interviewStatusFilter === 'SCHEDULED') {
        if (i.status !== 'SCHEDULED' && i.status !== 'UPCOMING' && i.status !== 'IN_PROGRESS') {
          return false;
        }
      } else if (i.status !== interviewStatusFilter) {
        return false;
      }
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý Ứng tuyển</Text>
        <Text style={styles.subtitle}>
          Theo dõi tiến trình hồ sơ, lịch phỏng vấn và nhận việc
        </Text>
      </View>

      {/* Sub-tabs Segmented Pills */}
      <ApplicationsSubTabNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        interviewCount={stats.interviewCount}
        offerCount={stats.offerCount}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Đang tải dữ liệu hồ sơ...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#7c3aed']}
            />
          }
        >
          {/* TAB 1: ỨNG TUYỂN CỦA TÔI */}
          {activeTab === 'my_applications' && (
            <View>
              {/* Lời mời việc làm Hero Card (Candidate Rediscovery) */}
              <InvitationHeroCard
                invitation={pendingInvitation}
                onRefresh={loadAllData}
              />

              {/* Danh sách đơn ứng tuyển */}
              {applications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconBox}>
                    <Ionicons name="briefcase-outline" size={38} color="#94a3b8" />
                  </View>
                  <Text style={styles.emptyTitle}>Chưa có hồ sơ ứng tuyển</Text>
                  <Text style={styles.emptyDesc}>
                    Bạn chưa nộp hồ sơ vào vị trí công việc nào. Khám phá các cơ hội hấp dẫn tại mục Trang chủ ngay hôm nay!
                  </Text>
                </View>
              ) : (
                applications.map((app) => (
                  <ApplicationCardItem key={app._id} app={app} />
                ))
              )}
            </View>
          )}

          {/* TAB 2: LỊCH PHỎNG VẤN */}
          {activeTab === 'interviews' && (
            <View>
              {/* Phỏng vấn sắp diễn ra Hero Banner */}
              {upcomingInterview && (
                <UpcomingInterviewCard
                  interview={upcomingInterview}
                  onConfirm={() => {
                    setSelectedInterview(upcomingInterview);
                    setIsConfirmModalOpen(true);
                  }}
                  onCancel={() => {
                    setSelectedInterview(upcomingInterview);
                    setIsCancelModalOpen(true);
                  }}
                />
              )}

              {/* Section Header & Title with count */}
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionHeaderLeft}>
                  <Text style={styles.sectionTitle}>Tất cả lịch phỏng vấn</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{filteredInterviews.length}</Text>
                  </View>
                </View>
              </View>

              {/* Filter Pills (Tất cả, Đã lên lịch, Hoàn thành, Đã hủy) */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterPillsRow}
              >
                <Pressable
                  style={[
                    styles.filterPill,
                    interviewStatusFilter === 'ALL' && styles.filterPillActiveAll,
                  ]}
                  onPress={() => setInterviewStatusFilter('ALL')}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      interviewStatusFilter === 'ALL' && styles.filterPillTextActive,
                    ]}
                  >
                    Tất cả
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.filterPill,
                    interviewStatusFilter === 'SCHEDULED' && styles.filterPillActiveScheduled,
                  ]}
                  onPress={() => setInterviewStatusFilter('SCHEDULED')}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      interviewStatusFilter === 'SCHEDULED' && styles.filterPillTextActive,
                    ]}
                  >
                    Đã lên lịch
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.filterPill,
                    interviewStatusFilter === 'COMPLETED' && styles.filterPillActiveCompleted,
                  ]}
                  onPress={() => setInterviewStatusFilter('COMPLETED')}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      interviewStatusFilter === 'COMPLETED' && styles.filterPillTextActive,
                    ]}
                  >
                    Hoàn thành
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.filterPill,
                    interviewStatusFilter === 'CANCELLED' && styles.filterPillActiveCancelled,
                  ]}
                  onPress={() => setInterviewStatusFilter('CANCELLED')}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      interviewStatusFilter === 'CANCELLED' && styles.filterPillTextActive,
                    ]}
                  >
                    Đã hủy
                  </Text>
                </Pressable>
              </ScrollView>

              {filteredInterviews.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconBox}>
                    <Ionicons name="calendar-outline" size={38} color="#94a3b8" />
                  </View>
                  <Text style={styles.emptyTitle}>Không tìm thấy lịch phỏng vấn nào</Text>
                  <Text style={styles.emptyDesc}>
                    {interviewStatusFilter !== 'ALL'
                      ? 'Không có lịch phỏng vấn ở trạng thái này.'
                      : 'Bạn chưa có lịch phỏng vấn nào được xếp trong hệ thống.'}
                  </Text>
                </View>
              ) : (
                filteredInterviews.map((item) => (
                  <InterviewCardItem
                    key={item._id}
                    interview={item}
                    onConfirm={() => {
                      setSelectedInterview(item);
                      setIsConfirmModalOpen(true);
                    }}
                    onReschedule={() => {
                      setSelectedInterview(item);
                      setIsRescheduleModalOpen(true);
                    }}
                    onCancel={() => {
                      setSelectedInterview(item);
                      setIsCancelModalOpen(true);
                    }}
                  />
                ))
              )}
            </View>
          )}

          {/* TAB 3: THƯ MỜI NHẬN VIỆC (OFFERS) */}
          {activeTab === 'offers' && (
            <View>
              {offers.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconBox}>
                    <Ionicons name="ribbon-outline" size={38} color="#94a3b8" />
                  </View>
                  <Text style={styles.emptyTitle}>Chưa có Thư mời nhận việc (Offer)</Text>
                  <Text style={styles.emptyDesc}>
                    Các đề nghị tuyển dụng chính thức sẽ được gửi tới bạn sau khi vượt qua các vòng phỏng vấn thành công.
                  </Text>
                </View>
              ) : (
                offers.map((offer) => (
                  <OfferCardItem
                    key={offer._id}
                    offer={offer}
                    onOpen={() => {
                      setSelectedOffer(offer);
                      setIsOfferModalOpen(true);
                    }}
                  />
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* MODALS */}
      <ConfirmInterviewModal
        visible={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        interview={selectedInterview}
        onSuccess={loadAllData}
      />

      <CancelInterviewModal
        visible={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        interview={selectedInterview}
        onSuccess={loadAllData}
      />

      <RescheduleInterviewModal
        visible={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        interview={selectedInterview}
        onSuccess={loadAllData}
      />

      <OfferDetailModal
        visible={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        offer={selectedOffer}
        onSuccess={loadAllData}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110, // Inset to avoid being blocked by floating bottom navigation
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  countBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterPillsRow: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 14,
  },
  filterPillActiveAll: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  filterPillActiveScheduled: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  filterPillActiveCompleted: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterPillActiveCancelled: {
    backgroundColor: '#e11d48',
    borderColor: '#e11d48',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
    maxWidth: 280,
  },
  notLoggedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loginBtn: {
    marginTop: 18,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
