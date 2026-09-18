import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { 
  Users as UsersIcon, 
  Shield, 
  Mail, 
  Calendar, 
  AlertCircle,
  Sparkles
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

export default function Users() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<{ [userId: number]: string }>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersRes, rolesRes] = await Promise.all([
        axiosClient.get('/users'),
        axiosClient.get('/roles'),
      ]);

      setUsers(Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.users || []);
      setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : rolesRes.data.roles || []);
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

  return (
    <div style={styles.pageContainer}>
      <style>{`
        .users-table-card {
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(226, 232, 240, 0.85);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.04), 0 4px 6px -2px rgba(15, 23, 42, 0.02);
        }
        .user-select-glow:focus {
          background: #ffffff !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
        }
        .emerald-assign-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 14px -2px rgba(16, 185, 129, 0.35) !important;
        }
        .users-table-row {
          transition: background-color 0.15s ease;
        }
        .users-table-row:hover {
          background-color: rgba(248, 250, 252, 0.8);
        }
      `}</style>

      {/* Header Section */}
      <div style={styles.headerSection}>
        <div style={styles.pillBadge}>
          <Sparkles size={11} color="#059669" />
          <span>USER & ACCESS ALLOCATION</span>
        </div>
        <h2 style={styles.pageTitle}>System Users</h2>
        <p style={styles.pageSubtitle}>
          View registered accounts, verify credentials, and allocate corporate security roles.
        </p>
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
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Syncing user accounts...</p>
        </div>
      ) : users.length === 0 ? (
        <div style={styles.emptyBox}>
          <UsersIcon size={36} color="#cbd5e1" style={{ marginBottom: '10px' }} />
          <h4 style={{ margin: '0 0 6px 0', color: '#334151' }}>No registered users found</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            New registered members will appear here for role allocation.
          </p>
        </div>
      ) : (
        <div className="users-table-card">
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={{ ...styles.th, width: '28%' }}>User Profile</th>
                <th style={{ ...styles.th, width: '32%' }}>Email Address</th>
                <th style={{ ...styles.th, width: '18%' }}>Date of Birth</th>
                <th style={{ ...styles.th, width: '22%', textAlign: 'right' }}>Role Assignment</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => {
                const uId = u.id ?? u.UserID ?? u.user_id ?? (idx + 1);
                const uName = u.name ?? u.Name ?? 'Unnamed';
                const uEmail = u.email ?? u.Email ?? 'N/A';
                const uDob = u.Date_of_birth ? u.Date_of_birth.slice(0, 10) : 'Not specified';
                const initialChar = uName.charAt(0).toUpperCase();

                return (
                  <tr key={uId} className="users-table-row" style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={styles.avatar}>
                          {initialChar}
                        </div>
                        <div>
                          <strong style={{ color: '#0f172a', fontSize: '14px', fontWeight: 700 }}>
                            {uName}
                          </strong>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            User ID #{uId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13.5px' }}>
                        <Mail size={14} color="#94a3b8" />
                        <span>{uEmail}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
                        <Calendar size={14} color="#94a3b8" />
                        <span>{uDob}</span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          value={selectedRoles[uId] || ''}
                          onChange={(e) =>
                            setSelectedRoles({ ...selectedRoles, [uId]: e.target.value })
                          }
                          className="user-select-glow"
                          style={styles.select}
                        >
                          <option value="" style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                            Select Role
                          </option>
                          {roles.map((r) => {
                            const rId = r.id ?? r.RoleID ?? r.role_id;
                            const rName = r.RoleName ?? r.roleName ?? r.name ?? r.Name ?? `Role #${rId}`;
                            return (
                              <option key={rId} value={rId} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
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
    marginBottom: '22px',
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
    lineHeight: 1.5,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px',
  },
  tableHeadRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '14px 20px',
    color: '#475569',
    fontWeight: 700,
    fontSize: '12.5px',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '15px 20px',
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
    boxShadow: '0 4px 10px -2px rgba(16, 185, 129, 0.35)',
    flexShrink: 0,
  },
  select: {
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: 'rgba(248, 250, 252, 0.85)',
    color: '#0f172a',
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
    boxShadow: '0 4px 12px -2px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.2s ease',
  },
  emptyBox: {
    padding: '50px 20px',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: '16px',
    border: '1px dashed #cbd5e1',
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