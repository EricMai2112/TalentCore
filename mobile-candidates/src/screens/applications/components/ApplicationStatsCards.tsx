import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApplicationStats } from '../../../types/application.types';

interface ApplicationStatsCardsProps {
  stats: ApplicationStats;
}

export const ApplicationStatsCards: React.FC<ApplicationStatsCardsProps> = ({ stats }) => {
  return (
    <View style={styles.grid}>
      {/* 1. Đã ứng tuyển */}
      <View style={[styles.card, styles.cardBlue]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, styles.labelBlue]}>Đã ứng tuyển</Text>
          <View style={[styles.iconWrap, styles.iconBlue]}>
            <Ionicons name="paper-plane-outline" size={14} color="#2563eb" />
          </View>
        </View>
        <Text style={[styles.cardValue, styles.valueBlue]}>{stats.totalApplied}</Text>
        <View style={styles.badgeWrap}>
          <Text style={[styles.cardBadgeText, styles.badgeTextBlue]}>Tổng hồ sơ</Text>
        </View>
      </View>

      {/* 2. Đang xử lý */}
      <View style={[styles.card, styles.cardAmber]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, styles.labelAmber]}>Đang xử lý</Text>
          <View style={[styles.iconWrap, styles.iconAmber]}>
            <Ionicons name="time-outline" size={14} color="#d97706" />
          </View>
        </View>
        <Text style={[styles.cardValue, styles.valueAmber]}>{stats.processingCount}</Text>
        <View style={styles.badgeWrap}>
          <Text style={[styles.cardBadgeText, styles.badgeTextAmber]}>Đang xét duyệt</Text>
        </View>
      </View>

      {/* 3. Phỏng vấn */}
      <View style={[styles.card, styles.cardPurple]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, styles.labelPurple]}>Phỏng vấn</Text>
          <View style={[styles.iconWrap, styles.iconPurple]}>
            <Ionicons name="calendar-outline" size={14} color="#7c3aed" />
          </View>
        </View>
        <Text style={[styles.cardValue, styles.valuePurple]}>{stats.interviewCount}</Text>
        <View style={styles.badgeWrap}>
          <Text style={[styles.cardBadgeText, styles.badgeTextPurple]}>Lịch hẹn</Text>
        </View>
      </View>

      {/* 4. Offer */}
      <View style={[styles.card, styles.cardEmerald]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, styles.labelEmerald]}>Offer</Text>
          <View style={[styles.iconWrap, styles.iconEmerald]}>
            <Ionicons name="document-text-outline" size={14} color="#059669" />
          </View>
        </View>
        <Text style={[styles.cardValue, styles.valueEmerald]}>{stats.offerCount}</Text>
        <View style={styles.badgeWrap}>
          <Text style={[styles.cardBadgeText, styles.badgeTextEmerald]}>Thư mời nhận việc</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    width: '48.4%',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  badgeWrap: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  badgeTextBlue: { color: '#1d4ed8' },
  badgeTextAmber: { color: '#b45309' },
  badgeTextPurple: { color: '#6d28d9' },
  badgeTextEmerald: { color: '#047857' },

  // Color variants
  cardBlue: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  labelBlue: { color: '#1d4ed8' },
  iconBlue: { backgroundColor: '#dbeafe' },
  valueBlue: { color: '#1e3a8a' },

  cardAmber: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  labelAmber: { color: '#b45309' },
  iconAmber: { backgroundColor: '#fef3c7' },
  valueAmber: { color: '#78350f' },

  cardPurple: { backgroundColor: '#faf5ff', borderColor: '#e9d5ff' },
  labelPurple: { color: '#6d28d9' },
  iconPurple: { backgroundColor: '#f3e8ff' },
  valuePurple: { color: '#4c1d95' },

  cardEmerald: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  labelEmerald: { color: '#047857' },
  iconEmerald: { backgroundColor: '#d1fae5' },
  valueEmerald: { color: '#064e3b' },
});
