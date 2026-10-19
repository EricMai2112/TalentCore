import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from './AdminHeader';
import AdminTabBar, { AdminTabKey } from './AdminTabBar';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import RecruitmentScreen from '../screens/recruitment/RecruitmentScreen';
import InterviewsScreen from '../screens/interviews/InterviewsScreen';
import OffersScreen from '../screens/offers/OffersScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import { adminService } from '../services/admin.services';

export const MainAdminScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTabKey>('dashboard');
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchBadgeCount = useCallback(async () => {
    try {
      const res = await adminService.getNotifications();
      setUnreadCount(res.unreadCount);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    fetchBadgeCount();
  }, [fetchBadgeCount]);

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'recruitment':
        return <RecruitmentScreen />;
      case 'interviews':
        return <InterviewsScreen />;
      case 'offers':
        return <OffersScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <AdminHeader
          onNotificationPress={() => setActiveTab('notifications')}
          unreadCount={unreadCount}
        />

        <View style={styles.content}>{renderScreen()}</View>

        <AdminTabBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            fetchBadgeCount();
          }}
          unreadCount={unreadCount}
        />
      </View>
    </SafeAreaView>
  );
};

export default MainAdminScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  content: {
    flex: 1,
  },
});
