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
  Sparkles,
  ArrowUpRight
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

  // 2. Update/Rename Organization
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

  // 3. Delete Organization
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

  // 4. Assign User to Organization
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

  // 5. Remove User from Organization
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

  // 6. Transfer Owner
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
    <div style={styles.pageContainer}>
      <style>{`
        .org-card-glass {
          background: rgba(255, 255, 255, 0.86);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(226, 232, 240, 0.85);
          border-radius: 20px;
          padding: 22px 20px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 4px 6px -2px rgba(15, 23, 42, 0.02);
          position: relative;
          overflow: hidden;
        }
        .org-card-glass:hover {
          transform: translateY(-4px);
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: 0 20px 35px -8px rgba(16, 185, 129, 0.18), 0 6px 12px -4px rgba(15, 23, 42, 0.04);
        }
        .org-create-input:focus {
          background: #ffffff !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
        }
        .org-create-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px -4px rgba(16, 185, 129, 0.45) !important;
        }
        .card-action-btn:hover {
          background-color: #f1f5f9 !important;
          transform: scale(1.08);
        }
        .member-action-btn:hover {
          filter: brightness(0.96);
          transform: translateY(-1px);
        }
      `}</style>

      {/* Header Banner */}
      <div style={styles.headerSection}>
        <div>
          <div style={styles.pillBadge}>
            <Sparkles size={11} color="#059669" />
            <span>ORGANIZATIONAL WORKSPACES</span>
          </div>
          <h2 style={styles.pageTitle}>Organizations</h2>
          <p style={styles.pageSubtitle}>
            Manage workspace organizations, controls, and team allocation. Click an organization to view its projects.
          </p>
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleCreate} style={styles.formCard}>
        <div style={styles.formInputWrapper}>
          <Building2 size={18} color="#94a3b8" style={styles.formIcon} />
          <input
            type="text"
            placeholder="Enter new organization name..."
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
            className="org-create-input"
            style={styles.input}
          />
        </div>
        <button 
          type="submit" 
          disabled={creating} 
          className="org-create-btn" 
          style={{
            ...styles.createBtn,
            opacity: creating ? 0.75 : 1,
            cursor: creating ? 'not-allowed' : 'pointer'
          }}
        >
          <Plus size={18} strokeWidth={2.4} />
          <span>{creating ? 'Creating...' : 'Create Workspace'}</span>
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
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Fetching workspaces...</p>
        </div>
      ) : orgs.length === 0 ? (
        <div style={styles.emptyBox}>
          <Building2 size={32} color="#cbd5e1" style={{ marginBottom: '10px' }} />
          <h4 style={{ margin: '0 0 6px 0', color: '#334151' }}>No organizations found</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Create your first workspace using the input field above.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {orgs.map((org, index) => {
            const orgId = Number(org.id ?? org.OrgID ?? org.org_id ?? (index + 1));
            const orgNameStr = org.name ?? org.Name ?? 'Unnamed Org';
            const ownerId = org.owner_id ?? org.OwnerID ?? org.OwnerId ?? 'N/A';

            return (
              <div 
                key={orgId} 
                className="org-card-glass"
                onClick={() => handleCardClick(orgId, orgNameStr)}
              >
                {/* Top: Icon, Details, Controls */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={styles.iconWrapper}>
                        <Building2 size={20} color="#059669" strokeWidth={2.2} />
                      </div>
                      <div>
                        <h4 style={styles.cardHeading}>{orgNameStr}</h4>
                        <span style={styles.idBadge}>ID #{orgId}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleUpdate(orgId, orgNameStr)} 
                        className="card-action-btn"
                        style={styles.actionIconBtn} 
                        title="Rename Organization"
                      >
                        <Edit3 size={15} color="#64748b" />
                      </button>
                      <button 
                        onClick={() => handleDelete(orgId)} 
                        className="card-action-btn"
                        style={styles.actionIconBtn} 
                        title="Delete Organization"
                      >
                        <Trash2 size={15} color="#ef4444" />
                      </button>
                    </div>
                  </div>

                  {/* Owner Row */}
                  <div style={styles.ownerRow}>
                    <Users size={14} color="#64748b" />
                    <span>Owner ID: <strong style={{ color: '#0f172a' }}>{ownerId}</strong></span>
                  </div>

                  {/* Member Allocation Sub-panel */}
                  <div style={styles.memberBox} onClick={(e) => e.stopPropagation()}>
                    <label style={styles.memberLabel}>Manage Members & Ownership</label>
                    <div style={{ marginBottom: '8px' }}>
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
                        className="member-action-btn"
                        style={{ ...styles.memberActionBtn, backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
                        title="Assign user to this Org"
                      >
                        <UserPlus size={13} />
                        <span>Assign</span>
                      </button>

                      <button 
                        type="button" 
                        onClick={() => handleRemoveUser(orgId)} 
                        className="member-action-btn"
                        style={{ ...styles.memberActionBtn, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
                        title="Remove user from this Org"
                      >
                        <UserMinus size={13} />
                        <span>Remove</span>
                      </button>

                      <button 
                        type="button" 
                        onClick={() => handleTransferOwner(orgId)} 
                        className="member-action-btn"
                        style={{ ...styles.memberActionBtn, backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}
                        title="Transfer Ownership to this user"
                      >
                        <UserCheck size={13} />
                        <span>Transfer</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Action Prompt */}
                <div style={styles.footerPrompt}>
                  <span>Explore Projects</span>
                  <div style={styles.arrowCircle}>
                    <ArrowUpRight size={14} color="#059669" strokeWidth={2.4} />
                  </div>
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
    boxSizing: 'border-box',
  },
  formInputWrapper: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  formIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    color: '#0f172a',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  createBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    flexShrink: 0,
    boxShadow: '0 6px 16px -2px rgba(16, 185, 129, 0.35)',
    transition: 'all 0.2s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
    gap: '20px',
  },
  iconWrapper: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardHeading: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.01em',
  },
  idBadge: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#94a3b8',
  },
  actionIconBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  ownerRow: {
    margin: '14px 0',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '10px',
    fontSize: '12.5px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
  },
  memberBox: {
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  memberLabel: {
    display: 'block',
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: '#64748b',
    marginBottom: '8px',
  },
  memberInput: {
    width: '100%',
    padding: '9px 12px',
    fontSize: '13px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
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
    padding: '7px 8px',
    borderRadius: '8px',
    fontSize: '11.5px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  footerPrompt: {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px dashed #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12.5px',
    fontWeight: 700,
    color: '#059669',
  },
  arrowCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fee2e2',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '13.5px',
  },
};