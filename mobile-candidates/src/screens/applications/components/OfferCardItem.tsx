import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CandidateOfferItem, CandidateOfferStatus } from '../../../types/application.types';

interface OfferCardItemProps {
  offer: CandidateOfferItem;
  onOpen: () => void;
}

export const OfferCardItem: React.FC<OfferCardItemProps> = ({ offer, onOpen }) => {
  const formattedSalary = Number(offer.salary || 0).toLocaleString('vi-VN');
  const deptName = offer.departmentId?.name || 'IT & Engineering';

  const isExpired =
    offer.status === CandidateOfferStatus.EXPIRED ||
    (offer.status === CandidateOfferStatus.SENT &&
      new Date() > new Date(offer.expirationDate));

  const canRespond = offer.status === CandidateOfferStatus.SENT && !isExpired;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const getDaysLeft = (expirationDate: string) => {
    const diff = new Date(expirationDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Đã hết hạn';
    if (days === 0) return 'Hết hạn hôm nay';
    return `Còn ${days} ngày để phản hồi`;
  };

  const getStatusBadge = () => {
    if (isExpired || offer.status === CandidateOfferStatus.EXPIRED) {
      return (
        <View style={[styles.badge, styles.badgeExpired]}>
          <Ionicons name="time-outline" size={12} color="#c2410c" />
          <Text style={styles.badgeExpiredText}>Đã quá hạn</Text>
        </View>
      );
    }

    switch (offer.status) {
      case CandidateOfferStatus.ACCEPTED:
        return (
          <View style={[styles.badge, styles.badgeAccepted]}>
            <Ionicons name="checkmark-circle-outline" size={12} color="#059669" />
            <Text style={styles.badgeAcceptedText}>Đã đồng ý nhận việc</Text>
          </View>
        );
      case CandidateOfferStatus.DECLINED:
        return (
          <View style={[styles.badge, styles.badgeDeclined]}>
            <Ionicons name="close-circle-outline" size={12} color="#e11d48" />
            <Text style={styles.badgeDeclinedText}>Đã từ chối offer</Text>
          </View>
        );
      case CandidateOfferStatus.SENT:
      default:
        return (
          <View style={[styles.badge, styles.badgePending]}>
            <Ionicons name="time-outline" size={12} color="#b45309" />
            <Text style={styles.badgePendingText}>Chờ bạn phản hồi</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleArea}>
          <Text style={styles.deptText}>{deptName}</Text>
          <Text style={styles.jobTitle}>{offer.positionTitle}</Text>
        </View>
        {getStatusBadge()}
      </View>

      {/* Salary & Probation highlight box */}
      <View style={styles.salaryBox}>
        <View>
          <Text style={styles.salaryLabel}>MỨC LƯƠNG ĐỀ NGHỊ</Text>
          <Text style={styles.salaryValue}>
            {formattedSalary} {offer.currency}
          </Text>
        </View>
        <View style={styles.probationArea}>
          <Text style={styles.salaryLabel}>THỬ VIỆC</Text>
          <Text style={styles.probationValue}>
            {offer.probationDurationMonths} tháng ({offer.probationSalaryPercentage}%)
          </Text>
        </View>
      </View>

      {/* Details List */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color="#64748b" />
          <Text style={styles.detailText}>
            Ngày bắt đầu: <Text style={styles.detailBold}>{formatDate(offer.startDate)}</Text>
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={14} color="#64748b" />
          <Text style={styles.detailText}>
            Hạn chót: <Text style={styles.detailBold}>{formatDate(offer.expirationDate)}</Text>{' '}
            <Text style={isExpired ? styles.daysLeftExpired : styles.daysLeftPending}>
              ({getDaysLeft(offer.expirationDate)})
            </Text>
          </Text>
        </View>
      </View>

      {/* Card Action Footer */}
      <View style={styles.footerRow}>
        <Text style={styles.sentDateText}>
          Gửi ngày {offer.sentAt ? formatDate(offer.sentAt) : 'Gần đây'}
        </Text>

        <Pressable
          style={[
            styles.openBtn,
            canRespond ? styles.openBtnActive : styles.openBtnDefault,
          ]}
          onPress={onOpen}
        >
          <Text
            style={[
              styles.openBtnText,
              canRespond ? styles.openBtnTextActive : styles.openBtnTextDefault,
            ]}
          >
            {canRespond ? 'Xem Thư mời & Phản hồi' : 'Xem Thư mời'}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={13}
            color={canRespond ? '#ffffff' : '#334155'}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  titleArea: {
    flex: 1,
  },
  deptText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 14,
    borderWidth: 1,
  },
  badgeExpired: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  badgeExpiredText: {
    color: '#c2410c',
    fontSize: 10.5,
    fontWeight: '700',
  },
  badgeAccepted: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  badgeAcceptedText: {
    color: '#059669',
    fontSize: 10.5,
    fontWeight: '700',
  },
  badgeDeclined: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  badgeDeclinedText: {
    color: '#e11d48',
    fontSize: 10.5,
    fontWeight: '700',
  },
  badgePending: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  badgePendingText: {
    color: '#b45309',
    fontSize: 10.5,
    fontWeight: '700',
  },
  salaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 4,
  },
  salaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.3,
  },
  salaryValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#047857',
    marginTop: 2,
  },
  probationArea: {
    alignItems: 'flex-end',
  },
  probationValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 2,
  },
  detailsRow: {
    marginTop: 12,
    gap: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#64748b',
  },
  detailBold: {
    fontWeight: '700',
    color: '#1e293b',
  },
  daysLeftExpired: {
    color: '#c2410c',
    fontWeight: '700',
  },
  daysLeftPending: {
    color: '#b45309',
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  sentDateText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  openBtnActive: {
    backgroundColor: '#0f172a',
  },
  openBtnDefault: {
    backgroundColor: '#f1f5f9',
  },
  openBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  openBtnTextActive: {
    color: '#ffffff',
  },
  openBtnTextDefault: {
    color: '#334155',
  },
});
