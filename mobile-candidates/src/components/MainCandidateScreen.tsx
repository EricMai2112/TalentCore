import React, { useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ApplicationsScreen } from './ApplicationsScreen';
import { JobsScreen } from './JobsScreen';
import { NotificationsScreen } from './NotificationsScreen';
import { ProfileScreen } from './ProfileScreen';

type TabKey = 'jobs' | 'applications' | 'notifications' | 'profile';

interface TabItem {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  { key: 'jobs', label: 'Trang chủ', icon: 'home-outline', iconActive: 'home' },
  { key: 'applications', label: 'Ứng tuyển', icon: 'briefcase-outline', iconActive: 'briefcase' },
  { key: 'notifications', label: 'Thông báo', icon: 'notifications-outline', iconActive: 'notifications' },
  { key: 'profile', label: 'Hồ sơ', icon: 'person-outline', iconActive: 'person' },
];

export const MainCandidateScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('jobs');
  const [tabBarWidth, setTabBarWidth] = useState(0);

  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(1)).current;

  const currentTabWidth = tabBarWidth > 0 ? (tabBarWidth - 16) / 4 : 0;

  const handleSelectTab = (tabKey: TabKey, index: number) => {
    if (tabKey === activeTab) return;
    setActiveTab(tabKey);

    if (currentTabWidth > 0) {
      const targetX = index * currentTabWidth;

      Animated.parallel([
        Animated.spring(translateX, {
          toValue: targetX,
          damping: 15,
          mass: 0.9,
          stiffness: 140,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.18,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 90,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 140,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 240,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(iconScaleAnim, {
            toValue: 1.25,
            duration: 140,
            useNativeDriver: true,
          }),
          Animated.spring(iconScaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'jobs':
        return (
          <JobsScreen
            onOpenNotifications={() => handleSelectTab('notifications', 2)}
            onOpenProfile={() => handleSelectTab('profile', 3)}
          />
        );
      case 'applications':
        return (
          <ApplicationsScreen
            onRequireLogin={() => handleSelectTab('profile', 3)}
          />
        );
      case 'notifications':
        return <NotificationsScreen />;
      case 'profile':
        return <ProfileScreen />;
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
        <View
          style={styles.floatingTabBar}
          onLayout={(e) => {
            const width = e.nativeEvent.layout.width;
            setTabBarWidth(width);
            const initialTabWidth = (width - 16) / 4;
            const currentIndex = TABS.findIndex((t) => t.key === activeTab);
            translateX.setValue(currentIndex * initialTabWidth);
          }}
        >
          {currentTabWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.slidingPill,
                {
                  width: currentTabWidth - 6,
                  transform: [
                    { translateX },
                    { scale: scaleAnim },
                  ],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.slidingPillShadowGlow,
                  {
                    opacity: glowAnim,
                  },
                ]}
              />
              <LinearGradient
                colors={['#f5f3ff', '#ede9fe', '#f3e8ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.slidingPillGradient}
              >
                <Animated.View
                  style={[
                    styles.slidingPillGlossShine,
                    {
                      opacity: glowAnim,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.95)', 'rgba(216, 180, 254, 0.5)', 'rgba(124, 58, 237, 0.15)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </LinearGradient>
            </Animated.View>
          )}

          {TABS.map((tab, index) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={styles.tabBtn}
                onPress={() => handleSelectTab(tab.key, index)}
              >
                <Animated.View
                  style={[
                    styles.tabIconWrapper,
                    isActive && { transform: [{ scale: iconScaleAnim }] },
                  ]}
                >
                  <Ionicons
                    name={isActive ? tab.iconActive : tab.icon}
                    size={22}
                    color={isActive ? '#7c3aed' : '#0f172a'}
                  />
                  <Text
                    style={[
                      styles.tabTitle,
                      isActive && styles.tabTitleActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
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
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
  },
  slidingPill: {
    position: 'absolute',
    top: 8,
    left: 11,
    height: 48,
    borderRadius: 24,
    zIndex: 0,
  },
  slidingPillGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    overflow: 'hidden',
  },
  slidingPillGlossShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  slidingPillShadowGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 28,
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.85,
    shadowRadius: 18,
    elevation: 14,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tabTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  tabTitleActive: {
    color: '#7c3aed',
    fontWeight: '800',
  },
});
