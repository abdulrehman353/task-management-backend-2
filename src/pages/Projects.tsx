import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { FolderKanban, Plus, Calendar, AlertCircle, Trash2, ChevronRight, ArrowLeft, Building2 } from 'lucide-react';

interface Project {
  id?: number;
  ProjectID?: number;
  Name?: string;
  name?: string;
  Description?: string;
  description?: string;
  OrgID?: number;
  org_id?: number;
  OrganizationID?: number;
  organization_id?: number;
  createdAt?: string;
}

export default function Projects() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // URL Query Params ya Route State se Org ID pakrein
  const orgIdParam = searchParams.get('orgId') || location.state?.orgId;
  const orgNameParam = searchParams.get('orgName') || location.state?.orgName;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    org_id: orgIdParam ? String(orgIdParam) : '',
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      // Agar orgIdParam ho to backend se bhi query filter bhejte hain
      const endpoint = orgIdParam ? `/projects?OrgID=${orgIdParam}&org_id=${orgIdParam}` : '/projects';
      const res = await axiosClient.get(endpoint);
      const data = Array.isArray(res.data) ? res.data : res.data.projects || [];
      setProjects(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (orgIdParam) {
      setFormData((prev) => ({ ...prev, org_id: String(orgIdParam) }));
    }
  }, [orgIdParam]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetOrg = formData.org_id ? Number(formData.org_id) : (orgIdParam ? Number(orgIdParam) : undefined);
      await axiosClient.post('/projects', {
        Name: formData.name,
        name: formData.name,
        Description: formData.description,
        description: formData.description,
        OrgID: targetOrg,
        org_id: targetOrg,
        OrganizationID: targetOrg,
      });
      setShowModal(false);
      setFormData({ name: '', description: '', org_id: orgIdParam ? String(orgIdParam) : '' });
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axiosClient.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  // Reassign Project to Another Organization
  const handleReassignOrg = async (projectId: number, currentOrgId?: number) => {
    const input = window.prompt(
      `Enter Target Organization ID to assign Project #${projectId} (e.g. 1, 2, 3):`,
      String(currentOrgId || 1)
    );
    if (!input || input.trim() === '') return;

    const newOrgId = Number(input.trim());
    if (isNaN(newOrgId)) {
      alert('Please enter a valid numeric Organization ID.');
      return;
    }

    try {
      await axiosClient.put(`/projects/${projectId}`, {
        OrgID: newOrgId,
        org_id: newOrgId,
        OrganizationID: newOrgId,
      });
      alert(`Project #${projectId} assigned to Organization #${newOrgId} successfully!`);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign project to organization');
    }
  };

  // Strict Filter: Agar Organization select ki hai to sirf usi Org ke projects dikhao
  const displayedProjects = orgIdParam
    ? projects.filter((proj) => {
        const pOrg = proj.OrgID ?? proj.org_id ?? proj.OrganizationID ?? proj.organization_id;
        return Number(pOrg) === Number(orgIdParam);
      })
    : projects;

  const handleProjectClick = (pId: number, pName: string) => {
    navigate(`/dashboard/tickets?projectId=${pId}&projectName=${encodeURIComponent(pName)}`, {
      state: { projectId: pId, projectName: pName },
    });
  };

  return (
    <div>
      {/* Breadcrumb Header jab user Org par click karke aye */}
      {orgIdParam && (
        <div style={styles.breadcrumbBar}>
          <button onClick={() => navigate('/dashboard/organizations')} style={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>All Organizations</span>
          </button>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>
            {orgNameParam ? orgNameParam : `Organization #${orgIdParam}`}
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>(Filtered Projects)</span>
        </div>
      )}

      <div style={styles.topBar}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a' }}>
            {orgNameParam ? `${orgNameParam} Projects` : (orgIdParam ? `Org #${orgIdParam} Projects` : 'All Projects')}
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            {orgIdParam 
              ? 'Showing only projects assigned to this organization.' 
              : 'Track and manage all team projects across organizations.'}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={styles.primaryBtn}>
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading projects...</p>
      ) : displayedProjects.length === 0 ? (
        <div style={styles.emptyBox}>
          {orgIdParam
            ? `No projects assigned to "${orgNameParam || `Organization #${orgIdParam}`}". Click "New Project" to add one for this organization.`
            : 'No projects found. Click "New Project" to add your first one.'}
        </div>
      ) : (
        <div style={styles.grid}>
          {displayedProjects.map((proj) => {
            const pId = proj.id || proj.ProjectID || 0;
            const pName = proj.Name || proj.name || 'Untitled Project';
            const pDesc = proj.Description || proj.description || 'No description provided.';
            const pOrg = proj.OrgID ?? proj.org_id ?? proj.OrganizationID ?? proj.organization_id;

            return (
              <div 
                key={pId} 
                style={styles.card}
                onClick={() => handleProjectClick(pId, pName)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={styles.iconBox}>
                        <FolderKanban size={22} color="#2563eb" />
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1e293b' }}>{pName}</h3>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
                          <span>ID: #{pId}</span>
                          {pOrg && <span>• Org ID: #{pOrg}</span>}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons: Assign Org & Delete */}
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReassignOrg(pId, pOrg);
                        }} 
                        style={styles.assignOrgBtn} 
                        title="Assign / Move to another Organization"
                      >
                        <Building2 size={15} />
                        <span style={{ fontSize: '11px', fontWeight: 600 }}>Org</span>
                      </button>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(pId);
                        }} 
                        style={styles.deleteBtn} 
                        title="Delete Project"
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </div>
                  </div>

                  <p style={styles.desc}>{pDesc}</p>
                </div>

                <div>
                  <div style={styles.cardFooter}>
                    <span style={styles.dateTag}>
                      <Calendar size={14} />
                      <span>Project Active</span>
                    </span>
                  </div>

                  <div style={styles.footerPrompt}>
                    <span>View Tickets</span>
                    <ChevronRight size={15} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Create New Project</h3>
            <form onSubmit={handleCreate} style={styles.form}>
              <div>
                <label style={styles.label}>Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile App Redesign"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Organization ID</label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  value={formData.org_id}
                  onChange={(e) => setFormData({ ...formData, org_id: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Short brief about this project..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  breadcrumbBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    padding: '10px 14px',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: 600,
    padding: 0,
    fontSize: '13px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  iconBox: {
    backgroundColor: '#eff6ff',
    padding: '10px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desc: {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: '16px 0',
  },
  cardFooter: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerPrompt: {
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12px',
    fontWeight: 600,
    color: '#2563eb',
  },
  dateTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#94a3b8',
  },
  assignOrgBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#334151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px',
  },
  cancelBtn: {
    padding: '8px 14px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#475569',
  },
  submitBtn: {
    padding: '8px 16px',
    background: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
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