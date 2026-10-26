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
import { CustomSection, CustomSectionItem } from '../../types/profile.types';

interface EditCustomSectionModalProps {
  visible: boolean;
  onClose: () => void;
  initialData?: CustomSection | null;
  sectionIndex?: number | null;
  allCustomSections: CustomSection[];
  onSave: (sections: CustomSection[]) => Promise<void>;
}

const SECTION_TITLE_SUGGESTIONS = [
  'Giải thưởng & Thành tích',
  'Hoạt động ngoại khóa',
  'Dự án tình nguyện',
  'Ấn phẩm & Nghiên cứu khoa học',
  'Khóa học & Hội thảo',
  'Sở thích & Thế mạnh cá nhân',
];

export const EditCustomSectionModal: React.FC<EditCustomSectionModalProps> = ({
  visible,
  onClose,
  initialData,
  sectionIndex,
  allCustomSections,
  onSave,
}) => {
  const [sectionTitle, setSectionTitle] = useState('');
  const [items, setItems] = useState<CustomSectionItem[]>([]);
  const [saving, setSaving] = useState(false);

  const isEditMode = sectionIndex !== null && sectionIndex !== undefined;

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setSectionTitle(initialData.sectionTitle || '');
        setItems(
          initialData.items && initialData.items.length > 0
            ? JSON.parse(JSON.stringify(initialData.items))
            : [{ title: '', subtitle: '', date: '', description: '', url: '' }],
        );
      } else {
        setSectionTitle('');
        setItems([{ title: '', subtitle: '', date: '', description: '', url: '' }]);
      }
    }
  }, [visible, initialData]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { title: '', subtitle: '', date: '', description: '', url: '' },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof CustomSectionItem, val: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    setItems(updated);
  };

  const handleSave = async () => {
    if (!sectionTitle.trim()) return;

    const validItems = items
      .map((it) => ({
        title: it.title.trim(),
        subtitle: it.subtitle?.trim() || undefined,
        date: it.date?.trim() || undefined,
        description: it.description?.trim() || undefined,
        url: it.url?.trim() || undefined,
      }))
      .filter((it) => it.title.length > 0);

    const newSec: CustomSection = {
      sectionTitle: sectionTitle.trim(),
      items: validItems,
    };

    let updatedList: CustomSection[] = [];
    if (isEditMode) {
      updatedList = allCustomSections.map((item, idx) =>
        idx === sectionIndex ? newSec : item,
      );
    } else {
      updatedList = [...allCustomSections, newSec];
    }

    try {
      setSaving(true);
      await onSave(updatedList);
      onClose();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!isEditMode) return;
    const updatedList = allCustomSections.filter((_, idx) => idx !== sectionIndex);
    try {
      setSaving(true);
      await onSave(updatedList);
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
              <Text style={styles.headerTitle}>
                {isEditMode ? 'Chỉnh sửa mục tùy chỉnh' : 'Thêm mục bổ sung & tùy chỉnh'}
              </Text>
              <Text style={styles.headerSubtitle}>Tùy biến các phần nội dung riêng của bạn</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} disabled={saving}>
              <Ionicons name="close" size={22} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên mục / Tiêu đề nhóm *</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Giải thưởng, Hoạt động ngoại khóa..."
                placeholderTextColor="#94a3b8"
                value={sectionTitle}
                onChangeText={setSectionTitle}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.suggestionsScroll}
              >
                {SECTION_TITLE_SUGGESTIONS.map((sug) => (
                  <Pressable
                    key={sug}
                    onPress={() => setSectionTitle(sug)}
                    style={[
                      styles.sugChip,
                      sectionTitle === sug && styles.sugChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sugChipText,
                        sectionTitle === sug && styles.sugChipTextActive,
                      ]}
                    >
                      {sug}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.sectionDividerText}>Nội dung chi tiết trong mục ({items.length})</Text>

            {items.map((it, idx) => (
              <View key={idx} style={styles.itemBox}>
                <View style={styles.itemBoxHeader}>
                  <Text style={styles.itemIndexText}>Mục #{idx + 1}</Text>
                  {items.length > 1 && (
                    <Pressable onPress={() => handleRemoveItem(idx)} style={styles.removeItemBtn}>
                      <Ionicons name="trash-outline" size={16} color="#dc2626" />
                    </Pressable>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tiêu đề mục *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: Quán quân Hackathon FPT 2023"
                    placeholderTextColor="#94a3b8"
                    value={it.title}
                    onChangeText={(v) => handleItemChange(idx, 'title', v)}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.col]}>
                    <Text style={styles.label}>Phụ đề / Tổ chức / Vai trò</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="VD: Trưởng nhóm"
                      placeholderTextColor="#94a3b8"
                      value={it.subtitle || ''}
                      onChangeText={(v) => handleItemChange(idx, 'subtitle', v)}
                    />
                  </View>

                  <View style={[styles.inputGroup, styles.col]}>
                    <Text style={styles.label}>Thời gian</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="11/2023"
                      placeholderTextColor="#94a3b8"
                      value={it.date || ''}
                      onChangeText={(v) => handleItemChange(idx, 'date', v)}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Đường dẫn liên kết (tùy chọn)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://..."
                    placeholderTextColor="#94a3b8"
                    value={it.url || ''}
                    onChangeText={(v) => handleItemChange(idx, 'url', v)}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mô tả chi tiết</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Nêu rõ hoạt động, đóng góp và kết quả đạt được..."
                    placeholderTextColor="#94a3b8"
                    value={it.description || ''}
                    onChangeText={(v) => handleItemChange(idx, 'description', v)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            ))}

            <Pressable style={styles.addMoreItemBtn} onPress={handleAddItem}>
              <Ionicons name="add-circle-outline" size={20} color="#7c3aed" />
              <Text style={styles.addMoreItemBtnText}>Thêm nội dung khác vào mục này</Text>
            </Pressable>
          </ScrollView>

          <View style={styles.footer}>
            {isEditMode && (
              <Pressable
                style={styles.deleteBtn}
                onPress={handleDeleteSection}
                disabled={saving}
              >
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
              </Pressable>
            )}

            <Pressable style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </Pressable>

            <Pressable
              style={[styles.saveBtn, !sectionTitle.trim() && styles.disabledBtn]}
              onPress={handleSave}
              disabled={saving || !sectionTitle.trim()}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveBtnText}>Lưu mục tùy chỉnh</Text>
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
  textArea: {
    minHeight: 120,
    fontSize: 14,
    lineHeight: 22,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
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
  sectionDividerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8,
    marginBottom: 10,
  },
  itemBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  itemBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemIndexText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7c3aed',
    textTransform: 'uppercase',
  },
  removeItemBtn: {
    padding: 4,
  },
  addMoreItemBtn: {
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
  addMoreItemBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7c3aed',
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
