import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Users as UsersIcon, Shield, Mail, Calendar, AlertCircle } from 'lucide-react';

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
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>System Users</h2>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
          View registered team members and allocate security roles.
        </p>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading registered users...</p>
      ) : users.length === 0 ? (
        <div style={styles.emptyBox}>No users found.</div>
      ) : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Date of Birth</th>
                <th style={styles.th}>Assign Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => {
                const uId = u.id ?? u.UserID ?? u.user_id ?? (idx + 1);
                const uName = u.name ?? u.Name ?? 'Unnamed';
                const uEmail = u.email ?? u.Email ?? 'N/A';
                const uDob = u.Date_of_birth ? u.Date_of_birth.slice(0, 10) : 'Not specified';

                return (
                  <tr key={uId} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={styles.avatar}>
                          <UsersIcon size={16} color="#2563eb" />
                        </div>
                        <div>
                          <strong style={{ color: '#1e293b' }}>{uName}</strong>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: #{uId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                        <Mail size={14} />
                        <span>{uEmail}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                        <Calendar size={14} />
                        <span>{uDob}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          value={selectedRoles[uId] || ''}
                          onChange={(e) =>
                            setSelectedRoles({ ...selectedRoles, [uId]: e.target.value })
                          }
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
                        <button onClick={() => handleRoleAssign(uId)} style={styles.assignBtn}>
                          <Shield size={14} />
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
  select: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '13px',
    outline: 'none',
  },
  assignBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 500,
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