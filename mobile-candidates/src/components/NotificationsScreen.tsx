import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationItem } from '../types/job.types';

export const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const getIconName = (type: NotificationItem['type']) => {
    switch (type) {
      case 'INTERVIEW':
        return 'calendar';
      case 'OFFER':
        return 'gift';
      case 'APPLICATION':
        return 'document-text';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'INTERVIEW':
        return '#7c3aed';
      case 'OFFER':
        return '#16a34a';
      case 'APPLICATION':
        return '#2563eb';
      default:
        return '#64748b';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Thông báo</Text>
            <Text style={styles.subtitle}>Cập nhật mới nhất về việc làm & lịch phỏng vấn</Text>
          </View>
          {notifications.length > 0 && (
            <Pressable onPress={markAllAsRead} hitSlop={10}>
              <Text style={styles.markReadText}>Đọc tất cả</Text>
            </Pressable>
          )}
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="notifications-off-outline" size={40} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có thông báo mới</Text>
            <Text style={styles.emptyDesc}>
              Mọi cập nhật về trạng thái hồ sơ và lịch phỏng vấn sẽ hiển thị tại đây.
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const iconColor = getIconColor(item.type);
              return (
                <Pressable
                  style={[styles.notifCard, !item.isRead && styles.unreadCard]}
                  onPress={() => {
                    setNotifications((prev) =>
                      prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
                    );
                  }}
                >
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: `${iconColor}15` },
                    ]}
                  >
                    <Ionicons name={getIconName(item.type)} size={20} color={iconColor} />
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.cardTitleRow}>
                      <Text style={[styles.cardTitle, !item.isRead && styles.unreadTitle]}>
                        {item.title}
                      </Text>
                      {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.cardMessage}>{item.message}</Text>
                    <Text style={styles.cardTime}>{item.createdAt}</Text>
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
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  markReadText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7c3aed',
  },
  listContent: {
    paddingBottom: 110,
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  unreadCard: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  unreadTitle: {
    fontWeight: '700',
    color: '#0f172a',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7c3aed',
  },
  cardMessage: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});
