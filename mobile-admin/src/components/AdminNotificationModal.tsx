import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminService, AdminNotification } from '../services/admin.services';

interface AdminNotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onRefreshBadge?: () => void;
}

export const AdminNotificationModal: React.FC<AdminNotificationModalProps> = ({
  visible,
  onClose,
  onRefreshBadge,
}) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await adminService.getNotifications();
      setNotifications(res.items);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await adminService.markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    if (onRefreshBadge) onRefreshBadge();
  };

  const handleMarkAll = async () => {
    await adminService.markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (onRefreshBadge) onRefreshBadge();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const d = new Date(timeStr);
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${hours}:${mins} • ${day}/${month}`;
    } catch {
      return '';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Thông báo quản trị</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount} mới</Text>
                </View>
              )}
            </View>
            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAll} style={styles.markAllBtn}>
                  <Text style={styles.markAllText}>Đã đọc tất cả</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#2563EB" />
            </View>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="notifications-off-outline" size={36} color="#CBD5E1" />
                  <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
                </View>
              ) : (
                notifications.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    style={[
                      styles.itemCard,
                      !item.isRead && styles.itemCardUnread,
                    ]}
                    onPress={() => !item.isRead && handleMarkAsRead(item._id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.iconBox}>
                      <Ionicons
                        name="notifications"
                        size={18}
                        color={!item.isRead ? '#2563EB' : '#94A3B8'}
                      />
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemBody} numberOfLines={2}>
                        {item.message}
                      </Text>
                      <Text style={styles.itemTime}>{formatTime(item.createdAt)}</Text>
                    </View>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default AdminNotificationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  badgeText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  markAllBtn: {
    paddingVertical: 4,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
  },
  list: {
    padding: 14,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemCardUnread: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  itemBody: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginTop: 6,
    marginLeft: 6,
  },
});
