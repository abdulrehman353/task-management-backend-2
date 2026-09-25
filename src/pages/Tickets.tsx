import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
  Plus, 
  Paperclip, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  CircleDashed, 
  Ban, 
  TestTube2,
  Image as ImageIcon,
  Edit2,
  Trash2,
  FolderKanban,
  ArrowLeft,
  X,
  ExternalLink,
  Sparkles,
  User as UserIcon,
  Eye,
  Filter,
  Layers
} from 'lucide-react';

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
  Email?: string;
  role?: string;
  Role?: any;
  RoleName?: string;
  role_name?: string;
  role_id?: number;
  RoleID?: number;
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
  { key: 'todo', label: 'Ready To Do', icon: CircleDashed, color: '#94a3b8', badgeBg: 'rgba(148, 163, 184, 0.15)' },
  { key: 'in_progress', label: 'In Progress', icon: Clock, color: '#38bdf8', badgeBg: 'rgba(56, 189, 248, 0.15)' },
  { key: 'blocked', label: 'Blocked', icon: Ban, color: '#f87171', badgeBg: 'rgba(248, 113, 113, 0.15)' },
  { key: 'testing', label: 'Testing', icon: TestTube2, color: '#fbbf24', badgeBg: 'rgba(251, 191, 36, 0.15)' },
  { key: 'done', label: 'Done', icon: CheckCircle2, color: '#34d399', badgeBg: 'rgba(52, 211, 153, 0.15)' },
];

const PRIORITY_OPTIONS = [
  { key: 'low', label: 'LOW' },
  { key: 'medium', label: 'MEDIUM' },
  { key: 'high', label: 'HIGH' }
];

