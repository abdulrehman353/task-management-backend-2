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

interface Organization {
  id?: number;
  OrgID?: number;
  org_id?: number;
  Name?: string;
  name?: string;
  Email?: string;
  email?: string;
  ContactNumber?: string;
  contact_number?: string;
  phone?: string;
  OwnerID?: number;
  owner_id?: number;
  OwnerId?: number;
}

export default function OrganizationsScreen() {
  const { colors } = useAppTheme();
  const { showAlert } = useAppAlert();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New Organization Modal & Form state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgEmail, setNewOrgEmail] = useState('');
  const [newOrgContact, setNewOrgContact] = useState('');

  // Member management inputs mapped by org ID
  const [memberInputs, setMemberInputs] = useState<{ [key: number]: string }>({});

  // Workspace rename modal states
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [targetOrg, setTargetOrg] = useState<{ id: number; name: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const fetchOrgs = async () => {
    try {
      const res = await api.get('/orgs');
      const data = Array.isArray(res.data) ? res.data : res.data?.organizations || [];
      // Sequential sorting by ID safely
      setOrgs(
        data.sort(
          (a: any, b: any) =>
            Number(a.id ?? a.OrgID ?? a.org_id ?? 0) - Number(b.id ?? b.OrgID ?? b.org_id ?? 0)
        )
      );
    } catch (err: any) {
      console.log('Orgs fetch error:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  // Navigate directly to organization projects if orgId parameter is provided via deep link
  useEffect(() => {
    if (params.orgId && orgs.length > 0) {
      const matched = orgs.find(
        (o) => String(o.id ?? o.OrgID ?? o.org_id) === String(params.orgId)
      );
      if (matched) {
        const targetId = Number(matched.id ?? matched.OrgID ?? matched.org_id) || 1;
        const targetName = matched.name ?? matched.Name ?? 'Workspace';
        handleOrgClick(targetId, targetName);
      }
    }
  }, [params.orgId, orgs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrgs();
  }, []);

  const handleOrgClick = (orgId: number, orgName: string) => {
    router.push({
      pathname: '/projects',
      params: {
        orgId: String(orgId),
        orgName: orgName,
      },
    });
  };

  const handleCreate = async () => {
    if (!newOrgName.trim()) {
      showAlert({
        title: 'Validation Error',
        message: 'Organization name is required.',
        type: 'error',
      });
      return;
    }

    try {
      setCreating(true);
      const payload = {
        Name: newOrgName.trim(),
        name: newOrgName.trim(),
        Email: newOrgEmail.trim() || undefined,
        email: newOrgEmail.trim() || undefined,
        ContactNumber: newOrgContact.trim() || undefined,
        contact_number: newOrgContact.trim() || undefined,
        phone: newOrgContact.trim() || undefined,
      };

      await api.post('/orgs', payload);

      await triggerLocalNotification(
        'Workspace Created',
        `Organization "${newOrgName}" has been successfully registered.`,
        { screen: '/organizations' }
      );

      showAlert({
        title: 'Success',
        message: `Organization "${newOrgName}" created successfully.`,
        type: 'success',
      });

      setNewOrgName('');
      setNewOrgEmail('');
      setNewOrgContact('');
      setCreateModalVisible(false);
      fetchOrgs();
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to create workspace.',
        type: 'error',
      });
    } finally {
      setCreating(false);
    }
  };

  const openRenameModal = (orgId: number, currentName: string) => {
    setTargetOrg({ id: orgId, name: currentName });
    setRenameValue(currentName);
    setRenameModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!targetOrg || !renameValue.trim()) return;
    try {
      await api.put(`/orgs/${targetOrg.id}`, { Name: renameValue.trim(), name: renameValue.trim() });

      await triggerLocalNotification(
        'Workspace Renamed',
        `Organization #${targetOrg.id} renamed to "${renameValue}".`,
        { screen: '/organizations' }
      );

      setRenameModalVisible(false);
      setTargetOrg(null);
      fetchOrgs();

      showAlert({
        title: 'Success',
        message: 'Workspace renamed successfully.',
        type: 'success',
      });
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to rename workspace.',
        type: 'error',
      });
    }
  };

  const handleDelete = (orgId: number) => {
    showAlert({
      title: 'Delete Organization',
      message: `Are you sure you want to delete Organization #${orgId}?`,
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/orgs/${orgId}`);
              fetchOrgs();
            } catch (err: any) {
              showAlert({
                title: 'Error',
                message: err.response?.data?.message || 'Failed to delete workspace.',
                type: 'error',
              });
            }
          },
        },
      ],
    });
  };

  const setOrgUserId = (orgId: number, val: string) => {
    setMemberInputs((prev) => ({ ...prev, [orgId]: val }));
  };

  const handleAssignUser = async (orgId: number) => {
    const userId = memberInputs[orgId];
    if (!userId) {
      showAlert({
        title: 'Validation Error',
        message: 'Please enter a valid User ID.',
        type: 'error',
      });
      return;
    }

    try {
      await api.post('/orgs/assign-user', {
        OrgID: Number(orgId),
        org_id: Number(orgId),
        UserID: Number(userId),
        userId: Number(userId),
      });

      await triggerLocalNotification(
        'Member Assigned',
        `User #${userId} added to Organization #${orgId}.`,
        { screen: '/organizations' }
      );

      showAlert({
        title: 'Success',
        message: `User #${userId} assigned to Organization #${orgId} successfully.`,
        type: 'success',
      });
      setOrgUserId(orgId, '');
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to assign user.',
        type: 'error',
      });
    }
  };

  const handleRemoveUser = async (orgId: number) => {
    const userId = memberInputs[orgId];
    if (!userId) {
      showAlert({
        title: 'Validation Error',
        message: 'Please enter a valid User ID.',
        type: 'error',
      });
      return;
    }

    try {
      await api.post('/orgs/remove-user', {
        OrgID: Number(orgId),
        org_id: Number(orgId),
        UserID: Number(userId),
        userId: Number(userId),
      });

      await triggerLocalNotification(
        'Member Removed',
        `User #${userId} removed from Organization #${orgId}.`,
        { screen: '/organizations' }
      );

      showAlert({
        title: 'Success',
        message: `User #${userId} removed from Organization #${orgId}.`,
        type: 'success',
      });
      setOrgUserId(orgId, '');
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: err.response?.data?.message || 'Failed to remove user.',
        type: 'error',
      });
    }
  };

  const handleTransferOwner = async (orgId: number) => {
    const newOwnerId = memberInputs[orgId];
    if (!newOwnerId) {
      showAlert({
        title: 'Validation Error',
        message: 'Please enter the target Owner User ID.',
        type: 'error',
      });
      return;
    }

    showAlert({
      title: 'Transfer Ownership',
      message: `Are you sure you want to transfer ownership of Organization #${orgId} to User #${newOwnerId}?`,
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post('/orgs/transfer-owner', {
                OrgID: Number(orgId),
                org_id: Number(orgId),
                NewOwnerID: Number(newOwnerId),
                newOwnerId: Number(newOwnerId),
              });

              await triggerLocalNotification(
                'Ownership Transferred',
                `Organization #${orgId} ownership transferred to User #${newOwnerId}.`,
                { screen: '/organizations' }
              );

              showAlert({
                title: 'Success',
                message: 'Ownership transferred successfully.',
                type: 'success',
              });
              setOrgUserId(orgId, '');
              fetchOrgs();
            } catch (err: any) {
              showAlert({
                title: 'Error',
                message: err.response?.data?.message || 'Failed to transfer ownership.',
                type: 'error',
              });
            }
          },
        },
      ],
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Top Header Navigation */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#34d399" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <View style={styles.pillBadge}>
              <Ionicons name="sparkles" size={11} color="#34d399" />
              <Text style={styles.pillBadgeText}>ORGANIZATIONAL WORKSPACES</Text>
            </View>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Organizations</Text>
          </View>

          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#022c22" />
            <Text style={styles.newBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Organizations List */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
          >
            {orgs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="business-outline" size={36} color="#64748b" />
                <Text style={styles.emptyText}>No organizations registered yet</Text>
              </View>
            ) : (
              orgs.map((org, idx) => {
                const rawId = org.id ?? org.OrgID ?? org.org_id;
                const orgId = Number(rawId) || (idx + 1);
                const uniqueKey = rawId != null ? String(rawId) : `org-${idx}`;
                const displaySequence = idx + 1; // Continuous visual counting: 1, 2, 3, 4, 5...
                const orgNameStr = org.name ?? org.Name ?? 'Unnamed Org';
                const ownerId = org.owner_id ?? org.OwnerID ?? org.OwnerId ?? 'N/A';
                const orgEmail = org.email ?? org.Email;
                const orgContact = org.contact_number ?? org.ContactNumber ?? org.phone;

                return (
                  <TouchableOpacity
                    key={uniqueKey}
                    activeOpacity={0.9}
                    onPress={() => handleOrgClick(orgId, orgNameStr)}
                    style={[styles.orgCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  >
                    {/* Top Row: Icon, Title & Actions */}
                    <View style={styles.cardHeader}>
                      <View style={styles.titleGroup}>
                        <View style={styles.iconBox}>
                          <Ionicons name="business" size={18} color="#10b981" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.orgName, { color: colors.text }]}>{orgNameStr}</Text>
                          <Text style={styles.orgId}>ID #{displaySequence}</Text>
                        </View>
                      </View>

                      <View style={styles.actionRow} onStartShouldSetResponder={() => true}>
                        <TouchableOpacity
                          style={styles.iconAction}
                          onPress={() => openRenameModal(orgId, orgNameStr)}
                        >
                          <Ionicons name="pencil-outline" size={16} color="#94a3b8" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconAction} onPress={() => handleDelete(orgId)}>
                          <Ionicons name="trash-outline" size={16} color="#f87171" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Contact & Email tags */}
                    {(orgEmail || orgContact) && (
                      <View style={styles.contactRow}>
                        {orgEmail && (
                          <View style={styles.contactTag}>
                            <Ionicons name="mail-outline" size={11} color="#38bdf8" />
                            <Text style={styles.contactTagText} numberOfLines={1}>{orgEmail}</Text>
                          </View>
                        )}
                        {orgContact && (
                          <View style={styles.contactTag}>
                            <Ionicons name="call-outline" size={11} color="#34d399" />
                            <Text style={styles.contactTagText} numberOfLines={1}>{orgContact}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Owner Info & Projects Prompt */}
                    <View style={styles.ownerRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                        <Ionicons name="people-outline" size={14} color="#64748b" />
                        <Text style={styles.ownerText}>
                          Owner ID: <Text style={{ color: colors.text, fontWeight: '700' }}>{ownerId}</Text>
                        </Text>
                      </View>
                      <View style={styles.viewProjectsPrompt}>
                        <Text style={styles.viewProjectsText}>View Projects</Text>
                        <Ionicons name="chevron-forward" size={13} color="#10b981" />
                      </View>
                    </View>

                    {/* Member Allocation Sub-panel */}
                    <View style={styles.memberBox} onStartShouldSetResponder={() => true}>
                      <Text style={styles.memberLabel}>MANAGE MEMBERS & OWNERSHIP</Text>
                      <TextInput
                        placeholder="Target User ID..."
                        placeholderTextColor="#64748b"
                        keyboardType="numeric"
                        value={memberInputs[orgId] || ''}
                        onChangeText={(val) => setOrgUserId(orgId, val)}
                        style={styles.memberInput}
                      />
                      <View style={styles.btnRow}>
                        <TouchableOpacity
                          style={[styles.mBtn, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}
                          onPress={() => handleAssignUser(orgId)}
                        >
                          <Ionicons name="person-add-outline" size={12} color="#34d399" />
                          <Text style={[styles.mBtnText, { color: '#34d399' }]}>Assign</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.mBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}
                          onPress={() => handleRemoveUser(orgId)}
                        >
                          <Ionicons name="person-remove-outline" size={12} color="#f87171" />
                          <Text style={[styles.mBtnText, { color: '#f87171' }]}>Remove</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.mBtn, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)' }]}
                          onPress={() => handleTransferOwner(orgId)}
                        >
                          <Ionicons name="swap-horizontal-outline" size={12} color="#60a5fa" />
                          <Text style={[styles.mBtnText, { color: '#60a5fa' }]}>Transfer</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        )}

        {/* CREATE WORKSPACE MODAL */}
        <Modal visible={createModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="business-outline" size={20} color="#10b981" />
                  <Text style={[styles.modalTitle, { color: colors.text }]}>New Organization</Text>
                </View>
                <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                  <Ionicons name="close" size={22} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                <View>
                  <Text style={styles.formInputLabel}>Organization Name *</Text>
                  <TextInput
                    style={[styles.inputField, { color: colors.text }]}
                    placeholder="e.g. Acme Corp Enterprise"
                    placeholderTextColor="#64748b"
                    value={newOrgName}
                    onChangeText={setNewOrgName}
                  />
                </View>

                <View>
                  <Text style={styles.formInputLabel}>Corporate Email</Text>
                  <TextInput
                    style={[styles.inputField, { color: colors.text }]}
                    placeholder="contact@acme.com"
                    placeholderTextColor="#64748b"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={newOrgEmail}
                    onChangeText={setNewOrgEmail}
                  />
                </View>

                <View>
                  <Text style={styles.formInputLabel}>Contact Number</Text>
                  <TextInput
                    style={[styles.inputField, { color: colors.text }]}
                    placeholder="+92 300 1234567"
                    placeholderTextColor="#64748b"
                    keyboardType="phone-pad"
                    value={newOrgContact}
                    onChangeText={setNewOrgContact}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setCreateModalVisible(false)}
                  style={styles.modalCancel}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreate}
                  disabled={creating}
                  style={[styles.modalSave, creating && { opacity: 0.6 }]}
                >
                  {creating ? (
                    <ActivityIndicator size="small" color="#022c22" />
                  ) : (
                    <Text style={styles.modalSaveText}>Create Workspace</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Rename Workspace Modal */}
        <Modal visible={renameModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Rename Workspace</Text>
              <TextInput
                style={[styles.inputField, { color: colors.text }]}
                value={renameValue}
                onChangeText={setRenameValue}
                placeholder="Workspace name"
                placeholderTextColor="#64748b"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setRenameModalVisible(false)} style={styles.modalCancel}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleUpdate} style={styles.modalSave}>
                  <Text style={styles.modalSaveText}>Save</Text>
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
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 80,
    gap: 14,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  orgCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgName: {
    fontSize: 15.5,
    fontWeight: '800',
  },
  orgId: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconAction: {
    padding: 4,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  contactTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#020617',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  contactTagText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  ownerText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  viewProjectsPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  viewProjectsText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  memberBox: {
    backgroundColor: '#020617',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  memberLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  memberInput: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#ffffff',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  mBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  mBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 24,
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
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  formInputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 4,
  },
  inputField: {
    backgroundColor: '#020617',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  modalCancel: {
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  modalCancelText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 12.5,
  },
  modalSave: {
    backgroundColor: '#10b981',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  modalSaveText: {
    color: '#022c22',
    fontWeight: '800',
    fontSize: 12.5,
  },
});