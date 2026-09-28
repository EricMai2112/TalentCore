import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth.types';

export default function DashboardScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case UserRole.HR_ADMIN:
        return { label: 'Quản trị nhân sự (HR Admin)', color: '#2563EB', bg: '#EFF6FF' };
      case UserRole.DEPARTMENT_MANAGER:
        return { label: 'Trưởng phòng ban', color: '#7C3AED', bg: '#F5F3FF' };
      case UserRole.EMPLOYEE:
        return { label: 'Nhân viên / Người phỏng vấn', color: '#059669', bg: '#ECFDF5' };
      default:
        return { label: 'Quản trị viên', color: '#475569', bg: '#F1F5F9' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo-talentcore.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={['#8B5CF6', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeCard}
        >
          <View style={styles.welcomeRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </Text>
            </View>
            <View style={styles.welcomeInfo}>
              <Text style={styles.welcomeGreeting}>Xin chào,</Text>
              <Text style={styles.userNameText} numberOfLines={1}>
                {user?.name || 'Quản trị viên'}
              </Text>
              <Text style={styles.userEmailText} numberOfLines={1}>
                {user?.email}
              </Text>
            </View>
          </View>

          <View style={[styles.rolePill, { backgroundColor: '#FFFFFF' }]}>
            <Ionicons name="shield-checkmark" size={13} color={roleInfo.color} style={{ marginRight: 5 }} />
            <Text style={[styles.rolePillText, { color: roleInfo.color }]}>{roleInfo.label}</Text>
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tổng quan hệ thống</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="document-text" size={22} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>124</Text>
            <Text style={styles.statLabel}>Hồ sơ ứng tuyển</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="calendar" size={22} color="#7C3AED" />
            </View>
            <Text style={styles.statValue}>18</Text>
            <Text style={styles.statLabel}>Lịch phỏng vấn</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="ribbon" size={22} color="#059669" />
            </View>
            <Text style={styles.statValue}>9</Text>
            <Text style={styles.statLabel}>Đề nghị nhận việc</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="briefcase" size={22} color="#D97706" />
            </View>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Vị trí đang tuyển</Text>
          </View>
        </View>

        <View style={styles.noticeCard}>
          <Ionicons name="information-circle" size={22} color="#3B82F6" style={{ marginRight: 10 }} />
          <Text style={styles.noticeText}>
            Bạn đã đăng nhập thành công vào Hệ thống quản trị TalentCore Mobile.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    marginBottom: 8,
  },
  headerLogo: {
    width: 150,
    height: 40,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeCard: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 26,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 1,
  },
  userEmailText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rolePillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    padding: 14,
  },
  noticeText: {
    flex: 1,
    fontSize: 12.5,
    color: '#1E40AF',
    lineHeight: 18,
    fontWeight: '500',
  },
});
