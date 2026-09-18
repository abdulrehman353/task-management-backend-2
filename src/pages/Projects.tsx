import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
  FolderKanban, 
  Plus, 
  Calendar, 
  AlertCircle, 
  Trash2, 
  ArrowLeft, 
  Building2,
  Sparkles,
  ArrowUpRight,
  Layers,
  X
} from 'lucide-react';

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
    <div style={styles.pageContainer}>
      <style>{`
        .proj-card-glass {
          background: rgba(255, 255, 255, 0.86);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(226, 232, 240, 0.85);
          border-radius: 20px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 4px 6px -2px rgba(15, 23, 42, 0.02);
        }
        .proj-card-glass:hover {
          transform: translateY(-4px);
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: 0 20px 35px -8px rgba(16, 185, 129, 0.18), 0 6px 12px -4px rgba(15, 23, 42, 0.04);
        }
        .proj-modal-input:focus {
          background: #ffffff !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
        }
        .emerald-action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 16px -3px rgba(16, 185, 129, 0.35) !important;
        }
        .icon-action-hover:hover {
          background-color: #f1f5f9 !important;
          transform: scale(1.06);
        }
      `}</style>

      {/* Breadcrumb Header jab user Org par click karke aye */}
      {orgIdParam && (
        <div style={styles.breadcrumbBar}>
          <button onClick={() => navigate('/dashboard/organizations')} style={styles.backBtn}>
            <ArrowLeft size={15} />
            <span>All Organizations</span>
          </button>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <span style={{ color: '#0f172a', fontWeight: 700 }}>
            {orgNameParam ? orgNameParam : `Organization #${orgIdParam}`}
          </span>
          <span style={styles.filteredBadge}>Filtered View</span>
        </div>
      )}

      {/* Top Header Section */}
      <div style={styles.topBar}>
        <div>
          <div style={styles.pillBadge}>
            <Sparkles size={11} color="#059669" />
            <span>PORTFOLIO DIRECTORY</span>
          </div>
          <h2 style={styles.pageTitle}>
            {orgNameParam ? `${orgNameParam} Projects` : (orgIdParam ? `Org #${orgIdParam} Projects` : 'All Projects')}
          </h2>
          <p style={styles.pageSubtitle}>
            {orgIdParam 
              ? 'Showing only projects assigned to this organization. Click a project card to inspect tickets.' 
              : 'Track, organize and coordinate team projects across your organization.'}
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="emerald-action-btn" style={styles.primaryBtn}>
          <Plus size={18} strokeWidth={2.4} />
          <span>New Project</span>
        </button>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Loading projects...</p>
        </div>
      ) : displayedProjects.length === 0 ? (
        <div style={styles.emptyBox}>
          <FolderKanban size={34} color="#cbd5e1" style={{ marginBottom: '10px' }} />
          <h4 style={{ margin: '0 0 6px 0', color: '#334151' }}>No projects available</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            {orgIdParam
              ? `No projects assigned to "${orgNameParam || `Organization #${orgIdParam}`}". Click "New Project" to add one.`
              : 'No projects found in system. Click "New Project" to initialize your first project.'}
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {displayedProjects.map((proj) => {
            const pId = proj.id || proj.ProjectID || 0;
            const pName = proj.Name || proj.name || 'Untitled Project';
            const pDesc = proj.Description || proj.description || 'No description provided for this project.';
            const pOrg = proj.OrgID ?? proj.org_id ?? proj.OrganizationID ?? proj.organization_id;

            return (
              <div 
                key={pId} 
                className="proj-card-glass"
                onClick={() => handleProjectClick(pId, pName)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={styles.iconBox}>
                        <FolderKanban size={20} color="#059669" strokeWidth={2.2} />
                      </div>
                      <div>
                        <h3 style={styles.cardHeading}>{pName}</h3>
                        <div style={styles.idMetaRow}>
                          <span style={styles.idBadge}>ID #{pId}</span>
                          {pOrg && (
                            <span style={styles.orgTagBadge}>
                              <Layers size={11} /> Org #{pOrg}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons: Assign Org & Delete */}
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleReassignOrg(pId, pOrg)} 
                        className="icon-action-hover"
                        style={styles.assignOrgBtn} 
                        title="Reassign to another Organization"
                      >
                        <Building2 size={13} />
                        <span>Move</span>
                      </button>

                      <button 
                        onClick={() => handleDelete(pId)} 
                        className="icon-action-hover"
                        style={styles.deleteBtn} 
                        title="Delete Project"
                      >
                        <Trash2 size={15} color="#ef4444" />
                      </button>
                    </div>
                  </div>

                  <p style={styles.desc}>{pDesc}</p>
                </div>

                <div>
                  <div style={styles.cardFooter}>
                    <span style={styles.dateTag}>
                      <Calendar size={13} />
                      <span>Sprint Active</span>
                    </span>
                  </div>

                  <div style={styles.footerPrompt}>
                    <span>Inspect Tickets</span>
                    <div style={styles.arrowCircle}>
                      <ArrowUpRight size={14} color="#059669" strokeWidth={2.4} />
                    </div>
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
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={styles.modalIconBox}>
                  <FolderKanban size={18} color="#059669" />
                </div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: 700 }}>
                  Create New Project
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleCreate} style={styles.form}>
              <div>
                <label style={styles.label}>Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile App Redesign"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="proj-modal-input"
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Organization ID (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  value={formData.org_id}
                  onChange={(e) => setFormData({ ...formData, org_id: e.target.value })}
                  className="proj-modal-input"
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide a concise objective for this project..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="proj-modal-input"
                  style={{ ...styles.input, resize: 'vertical' }}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Create Project
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
  pageContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  breadcrumbBar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    padding: '8px 14px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    borderRadius: '12px',
    border: '1px solid rgba(226, 232, 240, 0.85)',
    fontSize: '13px',
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#059669',
    cursor: 'pointer',
    fontWeight: 700,
    padding: 0,
    fontSize: '13px',
  },
  filteredBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#047857',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '26px',
    flexWrap: 'wrap',
    gap: '16px',
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
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '11px 18px',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 6px 16px -2px rgba(16, 185, 129, 0.35)',
    transition: 'all 0.2s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
    gap: '20px',
  },
  iconBox: {
    width: '40px',
    height: '40px',
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
  idMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '3px',
  },
  idBadge: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#94a3b8',
  },
  orgTagBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '10.5px',
    fontWeight: 600,
    color: '#047857',
    backgroundColor: '#ecfdf5',
    padding: '1px 7px',
    borderRadius: '6px',
  },
  desc: {
    color: '#64748b',
    fontSize: '13.5px',
    lineHeight: '1.55',
    margin: '16px 0',
  },
  cardFooter: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11.5px',
    fontWeight: 600,
    color: '#94a3b8',
  },
  footerPrompt: {
    marginTop: '10px',
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
  assignOrgBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    padding: '4px 8px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 600,
    transition: 'all 0.15s ease',
  },
  deleteBtn: {
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
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '16px',
    boxSizing: 'border-box',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: '28px',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
    border: '1px solid rgba(226, 232, 240, 0.9)',
    boxSizing: 'border-box',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  modalIconBox: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    backgroundColor: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
    padding: '11px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    transition: 'all 0.15s ease',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '8px',
  },
  cancelBtn: {
    padding: '9px 16px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    borderRadius: '10px',
    cursor: 'pointer',
    color: '#64748b',
    fontWeight: 600,
    fontSize: '13.5px',
  },
  submitBtn: {
    padding: '9px 20px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13.5px',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
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