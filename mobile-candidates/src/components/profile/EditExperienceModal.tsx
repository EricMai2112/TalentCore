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
import { ExperienceItem } from '../../types/profile.types';

interface EditExperienceModalProps {
  visible: boolean;
  onClose: () => void;
  experience: ExperienceItem | null;
  onSave: (data: ExperienceItem) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export const EditExperienceModal: React.FC<EditExperienceModalProps> = ({
  visible,
  onClose,
  experience,
  onSave,
  onDelete,
}) => {
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (experience) {
        setCompany(experience.company || '');
        setPosition(experience.position || '');
        setStartDate(experience.startDate || '');
        setEndDate(experience.endDate || '');
        setIsCurrentJob(experience.endDate === 'Hiện tại' || !experience.endDate);
        setDescription(experience.description || '');
        setTechnologies(experience.technologies ? [...experience.technologies] : []);
      } else {
        setCompany('');
        setPosition('');
        setStartDate('');
        setEndDate('');
        setIsCurrentJob(false);
        setDescription('');
        setTechnologies([]);
      }
      setTechInput('');
    }
  }, [visible, experience]);

  const handleAddTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !technologies.includes(trimmed)) {
      setTechnologies([...technologies, trimmed]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (item: string) => {
    setTechnologies(technologies.filter((t) => t !== item));
  };

  const handleSave = async () => {
    if (!company.trim() || !position.trim()) return;
    try {
      setSaving(true);
      await onSave({
        company: company.trim(),
        position: position.trim(),
        startDate: startDate.trim() || undefined,
        endDate: isCurrentJob ? 'Hiện tại' : endDate.trim() || undefined,
        description: description.trim() || undefined,
        technologies: technologies.length > 0 ? technologies : undefined,
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
              {experience ? 'Chỉnh sửa kinh nghiệm' : 'Thêm kinh nghiệm làm việc'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn} disabled={saving}>
              <Ionicons name="close" size={22} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vị trí công việc *</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Frontend Engineer"
                placeholderTextColor="#94a3b8"
                value={position}
                onChangeText={setPosition}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên công ty / Doanh nghiệp *</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: FPT Software"
                placeholderTextColor="#94a3b8"
                value={company}
                onChangeText={setCompany}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.col]}>
                <Text style={styles.label}>Bắt đầu (MM/YYYY)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="01/2022"
                  placeholderTextColor="#94a3b8"
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>

              {!isCurrentJob && (
                <View style={[styles.inputGroup, styles.col]}>
                  <Text style={styles.label}>Kết thúc (MM/YYYY)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="12/2023"
                    placeholderTextColor="#94a3b8"
                    value={endDate}
                    onChangeText={setEndDate}
                  />
                </View>
              )}
            </View>

            <Pressable
              style={styles.checkboxRow}
              onPress={() => setIsCurrentJob(!isCurrentJob)}
            >
              <View style={[styles.checkbox, isCurrentJob && styles.checkboxChecked]}>
                {isCurrentJob && <Ionicons name="checkmark" size={14} color="#ffffff" />}
              </View>
              <Text style={styles.checkboxLabel}>Tôi đang làm việc tại đây</Text>
            </Pressable>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Công nghệ / Kỹ năng sử dụng</Text>
              <View style={styles.techInputRow}>
                <TextInput
                  style={[styles.input, styles.techInput]}
                  placeholder="Nhập công nghệ (VD: React, Node.js)"
                  placeholderTextColor="#94a3b8"
                  value={techInput}
                  onChangeText={setTechInput}
                  onSubmitEditing={handleAddTech}
                />
                <Pressable
                  style={[styles.techAddBtn, !techInput.trim() && styles.disabledBtn]}
                  onPress={handleAddTech}
                  disabled={!techInput.trim()}
                >
                  <Ionicons name="add" size={20} color="#ffffff" />
                </Pressable>
              </View>

              {technologies.length > 0 && (
                <View style={styles.techBadgeContainer}>
                  {technologies.map((t, idx) => (
                    <View key={idx} style={styles.techBadge}>
                      <Text style={styles.techBadgeText}>{t}</Text>
                      <Pressable onPress={() => handleRemoveTech(t)}>
                        <Ionicons name="close-circle" size={16} color="#94a3b8" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mô tả công việc & Thành tích</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Chi tiết công việc và đóng góp tại dự án..."
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {experience && onDelete ? (
              <Pressable style={styles.deleteBtn} onPress={handleDelete} disabled={saving}>
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
              </Pressable>
            ) : null}

            <Pressable style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </Pressable>

            <Pressable
              style={[styles.saveBtn, (!company.trim() || !position.trim()) && styles.disabledBtn]}
              onPress={handleSave}
              disabled={saving || !company.trim() || !position.trim()}
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#7c3aed',
    backgroundColor: '#7c3aed',
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  techInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  techInput: {
    flex: 1,
  },
  techAddBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  techBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  techBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  techBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  textArea: {
    minHeight: 140,
    fontSize: 14,
    lineHeight: 22,
    paddingTop: 12,
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
