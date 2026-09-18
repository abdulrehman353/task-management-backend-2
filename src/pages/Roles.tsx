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
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(226, 232, 240, 0.85);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.04), 0 4px 6px -2px rgba(15, 23, 42, 0.02);
        }
        .role-input-glow:focus {
          background: #ffffff !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
        }
        .emerald-add-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 16px -3px rgba(16, 185, 129, 0.38) !important;
        }
        .role-table-row {
          transition: background-color 0.15s ease;
        }
        .role-table-row:hover {
          background-color: rgba(248, 250, 252, 0.8);
        }
        .del-action-hover:hover {
          background-color: #fef2f2 !important;
          transform: scale(1.08);
        }
      `}</style>

      {/* Header Banner */}
      <div style={styles.headerSection}>
        <div style={styles.pillBadge}>
          <Sparkles size={11} color="#059669" />
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
          <Shield size={16} color="#94a3b8" style={styles.fieldIcon} />
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
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Syncing security roles...</p>
        </div>
      ) : roles.length === 0 ? (
        <div style={styles.emptyBox}>
          <ShieldCheck size={36} color="#cbd5e1" style={{ marginBottom: '10px' }} />
          <h4 style={{ margin: '0 0 6px 0', color: '#334151' }}>No roles defined yet</h4>
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
                          <Shield size={16} color="#059669" strokeWidth={2.2} />
                        </div>
                        <div>
                          <strong style={{ color: '#0f172a', fontSize: '14px', fontWeight: 700 }}>
                            {rName}
                          </strong>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            Role ID #{rId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: '#64748b', fontSize: '13.5px', lineHeight: 1.45 }}>
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
                        <Trash2 size={16} color="#ef4444" />
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
  formCard: {
    display: 'flex',
    gap: '12px',
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    padding: '14px 16px',
    borderRadius: '16px',
    border: '1px solid rgba(226, 232, 240, 0.85)',
    boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.04)',
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
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '13.5px',
    outline: 'none',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    color: '#0f172a',
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
    boxShadow: '0 6px 16px -2px rgba(16, 185, 129, 0.35)',
    transition: 'all 0.2s ease',
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
    padding: '16px 20px',
    verticalAlign: 'middle',
  },
  avatar: {
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
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