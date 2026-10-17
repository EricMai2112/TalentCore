import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AdminNotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Ứng viên mới nộp hồ sơ',
    body: 'Nguyễn Văn A đã ứng tuyển vào vị trí Senior Backend Engineer.',
    time: '5 phút trước',
    unread: true,
    icon: 'document-text',
    color: '#2563EB',
  },
  {
    id: '2',
    title: 'Lịch phỏng vấn sắp diễn ra',
    body: 'Phỏng vấn kỹ thuật vòng 2 với ứng viên Trần Thị B lúc 14:00.',
    time: '30 phút trước',
    unread: true,
    icon: 'calendar',
    color: '#7C3AED',
  },
  {
    id: '3',
    title: 'Offer được xác nhận qua OTP',
    body: 'Ứng viên Lê Hoàng C đã đồng ý lời mời nhận việc thành công.',
    time: '2 giờ trước',
    unread: false,
    icon: 'checkmark-circle',
    color: '#10B981',
  },
];

export const AdminNotificationModal: React.FC<AdminNotificationModalProps> = ({
  visible,
  onClose,
}) => {
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
              <View style={styles.badge}>
                <Text style={styles.badgeText}>2 mới</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {MOCK_NOTIFICATIONS.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  item.unread && styles.itemCardUnread,
                ]}
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: `${item.color}15` },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={item.color}
                  />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemBody} numberOfLines={2}>
                    {item.body}
                  </Text>
                  <Text style={styles.itemTime}>{item.time}</Text>
                </View>
                {item.unread && <View style={styles.unreadDot} />}
              </View>
            ))}
          </ScrollView>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
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
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 14,
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
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  itemBody: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 11,
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
