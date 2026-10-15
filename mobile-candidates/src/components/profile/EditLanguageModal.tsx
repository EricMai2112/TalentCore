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
import { LanguageItem } from '../../types/profile.types';

interface EditLanguageModalProps {
  visible: boolean;
  onClose: () => void;
  languages: LanguageItem[];
  onSave: (languages: LanguageItem[]) => Promise<void>;
}

const LANGUAGE_SUGGESTIONS = [
  'Tiếng Việt',
  'Tiếng Anh',
  'Tiếng Nhật',
  'Tiếng Hàn',
  'Tiếng Trung (Mandarin)',
  'Tiếng Pháp',
  'Tiếng Đức',
];

const PROFICIENCY_LEVELS = [
  'Cơ bản (Elementary)',
  'Giao tiếp thông thường (Intermediate)',
  'Thành thạo công việc (Professional)',
  'Bản ngữ / Thành thạo như người bản xứ (Native / Bilingual)',
];

export const EditLanguageModal: React.FC<EditLanguageModalProps> = ({
  visible,
  onClose,
  languages,
  onSave,
}) => {
  const [langList, setLangList] = useState<LanguageItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setLangList(
        languages && languages.length > 0
          ? JSON.parse(JSON.stringify(languages))
          : [{ language: '', proficiency: 'Thành thạo công việc (Professional)' }],
      );
    }
  }, [visible, languages]);

  const handleAdd = () => {
    setLangList([
      ...langList,
      { language: '', proficiency: 'Thành thạo công việc (Professional)' },
    ]);
  };

  const handleRemove = (index: number) => {
    setLangList(langList.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof LanguageItem, val: string) => {
    const updated = [...langList];
    updated[index] = { ...updated[index], [field]: val };
    setLangList(updated);
  };

  const handleSave = async () => {
    const valid = langList
      .map((item) => ({
        language: item.language.trim(),
        proficiency: item.proficiency?.trim() || undefined,
      }))
      .filter((item) => item.language.length > 0);

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
              <Text style={styles.headerTitle}>Ngoại ngữ</Text>
              <Text style={styles.headerSubtitle}>Trình độ ngoại ngữ và khả năng giao tiếp</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} disabled={saving}>
              <Ionicons name="close" size={22} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {langList.map((item, index) => (
              <View key={index} style={styles.langCard}>
                <View style={styles.langCardHeader}>
                  <Text style={styles.langIndexText}>Ngoại ngữ #{index + 1}</Text>
                  <Pressable onPress={() => handleRemove(index)} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={16} color="#dc2626" />
                  </Pressable>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tên ngoại ngữ *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: Tiếng Anh, Tiếng Nhật"
                    placeholderTextColor="#94a3b8"
                    value={item.language}
                    onChangeText={(v) => handleChange(index, 'language', v)}
                  />

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.suggestionsScroll}
                  >
                    {LANGUAGE_SUGGESTIONS.map((sug) => (
                      <Pressable
                        key={sug}
                        onPress={() => handleChange(index, 'language', sug)}
                        style={[
                          styles.sugChip,
                          item.language === sug && styles.sugChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.sugChipText,
                            item.language === sug && styles.sugChipTextActive,
                          ]}
                        >
                          {sug}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mức độ thông thạo</Text>
                  <View style={styles.levelsColumn}>
                    {PROFICIENCY_LEVELS.map((lvl) => (
                      <Pressable
                        key={lvl}
                        onPress={() => handleChange(index, 'proficiency', lvl)}
                        style={[
                          styles.levelRadio,
                          item.proficiency === lvl && styles.levelRadioActive,
                        ]}
                      >
                        <View
                          style={[
                            styles.radioCircle,
                            item.proficiency === lvl && styles.radioCircleActive,
                          ]}
                        >
                          {item.proficiency === lvl && (
                            <View style={styles.radioDot} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.levelRadioText,
                            item.proficiency === lvl && styles.levelRadioTextActive,
                          ]}
                        >
                          {lvl}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            ))}

            <Pressable style={styles.addMoreBtn} onPress={handleAdd}>
              <Ionicons name="add-circle-outline" size={20} color="#7c3aed" />
              <Text style={styles.addMoreBtnText}>Thêm ngoại ngữ khác</Text>
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
                <Text style={styles.saveBtnText}>Lưu ngoại ngữ</Text>
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
  langCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  langCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  langIndexText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7c3aed',
    textTransform: 'uppercase',
  },
  removeBtn: {
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
  suggestionsScroll: {
    marginTop: 8,
  },
  sugChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    marginRight: 6,
  },
  sugChipActive: {
    borderColor: '#7c3aed',
    backgroundColor: '#f3e8ff',
  },
  sugChipText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  sugChipTextActive: {
    color: '#7c3aed',
    fontWeight: '700',
  },
  levelsColumn: {
    gap: 6,
  },
  levelRadio: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    gap: 10,
  },
  levelRadioActive: {
    borderColor: '#7c3aed',
    backgroundColor: '#faf5ff',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#7c3aed',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7c3aed',
  },
  levelRadioText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  levelRadioTextActive: {
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
