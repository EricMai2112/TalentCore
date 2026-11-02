import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminService, InterviewItem, StaffUser } from '../../../services/admin.services';
import CustomSelect from '../../../components/common/CustomSelect';

interface DeptScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  interview: InterviewItem | null;
  staffList: StaffUser[];
  onSuccess: () => void;
  isHrAdmin: boolean;
}

export const DeptScheduleModal: React.FC<DeptScheduleModalProps> = ({
  visible,
  onClose,
  interview,
  staffList,
  onSuccess,
  isHrAdmin,
}) => {
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [locationType, setLocationType] = useState<'ONLINE' | 'OFFSITE'>('ONLINE');
  const [meetingLink, setMeetingLink] = useState<string>('');
  const [offsiteLocation, setOffsiteLocation] = useState<string>(
    'Tầng 1, Tòa nhà Landmark 81, 720A Điện Biên Phủ, Bình Thạnh, TP.HCM'
  );
  const [selectedInterviewerId, setSelectedInterviewerId] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Helper to generate clean Jitsi URL without accents/spaces
  const generateJitsiUrl = (dept?: string, candidate?: string, title?: string) => {
    const sanitize = (str?: string) => {
      if (!str) return '';
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-zA-Z0-9]/g, '')
        .trim();
    };

    const dSlug = sanitize(dept) || 'PhongBan';
    const cSlug = sanitize(candidate) || 'UngVien';
    const jSlug = sanitize(title) || 'ViTri';

    return `https://meet.jit.si/TalentCore-${dSlug}-${cSlug}-${jSlug}`;
  };

  const cand = interview?.candidateId;
  const candName = typeof cand === 'object' ? cand?.fullName || cand?.name : 'Ứng viên';
  const job = interview?.jobDescriptionId;
  const jobTitle = typeof job === 'object' ? job?.title : 'Vị trí tuyển dụng';
  const deptName =
    typeof job === 'object' && typeof job?.departmentId === 'object'
      ? (job?.departmentId as any)?.name
      : 'Phòng ban';
  const deptId =
    typeof job === 'object' && typeof job?.departmentId === 'object'
      ? (job?.departmentId as any)?._id
      : typeof job === 'object'
      ? (job as any)?.departmentId
      : undefined;

  useEffect(() => {
    if (visible && interview) {
      // Date default
      let defaultDate = new Date().toISOString().split('T')[0];
      if (interview.date) {
        try {
          defaultDate = new Date(interview.date).toISOString().split('T')[0];
        } catch {}
      }
      setDate(defaultDate);
      setStartTime(interview.startTime || '09:00');
      setEndTime(interview.endTime || '10:00');

      const locType = (interview.locationType as 'ONLINE' | 'OFFSITE') || 'ONLINE';
      setLocationType(locType);

      const autoUrl = generateJitsiUrl(deptName, candName, jobTitle);
      setMeetingLink(interview.meetingLink || autoUrl);

      setOffsiteLocation(
        interview.offsiteLocation ||
          'Tầng 1, Tòa nhà Landmark 81, 720A Điện Biên Phủ, Bình Thạnh, TP.HCM'
      );

      // Existing interviewer
      const existingInterviewerId =
        typeof interview.interviewerId === 'object'
          ? interview.interviewerId?._id
          : interview.interviewerId || '';
      setSelectedInterviewerId(existingInterviewerId || '');
    }
  }, [visible, interview]);

  // Filter staff list according to department if possible
  const interviewerOptions = useMemo(() => {
    let list = staffList;
    if (deptId) {
      const matched = staffList.filter((u) => {
        const uDeptId =
          typeof u.departmentId === 'object' ? u.departmentId?._id : u.departmentId;
        return uDeptId === deptId;
      });
      if (matched.length > 0) list = matched;
    }
    return list.map((u) => ({
      value: u._id,
      label: `${u.name} (${u.role || 'Nhân viên'})`,
    }));
  }, [staffList, deptId]);

  const handleSubmit = async () => {
    if (!interview) return;
    if (!date) {
      Alert.alert('Lỗi', 'Vui lòng chọn ngày phỏng vấn (YYYY-MM-DD).');
      return;
    }
    if (!selectedInterviewerId) {
      Alert.alert('Lỗi', 'Vui lòng chọn người phỏng vấn (Interviewer).');
      return;
    }

    try {
      setSubmitting(true);
      await adminService.submitDeptSchedule(interview._id, {
        date,
        startTime,
        endTime,
        locationType,
        meetingLink: locationType === 'ONLINE' ? meetingLink.trim() : undefined,
        offsiteLocation: locationType === 'OFFSITE' ? offsiteLocation.trim() : undefined,
        interviewerId: selectedInterviewerId,
        interviewerIds: [selectedInterviewerId],
        isHrAdmin: !!isHrAdmin,
        byHr: !!isHrAdmin,
      });

      Alert.alert(
        'Thành công',
        isHrAdmin
          ? 'Đã cập nhật lịch phỏng vấn thành công.'
          : 'Đã xếp lịch phỏng vấn và gửi đề xuất cho HR duyệt.'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert(
        'Lỗi',
        err?.response?.data?.message || err?.message || 'Không thể lưu lịch phỏng vấn.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible || !interview) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>
                {isHrAdmin
                  ? 'Chỉnh sửa Lịch phỏng vấn & Interviewer'
                  : 'Xếp lịch Phỏng vấn & Chọn Interviewer'}
              </Text>
              <Text style={styles.headerSub}>
                Ứng viên: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{candName}</Text> • {jobTitle}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* 1. Ngày phỏng vấn */}
            <Text style={styles.inputLabel}>Ngày phỏng vấn (YYYY-MM-DD) *</Text>
            <View style={styles.inputBox}>
              <Ionicons name="calendar-outline" size={16} color="#64748B" />
              <TextInput
                style={styles.textInput}
                value={date}
                onChangeText={setDate}
                placeholder="2026-10-30"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* 2. Giờ bắt đầu & Giờ kết thúc */}
            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Giờ bắt đầu *</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="time-outline" size={16} color="#64748B" />
                  <TextInput
                    style={styles.textInput}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="09:00"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Giờ kết thúc *</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="time-outline" size={16} color="#64748B" />
                  <TextInput
                    style={styles.textInput}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="10:00"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>
            </View>

            {/* 3. Người phỏng vấn (Interviewer) */}
            <Text style={styles.inputLabel}>Người phỏng vấn (Interviewer) *</Text>
            <CustomSelect
              value={selectedInterviewerId}
              onChange={(val) => setSelectedInterviewerId(val)}
              options={[
                { value: '', label: '-- Chọn người phỏng vấn --' },
                ...interviewerOptions,
              ]}
              placeholder="Chọn người phỏng vấn"
              containerStyle={{ marginBottom: 14 }}
            />

            {/* 4. Hình thức phỏng vấn */}
            <Text style={styles.inputLabel}>Hình thức phỏng vấn *</Text>
            <View style={styles.locationToggleRow}>
              <TouchableOpacity
                style={[
                  styles.locationToggleBtn,
                  locationType === 'ONLINE' && styles.locationToggleBtnActive,
                ]}
                onPress={() => setLocationType('ONLINE')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="videocam"
                  size={16}
                  color={locationType === 'ONLINE' ? '#2563EB' : '#64748B'}
                />
                <Text
                  style={[
                    styles.locationToggleText,
                    locationType === 'ONLINE' && styles.locationToggleTextActive,
                  ]}
                >
                  Trực tuyến (Meet)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.locationToggleBtn,
                  locationType === 'OFFSITE' && styles.locationToggleBtnActive,
                ]}
                onPress={() => setLocationType('OFFSITE')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="business"
                  size={16}
                  color={locationType === 'OFFSITE' ? '#2563EB' : '#64748B'}
                />
                <Text
                  style={[
                    styles.locationToggleText,
                    locationType === 'OFFSITE' && styles.locationToggleTextActive,
                  ]}
                >
                  Trực tiếp (Offsite)
                </Text>
              </TouchableOpacity>
            </View>

            {/* If ONLINE: Meeting link */}
            {locationType === 'ONLINE' ? (
              <View style={{ marginBottom: 14 }}>
                <Text style={styles.inputLabel}>Liên kết phòng họp (Meet/Jitsi) *</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="link-outline" size={16} color="#64748B" />
                  <TextInput
                    style={styles.textInput}
                    value={meetingLink}
                    onChangeText={setMeetingLink}
                    placeholder="https://meet.jit.si/..."
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <Text style={styles.hintText}>
                  Hệ thống tự động sinh phòng họp trực tuyến bảo mật cho ứng viên.
                </Text>
              </View>
            ) : (
              <View style={{ marginBottom: 14 }}>
                <Text style={styles.inputLabel}>Địa điểm phỏng vấn trực tiếp *</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="location-outline" size={16} color="#64748B" />
                  <TextInput
                    style={styles.textInput}
                    value={offsiteLocation}
                    onChangeText={setOffsiteLocation}
                    placeholder="Địa chỉ phòng phỏng vấn..."
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
              <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={17} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>
                    {isHrAdmin ? 'Lưu lịch phỏng vấn' : 'Gửi đề xuất cho HR duyệt'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  dragHandle: {
    width: 38,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  locationToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  locationToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  locationToggleBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  locationToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  locationToggleTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  hintText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: -6,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default DeptScheduleModal;
