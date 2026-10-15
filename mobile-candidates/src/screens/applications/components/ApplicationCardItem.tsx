import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CandidateApplicationItem } from '../../../types/application.types';

interface ApplicationCardItemProps {
  app: CandidateApplicationItem;
}

export const ApplicationCardItem: React.FC<ApplicationCardItemProps> = ({ app }) => {
  const router = useRouter();
  const job = app.jobDescriptionId;
  const deptName =
    typeof job?.departmentId === 'object'
      ? job?.departmentId?.name
      : 'Engineering';
  const location = job?.location || 'Hồ Chí Minh';

  const formatSalary = (min?: number, max?: number, fallback?: string): string => {
    if (!min && !max) return fallback || 'Thương lượng';
    if (min && max) {
      if (min >= 1000000) {
        return `${(min / 1000000).toLocaleString('vi-VN')} - ${(max / 1000000).toLocaleString('vi-VN')} triệu VNĐ`;
      }
      return `${min.toLocaleString('vi-VN')} - ${max.toLocaleString('vi-VN')} VNĐ`;
    }
    if (min) {
      if (min >= 1000000) return `Từ ${(min / 1000000).toLocaleString('vi-VN')} triệu VNĐ`;
      return `Từ ${min.toLocaleString('vi-VN')} VNĐ`;
    }
    return fallback || 'Thương lượng';
  };

  const salary = formatSalary(job?.minimumSalary, job?.maximumSalary, job?.salaryRange);

  const activeIdx =
    app.currentStageIndex !== undefined && app.currentStageIndex >= 0
      ? app.currentStageIndex
      : 0;

  const statusLower = ((app as any).status || '').toLowerCase();
  const reviewStatusLower = ((app as any).reviewStatus || '').toLowerCase();
  const stageNameLower = (app.stageName || '').toLowerCase();
  const isRejected =
    statusLower === 'rejected' ||
    reviewStatusLower === 'rejected' ||
    stageNameLower.includes('từ chối') ||
    stageNameLower.includes('reject');

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const step1Date = formatDate(app.appliedAt);
  const rejectedDate = formatDate(
    (app as any).rejectedAt || (app as any).updatedAt || app.appliedAt
  );

  // Step 2 ("NTD đã xem"): reached if activeIdx >= 1 or if moved past initial stage
  const isStep2Active =
    activeIdx >= 1 ||
    (stageNameLower !== 'applied' && stageNameLower !== 'mới' && stageNameLower !== 'mới ứng tuyển');

  // Step 3 ("Phỏng vấn" / "Đã xác nhận"): reached if activeIdx >= 3 or interview/offer stage
  const isStep3Confirmed =
    !isRejected &&
    (activeIdx >= 3 ||
      stageNameLower.includes('interview') ||
      stageNameLower.includes('phỏng vấn') ||
      stageNameLower.includes('offer'));

  const getStageColor = () => {
    if (isRejected) return { bg: '#fff1f2', text: '#e11d48', border: '#fecdd3' };
    if (stageNameLower.includes('offer') || stageNameLower.includes('nhận việc')) {
      return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
    }
    if (stageNameLower.includes('phỏng vấn') || stageNameLower.includes('interview')) {
      return { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff' };
    }
    if (stageNameLower.includes('chuyên môn') || stageNameLower.includes('department')) {
      return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
    }
    return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
  };

  const stageTheme = getStageColor();

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Ionicons name="briefcase-outline" size={20} color="#4f46e5" />
        </View>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {job?.title || 'Vị trí công việc'}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText} numberOfLines={1}>
              {deptName} • {location}
            </Text>
          </View>
          <View style={styles.salaryRow}>
            <Ionicons name="cash-outline" size={14} color="#059669" />
            <Text style={styles.salaryText}>{salary}</Text>
          </View>
        </View>
        <View
          style={[
            styles.stageBadge,
            { backgroundColor: stageTheme.bg, borderColor: stageTheme.border },
          ]}
        >
          <Text style={[styles.stageBadgeText, { color: stageTheme.text }]}>
            {isRejected ? 'Đã từ chối' : app.stageName || 'Mới ứng tuyển'}
          </Text>
        </View>
      </View>

      {/* 3-Step CV Stepper Progress Bar */}
      <View style={styles.stepperContainer}>
        <View style={styles.stepperRow}>
          {/* Step 1: Đã ứng tuyển */}
          <View style={styles.stepCol}>
            <View style={[styles.stepCircle, styles.circleActive]}>
              <Ionicons name="checkmark" size={16} color="#ffffff" />
            </View>
            <Text style={styles.stepTitleActive}>Đã ứng tuyển</Text>
            {!!step1Date && <Text style={styles.stepDateText}>{step1Date}</Text>}
          </View>

          {/* Line 1 -> 2 */}
          <View style={styles.lineCol}>
            <View
              style={[
                styles.stepLine,
                isStep2Active ? styles.lineActive : styles.lineInactive,
              ]}
            />
          </View>

          {/* Step 2: NTD đã xem */}
          <View style={styles.stepCol}>
            {isStep2Active ? (
              <View style={[styles.stepCircle, styles.circleActive]}>
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              </View>
            ) : (
              <View style={[styles.stepCircle, styles.circlePending]}>
                <Ionicons name="time-outline" size={15} color="#94a3b8" />
              </View>
            )}
            <Text style={isStep2Active ? styles.stepTitleActive : styles.stepTitleInactive}>
              NTD đã xem
            </Text>
          </View>

          {/* Line 2 -> 3 */}
          <View style={styles.lineCol}>
            <View
              style={[
                styles.stepLine,
                isRejected
                  ? styles.lineRejected
                  : isStep3Confirmed
                  ? styles.lineActive
                  : styles.lineInactive,
              ]}
            />
          </View>

          {/* Step 3: Chờ phản hồi / Đã xác nhận / Đã từ chối */}
          <View style={styles.stepCol}>
            {isRejected ? (
              <>
                <View style={[styles.stepCircle, styles.circleRejected]}>
                  <Ionicons name="close" size={16} color="#ef4444" />
                </View>
                <Text style={styles.stepTitleRejected}>Đã từ chối</Text>
                {!!rejectedDate && <Text style={styles.stepDateRejected}>{rejectedDate}</Text>}
              </>
            ) : isStep3Confirmed ? (
              <>
                <View style={[styles.stepCircle, styles.circleActive]}>
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                </View>
                <Text style={styles.stepTitleActive}>Đã xác nhận</Text>
                {!!rejectedDate && <Text style={styles.stepDateText}>{rejectedDate}</Text>}
              </>
            ) : (
              <>
                <View style={[styles.stepCircle, styles.circlePending]}>
                  <Ionicons name="time-outline" size={15} color="#94a3b8" />
                </View>
                <Text style={styles.stepTitleInactive}>Chờ phản hồi</Text>
                <Text style={styles.stepDateText}>Đang chờ</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.footerDateWrap}>
          <Text style={styles.footerDateLabel}>
            Ngày ứng tuyển: <Text style={styles.footerDateValue}>{step1Date}</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => {
            if (job?._id) {
              router.push(`/job/${job._id}` as any);
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.detailBtnText}>Xem chi tiết</Text>
          <Ionicons name="arrow-forward" size={14} color="#4f46e5" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
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
    gap: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 20,
  },
  metaRow: {
    marginTop: 3,
  },
  metaText: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '500',
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  salaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  stageBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },

  // 3-Step Stepper
  stepperContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepCol: {
    alignItems: 'center',
    width: 78,
  },
  lineCol: {
    flex: 1,
    paddingTop: 14,
  },
  stepLine: {
    height: 2,
    width: '100%',
  },
  lineActive: {
    backgroundColor: '#2563eb',
  },
  lineInactive: {
    backgroundColor: '#e2e8f0',
  },
  lineRejected: {
    backgroundColor: '#fca5a5',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  circleActive: {
    backgroundColor: '#2563eb',
  },
  circlePending: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  circleRejected: {
    backgroundColor: '#ffe4e6',
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  stepTitleActive: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  stepTitleInactive: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
  },
  stepTitleRejected: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e11d48',
    textAlign: 'center',
  },
  stepDateText: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
    textAlign: 'center',
  },
  stepDateRejected: {
    fontSize: 10,
    color: '#f43f5e',
    marginTop: 2,
    textAlign: 'center',
  },

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerDateWrap: {
    flex: 1,
  },
  footerDateLabel: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '500',
  },
  footerDateValue: {
    color: '#1e293b',
    fontWeight: '700',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  detailBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f46e5',
  },
});
