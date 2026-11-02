import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface CvParsingPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  parsedData: any;
  onApply: () => void;
  loading: boolean;
}

export const CvParsingPreviewModal: React.FC<CvParsingPreviewModalProps> = ({
  visible,
  onClose,
  parsedData,
  onApply,
  loading,
}) => {
  if (!parsedData) return null;

  const skillsCount = parsedData.skills?.length || 0;
  const expCount = parsedData.experiences?.length || 0;
  const eduCount = parsedData.educations?.length || 0;
  const projCount = parsedData.projects?.length || 0;
  const certCount = parsedData.certifications?.length || 0;
  const langCount = parsedData.languages?.length || 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerIconBox}>
              <Ionicons name="sparkles" size={20} color="#7c3aed" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>AI Bóc tách CV thành công!</Text>
              <Text style={styles.headerSubtitle}>Kiểm tra dữ liệu chi tiết trước khi áp dụng vào hồ sơ</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} disabled={loading}>
              <Ionicons name="close" size={22} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Thông tin cá nhân trích xuất</Text>
                {(parsedData.currentLevel || parsedData.yearsOfExperience !== undefined) && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgePillText}>
                      {parsedData.currentLevel || 'Ứng viên'} • {parsedData.yearsOfExperience ?? 0} năm KN
                    </Text>
                  </View>
                )}
              </View>

              {parsedData.fullName && (
                <View style={styles.highlightNameBox}>
                  <Text style={styles.infoLabel}>Họ và tên ứng viên:</Text>
                  <Text style={styles.candidateName}>{parsedData.fullName}</Text>
                </View>
              )}

              {parsedData.headline && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Chức danh:</Text>
                  <Text style={styles.infoValue}>{parsedData.headline}</Text>
                </View>
              )}

              {parsedData.phone && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Số điện thoại:</Text>
                  <Text style={styles.infoValue}>{parsedData.phone}</Text>
                </View>
              )}

              {parsedData.address && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Địa chỉ:</Text>
                  <Text style={styles.infoValue}>{parsedData.address}</Text>
                </View>
              )}

              {parsedData.socialLinks && parsedData.socialLinks.length > 0 && (
                <View style={styles.socialBox}>
                  <Text style={styles.infoLabel}>Liên kết mạng xã hội:</Text>
                  <View style={styles.socialChipsContainer}>
                    {parsedData.socialLinks.map((s: any, idx: number) => (
                      <View key={idx} style={styles.socialChip}>
                        <Ionicons name="globe-outline" size={13} color="#7c3aed" />
                        <Text style={styles.socialChipText}>
                          {s.platform}: {s.url}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {parsedData.summary ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Tóm tắt & Giới thiệu bản thân</Text>
                <View style={styles.textContainer}>
                  <Text style={styles.textBlock}>{parsedData.summary}</Text>
                </View>
              </View>
            ) : null}

            {parsedData.careerObjective ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Mục tiêu nghề nghiệp</Text>
                <View style={styles.textContainer}>
                  <Text style={styles.textBlock}>{parsedData.careerObjective}</Text>
                </View>
              </View>
            ) : null}

            {skillsCount > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Kỹ năng chuyên môn ({skillsCount})</Text>
                <View style={styles.skillsTagContainer}>
                  {parsedData.skills.map((skill: any, idx: number) => (
                    <View key={idx} style={styles.skillTag}>
                      <Text style={styles.skillTagText}>{skill.name}</Text>
                      {skill.proficiency && (
                        <Text style={styles.skillProficiency}>
                          {skill.proficiency === 'EXPERT'
                            ? 'Chuyên gia'
                            : skill.proficiency === 'ADVANCED'
                            ? 'Nâng cao'
                            : skill.proficiency === 'INTERMEDIATE'
                            ? 'Trung cấp'
                            : skill.proficiency === 'BEGINNER'
                            ? 'Cơ bản'
                            : skill.proficiency}
                          {skill.yearsOfExperience ? ` • ${skill.yearsOfExperience}n` : ''}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {expCount > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Kinh nghiệm làm việc ({expCount})</Text>
                <View style={styles.itemsList}>
                  {parsedData.experiences.map((exp: any, idx: number) => (
                    <View key={idx} style={styles.itemBox}>
                      <View style={styles.itemHeader}>
                        <View style={styles.itemTitleGroup}>
                          <Text style={styles.itemPrimary}>{exp.position || 'Vị trí công việc'}</Text>
                          <Text style={styles.itemSecondary}>{exp.company || 'Doanh nghiệp'}</Text>
                          {(exp.startDate || exp.endDate) && (
                            <Text style={styles.itemMeta}>
                              {exp.startDate || '...'} - {exp.endDate || 'Hiện tại'}
                            </Text>
                          )}
                        </View>
                      </View>

                      {exp.technologies && exp.technologies.length > 0 && (
                        <View style={styles.techMetaRow}>
                          <Text style={styles.techLabel}>Công nghệ: </Text>
                          <Text style={styles.techValue}>{exp.technologies.join(', ')}</Text>
                        </View>
                      )}

                      {exp.description ? (
                        <View style={styles.descBox}>
                          <Text style={styles.descText}>{exp.description}</Text>
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {eduCount > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Học vấn & Bằng cấp ({eduCount})</Text>
                <View style={styles.itemsList}>
                  {parsedData.educations.map((edu: any, idx: number) => (
                    <View key={idx} style={styles.itemBox}>
                      <Text style={styles.itemPrimary}>{edu.institution || 'Trường đào tạo'}</Text>
                      <Text style={styles.itemSecondary}>
                        {[edu.major, edu.degree].filter(Boolean).join(' • ') || 'Chuyên ngành'}
                      </Text>
                      {(edu.startDate || edu.endDate || edu.gpa !== undefined) && (
                        <Text style={styles.itemMeta}>
                          {edu.startDate || '...'} - {edu.endDate || '...'}
                          {edu.gpa !== undefined ? ` • GPA: ${edu.gpa}` : ''}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {projCount > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Dự án thực tế ({projCount})</Text>
                <View style={styles.itemsList}>
                  {parsedData.projects.map((proj: any, idx: number) => (
                    <View key={idx} style={styles.itemBox}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemPrimary}>{proj.name || 'Tên dự án'}</Text>
                        {proj.role && <Text style={styles.itemSecondary}>Vai trò: {proj.role}</Text>}
                        {(proj.startDate || proj.endDate) && (
                          <Text style={styles.itemMeta}>
                            {proj.startDate || '...'} - {proj.endDate || 'Hiện tại'}
                          </Text>
                        )}
                        {proj.projectUrl && (
                          <Text style={styles.linkText} numberOfLines={1}>
                            {proj.projectUrl}
                          </Text>
                        )}
                      </View>

                      {proj.technologies && proj.technologies.length > 0 && (
                        <View style={styles.techMetaRow}>
                          <Text style={styles.techLabel}>Công nghệ: </Text>
                          <Text style={styles.techValue}>{proj.technologies.join(', ')}</Text>
                        </View>
                      )}

                      {proj.description ? (
                        <View style={styles.descBox}>
                          <Text style={styles.descText}>{proj.description}</Text>
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {certCount > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Chứng chỉ & Khóa học ({certCount})</Text>
                <View style={styles.itemsList}>
                  {parsedData.certifications.map((cert: any, idx: number) => (
                    <View key={idx} style={styles.itemBox}>
                      <Text style={styles.itemPrimary}>{cert.name || 'Tên chứng chỉ'}</Text>
                      <Text style={styles.itemSecondary}>
                        {[cert.organization, cert.scoreOrLevel].filter(Boolean).join(' • ') || 'Tổ chức cấp'}
                      </Text>
                      {cert.issueDate && <Text style={styles.itemMeta}>Cấp: {cert.issueDate}</Text>}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {langCount > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Ngoại ngữ ({langCount})</Text>
                <View style={styles.itemsList}>
                  {parsedData.languages.map((lang: any, idx: number) => (
                    <View key={idx} style={styles.langRowItem}>
                      <Text style={styles.langNameText}>{lang.language || 'Ngoại ngữ'}</Text>
                      <Text style={styles.langLevelText}>{lang.proficiency || 'Chưa xác định'}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
            </Pressable>

            <Pressable
              style={styles.applyBtn}
              onPress={onApply}
              disabled={loading}
            >
              <LinearGradient
                colors={['#7c3aed', '#6366f1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.applyBtnGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                    <Text style={styles.applyBtnText}>Cập nhật vào hồ sơ ngay</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>
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
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  badgePill: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  highlightNameBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  candidateName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#7c3aed',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
    maxWidth: '65%',
  },
  socialBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  socialChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  socialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  socialChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  textContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
  },
  textBlock: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  skillsTagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  skillTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  skillProficiency: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemsList: {
    gap: 10,
    marginTop: 4,
  },
  itemBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
  },
  itemHeader: {
    marginBottom: 4,
  },
  itemTitleGroup: {
    gap: 2,
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
    marginTop: 3,
  },
  techMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  techLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
  },
  techValue: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  descBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  descText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 21,
  },
  linkText: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 2,
  },
  langRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  langNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  langLevelText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  applyBtn: {
    flex: 2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  applyBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
