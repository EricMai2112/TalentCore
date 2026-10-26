import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

interface RegisterScreenProps {
  onNavigateToLogin?: () => void;
  onClose?: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin, onClose }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validate = (): boolean => {
    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email của bạn');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Định dạng email không hợp lệ');
      return false;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có tối thiểu 6 ký tự');
      return false;
    }
    if (!confirmPassword) {
      setErrorMessage('Vui lòng xác nhận lại mật khẩu');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({
        email: email.trim().toLowerCase(),
        password,
        confirm_password: confirmPassword,
      });
      setSuccessMessage('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng ký thất bại. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {onClose && (
          <View style={styles.topBar}>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <Ionicons name="close" size={24} color="#64748b" />
            </Pressable>
          </View>
        )}

        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo-talentcore.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Tạo tài khoản ứng viên</Text>
          <Text style={styles.description}>
            Khởi đầu sự nghiệp với hàng ngàn việc làm hấp dẫn tại TalentCore
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#ef4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
            <View style={styles.successContent}>
              <Text style={styles.successText}>{successMessage}</Text>
              <Pressable onPress={onNavigateToLogin} style={styles.successLoginBtn}>
                <Text style={styles.successLoginText}>Đến màn hình Đăng nhập</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#7c3aed" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {email.length > 0 && (
                <Pressable onPress={() => setEmail('')} hitSlop={10}>
                  <Ionicons name="close-circle" size={18} color="#94a3b8" />
                </Pressable>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#7c3aed"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748b"
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#7c3aed"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#94a3b8"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errorMessage) setErrorMessage('');
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={10}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748b"
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#7c3aed', '#6366f1', '#2563eb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Đăng ký tài khoản</Text>
                  <Ionicons name="checkmark-done" size={18} color="#ffffff" style={styles.btnIcon} />
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Đã có tài khoản ứng viên?</Text>
          <Pressable onPress={onNavigateToLogin} hitSlop={10}>
            <Text style={styles.footerLink}>Đăng nhập</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  topBar: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 220,
    height: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  successContent: {
    flex: 1,
  },
  successText: {
    color: '#16a34a',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  successLoginBtn: {
    marginTop: 6,
  },
  successLoginText: {
    color: '#7c3aed',
    fontSize: 13,
    fontWeight: '700',
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#0f172a',
    fontSize: 15,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnIcon: {
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    gap: 6,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  footerLink: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '700',
  },
});
