import AppTabs from '@/components/app-tabs';
import { useAppAlert } from '@/context/AlertContext';
import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axiosClient';
import { triggerLocalNotification } from '../services/notificationService';

interface Project {
  id?: number;
  ProjectID?: number;
  Name?: string;
  name?: string;
  Description?: string;
  description?: string;
  OrgID?: number;
  org_id?: number;
  OrganizationID?: number;
  organization_id?: number;
  createdAt?: string;
}

export default function ProjectsScreen() {
  const { colors } = useAppTheme();
  const { showAlert } = useAppAlert();
  const router = useRouter();
  const params = useLocalSearchParams();

  const orgIdParam = params.orgId ? String(params.orgId) : '';
  const orgNameParam = params.orgName ? String(params.orgName) : '';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Project creation form states
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newOrgId, setNewOrgId] = useState<string>(orgIdParam);

  // Organization reassignment modal states
  const [moveModalVisible, setMoveModalVisible] = useState<boolean>(false);
  const [targetProject, setTargetProject] = useState<{ id: number; orgId?: number } | null>(null);
  const [moveOrgInput, setMoveOrgInput] = useState<string>('');
  const [moving, setMoving] = useState<boolean>(false);

  const fetchProjects = async () => {
    try {
      const endpoint = orgIdParam
        ? `/projects?OrgID=${orgIdParam}&org_id=${orgIdParam}`
        : '/projects';
      const res = await api.get(endpoint);
      const data = Array.isArray(res.data) ? res.data : res.data?.projects || [];
      // Sequential sorting by ID
      setProjects(data.sort((a: any, b: any) => Number(a.id ?? a.ProjectID ?? 0) - Number(b.id ?? b.ProjectID ?? 0)));
    } catch (err: any) {
      console.log('Projects fetch error:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (orgIdParam) {
      setNewOrgId(orgIdParam);
    }
  }, [orgIdParam]);

  // Navigate directly to project tickets if projectId parameter is provided via deep link
  useEffect(() => {
    if (params.projectId && projects.length > 0) {
      const matched = projects.find(
        (p) => String(p.id ?? p.ProjectID) === String(params.projectId)
      );
      if (matched) {
        handleProjectClick(
          Number(matched.id ?? matched.ProjectID),
          matched.Name ?? matched.name ?? 'Project'
        );
      }
    }
  }, [params.projectId, projects]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects();
  }, [orgIdParam]);

  const handleCreate = async () => {
    if (!newName.trim()) {
      showAlert({
        title: 'Validation Error',
        message: 'Project name is required.',
        type: 'error',
      });
      return;
    }

    try {
      setCreating(true);
      const targetOrg = newOrgId.trim() ? Number(newOrgId) : (orgIdParam ? Number(orgIdParam) : undefined);

      await api.post('/projects', {
        Name: newName,
        name: newName,
        Description: newDesc,
        description: newDesc,
        OrgID: targetOrg,
        org_id: targetOrg,
        OrganizationID: targetOrg,
      });

      await triggerLocalNotification(
        'Project Created',
        `Project "${newName}" has been successfully added to the portfolio.`,
        { screen: '/projects' }
      );

      setShowCreateModal(false);
      setNewName('');
      setNewDesc('');
      setNewOrgId(orgIdParam);
      fetchProjects();
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to create project.',
        type: 'error',
      });
    } finally {
      setCreating(false);
    }
  };

  const openMoveModal = (projectId: number, currentOrg?: number) => {
    setTargetProject({ id: projectId, orgId: currentOrg });
    setMoveOrgInput(currentOrg ? String(currentOrg) : '1');
    setMoveModalVisible(true);
  };

  const handleReassignOrg = async () => {
    if (!targetProject) return;
    const targetOrgNum = Number(moveOrgInput.trim());

    if (isNaN(targetOrgNum) || targetOrgNum <= 0) {
      showAlert({
        title: 'Invalid ID',
        message: 'Please enter a valid numeric Organization ID.',
        type: 'error',
      });
      return;
    }

    try {
      setMoving(true);
      await api.put(`/projects/${targetProject.id}`, {
        OrgID: targetOrgNum,
        org_id: targetOrgNum,
        OrganizationID: targetOrgNum,
      });

      await triggerLocalNotification(
        'Project Reassigned',
        `Project #${targetProject.id} transferred to Organization #${targetOrgNum}.`,
        { screen: '/projects' }
      );

      setMoveModalVisible(false);
      const projId = targetProject.id;
      setTargetProject(null);
      fetchProjects();

      showAlert({
        title: 'Success',
        message: `Project #${projId} successfully moved to Organization #${targetOrgNum}.`,
        type: 'success',
      });
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to reassign organization.',
        type: 'error',
      });
    } finally {
      setMoving(false);
    }
  };

  const handleDelete = (id: number) => {
    showAlert({
      title: 'Delete Project',
      message: `Are you sure you want to delete Project #${id}?`,
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/projects/${id}`);
              fetchProjects();
            } catch (err: any) {
              showAlert({
                title: 'Error',
                message: err.response?.data?.message || 'Failed to delete project.',
                type: 'error',
              });
            }
          },
        },
      ],
    });
  };

  const handleProjectClick = (pId: number, pName: string) => {
    router.push({
      pathname: '/tickets',
      params: {
        projectId: String(pId),
        projectName: pName,
      },
    });
  };

  const displayedProjects = orgIdParam
    ? projects.filter((proj) => {
        const pOrg = proj.OrgID ?? proj.org_id ?? proj.OrganizationID ?? proj.organization_id;
        return Number(pOrg) === Number(orgIdParam);
      })
    : projects;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#34d399" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <View style={styles.pillBadge}>
              <Ionicons name="sparkles" size={11} color="#34d399" />
              <Text style={styles.pillBadgeText}>PORTFOLIO DIRECTORY</Text>
            </View>
            <Text style={[styles.pageTitle, { color: colors.text }]} numberOfLines={1}>
              {orgNameParam ? `${orgNameParam} Projects` : 'All Projects'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#022c22" />
            <Text style={styles.newBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Filtered Bar if Org ID passed */}
        {orgIdParam ? (
          <View style={styles.filterNotice}>
            <Ionicons name="funnel-outline" size={13} color="#34d399" />
            <Text style={styles.filterNoticeText}>
              Filtered by: {orgNameParam || `Org #${orgIdParam}`}
            </Text>
          </View>
        ) : null}

        {/* Projects List */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading sprint repositories...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
          >
            {displayedProjects.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="folder-open-outline" size={44} color="#64748b" />
                <Text style={styles.emptyTitle}>No projects available</Text>
                <Text style={styles.emptySub}>
                  {orgIdParam
                    ? 'No projects registered for this organization.'
                    : 'Click "New" to initialize your first project.'}
                </Text>
              </View>
            ) : (
              displayedProjects.map((proj, idx) => {
                const pId = Number(proj.id ?? proj.ProjectID);
                const displaySequence = idx + 1; // Continuous visual counting: 1, 2, 3, 4, 5...
                const pName = proj.Name ?? proj.name ?? 'Untitled Project';
                const pDesc = proj.Description ?? proj.description ?? 'No description provided for this project.';
                const pOrg = proj.OrgID ?? proj.org_id ?? proj.OrganizationID ?? proj.organization_id;

                return (
                  <TouchableOpacity
                    key={pId}
                    style={[styles.projectCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                    activeOpacity={0.85}
                    onPress={() => handleProjectClick(pId, pName)}
                  >
                    {/* Top Row: Icon, Details & Actions */}
                    <View style={styles.cardHeader}>
                      <View style={styles.titleRow}>
                        <View style={styles.iconBox}>
                          <Ionicons name="folder-outline" size={18} color="#10b981" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.projectTitle, { color: colors.text }]} numberOfLines={1}>
                            {pName}
                          </Text>
                          <View style={styles.idRow}>
                            <Text style={styles.idBadge}>ID #{displaySequence}</Text>
                            {pOrg && (
                              <View style={styles.orgTag}>
                                <Ionicons name="layers-outline" size={10} color="#34d399" />
                                <Text style={styles.orgTagText}>Org #{pOrg}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>

                      {/* Move & Delete action buttons */}
                      <View style={styles.cardActions} onStartShouldSetResponder={() => true}>
                        <TouchableOpacity
                          style={styles.moveBtn}
                          onPress={() => openMoveModal(pId, pOrg)}
                        >
                          <Ionicons name="business-outline" size={12} color="#34d399" />
                          <Text style={styles.moveBtnText}>Move</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleDelete(pId)}
                        >
                          <Ionicons name="trash-outline" size={15} color="#f87171" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Description */}
                    <Text style={styles.projectDesc} numberOfLines={2}>
                      {pDesc}
                    </Text>

                    {/* Footer */}
                    <View style={styles.cardFooter}>
                      <View style={styles.sprintBadge}>
                        <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
                        <Text style={styles.sprintText}>Sprint Active</Text>
                      </View>

                      <View style={styles.inspectPrompt}>
                        <Text style={styles.inspectText}>Inspect Tickets</Text>
                        <Ionicons name="arrow-forward" size={13} color="#10b981" />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        )}

        {/* CREATE PROJECT MODAL */}
        <Modal visible={showCreateModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="folder-outline" size={20} color="#10b981" />
                  <Text style={[styles.modalHeading, { color: colors.text }]}>Create New Project</Text>
                </View>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Ionicons name="close" size={22} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Project Name *</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="e.g. Mobile App Redesign"
                  placeholderTextColor="#64748b"
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Organization ID (Optional)</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="e.g. 1"
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                  value={newOrgId}
                  onChangeText={setNewOrgId}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { color: colors.text }]}
                  placeholder="Concise objective for this project..."
                  placeholderTextColor="#64748b"
                  multiline
                  numberOfLines={3}
                  value={newDesc}
                  onChangeText={setNewDesc}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={styles.cancelModalText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitModalBtn, creating && { opacity: 0.6 }]}
                  disabled={creating}
                  onPress={handleCreate}
                >
                  {creating ? (
                    <ActivityIndicator size="small" color="#022c22" />
                  ) : (
                    <Text style={styles.submitModalText}>Create Project</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* REASSIGN / MOVE ORG MODAL */}
        <Modal visible={moveModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.modalHeading, { color: colors.text }]}>Reassign Organization</Text>
              <Text style={styles.modalSub}>
                Enter target Organization ID for Project #{targetProject?.id}:
              </Text>

              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. 1, 2, 3"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                value={moveOrgInput}
                onChangeText={setMoveOrgInput}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setMoveModalVisible(false)}
                >
                  <Text style={styles.cancelModalText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitModalBtn, moving && { opacity: 0.6 }]}
                  disabled={moving}
                  onPress={handleReassignOrg}
                >
                  {moving ? (
                    <ActivityIndicator size="small" color="#022c22" />
                  ) : (
                    <Text style={styles.submitModalText}>Confirm Move</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>

      <AppTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  pillBadgeText: {
    color: '#34d399',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10b981',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 10,
  },
  newBtnText: {
    color: '#022c22',
    fontSize: 12.5,
    fontWeight: '800',
  },
  filterNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    alignSelf: 'flex-start',
  },
  filterNoticeText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 12.5,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    gap: 14,
  },
  emptyCard: {
    padding: 50,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
  },
  projectCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectTitle: {
    fontSize: 15.5,
    fontWeight: '800',
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  idBadge: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
  },
  orgTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 5,
  },
  orgTagText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.28)',
  },
  moveBtnText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 5,
  },
  projectDesc: {
    color: '#94a3b8',
    fontSize: 12.5,
    lineHeight: 18,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  sprintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sprintText: {
    color: '#94a3b8',
    fontSize: 11.5,
    fontWeight: '600',
  },
  inspectPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inspectText: {
    color: '#10b981',
    fontSize: 11.5,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12.5,
    color: '#94a3b8',
  },
  formGroup: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94a3b8',
  },
  input: {
    backgroundColor: '#020617',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  cancelModalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cancelModalText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 12.5,
  },
  submitModalBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  submitModalText: {
    color: '#022c22',
    fontWeight: '800',
    fontSize: 12.5,
  },
});