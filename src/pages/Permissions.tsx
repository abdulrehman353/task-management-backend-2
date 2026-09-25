import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { 
  KeyRound, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Link2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface PermissionItem {
  PermissionID?: number;
  id?: number;
  permission_id?: number;
  PermissionName?: string;
  name?: string;
}

interface RoleItem {
  RoleID?: number;
  id?: number;
  role_id?: number;
  RoleName?: string;
  name?: string;
}

export default function Permissions() {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [permName, setPermName] = useState('');
  const [creating, setCreating] = useState(false);

  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPerm, setSelectedPerm] = useState('');
  const [binding, setBinding] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [permRes, rolesRes] = await Promise.all([
        axiosClient.get('/permissions'),
        axiosClient.get('/roles'),
      ]);
      setPermissions(Array.isArray(permRes.data) ? permRes.data : permRes.data.permissions || []);
      setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : rolesRes.data.roles || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load permissions data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permName.trim()) return;
    try {
      setCreating(true);
      await axiosClient.post('/permissions', { PermissionName: permName.trim() });
      setPermName('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create permission');
    } finally {
      setCreating(false);
    }
  };

  const handleAssignToRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !selectedPerm) {
      alert('Please select both a role and a permission');
      return;
    }
    try {
      setBinding(true);
      await axiosClient.post('/roles/assign-permission', {
        RoleID: Number(selectedRole),
        PermissionID: Number(selectedPerm),
      });
      alert('Permission mapped to role successfully!');
      setSelectedRole('');
      setSelectedPerm('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign permission');
    } finally {
      setBinding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this permission?')) return;
    try {
      await axiosClient.delete(`/permissions/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete permission');
    }
  };

  return (
    <div style={styles.pageContainer}>
      <style>{`
        .perm-card-glass {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
        }
        .perm-table-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
        }
        .perm-input-glow:focus {
          background: rgba(2, 6, 23, 0.85) !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
        }
        .emerald-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px -4px rgba(16, 185, 129, 0.5) !important;
        }
        .slate-bind-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.15);
        }
        .perm-table-row {
          transition: background-color 0.15s ease;
        }
        .perm-table-row:hover {
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
          <span>CAPABILITY MAPPING</span>
        </div>
        <h2 style={styles.pageTitle}>Permissions Management</h2>
        <p style={styles.pageSubtitle}>
          Define discrete system capabilities and bind them to specific access roles.
        </p>
      </div>

      {/* Dual Action Grid: Create & Map */}
      <div style={styles.topCardsGrid}>
        <form onSubmit={handleCreate} className="perm-card-glass">
          <div style={styles.cardHeader}>
            <div style={styles.cardIconBox}>
              <Plus size={16} color="#10b981" strokeWidth={2.4} />
            </div>
            <label style={styles.cardHeaderTitle}>Create New Permission</label>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="e.g. ticket:delete, project:export..."
              value={permName}
              onChange={(e) => setPermName(e.target.value)}
              required
              className="perm-input-glow"
              style={styles.input}
            />
            <button 
              type="submit" 
              disabled={creating} 
              className="emerald-submit-btn" 
              style={{
                ...styles.primaryBtn,
                opacity: creating ? 0.75 : 1,
                cursor: creating ? 'not-allowed' : 'pointer'
              }}
            >
              <Plus size={16} strokeWidth={2.4} />
              <span>{creating ? 'Adding...' : 'Create'}</span>
            </button>
          </div>
        </form>

        <form onSubmit={handleAssignToRole} className="perm-card-glass">
          <div style={styles.cardHeader}>
            <div style={styles.cardIconBox}>
              <Link2 size={16} color="#10b981" strokeWidth={2.4} />
            </div>
            <label style={styles.cardHeaderTitle}>Bind Permission to Role</label>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="perm-input-glow"
              style={styles.select}
            >
              <option value="" style={styles.optionDark}>Select Target Role</option>
              {roles.map((r) => {
                const id = r.RoleID ?? r.id ?? r.role_id;
                return (
                  <option key={id} value={id} style={styles.optionDark}>
                    {r.RoleName ?? r.name}
                  </option>
                );
              })}
            </select>

            <select
              value={selectedPerm}
              onChange={(e) => setSelectedPerm(e.target.value)}
              className="perm-input-glow"
              style={styles.select}
            >
              <option value="" style={styles.optionDark}>Select Permission</option>
              {permissions.map((p) => {
                const id = p.PermissionID ?? p.id ?? p.permission_id;
                return (
                  <option key={id} value={id} style={styles.optionDark}>
                    {p.PermissionName ?? p.name}
                  </option>
                );
              })}
            </select>

            <button 
              type="submit" 
              disabled={binding} 
              className="slate-bind-btn" 
              style={{
                ...styles.assignBtn,
                opacity: binding ? 0.75 : 1,
                cursor: binding ? 'not-allowed' : 'pointer'
              }}
            >
              <Link2 size={15} />
              <span>{binding ? 'Binding...' : 'Map'}</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Permissions Table Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '26px 0 12px 0' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
          Registered Capabilities
        </h3>
        <span style={styles.countTag}>{permissions.length} Active Rules</span>
      </div>

      {loading ? (
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Syncing permissions data...</p>
        </div>
      ) : permissions.length === 0 ? (
        <div style={styles.emptyBox}>
          <ShieldCheck size={36} color="#64748b" style={{ marginBottom: '10px' }} />
          <h4 style={{ margin: '0 0 6px 0', color: '#f1f5f9' }}>No permissions registered</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            Declare your first system permission using the input panel above.
          </p>
        </div>
      ) : (
        <div className="perm-table-card">
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={{ ...styles.th, width: '16%' }}>Rule ID</th>
                <th style={{ ...styles.th, width: '70%' }}>Capability Name</th>
                <th style={{ ...styles.th, width: '14%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p, idx) => {
                const pId = p.PermissionID ?? p.id ?? p.permission_id ?? (idx + 1);
                const pName = p.PermissionName ?? p.name ?? 'unnamed';

                return (
                  <tr key={pId} className="perm-table-row" style={styles.tableRow}>
                    <td style={styles.td}>
                      <span style={styles.idBadge}>#{pId}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={styles.avatar}>
                          <KeyRound size={15} color="#10b981" strokeWidth={2.2} />
                        </div>
                        <code style={styles.permCode}>{pName}</code>
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(pId)}
                        className="del-action-hover"
                        style={styles.deleteBtn}
                        title="Delete Permission"
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
  topCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '18px',
    marginBottom: '20px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
  },
  cardIconBox: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: '13.5px',
    fontWeight: 700,
    color: '#ffffff',
  },
  input: {
    flex: 1,
    padding: '11px 14px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '13.5px',
    outline: 'none',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    color: '#ffffff',
    boxSizing: 'border-box',
    transition: 'all 0.15s ease',
  },
  select: {
    flex: 1,
    minWidth: '140px',
    padding: '11px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '13px',
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    color: '#ffffff',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  optionDark: {
    backgroundColor: '#0f172a',
    color: '#ffffff'
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '11px 18px',
    borderRadius: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13px',
    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
    transition: 'all 0.2s ease',
  },
  assignBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#60a5fa',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    padding: '11px 18px',
    borderRadius: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s ease',
  },
  countTag: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#34d399',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    padding: '3px 10px',
    borderRadius: '12px',
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
    padding: '14px 20px',
    verticalAlign: 'middle',
  },
  idBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 700,
  },
  avatar: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  permCode: {
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#34d399',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontWeight: 600,
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