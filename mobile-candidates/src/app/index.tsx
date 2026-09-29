import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../context/AuthContext';
import { JobsScreen } from '../components/JobsScreen';
import { LoginScreen } from '../components/LoginScreen';
import { RegisterScreen } from '../components/RegisterScreen';

export default function IndexPage() {
  const { isLoading } = useAuth();
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <JobsScreen
        onOpenProfile={() => {
          setAuthModalMode('login');
          setAuthModalVisible(true);
        }}
      />

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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
