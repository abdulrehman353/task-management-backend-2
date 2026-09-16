import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { KeyRound, Plus, Trash2, AlertCircle, Link2 } from 'lucide-react';

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
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>Permissions Management</h2>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
          Create system capabilities and bind them to specific access roles.
        </p>
      </div>

      {/* Top Action Row: Create Permission & Assign to Role */}
      <div style={styles.topCardsGrid}>
        <form onSubmit={handleCreate} style={styles.cardBox}>
          <label style={styles.cardHeaderTitle}>Create New Permission</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="e.g. ticket:delete..."
              value={permName}
              onChange={(e) => setPermName(e.target.value)}
              required
              style={styles.input}
            />
            <button type="submit" disabled={creating} style={styles.primaryBtn}>
              <Plus size={16} />
              <span>{creating ? 'Creating...' : 'Create'}</span>
            </button>
          </div>
        </form>

        <form onSubmit={handleAssignToRole} style={styles.cardBox}>
          <label style={styles.cardHeaderTitle}>Assign Permission to Role</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={styles.select}
            >
              <option value="">Select Role</option>
              {roles.map((r) => {
                const id = r.RoleID ?? r.id ?? r.role_id;
                return (
                  <option key={id} value={id}>
                    {r.RoleName ?? r.name}
                  </option>
                );
              })}
            </select>

            <select
              value={selectedPerm}
              onChange={(e) => setSelectedPerm(e.target.value)}
              style={styles.select}
            >
              <option value="">Select Permission</option>
              {permissions.map((p) => {
                const id = p.PermissionID ?? p.id ?? p.permission_id;
                return (
                  <option key={id} value={id}>
                    {p.PermissionName ?? p.name}
                  </option>
                );
              })}
            </select>

            <button type="submit" disabled={binding} style={styles.assignBtn}>
              <Link2 size={16} />
              <span>{binding ? 'Assigning...' : 'Assign'}</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Permissions Table */}
      <h3 style={{ margin: '20px 0 10px 0', fontSize: '16px', color: '#1e293b' }}>
        Registered Permissions ({permissions.length})
      </h3>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading permissions...</p>
      ) : permissions.length === 0 ? (
        <div style={styles.emptyBox}>No permissions found. Create one above.</div>
      ) : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={{ ...styles.th, width: '15%' }}>Permission ID</th>
                <th style={{ ...styles.th, width: '70%' }}>Capability Name</th>
                <th style={{ ...styles.th, width: '15%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p, idx) => {
                const pId = p.PermissionID ?? p.id ?? p.permission_id ?? (idx + 1);
                const pName = p.PermissionName ?? p.name ?? 'unnamed';

                return (
                  <tr key={pId} style={styles.tableRow}>
                    <td style={styles.td}>
                      <span style={styles.idBadge}>#{pId}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={styles.avatar}>
                          <KeyRound size={15} color="#2563eb" />
                        </div>
                        <code style={styles.permCode}>{pName}</code>
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(pId)}
                        style={styles.deleteBtn}
                        title="Delete Permission"
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
  topCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  cardBox: {
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  cardHeaderTitle: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: '10px',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  select: {
    flex: 1,
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    outline: 'none',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13px',
  },
  assignBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    padding: '8px 14px',
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
    padding: '12px 16px',
    verticalAlign: 'middle',
  },
  idBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 600,
  },
  avatar: {
    backgroundColor: '#eff6ff',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permCode: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#0f172a',
    fontFamily: 'monospace',
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