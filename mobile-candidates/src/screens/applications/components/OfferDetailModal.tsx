import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CandidateOfferItem, CandidateOfferStatus } from '../../../types/application.types';
import { applicationService } from '../../../services/application.service';
import { firebaseAuthService } from '../../../services/firebase-auth.service';

interface OfferDetailModalProps {
  visible: boolean;
  onClose: () => void;
  offer: CandidateOfferItem | null;
  onSuccess: () => void;
}

export const OfferDetailModal: React.FC<OfferDetailModalProps> = ({
  visible,
  onClose,
  offer,
  onSuccess,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isAcceptMode, setIsAcceptMode] = useState(false);
  const [isDeclineMode, setIsDeclineMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [firebaseSessionInfo, setFirebaseSessionInfo] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState(
    (offer as any)?.candidatePhone
      ? String((offer as any).candidatePhone).replace(/(\d{3})\d+(\d{4})/, '$1***$2')
      : ''
  );
  const [countdown, setCountdown] = useState(0);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!visible) {
      setIsAcceptMode(false);
      setIsDeclineMode(false);
      setOtp('');
      setCountdown(0);
      setErrorMessage('');
      setDeclineReason('');
      setFirebaseSessionInfo(null);
    } else if (offer && (offer as any)?.candidatePhone) {
      setMaskedPhone(
        String((offer as any).candidatePhone).replace(/(\d{3})\d+(\d{4})/, '$1***$2')
      );
    }
  }, [visible, offer]);

  useEffect(() => {
    if (!isAcceptMode) return;
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isAcceptMode, countdown]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        if (isAcceptMode || isDeclineMode) {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      },
    );
    return () => {
      showSub.remove();
    };
  }, [isAcceptMode, isDeclineMode]);

  useEffect(() => {
    if (isAcceptMode || isDeclineMode) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [isAcceptMode, isDeclineMode]);

  const handleRequestOtp = async () => {
    if (!offer) return;
    try {
      setResendingOtp(true);
      setErrorMessage('');
      const res = await applicationService.requestOtp(offer._id);
      if (res.success) {
        if (res.maskedPhone) setMaskedPhone(res.maskedPhone);
        setCountdown(60);
        const targetPhone = res.phone || (offer as any)?.candidatePhone;
        if (!targetPhone) {
          setErrorMessage('Không tìm thấy số điện thoại của ứng viên để gửi mã SMS.');
          return;
        }
        const fbRes = await firebaseAuthService.sendVerificationCode(targetPhone);
        if (fbRes.success && fbRes.sessionInfo) {
          setFirebaseSessionInfo(fbRes.sessionInfo);
        }
      } else {
        setErrorMessage(res.message);
      }
    } finally {
      setResendingOtp(false);
    }
  };

  const handleRespond = async (action: 'ACCEPT' | 'DECLINE') => {
    if (!offer) return;
    if (action === 'ACCEPT' && (!otp || otp.trim().length === 0)) {
      setErrorMessage('Vui lòng nhập mã OTP được gửi qua tin nhắn SMS để xác nhận nhận việc.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      let firebaseVerified = false;
      if (action === 'ACCEPT') {
        const trimmedOtp = otp.trim();
        if (firebaseSessionInfo) {
          const verifyRes = await firebaseAuthService.verifyCode(firebaseSessionInfo, trimmedOtp);
          if (verifyRes.success) {
            firebaseVerified = true;
          } else {
            setErrorMessage(verifyRes.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
            setSubmitting(false);
            return;
          }
        }
      }

      const res = await applicationService.respondOffer(
        offer._id,
        action,
        action === 'DECLINE' ? declineReason : undefined,
        action === 'ACCEPT' ? otp.trim() : undefined,
        firebaseVerified,
      );

      if (res.success) {
        Alert.alert(
          'Thành công',
          action === 'ACCEPT'
            ? 'Chúc mừng bạn đã đồng ý nhận việc thành công!'
            : 'Bạn đã từ chối lời mời nhận việc.',
        );
        onSuccess();
        setIsAcceptMode(false);
        setIsDeclineMode(false);
        setOtp('');
        setDeclineReason('');
        setFirebaseSessionInfo(null);
        onClose();
      } else {
        setErrorMessage(res.message || 'Không thể phản hồi lúc này.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!offer) return null;

  const job = offer.jobDescriptionId;
  const deptName = offer.departmentId?.name || 'IT & Engineering';
  const positionTitle = offer.positionTitle || (typeof job === 'object' ? job?.title : '') || 'Vị trí chuyên viên';

  const formattedSalary = Number(offer.salary || 0).toLocaleString('vi-VN');
  const formattedProbationSalary = Math.round(
    (Number(offer.salary || 0) * (offer.probationSalaryPercentage || 85)) / 100,
  ).toLocaleString('vi-VN');

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

  const getCandidateName = (): string => {
    if (offer.offerLetterHtml) {
      const match = offer.offerLetterHtml.match(/Kính gửi\s*(?:<strong>)?(.*?)(?:<\/strong>)?\s*,/i);
      if (match && match[1]) {
        const cleaned = match[1].replace(/<[^>]+>/g, '').trim();
        if (cleaned) return cleaned;
      }
    }
    const anyOffer = offer as any;
    return (
      anyOffer.candidateName ||
      anyOffer.applicationId?.candidateId?.name ||
      anyOffer.candidateId?.name ||
      'Ứng viên'
    );
  };

  const getBenefitsList = (): string[] => {
    if (Array.isArray(offer.benefits) && offer.benefits.length > 0) {
      return offer.benefits.map((b) => String(b).replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
    }
    if (typeof offer.benefits === 'string' && (offer.benefits as string).trim()) {
      const lines = (offer.benefits as string)
        .split('\n')
        .map((b: string) => b.replace(/^[-•*]\s*/, '').trim())
        .filter(Boolean);
      if (lines.length > 0) return lines;
    }
    if (offer.offerLetterHtml) {
      const liMatches = [...offer.offerLetterHtml.matchAll(/<li[^>]*>(.*?)<\/li>/gi)];
      if (liMatches.length > 0) {
        return liMatches.map((m) => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
      }
    }
    return ['Bảo hiểm PTI', 'Thưởng lương tháng 13'];
  };

  const candidateName = getCandidateName();
  const benefitsList = getBenefitsList();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="document-text" size={20} color="#059669" />
              </View>
              <View style={styles.headerTitleWrap}>
                <Text style={styles.headerTitle}>Thư Mời Nhận Việc (Job Offer)</Text>
                <Text style={styles.headerSub} numberOfLines={1}>
                  Vị trí: <Text style={styles.headerSubBold}>{positionTitle}</Text> • {deptName}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <Ionicons name="close" size={20} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollArea}
            contentContainerStyle={[
              styles.scrollContent,
              (isAcceptMode || isDeclineMode) && { paddingBottom: 160 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 4 Summary Cards Grid */}
            <View style={styles.gridBox}>
              {/* Card 1: Mức lương chính thức */}
              <View style={[styles.gridItem, styles.gridItemEmerald]}>
                <Text style={[styles.gridLabel, styles.gridLabelEmerald]}>MỨC LƯƠNG CHÍNH THỨC</Text>
                <Text style={[styles.gridValue, styles.gridValueEmerald]}>
                  {formattedSalary} {offer.currency}
                </Text>
                <Text style={[styles.gridSub, styles.gridSubEmerald]}>Lương Gross hàng tháng</Text>
              </View>

              {/* Card 2: Lương thử việc */}
              <View style={[styles.gridItem, styles.gridItemSlate]}>
                <Text style={[styles.gridLabel, styles.gridLabelSlate]}>
                  LƯƠNG THỬ VIỆC ({offer.probationSalaryPercentage || 85}%)
                </Text>
                <Text style={[styles.gridValue, styles.gridValueSlate]}>
                  {formattedProbationSalary} {offer.currency}
                </Text>
                <Text style={[styles.gridSub, styles.gridSubSlate]}>
                  Thời gian: {offer.probationDurationMonths || 2} tháng
                </Text>
              </View>

              {/* Card 3: Ngày bắt đầu làm việc */}
              <View style={[styles.gridItem, styles.gridItemBlue]}>
                <Text style={[styles.gridLabel, styles.gridLabelBlue]}>NGÀY BẮT ĐẦU LÀM VIỆC</Text>
                <View style={styles.rowAlign}>
                  <Ionicons name="calendar-outline" size={13} color="#2563eb" />
                  <Text style={[styles.gridValue, styles.gridValueBlue]}>
                    {formatDate(offer.startDate)}
                  </Text>
                </View>
                <Text style={[styles.gridSub, styles.gridSubBlue]} numberOfLines={1}>
                  {offer.workLocation || 'Tòa nhà TalentCore, TP. Hồ Chí Minh'}
                </Text>
              </View>

              {/* Card 4: Hạn chót phản hồi */}
              <View style={[styles.gridItem, isExpired ? styles.gridItemOrange : styles.gridItemAmber]}>
                <Text style={[styles.gridLabel, isExpired ? styles.gridLabelOrange : styles.gridLabelAmber]}>
                  HẠN CHÓT PHẢN HỒI
                </Text>
                <View style={styles.rowAlign}>
                  <Ionicons
                    name="time-outline"
                    size={13}
                    color={isExpired ? '#ea580c' : '#d97706'}
                  />
                  <Text style={[styles.gridValue, isExpired ? styles.gridValueOrange : styles.gridValueAmber]}>
                    {formatDate(offer.expirationDate)}
                  </Text>
                </View>
                <Text style={[styles.gridSub, isExpired ? styles.gridSubOrange : styles.gridSubAmber]}>
                  {isExpired ? 'Đã hết hạn' : 'Vui lòng phản hồi đúng hạn'}
                </Text>
              </View>
            </View>

            {/* Status Banners */}
            {offer.status === CandidateOfferStatus.DECLINED && (
              <View style={styles.bannerDeclined}>
                <Ionicons name="close-circle" size={18} color="#e11d48" style={styles.bannerIcon} />
                <View style={styles.bannerTextWrap}>
                  <Text style={styles.bannerTitleDeclined}>Bạn đã từ chối lời mời nhận việc này</Text>
                  <Text style={styles.bannerDescDeclined}>
                    Cảm ơn bạn đã dành thời gian trao đổi cùng TalentCore. Chúc bạn luôn thành công trên con đường sự nghiệp!
                  </Text>
                </View>
              </View>
            )}

            {offer.status === CandidateOfferStatus.ACCEPTED && (
              <View style={styles.bannerAccepted}>
                <Ionicons name="checkmark-circle" size={18} color="#059669" style={styles.bannerIcon} />
                <View style={styles.bannerTextWrap}>
                  <Text style={styles.bannerTitleAccepted}>
                    Chúc mừng bạn đã đồng ý tiếp nhận Lời mời nhận việc!
                  </Text>
                  <Text style={styles.bannerDescAccepted}>
                    Đội ngũ Nhân sự TalentCore đã nhận được xác nhận từ bạn và sẽ sớm liên hệ qua điện thoại/email để hướng dẫn các thủ tục tiếp nhận công việc.
                  </Text>
                </View>
              </View>
            )}

            {isExpired && offer.status !== CandidateOfferStatus.ACCEPTED && offer.status !== CandidateOfferStatus.DECLINED && (
              <View style={styles.bannerExpired}>
                <Ionicons name="time" size={18} color="#c2410c" style={styles.bannerIcon} />
                <View style={styles.bannerTextWrap}>
                  <Text style={styles.bannerTitleExpired}>Lời mời nhận việc đã hết hạn phản hồi</Text>
                  <Text style={styles.bannerDescExpired}>
                    Thời hạn phản hồi cho Thư mời nhận việc này đã kết thúc vào ngày{' '}
                    <Text style={{ fontWeight: '700' }}>{formatDate(offer.expirationDate)}</Text>. Bạn hiện chỉ có thể xem nội dung thư mời. Nếu cần hỗ trợ thêm, vui lòng liên hệ trực tiếp với Bộ phận Tuyển dụng TalentCore.
                  </Text>
                </View>
              </View>
            )}

            {/* Paper Document Container (Khung trang giấy sang trọng như Web) */}
            <View style={styles.paperContainer}>
              <Text style={styles.paperTitle}>THƯ MỜI NHẬN VIỆC (JOB OFFER)</Text>
              <Text style={styles.paperCompany}>Công ty Cổ phần Giải pháp Công nghệ TalentCore</Text>
              <View style={styles.paperDivider} />

              <Text style={styles.greetingText}>
                Kính gửi <Text style={styles.greetingName}>{candidateName}</Text>,
              </Text>

              <Text style={styles.introParagraph}>
                Thay mặt Ban lãnh đạo cùng tập thể TalentCore, chúng tôi xin chúc mừng bạn đã xuất sắc vượt qua các vòng phỏng vấn và đánh giá chuyên môn vừa qua. Chúng tôi rất ấn tượng với năng lực và tiềm năng của bạn, và trân trọng gửi đến bạn lời mời gia nhập đội ngũ TalentCore với các thông tin chi tiết như sau:
              </Text>

              {/* Section 1: Thông tin vị trí & Điều kiện làm việc */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeader}>1. THÔNG TIN VỊ TRÍ & ĐIỀU KIỆN LÀM VIỆC</Text>
                <View style={styles.sectionDivider} />

                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Vị trí công tác:</Text>
                  <Text style={styles.tableValue}>{positionTitle}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Phòng ban:</Text>
                  <Text style={styles.tableValue}>{deptName}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Hình thức hợp đồng:</Text>
                  <Text style={styles.tableValue}>Toàn thời gian (Full-time)</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Địa điểm làm việc:</Text>
                  <Text style={styles.tableValue}>{offer.workLocation || 'Tòa nhà TalentCore, TP. Hồ Chí Minh'}</Text>
                </View>
                <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.tableLabel}>Thời gian bắt đầu:</Text>
                  <Text style={[styles.tableValue, { color: '#2563eb' }]}>{formatDate(offer.startDate)}</Text>
                </View>
              </View>

              {/* Section 2: Chế độ lương & Đãi ngộ */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeader}>2. CHẾ ĐỘ LƯƠNG & ĐÃI NGỘ</Text>
                <View style={styles.sectionDivider} />

                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Mức lương chính thức (Gross):</Text>
                  <Text style={[styles.tableValue, styles.salaryHighlight]}>
                    {formattedSalary} VND/tháng
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Thời gian thử việc:</Text>
                  <Text style={styles.tableValue}>{offer.probationDurationMonths || 2} tháng</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Lương thử việc ({offer.probationSalaryPercentage || 85}%):</Text>
                  <Text style={styles.tableValue}>
                    {formattedProbationSalary} VND/tháng
                  </Text>
                </View>

                {/* Phúc lợi bổ sung */}
                <Text style={styles.benefitsTitle}>Quyền lợi và phúc lợi:</Text>
                <View style={styles.benefitsListWrap}>
                  {benefitsList.map((item, idx) => (
                    <View key={idx} style={styles.benefitItem}>
                      <View style={styles.benefitDot} />
                      <Text style={styles.benefitText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Concluding text */}
              <Text style={styles.outroParagraph}>
                Thư mời nhận việc này có hiệu lực phản hồi đến hết ngày{' '}
                <Text style={styles.greetingName}>{formatDate(offer.expirationDate)}</Text>. Bạn vui lòng xác nhận đồng ý hoặc từ chối thông qua Cổng thông tin ứng viên TalentCore.
              </Text>

              <Text style={styles.outroParagraph}>
                Nếu bạn có bất kỳ câu hỏi hoặc cần trao đổi thêm thông tin, vui lòng liên hệ trực tiếp với Phòng Nhân sự TalentCore.
              </Text>

              {/* Signature */}
              <View style={styles.signatureBlock}>
                <Text style={styles.signatureIntro}>Trân trọng,</Text>
                <Text style={styles.signatureName}>Phòng Nhân sự TalentCore</Text>
              </View>
            </View>

            {/* Accept / OTP Inline Form */}
            {isAcceptMode && (
              <View style={styles.formContainer}>
                <View style={styles.formHeaderRow}>
                  <Ionicons name="shield-checkmark" size={18} color="#059669" />
                  <Text style={styles.formTitle}>Xác nhận Nhận Việc</Text>
                </View>

                <View style={styles.smsNoticeBox}>
                  <View style={styles.smsNoticeHeader}>
                    <Ionicons name="chatbox-ellipses" size={14} color="#059669" />
                    <Text style={styles.smsNoticeTitle}>Xác thực chữ ký điện tử qua SMS OTP</Text>
                  </View>
                  <Text style={styles.formDesc}>
                    Mã xác thực (6 chữ số) đã được gửi qua tin nhắn SMS đến số điện thoại của bạn:
                  </Text>
                  {!!maskedPhone && (
                    <View style={styles.phoneBadgeRow}>
                      <Ionicons name="phone-portrait-outline" size={13} color="#059669" />
                      <Text style={styles.phoneBadgeText}>{maskedPhone}</Text>
                    </View>
                  )}
                </View>

                <TextInput
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="000000"
                  placeholderTextColor="#94a3b8"
                  value={otp}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 150);
                  }}
                  onChangeText={(val) => {
                    setOtp(val.replace(/\D/g, ''));
                    if (errorMessage) setErrorMessage('');
                  }}
                />

                <View style={styles.resendRow}>
                  <Text style={styles.resendHint}>Chưa nhận được tin nhắn SMS?</Text>
                  <Pressable
                    onPress={handleRequestOtp}
                    disabled={countdown > 0 || resendingOtp}
                    hitSlop={8}
                  >
                    <Text
                      style={[
                        styles.resendBtnText,
                        (countdown > 0 || resendingOtp) && styles.resendBtnTextDisabled,
                      ]}
                    >
                      {resendingOtp
                        ? 'Đang gửi...'
                        : countdown > 0
                        ? `Gửi lại mã (${countdown}s)`
                        : 'Gửi lại mã SMS'}
                    </Text>
                  </Pressable>
                </View>

                {!!errorMessage && <Text style={styles.formErrorText}>{errorMessage}</Text>}

                <View style={styles.formBtnRow}>
                  <Pressable
                    style={styles.formBackBtn}
                    onPress={() => setIsAcceptMode(false)}
                    disabled={submitting}
                  >
                    <Text style={styles.formBackBtnText}>Quay lại</Text>
                  </Pressable>
                  <Pressable
                    style={styles.formConfirmBtn}
                    onPress={() => handleRespond('ACCEPT')}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.formConfirmBtnText}>Tôi đồng ý</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            )}

            {/* Decline Reason Inline Form */}
            {isDeclineMode && (
              <View style={styles.formContainer}>
                <View style={styles.formHeaderRow}>
                  <Ionicons name="close-circle" size={18} color="#e11d48" />
                  <Text style={[styles.formTitle, { color: '#e11d48' }]}>
                    Xác nhận Từ Chối Nhận Việc
                  </Text>
                </View>
                <Text style={styles.formDesc}>
                  Nêu lý do từ chối (không bắt buộc) để nhà tuyển dụng ghi nhận:
                </Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={3}
                  placeholder="Lý do từ chối..."
                  placeholderTextColor="#94a3b8"
                  value={declineReason}
                  onChangeText={(val) => {
                    setDeclineReason(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  textAlignVertical="top"
                />
                {!!errorMessage && <Text style={styles.formErrorText}>{errorMessage}</Text>}

                <View style={styles.formBtnRow}>
                  <Pressable
                    style={styles.formBackBtn}
                    onPress={() => setIsDeclineMode(false)}
                    disabled={submitting}
                  >
                    <Text style={styles.formBackBtnText}>Quay lại</Text>
                  </Pressable>
                  <Pressable
                    style={styles.formDeclineBtn}
                    onPress={() => handleRespond('DECLINE')}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.formDeclineBtnText}>Xác nhận từ chối</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Modal Footer (Pinned) */}
          <View style={styles.footer}>
            <Pressable style={styles.closeFooterBtn} onPress={onClose}>
              <Text style={styles.closeFooterBtnText}>Đóng</Text>
            </Pressable>

            {/* Only show respond buttons when offer is SENT and not expired */}
            {canRespond && !isAcceptMode && !isDeclineMode && (
              <View style={styles.actionRow}>
                <Pressable
                  style={styles.declineActionBtn}
                  onPress={() => {
                    setErrorMessage('');
                    setIsDeclineMode(true);
                  }}
                >
                  <Text style={styles.declineActionBtnText}>Từ chối nhận việc</Text>
                </Pressable>
                <Pressable
                  style={styles.acceptActionBtn}
                  onPress={() => {
                    setErrorMessage('');
                    setIsAcceptMode(true);
                    handleRequestOtp();
                  }}
                >
                  <Ionicons name="checkmark-circle" size={14} color="#ffffff" />
                  <Text style={styles.acceptActionBtnText}>Đồng ý nhận việc</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '94%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  headerSubBold: {
    fontWeight: '700',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 6,
  },
  scrollArea: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // 4 Summary Cards Grid
  gridBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: '48.6%',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  gridItemEmerald: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  gridItemSlate: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
  gridItemBlue: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  gridItemAmber: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  gridItemOrange: { backgroundColor: '#fff7ed', borderColor: '#fed7aa' },

  gridLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  gridLabelEmerald: { color: '#047857' },
  gridLabelSlate: { color: '#64748b' },
  gridLabelBlue: { color: '#2563eb' },
  gridLabelAmber: { color: '#b45309' },
  gridLabelOrange: { color: '#c2410c' },

  gridValue: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  gridValueEmerald: { color: '#065f46' },
  gridValueSlate: { color: '#1e293b' },
  gridValueBlue: { color: '#1d4ed8' },
  gridValueAmber: { color: '#78350f' },
  gridValueOrange: { color: '#9a3412' },

  gridSub: {
    fontSize: 10,
    marginTop: 3,
  },
  gridSubEmerald: { color: '#059669' },
  gridSubSlate: { color: '#64748b' },
  gridSubBlue: { color: '#64748b' },
  gridSubAmber: { color: '#92400e' },
  gridSubOrange: { color: '#c2410c' },

  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Status Banners
  bannerExpired: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
  },
  bannerAccepted: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
  },
  bannerDeclined: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
  },
  bannerIcon: {
    marginTop: 2,
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitleExpired: { fontSize: 12.5, fontWeight: '800', color: '#9a3412' },
  bannerDescExpired: { fontSize: 11, color: '#9a3412', marginTop: 3, lineHeight: 16 },
  bannerTitleAccepted: { fontSize: 12.5, fontWeight: '800', color: '#065f46' },
  bannerDescAccepted: { fontSize: 11, color: '#047857', marginTop: 3, lineHeight: 16 },
  bannerTitleDeclined: { fontSize: 12.5, fontWeight: '800', color: '#9f1239' },
  bannerDescDeclined: { fontSize: 11, color: '#be123c', marginTop: 3, lineHeight: 16 },

  // Paper Container
  paperContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 22,
    padding: 16,
    marginTop: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  paperTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2563eb',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  paperCompany: {
    fontSize: 11.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  paperDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 14,
  },
  greetingText: {
    fontSize: 13,
    color: '#1e293b',
    marginBottom: 8,
  },
  greetingName: {
    fontWeight: '700',
    color: '#0f172a',
  },
  introParagraph: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 14,
  },

  // Structured Section Card
  sectionCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#cbd5e1',
    marginTop: 8,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  tableLabel: {
    fontSize: 11.5,
    color: '#64748b',
    flex: 1,
  },
  tableValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'right',
    flex: 1.2,
  },
  salaryHighlight: {
    color: '#16a34a',
    fontSize: 13.5,
    fontWeight: '800',
  },
  benefitsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 10,
    marginBottom: 6,
  },
  benefitsListWrap: {
    gap: 4,
    paddingLeft: 4,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748b',
  },
  benefitText: {
    fontSize: 11.5,
    color: '#334155',
  },

  outroParagraph: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 10,
  },
  signatureBlock: {
    marginTop: 14,
    paddingTop: 10,
  },
  signatureIntro: {
    fontSize: 12,
    color: '#64748b',
  },
  signatureName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },

  // Form Container (Accept/Decline)
  formContainer: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  smsNoticeBox: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  smsNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  smsNoticeTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#065f46',
  },
  phoneBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  phoneBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  resendHint: {
    fontSize: 11,
    color: '#64748b',
  },
  resendBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  resendBtnTextDisabled: {
    color: '#94a3b8',
    fontWeight: '500',
  },
  formDesc: {
    fontSize: 11.5,
    color: '#64748b',
    marginBottom: 6,
    lineHeight: 16,
  },
  otpInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
    color: '#0f172a',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 10,
    fontSize: 12,
    color: '#0f172a',
    minHeight: 65,
  },
  formErrorText: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 4,
  },
  formBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  formBackBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  formBackBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  formConfirmBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#059669',
  },
  formConfirmBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  formDeclineBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#e11d48',
  },
  formDeclineBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Modal Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  closeFooterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeFooterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  declineActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecdd3',
    backgroundColor: '#fff1f2',
  },
  declineActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#e11d48',
  },
  acceptActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#059669',
  },
  acceptActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});
