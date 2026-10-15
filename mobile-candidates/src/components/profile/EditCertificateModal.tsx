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
import { CertificateItem } from '../../types/profile.types';

interface EditCertificateModalProps {
  visible: boolean;
  onClose: () => void;
  certificate: CertificateItem | null;
  onSave: (data: CertificateItem) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export const EditCertificateModal: React.FC<EditCertificateModalProps> = ({
  visible,
  onClose,
  certificate,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [scoreOrLevel, setScoreOrLevel] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (certificate) {
        setName(certificate.name || '');
        setOrganization(certificate.organization || '');
        setScoreOrLevel(certificate.scoreOrLevel || '');
        setIssueDate(certificate.issueDate || '');
        setCredentialUrl((certificate as any).credentialUrl || '');
      } else {
        setName('');
        setOrganization('');
        setScoreOrLevel('');
        setIssueDate('');
        setCredentialUrl('');
      }
    }
  }, [visible, certificate]);

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      setSaving(true);
      await onSave({
        name: name.trim(),
        organization: organization.trim() || undefined,
        scoreOrLevel: scoreOrLevel.trim() || undefined,
        issueDate: issueDate.trim() || undefined,
        ...(credentialUrl.trim() ? { credentialUrl: credentialUrl.trim() } : {}),
      } as any);
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
              {certificate ? 'Chỉnh sửa chứng chỉ' : 'Thêm chứng chỉ'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn} disabled={saving}>
              <Ionicons name="close" size={22} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên chứng chỉ / Khóa học *</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: AWS Certified Solutions Architect"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tổ chức cấp</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Amazon Web Services"
                placeholderTextColor="#94a3b8"
                value={organization}
                onChangeText={setOrganization}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.col]}>
                <Text style={styles.label}>Điểm / Xếp loại</Text>
                <TextInput
                  style={styles.input}
                  placeholder="850 / Xuất sắc"
                  placeholderTextColor="#94a3b8"
                  value={scoreOrLevel}
                  onChangeText={setScoreOrLevel}
                />
              </View>

              <View style={[styles.inputGroup, styles.col]}>
                <Text style={styles.label}>Ngày cấp (MM/YYYY)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="08/2023"
                  placeholderTextColor="#94a3b8"
                  value={issueDate}
                  onChangeText={setIssueDate}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Đường dẫn xác thực (URL)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                placeholderTextColor="#94a3b8"
                value={credentialUrl}
                onChangeText={setCredentialUrl}
                autoCapitalize="none"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {certificate && onDelete ? (
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
    maxHeight: '85%',
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
