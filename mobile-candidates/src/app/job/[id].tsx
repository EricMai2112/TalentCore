import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { jobService } from '../../services/job.service';
import { JobItem } from '../../types/job.types';

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [job, setJob] = useState<JobItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await jobService.getJobById(id);
        if (isMounted) {
          setJob(data);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleShare = async () => {
    if (!job) return;
    try {
      await Share.share({
        message: `Khám phá cơ hội nghề nghiệp: ${job.title} tại TalentCore Ecosystem. Mức lương: ${job.salaryDisplay}.`,
        title: job.title,
      });
    } catch {}
  };

  const handleApply = () => {
    if (!job) return;
    if (applied) {
      Alert.alert('Thông báo', 'Bạn đã nộp hồ sơ ứng tuyển vị trí này rồi!');
      return;
    }

    Alert.alert(
      'Xác nhận ứng tuyển',
      `Bạn có chắc chắn muốn nộp hồ sơ ứng tuyển vị trí "${job.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Nộp hồ sơ ngay',
          onPress: () => {
            setApplied(true);
            Alert.alert(
              'Thành công',
              'Đơn ứng tuyển của bạn đã được gửi thành công! Nhà tuyển dụng sẽ liên hệ sớm nhất.'
            );
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <SafeAreaView style={styles.loadingHeader}>
          <Pressable style={styles.iconCircleBtn} onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </Pressable>
        </SafeAreaView>
        <View style={styles.loadingBody}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Đang tải chi tiết công việc...</Text>
        </View>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.loadingContainer}>
        <SafeAreaView style={styles.loadingHeader}>
          <Pressable style={styles.iconCircleBtn} onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </Pressable>
        </SafeAreaView>
        <View style={styles.loadingBody}>
          <Ionicons name="alert-circle-outline" size={54} color="#94a3b8" />
          <Text style={styles.notFoundTitle}>Không tìm thấy công việc</Text>
          <Text style={styles.notFoundSubtitle}>
            Vị trí tuyển dụng này có thể đã dừng nhận hồ sơ hoặc không tồn tại.
          </Text>
          <Pressable style={styles.backHomeBtn} onPress={() => router.back()}>
            <Text style={styles.backHomeBtnText}>Quay lại danh sách</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isUrgent = job.priority === 'HIGH' || job.priority === 'URGENT';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.topSafeArea}>
        <View style={styles.headerBar}>
          <Pressable style={styles.iconCircleBtn} onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </Pressable>

          <Text style={styles.headerTitle} numberOfLines={1}>
            Chi tiết công việc
          </Text>

          <View style={styles.headerRightActions}>
            <Pressable
              style={styles.iconCircleBtn}
              onPress={() => setIsSaved(!isSaved)}
              hitSlop={10}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isSaved ? '#7c3aed' : '#0f172a'}
              />
            </Pressable>

            <Pressable style={styles.iconCircleBtn} onPress={handleShare} hitSlop={10}>
              <Ionicons name="share-social-outline" size={20} color="#0f172a" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.overviewCard}>
          <View style={styles.companyRow}>
            <View style={styles.companyLogoBox}>
              <Image
                source={require('../../../assets/images/favicon-talentcore.png')}
                style={styles.companyFavicon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.companyInfoText}>
              <Text style={styles.companyName}>TalentCore</Text>
              <View style={styles.tagBadgeRow}>
                <View style={styles.deptBadge}>
                  <Text style={styles.deptBadgeText}>{job.department}</Text>
                </View>
                {isUrgent && (
                  <View style={styles.urgentBadge}>
                    <Ionicons name="flame" size={12} color="#e11d48" />
                    <Text style={styles.urgentBadgeText}>Ưu tiên gấp</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <Text style={styles.jobTitle}>{job.title}</Text>

          <View style={styles.salaryContainer}>
            <Text style={styles.salaryLabel}>Mức lương:</Text>
            <Text style={styles.salaryValue}>{job.salaryDisplay || 'Thỏa thuận'}</Text>
          </View>

          <View style={styles.metaLayoutGrid}>
            <View style={styles.metaBadge}>
              <Ionicons name="ribbon-outline" size={15} color="#6366f1" />
              <View style={styles.metaTextCol}>
                <Text style={styles.metaBadgeLabel}>Cấp bậc</Text>
                <Text style={styles.metaBadgeValue} numberOfLines={1}>
                  {job.level}
                </Text>
              </View>
            </View>

            <View style={styles.metaBadge}>
              <Ionicons name="location-outline" size={15} color="#2563eb" />
              <View style={styles.metaTextCol}>
                <Text style={styles.metaBadgeLabel}>Địa điểm</Text>
                <Text style={styles.metaBadgeValue} numberOfLines={1}>
                  {job.location}
                </Text>
              </View>
            </View>

            <View style={styles.metaBadge}>
              <Ionicons name="briefcase-outline" size={15} color="#059669" />
              <View style={styles.metaTextCol}>
                <Text style={styles.metaBadgeLabel}>Hình thức</Text>
                <Text style={styles.metaBadgeValue} numberOfLines={1}>
                  {job.workType}
                </Text>
              </View>
            </View>

            <View style={styles.metaBadge}>
              <Ionicons name="time-outline" size={15} color="#d97706" />
              <View style={styles.metaTextCol}>
                <Text style={styles.metaBadgeLabel}>Đăng lúc</Text>
                <Text style={styles.metaBadgeValue} numberOfLines={1}>
                  {job.postedTime}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {job.skills && job.skills.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="code-slash-outline" size={20} color="#7c3aed" />
              <Text style={styles.sectionTitle}>Kỹ năng chuyên môn</Text>
            </View>
            <View style={styles.skillsWrapper}>
              {job.skills.map((skill, index) => (
                <View key={index} style={styles.skillChip}>
                  <Text style={styles.skillChipText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="document-text-outline" size={20} color="#2563eb" />
            <Text style={styles.sectionTitle}>Mô tả công việc</Text>
          </View>
          <Text style={styles.sectionBodyText}>
            {job.description ||
              `• Phụ trách thực hiện các nhiệm vụ chuyên môn theo tiêu chuẩn công nghệ của TalentCore.\n• Tham gia nghiên cứu, đề xuất giải pháp kỹ thuật và tối ưu hóa hiệu năng hệ thống.\n• Phối hợp chặt chẽ cùng các thành viên trong đội ngũ Product, Design và Engineering để phát triển các tính năng mới.\n• Đảm bảo chất lượng sản phẩm, tính bảo mật và trải nghiệm tối ưu cho người dùng.`}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#059669" />
            <Text style={styles.sectionTitle}>Yêu cầu ứng viên</Text>
          </View>
          <Text style={styles.sectionBodyText}>
            {job.requirements ||
              `• Tốt nghiệp Đại học, Cao đẳng chuyên ngành liên quan hoặc có kinh nghiệm tương đương.\n• Nắm vững kiến thức chuyên môn và có kinh nghiệm thực tế với các công cụ, kỹ năng yêu cầu.\n• Tư duy giải quyết vấn đề tốt, chủ động trong công việc và có tinh thần trách nhiệm cao.\n• Khả năng làm việc độc lập cũng như phối hợp nhóm hiệu quả, sẵn sàng tiếp thu công nghệ mới.`}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="gift-outline" size={20} color="#ea580c" />
            <Text style={styles.sectionTitle}>Quyền lợi & Đãi ngộ</Text>
          </View>
          <Text style={styles.sectionBodyText}>
            {job.benefits ||
              `• Mức thu nhập cạnh tranh, xứng đáng với năng lực và kinh nghiệm đóng góp.\n• Thưởng hiệu quả dự án, thưởng tháng 13 và các chế độ phúc lợi định kỳ.\n• Đóng đầy đủ BHXH, BHYT, BHTN theo quy định nhà nước và gói bảo hiểm sức khỏe nâng cao.\n• Môi trường làm việc hiện đại, chuyên nghiệp, cơ hội thăng tiến và đào tạo phát triển liên tục.`}
          </Text>
        </View>

        <View style={styles.companyCard}>
          <View style={styles.companyCardHeader}>
            <Ionicons name="business-outline" size={20} color="#64748b" />
            <Text style={styles.companyCardTitle}>Giới thiệu TalentCore</Text>
          </View>
          <Text style={styles.companyCardDesc}>
            TalentCore là hệ thống tuyển dụng và quản trị nhân tài thông minh, kết nối những cơ hội nghề nghiệp hàng đầu với các ứng viên tiềm năng trên khắp cả nước.
          </Text>
        </View>
      </ScrollView>

      <SafeAreaView style={styles.bottomBarWrapper}>
        <View style={styles.bottomBar}>
          <Pressable
            style={[styles.saveBottomBtn, isSaved && styles.saveBottomBtnActive]}
            onPress={() => setIsSaved(!isSaved)}
            hitSlop={10}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isSaved ? '#7c3aed' : '#334155'}
            />
          </Pressable>

          <Pressable
            style={styles.applyBtn}
            onPress={handleApply}
          >
            <LinearGradient
              colors={applied ? ['#059669', '#10b981'] : ['#7c3aed', '#6366f1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyBtnGradient}
            >
              <Ionicons
                name={applied ? 'checkmark-circle' : 'paper-plane'}
                size={18}
                color="#ffffff"
                style={styles.applyIcon}
              />
              <Text style={styles.applyBtnText}>
                {applied ? 'Đã nộp hồ sơ' : 'Ứng tuyển ngay'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
  },
  notFoundSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  backHomeBtn: {
    marginTop: 12,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backHomeBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  topSafeArea: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  overviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  companyLogoBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyFavicon: {
    width: 32,
    height: 32,
  },
  companyInfoText: {
    flex: 1,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  tagBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deptBadge: {
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  deptBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  urgentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e11d48',
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 28,
    marginBottom: 14,
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#dcfce7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    gap: 6,
  },
  salaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803d',
  },
  salaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16a34a',
    letterSpacing: 0.2,
  },
  metaLayoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaBadge: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 8,
  },
  metaTextCol: {
    flex: 1,
  },
  metaBadgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 1,
  },
  metaBadgeValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionBodyText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  skillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#f3e8ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
  },
  companyCard: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 16,
  },
  companyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  companyCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  companyCardDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  bottomBarWrapper: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    backgroundColor: '#ffffff',
  },
  saveBottomBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  saveBottomBtnActive: {
    backgroundColor: '#f5f3ff',
    borderColor: '#ddd6fe',
  },
  applyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
  },
  applyBtnGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyIcon: {
    marginRight: 2,
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
});
