import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Shield, Plus, Trash2, AlertCircle } from 'lucide-react';

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
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>Roles Management</h2>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
          Define system access tiers and administrative roles.
        </p>
      </div>

      {/* Add Role Form */}
      <form onSubmit={handleCreate} style={styles.formCard}>
        <input
          type="text"
          placeholder="Role Title (e.g. Project Manager)..."
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Role Description..."
          value={roleDesc}
          onChange={(e) => setRoleDesc(e.target.value)}
          style={{ ...styles.input, flex: 2 }}
        />
        <button type="submit" disabled={creating} style={styles.primaryBtn}>
          <Plus size={16} />
          <span>{creating ? 'Adding...' : 'Add Role'}</span>
        </button>
      </form>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Table Layout */}
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading roles...</p>
      ) : roles.length === 0 ? (
        <div style={styles.emptyBox}>No roles defined. Add one above.</div>
      ) : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={{ ...styles.th, width: '25%' }}>Role</th>
                <th style={{ ...styles.th, width: '60%' }}>Description</th>
                <th style={{ ...styles.th, width: '15%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r, idx) => {
                const rId = r.RoleID ?? r.id ?? r.role_id ?? (idx + 1);
                const rName = r.RoleName ?? r.name ?? 'Unnamed Role';
                const rDesc = r.Description ?? r.description ?? 'No description specified.';

                return (
                  <tr key={rId} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={styles.avatar}>
                          <Shield size={16} color="#2563eb" />
                        </div>
                        <div>
                          <strong style={{ color: '#1e293b' }}>{rName}</strong>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: #{rId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: '#64748b', fontSize: '13px' }}>{rDesc}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(rId)}
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
  formCard: {
    display: 'flex',
    gap: '12px',
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '24px',
  },
  input: {
    flex: 1,
    padding: '9px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '9px 16px',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13px',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden',
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
    padding: '12px 16px',
    color: '#475569',
    fontWeight: 600,
    fontSize: '13px',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px 16px',
    verticalAlign: 'middle',
  },
  avatar: {
    backgroundColor: '#eff6ff',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
  },
  emptyBox: {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
    color: '#94a3b8',
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