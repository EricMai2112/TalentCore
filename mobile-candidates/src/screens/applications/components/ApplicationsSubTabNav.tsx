import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type ApplicationSubTab = 'my_applications' | 'interviews' | 'offers';

interface ApplicationsSubTabNavProps {
  activeTab: ApplicationSubTab;
  onChangeTab: (tab: ApplicationSubTab) => void;
  interviewCount?: number;
  offerCount?: number;
}

export const ApplicationsSubTabNav: React.FC<ApplicationsSubTabNavProps> = ({
  activeTab,
  onChangeTab,
  interviewCount = 0,
  offerCount = 0,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.tabItem,
          activeTab === 'my_applications' && styles.tabItemActive,
        ]}
        onPress={() => onChangeTab('my_applications')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'my_applications' && styles.tabTextActive,
          ]}
        >
          Ứng tuyển
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.tabItem,
          activeTab === 'interviews' && styles.tabItemActive,
        ]}
        onPress={() => onChangeTab('interviews')}
      >
        <View style={styles.tabContent}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'interviews' && styles.tabTextActive,
            ]}
          >
            Lịch phỏng vấn
          </Text>
          {interviewCount > 0 && (
            <View
              style={[
                styles.badge,
                activeTab === 'interviews'
                  ? styles.badgeActive
                  : styles.badgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  activeTab === 'interviews'
                    ? styles.badgeTextActive
                    : styles.badgeTextInactive,
                ]}
              >
                {interviewCount}
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      <Pressable
        style={[
          styles.tabItem,
          activeTab === 'offers' && styles.tabItemActive,
        ]}
        onPress={() => onChangeTab('offers')}
      >
        <View style={styles.tabContent}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'offers' && styles.tabTextActive,
            ]}
          >
            Offer
          </Text>
          {offerCount > 0 && (
            <View
              style={[
                styles.badge,
                activeTab === 'offers'
                  ? styles.badgeOfferActive
                  : styles.badgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  activeTab === 'offers'
                    ? styles.badgeTextActive
                    : styles.badgeTextInactive,
                ]}
              >
                {offerCount}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 4,
    borderRadius: 18,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  tabItemActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#7c3aed',
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: {
    backgroundColor: '#7c3aed',
  },
  badgeOfferActive: {
    backgroundColor: '#059669',
  },
  badgeInactive: {
    backgroundColor: '#e2e8f0',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeTextActive: {
    color: '#ffffff',
  },
  badgeTextInactive: {
    color: '#64748b',
  },
});
