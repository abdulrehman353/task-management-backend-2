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
  Sparkles
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
  { key: 'todo', label: 'Ready To Do', icon: CircleDashed, color: '#64748b', badgeBg: '#f1f5f9' },
  { key: 'in_progress', label: 'In Progress', icon: Clock, color: '#0284c7', badgeBg: '#e0f2fe' },
  { key: 'blocked', label: 'Blocked', icon: Ban, color: '#dc2626', badgeBg: '#fee2e2' },
  { key: 'testing', label: 'Testing', icon: TestTube2, color: '#d97706', badgeBg: '#fef3c7' },
  { key: 'done', label: 'Done', icon: CheckCircle2, color: '#059669', badgeBg: '#ecfdf5' },
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
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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
      // Ignore fallback
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchProjects();
    if (projectIdParam) {
      setNewProjId(projectIdParam);
    }
  }, [projectIdParam]);

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

  return (
    <div style={styles.pageContainer}>
      <style>{`
        .ticket-glass-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 4px 10px -2px rgba(15, 23, 42, 0.04);
          transition: all 0.22s ease;
        }
        .ticket-glass-card:hover {
          transform: translateY(-2px);
          border-color: rgba(16, 185, 129, 0.45);
          box-shadow: 0 10px 20px -4px rgba(16, 185, 129, 0.15);
        }
        .status-select-input:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15) !important;
        }
        .emerald-btn-glow:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 16px -3px rgba(16, 185, 129, 0.38) !important;
        }
        .card-btn-action:hover {
          background-color: #f1f5f9 !important;
          transform: scale(1.08);
        }
        .ticket-input-focus:focus {
          background: #ffffff !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
        }
      `}</style>

      {/* Breadcrumb Header */}
      {projectNameParam && (
        <div style={styles.breadcrumbBar}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            <ArrowLeft size={15} />
            <span>Back to Projects</span>
          </button>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <span style={{ color: '#0f172a', fontWeight: 700 }}>{projectNameParam}</span>
          <span style={styles.filteredBadge}>Sprint Board</span>
        </div>
      )}

      {/* Top Header */}
      <div style={styles.topBar}>
        <div>
          <div style={styles.pillBadge}>
            <Sparkles size={11} color="#059669" />
            <span>WORKFLOW EXECUTION</span>
          </div>
          <h2 style={styles.pageTitle}>
            {projectNameParam ? `${projectNameParam} Board` : 'Task Board'}
          </h2>
          <p style={styles.pageSubtitle}>
            Live lifecycle management, status state progression, and MinIO attachment previews.
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="emerald-btn-glow" style={styles.primaryBtn}>
          <Plus size={18} strokeWidth={2.4} />
          <span>New Ticket</span>
        </button>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Kanban / Task Columns */}
      {loading ? (
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Syncing tickets...</p>
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
                                onClick={() => handleOpenEdit(ticket)} 
                                className="card-btn-action"
                                style={styles.iconBtn} 
                                title="Edit Ticket"
                              >
                                <Edit2 size={13} color="#64748b" />
                              </button>
                              <button 
                                onClick={() => handleDeleteTicket(ticketId)} 
                                className="card-btn-action"
                                style={styles.iconBtn} 
                                title="Delete Ticket"
                              >
                                <Trash2 size={13} color="#ef4444" />
                              </button>
                            </div>
                          </div>

                          <div style={{ marginTop: '10px' }}>
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

                          <h4 style={styles.ticketHeading}>{title}</h4>
                          {desc && <p style={styles.ticketDesc}>{desc}</p>}

                          {projId ? (
                            <div style={styles.projectBadge}>
                              <FolderKanban size={11} color="#059669" />
                              <span>Project #{projId}</span>
                            </div>
                          ) : null}

                          {attachment && formatAttachmentUrl(attachment) && (
                            <div style={styles.attachmentBadge}>
                              <ImageIcon size={13} color="#059669" />
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
                                <X size={12} color="#ef4444" />
                              </button>
                            </div>
                          )}

                          <div style={styles.cardActions}>
                            <label style={styles.uploadLabel} title="Attach image or file">
                              <Paperclip size={12} color="#059669" />
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

      {/* IMAGE PREVIEW MODAL */}
      {previewImageUrl && (
        <div style={styles.modalOverlay} onClick={() => setPreviewImageUrl(null)}>
          <div style={styles.previewModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.previewHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={16} color="#059669" />
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>MinIO Attachment Preview</span>
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
                  <X size={17} color="#64748b" />
                </button>
              </div>
            </div>
            <div style={styles.previewBody}>
              <img 
                src={previewImageUrl} 
                alt="Ticket attachment" 
                style={styles.previewImg} 
                onError={(e) => {
                  (e.target as HTMLImageElement).alt = 'Failed to load image from MinIO storage';
                }}
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
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 800, fontSize: '18px' }}>Create New Ticket</h3>
              <button onClick={() => setShowCreateModal(false)} style={styles.closeBtn}>
                <X size={18} color="#64748b" />
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

              <div>
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
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: 800, fontSize: '18px' }}>Update Ticket Details</h3>
              <button onClick={() => setShowEditModal(false)} style={styles.closeBtn}>
                <X size={18} color="#64748b" />
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
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    borderRadius: '12px',
    border: '1px solid rgba(226, 232, 240, 0.85)',
    fontSize: '13px',
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#059669',
    cursor: 'pointer',
    fontWeight: 700,
    padding: 0,
    fontSize: '13px',
  },
  filteredBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#047857',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
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
    gap: '5px',
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '0.07em',
    color: '#047857',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '3px 10px',
    borderRadius: '20px',
    marginBottom: '8px',
  },
  pageTitle: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.025em',
  },
  pageSubtitle: {
    margin: '6px 0 0 0',
    color: '#64748b',
    fontSize: '14px',
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
    boxShadow: '0 6px 16px -2px rgba(16, 185, 129, 0.35)',
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
    background: 'rgba(241, 245, 249, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '520px',
    overflow: 'hidden',
  },
  columnHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '12px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
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
    color: '#1e293b',
    letterSpacing: '0.02em',
  },
  countBadge: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: '11.5px',
    fontWeight: 700,
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
    padding: '28px 0',
    color: '#94a3b8',
    fontSize: '12px',
    fontStyle: 'italic',
  },
  ticketId: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#94a3b8',
  },
  priorityBadge: {
    fontSize: '9.5px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '6px',
    letterSpacing: '0.04em',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.15s ease',
  },
  statusSelect: {
    width: '100%',
    fontSize: '12px',
    fontWeight: 600,
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    outline: 'none',
    cursor: 'pointer',
  },
  ticketHeading: {
    margin: '10px 0 6px 0',
    fontSize: '14px',
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1.4,
  },
  ticketDesc: {
    margin: 0,
    fontSize: '12.5px',
    color: '#64748b',
    lineHeight: 1.5,
  },
  projectBadge: {
    marginTop: '10px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#047857',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  attachmentBadge: {
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '5px 10px',
    borderRadius: '8px',
    width: 'fit-content',
  },
  viewAttachmentBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '11.5px',
    color: '#047857',
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
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  uploadLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11.5px',
    fontWeight: 600,
    color: '#047857',
    cursor: 'pointer',
    padding: '4px 10px',
    borderRadius: '8px',
    border: '1px solid #a7f3d0',
    backgroundColor: '#ecfdf5',
    transition: 'all 0.15s ease',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '16px',
    boxSizing: 'border-box',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: '28px',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
    border: '1px solid rgba(226, 232, 240, 0.9)',
    boxSizing: 'border-box',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
  },
  previewModalContent: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '20px',
    maxWidth: '90vw',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.3)',
    border: '1px solid #e2e8f0',
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
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
    color: '#059669',
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
    color: '#1e293b',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    transition: 'all 0.15s ease',
  },
  selectInput: {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    cursor: 'pointer',
  },
  selectOption: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  textarea: {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    resize: 'vertical',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '8px',
  },
  cancelBtn: {
    padding: '9px 16px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    borderRadius: '10px',
    cursor: 'pointer',
    color: '#64748b',
    fontWeight: 600,
    fontSize: '13.5px',
  },
  submitBtn: {
    padding: '9px 20px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13.5px',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
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
    border: '3px solid #ecfdf5',
    borderTop: '3px solid #10b981',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #fee2e2',
    marginBottom: '20px',
    fontSize: '13.5px',
  },
};