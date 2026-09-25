import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { 
  Users as UsersIcon, 
  Shield, 
  Mail, 
  Calendar, 
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
  X,
  Ticket as TicketIcon,
  FolderKanban,
  UserPlus,
  Lock,
  User,
  ExternalLink,
  Layers,
  Award
} from 'lucide-react';

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

export default function Users() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [allTickets, setAllTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<{ [userId: number]: string }>({});

  // View Details Modal State
  const [viewingUser, setViewingUser] = useState<UserItem | null>(null);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState<TicketItem | null>(null);

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [creatingUser, setCreatingUser] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    date_of_birth: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersRes, rolesRes, ticketsRes] = await Promise.allSettled([
        axiosClient.get('/users'),
        axiosClient.get('/roles'),
        axiosClient.get('/tickets'),
      ]);

      if (usersRes.status === 'fulfilled') {
        setUsers(Array.isArray(usersRes.value.data) ? usersRes.value.data : usersRes.value.data.users || []);
      }
      if (rolesRes.status === 'fulfilled') {
        setRoles(Array.isArray(rolesRes.value.data) ? rolesRes.value.data : rolesRes.value.data.roles || []);
      }
      if (ticketsRes.status === 'fulfilled') {
        setAllTickets(Array.isArray(ticketsRes.value.data) ? ticketsRes.value.data : ticketsRes.value.data.tickets || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users or roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleAssign = async (userId: number) => {
    const roleId = selectedRoles[userId];
    if (!roleId) {
      alert('Please select a role first');
      return;
    }

    try {
      await axiosClient.post('/roles/assign', {
        UserID: userId,
        userId: userId,
        RoleID: Number(roleId),
        roleId: Number(roleId),
      });
      alert('Role assigned successfully!');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign role');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      alert('Please fill in all required fields.');
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

      if (createForm.date_of_birth) {
        payload.Date_of_birth = createForm.date_of_birth;
        payload.date_of_birth = createForm.date_of_birth;
      }

      await axiosClient.post('/auth/signup', payload);
      alert('User created successfully!');
      setShowCreateModal(false);
      setShowPassword(false);
      setCreateForm({ name: '', email: '', password: '', date_of_birth: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create user');
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
    <div style={styles.pageContainer}>
      <style>{`
        .users-table-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
        }
        .user-select-glow:focus {
          background: rgba(2, 6, 23, 0.85) !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
        }
        .emerald-assign-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px -2px rgba(16, 185, 129, 0.45) !important;
        }
        .assigned-role-tag:hover {
          background-color: rgba(56, 189, 248, 0.18) !important;
          border-color: rgba(56, 189, 248, 0.45) !important;
        }
        .view-details-btn:hover {
          background-color: rgba(16, 185, 129, 0.18) !important;
          transform: scale(1.05);
          border-color: rgba(16, 185, 129, 0.4) !important;
        }
        .users-table-row {
          transition: background-color 0.15s ease;
        }
        .users-table-row:hover {
          background-color: rgba(255, 255, 255, 0.03);
        }
        .create-user-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4) !important;
        }
        .user-modal-input:focus {
          background: rgba(2, 6, 23, 0.85) !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
        }
        .ticket-view-action:hover {
          background-color: rgba(56, 189, 248, 0.2) !important;
          transform: scale(1.08);
        }
      `}</style>

      {/* Header Section with Create User Button */}
      <div style={styles.headerSection}>
        <div>
          <div style={styles.pillBadge}>
            <Sparkles size={11} color="#34d399" />
            <span>USER & ACCESS ALLOCATION</span>
          </div>
          <h2 style={styles.pageTitle}>System Users</h2>
          <p style={styles.pageSubtitle}>
            View registered accounts, inspect assigned tasks, and allocate corporate security roles.
          </p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)} 
          className="create-user-btn" 
          style={styles.createUserBtn}
        >
          <UserPlus size={16} strokeWidth={2.4} />
          <span>Create User</span>
        </button>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table */}
      {loading ? (
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Syncing user accounts...</p>
        </div>
      ) : users.length === 0 ? (
        <div style={styles.emptyBox}>
          <UsersIcon size={36} color="#64748b" style={{ marginBottom: '10px' }} />
          <h4 style={{ margin: '0 0 6px 0', color: '#f1f5f9' }}>No registered users found</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            New registered members will appear here for role allocation.
          </p>
        </div>
      ) : (
        <div className="users-table-card">
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={{ ...styles.th, width: '24%' }}>User Profile</th>
                <th style={{ ...styles.th, width: '22%' }}>Email Address</th>
                <th style={{ ...styles.th, width: '15%' }}>Date of Birth</th>
                <th style={{ ...styles.th, width: '24%' }}>Role Assignment</th>
                <th style={{ ...styles.th, width: '15%', textAlign: 'right' }}>Assigned Role & Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => {
                const uId = u.id ?? u.UserID ?? u.user_id ?? (idx + 1);
                const uName = u.name ?? u.Name ?? 'Unnamed';
                const uEmail = u.email ?? u.Email ?? 'N/A';
                const uDob = u.Date_of_birth ? u.Date_of_birth.slice(0, 10) : 'Not specified';
                const initialChar = uName.charAt(0).toUpperCase();
                const currentRole = getUserRoleTitle(u);

                return (
                  <tr key={uId} className="users-table-row" style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={styles.avatar}>
                          {initialChar}
                        </div>
                        <div>
                          <strong style={{ color: '#ffffff', fontSize: '14px', fontWeight: 700 }}>
                            {uName}
                          </strong>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            User ID #{uId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13.5px' }}>
                        <Mail size={14} color="#64748b" />
                        <span>{uEmail}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px' }}>
                        <Calendar size={14} color="#64748b" />
                        <span>{uDob}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          value={selectedRoles[uId] || ''}
                          onChange={(e) =>
                            setSelectedRoles({ ...selectedRoles, [uId]: e.target.value })
                          }
                          className="user-select-glow"
                          style={styles.select}
                        >
                          <option value="" style={{ color: '#ffffff', backgroundColor: '#0f172a' }}>
                            Select Role
                          </option>
                          {roles.map((r) => {
                            const rId = r.id ?? r.RoleID ?? r.role_id;
                            const rName = r.RoleName ?? r.roleName ?? r.name ?? r.Name ?? `Role #${rId}`;
                            return (
                              <option key={rId} value={rId} style={{ color: '#ffffff', backgroundColor: '#0f172a' }}>
                                {rName}
                              </option>
                            );
                          })}
                        </select>
                        <button 
                          onClick={() => handleRoleAssign(uId)} 
                          className="emerald-assign-btn" 
                          style={styles.assignBtn}
                          title="Assign selected role to user"
                        >
                          <Shield size={14} strokeWidth={2.2} />
                          <span>Assign</span>
                        </button>
                      </div>
                    </td>
                    
                    {/* ASSIGN AUR VIEW KE CENTER MEIN ASSIGNED ROLE BUTTON */}
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="assigned-role-tag"
                          style={styles.assignedRoleBtn}
                          title={`Assigned Role: ${currentRole}`}
                        >
                          <Award size={13} color="#38bdf8" />
                          <span>{currentRole}</span>
                        </button>

                        <button
                          onClick={() => setViewingUser(u)}
                          className="view-details-btn"
                          style={styles.viewBtn}
                          title="View User Details & Assigned Tasks"
                        >
                          <Eye size={14} color="#34d399" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={styles.modalIconBox}>
                  <UserPlus size={18} color="#10b981" />
                </div>
                <h3 style={{ margin: 0, color: '#ffffff', fontWeight: 800, fontSize: '18px' }}>
                  Create New User
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={styles.closeBtn}>
                <X size={18} color="#94a3b8" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={styles.form}>
              <div>
                <label style={styles.label}>Full Name *</label>
                <div style={styles.inputWrapper}>
                  <User size={15} color="#64748b" style={styles.inputIcon} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="user-modal-input"
                    style={styles.input}
                  />
                </div>
              </div>

              <div>
                <label style={styles.label}>Email Address *</label>
                <div style={styles.inputWrapper}>
                  <Mail size={15} color="#64748b" style={styles.inputIcon} />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="user-modal-input"
                    style={styles.input}
                  />
                </div>
              </div>

              <div>
                <label style={styles.label}>Password *</label>
                <div style={styles.inputWrapper}>
                  <Lock size={15} color="#64748b" style={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="user-modal-input"
                    style={{ ...styles.input, paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={styles.label}>Date of Birth (Optional)</label>
                <div style={styles.inputWrapper}>
                  <Calendar size={15} color="#64748b" style={styles.inputIcon} />
                  <input
                    type="date"
                    value={createForm.date_of_birth}
                    onChange={(e) => setCreateForm({ ...createForm, date_of_birth: e.target.value })}
                    className="user-modal-input"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={creatingUser} 
                  style={styles.submitBtn}
                >
                  {creatingUser ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER DETAILS & COMPACT ASSIGNED TICKETS MODAL */}
      {viewingUser && (
        <div style={styles.modalOverlay} onClick={() => setViewingUser(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.avatarModal}>
                  {(viewingUser.name ?? viewingUser.Name ?? 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#ffffff', fontWeight: 800, fontSize: '18px' }}>
                    {viewingUser.name ?? viewingUser.Name}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    ID #{viewingUser.id ?? viewingUser.UserID ?? viewingUser.user_id} • {viewingUser.email ?? viewingUser.Email}
                  </span>
                </div>
              </div>
              <button onClick={() => setViewingUser(null)} style={styles.closeBtn}>
                <X size={18} color="#94a3b8" />
              </button>
            </div>

            {/* Role & Status Card */}
            <div style={styles.roleSummaryCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} color="#34d399" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>System Role:</span>
              </div>
              <span style={styles.rolePill}>
                {getUserRoleTitle(viewingUser)}
              </span>
            </div>

            {/* Compact Assigned Tickets List */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TicketIcon size={16} color="#60a5fa" />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                    Assigned Tickets & Tasks
                  </span>
                </div>
                <span style={styles.countBadge}>
                  {getUserAssignedTickets(viewingUser.id ?? viewingUser.UserID ?? viewingUser.user_id).length} Assigned
                </span>
              </div>

              <div style={styles.assignedTicketsList}>
                {getUserAssignedTickets(viewingUser.id ?? viewingUser.UserID ?? viewingUser.user_id).length === 0 ? (
                  <div style={styles.emptyTicketsBox}>
                    <span>No tickets currently assigned to this user.</span>
                  </div>
                ) : (
                  <div style={styles.compactGrid}>
                    {getUserAssignedTickets(viewingUser.id ?? viewingUser.UserID ?? viewingUser.user_id).map((t) => {
                      const tId = t.id ?? t.TicketID ?? t.ticket_id;
                      const tTitle = t.title ?? t.Title ?? 'Untitled Task';
                      const tStatus = (t.status ?? t.Status ?? 'todo').replace('_', ' ').toUpperCase();

                      return (
                        <div key={tId} style={styles.compactTicketRow}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <span style={styles.compactTicketBadge}>#{tId}</span>
                            <span style={styles.compactTicketTitle} title={tTitle}>{tTitle}</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <span style={styles.statusPillSmall}>{tStatus}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedTicketDetail(t)}
                              className="ticket-view-action"
                              style={styles.compactEyeBtn}
                              title="View full ticket details"
                            >
                              <Eye size={13} color="#38bdf8" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '22px' }}>
              <button onClick={() => setViewingUser(null)} style={styles.closeModalBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NESTED TICKET DETAILS MODAL */}
      {selectedTicketDetail && (
        <div style={{ ...styles.modalOverlay, zIndex: 1005 }} onClick={() => setSelectedTicketDetail(null)}>
          <div style={styles.ticketDetailModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={styles.ticketDetailHeaderBadge}>
                  #{selectedTicketDetail.id ?? selectedTicketDetail.TicketID ?? selectedTicketDetail.ticket_id}
                </span>
                <span style={styles.priorityPillSmall}>
                  {(selectedTicketDetail.priority ?? selectedTicketDetail.Priority ?? 'medium').toUpperCase()}
                </span>
              </div>
              <button onClick={() => setSelectedTicketDetail(null)} style={styles.closeBtn}>
                <X size={18} color="#94a3b8" />
              </button>
            </div>

            <h3 style={styles.ticketDetailMainTitle}>
              {selectedTicketDetail.title ?? selectedTicketDetail.Title ?? 'Untitled Task'}
            </h3>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '12px 0' }}>
              <div style={styles.detailPill}>
                <Layers size={13} color="#94a3b8" />
                <span>Stage: <strong>{(selectedTicketDetail.status ?? selectedTicketDetail.Status ?? 'todo').replace('_', ' ').toUpperCase()}</strong></span>
              </div>
              {selectedTicketDetail.ProjectID && (
                <div style={styles.detailPill}>
                  <FolderKanban size={13} color="#34d399" />
                  <span>Project #{selectedTicketDetail.ProjectID}</span>
                </div>
              )}
            </div>

            <div>
              <label style={styles.label}>Description</label>
              <div style={styles.ticketDescContainer}>
                {selectedTicketDetail.description ?? selectedTicketDetail.Description ?? 'No description provided.'}
              </div>
            </div>

            {(selectedTicketDetail.Attachment || selectedTicketDetail.AttachmentURL || selectedTicketDetail.attachment_url || selectedTicketDetail.image_url) ? (
              <div style={{ marginTop: '14px' }}>
                <label style={styles.label}>Attached Image (MinIO Storage)</label>
                <div style={styles.viewImageBox}>
                  <img 
                    src={formatAttachmentUrl(selectedTicketDetail.Attachment || selectedTicketDetail.AttachmentURL || selectedTicketDetail.attachment_url || selectedTicketDetail.image_url)}
                    alt="Ticket Attachment"
                    style={styles.viewImageTag}
                  />
                  <div style={{ marginTop: '6px', textAlign: 'right' }}>
                    <a 
                      href={formatAttachmentUrl(selectedTicketDetail.Attachment || selectedTicketDetail.AttachmentURL || selectedTicketDetail.attachment_url || selectedTicketDetail.image_url)}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.openLinkTag}
                    >
                      <ExternalLink size={12} />
                      <span>Open Full Attachment</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button onClick={() => setSelectedTicketDetail(null)} style={styles.cancelBtn}>
                Back to User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '22px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  createUserBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '13.5px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
    transition: 'all 0.2s ease',
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
    lineHeight: 1.5,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px',
  },
  tableHeadRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  th: {
    padding: '14px 20px',
    color: '#64748b',
    fontWeight: 700,
    fontSize: '12px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  td: {
    padding: '16px 20px',
    verticalAlign: 'middle',
  },
  avatar: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '14px',
    width: '36px',
    height: '36px',
    borderRadius: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.35)',
    flexShrink: 0,
  },
  avatarModal: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '18px',
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
    flexShrink: 0,
  },
  select: {
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  assignBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.2s ease',
  },
  assignedRoleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    border: '1px solid rgba(56, 189, 248, 0.28)',
    color: '#38bdf8',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'default',
    transition: 'all 0.15s ease',
  },
  viewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    color: '#34d399',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  emptyBox: {
    padding: '50px 20px',
    textAlign: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: '16px',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
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
    padding: '24px 28px',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxSizing: 'border-box',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '18px',
  },
  modalIconBox: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  label: {
    display: 'block',
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#cbd5e1',
    marginBottom: '6px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '10px 14px 10px 38px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    color: '#ffffff',
    fontSize: '13.5px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.15s ease',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px',
  },
  cancelBtn: {
    padding: '9px 16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    cursor: 'pointer',
    color: '#94a3b8',
    fontWeight: 600,
    fontSize: '13px',
  },
  submitBtn: {
    padding: '9px 20px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13px',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
  },
  roleSummaryCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    padding: '10px 14px',
  },
  rolePill: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#34d399',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    padding: '3px 10px',
    borderRadius: '14px',
  },
  countBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    color: '#60a5fa',
    border: '1px solid rgba(59, 130, 246, 0.28)',
    fontSize: '11.5px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '12px',
  },
  assignedTicketsList: {
    maxHeight: '260px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  compactGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  compactTicketRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
    padding: '7px 10px',
    gap: '10px',
  },
  compactTicketBadge: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    padding: '1px 6px',
    borderRadius: '6px',
    flexShrink: 0,
  },
  compactTicketTitle: {
    fontSize: '13px',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 600,
  },
  compactEyeBtn: {
    background: 'rgba(56, 189, 248, 0.1)',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    borderRadius: '6px',
    cursor: 'pointer',
    padding: '4px 6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  emptyTicketsBox: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '10px',
    border: '1px dashed rgba(255, 255, 255, 0.08)',
    color: '#64748b',
    fontSize: '13px',
  },
  statusPillSmall: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    padding: '2px 6px',
    borderRadius: '6px',
  },
  priorityPillSmall: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#fbbf24',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    padding: '2px 6px',
    borderRadius: '6px',
  },
  closeModalBtn: {
    padding: '9px 20px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
  },
  ticketDetailModal: {
    backgroundColor: 'rgba(15, 23, 42, 0.98)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    padding: '24px',
    borderRadius: '18px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.2)',
    border: '1px solid rgba(56, 189, 248, 0.25)',
    boxSizing: 'border-box',
    maxHeight: '85vh',
    overflowY: 'auto',
  },
  ticketDetailHeaderBadge: {
    fontSize: '13px',
    fontWeight: 800,
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    padding: '2px 8px',
    borderRadius: '6px',
  },
  ticketDetailMainTitle: {
    margin: '6px 0 0 0',
    fontSize: '17px',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.4,
  },
  detailPill: {
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
  ticketDescContainer: {
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '13px',
    color: '#cbd5e1',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  viewImageBox: {
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '10px',
    padding: '8px',
  },
  viewImageTag: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    borderRadius: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  openLinkTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#34d399',
    fontSize: '11.5px',
    fontWeight: 600,
    textDecoration: 'none',
  }
};