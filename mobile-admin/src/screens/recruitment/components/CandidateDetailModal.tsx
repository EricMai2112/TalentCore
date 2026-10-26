import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CandidateApplication,
  adminService,
} from '../../../services/admin.services';

interface StageItem {
  _id: string;
  name: string;
  color?: string;
}

interface CandidateDetailModalProps {
  visible: boolean;
  candidate: CandidateApplication | null;
  onClose: () => void;
  stages: StageItem[];
  onStageChange: (candidateId: string, newStageId: string, stageName: string) => Promise<void>;
  onReject: (candidate: CandidateApplication) => void;
  onNoteAdded?: () => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  visible,
  candidate,
  onClose,
  stages,
  onStageChange,
  onReject,
  onNoteAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'evaluation' | 'profile'>('overview');
  const [appData, setAppData] = useState<CandidateApplication | null>(candidate);
  const [newNote, setNewNote] = useState<string>('');
  const [addingNote, setAddingNote] = useState<boolean>(false);
  const [showStagePicker, setShowStagePicker] = useState<boolean>(false);
  const [changingStage, setChangingStage] = useState<boolean>(false);

  // Fetch full application detail on open to get all profile fields (projects, certifications, etc.)
  useEffect(() => {
    if (candidate) {
      setAppData(candidate);
      let isMounted = true;
      adminService
        .getApplicationById(candidate._id)
        .then((res) => {
          if (isMounted && res && res._id) {
            setAppData((prev) => ({ ...(prev || candidate), ...res }));
          }
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [candidate?._id]);

  if (!candidate && !appData) return null;

  const currentApp = appData || candidate!;
  const candidateInfo = currentApp.candidateId as any;
  const userInfo = candidateInfo?.userId;
  const jobInfo = currentApp.jobDescriptionId as any;
  const aiEval = currentApp.aiEvaluation as any;

  const name =
    userInfo?.name ||
    candidateInfo?.fullName ||
    candidateInfo?.profileName ||
    'Ứng viên';
  const email = userInfo?.email || candidateInfo?.email || '';
  const phone = userInfo?.phone || candidateInfo?.phone || '';
  const avatar = userInfo?.avatar || candidateInfo?.avatar;
  const headline = candidateInfo?.headline || candidateInfo?.currentLevel || 'Chuyên viên';
  const address = candidateInfo?.address;
  const resumeUrl = candidateInfo?.resumeUrl;

  const deptName =
    typeof jobInfo?.departmentId === 'object'
      ? jobInfo?.departmentId?.name
      : jobInfo?.departmentName || 'Phòng ban';
  const jobTitle = jobInfo?.title || 'Vị trí tuyển dụng';

  const aiScore = currentApp.aiFitScore ?? aiEval?.matchingScore ?? aiEval?.aiFitScore ?? 0;
  const isMissingMandatory = Boolean(currentApp.isMissingMandatory || aiEval?.isMissingMandatory);

  const initial = (name.trim().charAt(0) || 'U').toUpperCase();

  const stripHtml = (html?: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').trim();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Hôm nay';
    try {
      const d = new Date(dateStr);
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // Mở CV
  const handleOpenResume = async () => {
    if (!resumeUrl) {
      Alert.alert('Thông báo', 'Ứng viên chưa đính kèm liên kết CV.');
      return;
    }
    try {
      const supported = await Linking.canOpenURL(resumeUrl);
      if (supported) {
        await Linking.openURL(resumeUrl);
      } else {
        Alert.alert('Lỗi', 'Không thể mở liên kết CV này.');
      }
    } catch {
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi mở liên kết CV.');
    }
  };

  // Mở external link bất kỳ
  const handleOpenUrl = async (url?: string) => {
    if (!url) return;
    try {
      const target = url.startsWith('http') ? url : `https://${url}`;
      await Linking.openURL(target);
    } catch {
      Alert.alert('Lỗi', 'Không thể mở liên kết này.');
    }
  };

  // Gọi điện
  const handleCall = () => {
    if (!phone) {
      Alert.alert('Thông báo', 'Ứng viên chưa cung cấp số điện thoại.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  // Gửi email
  const handleEmail = () => {
    if (!email) {
      Alert.alert('Thông báo', 'Ứng viên chưa cung cấp địa chỉ email.');
      return;
    }
    Linking.openURL(`mailto:${email}`);
  };

  // Thêm ghi chú
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      setAddingNote(true);
      await adminService.addCandidateNote(currentApp._id, {
        authorName: 'Quản trị viên',
        authorRole: 'HR / Admin',
        content: newNote.trim(),
      });
      setNewNote('');
      Alert.alert('Thành công', 'Đã lưu ghi chú cho ứng viên!');
      if (onNoteAdded) onNoteAdded();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể lưu ghi chú');
    } finally {
      setAddingNote(false);
    }
  };

  // Đổi Stage
  const handleSelectStage = async (stage: StageItem) => {
    try {
      setChangingStage(true);
      await onStageChange(currentApp._id, stage._id, stage.name);
      setShowStagePicker(false);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể chuyển giai đoạn');
    } finally {
      setChangingStage(false);
    }
  };

  // Score colors
  const getScoreTheme = (score: number) => {
    if (score >= 70) {
      return {
        text: '#059669',
        border: '#10B981',
        bg: '#ECFDF5',
        badgeBg: '#ECFDF5',
        badgeText: '#059669',
        badgeBorder: '#A7F3D0',
      };
    }
    if (score >= 50) {
      return {
        text: '#D97706',
        border: '#F59E0B',
        bg: '#FFFBEB',
        badgeBg: '#FEF3C7',
        badgeText: '#D97706',
        badgeBorder: '#FDE68A',
      };
    }
    return {
      text: '#DC2626',
      border: '#EF4444',
      bg: '#FEF2F2',
      badgeBg: '#FEE2E2',
      badgeText: '#DC2626',
      badgeBorder: '#FECACA',
    };
  };

  const scoreTheme = getScoreTheme(aiScore);

  // Key strengths & gaps
  const strengths: string[] =
    aiEval?.keyStrengths ||
    aiEval?.strengths || [
      'Thành thạo kỹ năng chuyên môn cần thiết.',
      'Có kinh nghiệm thực hành dự án thực tế.',
    ];

  const gaps: string[] =
    aiEval?.potentialGaps ||
    aiEval?.weaknesses ||
    aiEval?.missingSkills || [
      'Có thể cần bổ sung kinh nghiệm về quy trình doanh nghiệp.',
    ];

  const suggestedQuestions: string[] =
    aiEval?.suggestedQuestions || [
      `Bạn đã ứng dụng kiến thức ${jobTitle} như thế nào trong dự án gần nhất?`,
    ];

  const warnings: string[] = aiEval?.warnings || [];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
        {/* FIXED HEIGHT 92% - Tránh nhảy chiều cao làm giật màn hình khi chuyển tab */}
        <View style={styles.modalSheet}>
          <View style={styles.modalDragHandle} />

          {/* ─── 1. TOP HEADER (Khớp 100% Ảnh Web) ─── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {/* Avatar Square with rounded corners */}
              <View style={styles.avatarBox}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarInitialText}>{initial}</Text>
                )}
              </View>

              <View style={styles.headerInfo}>
                {/* Tên + Badge Phòng ban */}
                <View style={styles.nameRow}>
                  <Text style={styles.nameText} numberOfLines={1}>
                    {name}
                  </Text>
                  <View style={styles.deptBadge}>
                    <Text style={styles.deptBadgeText}>{deptName}</Text>
                  </View>
                </View>

                {/* Chức danh / Headline */}
                <Text style={styles.headlineText} numberOfLines={1}>
                  {headline}
                </Text>

                {/* Ứng tuyển & Ngày nộp */}
                <View style={styles.subMetaRow}>
                  <Ionicons name="briefcase-outline" size={12} color="#64748B" />
                  <Text style={styles.subMetaText}>
                    Ứng tuyển: <Text style={styles.subMetaJobBold}>{jobTitle}</Text>
                  </Text>
                  <Text style={styles.subMetaDot}>•</Text>
                  <Ionicons name="calendar-outline" size={12} color="#64748B" />
                  <Text style={styles.subMetaText}>{formatDate(currentApp.appliedAt)}</Text>
                </View>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* ─── 2. TAB NAVIGATION (Khớp 100% Ảnh Web) ─── */}
          <View style={styles.tabBar}>
            {/* Tab 1: Tổng quan */}
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'overview' && styles.tabItemActive]}
              onPress={() => setActiveTab('overview')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="grid-outline"
                size={14}
                color={activeTab === 'overview' ? '#4F46E5' : '#64748B'}
              />
              <Text
                style={[
                  styles.tabItemText,
                  activeTab === 'overview' && styles.tabItemTextActive,
                ]}
              >
                Tổng quan
              </Text>
              <View
                style={[
                  styles.scoreTabPill,
                  { backgroundColor: scoreTheme.badgeBg, borderColor: scoreTheme.badgeBorder },
                ]}
              >
                <Text style={[styles.scoreTabPillText, { color: scoreTheme.text }]}>
                  {aiScore}%
                </Text>
              </View>
            </TouchableOpacity>

            {/* Tab 2: Đánh giá phỏng vấn */}
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'evaluation' && styles.tabItemActive]}
              onPress={() => setActiveTab('evaluation')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="clipboard-outline"
                size={14}
                color={activeTab === 'evaluation' ? '#4F46E5' : '#64748B'}
              />
              <Text
                style={[
                  styles.tabItemText,
                  activeTab === 'evaluation' && styles.tabItemTextActive,
                ]}
              >
                Đánh giá phỏng vấn
              </Text>
            </TouchableOpacity>

            {/* Tab 3: Hồ sơ ứng viên */}
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
              onPress={() => setActiveTab('profile')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="document-text-outline"
                size={14}
                color={activeTab === 'profile' ? '#4F46E5' : '#64748B'}
              />
              <Text
                style={[
                  styles.tabItemText,
                  activeTab === 'profile' && styles.tabItemTextActive,
                ]}
              >
                Hồ sơ ứng viên
              </Text>
            </TouchableOpacity>
          </View>

          {/* ─── 3. SCROLLABLE TAB CONTENT (Fills remaining height) ─── */}
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ═══════════ TAB 1: TỔNG QUAN (KHỚP 100% ẢNH WEB) ═══════════ */}
            {activeTab === 'overview' && (
              <View style={styles.overviewContainer}>
                {/* 1. Hero Card: AI Match Score & Circular Gauge */}
                <View style={styles.aiHeroCard}>
                  <View style={styles.aiHeroLeft}>
                    {/* Top Pills */}
                    <View style={styles.aiHeroBadgeRow}>
                      <View style={styles.aiMatchBadge}>
                        <Ionicons name="sparkles" size={12} color="#4F46E5" />
                        <Text style={styles.aiMatchBadgeText}>AI Match Score</Text>
                      </View>

                      {!isMissingMandatory ? (
                        <View style={styles.mandatoryBadgeSuccess}>
                          <Ionicons name="checkmark-circle" size={13} color="#059669" />
                          <Text style={styles.mandatoryBadgeTextSuccess}>
                            Đạt tiêu chí bắt buộc
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.mandatoryBadgeFail}>
                          <Ionicons name="close-circle" size={13} color="#DC2626" />
                          <Text style={styles.mandatoryBadgeTextFail}>
                            Thiếu tiêu chí bắt buộc
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Subtitle */}
                    <Text style={styles.aiHeroSub}>
                      Mức độ phù hợp với tiêu chí tuyển dụng • Đánh giá:{' '}
                      {formatDate(aiEval?.evaluatedAt || currentApp.appliedAt)}
                    </Text>
                  </View>

                  {/* Quantitative Circular Gauge Ring (Khớp Ảnh Web) */}
                  <View style={[styles.gaugeCircle, { borderColor: scoreTheme.border }]}>
                    <Text style={[styles.gaugeScoreText, { color: scoreTheme.text }]}>
                      {aiScore}
                    </Text>
                  </View>
                </View>

                {/* 2. NHẬN ĐỊNH TỔNG QUAN TỪ AI */}
                <View style={styles.aiSummaryCard}>
                  <View style={styles.cardHeaderTitleRow}>
                    <Ionicons name="document-text" size={14} color="#4F46E5" />
                    <Text style={styles.aiSummaryTitle}>NHẬN ĐỊNH TỔNG QUAN TỪ AI</Text>
                  </View>
                  <Text style={styles.aiSummaryContent}>
                    {aiEval?.summary ||
                      `Đánh giá AI: Ứng viên phù hợp tốt với các tiêu chí của vị trí ${jobTitle}. Điểm phù hợp: ${aiScore}%.`}
                  </Text>
                </View>

                {/* 3. ĐIỂM MẠNH & ĐIỂM HẠN CHẾ (Khớp Màu & Format Ảnh Web) */}
                <View style={styles.strengthsGapsContainer}>
                  {/* Card Điểm mạnh nổi bật */}
                  <View style={styles.strengthsCard}>
                    <View style={styles.cardHeaderTitleRow}>
                      <Ionicons name="checkmark-circle" size={15} color="#16A34A" />
                      <Text style={styles.strengthsTitle}>
                        ĐIỂM MẠNH NỔI BẬT ({strengths.length})
                      </Text>
                    </View>
                    <View style={styles.bulletList}>
                      {strengths.map((str, idx) => (
                        <View key={idx} style={styles.bulletRow}>
                          <Text style={styles.strengthBullet}>•</Text>
                          <Text style={styles.strengthText}>{str}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Card Điểm hạn chế / Cần lưu ý */}
                  <View style={styles.gapsCard}>
                    <View style={styles.cardHeaderTitleRow}>
                      <Ionicons name="alert-circle" size={15} color="#E11D48" />
                      <Text style={styles.gapsTitle}>
                        ĐIỂM HẠN CHẾ / CẦN LƯU Ý ({gaps.length})
                      </Text>
                    </View>
                    <View style={styles.bulletList}>
                      {gaps.map((gap, idx) => (
                        <View key={idx} style={styles.bulletRow}>
                          <Text style={styles.gapBullet}>•</Text>
                          <Text style={styles.gapText}>{gap}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                {/* 4. Cảnh báo & Rủi ro (nếu có) */}
                {(isMissingMandatory || warnings.length > 0) && (
                  <View style={styles.warningCard}>
                    <View style={styles.cardHeaderTitleRow}>
                      <Ionicons name="warning" size={15} color="#D97706" />
                      <Text style={styles.warningTitle}>
                        CẢNH BÁO & RỦI RO ĐÁNH GIÁ ({warnings.length || 1})
                      </Text>
                    </View>
                    <View style={styles.bulletList}>
                      {warnings.length > 0 ? (
                        warnings.map((w, idx) => (
                          <View key={idx} style={styles.bulletRow}>
                            <Text style={styles.warningBullet}>•</Text>
                            <Text style={styles.warningText}>{w}</Text>
                          </View>
                        ))
                      ) : (
                        <View style={styles.bulletRow}>
                          <Text style={styles.warningBullet}>•</Text>
                          <Text style={styles.warningText}>
                            Ứng viên chưa vượt qua ngưỡng điểm của tiêu chí Bắt buộc (MANDATORY).
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* 5. GỢI Ý CÂU HỎI PHỎNG VẤN (Khớp 100% Ảnh Web) */}
                <View style={styles.questionsCard}>
                  <View style={styles.questionsHeader}>
                    <View style={styles.cardHeaderTitleRow}>
                      <Ionicons name="help-circle" size={15} color="#6D28D9" />
                      <Text style={styles.questionsTitle} numberOfLines={1}>
                        GỢI Ý CÂU HỎI PHỎNG VẤN ({suggestedQuestions.length})
                      </Text>
                    </View>
                    <View style={styles.aiGeneratedBadge}>
                      <Text style={styles.aiGeneratedText}>Tự động tạo bởi AI</Text>
                    </View>
                  </View>

                  <View style={styles.questionsList}>
                    {suggestedQuestions.map((q, idx) => (
                      <View key={idx} style={styles.questionItem}>
                        <View style={styles.questionNumBadge}>
                          <Text style={styles.questionNumText}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.questionContentText}>{q}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* ═══════════ TAB 2: ĐÁNH GIÁ PHỎNG VẤN ═══════════ */}
            {activeTab === 'evaluation' && (
              <View style={styles.tabSectionWrap}>
                <View style={styles.simpleCard}>
                  <View style={styles.cardHeaderTitleRow}>
                    <Ionicons name="calendar-outline" size={15} color="#4F46E5" />
                    <Text style={styles.simpleCardTitle}>Thông tin lịch phỏng vấn</Text>
                  </View>

                  <View style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Người phỏng vấn:</Text>
                    <Text style={styles.infoValue}>
                      {jobInfo?.interviewerId?.name ||
                        jobInfo?.interviewerIds?.[0]?.name ||
                        'Chưa phân công người phỏng vấn'}
                    </Text>
                  </View>

                  <View style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Giai đoạn tuyển dụng:</Text>
                    <Text style={[styles.infoValue, { color: currentApp.stageColor || '#2563EB', fontWeight: '700' }]}>
                      {currentApp.stageName || 'Applied'}
                    </Text>
                  </View>

                  <View style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Trạng thái hồ sơ:</Text>
                    <Text style={styles.infoValue}>
                      {currentApp.status === 'REJECTED'
                        ? 'Đã từ chối'
                        : currentApp.status === 'HIRED'
                        ? 'Đã trúng tuyển (Hired)'
                        : 'Đang ứng tuyển (Active)'}
                    </Text>
                  </View>

                  {currentApp.rejectReason && (
                    <View style={styles.rejectReasonBox}>
                      <Text style={styles.rejectReasonLabel}>Lý do từ chối:</Text>
                      <Text style={styles.rejectReasonText}>{currentApp.rejectReason}</Text>
                    </View>
                  )}
                </View>

                {/* Ghi chú đánh giá nội bộ */}
                <View style={styles.simpleCard}>
                  <View style={styles.cardHeaderTitleRow}>
                    <Ionicons name="chatbubbles-outline" size={15} color="#4F46E5" />
                    <Text style={styles.simpleCardTitle}>
                      Ghi chú nội bộ ({currentApp.notes?.length || 0})
                    </Text>
                  </View>

                  {currentApp.notes && currentApp.notes.length > 0 ? (
                    currentApp.notes.map((n, idx) => (
                      <View key={idx} style={styles.noteItem}>
                        <View style={styles.noteHeader}>
                          <Text style={styles.noteAuthor}>{n.authorName || 'Người đánh giá'}</Text>
                          <Text style={styles.noteDate}>{formatDate(n.createdAt)}</Text>
                        </View>
                        <Text style={styles.noteRole}>{n.authorRole || 'HR'}</Text>
                        <Text style={styles.noteBody}>{n.content}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyNotice}>Chưa có ghi chú phỏng vấn nào.</Text>
                  )}

                  {/* Ô nhập ghi chú nhanh */}
                  <View style={styles.addNoteWrap}>
                    <TextInput
                      style={styles.noteInput}
                      placeholder="Thêm nhận xét, ghi chú phỏng vấn..."
                      placeholderTextColor="#94A3B8"
                      multiline
                      value={newNote}
                      onChangeText={setNewNote}
                    />
                    <TouchableOpacity
                      style={[styles.addNoteSubmitBtn, addingNote && { opacity: 0.7 }]}
                      onPress={handleAddNote}
                      disabled={addingNote || !newNote.trim()}
                    >
                      {addingNote ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="send" size={12} color="#FFFFFF" />
                          <Text style={styles.addNoteSubmitText}>Lưu ghi chú</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* ═══════════ TAB 3: HỒ SƠ ỨNG VIÊN (ĐẦY ĐỦ 100% NHƯ WEB) ═══════════ */}
            {activeTab === 'profile' && (
              <View style={styles.tabSectionWrap}>
                {/* 1. Header Dark Card (Khớp Header Resume Sheet trên Web) */}
                <View style={styles.resumeHeroBanner}>
                  <Text style={styles.resumeNameText}>{name}</Text>
                  <Text style={styles.resumeJobText}>{jobTitle || headline}</Text>

                  {/* Contact Info Items */}
                  <View style={styles.resumeContactRow}>
                    {email ? (
                      <TouchableOpacity style={styles.resumeContactBtn} onPress={handleEmail} activeOpacity={0.7}>
                        <Ionicons name="mail" size={12} color="#93C5FD" />
                        <Text style={styles.resumeContactBtnText} numberOfLines={1}>
                          {email}
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    {phone ? (
                      <TouchableOpacity style={styles.resumeContactBtn} onPress={handleCall} activeOpacity={0.7}>
                        <Ionicons name="call" size={12} color="#93C5FD" />
                        <Text style={styles.resumeContactBtnText}>{phone}</Text>
                      </TouchableOpacity>
                    ) : null}

                    {address ? (
                      <View style={styles.resumeContactBtn}>
                        <Ionicons name="location" size={12} color="#93C5FD" />
                        <Text style={styles.resumeContactBtnText} numberOfLines={1}>
                          {address}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Social Links (Mạng xã hội như LinkedIn, GitHub...) */}
                  {candidateInfo?.socialLinks && candidateInfo.socialLinks.length > 0 && (
                    <View style={styles.socialLinksRow}>
                      {candidateInfo.socialLinks.map((s: any, idx: number) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.socialLinkPill}
                          onPress={() => handleOpenUrl(s.url)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="globe-outline" size={11} color="#C7D2FE" />
                          <Text style={styles.socialLinkText}>
                            {s.platform || 'Link'}: {s.url}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Nút Xem file CV đính kèm */}
                  {resumeUrl && (
                    <TouchableOpacity
                      style={styles.openResumeBtn}
                      onPress={handleOpenResume}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="document-text" size={15} color="#FFFFFF" />
                      <Text style={styles.openResumeBtnText}>Xem file CV đính kèm (PDF)</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* 2. Mục tiêu nghề nghiệp & Giới thiệu (Career Objective & Summary) */}
                {(candidateInfo?.careerObjective || candidateInfo?.summary) && (
                  <View style={styles.simpleCard}>
                    <View style={styles.cardHeaderTitleRow}>
                      <Ionicons name="locate-outline" size={15} color="#4F46E5" />
                      <Text style={styles.simpleCardTitle}>Mục tiêu nghề nghiệp & Giới thiệu</Text>
                    </View>
                    {candidateInfo?.careerObjective && (
                      <Text style={styles.richTextBody}>
                        {stripHtml(candidateInfo.careerObjective)}
                      </Text>
                    )}
                    {candidateInfo?.summary && (
                      <Text style={[styles.richTextBody, candidateInfo?.careerObjective ? { marginTop: 6 } : {}]}>
                        {stripHtml(candidateInfo.summary)}
                      </Text>
                    )}
                  </View>
                )}

                {/* 3. Học vấn & Đào tạo (Education - Đầy đủ Trường, Chuyên ngành, Bằng cấp, GPA, Thời gian) */}
                {candidateInfo?.educations && candidateInfo.educations.length > 0 && (
                  <View style={styles.simpleCard}>
                    <View style={styles.cardHeaderTitleRow}>
                      <Ionicons name="school-outline" size={15} color="#4F46E5" />
                      <Text style={styles.simpleCardTitle}>
                        Học vấn & Đào tạo ({candidateInfo.educations.length})
                      </Text>
                    </View>
                    <View style={{ gap: 10 }}>
                      {candidateInfo.educations.map((edu: any, idx: number) => {
                        const institution = edu.institution || edu.school || 'Trường học';
                        const major = edu.major || 'Chuyên ngành';
                        const degree = edu.degree;
                        const gpa = edu.gpa;
                        const period =
                          edu.startDate || edu.endDate
                            ? `${edu.startDate || ''} - ${edu.endDate || 'Hiện tại'}`
                            : edu.graduationYear
                            ? `Tốt nghiệp: ${edu.graduationYear}`
                            : '';

                        return (
                          <View key={idx} style={styles.eduCard}>
                            <View style={styles.eduTopRow}>
                              <Text style={styles.eduInstitution}>{institution}</Text>
                              {period ? <Text style={styles.eduPeriodBadge}>{period}</Text> : null}
                            </View>
                            <Text style={styles.eduMajor}>
                              {major} {degree ? `• ${degree}` : ''}
                            </Text>
                            {gpa ? <Text style={styles.eduGpa}>GPA: {gpa}</Text> : null}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* 4. Kỹ năng chuyên môn (Skills) */}
                {candidateInfo?.skills && candidateInfo.skills.length > 0 && (
                  <View style={styles.simpleCard}>
                    <View style={styles.cardHeaderTitleRow}>
                      <Ionicons name="sparkles-outline" size={15} color="#4F46E5" />
                      <Text style={styles.simpleCardTitle}>
                        Kỹ năng chuyên môn ({candidateInfo.skills.length})
                      </Text>
                    </View>
                    <View style={styles.skillsTagWrap}>
                      {candidateInfo.skills.map((s: any, idx: number) => {
                        const sName = typeof s === 'object' ? s?.name : String(s);
                        return (
                          <View key={idx} style={styles.skillPill}>
                            <Text style={styles.skillPillText}>{sName}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* 5. Dự án thực tế tiêu biểu (Projects - Đầy đủ Role, Tech, Url, Description) */}
                {candidateInfo?.projects && candidateInfo.projects.length > 0 && (
                  <View style={styles.simpleCard}>
                    <View style={styles.cardHeaderTitleRow}>
                      <Ionicons name="folder-outline" size={15} color="#4F46E5" />
                      <Text style={styles.simpleCardTitle}>
                        Dự án thực tế tiêu biểu ({candidateInfo.projects.length})
                      </Text>
                    </View>
                    <View style={{ gap: 12 }}>
                      {candidateInfo.projects.map((proj: any, idx: number) => (
                        <View key={idx} style={styles.projectCard}>
                          <View style={styles.projectTopRow}>
                            <Text style={styles.projectName}>{proj.name || 'Dự án'}</Text>
                            {proj.role ? (
                              <View style={styles.projectRoleBadge}>
                                <Text style={styles.projectRoleText}>{proj.role}</Text>
                              </View>
                            ) : null}
                          </View>

                          {(proj.startDate || proj.endDate) && (
                            <Text style={styles.projectPeriod}>
                              {proj.startDate || 'N/A'} - {proj.endDate || 'Hiện tại'}
                            </Text>
                          )}

                          {proj.projectUrl && (
                            <TouchableOpacity
                              onPress={() => handleOpenUrl(proj.projectUrl)}
                              style={styles.projectUrlRow}
                            >
                              <Ionicons name="open-outline" size={11} color="#4F46E5" />
                              <Text style={styles.projectUrlText} numberOfLines={1}>
                                {proj.projectUrl}
                              </Text>
                            </TouchableOpacity>
                          )}

                          {proj.description && (
                            <Text style={styles.projectDesc}>{stripHtml(proj.description)}</Text>
                          )}

                          {proj.technologies && proj.technologies.length > 0 && (
                            <View style={styles.techPillWrap}>
                              {proj.technologies.map((t: string, tIdx: number) => (
                                <View key={tIdx} style={styles.techPill}>
                                  <Text style={styles.techPillText}>{t}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* 6. Kinh nghiệm làm việc (Work Experience - Với Technologies) */}
                {candidateInfo?.experiences && candidateInfo.experiences.length > 0 && (
                  <View style={styles.simpleCard}>
                    <View style={styles.cardHeaderTitleRow}>
                      <Ionicons name="briefcase-outline" size={15} color="#4F46E5" />
                      <Text style={styles.simpleCardTitle}>
                        Kinh nghiệm làm việc ({candidateInfo.experiences.length})
                      </Text>
                    </View>
                    <View style={styles.timelineContainer}>
                      {candidateInfo.experiences.map((exp: any, idx: number) => (
                        <View key={idx} style={styles.timelineRow}>
                          <View style={styles.timelineDot} />
                          <View style={styles.timelineBody}>
                            <View style={styles.timelineHeaderRow}>
                              <Text style={styles.timelineRole}>{exp.position || 'Chức danh'}</Text>
                              <Text style={styles.timelinePeriodBadge}>
                                {exp.startDate || 'N/A'} - {exp.endDate || 'Hiện tại'}
                              </Text>
                            </View>
                            <Text style={styles.timelineCompany}>{exp.company || 'Công ty'}</Text>
                            {exp.description && (
                              <Text style={styles.timelineDesc}>{stripHtml(exp.description)}</Text>
                            )}
                            {exp.technologies && exp.technologies.length > 0 && (
                              <View style={styles.techPillWrap}>
                                {exp.technologies.map((t: string, tIdx: number) => (
                                  <View key={tIdx} style={styles.techPill}>
                                    <Text style={styles.techPillText}>{t}</Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* 7. Chứng chỉ & Ngoại ngữ (Certifications & Languages) */}
                {((candidateInfo?.certifications && candidateInfo.certifications.length > 0) ||
                  (candidateInfo?.languages && candidateInfo.languages.length > 0)) && (
                  <View style={styles.simpleCard}>
                    <View style={styles.cardHeaderTitleRow}>
                      <Ionicons name="ribbon-outline" size={15} color="#4F46E5" />
                      <Text style={styles.simpleCardTitle}>Chứng chỉ & Ngoại ngữ</Text>
                    </View>

                    {/* Certifications */}
                    {candidateInfo?.certifications && candidateInfo.certifications.length > 0 && (
                      <View style={{ marginBottom: 12 }}>
                        <Text style={styles.subSectionTitle}>
                          Chứng chỉ ({candidateInfo.certifications.length})
                        </Text>
                        <View style={{ gap: 8, marginTop: 6 }}>
                          {candidateInfo.certifications.map((cert: any, idx: number) => (
                            <View key={idx} style={styles.certCard}>
                              <View style={styles.certHeader}>
                                <Text style={styles.certName}>{cert.name}</Text>
                                {cert.scoreOrLevel && (
                                  <View style={styles.certScoreBadge}>
                                    <Text style={styles.certScoreText}>{cert.scoreOrLevel}</Text>
                                  </View>
                                )}
                              </View>
                              {cert.organization && (
                                <Text style={styles.certOrg}>
                                  Cấp bởi:{' '}
                                  <Text style={{ fontWeight: '600', color: '#334155' }}>
                                    {cert.organization}
                                  </Text>
                                </Text>
                              )}
                              {cert.issueDate && <Text style={styles.certDate}>{cert.issueDate}</Text>}
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Languages */}
                    {candidateInfo?.languages && candidateInfo.languages.length > 0 && (
                      <View>
                        <Text style={styles.subSectionTitle}>
                          Ngoại ngữ ({candidateInfo.languages.length})
                        </Text>
                        <View style={{ gap: 6, marginTop: 6 }}>
                          {candidateInfo.languages.map((lang: any, idx: number) => (
                            <View key={idx} style={styles.langRow}>
                              <Text style={styles.langName}>{lang.language}</Text>
                              {lang.proficiency && (
                                <View style={styles.langBadge}>
                                  <Text style={styles.langBadgeText}>{lang.proficiency}</Text>
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* 8. Các mục khác (Custom Sections) */}
                {candidateInfo?.customSections && candidateInfo.customSections.length > 0 && (
                  <View style={{ gap: 10 }}>
                    {candidateInfo.customSections.map((sec: any, secIdx: number) => (
                      <View key={secIdx} style={styles.simpleCard}>
                        <View style={styles.cardHeaderTitleRow}>
                          <Ionicons name="newspaper-outline" size={15} color="#4F46E5" />
                          <Text style={styles.simpleCardTitle}>{sec.sectionTitle || 'Khác'}</Text>
                        </View>
                        <View style={{ gap: 8, marginTop: 4 }}>
                          {sec.items?.map((item: any, itemIdx: number) => (
                            <View key={itemIdx} style={styles.customSectionItem}>
                              <View style={styles.customSectionHeader}>
                                <Text style={styles.customSectionTitle}>{item.title}</Text>
                                {item.date && (
                                  <Text style={styles.customSectionDate}>{item.date}</Text>
                                )}
                              </View>
                              {item.subtitle && (
                                <Text style={styles.customSectionSubtitle}>{item.subtitle}</Text>
                              )}
                              {item.description && (
                                <Text style={styles.customSectionDesc}>
                                  {stripHtml(item.description)}
                                </Text>
                              )}
                              {item.url && (
                                <TouchableOpacity onPress={() => handleOpenUrl(item.url)}>
                                  <Text style={styles.customSectionUrl}>{item.url}</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* ─── 4. BOTTOM ACTION BAR ─── */}
          <View style={styles.footerBar}>
            {/* Nút Từ chối ứng viên */}
            <TouchableOpacity
              style={styles.footerRejectBtn}
              onPress={() => onReject(currentApp)}
              activeOpacity={0.8}
            >
              <Ionicons name="alert-circle" size={16} color="#FFFFFF" />
              <Text style={styles.footerRejectBtnText}>Từ chối ứng viên</Text>
            </TouchableOpacity>

            {/* Nút Chuyển giai đoạn */}
            <TouchableOpacity
              style={styles.footerMoveBtn}
              onPress={() => setShowStagePicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
              <Text style={styles.footerMoveBtnText}>Chuyển giai đoạn</Text>
            </TouchableOpacity>
          </View>

          {/* Sub-modal: Hộp thoại chọn giai đoạn tiếp theo */}
          <Modal
            visible={showStagePicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowStagePicker(false)}
          >
            <View style={styles.pickerOverlay}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                onPress={() => setShowStagePicker(false)}
                activeOpacity={1}
              />
              <View style={styles.pickerCard}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Chọn giai đoạn tiếp theo</Text>
                  <TouchableOpacity onPress={() => setShowStagePicker(false)}>
                    <Ionicons name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                  {stages.map((stg) => {
                    const isCurrent =
                      currentApp.currentStageId === stg._id ||
                      currentApp.stageName?.toLowerCase() === stg.name.toLowerCase();
                    return (
                      <TouchableOpacity
                        key={stg._id}
                        style={[styles.stageOptionItem, isCurrent && styles.stageOptionItemCurrent]}
                        onPress={() => handleSelectStage(stg)}
                        disabled={changingStage}
                        activeOpacity={0.7}
                      >
                        <View style={styles.stageOptionLeft}>
                          <View
                            style={[
                              styles.stageColorDot,
                              { backgroundColor: stg.color || '#2563EB' },
                            ]}
                          />
                          <Text
                            style={[
                              styles.stageOptionName,
                              isCurrent && styles.stageOptionNameCurrent,
                            ]}
                          >
                            {stg.name}
                          </Text>
                        </View>
                        {isCurrent && (
                          <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>Hiện tại</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
};

export default CandidateDetailModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  // CHIỀU CAO CỐ ĐỊNH 92% -> KHÔNG BỊ GIẬT KHI CHUYỂN TAB
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },

  // 1. Header Styles (Khớp Ảnh Web)
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  avatarInitialText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  nameText: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  deptBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  deptBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  headlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    marginTop: 2,
  },
  subMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  subMetaText: {
    fontSize: 11,
    color: '#64748B',
  },
  subMetaJobBold: {
    fontWeight: '700',
    color: '#334155',
  },
  subMetaDot: {
    fontSize: 11,
    color: '#94A3B8',
    marginHorizontal: 1,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    marginLeft: 6,
  },

  // 2. Tab Navigation
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#4F46E5',
    backgroundColor: '#F5F3FF',
  },
  tabItemText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabItemTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  scoreTabPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
    borderWidth: 1,
  },
  scoreTabPillText: {
    fontSize: 9.5,
    fontWeight: '800',
  },

  // 3. Body Content
  modalBody: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalBodyContent: {
    padding: 14,
    paddingBottom: 24,
  },
  overviewContainer: {
    gap: 12,
  },

  // Hero Card: AI Match Score & Circle Gauge
  aiHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  aiHeroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  aiHeroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  aiMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  aiMatchBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  mandatoryBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  mandatoryBadgeTextSuccess: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  mandatoryBadgeFail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  mandatoryBadgeTextFail: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  aiHeroSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  gaugeCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  gaugeScoreText: {
    fontSize: 19,
    fontWeight: '900',
  },

  // AI Summary Card
  aiSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  aiSummaryTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.3,
  },
  aiSummaryContent: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },

  // Strengths & Gaps
  strengthsGapsContainer: {
    gap: 10,
  },
  strengthsCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 13,
  },
  strengthsTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#14532D',
    letterSpacing: 0.3,
  },
  gapsCard: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 14,
    padding: 13,
  },
  gapsTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#881337',
    letterSpacing: 0.3,
  },
  bulletList: {
    marginTop: 4,
    gap: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  strengthBullet: {
    color: '#16A34A',
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '900',
  },
  strengthText: {
    fontSize: 12,
    color: '#14532D',
    flex: 1,
    lineHeight: 17,
    fontWeight: '500',
  },
  gapBullet: {
    color: '#E11D48',
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '900',
  },
  gapText: {
    fontSize: 12,
    color: '#881337',
    flex: 1,
    lineHeight: 17,
    fontWeight: '500',
  },

  // Warnings Card
  warningCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 13,
  },
  warningTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#78350F',
    letterSpacing: 0.3,
  },
  warningBullet: {
    color: '#D97706',
    fontSize: 14,
    lineHeight: 17,
  },
  warningText: {
    fontSize: 12,
    color: '#78350F',
    flex: 1,
    lineHeight: 17,
  },

  // Questions Card
  questionsCard: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 14,
    padding: 13,
  },
  questionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  questionsTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#581C87',
    letterSpacing: 0.3,
    flex: 1,
  },
  aiGeneratedBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiGeneratedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7E22CE',
  },
  questionsList: {
    gap: 8,
  },
  questionItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3E8FF',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  questionNumBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  questionNumText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#7E22CE',
  },
  questionContentText: {
    fontSize: 12,
    color: '#1E293B',
    flex: 1,
    lineHeight: 17,
  },

  // Tab 2 & 3 General styles
  tabSectionWrap: {
    gap: 12,
  },
  simpleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  simpleCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  richTextBody: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    maxWidth: '65%',
    textAlign: 'right',
  },
  rejectReasonBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  rejectReasonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 2,
  },
  rejectReasonText: {
    fontSize: 12,
    color: '#991B1B',
  },
  noteItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  noteDate: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  noteRole: {
    fontSize: 10.5,
    color: '#64748B',
    marginBottom: 4,
  },
  noteBody: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },
  emptyNotice: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  addNoteWrap: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  noteInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 8,
    fontSize: 12,
    color: '#0F172A',
    minHeight: 50,
    textAlignVertical: 'top',
  },
  addNoteSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
  },
  addNoteSubmitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Tab 3: Resume Hero Banner
  resumeHeroBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
  },
  resumeNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resumeJobText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A5B4FC',
    marginTop: 2,
  },
  resumeContactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  resumeContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 6,
  },
  resumeContactBtnText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  socialLinksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  socialLinkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  socialLinkText: {
    fontSize: 10.5,
    color: '#E0E7FF',
    maxWidth: 200,
  },
  openResumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  openResumeBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Education Card
  eduCard: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  eduTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  eduInstitution: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  eduPeriodBadge: {
    fontSize: 10.5,
    color: '#64748B',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  eduMajor: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
    marginTop: 2,
  },
  eduGpa: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
    marginTop: 3,
  },

  // Skills
  skillsTagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  skillPill: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skillPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E293B',
  },

  // Projects
  projectCard: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  projectTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  projectName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  projectRoleBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  projectRoleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
  },
  projectPeriod: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  projectUrlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  projectUrlText: {
    fontSize: 11,
    color: '#4F46E5',
    textDecorationLine: 'underline',
  },
  projectDesc: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 4,
    lineHeight: 16,
  },
  techPillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  techPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  techPillText: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#475569',
  },

  // Timeline (Experience)
  timelineContainer: {
    marginTop: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
    marginTop: 5,
    marginRight: 10,
  },
  timelineBody: {
    flex: 1,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  timelineRole: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  timelinePeriodBadge: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  timelineCompany: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
    marginTop: 1,
  },
  timelineDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },

  // Certifications & Languages
  subSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  certCard: {
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  certHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  certName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  certScoreBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  certScoreText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4F46E5',
  },
  certOrg: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  certDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  langBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  langBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
  },

  // Custom sections
  customSectionItem: {
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  customSectionDate: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  customSectionSubtitle: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 2,
  },
  customSectionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 15,
  },
  customSectionUrl: {
    fontSize: 11,
    color: '#4F46E5',
    textDecorationLine: 'underline',
    marginTop: 2,
  },

  // 4. Bottom Action Bar
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  footerRejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E11D48',
    borderRadius: 12,
    paddingVertical: 11,
  },
  footerRejectBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerMoveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 11,
  },
  footerMoveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Stage Picker
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  stageOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 6,
  },
  stageOptionItemCurrent: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  stageOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stageColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stageOptionName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  stageOptionNameCurrent: {
    color: '#2563EB',
    fontWeight: '700',
  },
  currentBadge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
});
