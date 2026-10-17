import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth.types';

interface AdminHeaderProps {
  onNotificationPress?: () => void;
  unreadCount?: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onNotificationPress,
  unreadCount = 3,
}) => {
  const { user, logout } = useAuth();

  const handleProfilePress = () => {
    Alert.alert(
      user?.name || 'Tài khoản Quản trị',
      `${user?.email || ''}\nVai trò: ${getRoleTitle(user?.role)}`,
      [
        { text: 'Đóng', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Xác nhận đăng xuất',
              'Bạn có chắc chắn muốn đăng xuất khỏi TalentCore?',
              [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Đăng xuất', style: 'destructive', onPress: logout },
              ]
            );
          },
        },
      ]
    );
  };

  const getRoleTitle = (role?: UserRole) => {
    switch (role) {
      case UserRole.HR_ADMIN:
        return 'HR Admin';
      case UserRole.DEPARTMENT_MANAGER:
        return 'Manager';
      case UserRole.EMPLOYEE:
        return 'Interviewer';
      default:
        return 'Admin';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Image
          source={require('../../assets/images/logo-talentcore.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.roleTag}>
          <View style={styles.roleDot} />
          <Text style={styles.roleTagText}>{getRoleTitle(user?.role)}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color="#1E293B" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={handleProfilePress}
          activeOpacity={0.8}
        >
          <View style={styles.avatarInner}>
            <Text style={styles.avatarInitial}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </Text>
          </View>
          <View style={styles.onlineDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AdminHeader;

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 125,
    height: 32,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 5,
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  avatarButton: {
    position: 'relative',
  },
  avatarInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#EFF6FF',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
