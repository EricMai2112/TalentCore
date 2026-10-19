import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminService, AdminNotification } from '../../services/admin.services';

type TabFilter = 'all' | 'unread' | 'jd' | 'candidate' | 'interview_offer';

export const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const fetchData = useCallback(async () => {
    try {
      const res = await adminService.getNotifications();
      setNotifications(res.items);
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

  const handleMarkAsRead = async (id: string) => {
    await adminService.markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAll = async () => {
    await adminService.markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeTab === 'unread') return !item.isRead;
      if (activeTab === 'jd') {
        const cat = item.category?.toUpperCase() || '';
        return cat.includes('JD') || cat.includes('RECRUITMENT');
      }
      if (activeTab === 'candidate') {
        const cat = item.category?.toUpperCase() || '';
        return cat.includes('CANDIDATE') || cat.includes('REVIEW');
      }
      if (activeTab === 'interview_offer') {
        const cat = item.category?.toUpperCase() || '';
        return cat.includes('INTERVIEW') || cat.includes('OFFER');
      }
      return true;
    });
  }, [notifications, activeTab]);

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const now = new Date().getTime();
      const past = new Date(dateStr).getTime();
      const diffMs = now - past;
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Vừa xong';
      if (diffMin < 60) return `${diffMin} phút trước`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour} giờ trước`;
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay < 7) return `${diffDay} ngày trước`;
      const d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return '';
    }
  };

  const getCategoryTheme = (category?: string) => {
    const cat = category?.toUpperCase() || '';
    if (cat.includes('JD') || cat.includes('RECRUITMENT')) {
      return { icon: 'document-text', color: '#2563EB', bg: '#EFF6FF' };
    }
    if (cat.includes('CANDIDATE') || cat.includes('REVIEW')) {
      return { icon: 'person', color: '#059669', bg: '#ECFDF5' };
    }
    if (cat.includes('INTERVIEW')) {
      return { icon: 'calendar', color: '#7C3AED', bg: '#F5F3FF' };
    }
    if (cat.includes('OFFER')) {
      return { icon: 'gift', color: '#E11D48', bg: '#FFF1F2' };
    }
    return { icon: 'notifications', color: '#2563EB', bg: '#EFF6FF' };
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Trung tâm Thông báo</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadCounter}>
              <Text style={styles.unreadCounterText}>{unreadCount} mới</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAll}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-done" size={15} color="#2563EB" />
            <Text style={styles.markAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {[
            { id: 'all', label: `Tất cả (${notifications.length})` },
            { id: 'unread', label: `Chưa đọc (${unreadCount})` },
            { id: 'jd', label: 'Yêu cầu JD' },
            { id: 'candidate', label: 'Ứng viên & Đánh giá' },
            { id: 'interview_offer', label: 'Phỏng vấn & Offer' },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setActiveTab(tab.id as TabFilter)}
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
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-outline" size={32} color="#2563EB" />
              </View>
              <Text style={styles.emptyTitle}>Không có thông báo nào</Text>
              <Text style={styles.emptyDesc}>
                Các yêu cầu duyệt JD, phỏng vấn và đánh giá ứng viên sẽ hiển thị tại đây
              </Text>
            </View>
          ) : (
            filteredNotifications.map((item) => {
              const theme = getCategoryTheme(item.category);
              return (
                <TouchableOpacity
                  key={item._id}
                  style={[
                    styles.notifCard,
                    !item.isRead && styles.notifCardUnread,
                  ]}
                  onPress={() => !item.isRead && handleMarkAsRead(item._id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconBox, { backgroundColor: theme.bg }]}>
                    <Ionicons name={theme.icon as any} size={20} color={theme.color} />
                  </View>

                  <View style={styles.notifContent}>
                    <View style={styles.notifMetaRow}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                          {item.category || 'HỆ THỐNG'}
                        </Text>
                      </View>
                      {!item.isRead && (
                        <View style={styles.unreadTag}>
                          <Text style={styles.unreadTagText}>Chưa đọc</Text>
                        </View>
                      )}
                      <Text style={styles.timeText}>
                        {formatTimeAgo(item.createdAt)}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.notifTitle,
                        !item.isRead && styles.notifTitleUnread,
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.notifMessage,
                        !item.isRead && styles.notifMessageUnread,
                      ]}
                      numberOfLines={3}
                    >
                      {item.message}
                    </Text>
                  </View>

                  {!item.isRead && <View style={styles.unreadIndicatorDot} />}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  unreadCounter: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  unreadCounterText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '800',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
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
    gap: 10,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
    gap: 8,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptyDesc: {
    fontSize: 12.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  notifCardUnread: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    borderColor: '#DBEAFE',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#475569',
  },
  unreadTag: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unreadTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginLeft: 'auto',
  },
  notifTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 2,
  },
  notifTitleUnread: {
    fontWeight: '800',
    color: '#0F172A',
  },
  notifMessage: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  notifMessageUnread: {
    color: '#334155',
  },
  unreadIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginTop: 6,
  },
});
