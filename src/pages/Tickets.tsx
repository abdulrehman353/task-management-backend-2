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
  ArrowLeft
} from 'lucide-react';

interface ProjectItem {
  ProjectID?: number;
  id?: number;
  Name?: string;
  name?: string;
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
}

const STATUS_COLUMNS = [
  { key: 'todo', label: 'Ready To Do', icon: CircleDashed, color: '#64748b' },
  { key: 'in_progress', label: 'In Progress', icon: Clock, color: '#2563eb' },
  { key: 'blocked', label: 'Blocked', icon: Ban, color: '#dc2626' },
  { key: 'testing', label: 'Testing', icon: TestTube2, color: '#d97706' },
  { key: 'done', label: 'Done', icon: CheckCircle2, color: '#16a34a' },
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProjId, setNewProjId] = useState(projectIdParam || '');
  const [newStatus, setNewStatus] = useState('todo');
  const [newPriority, setNewPriority] = useState('medium');
  const [creating, setCreating] = useState(false);

  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editProjId, setEditProjId] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [updating, setUpdating] = useState(false);

  // Fetch Tickets safely
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

  // Fetch Projects silently for dropdown
  const fetchProjects = async () => {
    try {
      const res = await axiosClient.get('/projects');
      const data = Array.isArray(res.data) ? res.data : res.data.projects || [];
      setProjects(data);
    } catch {
      // Ignore if projects fail so tickets still display
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchProjects();
    if (projectIdParam) {
      setNewProjId(projectIdParam);
    }
  }, [projectIdParam]);

  // Status Change via PUT (Bypasses CORS PATCH blockage)
  const handleStatusChange = async (ticketId: number, nextStatus: string) => {
    try {
      await axiosClient.put(`/tickets/${ticketId}`, { 
        Status: nextStatus,
        status: nextStatus 
      });
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleFileUpload = async (ticketId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image', file);

    try {
      await axiosClient.post(`/tickets/${ticketId}/attach-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('File attached successfully!');
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload attachment');
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const targetProjId = newProjId || projectIdParam;
      await axiosClient.post('/tickets', {
        Title: newTitle,
        Description: newDesc,
        ProjectID: targetProjId ? Number(targetProjId) : null,
        Status: newStatus,
        Priority: newPriority,
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewProjId(projectIdParam || '');
      setNewStatus('todo');
      setNewPriority('medium');
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
    setShowEditModal(true);
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;
    const ticketId = editingTicket.id ?? editingTicket.TicketID ?? editingTicket.ticket_id;
    if (!ticketId) return;

    try {
      setUpdating(true);
      await axiosClient.put(`/tickets/${ticketId}`, {
        Title: editTitle,
        Description: editDesc,
        Priority: editPriority,
        ProjectID: editProjId ? Number(editProjId) : null,
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

  const displayedTickets = projectIdParam
    ? tickets.filter((t) => Number(t.ProjectID ?? t.project_id) === Number(projectIdParam))
    : tickets;

  const getPriorityStyle = (priority?: string) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high') return { backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' };
    if (p === 'medium') return { backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' };
    return { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {projectNameParam && (
        <div style={styles.breadcrumbBar}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>Back to Projects</span>
          </button>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{projectNameParam}</span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>(Tickets Board)</span>
        </div>
      )}

      <div style={styles.topBar}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a' }}>
            {projectNameParam ? `${projectNameParam} Tickets` : 'Task Board'}
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            Workflow tracking, project tasks, and attachment management.
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} style={styles.primaryBtn}>
          <Plus size={18} />
          <span>New Ticket</span>
        </button>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading tickets...</p>
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
                    <IconComponent size={16} color={col.color} />
                    <span style={styles.columnTitle}>{col.label}</span>
                  </div>
                  <span style={styles.countBadge}>{colTickets.length}</span>
                </div>

                <div style={styles.ticketList}>
                  {colTickets.length === 0 ? (
                    <div style={styles.emptyColText}>No tickets</div>
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

                      return (
                        <div key={ticketId} style={styles.ticketCard}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={styles.ticketId}>#{ticketId}</span>
                              <span style={{ ...styles.priorityBadge, ...getPriorityStyle(priority) }}>
                                {priority.toUpperCase()}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button 
                                onClick={() => handleOpenEdit(ticket)} 
                                style={styles.iconBtn} 
                                title="Edit Ticket"
                              >
                                <Edit2 size={13} color="#64748b" />
                              </button>
                              <button 
                                onClick={() => handleDeleteTicket(ticketId)} 
                                style={styles.iconBtn} 
                                title="Delete Ticket"
                              >
                                <Trash2 size={13} color="#ef4444" />
                              </button>
                            </div>
                          </div>

                          <div style={{ marginTop: '8px' }}>
                            <select
                              value={currentStatus}
                              onChange={(e) => handleStatusChange(ticketId, e.target.value)}
                              style={styles.statusSelect}
                            >
                              {STATUS_COLUMNS.map((s) => (
                                <option key={s.key} value={s.key} style={styles.selectOption}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <h4 style={styles.ticketHeading}>{title}</h4>
                          {desc && <p style={styles.ticketDesc}>{desc}</p>}

                          {projId ? (
                            <div style={styles.projectBadge}>
                              <FolderKanban size={12} color="#2563eb" />
                              <span>Project #{projId}</span>
                            </div>
                          ) : null}

                          {attachment && (
                            <div style={styles.attachmentBadge}>
                              <ImageIcon size={14} color="#2563eb" />
                              <a href={attachment} target="_blank" rel="noreferrer" style={styles.attachmentLink}>
                                View Attachment
                              </a>
                            </div>
                          )}

                          <div style={styles.cardActions}>
                            <label style={styles.uploadLabel} title="Attach file">
                              <Paperclip size={13} />
                              <span>Attach File</span>
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

      {/* CREATE TICKET MODAL */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontWeight: 700 }}>Create New Ticket</h3>
            <form onSubmit={handleCreateTicket} style={styles.form}>
              <div>
                <label style={styles.label}>Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fix JWT expiration issue"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Assign to Project</label>
                <select
                  value={newProjId}
                  onChange={(e) => setNewProjId(e.target.value)}
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

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
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
                  <label style={styles.label}>Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
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
                  placeholder="Provide task details or acceptance criteria..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={creating} style={styles.submitBtn}>
                  {creating ? 'Creating...' : 'Create Ticket'}
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
            <h3 style={{ margin: '0 0 16px 0', color: '#0f172a', fontWeight: 700 }}>Update Ticket Details</h3>
            <form onSubmit={handleUpdateTicket} style={styles.form}>
              <div>
                <label style={styles.label}>Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Assign to Project</label>
                  <select
                    value={editProjId}
                    onChange={(e) => setEditProjId(e.target.value)}
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
                  <label style={styles.label}>Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
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
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
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
  breadcrumbBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    padding: '8px 12px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: 600,
    padding: 0,
    fontSize: '13px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  boardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(240px, 1fr))',
    gap: '16px',
    alignItems: 'start',
    overflowX: 'auto',
    paddingBottom: '20px',
  },
  column: {
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '500px',
  },
  columnHeader: {
    backgroundColor: '#ffffff',
    padding: '12px 14px',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
  },
  columnTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#1e293b',
    textTransform: 'uppercase',
  },
  countBadge: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: '12px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '12px',
  },
  ticketList: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyColText: {
    textAlign: 'center',
    padding: '20px 0',
    color: '#94a3b8',
    fontSize: '12px',
  },
  ticketCard: {
    backgroundColor: '#ffffff',
    padding: '14px',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  ticketId: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#94a3b8',
  },
  priorityBadge: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '4px',
    letterSpacing: '0.02em',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  },
  statusSelect: {
    width: '100%',
    fontSize: '12px',
    padding: '6px 8px',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    outline: 'none',
    cursor: 'pointer',
  },
  ticketHeading: {
    margin: '10px 0 6px 0',
    fontSize: '14px',
    color: '#0f172a',
  },
  ticketDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.4',
  },
  projectBadge: {
    marginTop: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    padding: '3px 8px',
    borderRadius: '4px',
    border: '1px solid #dbeafe',
  },
  attachmentBadge: {
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#eff6ff',
    padding: '4px 8px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  attachmentLink: {
    fontSize: '12px',
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 500,
  },
  cardActions: {
    marginTop: '12px',
    paddingTop: '8px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  uploadLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#475569',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  selectInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    cursor: 'pointer',
  },
  selectOption: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    resize: 'vertical',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px',
  },
  cancelBtn: {
    padding: '8px 16px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#475569',
    fontSize: '14px',
  },
  submitBtn: {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px',
  },
};