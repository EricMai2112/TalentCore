import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/application.service';
import { profileService } from '../../services/profile.service';
import { JobItem } from '../../types/job.types';
import { CandidateProfile } from '../../types/profile.types';

interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobItem | null;
  onAppliedSuccess?: () => void;
  onRequireLogin?: () => void;
}

interface PickedCvFile {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
  file?: any;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  isOpen,
  onClose,
  job,
  onAppliedSuccess,
  onRequireLogin,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'profile'>('upload');

  const [selectedFile, setSelectedFile] = useState<PickedCvFile | null>(null);

  const [profiles, setProfiles] = useState<CandidateProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      const fetchProfiles = async () => {
        setIsLoadingProfiles(true);
        setErrorMessage(null);
        setIsSuccess(false);
        try {
          const list = await profileService.listProfiles();
          const items = Array.isArray(list) ? list : [];
          setProfiles(items);
          if (items.length > 0) {
            const defaultProf = items.find((p) => p.isDefault) || items[0];
            setSelectedProfileId(defaultProf._id);
          }
        } catch (err: any) {
          setErrorMessage(err.message || 'Không thể tải danh sách hồ sơ');
        } finally {
          setIsLoadingProfiles(false);
        }
      };

      fetchProfiles();
    }
  }, [isOpen, user]);

  if (!isOpen || !job) return null;

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/png',
          'image/jpeg',
          'image/webp',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileSize = asset.size || 0;
        if (fileSize > 15 * 1024 * 1024) {
          setErrorMessage('Kích thước tệp CV vượt quá giới hạn 15MB');
          return;
        }

        setSelectedFile({
          uri: asset.uri,
          name: asset.name || 'cv_upload.pdf',
          size: asset.size,
          mimeType: asset.mimeType,
          file: (asset as any).file,
        });
        setErrorMessage(null);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Không thể chọn tệp tin. Vui lòng thử lại!');
    }
  };

  const handleApply = async () => {
    if (!user) {
      onClose();
      if (onRequireLogin) onRequireLogin();
      return;
    }

    if (activeTab === 'upload') {
      if (!selectedFile) {
        setErrorMessage('Vui lòng chọn tệp CV để ứng tuyển');
        return;
      }
    } else {
      if (!selectedProfileId) {
        setErrorMessage('Vui lòng chọn một hồ sơ online để ứng tuyển');
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (activeTab === 'upload') {
        await applicationService.applyJob({
          jobDescriptionId: job._id,
          cvFile: selectedFile,
        });
      } else {
        await applicationService.applyJob({
          jobDescriptionId: job._id,
          candidateId: selectedProfileId,
        });
      }

      setIsSuccess(true);
      if (onAppliedSuccess) {
        onAppliedSuccess();
      }
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Ứng tuyển không thành công. Vui lòng thử lại sau!'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalCard}>
          <LinearGradient
            colors={['#7c3aed', '#6366f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topAccentBar}
          />

          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.categoryLabel}>XÁC NHẬN ỨNG TUYỂN</Text>
              <Text style={styles.jobTitle} numberOfLines={2}>
                {job.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color="#64748b" />
            </TouchableOpacity>
          </View>

          {isSuccess ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconWrapper}>
                <Ionicons name="checkmark-circle" size={54} color="#059669" />
              </View>
              <Text style={styles.successTitle}>Nộp hồ sơ thành công!</Text>
              <Text style={styles.successMessage}>
                Hồ sơ mới đã được tạo và gửi trực tiếp đến Nhà tuyển dụng. Hệ thống AI đang tiến hành đánh giá độ phù hợp.
              </Text>
              <TouchableOpacity
                style={styles.successCloseBtn}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.successCloseBtnText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {errorMessage && (
                <View style={styles.errorAlert}>
                  <Ionicons
                    name="alert-circle"
                    size={18}
                    color="#e11d48"
                    style={{ marginRight: 8, marginTop: 1 }}
                  />
                  <Text style={styles.errorAlertText}>{errorMessage}</Text>
                </View>
              )}

              <View style={styles.jobSummaryBox}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Ionicons name="business-outline" size={15} color="#64748b" style={{ marginRight: 6 }} />
                    <Text style={styles.summaryLabel}>Phòng ban:</Text>
                  </View>
                  <Text style={styles.summaryValue} numberOfLines={1}>
                    {job.department || 'Đang cập nhật'}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Ionicons name="location-outline" size={15} color="#64748b" style={{ marginRight: 6 }} />
                    <Text style={styles.summaryLabel}>Địa điểm:</Text>
                  </View>
                  <Text style={styles.summaryValue} numberOfLines={1}>
                    {job.location || 'Toàn quốc'}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Ionicons name="cash-outline" size={15} color="#059669" style={{ marginRight: 6 }} />
                    <Text style={styles.summaryLabel}>Mức lương:</Text>
                  </View>
                  <Text style={[styles.summaryValue, styles.salaryValue]} numberOfLines={1}>
                    {job.salaryDisplay || 'Thỏa thuận'}
                  </Text>
                </View>
              </View>

              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'upload' && styles.tabButtonActive]}
                  onPress={() => {
                    setActiveTab('upload');
                    setErrorMessage(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={15}
                    color={activeTab === 'upload' ? '#7c3aed' : '#64748b'}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.tabButtonText, activeTab === 'upload' && styles.tabButtonTextActive]}>
                    Tải lên tệp CV
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}
                  onPress={() => {
                    setActiveTab('profile');
                    setErrorMessage(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="layers-outline"
                    size={15}
                    color={activeTab === 'profile' ? '#7c3aed' : '#64748b'}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.tabButtonText, activeTab === 'profile' && styles.tabButtonTextActive]}>
                    Chọn hồ sơ online
                  </Text>
                </TouchableOpacity>
              </View>

              {activeTab === 'upload' && (
                <View style={styles.uploadSection}>
                  {selectedFile ? (
                    <View style={styles.fileSelectedCard}>
                      <View style={styles.fileIconWrapper}>
                        <Ionicons name="document-text" size={26} color="#059669" />
                      </View>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          {selectedFile.name}
                        </Text>
                        <Text style={styles.fileSize}>
                          {selectedFile.size
                            ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                            : 'Tệp đã chọn'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeFileBtn}
                        onPress={() => setSelectedFile(null)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#e11d48" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadBox}
                      onPress={handlePickDocument}
                      activeOpacity={0.7}
                    >
                      <View style={styles.uploadIconCircle}>
                        <Ionicons name="cloud-upload" size={24} color="#7c3aed" />
                      </View>
                      <Text style={styles.uploadTitle}>Bấm để chọn tệp CV từ thiết bị</Text>
                      <Text style={styles.uploadSubtitle}>
                        Hỗ trợ PDF, Word (.docx) hoặc Ảnh (Tối đa 15MB)
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.aiHintBox}>
                    <Ionicons name="sparkles" size={16} color="#7c3aed" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={styles.aiHintText}>
                      Khi bạn tải lên CV, hệ thống sẽ <Text style={{ fontWeight: '700' }}>tự động bóc tách và tạo 1 hồ sơ mới</Text> trong tài khoản của bạn, sau đó dùng hồ sơ đó để ứng tuyển và chấm điểm AI Matching tức thì.
                    </Text>
                  </View>
                </View>
              )}

              {activeTab === 'profile' && (
                <View style={styles.profilesSection}>
                  {!user ? (
                    <View style={styles.warningBox}>
                      <Ionicons name="person-circle-outline" size={24} color="#d97706" />
                      <Text style={styles.warningText}>
                        Bạn cần đăng nhập tài khoản ứng viên để có thể nộp hồ sơ vào vị trí này.
                      </Text>
                      <TouchableOpacity
                        style={styles.warningActionBtn}
                        onPress={() => {
                          onClose();
                          if (onRequireLogin) onRequireLogin();
                        }}
                      >
                        <Text style={styles.warningActionBtnText}>Đăng nhập ngay</Text>
                      </TouchableOpacity>
                    </View>
                  ) : isLoadingProfiles ? (
                    <View style={styles.loadingBox}>
                      <ActivityIndicator size="small" color="#7c3aed" />
                      <Text style={styles.loadingText}>Đang tải danh sách hồ sơ của bạn...</Text>
                    </View>
                  ) : profiles.length === 0 ? (
                    <View style={styles.warningBox}>
                      <Ionicons name="document-text-outline" size={24} color="#d97706" />
                      <Text style={styles.warningText}>
                        Bạn chưa tạo hồ sơ ứng tuyển nào. Bạn có thể chuyển sang tab &quot;Tải lên tệp CV&quot; để hệ thống tự động tạo hồ sơ ngay lập tức.
                      </Text>
                      <TouchableOpacity
                        style={styles.warningActionBtn}
                        onPress={() => setActiveTab('upload')}
                      >
                        <Text style={styles.warningActionBtnText}>Tải lên tệp CV ngay</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.profilesList}>
                      {profiles.map((p) => {
                        const isSelected = p._id === selectedProfileId;
                        return (
                          <TouchableOpacity
                            key={p._id}
                            style={[
                              styles.profileItem,
                              isSelected && styles.profileItemActive,
                            ]}
                            onPress={() => {
                              setSelectedProfileId(p._id);
                              if (errorMessage) setErrorMessage(null);
                            }}
                            activeOpacity={0.8}
                          >
                            <Ionicons
                              name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                              size={20}
                              color={isSelected ? '#7c3aed' : '#94a3b8'}
                              style={{ marginRight: 10 }}
                            />

                            <View style={{ flex: 1 }}>
                              <View style={styles.profileNameRow}>
                                <Text
                                  style={[
                                    styles.profileName,
                                    isSelected && styles.profileNameActive,
                                  ]}
                                  numberOfLines={1}
                                >
                                  {p.profileName || 'Hồ sơ tiêu chuẩn'}
                                </Text>
                                {p.isDefault && (
                                  <View style={styles.defaultBadge}>
                                    <Text style={styles.defaultBadgeText}>Mặc định</Text>
                                  </View>
                                )}
                              </View>

                              {p.headline ? (
                                <Text style={styles.profileHeadline} numberOfLines={1}>
                                  {p.headline}
                                </Text>
                              ) : null}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitBtnContainer,
                    (isSubmitting ||
                      !user ||
                      (activeTab === 'upload' && !selectedFile) ||
                      (activeTab === 'profile' && !selectedProfileId)) &&
                      styles.submitBtnDisabled,
                  ]}
                  onPress={handleApply}
                  disabled={
                    isSubmitting ||
                    !user ||
                    (activeTab === 'upload' && !selectedFile) ||
                    (activeTab === 'profile' && !selectedProfileId)
                  }
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={['#7c3aed', '#6366f1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitBtn}
                  >
                    {isSubmitting ? (
                      <View style={styles.submitContent}>
                        <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                        <Text style={styles.submitBtnText}>
                          {activeTab === 'upload' ? 'Đang phân tích & nộp...' : 'Đang nộp...'}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.submitContent}>
                        <Ionicons name="paper-plane" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                        <Text style={styles.submitBtnText}>Nộp hồ sơ ngay</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '88%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  topAccentBar: {
    height: 4,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  categoryLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#7c3aed',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 22,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorAlertText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#be123c',
    lineHeight: 18,
  },
  jobSummaryBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1e293b',
    maxWidth: '55%',
  },
  salaryValue: {
    color: '#059669',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748b',
  },
  tabButtonTextActive: {
    color: '#7c3aed',
    fontWeight: '700',
  },
  uploadSection: {
    marginBottom: 20,
    gap: 12,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    gap: 6,
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  uploadSubtitle: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  fileSelectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderWidth: 1.5,
    borderColor: '#a7f3d0',
    borderRadius: 16,
    padding: 12,
  },
  fileIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065f46',
  },
  fileSize: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  removeFileBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  aiHintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
    borderRadius: 14,
    padding: 12,
  },
  aiHintText: {
    flex: 1,
    fontSize: 11.5,
    color: '#5b21b6',
    lineHeight: 17,
  },
  profilesSection: {
    marginBottom: 20,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  warningBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
    alignItems: 'center',
    gap: 8,
  },
  warningText: {
    fontSize: 12.5,
    color: '#92400e',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  warningActionBtn: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: '#d97706',
    borderRadius: 10,
  },
  warningActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  profilesList: {
    gap: 10,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  profileItemActive: {
    borderColor: '#7c3aed',
    backgroundColor: '#f5f3ff',
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  profileNameActive: {
    color: '#6d28d9',
    fontWeight: '700',
  },
  defaultBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#ede9fe',
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7c3aed',
  },
  profileHeadline: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 8,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  submitBtnContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  successContainer: {
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  successIconWrapper: {
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  successCloseBtn: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#059669',
    borderRadius: 12,
  },
  successCloseBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
