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
import { CandidateProfile, SocialLinkItem } from '../../types/profile.types';

interface EditPersonalModalProps {
  visible: boolean;
  onClose: () => void;
  profile: CandidateProfile | null;
  defaultName?: string;
  defaultPhone?: string;
  onSave: (data: {
    name?: string;
    headline?: string;
    phone?: string;
    address?: string;
    summary?: string;
    socialLinks?: SocialLinkItem[];
  }) => Promise<void>;
}

const PLATFORM_OPTIONS = [
  'GitHub',
  'LinkedIn',
  'Portfolio',
  'Facebook',
  'Twitter / X',
  'GitLab',
  'Website khác',
];

export const EditPersonalModal: React.FC<EditPersonalModalProps> = ({
  visible,
  onClose,
  profile,
  defaultName = '',
  defaultPhone = '',
  onSave,
}) => {
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [summary, setSummary] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && profile) {
      const existingName =
        typeof profile?.userId === 'object' && profile?.userId !== null
          ? (profile.userId as any).name
          : defaultName;
      setName(existingName || '');

      const existingPhone =
        typeof profile?.userId === 'object' && profile?.userId !== null
          ? (profile.userId as any).phone
          : defaultPhone;
      setPhone(existingPhone || '');

      setHeadline(profile.headline || '');
      setAddress(profile.address || '');
      setSummary(profile.summary || '');
      setSocialLinks(profile.socialLinks ? [...profile.socialLinks] : []);
    }
  }, [visible, profile, defaultName, defaultPhone]);

  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'GitHub', url: '' }]);
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleSocialChange = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave({
        name: name.trim(),
        headline: headline.trim(),
        phone: phone.trim(),
        address: address.trim(),
        summary: summary.trim(),
        socialLinks: socialLinks.filter((item) => item.url.trim().length > 0),
      });
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
            <Text style={styles.headerTitle}>Chỉnh sửa thông tin cá nhân</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} disabled={saving}>
              <Ionicons name="close" size={22} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên đầy đủ"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chức danh nghề nghiệp</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Senior React Native Developer"
                placeholderTextColor="#94a3b8"
                value={headline}
                onChangeText={setHeadline}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.col]}>
                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0912345678"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={[styles.inputGroup, styles.col]}>
                <Text style={styles.label}>Địa chỉ / Khu vực</Text>
                <TextInput
                  style={styles.input}
                  placeholder="TP. Hồ Chí Minh"
                  placeholderTextColor="#94a3b8"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Giới thiệu ngắn về bản thân</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả tóm tắt kỹ năng, thế mạnh và đam mê của bạn..."
                placeholderTextColor="#94a3b8"
                value={summary}
                onChangeText={setSummary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.socialHeader}>
                <Text style={styles.label}>Mạng xã hội & Liên kết</Text>
                <Pressable onPress={handleAddSocialLink} style={styles.addSocialBtn}>
                  <Ionicons name="add" size={16} color="#7c3aed" />
                  <Text style={styles.addSocialBtnText}>Thêm liên kết</Text>
                </Pressable>
              </View>

              {socialLinks.map((item, index) => (
                <View key={index} style={styles.socialItem}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.platformScroll}
                  >
                    {PLATFORM_OPTIONS.map((p) => (
                      <Pressable
                        key={p}
                        onPress={() => handleSocialChange(index, 'platform', p)}
                        style={[
                          styles.platformChip,
                          item.platform === p && styles.platformChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.platformChipText,
                            item.platform === p && styles.platformChipTextActive,
                          ]}
                        >
                          {p}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <View style={styles.socialInputRow}>
                    <TextInput
                      style={[styles.input, styles.socialUrlInput]}
                      placeholder="https://..."
                      placeholderTextColor="#94a3b8"
                      value={item.url}
                      onChangeText={(val) => handleSocialChange(index, 'url', val)}
                      autoCapitalize="none"
                    />
                    <Pressable
                      onPress={() => handleRemoveSocialLink(index)}
                      style={styles.socialRemoveBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color="#dc2626" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
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
  textArea: {
    minHeight: 130,
    fontSize: 14,
    lineHeight: 22,
    paddingTop: 12,
  },
  socialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addSocialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addSocialBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
  },
  socialItem: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  platformScroll: {
    marginBottom: 8,
  },
  platformChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    marginRight: 6,
  },
  platformChipActive: {
    borderColor: '#7c3aed',
    backgroundColor: '#f3e8ff',
  },
  platformChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  platformChipTextActive: {
    color: '#7c3aed',
    fontWeight: '700',
  },
  socialInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  socialUrlInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 9,
  },
  socialRemoveBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
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
