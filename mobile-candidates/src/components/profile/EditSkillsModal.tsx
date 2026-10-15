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
import { SkillItem } from '../../types/profile.types';

interface EditSkillsModalProps {
  visible: boolean;
  onClose: () => void;
  skills: SkillItem[];
  onSave: (skills: SkillItem[]) => Promise<void>;
}

const PROFICIENCY_OPTIONS = [
  { label: 'Mới bắt đầu', value: 'BEGINNER' },
  { label: 'Trung bình', value: 'INTERMEDIATE' },
  { label: 'Thành thạo', value: 'ADVANCED' },
  { label: 'Chuyên gia', value: 'EXPERT' },
];

export const EditSkillsModal: React.FC<EditSkillsModalProps> = ({
  visible,
  onClose,
  skills,
  onSave,
}) => {
  const [skillList, setSkillList] = useState<SkillItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setSkillList(
        skills && skills.length > 0
          ? JSON.parse(JSON.stringify(skills))
          : [{ name: '', proficiency: 'INTERMEDIATE', yearsOfExperience: 1 }],
      );
    }
  }, [visible, skills]);

  const handleAddSkill = () => {
    setSkillList([
      ...skillList,
      { name: '', proficiency: 'INTERMEDIATE', yearsOfExperience: 1 },
    ]);
  };

  const handleRemoveSkill = (index: number) => {
    setSkillList(skillList.filter((_, i) => i !== index));
  };

  const handleChangeSkill = (index: number, field: keyof SkillItem, val: any) => {
    const updated = [...skillList];
    updated[index] = { ...updated[index], [field]: val };
    setSkillList(updated);
  };

  const handleSave = async () => {
    const valid = skillList
      .map((s) => ({
        ...s,
        name: s.name.trim(),
        yearsOfExperience: s.yearsOfExperience ? Number(s.yearsOfExperience) : undefined,
      }))
      .filter((s) => s.name.length > 0);

    try {
      setSaving(true);
      await onSave(valid);
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
            <View>
              <Text style={styles.headerTitle}>Kỹ năng chuyên môn</Text>
              <Text style={styles.headerSubtitle}>Liệt kê các kỹ năng kỹ thuật & chuyên môn</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} disabled={saving}>
              <Ionicons name="close" size={22} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {skillList.map((item, index) => (
              <View key={index} style={styles.skillCard}>
                <View style={styles.skillCardHeader}>
                  <Text style={styles.skillIndexText}>Kỹ năng #{index + 1}</Text>
                  <Pressable
                    onPress={() => handleRemoveSkill(index)}
                    style={styles.removeSkillBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color="#dc2626" />
                  </Pressable>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tên kỹ năng *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: React Native, Node.js, UI/UX"
                    placeholderTextColor="#94a3b8"
                    value={item.name}
                    onChangeText={(v) => handleChangeSkill(index, 'name', v)}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.col]}>
                    <Text style={styles.label}>Mức độ thông thạo</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {PROFICIENCY_OPTIONS.map((opt) => (
                        <Pressable
                          key={opt.value}
                          onPress={() => handleChangeSkill(index, 'proficiency', opt.value)}
                          style={[
                            styles.levelChip,
                            item.proficiency === opt.value && styles.levelChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.levelChipText,
                              item.proficiency === opt.value && styles.levelChipTextActive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={[styles.inputGroup, { width: 100 }]}>
                    <Text style={styles.label}>Năm KN</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                      value={item.yearsOfExperience !== undefined ? String(item.yearsOfExperience) : ''}
                      onChangeText={(v) => handleChangeSkill(index, 'yearsOfExperience', v ? parseInt(v, 10) : undefined)}
                    />
                  </View>
                </View>
              </View>
            ))}

            <Pressable style={styles.addMoreBtn} onPress={handleAddSkill}>
              <Ionicons name="add-circle-outline" size={20} color="#7c3aed" />
              <Text style={styles.addMoreBtnText}>Thêm kỹ năng khác</Text>
            </Pressable>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </Pressable>

            <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveBtnText}>Lưu kỹ năng</Text>
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
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  skillCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  skillCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillIndexText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7c3aed',
    textTransform: 'uppercase',
  },
  removeSkillBtn: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  levelChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginRight: 6,
  },
  levelChipActive: {
    borderColor: '#7c3aed',
    backgroundColor: '#f3e8ff',
  },
  levelChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  levelChipTextActive: {
    color: '#7c3aed',
    fontWeight: '700',
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#c4b5fd',
    backgroundColor: '#faf5ff',
    marginVertical: 8,
  },
  addMoreBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7c3aed',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
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
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
