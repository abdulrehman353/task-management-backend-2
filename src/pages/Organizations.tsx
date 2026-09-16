import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
  Building2, 
  Plus, 
  Users, 
  ShieldAlert, 
  Trash2, 
  Edit3, 
  UserPlus, 
  UserMinus, 
  UserCheck,
  ChevronRight
} from 'lucide-react';

interface Organization {
  id?: number;
  OrgID?: number;
  org_id?: number;
  Name?: string;
  name?: string;
  OwnerID?: number;
  owner_id?: number;
  OwnerId?: number;
}

export default function Organizations() {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [orgName, setOrgName] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Member Management Input States: { [orgId]: userId }
  const [memberInputs, setMemberInputs] = useState<{ [orgId: number]: string }>({});

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/orgs');
      setOrgs(Array.isArray(res.data) ? res.data : res.data.organizations || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch organizations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  // 1. Create Organization
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    try {
      setCreating(true);
      await axiosClient.post('/orgs', { Name: orgName, name: orgName });
      setOrgName('');
      fetchOrgs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  // 2. Update/Rename Organization (PUT /api/orgs/{id})
  const handleUpdate = async (orgId: number, currentName: string) => {
    const updatedName = window.prompt('Enter new organization name:', currentName);
    if (!updatedName || updatedName.trim() === '' || updatedName === currentName) return;

    try {
      await axiosClient.put(`/orgs/${orgId}`, { Name: updatedName, name: updatedName });
      fetchOrgs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update organization');
    }
  };

  // 3. Delete Organization (DELETE /api/orgs/{id})
  const handleDelete = async (orgId: number) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) return;
    try {
      await axiosClient.delete(`/orgs/${orgId}`);
      fetchOrgs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete organization');
    }
  };

  // Helper for Member actions input
  const handleInputChange = (orgId: number, val: string) => {
    setMemberInputs((prev) => ({ ...prev, [orgId]: val }));
  };

  // 4. Assign User to Organization (POST /api/orgs/assign-user)
  const handleAssignUser = async (orgId: number) => {
    const userId = memberInputs[orgId];
    if (!userId) return alert('Please enter a User ID first.');

    try {
      await axiosClient.post('/orgs/assign-user', {
        OrgID: Number(orgId),
        org_id: Number(orgId),
        UserID: Number(userId),
        userId: Number(userId),
      });
      alert(`User #${userId} assigned to Organization #${orgId} successfully!`);
      handleInputChange(orgId, '');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign user');
    }
  };

  // 5. Remove User from Organization (POST /api/orgs/remove-user)
  const handleRemoveUser = async (orgId: number) => {
    const userId = memberInputs[orgId];
    if (!userId) return alert('Please enter a User ID first.');

    try {
      await axiosClient.post('/orgs/remove-user', {
        OrgID: Number(orgId),
        org_id: Number(orgId),
        UserID: Number(userId),
        userId: Number(userId),
      });
      alert(`User #${userId} removed from Organization #${orgId}!`);
      handleInputChange(orgId, '');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove user');
    }
  };

  // 6. Transfer Owner (POST /api/orgs/transfer-owner)
  const handleTransferOwner = async (orgId: number) => {
    const newOwnerId = memberInputs[orgId];
    if (!newOwnerId) return alert('Please enter the new Owner User ID.');

    if (!window.confirm(`Transfer organization #${orgId} ownership to user #${newOwnerId}?`)) return;

    try {
      await axiosClient.post('/orgs/transfer-owner', {
        OrgID: Number(orgId),
        org_id: Number(orgId),
        NewOwnerID: Number(newOwnerId),
        newOwnerId: Number(newOwnerId),
      });
      alert('Ownership transferred successfully!');
      handleInputChange(orgId, '');
      fetchOrgs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to transfer ownership');
    }
  };

  // Click on Card -> Navigate to Projects
  const handleCardClick = (orgId: number, orgNameStr: string) => {
    navigate(`/dashboard/projects?orgId=${orgId}&orgName=${encodeURIComponent(orgNameStr)}`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a' }}>Organizations</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            Manage workspace organizations, controls, and team allocation. Click an organization to view its projects.
          </p>
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleCreate} style={styles.formCard}>
        <input
          type="text"
          placeholder="New Organization Name..."
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" disabled={creating} style={styles.createBtn}>
          <Plus size={18} />
          <span>{creating ? 'Creating...' : 'Create Organization'}</span>
        </button>
      </form>

      {error && (
        <div style={styles.errorBanner}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Organizations Grid */}
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading organizations...</p>
      ) : orgs.length === 0 ? (
        <div style={styles.emptyBox}>No organizations found. Create one above to get started.</div>
      ) : (
        <div style={styles.grid}>
          {orgs.map((org, index) => {
            const orgId = Number(org.id ?? org.OrgID ?? org.org_id ?? (index + 1));
            const orgNameStr = org.name ?? org.Name ?? 'Unnamed Org';
            const ownerId = org.owner_id ?? org.OwnerID ?? org.OwnerId ?? 'N/A';

            return (
              <div 
                key={orgId} 
                style={styles.orgCard}
                onClick={() => handleCardClick(orgId, orgNameStr)}
              >
                {/* Card Top: Name, ID, Edit, Delete */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={styles.iconWrapper}>
                      <Building2 size={22} color="#2563eb" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#1e293b' }}>{orgNameStr}</h4>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>ID: #{orgId}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleUpdate(orgId, orgNameStr)} 
                      style={styles.actionIconBtn} 
                      title="Rename Organization"
                    >
                      <Edit3 size={15} color="#64748b" />
                    </button>
                    <button 
                      onClick={() => handleDelete(orgId)} 
                      style={styles.actionIconBtn} 
                      title="Delete Organization"
                    >
                      <Trash2 size={15} color="#ef4444" />
                    </button>
                  </div>
                </div>

                {/* Owner Tag */}
                <div style={styles.ownerRow}>
                  <Users size={15} />
                  <span>Owner ID: <strong>{ownerId}</strong></span>
                </div>

                {/* Member Allocation Section */}
                <div style={styles.memberBox} onClick={(e) => e.stopPropagation()}>
                  <label style={styles.memberLabel}>Manage Members & Ownership</label>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <input
                      type="number"
                      placeholder="Target User ID..."
                      value={memberInputs[orgId] || ''}
                      onChange={(e) => handleInputChange(orgId, e.target.value)}
                      style={styles.memberInput}
                    />
                  </div>

                  <div style={styles.memberButtons}>
                    <button 
                      type="button" 
                      onClick={() => handleAssignUser(orgId)} 
                      style={{ ...styles.memberActionBtn, backgroundColor: '#eff6ff', color: '#2563eb' }}
                      title="Assign user to this Org"
                    >
                      <UserPlus size={13} />
                      <span>Assign</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={() => handleRemoveUser(orgId)} 
                      style={{ ...styles.memberActionBtn, backgroundColor: '#fef2f2', color: '#dc2626' }}
                      title="Remove user from this Org"
                    >
                      <UserMinus size={13} />
                      <span>Remove</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={() => handleTransferOwner(orgId)} 
                      style={{ ...styles.memberActionBtn, backgroundColor: '#f0fdf4', color: '#16a34a' }}
                      title="Transfer Ownership to this user"
                    >
                      <UserCheck size={13} />
                      <span>Transfer</span>
                    </button>
                  </div>
                </div>

                {/* View Projects Prompt Bar */}
                <div style={styles.footerPrompt}>
                  <span>View Projects</span>
                  <ChevronRight size={15} />
                </div>
              </div>
            );
          })}
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
    boxSizing: 'border-box',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    boxSizing: 'border-box',
  },
  createBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },
  orgCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  iconWrapper: {
    backgroundColor: '#eff6ff',
    padding: '10px',
    borderRadius: '6px',
  },
  actionIconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
  },
  ownerRow: {
    margin: '14px 0',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '10px',
    fontSize: '13px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  memberBox: {
    backgroundColor: '#f8fafc',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  memberLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#64748b',
    marginBottom: '8px',
  },
  memberInput: {
    width: '100%',
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    boxSizing: 'border-box',
  },
  memberButtons: {
    display: 'flex',
    gap: '6px',
  },
  memberActionBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    border: 'none',
    padding: '6px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  emptyBox: {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
    color: '#94a3b8',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  footerPrompt: {
    marginTop: '12px',
    paddingTop: '10px',
    borderTop: '1px dashed #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12px',
    fontWeight: 600,
    color: '#2563eb',
  },
};