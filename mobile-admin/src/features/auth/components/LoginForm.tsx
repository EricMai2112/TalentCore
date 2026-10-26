import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { validateLogin } from '../validators/auth.validator';
import { LoginPayload } from '../types/auth.types';

interface LoginFormProps {
  onSubmit: (payload: LoginPayload) => Promise<void>;
  isLoading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSubmit = async () => {
    setErrorMessage(null);
    const payload: LoginPayload = {
      email: email.trim(),
      password,
      rememberMe,
    };

    const validationError = validateLogin(payload);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      await onSubmit(payload);
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Quên mật khẩu',
      'Vui lòng liên hệ Quản trị viên hệ thống để được cấp lại mật khẩu tài khoản nội bộ.',
      [{ text: 'Đã hiểu', style: 'default' }],
    );
  };

  return (
    <View style={styles.container}>
      {errorMessage && (
        <View style={styles.errorAlert}>
          <Ionicons name="alert-circle" size={18} color="#E11D48" style={{ marginRight: 8, marginTop: 1 }} />
          <Text style={styles.errorAlertText}>{errorMessage}</Text>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Email <Text style={styles.requiredMark}>*</Text>
        </Text>
        <View style={[styles.inputWrapper, isEmailFocused && styles.inputWrapperFocused]}>
          <Ionicons
            name="mail-outline"
            size={18}
            color={isEmailFocused ? '#3B82F6' : '#94A3B8'}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="admin@gmail.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errorMessage) setErrorMessage(null);
            }}
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
            editable={!isLoading}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Mật khẩu <Text style={styles.requiredMark}>*</Text>
        </Text>
        <View style={[styles.inputWrapper, isPasswordFocused && styles.inputWrapperFocused]}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={isPasswordFocused ? '#3B82F6' : '#94A3B8'}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errorMessage) setErrorMessage(null);
            }}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="#3B82F6"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={styles.rememberMeContainer}
          onPress={() => setRememberMe(!rememberMe)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
            {rememberMe && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
          </View>
          <Text style={styles.rememberMeText}>Ghi nhớ đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.submitBtnContainer}
        onPress={handleSubmit}
        disabled={isLoading}
        activeOpacity={0.88}
      >
        <LinearGradient
          colors={['#8B5CF6', '#3B82F6', '#06B6D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
        >
          {isLoading ? (
            <View style={styles.btnContent}>
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>Đang xác thực...</Text>
            </View>
          ) : (
            <View style={styles.btnContent}>
              <Text style={styles.submitBtnText}>Đăng nhập hệ thống</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorAlertText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#BE123C',
    lineHeight: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  requiredMark: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  rememberMeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },
  submitBtnContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
