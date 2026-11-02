import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../context/AuthContext';
import { MainCandidateScreen } from '../components/MainCandidateScreen';
import { LoginScreen } from '../components/LoginScreen';
import { RegisterScreen } from '../components/RegisterScreen';

export default function IndexPage() {
  const { user, token, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

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

  if (!user || !token) {
    if (authMode === 'register') {
      return (
        <View style={styles.container}>
          <RegisterScreen onNavigateToLogin={() => setAuthMode('login')} />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <LoginScreen onNavigateToRegister={() => setAuthMode('register')} />
      </View>
    );
  }

  return <MainCandidateScreen />;
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
