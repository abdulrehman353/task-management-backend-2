import AppTabs from '@/components/app-tabs';
import { useAppAlert } from '@/context/AlertContext';
import { useAppTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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

interface UserItem {
  id?: number;
  UserID?: number;
  user_id?: number;
  name?: string;
  Name?: string;
  email?: string;
  Email?: string;
  Date_of_birth?: string;
  role?: string;
  Role?: string;
  RoleName?: string;
}

interface RoleItem {
  id?: number;
  RoleID?: number;
  role_id?: number;
  RoleName?: string;
  roleName?: string;
  name?: string;
  Name?: string;
}

interface TicketItem {
  id?: number;
  TicketID?: number;
  ticket_id?: number;
  Title?: string;
  title?: string;
  Description?: string;
  description?: string;
  Status?: string;
  status?: string;
  Priority?: string;
  priority?: string;
  ProjectID?: number;
  project_id?: number;
  Attachment?: string;
  AttachmentURL?: string;
  attachment_url?: string;
  image_url?: string;
  AssignedToUserID?: number | null;
  assignedToUserId?: number | null;
  AssignedTo?: number | null;
  assigned_to?: number | null;
  assignedTo?: number | null;
  UserID?: number | null;
  userId?: number | null;
}

export default function UsersScreen() {
  const { colors } = useAppTheme();
  const { showAlert } = useAppAlert();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [allTickets, setAllTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Role assignment states
  const [selectedRoles, setSelectedRoles] = useState<{ [userId: number]: string }>({});
  const [roleModalUser, setRoleModalUser] = useState<UserItem | null>(null);

  // Modal display states
  const [viewingUser, setViewingUser] = useState<UserItem | null>(null);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState<TicketItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [creatingUser, setCreatingUser] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Create user form state
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    date_of_birth: '',
  });

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes, ticketsRes] = await Promise.allSettled([
        api.get('/users'),
        api.get('/roles'),
        api.get('/tickets'),
      ]);

      if (usersRes.status === 'fulfilled') {
        const u = Array.isArray(usersRes.value.data) ? usersRes.value.data : usersRes.value.data?.users || [];
        // Sequential sorting by ID
        setUsers(u.sort((a: any, b: any) => Number(a.id ?? a.UserID ?? 0) - Number(b.id ?? b.UserID ?? 0)));
      }
      if (rolesRes.status === 'fulfilled') {
        setRoles(Array.isArray(rolesRes.value.data) ? rolesRes.value.data : rolesRes.value.data?.roles || []);
      }
      if (ticketsRes.status === 'fulfilled') {
        setAllTickets(Array.isArray(ticketsRes.value.data) ? ticketsRes.value.data : ticketsRes.value.data?.tickets || []);
      }
    } catch (err: any) {
      console.log('Error fetching user records:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open user details modal when userId parameter is received via deep link
  useEffect(() => {
    if (params.userId && users.length > 0) {
      const matched = users.find(
        (u) => String(u.id ?? u.UserID ?? u.user_id) === String(params.userId)
      );
      if (matched) {
        setViewingUser(matched);
      }
    }
  }, [params.userId, users]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleRoleAssign = async (userId: number, roleId: string) => {
    try {
      await api.post('/roles/assign', {
        UserID: userId,
        userId: userId,
        RoleID: Number(roleId),
        roleId: Number(roleId),
      });

      setSelectedRoles((prev) => ({ ...prev, [userId]: roleId }));
      setRoleModalUser(null);

      await triggerLocalNotification(
        'Role Allocated',
        `Assigned new security role to User #${userId}.`,
        { screen: '/users' }
      );

      showAlert({
        title: 'Success',
        message: 'Role assigned successfully.',
        type: 'success',
      });
      fetchData();
    } catch (err: any) {
      showAlert({
        title: 'Role Assign Error',
        message: err.response?.data?.message || 'Failed to assign role.',
        type: 'error',
      });
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      showAlert({
        title: 'Validation Error',
        message: 'Please fill in name, email and password.',
        type: 'error',
      });
      return;
    }

    try {
      setCreatingUser(true);
      const payload: any = {
        name: createForm.name.trim(),
        Name: createForm.name.trim(),
        email: createForm.email.trim(),
        Email: createForm.email.trim(),
        password: createForm.password,
        Password: createForm.password,
      };

      if (createForm.date_of_birth.trim()) {
        payload.Date_of_birth = createForm.date_of_birth.trim();
        payload.date_of_birth = createForm.date_of_birth.trim();
      }

      await api.post('/auth/signup', payload);

      await triggerLocalNotification(
        'User Registered',
        `Account "${createForm.name}" successfully created.`,
        { screen: '/users' }
      );

      showAlert({
        title: 'Success',
        message: 'User created successfully.',
        type: 'success',
      });
      setShowCreateModal(false);
      setShowPassword(false);
      setCreateForm({ name: '', email: '', password: '', date_of_birth: '' });
      fetchData();
    } catch (err: any) {
      showAlert({
        title: 'Creation Failed',
        message: err.response?.data?.message || 'Failed to create user account.',
        type: 'error',
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const getUserAssignedTickets = (userId?: number) => {
    if (!userId) return [];
    return allTickets.filter((t) => {
      const assigned =
        t.AssignedToUserID ??
        t.assignedToUserId ??
        t.AssignedTo ??
        t.assigned_to ??
        t.assignedTo ??
        t.UserID ??
        t.userId;
      return Number(assigned) === Number(userId);
    });
  };

  const getUserRoleTitle = (user: UserItem) => {
    if (user.role || user.Role || user.RoleName) {
      return user.role || user.Role || user.RoleName;
    }
    const selected = selectedRoles[user.id ?? user.UserID ?? user.user_id ?? 0];
    if (selected) {
      const r = roles.find((role) => String(role.id ?? role.RoleID ?? role.role_id) === String(selected));
      if (r) return r.RoleName ?? r.name;
    }
    return 'Pending / No Role';
  };

  const formatAttachmentUrl = (rawUrl?: string) => {
    if (!rawUrl) return '';
    let cleaned = String(rawUrl).trim().replace(/^['"]|['"]$/g, '');
    if (cleaned === '[object Object]' || cleaned.includes('[object')) return '';
    cleaned = cleaned.replace('//minio:9000', '//localhost:9000');
    cleaned = cleaned.replace('/task-attachments/tickets/', '/task-attachments/');
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = `http://${cleaned}`;
    }
    return cleaned;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#34d399" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <View style={styles.pillBadge}>
              <Ionicons name="shield-checkmark" size={11} color="#34d399" />
              <Text style={styles.pillBadgeText}>USER & ACCESS CONTROL</Text>
            </View>
            <Text style={[styles.pageTitle, { color: colors.text }]} numberOfLines={1}>
              System Users
            </Text>
          </View>

          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={16} color="#022c22" />
            <Text style={styles.newBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        {/* User Accounts List */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Syncing user roster...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
          >
            {users.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="people-outline" size={44} color="#64748b" />
                <Text style={styles.emptyTitle}>No registered users found</Text>
                <Text style={styles.emptySub}>Tap "+ New" to register a corporate account.</Text>
              </View>
            ) : (
              users.map((u, idx) => {
                const uId = Number(u.id ?? u.UserID ?? u.user_id);
                const displaySequence = idx + 1; // Continuous visual counting: 1, 2, 3, 4, 5...
                const uName = u.name ?? u.Name ?? 'Unnamed';
                const uEmail = u.email ?? u.Email ?? 'N/A';
                const uDob = u.Date_of_birth ? u.Date_of_birth.slice(0, 10) : 'Not specified';
                const initialChar = uName.charAt(0).toUpperCase();
                const currentRole = getUserRoleTitle(u);
                const assignedCount = getUserAssignedTickets(uId).length;

                return (
                  <TouchableOpacity
                    key={uId}
                    style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                    activeOpacity={0.85}
                    onPress={() => setViewingUser(u)}
                  >
                    {/* Top Row: Avatar, Name, Email */}
                    <View style={styles.cardHeader}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initialChar}</Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                            {uName}
                          </Text>
                          <Text style={styles.userIdBadge}>ID #{displaySequence}</Text>
                        </View>
                        <View style={styles.emailRow}>
                          <Ionicons name="mail-outline" size={12} color="#64748b" />
                          <Text style={styles.emailText} numberOfLines={1}>{uEmail}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Metadata & Role Bar */}
                    <View style={styles.metaContainer}>
                      <View style={styles.roleTag}>
                        <Ionicons name="shield-outline" size={11} color="#38bdf8" />
                        <Text style={styles.roleTagText}>{currentRole}</Text>
                      </View>

                      <View style={styles.dobTag}>
                        <Ionicons name="calendar-outline" size={11} color="#94a3b8" />
                        <Text style={styles.dobText}>{uDob}</Text>
                      </View>

                      <View style={styles.ticketCountTag}>
                        <Ionicons name="ticket-outline" size={11} color="#34d399" />
                        <Text style={styles.ticketCountText}>{assignedCount} Tasks</Text>
                      </View>
                    </View>

                    {/* Card Actions Footer */}
                    <View style={styles.cardFooter} onStartShouldSetResponder={() => true}>
                      <TouchableOpacity
                        style={styles.assignRoleBtn}
                        onPress={() => setRoleModalUser(u)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="shield" size={12} color="#10b981" />
                        <Text style={styles.assignRoleBtnText}>Assign Role</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.viewDetailsBtn}
                        onPress={() => setViewingUser(u)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.viewDetailsBtnText}>Inspect Tasks</Text>
                        <Ionicons name="chevron-forward" size={13} color="#10b981" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        )}

        {/* ROLE SELECTION MODAL */}
        <Modal visible={!!roleModalUser} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalHeading, { color: colors.text }]}>Assign Role</Text>
                <TouchableOpacity onPress={() => setRoleModalUser(null)}>
                  <Ionicons name="close" size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSub}>
                Select an enterprise role for {roleModalUser?.name ?? roleModalUser?.Name}:
              </Text>

              <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false}>
                {roles.map((r) => {
                  const rId = String(r.id ?? r.RoleID ?? r.role_id);
                  const rName = r.RoleName ?? r.name ?? `Role #${rId}`;
                  const uId = Number(roleModalUser?.id ?? roleModalUser?.UserID ?? roleModalUser?.user_id);
                  const isCurrent = getUserRoleTitle(roleModalUser || {}) === rName;

                  return (
                    <TouchableOpacity
                      key={rId}
                      style={[styles.roleSelectRow, isCurrent && styles.roleSelectRowActive]}
                      onPress={() => handleRoleAssign(uId, rId)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={isCurrent ? '#10b981' : '#64748b'} />
                        <Text style={[styles.roleSelectText, isCurrent && { color: '#10b981' }]}>{rName}</Text>
                      </View>
                      {isCurrent ? <Ionicons name="checkmark" size={16} color="#10b981" /> : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setRoleModalUser(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* CREATE USER MODAL */}
        <Modal visible={showCreateModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="person-add" size={18} color="#10b981" />
                  <Text style={[styles.modalHeading, { color: colors.text }]}>Create System User</Text>
                </View>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Ionicons name="close" size={22} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                <View>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="e.g. John Doe"
                    placeholderTextColor="#64748b"
                    value={createForm.name}
                    onChangeText={(val) => setCreateForm({ ...createForm, name: val })}
                  />
                </View>

                <View>
                  <Text style={styles.inputLabel}>Email Address *</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="name@company.com"
                    placeholderTextColor="#64748b"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={createForm.email}
                    onChangeText={(val) => setCreateForm({ ...createForm, email: val })}
                  />
                </View>

                <View>
                  <Text style={styles.inputLabel}>Password *</Text>
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      style={[styles.input, { color: colors.text, paddingRight: 40 }]}
                      placeholder="••••••••"
                      placeholderTextColor="#64748b"
                      secureTextEntry={!showPassword}
                      value={createForm.password}
                      onChangeText={(val) => setCreateForm({ ...createForm, password: val })}
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={18}
                        color="#64748b"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View>
                  <Text style={styles.inputLabel}>Date of Birth (YYYY-MM-DD)</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="e.g. 2002-05-14"
                    placeholderTextColor="#64748b"
                    value={createForm.date_of_birth}
                    onChangeText={(val) => setCreateForm({ ...createForm, date_of_birth: val })}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreateModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitBtn, creatingUser && { opacity: 0.6 }]}
                  disabled={creatingUser}
                  onPress={handleCreateUser}
                >
                  {creatingUser ? (
                    <ActivityIndicator size="small" color="#022c22" />
                  ) : (
                    <Text style={styles.submitBtnText}>Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* USER DETAILS & ASSIGNED TASKS MODAL */}
        <Modal visible={!!viewingUser} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.detailModalBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.avatarModal}>
                    <Text style={styles.avatarModalText}>
                      {(viewingUser?.name ?? viewingUser?.Name ?? 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.modalHeading, { color: colors.text }]}>
                      {viewingUser?.name ?? viewingUser?.Name}
                    </Text>
                    <Text style={styles.modalSubSmall}>
                      {viewingUser?.email ?? viewingUser?.Email}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setViewingUser(null)}>
                  <Ionicons name="close" size={22} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {/* Role banner inside modal */}
              <View style={styles.roleSummaryCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="shield-checkmark" size={15} color="#10b981" />
                  <Text style={styles.roleSummaryLabel}>System Role:</Text>
                </View>
                <Text style={styles.roleSummaryVal}>{getUserRoleTitle(viewingUser || {})}</Text>
              </View>

              {/* Assigned Tasks Sub-list */}
              <View style={{ marginTop: 14 }}>
                <View style={styles.assignedTasksHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="ticket-outline" size={15} color="#60a5fa" />
                    <Text style={[styles.assignedHeading, { color: colors.text }]}>Assigned Tasks</Text>
                  </View>
                  <View style={styles.badgeCount}>
                    <Text style={styles.badgeCountText}>
                      {getUserAssignedTickets(viewingUser?.id ?? viewingUser?.UserID).length} Active
                    </Text>
                  </View>
                </View>

                <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
                  {getUserAssignedTickets(viewingUser?.id ?? viewingUser?.UserID).length === 0 ? (
                    <View style={styles.emptyTasksBox}>
                      <Text style={styles.emptyTasksText}>No tasks assigned to this account.</Text>
                    </View>
                  ) : (
                    getUserAssignedTickets(viewingUser?.id ?? viewingUser?.UserID).map((t, taskIdx) => {
                      const tId = t.id ?? t.TicketID ?? t.ticket_id;
                      const displayTaskId = taskIdx + 1;
                      const tTitle = t.title ?? t.Title ?? 'Untitled Task';
                      const tStatus = (t.status ?? t.Status ?? 'todo').toUpperCase();

                      return (
                        <TouchableOpacity
                          key={tId}
                          style={styles.taskCompactRow}
                          activeOpacity={0.7}
                          onPress={() => setSelectedTicketDetail(t)}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                            <Text style={styles.taskCompactId}>#{displayTaskId}</Text>
                            <Text style={[styles.taskCompactTitle, { color: colors.text }]} numberOfLines={1}>
                              {tTitle}
                            </Text>
                          </View>
                          <View style={styles.taskStatusPill}>
                            <Text style={styles.taskStatusText}>{tStatus}</Text>
                          </View>
                          <Ionicons name="chevron-forward" size={14} color="#64748b" />
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>

              <TouchableOpacity style={styles.detailCloseBtn} onPress={() => setViewingUser(null)}>
                <Text style={styles.detailCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* NESTED TICKET DETAIL MODAL */}
        <Modal visible={!!selectedTicketDetail} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.ticketNestedBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.taskCompactId}>
                    #{selectedTicketDetail?.id ?? selectedTicketDetail?.TicketID}
                  </Text>
                  <View style={styles.taskStatusPill}>
                    <Text style={styles.taskStatusText}>
                      {(selectedTicketDetail?.priority ?? 'medium').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedTicketDetail(null)}>
                  <Ionicons name="close" size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <Text style={[styles.ticketMainTitle, { color: colors.text }]}>
                {selectedTicketDetail?.title ?? selectedTicketDetail?.Title}
              </Text>

              <View style={styles.ticketDescContainer}>
                <Text style={styles.ticketDescContent}>
                  {selectedTicketDetail?.description || 'No detailed acceptance criteria provided.'}
                </Text>
              </View>

              {(selectedTicketDetail?.Attachment || selectedTicketDetail?.AttachmentURL || selectedTicketDetail?.attachment_url || selectedTicketDetail?.image_url) ? (
                <View style={styles.imagePreviewWrap}>
                  <Image
                    source={{ uri: formatAttachmentUrl(selectedTicketDetail.Attachment || selectedTicketDetail.AttachmentURL || selectedTicketDetail.attachment_url || selectedTicketDetail.image_url) }}
                    style={styles.attachedImage}
                    resizeMode="contain"
                  />
                </View>
              ) : null}

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedTicketDetail(null)}>
                <Text style={styles.cancelBtnText}>Back to User</Text>
              </TouchableOpacity>
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
    gap: 12,
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
  userCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  userIdBadge: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  emailText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  roleTagText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  dobTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  dobText: {
    color: '#94a3b8',
    fontSize: 10.5,
    fontWeight: '600',
  },
  ticketCountTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  ticketCountText: {
    color: '#34d399',
    fontSize: 10.5,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  assignRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.28)',
  },
  assignRoleBtnText: {
    color: '#34d399',
    fontSize: 11.5,
    fontWeight: '700',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewDetailsBtnText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
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
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12.5,
    color: '#94a3b8',
  },
  modalSubSmall: {
    fontSize: 11.5,
    color: '#94a3b8',
    marginTop: 2,
  },
  roleSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#020617',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  roleSelectRowActive: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  roleSelectText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#020617',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 12.5,
  },
  submitBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  submitBtnText: {
    color: '#022c22',
    fontWeight: '800',
    fontSize: 12.5,
  },
  detailModalBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    maxHeight: '85%',
  },
  avatarModal: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarModalText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  roleSummaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  roleSummaryLabel: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  roleSummaryVal: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '800',
  },
  assignedTasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignedHeading: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  badgeCount: {
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeCountText: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyTasksBox: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 8,
  },
  emptyTasksText: {
    color: '#64748b',
    fontSize: 12,
  },
  taskCompactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#020617',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    gap: 8,
  },
  taskCompactId: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38bdf8',
  },
  taskCompactTitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  taskStatusPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  taskStatusText: {
    color: '#38bdf8',
    fontSize: 9.5,
    fontWeight: '700',
  },
  detailCloseBtn: {
    marginTop: 14,
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  detailCloseBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  ticketNestedBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  ticketMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  ticketDescContainer: {
    backgroundColor: '#020617',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  ticketDescContent: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
  imagePreviewWrap: {
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#020617',
  },
  attachedImage: {
    width: '100%',
    height: '100%',
  },
});