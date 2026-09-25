import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { 
  Shield, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface RoleItem {
  RoleID?: number;
  id?: number;
  role_id?: number;
  RoleName?: string;
  name?: string;
  Description?: string;
  description?: string;
}

export default function Roles() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [roleTitle, setRoleTitle] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get('/roles');
      setRoles(Array.isArray(res.data) ? res.data : res.data.roles || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle.trim()) return;
    try {
      setCreating(true);
      await axiosClient.post('/roles', {
        RoleName: roleTitle,
        Description: roleDesc,
      });
      setRoleTitle('');
      setRoleDesc('');
      fetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create role');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await axiosClient.delete(`/roles/${id}`);
      fetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete role');
    }
  };

  return (
    <div style={styles.pageContainer}>
      <style>{`
        .role-table-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
        }
        .role-input-glow:focus {
          background: rgba(2, 6, 23, 0.85) !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
        }
        .emerald-add-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px -4px rgba(16, 185, 129, 0.5) !important;
        }
        .role-table-row {
          transition: background-color 0.15s ease;
        }
        .role-table-row:hover {
          background-color: rgba(255, 255, 255, 0.03);
        }
        .del-action-hover:hover {
          background-color: rgba(239, 68, 68, 0.15) !important;
          transform: scale(1.08);
        }
      `}</style>

      {/* Header Banner */}
      <div style={styles.headerSection}>
        <div style={styles.pillBadge}>
          <Sparkles size={11} color="#34d399" />
          <span>SECURITY & ACCESS POLICIES</span>
        </div>
        <h2 style={styles.pageTitle}>Roles Management</h2>
        <p style={styles.pageSubtitle}>
          Define system access tiers, assign administrative permissions, and configure RBAC roles.
        </p>
      </div>

      {/* Add Role Form */}
      <form onSubmit={handleCreate} style={styles.formCard}>
        <div style={styles.inputWrapper}>
          <Shield size={16} color="#64748b" style={styles.fieldIcon} />
          <input
            type="text"
            placeholder="Role Title (e.g. Project Manager)..."
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            required
            className="role-input-glow"
            style={styles.input}
          />
        </div>

        <div style={{ ...styles.inputWrapper, flex: 1.8 }}>
          <input
            type="text"
            placeholder="Role Description (e.g. Can manage project tasks)..."
            value={roleDesc}
            onChange={(e) => setRoleDesc(e.target.value)}
            className="role-input-glow"
            style={{ ...styles.input, paddingLeft: '14px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={creating} 
          className="emerald-add-btn" 
          style={{
            ...styles.primaryBtn,
            opacity: creating ? 0.75 : 1,
            cursor: creating ? 'not-allowed' : 'pointer'
          }}
        >
          <Plus size={16} strokeWidth={2.4} />
          <span>{creating ? 'Adding...' : 'Add Role'}</span>
        </button>
      </form>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Table Layout */}
      {loading ? (
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Syncing security roles...</p>
        </div>
      ) : roles.length === 0 ? (
        <div style={styles.emptyBox}>
          <ShieldCheck size={36} color="#64748b" style={{ marginBottom: '10px' }} />
          <h4 style={{ margin: '0 0 6px 0', color: '#f1f5f9' }}>No roles defined yet</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            Add your initial RBAC role using the form above.
          </p>
        </div>
      ) : (
        <div className="role-table-card">
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={{ ...styles.th, width: '28%' }}>Role</th>
                <th style={{ ...styles.th, width: '58%' }}>Description</th>
                <th style={{ ...styles.th, width: '14%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r, idx) => {
                const rId = r.RoleID ?? r.id ?? r.role_id ?? (idx + 1);
                const rName = r.RoleName ?? r.name ?? 'Unnamed Role';
                const rDesc = r.Description ?? r.description ?? 'No description specified.';

                return (
                  <tr key={rId} className="role-table-row" style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={styles.avatar}>
                          <Shield size={16} color="#10b981" strokeWidth={2.2} />
                        </div>
                        <div>
                          <strong style={{ color: '#ffffff', fontSize: '14px', fontWeight: 700 }}>
                            {rName}
                          </strong>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            Role ID #{rId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.45 }}>
                        {rDesc}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(rId)}
                        className="del-action-hover"
                        style={styles.deleteBtn}
                        title="Delete Role"
                      >
                        <Trash2 size={16} color="#f87171" />
                      </button>
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
  formCard: {
    display: 'flex',
    gap: '12px',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '14px 16px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
    marginBottom: '26px',
    flexWrap: 'wrap',
  },
  inputWrapper: {
    position: 'relative',
    flex: 1,
    minWidth: '220px',
    display: 'flex',
    alignItems: 'center',
  },
  fieldIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '11px 14px 11px 36px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '13.5px',
    outline: 'none',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    color: '#ffffff',
    boxSizing: 'border-box',
    transition: 'all 0.15s ease',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '11px 20px',
    borderRadius: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13.5px',
    flexShrink: 0,
    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
    transition: 'all 0.2s ease',
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
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
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
};