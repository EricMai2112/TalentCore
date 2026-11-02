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
import { ProjectItem } from '../../types/profile.types';

interface EditProjectModalProps {
  visible: boolean;
  onClose: () => void;
  project: ProjectItem | null;
  onSave: (data: ProjectItem) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  visible,
  onClose,
  project,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isOngoing, setIsOngoing] = useState(false);
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (project) {
        setName(project.name || '');
        setRole(project.role || '');
        setProjectUrl(project.projectUrl || '');
        setStartDate(project.startDate || '');
        setEndDate(project.endDate || '');
        setIsOngoing(project.endDate === 'Hiện tại' || !project.endDate);
        setDescription(project.description || '');
        setTechnologies(project.technologies ? [...project.technologies] : []);
      } else {
        setName('');
        setRole('');
        setProjectUrl('');
        setStartDate('');
        setEndDate('');
        setIsOngoing(false);
        setDescription('');
        setTechnologies([]);
      }
      setTechInput('');
    }
  }, [visible, project]);

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
    if (!name.trim()) return;
    try {
      setSaving(true);
      await onSave({
        name: name.trim(),
        role: role.trim() || undefined,
        projectUrl: projectUrl.trim() || undefined,
        startDate: startDate.trim() || undefined,
        endDate: isOngoing ? 'Hiện tại' : endDate.trim() || undefined,
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
              {project ? 'Chỉnh sửa dự án' : 'Thêm dự án nổi bật'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn} disabled={saving}>
              <Ionicons name="close" size={22} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên dự án *</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: TalentCore Mobile App"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vai trò trong dự án</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Lead Frontend Developer"
                placeholderTextColor="#94a3b8"
                value={role}
                onChangeText={setRole}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Đường dẫn liên kết / Demo / GitHub</Text>
              <TextInput
                style={styles.input}
                placeholder="https://github.com/..."
                placeholderTextColor="#94a3b8"
                value={projectUrl}
                onChangeText={setProjectUrl}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.col]}>
                <Text style={styles.label}>Bắt đầu (MM/YYYY)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="01/2023"
                  placeholderTextColor="#94a3b8"
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>

              {!isOngoing && (
                <View style={[styles.inputGroup, styles.col]}>
                  <Text style={styles.label}>Kết thúc (MM/YYYY)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="06/2023"
                    placeholderTextColor="#94a3b8"
                    value={endDate}
                    onChangeText={setEndDate}
                  />
                </View>
              )}
            </View>

            <Pressable
              style={styles.checkboxRow}
              onPress={() => setIsOngoing(!isOngoing)}
            >
              <View style={[styles.checkbox, isOngoing && styles.checkboxChecked]}>
                {isOngoing && <Ionicons name="checkmark" size={14} color="#ffffff" />}
              </View>
              <Text style={styles.checkboxLabel}>Dự án đang tiếp tục thực hiện</Text>
            </Pressable>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Công nghệ sử dụng</Text>
              <View style={styles.techInputRow}>
                <TextInput
                  style={[styles.input, styles.techInput]}
                  placeholder="Nhập công nghệ (VD: React Native, GraphQL)"
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
              <Text style={styles.label}>Mô tả dự án</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả chức năng chính và đóng góp của bạn..."
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
            {project && onDelete ? (
              <Pressable style={styles.deleteBtn} onPress={handleDelete} disabled={saving}>
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
              </Pressable>
            ) : null}

            <Pressable style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </Pressable>

            <Pressable
              style={[styles.saveBtn, !name.trim() && styles.disabledBtn]}
              onPress={handleSave}
              disabled={saving || !name.trim()}
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
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
