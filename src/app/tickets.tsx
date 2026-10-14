import { useAppAlert } from '@/context/AlertContext';
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
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axiosClient';
import { triggerLocalNotification } from '../services/notificationService';

interface ProjectItem {
  ProjectID?: number;
  id?: number;
  Name?: string;
  name?: string;
}

interface UserItem {
  id?: number;
  UserID?: number;
  user_id?: number;
  name?: string;
  Name?: string;
  email?: string;
  role?: string;
  Role?: any;
  RoleName?: string;
  role_name?: string;
  role_id?: number;
}

interface Ticket {
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
  AssignedUser?: UserItem;
  assignedUser?: UserItem;
}

const STATUS_COLUMNS = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'Ready To Do', color: '#94a3b8' },
  { key: 'in_progress', label: 'In Progress', color: '#38bdf8' },
  { key: 'blocked', label: 'Blocked', color: '#f87171' },
  { key: 'testing', label: 'Testing', color: '#fbbf24' },
  { key: 'done', label: 'Done', color: '#34d399' },
];

const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

export default function TicketBoardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showAlert } = useAppAlert();

  // Project filtering parameters
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    params.projectId ? String(params.projectId) : ''
  );
  const projectNameParam = params.projectName ? String(params.projectName) : '';

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Active filter states
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('');

  // Modal display states
  const [statusModalTicket, setStatusModalTicket] = useState<Ticket | null>(null);
  const [viewTicket, setViewTicket] = useState<Ticket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);

  // Edit ticket modal states
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [editing, setEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editStatus, setEditStatus] = useState('todo');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editProjId, setEditProjId] = useState('');

  // Ticket creation form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProjId, setNewProjId] = useState(params.projectId ? String(params.projectId) : '');
  const [newStatus, setNewStatus] = useState('todo');
  const [newPriority, setNewPriority] = useState('medium');
  const [newAssignedTo, setNewAssignedTo] = useState('');

  useEffect(() => {
    if (params.projectId) {
      setSelectedProjectId(String(params.projectId));
      setNewProjId(String(params.projectId));
    }
  }, [params.projectId]);

  // Automatically open ticket detail modal when triggered via deep link
  useEffect(() => {
    if (params.ticketId && tickets.length > 0) {
      const matched = tickets.find(
        (t) => String(t.id ?? t.TicketID ?? t.ticket_id) === String(params.ticketId)
      );
      if (matched) {
        setViewTicket(matched);
      }
    }
  }, [params.ticketId, tickets]);

  // Fetch ticket records from backend
  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      const data = Array.isArray(res.data) ? res.data : res.data?.tickets || [];
      setTickets(data);
    } catch (err: any) {
      console.log('Failed to fetch tickets:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch related projects and user profiles
  const fetchProjectsAndUsers = async () => {
    try {
      const [projRes, usersRes] = await Promise.allSettled([
        api.get('/projects'),
        api.get('/users'),
      ]);

      if (projRes.status === 'fulfilled') {
        const pData = Array.isArray(projRes.value.data) ? projRes.value.data : projRes.value.data?.projects || [];
        setProjects(pData);
      }
      if (usersRes.status === 'fulfilled') {
        const uData = Array.isArray(usersRes.value.data) ? usersRes.value.data : usersRes.value.data?.users || [];
        setUsersList(uData);
      }
    } catch {
      // Silent failure for background context
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchProjectsAndUsers();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets();
    fetchProjectsAndUsers();
  }, []);

  // Normalize status string formats
  const normalizeStatus = (raw?: string): string => {
    let s = (raw || 'todo').toLowerCase();
    if (s === 'ready to do' || s === 'to do') return 'todo';
    if (s === 'in progress') return 'in_progress';
    return s;
  };

  const getAssignedUserId = (ticket: Ticket): string => {
    const val =
      ticket.AssignedToUserID ??
      ticket.assignedToUserId ??
      ticket.AssignedTo ??
      ticket.assigned_to ??
      ticket.assignedTo ??
      ticket.UserID ??
      ticket.userId;
    return val ? String(val) : '';
  };

  const getUserName = (userIdVal?: string | number | null) => {
    if (!userIdVal) return 'Unassigned';
    const found = usersList.find((u) => {
      const uId = u.id ?? u.UserID ?? u.user_id;
      return String(uId) === String(userIdVal);
    });
    return found ? (found.Name ?? found.name ?? `User #${userIdVal}`) : `User #${userIdVal}`;
  };

  const getProjectName = (projIdVal?: string | number | null) => {
    if (!projIdVal) return 'None';
    const found = projects.find((p) => {
      const pId = p.ProjectID ?? p.id;
      return String(pId) === String(projIdVal);
    });
    return found ? (found.Name ?? found.name ?? `Project #${projIdVal}`) : `Project #${projIdVal}`;
  };

  const handleStatusChange = async (ticketId: number, nextStatus: string) => {
    try {
      setTickets((prev) =>
        prev.map((t) => {
          const id = t.id ?? t.TicketID ?? t.ticket_id;
          return Number(id) === Number(ticketId) ? { ...t, status: nextStatus, Status: nextStatus } : t;
        })
      );
      setStatusModalTicket(null);
      await api.put(`/tickets/${ticketId}`, { Status: nextStatus, status: nextStatus });

      await triggerLocalNotification(
        'Ticket Stage Updated',
        `Ticket #${ticketId} moved to ${nextStatus.toUpperCase()}.`,
        { ticketId, screen: '/tickets' }
      );

      fetchTickets();
    } catch (err: any) {
      showAlert({
        title: 'Update Error',
        message: err.response?.data?.message || 'Failed to update ticket status.',
        type: 'error',
      });
      fetchTickets();
    }
  };

  const handleDeleteTicket = (ticketId: number) => {
    showAlert({
      title: 'Delete Ticket',
      message: `Are you sure you want to delete Ticket #${ticketId}?`,
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/tickets/${ticketId}`);
              fetchTickets();
            } catch (err: any) {
              showAlert({
                title: 'Delete Error',
                message: err.response?.data?.message || 'Failed to delete ticket.',
                type: 'error',
              });
            }
          },
        },
      ],
    });
  };

  // Open Edit Modal with prefilled values
  const handleOpenEdit = (ticket: Ticket) => {
    setEditTicket(ticket);
    setEditTitle(ticket.title ?? ticket.Title ?? '');
    setEditDesc(ticket.description ?? ticket.Description ?? '');
    setEditPriority((ticket.priority || ticket.Priority || 'medium').toLowerCase());
    setEditStatus(normalizeStatus(ticket.status || ticket.Status));
    setEditAssignedTo(getAssignedUserId(ticket));
    setEditProjId(String(ticket.ProjectID ?? ticket.project_id ?? ''));
  };

  // Submit Edit updates
  const handleUpdateTicket = async () => {
    if (!editTitle.trim()) {
      showAlert({
        title: 'Validation Error',
        message: 'Task title is required.',
        type: 'error',
      });
      return;
    }

    const tId = Number(editTicket?.id ?? editTicket?.TicketID ?? editTicket?.ticket_id);
    if (!tId) return;

    try {
      setEditing(true);
      const targetUser = editAssignedTo ? Number(editAssignedTo) : null;
      const targetProjId = editProjId ? Number(editProjId) : null;

      await api.put(`/tickets/${tId}`, {
        Title: editTitle,
        title: editTitle,
        Description: editDesc,
        description: editDesc,
        ProjectID: targetProjId,
        Status: editStatus,
        status: editStatus,
        Priority: editPriority,
        priority: editPriority,
        AssignedToUserID: targetUser,
        assignedToUserId: targetUser,
        AssignedTo: targetUser,
        assigned_to: targetUser,
        UserID: targetUser,
        userId: targetUser,
      });

      await triggerLocalNotification(
        'Ticket Updated',
        `Ticket #${tId} "${editTitle}" has been updated.`,
        { ticketId: tId, screen: '/tickets' }
      );

      setEditTicket(null);
      fetchTickets();
    } catch (err: any) {
      showAlert({
        title: 'Update Error',
        message: err.response?.data?.message || 'Failed to update ticket.',
        type: 'error',
      });
    } finally {
      setEditing(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTitle.trim()) {
      showAlert({
        title: 'Validation Error',
        message: 'Task title is required.',
        type: 'error',
      });
      return;
    }

    try {
      setCreating(true);
      const targetUser = newAssignedTo ? Number(newAssignedTo) : null;
      const targetProjId = newProjId ? Number(newProjId) : null;

      const res = await api.post('/tickets', {
        Title: newTitle,
        Description: newDesc,
        ProjectID: targetProjId,
        Status: newStatus,
        Priority: newPriority,
        AssignedToUserID: targetUser,
        assignedToUserId: targetUser,
        AssignedTo: targetUser,
        assigned_to: targetUser,
        assignedTo: targetUser,
        UserID: targetUser,
        userId: targetUser,
      });

      const createdId = res.data?.id || res.data?.ticket_id || '';

      await triggerLocalNotification(
        'New Ticket Created',
        `"${newTitle}" added to workflow board.`,
        { ticketId: createdId, screen: '/tickets' }
      );

      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewProjId(selectedProjectId || '');
      setNewStatus('todo');
      setNewPriority('medium');
      setNewAssignedTo('');
      fetchTickets();
    } catch (err: any) {
      showAlert({
        title: 'Create Error',
        message: err.response?.data?.message || 'Failed to create ticket.',
        type: 'error',
      });
    } finally {
      setCreating(false);
    }
  };

  const getPriorityStyle = (priority?: string) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high') return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
    if (p === 'medium') return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
    return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
  };

  const formatAttachmentUrl = (rawUrl?: string) => {
    if (!rawUrl) return '';
    let cleaned = String(rawUrl).trim().replace(/^['"]|['"]$/g, '');
    if (cleaned === '[object Object]' || cleaned.includes('[object')) return '';
    cleaned = cleaned.replace('//localhost:9000', '//192.168.0.70:9000');
  cleaned = cleaned.replace('//minio:9000', '//192.168.0.70:9000');
  cleaned = cleaned.replace('//127.0.0.1:9000', '//192.168.0.70:9000');

  // Bucket path fix
  cleaned = cleaned.replace('/task-attachments/tickets/', '/task-attachments/');

  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `http://${cleaned}`;
    }
    return cleaned;
  };

  // Base tickets filtered by Project ID
  const projectFilteredTickets = selectedProjectId
    ? tickets.filter((t) => {
        const p = t.ProjectID ?? t.project_id;
        return String(p) === String(selectedProjectId);
      })
    : tickets;

  // Final filter matching stage and user tabs + Sequential sorting
  const displayedTickets = projectFilteredTickets
    .filter((t) => {
      const s = normalizeStatus(t.status || t.Status);
      const matchesTab = activeTab === 'all' || s === activeTab;
      const assignedId = getAssignedUserId(t);
      const matchesUser = selectedUserFilter ? String(assignedId) === String(selectedUserFilter) : true;
      return matchesTab && matchesUser;
    })
    .sort((a, b) => {
      const idA = Number(a.id ?? a.TicketID ?? a.ticket_id ?? 0);
      const idB = Number(b.id ?? b.TicketID ?? b.ticket_id ?? 0);
      return idA - idB;
    });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header Navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#34d399" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <View style={styles.badgePill}>
            <View style={styles.statusDot} />
            <Text style={styles.badgeText}>WORKFLOW EXECUTION</Text>
          </View>
          <Text style={styles.heading} numberOfLines={1}>
            {selectedProjectId ? `${projectNameParam || `Project #${selectedProjectId}`} Board` : 'Task Board'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.newTicketBtn} onPress={() => setShowCreateModal(true)} activeOpacity={0.8}>
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text style={styles.newTicketBtnText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Project Filter Notification Banner */}
      {selectedProjectId ? (
        <View style={styles.filterBanner}>
          <View style={styles.filterBannerLeft}>
            <Ionicons name="filter" size={13} color="#34d399" />
            <Text style={styles.filterBannerText} numberOfLines={1}>
              Filtered: {projectNameParam || `Project #${selectedProjectId}`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.clearFilterBtn}
            onPress={() => setSelectedProjectId('')}
          >
            <Text style={styles.clearFilterText}>Show All</Text>
            <Ionicons name="close-circle" size={14} color="#f87171" />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Stage Tab Filters */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {STATUS_COLUMNS.map((col) => {
            const isSelected = activeTab === col.key;
            const count =
              col.key === 'all'
                ? projectFilteredTickets.length
                : projectFilteredTickets.filter((t) => normalizeStatus(t.status || t.Status) === col.key).length;

            return (
              <TouchableOpacity
                key={col.key}
                style={[styles.tabChip, isSelected && styles.tabChipActive]}
                onPress={() => setActiveTab(col.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabChipText, isSelected && styles.tabChipTextActive]}>{col.label}</Text>
                <View style={[styles.chipBadge, isSelected && styles.chipBadgeActive]}>
                  <Text style={[styles.chipBadgeText, isSelected && styles.chipBadgeTextActive]}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Ticket Cards List */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Syncing tickets...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
        >
          {displayedTickets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="file-tray-outline" size={44} color="#475569" />
              <Text style={styles.emptyText}>
                {selectedProjectId
                  ? 'No tickets found for this project in this stage'
                  : 'No tasks present in this stage'}
              </Text>
            </View>
          ) : (
            displayedTickets.map((ticket, idx) => {
              const ticketId = Number(ticket.id ?? ticket.TicketID ?? ticket.ticket_id);
              const displaySequence = idx + 1; // Continuous visual counting: 1, 2, 3, 4, 5...
              const title = ticket.title ?? ticket.Title ?? 'Untitled Ticket';
              const desc = ticket.description ?? ticket.Description ?? '';
              const priority = (ticket.priority || ticket.Priority || 'medium').toLowerCase();
              const pStyle = getPriorityStyle(priority);
              const currentStatus = normalizeStatus(ticket.status || ticket.Status);
              const assignedUserId = getAssignedUserId(ticket);
              const projId = ticket.ProjectID ?? ticket.project_id;
              const attachment = ticket.Attachment || ticket.AttachmentURL || ticket.attachment_url || ticket.image_url;

              return (
                <View key={ticketId} style={styles.ticketCard}>
                  {/* Card Header Information */}
                  <View style={styles.cardHeader}>
                    <View style={styles.idGroup}>
                      <Text style={styles.idText}>#{displaySequence}</Text>
                      <View style={[styles.priorityPill, { backgroundColor: pStyle.bg, borderColor: pStyle.border }]}>
                        <Text style={[styles.priorityText, { color: pStyle.text }]}>{priority.toUpperCase()}</Text>
                      </View>
                    </View>

                    {/* Card Actions: View, Edit, Delete */}
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        style={styles.iconAction}
                        onPress={() => setViewTicket(ticket)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="eye-outline" size={17} color="#38bdf8" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.iconAction}
                        onPress={() => handleOpenEdit(ticket)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="create-outline" size={17} color="#fbbf24" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.iconAction}
                        onPress={() => handleDeleteTicket(ticketId)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={17} color="#f87171" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Stage Dropdown Selector Button */}
                  <TouchableOpacity
                    style={styles.stageButton}
                    onPress={() => setStatusModalTicket(ticket)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.stageButtonLabel}>STAGE:</Text>
                    <Text style={styles.stageButtonValue}>
                      {STATUS_COLUMNS.find((s) => s.key === currentStatus)?.label || currentStatus.toUpperCase()}
                    </Text>
                    <Ionicons name="chevron-down" size={13} color="#94a3b8" />
                  </TouchableOpacity>

                  {/* Title and Description */}
                  <Text style={styles.ticketTitle}>{title}</Text>
                  {desc ? <Text style={styles.ticketDesc} numberOfLines={2}>{desc}</Text> : null}

                  {/* Card Metadata Footer */}
                  <View style={styles.cardFooter}>
                    <View style={styles.metaRow}>
                      <Ionicons name="person-outline" size={12} color="#60a5fa" />
                      <Text style={styles.metaText} numberOfLines={1}>{getUserName(assignedUserId)}</Text>
                    </View>

                    {projId ? (
                      <View style={styles.projPill}>
                        <Ionicons name="folder-outline" size={11} color="#34d399" />
                        <Text style={styles.projPillText}>Project #{projId}</Text>
                      </View>
                    ) : null}

                    {attachment ? (
                      <View style={styles.attachPill}>
                        <Ionicons name="attach" size={12} color="#f59e0b" />
                        <Text style={styles.attachPillText}>Asset</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* STAGE SELECTION MODAL */}
      <Modal visible={!!statusModalTicket} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialog}>
            <Text style={styles.modalDialogTitle}>Update Stage</Text>
            <Text style={styles.modalDialogSub}>
              Move Ticket #{statusModalTicket?.id ?? statusModalTicket?.TicketID} to:
            </Text>

            {STATUS_COLUMNS.filter((s) => s.key !== 'all').map((st) => {
              const current = normalizeStatus(statusModalTicket?.status || statusModalTicket?.Status);
              const isMatch = current === st.key;
              const tId = Number(statusModalTicket?.id ?? statusModalTicket?.TicketID ?? statusModalTicket?.ticket_id);

              return (
                <TouchableOpacity
                  key={st.key}
                  style={[styles.statusOptionRow, isMatch && styles.statusOptionRowActive]}
                  onPress={() => handleStatusChange(tId, st.key)}
                >
                  <Text style={[styles.statusOptionText, isMatch && { color: '#10b981' }]}>{st.label}</Text>
                  {isMatch && <Ionicons name="checkmark-circle" size={18} color="#10b981" />}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setStatusModalTicket(null)}>
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EDIT TICKET MODAL */}
      <Modal visible={!!editTicket} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.createDialog}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>
                Edit Ticket #{editTicket?.id ?? editTicket?.TicketID}
              </Text>
              <TouchableOpacity onPress={() => setEditTicket(null)}>
                <Ionicons name="close" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
              <View>
                <Text style={styles.inputLabel}>Task Title *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Task title..."
                  placeholderTextColor="#64748b"
                  value={editTitle}
                  onChangeText={setEditTitle}
                />
              </View>

              {/* Priority Selector */}
              <View>
                <Text style={styles.inputLabel}>Priority Level</Text>
                <View style={styles.pickerRow}>
                  {PRIORITY_OPTIONS.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.pickerChip, editPriority === p && styles.pickerChipActive]}
                      onPress={() => setEditPriority(p)}
                    >
                      <Text style={[styles.pickerChipText, editPriority === p && styles.pickerChipTextActive]}>
                        {p.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Stage Selector */}
              <View>
                <Text style={styles.inputLabel}>Workflow Stage</Text>
                <View style={styles.pickerRow}>
                  {STATUS_COLUMNS.filter((s) => s.key !== 'all').map((st) => (
                    <TouchableOpacity
                      key={st.key}
                      style={[styles.pickerChip, editStatus === st.key && styles.pickerChipActive]}
                      onPress={() => setEditStatus(st.key)}
                    >
                      <Text style={[styles.pickerChipText, editStatus === st.key && styles.pickerChipTextActive]}>
                        {st.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Project Assignment */}
              <View>
                <Text style={styles.inputLabel}>Project</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  <TouchableOpacity
                    style={[styles.projSelectChip, !editProjId && styles.projSelectChipActive]}
                    onPress={() => setEditProjId('')}
                  >
                    <Text style={[styles.projSelectChipText, !editProjId && styles.projSelectChipTextActive]}>None</Text>
                  </TouchableOpacity>
                  {projects.map((p) => {
                    const pId = String(p.ProjectID ?? p.id);
                    const isSel = editProjId === pId;
                    return (
                      <TouchableOpacity
                        key={pId}
                        style={[styles.projSelectChip, isSel && styles.projSelectChipActive]}
                        onPress={() => setEditProjId(pId)}
                      >
                        <Text style={[styles.projSelectChipText, isSel && styles.projSelectChipTextActive]}>
                          #{pId} {p.Name ?? p.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Assignee Assignment */}
              <View>
                <Text style={styles.inputLabel}>Assign to Team Member</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  <TouchableOpacity
                    style={[styles.projSelectChip, !editAssignedTo && styles.projSelectChipActive]}
                    onPress={() => setEditAssignedTo('')}
                  >
                    <Text style={[styles.projSelectChipText, !editAssignedTo && styles.projSelectChipTextActive]}>Unassigned</Text>
                  </TouchableOpacity>
                  {usersList.map((u) => {
                    const uId = String(u.id ?? u.UserID ?? u.user_id);
                    const isSel = editAssignedTo === uId;
                    return (
                      <TouchableOpacity
                        key={uId}
                        style={[styles.projSelectChip, isSel && styles.projSelectChipActive]}
                        onPress={() => setEditAssignedTo(uId)}
                      >
                        <Text style={[styles.projSelectChipText, isSel && styles.projSelectChipTextActive]}>
                          {u.Name ?? u.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  placeholder="Task acceptance criteria and details..."
                  placeholderTextColor="#64748b"
                  value={editDesc}
                  onChangeText={setEditDesc}
                />
              </View>
            </ScrollView>

            <View style={styles.createActions}>
              <TouchableOpacity style={styles.createCancelBtn} onPress={() => setEditTicket(null)}>
                <Text style={styles.createCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createSubmitBtn, editing && { opacity: 0.6 }]}
                disabled={editing}
                onPress={handleUpdateTicket}
              >
                {editing ? (
                  <ActivityIndicator size="small" color="#022c22" />
                ) : (
                  <Text style={styles.createSubmitText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* VIEW TICKET MODAL */}
      <Modal visible={!!viewTicket} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.viewDialog}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>Ticket #{viewTicket?.id ?? viewTicket?.TicketID}</Text>
              <TouchableOpacity onPress={() => setViewTicket(null)}>
                <Ionicons name="close" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.viewTitle}>{viewTicket?.title ?? viewTicket?.Title}</Text>

              <View style={styles.viewBadgeRow}>
                <View style={styles.viewInfoPill}>
                  <Text style={styles.viewPillLabel}>Stage:</Text>
                  <Text style={styles.viewPillVal}>
                    {STATUS_COLUMNS.find((s) => s.key === normalizeStatus(viewTicket?.status || viewTicket?.Status))?.label}
                  </Text>
                </View>
                <View style={styles.viewInfoPill}>
                  <Text style={styles.viewPillLabel}>Priority:</Text>
                  <Text style={[styles.viewPillVal, { color: '#fbbf24' }]}>
                    {(viewTicket?.priority || viewTicket?.Priority || 'medium').toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionLabel}>ASSIGNMENT & CONTEXT</Text>
              <View style={styles.contextBox}>
                <Text style={styles.contextItem}>
                  Assigned User: <Text style={{ color: '#ffffff', fontWeight: '700' }}>{getUserName(getAssignedUserId(viewTicket || {}))}</Text>
                </Text>
                <Text style={styles.contextItem}>
                  Sprint Project: <Text style={{ color: '#ffffff', fontWeight: '700' }}>{getProjectName(viewTicket?.ProjectID ?? viewTicket?.project_id)}</Text>
                </Text>
              </View>

              <Text style={styles.sectionLabel}>DESCRIPTION</Text>
              <View style={styles.descBox}>
                <Text style={styles.descBoxText}>
                  {viewTicket?.description || viewTicket?.Description || 'No description provided.'}
                </Text>
              </View>

              {viewTicket && (viewTicket.Attachment || viewTicket.AttachmentURL || viewTicket.attachment_url || viewTicket.image_url) ? (
                <>
                  <Text style={styles.sectionLabel}>ATTACHED ASSET</Text>
                  <View style={styles.imagePreviewWrap}>
                    <Image
                      source={{ uri: formatAttachmentUrl(viewTicket.Attachment || viewTicket.AttachmentURL || viewTicket.attachment_url || viewTicket.image_url) }}
                      style={styles.attachedImage}
                      resizeMode="contain"
                    />
                  </View>
                </>
              ) : null}
            </ScrollView>

            <TouchableOpacity style={styles.fullCloseBtn} onPress={() => setViewTicket(null)}>
              <Text style={styles.fullCloseBtnText}>Close Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CREATE TICKET MODAL */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.createDialog}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>Create New Ticket</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
              <View>
                <Text style={styles.inputLabel}>Task Title *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Implement refresh token rotation"
                  placeholderTextColor="#64748b"
                  value={newTitle}
                  onChangeText={setNewTitle}
                />
              </View>

              {/* Priority Picker */}
              <View>
                <Text style={styles.inputLabel}>Priority Level</Text>
                <View style={styles.pickerRow}>
                  {PRIORITY_OPTIONS.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.pickerChip, newPriority === p && styles.pickerChipActive]}
                      onPress={() => setNewPriority(p)}
                    >
                      <Text style={[styles.pickerChipText, newPriority === p && styles.pickerChipTextActive]}>
                        {p.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Status Picker */}
              <View>
                <Text style={styles.inputLabel}>Initial Stage</Text>
                <View style={styles.pickerRow}>
                  {STATUS_COLUMNS.filter((s) => s.key !== 'all').map((st) => (
                    <TouchableOpacity
                      key={st.key}
                      style={[styles.pickerChip, newStatus === st.key && styles.pickerChipActive]}
                      onPress={() => setNewStatus(st.key)}
                    >
                      <Text style={[styles.pickerChipText, newStatus === st.key && styles.pickerChipTextActive]}>
                        {st.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Project Select */}
              <View>
                <Text style={styles.inputLabel}>Project</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  <TouchableOpacity
                    style={[styles.projSelectChip, !newProjId && styles.projSelectChipActive]}
                    onPress={() => setNewProjId('')}
                  >
                    <Text style={[styles.projSelectChipText, !newProjId && styles.projSelectChipTextActive]}>None</Text>
                  </TouchableOpacity>
                  {projects.map((p) => {
                    const pId = String(p.ProjectID ?? p.id);
                    const isSel = newProjId === pId;
                    return (
                      <TouchableOpacity
                        key={pId}
                        style={[styles.projSelectChip, isSel && styles.projSelectChipActive]}
                        onPress={() => setNewProjId(pId)}
                      >
                        <Text style={[styles.projSelectChipText, isSel && styles.projSelectChipTextActive]}>
                          #{pId} {p.Name ?? p.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Assignee Select */}
              <View>
                <Text style={styles.inputLabel}>Assign to Team Member</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  <TouchableOpacity
                    style={[styles.projSelectChip, !newAssignedTo && styles.projSelectChipActive]}
                    onPress={() => setNewAssignedTo('')}
                  >
                    <Text style={[styles.projSelectChipText, !newAssignedTo && styles.projSelectChipTextActive]}>Unassigned</Text>
                  </TouchableOpacity>
                  {usersList.map((u) => {
                    const uId = String(u.id ?? u.UserID ?? u.user_id);
                    const isSel = newAssignedTo === uId;
                    return (
                      <TouchableOpacity
                        key={uId}
                        style={[styles.projSelectChip, isSel && styles.projSelectChipActive]}
                        onPress={() => setNewAssignedTo(uId)}
                      >
                        <Text style={[styles.projSelectChipText, isSel && styles.projSelectChipTextActive]}>
                          {u.Name ?? u.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  placeholder="Task acceptance criteria and details..."
                  placeholderTextColor="#64748b"
                  value={newDesc}
                  onChangeText={setNewDesc}
                />
              </View>
            </ScrollView>

            <View style={styles.createActions}>
              <TouchableOpacity style={styles.createCancelBtn} onPress={() => setShowCreateModal(false)}>
                <Text style={styles.createCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createSubmitBtn, creating && { opacity: 0.6 }]}
                disabled={creating}
                onPress={handleCreateTicket}
              >
                {creating ? <ActivityIndicator size="small" color="#022c22" /> : <Text style={styles.createSubmitText}>Create Ticket</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070b12',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
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
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  badgeText: {
    color: '#34d399',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  heading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterBanner: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  filterBannerText: {
    color: '#34d399',
    fontSize: 11.5,
    fontWeight: '700',
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 8,
  },
  clearFilterText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '700',
  },
  newTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#10b981',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  newTicketBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  tabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingVertical: 10,
  },
  tabsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#0f172a',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  tabChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  tabChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  tabChipTextActive: {
    color: '#022c22',
  },
  chipBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  chipBadgeActive: {
    backgroundColor: '#022c22',
  },
  chipBadgeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
  },
  chipBadgeTextActive: {
    color: '#10b981',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollArea: {
    padding: 18,
    paddingBottom: 100,
    gap: 12,
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  ticketCard: {
    backgroundColor: '#0b1120',
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  idGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748b',
  },
  priorityPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 5,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconAction: {
    padding: 4,
  },
  stageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0f172a',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  stageButtonLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '800',
  },
  stageButtonValue: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
  },
  ticketTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  ticketDesc: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  metaText: {
    color: '#93c5fd',
    fontSize: 11.5,
    fontWeight: '600',
  },
  projPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  projPillText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '700',
  },
  attachPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  attachPillText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalDialog: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalDialogTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  modalDialogSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 14,
  },
  statusOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#0b1120',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  statusOptionRowActive: {
    borderColor: '#10b981',
  },
  statusOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  modalCancelBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '700',
  },
  viewDialog: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 10,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  viewTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 10,
  },
  viewBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  viewInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0b1120',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  viewPillLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  viewPillVal: {
    color: '#34d399',
    fontSize: 11.5,
    fontWeight: '800',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 10,
  },
  contextBox: {
    backgroundColor: '#0b1120',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 6,
  },
  contextItem: {
    fontSize: 12,
    color: '#94a3b8',
  },
  descBox: {
    backgroundColor: '#0b1120',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  descBoxText: {
    color: '#cbd5e1',
    fontSize: 12.5,
    lineHeight: 18,
  },
  imagePreviewWrap: {
    backgroundColor: '#0b1120',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    height: 180,
  },
  attachedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  fullCloseBtn: {
    marginTop: 14,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  fullCloseBtnText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  createDialog: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#0b1120',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pickerChip: {
    backgroundColor: '#0b1120',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  pickerChipActive: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  pickerChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
  },
  pickerChipTextActive: {
    color: '#10b981',
  },
  projSelectChip: {
    backgroundColor: '#0b1120',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  projSelectChipActive: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  projSelectChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  projSelectChipTextActive: {
    color: '#38bdf8',
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 12,
  },
  createCancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  createCancelText: {
    color: '#94a3b8',
    fontSize: 12.5,
    fontWeight: '700',
  },
  createSubmitBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
  },
  createSubmitText: {
    color: '#022c22',
    fontSize: 12.5,
    fontWeight: '800',
  },
});