import React from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ApplicationItem } from '../types/job.types';

interface ApplicationsScreenProps {
  onRequireLogin?: () => void;
}

export const ApplicationsScreen: React.FC<ApplicationsScreenProps> = ({ onRequireLogin }) => {
  const { user } = useAuth();
  const applications: ApplicationItem[] = [];

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notLoggedContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="document-text-outline" size={44} color="#7c3aed" />
          </View>
          <Text style={styles.emptyTitle}>Theo dõi hồ sơ ứng tuyển</Text>
          <Text style={styles.emptyDesc}>
            Vui lòng đăng nhập tài khoản ứng viên để theo dõi tiến trình xét duyệt và lịch phỏng vấn của các vị trí đã nộp.
          </Text>
          <Pressable style={styles.loginBtn} onPress={onRequireLogin}>
            <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Hồ sơ đã ứng tuyển</Text>
          <Text style={styles.subtitle}>
            {applications.length} vị trí đang trong quy trình tuyển dụng
          </Text>
        </View>

        {applications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="briefcase-outline" size={40} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có hồ sơ ứng tuyển</Text>
            <Text style={styles.emptyDesc}>
              Bạn chưa nộp hồ sơ vào vị trí công việc nào. Danh sách công việc bạn đã ứng tuyển sẽ hiển thị tại đây.
            </Text>
          </View>
        ) : (
          <FlatList
            data={applications}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.appCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                    <Text style={styles.companyName}>{item.companyName}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${item.statusColor}15`, borderColor: `${item.statusColor}30` },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: item.statusColor }]}>
                      {item.statusText}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardFooter}>
                  <View style={styles.footerItem}>
                    <Ionicons name="calendar-outline" size={14} color="#64748b" />
                    <Text style={styles.footerText}>Ngày nộp: {item.appliedDate}</Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Ionicons name="cash-outline" size={14} color="#16a34a" />
                    <Text style={[styles.footerText, { color: '#16a34a', fontWeight: '700' }]}>
                      {item.salary}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
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
  listContent: {
    paddingBottom: 110,
    gap: 14,
  },
  appCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 13,
    color: '#64748b',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
  },
  notLoggedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
});
