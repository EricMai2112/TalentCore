import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from './AdminHeader';
import AdminTabBar, { AdminTabKey } from './AdminTabBar';
import ScreenPlaceholder from './ScreenPlaceholder';
import AdminNotificationModal from './AdminNotificationModal';

export const MainAdminScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTabKey>('dashboard');
  const [notificationVisible, setNotificationVisible] = useState<boolean>(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <AdminHeader
          onNotificationPress={() => setNotificationVisible(true)}
          unreadCount={2}
        />

        <View style={styles.content}>
          <ScreenPlaceholder tabKey={activeTab} />
        </View>

        <AdminTabBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />

        <AdminNotificationModal
          visible={notificationVisible}
          onClose={() => setNotificationVisible(false)}
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
