import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type AdminTabKey = 'recruitment' | 'interviews' | 'dashboard' | 'offers' | 'settings';

export interface TabConfig {
  key: AdminTabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  badge?: number | boolean;
  isCenter?: boolean;
}

const TABS: TabConfig[] = [
  {
    key: 'recruitment',
    label: 'Tuyển dụng',
    icon: 'briefcase-outline',
    iconActive: 'briefcase',
  },
  {
    key: 'interviews',
    label: 'Phỏng vấn',
    icon: 'calendar-outline',
    iconActive: 'calendar',
    badge: true,
  },
  {
    key: 'dashboard',
    label: 'Tổng quan',
    icon: 'stats-chart',
    iconActive: 'stats-chart',
    isCenter: true,
  },
  {
    key: 'offers',
    label: 'Offers',
    icon: 'mail-unread-outline',
    iconActive: 'mail-unread',
    badge: 2,
  },
  {
    key: 'settings',
    label: 'Cấu hình',
    icon: 'settings-outline',
    iconActive: 'settings',
  },
];

interface AdminTabBarProps {
  activeTab: AdminTabKey;
  onTabChange: (tab: AdminTabKey) => void;
}

export const AdminTabBar: React.FC<AdminTabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();
  const [tabBarWidth, setTabBarWidth] = useState<number>(0);

  const activeIndex = TABS.findIndex((t) => t.key === activeTab);
  const isCenterActive = activeTab === 'dashboard';

  const tabWidth = tabBarWidth > 0 ? (tabBarWidth - 12) / TABS.length : 0;

  const translateX = useRef(new Animated.Value(0)).current;
  const pillScale = useRef(new Animated.Value(1)).current;
  const pillGlow = useRef(new Animated.Value(0)).current;
  const pillOpacity = useRef(new Animated.Value(isCenterActive ? 0 : 1)).current;

  const iconScaleAnim = useRef(new Animated.Value(1)).current;
  const centerScaleAnim = useRef(new Animated.Value(isCenterActive ? 1.1 : 1)).current;
  const centerGlowAnim = useRef(new Animated.Value(isCenterActive ? 1 : 0)).current;

  const handleSelectTab = (tabKey: AdminTabKey, index: number) => {
    if (tabKey === activeTab) return;
    onTabChange(tabKey);

    const isTargetCenter = tabKey === 'dashboard';

    if (isTargetCenter) {
      Animated.parallel([
        Animated.timing(pillOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(centerScaleAnim, {
            toValue: 1.22,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(centerScaleAnim, {
            toValue: 1.1,
            friction: 4,
            tension: 90,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(centerGlowAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(centerGlowAnim, {
            toValue: 0.8,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      const targetX = index * tabWidth;

      Animated.parallel([
        Animated.spring(translateX, {
          toValue: targetX,
          damping: 15,
          mass: 0.9,
          stiffness: 140,
          useNativeDriver: true,
        }),
        Animated.timing(pillOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(pillScale, {
            toValue: 1.16,
            duration: 140,
            useNativeDriver: true,
          }),
          Animated.spring(pillScale, {
            toValue: 1,
            friction: 5,
            tension: 90,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pillGlow, {
            toValue: 1,
            duration: 140,
            useNativeDriver: true,
          }),
          Animated.timing(pillGlow, {
            toValue: 0,
            duration: 250,
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
        Animated.spring(centerScaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(centerGlowAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  useEffect(() => {
    if (tabWidth > 0 && !isCenterActive) {
      translateX.setValue(activeIndex * tabWidth);
    }
  }, [tabWidth]);

  return (
    <View
      style={[
        styles.wrapper,
        { bottom: Math.max(insets.bottom, 10) + 6 },
      ]}
    >
      <View
        style={styles.dock}
        onLayout={(e) => {
          const width = e.nativeEvent.layout.width;
          setTabBarWidth(width);
          const currentWidth = (width - 12) / TABS.length;
          const initialIndex = TABS.findIndex((t) => t.key === activeTab);
          if (initialIndex !== 2) {
            translateX.setValue(initialIndex * currentWidth);
          }
        }}
      >
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.slidingPill,
              {
                width: tabWidth - 4,
                opacity: pillOpacity,
                transform: [
                  { translateX },
                  { scale: pillScale },
                ],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.slidingPillShadowGlow,
                { opacity: pillGlow },
              ]}
            />
            <LinearGradient
              colors={['#EFF6FF', '#DBEAFE', '#EFF6FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.slidingPillGradient}
            >
              <Animated.View
                style={[
                  styles.slidingPillGlossShine,
                  { opacity: pillGlow },
                ]}
              >
                <LinearGradient
                  colors={[
                    'rgba(255, 255, 255, 0.95)',
                    'rgba(191, 219, 254, 0.5)',
                    'rgba(37, 99, 235, 0.15)',
                  ]}
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

          if (tab.isCenter) {
            return (
              <Pressable
                key={tab.key}
                style={styles.centerTabBtn}
                onPress={() => handleSelectTab(tab.key, index)}
              >
                <Animated.View
                  style={[
                    styles.centerCapsuleOuter,
                    isCenterActive && styles.centerCapsuleOuterActive,
                    { transform: [{ scale: centerScaleAnim }] },
                  ]}
                >
                  <LinearGradient
                    colors={
                      isCenterActive
                        ? ['#1D4ED8', '#2563EB', '#6366F1']
                        : ['#3B82F6', '#2563EB']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.centerCapsuleGradient}
                  >
                    <Ionicons
                      name={tab.icon}
                      size={24}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
                </Animated.View>
                <Text
                  style={[
                    styles.centerLabel,
                    isCenterActive && styles.centerLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={tab.key}
              style={styles.sideTabBtn}
              onPress={() => handleSelectTab(tab.key, index)}
            >
              <Animated.View
                style={[
                  styles.tabIconWrapper,
                  isActive && { transform: [{ scale: iconScaleAnim }] },
                ]}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={isActive ? tab.iconActive : tab.icon}
                    size={21}
                    color={isActive ? '#1D4ED8' : '#64748B'}
                  />
                  {tab.badge === true && <View style={styles.badgeDot} />}
                  {typeof tab.badge === 'number' && (
                    <View style={styles.badgePill}>
                      <Text style={styles.badgePillText}>{tab.badge}</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.sideLabel,
                    isActive ? styles.sideLabelActive : styles.sideLabelInactive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default AdminTabBar;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 10,
    right: 10,
    zIndex: 100,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 68,
    backgroundColor: '#FFFFFF',
    borderRadius: 34,
    paddingHorizontal: 6,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
    position: 'relative',
  },
  slidingPill: {
    position: 'absolute',
    top: 9,
    left: 8,
    height: 50,
    borderRadius: 25,
    zIndex: 0,
  },
  slidingPillGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    overflow: 'hidden',
  },
  slidingPillGlossShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
  },
  slidingPillShadowGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 29,
    backgroundColor: 'rgba(37, 99, 235, 0.22)',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  sideTabBtn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    paddingHorizontal: 1,
  },
  tabIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: '100%',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideLabel: {
    fontSize: 10.5,
    textAlign: 'center',
    includeFontPadding: false,
  },
  sideLabelActive: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  sideLabelInactive: {
    color: '#64748B',
    fontWeight: '500',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgePill: {
    position: 'absolute',
    top: -4,
    right: -9,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  centerTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  centerCapsuleOuter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    padding: 3.5,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 14,
    elevation: 14,
    borderWidth: 1.5,
    borderColor: '#EFF6FF',
    marginTop: -26,
  },
  centerCapsuleOuterActive: {
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 18,
    borderColor: '#DBEAFE',
  },
  centerCapsuleGradient: {
    flex: 1,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
    includeFontPadding: false,
  },
  centerLabelActive: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
});