export default function Tickets() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const projectIdParam = searchParams.get('projectId');
  const projectNameParam = searchParams.get('projectName');

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // User Filter State
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Form States (Create)
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProjId, setNewProjId] = useState(projectIdParam || '');
  const [newStatus, setNewStatus] = useState('todo');
  const [newPriority, setNewPriority] = useState('medium');
  const [newAssignedTo, setNewAssignedTo] = useState('');
  const [newAttachmentFile, setNewAttachmentFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  // Form States (Edit)
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editProjId, setEditProjId] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch Tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/tickets');
      const data = Array.isArray(res.data) ? res.data : res.data.tickets || [];
      setTickets(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Projects & Users
  const fetchProjectsAndUsers = async () => {
    try {
      const [projRes, usersRes] = await Promise.allSettled([
        axiosClient.get('/projects'),
        axiosClient.get('/users'),
      ]);

      if (projRes.status === 'fulfilled') {
        const pData = Array.isArray(projRes.value.data) ? projRes.value.data : projRes.value.data.projects || [];
        setProjects(pData);
      }
      if (usersRes.status === 'fulfilled') {
        const uData = Array.isArray(usersRes.value.data) ? usersRes.value.data : usersRes.value.data.users || [];
        setUsersList(uData);
      }
    } catch {
      // background fetch fail silently
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchProjectsAndUsers();
    if (projectIdParam) {
      setNewProjId(projectIdParam);
    }
  }, [projectIdParam]);

  // Check whether a user has a role assigned
  const userHasValidRole = (user: UserItem): boolean => {
    const rawRole = (user.role || user.Role || user.RoleName || (user as any).role_name || '')
      .toString()
      .trim()
      .toLowerCase();

    if (rawRole && rawRole !== 'pending' && rawRole !== 'no role' && rawRole !== 'pending / no role') {
      return true;
    }

    const rId = user.role_id || user.RoleID || (user as any).Role?.id || (user as any).Role?.RoleID;
    return Boolean(rId && Number(rId) > 0);
  };

  // Only users who have an active role assigned
  const eligibleUsers = usersList.filter((u) => userHasValidRole(u));

  // If eligible list is empty (because backend didn't include role join), fallback to usersList
  const usersToDisplay = eligibleUsers.length > 0 ? eligibleUsers : usersList;

  const handleStatusChange = async (ticketId: number, nextStatus: string) => {
    try {
      setTickets((prev) =>
        prev.map((t) => {
          const id = t.id ?? t.TicketID ?? t.ticket_id;
          return Number(id) === Number(ticketId) ? { ...t, status: nextStatus, Status: nextStatus } : t;
        })
      );

      await axiosClient.put(`/tickets/${ticketId}`, { 
        Status: nextStatus,
        status: nextStatus 
      });
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
      fetchTickets();
    }
  };

  const handleDirectUserAssign = async (ticketId: number, targetUserId: string) => {
    if (targetUserId && eligibleUsers.length > 0) {
      const targetUserObj = usersList.find((u) => String(u.id ?? u.UserID ?? u.user_id) === String(targetUserId));
      if (targetUserObj && !userHasValidRole(targetUserObj)) {
        alert(`Action Blocked: "${targetUserObj.Name ?? targetUserObj.name}" ke paas koi role nahi hai! Pehle Users page se isay role assign karein.`);
        return;
      }
    }

    const uIdVal = targetUserId ? Number(targetUserId) : null;

    setTickets((prev) =>
      prev.map((t) => {
        const id = t.id ?? t.TicketID ?? t.ticket_id;
        if (Number(id) === Number(ticketId)) {
          return {
            ...t,
            AssignedToUserID: uIdVal,
            assignedToUserId: uIdVal,
            AssignedTo: uIdVal,
            assigned_to: uIdVal,
            assignedTo: uIdVal,
            UserID: uIdVal,
            userId: uIdVal,
          };
        }
        return t;
      })
    );

    const payload = {
      AssignedToUserID: uIdVal,
      assignedToUserId: uIdVal,
      AssignedTo: uIdVal,
      assigned_to: uIdVal,
      assignedTo: uIdVal,
      UserID: uIdVal,
      userId: uIdVal,
      user_id: uIdVal,
    };

    try {
      await axiosClient.put(`/tickets/${ticketId}`, payload);
      fetchTickets();
    } catch {
      try {
        await axiosClient.post(`/tickets/${ticketId}/assign`, payload);
        fetchTickets();
      } catch (finalErr: any) {
        alert(finalErr.response?.data?.message || 'Failed to assign user on backend');
        fetchTickets();
      }
    }
  };

  const handleFileUpload = async (ticketId: number, file: File) => {
    const formData = new FormData();
    formData.append('Attachment', file);

    try {
      await axiosClient.post(`/tickets/${ticketId}/attach-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('File attached successfully!');
      fetchTickets();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to upload attachment';
      alert(errorMsg);
    }
  };

  const handleRemoveAttachment = async (ticketId: number) => {
    if (!window.confirm('Are you sure you want to remove this attachment?')) return;
    try {
      await axiosClient.put(`/tickets/${ticketId}`, { Attachment: null });
      alert('Attachment removed successfully!');
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove attachment');
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const targetProjId = newProjId || projectIdParam;
      const targetUser = newAssignedTo ? Number(newAssignedTo) : null;

      const res = await axiosClient.post('/tickets', {
        Title: newTitle,
        Description: newDesc,
        ProjectID: targetProjId ? Number(targetProjId) : null,
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

      const createdTicketId = res.data?.id || res.data?.ticket?.id || res.data?.TicketID || res.data?.ticket?.TicketID;
      if (createdTicketId && newAttachmentFile) {
        try {
          const formData = new FormData();
          formData.append('Attachment', newAttachmentFile);
          await axiosClient.post(`/tickets/${createdTicketId}/attach-image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch {
          // ignore attachment failure
        }
      }

      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewProjId(projectIdParam || '');
      setNewStatus('todo');
      setNewPriority('medium');
      setNewAssignedTo('');
      setNewAttachmentFile(null);
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setEditTitle(ticket.title || ticket.Title || '');
    setEditDesc(ticket.description || ticket.Description || '');
    setEditProjId(String(ticket.ProjectID || ticket.project_id || ''));
    setEditPriority((ticket.priority || ticket.Priority || 'medium').toLowerCase());
    
    const assignedId = 
      ticket.AssignedToUserID ??
      ticket.assignedToUserId ??
      ticket.AssignedTo ?? 
      ticket.assigned_to ?? 
      ticket.assignedTo ?? 
      ticket.UserID ?? 
      ticket.userId;

    setEditAssignedTo(assignedId ? String(assignedId) : '');
    setShowEditModal(true);
  };

  const handleOpenView = (ticket: Ticket) => {
    setViewingTicket(ticket);
    setShowViewModal(true);
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;
    const ticketId = editingTicket.id ?? editingTicket.TicketID ?? editingTicket.ticket_id;
    if (!ticketId) return;

    try {
      setUpdating(true);
      const targetUser = editAssignedTo ? Number(editAssignedTo) : null;

      await axiosClient.put(`/tickets/${ticketId}`, {
        Title: editTitle,
        Description: editDesc,
        Priority: editPriority,
        ProjectID: editProjId ? Number(editProjId) : null,
        AssignedToUserID: targetUser,
        assignedToUserId: targetUser,
        AssignedTo: targetUser,
        assigned_to: targetUser,
        assignedTo: targetUser,
        UserID: targetUser,
        userId: targetUser,
      });

      setShowEditModal(false);
      setEditingTicket(null);
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (!window.confirm(`Are you sure you want to delete ticket #${ticketId}?`)) return;
    try {
      await axiosClient.delete(`/tickets/${ticketId}`);
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete ticket');
    }
  };

  const getPriorityStyle = (priority?: string) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high') return { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
    if (p === 'medium') return { backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' };
    return { backgroundColor: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.25)' };
  };

  const formatAttachmentUrl = (rawUrl?: string) => {
    if (!rawUrl) return '';
    let cleaned = String(rawUrl).trim().replace(/^['"]|['"]$/g, '');

    if (cleaned === '[object Object]' || cleaned.includes('[object')) {
      return '';
    }

    cleaned = cleaned.replace('//minio:9000', '//localhost:9000');
    cleaned = cleaned.replace('/task-attachments/tickets/', '/task-attachments/');

    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = `http://${cleaned}`;
    }
    return cleaned;
  };

  const getAssignedUserId = (ticket: Ticket): string => {
    const assignedId = 
      ticket.AssignedToUserID ??
      ticket.assignedToUserId ??
      ticket.AssignedTo ?? 
      ticket.assigned_to ?? 
      ticket.assignedTo ?? 
      ticket.UserID ?? 
      ticket.userId;

    return assignedId ? String(assignedId) : '';
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

  const displayedTickets = tickets.filter((t) => {
    const matchesProject = projectIdParam ? Number(t.ProjectID ?? t.project_id) === Number(projectIdParam) : true;
    const assignedId = getAssignedUserId(t);
    const matchesUser = selectedUserFilter ? String(assignedId) === String(selectedUserFilter) : true;
    return matchesProject && matchesUser;
  });

  return (
    <div style={styles.pageContainer}>
      <style>{`
        .ticket-glass-card {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
          transition: all 0.22s ease;
        }
        .ticket-glass-card:hover {
          transform: translateY(-2px);
          border-color: rgba(16, 185, 129, 0.45);
          box-shadow: 0 10px 22px -4px rgba(16, 185, 129, 0.2);
        }
        .status-select-input:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
        }
        .user-direct-select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }
        .emerald-btn-glow:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px -4px rgba(16, 185, 129, 0.5) !important;
        }
        .card-btn-action:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          transform: scale(1.08);
        }
        .ticket-input-focus:focus {
          background: rgba(2, 6, 23, 0.85) !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
        }
      `}</style>

      {/* Breadcrumb Header */}
      {projectNameParam && (
        <div style={styles.breadcrumbBar}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            <ArrowLeft size={15} />
            <span>Back to Projects</span>
          </button>
          <span style={{ color: '#64748b' }}>/</span>
          <span style={{ color: '#ffffff', fontWeight: 700 }}>{projectNameParam}</span>
          <span style={styles.filteredBadge}>Sprint Board</span>
        </div>
      )}

      {/* Top Header */}
      <div style={styles.topBar}>
        <div>
          <div style={styles.pillBadge}>
            <Sparkles size={11} color="#34d399" />
            <span>WORKFLOW EXECUTION</span>
          </div>
          <h2 style={styles.pageTitle}>
            {projectNameParam ? `${projectNameParam} Board` : 'Task Board'}
          </h2>
          <p style={styles.pageSubtitle}>
            Live lifecycle management, user assignment, and MinIO attachment previews.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={styles.userFilterBox}>
            <Filter size={14} color="#38bdf8" />
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              style={styles.userFilterSelect}
            >
              <option value="">All Users Tickets</option>
              {usersToDisplay.map((u) => {
                const uId = u.id ?? u.UserID ?? u.user_id;
                return (
                  <option key={uId} value={uId} style={styles.selectOption}>
                    {u.Name ?? u.name} (#{uId})
                  </option>
                );
              })}
            </select>
            {selectedUserFilter && (
              <button 
                onClick={() => setSelectedUserFilter('')} 
                style={styles.clearFilterBtn}
                title="Clear user filter"
              >
                <X size={12} color="#f87171" />
              </button>
            )}
          </div>

          <button onClick={() => setShowCreateModal(true)} className="emerald-btn-glow" style={styles.primaryBtn}>
            <Plus size={18} strokeWidth={2.4} />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Kanban Board Columns */}
      {loading ? (
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Syncing tickets...</p>
        </div>
      ) : (
        <div style={styles.boardContainer}>
          {STATUS_COLUMNS.map((col) => {
            const colTickets = displayedTickets.filter((t) => {
              let currentStatus = (t.status || t.Status || 'todo').toLowerCase();
              if (currentStatus === 'ready to do' || currentStatus === 'to do') currentStatus = 'todo';
              if (currentStatus === 'in progress') currentStatus = 'in_progress';
              return currentStatus === col.key;
            });

            const IconComponent = col.icon;

            return (
              <div key={col.key} style={styles.column}>
                <div style={{ ...styles.columnHeader, borderTop: `3px solid ${col.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ ...styles.colIconBox, backgroundColor: col.badgeBg }}>
                      <IconComponent size={14} color={col.color} strokeWidth={2.4} />
                    </div>
                    <span style={styles.columnTitle}>{col.label}</span>
                  </div>
                  <span style={styles.countBadge}>{colTickets.length}</span>
                </div>

                <div style={styles.ticketList}>
                  {colTickets.length === 0 ? (
                    <div style={styles.emptyColText}>No tasks present</div>
                  ) : (
                    colTickets.map((ticket, idx) => {
                      const ticketId = Number(ticket.id ?? ticket.TicketID ?? ticket.ticket_id ?? (idx + 1));
                      const title = ticket.title ?? ticket.Title ?? 'Untitled Ticket';
                      const desc = ticket.description ?? ticket.Description ?? '';
                      let currentStatus = (ticket.status || ticket.Status || 'todo').toLowerCase();
                      if (currentStatus === 'ready to do' || currentStatus === 'to do') currentStatus = 'todo';
                      if (currentStatus === 'in progress') currentStatus = 'in_progress';

                      const priority = (ticket.priority || ticket.Priority || 'medium').toLowerCase();
                      const attachment = ticket.Attachment || ticket.AttachmentURL || ticket.attachment_url || ticket.image_url;
                      const projId = ticket.ProjectID ?? ticket.project_id;
                      const assignedUserId = getAssignedUserId(ticket);

                      return (
                        <div key={ticketId} className="ticket-glass-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={styles.ticketId}>#{ticketId}</span>
                              <span style={{ ...styles.priorityBadge, ...getPriorityStyle(priority) }}>
                                {priority.toUpperCase()}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button 
                                onClick={() => handleOpenView(ticket)} 
                                className="card-btn-action"
                                style={styles.iconBtn} 
                                title="View Ticket Details"
                              >
                                <Eye size={13} color="#38bdf8" />
                              </button>

                              <button 
                                onClick={() => handleOpenEdit(ticket)} 
                                className="card-btn-action"
                                style={styles.iconBtn} 
                                title="Edit Ticket"
                              >
                                <Edit2 size={13} color="#94a3b8" />
                              </button>

                              <button 
                                onClick={() => handleDeleteTicket(ticketId)} 
                                className="card-btn-action"
                                style={styles.iconBtn} 
                                title="Delete Ticket"
                              >
                                <Trash2 size={13} color="#f87171" />
                              </button>
                            </div>
                          </div>

                          {/* Status Dropdown */}
                          <div style={{ marginTop: '10px' }}>
                            <label style={styles.miniLabel}>Stage</label>
                            <select
                              value={currentStatus}
                              onChange={(e) => handleStatusChange(ticketId, e.target.value)}
                              className="status-select-input"
                              style={styles.statusSelect}
                            >
                              {STATUS_COLUMNS.map((s) => (
                                <option key={s.key} value={s.key} style={styles.selectOption}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Card Assignee Dropdown */}
                          <div style={{ marginTop: '8px' }}>
                            <label style={styles.miniLabel}>Assignee</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <UserIcon size={13} color="#60a5fa" style={{ flexShrink: 0 }} />
                              <select
                                value={assignedUserId}
                                onChange={(e) => handleDirectUserAssign(ticketId, e.target.value)}
                                className="user-direct-select"
                                style={styles.userSelect}
                              >
                                <option value="" style={styles.selectOption}>Unassigned</option>
                                {usersToDisplay.map((u) => {
                                  const uId = u.id ?? u.UserID ?? u.user_id;
                                  return (
                                    <option key={uId} value={uId} style={styles.selectOption}>
                                      {u.Name ?? u.name} (#{uId})
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </div>

                          <h4 style={styles.ticketHeading}>{title}</h4>
                          {desc && <p style={styles.ticketDesc}>{desc}</p>}

                          {projId ? (
                            <div style={{ marginTop: '10px' }}>
                              <div style={styles.projectBadge}>
                                <FolderKanban size={11} color="#34d399" />
                                <span>Project #{projId}</span>
                              </div>
                            </div>
                          ) : null}

                          {attachment && formatAttachmentUrl(attachment) && (
                            <div style={styles.attachmentBadge}>
                              <ImageIcon size={13} color="#34d399" />
                              <button
                                type="button"
                                onClick={() => setPreviewImageUrl(formatAttachmentUrl(attachment))}
                                style={styles.viewAttachmentBtn}
                              >
                                Preview Attachment
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(ticketId)}
                                style={styles.removeAttachmentBtn}
                                title="Remove Attachment"
                              >
                                <X size={12} color="#f87171" />
                              </button>
                            </div>
                          )}

                          <div style={styles.cardActions}>
                            <label style={styles.uploadLabel} title="Attach image or file">
                              <Paperclip size={12} color="#34d399" />
                              <span>Upload File</span>
                              <input
                                type="file"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleFileUpload(ticketId, e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW TICKET DETAILS MODAL */}
      {showViewModal && viewingTicket && (
        <div style={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div style={styles.viewModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={styles.ticketIdBadge}>
                  #{viewingTicket.id ?? viewingTicket.TicketID ?? viewingTicket.ticket_id}
                </span>
                <span style={{ ...styles.priorityBadge, ...getPriorityStyle(viewingTicket.priority || viewingTicket.Priority) }}>
                  {(viewingTicket.priority || viewingTicket.Priority || 'medium').toUpperCase()}
                </span>
              </div>
              <button onClick={() => setShowViewModal(false)} style={styles.closeBtn}>
                <X size={18} color="#94a3b8" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={styles.viewModalTitle}>{viewingTicket.title || viewingTicket.Title}</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <div style={styles.viewDetailPill}>
                    <Layers size={13} color="#94a3b8" />
                    <span>Stage: <strong>{(viewingTicket.status || viewingTicket.Status || 'todo').toUpperCase()}</strong></span>
                  </div>
                  <div style={styles.viewDetailPill}>
                    <UserIcon size={13} color="#60a5fa" />
                    <span>Assigned to: <strong>{getUserName(getAssignedUserId(viewingTicket))}</strong></span>
                  </div>
                  <div style={styles.viewDetailPill}>
                    <FolderKanban size={13} color="#34d399" />
                    <span>Project: <strong>{getProjectName(viewingTicket.ProjectID ?? viewingTicket.project_id)}</strong></span>
                  </div>
                </div>
              </div>

              <div>
                <label style={styles.miniLabel}>Description / Acceptance Criteria</label>
                <div style={styles.viewDescBox}>
                  {viewingTicket.description || viewingTicket.Description || 'No description provided.'}
                </div>
              </div>

              {(viewingTicket.Attachment || viewingTicket.AttachmentURL || viewingTicket.attachment_url || viewingTicket.image_url) ? (
                <div>
                  <label style={styles.miniLabel}>Attached Image (MinIO Object Storage)</label>
                  <div style={styles.viewImageBox}>
                    <img 
                      src={formatAttachmentUrl(viewingTicket.Attachment || viewingTicket.AttachmentURL || viewingTicket.attachment_url || viewingTicket.image_url)}
                      alt="Ticket Attachment"
                      style={styles.viewImageTag}
                    />
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                      <a 
                        href={formatAttachmentUrl(viewingTicket.Attachment || viewingTicket.AttachmentURL || viewingTicket.attachment_url || viewingTicket.image_url)}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.viewFullImageLink}
                      >
                        <ExternalLink size={13} />
                        <span>Open Full Image</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={styles.noAttachmentBox}>
                  <ImageIcon size={16} color="#64748b" />
                  <span>No image attached to this ticket</span>
                </div>
              )}
            </div>

            <div style={{ ...styles.modalActions, marginTop: '20px' }}>
              <button 
                type="button" 
                onClick={() => {
                  setShowViewModal(false);
                  handleOpenEdit(viewingTicket);
                }} 
                style={styles.editFromViewBtn}
              >
                <Edit2 size={14} />
                <span>Edit Ticket</span>
              </button>
              <button type="button" onClick={() => setShowViewModal(false)} style={styles.cancelBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}
      {previewImageUrl && (
        <div style={styles.modalOverlay} onClick={() => setPreviewImageUrl(null)}>
          <div style={styles.previewModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.previewHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={16} color="#34d399" />
                <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '14px' }}>MinIO Attachment Preview</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a 
                  href={previewImageUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={styles.externalLinkBtn}
                  title="Open direct URL"
                >
                  <ExternalLink size={15} />
                </a>
                <button 
                  onClick={() => setPreviewImageUrl(null)} 
                  style={styles.closePreviewBtn}
                >
                  <X size={17} color="#94a3b8" />
                </button>
              </div>
            </div>
            <div style={styles.previewBody}>
              <img 
                src={previewImageUrl} 
                alt="Ticket attachment" 
                style={styles.previewImg} 
              />
            </div>
          </div>
        </div>
      )}

      {/* CREATE TICKET MODAL */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, color: '#ffffff', fontWeight: 800, fontSize: '18px' }}>Create New Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} style={styles.closeBtn}>
                <X size={18} color="#94a3b8" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} style={styles.form}>
              <div>
                <label style={styles.label}>Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement refresh token rotation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="ticket-input-focus"
                  style={styles.input}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Assign to Project</label>
                  <select
                    value={newProjId}
                    onChange={(e) => setNewProjId(e.target.value)}
                    className="ticket-input-focus"
                    style={styles.selectInput}
                  >
                    <option value="" style={styles.selectOption}>Select Project (Optional)</option>
                    {projects.map((p) => {
                      const id = p.ProjectID ?? p.id;
                      return (
                        <option key={id} value={id} style={styles.selectOption}>
                          #{id} - {p.Name ?? p.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Assign to User</label>
                  <select
                    value={newAssignedTo}
                    onChange={(e) => {
                      const selId = e.target.value;
                      if (selId && eligibleUsers.length > 0) {
                        const targetUser = usersList.find((u) => String(u.id ?? u.UserID ?? u.user_id) === String(selId));
                        if (targetUser && !userHasValidRole(targetUser)) {
                          alert(`"${targetUser.Name ?? targetUser.name}" ke paas koi role nahi hai! Pehle Users page se isay role assign karein.`);
                          return;
                        }
                      }
                      setNewAssignedTo(selId);
                    }}
                    className="ticket-input-focus"
                    style={styles.selectInput}
                  >
                    <option value="" style={styles.selectOption}>Unassigned</option>
                    {usersToDisplay.map((u) => {
                      const uId = u.id ?? u.UserID ?? u.user_id;
                      return (
                        <option key={uId} value={uId} style={styles.selectOption}>
                          {u.Name ?? u.name} (#{uId})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Column Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="ticket-input-focus"
                    style={styles.selectInput}
                  >
                    {STATUS_COLUMNS.map((s) => (
                      <option key={s.key} value={s.key} style={styles.selectOption}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="ticket-input-focus"
                    style={styles.selectInput}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p.key} value={p.key} style={styles.selectOption}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={styles.label}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide task acceptance criteria or context..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="ticket-input-focus"
                  style={styles.textarea}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ ...styles.label, marginBottom: 0 }}>Attach Image</label>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>(Optional)</span>
                </div>
                <div style={styles.fileUploadBox}>
                  <label style={styles.fileSelectBtn}>
                    <Paperclip size={14} color="#34d399" />
                    <span>{newAttachmentFile ? newAttachmentFile.name : 'Choose File / Image'}</span>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewAttachmentFile(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {newAttachmentFile && (
                    <button
                      type="button"
                      onClick={() => setNewAttachmentFile(null)}
                      style={styles.removeSelectedFileBtn}
                      title="Clear selection"
                    >
                      <X size={14} color="#f87171" />
                    </button>
                  )}
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={creating} style={styles.submitBtn}>
                  {creating ? 'Creating Ticket...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TICKET MODAL */}
      {showEditModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, color: '#ffffff', fontWeight: 800, fontSize: '18px' }}>Update Ticket Details</h3>
              <button onClick={() => setShowEditModal(false)} style={styles.closeBtn}>
                <X size={18} color="#94a3b8" />
              </button>
            </div>
            <form onSubmit={handleUpdateTicket} style={styles.form}>
              <div>
                <label style={styles.label}>Task Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="ticket-input-focus"
                  style={styles.input}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Assign to Project</label>
                  <select
                    value={editProjId}
                    onChange={(e) => setEditProjId(e.target.value)}
                    className="ticket-input-focus"
                    style={styles.selectInput}
                  >
                    <option value="" style={styles.selectOption}>None</option>
                    {projects.map((p) => {
                      const id = p.ProjectID ?? p.id;
                      return (
                        <option key={id} value={id} style={styles.selectOption}>
                          #{id} - {p.Name ?? p.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Assignee User</label>
                  <select
                    value={editAssignedTo}
                    onChange={(e) => {
                      const selId = e.target.value;
                      if (selId && eligibleUsers.length > 0) {
                        const targetUser = usersList.find((u) => String(u.id ?? u.UserID ?? u.user_id) === String(selId));
                        if (targetUser && !userHasValidRole(targetUser)) {
                          alert(`"${targetUser.Name ?? targetUser.name}" ke paas koi role nahi hai! Pehle Users page se isay role assign karein.`);
                          return;
                        }
                      }
                      setEditAssignedTo(selId);
                    }}
                    className="ticket-input-focus"
                    style={styles.selectInput}
                  >
                    <option value="" style={styles.selectOption}>Unassigned</option>
                    {usersToDisplay.map((u) => {
                      const uId = u.id ?? u.UserID ?? u.user_id;
                      return (
                        <option key={uId} value={uId} style={styles.selectOption}>
                          {u.Name ?? u.name} (#{uId})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label style={styles.label}>Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="ticket-input-focus"
                  style={styles.selectInput}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p.key} value={p.key} style={styles.selectOption}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="ticket-input-focus"
                  style={styles.textarea}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowEditModal(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={updating} style={styles.submitBtn}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    maxWidth: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  breadcrumbBar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '18px',
    padding: '8px 14px',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    fontSize: '13px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#34d399',
    cursor: 'pointer',
    fontWeight: 700,
    padding: 0,
    fontSize: '13px',
  },
  filteredBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#34d399',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '22px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pillBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '0.07em',
    color: '#34d399',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    padding: '4px 12px',
    borderRadius: '20px',
    marginBottom: '8px',
  },
  pageTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.025em',
  },
  pageSubtitle: {
    margin: '6px 0 0 0',
    color: '#94a3b8',
    fontSize: '14px',
  },
  userFilterBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    padding: '6px 12px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  userFilterSelect: {
    background: 'transparent',
    border: 'none',
    color: '#38bdf8',
    fontSize: '13px',
    fontWeight: 600,
    outline: 'none',
    cursor: 'pointer',
  },
  clearFilterBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '11px 18px',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
    transition: 'all 0.2s ease',
  },
  boardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(250px, 1fr))',
    gap: '16px',
    alignItems: 'start',
    overflowX: 'auto',
    paddingBottom: '24px',
  },
  column: {
    background: 'rgba(12, 17, 29, 0.65)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '520px',
    overflow: 'hidden',
  },
  columnHeader: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    padding: '12px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  colIconBox: {
    width: '24px',
    height: '24px',
    borderRadius: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnTitle: {
    fontSize: '12.5px',
    fontWeight: 700,
    color: '#f1f5f9',
    letterSpacing: '0.02em',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: '#94a3b8',
    fontSize: '11.5px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  ticketList: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyColText: {
    textAlign: 'center',
    padding: '28px 0',
    color: '#64748b',
    fontSize: '12px',
    fontStyle: 'italic',
  },
  ticketId: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#64748b',
  },
  priorityBadge: {
    fontSize: '9.5px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '6px',
    letterSpacing: '0.04em',
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.15s ease',
  },
  miniLabel: {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#64748b',
    marginBottom: '3px',
  },
  statusSelect: {
    width: '100%',
    fontSize: '12px',
    fontWeight: 600,
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    color: '#f1f5f9',
    outline: 'none',
    cursor: 'pointer',
  },
  userSelect: {
    width: '100%',
    fontSize: '12px',
    fontWeight: 600,
    padding: '5px 8px',
    borderRadius: '8px',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#93c5fd',
    outline: 'none',
    cursor: 'pointer',
  },
  ticketHeading: {
    margin: '10px 0 6px 0',
    fontSize: '14px',
    fontWeight: 700,
    color: '#ffffff',
    lineHeight: 1.4,
  },
  ticketDesc: {
    margin: 0,
    fontSize: '12.5px',
    color: '#94a3b8',
    lineHeight: 1.5,
  },
  projectBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#34d399',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  attachmentBadge: {
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    padding: '5px 10px',
    borderRadius: '8px',
    width: 'fit-content',
  },
  viewAttachmentBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '11.5px',
    color: '#34d399',
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  removeAttachmentBtn: {
    background: 'none',
    border: 'none',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  cardActions: {
    marginTop: '12px',
    paddingTop: '10px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  uploadLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11.5px',
    fontWeight: 600,
    color: '#34d399',
    cursor: 'pointer',
    padding: '4px 10px',
    borderRadius: '8px',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    transition: 'all 0.15s ease',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.75)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '16px',
    boxSizing: 'border-box',
  },
  modalContent: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '28px',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxSizing: 'border-box',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  viewModalContent: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '26px',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(56, 189, 248, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxSizing: 'border-box',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  ticketIdBadge: {
    fontSize: '13px',
    fontWeight: 800,
    color: '#94a3b8',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: '2px 8px',
    borderRadius: '8px',
  },
  viewModalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.4,
  },
  viewDetailPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#94a3b8',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '4px 10px',
    borderRadius: '8px',
  },
  viewDescBox: {
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '13.5px',
    color: '#cbd5e1',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  viewImageBox: {
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '12px',
    padding: '10px',
  },
  viewImageTag: {
    width: '100%',
    maxHeight: '260px',
    objectFit: 'contain',
    borderRadius: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  viewFullImageLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#34d399',
    fontSize: '12px',
    fontWeight: 600,
    textDecoration: 'none',
  },
  noAttachmentBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#64748b',
    fontSize: '12.5px',
  },
  editFromViewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
  },
  previewModalContent: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '20px',
    borderRadius: '20px',
    maxWidth: '90vw',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '12px',
  },
  previewBody: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'auto',
  },
  previewImg: {
    maxWidth: '100%',
    maxHeight: '70vh',
    borderRadius: '10px',
    objectFit: 'contain',
  },
  externalLinkBtn: {
    color: '#34d399',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: '6px',
  },
  closePreviewBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#cbd5e1',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    color: '#ffffff',
    transition: 'all 0.15s ease',
  },
  selectInput: {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    color: '#ffffff',
    cursor: 'pointer',
  },
  selectOption: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
  },
  textarea: {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    color: '#ffffff',
    resize: 'vertical',
  },
  fileUploadBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    border: '1px dashed rgba(16, 185, 129, 0.3)',
    borderRadius: '10px',
    padding: '8px 12px',
  },
  fileSelectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#34d399',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    flex: 1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  removeSelectedFileBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '8px',
  },
  cancelBtn: {
    padding: '10px 16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    cursor: 'pointer',
    color: '#94a3b8',
    fontWeight: 600,
    fontSize: '13.5px',
  },
  submitBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13.5px',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '60px 0',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(16, 185, 129, 0.15)',
    borderTop: '3px solid #10b981',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: '#f87171',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    marginBottom: '20px',
    fontSize: '13.5px',
  },
};