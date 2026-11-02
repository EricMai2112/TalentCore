import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CandidateApplicationItem, PipelineStageInfo } from '../../../types/application.types';

interface ApplicationCardItemProps {
  app: CandidateApplicationItem;
}

export const getLocalizedStageName = (name: string): string => {
  const n = (name || '').trim().toLowerCase();
  if (n === 'applied' || n === 'ứng tuyển' || n === 'nộp hồ sơ' || n === 'nộp đơn') return 'Ứng tuyển';
  if (n === 'screening' || n === 'sơ loại') return 'Sơ loại';
  if (n === 'department review' || n.includes('chuyên môn') || n.includes('phòng ban')) return 'Đánh giá chuyên môn';
  if (n === 'interview' || n === 'phỏng vấn') return 'Phỏng vấn';
  if (n === 'offer' || n === 'đề nghị') return 'Đề nghị nhận việc';
  if (n === 'hired' || n === 'trúng tuyển' || n === 'nhận việc') return 'Trúng tuyển';
  return name;
};

const DEFAULT_PIPELINE_STAGES: PipelineStageInfo[] = [
  { _id: 'default-applied', name: 'Ứng tuyển', order: 1, color: '#3b82f6' },
  { _id: 'default-screening', name: 'Sơ loại', order: 2, color: '#f59e0b' },
  { _id: 'default-dept', name: 'Đánh giá chuyên môn', order: 3, color: '#6366f1' },
  { _id: 'default-interview', name: 'Phỏng vấn', order: 4, color: '#ec4899' },
  { _id: 'default-offer', name: 'Đề nghị nhận việc', order: 5, color: '#10b981' },
  { _id: 'default-hired', name: 'Trúng tuyển', order: 6, color: '#8b5cf6' },
];

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

  const pipelineStages =
    app.stages && app.stages.length > 0 ? app.stages : DEFAULT_PIPELINE_STAGES;
  const sortedStages = [...pipelineStages].sort((a, b) => a.order - b.order);

  const activeIdx =
    app.currentStageIndex !== undefined && app.currentStageIndex >= 0
      ? app.currentStageIndex
      : 0;

  const statusLower = (app.status || '').toLowerCase();
  const reviewStatusLower = (app.reviewStatus || '').toLowerCase();
  const stageNameLower = (app.stageName || '').toLowerCase();
  const isRejected =
    statusLower === 'rejected' ||
    reviewStatusLower === 'rejected' ||
    stageNameLower.includes('từ chối') ||
    stageNameLower.includes('reject');
  const isHired = statusLower === 'hired';

  const currentStageName = getLocalizedStageName(
    sortedStages[activeIdx]?.name || app.stageName || 'Ứng tuyển'
  );

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
  const rejectedDate = formatDate(app.rejectedAt || app.updatedAt || app.appliedAt);

  const getStageColor = () => {
    if (isRejected) return { bg: '#fff1f2', text: '#e11d48', border: '#fecdd3' };
    if (isHired) return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
    if (stageNameLower.includes('offer') || stageNameLower.includes('nhận việc') || stageNameLower.includes('đề nghị')) {
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

  const getShortStageName = (name: string): string => {
    const n = (name || '').trim().toLowerCase();
    if (n === 'applied' || n.includes('ứng tuyển') || n.includes('nộp')) return 'Ứng tuyển';
    if (n === 'screening' || n.includes('sơ loại')) return 'Sơ loại';
    if (n === 'department review' || n.includes('chuyên môn')) return 'Chuyên môn';
    if (n === 'interview' || n.includes('phỏng vấn')) return 'Phỏng vấn';
    if (n === 'offer' || n.includes('đề nghị')) return 'Đề nghị';
    if (n === 'hired' || n.includes('trúng tuyển')) return 'Trúng tuyển';
    if (name.length > 7) {
      return name.split(' ')[0];
    }
    return name;
  };

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
            {isRejected ? 'Đã từ chối' : isHired ? 'Đã trúng tuyển' : currentStageName}
          </Text>
        </View>
      </View>

      {/* Segmented Progress Bar Timeline Container (No horizontal scroll) */}
      <View style={styles.stepperContainer}>
        {/* Stepper Header Summary */}
        <View style={styles.stepperHeader}>
          <View style={styles.stepperHeaderLeft}>
            <View
              style={[
                styles.stepperDot,
                isRejected && { backgroundColor: '#ef4444' },
                isHired && { backgroundColor: '#10b981' },
              ]}
            />
            <Text style={styles.stepperHeaderTitle}>Tiến trình tuyển dụng</Text>
          </View>
          <View
            style={[
              styles.stepperHeaderBadge,
              isRejected
                ? styles.badgeRejected
                : isHired
                ? styles.badgeHired
                : styles.badgeActive,
            ]}
          >
            <Text
              style={[
                styles.stepperHeaderBadgeText,
                isRejected
                  ? styles.badgeTextRejected
                  : isHired
                  ? styles.badgeTextHired
                  : styles.badgeTextActive,
              ]}
              numberOfLines={1}
            >
              {isRejected
                ? `Dừng tại vòng ${activeIdx + 1}/${sortedStages.length}`
                : isHired
                ? `Hoàn thành ${sortedStages.length}/${sortedStages.length}`
                : `Vòng ${activeIdx + 1}/${sortedStages.length}`}
            </Text>
          </View>
        </View>

        {/* Segmented Bars */}
        <View style={styles.segmentsRow}>
          {sortedStages.map((stage, idx) => {
            let segState: 'completed' | 'current' | 'rejected' | 'upcoming' = 'upcoming';

            if (isHired) {
              segState = 'completed';
            } else if (idx < activeIdx) {
              segState = 'completed';
            } else if (idx === activeIdx) {
              segState = isRejected ? 'rejected' : 'current';
            } else {
              segState = 'upcoming';
            }

            return (
              <View
                key={stage._id || idx}
                style={[
                  styles.segment,
                  segState === 'completed' && styles.segCompleted,
                  segState === 'current' && styles.segCurrent,
                  segState === 'rejected' && styles.segRejected,
                  segState === 'upcoming' && styles.segUpcoming,
                ]}
              />
            );
          })}
        </View>

        {/* Labels under segments */}
        <View style={styles.labelsRow}>
          {sortedStages.map((stage, idx) => {
            const isCurrent = idx === activeIdx && !isRejected && !isHired;
            const isPast = idx < activeIdx || isHired;
            const isCurrentRejected = idx === activeIdx && isRejected;

            return (
              <View key={stage._id || idx} style={styles.labelCol}>
                <Text
                  style={[
                    styles.labelIdxText,
                    isPast && styles.labelTextPast,
                    isCurrent && styles.labelTextCurrent,
                    isCurrentRejected && styles.labelTextRejected,
                  ]}
                  numberOfLines={1}
                >
                  {idx + 1}
                </Text>
                <Text
                  style={[
                    styles.labelNameText,
                    isPast && styles.labelTextPast,
                    isCurrent && styles.labelTextCurrent,
                    isCurrentRejected && styles.labelTextRejected,
                  ]}
                  numberOfLines={1}
                >
                  {getShortStageName(stage.name)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Detailed Current Stage Card */}
        <View
          style={[
            styles.statusCard,
            isRejected
              ? styles.statusCardRejected
              : isHired
              ? styles.statusCardHired
              : styles.statusCardActive,
          ]}
        >
          <View style={styles.statusCardIconBox}>
            {isRejected ? (
              <Ionicons name="close-circle" size={18} color="#e11d48" />
            ) : isHired ? (
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
            ) : (
              <Ionicons name="time" size={18} color="#2563eb" />
            )}
          </View>
          <View style={styles.statusCardContent}>
            <Text
              style={[
                styles.statusCardTitle,
                isRejected
                  ? styles.statusCardTitleRejected
                  : isHired
                  ? styles.statusCardTitleHired
                  : styles.statusCardTitleActive,
              ]}
              numberOfLines={1}
            >
              {isRejected
                ? `Dừng tại vòng ${activeIdx + 1}: ${currentStageName}`
                : isHired
                ? 'Đã trúng tuyển tất cả các vòng'
                : `Vòng ${activeIdx + 1}: ${currentStageName}`}
            </Text>
            <Text
              style={[
                styles.statusCardDesc,
                isRejected
                  ? styles.statusCardDescRejected
                  : isHired
                  ? styles.statusCardDescHired
                  : styles.statusCardDescActive,
              ]}
              numberOfLines={2}
            >
              {isRejected
                ? (rejectedDate ? `Hồ sơ dừng ứng tuyển vào ngày ${rejectedDate}.` : 'Hồ sơ đã dừng ứng tuyển tại vòng này.')
                : isHired
                ? 'Chúc mừng bạn đã hoàn thành xuất sắc toàn bộ quy trình tuyển dụng!'
                : 'Hồ sơ đang được xét duyệt. Vui lòng theo dõi email và lịch phỏng vấn.'}
            </Text>
          </View>
        </View>
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.footerDateWrap}>
          <Text style={styles.footerDateLabel}>
            Ngày ứng tuyển: <Text style={styles.footerDateValue}>{step1Date}</Text>
          </Text>
          {isRejected && (
            <Text style={styles.footerRejectedDate}>
              Ngày từ chối: <Text style={styles.footerRejectedDateValue}>{rejectedDate}</Text>
            </Text>
          )}
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

  // Segmented Progress Stepper Container
  stepperContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  stepperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  stepperHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563eb',
  },
  stepperHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  stepperHeaderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  badgeActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  badgeRejected: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  badgeHired: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  stepperHeaderBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: '#1d4ed8',
  },
  badgeTextRejected: {
    color: '#e11d48',
  },
  badgeTextHired: {
    color: '#059669',
  },

  // Segments Bar
  segmentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  segCompleted: {
    backgroundColor: '#2563eb',
  },
  segCurrent: {
    backgroundColor: '#2563eb',
  },
  segRejected: {
    backgroundColor: '#ef4444',
  },
  segUpcoming: {
    backgroundColor: '#e2e8f0',
  },

  // Labels Row under segments
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    marginTop: 6,
    marginBottom: 10,
  },
  labelCol: {
    flex: 1,
    alignItems: 'center',
  },
  labelIdxText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 1,
  },
  labelNameText: {
    fontSize: 9.5,
    color: '#94a3b8',
    textAlign: 'center',
  },
  labelTextPast: {
    color: '#334155',
    fontWeight: '600',
  },
  labelTextCurrent: {
    color: '#1d4ed8',
    fontWeight: '800',
  },
  labelTextRejected: {
    color: '#e11d48',
    fontWeight: '800',
  },

  // Status Card below Segmented Bar
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
  },
  statusCardActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  statusCardRejected: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  statusCardHired: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  statusCardIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCardContent: {
    flex: 1,
  },
  statusCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusCardTitleActive: {
    color: '#1e40af',
  },
  statusCardTitleRejected: {
    color: '#9f1239',
  },
  statusCardTitleHired: {
    color: '#065f46',
  },
  statusCardDesc: {
    fontSize: 10.5,
    lineHeight: 14,
  },
  statusCardDescActive: {
    color: '#3b82f6',
  },
  statusCardDescRejected: {
    color: '#be123c',
  },
  statusCardDescHired: {
    color: '#059669',
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
  footerRejectedDate: {
    fontSize: 11,
    color: '#e11d48',
    fontWeight: '500',
    marginTop: 2,
  },
  footerRejectedDateValue: {
    color: '#e11d48',
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
