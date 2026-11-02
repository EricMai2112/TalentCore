import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CandidateProfile } from '../../types/profile.types';
import { profileService } from '../../services/profile.service';

interface ProfilesManagerModalProps {
  visible: boolean;
  onClose: () => void;
  profiles: CandidateProfile[];
  currentProfileId: string;
  onSelectProfile: (profile: CandidateProfile) => void;
  onRefreshProfiles: () => Promise<void>;
}

export const ProfilesManagerModal: React.FC<ProfilesManagerModalProps> = ({
  visible,
  onClose,
  profiles,
  currentProfileId,
  onSelectProfile,
  onRefreshProfiles,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [cloneFromId, setCloneFromId] = useState<string>('');
  const [loadingAction, setLoadingAction] = useState(false);

  const handleCreate = async () => {
    if (!newProfileName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên cho hồ sơ mới.');
      return;
    }

    try {
      setLoadingAction(true);
      const created = await profileService.createProfile(
        newProfileName.trim(),
        cloneFromId || undefined,
      );
      await onRefreshProfiles();
      onSelectProfile(created);
      setIsCreating(false);
      setNewProfileName('');
      setCloneFromId('');
      Alert.alert('Thành công', 'Đã tạo hồ sơ mới thành công!');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tạo hồ sơ.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSetDefault = async (profileId: string) => {
    try {
      setLoadingAction(true);
      await profileService.setDefault(profileId);
      await onRefreshProfiles();
      Alert.alert('Thành công', 'Đã đặt làm hồ sơ mặc định.');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể đặt mặc định.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = (profileId: string) => {
    if (profiles.length <= 1) {
      Alert.alert('Lưu ý', 'Bạn phải giữ lại ít nhất 1 hồ sơ.');
      return;
    }

    Alert.alert(
      'Xóa hồ sơ',
      'Bạn có chắc chắn muốn xóa hồ sơ này? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoadingAction(true);
              await profileService.deleteProfile(profileId);
              await onRefreshProfiles();
              const remaining = profiles.filter((p) => p._id !== profileId);
              if (currentProfileId === profileId && remaining.length > 0) {
                onSelectProfile(remaining[0]);
              }
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Xóa hồ sơ thất bại.');
            } finally {
              setLoadingAction(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Quản lý danh sách hồ sơ</Text>
              <Text style={styles.headerSubtitle}>
                Bạn có {profiles.length} hồ sơ nghề nghiệp riêng biệt
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} disabled={loadingAction}>
              <Ionicons name="close" size={22} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {isCreating ? (
              <View style={styles.createCard}>
                <Text style={styles.createTitle}>Tạo hồ sơ nghề nghiệp mới</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tên hồ sơ *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: Fullstack Developer, Frontend React..."
                    placeholderTextColor="#94a3b8"
                    value={newProfileName}
                    onChangeText={setNewProfileName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Sao chép dữ liệu từ hồ sơ có sẵn:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cloneScroll}>
                    <Pressable
                      onPress={() => setCloneFromId('')}
                      style={[
                        styles.cloneChip,
                        !cloneFromId && styles.cloneChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.cloneChipText,
                          !cloneFromId && styles.cloneChipTextActive,
                        ]}
                      >
                        Tạo hồ sơ trống
                      </Text>
                    </Pressable>

                    {profiles.map((p) => (
                      <Pressable
                        key={p._id}
                        onPress={() => setCloneFromId(p._id)}
                        style={[
                          styles.cloneChip,
                          cloneFromId === p._id && styles.cloneChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.cloneChipText,
                            cloneFromId === p._id && styles.cloneChipTextActive,
                          ]}
                        >
                          Từ: {p.profileName}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.createActionsRow}>
                  <Pressable
                    style={styles.cancelCreateBtn}
                    onPress={() => {
                      setIsCreating(false);
                      setNewProfileName('');
                      setCloneFromId('');
                    }}
                    disabled={loadingAction}
                  >
                    <Text style={styles.cancelCreateBtnText}>Hủy</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.submitCreateBtn,
                      !newProfileName.trim() && styles.disabledBtn,
                    ]}
                    onPress={handleCreate}
                    disabled={loadingAction || !newProfileName.trim()}
                  >
                    {loadingAction ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.submitCreateBtnText}>Tạo hồ sơ</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable style={styles.addBtn} onPress={() => setIsCreating(true)}>
                <Ionicons name="add-circle-outline" size={20} color="#7c3aed" />
                <Text style={styles.addBtnText}>Tạo thêm hồ sơ mới</Text>
              </Pressable>
            )}

            <View style={styles.profilesList}>
              {profiles.map((item) => {
                const isSelected = item._id === currentProfileId;
                return (
                  <View
                    key={item._id}
                    style={[styles.profileItem, isSelected && styles.profileItemActive]}
                  >
                    <View style={styles.profileItemTop}>
                      <View style={styles.profileItemInfo}>
                        <View style={styles.profileItemNameRow}>
                          <Text style={styles.profileItemName}>{item.profileName}</Text>
                          {item.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Ionicons name="star" size={10} color="#16a34a" />
                              <Text style={styles.defaultBadgeText}>Mặc định</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.profileItemHeadline}>
                          {item.headline || 'Chưa cập nhật chức danh'}
                        </Text>
                      </View>

                      {isSelected ? (
                        <View style={styles.currentTag}>
                          <Ionicons name="checkmark-circle" size={18} color="#7c3aed" />
                          <Text style={styles.currentTagText}>Đang xem</Text>
                        </View>
                      ) : (
                        <Pressable
                          style={styles.selectBtn}
                          onPress={() => {
                            onSelectProfile(item);
                            onClose();
                          }}
                        >
                          <Text style={styles.selectBtnText}>Chuyển sang</Text>
                        </Pressable>
                      )}
                    </View>

                    <View style={styles.profileItemActions}>
                      {!item.isDefault && (
                        <Pressable
                          style={styles.setDefaultBtn}
                          onPress={() => handleSetDefault(item._id)}
                          disabled={loadingAction}
                        >
                          <Ionicons name="star-outline" size={14} color="#64748b" />
                          <Text style={styles.setDefaultBtnText}>Đặt làm mặc định</Text>
                        </Pressable>
                      )}

                      {profiles.length > 1 && (
                        <Pressable
                          style={styles.deleteProfileBtn}
                          onPress={() => handleDelete(item._id)}
                          disabled={loadingAction}
                        >
                          <Ionicons name="trash-outline" size={14} color="#dc2626" />
                          <Text style={styles.deleteProfileBtnText}>Xóa</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#c4b5fd',
    backgroundColor: '#faf5ff',
    marginBottom: 16,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7c3aed',
  },
  createCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  createTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
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
  cloneScroll: {
    marginTop: 4,
  },
  cloneChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    marginRight: 8,
  },
  cloneChipActive: {
    borderColor: '#7c3aed',
    backgroundColor: '#f3e8ff',
  },
  cloneChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  cloneChipTextActive: {
    color: '#7c3aed',
    fontWeight: '700',
  },
  createActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelCreateBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelCreateBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  submitCreateBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  submitCreateBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  profilesList: {
    gap: 12,
    paddingBottom: 20,
  },
  profileItem: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 16,
  },
  profileItemActive: {
    borderColor: '#a78bfa',
    backgroundColor: '#faf5ff',
  },
  profileItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileItemInfo: {
    flex: 1,
  },
  profileItemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileItemName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16a34a',
    textTransform: 'uppercase',
  },
  profileItemHeadline: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  currentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  currentTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
  },
  selectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7c3aed',
    backgroundColor: '#ffffff',
  },
  selectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
  },
  profileItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  setDefaultBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  deleteProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  deleteProfileBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
});
