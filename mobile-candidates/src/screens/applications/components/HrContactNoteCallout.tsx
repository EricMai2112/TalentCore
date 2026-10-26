import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HrContactNoteCalloutProps {
  phone?: string;
  zaloPhone?: string;
}

export const HrContactNoteCallout: React.FC<HrContactNoteCalloutProps> = ({
  phone = '0987654321',
  zaloPhone = '0987654321',
}) => {
  const handleCall = () => {
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <Ionicons name="information-circle" size={20} color="#d97706" style={styles.icon} />
      <View style={styles.content}>
        <Text style={styles.title}>💡 Ghi chú từ Bộ phận Tuyển dụng (HR):</Text>
        <Text style={styles.text}>
          Nếu quý ứng viên có thắc mắc hoặc cần hỗ trợ thay đổi thời gian phỏng vấn, vui lòng liên hệ trực tiếp với HR qua SĐT/Zalo:{' '}
        </Text>
        <TouchableOpacity style={styles.phonePill} onPress={handleCall} activeOpacity={0.7}>
          <Ionicons name="call" size={12} color="#4338ca" />
          <Text style={styles.phoneText}>{phone}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 8,
  },
  icon: {
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78350f',
    marginBottom: 3,
  },
  text: {
    fontSize: 11.5,
    color: '#92400e',
    lineHeight: 17,
  },
  phonePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    borderColor: '#fde68a',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  phoneText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4338ca',
    textDecorationLine: 'underline',
  },
});
