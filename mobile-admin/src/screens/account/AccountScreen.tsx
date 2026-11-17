import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { UserRole } from '../../features/auth/types/auth.types';

interface AccountScreenProps {
  onBack?: () => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({ onBack }) => {
  const { user, setUser, logout } = useAuth();

  // Edit Profile States
  const [name, setName] = useState<string>(user?.name || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Change Password Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showOldPass, setShowOldPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
  const [isChangingPass, setIsChangingPass] = useState<boolean>(false);

  const getRoleTitle = (role?: UserRole) => {
    switch (role) {
      case UserRole.HR_ADMIN:
        return 'Quản trị viên Nhân sự';
      case UserRole.DEPARTMENT_MANAGER:
        return 'Trưởng bộ phận';
      case UserRole.EMPLOYEE:
        return 'Hội đồng phỏng vấn / Nhân viên';
      default:
        return 'Quản trị viên';
    }
  };

  const deptName =
    typeof user?.departmentId === 'object' && user?.departmentId
      ? user.departmentId.name
      : 'Ban Quản trị chung';

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống');
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await authService.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });
      setUser(updated);
      Alert.alert('Thành công', 'Cập nhật thông tin cá nhân thành công!');
    } catch (err: any) {
      Alert.alert('Thất bại', err?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không trùng khớp');
      return;
    }
    if (oldPassword === newPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới không được trùng với mật khẩu cũ');
      return;
    }

    setIsChangingPass(true);
    try {
      await authService.changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
      setIsPasswordModalOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Thất bại', err?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Xác nhận đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng TalentCore?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {onBack && (
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
            <Text style={styles.backText}>Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
          <View style={{ width: 70 }} />
        </View>
      )}

      {/* Profile Card Header */}
      <View style={styles.profileCard}>
        <LinearGradient
          colors={['#2563EB', '#4F46E5', '#7C3AED']}
          style={styles.avatarGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </Text>
        </LinearGradient>
        <Text style={styles.userName}>{user?.name || 'Administrator'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={13} color="#2563EB" />
            <Text style={styles.roleBadgeText}>{getRoleTitle(user?.role)}</Text>
          </View>
          <View style={styles.deptBadge}>
            <Ionicons name="business-outline" size={13} color="#475569" />
            <Text style={styles.deptBadgeText}>{deptName}</Text>
          </View>
        </View>
      </View>

      {/* Edit Profile Form */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Họ và tên</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nhập họ và tên..."
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email (Không thể thay đổi)</Text>
          <View style={[styles.inputWrapper, styles.disabledInput]}>
            <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: '#64748B' }]}
              value={user?.email}
              editable={false}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Số điện thoại cá nhân</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Nhập số điện thoại (ví dụ: 0987654321)..."
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleUpdateProfile}
          disabled={isUpdating}
          activeOpacity={0.8}
        >
          {isUpdating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Security & Action Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Bảo mật & Tài khoản</Text>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => setIsPasswordModalOpen(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBg, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="key-outline" size={18} color="#4F46E5" />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={styles.actionTitle}>Đổi mật khẩu</Text>
            <Text style={styles.actionSub}>Cập nhật mật khẩu định kỳ để bảo vệ tài khoản</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.actionItem} onPress={handleLogout} activeOpacity={0.7}>
          <View style={[styles.actionIconBg, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={[styles.actionTitle, { color: '#DC2626' }]}>Đăng xuất</Text>
            <Text style={styles.actionSub}>Thoát phiên làm việc hiện tại trên thiết bị này</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Change Password Modal */}
      <Modal
        visible={isPasswordModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPasswordModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalIconBadge}>
                  <Ionicons name="key-outline" size={18} color="#4F46E5" />
                </View>
                <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsPasswordModalOpen(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Old password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mật khẩu hiện tại *</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry={!showOldPass}
                    placeholder="Nhập mật khẩu cũ..."
                    placeholderTextColor="#94A3B8"
                  />
                  <TouchableOpacity onPress={() => setShowOldPass(!showOldPass)}>
                    <Ionicons
                      name={showOldPass ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mật khẩu mới *</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPass}
                    placeholder="Tối thiểu 6 ký tự..."
                    placeholderTextColor="#94A3B8"
                  />
                  <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)}>
                    <Ionicons
                      name={showNewPass ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Xác nhận mật khẩu mới *</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPass}
                    placeholder="Nhập lại mật khẩu mới..."
                    placeholderTextColor="#94A3B8"
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>
                    <Ionicons
                      name={showConfirmPass ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.confirmPassButton}
                onPress={handleChangePassword}
                disabled={isChangingPass}
                activeOpacity={0.8}
              >
                {isChangingPass ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmPassButtonText}>Xác nhận đổi mật khẩu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  roleBadgeText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '700',
  },
  deptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deptBadgeText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
  },
  disabledInput: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 11,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  modalCloseButton: {
    padding: 6,
  },
  modalBody: {
    gap: 12,
  },
  confirmPassButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  confirmPassButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
});
