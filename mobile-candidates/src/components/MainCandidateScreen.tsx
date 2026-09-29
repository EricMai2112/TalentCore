import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JobsScreen } from './JobsScreen';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';

type TabKey = 'jobs' | 'applications' | 'notifications' | 'profile';

export const MainCandidateScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('jobs');
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const openLoginModal = () => {
    setAuthModalMode('login');
    setAuthModalVisible(true);
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'jobs':
        return (
          <JobsScreen
            onOpenNotifications={() => setActiveTab('notifications')}
            onOpenProfile={() => setActiveTab('profile')}
          />
        );
      case 'applications':
        return (
          <View style={styles.placeholderContainer}>
            <Ionicons name="briefcase-outline" size={48} color="#94a3b8" />
            <Text style={styles.placeholderTitle}>Ứng tuyển</Text>
            <Text style={styles.placeholderSubtitle}>Tính năng đang được phát triển</Text>
          </View>
        );
      case 'notifications':
        return (
          <View style={styles.placeholderContainer}>
            <Ionicons name="notifications-outline" size={48} color="#94a3b8" />
            <Text style={styles.placeholderTitle}>Thông báo</Text>
            <Text style={styles.placeholderSubtitle}>Chưa có thông báo mới</Text>
          </View>
        );
      case 'profile':
        return (
          <View style={styles.placeholderContainer}>
            <Ionicons name="person-circle-outline" size={56} color="#7c3aed" />
            <Text style={styles.placeholderTitle}>Tài khoản</Text>
            <Pressable style={styles.loginTriggerBtn} onPress={openLoginModal}>
              <Text style={styles.loginTriggerText}>Đăng nhập / Đăng ký</Text>
            </Pressable>
          </View>
        );
      default:
        return <JobsScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentArea}>
        {renderActiveTabContent()}
      </View>

      <SafeAreaView pointerEvents="box-none" style={styles.floatingNavWrapper}>
        <View style={styles.floatingTabBar}>
          <Pressable
            style={styles.tabBtn}
            onPress={() => setActiveTab('jobs')}
          >
            <View
              style={[
                styles.tabIconWrapper,
                activeTab === 'jobs' && styles.tabActivePill,
              ]}
            >
              <Ionicons
                name={activeTab === 'jobs' ? 'home' : 'home-outline'}
                size={20}
                color={activeTab === 'jobs' ? '#7c3aed' : '#1e293b'}
              />
              <Text
                style={[
                  styles.tabTitle,
                  activeTab === 'jobs' && styles.tabTitleActive,
                ]}
              >
                Trang chủ
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.tabBtn}
            onPress={() => setActiveTab('applications')}
          >
            <View
              style={[
                styles.tabIconWrapper,
                activeTab === 'applications' && styles.tabActivePill,
              ]}
            >
              <Ionicons
                name={activeTab === 'applications' ? 'briefcase' : 'briefcase-outline'}
                size={20}
                color={activeTab === 'applications' ? '#7c3aed' : '#1e293b'}
              />
              <Text
                style={[
                  styles.tabTitle,
                  activeTab === 'applications' && styles.tabTitleActive,
                ]}
              >
                Ứng tuyển
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.tabBtn}
            onPress={() => setActiveTab('notifications')}
          >
            <View
              style={[
                styles.tabIconWrapper,
                activeTab === 'notifications' && styles.tabActivePill,
              ]}
            >
              <Ionicons
                name={activeTab === 'notifications' ? 'notifications' : 'notifications-outline'}
                size={20}
                color={activeTab === 'notifications' ? '#7c3aed' : '#1e293b'}
              />
              <Text
                style={[
                  styles.tabTitle,
                  activeTab === 'notifications' && styles.tabTitleActive,
                ]}
              >
                Thông báo
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.tabBtn}
            onPress={() => setActiveTab('profile')}
          >
            <View
              style={[
                styles.tabIconWrapper,
                activeTab === 'profile' && styles.tabActivePill,
              ]}
            >
              <Ionicons
                name={activeTab === 'profile' ? 'person' : 'person-outline'}
                size={20}
                color={activeTab === 'profile' ? '#7c3aed' : '#1e293b'}
              />
              <Text
                style={[
                  styles.tabTitle,
                  activeTab === 'profile' && styles.tabTitleActive,
                ]}
              >
                Hồ sơ
              </Text>
            </View>
          </Pressable>
        </View>
      </SafeAreaView>

      <Modal
        visible={authModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAuthModalVisible(false)}
      >
        {authModalMode === 'login' ? (
          <LoginScreen
            onNavigateToRegister={() => setAuthModalMode('register')}
            onClose={() => setAuthModalVisible(false)}
          />
        ) : (
          <RegisterScreen
            onNavigateToLogin={() => setAuthModalMode('login')}
            onClose={() => setAuthModalVisible(false)}
          />
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentArea: {
    flex: 1,
  },
  floatingNavWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 12 : 16,
    left: 20,
    right: 20,
  },
  floatingTabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 36,
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    minWidth: 58,
  },
  tabActivePill: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  tabTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
  },
  tabTitleActive: {
    color: '#7c3aed',
    fontWeight: '800',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 12,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  loginTriggerBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#7c3aed',
    borderRadius: 10,
  },
  loginTriggerText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});
