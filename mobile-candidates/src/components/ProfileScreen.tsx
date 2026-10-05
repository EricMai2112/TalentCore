import React, { useState } from 'react';
import {
  Alert,
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
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  if (!user) {
    if (authView === 'register') {
      return <RegisterScreen onNavigateToLogin={() => setAuthView('login')} />;
    }
    return <LoginScreen onNavigateToRegister={() => setAuthView('register')} />;
  }

  const displayName = user.name || user.email?.split('@')[0] || 'Ứng viên';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Hồ sơ cá nhân</Text>
          <Text style={styles.subtitle}>Quản lý thông tin và bộ hồ sơ nghề nghiệp</Text>
        </View>

        <View style={styles.profileCard}>
          <LinearGradient
            colors={['#7c3aed', '#6366f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>
          <Text style={styles.nameText}>{displayName}</Text>
          <Text style={styles.emailText}>{user.email}</Text>
          <View style={styles.roleTag}>
            <Ionicons name="sparkles" size={12} color="#7c3aed" />
            <Text style={styles.roleText}>ỨNG VIÊN TALENTCORE</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>Quản lý nghề nghiệp</Text>

          <Pressable style={styles.menuRow}>
            <View style={[styles.menuIconBox, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="document-attach-outline" size={20} color="#7c3aed" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Hồ sơ CV đính kèm</Text>
              <Text style={styles.menuDesc}>Xem và cập nhật file CV xin việc</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </Pressable>

          <Pressable style={styles.menuRow}>
            <View style={[styles.menuIconBox, { backgroundColor: '#eff6ff' }]}>
              <Ionicons name="ribbon-outline" size={20} color="#2563eb" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Kỹ năng & Kinh nghiệm</Text>
              <Text style={styles.menuDesc}>Cập nhật năng lực chuyên môn</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </Pressable>

          <Pressable style={styles.menuRow}>
            <View style={[styles.menuIconBox, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="notifications-outline" size={20} color="#d97706" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Cài đặt thông báo việc làm</Text>
              <Text style={styles.menuDesc}>Nhận thông báo khi có vị trí phù hợp</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </Pressable>

          <Pressable style={styles.menuRow}>
            <View style={[styles.menuIconBox, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#16a34a" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Bảo mật & Mật khẩu</Text>
              <Text style={styles.menuDesc}>Quản lý tài khoản và đổi mật khẩu</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </Pressable>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionHeader}>Thông tin hệ thống</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã ứng viên (ID)</Text>
            <Text style={styles.infoValueSmall}>{user._id}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái tài khoản</Text>
            <Text style={[styles.infoValue, { color: '#16a34a' }]}>Hoạt động bình thường</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#dc2626" />
          <Text style={styles.logoutButtonText}>Đăng xuất tài khoản</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 16,
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
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarGradient: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f3e8ff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed',
    letterSpacing: 0.5,
  },
  menuSection: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  infoValueSmall: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 14,
    paddingVertical: 14,
  },
  logoutButtonPressed: {
    backgroundColor: '#fee2e2',
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '700',
  },
});
