import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
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
import { authService } from '../services/auth.service';

interface ForgotPasswordModalProps {
  visible: boolean;
  initialEmail?: string;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  initialEmail = '',
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'email' | 'otp' | 'new_password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (visible) {
      setEmail(initialEmail);
      setStep('email');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage('');
      setSuccessMessage('');
      setCountdown(0);
    }
  }, [visible, initialEmail]);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Vui lòng nhập địa chỉ email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Địa chỉ email không đúng định dạng');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.sendForgotPasswordOtp(cleanEmail);
      setSuccessMessage(res.message || 'Mã OTP đã được gửi đến email của bạn.');
      setStep('otp');
      setCountdown(60);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể gửi mã OTP. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isLoading) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      const res = await authService.sendForgotPasswordOtp(email.trim());
      setSuccessMessage(res.message || 'Đã gửi lại mã OTP mới đến email của bạn.');
      setCountdown(60);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage('Vui lòng nhập đầy đủ mã OTP gồm đúng 6 chữ số');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.verifyForgotPasswordOtp(email.trim(), cleanOtp);
      setSuccessMessage(res.message || 'Mã xác thực OTP chính xác!');
      setTimeout(() => {
        setErrorMessage('');
        setSuccessMessage('');
        setStep('new_password');
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Mã xác thực OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!newPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.resetPasswordWithOtp({
        email: email.trim(),
        otp: otp.trim(),
        password: newPassword,
        confirm_password: confirmPassword,
      });

      setSuccessMessage(res.message || 'Đặt lại mật khẩu thành công!');
      setTimeout(() => {
        onSuccess(email.trim());
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const getHeaderInfo = () => {
    switch (step) {
      case 'email':
        return {
          icon: 'mail-outline',
          title: 'Quên mật khẩu?',
          subtitle: 'Nhập địa chỉ email đăng ký để nhận mã xác thực OTP khôi phục mật khẩu.',
        };
      case 'otp':
        return {
          icon: 'shield-checkmark-outline',
          title: 'Xác thực mã OTP',
          subtitle: `Nhập mã xác thực 6 chữ số đã được gửi đến email ${email}.`,
        };
      case 'new_password':
        return {
          icon: 'lock-closed-outline',
          title: 'Thiết lập mật khẩu mới',
          subtitle: `Tạo mật khẩu mới an toàn cho tài khoản ${email}.`,
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar with Close Button */}
          <View style={styles.topBar}>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <Ionicons name="close" size={24} color="#64748b" />
            </Pressable>
          </View>

          {/* Stepper Progress Indicator */}
          <View style={styles.stepperContainer}>
            <View style={[styles.stepDot, step === 'email' ? styles.stepDotActive : styles.stepDotDone]}>
              <Text style={styles.stepDotNumber}>1</Text>
            </View>
            <View style={[styles.stepLine, step !== 'email' ? styles.stepLineActive : null]} />
            <View style={[styles.stepDot, step === 'otp' ? styles.stepDotActive : step === 'new_password' ? styles.stepDotDone : null]}>
              <Text style={styles.stepDotNumber}>2</Text>
            </View>
            <View style={[styles.stepLine, step === 'new_password' ? styles.stepLineActive : null]} />
            <View style={[styles.stepDot, step === 'new_password' ? styles.stepDotActive : null]}>
              <Text style={styles.stepDotNumber}>3</Text>
            </View>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name={headerInfo.icon as any} size={36} color="#7c3aed" />
            </View>
            <Text style={styles.title}>{headerInfo.title}</Text>
            <Text style={styles.subtitle}>{headerInfo.subtitle}</Text>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Success Message */}
          {successMessage ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {step === 'email' && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email tài khoản</Text>
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

              <Pressable
                style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
                onPress={handleSendOtp}
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
                      <Text style={styles.submitButtonText}>Tiếp tục & Gửi mã OTP</Text>
                      <Ionicons name="arrow-forward" size={18} color="#ffffff" style={styles.btnIcon} />
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              <Pressable onPress={onClose} style={styles.backButton}>
                <Ionicons name="arrow-back" size={16} color="#64748b" />
                <Text style={styles.backButtonText}>Quay lại Đăng nhập</Text>
              </Pressable>
            </View>
          )}

          {step === 'otp' && (
            <View style={styles.form}>
              {/* Change email button */}
              <View style={styles.changeEmailRow}>
                <Text style={styles.targetEmailText} numberOfLines={1}>
                  {email}
                </Text>
                <Pressable
                  onPress={() => {
                    setStep('email');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  hitSlop={5}
                >
                  <Text style={styles.changeEmailLink}>Đổi email</Text>
                </Pressable>
              </View>

              {/* OTP Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mã xác thực OTP (6 chữ số)</Text>
                <View style={[styles.inputWrapper, styles.otpWrapper]}>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="123456"
                    placeholderTextColor="#cbd5e1"
                    value={otp}
                    onChangeText={(text) => {
                      const clean = text.replace(/[^0-9]/g, '').slice(0, 6);
                      setOtp(clean);
                      if (errorMessage) setErrorMessage('');
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus={true}
                  />
                </View>
              </View>

              {/* Resend OTP */}
              <View style={styles.resendRow}>
                {countdown > 0 ? (
                  <Text style={styles.resendTimerText}>
                    Gửi lại mã sau <Text style={{ fontWeight: '700', color: '#7c3aed' }}>{countdown}s</Text>
                  </Text>
                ) : (
                  <Pressable onPress={handleResendOtp} disabled={isLoading} hitSlop={5}>
                    <Text style={styles.resendLink}>Chưa nhận được mã? Gửi lại</Text>
                  </Pressable>
                )}
              </View>

              {/* Submit Button to Verify OTP */}
              <Pressable
                style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
                onPress={handleVerifyOtp}
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
                      <Text style={styles.submitButtonText}>Xác nhận mã OTP</Text>
                      <Ionicons name="shield-checkmark" size={18} color="#ffffff" style={styles.btnIcon} />
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => {
                  setStep('email');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={16} color="#64748b" />
                <Text style={styles.backButtonText}>Quay lại nhập Email</Text>
              </Pressable>
            </View>
          )}

          {step === 'new_password' && (
            <View style={styles.form}>
              <View style={styles.verifiedBadgeRow}>
                <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                <Text style={styles.verifiedBadgeText}>Mã OTP hợp lệ cho tài khoản: {email}</Text>
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu mới</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#7c3aed" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Tối thiểu 6 ký tự"
                    placeholderTextColor="#94a3b8"
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (errorMessage) setErrorMessage('');
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoFocus={true}
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

              {/* Confirm New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#7c3aed" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu mới"
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

              {/* Submit Button to Reset Password */}
              <Pressable
                style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
                onPress={handleResetPassword}
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
                      <Text style={styles.submitButtonText}>Xác nhận & Đổi mật khẩu</Text>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" style={styles.btnIcon} />
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => {
                  setStep('otp');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={16} color="#64748b" />
                <Text style={styles.backButtonText}>Quay lại bước OTP</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 32,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#7c3aed',
    transform: [{ scale: 1.1 }],
  },
  stepDotDone: {
    backgroundColor: '#16a34a',
  },
  stepDotNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
    borderRadius: 2,
  },
  stepLineActive: {
    backgroundColor: '#7c3aed',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#dc2626',
    lineHeight: 18,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
    gap: 8,
  },
  successText: {
    flex: 1,
    fontSize: 13,
    color: '#16a34a',
    lineHeight: 18,
  },
  form: {
    width: '100%',
  },
  changeEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  targetEmailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  changeEmailLink: {
    fontSize: 13,
    color: '#7c3aed',
    fontWeight: '700',
    marginLeft: 8,
  },
  verifiedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 8,
  },
  verifiedBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: '#f8fafc',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
  },
  otpWrapper: {
    borderColor: '#7c3aed',
    backgroundColor: '#faf5ff',
    justifyContent: 'center',
    height: 58,
  },
  otpInput: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 12,
    textAlign: 'center',
    color: '#7c3aed',
    width: '100%',
  },
  resendRow: {
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 16,
  },
  resendTimerText: {
    fontSize: 13,
    color: '#64748b',
  },
  resendLink: {
    fontSize: 13,
    color: '#7c3aed',
    fontWeight: '700',
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  submitButtonPressed: {
    opacity: 0.85,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  backButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
});
