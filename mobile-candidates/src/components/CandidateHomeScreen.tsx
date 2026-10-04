import React from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export const CandidateHomeScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'Ứng viên';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.userMeta}>
              <Text style={styles.welcomeText}>Xin chào,</Text>
              <Text style={styles.userName}>{displayName}</Text>
              <View style={styles.roleTag}>
                <Ionicons name="briefcase-outline" size={12} color="#38bdf8" />
                <Text style={styles.roleText}>ỨNG VIÊN</Text>
              </View>
            </View>
          </View>

          <Pressable style={styles.logoutIconButton} onPress={handleLogout} hitSlop={10}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          </Pressable>
        </View>

        <LinearGradient
          colors={['#1e3a8a', '#1e293b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Khám phá cơ hội mới</Text>
            <Text style={styles.bannerDesc}>
              Hàng trăm vị trí việc làm hấp dẫn đang chờ đón bạn tại TalentCore.
            </Text>
          </View>
          <Image
            source={require('../../assets/images/logo-glow.png')}
            style={styles.bannerLogo}
            resizeMode="contain"
          />
        </LinearGradient>

        <Text style={styles.sectionTitle}>Chức năng chính</Text>

        <View style={styles.grid}>
          <View style={styles.card}>
            <View style={[styles.cardIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="search-outline" size={24} color="#60a5fa" />
            </View>
            <Text style={styles.cardTitle}>Tìm việc làm</Text>
            <Text style={styles.cardSubtitle}>Khám phá công việc phù hợp</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.cardIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="document-text-outline" size={24} color="#34d399" />
            </View>
            <Text style={styles.cardTitle}>Đơn đã nộp</Text>
            <Text style={styles.cardSubtitle}>Theo dõi trạng thái CV</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.cardIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="calendar-outline" size={24} color="#fbbf24" />
            </View>
            <Text style={styles.cardTitle}>Lịch phỏng vấn</Text>
            <Text style={styles.cardSubtitle}>Xem lịch hẹn phỏng vấn</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.cardIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
              <Ionicons name="person-circle-outline" size={24} color="#c084fc" />
            </View>
            <Text style={styles.cardTitle}>Hồ sơ cá nhân</Text>
            <Text style={styles.cardSubtitle}>Cập nhật thông tin & CV</Text>
          </View>
        </View>

        <View style={styles.accountBox}>
          <Text style={styles.accountBoxTitle}>Thông tin tài khoản</Text>
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>Email</Text>
            <Text style={styles.accountValue}>{user?.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.accountRow}>
            <Text style={styles.accountLabel}>ID</Text>
            <Text style={styles.accountValueSmall}>{user?._id}</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  userMeta: {
    gap: 2,
  },
  welcomeText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f8fafc',
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38bdf8',
    letterSpacing: 0.5,
  },
  logoutIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  bannerContent: {
    flex: 1,
    paddingRight: 10,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  bannerDesc: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
  },
  bannerLogo: {
    width: 48,
    height: 48,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
  },
  accountBox: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 20,
  },
  accountBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  accountLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  accountValue: {
    fontSize: 13,
    color: '#f8fafc',
    fontWeight: '600',
  },
  accountValueSmall: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#1f2937',
    marginVertical: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 12,
    paddingVertical: 14,
  },
  logoutBtnPressed: {
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
