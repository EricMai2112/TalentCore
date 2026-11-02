import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { profileService } from '../services/profile.service';
import {
  CandidateProfile,
  CertificateItem,
  CustomSection,
  EducationItem,
  ExperienceItem,
  LanguageItem,
  ProjectItem,
  SkillItem,
  SocialLinkItem,
} from '../types/profile.types';
import { CvParsingPreviewModal } from './profile/CvParsingPreviewModal';
import { EditPersonalModal } from './profile/EditPersonalModal';
import { EditObjectiveModal } from './profile/EditObjectiveModal';
import { EditExperienceModal } from './profile/EditExperienceModal';
import { EditEducationModal } from './profile/EditEducationModal';
import { EditSkillsModal } from './profile/EditSkillsModal';
import { EditProjectModal } from './profile/EditProjectModal';
import { EditCertificateModal } from './profile/EditCertificateModal';
import { EditLanguageModal } from './profile/EditLanguageModal';
import { EditCustomSectionModal } from './profile/EditCustomSectionModal';
import { ProfilesManagerModal } from './profile/ProfilesManagerModal';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const [profiles, setProfiles] = useState<CandidateProfile[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isProfilesManagerOpen, setIsProfilesManagerOpen] = useState(false);

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    objective: true,
    experience: true,
    education: true,
    skills: true,
    projects: true,
    certificates: true,
    languages: true,
    custom: true,
  });

  const [isParsingCv, setIsParsingCv] = useState(false);
  const [parsedCvData, setParsedCvData] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [applyingParsedCv, setApplyingParsedCv] = useState(false);

  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [selectedExp, setSelectedExp] = useState<ExperienceItem | null>(null);
  const [selectedExpIndex, setSelectedExpIndex] = useState<number | null>(null);
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [selectedEdu, setSelectedEdu] = useState<EducationItem | null>(null);
  const [selectedEduIndex, setSelectedEduIndex] = useState<number | null>(null);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [selectedCertIndex, setSelectedCertIndex] = useState<number | null>(null);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isCustomSecModalOpen, setIsCustomSecModalOpen] = useState(false);
  const [selectedCustomSec, setSelectedCustomSec] = useState<CustomSection | null>(null);
  const [selectedCustomSecIndex, setSelectedCustomSecIndex] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const list = await profileService.listProfiles();
      setProfiles(list);
      if (list.length > 0) {
        const currentId = profile?._id;
        const matched = list.find((p) => p._id === currentId) || list.find((p) => p.isDefault) || list[0];
        setProfile(matched);
      } else {
        const single = await profileService.getMyProfile();
        setProfile(single);
        setProfiles([single]);
      }
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const isCollapsed = (key: string) => {
    return collapsedSections[key] === undefined ? true : collapsedSections[key];
  };

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !isCollapsed(key),
    }));
  };

  const saveActiveProfile = async (payload: Partial<CandidateProfile>) => {
    if (profile?._id) {
      const updated = await profileService.updateProfileById(profile._id, payload);
      setProfile(updated);
      setProfiles((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      return updated;
    } else {
      const updated = await profileService.updateProfile(payload);
      setProfile(updated);
      return updated;
    }
  };

  const handlePickAndParseCv = async () => {
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
        const file = result.assets[0];
        setIsParsingCv(true);

        const parsed = await profileService.parseCvWithAi(
          file.uri,
          file.name || 'cv_upload',
          file.mimeType,
          (file as any).file,
        );

        if (!parsed || Object.keys(parsed).length === 0) {
          throw new Error('Không trích xuất được dữ liệu từ CV');
        }

        setParsedCvData(parsed);
        setIsPreviewOpen(true);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể bóc tách CV. Vui lòng thử lại.');
    } finally {
      setIsParsingCv(false);
    }
  };

  const handleApplyParsedCv = async () => {
    if (!parsedCvData) return;
    try {
      setApplyingParsedCv(true);
      const payload: Partial<CandidateProfile> = {
        headline: parsedCvData.headline || profile?.headline,
        summary: parsedCvData.summary || profile?.summary,
        careerObjective: parsedCvData.careerObjective || profile?.careerObjective,
        yearsOfExperience: parsedCvData.yearsOfExperience ?? profile?.yearsOfExperience,
        currentLevel: parsedCvData.currentLevel || profile?.currentLevel,
        address: parsedCvData.address || profile?.address,
        skills: parsedCvData.skills?.length ? parsedCvData.skills : profile?.skills || [],
        experiences: parsedCvData.experiences?.length ? parsedCvData.experiences : profile?.experiences || [],
        educations: parsedCvData.educations?.length ? parsedCvData.educations : profile?.educations || [],
        projects: parsedCvData.projects?.length ? parsedCvData.projects : profile?.projects || [],
        certifications: parsedCvData.certifications?.length ? parsedCvData.certifications : profile?.certifications || [],
        languages: parsedCvData.languages?.length ? parsedCvData.languages : profile?.languages || [],
      };

      await saveActiveProfile(payload);
      setIsPreviewOpen(false);
      setParsedCvData(null);
      Alert.alert('Thành công', 'Hồ sơ đã được tự động cập nhật từ dữ liệu CV!');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Cập nhật hồ sơ từ CV thất bại.');
    } finally {
      setApplyingParsedCv(false);
    }
  };

  const handleSavePersonalInfo = async (data: {
    name?: string;
    headline?: string;
    phone?: string;
    address?: string;
    summary?: string;
    socialLinks?: SocialLinkItem[];
  }) => {
    await saveActiveProfile(data);
  };

  const handleSaveObjective = async (objective: string) => {
    await saveActiveProfile({ careerObjective: objective });
  };

  const handleSaveExperience = async (item: ExperienceItem) => {
    const current = profile?.experiences ? [...profile.experiences] : [];
    if (selectedExpIndex !== null && selectedExpIndex >= 0) {
      current[selectedExpIndex] = item;
    } else {
      current.push(item);
    }
    await saveActiveProfile({ experiences: current });
  };

  const handleDeleteExperience = async () => {
    if (selectedExpIndex === null || selectedExpIndex < 0) return;
    const current = profile?.experiences ? [...profile.experiences] : [];
    current.splice(selectedExpIndex, 1);
    await saveActiveProfile({ experiences: current });
  };

  const handleSaveEducation = async (item: EducationItem) => {
    const current = profile?.educations ? [...profile.educations] : [];
    if (selectedEduIndex !== null && selectedEduIndex >= 0) {
      current[selectedEduIndex] = item;
    } else {
      current.push(item);
    }
    await saveActiveProfile({ educations: current });
  };

  const handleDeleteEducation = async () => {
    if (selectedEduIndex === null || selectedEduIndex < 0) return;
    const current = profile?.educations ? [...profile.educations] : [];
    current.splice(selectedEduIndex, 1);
    await saveActiveProfile({ educations: current });
  };

  const handleSaveSkills = async (skills: SkillItem[]) => {
    await saveActiveProfile({ skills });
  };

  const handleSaveProject = async (item: ProjectItem) => {
    const current = profile?.projects ? [...profile.projects] : [];
    if (selectedProjectIndex !== null && selectedProjectIndex >= 0) {
      current[selectedProjectIndex] = item;
    } else {
      current.push(item);
    }
    await saveActiveProfile({ projects: current });
  };

  const handleDeleteProject = async () => {
    if (selectedProjectIndex === null || selectedProjectIndex < 0) return;
    const current = profile?.projects ? [...profile.projects] : [];
    current.splice(selectedProjectIndex, 1);
    await saveActiveProfile({ projects: current });
  };

  const handleSaveCertificate = async (item: CertificateItem) => {
    const current = profile?.certifications ? [...profile.certifications] : [];
    if (selectedCertIndex !== null && selectedCertIndex >= 0) {
      current[selectedCertIndex] = item;
    } else {
      current.push(item);
    }
    await saveActiveProfile({ certifications: current });
  };

  const handleDeleteCertificate = async () => {
    if (selectedCertIndex === null || selectedCertIndex < 0) return;
    const current = profile?.certifications ? [...profile.certifications] : [];
    current.splice(selectedCertIndex, 1);
    await saveActiveProfile({ certifications: current });
  };

  const handleSaveLanguages = async (languages: LanguageItem[]) => {
    await saveActiveProfile({ languages });
  };

  const handleSaveCustomSections = async (customSections: CustomSection[]) => {
    await saveActiveProfile({ customSections });
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  if (!user) {
    if (authView === 'register') {
      return <RegisterScreen onNavigateToLogin={() => setAuthView('login')} />;
    }
    return <LoginScreen onNavigateToRegister={() => setAuthView('register')} />;
  }

  const displayName =
    (typeof profile?.userId === 'object' ? profile?.userId?.name : null) ||
    user.name ||
    user.email?.split('@')[0] ||
    'Ứng viên';

  const initial = displayName.charAt(0).toUpperCase();

  const phone =
    (typeof profile?.userId === 'object' ? profile?.userId?.phone : null) ||
    user.phone ||
    '';

  const address = profile?.address || '';
  const headline = profile?.headline || 'Chưa cập nhật chức danh nghề nghiệp';
  const hasObjective = Boolean(profile?.careerObjective && profile.careerObjective.trim().length > 0);
  const expCount = profile?.experiences?.length || 0;
  const eduCount = profile?.educations?.length || 0;
  const skillsCount = profile?.skills?.length || 0;
  const projCount = profile?.projects?.length || 0;
  const certCount = profile?.certifications?.length || 0;
  const langCount = profile?.languages?.length || 0;
  const customSecCount = profile?.customSections?.length || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Hồ sơ cá nhân</Text>
          <Text style={styles.subtitle}>Quản lý thông tin và bộ hồ sơ nghề nghiệp</Text>
        </View>

        {profile?.profileName && (
          <View style={styles.profileStatusBar}>
            <View style={styles.profileStatusLeft}>
              <View style={styles.statusDot} />
              <Text style={styles.profileStatusLabel} numberOfLines={1}>
                Đang sửa:{' '}
                <Text style={styles.profileStatusName}>{profile.profileName}</Text>
              </Text>
              {profile.isDefault && (
                <View style={styles.defaultTagSmall}>
                  <Text style={styles.defaultTagSmallText}>Mặc định</Text>
                </View>
              )}
            </View>

            <Pressable
              style={styles.switchProfileBtn}
              onPress={() => setIsProfilesManagerOpen(true)}
            >
              <Ionicons name="swap-horizontal" size={14} color="#7c3aed" />
              <Text style={styles.switchProfileBtnText}>Đổi hồ sơ ({profiles.length})</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.aiBanner}>
          <LinearGradient
            colors={['#4f46e5', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiBannerGradient}
          >
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={13} color="#fde047" />
              <Text style={styles.aiBadgeText}>Tính năng AI thông minh</Text>
            </View>

            <Text style={styles.aiBannerTitle}>Tự động điền hồ sơ bằng CV sẵn có</Text>
            <Text style={styles.aiBannerDesc}>
              Hỗ trợ tải lên file PDF, Word hoặc Ảnh CV. AI sẽ tự động phân tích và trích xuất thông tin chỉ trong vài giây.
            </Text>

            <Pressable
              style={[styles.uploadCvBtn, isParsingCv && styles.uploadCvBtnDisabled]}
              onPress={handlePickAndParseCv}
              disabled={isParsingCv}
            >
              {isParsingCv ? (
                <>
                  <ActivityIndicator size="small" color="#4f46e5" />
                  <Text style={styles.uploadCvBtnText}>AI đang phân tích CV...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={18} color="#4f46e5" />
                  <Text style={styles.uploadCvBtnText}>Tải lên CV (PDF, DOCX, Ảnh)</Text>
                </>
              )}
            </Pressable>
          </LinearGradient>
        </View>

        <View style={styles.profileCard}>
          <LinearGradient
            colors={['#7c3aed', '#6366f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>
          <Text style={styles.nameText}>{displayName}</Text>
          <Text style={styles.headlineText}>{headline}</Text>
          <Text style={styles.emailText}>{user.email}</Text>

          {phone || address ? (
            <View style={styles.contactRow}>
              {phone ? (
                <View style={styles.contactItem}>
                  <Ionicons name="call-outline" size={13} color="#64748b" />
                  <Text style={styles.contactText}>{phone}</Text>
                </View>
              ) : null}
              {address ? (
                <View style={styles.contactItem}>
                  <Ionicons name="location-outline" size={13} color="#64748b" />
                  <Text style={styles.contactText}>{address}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {profile?.socialLinks && profile.socialLinks.length > 0 && (
            <View style={styles.socialChipsRow}>
              {profile.socialLinks.map((s, idx) => (
                <View key={idx} style={styles.socialChip}>
                  <Ionicons name="globe-outline" size={12} color="#7c3aed" />
                  <Text style={styles.socialChipText}>{s.platform}</Text>
                </View>
              ))}
            </View>
          )}

          <Pressable
            style={styles.editPersonalBtn}
            onPress={() => setIsPersonalModalOpen(true)}
          >
            <Ionicons name="pencil" size={14} color="#7c3aed" />
            <Text style={styles.editPersonalBtnText}>Chỉnh sửa thông tin</Text>
          </Pressable>

          {profile?.summary ? (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Giới thiệu bản thân:</Text>
              <Text style={styles.summaryText}>{profile.summary}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionsContainer}>
          <View style={styles.sectionCard}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection('objective')}
            >
              <View style={[styles.sectionIconBox, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="flag-outline" size={18} color="#2563eb" />
              </View>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitle}>Mục tiêu nghề nghiệp</Text>
                <Text style={styles.sectionStatus}>
                  {hasObjective ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                </Text>
              </View>
              <View style={styles.sectionHeaderActions}>
                <Pressable
                  style={styles.actionIconBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    setIsObjectiveModalOpen(true);
                  }}
                >
                  <Ionicons name="pencil" size={15} color="#2563eb" />
                </Pressable>
                <Ionicons
                  name={isCollapsed('objective') ? 'chevron-down' : 'chevron-up'}
                  size={18}
                  color="#94a3b8"
                />
              </View>
            </Pressable>

            {!isCollapsed('objective') && (
              <View style={styles.sectionContent}>
                {hasObjective ? (
                  <Text style={styles.contentText}>{profile?.careerObjective}</Text>
                ) : (
                  <Text style={styles.emptyContentText}>
                    Chưa cập nhật mục tiêu nghề nghiệp. Bấm nút chỉnh sửa để thêm.
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.sectionCard}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection('experience')}
            >
              <View style={[styles.sectionIconBox, { backgroundColor: '#f5f3ff' }]}>
                <Ionicons name="briefcase-outline" size={18} color="#7c3aed" />
              </View>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitle}>Kinh nghiệm làm việc</Text>
                <Text style={styles.sectionStatus}>{expCount} kinh nghiệm</Text>
              </View>
              <View style={styles.sectionHeaderActions}>
                <Pressable
                  style={styles.actionIconBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedExp(null);
                    setSelectedExpIndex(null);
                    setIsExpModalOpen(true);
                  }}
                >
                  <Ionicons name="add" size={18} color="#7c3aed" />
                </Pressable>
                <Ionicons
                  name={isCollapsed('experience') ? 'chevron-down' : 'chevron-up'}
                  size={18}
                  color="#94a3b8"
                />
              </View>
            </Pressable>

            {!isCollapsed('experience') && (
              <View style={styles.sectionContent}>
                {profile?.experiences && profile.experiences.length > 0 ? (
                  profile.experiences.map((item, idx) => (
                    <View key={idx} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <View style={styles.itemTitleGroup}>
                          <Text style={styles.itemPrimary}>{item.position}</Text>
                          <Text style={styles.itemSecondary}>{item.company}</Text>
                          {item.startDate || item.endDate ? (
                            <Text style={styles.itemMeta}>
                              {item.startDate || '...'} - {item.endDate || 'Hiện tại'}
                            </Text>
                          ) : null}
                          {item.technologies && item.technologies.length > 0 ? (
                            <Text style={styles.itemTechMeta}>
                              Tech: {item.technologies.join(', ')}
                            </Text>
                          ) : null}
                        </View>
                        <Pressable
                          style={styles.itemEditBtn}
                          onPress={() => {
                            setSelectedExp(item);
                            setSelectedExpIndex(idx);
                            setIsExpModalOpen(true);
                          }}
                        >
                          <Ionicons name="pencil" size={14} color="#64748b" />
                        </Pressable>
                      </View>
                      {item.description ? (
                        <Text style={styles.itemDesc}>{item.description}</Text>
                      ) : null}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyContentText}>
                    Chưa có kinh nghiệm làm việc nào được lưu.
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.sectionCard}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection('education')}
            >
              <View style={[styles.sectionIconBox, { backgroundColor: '#f0fdf4' }]}>
                <Ionicons name="school-outline" size={18} color="#16a34a" />
              </View>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitle}>Học vấn</Text>
                <Text style={styles.sectionStatus}>{eduCount} trường/bằng cấp</Text>
              </View>
              <View style={styles.sectionHeaderActions}>
                <Pressable
                  style={styles.actionIconBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedEdu(null);
                    setSelectedEduIndex(null);
                    setIsEduModalOpen(true);
                  }}
                >
                  <Ionicons name="add" size={18} color="#16a34a" />
                </Pressable>
                <Ionicons
                  name={isCollapsed('education') ? 'chevron-down' : 'chevron-up'}
                  size={18}
                  color="#94a3b8"
                />
              </View>
            </Pressable>

            {!isCollapsed('education') && (
              <View style={styles.sectionContent}>
                {profile?.educations && profile.educations.length > 0 ? (
                  profile.educations.map((item, idx) => (
                    <View key={idx} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <View style={styles.itemTitleGroup}>
                          <Text style={styles.itemPrimary}>{item.institution}</Text>
                          <Text style={styles.itemSecondary}>
                            {[item.degree, item.major].filter(Boolean).join(' - ') || 'Chuyên ngành'}
                          </Text>
                          {item.startDate || item.endDate ? (
                            <Text style={styles.itemMeta}>
                              {item.startDate || '...'} - {item.endDate || '...'}
                              {item.gpa !== undefined ? ` • GPA: ${item.gpa}` : ''}
                            </Text>
                          ) : null}
                        </View>
                        <Pressable
                          style={styles.itemEditBtn}
                          onPress={() => {
                            setSelectedEdu(item);
                            setSelectedEduIndex(idx);
                            setIsEduModalOpen(true);
                          }}
                        >
                          <Ionicons name="pencil" size={14} color="#64748b" />
                        </Pressable>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyContentText}>Chưa có thông tin học vấn.</Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.sectionCard}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection('skills')}
            >
              <View style={[styles.sectionIconBox, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="hardware-chip-outline" size={18} color="#d97706" />
              </View>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitle}>Kỹ năng chuyên môn</Text>
                <Text style={styles.sectionStatus}>{skillsCount} kỹ năng</Text>
              </View>
              <View style={styles.sectionHeaderActions}>
                <Pressable
                  style={styles.actionIconBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    setIsSkillsModalOpen(true);
                  }}
                >
                  <Ionicons name="pencil" size={15} color="#d97706" />
                </Pressable>
                <Ionicons
                  name={isCollapsed('skills') ? 'chevron-down' : 'chevron-up'}
                  size={18}
                  color="#94a3b8"
                />
              </View>
            </Pressable>

            {!isCollapsed('skills') && (
              <View style={styles.sectionContent}>
                {profile?.skills && profile.skills.length > 0 ? (
                  <View style={styles.skillsTagContainer}>
                    {profile.skills.map((skill, idx) => (
                      <View key={idx} style={styles.skillTag}>
                        <Text style={styles.skillTagText}>{skill.name}</Text>
                        {skill.proficiency ? (
                          <Text style={styles.skillProficiency}>
                            {skill.proficiency === 'EXPERT'
                              ? 'Chuyên gia'
                              : skill.proficiency === 'ADVANCED'
                              ? 'Nâng cao'
                              : skill.proficiency === 'INTERMEDIATE'
                              ? 'Trung cấp'
                              : 'Cơ bản'}
                            {skill.yearsOfExperience ? ` • ${skill.yearsOfExperience}n` : ''}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyContentText}>Chưa có kỹ năng nào được thêm.</Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.sectionCard}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection('projects')}
            >
              <View style={[styles.sectionIconBox, { backgroundColor: '#ecfeff' }]}>
                <Ionicons name="folder-open-outline" size={18} color="#0891b2" />
              </View>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitle}>Dự án nổi bật</Text>
                <Text style={styles.sectionStatus}>{projCount} dự án</Text>
              </View>
              <View style={styles.sectionHeaderActions}>
                <Pressable
                  style={styles.actionIconBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedProject(null);
                    setSelectedProjectIndex(null);
                    setIsProjectModalOpen(true);
                  }}
                >
                  <Ionicons name="add" size={18} color="#0891b2" />
                </Pressable>
                <Ionicons
                  name={isCollapsed('projects') ? 'chevron-down' : 'chevron-up'}
                  size={18}
                  color="#94a3b8"
                />
              </View>
            </Pressable>

            {!isCollapsed('projects') && (
              <View style={styles.sectionContent}>
                {profile?.projects && profile.projects.length > 0 ? (
                  profile.projects.map((item, idx) => (
                    <View key={idx} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <View style={styles.itemTitleGroup}>
                          <Text style={styles.itemPrimary}>{item.name}</Text>
                          {item.role ? (
                            <Text style={styles.itemSecondary}>{item.role}</Text>
                          ) : null}
                          {item.startDate || item.endDate ? (
                            <Text style={styles.itemMeta}>
                              {item.startDate || '...'} - {item.endDate || 'Hiện tại'}
                            </Text>
                          ) : null}
                          {item.technologies && item.technologies.length > 0 ? (
                            <Text style={styles.itemTechMeta}>
                              Tech: {item.technologies.join(', ')}
                            </Text>
                          ) : null}
                          {item.projectUrl ? (
                            <Text style={styles.itemLinkMeta}>{item.projectUrl}</Text>
                          ) : null}
                        </View>
                        <Pressable
                          style={styles.itemEditBtn}
                          onPress={() => {
                            setSelectedProject(item);
                            setSelectedProjectIndex(idx);
                            setIsProjectModalOpen(true);
                          }}
                        >
                          <Ionicons name="pencil" size={14} color="#64748b" />
                        </Pressable>
                      </View>
                      {item.description ? (
                        <Text style={styles.itemDesc}>{item.description}</Text>
                      ) : null}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyContentText}>Chưa có dự án nào.</Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.sectionCard}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection('certificates')}
            >
              <View style={[styles.sectionIconBox, { backgroundColor: '#fdf2f8' }]}>
                <Ionicons name="ribbon-outline" size={18} color="#db2777" />
              </View>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitle}>Chứng chỉ & Khóa học</Text>
                <Text style={styles.sectionStatus}>{certCount} chứng chỉ</Text>
              </View>
              <View style={styles.sectionHeaderActions}>
                <Pressable
                  style={styles.actionIconBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedCert(null);
                    setSelectedCertIndex(null);
                    setIsCertModalOpen(true);
                  }}
                >
                  <Ionicons name="add" size={18} color="#db2777" />
                </Pressable>
                <Ionicons
                  name={isCollapsed('certificates') ? 'chevron-down' : 'chevron-up'}
                  size={18}
                  color="#94a3b8"
                />
              </View>
            </Pressable>

            {!isCollapsed('certificates') && (
              <View style={styles.sectionContent}>
                {profile?.certifications && profile.certifications.length > 0 ? (
                  profile.certifications.map((item, idx) => (
                    <View key={idx} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <View style={styles.itemTitleGroup}>
                          <Text style={styles.itemPrimary}>{item.name}</Text>
                          <Text style={styles.itemSecondary}>
                            {[item.organization, item.scoreOrLevel].filter(Boolean).join(' • ') || 'Chứng chỉ'}
                          </Text>
                          {item.issueDate ? (
                            <Text style={styles.itemMeta}>Cấp: {item.issueDate}</Text>
                          ) : null}
                        </View>
                        <Pressable
                          style={styles.itemEditBtn}
                          onPress={() => {
                            setSelectedCert(item);
                            setSelectedCertIndex(idx);
                            setIsCertModalOpen(true);
                          }}
                        >
                          <Ionicons name="pencil" size={14} color="#64748b" />
                        </Pressable>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyContentText}>Chưa có chứng chỉ nào.</Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.sectionCard}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection('languages')}
            >
              <View style={[styles.sectionIconBox, { backgroundColor: '#f1f5f9' }]}>
                <Ionicons name="language-outline" size={18} color="#475569" />
              </View>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitle}>Ngoại ngữ</Text>
                <Text style={styles.sectionStatus}>{langCount} ngoại ngữ</Text>
              </View>
              <View style={styles.sectionHeaderActions}>
                <Pressable
                  style={styles.actionIconBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    setIsLangModalOpen(true);
                  }}
                >
                  <Ionicons name="pencil" size={15} color="#475569" />
                </Pressable>
                <Ionicons
                  name={isCollapsed('languages') ? 'chevron-down' : 'chevron-up'}
                  size={18}
                  color="#94a3b8"
                />
              </View>
            </Pressable>

            {!isCollapsed('languages') && (
              <View style={styles.sectionContent}>
                {profile?.languages && profile.languages.length > 0 ? (
                  profile.languages.map((item, idx) => (
                    <View key={idx} style={styles.langRowItem}>
                      <Text style={styles.langNameText}>{item.language}</Text>
                      <Text style={styles.langLevelText}>{item.proficiency || 'Cơ bản'}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyContentText}>Chưa có ngoại ngữ nào.</Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.sectionCard}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => toggleSection('custom')}
            >
              <View style={[styles.sectionIconBox, { backgroundColor: '#fdf4ff' }]}>
                <Ionicons name="layers-outline" size={18} color="#c026d3" />
              </View>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitle}>Mục bổ sung & Tùy chỉnh</Text>
                <Text style={styles.sectionStatus}>{customSecCount} mục tùy biến</Text>
              </View>
              <View style={styles.sectionHeaderActions}>
                <Pressable
                  style={styles.actionIconBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedCustomSec(null);
                    setSelectedCustomSecIndex(null);
                    setIsCustomSecModalOpen(true);
                  }}
                >
                  <Ionicons name="add" size={18} color="#c026d3" />
                </Pressable>
                <Ionicons
                  name={isCollapsed('custom') ? 'chevron-down' : 'chevron-up'}
                  size={18}
                  color="#94a3b8"
                />
              </View>
            </Pressable>

            {!isCollapsed('custom') && (
              <View style={styles.sectionContent}>
                {profile?.customSections && profile.customSections.length > 0 ? (
                  profile.customSections.map((sec, secIdx) => (
                    <View key={secIdx} style={styles.customSecBox}>
                      <View style={styles.customSecHeader}>
                        <Text style={styles.customSecTitle}>{sec.sectionTitle}</Text>
                        <Pressable
                          style={styles.itemEditBtn}
                          onPress={() => {
                            setSelectedCustomSec(sec);
                            setSelectedCustomSecIndex(secIdx);
                            setIsCustomSecModalOpen(true);
                          }}
                        >
                          <Ionicons name="pencil" size={14} color="#64748b" />
                        </Pressable>
                      </View>

                      {sec.items && sec.items.length > 0 ? (
                        sec.items.map((it, itIdx) => (
                          <View key={itIdx} style={styles.customItemCard}>
                            <Text style={styles.itemPrimary}>{it.title}</Text>
                            {it.subtitle || it.date ? (
                              <Text style={styles.itemMeta}>
                                {[it.subtitle, it.date].filter(Boolean).join(' • ')}
                              </Text>
                            ) : null}
                            {it.url ? (
                              <Text style={styles.itemLinkMeta}>{it.url}</Text>
                            ) : null}
                            {it.description ? (
                              <Text style={styles.itemDesc}>{it.description}</Text>
                            ) : null}
                          </View>
                        ))
                      ) : (
                        <Text style={styles.emptyContentText}>Chưa có nội dung trong mục này.</Text>
                      )}
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyCustomBox}>
                    <Text style={styles.emptyContentText}>
                      Chưa có mục tùy chỉnh nào (Giải thưởng, Hoạt động ngoại khóa, Tình nguyện...)
                    </Text>
                    <Pressable
                      style={styles.addCustomBtnInline}
                      onPress={() => {
                        setSelectedCustomSec(null);
                        setSelectedCustomSecIndex(null);
                        setIsCustomSecModalOpen(true);
                      }}
                    >
                      <Ionicons name="add-circle-outline" size={16} color="#c026d3" />
                      <Text style={styles.addCustomBtnInlineText}>Thêm mục tùy chỉnh mới</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#dc2626" />
          <Text style={styles.logoutButtonText}>Đăng xuất tài khoản</Text>
        </Pressable>
      </ScrollView>

      <ProfilesManagerModal
        visible={isProfilesManagerOpen}
        onClose={() => setIsProfilesManagerOpen(false)}
        profiles={profiles}
        currentProfileId={profile?._id || ''}
        onSelectProfile={(selected) => setProfile(selected)}
        onRefreshProfiles={loadData}
      />

      <CvParsingPreviewModal
        visible={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        parsedData={parsedCvData}
        onApply={handleApplyParsedCv}
        loading={applyingParsedCv}
      />

      <EditPersonalModal
        visible={isPersonalModalOpen}
        onClose={() => setIsPersonalModalOpen(false)}
        profile={profile}
        defaultName={user.name}
        defaultPhone={user.phone}
        onSave={handleSavePersonalInfo}
      />

      <EditObjectiveModal
        visible={isObjectiveModalOpen}
        onClose={() => setIsObjectiveModalOpen(false)}
        careerObjective={profile?.careerObjective || ''}
        onSave={handleSaveObjective}
      />

      <EditExperienceModal
        visible={isExpModalOpen}
        onClose={() => setIsExpModalOpen(false)}
        experience={selectedExp}
        onSave={handleSaveExperience}
        onDelete={selectedExpIndex !== null ? handleDeleteExperience : undefined}
      />

      <EditEducationModal
        visible={isEduModalOpen}
        onClose={() => setIsEduModalOpen(false)}
        education={selectedEdu}
        onSave={handleSaveEducation}
        onDelete={selectedEduIndex !== null ? handleDeleteEducation : undefined}
      />

      <EditSkillsModal
        visible={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        skills={profile?.skills || []}
        onSave={handleSaveSkills}
      />

      <EditProjectModal
        visible={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={selectedProject}
        onSave={handleSaveProject}
        onDelete={selectedProjectIndex !== null ? handleDeleteProject : undefined}
      />

      <EditCertificateModal
        visible={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        certificate={selectedCert}
        onSave={handleSaveCertificate}
        onDelete={selectedCertIndex !== null ? handleDeleteCertificate : undefined}
      />

      <EditLanguageModal
        visible={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        languages={profile?.languages || []}
        onSave={handleSaveLanguages}
      />

      <EditCustomSectionModal
        visible={isCustomSecModalOpen}
        onClose={() => setIsCustomSecModalOpen(false)}
        initialData={selectedCustomSec}
        sectionIndex={selectedCustomSecIndex}
        allCustomSections={profile?.customSections || []}
        onSave={handleSaveCustomSections}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  profileStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 8,
  },
  profileStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#7c3aed',
  },
  profileStatusLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    flexShrink: 1,
  },
  profileStatusName: {
    color: '#7c3aed',
    fontWeight: '800',
  },
  defaultTagSmall: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  defaultTagSmallText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16a34a',
    textTransform: 'uppercase',
  },
  switchProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  switchProfileBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed',
  },
  aiBanner: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },
  aiBannerGradient: {
    padding: 20,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 10,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  aiBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  aiBannerDesc: {
    fontSize: 12,
    color: '#e0e7ff',
    lineHeight: 18,
    marginBottom: 16,
  },
  uploadCvBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  uploadCvBtnDisabled: {
    opacity: 0.8,
  },
  uploadCvBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4f46e5',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
  },
  nameText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  headlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7c3aed',
    marginBottom: 4,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactText: {
    fontSize: 12,
    color: '#64748b',
  },
  socialChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  socialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  socialChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7c3aed',
  },
  editPersonalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    backgroundColor: '#faf5ff',
  },
  editPersonalBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
  },
  summaryBox: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    width: '100%',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  sectionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  sectionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleBox: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionStatus: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  sectionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  contentText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  emptyContentText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  itemCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitleGroup: {
    flex: 1,
  },
  itemPrimary: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  itemSecondary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  itemMeta: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  itemTechMeta: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '600',
    marginTop: 3,
  },
  itemLinkMeta: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 2,
  },
  itemDesc: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 21,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
  },
  itemEditBtn: {
    padding: 6,
  },
  skillsTagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 6,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
  },
  skillProficiency: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6366f1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  langRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  langNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  langLevelText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  customSecBox: {
    marginTop: 10,
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#f3e8ff',
    borderRadius: 14,
    padding: 12,
  },
  customSecHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3e8ff',
    paddingBottom: 6,
  },
  customSecTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7c3aed',
    textTransform: 'uppercase',
  },
  customItemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyCustomBox: {
    paddingVertical: 8,
  },
  addCustomBtnInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e879f9',
    backgroundColor: '#fdf4ff',
    marginTop: 8,
  },
  addCustomBtnInlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#c026d3',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 14,
    paddingVertical: 14,
  },
  logoutButtonPressed: {
    backgroundColor: '#fee2e2',
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '700',
  },
});
