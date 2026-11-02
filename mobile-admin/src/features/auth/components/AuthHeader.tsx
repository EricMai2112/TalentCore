import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const AuthHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <Image
          source={require('../../../../assets/images/logo-talentcore.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.badgeWrapper}>
        <View style={styles.badgeContainer}>
          <Ionicons name="sparkles" size={13} color="#8B5CF6" style={{ marginRight: 6 }} />
          <Text style={styles.badgeText}>HỆ THỐNG QUẢN TRỊ TUYỂN DỤNG</Text>
        </View>
      </View>

      <Text style={styles.subtitleText}>
        Đăng nhập để quản lý ứng viên
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoImage: {
    width: 175,
    height: 48,
  },
  badgeWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#7C3AED',
    letterSpacing: 0.6,
  },
  subtitleText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
