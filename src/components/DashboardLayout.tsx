import React, { useState } from 'react';
import { Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  FolderKanban, 
  CheckSquare, 
  Paperclip,
  Users, 
  ShieldCheck, 
  Key,
  LogOut,
  Menu,
  X,
  AlertCircle,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // User role parsing
  const currentRole = 
    user?.RoleName || 
    user?.roleName || 
    user?.Role || 
    user?.role || 
    user?.Role?.RoleName ||
    localStorage.getItem('userRole') || 
    null;

  const normalizedRole = typeof currentRole === 'string' ? currentRole.trim().toLowerCase() : '';
  
  // Super Admin / Owner check
  const isAdminOrOwner = 
    normalizedRole === 'admin' || 
    normalizedRole === 'owner' || 
    user?.id === 1 || 
    user?.UserID === 1;

  // Pending user check
  const isPendingUser = !isAdminOrOwner && (!currentRole || normalizedRole === 'pending');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const closeSidebar = () => setMobileMenuOpen(false);

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes floatSlow1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(60px, -40px) scale(1.15); }
        }
        @keyframes floatSlow2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-50px, 50px) scale(1.18); }
        }
        .aurora-ambient-1 {
          animation: floatSlow1 12s ease-in-out infinite;
        }
        .aurora-ambient-2 {
          animation: floatSlow2 15s ease-in-out infinite;
        }
        .layout-sidebar {
          width: 260px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          background: rgba(255, 255, 255, 0.85);
          border-right: 1px solid rgba(226, 232, 240, 0.8);
          display: flex;
          flex-direction: column;
          padding: 22px 16px;
          flex-shrink: 0;
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 50;
          box-shadow: 4px 0 24px -6px rgba(15, 23, 42, 0.04);
        }
        .aurora-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          color: #475569;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .aurora-nav-item:hover {
          background-color: rgba(16, 185, 129, 0.08);
          color: #059669;
          transform: translateX(3px);
        }
        .aurora-nav-item.active {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
          box-shadow: 0 4px 14px -2px rgba(16, 185, 129, 0.18);
        }
        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          color: #334151;
          border-radius: 8px;
        }
        .hamburger-btn:hover {
          background-color: #f1f5f9;
        }
        .sidebar-backdrop {
          display: none;
        }
        .aurora-logout-btn:hover {
          background-color: #fef2f2 !important;
          color: #b91c1c !important;
          border-color: #fecaca !important;
        }
        @media (max-width: 768px) {
          .layout-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            transform: translateX(-100%);
            box-shadow: 0 0 35px rgba(15, 23, 42, 0.2);
          }
          .layout-sidebar.sidebar-open {
            transform: translateX(0);
          }
          .hamburger-btn {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .sidebar-backdrop.active {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.5);
            backdrop-filter: blur(4px);
            z-index: 40;
          }
          .mobile-close-btn {
            display: block !important;
          }
          .header-title-text {
            font-size: 14px !important;
          }
        }
      `}</style>

      {/* Background Animated Aurora Orbs */}
      <div style={styles.auroraCanvas}>
        <div className="aurora-ambient-1" style={styles.auroraOrb1} />
        <div className="aurora-ambient-2" style={styles.auroraOrb2} />
      </div>

      {/* Backdrop for Mobile */}
      <div 
        className={`sidebar-backdrop ${mobileMenuOpen ? 'active' : ''}`} 
        onClick={closeSidebar} 
      />

      {/* Sidebar */}
      <aside className={`layout-sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div style={styles.brandContainer}>
          <div style={styles.brandTitleRow}>
            <div style={styles.brandLogoBox}>
              <Layers size={20} color="#ffffff" strokeWidth={2.4} />
            </div>
            <div>
              <h2 style={styles.brandText}>TaskFlow</h2>
              <div style={styles.brandTag}>
                <Sparkles size={10} color="#059669" />
                <span>WORKSPACE</span>
              </div>
            </div>
          </div>
          <button 
            onClick={closeSidebar}
            style={styles.mobileClose}
            className="mobile-close-btn"
          >
            <X size={20} color="#64748b" />
          </button>
        </div>

        <nav style={styles.nav}>
          {/* Admin / Owner Links */}
          {isAdminOrOwner && (
            <NavLink 
              to="/dashboard/organizations" 
              onClick={closeSidebar}
              className={({ isActive }) => `aurora-nav-item ${isActive ? 'active' : ''}`}
            >
              <Building2 size={18} />
              <span>Organizations</span>
            </NavLink>
          )}

          {/* Regular Work items */}
          {!isPendingUser && (
            <>
              <NavLink 
                to="/dashboard/projects" 
                onClick={closeSidebar}
                className={({ isActive }) => `aurora-nav-item ${isActive ? 'active' : ''}`}
              >
                <FolderKanban size={18} />
                <span>Projects</span>
              </NavLink>

              <NavLink 
                to="/dashboard/tickets" 
                onClick={closeSidebar}
                className={({ isActive }) => `aurora-nav-item ${isActive ? 'active' : ''}`}
              >
                <CheckSquare size={18} />
                <span>Tickets</span>
              </NavLink>

              <NavLink 
                to="/dashboard/attachments" 
                onClick={closeSidebar}
                className={({ isActive }) => `aurora-nav-item ${isActive ? 'active' : ''}`}
              >
                <Paperclip size={18} />
                <span>Attachments</span>
              </NavLink>
            </>
          )}

          {/* Admin Only Controls */}
          {isAdminOrOwner && (
            <>
              <div style={styles.navDivider}>SYSTEM ADMIN</div>
              <NavLink 
                to="/dashboard/users" 
                onClick={closeSidebar}
                className={({ isActive }) => `aurora-nav-item ${isActive ? 'active' : ''}`}
              >
                <Users size={18} />
                <span>Users</span>
              </NavLink>

              <NavLink 
                to="/dashboard/roles" 
                onClick={closeSidebar}
                className={({ isActive }) => `aurora-nav-item ${isActive ? 'active' : ''}`}
              >
                <ShieldCheck size={18} />
                <span>Roles</span>
              </NavLink>

              <NavLink 
                to="/dashboard/permissions" 
                onClick={closeSidebar}
                className={({ isActive }) => `aurora-nav-item ${isActive ? 'active' : ''}`}
              >
                <Key size={18} />
                <span>Permissions</span>
              </NavLink>
            </>
          )}

          {/* Pending User Sidebar Notice */}
          {isPendingUser && (
            <div style={styles.pendingSidebarNote}>
              <Clock size={16} color="#d97706" />
              <span>Awaiting role allocation from admin.</span>
            </div>
          )}
        </nav>

        {/* User Info & Logout */}
        <div style={styles.sidebarFooter}>
          <div style={styles.userInfoCard}>
            <div style={styles.avatarPill}>
              {(user?.Name || user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                <p style={styles.userName}>{user?.Name || user?.name || 'User'}</p>
                <span style={isAdminOrOwner ? styles.adminBadge : styles.memberBadge}>
                  {isAdminOrOwner ? (currentRole || 'ADMIN') : (currentRole || 'PENDING')}
                </span>
              </div>
              <p style={styles.userEmail}>{user?.Email || user?.email || ''}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="aurora-logout-btn" style={styles.logoutButton} title="Logout">
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={styles.main}>
        <header style={styles.topHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="hamburger-btn" 
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation"
            >
              <Menu size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={styles.headerDot} />
              <h3 style={styles.headerTitle} className="header-title-text">Task Management Portal</h3>
            </div>
          </div>
          <span style={styles.activeTag}>Workspace Live</span>
        </header>

        {/* Top Warning Banner for Pending Users */}
        {isPendingUser && (
          <div style={styles.pendingBanner}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>
              <strong>Role Assignment Pending:</strong> Your account has limited view access. Please contact your organization administrator to allocate your role.
            </span>
          </div>
        )}

        <main style={styles.content}>
          {isPendingUser ? (
            <div style={styles.pendingScreen}>
              <div style={styles.pendingCard}>
                <div style={styles.clockIconCircle}>
                  <Clock size={36} color="#d97706" />
                </div>
                <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '20px', fontWeight: 700 }}>
                  Account Awaiting Allocation
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
                  Welcome, <strong>{user?.Name || user?.name || 'Member'}</strong>! Your account has been created successfully, but you have not been assigned to a workspace role yet.
                </p>

                <div style={styles.infoBox}>
                  <div style={styles.infoRow}>
                    <span style={{ color: '#64748b' }}>Your User ID:</span>
                    <strong style={{ color: '#0f172a' }}>#{user?.id || user?.UserID || 'N/A'}</strong>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={{ color: '#64748b' }}>Registered Email:</span>
                    <strong style={{ color: '#0f172a' }}>{user?.Email || user?.email}</strong>
                  </div>
                </div>

                <p style={{ margin: '14px 0 0 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                  Please notify your <strong>Organization Admin</strong> with your User ID or Email to allocate your role. Once assigned, refresh this page to access your workspaces.
                </p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f8fafc',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  auroraCanvas: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 0,
  },
  auroraOrb1: {
    position: 'absolute',
    top: '-15%',
    left: '12%',
    width: '560px',
    height: '560px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(248, 250, 252, 0) 70%)',
    filter: 'blur(60px)',
  },
  auroraOrb2: {
    position: 'absolute',
    bottom: '-12%',
    right: '8%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(14, 165, 233, 0.14) 0%, rgba(248, 250, 252, 0) 70%)',
    filter: 'blur(70px)',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '18px',
    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
    marginBottom: '16px',
  },
  brandTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandLogoBox: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.4)',
  },
  brandText: {
    fontSize: '17px',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  brandTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    fontWeight: 700,
    color: '#059669',
    letterSpacing: '0.06em',
  },
  mobileClose: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    overflowY: 'auto',
  },
  navDivider: {
    fontSize: '10.5px',
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '0.08em',
    padding: '16px 14px 6px 14px',
  },
  pendingSidebarNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#fffbeb',
    border: '1px dashed #fcd34d',
    borderRadius: '12px',
    fontSize: '12px',
    color: '#92400e',
    marginTop: '12px',
  },
  sidebarFooter: {
    borderTop: '1px solid rgba(226, 232, 240, 0.8)',
    paddingTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  userInfoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '12px',
    backgroundColor: 'rgba(241, 245, 249, 0.7)',
    border: '1px solid #e2e8f0',
  },
  avatarPill: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userName: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 700,
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    margin: '2px 0 0 0',
    fontSize: '11px',
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  adminBadge: {
    fontSize: '9.5px',
    fontWeight: 700,
    backgroundColor: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    padding: '2px 6px',
    borderRadius: '6px',
    letterSpacing: '0.04em',
  },
  memberBadge: {
    fontSize: '9.5px',
    fontWeight: 700,
    backgroundColor: '#fef3c7',
    color: '#b45309',
    border: '1px solid #fde68a',
    padding: '2px 6px',
    borderRadius: '6px',
    letterSpacing: '0.04em',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '9px 12px',
    backgroundColor: '#ffffff',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
    zIndex: 1,
  },
  topHeader: {
    height: '58px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    flexShrink: 0,
  },
  headerDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px #10b981',
  },
  headerTitle: {
    margin: 0,
    fontSize: '14.5px',
    fontWeight: 700,
    color: '#1e293b',
    letterSpacing: '-0.01em',
  },
  activeTag: {
    fontSize: '11px',
    color: '#047857',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '3px 10px',
    borderRadius: '20px',
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  pendingBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fffbeb',
    color: '#b45309',
    borderBottom: '1px solid #fde68a',
    padding: '10px 18px',
    fontSize: '13px',
  },
  content: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  pendingScreen: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  pendingCard: {
    maxWidth: '480px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    borderRadius: '20px',
    padding: '36px 28px',
    textAlign: 'center',
    boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.08)',
  },
  clockIconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '18px',
    backgroundColor: '#fef3c7',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '18px',
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '14px 18px',
    margin: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    textAlign: 'left',
    fontSize: '13px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};