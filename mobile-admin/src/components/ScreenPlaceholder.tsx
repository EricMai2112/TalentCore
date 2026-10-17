import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AdminTabKey } from './AdminTabBar';

interface ScreenPlaceholderProps {
  tabKey: AdminTabKey;
}

const TAB_META: Record<
  AdminTabKey,
  {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    gradient: [string, string];
  }
> = {
  dashboard: {
    title: 'Tổng quan hệ thống',
    subtitle: 'Báo cáo chỉ số KPI và hoạt động tuyển dụng',
    icon: 'stats-chart',
    gradient: ['#3B82F6', '#1D4ED8'],
  },
  recruitment: {
    title: 'Quản lý Tuyển dụng',
    subtitle: 'Hồ sơ ứng viên và tin tuyển dụng việc làm',
    icon: 'briefcase',
    gradient: ['#8B5CF6', '#6D28D9'],
  },
  interviews: {
    title: 'Lịch Phỏng vấn',
    subtitle: 'Theo dõi lịch hẹn và người phỏng vấn',
    icon: 'calendar',
    gradient: ['#EC4899', '#BE185D'],
  },
  offers: {
    title: 'Đề nghị nhận việc (Offers)',
    subtitle: 'Trạng thái thư mời việc và xác thực OTP',
    icon: 'mail-unread',
    gradient: ['#10B981', '#047857'],
  },
  settings: {
    title: 'Cấu hình hệ thống',
    subtitle: 'Phòng ban, nhân sự, pipeline và kỹ năng',
    icon: 'settings',
    gradient: ['#64748B', '#334155'],
  },
};

export const ScreenPlaceholder: React.FC<ScreenPlaceholderProps> = ({ tabKey }) => {
  const meta = TAB_META[tabKey];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <LinearGradient
          colors={meta.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Ionicons name={meta.icon} size={36} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.title}>{meta.title}</Text>
        <Text style={styles.subtitle}>{meta.subtitle}</Text>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Khung giao diện sẵn sàng</Text>
        </View>
      </View>
    </View>
  );
};

export default ScreenPlaceholder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 90,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
});
