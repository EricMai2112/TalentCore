import React, { useState, useMemo } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { MobileNotificationItem } from '../services/notification.service';

interface NotificationsScreenProps {
  onRequireLogin?: () => void;
}

type TabType = 'all' | 'unread' | 'interview' | 'stage' | 'offer';

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onRequireLogin }) => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotification();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchNotifications();
    } finally {
      setRefreshing(false);
    }
  };

  const isInterviewNotification = (n: MobileNotificationItem) => {
    const t = n.type || '';
    const c = n.category || '';
    return (
      c === 'INTERVIEW' ||
      t === 'INTERVIEW' ||
      t === 'INTERVIEW_SCHEDULED' ||
      t === 'INTERVIEW_RESCHEDULED' ||
      t === 'INTERVIEW_CANCEL_REQUESTED' ||
      t === 'INTERVIEW_CANCEL_APPROVED' ||
      t === 'INTERVIEW_CONFIRMATION'
    );
  };

  const isStageNotification = (n: MobileNotificationItem) => {
    const t = n.type || '';
    const c = n.category || '';
    return (
      c === 'CANDIDATE' ||
      t === 'STAGE_CHANGED' ||
      t === 'CANDIDATE_REJECTED' ||
      t === 'CANDIDATE_HIRED'
    );
  };

  const isOfferNotification = (n: MobileNotificationItem) => {
    const t = n.type || '';
    const c = n.category || '';
    return (
      c === 'OFFER' ||
      t === 'OFFER' ||
      t === 'OFFER_SENT' ||
      t === 'OFFER_ACCEPTED' ||
      t === 'OFFER_DECLINED'
    );
  };

  const interviewCount = useMemo(
    () => notifications.filter(isInterviewNotification).length,
    [notifications]
  );

  const stageCount = useMemo(
    () => notifications.filter(isStageNotification).length,
    [notifications]
  );

  const offerCount = useMemo(
    () => notifications.filter(isOfferNotification).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeTab === 'unread' && item.isRead) return false;
      if (activeTab === 'interview' && !isInterviewNotification(item)) return false;
      if (activeTab === 'stage' && !isStageNotification(item)) return false;
      if (activeTab === 'offer' && !isOfferNotification(item)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = item.title?.toLowerCase().includes(q);
        const msgMatch = item.message?.toLowerCase().includes(q);
        const jobMatch = item.metadata?.jobTitle?.toLowerCase().includes(q);
        return titleMatch || msgMatch || jobMatch;
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return 'Vừa xong';
      if (diffMinutes < 60) return `${diffMinutes} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;

      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const getCategoryMeta = (item: MobileNotificationItem) => {
    const t = item.type || '';
    if (t === 'CANDIDATE_HIRED') {
      return {
        label: 'Trúng tuyển 🎉',
        icon: 'checkmark-circle' as const,
        bg: '#dcfce7',
        border: '#86efac',
        color: '#166534',
        iconBg: '#10b981',
      };
    }
    if (t === 'CANDIDATE_REJECTED') {
      return {
        label: 'Kết quả hồ sơ',
        icon: 'alert-circle' as const,
        bg: '#ffe4e6',
        border: '#fecdd3',
        color: '#9f1239',
        iconBg: '#f43f5e',
      };
    }
    if (isInterviewNotification(item)) {
      return {
        label: 'Lịch phỏng vấn',
        icon: 'calendar' as const,
        bg: '#f3e8ff',
        border: '#e9d5ff',
        color: '#6b21a8',
        iconBg: '#7c3aed',
      };
    }
    if (isOfferNotification(item)) {
      return {
        label: 'Đãi ngộ & Offer',
        icon: 'gift' as const,
        bg: '#fef3c7',
        border: '#fde68a',
        color: '#92400e',
        iconBg: '#f59e0b',
      };
    }
    if (t === 'STAGE_CHANGED') {
      return {
        label: 'Tiến trình hồ sơ',
        icon: 'sparkles' as const,
        bg: '#eff6ff',
        border: '#bfdbfe',
        color: '#1e40af',
        iconBg: '#2563eb',
      };
    }
    return {
      label: 'Hồ sơ ứng tuyển',
      icon: 'document-text' as const,
      bg: '#f1f5f9',
      border: '#e2e8f0',
      color: '#334155',
      iconBg: '#0d9488',
    };
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notLoggedContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="notifications-outline" size={44} color="#2563eb" />
          </View>
          <Text style={styles.emptyTitle}>Thông báo của bạn</Text>
          <Text style={styles.emptyDesc}>
            Vui lòng đăng nhập tài khoản ứng viên để theo dõi lịch phỏng vấn, cập nhật trạng thái hồ sơ và thư mời nhận việc.
          </Text>
          <Pressable style={styles.loginBtn} onPress={onRequireLogin}>
            <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerArea}>
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <Text style={styles.mainTitle}>Thông báo của bạn</Text>
          {unreadCount > 0 && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{unreadCount} mới</Text>
            </View>
          )}
          <Pressable
          style={styles.refreshBtn}
          onPress={onRefresh}
          disabled={refreshing || isLoading}
        >
          <Ionicons
            name="refresh"
            size={15}
            color={refreshing ? '#2563eb' : '#475569'}
          />
          <Text style={styles.refreshBtnText}>Làm mới</Text>
        </Pressable>
        </View>
      </View>

      <View style={styles.actionButtonsRow}>
        {unreadCount > 0 && (
          <Pressable style={styles.markAllBtn} onPress={markAllAsRead}>
            <Ionicons name="checkmark-done" size={16} color="#ffffff" />
            <Text style={styles.markAllBtnText}>Đọc tất cả</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.statsGrid}>
        <Pressable
          style={[
            styles.statCard,
            activeTab === 'all' && styles.statCardActiveAll,
          ]}
          onPress={() => setActiveTab('all')}
        >
          <View style={styles.statCardTop}>
            <Text style={styles.statCardLabel}>Tất cả thông báo</Text>
            <View style={[styles.statIconBox, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="notifications" size={16} color="#2563eb" />
            </View>
          </View>
          <Text style={styles.statCardNumber}>{notifications.length}</Text>
          <Text style={styles.statCardSub}>Tổng số hoạt động</Text>
        </Pressable>

        <Pressable
          style={[
            styles.statCard,
            activeTab === 'unread' && styles.statCardActiveUnread,
          ]}
          onPress={() => setActiveTab('unread')}
        >
          <View style={styles.statCardTop}>
            <Text style={[styles.statCardLabel, { color: '#e11d48' }]}>Chưa đọc</Text>
            <View style={[styles.statIconBox, { backgroundColor: '#fff1f2' }]}>
              <Ionicons name="alert-circle" size={16} color="#e11d48" />
            </View>
          </View>
          <Text style={[styles.statCardNumber, { color: '#e11d48' }]}>{unreadCount}</Text>
          <Text style={styles.statCardSub}>Cần bạn xem ngay</Text>
        </Pressable>

        <Pressable
          style={[
            styles.statCard,
            activeTab === 'interview' && styles.statCardActiveInterview,
          ]}
          onPress={() => setActiveTab('interview')}
        >
          <View style={styles.statCardTop}>
            <Text style={[styles.statCardLabel, { color: '#7c3aed' }]}>Lịch phỏng vấn</Text>
            <View style={[styles.statIconBox, { backgroundColor: '#faf5ff' }]}>
              <Ionicons name="calendar" size={16} color="#7c3aed" />
            </View>
          </View>
          <Text style={styles.statCardNumber}>{interviewCount}</Text>
          <Text style={styles.statCardSub}>Lịch hẹn trực tiếp & online</Text>
        </Pressable>

        <Pressable
          style={[
            styles.statCard,
            activeTab === 'stage' && styles.statCardActiveStage,
          ]}
          onPress={() => setActiveTab('stage')}
        >
          <View style={styles.statCardTop}>
            <Text style={[styles.statCardLabel, { color: '#0d9488' }]}>Tiến trình hồ sơ</Text>
            <View style={[styles.statIconBox, { backgroundColor: '#f0fdfa' }]}>
              <Ionicons name="sparkles" size={16} color="#0d9488" />
            </View>
          </View>
          <Text style={styles.statCardNumber}>{stageCount}</Text>
          <Text style={styles.statCardSub}>Cập nhật vòng tuyển dụng</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterTabsList}
      >
        <Pressable
          style={[
            styles.filterTabPill,
            activeTab === 'all' && styles.filterTabPillActive,
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text
            style={[
              styles.filterTabPillText,
              activeTab === 'all' && styles.filterTabPillTextActive,
            ]}
          >
            Tất cả ({notifications.length})
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterTabPill,
            activeTab === 'unread' && styles.filterTabPillActiveRose,
          ]}
          onPress={() => setActiveTab('unread')}
        >
          <Text
            style={[
              styles.filterTabPillText,
              activeTab === 'unread' && styles.filterTabPillTextActive,
            ]}
          >
            Chưa đọc ({unreadCount})
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterTabPill,
            activeTab === 'interview' && styles.filterTabPillActivePurple,
          ]}
          onPress={() => setActiveTab('interview')}
        >
          <Text
            style={[
              styles.filterTabPillText,
              activeTab === 'interview' && styles.filterTabPillTextActive,
            ]}
          >
            Phỏng vấn ({interviewCount})
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterTabPill,
            activeTab === 'stage' && styles.filterTabPillActiveBlue,
          ]}
          onPress={() => setActiveTab('stage')}
        >
          <Text
            style={[
              styles.filterTabPillText,
              activeTab === 'stage' && styles.filterTabPillTextActive,
            ]}
          >
            Hồ sơ ({stageCount})
          </Text>
        </Pressable>

        {offerCount > 0 && (
          <Pressable
            style={[
              styles.filterTabPill,
              activeTab === 'offer' && styles.filterTabPillActiveAmber,
            ]}
            onPress={() => setActiveTab('offer')}
          >
            <Text
              style={[
                styles.filterTabPillText,
                activeTab === 'offer' && styles.filterTabPillTextActive,
              ]}
            >
              Offer ({offerCount})
            </Text>
          </Pressable>
        )}
      </ScrollView>

      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={17} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          key="notif-search-input"
          style={styles.searchInput}
          placeholder="Tìm kiếm thông báo..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          blurOnSubmit={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isLoading && notifications.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Đang tải thông báo...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={renderHeader()}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#2563eb']}
                tintColor="#2563eb"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                  <Ionicons name="mail-open-outline" size={38} color="#2563eb" />
                </View>
                <Text style={styles.emptyTitle}>
                  {searchQuery
                    ? 'Không tìm thấy thông báo phù hợp'
                    : activeTab === 'unread'
                    ? 'Tuyệt vời! Bạn đã đọc hết mọi thông báo.'
                    : 'Chưa có thông báo nào'}
                </Text>
                <Text style={styles.emptyDesc}>
                  {searchQuery
                    ? `Không có kết quả nào khớp với từ khóa "${searchQuery}". Hãy thử từ khóa khác.`
                    : 'Mọi thông tin lịch phỏng vấn và cập nhật hồ sơ sẽ xuất hiện tại đây khi có tiến trình mới.'}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const meta = getCategoryMeta(item);
              const isUnread = !item.isRead;

              return (
                <Pressable
                  style={[
                    styles.notifCard,
                    isUnread ? styles.notifCardUnread : styles.notifCardRead,
                  ]}
                  onPress={() => {
                    if (isUnread) markAsRead(item._id);
                  }}
                >
                  <View style={[styles.categoryIconBox, { backgroundColor: meta.iconBg }]}>
                    <Ionicons name={meta.icon} size={20} color="#ffffff" />
                  </View>

                  <View style={styles.cardMain}>
                    <View style={styles.cardTopRow}>
                      <View
                        style={[
                          styles.badgePill,
                          {
                            backgroundColor: meta.bg,
                            borderColor: meta.border,
                          },
                        ]}
                      >
                        <Ionicons name={meta.icon} size={11} color={meta.color} />
                        <Text style={[styles.badgePillText, { color: meta.color }]}>
                          {meta.label}
                        </Text>
                      </View>

                      {isUnread && (
                        <View style={styles.freshBadge}>
                          <View style={styles.pulseDot} />
                          <Text style={styles.freshBadgeText}>MỚI</Text>
                        </View>
                      )}

                      <View style={styles.timeRow}>
                        <Ionicons name="time-outline" size={12} color="#94a3b8" />
                        <Text style={styles.timeText}>{formatTimeAgo(item.createdAt)}</Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.cardTitle,
                        isUnread ? styles.cardTitleUnread : styles.cardTitleRead,
                      ]}
                    >
                      {item.title}
                    </Text>

                    <Text
                      style={[
                        styles.cardMessage,
                        isUnread ? styles.cardMessageUnread : styles.cardMessageRead,
                      ]}
                    >
                      {item.message}
                    </Text>

                    {item.metadata?.jobTitle && (
                      <View style={styles.jobPill}>
                        <Text style={styles.jobPillLabel}>Vị trí:</Text>
                        <Text style={styles.jobPillValue}>{item.metadata.jobTitle}</Text>
                      </View>
                    )}

                    <View style={styles.cardBottomRow}>
                      {isUnread ? (
                        <Pressable
                          style={styles.actionBtn}
                          onPress={() => markAsRead(item._id)}
                          hitSlop={8}
                        >
                          <Ionicons name="checkmark-circle-outline" size={17} color="#2563eb" />
                          <Text style={styles.actionBtnTextBlue}>Đã đọc</Text>
                        </Pressable>
                      ) : (
                        <View />
                      )}

                      <Pressable
                        style={styles.actionBtn}
                        onPress={() => deleteNotification(item._id)}
                        hitSlop={8}
                      >
                        <Ionicons name="trash-outline" size={16} color="#94a3b8" />
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleSection: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: "space-between"
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.4,
  },
  newBadge: {
    backgroundColor: '#f43f5e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  newBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  mainSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  markAllBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
  },
  statCardActiveAll: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
  },
  statCardActiveUnread: {
    borderColor: '#f43f5e',
    backgroundColor: '#fff1f2',
    borderWidth: 1.5,
  },
  statCardActiveInterview: {
    borderColor: '#7c3aed',
    backgroundColor: '#faf5ff',
    borderWidth: 1.5,
  },
  statCardActiveStage: {
    borderColor: '#0d9488',
    backgroundColor: '#f0fdfa',
    borderWidth: 1.5,
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    flex: 1,
  },
  statIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  statCardSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  filterTabsList: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
  },
  filterTabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterTabPillActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  filterTabPillActiveRose: {
    backgroundColor: '#e11d48',
    borderColor: '#e11d48',
  },
  filterTabPillActivePurple: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  filterTabPillActiveBlue: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterTabPillActiveAmber: {
    backgroundColor: '#d97706',
    borderColor: '#d97706',
  },
  filterTabPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterTabPillTextActive: {
    color: '#ffffff',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    marginTop: 2,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  listContent: {
    paddingBottom: 100,
  },
  notifCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  notifCardUnread: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  notifCardRead: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  categoryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMain: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  freshBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ffffff',
  },
  freshBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 'auto',
  },
  timeText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  cardTitleUnread: {
    fontWeight: '800',
    color: '#0f172a',
  },
  cardTitleRead: {
    fontWeight: '600',
    color: '#334155',
  },
  cardMessage: {
    fontSize: 12,
    lineHeight: 18,
  },
  cardMessageUnread: {
    color: '#334155',
    fontWeight: '500',
  },
  cardMessageRead: {
    color: '#64748b',
  },
  jobPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  jobPillLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  jobPillValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  actionBtnTextBlue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 60,
  },
  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  notLoggedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loginBtn: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
