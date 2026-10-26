import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
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
import { EducationItem } from '../../types/profile.types';

interface EditEducationModalProps {
  visible: boolean;
  onClose: () => void;
  education: EducationItem | null;
  onSave: (data: EducationItem) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export const EditEducationModal: React.FC<EditEducationModalProps> = ({
  visible,
  onClose,
  education,
  onSave,
  onDelete,
}) => {
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [major, setMajor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [gpa, setGpa] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (education) {
        setInstitution(education.institution || '');
        setDegree(education.degree || '');
        setMajor(education.major || '');
        setStartDate(education.startDate || '');
        setEndDate(education.endDate || '');
        setGpa(education.gpa !== undefined ? String(education.gpa) : '');
      } else {
        setInstitution('');
        setDegree('');
        setMajor('');
        setStartDate('');
        setEndDate('');
        setGpa('');
      }
    }
  }, [visible, education]);

  const handleSave = async () => {
    if (!institution.trim()) return;
    try {
      setSaving(true);
      await onSave({
        institution: institution.trim(),
        degree: degree.trim(),
        major: major.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        gpa: gpa.trim() ? parseFloat(gpa.trim()) : undefined,
      });
      onClose();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      setSaving(true);
      await onDelete();
      onClose();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {education ? 'Chỉnh sửa học vấn' : 'Thêm trình độ học vấn'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn} disabled={saving}>
              <Ionicons name="close" size={22} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Trường / Cơ sở đào tạo *</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Đại học Công nghiệp TP.HCM"
                placeholderTextColor="#94a3b8"
                value={institution}
                onChangeText={setInstitution}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.col]}>
                <Text style={styles.label}>Bằng cấp</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: Cử nhân, Kỹ sư"
                  placeholderTextColor="#94a3b8"
                  value={degree}
                  onChangeText={setDegree}
                />
              </View>

              <View style={[styles.inputGroup, styles.col]}>
                <Text style={styles.label}>Chuyên ngành</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: Khoa học máy tính"
                  placeholderTextColor="#94a3b8"
                  value={major}
                  onChangeText={setMajor}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.col]}>
                <Text style={styles.label}>Bắt đầu (YYYY)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2020"
                  placeholderTextColor="#94a3b8"
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>

              <View style={[styles.inputGroup, styles.col]}>
                <Text style={styles.label}>Tốt nghiệp (YYYY)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2024"
                  placeholderTextColor="#94a3b8"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>

              <View style={[styles.inputGroup, { width: 80 }]}>
                <Text style={styles.label}>GPA</Text>
                <TextInput
                  style={styles.input}
                  placeholder="3.5"
                  placeholderTextColor="#94a3b8"
                  keyboardType="decimal-pad"
                  value={gpa}
                  onChangeText={setGpa}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {education && onDelete ? (
              <Pressable style={styles.deleteBtn} onPress={handleDelete} disabled={saving}>
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
              </Pressable>
            ) : null}

            <Pressable style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </Pressable>

            <Pressable
              style={[styles.saveBtn, !institution.trim() && styles.disabledBtn]}
              onPress={handleSave}
              disabled={saving || !institution.trim()}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveBtnText}>Lưu</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  deleteBtn: {
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
